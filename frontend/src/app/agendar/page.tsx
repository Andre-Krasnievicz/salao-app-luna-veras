"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiAlertCircle, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import Header from "@/components/layout/Header";
import TimeSlotPicker from "@/components/appointments/TimeSlotPicker";
import ServicePicker from "@/components/appointments/ServicePicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { publicApi, clientApi } from "@/lib/api";
import { Service, TimeSlot } from "@/types";
import { formatDateTime, formatCurrency, getAxiosError } from "@/lib/utils";

type Step = "services" | "pick" | "confirm" | "paying";

export default function AgendarPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reservationAmount, setReservationAmount] = useState(2000);
  const [step, setStep] = useState<Step>("services");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedServiceObjects = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDurationMinutes = selectedServiceObjects.reduce((acc, s) => acc + s.duration_minutes, 0);
  const servicesTotalCents = selectedServiceObjects.reduce((acc, s) => acc + s.price_cents, 0);
  const hasPrice = selectedServiceObjects.some((s) => s.price_cents > 0);

  useEffect(() => {
    publicApi.getSettings().then((res) => setReservationAmount(res.data.reservation_amount_cents)).catch(() => {});
    publicApi.getServices()
      .then((res) => setServices(res.data))
      .catch(() => {})
      .finally(() => setServicesLoading(false));
  }, []);

  // Restore selection from sessionStorage after login redirect
  useEffect(() => {
    if (user) {
      const pendingSlot = sessionStorage.getItem("pending_slot");
      const pendingIds = sessionStorage.getItem("pending_service_ids");
      if (pendingSlot) {
        try {
          setSelectedSlot(JSON.parse(pendingSlot));
          if (pendingIds) setSelectedServiceIds(JSON.parse(pendingIds));
          setStep("confirm");
          sessionStorage.removeItem("pending_slot");
          sessionStorage.removeItem("pending_service_ids");
        } catch {}
      }
    }
  }, [user]);

  const handleServicesNext = () => {
    if (selectedServiceIds.length === 0) return;
    setStep("pick");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    if (!user) {
      sessionStorage.setItem("pending_slot", JSON.stringify(slot));
      sessionStorage.setItem("pending_service_ids", JSON.stringify(selectedServiceIds));
      router.push("/login?redirect=/agendar");
      return;
    }
    setStep("confirm");
  };

  const handlePay = async () => {
    if (!selectedSlot || !user) return;
    setError("");
    setLoading(true);
    setStep("paying");
    try {
      const res = await clientApi.createAppointment(selectedSlot.start_time, selectedServiceIds);
      window.location.href = res.data.checkout_url;
    } catch (err) {
      setError(getAxiosError(err));
      setLoading(false);
      setStep("confirm");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <FiCalendar className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-800">Agendar horário</h1>
        </div>

        {/* Step: select services */}
        {step === "services" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Selecione os serviços desejados:</p>
            <ServicePicker
              services={services}
              selected={selectedServiceIds}
              onChange={setSelectedServiceIds}
              loading={servicesLoading}
            />
            <Button
              onClick={handleServicesNext}
              disabled={selectedServiceIds.length === 0}
              size="lg"
              fullWidth
            >
              Continuar para escolher horário
            </Button>
          </div>
        )}

        {/* Step: pick slot */}
        {step === "pick" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("services")}
              className="flex items-center gap-1.5 text-sm text-pink-600 hover:underline"
            >
              <FiArrowLeft className="w-4 h-4" />
              Voltar aos serviços
            </button>
            <div className="bg-white rounded-2xl border border-pink-100 px-4 py-3 text-sm text-gray-600">
              <span className="font-medium text-pink-600">{selectedServiceObjects.length} serviço(s)</span>
              {" · "}<span className="font-medium">{totalDurationMinutes}min de duração</span>
              {hasPrice && <>{" · "}<span className="font-medium">{formatCurrency(servicesTotalCents)}</span></>}
            </div>
            <TimeSlotPicker
              onSelect={handleSlotSelect}
              selectedSlot={selectedSlot}
              durationMinutes={totalDurationMinutes || undefined}
            />
          </div>
        )}

        {/* Step: confirm / paying */}
        {(step === "confirm" || step === "paying") && selectedSlot && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("pick")}
              className="flex items-center gap-1.5 text-sm text-pink-600 hover:underline"
            >
              <FiArrowLeft className="w-4 h-4" />
              Escolher outro horário
            </button>

            <Card pink>
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 w-full">
                  <p className="font-semibold text-gray-800">Resumo do agendamento</p>
                  <p className="text-sm text-gray-600">{formatDateTime(selectedSlot.start_time)}</p>

                  <div className="border-t border-pink-100 pt-2 space-y-1">
                    {selectedServiceObjects.map((s) => (
                      <div key={s.id} className="flex justify-between text-sm text-gray-600">
                        <span>{s.name} ({s.duration_minutes}min)</span>
                        {s.price_cents > 0 && <span>{formatCurrency(s.price_cents)}</span>}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-pink-100 pt-2 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Duração total</span>
                      <span className="font-medium">{totalDurationMinutes}min</span>
                    </div>
                    {hasPrice && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Valor dos serviços <span className="text-xs text-gray-400">(pago no salão)</span></span>
                        <span className="font-medium">{formatCurrency(servicesTotalCents)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold text-gray-800">
                      <span>Taxa de reserva <span className="text-xs font-normal text-gray-400">(pago agora)</span></span>
                      <span>{formatCurrency(reservationAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {!user && (
              <Card>
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Login necessário</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Você precisa estar logado para confirmar o pagamento.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {user ? (
                <Button onClick={handlePay} loading={loading} size="lg" fullWidth>
                  Pagar {formatCurrency(reservationAmount)} e confirmar
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    sessionStorage.setItem("pending_slot", JSON.stringify(selectedSlot));
                    sessionStorage.setItem("pending_service_ids", JSON.stringify(selectedServiceIds));
                    router.push("/login?redirect=/agendar");
                  }}
                  size="lg"
                  fullWidth
                >
                  Entrar para continuar
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
