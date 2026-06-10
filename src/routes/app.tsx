import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMood, MOODS, type Mood } from "@/lib/mood";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BookHeart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Mi diario — Serena" }] }),
  component: AppPage,
});

const MOTIVATIONAL = [
  "Sentir es parte de estar viva/o. Hoy basta con notarlo.",
  "No tienes que tenerlo todo claro. Solo el siguiente paso.",
  "Tu calma también es productiva.",
  "Lo que escribes aquí te conoce sin juzgarte.",
  "Cada registro es un acto de cuidado contigo.",
  "Hoy puedes ir despacio. Mañana también.",
];

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function last7Days() {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function AppPage() {
  const { user, entries, addEntry, mood } = useMood();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Mood>(mood);
  const [note, setNote] = useState("");
  const [tip] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  const todays = entries.find((e) => e.date === todayKey());

  useEffect(() => {
    if (todays) {
      setSelected(todays.mood);
      setNote(todays.note ?? "");
    }
  }, [todays?.date]);

  const chartData = useMemo(() => {
    const map = new Map(entries.map((e) => [e.date, e]));
    return last7Days().map((d) => {
      const e = map.get(d);
      const m = e ? MOODS.find((x) => x.id === e.mood) : null;
      const label = new Date(d).toLocaleDateString("es", { weekday: "short" });
      return { date: label, score: m?.score ?? null, mood: m?.label ?? "—", emoji: m?.emoji ?? "" };
    });
  }, [entries]);

  const handleSave = () => {
    addEntry({ date: todayKey(), mood: selected, note: note.trim() || undefined });
    toast.success("Registro guardado. Gracias por escucharte hoy 🌿");
  };

  const stats = useMemo(() => {
    const week = chartData.filter((d) => d.score !== null);
    if (!week.length) return null;
    const avg = week.reduce((s, d) => s + (d.score as number), 0) / week.length;
    const counts = new Map<string, number>();
    week.forEach((d) => counts.set(d.mood, (counts.get(d.mood) || 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return { avg: avg.toFixed(1), top: top[0], days: week.length };
  }, [chartData]);

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">Hola{user.anonymous ? "" : `, ${user.username}`} 👋</p>
          <h1 className="text-4xl mt-1">Tu diario emocional</h1>
        </div>

        <Card className="p-5 rounded-2xl border-0 bg-accent/40 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80 italic">{tip}</p>
        </Card>

        {/* Registro */}
        <Card className="p-7 rounded-3xl">
          <div className="flex items-center gap-2 mb-1">
            <BookHeart className="w-5 h-5 text-primary" />
            <h2 className="text-2xl">¿Cómo te sientes hoy?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {todays ? "Ya registraste hoy, pero puedes actualizarlo." : "Tómate un momento. Sin prisa."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`p-4 rounded-2xl border-2 transition text-center ${
                  selected === m.id
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/40 bg-secondary/40"
                }`}
              >
                <div className="text-3xl mb-1">{m.emoji}</div>
                <div className="text-sm font-medium">{m.label}</div>
              </button>
            ))}
          </div>

          <Label htmlFor="note" className="text-sm font-medium">Si quieres, escribe algo (opcional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="¿Qué pasó hoy? ¿Qué necesitas?"
            className="mt-2 min-h-[100px] rounded-xl"
          />
          <div className="mt-5 flex justify-end">
            <Button onClick={handleSave} size="lg" className="rounded-full px-7">
              Guardar registro
            </Button>
          </div>
        </Card>

        {/* Stats */}
        {stats && (
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="Días registrados" value={`${stats.days} / 7`} />
            <StatCard label="Ánimo promedio" value={stats.avg} sub="sobre 5" />
            <StatCard label="Emoción más frecuente" value={stats.top} />
          </div>
        )}

        {/* Gráfico */}
        <Card className="p-7 rounded-3xl">
          <h2 className="text-2xl mb-1">Tu semana</h2>
          <p className="text-sm text-muted-foreground mb-6">Una mirada amable a cómo te has sentido.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                  formatter={(_v, _n, p) => [`${p.payload.emoji} ${p.payload.mood}`, "Ánimo"]}
                />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={3} fill="url(#moodGrad)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5 rounded-2xl">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-3xl font-serif mt-1">
        {value}
        {sub && <span className="text-sm text-muted-foreground ml-1">{sub}</span>}
      </p>
    </Card>
  );
}

function Label({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return <label htmlFor={htmlFor} className={className}>{children}</label>;
}
