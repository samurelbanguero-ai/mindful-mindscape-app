import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMood, MOODS, type Mood } from "@/lib/mood";
import { useEffect } from "react";
import { Music, Info, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/spotify")({
  head: () => ({ meta: [{ title: "Spotify — Serena" }] }),
  component: Spot,
});

const SAMPLE = {
  artists: ["Bon Iver", "Florence + The Machine", "Lana Del Rey", "Coldplay", "Tame Impala"],
  playlists: [
    { name: "Calma profunda", mood: "calma" as Mood, tracks: 24 },
    { name: "Buenos días", mood: "alegria" as Mood, tracks: 18 },
    { name: "Para llorar tranquilo", mood: "tristeza" as Mood, tracks: 32 },
    { name: "Respira despacio", mood: "ansiedad" as Mood, tracks: 15 },
    { name: "Energía limpia", mood: "energia" as Mood, tracks: 28 },
  ],
};

function Spot() {
  const { user, profile, setProfile, mood } = useMood();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate({ to: "/auth" }); }, [user, navigate]);
  if (!user) return null;

  const connect = () => { setProfile({ ...profile, spotifyConnected: true }); toast.success("Spotify conectado (demo) 🎧"); };
  const disconnect = () => { setProfile({ ...profile, spotifyConnected: false }); toast.success("Desconectado"); };
  const recommended = SAMPLE.playlists.find((p) => p.mood === mood) || SAMPLE.playlists[0];
  const m = MOODS.find((x) => x.id === mood)!;

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Música para tu estado</p>
          <h1 className="text-4xl font-serif mt-1 flex items-center gap-2"><Music className="w-7 h-7 text-primary" /> Spotify</h1>
        </div>

        <Card className="p-3 rounded-2xl border-0 bg-accent/40 flex items-start gap-3 text-sm">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-foreground/70">Demo con datos de ejemplo. Pronto se conectará a tu cuenta real de Spotify (OAuth).</p>
        </Card>

        {!profile.spotifyConnected ? (
          <Card className="p-10 rounded-3xl text-center">
            <Music className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-2">Conecta tu Spotify</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Para recomendarte playlists según cómo te sientes y los géneros que disfrutas.</p>
            <Button onClick={connect} size="lg" className="rounded-full px-8">Conectar (demo)</Button>
          </Card>
        ) : (
          <>
            <Card className="p-6 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /><div><p className="font-medium">Cuenta conectada</p><p className="text-xs text-muted-foreground">(datos de muestra)</p></div></div>
              <Button onClick={disconnect} variant="ghost" size="sm">Desconectar</Button>
            </Card>

            <Card className="p-6 rounded-3xl">
              <h2 className="text-xl font-serif mb-1">Recomendación para hoy</h2>
              <p className="text-sm text-muted-foreground mb-4">Tu estado: {m.emoji} {m.label}</p>
              <div className="p-5 rounded-2xl bg-primary/10 flex items-center justify-between">
                <div><p className="text-lg font-medium">{recommended.name}</p><p className="text-xs text-muted-foreground">{recommended.tracks} canciones</p></div>
                <Button className="rounded-full">Reproducir</Button>
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 gap-5">
              <Card className="p-6 rounded-3xl">
                <h3 className="font-medium mb-3">Tus artistas favoritos</h3>
                <ul className="space-y-2 text-sm">{SAMPLE.artists.map((a) => <li key={a} className="p-2 rounded-lg bg-secondary/40">{a}</li>)}</ul>
              </Card>
              <Card className="p-6 rounded-3xl">
                <h3 className="font-medium mb-3">Géneros</h3>
                <div className="flex flex-wrap gap-2">{(profile.genres.length ? profile.genres : ["Indie", "Pop", "Lo-fi"]).map((g) => <span key={g} className="px-3 py-1.5 rounded-full bg-secondary text-xs">{g}</span>)}</div>
              </Card>
            </div>

            <Card className="p-6 rounded-3xl">
              <h3 className="font-medium mb-3">Tus playlists según emoción</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {SAMPLE.playlists.map((p) => {
                  const pm = MOODS.find((x) => x.id === p.mood)!;
                  return (
                    <div key={p.name} className="p-4 rounded-xl bg-secondary/40 flex items-center justify-between">
                      <div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{pm.emoji} {pm.label} · {p.tracks} canciones</p></div>
                      <Button size="sm" variant="outline" className="rounded-full">Abrir</Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
