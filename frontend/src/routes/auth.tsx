import { createFileRoute, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMood, type Role, type Visibility } from "@/lib/mood";
import { auth as authApi, getToken, setToken, clearToken } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Heart, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Emowave" },
      { name: "description", content: "Crea tu espacio o entra a Emowave." },
    ],
  }),
  component: Auth,
});

const localKey = (id: string) => `emowave_acc_${id.toLowerCase()}`;

type LocalAccount = {
  username: string;
  email: string;
  role: Role;
  visibility: Visibility;
  alias: string;
};

function saveLocalAccount(acc: LocalAccount) {
  const data = JSON.stringify(acc);
  localStorage.setItem(localKey(acc.username), data);
  localStorage.setItem(localKey(acc.email), data);
}

function loadLocalAccount(id: string): LocalAccount | null {
  try {
    const stored = localStorage.getItem(localKey(id));
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Subcomponente OtpVerification integrado
function OtpVerification({
  email,
  code,
  onChangeCode,
  onSubmit,
  onResend,
  onBackToLogin,
  loading
}: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-medium" id="otp-title">Verifica tu correo electrónico</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Hemos enviado un código OTP de 6 dígitos al correo: <strong className="text-foreground">{email}</strong>.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" aria-labelledby="otp-title">
        <div>
          <Label htmlFor="otp-code">Código de verificación</Label>
          <Input
            id="otp-code"
            maxLength={6}
            value={code}
            onChange={(e) => onChangeCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="text-center text-2xl tracking-widest font-mono"
            autoComplete="one-time-code"
            aria-required="true"
            aria-label="Código de verificación de 6 dígitos"
          />
        </div>

        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading ? "Verificando…" : "Activar cuenta"}
        </Button>
      </form>

      <div className="flex flex-col space-y-3 text-center text-sm">
        <button
          type="button"
          onClick={onResend}
          className="text-primary hover:underline font-medium"
          disabled={loading}
          aria-label="Reenviar código de verificación por correo"
        >
          ¿No recibiste el código? Solicitar reenvío
        </button>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Volver a la pantalla de inicio de sesión"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}

// Subcomponente ForgotPasswordForm integrado
function ForgotPasswordForm({
  email,
  onChangeEmail,
  onSubmit,
  onBackToLogin,
  loading
}: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-medium" id="forgot-title">¿Olvidaste tu contraseña?</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecerla.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" aria-labelledby="forgot-title">
        <div>
          <Label htmlFor="forgot-email">Correo electrónico</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="tu@correo.com"
            autoComplete="email"
            aria-required="true"
          />
        </div>

        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading ? "Enviando enlace…" : "Recuperar contraseña"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-primary hover:underline font-medium"
          aria-label="Volver a la pantalla de inicio de sesión"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}

// Subcomponente ResetPasswordForm integrado
function ResetPasswordForm({
  email,
  otpVal,
  onChangeOtp,
  passwordVal,
  onChangePassword,
  confirmPasswordVal,
  onChangeConfirmPassword,
  onSubmit,
  onBackToLogin,
  loading
}: any) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-medium" id="reset-title">Restablecer contraseña</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Hemos enviado un código OTP de 6 dígitos a: <strong className="text-foreground">{email}</strong>.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" aria-labelledby="reset-title">
        <div>
          <Label htmlFor="reset-otp">Código OTP (6 dígitos)</Label>
          <Input
            id="reset-otp"
            maxLength={6}
            value={otpVal}
            onChange={(e) => onChangeOtp(e.target.value)}
            placeholder="123456"
            className="text-center font-mono text-xl tracking-[0.25em]"
            aria-required="true"
          />
        </div>

        <div>
          <Label htmlFor="reset-pw">Nueva contraseña</Label>
          <div className="relative">
            <Input
              id="reset-pw"
              type={showPw ? "text" : "password"}
              value={passwordVal}
              onChange={(e) => onChangePassword(e.target.value)}
              placeholder="Mínimo 8 chars, 1 Mayus, 1 Núm, 1 Símb"
              autoComplete="new-password"
              className="pr-10"
              aria-required="true"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirm-pw">Confirmar nueva contraseña</Label>
          <div className="relative">
            <Input
              id="confirm-pw"
              type={showConfirmPw ? "text" : "password"}
              value={confirmPasswordVal}
              onChange={(e) => onChangeConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              className="pr-10"
              aria-required="true"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPw((v) => !v)}
              aria-label={showConfirmPw ? "Ocultar confirmación" : "Mostrar confirmación"}
            >
              {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full rounded-full btn-premium" size="lg" disabled={loading}>
          {loading ? "Restableciendo…" : "Restablecer contraseña"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Volver a la pantalla de inicio de sesión"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}

function Auth() {
  const { login } = useMood();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register" | "otp" | "forgot" | "reset">("login");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");

  const [li, setLi] = useState({ id: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [rg, setRg] = useState({
    email: "",
    username: "",
    password: "",
    role: "usuario" as Role,
    visibility: "publico" as Visibility,
    alias: "",
  });
  const [showRgPw, setShowRgPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const email = params.get("email");
    const action = params.get("action");
    if (token && email) {
      setResetToken(token);
      setResetEmail(decodeURIComponent(email));
      setMode("reset");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (action === "login") {
      setMode("login");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!li.id.trim() || !li.password) return toast.error("Completa los campos");
    setLoading(true);

    try {
      const res = await authApi.login(li.id.trim(), li.password);
      login(res.user, res.token || res.accessToken);
      const nameToDisplay = res.user.visibility === "anonimo" ? "Anónimo/a" : (res.user.name || res.user.alias || res.user.username);
      toast.success(`Bienvenido/a, ${nameToDisplay} 🌿`);
      navigate({
        to: res.user.role === "psicologo" || res.user.role === "admin" ? "/psicologo" : "/app",
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      
      if (errMsg.includes("verificar") || errMsg.includes("OTP")) {
        const matchingAcc = loadLocalAccount(li.id.trim());
        setOtpEmail(matchingAcc ? matchingAcc.email : li.id.trim());
        setMode("otp");
        toast.info("Ingresa el código OTP enviado a tu correo.");
        return;
      }

      const acc = loadLocalAccount(li.id.trim());
      if (!acc) {
        toast.error(errMsg || "No encontramos esa cuenta. Verifica el servidor.");
      } else {
        login({
          id: 0,
          username: acc.username,
          email: acc.email,
          role: acc.role || "usuario",
          visibility: acc.visibility || "publico",
          alias: acc.alias,
          anonymous: acc.visibility === "anonimo",
        });
        toast.info("Modo sin conexión activado 📶");
        navigate({ to: acc.role === "psicologo" || acc.role === "admin" ? "/psicologo" : "/app" });
      }
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rg.email.trim() || !rg.username.trim() || !rg.password) {
      return toast.error("Completa todos los campos");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rg.email)) {
      return toast.error("Formato de email inválido");
    }
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
    if (!passwordStrengthRegex.test(rg.password)) {
      return toast.error("La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo (@$!%*?&_).");
    }
    if (rg.visibility === "alias" && !rg.alias.trim()) {
      return toast.error("Escribe tu alias");
    }

    setLoading(true);

    try {
      await authApi.register(
        rg.email.trim(),
        rg.username.trim(),
        rg.password,
        rg.username.trim(),
        rg.role,
        rg.visibility,
        rg.alias.trim(),
      );

      saveLocalAccount({
        username: rg.username.trim(),
        email: rg.email.trim(),
        role: rg.role,
        visibility: rg.visibility,
        alias: rg.alias.trim(),
      });

      toast.success("¡Cuenta registrada! Te enviamos un código OTP 🌿");
      setOtpEmail(rg.email.trim());
      setMode("otp");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || "Error al registrar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const doVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return toast.error("Ingresa el código OTP");

    setLoading(true);
    try {
      await authApi.verifyEmail(otpEmail, otpCode.trim());
      toast.success("¡Correo verificado con éxito! ya puedes entrar 💚");
      setLi({ ...li, id: otpEmail });
      setMode("login");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || "Código incorrecto o expirado");
    } finally {
      setLoading(false);
    }
  };

  const doResendOtp = async () => {
    if (!otpEmail) return toast.error("No hay un correo electrónico definido");

    setLoading(true);
    try {
      await authApi.resendVerification(otpEmail);
      toast.success("Código de verificación reenviado.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || "Error al reenviar el código.");
    } finally {
      setLoading(false);
    }
  };

  const doRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return toast.error("Ingresa tu correo");

    setLoading(true);
    try {
      const res = await authApi.recoverPassword(forgotEmail.trim());
      toast.success(res.message || "Código enviado a tu bandeja de entrada.");
      setResetEmail(forgotEmail.trim());
      setMode("reset");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || "Error al solicitar recuperación");
    } finally {
      setLoading(false);
    }
  };

  const doResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim()) return toast.error("Ingresa el código OTP de 6 dígitos");
    if (!resetPasswordVal) return toast.error("Ingresa tu nueva contraseña");
    if (resetPasswordVal !== confirmPasswordVal) {
      return toast.error("Las contraseñas no coinciden");
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
    if (!passwordStrengthRegex.test(resetPasswordVal)) {
      return toast.error("La contraseña debe tener mínimo 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.");
    }

    setLoading(true);
    try {
      await authApi.resetPassword(resetEmail, resetOtp.trim(), resetPasswordVal);
      toast.success("Contraseña restablecida con éxito. Ya puedes iniciar sesión.");
      setLi({ ...li, id: resetEmail });
      setMode("login");
      // Limpiar campos
      setResetOtp("");
      setResetPasswordVal("");
      setConfirmPasswordVal("");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || "Código OTP vencido o no válido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div
        className="min-h-[calc(100vh-4rem)] grid place-items-center px-6 py-12"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Card className="w-full max-w-lg p-8 rounded-3xl border-0 shadow-2xl bg-card/95 backdrop-blur card-hover-premium transition-all duration-300">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center mx-auto mb-3">
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-serif">Tu espacio en Emowave</h1>
            <p className="text-sm text-muted-foreground mt-1">Privado, gratuito, sin juicios.</p>
          </div>

          {mode === "otp" && (
            <OtpVerification
              email={otpEmail}
              code={otpCode}
              onChangeCode={setOtpCode}
              onSubmit={doVerifyOtp}
              onResend={doResendOtp}
              onBackToLogin={() => setMode("login")}
              loading={loading}
            />
          )}

          {mode === "forgot" && (
            <ForgotPasswordForm
              email={forgotEmail}
              onChangeEmail={setForgotEmail}
              onSubmit={doRecoverPassword}
              onBackToLogin={() => setMode("login")}
              loading={loading}
            />
          )}

          {mode === "reset" && (
            <ResetPasswordForm
              email={resetEmail}
              otpVal={resetOtp}
              onChangeOtp={setResetOtp}
              passwordVal={resetPasswordVal}
              onChangePassword={setResetPasswordVal}
              confirmPasswordVal={confirmPasswordVal}
              onChangeConfirmPassword={setConfirmPasswordVal}
              onSubmit={doResetPassword}
              onBackToLogin={() => setMode("login")}
              loading={loading}
            />
          )}

          {(mode === "login" || mode === "register") && (
            <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Crear cuenta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={doLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="li-id">Correo o usuario</Label>
                    <Input
                      id="li-id"
                      value={li.id}
                      onChange={(e) => setLi({ ...li, id: e.target.value })}
                      placeholder="tu@correo.com"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label htmlFor="li-pw" className="mb-0">Contraseña</Label>
                      <span
                        onClick={() => setMode("forgot")}
                        className="text-xs text-primary hover:underline cursor-pointer focus:outline-none"
                        aria-label="Recuperar contraseña olvidada"
                      >
                        ¿Olvidaste tu contraseña?
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="li-pw"
                        type={showPw ? "text" : "password"}
                        value={li.password}
                        onChange={(e) => setLi({ ...li, password: e.target.value })}
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPw((v) => !v)}
                        aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
                    {loading ? "Entrando…" : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={doRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="rg-email">Correo electrónico</Label>
                    <Input
                      id="rg-email"
                      type="email"
                      value={rg.email}
                      onChange={(e) => setRg({ ...rg, email: e.target.value })}
                      placeholder="tu@correo.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rg-user">Nombre de usuario</Label>
                    <Input
                      id="rg-user"
                      value={rg.username}
                      onChange={(e) => setRg({ ...rg, username: e.target.value })}
                      placeholder="usuario123"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rg-pw">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="rg-pw"
                        type={showRgPw ? "text" : "password"}
                        value={rg.password}
                        onChange={(e) => setRg({ ...rg, password: e.target.value })}
                        autoComplete="new-password"
                        placeholder="Mínimo 8 chars, 1 Mayus, 1 Núm, 1 Símb"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowRgPw((v) => !v)}
                        aria-label={showRgPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showRgPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">¿Cómo quieres aparecer?</Label>
                    <RadioGroup
                      value={rg.visibility}
                      onValueChange={(v) => setRg({ ...rg, visibility: v as Visibility })}
                      className="space-y-2"
                    >
                      {[
                        {
                          value: "publico",
                          label: "Con mi usuario",
                          desc: "Tu nombre de usuario es visible",
                        },
                        { value: "alias", label: "Con alias", desc: "Elige un apodo diferente" },
                        {
                          value: "anonimo",
                          label: "Anónimo/a",
                          desc: "Sin identidad en la comunidad",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          className="flex items-center space-x-2 p-3 rounded-xl border border-border hover:bg-secondary/50 cursor-pointer"
                        >
                          <RadioGroupItem value={opt.value} id={`vis-${opt.value}`} />
                          <Label htmlFor={`vis-${opt.value}`} className="cursor-pointer flex-1">
                            <span className="font-medium">{opt.label}</span>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {rg.visibility === "alias" && (
                    <div>
                      <Label htmlFor="rg-alias">Tu alias</Label>
                      <Input
                        id="rg-alias"
                        value={rg.alias}
                        onChange={(e) => setRg({ ...rg, alias: e.target.value })}
                        placeholder="Ej: CieloDeTormenta"
                        maxLength={30}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
                    {loading ? "Creando cuenta…" : "Crear mi espacio"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Al registrarte aceptas nuestros{" "}
                    <Link to="/contacto" className="underline hover:text-foreground">
                      términos de uso
                    </Link>
                    .
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
}
