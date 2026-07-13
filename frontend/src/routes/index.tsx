import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MOODS, useMood } from "@/lib/mood";
import {
  BookHeart,
  Sparkles,
  ShieldCheck,
  Phone,
  ArrowRight,
  Users,
  Music,
  HeartHandshake,
  TrendingUp,
  Compass,
  Mail,
  Instagram,
  Twitter,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emowave — Bienestar emocional con IA y comunidad" },
      {
        name: "description",
        content:
          "Comprende, gestiona y mejora tu bienestar emocional con IA, comunidad y acompañamiento psicológico.",
      },
      { property: "og:title", content: "Emowave — Plataforma de bienestar emocional" },
      {
        property: "og:description",
        content: "Entender tus emociones es el primer paso para sentirte mejor.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, authReady, setMood } = useMood();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authReady) return;
    if (user) {
      const dest = user.role === "psicologo" || user.role === "admin" ? "/psicologo" : "/app";
      navigate({ to: dest });
    }
  }, [authReady, user, navigate]);

  if (!authReady || user) return null;

  return (
    <div>
      <Navbar />

      {/* 1. INICIO */}
      <section
        id="inicio"
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 backdrop-blur text-xs text-foreground/80 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Tu espacio seguro
            </div>
            <h1 className="text-5xl md:text-6xl leading-[1.05] mb-6 font-serif">
              Entender tus emociones es el <em className="not-italic text-primary">primer paso</em>{" "}
              para sentirte mejor.
            </h1>
            <p className="text-lg text-foreground/70 mb-8 max-w-lg">
              Emowave combina inteligencia artificial empática, comunidad anónima y acompañamiento
              psicológico para ayudarte a cuidarte cada día.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/auth">
                  Crear mi cuenta <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-7 bg-background/60 backdrop-blur"
              >
                <Link to="/auth">Iniciar sesión</Link>
              </Button>
            </div>
          </div>

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
              Toca una emoción: la paleta cambia contigo 🌈
            </p>
          </Card>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-primary mb-3">¿Cómo funciona?</p>
          <h2 className="text-4xl md:text-5xl mb-4 font-serif">Cinco maneras de cuidarte</h2>
          <p className="text-muted-foreground">
            Una plataforma, todo lo que necesitas para tu bienestar emocional.
          </p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            {
              icon: BookHeart,
              title: "Registro emocional diario",
              text: "Anota cómo te sientes, su intensidad y qué influyó.",
            },
            {
              icon: Sparkles,
              title: "Diario con IA",
              text: "Conversa con una IA empática que te ayuda a entenderte.",
            },
            {
              icon: Users,
              title: "Comunidad de apoyo",
              text: "Comparte y escucha de forma anónima a personas como tú.",
            },
            {
              icon: HeartHandshake,
              title: "Psicólogos disponibles",
              text: "Apoyo profesional opcional, siempre respetando tu identidad.",
            },
            {
              icon: Compass,
              title: "Recomendaciones personales",
              text: "Música, películas y actividades según tus gustos.",
            },
          ].map((s) => (
            <Card
              key={s.title}
              className="p-6 rounded-3xl border border-border/60 hover:shadow-lg transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-accent text-accent-foreground grid place-items-center mb-4">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base mb-2 font-medium">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. BENEFICIOS */}
      <section id="beneficios" className="bg-secondary/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Beneficios</p>
            <h2 className="text-4xl md:text-5xl mb-4 font-serif">Lo que vas a ganar</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: BookHeart,
                title: "Conoce tus emociones",
                text: "Identifica patrones y entiende qué te pasa.",
              },
              {
                icon: TrendingUp,
                title: "Seguimiento de progreso",
                text: "Visualiza tu evolución semana a semana.",
              },
              {
                icon: HeartHandshake,
                title: "Apoyo emocional",
                text: "Comunidad, IA y psicólogos disponibles.",
              },
              {
                icon: Music,
                title: "Actividades que ayudan",
                text: "Sugerencias basadas en lo que disfrutas.",
              },
            ].map((b) => (
              <Card key={b.title} className="p-7 rounded-3xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
                  <b.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg mb-2 font-medium">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RECURSOS GRATUITOS */}
      <section id="recursos" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-primary mb-3">Recursos gratuitos</p>
          <h2 className="text-4xl md:text-5xl mb-4 font-serif">Nunca estás solo/a</h2>
          <p className="text-muted-foreground">
            Líneas de ayuda y centros de apoyo disponibles para ti.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: "Línea de la Vida (México)",
              phone: "800 290 0024",
              note: "24/7, gratuita y confidencial",
            },
            {
              name: "Teléfono de la Esperanza (España)",
              phone: "717 003 717",
              note: "Apoyo emocional 24h",
            },
            {
              name: "Crisis Text Line (Internacional)",
              phone: "Texto HOME al 741741",
              note: "Soporte vía mensaje",
            },
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
        <div className="text-center mt-8">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/recursos">Ver todos los recursos</Link>
          </Button>
        </div>
      </section>

      {/* 5. CONTACTO */}
      <section id="contacto" className="bg-secondary/40 py-24">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Contacto</p>
            <h2 className="text-4xl mb-5 font-serif">Hablemos</h2>
            <p className="text-muted-foreground mb-6">
              ¿Tienes una pregunta, una idea, o quieres colaborar? Escríbenos.
            </p>
            <div className="space-y-3 text-sm">
              <a
                className="flex items-center gap-3 hover:text-primary transition"
                href="mailto:hola@emowave.app"
              >
                <Mail className="w-4 h-4" /> hola@emowave.app
              </a>
              <a className="flex items-center gap-3 hover:text-primary transition" href="#">
                <Instagram className="w-4 h-4" /> @emowave.bienestar
              </a>
              <a className="flex items-center gap-3 hover:text-primary transition" href="#">
                <Twitter className="w-4 h-4" /> @emowaveapp
              </a>
            </div>
            <div className="mt-8">
              <h3 className="font-medium mb-3">Preguntas frecuentes</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger>¿Emowave reemplaza a un psicólogo?</AccordionTrigger>
                  <AccordionContent>
                    No. Emowave acompaña y complementa el trabajo profesional, pero no sustituye la
                    atención clínica.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>¿Puedo usarla totalmente anónima?</AccordionTrigger>
                  <AccordionContent>
                    Sí. Puedes registrarte con un alias o mantener tu identidad oculta en toda la
                    plataforma.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>¿Es gratis?</AccordionTrigger>
                  <AccordionContent>
                    El registro emocional, la comunidad y los recursos son gratuitos.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q4">
                  <AccordionTrigger>¿Quién ve mis datos?</AccordionTrigger>
                  <AccordionContent>
                    Solo tú, salvo que autorices explícitamente compartirlos con un profesional.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        <ShieldCheck className="w-5 h-5 inline mr-2 text-primary" />
        Emowave — Hecho con <span className="text-primary">♥</span> para acompañarte. Tus datos son
        tuyos.
      </footer>
    </div>
  );
}

function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", msg: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim() || !f.msg.trim())
      return toast.error("Completa todos los campos");
    toast.success("Gracias. Te responderemos pronto 💚");
    setF({ name: "", email: "", msg: "" });
  };
  return (
    <Card className="p-7 rounded-3xl">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="cn">Nombre</Label>
          <Input
            id="cn"
            value={f.name}
            maxLength={80}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ce">Correo</Label>
          <Input
            id="ce"
            type="email"
            value={f.email}
            maxLength={120}
            onChange={(e) => setF({ ...f, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="cm">Mensaje</Label>
          <Textarea
            id="cm"
            value={f.msg}
            maxLength={800}
            className="min-h-[120px]"
            onChange={(e) => setF({ ...f, msg: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg">
          <Send className="w-4 h-4 mr-2" /> Enviar mensaje
        </Button>
      </form>
    </Card>
  );
}
