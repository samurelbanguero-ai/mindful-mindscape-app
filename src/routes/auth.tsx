import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMood } from "@/lib/mood";
import { useState } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Serena" }, { name: "description", content: "Crea tu espacio o entra a Serena." }] }),
  component: Auth,
});

function Auth() {
  const { login } = useMood();
  const navigate = useNavigate();

  // login
  const [li, setLi] = useState({ id: "", password: "" });
  // register
  const [rg, setRg] = useState({ email: "", username: "", password: "", anonymous: false });

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!li.id || !li.password) return toast.error("Completa los campos");
    const stored = localStorage.getItem("calm_account_" + li.id.toLowerCase());
    if (!stored) return toast.error("No encontramos esa cuenta");
    const acc = JSON.parse(stored);
    if (acc.password !== li.password) return toast.error("Contraseña incorrecta");
    login({ username: acc.username, email: acc.email, anonymous: acc.anonymous });
    toast.success(`Bienvenido/a, ${acc.anonymous ? "amigo/a anónimo/a" : acc.username} 🌿`);
    navigate({ to: "/app" });
  };

  const doRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rg.email || !rg.username || !rg.password) return toast.error("Completa los campos");
    if (rg.password.length < 6) return toast.error("Mínimo 6 caracteres en la contraseña");
    const key = "calm_account_" + rg.username.toLowerCase();
    if (localStorage.getItem(key)) return toast.error("Ese usuario ya existe");
    localStorage.setItem(key, JSON.stringify(rg));
    localStorage.setItem("calm_account_" + rg.email.toLowerCase(), JSON.stringify(rg));
    login({ username: rg.username, email: rg.email, anonymous: rg.anonymous });
    toast.success("Cuenta creada. Respira hondo, esto es tuyo 💚");
    navigate({ to: "/app" });
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-6 py-12" style={{ background: "var(--gradient-hero)" }}>
        <Card className="w-full max-w-md p-8 rounded-3xl border-0 shadow-2xl bg-card/95 backdrop-blur">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center mx-auto mb-3">
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <h1 className="text-3xl">Tu espacio en Serena</h1>
            <p className="text-sm text-muted-foreground mt-1">Privado, gratuito, sin juicios.</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={doLogin} className="space-y-4">
                <div>
                  <Label htmlFor="li-id">Correo o usuario</Label>
                  <Input id="li-id" value={li.id} onChange={(e) => setLi({ ...li, id: e.target.value })} placeholder="tu@correo.com" />
                </div>
                <div>
                  <Label htmlFor="li-pw">Contraseña</Label>
                  <Input id="li-pw" type="password" value={li.password} onChange={(e) => setLi({ ...li, password: e.target.value })} />
                </div>
                <Button type="submit" className="w-full rounded-full" size="lg">Entrar</Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={doRegister} className="space-y-4">
                <div>
                  <Label htmlFor="rg-email">Correo</Label>
                  <Input id="rg-email" type="email" value={rg.email} onChange={(e) => setRg({ ...rg, email: e.target.value })} placeholder="tu@correo.com" />
                </div>
                <div>
                  <Label htmlFor="rg-user">Nombre de usuario</Label>
                  <Input id="rg-user" value={rg.username} onChange={(e) => setRg({ ...rg, username: e.target.value })} placeholder="puede ser un alias" />
                </div>
                <div>
                  <Label htmlFor="rg-pw">Contraseña</Label>
                  <Input id="rg-pw" type="password" value={rg.password} onChange={(e) => setRg({ ...rg, password: e.target.value })} />
                </div>
                <label className="flex items-start gap-2 text-sm cursor-pointer p-3 rounded-xl bg-secondary/60">
                  <Checkbox checked={rg.anonymous} onCheckedChange={(v) => setRg({ ...rg, anonymous: !!v })} className="mt-0.5" />
                  <span>
                    <span className="font-medium block">Mantenerme anónimo/a</span>
                    <span className="text-muted-foreground text-xs">Tu nombre de usuario no se mostrará en la comunidad ni a profesionales.</span>
                  </span>
                </label>
                <Button type="submit" className="w-full rounded-full" size="lg">Crear mi espacio</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground mt-6">
            <Link to="/" className="underline">Volver al inicio</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
