import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { ArrowLeft, Send, UploadCloud, CalendarDays } from "lucide-react";
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
  { value: "facturacion", label: "Facturación" },
  { value: "calidad", label: "Calidad del servicio" },
  { value: "presion", label: "Presión del agua" },
  { value: "corte", label: "Corte del servicio" },
  { value: "infraestructura", label: "Infraestructura" },
];

const subtipos: Record<string, { value: string; label: string }[]> = {
  facturacion: [
    { value: "monto", label: "Monto elevado" },
    { value: "recibo", label: "No llegó recibo" },
    { value: "cobro", label: "Cobro indebido" },
    { value: "lectura", label: "Error de lectura" },
  ],
  calidad: [
    { value: "olor", label: "Mal olor" },
    { value: "color", label: "Agua turbia / con color" },
    { value: "sabor", label: "Sabor extraño" },
  ],
  presion: [
    { value: "baja", label: "Baja presión" },
    { value: "sin", label: "Sin agua" },
    { value: "intermitente", label: "Servicio intermitente" },
  ],
  corte: [
    { value: "programado", label: "Corte programado no anunciado" },
    { value: "restablecimiento", label: "Demora en restablecimiento" },
    { value: "deuda", label: "Deuda ya cancelada" },
  ],
  infraestructura: [
    { value: "fuga", label: "Fuga en la red" },
    { value: "alcantarillado", label: "Problema de alcantarillado" },
    { value: "medidor", label: "Medidor dañado" },
    { value: "conexion", label: "Problema de conexión" },
  ],
};

function RegistrarReclamoPage() {
  const [tipo, setTipo] = useState("");
  const [subtipo, setSubtipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div className="space-y-1.5">
                <Label>
                  Tipo de reclamo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={tipo}
                  onValueChange={(v) => {
                    setTipo(v);
                    setSubtipo("");
                  }}
                >
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

              <div className="space-y-1.5">
                <Label>
                  Subtipo de reclamo <span className="text-destructive">*</span>
                </Label>
                <Select value={subtipo} onValueChange={setSubtipo} disabled={!tipo}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {(subtipos[tipo] || []).map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
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
                    defaultValue="Av. Los Próceres 1234 - San Juan de Lurigancho"
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
              <Button className="min-w-[160px] gap-2 bg-[#044c9b] hover:bg-[#033a7a] text-white">
                <Send className="h-4 w-4" />
                Enviar Reclamo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
