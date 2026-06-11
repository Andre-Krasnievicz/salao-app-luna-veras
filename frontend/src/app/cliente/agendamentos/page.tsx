"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiCalendar, FiArrowLeft } from "react-icons/fi";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge, { statusToBadge } from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { clientApi } from "@/lib/api";
import { Appointment, STATUS_LABELS } from "@/types";
import { formatDateTime, formatCurrency } from "@/lib/utils";

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.getAppointments()
      .then((res) => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/cliente" className="p-2 rounded-lg hover:bg-pink-50 transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiCalendar className="w-6 h-6 text-pink-500" />
            Meus Agendamentos
          </h1>
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : appointments.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <FiCalendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Você ainda não tem agendamentos.</p>
              <Link href="/agendar" className="text-pink-500 text-sm font-medium mt-2 block hover:underline">
                Agendar agora
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <Card key={appt.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">{formatDateTime(appt.start_time)}</p>
                    <p className="text-sm text-gray-500">Reserva: {formatCurrency(appt.reservation_amount_cents)}</p>
                    {appt.notes && <p className="text-xs text-gray-500 italic">{appt.notes}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant={statusToBadge(appt.status)}>
                      {STATUS_LABELS[appt.status] || appt.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
