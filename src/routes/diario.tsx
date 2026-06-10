import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMood, aiReply } from "@/lib/mood";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, RotateCcw, Info } from "lucide-react";

export const Route = createFileRoute("/diario")({
  head: () => ({ meta: [{ title: "Diario con IA — Serena" }] }),
  component: Diario,
});

function Diario() {
  const { user, chat, pushChat, resetChat } = useMood();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!user) navigate({ to: "/auth" }); }, [user, navigate]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, typing]);
  useEffect(() => {
    if (chat.length === 0) {
      pushChat({ role: "ai", text: "Hola. Este es tu diario. Cuéntame cómo te sientes hoy, sin filtros. Estoy para escucharte." });
    }
  }, []);

  const send = () => {
    const t = text.trim(); if (!t) return;
    pushChat({ role: "user", text: t }); setText(""); setTyping(true);
    setTimeout(() => { pushChat({ role: "ai", text: aiReply(t) }); setTyping(false); }, 900 + Math.random() * 700);
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Espacio privado</p>
            <h1 className="text-4xl font-serif mt-1 flex items-center gap-2"><Sparkles className="w-7 h-7 text-primary" /> Diario con IA</h1>
          </div>
          <Button variant="outline" size="sm" onClick={resetChat} className="rounded-full"><RotateCcw className="w-4 h-4 mr-2" /> Nueva conversación</Button>
        </div>

        <Card className="p-3 rounded-2xl border-0 bg-accent/40 flex items-start gap-3 text-sm">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-foreground/70">Versión demo con respuestas reflexivas pregrabadas. Pronto será una IA empática real conectada a Lovable AI.</p>
        </Card>

        <Card className="p-6 rounded-3xl min-h-[400px] flex flex-col">
          <div className="flex-1 space-y-4 max-h-[480px] overflow-y-auto pr-2">
            {chat.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" /><span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.15s]" /><span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.3s]" /></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="mt-4 flex gap-2 items-end">
            <Textarea value={text} maxLength={1500} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Escribe lo que estás sintiendo…" className="min-h-[60px] rounded-2xl resize-none" />
            <Button onClick={send} size="lg" className="rounded-full h-12 w-12 p-0 shrink-0"><Send className="w-4 h-4" /></Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
