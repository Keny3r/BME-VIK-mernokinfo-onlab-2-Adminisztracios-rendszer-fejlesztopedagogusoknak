import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
import ollama
from pydantic import BaseModel, Field, AliasChoices

# Load .env from LLMService directory or environment
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

OLLAMA_URL = os.getenv("OLLAMA_URL", "https://obdulia-untruckled-overseverely.ngrok-free.dev")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")


def get_ollama_client(base_url: Optional[str] = None) -> ollama.Client:
    url = base_url or OLLAMA_URL
    return ollama.Client(host=url)


class FejlesztesiTeruletItem(BaseModel):
    id: int
    nev: str


class SzakertoiVelemenyAdatok(BaseModel):
    pedagogiai_szakszolgalat: Optional[str] = Field(
        default=None,
        description="A szakértői véleményt kiállító pedagógiai szakszolgálat (és tagintézmény) neve",
    )
    gyermek_neve: Optional[str] = Field(
        default=None,
        description="A vizsgált gyermek teljes neve",
    )
    anyja_neve: Optional[str] = Field(
        default=None,
        description="A gyermek édesanyjának neve",
    )
    szuletesi_helye: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("szuletesi_helye", "születési_helye"),
        description="A gyermek születési helye (pl. Budapest)",
    )
    szuletesi_ideje: Optional[str] = Field(
        default=None,
        description="A gyermek születési ideje (pl. 2020.11.03.)",
    )
    iktato_szam: Optional[str] = Field(
        default=None,
        description="A szakértői vélemény iktatószáma",
    )
    forgalmi_szam: Optional[str] = Field(
        default=None,
        description="A szakértői vélemény forgalmi száma (ha szerepel a dokumentumban, egyébként null)",
    )
    heti_oraszam: Optional[str] = Field(
        default=None,
        description="A javasolt heti óraszám (pl. 'heti 2 óra', egyébként null)",
    )
    felulvizsgalat_ideje: Optional[str] = Field(
        default=None,
        description="A felülvizsgálat / kontrollvizsgálat javasolt ideje vagy tanéve (ha szerepel, egyébként null)",
    )
    fejlesztes_formaja: Optional[str] = Field(
        default=None,
        description="Kizárólag 'csoportos' vagy 'egyéni', ha a szövegben szerepel a javaslat, egyébként null",
    )
    fejlesztesi_teruletek: list[int] = Field(
        default_factory=list,
        description="A megadott elérhető fejlesztési területek közül azoknak az ID-jai (egész számok listája), amelyek illeszkednek a szakértői véleményben javasolt fejlesztési területekre",
    )


def extract_data_from_text(
    text: str,
    available_teruletek: Optional[list[FejlesztesiTeruletItem]] = None,
    client: Optional[ollama.Client] = None,
    model: Optional[str] = None,
) -> SzakertoiVelemenyAdatok:
    """
    Egy megadott szövegből kinyeri a szakértői vélemény adatait LLM segítségével.
    :param text: A szakértői vélemény kinyert szövege.
    :param available_teruletek: Az adatbázisban létező fejlesztési területek listája (id és név).
    :param client: Opcionális Ollama Client példány (ha nincs megadva, az alapértelmezett környezeti változó szerinti jön létre).
    :param model: Az Ollama modell neve (alapértelmezett: OLLAMA_MODEL).
    :return: SzakertoiVelemenyAdatok Pydantic modell példány.
    """
    if client is None:
        client = get_ollama_client()
    target_model = model or OLLAMA_MODEL

    if available_teruletek:
        teruletek_str = "\n".join(
            f"- [ID: {item.id}] {item.nev}" for item in available_teruletek
        )
        teruletek_prompt = f"""
Elérhető fejlesztési területek az adatbázisban:
{teruletek_str}

Szabályok a fejlesztési területekre:
- A "fejlesztesi_teruletek" mezőbe KIZÁRÓLAG a fenti listában szereplő területek egész számú ID-jait (azonosítóit) tedd bele, amelyek illeszkednek a szakértői véleményben szereplő fejlesztendő területekhez / feladatokhoz!
- Ha a szövegben említett terület nem szerepel az elérhető területek listájában, hagyd figyelmen kívül! Soha ne találj ki új ID-t!
- Csak a ténylegesen illeszkedő ID-k szerepeljenek a listában.
"""
    else:
        teruletek_prompt = """
Nincsenek előre definiált fejlesztési területek megadva.
A "fejlesztesi_teruletek" mező értéke legyen üres lista: [].
"""

    prompt = f"""
A feladatod a megfelelő adatok kinyerése az alábbi szakértői vélemény szövegéből:

---

{text}

---

{teruletek_prompt}

Fontos szabályok:
- Csak a szövegben ténylegesen szereplő adatokat nyerd ki.
- A "fejlesztes_formaja" értéke KIZÁRÓLAG 'csoportos' vagy 'egyéni' legyen a javaslat alapján. Ha nem szerepel vagy nem egyértelmű, legyen null.
- A "heti_oraszam" a javaslatban szereplő heti időkeret (pl. 'heti 2 óra' vagy 'heti 2 órában'). Ha nem szerepel, legyen null.
- Ha egy mező értéke nem található meg a szövegben (pl. forgalmi szám vagy felülvizsgálat ideje), az értéke legyen null.
""".strip()

    # Ollama structured decoding schema összeállítása:
    # A sémában az összes mezőt 'required'-dé tesszük, hogy a nyelvi modell GBNF grammatikája
    # minden kulcsot garantáltan legeneráljon (akár null értékkel), miközben a Pydantic
    # a default=None miatt hiányzó mezők esetén sem dob validációs hibát.
    schema = SzakertoiVelemenyAdatok.model_json_schema()
    schema["required"] = list(schema.get("properties", {}).keys())

    response = client.chat(
        model=target_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "Egy pedagógiai szakértői véleményeket feldolgozó és strukturált "
                    "adatokat kinyerő asszisztens vagy. A megadott szöveg alapján töltsd ki "
                    "a kért adatmezőket a megadott JSON séma szerint. "
                    "A 'fejlesztesi_teruletek' mező kizárólag a megadott listából kiválasztott területek egész szám ID-jait tartalmazhatja."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        format=schema,
        options={"temperature": 0.0, "num_ctx": 8192},
    )

    raw_json = response["message"]["content"].strip()
    if raw_json.startswith("```json"):
        raw_json = raw_json[7:]
    elif raw_json.startswith("```"):
        raw_json = raw_json[3:]
    if raw_json.endswith("```"):
        raw_json = raw_json[:-3]
    raw_json = raw_json.strip()

    result = SzakertoiVelemenyAdatok.model_validate_json(raw_json)

    # Fejlesztés formája normalizálás ('csoportos' / 'egyéni')
    if result.fejlesztes_formaja:
        forma_lower = result.fejlesztes_formaja.lower()
        if "csoport" in forma_lower:
            result.fejlesztes_formaja = "csoportos"
        elif "egyén" in forma_lower or "egyen" in forma_lower:
            result.fejlesztes_formaja = "egyéni"

    # Biztonsági szűrés: csak az elérhető listában ténylegesen létező ID-kat engedjük át
    if available_teruletek is not None:
        valid_ids = {item.id for item in available_teruletek}
        result.fejlesztesi_teruletek = [
            tid for tid in result.fejlesztesi_teruletek if tid in valid_ids
        ]
    else:
        result.fejlesztesi_teruletek = []

    return result


if __name__ == "__main__":
    sample_text = """
Fővárosi Pedagógiai Szakszolgálat 11. Kerületi Tagintézménye
1117 Budapest, Fehérvári út 10.
Iktatószám: FPSZ/123-45/2024
Forgalmi szám: 5678/2024

SZAKÉRTŐI VÉLEMÉNY
Kérjük a vizsgálati adatok bizalmas kezelését!

A gyermek adatai:
Név: Minta Péter
Születési helye, ideje: Budapest, 2016. 05. 20.
Anyja neve: Nagy Anna
Gondviselő neve: Nagy Anna
Lakcím: 1117 Budapest, Példa utca 12.

Javaslat:
A gyermek fejlődésének megsegítésére javasoljuk heti 2 órában csoportos fejlesztő foglalkozás biztosítását fejlesztő pedagógus vezetésével.
Kontrollvizsgálat ideje: 2025/2026. tanév tavasza

Fejlesztendő területek:
- figyelem és koncentráció erősítése
- térbeli és síkbeli tájékozódás fejlesztése
- szerialitás (sorrendiség) fejlesztése
- auditív és vizuális emlékezet támogatása
"""
    teruletek = [
        FejlesztesiTeruletItem(id=101, nev="figyelem és koncentráció"),
        FejlesztesiTeruletItem(id=102, nev="szerialitás (sorrendiség)"),
        FejlesztesiTeruletItem(id=103, nev="finommotorika és grafomotorika"),
        FejlesztesiTeruletItem(id=104, nev="beszédértés és kifejezőkészség"),
    ]

    print("=== Adatkinyerés tesztelése minta szöveggel és területekkel ===")
    eredmeny = extract_data_from_text(sample_text, available_teruletek=teruletek)
    print("\nKinyert strukturált adatok:")
    print(eredmeny.model_dump_json(indent=2))
