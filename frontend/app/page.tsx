"use client";

import { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  due_date?: string;
  completed: boolean;
}

interface Note {
  id: number;
  content: string;
  created_at: string;
}

interface Plan {
  id: number;
  title: string;
  description: string;
  milestones: string[];
}

interface ProgressEntry {
  id: number;
  title: string;
  percent_complete: number;
}

interface AgentResponse {
  agentResponse: any;
}

const apiBase = "http://localhost:8000";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [prompt, setPrompt] = useState("");
  const [agentMessage, setAgentMessage] = useState<string>("");
  const [taskInput, setTaskInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [healthStatus, setHealthStatus] = useState("Checking backend...");

  useEffect(() => {
    async function loadData() {
      const [taskRes, noteRes, planRes, progressRes] = await Promise.all([
        fetch(`${apiBase}/tasks`),
        fetch(`${apiBase}/notes`),
        fetch(`${apiBase}/plans`),
        fetch(`${apiBase}/progress`),
      ]);

      setTasks(await taskRes.json());
      setNotes(await noteRes.json());
      setPlans(await planRes.json());
      setProgress(await progressRes.json());
    }

    async function loadHealth() {
      try {
        const res = await fetch(`${apiBase}/health`);
        const json = await res.json();
        setHealthStatus(json.status === "ok" ? "Backend is healthy" : "Backend responded");
      } catch (error) {
        setHealthStatus("Backend unreachable");
      }
    }

    loadData();
    loadHealth();
  }, []);

  async function addTask() {
    if (!taskInput.trim()) return;
    const response = await fetch(`${apiBase}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskInput, due_date: "", completed: false }),
    });
    const newTask = await response.json();
    setTasks((prev) => [...prev, newTask]);
    setTaskInput("");
  }

  async function addNote() {
    if (!noteInput.trim()) return;
    const response = await fetch(`${apiBase}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteInput }),
    });
    const newNote = await response.json();
    setNotes((prev) => [newNote, ...prev]);
    setNoteInput("");
  }

  async function askAgent() {
    if (!prompt.trim()) return;
    setAgentMessage("Generating your guided plan...");
    const response = await fetch(`${apiBase}/agent/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data: AgentResponse = await response.json();
    setAgentMessage(JSON.stringify(data.agentResponse, null, 2));
  }

  async function updateProgress(entry: ProgressEntry, delta: number) {
    const updatedValue = Math.max(0, Math.min(100, entry.percent_complete + delta));
    const response = await fetch(`${apiBase}/progress/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent_complete: updatedValue }),
    });
    const updated = await response.json();
    setProgress((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">AgentFlow Planner</p>
          <h1>Schedule goals, plan progress, and keep notes in one workspace.</h1>
          <p className="intro">Use the planner assistant to generate task lists, progress tracks, and skill-building plans from a simple prompt.</p>
        </div>
        <div className="hero-card">
          <div className="health-bar">
            <span className="health-label">Backend status</span>
            <span className="health-value">{healthStatus}</span>
          </div>
          <h2>Prompt your planner</h2>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Example: Plan a 6-week learning path for building a portfolio website." />
          <button onClick={askAgent}>Build my plan</button>
          {agentMessage && <pre className="agent-output">{agentMessage}</pre>}
        </div>
      </section>

      <section className="grid-panel">
        <article className="card">
          <div className="card-header">
            <h2>To-do list</h2>
            <button onClick={addTask}>Add</button>
          </div>
          <div className="input-row">
            <input value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder="New task title" />
          </div>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "task completed" : "task"}>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.due_date || "No due date"}</p>
                </div>
                <span>{task.completed ? "Done" : "Open"}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <div className="card-header">
            <h2>Progress tracker</h2>
          </div>
          <div className="progress-list">
            {progress.map((entry) => (
              <div key={entry.id} className="progress-entry">
                <div>
                  <strong>{entry.title}</strong>
                  <div className="meter">
                    <div className="meter-fill" style={{ width: `${entry.percent_complete}%` }} />
                  </div>
                </div>
                <div className="progress-actions">
                  <button onClick={() => updateProgress(entry, -10)}>-</button>
                  <span>{entry.percent_complete}%</span>
                  <button onClick={() => updateProgress(entry, 10)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card note-card">
          <div className="card-header">
            <h2>Notes</h2>
            <button onClick={addNote}>Save</button>
          </div>
          <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Capture a project note or idea." />
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-item">
                <p>{note.content}</p>
                <span>{note.created_at}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <h2>Plans</h2>
          </div>
          <div className="plans-list">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-item">
                <strong>{plan.title}</strong>
                <p>{plan.description}</p>
                <ul>
                  {plan.milestones.map((milestone, index) => (
                    <li key={index}>{milestone}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
