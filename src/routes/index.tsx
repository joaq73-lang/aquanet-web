import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  AlertTriangle,
  MapPin,
  FileText,
  ClipboardList,
  FileCheck,
  Megaphone,
  ChevronRight,
  Scissors,
  Lightbulb,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import Chatbot from "@/components/Chatbot";
import sedapalLogo from "../assets/sedapal-logo-new.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AQUANET — Oficina Virtual SEDAPAL" },
      {
        name: "description",
        content: "Realiza pagos, reporta incidencias y gestiona tus trámites de agua en línea.",
      },
      { property: "og:title", content: "AQUANET — Oficina Virtual" },
      { property: "og:description", content: "Plataforma virtual para clientes de SEDAPAL." },
    ],
  }),
  component: Index,
});

const services = [
  { icon: CreditCard, title: "Realizar Pago", desc: "Paga tus recibos de manera fácil y segura." },
  {
    icon: AlertTriangle,
    title: "Incidencias",
    desc: "Reporta y revisa problemas técnicos o averías en la red.",
  },
  {
    icon: MapPin,
    title: "Puntos de pago físicos",
    desc: "Encuentra los centros y agencias autorizadas más cercanos.",
  },
  {
    icon: FileText,
    title: "Historial de Facturación",
    desc: "Consulta tu saldo, consumos anteriores y últimos recibos.",
  },
  {
    icon: ClipboardList,
    title: "Registrar Reclamo",
    desc: "Reporta problemas comerciales o incidencias del servicio.",
  },
  {
    icon: FileCheck,
    title: "Trámites y Certificados",
    desc: "Solicita nuevos servicios, conexiones o documentos.",
  },
];

const quickLinks = [
  { icon: Scissors, label: "Cortes Programados" },
  { icon: Lightbulb, label: "Consejos de Ahorro" },
  { icon: HelpCircle, label: "Preguntas Frecuentes" },
];

type AuthView = "login" | "register" | "forgot";

type RegisterForm = {
  suministro: string;
  referencia: string;
  documentoTipo: string;
  documentoNumero: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  correo: string;
  password: string;
  repetirPassword: string;
};

const initialRegisterForm: RegisterForm = {
  suministro: "",
  referencia: "",
  documentoTipo: "",
  documentoNumero: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
  correo: "",
  password: "",
  repetirPassword: "",
};

function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [loginEmail, setLoginEmail] = useState("prueba@aquanet.test");
  const [loginPassword, setLoginPassword] = useState("Test1234!");
  const [registerForm, setRegisterForm] = useState<RegisterForm>(initialRegisterForm);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNotifications, setAcceptNotifications] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const storedSession = window.localStorage.getItem("aquanet-auth");
    setIsAuthenticated(storedSession === "true");
  }, []);

  const passwordChecks = useMemo(() => {
    const password = registerForm.password;
    const checks = {
      length: password.length > 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };

    return {
      ...checks,
      isValid: checks.length && checks.upper && checks.lower && checks.number,
    };
  }, [registerForm.password]);

  const hasSuministro = Boolean(registerForm.suministro.trim());
  const stepAValid = Boolean(registerForm.suministro.trim() && registerForm.referencia.trim());
  const stepBValid = Boolean(
    stepAValid && registerForm.documentoTipo && registerForm.documentoNumero.trim().length >= 6,
  );
  const stepCValid = Boolean(
    stepBValid &&
    registerForm.nombres.trim() &&
    registerForm.apellidoPaterno.trim() &&
    registerForm.apellidoMaterno.trim() &&
    registerForm.telefono.trim().length >= 7,
  );
  const stepDValid = Boolean(
    stepCValid &&
    registerForm.correo.trim() &&
    /.+@.+\..+/.test(registerForm.correo) &&
    passwordChecks.isValid &&
    registerForm.password === registerForm.repetirPassword &&
    acceptTerms,
  );

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.statusMessage || "No se pudo iniciar sesión"}`);
        return;
      }

      const data = await response.json();
      window.localStorage.setItem("aquanet-auth", "true");
      window.localStorage.setItem("aquanet-token", data.token);
      window.localStorage.setItem("aquanet-user", JSON.stringify(data.usuario));
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error de conexión. Por favor, intenta de nuevo.");
    }
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stepDValid) return;
    window.localStorage.setItem("aquanet-auth", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    window.localStorage.removeItem("aquanet-auth");
    setIsAuthenticated(false);
    setAuthView("login");
    setLoginEmail("");
    setLoginPassword("");
    setRegisterForm(initialRegisterForm);
    setAcceptTerms(false);
    setAcceptNotifications(false);
  };

  const updateRegisterField = (field: keyof RegisterForm, value: string) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(4,76,155,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef5ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_-24px_rgba(4,76,155,0.35)] backdrop-blur lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-[#033a7a] p-7 text-white sm:p-8 lg:p-10">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                <img src={sedapalLogo} alt="SEDAPAL" className="h-8 w-auto" />
                <span>AQUANET</span>
              </div>
              <div className="mt-10 space-y-4">
                <h1 className="text-4xl font-semibold sm:text-5xl">Bienvenido</h1>
                <p className="max-w-md text-sm leading-7 text-white/80">
                  Accede a tu oficina virtual de SEDAPAL para pagos, reclamos y trámites en un solo
                  lugar.
                </p>
              </div>
            </div>

            <div className="mt-12 rounded-[28px] border border-white/10 bg-white/10 p-6 shadow-[0_16px_60px_-36px_rgba(0,0,0,0.35)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Acceso seguro
              </p>
              <p className="mt-4 text-sm leading-6 text-white/75">
                Esta plataforma está optimizada para que gestiones tu servicio de agua de forma
                rápida y segura.
              </p>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-5 lg:p-6 xl:p-8 overflow-hidden max-h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-5rem)]">
            <div className="h-full overflow-y-auto pr-1">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-foreground sm:text-[2.2rem]">
                  {authView === "login"
                    ? "Iniciar sesión"
                    : authView === "register"
                      ? "Registrarse"
                      : "Recuperar contraseña"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {authView === "login"
                    ? "Llena los campos a continuación para entrar a tu cuenta."
                    : authView === "register"
                      ? "Completa tu registro para acceder al módulo de clientes."
                      : "Ingresa tu correo para recibir el enlace de restablecimiento."}
                </p>{" "}
                {authView === "login" && (
                  <p className="mt-3 rounded-2xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Usa <span className="font-medium text-foreground">prueba@aquanet.test</span> /{" "}
                    <span className="font-medium text-foreground">Test1234!</span> para probar el
                    acceso.
                  </p>
                )}{" "}
              </div>

              {authView === "login" && (
                <form
                  onSubmit={handleLogin}
                  className="space-y-5 rounded-3xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium text-foreground"
                        htmlFor="login-email"
                      >
                        Correo electrónico
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="usuario@correo.com"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium text-foreground"
                        htmlFor="login-password"
                      >
                        Contraseña
                      </label>
                      <input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-deep"
                  >
                    Iniciar sesión
                  </button>

                  <div className="flex flex-col gap-3 text-sm text-center text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
                    <button
                      type="button"
                      onClick={() => setAuthView("forgot")}
                      className="font-medium text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthView("register")}
                      className="font-medium text-primary hover:underline"
                    >
                      Registrarse
                    </button>
                  </div>
                </form>
              )}

              {authView === "forgot" && (
                <form className="space-y-5 rounded-3xl border border-border bg-white p-5 shadow-sm">
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-foreground"
                      htmlFor="forgot-email"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="usuario@correo.com"
                      className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                    />
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-deep"
                  >
                    Enviar enlace
                  </button>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span />
                    <button
                      type="button"
                      onClick={() => setAuthView("login")}
                      className="font-medium text-primary hover:underline"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                </form>
              )}

              {authView === "register" && (
                <form
                  onSubmit={handleRegister}
                  className="space-y-4 rounded-3xl border border-border bg-white p-4 shadow-sm"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="suministro"
                      >
                        N° de Suministro
                      </label>
                      <input
                        id="suministro"
                        value={registerForm.suministro}
                        onChange={(event) => updateRegisterField("suministro", event.target.value)}
                        placeholder="Ej. 1234567"
                        className="w-full border-b border-border bg-transparent px-0 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        className="block text-sm font-medium text-foreground"
                        htmlFor="referencia"
                      >
                        Referencia de cobro
                      </label>
                      <input
                        id="referencia"
                        value={registerForm.referencia}
                        onChange={(event) => updateRegisterField("referencia", event.target.value)}
                        disabled={!hasSuministro}
                        placeholder="Ej. 987654321"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="documento-tipo"
                      >
                        Tipo de documento
                      </label>
                      <select
                        id="documento-tipo"
                        value={registerForm.documentoTipo}
                        onChange={(event) =>
                          updateRegisterField("documentoTipo", event.target.value)
                        }
                        disabled={!stepAValid}
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="DNI">DNI</option>
                        <option value="RUC">RUC</option>
                        <option value="PASAPORTE">PASAPORTE</option>
                        <option value="CARNÉ EXTRANJERÍA">CARNÉ EXTRANJERÍA</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="documento-numero"
                      >
                        N° de documento
                      </label>
                      <input
                        id="documento-numero"
                        value={registerForm.documentoNumero}
                        onChange={(event) =>
                          updateRegisterField("documentoNumero", event.target.value)
                        }
                        disabled={!stepAValid}
                        placeholder="Ej. 12345678"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="nombres"
                      >
                        Nombres
                      </label>
                      <input
                        id="nombres"
                        value={registerForm.nombres}
                        onChange={(event) => updateRegisterField("nombres", event.target.value)}
                        disabled={!stepBValid}
                        placeholder="Ingrese sus nombres"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="apellido-paterno"
                      >
                        Apellido Paterno
                      </label>
                      <input
                        id="apellido-paterno"
                        value={registerForm.apellidoPaterno}
                        onChange={(event) =>
                          updateRegisterField("apellidoPaterno", event.target.value)
                        }
                        disabled={!stepBValid}
                        placeholder="Apellido paterno"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="apellido-materno"
                      >
                        Apellido Materno
                      </label>
                      <input
                        id="apellido-materno"
                        value={registerForm.apellidoMaterno}
                        onChange={(event) =>
                          updateRegisterField("apellidoMaterno", event.target.value)
                        }
                        disabled={!stepBValid}
                        placeholder="Apellido materno"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="telefono"
                      >
                        Teléfono
                      </label>
                      <input
                        id="telefono"
                        value={registerForm.telefono}
                        onChange={(event) => updateRegisterField("telefono", event.target.value)}
                        disabled={!stepBValid}
                        placeholder="Ej. 987654321"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="correo-registro"
                      >
                        Correo electrónico
                      </label>
                      <input
                        id="correo-registro"
                        type="email"
                        value={registerForm.correo}
                        onChange={(event) => updateRegisterField("correo", event.target.value)}
                        disabled={!stepCValid}
                        placeholder="usuario@correo.com"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="password-registro"
                      >
                        Contraseña
                      </label>
                      <input
                        id="password-registro"
                        type="password"
                        value={registerForm.password}
                        onChange={(event) => updateRegisterField("password", event.target.value)}
                        disabled={!stepCValid}
                        placeholder="Mín. 8 caracteres"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold text-foreground"
                        htmlFor="repetir-password"
                      >
                        Repetir contraseña
                      </label>
                      <input
                        id="repetir-password"
                        type="password"
                        value={registerForm.repetirPassword}
                        onChange={(event) =>
                          updateRegisterField("repetirPassword", event.target.value)
                        }
                        disabled={!stepCValid}
                        placeholder="Repite tu contraseña"
                        className="w-full border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-3 text-xs text-muted-foreground">
                      <p className="mb-2 font-semibold text-foreground">Requisitos de contraseña</p>
                      <ul className="space-y-1.5">
                        <li
                          className={`flex items-center gap-2 ${passwordChecks.length ? "text-emerald-600" : ""}`}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Mayor a 8 dígitos
                        </li>
                        <li
                          className={`flex items-center gap-2 ${passwordChecks.upper ? "text-emerald-600" : ""}`}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Al menos una mayúscula
                        </li>
                        <li
                          className={`flex items-center gap-2 ${passwordChecks.lower ? "text-emerald-600" : ""}`}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Al menos una minúscula
                        </li>
                        <li
                          className={`flex items-center gap-2 ${passwordChecks.number ? "text-emerald-600" : ""}`}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Al menos un número
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-3">
                    <label className="flex items-start gap-3 text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(event) => setAcceptTerms(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary"
                      />
                      <span>
                        Acepto los Términos y Condiciones<span className="text-destructive">*</span>
                      </span>
                    </label>
                    <label className="mt-3 flex items-start gap-3 text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={acceptNotifications}
                        onChange={(event) => setAcceptNotifications(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary"
                      />
                      <span>Deseo recibir correos y notificaciones de Sedapal</span>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-7 w-7 place-items-center rounded-sm border border-slate-300 bg-white text-[10px] font-semibold text-slate-700">
                          ✓
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">No soy un robot</p>
                          <p className="text-xs text-muted-foreground">reCAPTCHA</p>
                        </div>
                      </div>
                      <div className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                        Verificado
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Esta es una vista previa. La verificación real de reCAPTCHA se integrará
                      después.
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Al término del registro recibirás un código de verificación en tu correo, el
                    cual será solicitado la primera vez que ingreses al aplicativo.
                  </p>

                  <button
                    type="submit"
                    disabled={!stepDValid}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Registrarme
                  </button>

                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthView("login")}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      onLogout={handleLogout}
      rightPanel={
        <div className="p-6 space-y-5">
          <div
            className="rounded-2xl bg-card overflow-hidden border border-border"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div
              className="px-5 py-3 text-primary-foreground"
              style={{ background: "var(--gradient-header)" }}
            >
              <h4 className="font-semibold">Mis Suministros</h4>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">N° de Suministro:</span>{" "}
                <span className="font-semibold text-foreground">1234567</span>
              </div>
              <div>
                <span className="text-muted-foreground">Titular:</span>{" "}
                <span className="font-semibold text-foreground">Carlos Pérez</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dirección:</span>{" "}
                <span className="text-foreground">
                  Av. Los Próceres 1234, San Juan de Lurigancho
                </span>
              </div>
              <button className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep transition">
                Ver detalle
              </button>
            </div>
          </div>

          <div
            className="rounded-2xl bg-card border border-border p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h4 className="font-semibold text-primary-deep mb-3">Accesos rápidos</h4>
            <ul className="space-y-1">
              {quickLinks.map((q) => (
                <li key={q.label}>
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-secondary transition"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary-deep">
                      <q.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{q.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl p-5 text-primary-foreground"
            style={{ background: "linear-gradient(135deg, #044c9b, #033a7a)" }}
          >
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-90">💧</div>
            <p className="font-bold relative">¡Cuidemos el agua!</p>
            <p className="text-sm opacity-90 mt-1 relative max-w-[80%]">
              Cada gota cuenta para un futuro sostenible.
            </p>
          </div>
        </div>
      }
    >
      <div className="p-4 sm:p-8">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-deep">
            ¡Bienvenido a AQUANET!
          </h2>
          <p className="mt-2 text-muted-foreground">
            Realiza tus consultas y trámites en línea de manera rápida y segura.
          </p>
        </div>

        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">¿Qué deseas hacer hoy?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map((s) => (
              <Link
                key={s.title}
                to={s.title === "Registrar Reclamo" ? "/reclamo" : "/"}
                className="group text-left rounded-2xl bg-card p-5 border border-border transition hover:-translate-y-0.5 hover:border-primary/30"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary-deep mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <s.icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-primary-deep">{s.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl bg-primary-soft border border-primary/15 p-4 sm:p-5">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shrink-0">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-primary-deep">Avisos importantes</p>
              <p className="text-sm text-muted-foreground truncate">
                Mantenimiento programado este sábado en sectores de Lima Norte.
              </p>
            </div>
            <button className="inline-flex items-center gap-1 rounded-lg bg-primary-deep px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shrink-0">
              Ver más <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>

      <button
        aria-label="Abrir chatbot"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary-deep transition hover:scale-105"
        style={{ boxShadow: "0 12px 28px -8px rgb(4 76 155 / 0.5)" }}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-warning ring-2 ring-background" />
      </button>

      <Chatbot open={chatOpen} onOpenChange={setChatOpen} />
    </AppShell>
  );
}
