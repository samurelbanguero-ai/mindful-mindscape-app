import { Link, useNavigate } from "@tanstack/react-router";
import { useMood, MOODS, displayAuthor } from "@/lib/mood";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Palette, Heart, LogOut, User as UserIcon, Sparkles, Menu } from "lucide-react";
import SettingsMenu from "./SettingsMenu";
import { useState } from "react";

// ✅ FIX: solo un tipo de export — named export, consistente con los imports en rutas
export function Navbar() {
  const { user, authReady, mood, setMood, logout, supportUnreadCount } = useMood();
  const navigate = useNavigate();
  const current = MOODS.find((m) => m.id === mood) ?? MOODS[0];
  const isPsico = user?.role === "psicologo";
  const isAdmin = user?.role === "admin";
  const hasSession = Boolean(user);
  const isAnon = user?.visibility === "anonimo";
  const accountLabel = user ? (isAnon ? "Anónimo" : displayAuthor(user, false)) : "Cuenta";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Links según rol
  const guestLinks = [
    { to: "/" as const, hash: "como-funciona", label: "Cómo funciona" },
    { to: "/" as const, hash: "beneficios", label: "Beneficios" },
    { to: "/recursos" as const, label: "Recursos" },
    { to: "/contacto" as const, label: "Contacto" },
  ];

  const userLinks = [
    { to: "/app" as const, label: "Mi diario" },
    { to: "/diario" as const, label: "Diario IA" },
    { to: "/moodboard" as const, label: "Moodboard" },
    { to: "/comunidad" as const, label: "Comunidad" },
    { to: "/spotify" as const, label: "Spotify" },
    { to: "/recomendaciones" as const, label: "Para ti" },
  ];

  const proLinks = [
    { to: "/psicologo" as const, label: isAdmin ? "Panel de Control" : "Panel profesional" },
    { to: "/comunidad" as const, label: "Comunidad" },
  ];

  const activeLinks = !hasSession ? guestLinks : isPsico || isAdmin ? proLinks : userLinks;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-sm group-hover:scale-105 transition">
            <Heart className="w-4 h-4" fill="currentColor" />
          </div>
          <span className="font-serif text-xl">Emowave</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {activeLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              hash={"hash" in link ? link.hash : undefined}
              className="hover:text-foreground transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Selector de paleta emocional */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {current.emoji} {current.label}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Paleta según emoción</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MOODS.map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className="cursor-pointer"
                >
                  <span className="mr-2 text-lg">{m.emoji}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-xs text-muted-foreground">{m.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Usuario autenticado */}
          {hasSession ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 flex relative rounded-full pl-2 pr-3 py-1.5">
                    <div className="w-5.5 h-5.5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                      {accountLabel.charAt(0)}
                    </div>
                    <span className="max-w-[100px] truncate text-xs font-medium">{accountLabel}</span>
                    {supportUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {supportUnreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {user && !isPsico && !isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate({ to: "/app" })}>
                        Mi diario
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: "/diario" })}>
                        <Sparkles className="w-4 h-4 mr-2" /> Diario con IA
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: "/moodboard" })}>
                        Mi moodboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: "/perfil" })}>
                        Mi perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: "/spotify" })}>
                        Spotify
                      </DropdownMenuItem>
                    </>
                  )}
                  {user && (isPsico || isAdmin) && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/psicologo" })}>
                      {isAdmin ? "Panel de Control" : "Panel profesional"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate({ to: "/" });
                    }}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <SettingsMenu />
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => navigate({ to: "/auth", search: { action: "login" } })}>
                Entrar
              </Button>
              <SettingsMenu />
            </>
          )}

          {/* ✅ FIX: menú hamburguesa para mobile */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 mt-6">
                <p className="text-xs text-muted-foreground font-medium mb-2 px-2">Navegación</p>
                {activeLinks.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Link
                      to={link.to}
                      hash={"hash" in link ? link.hash : undefined}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}

                {hasSession && (
                  <>
                    <div className="h-px bg-border my-3" />
                    <p className="text-xs text-muted-foreground font-medium mb-2 px-2">Cuenta</p>
                    {user && !isPsico && !isAdmin && (
                      <SheetClose asChild>
                        <button
                          className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition text-left"
                          onClick={() => {
                            navigate({ to: "/perfil" });
                            setMobileOpen(false);
                          }}
                        >
                          <UserIcon className="w-4 h-4 mr-2" /> Mi perfil
                        </button>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <button
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition text-left text-destructive"
                        onClick={() => {
                          logout();
                          navigate({ to: "/" });
                          setMobileOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                      </button>
                    </SheetClose>
                  </>
                )}

                {!hasSession && (
                  <>
                    <div className="h-px bg-border my-3" />
                    <SheetClose asChild>
                      <Button
                        className="mx-2"
                        onClick={() => {
                          navigate({ to: "/auth", search: { action: "login" } });
                          setMobileOpen(false);
                        }}
                      >
                        Entrar
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// ✅ FIX: export default para compatibilidad con imports existentes
export default Navbar;
