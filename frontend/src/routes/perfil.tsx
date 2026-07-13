import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMood, MOODS, type Mood } from "@/lib/mood";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Shield, Palette, Sparkles, Check, Globe, EyeOff, Music } from "lucide-react";
import { profile as profileApi } from "@/lib/api";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Mi perfil — Emowave" }] }),
  component: Perfil,
});

const PRESETS_AVATARS = [
  { emoji: "🧘", label: "Meditación" },
  { emoji: "🌸", label: "Flor de cerezo" },
  { emoji: "🌊", label: "Ola zen" },
  { emoji: "🍃", label: "Hojas" },
  { emoji: "☀️", label: "Sol" },
  { emoji: "🌙", label: "Luna" },
  { emoji: "🏔️", label: "Montaña" },
  { emoji: "🕊️", label: "Paloma de paz" },
];

const CUSTOM_COLOR_PRESETS = [
  { name: "Bosque Zen", color: "#2E7D32" },
  { name: "Atardecer Coral", color: "#E06B56" },
  { name: "Brisa Marina", color: "#3B82F6" },
  { name: "Arena Dorada", color: "#D97706" },
  { name: "Sueño Lavanda", color: "#8B5CF6" },
  { name: "Noche Estrellada", color: "#1E1B4B" },
];

function Perfil() {
  const { user, profile, setProfile, mood, setMood, offlineMode, authReady } = useMood();
  const navigate = useNavigate();

  // Estados de edición de perfil
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [alias, setAlias] = useState(user?.alias || "");
  const [avatar, setAvatar] = useState(user?.avatar || "🧘");
  const [visibility, setVisibility] = useState(user?.visibility || "publico");
  const [saving, setSaving] = useState(false);

  // Estados de color personalizado
  const [colorEnabled, setColorEnabled] = useState(profile.customColorEnabled || false);
  const [customColor, setCustomColor] = useState(profile.customColor || "#58B0A5");

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Efecto local para aplicar cambios de color en caliente mientras se edita (Live Preview)
  useEffect(() => {
    if (colorEnabled && customColor) {
      document.documentElement.setAttribute("data-custom-color-enabled", "true");
      document.documentElement.style.setProperty("--custom-primary", customColor);
    } else {
      document.documentElement.removeAttribute("data-custom-color-enabled");
      document.documentElement.style.removeProperty("--custom-primary");
    }
  }, [colorEnabled, customColor]);

  // Sincronizar estados locales con el perfil de la sesión cuando cambie
  useEffect(() => {
    if (profile) {
      setColorEnabled(profile.customColorEnabled || false);
      setCustomColor(profile.customColor || "#58B0A5");
    }
  }, [profile]);

  // Manejador para carga de imágenes locales desde la fototeca
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. El límite es de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        toast.success("Foto de fototeca cargada 📸");
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (authReady && !user) navigate({ to: "/auth" });
  }, [authReady, user, navigate]);

  if (!authReady || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Guardar preferencias de color en el profile
      const updatedProfile = {
        ...profile,
        customColorEnabled: colorEnabled,
        customColor: customColor,
      };
      await setProfile(updatedProfile);

      // 2. Guardar datos principales del perfil en el servidor
      if (!offlineMode) {
        await profileApi.updateProfile({
          name: name.trim(),
          bio: bio.trim(),
          alias: alias.trim(),
          avatar: avatar,
          visibility: visibility,
          profile_data: updatedProfile,
        });
      }

      toast.success("¡Perfil y preferencias visuales guardadas! 🌿");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">Preferencias y Apariencia</p>
          <h1 className="text-4xl font-serif mt-1">Configuración del Perfil</h1>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Información de Perfil */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-premium space-y-6">
              <h2 className="text-xl font-serif flex items-center gap-2 border-b border-border pb-3">
                <User className="w-5 h-5 text-primary" /> Información Personal
              </h2>

              {/* Avatar Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-secondary/30 border border-border/40">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary text-4xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                  {avatar.startsWith("http") || avatar.startsWith("data:image/") ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    avatar
                  )}
                </div>
                <div className="text-center sm:text-left space-y-2 flex-1">
                  <h3 className="font-semibold text-sm">Foto de Perfil / Avatar</h3>
                  <p className="text-xs text-muted-foreground">Elige un emoji zen, sube una foto de tu fototeca o introduce el enlace de una imagen.</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAvatarModalOpen(true)}
                      className="rounded-full"
                    >
                      Elegir Emoji Zen
                    </Button>
                    <label className="inline-flex items-center justify-center h-8 px-4 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs font-medium cursor-pointer transition-colors">
                      Subir de Fototeca 📸
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <Input
                      placeholder="Pegar enlace de imagen (HTTP/HTTPS)"
                      value={avatar.startsWith("http") ? avatar : ""}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="h-8 text-xs rounded-full max-w-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Campos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="perf-name">Nombre público</Label>
                  <Input
                    id="perf-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="perf-alias">Alias anónimo</Label>
                  <Input
                    id="perf-alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Ej: luna_calma"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="perf-bio">Biografía / Presentación</Label>
                <Textarea
                  id="perf-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti o tus objetivos de bienestar..."
                  className="min-h-[100px] rounded-xl"
                />
              </div>

              {/* Visibilidad */}
              <div className="space-y-3">
                <Label className="font-semibold block">Visibilidad de mi actividad</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition ${
                      visibility === "publico" ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-primary" /> Público
                      </span>
                      {visibility === "publico" && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Muestra tu nombre real en la comunidad y soporte.</p>
                    <input
                      type="radio"
                      name="visibility"
                      value="publico"
                      checked={visibility === "publico"}
                      onChange={() => setVisibility("publico")}
                      className="hidden"
                    />
                  </label>

                  <label
                    className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition ${
                      visibility === "alias" ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" /> Con Alias
                      </span>
                      {visibility === "alias" && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Muestra únicamente tu alias anónimo en comunidad y posts.</p>
                    <input
                      type="radio"
                      name="visibility"
                      value="alias"
                      checked={visibility === "alias"}
                      onChange={() => setVisibility("alias")}
                      className="hidden"
                    />
                  </label>

                  <label
                    className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition ${
                      visibility === "anonimo" ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-primary" /> Totalmente Anónimo
                      </span>
                      {visibility === "anonimo" && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Se te identificará como "Anónimo/a" de forma absoluta.</p>
                    <input
                      type="radio"
                      name="visibility"
                      value="anonimo"
                      checked={visibility === "anonimo"}
                      onChange={() => setVisibility("anonimo")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </Card>

            {/* Spotify Info Card */}
            <Card className="card-premium flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Spotify</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.spotifyConnected ? "Conexión OAuth 2.0 activa" : "Sin conectar"}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/spotify" })} className="rounded-full h-9 text-xs">
                Gestionar Conexión
              </Button>
            </Card>
          </div>

          {/* Columna Derecha: Tema, Mood y Color Personalizado */}
          <div className="space-y-6">
            <Card className="card-premium space-y-6">
              <h2 className="text-xl font-serif flex items-center gap-2 border-b border-border pb-3">
                <Palette className="w-5 h-5 text-primary" /> Tema y Apariencia
              </h2>

              {/* Selector de Mood del día */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
                  Mi Mood / Emoción del Día
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition ${
                        mood === m.id ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-secondary/40"
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-xs text-foreground truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Color Personalizado */}
              <div className="border-t border-border pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-color-toggle" className="font-medium text-sm flex items-center gap-1.5 cursor-pointer">
                    <Sparkles className="w-4 h-4 text-primary" /> Paleta de Colores Manual
                  </Label>
                  <input
                    id="custom-color-toggle"
                    type="checkbox"
                    checked={colorEnabled}
                    onChange={(e) => setColorEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                  />
                </div>

                {colorEnabled && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Elige un color primario para que la aplicación cambie su tema y gradientes visuales en tiempo real.
                    </p>

                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-2">
                      {CUSTOM_COLOR_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setCustomColor(p.color)}
                          className={`h-10 rounded-xl border flex items-center justify-center transition-all ${
                            customColor === p.color ? "ring-2 ring-primary ring-offset-2 scale-102" : "border-border hover:scale-102"
                          }`}
                          style={{ backgroundColor: p.color }}
                          title={p.name}
                        >
                          {customColor === p.color && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>

                    {/* Custom Color Picker */}
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/40">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                      />
                      <div>
                        <p className="text-xs font-semibold">Color personalizado</p>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase">{customColor}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Button
              type="submit"
              disabled={saving}
              className="w-full rounded-full py-6 font-medium text-base shadow-lg hover:shadow-xl transition-all btn-premium-primary"
            >
              {saving ? "Guardando..." : "Guardar Perfil y Tema"}
            </Button>
          </div>
        </form>
      </main>

      {/* Modal para selector de Emoji Zen */}
      <Dialog open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-6 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif">Elige un Emoji Zen</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 my-4">
            {PRESETS_AVATARS.map((av) => (
              <button
                key={av.emoji}
                type="button"
                onClick={() => {
                  setAvatar(av.emoji);
                  setAvatarModalOpen(false);
                }}
                className={`text-3xl p-3 rounded-2xl border transition-all hover:scale-105 ${
                  avatar === av.emoji ? "border-primary bg-primary/10" : "border-border/40 hover:bg-secondary"
                }`}
                title={av.label}
              >
                {av.emoji}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
