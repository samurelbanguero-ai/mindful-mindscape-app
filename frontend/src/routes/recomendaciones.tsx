import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMood, MOODS, type Mood, getParentMood } from "@/lib/mood";
import { useEffect, useMemo } from "react";
import { Music, Film, Sparkles, Wind, Heart } from "lucide-react";

export const Route = createFileRoute("/recomendaciones")({
  head: () => ({ meta: [{ title: "Para ti — Emowave" }] }),
  component: Recos,
});

const MUSIC: Record<Mood, { title: string; artist: string }[]> = {
  calma: [
    { title: "Weightless", artist: "Marconi Union" },
    { title: "Holocene", artist: "Bon Iver" },
    { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
  ],
  alegria: [
    { title: "Walking on Sunshine", artist: "Katrina & The Waves" },
    { title: "Valerie", artist: "Mark Ronson" },
    { title: "Three Little Birds", artist: "Bob Marley" },
  ],
  tristeza: [
    { title: "Skinny Love", artist: "Birdy" },
    { title: "Fix You", artist: "Coldplay" },
    { title: "Liability", artist: "Lorde" },
  ],
  ansiedad: [
    { title: "Breathe Me", artist: "Sia" },
    { title: "Saturn", artist: "Sleeping At Last" },
    { title: "Clair de Lune", artist: "Debussy" },
  ],
  energia: [
    { title: "Dog Days Are Over", artist: "Florence + The Machine" },
    { title: "Pump It", artist: "Black Eyed Peas" },
    { title: "Levitating", artist: "Dua Lipa" },
  ],
};

const MOVIES: Record<Mood, string[]> = {
  calma: ["Mi vecino Totoro", "Call Me By Your Name", "Lost in Translation"],
  alegria: ["Amélie", "School of Rock", "Paddington 2"],
  tristeza: ["Inside Out", "About Time", "Manchester by the Sea"],
  ansiedad: ["Soul", "Spirited Away", "The Secret Life of Walter Mitty"],
  energia: ["Whiplash", "Spider-Verse", "La La Land"],
};

const ACTIVITIES: Record<Mood, string[]> = {
  calma: ["Una caminata sin móvil", "Té caliente + libro", "Escribir tres gracias del día"],
  alegria: [
    "Llama a alguien que quieres",
    "Baila tu canción favorita",
    "Comparte tu día con alguien",
  ],
  tristeza: [
    "Date un baño largo",
    "Permítete llorar si lo necesitas",
    "Ve algo que te haga sonreír",
  ],
  ansiedad: [
    "Respira 4-7-8 cinco veces",
    "Sal a tomar aire 10 minutos",
    "Escribe lo que te preocupa",
  ],
  energia: ["Ejercicio que disfrutes 20 min", "Empieza ese proyecto", "Ordena un rincón de casa"],
};

function Recos() {
  const { user, mood, profile, entries } = useMood();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  const todayMood = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return entries.find((e) => e.date === today)?.mood ?? mood;
  }, [entries, mood]);

  // ✅ FIX: Obtener la emoción padre para evitar crashes por emociones específicas
  const parentMood = useMemo(() => {
    return getParentMood(todayMood) || "calma";
  }, [todayMood]);

  const m = useMemo(() => {
    return (
      MOODS.find((x) => x.id === todayMood) || MOODS.find((x) => x.id === parentMood) || MOODS[0]
    );
  }, [todayMood, parentMood]);

  // Fallbacks defensivos
  const musicList = MUSIC[parentMood] || MUSIC.calma;
  const moviesList = MOVIES[parentMood] || MOVIES.calma;
  const activitiesList = ACTIVITIES[parentMood] || ACTIVITIES.calma;

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">Hoy te sientes</p>
          <h1 className="text-4xl font-serif mt-1">
            {m.emoji} {m.label}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            No buscamos distraerte de lo que sientes, sino acompañarte con cosas que sabemos que
            disfrutas.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="p-6 rounded-3xl card-premium hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif">Música</h2>
            </div>
            <ul className="space-y-3">
              {musicList.map((s) => (
                <li key={s.title} className="p-3 rounded-xl bg-secondary/40">
                  <p className="font-medium text-sm text-foreground/90">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.artist}</p>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full mt-4 rounded-full">
              <Link to="/spotify">Conecta tu Spotify</Link>
            </Button>
          </Card>

          <Card className="p-6 rounded-3xl card-premium hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Film className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif">Películas</h2>
            </div>
            <ul className="space-y-3">
              {moviesList.map((t) => (
                <li key={t} className="p-3 rounded-xl bg-secondary/40 text-sm font-medium text-foreground/80">
                  {t}
                </li>
              ))}
            </ul>
            {profile.movies && (
              <p className="text-xs text-muted-foreground mt-3">
                Basado también en tus favoritas: <em>{profile.movies}</em>
              </p>
            )}
          </Card>

          <Card className="p-6 rounded-3xl card-premium hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Wind className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif">Actividades</h2>
            </div>
            <ul className="space-y-3">
              {activitiesList.map((t) => (
                <li key={t} className="p-3 rounded-xl bg-secondary/40 text-sm text-foreground/80">
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {profile.interests.length > 0 && (
          <Card className="p-6 rounded-3xl card-premium">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif">Pensado para ti</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {i}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Combinamos tu emoción de hoy con lo que disfrutas para sugerirte pequeños actos de
              cuidado.
            </p>
          </Card>
        )}

        <Card className="p-6 rounded-3xl card-premium bg-accent/20 border-0 flex items-start gap-3">
          <Heart className="w-5 h-5 text-primary mt-0.5" />
          <p className="text-sm leading-relaxed">
            Si necesitas hablar con alguien, recuerda que también hay{" "}
            <Link to="/recursos" className="text-primary underline font-medium">
              líneas de ayuda gratuitas
            </Link>{" "}
            disponibles 24/7.
          </p>
        </Card>
      </main>
    </div>
  );
}
