import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMood, MOODS, getParentMood } from "@/lib/mood";
import { useEffect, useState, useMemo } from "react";
import { Info, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, getToken, spotify as spotifyApi, auth as authApi } from "@/lib/api";

export const Route = createFileRoute("/spotify")({
  head: () => ({ meta: [{ title: "Spotify — Emowave" }] }),
  component: Spot,
});

const SAMPLE = {
  artists: ["Aurora", "Bon Iver", "Hammock", "Ludovico Einaudi"]
};

// Icono SVG real de Spotify oficial
function SpotifyIcon({ className = "w-6 h-6", color = "#1DB954" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color} aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.3c-.22.36-.68.47-1.04.25-2.92-1.78-6.6-2.18-10.93-1.2-.4.1-.8-.16-.9-.55-.1-.4.17-.8.56-.9 4.75-1.09 8.81-.63 12.06 1.35.36.22.48.68.25 1.04zm1.46-3.26c-.27.44-.86.58-1.3.3-3.34-2.05-8.43-2.65-12.38-1.45-.5.15-1.02-.13-1.17-.63-.15-.5.13-1.02.63-1.17 4.52-1.37 10.13-.7 13.93 1.63.44.28.58.87.3 1.32zm.12-3.38C15.22 8.4 8.89 8.18 5.23 9.29c-.56.17-1.15-.15-1.32-.7-.17-.56.15-1.15.7-1.32 4.2-1.27 11.2-.99 15.65 1.66.5.3.67.95.37 1.46-.3.5-.95.67-1.46.37z"/>
    </svg>
  );
}

function Spot() {
  const { user, profile, mood, disconnectSpotify } = useMood();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Leer query params de redirección
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("spotify_connected");
      const err = params.get("error");

      if (status === "success") {
        toast.success("¡Spotify conectado con éxito! 🎧");
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.reload();
      } else if (status === "error") {
        toast.error(`Error al conectar con Spotify: ${err || "Inténtalo de nuevo"}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  const parentMood = useMemo(() => {
    return getParentMood(mood) || "calma";
  }, [mood]);

  // Cargar playlists reales
  useEffect(() => {
    const loadPlaylists = async () => {
      if (!profile.spotifyConnected || !user) return;
      setLoading(true);
      setFetchError(null);
      try {
        const res = await spotifyApi.getPlaylists(parentMood);
        setPlaylists(res.playlists || []);
      } catch (err: unknown) {
        console.error("Error loading spotify playlists:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setFetchError(
          errMsg ||
            "No se pudieron cargar las playlists. Posiblemente expiró la sesión de Spotify.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, [profile.spotifyConnected, parentMood, user]);

  if (!user) return null;

  const connect = async () => {
    let token = getToken();
    if (!token) {
      setLoading(true);
      try {
        // Intentar refresh de sesión silencioso llamando al endpoint getMe
        const meRes = await authApi.getMe();
        token = getToken();
      } catch (err) {
        console.warn("Intento de refresh automático falló", err);
      } finally {
        setLoading(false);
      }
    }

    if (!token) {
      toast.error("Debes iniciar sesión de nuevo para sincronizar con Spotify.");
      return;
    }
    // Redirigir a la URL del backend que inicia el flujo de Spotify OAuth
    window.location.href = `${getApiUrl()}/auth/spotify?token=${token}`;
  };

  const handleDisconnect = async () => {
    try {
      await disconnectSpotify();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || "Error al desconectar");
    }
  };

  const m = MOODS.find((x) => x.id === mood) || MOODS[0];

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Música para tu estado</p>
          <h1 className="text-4xl font-serif mt-1 flex items-center gap-2">
            <SpotifyIcon className="w-9 h-9" /> Spotify
          </h1>
        </div>

        <Card className="p-3 rounded-2xl border-0 bg-accent/40 flex items-start gap-3 text-sm">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-foreground/70">
            Conexión oficial con la API de Spotify. Las recomendaciones se basan en tu emoción
            actual.
          </p>
        </Card>

        {!profile.spotifyConnected ? (
          <Card className="card-premium text-center py-10">
            <SpotifyIcon className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-2">Conecta tu Spotify</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Para recomendarte playlists reales según cómo te sientes y los géneros que disfrutas.
            </p>
            <Button onClick={connect} size="lg" className="rounded-full px-8 btn-premium" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Conectar con Spotify
            </Button>
          </Card>
        ) : (
          <>
            <Card className="card-premium flex items-center justify-between hover:transform-none hover:shadow-sm">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Cuenta vinculada con Spotify</p>
                  <p className="text-xs text-muted-foreground">Flujo seguro OAuth 2.0</p>
                </div>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 rounded-full px-4"
              >
                Desconectar
              </Button>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Recomendaciones para {m.label} {m.emoji}</h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : fetchError ? (
                <Card className="p-6 border border-destructive/20 bg-destructive/5 text-destructive text-sm rounded-2xl">
                  {fetchError}
                </Card>
              ) : playlists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No encontramos playlists específicas en este momento.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {playlists.map((p) => (
                    <Card key={p.url} className="card-premium flex gap-4 items-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                          <SpotifyIcon className="w-7 h-7" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate text-sm">{p.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {p.description || "Playlist recomendada de Spotify."}
                        </p>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary font-medium hover:underline mt-2 inline-block"
                        >
                          Escuchar en Spotify
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Card className="card-premium">
                <h3 className="font-medium mb-3">Tus artistas favoritos</h3>
                <ul className="space-y-2 text-sm">
                  {SAMPLE.artists.map((a) => (
                    <li key={a} className="p-2 rounded-lg bg-secondary/40">
                      {a}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="card-premium">
                <h3 className="font-medium mb-3">Géneros preferidos</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.genres && profile.genres.length ? profile.genres : ["Indie", "Pop", "Lo-fi"]).map((g) => (
                    <span key={g} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
export { Spot };
export default Spot;
