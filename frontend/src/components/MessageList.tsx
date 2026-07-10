"use client";

import { Message } from "../lib/api";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

// 簡易マークダウンレンダラー：見出し、箇条書き、番号付きリスト、コードブロック、太字、インラインコードに対応
function renderContent(content: string) {
  // コードブロック（```）で分割
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      // コードブロックのレンダリング
      const codeLines = part.slice(3, -3).trim().split("\n");
      let language = "code";
      let code = part.slice(3, -3).trim();
      
      // 1行目が言語指定（例: python, typescript）か確認
      if (codeLines.length > 0 && /^[a-zA-Z0-9_-]+$/.test(codeLines[0])) {
        language = codeLines[0];
        code = codeLines.slice(1).join("\n");
      }
      return (
        <pre key={index}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      );
    } else {
      // 通常テキスト：行ごとにパースしてリスト、見出し、段落、太字を処理
      const lines = part.split("\n");
      const renderedLines: React.ReactNode[] = [];
      let currentList: React.ReactNode[] = [];
      let listKey = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. 箇条書きリスト
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const itemText = line.trim().substring(2);
          currentList.push(<li key={`li-${listKey++}`}>{parseInline(itemText)}</li>);
          continue;
        }

        // 2. 番号付きリスト
        const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          const itemText = numMatch[2];
          currentList.push(<li key={`li-${listKey++}`}>{parseInline(itemText)}</li>);
          continue;
        }

        // リスト以外の行に到達した場合、溜まっているリストを出力
        if (currentList.length > 0) {
          renderedLines.push(<ul key={`list-${i}`}>{currentList}</ul>);
          currentList = [];
        }

        // 3. 見出し (## または ###)
        if (line.startsWith("### ")) {
          renderedLines.push(<h3 key={i}>{parseInline(line.substring(4))}</h3>);
        } else if (line.startsWith("## ")) {
          renderedLines.push(<h3 key={i}>{parseInline(line.substring(3))}</h3>);
        } else if (line.trim() === "") {
          // 空行は少しスペースを空ける
          renderedLines.push(<div key={i} style={{ height: "8px" }} />);
        } else {
          // 通常の段落
          renderedLines.push(<p key={i}>{parseInline(line)}</p>);
        }
      }

      // 最後の要素がリストだった場合のフラッシュ
      if (currentList.length > 0) {
        renderedLines.push(<ul key={`list-end`}>{currentList}</ul>);
      }

      return <div key={index}>{renderedLines}</div>;
    }
  });
}

// インラインパース: **太字**
function parseInline(text: string): React.ReactNode {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith("**") && bPart.endsWith("**")) {
      const boldText = bPart.slice(2, -2);
      return <strong key={bIdx}>{parseInlineCode(boldText)}</strong>;
    }
    return <span key={bIdx}>{parseInlineCode(bPart)}</span>;
  });
}

// インラインパース: `コード`
function parseInlineCode(text: string): React.ReactNode {
  const codeParts = text.split(/(`.*?`)/g);
  return codeParts.map((cPart, cIdx) => {
    if (cPart.startsWith("`") && cPart.endsWith("`")) {
      return <code key={cIdx}>{cPart.slice(1, -1)}</code>;
    }
    return cPart;
  });
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="message-list-container">
      <div className="message-list-content">
        {messages.map((message) => (
          <div key={message.id} className={`message-row ${message.role}`}>
            <div className="message-bubble">
              {message.role === "model" ? (
                <div className="model-avatar-container">
                  <div className="avatar model-avatar" title="AI Agent">✦</div>
                  <div className="model-body">
                    {renderContent(message.content)}
                  </div>
                </div>
              ) : (
                <div className="model-avatar-container" style={{ flexDirection: "row-reverse" }}>
                  <div className="avatar user-avatar" title="ユーザー">👤</div>
                  <div style={{ padding: "6px 12px 6px 0", whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-row model">
            <div className="message-bubble">
              <div className="thinking-container">
                <div className="avatar model-avatar">✦</div>
                <div className="skeleton-wrapper">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
