import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, X, AlertTriangle, Download, ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";

export const Route = createFileRoute("/realizar-pago")({
  head: () => ({
    meta: [
      { title: "Realizar Pago — AQUANET" },
      { name: "description", content: "Realiza el pago de tus recibos pendientes." },
    ],
  }),
  component: RealizarPagoPage,
});

type PaymentStep = "select" | "summary" | "result";
type PaymentResult = "approved" | "rejected" | "cancelled";
type PaymentMethod = "credit" | "pagoefectivo" | "internet";

type Factura = {
  codigo_factura: number;
  periodo: string;
  emision: string;
  vencimiento: string;
  monto_total: number;
  monto_pagado: number;
  saldo: number;
  estado: string;
};

type CanalPago = {
  codigo_canal: number;
  nombre_canal: string;
  modalidad_canal: string;
  tipo_canal: string;
};

type MedioPago = {
  codigo_medio_pago: number;
  nombre_medio_pago: string;
};

function RealizarPagoPage() {
  const [step, setStep] = useState<PaymentStep>("select");
  const [result, setResult] = useState<PaymentResult>("approved");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [operationNumber, setOperationNumber] = useState<string>("");
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [canales, setCanales] = useState<CanalPago[]>([]);
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCanal, setSelectedCanal] = useState<number | null>(null);
  const [selectedMedioPago, setSelectedMedioPago] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem("aquanet-token");
        
        const [facturasRes, canalesRes, mediosRes] = await Promise.all([
          fetch("/api/facturas/list?estado=emitida,vencida,parcial", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/canales/list"),
          fetch("/api/medios-pago/list"),
        ]);

        const facturasData = await facturasRes.json();
        const canalesData = await canalesRes.json();
        const mediosData = await mediosRes.json();

        setFacturas(facturasData.facturas || []);
        setCanales(canalesData.canales || []);
        setMediosPago(mediosData.medios_pago || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalAmount = useMemo(() => {
    return facturas
      .filter((f) => selected.has(f.codigo_factura))
      .reduce((sum, f) => sum + f.saldo, 0);
  }, [selected, facturas]);

  const handleSelectReceipt = (id: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    if (selected.size === facturas.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(facturas.map((f) => f.codigo_factura)));
    }
  };

  const handleContinuePayment = () => {
    setStep("summary");
  };

  const handleConfirmPayment = async () => {
    if (!selectedCanal || !selectedMedioPago) {
      alert("Por favor selecciona un canal y medio de pago");
      return;
    }

    try {
      const token = window.localStorage.getItem("aquanet-token");
      
      for (const facturaId of selected) {
        const factura = facturas.find(f => f.codigo_factura === facturaId);
        if (!factura) continue;

        await fetch("/api/pagos/registrar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            codigo_factura: facturaId,
            codigo_canal: selectedCanal,
            codigo_medio_pago: selectedMedioPago,
            monto_pagado: factura.saldo,
          }),
        });
      }

      setOperationNumber(`OP-${Date.now()}`);
      setResult("approved");
      setStep("result");
    } catch (error) {
      console.error("Error processing payment:", error);
      setResult("rejected");
      setStep("result");
    }
  };

  const handleRetry = () => {
    setStep("summary");
  };

  const handleCancel = () => {
    setStep("select");
    setSelected(new Set());
    setPaymentMethod("credit");
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  if (step === "select") {
    return (
      <AppShell>
        <div className="p-4 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary-deep">Consultas y Pagos</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Mis recibos</h1>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Recibos pendientes ({facturas.length})</h2>
                {facturas.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.size === facturas.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm font-medium text-muted-foreground">Seleccionar todos</span>
                  </label>
                )}
              </div>

              {facturas.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">¡Felicidades! No tienes recibos pendientes.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {facturas.map((factura) => (
                    <label
                      key={factura.codigo_factura}
                      className="flex items-center gap-4 rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(factura.codigo_factura)}
                        onChange={() => handleSelectReceipt(factura.codigo_factura)}
                        className="w-5 h-5 rounded border-border shrink-0"
                      />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">N° Factura</p>
                          <p className="font-semibold text-foreground">{factura.codigo_factura}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Periodo</p>
                          <p className="font-semibold text-foreground">{factura.periodo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Vencimiento</p>
                          <p className="font-semibold text-foreground">{factura.vencimiento}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium">Saldo</p>
                          <p className="font-semibold text-primary-deep text-lg">S/. {factura.saldo.toFixed(2)}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {selected.size > 0 && (
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monto total a pagar</p>
                  <p className="text-2xl font-bold text-primary-deep">S/. {totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="rounded-full border border-border bg-background px-6 py-2 font-semibold text-foreground hover:bg-secondary transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleContinuePayment}
                    className="rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary-deep transition flex items-center gap-2"
                  >
                    Continuar con el Pago
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </AppShell>
    );
  }

  if (step === "summary") {
    return (
      <AppShell>
        <div className="p-4 sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary-deep">Confirmación</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Resumen de pago</h1>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Recibos a pagar ({selected.size})</h2>
              <div className="space-y-2">
                {facturas
                  .filter((f) => selected.has(f.codigo_factura))
                  .map((factura) => (
                    <div key={factura.codigo_factura} className="flex items-center justify-between text-sm">
                      <span>{factura.periodo}</span>
                      <span>S/. {factura.saldo.toFixed(2)}</span>
                    </div>
                  ))}
                <div className="border-t border-border pt-2 mt-2 flex items-center justify-between font-semibold">
                  <span>Monto Total</span>
                  <span className="text-lg">S/. {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Canal de pago</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {canales.map((canal) => (
                  <button
                    key={canal.codigo_canal}
                    onClick={() => setSelectedCanal(canal.codigo_canal)}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      selectedCanal === canal.codigo_canal
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    <p className="font-semibold text-foreground text-sm">{canal.nombre_canal}</p>
                    <p className="text-xs text-muted-foreground">{canal.modalidad_canal}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Medio de pago</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {mediosPago.map((medio) => (
                  <button
                    key={medio.codigo_medio_pago}
                    onClick={() => setSelectedMedioPago(medio.codigo_medio_pago)}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      selectedMedioPago === medio.codigo_medio_pago
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    <p className="font-semibold text-foreground text-sm">{medio.nombre_medio_pago}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground hover:bg-secondary transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayment}
                className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-deep transition flex items-center gap-2"
              >
                Confirmar y Pagar
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (step === "result") {
    if (result === "approved") {
      return (
        <AppShell>
          <div className="p-4 sm:p-8">
            <div className="max-w-md mx-auto mt-12 text-center space-y-6">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-100">
                <Check className="h-12 w-12 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">¡Pago realizado con éxito!</h1>
                <p className="mt-2 text-muted-foreground">Su pago ha sido procesado correctamente</p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Número de operación:</span>
                  <span className="font-semibold">{operationNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto pagado:</span>
                  <span className="font-semibold">S/. {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Medio de pago:</span>
                  <span className="font-semibold">
                    {paymentMethod === "credit"
                      ? "Tarjeta"
                      : paymentMethod === "pagoefectivo"
                      ? "PagoEfectivo"
                      : "Banca por Internet"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={() => alert("Descargando constancia...")}
                  className="rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground hover:bg-secondary transition flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Descargar Constancia
                </button>
                <button
                  onClick={handleBackToHome}
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-deep transition"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        </AppShell>
      );
    }

    if (result === "rejected") {
      return (
        <AppShell>
          <div className="p-4 sm:p-8">
            <div className="max-w-md mx-auto mt-12 text-center space-y-6">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-destructive/10">
                <X className="h-12 w-12 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Pago rechazado</h1>
                <p className="mt-2 text-muted-foreground">
                  Su pago ha sido rechazado. Por favor, verifique los fondos de su tarjeta o intente con otro medio de pago.
                </p>
              </div>

              <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
                <p className="text-sm text-destructive">Código de error: PAYMENT_DECLINED</p>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={handleBackToHome}
                  className="rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground hover:bg-secondary transition"
                >
                  Volver al Inicio
                </button>
                <button
                  onClick={handleRetry}
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-deep transition"
                >
                  Reintentar Pago
                </button>
              </div>
            </div>
          </div>
        </AppShell>
      );
    }

    if (result === "cancelled") {
      return (
        <AppShell>
          <div className="p-4 sm:p-8">
            <div className="max-w-md mx-auto mt-12 text-center space-y-6">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-amber-100">
                <AlertTriangle className="h-12 w-12 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Pago cancelado</h1>
                <p className="mt-2 text-muted-foreground">El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.</p>
              </div>

              <button
                onClick={handleBackToHome}
                className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-deep transition"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </AppShell>
      );
    }
  }
}
