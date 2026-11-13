# APIIT Sri Lanka AI Admissions & Information Kiosk
### AI-Powered Voice Agent and Interactive Virtual Information Kiosk
**Institution:** Asia Pacific Institute of Information Technology (APIIT) Sri Lanka  
**Academic Partner:** Staffordshire University, United Kingdom  
**Assessment:** QMINIMORE Pty Ltd – Phase 2 Technical Assessment  
**Author:** Chiran Samarasekara  
**Version:** 2.0.0 

---

An enterprise-grade, AI-powered admissions and marketing information kiosk designed to provide prospective students, parents, and visitors with interactive, real-time access to university admissions information through natural voice conversations and 3D virtual avatars.

The system combines Large Language Models (Gemini 2.5 Flash / 3.5 Flash Lite), Retrieval-Augmented Generation (pgvector semantic search across official APIIT prospectuses), low-latency progressive WebSocket audio streaming (Deepgram Aura 2 + Gemini Neural TTS), browser AudioWorklet PCM playback, and Three.js 3D avatars (**Sofia** & **Alex**).

It also includes a Knowledge Management Dashboard allowing administrators to ingest, vectorize, and manage university knowledge documents without code modifications or model retraining.

---

## 1. Phase 2 Major Enhancements & Key Features

- **APIIT Sri Lanka Knowledge Base:** Complete migration from sample data to 8 comprehensive APIIT Sri Lanka prospectuses (14 vectorized chunks), covering Computing (Software Engineering, Cyber Security, Computer Science), Business Management, Foundation pathways, entry qualifications, tuition schedules, and campus contacts.
- **Advanced AI Admissions Personas (Sofia & Alex):** 960-line cognitive system instruction governing consultative student academic profiling, stream assessment (A/Ls vs. O/Ls), entry requirement verification, and anti-hallucination guardrails.
  - **Sofia:** Senior AI Admissions & Marketing Coordinator (Female Persona).
  - **Alex:** AI Admissions Coordinator (Male Persona).
- **Sub-2-Second WebSocket TTS Streaming:** Eliminated the legacy 22-second audio generation bottleneck by streaming 24 kHz linear16 PCM audio frames progressively from backend to client via WebSockets (`/api/chat/audio-stream`), achieving a **91.1% reduction in perceived waiting time (TTFS: 2.22s)**.
- **High-Priority AudioWorklet PCM Player:** Custom client-side audio rendering engine (`pcm-player-processor.js`) running on a dedicated audio rendering thread with a 100ms circular jitter buffer, ensuring 100% glitch-free audio and instant 0ms barge-in stopping.
- **Concurrent Provider Racing & Fallback:** Concurrently races Deepgram Aura 2 (`aura-2-thalia-en` / `aura-2-orion-en`) and Gemini Neural TTS (`gemini-3.8-flash-lite-tts`), selecting the fastest chunk while gracefully handling upstream `HTTP 429 Quota Exhausted` errors.
- **Production Kiosk Visual Identity:** Redesigned single-container kiosk interface tailored for physical touchscreens and desktop browsers in APIIT corporate colors: APIIT Red (`#ED1C24`), Dark Charcoal (`#202124`), and Mint Green (`#34EBAE`) voice interaction cues.
- **Instant Interruption & Barge-In:** Real-time cancellation that immediately clears the AudioWorklet buffer and aborts in-flight server synthesis when the visitor speaks or submits a new question.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph Frontend["React 19 + TypeScript + Vite Kiosk Interface"]
        UI[Kiosk Container & Layout]
        AV[Avatar Stage & R3F 3D Model]
        STT[Web Speech SpeechRecognition]
        AW[AudioWorklet PCM Player<br/>pcm-player-processor.js]
        WS_Client[useStreamingAudio Hook]
        Chat_Hook[useChat Hook]
    end

    subgraph Backend["FastAPI Production Backend (Python 3.14)"]
        Router_Chat["POST /api/chat<br/>(Immediate Text + RAG)"]
        Router_WS["WebSocket /api/chat/audio-stream<br/>(Real-Time PCM Streaming)"]
        Chat_Service[chat_service.py]
        Prompt_Engine[coordinator_prompt.py<br/>Sofia & Alex Personas]
        RAG_Engine[document_retrieval_service.py]
        TTS_Mgr[TTSManager Engine]
        Deepgram_WS[Deepgram Aura 2 WS Provider]
        Gemini_TTS[Gemini TTS Provider]
    end

    subgraph Storage["Persistence & Intelligence Layer"]
        PG[(PostgreSQL Database)]
        PGV[(pgvector Cosine Index<br/>768-Dimension Embeddings)]
        Gemini_LLM["Google Gemini 2.5 Flash / 3.5 Flash Lite"]
        Gemini_Embed["Google gemini-embedding-2"]
        Deepgram_API["Deepgram Aura 2 Engine<br/>wss://api.deepgram.com/v1/speak"]
    end

    %% Flow connections
    UI -->|1. Spoken Query| STT
    STT -->|2. Transcribed Text| Chat_Hook
    Chat_Hook -->|3. POST /api/chat| Router_Chat
    Router_Chat --> Chat_Service
    Chat_Service -->|4. Query Embedding| Gemini_Embed
    Chat_Service -->|5. Vector Cosine Search| PGV
    Chat_Service -->|6. RAG Context + Prompt| Gemini_LLM
    Gemini_LLM -->|7. Text Answer| Chat_Service
    Chat_Service -->>|8. Instant Text 200 OK| Chat_Hook
    Chat_Hook -->|9. Render Answer Snippet| UI

    %% Streaming Audio Pipeline
    Chat_Hook -->|10. Trigger Audio Stream| WS_Client
    WS_Client -->|11. Connect & Synthesize| Router_WS
    Router_WS --> TTS_Mgr
    TTS_Mgr -->|12. Concurrent Race / Primary| Deepgram_WS
    TTS_Mgr -.->|12. Fallback Race| Gemini_TTS
    Deepgram_WS -->|13. Stream Text & Flush| Deepgram_API
    Deepgram_API -->>|14. 24kHz Linear16 Chunks| Deepgram_WS
    Deepgram_WS -->>|15. Binary PCM Bytes| Router_WS
    Router_WS -->>|16. Binary WS Frames| WS_Client
    WS_Client -->|17. Int16 to Float32| AW
    AW -->|18. Jitter Buffer Playback| AV
    AW -->|19. Voice Equalizer Sync| UI
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| **Kiosk Frontend** | React 19 + Vite touchscreen UI; handles STT voice capture, touch controls, and session auto-reset. |
| **AudioWorklet Player** | Dedicated browser audio thread; manages circular jitter buffer (2400 samples) and 24 kHz PCM playback. |
| **FastAPI Backend** | Asynchronous Python REST and WebSocket routing, database session management, and auth security. |
| **Gemini LLM** | RAG-grounded contextual response generation governed by admissions system prompts. |
| **RAG Retrieval Engine** | 768-dimensional vector cosine distance search (`pgvector`) matching queries to published document chunks. |
| **PostgreSQL + pgvector** | Persistent storage for document chunks, embeddings, institutional contacts, and conversation logs. |
| **Deepgram Aura 2** | Low-latency neural streaming TTS WebSocket provider (`aura-2-thalia-en` / `aura-2-orion-en`). |
| **Gemini Neural TTS** | Fallback streaming and racing provider (`gemini-3.8-flash-lite-tts`) with Kore/Puck personas. |
| **3D Virtual Avatars** | Three.js / React Three Fiber humanoid models synchronized with voice activity and reactive equalizers. |
| **Knowledge Dashboard** | Administrative portal for document upload, PyMuPDF extraction, chunking, and vector indexing. |

---

## 3. Technology Stack

### Frontend (`frontend/`)
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (APIIT Red `#ED1C24`, Charcoal `#202124`, Mint Green `#34EBAE`)
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **Audio Architecture:** Web Audio API, `AudioWorkletNode`, `AudioWorkletProcessor`
- **Speech Capture:** Web Speech API (`webkitSpeechRecognition`) with continuous listening and barge-in

### Backend (`backend/`)
- **Framework:** Python 3.14, FastAPI, Uvicorn, Pydantic v2
- **Database & ORM:** PostgreSQL 15+, `pgvector`, SQLAlchemy 2.0
- **Document Processing:** PyMuPDF (`fitz`), `python-docx`
- **AI & Embeddings:** Google GenAI SDK (`google-genai`), `gemini-embedding-2` (768 dimensions), `gemini-2.5-flash`
- **Voice Providers:** Deepgram Aura 2 WebSocket API, Gemini Neural TTS, `websockets`, `httpx`

### Knowledge Management Dashboard (`knowledge-hub-frontend/`)
- React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, React Hook Form, Zod

---

## 4. Latency Benchmark Comparison: Monolithic vs. WebSocket Streaming

An automated empirical benchmark script (`benchmark_latency_comparison.py`) is provided in the root directory to measure real-time latency:

```powershell
backend\venv\Scripts\python benchmark_latency_comparison.py
```

### Empirical Test Results:

```text
===========================================================================
                        LATENCY COMPARISON MATRIX                       
===========================================================================

+------------------------------------+-------------------+--------------------+
| Performance Metric                 | Monolithic (OLD)  | WebSocket (NEW)    |
+------------------------------------+-------------------+--------------------+
| Perceived Visitor Wait Time        |  24.85 seconds    |   2.22 seconds     |
| Text Display in UI                 |  24.85 seconds    |   5.22 seconds     |
| Audio Playback Start (TTFS)        |  24.85 seconds    |   2.22 seconds     |
| HTTP Payload Overhead              | ~3678 KB Base64   | 0 KB (null)        |
| Barge-in Cancellation Response     | 3.0 - 5.0 seconds | 0.00 seconds (0ms) |
| Latency Reduction                  | Baseline          |  91.1% FASTER       |
+------------------------------------+-------------------+--------------------+
```

---

## 5. Project Directory Structure

```text
AI-Voice-Agent/
│
├── frontend/                                # Kiosk Touchscreen User Interface
│   ├── public/
│   │   ├── apiit-logo.png                   # Official APIIT corporate logo
│   │   ├── pcm-player-processor.js          # AudioWorklet 24kHz PCM jitter buffer processor
│   │   └── models/                          # 3D GLB Virtual Avatar Assets
│   ├── src/
│   │   ├── components/layout/               # KioskLayout container
│   │   ├── features/avatar/                 # 3D scene, state machine, and assistant pane
│   │   ├── features/chat/                   # Kiosk header, input bar, message stream, badges
│   │   │   └── hooks/                       # useChat, useStreamingAudio, useSpeechRecognition
│   │   └── App.tsx                          # Root coordinator & audio lifecycle
│   ├── package.json
│   └── .env
│
├── backend/                                 # FastAPI Application & AI Core
│   ├── app/
│   │   ├── api/routes/                      # chat.py (POST /chat & WS /audio-stream), documents, auth
│   │   ├── models/                          # SQLAlchemy models (pgvector chunk storage, contacts)
│   │   ├── schemas/                         # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── chat_service.py              # Conversational RAG, persona logic, meta-turns
│   │   │   ├── prompts/coordinator_prompt.py# 960-line Sofia & Alex admissions prompt
│   │   │   ├── document_retrieval_service.py# pgvector cosine similarity retrieval
│   │   │   ├── document_processing_service.py# PyMuPDF 700-word sliding window chunking
│   │   │   ├── embedding_service.py         # 768-dim Google embeddings
│   │   │   └── tts/                         # Deepgram Aura 2, Gemini TTS, TTSManager
│   │   └── main.py                          # Application entrypoint & CORS
│   ├── requirements.txt
│   ├── transition_to_apiit.sql              # APIIT knowledge base & contacts migration
│   ├── verify_knowledge_base.py             # Knowledge retrieval diagnostic tool
│   └── .env
│
├── knowledge-hub-frontend/                  # Admin Knowledge Management Dashboard
│   ├── src/
│   │   ├── pages/LoginPage.tsx              # Admin login (admin@apiit.lk)
│   │   ├── pages/DocumentsPage.tsx          # PDF upload, chunking & publish interface
│   │   └── pages/DashboardPage.tsx          # System metrics and status
│   ├── package.json
│   └── .env
│
├── benchmark_latency_comparison.py          # Empirical latency comparison benchmark script
├── pipeline_diagram_concurrent_racing.png   # Architecture flow diagram
├── docker-compose.yml
└── README.md
```

---

## 6. Prerequisites

| Software | Requirement |
|---|---|
| Node.js | v18.0 or later |
| npm | Compatible with Node.js |
| Python | 3.10 – 3.14 |
| PostgreSQL | 15+ with `pgvector` extension enabled |
| Deepgram API Key | Entitled for Aura 2 Streaming TTS |
| Google Gemini API Key | Enabled for Gemini 2.5 Flash & text embeddings |

---

## 7. Installation and Setup

### Step 1: Clone Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AI-Voice-Agent
```

### Step 2: Configure Database & Seed APIIT Data
Ensure PostgreSQL is running with `pgvector`. Run the migration script to populate APIIT institutional data:
```bash
# If using Docker
docker compose up -d

# Execute APIIT migration SQL
psql -U postgres -d ai_voice_agent -f backend/transition_to_apiit.sql
```

Verify knowledge base integrity:
```powershell
backend\venv\Scripts\python backend/verify_knowledge_base.py
```

### Step 3: Set Up Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` (see template in Section 8) and start the server:
```powershell
uvicorn app.main:app --reload --port 8000
```
- API Documentation: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

### Step 4: Set Up Kiosk Frontend
Open a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to access the interactive kiosk.

### Step 5: Set Up Knowledge Hub Dashboard & Register Admin
The Knowledge Management Hub provides an administrative interface for uploading prospectus documents, inspecting RAG vector chunks, and managing admissions knowledge.

#### 1. Create / Register Initial Administrator
Configure your desired admin credentials in `backend/.env`:
```env
ADMIN_INITIAL_EMAIL=admin@apiit.lk
ADMIN_INITIAL_NAME="APIIT Administrator"
ADMIN_INITIAL_PASSWORD=your_secure_password_here # Must be at least 12 characters
```

Then run the admin seeding script from the `backend` directory:
```powershell
# From the backend directory with active virtual environment:
python app/create_admin.py
```
> **Note:** If you loaded `backend/transition_to_apiit.sql` during database setup, the admin account `admin@apiit.lk` is already registered. You can use the script above whenever you wish to provision or reset the initial administrator.

#### 2. Launch the Knowledge Hub Frontend
Open a new terminal:
```powershell
cd knowledge-hub-frontend
npm install
npm run dev
```
Open `http://localhost:5174` in your browser and sign in with:
- **Email:** `admin@apiit.lk`
- **Password:** The password configured in your `.env` (or set via `app/create_admin.py`)

---

## 8. Environment Configuration Templates

### Backend (`backend/.env`)
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_voice_agent

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
EMBEDDING_DIMENSIONS=768
RAG_MIN_SIMILARITY=0.45
DOCUMENT_RAG_MIN_SIMILARITY=0.45

# Deepgram Aura 2 Streaming TTS
DEEPGRAM_API_KEY=your_deepgram_api_key_here
DEEPGRAM_TTS_MODEL=aura-2-thalia-en
TTS_PROVIDER=parallel
TTS_RACE_TIMEOUT=14.0

# Document Storage & Upload Limits
DOCUMENT_STORAGE_PATH=storage/documents
MAX_DOCUMENT_SIZE_MB=20

# Admin Authentication
JWT_SECRET_KEY=generate_a_secure_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480
ADMIN_INITIAL_EMAIL=admin@apiit.lk
ADMIN_INITIAL_NAME=APIIT Administrator
ADMIN_INITIAL_PASSWORD=your_secure_admin_password
```

### Kiosk Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_ORGANISATION_ID=c0e954d5-1e9f-4d10-8493-3553c873c204
```

### Knowledge Hub (`knowledge-hub-frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 9. Testing & Diagnostic Verification

Run the following test scripts to verify system health:

| Command | Purpose |
|---|---|
| `backend\venv\Scripts\python backend/verify_knowledge_base.py` | Validates pgvector document chunks, similarity retrieval, and contact registers. |
| `backend\venv\Scripts\python benchmark_latency_comparison.py` | Executes the empirical side-by-side latency test comparing Monolithic vs. Streaming. |
| `npm --prefix frontend run build` | Validates TypeScript compilation and builds production frontend bundle. |

---


## 11. Author & Assessment Information

- **Developer:** Chiran Samarasekara
