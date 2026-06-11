"use client";

import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { adminApi } from "@/lib/api";
import { Service } from "@/types";
import { formatCurrency, getAxiosError } from "@/lib/utils";

interface ServiceFormState {
  name: string;
  category: string;
  duration_minutes: string;
  price_cents: string;
  sort_order: string;
}

const emptyForm: ServiceFormState = {
  name: "",
  category: "",
  duration_minutes: "",
  price_cents: "",
  sort_order: "0",
};

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editService, setEditService] = useState<Service | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await adminApi.getServices();
      setServices(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grouped = services.reduce<Record<string, Service[]>>((acc, svc) => {
    (acc[svc.category] ??= []).push(svc);
    return acc;
  }, {});

  const handleToggle = async (svc: Service) => {
    try {
      await adminApi.updateService(svc.id, { is_active: !svc.is_active });
      setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, is_active: !s.is_active } : s));
    } catch {}
  };

  const openEdit = (svc: Service) => {
    setEditService(svc);
    setForm({
      name: svc.name,
      category: svc.category,
      duration_minutes: String(svc.duration_minutes),
      price_cents: svc.price_cents > 0 ? (svc.price_cents / 100).toFixed(2).replace(".", ",") : "",
      sort_order: String(svc.sort_order),
    });
    setFormError("");
  };

  const openCreate = () => {
    setShowCreate(true);
    setForm(emptyForm);
    setFormError("");
  };

  const parsePrice = (val: string): number => {
    const clean = val.replace(",", ".").trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.round(num * 100);
  };

  const handleSave = async () => {
    setFormError("");
    const dur = parseInt(form.duration_minutes);
    if (!form.name.trim() || !form.category.trim()) {
      setFormError("Nome e categoria são obrigatórios.");
      return;
    }
    if (isNaN(dur) || dur < 5) {
      setFormError("Duração mínima é 5 minutos.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      duration_minutes: dur,
      price_cents: parsePrice(form.price_cents),
      sort_order: parseInt(form.sort_order) || 0,
    };

    setSaving(true);
    try {
      if (editService) {
        await adminApi.updateService(editService.id, payload);
        setEditService(null);
      } else {
        await adminApi.createService(payload);
        setShowCreate(false);
      }
      await load();
    } catch (err) {
      setFormError(getAxiosError(err));
    } finally {
      setSaving(false);
    }
  };

  const existingCategories = Array.from(new Set(services.map((s) => s.category)));

  const ServiceForm = () => (
    <div className="space-y-4">
      <Input
        label="Nome do serviço"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <input
          list="categories"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Digite ou selecione uma categoria"
        />
        <datalist id="categories">
          {existingCategories.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Duração (min)"
          type="number"
          min={5}
          step={5}
          value={form.duration_minutes}
          onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
        />
        <Input
          label="Preço (R$)"
          placeholder="0,00"
          value={form.price_cents}
          onChange={(e) => setForm((f) => ({ ...f, price_cents: e.target.value }))}
        />
      </div>
      <Input
        label="Ordem de exibição"
        type="number"
        min={0}
        value={form.sort_order}
        onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
      />
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} loading={saving} fullWidth>
          {editService ? "Salvar alterações" : "Criar serviço"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => { setEditService(null); setShowCreate(false); }}
          fullWidth
        >
          Cancelar
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
          <Button onClick={openCreate} size="sm">
            <FiPlus className="w-4 h-4 mr-1" />
            Novo serviço
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-pink-50">
                <h2 className="font-semibold text-pink-700 text-sm uppercase tracking-wide">{category}</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-6 py-3">Nome</th>
                    <th className="text-left px-4 py-3">Duração</th>
                    <th className="text-left px-4 py-3">Preço</th>
                    <th className="text-center px-4 py-3">Ativo</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((svc) => (
                    <tr key={svc.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-800">{svc.name}</td>
                      <td className="px-4 py-3 text-gray-500">{svc.duration_minutes}min</td>
                      <td className="px-4 py-3 text-gray-500">
                        {svc.price_cents > 0 ? formatCurrency(svc.price_cents) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleToggle(svc)} className="text-pink-500 hover:text-pink-700 transition-colors">
                          {svc.is_active ? (
                            <FiToggleRight className="w-6 h-6" />
                          ) : (
                            <FiToggleLeft className="w-6 h-6 text-gray-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(svc)}
                          className="p-1.5 rounded-lg hover:bg-pink-50 text-gray-400 hover:text-pink-600 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Edit modal */}
      <Modal
        open={!!editService}
        onClose={() => setEditService(null)}
        title={`Editar: ${editService?.name}`}
      >
        <ServiceForm />
      </Modal>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Novo serviço"
      >
        <ServiceForm />
      </Modal>
    </AdminLayout>
  );
}
