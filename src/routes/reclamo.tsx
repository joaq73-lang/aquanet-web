import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Send,
  UploadCloud,
  CalendarDays,
  Loader2,
  CheckCircle2,
  Hash,
  Calendar,
  FileText,
  MapPin,
  Info,
  Search,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import AppShell from "@/components/AppShell";

export const Route = createFileRoute("/reclamo")({
  head: () => ({
    meta: [
      { title: "Registrar Reclamo — AQUANET" },
      { name: "description", content: "Registra tu reclamo en AQUANET de SEDAPAL." },
    ],
  }),
  component: RegistrarReclamoPage,
});

const tiposReclamo = [
  { value: "facturacion", label: "Facturación", tipoReclamoDb: "facturacion" },
  { value: "medidor_agua", label: "Medidor de agua", tipoReclamoDb: "medidor_agua" },
  {
    value: "servicio_agua_potable",
    label: "Servicio de agua potable",
    tipoReclamoDb: "servicio_agua_potable",
  },
  {
    value: "servicio_alcantarillado",
    label: "Servicio de alcantarillado",
    tipoReclamoDb: "servicio_alcantarillado",
  },
  { value: "fugas_agua", label: "Fugas de agua", tipoReclamoDb: "fugas_agua" },
  {
    value: "conexion_agua_desague",
    label: "Conexión de agua o desagüe",
    tipoReclamoDb: "conexion_agua_desague",
  },
  {
    value: "corte_restablecimiento",
    label: "Corte o restablecimiento del servicio",
    tipoReclamoDb: "corte_restablecimiento",
  },
] as const;

type ReclamoRegistrado = {
  codigo: string;
  fechaRegistro: string;
  tipoLabel: string;
  direccion: string;
  estado: string;
};

function RegistrarReclamoPage() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [direccion, setDireccion] = useState("Av. Los Próceres 1234 - San Juan de Lurigancho");
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reclamoRegistrado, setReclamoRegistrado] = useState<ReclamoRegistrado | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setArchivo(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!tipo || !descripcion.trim() || !fecha) return;

    const tipoSeleccionado = tiposReclamo.find((t) => t.value === tipo);
    if (!tipoSeleccionado) return;

    setSubmitting(true);
    try {
      const token = window.localStorage.getItem("aquanet-token");
      const response = await fetch("/api/reclamos/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo_reclamo: tipoSeleccionado.tipoReclamoDb,
          descripcion,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.statusMessage || "No se pudo registrar el reclamo"}`);
        return;
      }

      const data = await response.json();
      setReclamoRegistrado({
        codigo: `RC-${new Date().getFullYear()}-${String(data.reclamo.codigo_reclamo).padStart(6, "0")}`,
        fechaRegistro: new Date(data.reclamo.fecha_registro).toLocaleString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        tipoLabel: tipoSeleccionado.label,
        direccion,
        estado: data.reclamo.estado,
      });
    } catch (error) {
      console.error("Error registrando reclamo:", error);
      alert("Error de conexión. Por favor, intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (reclamoRegistrado) {
    return (
      <AppShell>
        <div className="p-4 sm:p-8">
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-11 w-11 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide text-foreground">
                ¡Reclamo registrado exitosamente!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu reclamo ha sido enviado correctamente. Nuestro equipo lo atenderá en breve.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-card p-5 text-left">
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Código de Reclamo:</p>
                  <p className="font-semibold text-primary-deep">{reclamoRegistrado.codigo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Fecha de Registro:</p>
                  <p className="font-semibold text-foreground">{reclamoRegistrado.fechaRegistro}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Tipo de Reclamo:</p>
                  <p className="font-semibold text-foreground">{reclamoRegistrado.tipoLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Dirección:</p>
                  <p className="font-semibold text-foreground">{reclamoRegistrado.direccion}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Estado Actual:</p>
                  <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase text-amber-800">
                    {reclamoRegistrado.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 text-left text-sm text-primary-deep">
              <Search className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Puedes realizar el seguimiento de tu reclamo en la opción{" "}
                <span className="font-semibold">"Seguimiento de Reclamos"</span> del menú principal.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => navigate({ to: "/seguimiento-reclamos" })}
              >
                <Search className="h-4 w-4" />
                Ver seguimiento
              </Button>
              <Button className="flex-1 gap-2" onClick={() => navigate({ to: "/" })}>
                <Home className="h-4 w-4" />
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 sm:p-8">
        {/* Title + back */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Registrar Reclamo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <Link to="/" className="hover:underline">
                Inicio
              </Link>
              <span className="mx-1.5">›</span>
              <span>Registrar Reclamo</span>
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al menú principal
            </Button>
          </Link>
        </div>

        <div className="max-w-5xl space-y-6">
          {/* Sección 1: Datos del cliente */}
          <section
            className="rounded-2xl bg-card border border-border p-5 sm:p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-[#044c9b] font-semibold text-sm mb-4">
              1. Datos del cliente (no editables)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Nombre y Apellidos
                </Label>
                <Input value="Carlos Pérez López" readOnly className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">DNI</Label>
                <Input value="12345678" readOnly className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  N° de Suministro
                </Label>
                <Input value="1234567" readOnly className="bg-muted/40" />
              </div>
            </div>
          </section>

          {/* Sección 2: Datos del reclamo */}
          <section
            className="rounded-2xl bg-card border border-border p-5 sm:p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h3 className="text-[#044c9b] font-semibold text-sm mb-4">2. Datos del reclamo</h3>

            <div className="grid grid-cols-1 gap-5 mb-5">
              <div className="space-y-1.5">
                <Label>
                  Tipo de reclamo <span className="text-destructive">*</span>
                </Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposReclamo.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div className="space-y-1.5">
                <Label>
                  Descripción del problema <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder="Describe su problema con el mayor detalle posible..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  maxLength={1000}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Máximo 1000 caracteres</span>
                  <span>{descripcion.length}/1000</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>
                    Dirección del suministro <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Ej. Av. Los Próceres 1234 - San Juan de Lurigancho"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Referencia</Label>
                  <Input placeholder="Ej. Frente al parque, al costado de la iglesia, etc." />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label>
                  Fecha del incidente <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="pr-10"
                  />
                  <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Adjuntar evidencia (opcional)</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="relative cursor-pointer rounded-lg border border-dashed border-primary/40 bg-primary-soft/30 p-4 text-center transition hover:bg-primary-soft/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="mx-auto h-6 w-6 text-[#044c9b] mb-1" />
                  {archivo ? (
                    <p className="text-sm text-foreground font-medium">{archivo.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-[#044c9b] font-medium">
                        Arrastra y suelta tus archivos aquí
                      </p>
                      <p className="text-sm text-[#044c9b] font-medium">
                        o haz clic para seleccionar
                      </p>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos permitidos: JPG, PNG, PDF (Máx. 5 MB)
                </p>
              </div>
            </div>
          </section>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span> Campos obligatorios
            </p>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" className="min-w-[120px]">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="button"
                disabled={!tipo || !descripcion.trim() || !fecha || submitting}
                onClick={handleSubmit}
                className="min-w-[160px] gap-2 bg-[#044c9b] hover:bg-[#033a7a] text-white"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar Reclamo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
