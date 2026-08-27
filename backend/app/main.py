from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine, SessionLocal
from app.database.seed import seed_sources
from app import models

from app.api.sources import router as sources_router
from app.api.stories import router as stories_router
from app.api.collector import router as collector_router
from app.api.intelligence import router as intelligence_router
from app.api.pipeline import router as pipeline_router
from app.api.projects import router as projects_router
from app.api.impact import router as impact_router
from app.api.voice import router as voice_router


Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    seed_sources(db)
finally:
    db.close()


app = FastAPI(
    title="AI RADAR API",
    description="Personal AI Intelligence and Impact Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(sources_router)
app.include_router(stories_router)
app.include_router(collector_router)
app.include_router(intelligence_router)
app.include_router(pipeline_router)
app.include_router(impact_router)
app.include_router(projects_router)
app.include_router(voice_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "AI RADAR",
        "version": "1.0.0",
    }

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI Radar API",
        "message": "Backend is running successfully"
    }