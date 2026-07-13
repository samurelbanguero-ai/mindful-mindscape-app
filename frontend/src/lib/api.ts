// ✅ FIX: getApiBaseUrl es lazy (función) — no se evalúa en tiempo de módulo
// evita errores de SSR donde window no existe al momento de importar
const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    // SSR / server-side: usar variable de entorno
    return import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }
  const port = window.location.port;
  if (port === "2121") return "http://localhost:2122/api"; // Redirigir al backend de Docker en 2122
  if (port === "5173") return "http://localhost:3000/api"; // Vite local
  return import.meta.env.VITE_API_URL || "http://localhost:3000/api";
};

// ✅ FIX: exportar como función para que se evalúe en runtime, no en import
export const getApiUrl = getApiBaseUrl;

// Compatibilidad: API_BASE_URL sigue disponible pero se evalúa al primer uso
export const API_BASE_URL = getApiBaseUrl();

// ─────────────────────────────────────────────
// TOKEN HELPERS
// ─────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
};

export const clearToken = (): void => {
  if (typeof window !== "undefined") localStorage.removeItem("token");
};

// ─────────────────────────────────────────────
// PETICIÓN BASE & AUTOMATIC REFRESH TOKEN (HttpOnly)
// ─────────────────────────────────────────────
let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
let refreshSubscribers: Function[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  const base = getApiBaseUrl();

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include" // Habilitar envío y recepción de cookies HttpOnly
  };

  let response = await fetch(`${base}${endpoint}`, fetchOptions);

  // Si obtenemos 401 y no es login o el propio refresh, intentar renovar el access token
  if (response.status === 401 && endpoint !== "/auth/login" && endpoint !== "/auth/refresh-token") {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${base}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        const refreshData = await refreshResponse.json();

        const newAccessToken = refreshData?.accessToken || refreshData?.data?.accessToken;
        if (refreshResponse.ok && newAccessToken) {
          setToken(newAccessToken);
          isRefreshing = false;
          onRefreshed(newAccessToken);
        } else {
          isRefreshing = false;
          clearToken();
          throw new Error("Sesión expirada");
        }
      } catch (err) {
        isRefreshing = false;
        clearToken();
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken: string) => {
        headers.set("Authorization", `Bearer ${newToken}`);
        fetch(`${base}${endpoint}`, { ...options, headers, credentials: "include" })
          .then((res) => {
            if (!res.ok) {
              return res.json().then((d) => reject(new Error(d?.error || "Error tras refresco")));
            }
            return res.json().then((d) => resolve(d.data !== undefined ? d.data : d));
          })
          .catch(reject);
      });
    });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Error ${response.status} en la petición`);
  }

  // Devolver data.data para unificar formato con success.js, o data directo si no tiene data.data
  return data.data !== undefined ? data.data : data;
};

// ─────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────
export const auth = {
  register: (
    email: string,
    username: string,
    password: string,
    name = "",
    role = "usuario",
    visibility = "publico",
    alias = "",
  ) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password, name, role, visibility, alias }),
    }),

  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email: string, code: string) =>
    apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  resendVerification: (email: string) =>
    apiRequest("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  recoverPassword: (email: string) =>
    apiRequest("/auth/recover-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, token: string, password: string) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token, password }),
    }),

  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),

  getMe: () => apiRequest("/auth/me"),
};

// ─────────────────────────────────────────────
// DIARY API
// ─────────────────────────────────────────────
export const diary = {
  createEntry: (
    date: string,
    mood: string,
    intensity: number,
    situations: string[],
    note: string,
  ) =>
    apiRequest("/diary/entries", {
      method: "POST",
      body: JSON.stringify({ date, mood, intensity, situations, note }),
    }),

  getEntries: () => apiRequest("/diary/entries"),

  getEntry: (id: number | string) => apiRequest(`/diary/entries/${id}`),

  updateEntry: (id: number | string, data: Record<string, unknown>) =>
    apiRequest(`/diary/entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────────
// PROFILE API
// ─────────────────────────────────────────────
export const profile = {
  getProfile: (userId: number | string) => apiRequest(`/profile/${userId}`),

  updateProfile: (data: Record<string, unknown>) =>
    apiRequest("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateAccount: (username: string, password?: string) =>
    apiRequest("/profile/account", {
      method: "PUT",
      body: JSON.stringify({ username, password }),
    }),
};

// ─────────────────────────────────────────────
// COMMUNITY API
// ─────────────────────────────────────────────
export const community = {
  getPosts: (limit = 20, offset = 0) =>
    apiRequest(`/community/posts?limit=${limit}&offset=${offset}`),

  createPost: (data: { title: string; body: string; mood?: string; is_anonymous?: boolean }) =>
    apiRequest("/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addReply: (postId: number | string, content: string, is_anonymous = false) =>
    apiRequest(`/community/posts/${postId}/replies`, {
      method: "POST",
      body: JSON.stringify({ content, is_anonymous }),
    }),

  toggleReaction: (postId: number | string, reaction: string) =>
    apiRequest(`/community/posts/${postId}/react`, {
      method: "POST",
      body: JSON.stringify({ reaction }),
    }),

  reportPost: (postId: number | string) =>
    apiRequest(`/community/posts/${postId}/report`, { method: "POST" }),
};

// ─────────────────────────────────────────────
// ADMIN API
// ─────────────────────────────────────────────
export const admin = {
  createPsychologist: (email: string, username: string, password: string, name = "") =>
    apiRequest("/admin/create-psychologist", {
      method: "POST",
      body: JSON.stringify({ email, username, password, name }),
    }),

  createUser: (email: string, username: string, password: string, name = "", role = "usuario") =>
    apiRequest("/admin/create-user", {
      method: "POST",
      body: JSON.stringify({ email, username, password, name, role }),
    }),

  approvePost: (postId: number | string) =>
    apiRequest(`/admin/posts/${postId}/approve`, { method: "POST" }),

  rejectPost: (postId: number | string) =>
    apiRequest(`/admin/posts/${postId}/reject`, { method: "POST" }),

  editPost: (postId: number | string, title: string, body: string) =>
    apiRequest(`/admin/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify({ title, body }),
    }),

  getAuditLogs: () => apiRequest("/admin/audit-logs"),
};

// ─────────────────────────────────────────────
// SPOTIFY REAL API
// ─────────────────────────────────────────────
export const spotify = {
  disconnect: () => apiRequest("/spotify/disconnect", { method: "POST" }),
  getPlaylists: (parentMood: string) => apiRequest(`/spotify/playlists?parentMood=${parentMood}`),
};

// ─────────────────────────────────────────────
// APOYO PSICOLÓGICO API
// ─────────────────────────────────────────────
export interface SupportRequest {
  id: number;
  user_id: number;
  psychologist_id: number | null;
  status: "pending" | "active" | "resolved";
  message: string;
  share_journal: number;
  created_at: string;
  username?: string;
  alias?: string;
  visibility?: string;
  user_name?: string;
  messages?: SupportMessage[];
  journal_entries?: Array<{
    mood: string;
    intensity: number;
    date: string;
    situations: string[];
    note: string;
  }>;
}

export interface SupportMessage {
  id: number;
  request_id: number;
  sender_id: number;
  message: string;
  is_read: number;
  created_at: string;
  sender_username?: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  details: string;
  created_at: string;
  username: string;
  role: string;
}

export const support = {
  requestSupport: (message: string, shareJournal: boolean) =>
    apiRequest("/support/request", {
      method: "POST",
      body: JSON.stringify({ message, share_journal: shareJournal }),
    }),

  getMyRequest: () => apiRequest("/support/request/me"),

  getAllRequests: (status = "", search = "") =>
    apiRequest(`/support/requests?status=${status}&search=${encodeURIComponent(search)}`),

  getMessages: (requestId: number | string) =>
    apiRequest(`/support/requests/${requestId}/messages`),

  sendMessage: (requestId: number | string, message: string) =>
    apiRequest(`/support/requests/${requestId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  resolveRequest: (requestId: number | string) =>
    apiRequest(`/support/requests/${requestId}/resolve`, { method: "POST" }),

  getUnreadCount: () => apiRequest("/support/unread-count"),
};

// ─────────────────────────────────────────────
// ASISTENTE IA
// ─────────────────────────────────────────────
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function askAssistant(
  message: string,
  history: ChatMessage[] = [],
): Promise<{ reply: string }> {
  const trimmedHistory = history.slice(-10).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const data = await apiRequest("/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ message, history: trimmedHistory }),
  });

  return {
    reply: typeof data?.reply === "string" ? data.reply : "",
  };
}
