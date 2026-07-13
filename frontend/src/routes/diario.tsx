import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMood } from "@/lib/mood";
import { askAssistant, type ChatMessage } from "@/lib/api";
import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, Send, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/diario")({
  head: () => ({ meta: [{ title: "Diario con IA — Emowave" }] }),
  component: Diario,
});

const GREETING =
  "Hola. Este es tu diario privado. Cuéntame cómo te sientes hoy, sin filtros. Estoy aquí para escucharte.";

function Diario() {
  const { user } = useMood();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  // ✅ Controla si el backend IA está disponible (se detecta en el primer error)
  const [isOffline, setIsOffline] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // ✅ FIX: useRef para evitar inicialización doble en StrictMode
  const initialized = useRef(false);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

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
    } catch {
      setIsOffline(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Parece que no me puedo conectar ahora mismo. Tu mensaje se registró. ¿Seguimos cuando haya conexión?",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Espacio privado</p>
            <h1 className="text-4xl font-serif mt-1 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" />
              Diario con IA
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={resetChat} className="rounded-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Nueva conversación
          </Button>
        </div>

        {/* ✅ FIX: banner de modo offline SOLO si hay fallo real de conexión */}
        {isOffline && (
          <Card className="p-3 rounded-2xl border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 flex items-start gap-3 text-sm">
            <span className="text-amber-500 shrink-0 mt-0.5">⚠️</span>
            <p className="text-amber-700 dark:text-amber-300">
              Sin conexión con el asistente — respuestas locales activas. Verifica que el backend
              esté corriendo.
            </p>
          </Card>
        )}

        {/* Chat */}
        <Card className="card-premium flex-1 min-h-[400px] flex flex-col hover:transform-none hover:shadow-sm">
          <div className="flex-1 space-y-4 max-h-[480px] overflow-y-auto pr-2">
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
                <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-sm">
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
          <div className="mt-4 flex gap-2 items-end">
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
              className="min-h-[60px] rounded-2xl resize-none"
              disabled={typing}
            />
            <Button
              onClick={send}
              size="lg"
              className="rounded-full h-12 w-12 p-0 shrink-0"
              disabled={typing || !text.trim()}
              aria-label="Enviar"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Contador */}
          <p className="text-xs text-muted-foreground text-right mt-1">{text.length}/1500</p>
        </Card>
      </main>
    </div>
  );
}
