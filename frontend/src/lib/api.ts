const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Message {
  id: number;
  session_id: number;
  role: "user" | "model";
  content: string;
  created_at: string;
}

export interface Session {
  id: number;
  title: string;
  created_at: string;
  messages?: Message[];
}

export async function fetchSessions(): Promise<Session[]> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`);
  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }
  return response.json();
}

export async function createSession(title?: string): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error("Failed to create session");
  }
  return response.json();
}

export async function deleteSession(sessionId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete session");
  }
}

export async function fetchMessages(sessionId: number): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/messages`);
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}

export async function sendMessage(sessionId: number, content: string): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "user", content }),
  });
  if (!response.ok) {
    throw new Error("Failed to send message");
  }
  return response.json();
}
