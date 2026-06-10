import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOODS, useMood } from "@/lib/mood";
import { BookHeart, LineChart, MessageCircle, Sparkles, ShieldCheck, Phone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serena — Tu espacio seguro para las emociones" },
      { name: "description", content: "Registra cómo te sientes cada día, descubre tus patrones emocionales y encuentra recursos para cuidarte." },
      { property: "og:title", content: "Serena — Tu espacio seguro" },
      { property: "og:description", content: "Un diario emocional cálido para conocerte mejor día a día." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { setMood } = useMood();
  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 backdrop-blur text-xs text-foreground/80 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Un espacio diseñado con calma
            </div>
            <h1 className="text-5xl md:text-6xl leading-[1.05] mb-6">
              Conoce cómo te sientes, <em className="not-italic text-primary">un día a la vez</em>.
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-lg">
              Serena es tu diario emocional. Registra tu ánimo, observa cómo cambia durante la semana y descubre qué te ayuda a sentirte mejor.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/auth">Empezar gratis <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-7 bg-background/60 backdrop-blur">
                <a href="#como-funciona">Cómo funciona</a>
              </Button>
            </div>
          </div>

          <div className="relative">
            <Card className="p-6 rounded-3xl shadow-2xl border-0 bg-card/90 backdrop-blur">
              <p className="text-sm text-muted-foreground mb-3">¿Cómo te sientes ahora?</p>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className="aspect-square rounded-2xl bg-secondary hover:bg-accent transition flex flex-col items-center justify-center gap-1 active:scale-95"
                    title={m.label}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Toca una emoción y observa cómo cambia la paleta de Serena 🌈
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-primary mb-3">Cómo funciona</p>
          <h2 className="text-4xl mb-4">Tres pasos para empezar a cuidarte</h2>
          <p className="text-muted-foreground">Sin presión, sin juicios. A tu ritmo.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: BookHeart, title: "Registra tu día", text: "Elige una emoción y escribe lo que sientas. Tu espacio, totalmente privado." },
            { icon: LineChart, title: "Observa patrones", text: "Visualiza cómo varía tu ánimo semana a semana en gráficos claros y amables." },
            { icon: Sparkles, title: "Encuentra tu calma", text: "Recibe recomendaciones suaves: música, películas o un respiro consciente." },
          ].map((step, i) => (
            <Card key={i} className="p-7 rounded-3xl border border-border/60 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-accent text-accent-foreground grid place-items-center mb-4">
                <step.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* EMOCIONES */}
      <section id="emociones" className="bg-secondary/40 py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Tus emociones, tu color</p>
            <h2 className="text-4xl mb-5">La interfaz cambia contigo</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Cada emoción tiene su propio universo visual. Cuando estás en calma, la app te abraza con tonos verdes; si tienes energía, te acompaña con coral. Tú eliges cómo se ve tu refugio.
            </p>
            <ul className="space-y-3">
              {MOODS.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span className="text-xl">{m.emoji}</span>
                  <div>
                    <p className="font-medium">{m.label}</p>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className="aspect-square rounded-3xl p-5 text-left transition hover:scale-[1.02] shadow-sm"
                style={{
                  background: m.id === "alegria" ? "linear-gradient(135deg, oklch(0.93 0.08 80), oklch(0.88 0.12 50))" :
                              m.id === "energia" ? "linear-gradient(135deg, oklch(0.92 0.08 30), oklch(0.85 0.14 25))" :
                              m.id === "calma" ? "linear-gradient(135deg, oklch(0.92 0.05 180), oklch(0.86 0.08 165))" :
                              m.id === "ansiedad" ? "linear-gradient(135deg, oklch(0.9 0.06 310), oklch(0.85 0.08 295))" :
                              "linear-gradient(135deg, oklch(0.9 0.05 250), oklch(0.85 0.08 265))"
                }}
              >
                <span className="text-3xl block mb-2">{m.emoji}</span>
                <span className="text-sm font-medium text-foreground/80">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-primary mb-3">Recursos</p>
          <h2 className="text-4xl mb-4">Nunca estás solo/a</h2>
          <p className="text-muted-foreground">Líneas de ayuda gratuitas y confidenciales, disponibles cuando lo necesites.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: "Línea de la Vida (México)", phone: "800 290 0024", note: "24/7, gratuita y confidencial" },
            { name: "Teléfono de la Esperanza (España)", phone: "717 003 717", note: "Apoyo emocional 24h" },
            { name: "Crisis Text Line (Internacional)", phone: "Texto HOME al 741741", note: "Soporte vía mensaje" },
          ].map((r) => (
            <Card key={r.name} className="p-6 rounded-3xl border border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-lg mb-1">{r.name}</h3>
              <p className="text-2xl font-serif text-primary mb-2">{r.phone}</p>
              <p className="text-sm text-muted-foreground">{r.note}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="bg-secondary/40 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-4xl mb-5">Privado por diseño</h2>
          <p className="text-muted-foreground leading-relaxed text-lg mb-8">
            Tus emociones son tuyas. Puedes registrarte con un nombre cualquiera, mantenerte anónimo/a, y nadie verá tu diario salvo tú. Serena nace de la convicción de que entendernos mejor nos hace vivir mejor.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/auth">Crear mi espacio</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        <p>Serena — Hecho con <span className="text-primary">♥</span> para acompañarte.</p>
      </footer>
    </div>
  );
}
