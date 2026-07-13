import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMood, MOODS, SITUATIONS, type Mood } from "@/lib/mood";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
  BookHeart,
  Sparkles,
  Flame,
  TreePine,
  Trophy,
  BarChart2,
  HeartHandshake,
  MessageSquare,
  Send,
  Loader2,
  Wind,
  Music,
  Sprout,
  Play,
  Square,
  Volume2,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Mi diario — Emowave" }] }),
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

interface Quote {
  text: string;
  author: string;
  prompt: string;
}

const MOOD_QUOTES: Record<string, Quote[]> = {
  alegria: [
    { text: "La inteligencia emocional comienza con la autoconciencia de nuestros propios estados de ánimo.", author: "Daniel Goleman", prompt: "¿Qué sensación física notas más clara en tu cuerpo hoy?" },
    { text: "Ser feliz no es un estado de gracia, sino un estado de lucha.", author: "Mario Benedetti", prompt: "¿Por qué pequeña victoria o esfuerzo personal te felicitas hoy?" },
    { text: "La alegría de ver y entender es el más perfecto don de la naturaleza.", author: "Albert Einstein", prompt: "¿Qué detalle a tu alrededor te parece hermoso o interesante hoy?" },
    { text: "El secreto de la felicidad no es hacer lo que uno quiere, sino querer lo que uno hace.", author: "Jean-Paul Sartre", prompt: "¿Qué tarea o actividad de hoy has realizado con gusto real?" },
    { text: "La felicidad no es algo hecho. Proviene de tus propias acciones.", author: "Dalai Lama", prompt: "¿Qué pequeña acción positiva harás hoy por alguien más o por ti?" }
  ],
  energia: [
    { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs", prompt: "¿Qué aspecto de tu trabajo o proyecto de hoy te despierta mayor interés?" },
    { text: "Quien tiene un porqué para vivir puede soportar casi cualquier cómo.", author: "Viktor Frankl", prompt: "¿Cuál es tu motor o motivación principal en este momento de tu vida?" },
    { text: "No dejes que el miedo a perder sea mayor que el entusiasmo por ganar.", author: "Robert Kiyosaki", prompt: "¿Qué decisión tomarías hoy si tuvieses la certeza de que todo saldrá bien?" },
    { text: "La motivación es lo que te pone en marcha. El hábito es lo que hace que sigas.", author: "Jim Ryun", prompt: "¿Qué mini-hábito de bienestar decides repetir el día de hoy?" },
    { text: "No somos creados para la inactividad; el fuego interior nos empuja a actuar.", author: "Hermann Hesse", prompt: "¿A qué proyecto o idea canalizarás tu fuego interior hoy?" }
  ],
  calma: [
    { text: "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto y encontrarás tu fuerza.", author: "Marco Aurelio", prompt: "¿Qué situación externa decides aceptar y dejar de intentar controlar hoy?" },
    { text: "La tranquilidad es el puerto de la mente.", author: "Séneca", prompt: "¿Qué lugar o momento del día te genera mayor sensación de puerto seguro?" },
    { text: "La paz interior empieza en el instante en que decides no permitir que otra persona o evento controle tus emociones.", author: "Dalai Lama", prompt: "¿Qué límite saludable decides establecer hoy para resguardar tu paz?" },
    { text: "La claridad mental y el enfoque requieren silenciar el ruido externo y escuchar la respiración.", author: "Thich Nhat Hanh", prompt: "¿Qué parte de tu rutina te permite silenciar el ruido y centrarte?" },
    { text: "La paz no es la ausencia de conflicto, sino la presencia de la capacidad para hacerle frente.", author: "William James", prompt: "¿Qué recurso interno tienes que te ayuda a mantener la calma en el caos?" }
  ],
  ansiedad: [
    { text: "Al hombre se le puede arrebatar todo salvo una cosa: la última de las libertades humanas — elegir su propia actitud.", author: "Viktor Frankl", prompt: "¿Qué actitud amable y compasiva adoptas ante tus temores actuales?" },
    { text: "El hombre no está preocupado tanto por problemas reales como por sus ansiedades imaginadas.", author: "Epicteto", prompt: "De lo que te preocupa hoy, ¿qué parte es un hecho real y qué parte una suposición?" },
    { text: "La inteligencia emocional nos ayuda a gestionar el miedo y canalizarlo en acción consciente.", author: "Daniel Goleman", prompt: "¿Qué mensaje crees que está intentando darte tu miedo o alerta hoy?" },
    { text: "La preocupación es como una mecedora: te da algo que hacer, pero no te lleva a ninguna parte.", author: "Proverbio", prompt: "¿Qué acción concreta y pequeña puedes hacer hoy en vez de sobrepensarlo?" },
    { text: "No temas al futuro, porque el futuro no existe. Solo existe el presente, y es ahí donde se decide todo.", author: "Séneca", prompt: "Enfócate en tu entorno inmediato: ¿Qué hay a tu alrededor que te demuestre que estás a salvo?" }
  ],
  tristeza: [
    { text: "Cinco minutos bastan para soñar una vida entera, así de relativo es el tiempo.", author: "Mario Benedetti", prompt: "Si te regalaras cinco minutos para soñar o descansar hoy, ¿cómo los usarías?" },
    { text: "La curiosa paradoja es que cuando me acepto tal como soy, entonces puedo cambiar.", author: "Carl Rogers", prompt: "¿Qué parte de ti te resulta difícil aceptar hoy y cómo puedes ser tierno con ella?" },
    { text: "Incluso la noche más oscura terminará y el sol saldrá.", author: "Victor Hugo", prompt: "¿Qué pequeño rayo de luz o esperanza has vislumbrado en las últimas horas?" },
    { text: "Lo que no nos mata, nos hace más fuertes.", author: "Friedrich Nietzsche", prompt: "¿Qué fortaleza descubriste en ti a raíz de la última dificultad superada?" },
    { text: "Las lágrimas que no se lloran, ¿se quedan en los ojos?, ¿se convierten en lagunas pesadas?", author: "Julio Cortázar", prompt: "¿Cómo puedes darte permiso de expresar o liberar lo que sientes sin juzgarte?" }
  ]
};

interface MusicRecommendation {
  title: string;
  description: string;
}

const MOOD_MUSIC: Record<string, MusicRecommendation> = {
  alegria: {
    title: "Vibras Radiantes ☀️",
    description: "Playlist con ritmos acústicos e indie optimistas para sintonizar con tu alegría."
  },
  energia: {
    title: "Foco Eléctrico 🔥",
    description: "Sintetizadores vibrantes y beats rápidos de lofi-house para impulsar tus proyectos."
  },
  calma: {
    title: "Paz Acústica 🌿",
    description: "Melodías suaves y minimalistas de piano y guitarra para acompañar tu quietud."
  },
  ansiedad: {
    title: "Refugio Lofi 🌫️",
    description: "Bases lentas y frecuencias binaurales de calma para bajar las revoluciones."
  },
  tristeza: {
    title: "Nubes del Alma 🌧️",
    description: "Paisajes sonoros ambientales y lentos para sostener y transitar tu sentir."
  }
};

const PARENT_MOOD_DETAILS: Record<string, { bg: string; border: string; text: string; iconBg: string; label: string; emoji: string }> = {
  alegria: {
    bg: "from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10",
    border: "border-amber-500/20 dark:border-amber-500/30",
    text: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    label: "Optimismo & Alegría",
    emoji: "☀️",
  },
  energia: {
    bg: "from-orange-500/10 to-red-500/5 dark:from-orange-500/20 dark:to-red-500/10",
    border: "border-orange-500/20 dark:border-orange-500/30",
    text: "text-orange-700 dark:text-orange-300",
    iconBg: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    label: "Vitalidad & Fuego",
    emoji: "🔥",
  },
  calma: {
    bg: "from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    label: "Paz & Enfoque",
    emoji: "🌿",
  },
  ansiedad: {
    bg: "from-purple-500/10 to-indigo-500/5 dark:from-purple-500/20 dark:to-indigo-500/10",
    border: "border-purple-500/20 dark:border-purple-500/30",
    text: "text-purple-700 dark:text-purple-300",
    iconBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    label: "Calma & Conexión",
    emoji: "🌫️",
  },
  tristeza: {
    bg: "from-blue-500/10 to-cyan-500/5 dark:from-blue-500/20 dark:to-cyan-500/10",
    border: "border-blue-500/20 dark:border-blue-500/30",
    text: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    label: "Compasión & Cuidado",
    emoji: "🌧️",
  },
};

function AppPage() {
  const {
    user,
    entries,
    addEntry,
    mood,
    streak,
    treeLevel,
    activeSupportRequest,
    supportUnreadCount,
    requestSupport,
    sendSupportMessage,
    resolveSupportRequest,
    offlineMode,
  } = useMood();

  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<Mood>(mood);
  const [intensity, setIntensity] = useState(5);
  const [situations, setSituations] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [tip] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
  const [notif] = useState(() => NOTIFS[Math.floor(Math.random() * NOTIFS.length)]);
  
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [submittingEntry, setSubmittingEntry] = useState(false);

  // Sincronizar selectedMood con el mood global cuando este último cambie
  useEffect(() => {
    setSelectedMood(mood);
  }, [mood]);

  const handleMoodSelect = (newMood: Mood) => {
    setSelectedMood(newMood);
    setMood(newMood);
  };

  // Chispa mental del día logic
  const activeParentMood = useMemo(() => {
    const m = MOODS.find((x) => x.id === selectedMood);
    return m ? m.parentMood : "calma";
  }, [selectedMood]);

  const [quote, setQuote] = useState<Quote | null>(null);
  const quoteRef = useRef<Quote | null>(null);
  // Mantener registro de la última frase mostrada por cada categoría de emoción
  const lastQuotesRef = useRef<Record<string, string>>({});

  // Sincronizar el ref con el estado para evitar loops en el useEffect
  useEffect(() => {
    quoteRef.current = quote;
  }, [quote]);

  // Actualizar la frase cada vez que cambia la emoción seleccionada en el formulario
  useEffect(() => {
    const quotes = MOOD_QUOTES[activeParentMood] || MOOD_QUOTES.calma;
    if (quotes.length === 0) return;

    const lastQuoteTextForThisMood = lastQuotesRef.current[activeParentMood];
    let nextQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Garantizar que la frase cambie con respecto a la última vez que visitó esta categoría
    if (lastQuoteTextForThisMood && quotes.length > 1) {
      let attempts = 0;
      while (nextQuote.text === lastQuoteTextForThisMood && attempts < 10) {
        nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
        attempts++;
      }
    }
    setQuote(nextQuote);
    lastQuotesRef.current[activeParentMood] = nextQuote.text;
  }, [selectedMood, activeParentMood]);

  const handleNextQuote = () => {
    const quotes = MOOD_QUOTES[activeParentMood] || MOOD_QUOTES.calma;
    if (quotes.length <= 1 || !quote) return;
    let nextQuote = quote;
    while (nextQuote.text === quote.text) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      nextQuote = quotes[randomIndex];
    }
    setQuote(nextQuote);
    lastQuotesRef.current[activeParentMood] = nextQuote.text;
  };

  // Estados del Centro de Bienestar (Pestañas)
  const [activeTab, setActiveTab] = useState<"cita" | "respirar" | "musica" | "gratitud">("cita");

  // Estados de la Pausa de Respiración
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingTimer, setBreathingTimer] = useState(60);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "exhale">("inhale");

  // Estados de la Semilla de Gratitud
  const [gratitudeInput, setGratitudeInput] = useState("");
  const [gratitudeSaved, setGratitudeSaved] = useState<{ text: string; flower: string } | null>(null);

  // Cargar gratitud guardada hoy de localStorage
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`gratitude_${todayStr}`);
    if (saved) {
      try {
        setGratitudeSaved(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  // Efecto para el temporizador y ciclo de la respiración (4s inhalar, 4s exhalar)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            setIsBreathingActive(false);
            toast.success("¡Excelente pausa de respiración! 🧘");
            return 60;
          }
          // Alternar fase cada 4 segundos
          if ((prev - 1) % 4 === 0) {
            setBreathingPhase((phase) => (phase === "inhale" ? "exhale" : "inhale"));
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingTimer(60);
      setBreathingPhase("inhale");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive]);

  // Manejar el registro de la Semilla de Gratitud
  const handleGratitudeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitudeInput.trim()) return;

    const flowers = ["🌸", "🌻", "🪷", "🌷", "🌹", "🌼", "🌺"];
    const randomFlower = flowers[Math.floor(Math.random() * flowers.length)];
    const newGratitude = {
      text: gratitudeInput.trim(),
      flower: randomFlower,
    };

    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`gratitude_${todayStr}`, JSON.stringify(newGratitude));
    setGratitudeSaved(newGratitude);
    setGratitudeInput("");
    toast.success("¡Tu gratitud ha florecido hoy! 🌿");
  };

  // Manejar la acción de responder al prompt del diario
  const handlePromptReply = () => {
    if (!quote) return;
    setNote((prev) => {
      const promptText = `Reflexión sobre: "${quote.prompt}"\n-> `;
      if (prev.includes(promptText)) return prev;
      return prev ? `${prev}\n\n${promptText}` : promptText;
    });

    const formElement = document.getElementById("diary-form-title");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      const textarea = document.getElementById("diary-note");
      if (textarea) {
        textarea.focus();
        (textarea as HTMLTextAreaElement).setSelectionRange(
          (textarea as HTMLTextAreaElement).value.length,
          (textarea as HTMLTextAreaElement).value.length
        );
      }
    }, 500);
  };

  // Estados del modal de solicitud de soporte
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [supportMessageText, setSupportMessageText] = useState("");
  const [shareJournal, setShareJournal] = useState(false);
  const [consent, setConsent] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (isSupportOpen && activeSupportRequest?.messages) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isSupportOpen, activeSupportRequest?.messages]);

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEntry(true);
    try {
      await addEntry({
        date: new Date().toISOString().slice(0, 10),
        mood: selectedMood,
        intensity,
        situations,
        note: note.trim(),
      });
      setNote("");
      setSituations([]);
    } catch (_) {
      void _;
    } finally {
      setSubmittingEntry(false);
    }
  };

  const toggleSituation = (sitId: string) => {
    if (situations.includes(sitId)) {
      setSituations(situations.filter((x) => x !== sitId));
    } else {
      setSituations([...situations, sitId]);
    }
  };

  const handleRequestSubmit = async () => {
    if (!supportMessageText.trim() || !consent) return;
    setSubmittingRequest(true);
    try {
      await requestSupport(supportMessageText.trim(), shareJournal);
      setSupportMessageText("");
      setShareJournal(false);
      setConsent(false);
    } catch (_) {
      void _;
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupportRequest || !chatInput.trim()) return;
    const txt = chatInput.trim();
    setChatInput("");
    try {
      await sendSupportMessage(txt);
    } catch (_) {
      setChatInput(txt);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeSupportRequest) return;
    try {
      await resolveSupportRequest();
    } catch (_) {
      void _;
    }
  };

  // Recharts Data
  const [chartRange, setChartRange] = useState<7 | 30>(7);
  const chartData = useMemo(() => {
    const range = chartRange;
    const list = Array.from({ length: range }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (range - 1 - i));
      return d.toISOString().slice(0, 10);
    });

    return list.map((dateStr) => {
      const dayEntries = entries.filter((e: any) => e.date === dateStr);
      if (dayEntries.length === 0) {
        return { name: dateStr.slice(5), Intensidad: 0, label: "Sin registro", emoji: "💤", color: "#D1D5DB" };
      }
      const avgInt = dayEntries.reduce((sum: number, e: any) => sum + e.intensity, 0) / dayEntries.length;
      const lastEntry = dayEntries[0];
      const m = MOODS.find((x) => x.id === lastEntry.mood);

      const moodColor = 
        lastEntry.mood === "calma" ? "#58B0A5" :
        lastEntry.mood === "alegria" ? "#E06B56" :
        lastEntry.mood === "tristeza" ? "#5577FF" :
        lastEntry.mood === "ansiedad" ? "#8B5CF6" :
        lastEntry.mood === "energia" ? "#FFBB33" : "#58B0A5";

      return {
        name: dateStr.slice(5),
        Intensidad: avgInt,
        label: m ? m.label : "Neutral",
        emoji: m ? m.emoji : "🌿",
        color: moodColor,
      };
    });
  }, [entries, chartRange]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Cabecera */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6" aria-label="Sección de bienvenida">
          <div>
            <h1 className="text-3xl font-serif">
              {user.visibility === "anonimo" ? "Bienvenido, Anónimo" : `Hola, ${user.alias || user.username}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{notif}</p>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 max-w-md text-xs">
            <span className="text-xl" role="img" aria-label="Consejo">💡</span>
            <p className="text-foreground/80 leading-relaxed">{tip}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario y Estadísticas */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-premium">
              <h2 className="text-2xl font-serif mb-6 flex items-center gap-2" id="diary-form-title">
                <BookHeart className="w-6 h-6 text-primary" /> ¿Cómo te sientes ahora?
              </h2>

              <form onSubmit={handleEntrySubmit} className="space-y-6" aria-labelledby="diary-form-title">
                <div>
                  <Label className="mb-3 block font-medium">1. Elige tu emoción predominante</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto p-1 border border-border/60 rounded-2xl bg-secondary/20">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleMoodSelect(m.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all hover:scale-102 ${
                          selectedMood === m.id
                            ? "border-primary bg-primary/10 text-primary-foreground font-semibold"
                            : "border-border/40 hover:bg-secondary"
                        }`}
                        aria-label={`Seleccionar emoción ${m.label}`}
                      >
                        <span className="text-2xl mb-1.5" role="img" aria-hidden="true">{m.emoji}</span>
                        <span className="text-xs text-foreground">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="intensity-slider" className="font-medium">2. Nivel de intensidad</Label>
                    <span className="text-sm font-semibold text-primary">{intensity} / 10</span>
                  </div>
                  <Slider
                    id="intensity-slider"
                    value={[intensity]}
                    onValueChange={(val) => setIntensity(val[0])}
                    max={10}
                    min={1}
                    step={1}
                  />
                </div>

                <div>
                  <Label className="mb-2 block font-medium">3. ¿Qué influye en tu estado hoy?</Label>
                  <div className="flex flex-wrap gap-2">
                    {SITUATIONS.map((s) => (
                      <label
                        key={s}
                        className={`flex items-center space-x-2 px-3.5 py-2 rounded-full border transition-all cursor-pointer text-xs ${
                          situations.includes(s)
                            ? "border-primary bg-primary/10 text-foreground font-medium"
                            : "border-border hover:bg-secondary"
                        }`}
                      >
                        <Checkbox
                          checked={situations.includes(s)}
                          onCheckedChange={() => toggleSituation(s)}
                          className="hidden"
                        />
                        <span>🌿</span>
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="diary-note" className="font-medium">4. Reflexión o detalles (opcional)</Label>
                  <Textarea
                    id="diary-note"
                    maxLength={1000}
                    placeholder="¿Qué pasa por tu mente? Expresarlo ayuda a calmarlo..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[100px] rounded-2xl border-border/80 focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full py-6 font-medium text-base shadow-lg hover:shadow-xl transition-all btn-premium"
                  disabled={submittingEntry}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {submittingEntry ? "Registrando…" : "Guardar en mi diario"}
                </Button>
              </form>
            </Card>

            {/* Estadísticas */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="card-premium flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                    <Flame className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold block">{streak} {streak === 1 ? "día" : "días"}</span>
                    <span className="text-xs text-muted-foreground">Racha de bienestar</span>
                  </div>
                </Card>

                <Card className="card-premium flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <TreePine className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold block">Nivel {treeLevel}</span>
                    <span className="text-xs text-muted-foreground">Tu árbol de calma</span>
                  </div>
                </Card>

                <Card className="card-premium flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold block">{entries.length}</span>
                    <span className="text-xs text-muted-foreground">Registros guardados</span>
                  </div>
                </Card>
              </div>

              <Card className="card-premium">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-serif flex items-center gap-1.5" id="stats-chart-title">
                      <BarChart2 className="w-5 h-5 text-primary" /> Historial de intensidad emocional
                    </h3>
                  </div>

                  <div className="flex rounded-full bg-secondary/50 p-1 border border-border">
                    <button
                      onClick={() => setChartRange(7)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        chartRange === 7 ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      7 días
                    </button>
                    <button
                      onClick={() => setChartRange(30)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        chartRange === 30 ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      30 días
                    </button>
                  </div>
                </div>

                <div className="h-[250px] w-full" role="region" aria-labelledby="stats-chart-title">
                  {entries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                      <p>No hay suficientes datos registrados todavía.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 10]} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-card/95 border border-border p-3.5 rounded-2xl shadow-xl text-xs backdrop-blur-md">
                                  <p className="font-bold text-foreground">{data.name}</p>
                                  <p className="text-primary mt-1 font-semibold">Intensidad: <span className="font-bold">{data.Intensidad} / 10</span></p>
                                  <p className="text-muted-foreground mt-0.5">Emoción: {data.emoji} {data.label}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="Intensidad" radius={[6, 6, 0, 0]} barSize={chartRange === 7 ? 24 : 8}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Columna Derecha: Soporte y Comunidad */}
          <div className="space-y-6">
            {/* Tarjeta: Chispa Mental del Día / Centro de Bienestar */}
            {(() => {
              const details = PARENT_MOOD_DETAILS[activeParentMood] || PARENT_MOOD_DETAILS.calma;
              return (
                <Card className={`card-premium bg-gradient-to-br ${details.bg} border border-border/80 transition-all duration-500 overflow-hidden relative group`}>
                  {/* Decorative background blur blob */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 blur-xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                  
                  <div>
                    {/* Header: Title and details */}
                    <div className="flex items-center space-x-2 mb-3.5">
                      <div className={`w-8 h-8 rounded-lg ${details.iconBg} flex items-center justify-center font-semibold text-lg transition-transform duration-300 group-hover:scale-105 shrink-0`}>
                        {details.emoji}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground leading-tight">Espacio Calma</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mt-0.5">
                          Sintonía: {details.label}
                        </span>
                      </div>
                    </div>

                    {/* Wellness navigation tabs */}
                    <div className="flex items-center space-x-1.5 p-1 bg-secondary/30 rounded-xl border border-border/40 mb-4 justify-between">
                      <button
                        onClick={() => setActiveTab("cita")}
                        className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${
                          activeTab === "cita"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Reflexión de autor"
                      >
                        <BookHeart className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cita</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab("respirar")}
                        className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${
                          activeTab === "respirar"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Pausa de respiración"
                      >
                        <Wind className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Respirar</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("musica")}
                        className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${
                          activeTab === "musica"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Música ambiental"
                      >
                        <Music className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Música</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("gratitud")}
                        className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${
                          activeTab === "gratitud"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Semilla de gratitud"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Gratitud</span>
                      </button>
                    </div>

                    {/* Tab contents */}
                    {activeTab === "cita" && (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Chispa mental del día
                          </span>
                          <button
                            onClick={handleNextQuote}
                            className="p-1 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
                            title="Cambiar perspectiva"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="min-h-[80px] flex flex-col justify-center bg-secondary/10 p-3 rounded-2xl border border-border/10">
                          <p
                            key={quote?.text}
                            className="text-xs md:text-sm font-serif italic text-foreground/90 leading-relaxed animate-fade-in"
                          >
                            “{quote?.text}”
                          </p>
                          {quote?.author && (
                            <p className="text-right text-[10px] text-muted-foreground mt-2 font-medium tracking-wide animate-fade-in">
                              — {quote.author}
                            </p>
                          )}
                        </div>

                        {quote?.prompt && (
                          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 text-[11px] leading-relaxed">
                            <span className="font-semibold text-primary block mb-0.5">💡 Introspección:</span>
                            <p className="text-muted-foreground">{quote.prompt}</p>
                            <button
                              onClick={handlePromptReply}
                              className="mt-2 inline-flex items-center text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                            >
                              <BookHeart className="w-3 h-3 mr-1" /> Responder en mi diario
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "respirar" && (
                      <div className="flex flex-col items-center py-1 space-y-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center block">
                          Pausa de Respiración Consciente
                        </span>

                        <div className="h-[120px] flex items-center justify-center relative w-full">
                          {isBreathingActive ? (
                            <div className="flex flex-col items-center space-y-3">
                              {/* Breathing circle indicator */}
                              <div
                                className={`w-16 h-16 rounded-full ${details.iconBg} border border-primary/20 flex items-center justify-center font-bold text-xs uppercase tracking-wide transition-all duration-[4000ms] ease-in-out ${
                                  breathingPhase === "inhale" ? "scale-130 shadow-[0_0_25px_rgba(var(--primary),0.3)] bg-primary/20" : "scale-100 bg-primary/10"
                                }`}
                              >
                                {breathingPhase === "inhale" ? "Inhala" : "Exhala"}
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground">
                                Conteo regresivo: <span className="font-bold text-foreground">{breathingTimer}s</span>
                              </span>
                            </div>
                          ) : (
                            <div className="text-center max-w-xs space-y-2 p-2">
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Regálate 1 minuto de respiración consciente (inhalación y exhalación en ciclos de 4 segundos) para centrar tu mente.
                              </p>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => setIsBreathingActive(!isBreathingActive)}
                          className="w-full rounded-full text-xs py-1.5 cursor-pointer"
                          variant={isBreathingActive ? "destructive" : "default"}
                        >
                          {isBreathingActive ? (
                            <>
                              <Square className="w-3 h-3 mr-1.5 fill-current" /> Detener ejercicio
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1.5 fill-current" /> Iniciar ejercicio (60s)
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {activeTab === "musica" && (() => {
                      const rec = MOOD_MUSIC[activeParentMood] || MOOD_MUSIC.calma;
                      return (
                        <div className="space-y-4">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                            Tu sintonía sonora recomendada
                          </span>

                          <div className="bg-secondary/20 p-3.5 rounded-2xl border border-border/30 flex items-start space-x-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                              <Volume2 className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-foreground">{rec.title}</h4>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {rec.description}
                              </p>
                            </div>
                          </div>

                          <Link
                            to="/spotify"
                            className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2 w-full transition-all text-center"
                          >
                            <Music className="w-3.5 h-3.5 mr-1.5" /> Abrir reproductor
                          </Link>
                        </div>
                      );
                    })()}

                    {activeTab === "gratitud" && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Siembra una semilla de gratitud
                        </span>

                        {gratitudeSaved ? (
                          <div className="flex flex-col items-center text-center p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            {/* Animated flower */}
                            <div className="text-4xl mb-2 animate-bloom select-none" role="img" aria-label="Flor de gratitud">
                              {gratitudeSaved.flower}
                            </div>
                            <div className="space-y-1 max-w-xs">
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                                Tu gratitud ha florecido hoy:
                              </span>
                              <p className="text-xs italic text-foreground font-medium font-serif leading-relaxed">
                                “Hoy agradezco {gratitudeSaved.text}”
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const todayStr = new Date().toISOString().slice(0, 10);
                                localStorage.removeItem(`gratitude_${todayStr}`);
                                setGratitudeSaved(null);
                              }}
                              className="mt-3.5 text-[10px] text-muted-foreground hover:text-foreground hover:underline transition-all cursor-pointer"
                            >
                              Sembrar otro agradecimiento
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleGratitudeSubmit} className="space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="gratitude-input" className="text-[11px] text-muted-foreground">
                                Escribe algo, por más pequeño que sea, por lo que estés agradecido hoy:
                              </Label>
                              <Input
                                id="gratitude-input"
                                type="text"
                                placeholder="Ej: el café de la mañana, un mensaje..."
                                value={gratitudeInput}
                                onChange={(e) => setGratitudeInput(e.target.value)}
                                className="rounded-xl text-xs h-9 bg-card focus:border-emerald-500"
                                maxLength={80}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full rounded-full text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow cursor-pointer">
                              <Sprout className="w-3.5 h-3.5 mr-1.5" /> Sembrar Agradecimiento
                            </Button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })()}

            {/* Tarjeta: Apoyo profesional */}
            <Card className="card-premium flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  {supportUnreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                      {supportUnreadCount} {supportUnreadCount === 1 ? "nuevo" : "nuevos"}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-1">Apoyo profesional</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  ¿Te sientes abrumado/a? Puedes iniciar un chat confidencial y gratuito con un psicólogo del equipo.
                </p>
              </div>

              <div>
                {activeSupportRequest ? (
                  <Button className="w-full rounded-full" variant="outline" onClick={() => setIsSupportOpen(true)}>
                    <MessageSquare className="w-4 h-4 mr-2" /> Chat activo con psicólogo
                  </Button>
                ) : (
                  <Button className="w-full rounded-full" onClick={() => setIsSupportOpen(true)}>
                    <HeartHandshake className="w-4 h-4 mr-2" /> Solicitar apoyo
                  </Button>
                )}
              </div>
            </Card>

            <Card className="card-premium flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-2.5 block" role="img" aria-hidden="true">🤝</span>
                <h3 className="text-lg font-semibold mb-1">Comunidad Emowave</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Comparte lo que sientes de forma 105% segura y anónima. Encuentra apoyo en personas que te comprenden sin juzgarte.
                </p>
              </div>
              <Link
                to="/comunidad"
                className="inline-flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold py-2.5 text-center transition-all w-full"
              >
                Visitar la comunidad
              </Link>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal Dialog de Soporte integrado */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="max-w-md md:max-w-lg rounded-3xl p-6 border-0 shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-primary" /> Apoyo Psicológico Profesional
            </DialogTitle>
          </DialogHeader>

          {!activeSupportRequest && (
            <div className="space-y-4 my-2">
              <p className="text-xs text-muted-foreground">
                Describe brevemente tu situación actual para que un psicólogo pueda entender cómo apoyarte. Tu solicitud es confidencial y segura.
              </p>

              <div className="space-y-1">
                <Label htmlFor="support-req-msg" className="text-xs font-semibold">¿Qué estás experimentando?</Label>
                <Textarea
                  id="support-req-msg"
                  placeholder="Ej: Siento mucha ansiedad por el trabajo..."
                  value={supportMessageText}
                  onChange={(e) => setSupportMessageText(e.target.value)}
                  className="min-h-[100px] rounded-xl text-sm"
                  maxLength={1000}
                />
              </div>

              <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-secondary/50 cursor-pointer text-xs">
                <Checkbox
                  id="share-diary-check"
                  checked={shareJournal}
                  onCheckedChange={(val) => setShareJournal(!!val)}
                  className="mt-0.5"
                />
                <span className="flex-1">
                  <strong>Compartir mis últimos registros del diario</strong>
                  <p className="text-[11px] text-muted-foreground/90 mt-0.5">Permite al psicólogo ver tus estados emocionales.</p>
                </span>
              </label>

              <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-secondary/50 cursor-pointer text-xs">
                <Checkbox
                  id="consent-check"
                  checked={consent}
                  onCheckedChange={(val) => setConsent(!!val)}
                  className="mt-0.5"
                />
                <span className="flex-1">
                  <strong>Acepto la política de confidencialidad y tratamiento de datos</strong>
                </span>
              </label>

              <DialogFooter className="mt-4">
                <Button
                  onClick={handleRequestSubmit}
                  className="w-full rounded-full"
                  disabled={submittingRequest || !supportMessageText.trim() || !consent}
                >
                  {submittingRequest ? "Enviando..." : "Enviar solicitud de apoyo"}
                </Button>
              </DialogFooter>
            </div>
          )}

          {activeSupportRequest && (
            <div className="flex flex-col h-[400px]">
              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-xl mb-3 text-xs">
                <div>
                  <span className="font-semibold block">Estado: Conectado/a con Psicólogo</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 text-xs px-2.5 py-1 rounded-full"
                  onClick={handleCloseTicket}
                >
                  Cerrar consulta
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3.5 text-xs text-foreground/90 leading-relaxed mb-4">
                  <span className="font-semibold block mb-0.5">Tu mensaje inicial:</span>
                  {activeSupportRequest.request.message}
                </div>

                {activeSupportRequest.messages?.map((m: any) => {
                  const isMe = m.sender_id === user.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-secondary text-foreground rounded-tl-none border border-border"
                        }`}
                      >
                        {!isMe && <span className="font-bold block text-[10px] text-primary/80 mb-0.5">Psicólogo</span>}
                        <p>{m.message}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChat} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                />
                <Button type="submit" size="icon" className="rounded-full h-9 w-9 shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
