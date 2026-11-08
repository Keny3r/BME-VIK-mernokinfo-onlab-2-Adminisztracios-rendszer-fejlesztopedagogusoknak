from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from llm import (
    FejlesztesiTeruletItem,
    SzakertoiVelemenyAdatok,
    extract_data_from_text,
    OLLAMA_URL,
    OLLAMA_MODEL,
)

app = FastAPI(
    title="BTMN LLM Extraction Service",
    description="Mikroszerviz pedagógiai szakértői vélemények strukturált adatkinyeréséhez LLM segítségével",
    version="1.0.0",
)


class ExtractRequest(BaseModel):
    text: str = Field(..., description="A szakértői vélemény kinyert nyers szövege")
    fejlesztesi_teruletek: List[FejlesztesiTeruletItem] = Field(
        default_factory=list,
        description="Az elérhető fejlesztési területek és ID-jaik az adatbázisból",
    )


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "ollama_url": OLLAMA_URL,
        "ollama_model": OLLAMA_MODEL,
    }


@app.get("/")
def root():
    return {
        "service": "BTMN LLM Extraction Service",
        "endpoints": {
            "extract": "POST /extract",
            "health": "GET /health",
            "docs": "GET /docs",
        },
    }


@app.post("/extract", response_model=SzakertoiVelemenyAdatok)
def extract_endpoint(request: ExtractRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="A megadott szöveg üres.")

    try:
        data = extract_data_from_text(
            text=request.text,
            available_teruletek=request.fejlesztesi_teruletek,
        )
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Hiba történt az LLM adatkinyerés közben: {str(exc)}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
