# Smart Doc Summarizer Product Roadmap

## Current State

The app is a frontend demo built with React + Vite. Right now, the Gemini API is called directly from the browser in [src/App.tsx](/d:/Learning%202026/AI%20Web%20App/smart-doc-summarizer/src/App.tsx#L1), which is fine for learning but weak for a backend-focused portfolio.

## Goal

Turn this into a backend-first GenAI product that demonstrates:

- secure API design
- async document processing
- LLM orchestration
- persistence and retrieval
- observability and reliability
- deployment readiness

## Product Positioning

Recommended positioning:

**AI Document Intelligence API**

Upload a PDF, image, or text file and get:

- structured summary
- key points
- action items
- topic tags
- Q&A over the document
- processing status and history

This framing sounds more product-grade and backend-heavy than "summarizer app".

## Resume-Friendly Architecture

### Frontend

- React UI for upload, status, result view, and chat
- only calls your backend

### Backend

- `POST /documents` to upload a file
- `GET /documents/:id` to fetch metadata and processing status
- `POST /documents/:id/summarize` to trigger processing
- `GET /documents/:id/summary` to fetch summary output
- `POST /documents/:id/chat` to ask questions on the document

Recommended stack:

- Node.js + TypeScript
- Express or Fastify
- PostgreSQL
- Redis + BullMQ for jobs
- object storage for uploaded files
- Gemini or OpenAI through a server-side adapter

## Features That Best Show Backend Skill

Prioritize these in order:

1. Move all GenAI calls to the backend.
2. Store document metadata, summaries, and chat history in a database.
3. Add async job processing so uploads return quickly and processing continues in background.
4. Extract text from PDFs and images before summarization.
5. Return structured JSON from the model instead of raw text.
6. Add authentication and per-user document ownership.
7. Add logging, rate limiting, retry logic, and error handling.
8. Add usage analytics and cost-aware model selection.

## MVP Scope

Build this first:

- user uploads a file
- backend stores file + metadata
- job queue processes file
- extracted text is summarized into structured JSON
- user can ask follow-up questions
- UI shows statuses: uploaded, processing, completed, failed

Structured summary shape:

```json
{
  "title": "Quarterly Business Review",
  "summary": "Short executive summary",
  "key_points": ["...", "..."],
  "action_items": ["...", "..."],
  "risks": ["...", "..."],
  "tags": ["finance", "operations"]
}
```

## What To Change From The Current App

Current issues visible in the code:

- API key is exposed to the browser in [src/App.tsx](/d:/Learning%202026/AI%20Web%20App/smart-doc-summarizer/src/App.tsx#L4)
- frontend directly converts files to base64 and sends them to Gemini in [src/App.tsx](/d:/Learning%202026/AI%20Web%20App/smart-doc-summarizer/src/App.tsx#L20)
- summary text is reused as chat context, which will not scale well for long documents in [src/App.tsx](/d:/Learning%202026/AI%20Web%20App/smart-doc-summarizer/src/App.tsx#L148)
- there is no persistence, auth, queue, audit trail, or failure recovery
- the README is still template-level and does not describe a product

## Strong Differentiators For PBC Interviews

If you want this to stand out for product-based companies, add at least 3 of these:

- chunking + retrieval for long documents
- idempotent job processing
- webhook/event-based processing updates
- multi-tenant access control
- prompt versioning
- model fallback strategy
- request tracing and metrics
- caching repeated Q&A
- signed upload URLs
- document expiry and data retention rules

## Suggested Folder Direction

```text
smart-doc-summarizer/
  frontend/
  backend/
    src/
      routes/
      services/
      queue/
      db/
      providers/
      workers/
      middleware/
      schemas/
```

## Suggested 3-Phase Build Plan

### Phase 1

- extract backend into a separate service
- move LLM calls server-side
- add upload endpoint
- store summaries in PostgreSQL

### Phase 2

- add BullMQ worker
- add PDF text extraction
- add structured output
- add document status polling

### Phase 3

- add RAG for long documents
- add auth
- add observability dashboard
- deploy frontend + backend + DB

## How To Present This On Your Resume

Use bullets like:

- Built a backend-first GenAI document intelligence platform using Node.js, TypeScript, PostgreSQL, and Redis for async document summarization and Q&A workflows.
- Designed REST APIs for file ingestion, document processing, result retrieval, and conversational querying with secure server-side LLM integration.
- Implemented background job processing, structured LLM outputs, persistence, and status tracking to support reliable multi-step AI pipelines.
- Improved production readiness with validation, retries, logging, rate limiting, and deployment-ready architecture.

## Interview Pitch

Say this clearly:

"I started with a frontend prototype, then redesigned it as a backend-centric GenAI system. The interesting part is not just calling an LLM, but handling file ingestion, extraction, queuing, structured outputs, persistence, retrieval, and reliability concerns like retries, observability, and access control."

## Next Best Implementation Step

The single highest-value next step is:

**Create a backend service and move all model calls out of the React app.**
