import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMood, MOODS } from "@/lib/mood";
import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import { HeartHandshake, Send, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/psicologo")({
  head: () => ({ meta: [{ title: "Panel profesional — Serena" }] }),
  component: Panel,
});

// Mock users solicitando apoyo
const REQUESTS = [
  { alias: "luna_23", mood: "tristeza" as const, intensity: 7, lastNote: "Semana pesada, me cuesta concentrarme." },
  { alias: "anónimo", mood: "ansiedad" as const, intensity: 8, lastNote: "Nervios antes de un examen importante." },
  { alias: "viento.mar", mood: "calma" as const, intensity: 4, lastNote: "Quería compartir cómo me ayudó la respiración." },
  { alias: "anónimo", mood: "tristeza" as const, intensity: 6, lastNote: "Extraño a alguien." },
];

function Panel() {
  const { user } = useMood();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<typeof REQUESTS[number] | null>(null);
  const [msg, setMsg] = useState("Hola. No sé quién eres, pero quiero que sepas que estoy disponible para escucharte si en algún momento deseas hablar. Este es un espacio libre de juicios.");

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
    else if (user.role !== "psicologo") navigate({ to: "/app" });
  }, [user, navigate]);

  const trendData = useMemo(() => MOODS.map((m) => ({
    name: m.label, emoji: m.emoji,
    cantidad: REQUESTS.filter((r) => r.mood === m.id).length + Math.floor(Math.random() * 20) + 5,
  })), []);

  if (!user || user.role !== "psicologo") return null;

  const send = () => {
    if (!msg.trim()) return toast.error("Escribe un mensaje");
    toast.success(`Mensaje enviado a ${selected?.alias || "—"}`);
    setSelected(null);
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">Panel profesional</p>
          <h1 className="text-4xl font-serif mt-1 flex items-center gap-2"><HeartHandshake className="w-7 h-7 text-primary" /> Bienvenido/a</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">Aquí ves tendencias agregadas y usuarios que han solicitado apoyo. Por defecto su identidad permanece protegida.</p>
        </div>

        <Card className="p-7 rounded-3xl">
          <h2 className="text-xl font-serif mb-1">Tendencias emocionales globales</h2>
          <p className="text-sm text-muted-foreground mb-4">Distribución de emociones registradas esta semana.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="cantidad" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-7 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-xl font-serif">Solicitudes de apoyo</h2><p className="text-sm text-muted-foreground">Identidad protegida por defecto.</p></div>
            <span className="text-xs px-3 py-1 rounded-full bg-secondary flex items-center gap-1"><EyeOff className="w-3 h-3" /> Modo anónimo</span>
          </div>
          <div className="space-y-3">
            {REQUESTS.map((r, i) => {
              const m = MOODS.find((x) => x.id === r.mood)!;
              return (
                <div key={i} className="p-4 rounded-2xl bg-secondary/40 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 grid place-items-center text-xl">{m.emoji}</div>
                    <div className="min-w-0">
                      <p className="font-medium">{r.alias}</p>
                      <p className="text-xs text-muted-foreground">{m.label} · intensidad {r.intensity}/10</p>
                      <p className="text-sm text-foreground/70 mt-1 truncate max-w-md italic">"{r.lastNote}"</p>
                    </div>
                  </div>
                  <Button onClick={() => setSelected(r)} size="sm" className="rounded-full"><Send className="w-3.5 h-3.5 mr-2" /> Enviar apoyo</Button>
                </div>
              );
            })}
          </div>
        </Card>

        {selected && (
          <Card className="p-7 rounded-3xl border-2 border-primary">
            <div className="flex items-center gap-2 mb-3"><Eye className="w-4 h-4 text-primary" /><h2 className="text-xl font-serif">Mensaje a {selected.alias}</h2></div>
            <p className="text-sm text-muted-foreground mb-4">El usuario decide si quiere responder y si revela su identidad.</p>
            <Textarea value={msg} maxLength={1500} onChange={(e) => setMsg(e.target.value)} className="min-h-[140px]" />
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="ghost" onClick={() => setSelected(null)}>Cancelar</Button>
              <Button onClick={send} className="rounded-full">Enviar mensaje de apoyo</Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
