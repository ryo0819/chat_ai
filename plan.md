    1 # Gemini Console-like Web Chat Application
    2
    3 ## Objective
    4 Develop a visually appealing, functional prototype of a chat web application inspired by the Gemini console, featuring a dark-mode fixed
      design and persistent chat history.
    5
    6 ## Architecture & Tech Stack
    7 - **Frontend:** Next.js (TypeScript, App Router) with Vanilla CSS.
    8 - **Backend:** Python (FastAPI) with SQLite for database storage.
    9 - **ORM:** SQLAlchemy (for Python).
   10 - **Styling:** Custom CSS focusing on rich aesthetics, smooth transitions, and a modern dark theme similar to Gemini.
   11
   12 ## Key Files & Structure
   13 - **Frontend (`/frontend`)**
   14   - `app/layout.tsx`, `app/page.tsx`: Main entry points and layout.
   15   - `app/globals.css`: Core CSS variables, dark theme styling.
   16   - `components/Sidebar.tsx`: Fetches and displays list of past chat sessions.
   17   - `components/ChatInterface.tsx`: Manages the current session state.
   18   - `components/MessageList.tsx`: Displays messages for the active session.
   19   - `components/MessageInput.tsx`: Auto-resizing textarea and send button.
   20   - `lib/api.ts`: API utility functions for fetching/sending data.
   21 - **Backend (`/backend`)**
   22   - `main.py`: FastAPI application entry point, CORS, and API routes.
   23   - `database.py`: SQLite connection and SQLAlchemy setup.
   24   - `models.py`: Database models (`Session`, `Message`).
   25   - `schemas.py`: Pydantic models for request/response validation.
   - `requirements.txt`: Python dependencies (`fastapi`, `uvicorn`, `sqlalchemy`) managed by `uv`.

   ## Implementation Steps
   ### Phase 1: Setup & Initialization
   1. Create a Next.js project with TypeScript and App Router in the `frontend` directory.
   2. Initialize a Python virtual environment using `uv` and set up FastAPI in the `backend` directory.
   32
   33 ### Phase 2: Backend Database & API (FastAPI + SQLite)
   34 1. Set up SQLite and SQLAlchemy in `database.py` and define `Session` (id, title, created_at) and `Message` (id, session_id, role, content,
      created_at) in `models.py`.
   35 2. Implement REST endpoints:
   36    - `GET /api/sessions` (List all sessions)
   37    - `POST /api/sessions` (Create a new session)
   38    - `GET /api/sessions/{id}/messages` (Get messages for a session)
   39    - `POST /api/sessions/{id}/messages` (Save user message and generate/save mock AI response).
   40 3. Configure CORS for Next.js (`http://localhost:3000`).
   41
   42 ### Phase 3: Frontend Layout & Styling
   43 1. Define the dark mode color palette and typography in `globals.css`.
   44 2. Build the structural layout: fixed left `Sidebar` and flexible main `ChatInterface`.
   45
   46 ### Phase 4: Frontend Logic & Integration
   47 1. Implement state management in Next.js to handle the `activeSessionId`.
   48 2. Integrate `Sidebar.tsx` to fetch and display the session list, allowing users to click and load past chats.
   49 3. Integrate `ChatInterface.tsx` to fetch messages when a session is selected, and update the UI when a new message is sent via
      `MessageInput.tsx`.
   50
   51 ## Verification & Testing
   52 - Verify that a new chat creates a new session in the database.
   53 - Send messages and confirm they are saved and a mock AI response is returned and saved.
   54 - Refresh the page and click on past sessions in the sidebar to verify history restoration.
   55 - Check UI responsiveness and dark mode aesthetics.
