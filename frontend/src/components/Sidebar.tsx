"use client";

import { Session } from "../lib/api";

interface SidebarProps {
  sessions: Session[];
  activeSessionId: number | null;
  onSelectSession: (id: number) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <span>AI Agent Console</span>
        </div>
        {isOpen && (
          <button className="menu-toggle-btn" onClick={onClose} style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>
            ✕
          </button>
        )}
      </div>

      <button className="new-chat-btn" onClick={() => { onCreateSession(); onClose(); }}>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>+</span>
        新しいチャット
      </button>

      <div className="history-container">
        <h2 className="history-title">最近のチャット</h2>
        <ul className="session-list">
          {sessions.map((session) => (
            <li
              key={session.id}
              className={`session-item ${session.id === activeSessionId ? "active" : ""}`}
              onClick={() => {
                onSelectSession(session.id);
                onClose();
              }}
            >
              <div className="session-title-text">
                <span>💬</span>
                {session.title}
              </div>
              <button
                className="delete-session-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("このチャット履歴を削除しますか？")) {
                    onDeleteSession(session.id);
                  }
                }}
                title="セッションを削除"
              >
                ✕
              </button>
            </li>
          ))}
          {sessions.length === 0 && (
            <div style={{ padding: "12px", color: "var(--text-dark)", fontSize: "0.85rem", fontStyle: "italic" }}>
              履歴はありません
            </div>
          )}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div>AI Agent Prototype</div>
        <div style={{ fontSize: "0.7rem", marginTop: "4px" }}>Next.js + FastAPI + SQLite</div>
      </div>
    </aside>
  );
}
