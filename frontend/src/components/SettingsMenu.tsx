import { useEffect, useRef, useState } from "react";
import { useMood, MOODS, type Mood } from "@/lib/mood";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, User, Lock, Moon, Sun, Palette, Shield, Eye, EyeOff } from "lucide-react";

type Theme = "light" | "dark";

export default function SettingsMenu() {
  const { user, mood, setMood, logout, updateAccount, offlineMode } = useMood();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "privacy">("appearance");

  // Campos de privacidad
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  // Sincronizar campo de username si cambia el usuario
  useEffect(() => {
    if (user?.username) {
      setNewUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    setOpen(false);
  };

  const handleOpenModal = (tab: "appearance" | "privacy") => {
    setActiveTab(tab);
    setModalOpen(true);
    setOpen(false);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return toast.error("El nombre de usuario es obligatorio");
    if (newUsername.trim().length < 3) return toast.error("El nombre de usuario debe tener mínimo 3 caracteres");
    if (newPassword && newPassword.length < 6) return toast.error("La contraseña debe tener mínimo 6 caracteres");

    setSaving(true);
    try {
      await updateAccount(newUsername.trim(), newPassword ? newPassword : undefined);
      toast.success("Credenciales de cuenta actualizadas con éxito 🔒");
      setNewPassword("");
      setModalOpen(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || "Error al actualizar cuenta");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    setModalOpen(false);
    navigate({ to: "/" });
    toast.success("Sesión cerrada correctamente. ¡Vuelve pronto! 🌿");
  };

  const currentMood = MOODS.find((m) => m.id === mood) ?? MOODS[0];

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-secondary/80 transition-all text-foreground/80 hover:text-foreground text-lg cursor-pointer"
        aria-label="Configuración"
        title="Configuración"
      >
        ⚙️
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-card border border-border shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1.5 space-y-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-foreground hover:bg-secondary transition cursor-pointer"
            >
              <span className="text-base">{theme === "light" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}</span>
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </button>

            {user && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenModal("appearance")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-foreground hover:bg-secondary transition cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-primary" />
                  Cambiar tema/mood
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenModal("privacy")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-foreground hover:bg-secondary transition cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-primary" />
                  Privacidad y Seguridad
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: "/perfil" });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-foreground hover:bg-secondary transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-primary" />
                  Editar mi perfil
                </button>

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-destructive hover:bg-destructive/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog de Configuración y Privacidad Avanzado */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-3xl p-6 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              ⚙️ Centro de Configuración
            </DialogTitle>
          </DialogHeader>

          {/* Selector de pestañas */}
          <div className="flex border-b border-border my-4">
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex-1 pb-2.5 text-sm font-medium border-b-2 text-center transition ${
                activeTab === "appearance" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Apariencia y Temas
            </button>
            {user && (
              <button
                onClick={() => setActiveTab("privacy")}
                className={`flex-1 pb-2.5 text-sm font-medium border-b-2 text-center transition ${
                  activeTab === "privacy" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Privacidad y Cuenta
              </button>
            )}
          </div>

          {activeTab === "appearance" && (
            <div className="space-y-6 py-2">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
                  Tema del sistema
                </Label>
                <div className="flex gap-3">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex-1 rounded-2xl gap-2 py-5"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="w-4 h-4" /> Claro
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex-1 rounded-2xl gap-2 py-5"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="w-4 h-4" /> Oscuro
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
                  Paleta de Emoción Activa ({currentMood.emoji} {currentMood.label})
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMood(m.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition ${
                        mood === m.id ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-secondary/40"
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-foreground truncate">{m.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setModalOpen(false)}
                  className="rounded-full px-6 cursor-pointer"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}

          {activeTab === "privacy" && user && (
            <form onSubmit={handleSaveAccount} className="space-y-4 py-2">
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-2.5 text-xs text-foreground/80 leading-relaxed mb-1">
                <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Estas son tus credenciales de seguridad de Emowave. Para cambiar tu nombre público o alias, ve a <strong>Editar mi perfil</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-username">Nombre de usuario</Label>
                <Input
                  id="set-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ej: admin"
                  disabled={offlineMode || saving}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-pw">Nueva contraseña (deja en blanco para no cambiar)</Label>
                <div className="relative">
                  <Input
                    id="set-pw"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={offlineMode || saving}
                    className="rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="pt-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="rounded-full px-6"
                  disabled={saving || offlineMode}
                >
                  {saving ? "Guardando…" : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
