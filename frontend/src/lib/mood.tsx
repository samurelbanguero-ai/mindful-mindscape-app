import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as api from "./api";
import { toast } from "sonner";

export type Mood = string;
export type Role = "usuario" | "psicologo" | "admin";
export type Visibility = "publico" | "alias" | "anonimo";

export type ParentMood = "calma" | "alegria" | "tristeza" | "ansiedad" | "energia";

export const MOODS: {
  id: string;
  label: string;
  emoji: string;
  description: string;
  score: number;
  category: "positiva" | "negativa" | "neutra";
  parentMood: ParentMood;
}[] = [
  // Positivas
  {
    id: "alegria",
    label: "Alegría",
    emoji: "☀️",
    description: "Me siento feliz, optimista",
    score: 5,
    category: "positiva",
    parentMood: "alegria",
  },
  {
    id: "felicidad",
    label: "Felicidad",
    emoji: "😊",
    description: "Plenitud y bienestar",
    score: 5,
    category: "positiva",
    parentMood: "alegria",
  },
  {
    id: "gratitud",
    label: "Gratitud",
    emoji: "🙏",
    description: "Agradecido/a con la vida",
    score: 5,
    category: "positiva",
    parentMood: "alegria",
  },
  {
    id: "amor",
    label: "Amor",
    emoji: "❤️",
    description: "Afectuoso/a, conectado/a",
    score: 5,
    category: "positiva",
    parentMood: "alegria",
  },
  {
    id: "entusiasmo",
    label: "Entusiasmo",
    emoji: "🎉",
    description: "Emocionado/a por lo que viene",
    score: 5,
    category: "positiva",
    parentMood: "alegria",
  },
  {
    id: "orgullo",
    label: "Orgullo",
    emoji: "✨",
    description: "Satisfecho/a de mis logros",
    score: 5,
    category: "positiva",
    parentMood: "alegria",
  },
  {
    id: "esperanza",
    label: "Esperanza",
    emoji: "🌱",
    description: "Fe en el futuro",
    score: 4,
    category: "positiva",
    parentMood: "alegria",
  },
  {
    id: "energia",
    label: "Energía",
    emoji: "🔥",
    description: "Con ganas y vitalidad",
    score: 4,
    category: "positiva",
    parentMood: "energia",
  },
  {
    id: "motivacion",
    label: "Motivación",
    emoji: "💪",
    description: "Listo/a para actuar",
    score: 4,
    category: "positiva",
    parentMood: "energia",
  },
  {
    id: "alivio",
    label: "Alivio",
    emoji: "😌",
    description: "Me he quitado un peso de encima",
    score: 4,
    category: "positiva",
    parentMood: "calma",
  },

  // Neutras
  {
    id: "calma",
    label: "Calma",
    emoji: "🌿",
    description: "Tranquilo/a, en paz",
    score: 3,
    category: "neutra",
    parentMood: "calma",
  },
  {
    id: "paz",
    label: "Paz",
    emoji: "☮️",
    description: "Serenidad interna",
    score: 3,
    category: "neutra",
    parentMood: "calma",
  },
  {
    id: "mixto",
    label: "Emoción Mixta",
    emoji: "🎭",
    description: "Siento varias cosas a la vez",
    score: 3,
    category: "neutra",
    parentMood: "calma",
  },
  {
    id: "confusion",
    label: "Confusión",
    emoji: "❓",
    description: "No tengo claro qué siento",
    score: 3,
    category: "neutra",
    parentMood: "calma",
  },
  {
    id: "aburrimiento",
    label: "Aburrimiento",
    emoji: "🥱",
    description: "Poco interés o estímulo",
    score: 3,
    category: "neutra",
    parentMood: "calma",
  },

  // Negativas
  {
    id: "ansiedad",
    label: "Ansiedad",
    emoji: "🌫️",
    description: "Inquieto/a, con presión",
    score: 2,
    category: "negativa",
    parentMood: "ansiedad",
  },
  {
    id: "preocupacion",
    label: "Preocupación",
    emoji: "😟",
    description: "Pensando en problemas",
    score: 2,
    category: "negativa",
    parentMood: "ansiedad",
  },
  {
    id: "miedo",
    label: "Miedo",
    emoji: "😨",
    description: "Temor a algo",
    score: 2,
    category: "negativa",
    parentMood: "ansiedad",
  },
  {
    id: "tristeza",
    label: "Tristeza",
    emoji: "🌧️",
    description: "Bajo/a, sensible",
    score: 1,
    category: "negativa",
    parentMood: "tristeza",
  },
  {
    id: "cansancio",
    label: "Cansancio",
    emoji: "💤",
    description: "Sin energía física o mental",
    score: 2,
    category: "negativa",
    parentMood: "tristeza",
  },
  {
    id: "frustracion",
    label: "Frustración",
    emoji: "😤",
    description: "Impotencia ante algo",
    score: 2,
    category: "negativa",
    parentMood: "tristeza",
  },
  {
    id: "enojo",
    label: "Enojo",
    emoji: "😡",
    description: "Molesto/a o furioso/a",
    score: 1,
    category: "negativa",
    parentMood: "tristeza",
  },
  {
    id: "soledad",
    label: "Soledad",
    emoji: "👥",
    description: "Me siento aislado/a o solo/a",
    score: 1,
    category: "negativa",
    parentMood: "tristeza",
  },
];

export function getParentMood(m: string): ParentMood {
  const found = MOODS.find((x) => x.id === m);
  return found?.parentMood || "calma";
}

export const INTERESTS = [
  "Música",
  "Películas",
  "Series",
  "Lectura",
  "Videojuegos",
  "Deportes",
  "Arte",
  "Naturaleza",
  "Tecnología",
  "Cocinar",
] as const;

export const SITUATIONS = [
  "Trabajo",
  "Estudios",
  "Familia",
  "Amistades",
  "Pareja",
  "Salud",
  "Dinero",
  "Soledad",
  "Descanso",
  "Logros",
  "Cambios",
  "Redes sociales",
] as const;

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
  visibility: Visibility;
  alias?: string;
  name?: string;
  bio?: string;
  avatar?: string;
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
  customColorEnabled?: boolean;
  customColor?: string;
};

export type MoodEntry = {
  id?: number;
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

export type Comment = {
  id: string;
  author: string;
  anon: boolean;
  text: string;
  createdAt: number;
};
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
  authReady: boolean;
  mood: Mood;
  setMood: (m: Mood) => void;
  login: (u: User, token?: string) => void;
  logout: () => void;
  updateAccount: (username: string, password?: string) => Promise<any>;

  entries: MoodEntry[];
  addEntry: (e: MoodEntry) => void;

  profile: Profile;
  setProfile: (p: Profile) => void;

  posts: Post[];
  addPost: (p: Omit<Post, "id" | "createdAt" | "reactions" | "comments">) => Promise<string>;
  react: (postId: string, r: Reaction) => void;
  addComment: (postId: string, c: Omit<Comment, "id" | "createdAt">) => void;
  reportPost: (postId: string) => void;

  chat: ChatMsg[];
  pushChat: (m: Omit<ChatMsg, "id" | "at">) => void;
  resetChat: () => void;

  streak: number;
  treeLevel: number; // 0..5
  offlineMode: boolean;

  // Nuevos campos de soporte y Spotify
  activeSupportRequest: { request: api.SupportRequest; messages: api.SupportMessage[] } | null;
  supportUnreadCount: number;
  refreshSupport: () => Promise<void>;
  requestSupport: (message: string, shareJournal: boolean) => Promise<void>;
  sendSupportMessage: (message: string) => Promise<void>;
  resolveSupportRequest: () => Promise<void>;
  disconnectSpotify: () => Promise<void>;
};

const MoodCtx = createContext<Ctx | null>(null);

const K_USER = "emowave_user";
const K_MOOD = "emowave_mood";
const K_ENTRIES = "emowave_entries";
const K_PROFILE = "emowave_profile";
const K_POSTS = "emowave_posts";
const K_CHAT = "emowave_chat";

const DEFAULT_PROFILE: Profile = {
  interests: [],
  genres: [],
  movies: "",
  series: "",
  relax: [],
  goals: "",
  spotifyConnected: false,
  customColorEnabled: false,
  customColor: "#58B0A5",
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
      {
        id: "c1",
        author: "anónimo",
        anon: true,
        text: "A mí me ayuda abrir la ventana antes que el teléfono. Un café tranquilo.",
        createdAt: Date.now() - 80000000,
      },
      {
        id: "c2",
        author: "mar.aire",
        anon: false,
        text: "Te entiendo, hay días así. Empieza por algo muy pequeño, vale.",
        createdAt: Date.now() - 70000000,
      },
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
  const [authReady, setAuthReady] = useState(false);
  const [mood, setMoodState] = useState<Mood>("calma");
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const chatRef = useRef<ChatMsg[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);

  // Nuevos estados
  const [activeSupportRequest, setActiveSupportRequest] = useState<{
    request: api.SupportRequest;
    messages: api.SupportMessage[];
  } | null>(null);
  const [supportUnreadCount, setSupportUnreadCount] = useState<number>(0);

  // Initialize session and sync with backend if possible
  useEffect(() => {
    const initSession = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const meRes = await api.auth.getMe();
          setUser(meRes.user);
          setOfflineMode(false);

          try {
            const diaryRes = await api.diary.getEntries();
            setEntries(diaryRes.entries);
          } catch (e) {
            console.error("Error al cargar diario del backend", e);
          }

          try {
            const res = await api.support.getMyRequest();
            if (res && res.request) {
              setActiveSupportRequest({ request: res.request, messages: res.messages || [] });
            } else {
              setActiveSupportRequest(null);
            }
            const unread = await api.support.getUnreadCount();
            setSupportUnreadCount(unread.count || 0);
          } catch (e) {
            console.error("Error al cargar soporte en inicialización", e);
          }

          if (meRes.user.profile_data) {
            setProfileState(meRes.user.profile_data);
          }
        } else {
          setUser(null);
          setOfflineMode(false);
        }
      } catch (err: unknown) {
        const msg: string = err instanceof Error ? err.message : String(err);
        const isAuthError =
          msg.includes("Token") ||
          msg.includes("401") ||
          msg.includes("inválid") ||
          msg.includes("expirad");

        if (isAuthError) {
          // Token inválido o expirado — limpiar y redirigir al login
          api.clearToken();
          setUser(null);
          try {
            localStorage.removeItem(K_USER);
          } catch (e) {
            void e;
          }
        } else {
          // Backend genuinamente no disponible — modo offline
          console.warn("Backend inalcanzable. Iniciando en modo offline local.", msg);
          setOfflineMode(true);
          toast.info("Servidor no detectado. Usando Emowave en modo local 📶");
          try {
            const u = localStorage.getItem(K_USER);
            if (u) setUser(JSON.parse(u));
            const e = localStorage.getItem(K_ENTRIES);
            if (e) setEntries(JSON.parse(e));
            const p = localStorage.getItem(K_PROFILE);
            if (p) setProfileState(JSON.parse(p));
          } catch (e) {
            void e;
          }
        }
      } finally {
        setAuthReady(true);
        try {
          const m = localStorage.getItem(K_MOOD) as Mood | null;
          if (m) setMoodState(m);
          const ps = localStorage.getItem(K_POSTS);
          if (ps) setPosts(JSON.parse(ps));
          const ch = localStorage.getItem(K_CHAT);
          if (ch) setChat(JSON.parse(ch));
        } catch (e) {
          void e;
        }
      }
    };

    initSession();
  }, []);

  // Sync community posts from backend if user is authenticated and online
  const fetchCommunityPosts = async () => {
    try {
      const res = await api.community.getPosts();
      setPosts(res.posts);
    } catch (e) {
      console.warn("No se pudieron cargar los posts del servidor. Usando locales.", e);
    }
  };

  useEffect(() => {
    if (user && !offlineMode) {
      fetchCommunityPosts();
    }
  }, [user, offlineMode]);

  // Mantener ref del chat sincronizada para acceso desde callbacks async
  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  useEffect(() => {
    const parent = getParentMood(mood);
    document.documentElement.setAttribute("data-mood", parent);
  }, [mood]);

  useEffect(() => {
    if (user && profile && profile.customColorEnabled && profile.customColor) {
      document.documentElement.setAttribute("data-custom-color-enabled", "true");
      document.documentElement.style.setProperty("--custom-primary", profile.customColor);
    } else {
      document.documentElement.removeAttribute("data-custom-color-enabled");
      document.documentElement.style.removeProperty("--custom-primary");
    }
  }, [profile, user]);

  const setMood = (m: Mood) => {
    setMoodState(m);
    try {
      localStorage.setItem(K_MOOD, m);
    } catch (e) {
      void e;
    }

    // Si el usuario cambia el mood explícitamente, desactivamos el color personalizado
    // para que la interfaz cambie visualmente al tema del mood seleccionado.
    if (profile && profile.customColorEnabled) {
      const updatedProfile = {
        ...profile,
        customColorEnabled: false,
      };
      setProfileState(updatedProfile);
      try {
        localStorage.setItem(K_PROFILE, JSON.stringify(updatedProfile));
      } catch (e) {
        void e;
      }
      if (user && !offlineMode) {
        api.profile.updateProfile({ profile_data: updatedProfile })
          .catch((err) => console.error("Error al guardar perfil desactivando color personalizado:", err));
      }
    }
  };

  const login = (u: User, token?: string) => {
    setUser(u);
    setAuthReady(true);
    if (token) {
      api.setToken(token);
      setOfflineMode(false);

      // Cargar diario del backend de inmediato
      api.diary.getEntries().then((diaryRes) => {
        if (diaryRes && diaryRes.entries) {
          setEntries(diaryRes.entries);
        }
      }).catch((e) => console.error("Error al cargar diario tras login", e));

      // Cargar soporte de inmediato tras login exitoso
      try {
        api.support.getMyRequest().then((res) => {
          if (res && res.request) {
            setActiveSupportRequest({ request: res.request, messages: res.messages || [] });
          }
        });
        api.support.getUnreadCount().then((res) => {
          setSupportUnreadCount(res.count || 0);
        });
      } catch (e) {
        console.error("Error al cargar soporte tras login", e);
      }

      // Cargar posts de la comunidad
      api.community.getPosts().then((res) => {
        if (res && res.posts) {
          setPosts(res.posts);
        }
      }).catch((e) => console.warn("No se pudieron cargar posts tras login", e));

      if (u.profile_data) {
        setProfileState(u.profile_data);
      }
    }
    try {
      localStorage.setItem(K_USER, JSON.stringify(u));
    } catch (e) {
      void e;
    }
  };

  const logout = () => {
    setUser(null);
    setProfileState(DEFAULT_PROFILE);
    setAuthReady(true);
    setOfflineMode(false);
    setEntries([]); // Limpiar entradas del diario
    setChat([]);    // Limpiar chat del diario
    setMoodState("calma"); // Reiniciar emoción a calma
    setActiveSupportRequest(null);
    setSupportUnreadCount(0);
    api.clearToken();
    try {
      localStorage.removeItem(K_USER);
      localStorage.removeItem(K_ENTRIES);
      localStorage.removeItem(K_PROFILE);
      localStorage.removeItem(K_CHAT);
      localStorage.removeItem(K_POSTS);
      localStorage.removeItem(K_MOOD);
    } catch (e) {
      void e;
    }
  };

  const addEntry = async (entry: MoodEntry) => {
    // Save locally immediately
    setEntries((prev) => {
      const filtered = prev.filter((p) => p.date !== entry.date);
      const next = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
      try {
        localStorage.setItem(K_ENTRIES, JSON.stringify(next));
      } catch (e) {
        void e;
      }
      return next;
    });

    // Save in backend if online
    if (!offlineMode) {
      try {
        await api.diary.createEntry(
          entry.date,
          entry.mood,
          entry.intensity ?? 5,
          entry.situations ?? [],
          entry.note ?? "",
        );
      } catch (err) {
        console.error("Error al guardar entrada en el servidor", err);
      }
    }
  };

  const setProfile = async (p: Profile) => {
    setProfileState(p);
    try {
      localStorage.setItem(K_PROFILE, JSON.stringify(p));
    } catch (e) {
      void e;
    }

    if (!offlineMode) {
      try {
        await api.profile.updateProfile({
          profile_data: p,
        });
      } catch (err) {
        console.error("Error al guardar preferencias de perfil en el servidor", err);
      }
    }
  };

  const updateAccount = async (username: string, password?: string) => {
    if (offlineMode) {
      throw new Error("No puedes cambiar tus credenciales de cuenta en modo sin conexión.");
    }
    const res = await api.profile.updateAccount(username, password);
    if (res && res.user) {
      setUser(res.user);
      try {
        localStorage.setItem(K_USER, JSON.stringify(res.user));
      } catch (e) {
        void e;
      }
    }
    return res;
  };

  const persistPosts = (next: Post[]) => {
    try {
      localStorage.setItem(K_POSTS, JSON.stringify(next));
    } catch (e) {
      void e;
    }
    return next;
  };

  const addPost = async (p: Omit<Post, "id" | "createdAt" | "reactions" | "comments">) => {
    const tempId = "p_" + Math.random().toString(36).slice(2, 9);

    if (!offlineMode) {
      try {
        const res = await api.community.createPost({
          title: p.title,
          body: p.body,
          mood: p.mood,
          is_anonymous: p.anon,
        });
        fetchCommunityPosts();
        return res.post.id;
      } catch (err) {
        console.error("Error al crear post en el servidor. Guardando localmente.", err);
      }
    }

    setPosts((prev) =>
      persistPosts([
        { ...p, id: tempId, createdAt: Date.now(), reactions: {}, comments: [] },
        ...prev,
      ]),
    );
    return tempId;
  };

  const react = async (postId: string, r: Reaction) => {
    if (!offlineMode) {
      try {
        await api.community.toggleReaction(postId, r);
        fetchCommunityPosts();
        return;
      } catch (err) {
        console.error("Error al reaccionar en el servidor. Usando local.", err);
      }
    }

    setPosts((prev) =>
      persistPosts(
        prev.map((post) => {
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
        }),
      ),
    );
  };

  const addComment = async (postId: string, c: Omit<Comment, "id" | "createdAt">) => {
    if (!offlineMode) {
      try {
        await api.community.addReply(postId, c.text, c.anon);
        await fetchCommunityPosts();
        return true;
      } catch (err) {
        console.error("Error al añadir comentario en el servidor.", err);
        throw err;
      }
    }

    setPosts((prev) =>
      persistPosts(
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    ...c,
                    id: "c_" + Math.random().toString(36).slice(2, 9),
                    createdAt: Date.now(),
                  },
                ],
              }
            : post,
        ),
      ),
    );
    return true;
  };

  const reportPost = async (postId: string) => {
    setPosts((prev) =>
      persistPosts(prev.map((p) => (p.id === postId ? { ...p, reported: true } : p))),
    );
    if (!offlineMode) {
      try {
        await api.community.reportPost(postId);
      } catch (err) {
        console.error("Error al reportar post en el servidor", err);
      }
    }
  };

  const pushChat = async (m: Omit<ChatMsg, "id" | "at">) => {
    const userMsg = { ...m, id: "m_" + Math.random().toString(36).slice(2, 9), at: Date.now() };
    setChat((prev) => {
      const next = [...prev, userMsg];
      try {
        localStorage.setItem(K_CHAT, JSON.stringify(next));
      } catch (e) {
        void e;
      }
      return next;
    });

    if (m.role === "user") {
      if (!offlineMode) {
        try {
          // ✅ FIX: pasar historial al asistente - usar chatRef para acceder al estado actual
          const currentChat = chatRef.current;
          const history = currentChat.map((msg) => ({
            role: msg.role === "ai" ? ("assistant" as const) : ("user" as const),
            content: msg.text,
          }));
          const res = await api.askAssistant(m.text, history);
          const aiMsg = {
            id: "m_" + Math.random().toString(36).slice(2, 9),
            role: "ai" as const,
            text: res.reply,
            at: Date.now(),
          };
          setChat((prev) => {
            const next = [...prev, aiMsg];
            try {
              localStorage.setItem(K_CHAT, JSON.stringify(next));
            } catch (e) {
              void e;
            }
            return next;
          });
          return;
        } catch (err) {
          console.error("Error al consultar chat con IA del backend. Usando local.", err);
        }
      }

      // Local simulator fallback
      setTimeout(
        () => {
          const aiMsg = {
            id: "m_" + Math.random().toString(36).slice(2, 9),
            role: "ai" as const,
            text: aiReply(m.text),
            at: Date.now(),
          };
          setChat((prev) => {
            const next = [...prev, aiMsg];
            try {
              localStorage.setItem(K_CHAT, JSON.stringify(next));
            } catch (e) {
              void e;
            }
            return next;
          });
        },
        700 + Math.random() * 500,
      );
    }
  };

  const resetChat = () => {
    setChat([]);
    try {
      localStorage.removeItem(K_CHAT);
    } catch (e) {
      void e;
    }
  };

  const refreshSupport = useCallback(async () => {
    if (offlineMode || !user) return;
    try {
      const res = await api.support.getMyRequest();
      if (res && res.request) {
        setActiveSupportRequest({ request: res.request, messages: res.messages || [] });
      } else {
        setActiveSupportRequest(null);
      }

      const unread = await api.support.getUnreadCount();
      setSupportUnreadCount(unread.count || 0);
    } catch (err) {
      console.warn("Error al actualizar soporte:", err);
    }
  }, [user, offlineMode]);

  const requestSupport = async (message: string, shareJournal: boolean) => {
    if (offlineMode) {
      toast.error("El soporte psicológico no está disponible en modo offline");
      return;
    }
    const res = await api.support.requestSupport(message, shareJournal);
    if (res.success) {
      toast.success("Solicitud enviada con éxito. Un psicólogo se pondrá en contacto pronto 💚");
      await refreshSupport();
    }
  };

  const sendSupportMessage = async (message: string) => {
    if (offlineMode || !activeSupportRequest) return;
    const requestId = activeSupportRequest.request.id;
    await api.support.sendMessage(requestId, message);
    await refreshSupport();
  };

  const resolveSupportRequest = async () => {
    if (offlineMode || !activeSupportRequest) return;
    const requestId = activeSupportRequest.request.id;
    await api.support.resolveRequest(requestId);
    toast.success("Caso resuelto. Esperamos haberte ayudado 🌿");
    setActiveSupportRequest(null);
    setSupportUnreadCount(0);
  };

  const disconnectSpotify = async () => {
    if (offlineMode) return;
    await api.spotify.disconnect();
    setProfileState((prev) => ({ ...prev, spotifyConnected: false }));
    toast.success("Spotify desconectado");
  };

  // Polling de chat de soporte cada 10 segundos
  useEffect(() => {
    if (offlineMode || !user) return;

    refreshSupport();

    const interval = setInterval(() => {
      refreshSupport();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, offlineMode, refreshSupport]);

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
    <MoodCtx.Provider
      value={{
        user,
        authReady,
        mood,
        setMood,
        login,
        logout,
        entries,
        addEntry,
        profile,
        setProfile,
        posts,
        addPost,
        react,
        addComment,
        reportPost,
        chat,
        pushChat,
        resetChat,
        streak,
        treeLevel,
        offlineMode,
        activeSupportRequest,
        supportUnreadCount,
        refreshSupport,
        requestSupport,
        sendSupportMessage,
        resolveSupportRequest,
        disconnectSpotify,
        updateAccount,
      }}
    >
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

const BAD_WORDS = [
  "idiota",
  "estupido",
  "estúpido",
  "tonto",
  "imbecil",
  "imbécil",
  "cállate",
  "odio",
  "muerete",
  "muérete",
  "puto",
  "puta",
  "mierda",
];
const BAD_WORDS_PATTERNS = BAD_WORDS.map(w => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'));

export function containsBadWords(text: string) {
  const t = text.toLowerCase();
  return BAD_WORDS_PATTERNS.some((regex) => regex.test(t));
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
