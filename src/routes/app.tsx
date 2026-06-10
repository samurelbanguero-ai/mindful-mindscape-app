import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMood, MOODS, SITUATIONS, type Mood } from "@/lib/mood";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { BookHeart, Sparkles, Flame, TreePine, Trophy, Bell } from "lucide-react";

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
];

const NOTIFS = [
  "¿Cómo te has sentido hoy?",
  "Tu espacio sigue aquí cuando quieras volver.",
  "Hoy podría ser un buen momento para esa música que tanto te gusta.",
  "Dedicar unos minutos a entenderte también es cuidarte.",
];

const todayKey = () => new Date().toISOString().slice(0, 10);
const last7 = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
const last30 = () => Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toISOString().slice(0, 10); });

function AppPage() {
  const { user, entries, addEntry, mood, profile, streak, treeLevel } = useMood();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Mood>(mood);
  const [intensity, setIntensity] = useState([5]);
  const [situations, setSituations] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [tip] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
  const [notif] = useState(() => NOTIFS[Math.floor(Math.random() * NOTIFS.length)]);

  useEffect(() => { if (!user) navigate({ to: "/auth" }); }, [user, navigate]);

  const todays = entries.find((e) => e.date === todayKey());
  useEffect(() => {
    if (todays) {
      setSelected(todays.mood); setNote(todays.note ?? "");
      setIntensity([todays.intensity ?? 5]); setSituations(todays.situations ?? []);
    }
  }, [todays?.date]);

  const weekData = useMemo(() => {
    const map = new Map(entries.map((e) => [e.date, e]));
    return last7().map((d) => {
      const e = map.get(d); const m = e ? MOODS.find((x) => x.id === e.mood) : null;
      return { date: new Date(d).toLocaleDateString("es", { weekday: "short" }), score: m?.score ?? null, mood: m?.label ?? "—", emoji: m?.emoji ?? "" };
    });
  }, [entries]);

  const monthData = useMemo(() => {
    const map = new Map(entries.map((e) => [e.date, e]));
    return last30().map((d, i) => {
      const e = map.get(d); const m = e ? MOODS.find((x) => x.id === e.mood) : null;
      return { day: i + 1, score: m?.score ?? null };
    });
  }, [entries]);

  const moodCounts = useMemo(() => {
    const c = MOODS.map((m) => ({ name: m.label, emoji: m.emoji, count: entries.filter((e) => e.mood === m.id).length }));
    return c.filter((x) => x.count > 0);
  }, [entries]);

  const handleSave = () => {
    addEntry({ date: todayKey(), mood: selected, note: note.trim() || undefined, intensity: intensity[0], situations });
    toast.success("Registro guardado. Gracias por escucharte 🌿");
  };

  const challenge = useMemo(() => {
    const i = profile.interests;
    if (!i.length) return "Tómate 5 minutos de respiración consciente.";
    const pick = i[Math.floor(Math.random() * i.length)];
    const map: Record<string, string> = {
      "Música": "Escucha una canción que te traiga calma.",
      "Películas": "Mira el tráiler de una peli que te inspire.",
      "Series": "Dedica un episodio a algo que disfrutes.",
      "Lectura": "Lee 10 minutos algo que te guste.",
      "Videojuegos": "Juega 15 minutos sin culpa.",
      "Deportes": "Sal a caminar 15 minutos.",
      "Arte": "Dibuja o escribe algo libre durante 10 minutos.",
      "Naturaleza": "Busca una ventana con luz natural y respira.",
      "Tecnología": "Aprende algo nuevo en 10 minutos.",
      "Cocinar": "Prepara algo simple y disfruta el proceso.",
    };
    return map[pick] || "Haz algo que te guste durante 10 minutos.";
  }, [profile.interests, todayKey()]);

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Hola{user.visibility === "anonimo" ? "" : `, ${user.alias || user.username}`} 👋</p>
            <h1 className="text-4xl font-serif mt-1">Tu diario emocional</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-full"><Link to="/diario"><Sparkles className="w-4 h-4 mr-2" /> Diario con IA</Link></Button>
            <Button asChild className="rounded-full"><Link to="/recomendaciones">Para ti</Link></Button>
          </div>
        </div>

        {/* Notificación + tip */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-5 rounded-2xl border-0 bg-accent/40 flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">{notif}</p>
          </Card>
          <Card className="p-5 rounded-2xl border-0 bg-accent/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 italic">{tip}</p>
          </Card>
        </div>

        {/* Stats principales */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider"><Flame className="w-4 h-4" /> Racha</div>
            <p className="text-3xl font-serif mt-2">{streak} días</p>
            <p className="text-xs text-muted-foreground mt-1">{streak >= 30 ? "🏆 Mes completo" : streak >= 7 ? "🌟 Semana lograda" : streak >= 3 ? "✨ Tres días seguidos" : "Empieza tu racha hoy"}</p>
          </Card>
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider"><TreePine className="w-4 h-4" /> Tu árbol</div>
            <div className="flex items-center gap-3 mt-2"><GrowthTree level={treeLevel} /><div><p className="text-sm font-medium">Nivel {treeLevel}/5</p><p className="text-xs text-muted-foreground">Crece con cada registro</p></div></div>
          </Card>
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider"><Trophy className="w-4 h-4" /> Reto de hoy</div>
            <p className="text-sm mt-2 leading-relaxed">{challenge}</p>
          </Card>
        </div>

        {/* Registro */}
        <Card className="p-7 rounded-3xl">
          <div className="flex items-center gap-2 mb-1"><BookHeart className="w-5 h-5 text-primary" /><h2 className="text-2xl font-serif">¿Cómo te sientes hoy?</h2></div>
          <p className="text-sm text-muted-foreground mb-6">{todays ? "Ya registraste hoy, pero puedes actualizarlo." : "Tómate un momento. Sin prisa."}</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {MOODS.map((m) => (
              <button key={m.id} onClick={() => setSelected(m.id)} className={`p-4 rounded-2xl border-2 transition text-center ${selected === m.id ? "border-primary bg-primary/10 scale-[1.02]" : "border-border hover:border-primary/40 bg-secondary/40"}`}>
                <div className="text-3xl mb-1">{m.emoji}</div>
                <div className="text-sm font-medium">{m.label}</div>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <Label className="text-sm font-medium">Intensidad: <span className="text-primary font-serif text-lg">{intensity[0]}/10</span></Label>
            <Slider min={1} max={10} step={1} value={intensity} onValueChange={setIntensity} className="mt-3" />
          </div>

          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">¿Qué influyó hoy? (puedes elegir varias)</Label>
            <div className="flex flex-wrap gap-2">
              {SITUATIONS.map((s) => {
                const on = situations.includes(s);
                return <button key={s} onClick={() => setSituations((p) => on ? p.filter((x) => x !== s) : [...p, s])} className={`px-3 py-1.5 rounded-full text-xs border-2 transition ${on ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>{s}</button>;
              })}
            </div>
          </div>

          <Label htmlFor="note" className="text-sm font-medium">Comentario personal (opcional)</Label>
          <Textarea id="note" value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="¿Qué pasó hoy? ¿Qué necesitas?" className="mt-2 min-h-[100px] rounded-xl" />
          <div className="mt-5 flex justify-end"><Button onClick={handleSave} size="lg" className="rounded-full px-7">Guardar registro</Button></div>
        </Card>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-7 rounded-3xl">
            <h2 className="text-xl font-serif mb-1">Tu semana</h2>
            <p className="text-sm text-muted-foreground mb-4">Evolución de tu ánimo en los últimos 7 días.</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.05} /></linearGradient></defs>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} formatter={(_v, _n, p) => [`${p.payload.emoji} ${p.payload.mood}`, "Ánimo"]} />
                  <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={3} fill="url(#g1)" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-7 rounded-3xl">
            <h2 className="text-xl font-serif mb-1">Tu mes</h2>
            <p className="text-sm text-muted-foreground mb-4">Tendencia de los últimos 30 días.</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} fill="var(--color-primary)" fillOpacity={0.15} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {moodCounts.length > 0 && (
          <Card className="p-7 rounded-3xl">
            <h2 className="text-xl font-serif mb-1">Emociones predominantes</h2>
            <p className="text-sm text-muted-foreground mb-4">Cuántas veces has registrado cada una.</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function GrowthTree({ level }: { level: number }) {
  const trunkH = 20 + level * 8;
  const foliageR = 8 + level * 6;
  return (
    <svg width="64" height="80" viewBox="0 0 64 80">
      <rect x="28" y={80 - trunkH} width="8" height={trunkH} rx="2" fill="var(--color-primary)" opacity="0.7" />
      {level >= 1 && <circle cx="32" cy={80 - trunkH - foliageR / 2} r={foliageR} fill="var(--color-primary)" opacity="0.5" />}
      {level >= 3 && <circle cx="20" cy={80 - trunkH - foliageR / 2 + 4} r={foliageR - 2} fill="var(--color-primary)" opacity="0.4" />}
      {level >= 3 && <circle cx="44" cy={80 - trunkH - foliageR / 2 + 4} r={foliageR - 2} fill="var(--color-primary)" opacity="0.4" />}
      {level >= 5 && <circle cx="32" cy={80 - trunkH - foliageR * 1.5} r={foliageR - 3} fill="var(--color-primary)" opacity="0.6" />}
    </svg>
  );
}
