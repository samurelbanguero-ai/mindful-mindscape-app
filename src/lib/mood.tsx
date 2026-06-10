import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Mood = "calma" | "alegria" | "tristeza" | "ansiedad" | "energia";

export const MOODS: { id: Mood; label: string; emoji: string; description: string; score: number }[] = [
  { id: "alegria", label: "Alegría", emoji: "☀️", description: "Me siento bien, optimista", score: 5 },
  { id: "energia", label: "Energía", emoji: "🔥", description: "Con ganas, motivado/a", score: 4 },
  { id: "calma", label: "Calma", emoji: "🌿", description: "Tranquilo/a, en paz", score: 3 },
  { id: "ansiedad", label: "Ansiedad", emoji: "🌫️", description: "Inquieto/a, con presión", score: 2 },
  { id: "tristeza", label: "Tristeza", emoji: "🌧️", description: "Bajo/a, sensible", score: 1 },
];

export type User = {
  username: string;
  email: string;
  anonymous: boolean;
};

export type MoodEntry = {
  date: string; // YYYY-MM-DD
  mood: Mood;
  note?: string;
};

type Ctx = {
  user: User | null;
  mood: Mood;
  setMood: (m: Mood) => void;
  login: (u: User) => void;
  logout: () => void;
  entries: MoodEntry[];
  addEntry: (e: MoodEntry) => void;
};

const MoodCtx = createContext<Ctx | null>(null);

const K_USER = "calm_user";
const K_MOOD = "calm_mood";
const K_ENTRIES = "calm_entries";

export function MoodProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mood, setMoodState] = useState<Mood>("calma");
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    try {
      const u = localStorage.getItem(K_USER);
      if (u) setUser(JSON.parse(u));
      const m = localStorage.getItem(K_MOOD) as Mood | null;
      if (m) setMoodState(m);
      const e = localStorage.getItem(K_ENTRIES);
      if (e) setEntries(JSON.parse(e));
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-mood", mood);
  }, [mood]);

  const setMood = (m: Mood) => {
    setMoodState(m);
    try { localStorage.setItem(K_MOOD, m); } catch {}
  };
  const login = (u: User) => {
    setUser(u);
    try { localStorage.setItem(K_USER, JSON.stringify(u)); } catch {}
  };
  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(K_USER); } catch {}
  };
  const addEntry = (entry: MoodEntry) => {
    setEntries((prev) => {
      const filtered = prev.filter((p) => p.date !== entry.date);
      const next = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
      try { localStorage.setItem(K_ENTRIES, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <MoodCtx.Provider value={{ user, mood, setMood, login, logout, entries, addEntry }}>
      {children}
    </MoodCtx.Provider>
  );
}

export function useMood() {
  const ctx = useContext(MoodCtx);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
}
