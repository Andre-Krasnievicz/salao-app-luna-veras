"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiCheckCircle, FiCalendar } from "react-icons/fi";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";

export default function PagamentoSucessoPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment_id");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Agendamento confirmado!</h1>
            <p className="text-gray-600 mt-2">
              Seu pagamento foi aprovado e o agendamento está confirmado. Você receberá um lembrete pelo WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/cliente/agendamentos">
              <Button fullWidth size="lg">
                <FiCalendar className="w-5 h-5" />
                Ver meus agendamentos
              </Button>
            </Link>
            <Link href="/agendar">
              <Button variant="secondary" fullWidth>
                Fazer outro agendamento
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
