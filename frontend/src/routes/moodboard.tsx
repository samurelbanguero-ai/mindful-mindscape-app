import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMood } from "@/lib/mood";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Palette, Plus, Trash2, Edit3, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/moodboard")({
  head: () => ({ meta: [{ title: "Mi Moodboard — Emowave" }] }),
  component: MoodboardView,
});

type BoardNote = {
  id: string;
  text: string;
  color: string;
  font: "serif" | "sans" | "mono" | "cursive";
  sticker: string;
  x: number; // percentage
  y: number; // percentage
};

const STICKERS = [
  "🌸",
  "🌿",
  "⭐",
  "🩹",
  "☁️",
  "☀️",
  "❄️",
  "🕯️",
  "🎈",
  "🐱",
  "🦁",
  "🐢",
  "🐳",
  "🍕",
  "☕",
  "🏡",
  "🌈",
  "🌻",
  "💎",
  "💤",
];
const COLORS = [
  { name: "Coral Suave", hex: "#fee2e2" },
  { name: "Ámbar Cálido", hex: "#fef3c7" },
  { name: "Menta Fresca", hex: "#dcfce7" },
  { name: "Celeste Paz", hex: "#dbeafe" },
  { name: "Lavanda Dulce", hex: "#f3e8ff" },
  { name: "Amarillo Sol", hex: "#fcf6bd" },
  { name: "Gris Azulado", hex: "#d6e2e9" },
];
const FONTS = [
  { label: "Serif", id: "serif" as const, css: "font-serif" },
  { label: "Sans", id: "sans" as const, css: "font-sans" },
  { label: "Monospace", id: "mono" as const, css: "font-mono" },
  { label: "Manuscrita", id: "cursive" as const, css: "font-cursive" },
];

function MoodboardView() {
  const { user } = useMood();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<BoardNote[]>([]);
  const [text, setText] = useState("");
  const [color, setColor] = useState(COLORS[0].hex);
  const [font, setFont] = useState<BoardNote["font"]>("sans");
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const saved = localStorage.getItem("emowave_moodboard_" + user.username);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        void e;
      }
    }
  }, [user, navigate]);

  const saveNotes = (next: BoardNote[]) => {
    setNotes(next);
    if (user) {
      localStorage.setItem("emowave_moodboard_" + user.username, JSON.stringify(next));
    }
  };

  const handleAddOrEdit = () => {
    if (!text.trim()) return toast.error("Escribe un mensaje para tu nota");

    if (editId) {
      const next = notes.map((n) =>
        n.id === editId ? { ...n, text: text.trim(), color, font, sticker } : n,
      );
      saveNotes(next);
      setEditId(null);
      toast.success("Nota actualizada 🌿");
    } else {
      // random positioning coordinates within the board
      const rx = 10 + Math.random() * 60;
      const ry = 10 + Math.random() * 60;
      const newNote: BoardNote = {
        id: "note_" + Math.random().toString(36).slice(2, 9),
        text: text.trim(),
        color,
        font,
        sticker,
        x: rx,
        y: ry,
      };
      saveNotes([...notes, newNote]);
      toast.success("Nota añadida al tablero ✨");
    }

    setText("");
    setSticker(STICKERS[0]);
  };

  const startEdit = (n: BoardNote) => {
    setEditId(n.id);
    setText(n.text);
    setColor(n.color);
    setFont(n.font);
    setSticker(n.sticker);
  };

  const deleteNote = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    saveNotes(next);
    if (editId === id) {
      setEditId(null);
      setText("");
    }
    toast.info("Nota eliminada");
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Tu rincón personal</p>
          <h1 className="text-4xl font-serif mt-1 flex items-center gap-2">
            <Palette className="w-7 h-7 text-primary" /> Mi Tablero Decorativo
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Expresa tus pensamientos visualmente de forma privada. Crea notas coloridas, adórnalas
            con stickers y colócalas en tu tablero.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Note Creator Form */}
          <Card className="p-6 rounded-3xl space-y-5">
            <h2 className="text-lg font-serif">{editId ? "Editar Nota" : "Nueva Nota Visual"}</h2>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Mensaje o pensamiento
              </label>
              <Textarea
                placeholder="Escribe lo que sientes o un recordatorio positivo..."
                value={text}
                maxLength={255}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[100px] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Color de fondo</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full border-2 transition ${color === c.hex ? "border-primary scale-110 shadow-sm" : "border-transparent hover:scale-105"}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Tipografía</label>
              <div className="grid grid-cols-4 gap-2">
                {FONTS.map((f) => (
                  <Button
                    key={f.id}
                    type="button"
                    variant={font === f.id ? "default" : "outline"}
                    size="sm"
                    className="text-xs rounded-xl"
                    onClick={() => setFont(f.id)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Sticker decorativo
              </label>
              <div className="flex flex-wrap gap-2 max-h-[85px] overflow-y-auto p-1 border border-border rounded-xl">
                {STICKERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSticker(s)}
                    className={`text-xl p-1.5 rounded-lg transition hover:bg-secondary ${sticker === s ? "bg-primary/20 scale-110" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {editId && (
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setEditId(null);
                    setText("");
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button className="flex-1 rounded-full" onClick={handleAddOrEdit}>
                {editId ? "Guardar" : "Crear nota"}
              </Button>
            </div>
          </Card>

          {/* Decorable Board Area */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-primary" /> Espacio completamente privado
              </span>
              {notes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("¿Seguro que quieres borrar todo el tablero?")) saveNotes([]);
                  }}
                  className="text-destructive hover:bg-destructive/10 text-xs"
                >
                  Borrar tablero
                </Button>
              )}
            </div>

            <div
              className="relative w-full min-h-[500px] rounded-3xl border-2 border-dashed border-border overflow-hidden bg-accent/20 flex flex-wrap items-start p-6 gap-4"
              style={{
                backgroundImage: "radial-gradient(var(--color-border) 1.5px, transparent 1.5px)",
                backgroundSize: "20px 20px",
              }}
            >
              {notes.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Sparkles className="w-10 h-10 text-primary opacity-60 animate-pulse" />
                  <p className="font-serif text-lg text-foreground/70">
                    Tu tablero está listo para decorar
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Escribe un pensamiento a la izquierda y dale color para comenzar.
                  </p>
                </div>
              ) : (
                notes.map((n) => {
                  const fontClass = FONTS.find((f) => f.id === n.font)?.css || "font-sans";
                  const customFont = n.font === "cursive" ? { fontFamily: "cursive" } : {};
                  return (
                    <div
                      key={n.id}
                      style={{
                        backgroundColor: n.color,
                        boxShadow:
                          "0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.06)",
                      }}
                      className="p-5 rounded-2xl w-[190px] relative transition-transform hover:-translate-y-1 hover:rotate-1 group shrink-0"
                    >
                      {/* Sticker position top-right */}
                      <span className="absolute -top-3 -right-2 text-2xl drop-shadow-sm select-none">
                        {n.sticker}
                      </span>

                      {/* Content */}
                      <p
                        className={`text-sm leading-relaxed text-slate-800 break-words ${fontClass}`}
                        style={customFont}
                      >
                        {n.text}
                      </p>

                      {/* Floating actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2 flex gap-1 bg-white/80 backdrop-blur px-1.5 py-0.5 rounded-lg shadow-sm border border-slate-100">
                        <button
                          onClick={() => startEdit(n)}
                          className="text-slate-600 hover:text-primary p-1"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNote(n.id)}
                          className="text-slate-600 hover:text-destructive p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
