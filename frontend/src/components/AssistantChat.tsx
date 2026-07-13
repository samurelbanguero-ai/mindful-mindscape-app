import { useEffect, useRef, useState } from "react";
import { askAssistant } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hola, soy tu asistente de bienestar. ¿Cómo te sientes hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };

    // ✅ FIX: actualizamos el estado y guardamos historial actualizado en una variable local
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // ✅ FIX: enviamos el historial para que Claude tenga contexto de la conversación
      const res = await askAssistant(text, updatedMessages);

      const reply =
        typeof res?.reply === "string" && res.reply.trim().length > 0
          ? res.reply
          : "No pude responder ahora mismo. Inténtalo de nuevo.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hubo un problema al conectarme. ¿Lo intentamos de nuevo?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
      {/* Área de mensajes */}
      <div className="rounded-2xl border border-border bg-secondary/30 p-4 flex flex-col gap-3 min-h-[340px] max-h-[520px] overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-background border border-border text-foreground rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* ✅ Indicador de "pensando" */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-background border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center">
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
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe cómo te sientes..."
          className="flex-1 min-h-[52px] max-h-[120px] resize-none rounded-2xl"
          maxLength={2000}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          size="icon"
          className="h-12 w-12 rounded-full shrink-0"
          aria-label="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Contador de caracteres */}
      <p className="text-xs text-muted-foreground text-right -mt-2">{input.length}/2000</p>
    </div>
  );
}
