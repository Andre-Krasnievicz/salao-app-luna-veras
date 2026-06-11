"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ServicePicker from "@/components/appointments/ServicePicker";
import { adminApi } from "@/lib/api";
import { Service } from "@/types";
import { getAxiosError } from "@/lib/utils";

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillDate?: Date;
}

export default function NewAppointmentModal({ open, onClose, onSuccess, prefillDate }: NewAppointmentModalProps) {
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    date: prefillDate ? prefillDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    time: prefillDate ? `${String(prefillDate.getHours()).padStart(2, "0")}:00` : "09:00",
    notes: "",
  });
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setServicesLoading(true);
      adminApi.getServices()
        .then((res) => setServices(res.data))
        .catch(() => {})
        .finally(() => setServicesLoading(false));
    }
  }, [open]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const start_time = new Date(`${form.date}T${form.time}:00`).toISOString();
      await adminApi.createAppointment({
        client_name: form.client_name,
        client_phone: form.client_phone,
        client_email: form.client_email || undefined,
        start_time,
        notes: form.notes || undefined,
        service_ids: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
      });
      onSuccess();
      onClose();
      setForm({
        client_name: "", client_phone: "", client_email: "",
        date: new Date().toISOString().slice(0, 10), time: "09:00", notes: "",
      });
      setSelectedServiceIds([]);
    } catch (err) {
      setError(getAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo Agendamento" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome do Cliente" value={form.client_name} onChange={(e) => set("client_name", e.target.value)} required placeholder="Maria Silva" />
        <Input label="WhatsApp" value={form.client_phone} onChange={(e) => set("client_phone", e.target.value)} required placeholder="11999999999" />
        <Input label="Email (opcional)" type="email" value={form.client_email} onChange={(e) => set("client_email", e.target.value)} placeholder="maria@email.com" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
          <Input label="Horário" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} required />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Serviços (opcional)</p>
          <ServicePicker
            services={services}
            selected={selectedServiceIds}
            onChange={setSelectedServiceIds}
            loading={servicesLoading}
          />
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
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
          <Button type="submit" loading={loading} fullWidth>Salvar Agendamento</Button>
        </div>
      </form>
    </Modal>
  );
}
