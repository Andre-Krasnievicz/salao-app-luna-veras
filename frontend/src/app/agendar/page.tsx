"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Header from "@/components/layout/Header";
import TimeSlotPicker from "@/components/appointments/TimeSlotPicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { publicApi, clientApi } from "@/lib/api";
import { TimeSlot } from "@/types";
import { formatDateTime, formatCurrency, getAxiosError } from "@/lib/utils";

export default function AgendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reservationAmount, setReservationAmount] = useState(2000);
  const [step, setStep] = useState<"pick" | "confirm" | "paying">("pick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    publicApi.getSettings().then((res) => setReservationAmount(res.data.reservation_amount_cents)).catch(() => {});
  }, []);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("confirm");
  };

  const handleContinue = () => {
    if (!user) {
      // Save slot to sessionStorage and redirect to login
      sessionStorage.setItem("pending_slot", JSON.stringify(selectedSlot));
      router.push("/login?redirect=/agendar");
      return;
    }
    setStep("confirm");
  };

  // Restore slot from sessionStorage if returning from login
  useEffect(() => {
    if (user) {
      const pending = sessionStorage.getItem("pending_slot");
      if (pending) {
        try {
          setSelectedSlot(JSON.parse(pending));
          setStep("confirm");
          sessionStorage.removeItem("pending_slot");
        } catch {}
      }
    }
  }, [user]);

  const handlePay = async () => {
    if (!selectedSlot || !user) return;
    setError("");
    setLoading(true);
    try {
      const res = await clientApi.createAppointment(selectedSlot.start_time);
      window.location.href = res.data.checkout_url;
    } catch (err) {
      setError(getAxiosError(err));
      setLoading(false);
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

        {/* Step: pick slot */}
        {step === "pick" && (
          <TimeSlotPicker onSelect={handleSlotSelect} selectedSlot={selectedSlot} />
        )}

        {/* Step: confirm */}
        {(step === "confirm" || step === "paying") && selectedSlot && (
          <div className="space-y-4">
            <Card pink>
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">Resumo do agendamento</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDateTime(selectedSlot.start_time)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Reserva: <strong>{formatCurrency(reservationAmount)}</strong>
                  </p>
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
                <Button onClick={handleContinue} size="lg" fullWidth>
                  Entrar para continuar
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => { setStep("pick"); setSelectedSlot(null); }}
                fullWidth
              >
                Escolher outro horário
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
