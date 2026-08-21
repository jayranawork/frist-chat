"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const tools = [
  { id: "chat", label: "Chat", icon: "✦" },
  { id: "summarize", label: "Summarize", icon: "▤" },
  { id: "explain", label: "Explain", icon: "◎" },
  { id: "rewrite", label: "Rewrite", icon: "↻" },
  { id: "extract", label: "Extract JSON", icon: "{}" },
  { id: "classify", label: "Classify", icon: "#" },
];

const toolEndpoints = {
  summarize: "/api/summarize",
  explain: "/api/explain",
  rewrite: "/api/rewrite",
  extract: "/api/extract",
  classify: "/api/classify",
};

function responseText(data) {
  if (data.data) return JSON.stringify(data.data, null, 2);
  return data.summary || data.explanation || data.rewritten || data.category || JSON.stringify(data, null, 2);
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [activeTool, setActiveTool] = useState("chat");
  const [loading, setLoading] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);

  const currentTool = tools.find((tool) => tool.id === activeTool);

  useEffect(() => {
    const savedSession = window.localStorage.getItem("ai-text-lab-session");
    if (savedSession) setSessionId(savedSession);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function selectTool(toolId) {
    setActiveTool(toolId);
    setMenuOpen(false);
    if (toolId !== "chat") {
      setMessages([]);
      setSessionId("");
    }
  }

  async function startNewChat() {
    if (sessionId) {
      await fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    }
    setMessages([]);
    setSessionId("");
    setActiveTool("chat");
    window.localStorage.removeItem("ai-text-lab-session");
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((current) => [...current, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setThinkingStatus(activeTool === "chat" ? "Reading your question…" : "Analyzing your text…");

    try {
      let data;
      if (activeTool === "chat") {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId || undefined, message: text }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Chat request failed");
        }

        const newSessionId = response.headers.get("X-Session-Id");
        if (newSessionId) {
          setSessionId(newSessionId);
          window.localStorage.setItem("ai-text-lab-session", newSessionId);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let reply = "";
        setThinkingStatus("Writing response…");
        setMessages((current) => [...current, { role: "assistant", content: "" }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
          setMessages((current) => {
            const updated = [...current];
            updated[updated.length - 1] = { role: "assistant", content: reply };
            return updated;
          });
        }
      } else {
        const body = { text };
        if (activeTool === "classify") body.categories = "positive, negative, neutral";
        const response = await fetch(toolEndpoints[activeTool], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.error || "Tool request failed");
        setMessages((current) => [...current, { role: "assistant", content: responseText(data) }]);
      }

      if (messages.length === 0) {
        setHistory((current) => [
          { id: Date.now(), title: text.slice(0, 42) + (text.length > 42 ? "…" : "") },
          ...current,
        ]);
      }
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
      setThinkingStatus("");
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-top">
          <button className="new-chat" onClick={startNewChat}>＋ <span>New Chat</span></button>
          <button className="icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">×</button>
        </div>
        <div className="search-box">⌕ <span>Search</span></div>
        <nav className="sidebar-nav">
          <div className="nav-label">Tools</div>
          {tools.filter((tool) => tool.id !== "chat").map((tool) => (
            <button className={`nav-item ${activeTool === tool.id ? "selected" : ""}`} key={tool.id} onClick={() => selectTool(tool.id)}>
              <span>{tool.icon}</span>{tool.label}
            </button>
          ))}
          <div className="nav-label history-label">History</div>
          {history.length === 0 && <p className="empty-history">No conversations yet</p>}
          {history.map((item) => <button className="history-item" key={item.id}>{item.title}</button>)}
        </nav>
        <div className="profile"><div className="avatar">AI</div><div><strong>AI Text Lab</strong><small>Local · Ollama</small></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          {!sidebarOpen && <button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">☰</button>}
          <span>{currentTool.label}</span>
          <small>llama3.2 · localhost</small>
        </header>

        <section className="conversation">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="spark">✦</div>
              <h1>AI Text Lab</h1>
              <p>Chat with your local developer mentor or run a text tool powered by Ollama.</p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" && <div className="assistant-avatar">AI</div>}
                <div className="message-bubble markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div>
              </div>)}
              {loading && <div className="message-row assistant"><div className="assistant-avatar">AI</div><div><div className="thinking-label">{thinkingStatus}</div><div className="message-bubble thinking"><i></i><i></i><i></i></div></div></div>}
              <div ref={endRef} />
            </div>
          )}
        </section>

        <section className="composer-wrap">
          <div className="composer">
            <div className="tool-menu-wrap">
              <button className="tool-trigger" onClick={() => setMenuOpen(!menuOpen)}>{currentTool.icon} {currentTool.label}⌄</button>
              {menuOpen && <div className="tool-menu">{tools.map((tool) => <button key={tool.id} onClick={() => selectTool(tool.id)} className={activeTool === tool.id ? "active" : ""}>{tool.icon} {tool.label}</button>)}</div>}
            </div>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder={activeTool === "chat" ? "Message AI Text Lab…" : `Paste text to ${currentTool.label.toLowerCase()}…`} rows="1" />
            <div className="composer-bottom"><span>Fast · Local inference</span><button className="send-button" onClick={sendMessage} disabled={!input.trim() || loading}>↑</button></div>
          </div>
          <p className="disclaimer">AI Text Lab runs locally with Ollama · Responses may be inaccurate</p>
        </section>
      </main>
    </div>
  );
}
