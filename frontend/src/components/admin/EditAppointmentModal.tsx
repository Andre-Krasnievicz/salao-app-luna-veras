"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { adminApi } from "@/lib/api";
import { Appointment } from "@/types";
import { getAxiosError } from "@/lib/utils";

interface EditAppointmentModalProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "Aguardando Pagamento" },
  { value: "confirmed", label: "Confirmado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "payment_failed", label: "Pagamento Falhou" },
];

export default function EditAppointmentModal({ appointment, open, onClose, onSuccess }: EditAppointmentModalProps) {
  const [form, setForm] = useState({ date: "", time: "", notes: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointment) return;
    const d = new Date(appointment.start_time);
    setForm({
      date: format(d, "yyyy-MM-dd"),
      time: format(d, "HH:mm"),
      notes: appointment.notes ?? "",
      status: appointment.status,
    });
    setError("");
  }, [appointment]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    setError("");
    setLoading(true);
    try {
      const start_time = new Date(`${form.date}T${form.time}:00`).toISOString();
      await adminApi.updateAppointment(appointment.id, {
        start_time,
        notes: form.notes || undefined,
        status: form.status,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar agendamento" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
          <Input label="Horário" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Observações</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            placeholder="Observações opcionais..."
          />
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} fullWidth>Salvar alterações</Button>
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
        </div>
      </form>
    </Modal>
  );
}
