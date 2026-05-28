# AgentFlow Planner

AgentFlow Planner is a scheduler, planner, notetaker, and progress tracker built with Next.js and FastAPI. It helps you build plans, track goals, capture notes, and manage daily tasks with an agent-style prompt interface.

## Features

- Prompt-driven plan creation and task generation
- To-do list management with completion flow
- Progress tracking for skill-building and goals
- Notes capture for plans, ideas, and reflections
- Clean white/orange modern UI
- Designed for quick local setup with a Next.js frontend and FastAPI backend

## Tech Stack

- Frontend: Next.js (React + TypeScript)
- Backend: FastAPI
- Styling: CSS with a light white/orange theme

## Setup

### Backend

1. Create and activate a Python virtual environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

For Windows cmd, activate with:

```cmd
cd /d c:\Users\ryantyler\Desktop\personal_projects\agentflow
.venv\Scripts\activate.bat
```

2. Install backend dependencies:

```powershell
pip install -r requirements.txt
```

3. Start the FastAPI backend:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

1. Install frontend dependencies:

```powershell
cd frontend
npm install
```

2. Start the Next.js app:

```powershell
npm run dev
```

3. Open the app in your browser:

```text
http://localhost:3000
```

## Optional OpenAI Support

If you want richer prompt-based agent responses, set `OPENAI_API_KEY` in your environment before starting the backend. The app will fall back to built-in prompt handling when the API key is not provided.

## Docker Development

You can run the full stack with Docker Compose:

```powershell
docker compose up --build
```

This starts:

- `frontend` on `http://localhost:3000`
- `backend` on `http://localhost:8000`

You can verify the backend is ready with:

```text
http://localhost:8000/health
```

To pass an OpenAI key in Docker, export it before starting:

```powershell
$env:OPENAI_API_KEY = "your-key-here"
docker compose up --build
```

## License

This project is licensed under the MIT License. See `LICENSE` for details.
# 