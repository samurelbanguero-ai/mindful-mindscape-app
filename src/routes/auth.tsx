import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMood, type Role, type Visibility } from "@/lib/mood";
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

  const [li, setLi] = useState({ id: "", password: "" });
  const [rg, setRg] = useState({
    email: "", username: "", password: "",
    role: "usuario" as Role,
    visibility: "publico" as Visibility,
    alias: "",
  });

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!li.id || !li.password) return toast.error("Completa los campos");
    const stored = localStorage.getItem("serena_account_" + li.id.toLowerCase());
    if (!stored) return toast.error("No encontramos esa cuenta");
    const acc = JSON.parse(stored);
    if (acc.password !== li.password) return toast.error("Contraseña incorrecta");
    login({
      username: acc.username, email: acc.email,
      role: acc.role || "usuario",
      visibility: acc.visibility || (acc.anonymous ? "anonimo" : "publico"),
      alias: acc.alias,
      anonymous: acc.visibility === "anonimo" || !!acc.anonymous,
    });
    toast.success("Bienvenido/a 🌿");
    navigate({ to: acc.role === "psicologo" ? "/psicologo" : "/app" });
  };

  const doRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rg.email.trim() || !rg.username.trim() || !rg.password) return toast.error("Completa los campos");
    if (rg.password.length < 6) return toast.error("Mínimo 6 caracteres");
    if (rg.visibility === "alias" && !rg.alias.trim()) return toast.error("Escribe tu alias");
    const key = "serena_account_" + rg.username.toLowerCase();
    if (localStorage.getItem(key)) return toast.error("Ese usuario ya existe");
    const acc = { ...rg, anonymous: rg.visibility === "anonimo" };
    localStorage.setItem(key, JSON.stringify(acc));
    localStorage.setItem("serena_account_" + rg.email.toLowerCase(), JSON.stringify(acc));
    login({
      username: rg.username, email: rg.email,
      role: rg.role, visibility: rg.visibility, alias: rg.alias,
      anonymous: rg.visibility === "anonimo",
    });
    toast.success("Cuenta creada 💚");
    navigate({ to: rg.role === "psicologo" ? "/psicologo" : "/onboarding" });
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-6 py-12" style={{ background: "var(--gradient-hero)" }}>
        <Card className="w-full max-w-lg p-8 rounded-3xl border-0 shadow-2xl bg-card/95 backdrop-blur">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center mx-auto mb-3">
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-serif">Tu espacio en Serena</h1>
            <p className="text-sm text-muted-foreground mt-1">Privado, gratuito, sin juicios.</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={doLogin} className="space-y-4">
                <div><Label htmlFor="li-id">Correo o usuario</Label><Input id="li-id" value={li.id} onChange={(e) => setLi({ ...li, id: e.target.value })} placeholder="tu@correo.com" /></div>
                <div><Label htmlFor="li-pw">Contraseña</Label><Input id="li-pw" type="password" value={li.password} onChange={(e) => setLi({ ...li, password: e.target.value })} /></div>
                <Button type="submit" className="w-full rounded-full" size="lg">Entrar</Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={doRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label htmlFor="rg-email">Correo</Label><Input id="rg-email" type="email" maxLength={120} value={rg.email} onChange={(e) => setRg({ ...rg, email: e.target.value })} /></div>
                  <div><Label htmlFor="rg-user">Usuario</Label><Input id="rg-user" maxLength={30} value={rg.username} onChange={(e) => setRg({ ...rg, username: e.target.value })} /></div>
                </div>
                <div><Label htmlFor="rg-pw">Contraseña</Label><Input id="rg-pw" type="password" value={rg.password} onChange={(e) => setRg({ ...rg, password: e.target.value })} /></div>

                <div>
                  <Label className="mb-2 block">Soy</Label>
                  <RadioGroup value={rg.role} onValueChange={(v) => setRg({ ...rg, role: v as Role })} className="grid grid-cols-2 gap-2">
                    <label className={`p-3 rounded-xl border-2 cursor-pointer ${rg.role === "usuario" ? "border-primary bg-primary/5" : "border-border"}`}>
                      <RadioGroupItem value="usuario" className="sr-only" />
                      <p className="font-medium text-sm">Usuario</p>
                      <p className="text-xs text-muted-foreground">Quiero cuidarme</p>
                    </label>
                    <label className={`p-3 rounded-xl border-2 cursor-pointer ${rg.role === "psicologo" ? "border-primary bg-primary/5" : "border-border"}`}>
                      <RadioGroupItem value="psicologo" className="sr-only" />
                      <p className="font-medium text-sm">Psicólogo/a</p>
                      <p className="text-xs text-muted-foreground">Quiero acompañar</p>
                    </label>
                  </RadioGroup>
                </div>

                {rg.role === "usuario" && (
                  <div>
                    <Label className="mb-2 block">Cómo prefieres mostrarte</Label>
                    <RadioGroup value={rg.visibility} onValueChange={(v) => setRg({ ...rg, visibility: v as Visibility })} className="space-y-2">
                      <label className="flex items-start gap-2 p-3 rounded-xl bg-secondary/60 cursor-pointer">
                        <RadioGroupItem value="publico" className="mt-0.5" />
                        <span><span className="font-medium block text-sm">Mostrar mi usuario</span><span className="text-xs text-muted-foreground">Otros pueden verte como {rg.username || "tu usuario"}.</span></span>
                      </label>
                      <label className="flex items-start gap-2 p-3 rounded-xl bg-secondary/60 cursor-pointer">
                        <RadioGroupItem value="alias" className="mt-0.5" />
                        <span><span className="font-medium block text-sm">Usar un alias</span><span className="text-xs text-muted-foreground">Elige un nombre distinto para mostrarte.</span></span>
                      </label>
                      {rg.visibility === "alias" && (
                        <Input placeholder="Tu alias" value={rg.alias} maxLength={30} onChange={(e) => setRg({ ...rg, alias: e.target.value })} />
                      )}
                      <label className="flex items-start gap-2 p-3 rounded-xl bg-secondary/60 cursor-pointer">
                        <RadioGroupItem value="anonimo" className="mt-0.5" />
                        <span><span className="font-medium block text-sm">Anónimo/a</span><span className="text-xs text-muted-foreground">Tu identidad no se mostrará en ningún lugar.</span></span>
                      </label>
                    </RadioGroup>
                  </div>
                )}

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
