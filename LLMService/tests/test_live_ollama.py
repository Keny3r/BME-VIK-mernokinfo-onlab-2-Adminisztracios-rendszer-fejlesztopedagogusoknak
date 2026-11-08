import sys
import urllib.request
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure LLMService directory is in sys.path
llm_service_dir = Path(__file__).resolve().parent.parent
if str(llm_service_dir) not in sys.path:
    sys.path.insert(0, str(llm_service_dir))

from main import app
from llm import OLLAMA_URL

client = TestClient(app)


def is_ollama_reachable(url: str) -> bool:
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "BTMN-TestClient"},
        )
        with urllib.request.urlopen(req, timeout=4) as response:
            return response.status in (200, 404, 403)
    except Exception:
        return False


@pytest.mark.skipif(
    not is_ollama_reachable(OLLAMA_URL),
    reason=f"A távoli Ollama szerver ({OLLAMA_URL}) nem érhető el.",
)
def test_live_ollama_extraction():
    sample_text = """
Fővárosi Pedagógiai Szakszolgálat 11. Kerületi Tagintézménye
Iktatószám: FPSZ/123-45/2024
Forgalmi szám: 5678/2024

SZAKÉRTŐI VÉLEMÉNY
A gyermek adatai:
Név: Minta Péter
Születési helye, ideje: Budapest, 2016. 05. 20.
Anyja neve: Nagy Anna

Javaslat:
Heti 2 órában csoportos fejlesztő foglalkozás javasolt.
Kontrollvizsgálat ideje: 2025/2026. tanév

Fejlesztendő területek:
- figyelem és koncentráció erősítése
- szerialitás fejlesztése
"""

    payload = {
        "text": sample_text,
        "fejlesztesi_teruletek": [
            {"id": 101, "nev": "figyelem és koncentráció"},
            {"id": 102, "nev": "szerialitás (sorrendiség)"},
            {"id": 103, "nev": "nagymozgások és egyensúly fejlesztése"},
        ],
    }

    response = client.post("/extract", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()

    assert data["gyermek_neve"] == "Minta Péter"
    assert data["anyja_neve"] == "Nagy Anna"
    assert data["szuletesi_helye"] == "Budapest"
    assert data["fejlesztes_formaja"] == "csoportos"
    assert data["forgalmi_szam"] is not None
    assert "5678" in data["forgalmi_szam"]
    assert isinstance(data["fejlesztesi_teruletek"], list)

    # 101 és 102 illeszkedik, 103 (nagymozgások) nem szerepelt a szövegben
    assert 101 in data["fejlesztesi_teruletek"]
    assert 102 in data["fejlesztesi_teruletek"]
    assert 103 not in data["fejlesztesi_teruletek"]
