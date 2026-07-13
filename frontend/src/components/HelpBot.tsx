import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X, Send, ChevronDown, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";

type HelpMsg = { role: "user" | "bot"; text: string };

const QUICK_QUESTIONS = [
  "¿Cómo funciona el diario?",
  "¿Qué es el moodboard?",
  "¿Cómo publico en comunidad?",
  "¿Cómo cambio mi perfil?",
];

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function HelpBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<HelpMsg[]>([
    {
      role: "bot",
      text: "¡Hola! 👋 Soy el asistente de Emowave. Puedo responder cualquier pregunta sobre la app. ¿En qué te ayudo?",
    },
  ]);
  const [input, setInput] = useState("");
  const [showQuick, setShowQuick] = useState(true);
  const [loading, setLoading] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.id = "helpbot-portal";
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      if (document.body.contains(el)) document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || loading) return;

    setMsgs((prev) => [...prev, { role: "user", text: t }]);
    setInput("");
    setShowQuick(false);
    setLoading(true);

    try {
      const history = msgs.slice(-8).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch(`${getApiUrl()}/helpbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsgs((prev) => [
          ...prev,
          { role: "bot", text: data.error || "Ocurrió un error. Inténtalo de nuevo." },
        ]);
        return;
      }

      setMsgs((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMsgs((prev) => [
        ...prev,
        {
          role: "bot",
          text: "No pude conectarme al servidor. Verifica tu conexión e inténtalo de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  return (
    <>
      {/* ── Botón flotante ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar ayuda" : "Abrir ayuda"}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 2147483647,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "var(--primary)",
          color: "var(--primary-foreground)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? <X size={20} /> : <HelpCircle size={20} />}
      </button>

      {/* ── Panel del bot ── */}
      {open &&
        portalEl &&
        createPortal(
          <div
            role="dialog"
            aria-label="Asistente de ayuda de Emowave"
            style={{
              position: "fixed",
              bottom: 86,
              right: 24,
              zIndex: 2147483646,
              width: 330,
              maxHeight: 500,
              background: "#ffffff",
              borderRadius: 18,
              boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                padding: "11px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <HelpCircle size={15} />
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Ayuda — Emowave</span>
              <div
                title="Activo"
                style={{
                  width: 8,
                  height: 8,
                  background: "#9FE1CB",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                }}
              />
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: 2,
                  marginLeft: 4,
                  display: "flex",
                }}
                aria-label="Cerrar"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Mensajes */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 12px 6px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: "#f8fafc",
              }}
            >
              {msgs.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "86%",
                      padding: "8px 12px",
                      fontSize: 13,
                      lineHeight: 1.5,
                      background: m.role === "user" ? "var(--primary)" : "#ffffff",
                      color: m.role === "user" ? "var(--primary-foreground)" : "#1e293b",
                      border: m.role === "bot" ? "1px solid #e2e8f0" : "none",
                      borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Indicador de escritura */}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "8px 14px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px 10px 10px 2px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Loader2
                      size={13}
                      style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }}
                    />
                    <span style={{ fontSize: 12, color: "#64748b" }}>Escribiendo…</span>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Preguntas rápidas */}
            {showQuick && !loading && (
              <div
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  borderTop: "1px solid #e2e8f0",
                  background: "#ffffff",
                }}
              >
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                      color: "#475569",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "10px 12px",
                borderTop: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta…"
                maxLength={500}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                  background: loading ? "#f8fafc" : "#f1f5f9",
                  color: "#1e293b",
                  outline: "none",
                }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: input.trim() && !loading ? "var(--primary)" : "#e2e8f0",
                  color: input.trim() && !loading ? "var(--primary-foreground)" : "#94a3b8",
                  border: "none",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                aria-label="Enviar"
              >
                <Send size={14} />
              </button>
            </div>
          </div>,
          portalEl,
        )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
