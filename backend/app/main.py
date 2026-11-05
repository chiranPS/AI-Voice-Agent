from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chat
from app.api.routes import faq, knowledge, contacts

app = FastAPI(
    title="AI Voice Agent API",
    description="University Information Centre Voice Assistant",
    version="1.0.0",
)

# Frontend connection
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

# Register API routers
app.include_router(
    faq.router,
    prefix="/api",
)

app.include_router(
    knowledge.router,
    prefix="/api",
)

app.include_router(
    chat.router,
    prefix="/api",
)

app.include_router(contacts.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Voice Agent API",
    }