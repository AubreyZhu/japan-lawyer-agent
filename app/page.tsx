"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

// Free-plan friendly password gate.
// NOTE: This is a lightweight access gate for demos, not bank-level security.
const ACCESS_PASSWORD = "lawyer2026";
const AUTH_STORAGE_KEY = "jl_agent_authed_v1";

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading]);

  useEffect(() => {
    // Restore auth state for this browser session.
    try {
      const v = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (v === "1") setAuthed(true);
    } catch {}
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleLogin() {
    if (pw === ACCESS_PASSWORD) {
      setPwError(null);
      setAuthed(true);
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
      } catch {}
      setPw("");
      return;
    }
    setPwError("密码不正确，请重试。");
  }

  function handleLogout() {
    setAuthed(false);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  }

  async function send() {
    const q = prompt.trim();
    if (!q || loading) return;

    setPrompt("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q, session_id: sessionId }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        const detail = JSON.stringify(data, null, 2);
        setMessages((m) => [...m, { role: "assistant", text: `调用失败：\n${detail}` }]);
      } else {
        if (data?.session_id) setSessionId(data.session_id);
        setMessages((m) => [...m, { role: "assistant", text: data?.answer ?? "" }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", text: `网络错误：${e?.message ?? e}` }]);
    } finally {
      setLoading(false);
    }
  }

  function resetSession() {
    setSessionId(null);
    setMessages([]);
  }

  if (!authed) {
    return (
      <main style={{ maxWidth: 520, margin: "80px auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 16, padding: 18, background: "white" }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>访问受限</h1>
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>
            请输入访问密码后继续。<br />
            （提示：你设置的密码是 <code>{ACCESS_PASSWORD}</code>）
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="输入密码"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
            />
            <button
              onClick={handleLogin}
              style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
            >
              进入
            </button>
          </div>

          {pwError ? (
            <div style={{ marginTop: 10, color: "#b00020", fontSize: 13 }}>{pwError}</div>
          ) : null}

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
            说明：这是“免费版”网页内置密码门，用于限制随意访问（适合演示/小范围使用），不是严格的企业级鉴权系统。
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 820, margin: "28px auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <header style={{ display: "flex", gap: 12, alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }}>日本律师智能体（百炼）</h1>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Session: <code style={{ fontSize: 12 }}>{sessionId ?? "（新会话）"}</code>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={resetSession} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
            新开会话 / 清空
          </button>
          <button onClick={handleLogout} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
            退出
          </button>
        </div>
      </header>

      <section style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: 14, minHeight: 420, background: "white" }}>
        {messages.length === 0 ? (
          <div style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.6 }}>
            直接输入问题并发送。此页面通过后端转发调用百炼智能体应用，API Key 不会暴露给浏览器。
          </div>
        ) : null}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", margin: "10px 0" }}>
            <div style={{
              maxWidth: "78%",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid #eee",
              background: m.role === "user" ? "#f7f7f7" : "#fff"
            }}>
              <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 4 }}>
                {m.role === "user" ? "你" : "律师智能体"}
              </div>
              <div style={{ fontSize: 14 }}>{m.text}</div>
            </div>
          </div>
        ))}

        {loading ? (
          <div style={{ marginTop: 10, opacity: 0.7, fontSize: 14 }}>律师智能体正在回复…</div>
        ) : null}

        <div ref={bottomRef} />
      </section>

      <footer style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="输入你的问题（例如：在留资格更新需要注意什么？）"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
          }}
          style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: canSend ? "white" : "#f3f3f3",
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          发送
        </button>
      </footer>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
        小技巧：按 <code>Ctrl+Enter</code>（或 Mac 上 <code>⌘+Enter</code>）发送。
      </div>
    </main>
  );
}
