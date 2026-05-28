from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

try:
    import openai
except ImportError:
    openai = None

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if openai and OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

app = FastAPI(title="AgentFlow Planner API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskCreate(BaseModel):
    title: str
    due_date: Optional[str] = None
    completed: bool = False

class Task(TaskCreate):
    id: int

class Note(BaseModel):
    id: int
    content: str
    created_at: str

class NoteCreate(BaseModel):
    content: str

class Plan(BaseModel):
    id: int
    title: str
    description: str
    milestones: List[str]

class ProgressEntry(BaseModel):
    id: int
    title: str
    percent_complete: int = Field(ge=0, le=100)

class ProgressUpdate(BaseModel):
    percent_complete: int = Field(ge=0, le=100)

class AgentPrompt(BaseModel):
    prompt: str

tasks: List[Task] = [
    Task(id=1, title="Define a weekly learning plan", due_date="2026-06-01", completed=False),
    Task(id=2, title="Capture daily progress notes", due_date="2026-06-02", completed=False),
]
notes: List[Note] = [
    Note(id=1, content="Build a study plan around practical project goals.", created_at="2026-05-27"),
]
plans: List[Plan] = [
    Plan(id=1, title="AgentFlow Growth Plan", description="Design a schedule and progress routine for learning new tools.", milestones=["Research framework basics", "Build first planner flow", "Track progress weekly"]),
]
progress_entries: List[ProgressEntry] = [
    ProgressEntry(id=1, title="Learning FastAPI", percent_complete=30),
    ProgressEntry(id=2, title="Next.js dashboard", percent_complete=45),
]
next_task_id = 3
next_note_id = 2
next_plan_id = 2
next_progress_id = 3

@app.get("/tasks", response_model=List[Task])
def list_tasks():
    return tasks

@app.post("/tasks", response_model=Task)
def create_task(payload: TaskCreate):
    global next_task_id
    task = Task(id=next_task_id, **payload.dict())
    next_task_id += 1
    tasks.append(task)
    return task

@app.get("/notes", response_model=List[Note])
def list_notes():
    return notes

@app.post("/notes", response_model=Note)
def create_note(payload: NoteCreate):
    global next_note_id
    note = Note(id=next_note_id, content=payload.content, created_at="2026-05-27")
    next_note_id += 1
    notes.append(note)
    return note

@app.get("/plans", response_model=List[Plan])
def list_plans():
    return plans

@app.post("/plans", response_model=Plan)
def create_plan(plan: Plan):
    global next_plan_id
    output_plan = Plan(id=next_plan_id, title=plan.title, description=plan.description, milestones=plan.milestones)
    next_plan_id += 1
    plans.append(output_plan)
    return output_plan

@app.get("/progress", response_model=List[ProgressEntry])
def list_progress():
    return progress_entries

@app.patch("/progress/{entry_id}", response_model=ProgressEntry)
def update_progress(entry_id: int, payload: ProgressUpdate):
    for entry in progress_entries:
        if entry.id == entry_id:
            entry.percent_complete = payload.percent_complete
            return entry
    raise HTTPException(status_code=404, detail="Progress entry not found")

@app.post("/agent/prompt")
def agent_prompt(payload: AgentPrompt):
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    if openai and OPENAI_API_KEY:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an agentic planner that returns JSON for a to-do list, notes, progress items, and milestones."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=400,
        )
        text = response.choices[0].message.content
        return {"agentResponse": text}

    suggestions = []
    if "learn" in prompt.lower():
        suggestions = [
            "Break the topic into weekly learning goals",
            "Create daily practice tasks",
            "Review progress at the end of each week",
        ]
    else:
        suggestions = [
            "Outline the main milestones clearly", "Capture next actions in the task list", "Log progress each day"]

    return {
        "agentResponse": {
            "plan": {
                "title": "Growth and Skills Plan",
                "description": f"A plan generated from your prompt: {prompt}",
                "milestones": [
                    "Establish the primary goal", "Create tasks for the first week", "Track progress regularly",
                ],
            },
            "tasks": [
                {"title": "Draft the first milestone"},
                {"title": "Schedule a progress review session"},
            ],
            "notes": [
                {"content": "Start with small, achievable goals and expand from there."},
            ],
            "progress": suggestions,
        }
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
