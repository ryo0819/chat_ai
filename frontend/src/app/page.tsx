"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import {
  Session,
  Message,
  fetchSessions,
  createSession,
  deleteSession,
  fetchMessages,
  sendMessage,
} from "../lib/api";

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 起動時にセッション履歴をロード
  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await fetchSessions();
        setSessions(data);
        // 最初の一つを選択するか、選択しないか。Geminiは最初は空（ランディング画面）なので、選択しないでおきます。
      } catch (error) {
        console.error("セッションのロードに失敗しました:", error);
      }
    }
    loadSessions();
  }, []);

  // アクティブなセッションが変更されたらメッセージをロード
  useEffect(() => {
    if (activeSessionId === null) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        const data = await fetchMessages(activeSessionId!);
        setMessages(data);
      } catch (error) {
        console.error("メッセージのロードに失敗しました:", error);
      }
    }
    loadMessages();
  }, [activeSessionId]);

  // 新しいメッセージが追加されたら一番下までスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 新規セッション（チャット）作成
  const handleCreateSession = async () => {
    try {
      const newSession = await createSession();
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);
    } catch (error) {
      console.error("セッション作成に失敗しました:", error);
    }
  };

  // セッション削除
  const handleDeleteSession = async (sessionId: number) => {
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("セッション削除に失敗しました:", error);
    }
  };

  // メッセージ送信
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!textToSend) {
      setInputText("");
    }

    let sessionId = activeSessionId;

    try {
      setIsLoading(true);

      // 1. アクティブなセッションがない場合、まず新規セッションを裏で作成
      if (sessionId === null) {
        const newSession = await createSession();
        sessionId = newSession.id;
        setActiveSessionId(sessionId);
        // 一時的にセッションリストを更新
        setSessions((prev) => [newSession, ...prev]);
      }

      // 2. ユーザーメッセージをローカルステートに即座に反映 (楽観的アップデート)
      const tempUserMsg: Message = {
        id: Date.now(), // 仮のID
        session_id: sessionId,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // 3. APIにメッセージを送信し、モックAIレスポンスを取得
      const aiResponse = await sendMessage(sessionId, text);

      // 4. 正式なAIメッセージを反映
      setMessages((prev) => [...prev, aiResponse]);

      // 5. タイトルの自動変更やセッション状態の同期のため、セッション一覧を再取得
      const updatedSessions = await fetchSessions();
      setSessions(updatedSessions);
    } catch (error) {
      console.error("メッセージ送信に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 提案カード（サンプルの質問）をクリックした時
  const handleSuggestionClick = (suggestionText: string) => {
    handleSendMessage(suggestionText);
  };

  return (
    <div className="app-container">
      {/* モバイル用ヘッダー */}
      <header className="mobile-header">
        <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
        <div className="brand" style={{ fontSize: "1rem" }}>
          <span className="brand-icon">✦</span>
          <span>AI Agent Console</span>
        </div>
        <button
          className="menu-toggle-btn"
          onClick={handleCreateSession}
          style={{ fontSize: "1.2rem" }}
        >
          +
        </button>
      </header>

      {/* サイドバー */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* チャットインターフェース */}
      <main className="chat-interface">
        {messages.length === 0 ? (
          // 空（ランディング）画面
          <div className="empty-state">
            <div className="welcome-logo">✦</div>
            <h1 className="welcome-title">AI Agent Console</h1>
            <p className="welcome-subtitle">
              FastAPI と Next.js (TypeScript)
              で構築された、AIとのチャットを模したダッシュボードのプロトタイプへようこそ。
              下の提案カードから選択するか、メッセージを入力して開始してください。
            </p>

            <div className="suggestion-cards">
              <div
                className="suggestion-card"
                onClick={() =>
                  handleSuggestionClick("こんにちは！自己紹介をしてくれますか？")
                }
              >
                <div className="suggestion-card-title">✨ 自己紹介をして</div>
                <div className="suggestion-card-desc">
                  このシステムの機能や技術構成について自己紹介をリクエストします。
                </div>
              </div>
              <div
                className="suggestion-card"
                onClick={() =>
                  handleSuggestionClick("FastAPIで簡単なAPIを作るコード例を教えて")
                }
              >
                <div className="suggestion-card-title">💻 コード例を教えて</div>
                <div className="suggestion-card-desc">
                  Python と FastAPI を用いたシンプルなコードの書き方をリクエストします。
                </div>
              </div>
              <div
                className="suggestion-card"
                onClick={() =>
                  handleSuggestionClick("面白いプログラミングの学習プロジェクトを3つ考えてください")
                }
              >
                <div className="suggestion-card-title">💡 学習用アイデア出し</div>
                <div className="suggestion-card-desc">
                  技術学習を深めるための実践的で面白い開発課題を3つ出してもらいます。
                </div>
              </div>
              <div
                className="suggestion-card"
                onClick={() =>
                  handleSuggestionClick("プログラミングのデバッグやエラー解決のコツを教えて")
                }
              >
                <div className="suggestion-card-title">❓ デバッグのコツ</div>
                <div className="suggestion-card-desc">
                  エラーで行き詰まった時の対処法や生産性を上げるコツを聞きます。
                </div>
              </div>
            </div>
          </div>
        ) : (
          // メッセージログ
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <MessageList messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* メッセージ入力エリア */}
        <MessageInput
          value={inputText}
          onChange={setInputText}
          onSubmit={() => handleSendMessage()}
          disabled={isLoading}
        />
      </main>
    </div>
  );
}
