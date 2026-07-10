"use client";

import React, { useRef, useEffect } from "react";

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function MessageInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 内部テキストに合わせてテキストエリアの高さを自動調整
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      // 最大の高さを200pxに制限
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enterは改行、Enter単体は送信
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="input-area-container">
      <div className="input-box-wrapper">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          rows={1}
          placeholder="メッセージを入力してください..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          className="send-btn"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          title="送信"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <p className="disclaimer-text">
        AIエージェント チャットプロトタイプ: 回答をシミュレートしています。個人情報は入力しないでください。
      </p>
    </div>
  );
}
