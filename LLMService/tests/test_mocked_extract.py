import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

# Ensure LLMService directory is in sys.path
llm_service_dir = Path(__file__).resolve().parent.parent
if str(llm_service_dir) not in sys.path:
    sys.path.insert(0, str(llm_service_dir))

from main import app
from llm import SzakertoiVelemenyAdatok, FejlesztesiTeruletItem, extract_data_from_text

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "ollama_url" in data
    assert "ollama_model" in data


def test_extract_empty_text_returns_400():
    response = client.post("/extract", json={"text": "   ", "fejlesztesi_teruletek": []})
    assert response.status_code == 400
    assert "üres" in response.json()["detail"]


def test_mocked_extract_endpoint_success():
    mock_llm_json = {
        "pedagogiai_szakszolgalat": "FPSZ 11. Kerület",
        "gyermek_neve": "Minta Péter",
        "anyja_neve": "Nagy Anna",
        "szuletesi_helye": "Budapest",
        "szuletesi_ideje": "2016. 05. 20.",
        "iktato_szam": "FPSZ/123-45/2024",
        "forgalmi_szam": "5678/2024",
        "heti_oraszam": "heti 2 óra",
        "felulvizsgalat_ideje": "2025/2026",
        "fejlesztes_formaja": "csoportos",
        "fejlesztesi_teruletek": [10, 20],
    }

    mock_ollama_client = MagicMock()
    mock_ollama_client.chat.return_value = {
        "message": {"content": json.dumps(mock_llm_json)}
    }

    payload = {
        "text": "Minta szakértői vélemény szöveg...",
        "fejlesztesi_teruletek": [
            {"id": 10, "nev": "figyelem és koncentráció"},
            {"id": 20, "nev": "szerialitás"},
            {"id": 30, "nev": "finommotorika"},
        ],
    }

    with patch("llm.get_ollama_client", return_value=mock_ollama_client):
        response = client.post("/extract", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["gyermek_neve"] == "Minta Péter"
    assert data["forgalmi_szam"] == "5678/2024"
    assert data["heti_oraszam"] == "heti 2 óra"
    assert data["felulvizsgalat_ideje"] == "2025/2026"
    assert data["fejlesztes_formaja"] == "csoportos"
    assert data["fejlesztesi_teruletek"] == [10, 20]


def test_mocked_extract_filters_hallucinated_ids():
    """Ha az LLM olyan ID-t adna vissza, ami nincs a megadott listában, a mikroszerviz kiszűri."""
    mock_llm_json = {
        "gyermek_neve": "Minta Péter",
        "fejlesztesi_teruletek": [10, 999],  # 999 nem szerepel a megadott listában
    }

    mock_ollama_client = MagicMock()
    mock_ollama_client.chat.return_value = {
        "message": {"content": json.dumps(mock_llm_json)}
    }

    payload = {
        "text": "Szöveg...",
        "fejlesztesi_teruletek": [
            {"id": 10, "nev": "figyelem fejlesztése"},
        ],
    }

    with patch("llm.get_ollama_client", return_value=mock_ollama_client):
        response = client.post("/extract", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["fejlesztesi_teruletek"] == [10]


def test_mocked_extract_empty_teruletek():
    """Ha nincsenek megadva fejlesztési területek, a kimenet üres lista."""
    mock_llm_json = {
        "gyermek_neve": "Minta Péter",
        "fejlesztesi_teruletek": [1, 2],
    }

    mock_ollama_client = MagicMock()
    mock_ollama_client.chat.return_value = {
        "message": {"content": json.dumps(mock_llm_json)}
    }

    payload = {
        "text": "Szöveg...",
        "fejlesztesi_teruletek": [],
    }

    with patch("llm.get_ollama_client", return_value=mock_ollama_client):
        response = client.post("/extract", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["fejlesztesi_teruletek"] == []


def test_pydantic_accent_alias():
    """A 'születési_helye' ékezettel és anélkül is helyesen töltődik be."""
    model1 = SzakertoiVelemenyAdatok.model_validate({"születési_helye": "Budapest"})
    assert model1.szuletesi_helye == "Budapest"

    model2 = SzakertoiVelemenyAdatok.model_validate({"szuletesi_helye": "Debrecen"})
    assert model2.szuletesi_helye == "Debrecen"
