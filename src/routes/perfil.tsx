import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMood } from "@/lib/mood";
import { useEffect } from "react";
import { Settings, Music } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Mi perfil — Serena" }] }),
  component: Perfil,
});

function Perfil() {
  const { user, profile, streak, treeLevel, entries } = useMood();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate({ to: "/auth" }); }, [user, navigate]);
  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tu espacio</p>
            <h1 className="text-4xl font-serif mt-1">Mi perfil</h1>
          </div>
          <Button asChild variant="outline" className="rounded-full"><Link to="/onboarding"><Settings className="w-4 h-4 mr-2" /> Editar preferencias</Link></Button>
        </div>

        <Card className="p-6 rounded-3xl space-y-3">
          <Row k="Usuario" v={user.username} />
          <Row k="Correo" v={user.email} />
          <Row k="Visibilidad" v={user.visibility === "anonimo" ? "Anónimo/a" : user.visibility === "alias" ? `Alias: ${user.alias}` : "Público"} />
          <Row k="Rol" v={user.role === "psicologo" ? "Psicólogo/a" : "Usuario"} />
        </Card>

        <div className="grid sm:grid-cols-3 gap-4">
          <Stat label="Registros" value={String(entries.length)} />
          <Stat label="Racha actual" value={`${streak} días`} />
          <Stat label="Nivel árbol" value={`${treeLevel}/5`} />
        </div>

        <Card className="p-6 rounded-3xl">
          <h2 className="font-serif text-xl mb-3">Tus intereses</h2>
          {profile.interests.length ? (
            <div className="flex flex-wrap gap-2">{profile.interests.map((i) => <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{i}</span>)}</div>
          ) : <p className="text-sm text-muted-foreground">Aún no has elegido. <Link to="/onboarding" className="text-primary underline">Completa tu perfil</Link>.</p>}

          {profile.genres.length > 0 && <>
            <h3 className="font-medium mt-5 mb-2 text-sm">Música</h3>
            <div className="flex flex-wrap gap-2">{profile.genres.map((g) => <span key={g} className="px-3 py-1 rounded-full bg-secondary text-xs">{g}</span>)}</div>
          </>}

          {profile.relax.length > 0 && <>
            <h3 className="font-medium mt-5 mb-2 text-sm">Para relajarte</h3>
            <div className="flex flex-wrap gap-2">{profile.relax.map((g) => <span key={g} className="px-3 py-1 rounded-full bg-secondary text-xs">{g}</span>)}</div>
          </>}

          {profile.goals && <>
            <h3 className="font-medium mt-5 mb-2 text-sm">Tus objetivos</h3>
            <p className="text-sm text-muted-foreground italic">"{profile.goals}"</p>
          </>}
        </Card>

        <Card className="p-6 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-primary" />
            <div><p className="font-medium">Spotify</p><p className="text-xs text-muted-foreground">{profile.spotifyConnected ? "Conectado" : "No conectado"}</p></div>
          </div>
          <Button asChild variant="outline" className="rounded-full" size="sm"><Link to="/spotify">Gestionar</Link></Button>
        </Card>
      </main>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return <Card className="p-5 rounded-2xl"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-3xl font-serif mt-1">{value}</p></Card>;
}
