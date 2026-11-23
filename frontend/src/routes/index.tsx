import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MOODS, getParentMood, useMood, type ParentMood } from "@/lib/mood";
import { ArrowRight, Check, Lock, Phone, Mail, EyeOff, UserRound, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

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

// Las cinco paletas de la app, con el color primario de cada una (styles.css)
const PALETTES: { id: ParentMood; label: string; color: string }[] = [
  { id: "calma", label: "Calma", color: "oklch(0.48 0.11 180)" },
  { id: "alegria", label: "Alegría", color: "oklch(0.68 0.16 65)" },
  { id: "tristeza", label: "Tristeza", color: "oklch(0.48 0.12 245)" },
  { id: "ansiedad", label: "Ansiedad", color: "oklch(0.52 0.13 300)" },
  { id: "energia", label: "Energía", color: "oklch(0.56 0.16 28)" },
];

const STEPS = [
  {
    title: "Registra cómo te sientes",
    text: "Elige una emoción, su intensidad y qué influyó. Toma menos de un minuto y construye tu historial día a día.",
  },
  {
    title: "Reflexiona con el diario con IA",
    text: "Escribe sin filtros. El asistente te escucha, te ayuda a poner en palabras lo que sientes y nunca te juzga.",
  },
  {
    title: "Pide apoyo cuando lo necesites",
    text: "Habla con la comunidad de forma anónima o abre un chat confidencial con un psicólogo del equipo.",
  },
];

const FEATURES = [
  [
    "Historial emocional",
    "Gráficas semanales y mensuales para ver patrones que a simple vista se escapan.",
  ],
  [
    "Indicador de ansiedad",
    "Una estimación basada en tus registros que te avisa cuándo conviene pedir ayuda.",
  ],
  [
    "Comunidad moderada",
    "Publica y responde de forma anónima. Los mensajes ofensivos se revisan antes de salir.",
  ],
  [
    "Psicólogos reales",
    "Solicita acompañamiento profesional sin revelar tu identidad si no quieres.",
  ],
  [
    "Ejercicios guiados",
    "Respiración, atención plena y gratitud para los momentos en que todo pesa.",
  ],
  ["Música para tu estado", "Playlists de Spotify elegidas según la emoción que estás viviendo."],
] as const;

const CRISIS_LINES = [
  { name: "Línea 192, opción 4", region: "Colombia · Salud mental", phone: "192", tel: "192" },
  { name: "Línea 106", region: "Bogotá · Escucha y orientación", phone: "106", tel: "106" },
  {
    name: "Línea de la Vida",
    region: "México · 24 horas",
    phone: "800 911 2000",
    tel: "8009112000",
  },
  {
    name: "Línea 024",
    region: "España · Atención a la conducta suicida",
    phone: "024",
    tel: "024",
  },
];

const FAQ = [
  [
    "¿Emowave reemplaza a un psicólogo?",
    "No. Emowave acompaña y complementa el trabajo profesional, pero no sustituye la atención clínica. Si estás en crisis, llama a una de las líneas de ayuda.",
  ],
  [
    "¿Puedo usarla de forma anónima?",
    "Sí. Puedes registrarte con un alias o mantener tu identidad oculta en la comunidad y en las solicitudes de apoyo.",
  ],
  [
    "¿Tiene costo?",
    "No. El registro emocional, el diario, la comunidad y los recursos son gratuitos.",
  ],
  [
    "¿Quién ve mis datos?",
    "Tu diario es privado. Un psicólogo solo ve información de tu caso cuando tú solicitas apoyo y él lo toma.",
  ],
] as const;

function Landing() {
  const { user, authReady, mood, setMood } = useMood();
  const navigate = useNavigate();
  const activePalette = getParentMood(mood);

  useEffect(() => {
    if (!authReady) return;
    if (user) {
      const dest = user.role === "psicologo" || user.role === "admin" ? "/psicologo" : "/app";
      navigate({ to: dest });
    }
  }, [authReady, user, navigate]);

  if (!authReady || user) return null;

  const choosePalette = (palette: ParentMood) => {
    const emotion = MOODS.find((m) => m.parentMood === palette);
    if (emotion) setMood(emotion.id);
  };

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section id="inicio" className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(50rem 28rem at 85% 0%, oklch(from var(--primary) l c h / 0.12), transparent 70%), radial-gradient(40rem 24rem at 0% 100%, oklch(from var(--accent) l c h / 0.35), transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
          <div>
            <p className="eyebrow mb-5">Bienestar emocional para estudiantes</p>
            <h1 className="text-[2.6rem] sm:text-6xl leading-[1.04] mb-6">
              Entender lo que sientes es el primer paso para sentirte mejor.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Emowave reúne un diario emocional, un asistente con IA que escucha sin juzgar, una
              comunidad anónima y psicólogos del equipo, en un solo lugar privado.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Button asChild size="lg">
                <Link to="/auth" search={{ action: "register" }}>
                  Crear mi cuenta gratis <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth" search={{ action: "login" }}>
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Gratis", "Anónimo si lo prefieres", "Sin publicidad"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <ProductPreview />
        </div>
      </section>

      {/* Paleta */}
      <section className="border-b border-border/60 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
          <div className="md:max-w-xs">
            <p className="font-medium">La app se adapta a cómo te sientes</p>
            <p className="text-sm text-muted-foreground">
              Prueba una paleta: cambia todos los colores.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Paleta de colores">
            {PALETTES.map((p) => {
              const active = activePalette === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => choosePalette(p.id)}
                  className={`flex items-center gap-2 h-10 pl-2 pr-4 rounded-full border text-sm transition-colors cursor-pointer ${
                    active
                      ? "border-foreground/25 bg-card font-medium shadow-xs"
                      : "border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
          <div className="lg:sticky lg:top-28 self-start">
            <p className="eyebrow mb-4">Cómo funciona</p>
            <h2 className="text-4xl md:text-5xl leading-[1.08] mb-5">
              Un hábito pequeño que cambia cómo te entiendes.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              No hace falta escribir mucho ni saber exactamente qué te pasa. Basta con volver cada
              día.
            </p>
          </div>
          <ol className="border-t border-border">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="grid grid-cols-[3rem_1fr] gap-4 py-8 border-b border-border"
              >
                <span className="font-serif text-2xl text-primary tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-2xl mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-lg">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Funciones */}
      <section id="beneficios" className="bg-secondary/50 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl mb-14">
            <p className="eyebrow mb-4">Todo en un lugar</p>
            <h2 className="text-4xl md:text-5xl leading-[1.08]">
              Herramientas pensadas para los días buenos y para los difíciles.
            </h2>
          </div>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {FEATURES.map(([title, text]) => (
              <div key={title} className="bg-card p-7">
                <dt className="font-medium mb-2">{title}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Privacidad */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 md:p-16 grid lg:grid-cols-[1.2fr_1fr] gap-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] uppercase opacity-75 mb-4">
              Privacidad
            </p>
            <h2 className="text-4xl md:text-5xl leading-[1.08] mb-5">
              Lo que escribes aquí es tuyo.
            </h2>
            <p className="opacity-85 leading-relaxed max-w-md">
              Diseñamos Emowave para que puedas ser honesto contigo sin miedo a que alguien más lo
              lea.
            </p>
          </div>
          <ul className="space-y-6">
            {[
              [Lock, "Diario privado", "Tus registros y conversaciones solo los ves tú."],
              [
                EyeOff,
                "Anonimato real",
                "En la comunidad decides si apareces con tu nombre, un alias o como anónimo.",
              ],
              [
                UserRound,
                "Apoyo con consentimiento",
                "Un psicólogo solo accede a tu caso cuando tú pides ayuda.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Lock;
              return (
                <li key={title as string} className="flex gap-4">
                  <span className="w-10 h-10 rounded-xl bg-primary-foreground/12 grid place-items-center shrink-0">
                    <I className="w-[18px] h-[18px]" />
                  </span>
                  <div>
                    <p className="font-medium">{title as string}</p>
                    <p className="text-sm opacity-80 leading-relaxed">{text as string}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Líneas de ayuda */}
      <section id="recursos" className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-xl">
              <p className="eyebrow mb-4">Si lo necesitas ahora</p>
              <h2 className="text-4xl leading-[1.1] mb-3">No tienes que pasar por esto solo.</h2>
              <p className="text-muted-foreground">
                Líneas gratuitas y confidenciales. Ante un peligro inmediato, llama al 123 en
                Colombia.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/recursos">
                Ver todos los recursos <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CRISIS_LINES.map((line) => (
              <a
                key={line.name}
                href={`tel:${line.tel}`}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
              >
                <Phone className="w-4 h-4 text-primary mb-6" />
                <p className="font-serif text-3xl tabular mb-1 group-hover:text-primary transition-colors">
                  {line.phone}
                </p>
                <p className="font-medium text-sm">{line.name}</p>
                <p className="text-sm text-muted-foreground">{line.region}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes y contacto */}
      <section id="contacto" className="bg-secondary/50 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24 grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20">
          <div>
            <p className="eyebrow mb-4">Preguntas frecuentes</p>
            <h2 className="text-4xl leading-[1.1] mb-5">¿Tienes dudas?</h2>
            <p className="text-muted-foreground mb-6">
              Si no encuentras tu respuesta, escríbenos y te contestamos.
            </p>
            <Button asChild variant="outline">
              <a href="mailto:hola@emowave.app">
                <Mail className="w-4 h-4" /> hola@emowave.app
              </a>
            </Button>
          </div>
          <Accordion type="single" collapsible className="w-full border-t border-border">
            {FAQ.map(([q, a], i) => (
              <AccordionItem key={q} value={`q${i}`} className="border-border">
                <AccordionTrigger className="text-base text-left py-5 hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Llamado final */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24 text-center">
        <h2 className="text-4xl md:text-5xl leading-[1.08] mb-5 max-w-2xl mx-auto">
          Empieza hoy con un solo registro.
        </h2>
        <p className="text-muted-foreground mb-8">Crear tu cuenta toma menos de un minuto.</p>
        <Button asChild size="lg">
          <Link to="/auth" search={{ action: "register" }}>
            Crear mi cuenta gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row gap-6 md:items-center justify-between text-sm text-muted-foreground">
          <div className="flex flex-col gap-2">
            <Logo className="text-foreground" />
            <p>Acompañamiento emocional. No reemplaza la atención clínica.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Pie de página">
            <Link to="/recursos" className="hover:text-foreground transition-colors">
              Recursos
            </Link>
            <Link to="/contacto" className="hover:text-foreground transition-colors">
              Contacto
            </Link>
            <Link
              to="/auth"
              search={{ action: "login" }}
              className="hover:text-foreground transition-colors"
            >
              Iniciar sesión
            </Link>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> Tus datos son tuyos
            </span>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** Vista previa estática del producto: un registro del día, la semana y el diario con IA. */
function ProductPreview() {
  const week = [
    { d: "L", v: 40 },
    { d: "M", v: 55 },
    { d: "M", v: 35 },
    { d: "J", v: 62 },
    { d: "V", v: 70 },
    { d: "S", v: 58 },
    { d: "D", v: 76 },
  ];
  return (
    <div className="relative" aria-hidden="true">
      <div className="rounded-2xl border border-border bg-card shadow-[0_24px_60px_-24px_oklch(0_0_0/0.18)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <span className="text-sm font-medium">Hoy</span>
          <span className="text-xs text-muted-foreground tabular">Racha de 6 días</span>
        </div>
        <div className="p-5 pb-20 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-secondary grid place-items-center text-xl">
              🌿
            </span>
            <div className="flex-1">
              <p className="font-medium leading-tight">Calma</p>
              <p className="text-xs text-muted-foreground">Estudios · Descanso</p>
            </div>
            <span className="text-sm tabular text-muted-foreground">7/10</span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Tu semana</span>
              <span>Intensidad positiva</span>
            </div>
            <div className="flex gap-2">
              {week.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="h-24 w-full flex items-end">
                    <div
                      className={`w-full rounded-md ${i === week.length - 1 ? "bg-primary" : "bg-primary/25"}`}
                      style={{ height: `${b.v}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{b.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-10 -left-3 sm:-left-10 w-[85%] sm:w-[75%] rounded-2xl border border-border bg-card p-4 shadow-[0_20px_50px_-20px_oklch(0_0_0/0.2)]">
        <p className="text-xs text-muted-foreground mb-2">Diario con IA</p>
        <p className="text-sm leading-relaxed">
          «Qué frustrante es querer avanzar y que la cabeza no acompañe. ¿Hay algo rondándote
          mientras intentas concentrarte?»
        </p>
      </div>
    </div>
  );
}
