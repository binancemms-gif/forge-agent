import { useMemo, useState } from "react";
import { Activity, ArrowDownToLine, ArrowUpFromLine, Bot, Check, ChevronDown, Code2, FileCode2, Folder, GitBranch, Github, History, Menu, Moon, Play, Plus, Rocket, Send, Settings, Sparkles, Terminal, Upload, X } from "lucide-react";
import { displayAgentValue } from "@/lib/agent/provider";
import { useAgent } from "@/lib/agent/use-agent";

const initialFiles = [
  { path: "src", kind: "folder" }, { path: "src/App.tsx", kind: "tsx" }, { path: "src/styles.css", kind: "css" },
  { path: "src/lib/agent/provider.ts", kind: "ts" }, { path: "package.json", kind: "json" }, { path: "README.md", kind: "md" },
];
const starterCode = `import { useState } from "react";\n\nexport function App() {\n  const [ready, setReady] = useState(true);\n\n  return (\n    <main className="app">\n      <p className="eyebrow">FORGE AGENT</p>\n      <h1>Build something remarkable.</h1>\n      <button onClick={() => setReady(!ready)}>\n        {ready ? "Start building" : "Ready when you are"}\n      </button>\n    </main>\n  );\n}`;

type View = "agent" | "editor" | "preview" | "terminal" | "tasks" | "settings";
type Task = { title: string; detail: string; done: boolean };

export function App() {
  const [view, setView] = useState<View>("agent");
  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState("src/App.tsx");
  const [code, setCode] = useState(starterCode);
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [repoConnected, setRepoConnected] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { title: "Initialize workspace", detail: "Read project structure and configuration", done: true },
    { title: "Build the landing page", detail: "Create the responsive hero and feature grid", done: true },
    { title: "Run verification", detail: "Typecheck, lint, and inspect the browser preview", done: false },
    { title: "Open pull request", detail: "Push changes to a feature branch on GitHub", done: false },
  ]);
  const { messages, busy, error, send } = useAgent();
  const workspace = useMemo(() => ({ [activeFile]: code, "package.json": '{"name":"forge-agent"}' }), [activeFile, code]);
  const visibleMessages = messages.length ? messages : [{ role: "assistant" as const, content: "Welcome to Forge. I can inspect your project, edit files, run checks, and help you ship. What are we building?" }];
  const submit = async () => { const value = prompt.trim(); if (!value || busy) return; setPrompt(""); await send(value, workspace); };
  const addTask = () => setTasks((current) => [...current, { title: "New implementation task", detail: "Describe the next step for Forge", done: false }]);
  const toggleTask = (index: number) => setTasks((current) => current.map((task, taskIndex) => taskIndex === index ? { ...task, done: !task.done } : task));

  return <main className={`app-shell ${theme}`}>
    <header className="topbar">
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button>
      <div className="brand"><span className="brand-mark"><Sparkles /></span><span>forge</span><small>WORKSPACE</small></div>
      <button className="project-pill" onClick={() => setView("settings")}><span className="status-dot" /> forge-agent <span className="muted">/</span> main <ChevronDown /></button>
      <div className="top-actions"><button className="icon-button" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}><Moon /></button><button className="avatar" aria-label="Account menu">LC</button></div>
    </header>
    <div className="workspace">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="sidebar-section"><div className="section-label">PROJECT <button aria-label="Create file" onClick={() => setFiles((current) => [...current, { path: "src/new-file.ts", kind: "ts" }])}><Plus /></button></div><button className="project-card"><Folder /><span><strong>forge-agent</strong><small>Local workspace</small></span><ChevronDown /></button></div>
        <div className="sidebar-section files"><div className="section-label">EXPLORER <span>{files.length}</span></div>{files.map((file) => file.kind === "folder" ? <div className="file-row folder-row" key={file.path}><Folder />{file.path}</div> : <button className={`file-row ${activeFile === file.path ? "active" : ""}`} key={file.path} onClick={() => { setActiveFile(file.path); setView("editor"); setMobileMenu(false); }}><FileCode2 />{file.path}</button>)}</div>
        <div className="sidebar-section workspace-links"><button className="side-link" onClick={() => setView("agent")}><Bot /><span>Agent</span><kbd>⌘ K</kbd></button><button className="side-link" onClick={() => setView("tasks")}><Check /><span>Tasks</span><b>{tasks.filter((task) => !task.done).length}</b></button><button className="side-link" onClick={() => setView("terminal")}><Terminal /><span>Terminal</span></button><button className="side-link" onClick={() => setView("settings")}><Settings /><span>Settings</span></button></div>
        <div className="sidebar-footer"><div className="usage"><span>Workspace usage</span><strong>24%</strong><div><i /></div></div><button className="side-link"><History /><span>Activity log</span></button></div>
      </aside>
      <section className="main-panel">
        <nav className="view-tabs" aria-label="Workspace views">{([["agent", Bot, "Agent"], ["editor", Code2, "Editor"], ["preview", Play, "Preview"], ["tasks", Check, "Tasks"], ["terminal", Terminal, "Terminal"]] as const).map(([key, Icon, label]) => <button key={key} className={view === key ? "selected" : ""} onClick={() => setView(key)}><Icon />{label}</button>)}<button className={`settings-tab ${view === "settings" ? "selected" : ""}`} onClick={() => setView("settings")}><Settings /></button></nav>
        {view === "agent" && <section className="agent-view"><div className="panel-heading"><div><span className="eyebrow">AI CODING AGENT</span><h1>Build in conversation.</h1><p>Describe the outcome. Forge handles the details.</p></div><span className="live-badge"><span className="status-dot" /> {busy ? "Working" : "Ready"}</span></div><div className="agent-layout"><div className="messages">{visibleMessages.map((message, index) => <article className={`message ${message.role}`} key={`${message.role}-${index}`}><div className="message-label">{message.role === "assistant" ? "FORGE" : "YOU"}</div><p>{displayAgentValue(message.content)}</p></article>)}{busy && <article className="message assistant"><div className="message-label">FORGE <Activity /></div><p className="thinking">Inspecting workspace<span>.</span><span>.</span><span>.</span></p></article>}{error && <div className="error-callout">{error}<button onClick={() => submit()}>Retry</button></div>}</div><aside className="activity-card"><div className="card-title"><Activity /> ACTIVITY</div><div className="activity-item done"><span />Workspace context loaded<small>just now</small></div><div className="activity-item"><span />{busy ? "Agent is thinking" : "Waiting for your next task"}<small>{busy ? "in progress" : "ready"}</small></div><div className="card-title tools-title"><Terminal /> TOOLS AVAILABLE</div><p className="tool-list">Read and write files<br />Search codebase<br />Inspect project structure<br />Explain and debug changes</p></aside></div><div className="composer"><textarea aria-label="Message Forge" value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); submit(); } }} placeholder="Ask Forge to build, fix, or explain..." rows={3} /><div className="composer-bottom"><span className="hint">↵ to send · ⇧↵ for newline</span><button className="send-button" aria-label="Send message" onClick={submit} disabled={!prompt.trim() || busy}><Send /></button></div></div></section>}
        {view === "editor" && <Editor activeFile={activeFile} code={code} setCode={setCode} />}
        {view === "preview" && <Preview />}
        {view === "tasks" && <Tasks tasks={tasks} addTask={addTask} toggleTask={toggleTask} />}
        {view === "terminal" && <TerminalPanel />}
        {view === "settings" && <SettingsPanel repoConnected={repoConnected} setRepoConnected={setRepoConnected} />}
        <footer className="statusbar"><span><span className="status-dot" /> All systems operational</span><span className="status-meta">{files.length} files · Groq · Cloudflare D1</span><button className="deploy-button" onClick={() => setView("settings")}><Rocket /> Deploy</button></footer>
      </section>
    </div>
    <nav className="mobile-nav">{([["agent", Bot, "Agent"], ["editor", Code2, "Code"], ["preview", Play, "Preview"], ["tasks", Check, "Tasks"], ["settings", Settings, "Settings"]] as const).map(([key, Icon, label]) => <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}><Icon /><small>{label}</small></button>)}</nav>
  </main>;
}

function Editor({ activeFile, code, setCode }: { activeFile: string; code: string; setCode: (value: string) => void }) { return <section className="editor-view"><div className="editor-heading"><div><span className="eyebrow">EDITOR</span><strong>{activeFile}</strong></div><span className="saved"><span className="status-dot" /> Saved</span></div><div className="code-wrap"><div className="line-numbers">{code.split("\n").map((_, i) => <span key={i}>{String(i + 1).padStart(2, "0")}</span>)}</div><textarea aria-label={`Editing ${activeFile}`} spellCheck={false} value={code} onChange={(event) => setCode(event.target.value)} /></div></section>; }
function Preview() { return <section className="preview-view"><div className="preview-heading"><div><span className="eyebrow">LIVE PREVIEW</span><strong>Browser canvas</strong></div><button className="open-preview"><Play /> Open preview</button></div><div className="browser-frame"><div className="browser-bar"><span className="browser-dots">● ● ●</span><span className="address">localhost:5173</span><span>↻</span></div><div className="site-preview"><div className="preview-logo">forge<span>.</span></div><div className="preview-hero"><span>YOUR NEXT IDEA</span><h2>Make something<br /><i>remarkable.</i></h2><p>A calm, focused space to turn thoughts into working software.</p><button>Start building →</button></div><div className="preview-grid"><span>01 / CREATE</span><span>02 / SHIP</span></div></div></div></section>; }
function Tasks({ tasks, addTask, toggleTask }: { tasks: Task[]; addTask: () => void; toggleTask: (index: number) => void }) { return <section className="tasks-view"><div className="panel-heading"><div><span className="eyebrow">DEVELOPMENT PLAN</span><h1>Ship with confidence.</h1><p>Forge keeps the implementation moving and verifiable.</p></div><button className="add-task" onClick={addTask}><Plus /> Add task</button></div><div className="task-progress"><div><strong>{tasks.filter((task) => task.done).length} of {tasks.length}</strong><span>completed</span></div><div className="progress-track"><i style={{ width: `${(tasks.filter((task) => task.done).length / tasks.length) * 100}%` }} /></div></div><div className="task-list">{tasks.map((task, index) => <button className={`task-row ${task.done ? "complete" : ""}`} key={`${task.title}-${index}`} onClick={() => toggleTask(index)}><span className="task-check">{task.done && <Check />}</span><span><strong>{task.title}</strong><small>{task.detail}</small></span><span className="task-state">{task.done ? "DONE" : "NEXT"}</span></button>)}</div></section>; }
function TerminalPanel() { return <section className="terminal-view"><div className="terminal-heading"><Terminal /> <strong>Terminal output</strong><span>ready</span></div><div className="terminal-body"><p><b>$</b> npm run build</p><p className="muted-line">Forge workspace is ready. Commands run through a connected execution service.</p><p><b>$</b> git status --short</p><p className="success-line">On branch main · working tree clean</p><div className="terminal-cursor" /></div></section>; }
function SettingsPanel({ repoConnected, setRepoConnected }: { repoConnected: boolean; setRepoConnected: (value: boolean) => void }) { return <section className="settings-view"><span className="eyebrow">PROJECT SETTINGS</span><h1>Configure your workspace.</h1><div className="settings-grid"><div className="setting-card"><span>AI provider</span><strong>Groq · llama-3.3-70b</strong><small>Connected on the server</small></div><div className="setting-card"><span>Runtime</span><strong>Cloudflare Workers</strong><small>D1 + R2 storage enabled</small></div><div className="setting-card wide"><span>Repository</span><strong>{repoConnected ? "github.com/binancemms-gif/forge-agent" : "No repository connected"}</strong><small>{repoConnected ? "main branch · synced just now" : "Import a repository to start coding"}</small></div><div className="setting-card"><span>Deployment</span><strong>Cloudflare production</strong><small>Manual deploy</small></div></div><div className="settings-actions"><button onClick={() => setRepoConnected(!repoConnected)}><Github /> {repoConnected ? "Repository connected" : "Connect GitHub"}</button><button><Upload /> Import repository</button><button><ArrowDownToLine /> Export project</button><button><Rocket /> Configure deployment</button></div></section>; }

export default App;
