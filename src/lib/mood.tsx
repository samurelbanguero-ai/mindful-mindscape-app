import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Mood = "calma" | "alegria" | "tristeza" | "ansiedad" | "energia";
export type Role = "usuario" | "psicologo";
export type Visibility = "publico" | "alias" | "anonimo";

export const MOODS: { id: Mood; label: string; emoji: string; description: string; score: number }[] = [
  { id: "alegria", label: "Alegría", emoji: "☀️", description: "Me siento bien, optimista", score: 5 },
  { id: "energia", label: "Energía", emoji: "🔥", description: "Con ganas, motivado/a", score: 4 },
  { id: "calma", label: "Calma", emoji: "🌿", description: "Tranquilo/a, en paz", score: 3 },
  { id: "ansiedad", label: "Ansiedad", emoji: "🌫️", description: "Inquieto/a, con presión", score: 2 },
  { id: "tristeza", label: "Tristeza", emoji: "🌧️", description: "Bajo/a, sensible", score: 1 },
];

export const INTERESTS = [
  "Música","Películas","Series","Lectura","Videojuegos","Deportes","Arte","Naturaleza","Tecnología","Cocinar",
] as const;

export const SITUATIONS = [
  "Trabajo","Estudios","Familia","Amistades","Pareja","Salud","Dinero","Soledad","Descanso","Logros","Cambios","Redes sociales",
] as const;

export type User = {
  username: string;
  email: string;
  role: Role;
  visibility: Visibility;
  alias?: string;
  anonymous: boolean; // legacy
};

export type Profile = {
  interests: string[];
  genres: string[];
  movies: string;
  series: string;
  relax: string[];
  goals: string;
  spotifyConnected: boolean;
};

export type MoodEntry = {
  date: string;
  mood: Mood;
  intensity?: number;
  situations?: string[];
  note?: string;
};

export type Reaction = "te_entiendo" | "no_solo" | "gracias" | "te_acompano" | "me_ayudo";
export const REACTIONS: { id: Reaction; emoji: string; label: string }[] = [
  { id: "te_entiendo", emoji: "❤️", label: "Te entiendo" },
  { id: "no_solo", emoji: "🤝", label: "No estás solo" },
  { id: "gracias", emoji: "🌱", label: "Gracias por compartir" },
  { id: "te_acompano", emoji: "💙", label: "Te acompaño" },
  { id: "me_ayudo", emoji: "✨", label: "Esto me ayudó" },
];

export type Comment = { id: string; author: string; anon: boolean; text: string; createdAt: number };
export type Post = {
  id: string;
  author: string; // display name
  anon: boolean;
  title: string;
  body: string;
  mood?: Mood;
  createdAt: number;
  reactions: Partial<Record<Reaction, number>>;
  reactedBy?: Reaction;
  comments: Comment[];
  reported?: boolean;
};

export type ChatMsg = { id: string; role: "user" | "ai" | "psico"; text: string; at: number };

type Ctx = {
  user: User | null;
  mood: Mood;
  setMood: (m: Mood) => void;
  login: (u: User) => void;
  logout: () => void;

  entries: MoodEntry[];
  addEntry: (e: MoodEntry) => void;

  profile: Profile;
  setProfile: (p: Profile) => void;

  posts: Post[];
  addPost: (p: Omit<Post, "id" | "createdAt" | "reactions" | "comments">) => string;
  react: (postId: string, r: Reaction) => void;
  addComment: (postId: string, c: Omit<Comment, "id" | "createdAt">) => void;
  reportPost: (postId: string) => void;

  chat: ChatMsg[];
  pushChat: (m: Omit<ChatMsg, "id" | "at">) => void;
  resetChat: () => void;

  streak: number;
  treeLevel: number; // 0..5
};

const MoodCtx = createContext<Ctx | null>(null);

const K_USER = "serena_user";
const K_MOOD = "serena_mood";
const K_ENTRIES = "serena_entries";
const K_PROFILE = "serena_profile";
const K_POSTS = "serena_posts";
const K_CHAT = "serena_chat";

const DEFAULT_PROFILE: Profile = {
  interests: [],
  genres: [],
  movies: "",
  series: "",
  relax: [],
  goals: "",
  spotifyConnected: false,
};

const SEED_POSTS: Post[] = [
  {
    id: "seed-1",
    author: "luna_23",
    anon: false,
    title: "Hoy me costó levantarme",
    body: "Tuve una semana pesada y siento que no avanzo. ¿Alguien tiene rutinas suaves para empezar el día sin presión?",
    mood: "tristeza",
    createdAt: Date.now() - 86400000,
    reactions: { te_entiendo: 12, no_solo: 8, te_acompano: 5 },
    comments: [
      { id: "c1", author: "anónimo", anon: true, text: "A mí me ayuda abrir la ventana antes que el teléfono. Un café tranquilo.", createdAt: Date.now() - 80000000 },
      { id: "c2", author: "mar.aire", anon: false, text: "Te entiendo, hay días así. Empieza por algo muy pequeño, vale.", createdAt: Date.now() - 70000000 },
    ],
  },
  {
    id: "seed-2",
    author: "anónimo",
    anon: true,
    title: "Una canción que me salvó esta semana",
    body: "Quería compartir 'Weightless' de Marconi Union. Me ayudó a dormir cuando estaba ansiosa. ¿Qué les ayuda a ustedes?",
    mood: "calma",
    createdAt: Date.now() - 3 * 86400000,
    reactions: { gracias: 18, me_ayudo: 11 },
    comments: [],
  },
];

export function MoodProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mood, setMoodState] = useState<Mood>("calma");
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [chat, setChat] = useState<ChatMsg[]>([]);

  useEffect(() => {
    try {
      const u = localStorage.getItem(K_USER);
      if (u) setUser(JSON.parse(u));
      const m = localStorage.getItem(K_MOOD) as Mood | null;
      if (m) setMoodState(m);
      const e = localStorage.getItem(K_ENTRIES);
      if (e) setEntries(JSON.parse(e));
      const p = localStorage.getItem(K_PROFILE);
      if (p) setProfileState(JSON.parse(p));
      const ps = localStorage.getItem(K_POSTS);
      if (ps) setPosts(JSON.parse(ps));
      const ch = localStorage.getItem(K_CHAT);
      if (ch) setChat(JSON.parse(ch));
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
  const setProfile = (p: Profile) => {
    setProfileState(p);
    try { localStorage.setItem(K_PROFILE, JSON.stringify(p)); } catch {}
  };

  const persistPosts = (next: Post[]) => {
    try { localStorage.setItem(K_POSTS, JSON.stringify(next)); } catch {}
    return next;
  };

  const addPost: Ctx["addPost"] = (p) => {
    const id = "p_" + Math.random().toString(36).slice(2, 9);
    setPosts((prev) => persistPosts([{ ...p, id, createdAt: Date.now(), reactions: {}, comments: [] }, ...prev]));
    return id;
  };
  const react: Ctx["react"] = (postId, r) => {
    setPosts((prev) => persistPosts(prev.map((post) => {
      if (post.id !== postId) return post;
      const prevR = post.reactedBy;
      const reactions = { ...post.reactions };
      if (prevR === r) {
        reactions[r] = Math.max(0, (reactions[r] || 1) - 1);
        return { ...post, reactions, reactedBy: undefined };
      }
      if (prevR) reactions[prevR] = Math.max(0, (reactions[prevR] || 1) - 1);
      reactions[r] = (reactions[r] || 0) + 1;
      return { ...post, reactions, reactedBy: r };
    })));
  };
  const addComment: Ctx["addComment"] = (postId, c) => {
    setPosts((prev) => persistPosts(prev.map((post) => post.id === postId
      ? { ...post, comments: [...post.comments, { ...c, id: "c_" + Math.random().toString(36).slice(2, 9), createdAt: Date.now() }] }
      : post)));
  };
  const reportPost: Ctx["reportPost"] = (postId) => {
    setPosts((prev) => persistPosts(prev.map((p) => p.id === postId ? { ...p, reported: true } : p)));
  };

  const pushChat: Ctx["pushChat"] = (m) => {
    setChat((prev) => {
      const next = [...prev, { ...m, id: "m_" + Math.random().toString(36).slice(2, 9), at: Date.now() }];
      try { localStorage.setItem(K_CHAT, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const resetChat = () => {
    setChat([]);
    try { localStorage.removeItem(K_CHAT); } catch {}
  };

  const { streak, treeLevel } = useMemo(() => {
    if (!entries.length) return { streak: 0, treeLevel: 0 };
    const dates = new Set(entries.map((e) => e.date));
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if (dates.has(k)) s++;
      else if (i > 0) break;
    }
    const tl = Math.min(5, Math.floor(entries.length / 3));
    return { streak: s, treeLevel: tl };
  }, [entries]);

  return (
    <MoodCtx.Provider value={{
      user, mood, setMood, login, logout,
      entries, addEntry,
      profile, setProfile,
      posts, addPost, react, addComment, reportPost,
      chat, pushChat, resetChat,
      streak, treeLevel,
    }}>
      {children}
    </MoodCtx.Provider>
  );
}

export function useMood() {
  const ctx = useContext(MoodCtx);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
}

// ===== Helpers =====
export function displayAuthor(u: User | null, anon: boolean) {
  if (anon) return "anónimo";
  if (!u) return "anónimo";
  if (u.visibility === "anonimo") return "anónimo";
  if (u.visibility === "alias") return u.alias || u.username;
  return u.username;
}

const BAD_WORDS = ["idiota","estupido","estúpido","tonto","imbecil","imbécil","cállate","odio","muerete","muérete","puto","puta","mierda"];
export function containsBadWords(text: string) {
  const t = text.toLowerCase();
  return BAD_WORDS.some((w) => t.includes(w));
}

// Empathetic AI simulator
const AI_QUESTIONS: Record<string, string[]> = {
  triste: [
    "¿Crees que es algo que ocurrió hoy o que viene desde hace tiempo?",
    "¿Qué le dirías a una persona querida si te contara lo mismo?",
    "¿Hay algo pequeño que sueles disfrutar y que podrías hacer hoy?",
  ],
  ansiedad: [
    "¿Qué parte del cuerpo notas más tensa ahora?",
    "Si pudieras poner pausa a una sola cosa hoy, ¿cuál sería?",
    "¿Probamos tres respiraciones lentas juntos antes de seguir?",
  ],
  cansado: [
    "¿Has descansado lo suficiente esta semana?",
    "¿Es cansancio físico o más bien mental?",
    "¿Qué te ayudaría a soltar algo por hoy?",
  ],
  feliz: [
    "¡Qué bueno escucharte así! ¿Qué crees que ayudó hoy?",
    "¿Cómo podrías cuidar esa sensación mañana?",
  ],
  enojado: [
    "¿Qué crees que está debajo de ese enojo?",
    "¿Necesitas espacio o necesitas que alguien te escuche?",
  ],
  default: [
    "Cuéntame un poco más, sin prisa.",
    "¿Cómo describirías eso con una imagen o un color?",
    "¿Qué necesitas ahora mismo: que te escuchen, una idea, o solo escribirlo?",
    "Gracias por contarme. ¿Quieres profundizar en algo concreto?",
  ],
};
export function aiReply(text: string): string {
  const t = text.toLowerCase();
  let key: keyof typeof AI_QUESTIONS = "default";
  if (/(triste|llor|bajón|bajon|deprim|vacío|vacio)/.test(t)) key = "triste";
  else if (/(ansie|nervios|estres|estrés|preocup|miedo)/.test(t)) key = "ansiedad";
  else if (/(cansad|agotad|sin energía|sin energia|exhaust)/.test(t)) key = "cansado";
  else if (/(feliz|content|aleg|bien|genial)/.test(t)) key = "feliz";
  else if (/(enoj|rabia|ira|furi|molest)/.test(t)) key = "enojado";
  const pool = AI_QUESTIONS[key];
  return pool[Math.floor(Math.random() * pool.length)];
}
