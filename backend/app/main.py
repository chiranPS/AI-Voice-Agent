from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="AI Virtual Information Assistant",
    description="An AI-powered virtual information assistant that provides users with accurate and relevant information based on their queries.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to the AI Virtual Information Assistant API!"}


@app.get("/api/health")

async def health_check():
    return {
        "status": "healthy",
        "application": "AI Virtual Information Assistant",
        "backend": "FastAPI",
        }

