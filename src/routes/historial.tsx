import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Info, FileText, Download, XCircle, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/historial")({
  head: () => ({
    meta: [
      { title: "Historial de Facturación — AQUANET" },
      { name: "description", content: "Consulta tu historial de recibos por periodo." },
    ],
  }),
  component: HistorialPage,
});

type Factura = {
  codigo_factura: number;
  periodo: string;
  emision: string;
  vencimiento: string;
  monto_total: number;
  monto_pagado: number;
  saldo: number;
  estado: string;
  detalles: {
    consumo: number;
    concepto_consumo: number;
    concepto_alcantarillado: number;
    concepto_cargo_fijo: number;
    concepto_igv: number;
    concepto_mora: number;
  };
};

const ESTADO_FACTURA_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  vencida: "Vencida",
  en_disputa: "En disputa",
  anulada: "Anulada",
  pagada: "Pagada",
};

const ESTADO_FACTURA_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  vencida: "bg-red-100 text-red-800",
  en_disputa: "bg-orange-100 text-orange-800",
  anulada: "bg-gray-100 text-gray-700",
  pagada: "bg-green-100 text-green-800",
};

function formatEstadoFactura(estado: string): string {
  return ESTADO_FACTURA_LABELS[estado] ?? estado;
}

function getEstadoFacturaColor(estado: string): string {
  return ESTADO_FACTURA_COLORS[estado] ?? "bg-gray-100 text-gray-700";
}

function HistorialPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        setLoading(true);
        const token = window.localStorage.getItem("aquanet-token");
        const response = await fetch("/api/facturas/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error al obtener facturas");

        const data = await response.json();
        setFacturas(data.facturas || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching facturas:", err);
        setError("Error al cargar el historial de facturación");
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, []);

  const filteredFacturas = useMemo(() => {
    return facturas.filter((f) => {
      if (startDate && f.emision < startDate) return false;
      if (endDate && f.emision > endDate) return false;
      return true;
    });
  }, [facturas, startDate, endDate]);

  const handleDescargar = (numero: string) => {
    alert(`Descargando recibo ${numero}...`);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-background p-8">
          <Skeleton className="h-12 w-48" />
          <div className="w-full space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
          <XCircle className="h-8 w-8 text-destructive" />
          <p className="text-center text-sm text-destructive">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Historial de Facturación</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulta tus recibos y facturas emitidas
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Fecha de inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full border-b border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Fecha de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full border-b border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Periodo</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Emisión</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Vencimiento</th>
                <th className="px-6 py-4 text-right font-semibold text-foreground">Monto (S/.)</th>
                <th className="px-6 py-4 text-center font-semibold text-foreground">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFacturas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No hay facturas en el rango de fechas seleccionado
                  </td>
                </tr>
              ) : (
                filteredFacturas.map((factura) => (
                  <tr
                    key={factura.codigo_factura}
                    className="hover:bg-muted/50 cursor-pointer transition"
                    onClick={() => {
                      setSelectedFactura(factura);
                      setOpenDrawer(true);
                    }}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{factura.periodo}</td>
                    <td className="px-6 py-4 text-muted-foreground">{factura.emision}</td>
                    <td className="px-6 py-4 text-muted-foreground">{factura.vencimiento}</td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {factura.monto_total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEstadoFacturaColor(factura.estado)}`}
                      >
                        {formatEstadoFactura(factura.estado)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedFactura && (
          <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
            <DrawerContent className="bg-background">
              <DrawerHeader>
                <DrawerTitle>Detalles del Recibo</DrawerTitle>
                <DrawerDescription>Periodo: {selectedFactura.periodo}</DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Consumo (m³)</p>
                    <p className="text-lg font-semibold">{selectedFactura.detalles.consumo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monto Total</p>
                    <p className="text-lg font-semibold">
                      S/. {selectedFactura.monto_total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg bg-muted p-4">
                  <p className="font-semibold text-foreground">Desglose</p>
                  {[
                    { label: "Agua potable", monto: selectedFactura.detalles.concepto_consumo },
                    {
                      label: "Alcantarillado",
                      monto: selectedFactura.detalles.concepto_alcantarillado,
                    },
                    { label: "Cargo fijo", monto: selectedFactura.detalles.concepto_cargo_fijo },
                    { label: "IGV", monto: selectedFactura.detalles.concepto_igv },
                    { label: "Mora", monto: selectedFactura.detalles.concepto_mora },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">S/. {item.monto.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDescargar(selectedFactura.codigo_factura.toString())}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </button>
                  <DrawerClose className="flex-1 rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted">
                    Cerrar
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </AppShell>
  );
}
