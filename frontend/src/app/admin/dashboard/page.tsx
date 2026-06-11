"use client";

import React, { useEffect, useState } from "react";
import { FiUsers, FiCalendar, FiEye, FiPlusCircle, FiAlertTriangle } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminCalendar from "@/components/admin/AdminCalendar";
import NewAppointmentModal from "@/components/admin/NewAppointmentModal";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge, { statusToBadge } from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { adminApi } from "@/lib/api";
import { DashboardMetrics, Appointment, STATUS_LABELS } from "@/types";
import { formatDateTime, formatCurrency, getAxiosError } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<Date | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setMetrics(res.data))
      .catch(() => {})
      .finally(() => setMetricsLoading(false));
  }, []);

  const metricCards = metrics
    ? [
        { label: "Visitas ao site", value: metrics.site_visits, icon: FiEye },
        { label: "Novos clientes (30d)", value: metrics.new_clients_30d, icon: FiUsers },
        { label: "Agendamentos (7d)", value: metrics.appointments_7d, icon: FiCalendar },
        { label: "Agendamentos (30d)", value: metrics.appointments_30d, icon: FiCalendar },
      ]
    : [];

  const handleSlotClick = (date: Date) => {
    setPrefillDate(date);
    setNewApptOpen(true);
  };

  const handleCancelAppt = async () => {
    if (!selectedAppt) return;
    setCancelError("");
    setCancelLoading(true);
    try {
      await adminApi.deleteAppointment(selectedAppt.id);
      setSelectedAppt(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setCancelError(getAxiosError(err));
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Password change warning */}
        {user?.must_change_password && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Altere a senha padrão</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Você está usando a senha padrão. Por segurança, altere-a em configurações o quanto antes.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <Button onClick={() => { setPrefillDate(undefined); setNewApptOpen(true); }} size="sm">
            <FiPlusCircle className="w-4 h-4" />
            Novo agendamento
          </Button>
        </div>

        {/* Metric cards */}
        {metricsLoading ? (
          <LoadingSpinner className="py-4" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                  </div>
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-pink-500" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Calendar */}
        <AdminCalendar
          onSlotClick={handleSlotClick}
          onAppointmentClick={setSelectedAppt}
          refreshKey={refreshKey}
        />
      </div>

      {/* New appointment modal */}
      <NewAppointmentModal
        open={newApptOpen}
        onClose={() => setNewApptOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        prefillDate={prefillDate}
      />

      {/* Appointment detail modal */}
      {selectedAppt && (
        <Modal open={!!selectedAppt} onClose={() => { setSelectedAppt(null); setCancelError(""); }} title="Detalhes do agendamento">
          <div className="space-y-3">
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Cliente:</span> {selectedAppt.client_name || "—"}</p>
              <p><span className="font-medium">WhatsApp:</span> {selectedAppt.client_phone || "—"}</p>
              <p><span className="font-medium">Email:</span> {selectedAppt.client_email || "—"}</p>
              <p><span className="font-medium">Horário:</span> {formatDateTime(selectedAppt.start_time)}</p>
              <p><span className="font-medium">Reserva:</span> {formatCurrency(selectedAppt.reservation_amount_cents)}</p>
              {selectedAppt.notes && <p><span className="font-medium">Observações:</span> {selectedAppt.notes}</p>}
              <div className="flex items-center gap-2 pt-1">
                <span className="font-medium">Status:</span>
                <Badge variant={statusToBadge(selectedAppt.status)}>{STATUS_LABELS[selectedAppt.status]}</Badge>
              </div>
            </div>
            {cancelError && <p className="text-sm text-red-500">{cancelError}</p>}
            {selectedAppt.status !== "cancelled" && (
              <Button variant="danger" onClick={handleCancelAppt} loading={cancelLoading} fullWidth>
                Cancelar agendamento
              </Button>
            )}
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
