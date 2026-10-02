from fastapi import FastAPI
from app.routes.match_routes import router as match_router

app = FastAPI(
    title="SkillSwap AI Service",
    description="AI-powered skill matching API",
    version="1.0.0"
)


@app.get("/")
def home():
    return {"message": "SkillSwap AI Service is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(match_router)