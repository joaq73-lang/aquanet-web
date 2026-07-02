import { Link, useRouterState } from "@tanstack/react-router";
import sedapalLogo from "../assets/sedapal-logo-new.png";
import {
  Bell,
  Home,
  CreditCard,
  AlertTriangle,
  MapPin,
  FileText,
  ClipboardList,
  Search,
  LogOut,
  Droplets,
} from "lucide-react";
import type { ReactNode } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const notificaciones = [
  {
    title: "Mantenimiento programado",
    description: "Corte de agua este sábado en sectores de Lima Norte de 8:00 a.m. a 2:00 p.m.",
    fecha: "Hace 2 horas",
  },
  {
    title: "Recibo disponible",
    description: "Tu recibo del periodo actual ya está disponible para su pago.",
    fecha: "Hace 1 día",
  },
];

const navItems: Array<{ icon: typeof Home; label: string; to: string }> = [
  { icon: Home, label: "Inicio", to: "/" },
  { icon: CreditCard, label: "Realizar Pago", to: "/realizar-pago" },
  { icon: AlertTriangle, label: "Incidencias", to: "/incidencias" },
  { icon: MapPin, label: "Lugares de pago", to: "/lugares-pago" },
  { icon: FileText, label: "Historial de Facturación", to: "/historial" },
  { icon: ClipboardList, label: "Registrar Reclamo", to: "/reclamo" },
  { icon: Search, label: "Seguimiento de Reclamos", to: "/seguimiento-reclamos" },
];

interface AppShellProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  onLogout?: () => void;
}

export default function AppShell({ children, rightPanel, onLogout }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-6 text-primary-foreground"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur ring-1 ring-white/30">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <img src={sedapalLogo} alt="SEDAPAL" className="h-8 sm:h-10 w-auto rounded-md" />
            <span className="hidden sm:inline text-white/40">·</span>
            <h1 className="truncate text-sm sm:text-base font-bold">AQUANET · Oficina Virtual</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 transition"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-warning text-[11px] font-bold text-foreground ring-2 ring-[#044c9b]">
                  {notificaciones.length}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Notificaciones</p>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notificaciones.map((notificacion) => (
                  <div key={notificacion.title} className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{notificacion.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{notificacion.description}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      {notificacion.fecha}
                    </p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2 pl-2 sm:pl-3 sm:border-l border-white/20">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary-deep font-bold text-sm">
              CP
            </div>
            <span className="hidden md:inline text-sm font-medium">Carlos Pérez</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-border bg-card">
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.to && item.to !== "#";
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary-soft text-primary-deep"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                  return;
                }
                window.localStorage.removeItem("aquanet-auth");
                window.location.reload();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">{children}</main>

        {rightPanel && <aside className="hidden xl:block w-80 shrink-0">{rightPanel}</aside>}
      </div>
    </div>
  );
}
