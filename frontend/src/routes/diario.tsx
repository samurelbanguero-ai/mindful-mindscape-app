import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMood } from "@/lib/mood";
import { askAssistant, type ChatMessage } from "@/lib/api";
import { useEffect, useRef, useState, useCallback } from "react";
import { Send, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/diario")({
  head: () => ({ meta: [{ title: "Diario con IA — Emowave" }] }),
  component: Diario,
});

const GREETING =
  "Hola. Este es tu diario privado. Cuéntame cómo te sientes hoy, sin filtros. Estoy aquí para escucharte.";

function Diario() {
  const { user, authReady } = useMood();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  // ✅ Controla si el backend IA está disponible (se detecta en el primer error)
  const [isOffline, setIsOffline] = useState(false);
  // Distingue sesión vencida (requiere volver a iniciar sesión) de una falla real de conexión/IA
  const [sessionExpired, setSessionExpired] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // ✅ FIX: useRef para evitar inicialización doble en StrictMode
  const initialized = useRef(false);

  useEffect(() => {
    if (authReady && !user) navigate({ to: "/auth" });
  }, [authReady, user, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ✅ FIX: dependencias correctas — se inicializa una sola vez con el ref
  useEffect(() => {
    if (!initialized.current && messages.length === 0) {
      initialized.current = true;
      setMessages([{ role: "assistant", content: GREETING }]);
    }
  }, [messages.length]);

  const resetChat = useCallback(() => {
    setMessages([{ role: "assistant", content: GREETING }]);
    setIsOffline(false);
    setSessionExpired(false);
    initialized.current = false;
  }, []);

  const send = async () => {
    const t = text.trim();
    if (!t || typing) return;

    const userMsg: ChatMessage = { role: "user", content: t };
    const updatedHistory = [...messages, userMsg];

    setMessages(updatedHistory);
    setText("");
    setTyping(true);

    try {
      // ✅ FIX: enviamos el historial completo para que el asistente tenga contexto
      const res = await askAssistant(t, updatedHistory);
      const reply = res.reply?.trim() || "No pude responder en este momento.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsOffline(false);
      setSessionExpired(false);
    } catch (err) {
      // Sesión vencida (ver refresco de token en lib/api.ts) es un caso distinto
      // a un fallo real de conexión con el asistente — no deben confundirse.
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Sesión expirada") || message.includes("Token")) {
        setSessionExpired(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Tu sesión expiró. Vuelve a iniciar sesión para seguir escribiendo aquí.",
          },
        ]);
      } else {
        setIsOffline(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Parece que no me puedo conectar ahora mismo. Tu mensaje se registró. ¿Seguimos cuando haya conexión?",
          },
        ]);
      }
    } finally {
      setTyping(false);
    }
  };

  if (!authReady || !user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-10 flex flex-col gap-4 h-[calc(100dvh-4rem)]">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Espacio privado</p>
            <h1 className="text-4xl mt-2">Diario con IA</h1>
          </div>
          <Button variant="outline" size="sm" onClick={resetChat} className="rounded-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Nueva conversación
          </Button>
        </div>

        {/* Sesión vencida: acción clara para recuperarla, distinta de un fallo de conexión */}
        {sessionExpired && (
          <Card className="p-3 rounded-2xl border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-start gap-3">
              <p className="text-red-700 dark:text-red-300">
                Tu sesión expiró. Vuelve a iniciar sesión para continuar.
              </p>
            </div>
            <Button size="sm" className="rounded-full shrink-0" onClick={() => navigate({ to: "/auth" })}>
              Iniciar sesión
            </Button>
          </Card>
        )}

        {/* ✅ FIX: banner de modo offline SOLO si hay fallo real de conexión */}
        {isOffline && !sessionExpired && (
          <Card className="p-3 rounded-2xl border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 flex items-start gap-3 text-sm">
            <p className="text-amber-700 dark:text-amber-300">
              Sin conexión con el asistente — respuestas locales activas. Verifica que el backend
              esté corriendo.
            </p>
          </Card>
        )}

        {/* Chat */}
        <Card className="card-premium !p-0 flex-1 min-h-[360px] flex flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6" aria-live="polite">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "chat-bubble-user"
                      : "chat-bubble-assistant"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {typing && (
              <div className="flex justify-start">
                <div className="chat-bubble-assistant px-4 py-3.5" aria-label="El asistente está escribiendo">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 sm:p-4 flex gap-2 items-end bg-card">
            <Textarea
              value={text}
              maxLength={1500}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Escribe lo que estás sintiendo…"
              className="min-h-[52px] max-h-40 rounded-xl resize-none"
              aria-label="Escribe tu mensaje"
              disabled={typing}
            />
            <Button
              onClick={send}
              size="lg"
              className="h-[52px] w-[52px] p-0 shrink-0 rounded-xl"
              disabled={typing || !text.trim()}
              aria-label="Enviar"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Contador */}
          <p className="text-[11px] text-muted-foreground px-4 pb-2 -mt-1 bg-card flex justify-between tabular">
            <span>Enter para enviar · Shift + Enter para nueva línea</span>
            <span>{text.length}/1500</span>
          </p>
        </Card>
      </main>
    </div>
  );
}
