import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMood, INTERESTS } from "@/lib/mood";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const GENRES = [
  "Pop",
  "Rock",
  "Indie",
  "Electrónica",
  "Clásica",
  "Jazz",
  "R&B",
  "Hip-hop",
  "Reggaetón",
  "Lo-fi",
  "Folk",
  "Latina",
];
const RELAX = [
  "Caminar",
  "Respiración",
  "Meditar",
  "Música",
  "Escribir",
  "Ducha caliente",
  "Estirar",
  "Cocinar",
  "Salir con alguien",
  "Dormir una siesta",
];

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Conócete — Emowave" }] }),
  component: Onboarding,
});

function Onboarding() {
  const { user, profile, setProfile } = useMood();
  const navigate = useNavigate();
  const [f, setF] = useState(profile);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  const toggle = (key: "interests" | "genres" | "relax", v: string) => {
    setF((p) => ({
      ...p,
      [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v],
    }));
  };

  const save = () => {
    setProfile(f);
    toast.success("Listo. Vamos a conocernos día a día 🌱");
    navigate({ to: "/app" });
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Paso final</p>
          <h1 className="text-4xl font-serif mt-1">Cuéntanos sobre ti</h1>
          <p className="text-muted-foreground mt-2">
            Lo usaremos para sugerirte música, películas y actividades que de verdad disfrutes.
            Puedes saltarte lo que no quieras responder.
          </p>
        </div>

        <Card className="p-6 rounded-3xl card-premium">
          <Label className="text-base font-semibold text-foreground/90 block mb-2">¿Qué te gusta hacer?</Label>
          <div className="flex flex-wrap gap-2 mt-3">
            {INTERESTS.map((i) => (
              <button
                key={i}
                onClick={() => toggle("interests", i)}
                className={`px-4 py-2 rounded-full border-2 text-sm transition cursor-pointer ${f.interests.includes(i) ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/40 text-muted-foreground"}`}
              >
                {i}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 rounded-3xl card-premium">
          <Label className="text-base font-semibold text-foreground/90 block mb-2">Géneros musicales favoritos</Label>
          <div className="flex flex-wrap gap-2 mt-3">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => toggle("genres", g)}
                className={`px-4 py-2 rounded-full border-2 text-sm transition cursor-pointer ${f.genres.includes(g) ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/40 text-muted-foreground"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 rounded-3xl card-premium grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="movies" className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Películas favoritas</Label>
            <Input
              id="movies"
              maxLength={200}
              value={f.movies}
              onChange={(e) => setF({ ...f, movies: e.target.value })}
              placeholder="Coco, Amélie..."
              className="rounded-xl input-premium"
            />
          </div>
          <div>
            <Label htmlFor="series" className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Series favoritas</Label>
            <Input
              id="series"
              maxLength={200}
              value={f.series}
              onChange={(e) => setF({ ...f, series: e.target.value })}
              placeholder="Friends, Heartstopper..."
              className="rounded-xl input-premium"
            />
          </div>
        </Card>

        <Card className="p-6 rounded-3xl card-premium">
          <Label className="text-base font-semibold text-foreground/90 block mb-2">Para relajarte sueles…</Label>
          <div className="flex flex-wrap gap-2 mt-3">
            {RELAX.map((r) => (
              <button
                key={r}
                onClick={() => toggle("relax", r)}
                className={`px-4 py-2 rounded-full border-2 text-sm transition cursor-pointer ${f.relax.includes(r) ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/40 text-muted-foreground"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 rounded-3xl card-premium">
          <Label htmlFor="goals" className="text-base font-semibold text-foreground/90 block mb-2">
            Tus objetivos personales (opcional)
          </Label>
          <Textarea
            id="goals"
            maxLength={400}
            className="mt-2 min-h-[100px] rounded-xl input-premium"
            value={f.goals}
            onChange={(e) => setF({ ...f, goals: e.target.value })}
            placeholder="Sentirme más tranquilo/a, dormir mejor, abrirme más..."
          />
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate({ to: "/app" })} className="rounded-full">
            Saltar por ahora
          </Button>
          <Button onClick={save} size="lg" className="rounded-full px-7 btn-premium-primary py-6">
            Guardar y continuar
          </Button>
        </div>
      </main>
    </div>
  );
}
