from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="UMKMPRO AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}

@app.post("/chat")
async def chat(request: dict):
    return {
        "conversation_id": "demo",
        "message": "AI Assistant dalam development",
        "suggestions": ["Lihat dashboard", "Analisis penjualan"]
    }

@app.get("/")
async def root():
    return {"service": "UMKMPRO AI Service", "docs": "/docs"}
