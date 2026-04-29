# DevPilot 2026 - AI-Augmented Developer Collaboration Platform

**Course:** COMP-308 Emerging Technologies  
**Assignment:** Lab 4 - AI Review Milestone

---

## Project Structure

```
devpilot-2026-milestone/
├── backend/
│   ├── auth-service/              # Authentication subgraph (port 4001)
│   │   ├── models/User.js
│   │   ├── schema.js
│   │   ├── resolvers.js
│   │   └── server.js
│   ├── projects-service/          # Projects subgraph (port 4002)
│   │   ├── models/
│   │   │   ├── Project.js
│   │   │   ├── FeatureRequest.js
│   │   │   └── ImplementationDraft.js
│   │   ├── schema.js
│   │   ├── resolvers.js
│   │   └── server.js
│   ├── ai-review-service/         # AI Review subgraph (port 4003)
│   │   ├── data/                  # 10 RAG knowledge .txt files
│   │   ├── models/Review.js       # Typed review model (issues, chunks, dual confidence)
│   │   ├── services/
│   │   │   ├── vectorStore.js     # FAISS vector store + embeddings
│   │   │   ├── llmFactory.js      # Gemini / Ollama LLM + embeddings factory
│   │   │   ├── schemas.js         # Zod schemas (answerSchema with issues + suggestions)
│   │   │   └── pipeline.js        # LangGraph 4-node pipeline (retrieve→checkEvidence→answer→reflect)
│   │   ├── schema.js              # reviewDraft mutation + typed Review/Issue/RetrievedChunk types
│   │   ├── resolvers.js
│   │   └── server.js
│   └── gateway/                   # Apollo Gateway (port 4000)
│       └── server.js              # IntrospectAndCompose federating auth + projects + ai-review
├── frontend/
│   ├── shell/                     # Shell App - Host (port 3000)
│   ├── projects-app/              # Projects App - Remote (port 3001)
│   └── ai-review-app/             # AI Review App - Remote (port 3002)
│       └── src/components/AIReview.jsx  # Draft input + full result panel
```

---

## How to Run

### Prerequisites
- Node.js v18+
- MongoDB running on `localhost:27017`
- Google Gemini API key (get one at https://aistudio.google.com/apikey)

### Environment setup

Create `backend/ai-review-service/.env` (see `.env.example`):
```
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
MONGO_URI=mongodb://localhost:27017/devpilot
SESSION_SECRET=devpilot-session-secret-2026
PORT=4003
```

`backend/auth-service/.env` and `backend/projects-service/.env` are already configured for local MongoDB.

### Start backend (one terminal each)

```bash
# Auth Service — port 4001
cd backend/auth-service && node server.js

# Projects Service — port 4002
cd backend/projects-service && node server.js

# AI Review Service — port 4003  (builds FAISS index on first boot)
cd backend/ai-review-service && node server.js

# Apollo Gateway — port 4000
cd backend/gateway && node server.js
```

### Start frontend (one terminal each)

```bash
cd frontend/shell && npm run dev          # port 3000 — open this in browser
cd frontend/projects-app && npm run dev   # port 3001
cd frontend/ai-review-app && npm run dev  # port 3002
```

Open **http://localhost:3000**, register an account, navigate to AI Review, paste a code draft and submit.

---

## AI Review Pipeline

The `reviewDraft(draftText, draftId)` GraphQL mutation triggers a 4-node LangGraph pipeline:

1. **retrieve** — embeds the draft with Gemini, queries the FAISS vector store, returns the 4 most relevant knowledge chunks.
2. **checkEvidence** — Gemini classifies retrieved evidence as `sufficient`, `weak`, or `none`.
3. **answer** — Gemini produces a structured review: `summary`, `issues[]` (type, severity, description), `suggestions[]`, `citations[]`, and `initialConfidence`. Citations are post-filtered to only valid retrieved `sourceId`s.
4. **reflect** — validates citations against retrieved docs, adjusts `finalConfidence` based on evidence quality and citation validity, emits `reflectionNotes`.

The full result — including `retrievedChunks`, dual confidence, and reflection notes — is persisted to MongoDB and returned to the frontend.

---

## How Authentication Works

Session-based auth with HTTP-only cookies:
- Login → Auth Service creates a server-side session in MongoDB via `connect-mongo`
- Session cookie forwarded by the Gateway's `buildService` hook to all subgraphs
- Resolvers read `ctx.user` from the forwarded session — no `userId` accepted from clients
- Passwords hashed with bcrypt

---

