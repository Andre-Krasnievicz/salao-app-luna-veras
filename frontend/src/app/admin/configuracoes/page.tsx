"use client";

import React, { useEffect, useState } from "react";
import { FiSettings, FiSave } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { adminApi } from "@/lib/api";
import { SalonSettings, BusinessHoursItem, WEEKDAY_NAMES } from "@/types";
import { getAxiosError, formatCurrency } from "@/lib/utils";

export default function AdminConfiguracoesPage() {
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    salon_name: "",
    admin_whatsapp: "",
    reservation_amount_brl: "20.00",
    appointment_duration_minutes: 60,
    whatsapp_reminders_enabled: true,
  });

  const [businessHours, setBusinessHours] = useState<BusinessHoursItem[]>([]);

  useEffect(() => {
    adminApi.getSettings()
      .then((res) => {
        const s: SalonSettings = res.data;
        setSettings(s);
        setForm({
          salon_name: s.salon_name,
          admin_whatsapp: s.admin_whatsapp || "",
          reservation_amount_brl: (s.reservation_amount_cents / 100).toFixed(2),
          appointment_duration_minutes: s.appointment_duration_minutes,
          whatsapp_reminders_enabled: s.whatsapp_reminders_enabled,
        });
        setBusinessHours(s.business_hours);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setBH = (weekday: number, field: keyof BusinessHoursItem, value: string | boolean) => {
    setBusinessHours((prev) =>
      prev.map((bh) => (bh.weekday === weekday ? { ...bh, [field]: value } : bh))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaveMsg("");
    setSaving(true);
    try {
      await adminApi.updateSettings({
        salon_name: form.salon_name,
        admin_whatsapp: form.admin_whatsapp || null,
        reservation_amount_cents: Math.round(parseFloat(form.reservation_amount_brl) * 100),
        appointment_duration_minutes: Number(form.appointment_duration_minutes),
        whatsapp_reminders_enabled: form.whatsapp_reminders_enabled,
        business_hours: businessHours,
      });
      setSaveMsg("Configurações salvas com sucesso!");
    } catch (err) {
      setError(getAxiosError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><LoadingSpinner className="py-12" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiSettings className="w-6 h-6 text-pink-500" />
          Configurações
        </h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Salon data */}
          <Card>
            <h2 className="font-semibold text-gray-800 mb-4">Dados do salão</h2>
            <div className="space-y-3">
              <Input label="Nome do salão" value={form.salon_name} onChange={(e) => setForm((f) => ({ ...f, salon_name: e.target.value }))} required />
              <Input label="WhatsApp da dona/admin" value={form.admin_whatsapp} onChange={(e) => setForm((f) => ({ ...f, admin_whatsapp: e.target.value }))} placeholder="5511999999999" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Valor da reserva (R$)" type="number" step="0.01" min="0" value={form.reservation_amount_brl} onChange={(e) => setForm((f) => ({ ...f, reservation_amount_brl: e.target.value }))} required />
                <Input label="Duração do atendimento (min)" type="number" min="15" step="15" value={String(form.appointment_duration_minutes)} onChange={(e) => setForm((f) => ({ ...f, appointment_duration_minutes: Number(e.target.value) }))} required />
              </div>
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input type="checkbox" className="w-4 h-4 accent-pink-500" checked={form.whatsapp_reminders_enabled} onChange={(e) => setForm((f) => ({ ...f, whatsapp_reminders_enabled: e.target.checked }))} />
                <span className="text-sm text-gray-700">Ativar lembretes de WhatsApp</span>
              </label>
            </div>
          </Card>

          {/* Business hours */}
          <Card>
            <h2 className="font-semibold text-gray-800 mb-4">Horários de funcionamento</h2>
            <div className="space-y-3">
              {businessHours.map((bh) => (
                <div key={bh.weekday} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-32 cursor-pointer">
                    <input type="checkbox" className="accent-pink-500" checked={bh.is_open} onChange={(e) => setBH(bh.weekday, "is_open", e.target.checked)} />
                    <span className="text-sm text-gray-700 font-medium">{WEEKDAY_NAMES[bh.weekday]}</span>
                  </label>
                  {bh.is_open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={bh.opens_at}
                        onChange={(e) => setBH(bh.weekday, "opens_at", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                      <span className="text-gray-400 text-sm">até</span>
                      <input
                        type="time"
                        value={bh.closes_at}
                        onChange={(e) => setBH(bh.weekday, "closes_at", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Fechado</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {saveMsg && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{saveMsg}</p>}

          <Button type="submit" loading={saving} size="lg">
            <FiSave className="w-4 h-4" />
            Salvar configurações
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
