import { Link, useNavigate } from "@tanstack/react-router";
import { useMood, MOODS } from "@/lib/mood";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Palette, Heart, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { user, mood, setMood, logout } = useMood();
  const navigate = useNavigate();
  const current = MOODS.find((m) => m.id === mood)!;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-sm group-hover:scale-105 transition">
            <Heart className="w-4 h-4" fill="currentColor" />
          </div>
          <span className="font-serif text-xl">Serena</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="/#como-funciona" className="hover:text-foreground transition">Cómo funciona</a>
          <a href="/#emociones" className="hover:text-foreground transition">Emociones</a>
          <a href="/#recursos" className="hover:text-foreground transition">Recursos</a>
          <a href="/#sobre" className="hover:text-foreground transition">Sobre</a>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">{current.emoji} {current.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>¿Cómo te sientes hoy?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MOODS.map((m) => (
                <DropdownMenuItem key={m.id} onClick={() => setMood(m.id)} className="cursor-pointer">
                  <span className="mr-2 text-lg">{m.emoji}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-xs text-muted-foreground">{m.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/app" })}>Mi diario</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/" }); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate({ to: "/auth" })}>Entrar</Button>
          )}
        </div>
      </div>
    </header>
  );
}
