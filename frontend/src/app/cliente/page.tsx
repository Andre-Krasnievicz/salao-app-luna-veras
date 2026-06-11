"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiUser, FiEdit2, FiLock, FiTrash2, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { clientApi } from "@/lib/api";
import { getAxiosError } from "@/lib/utils";

export default function ClientProfilePage() {
  const { user, refresh } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", new_password_confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const [deletionModal, setDeletionModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || "" });
  }, [user]);

  if (!user) return <LoadingSpinner className="min-h-screen" />;

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await clientApi.updateProfile({ name: form.name, phone: form.phone });
      await refresh();
      setEditMode(false);
      setSaveMsg("Perfil atualizado!");
    } catch {
      setSaveMsg("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwLoading(true);
    try {
      await clientApi.changePassword(pwForm);
      setPwSuccess(true);
      setPwForm({ current_password: "", new_password: "", new_password_confirm: "" });
    } catch (err) {
      setPwError(getAxiosError(err));
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeletion = async () => {
    setDeletionLoading(true);
    try {
      await clientApi.requestDataDeletion(deletionReason);
      setDeletionSuccess(true);
    } catch {
    } finally {
      setDeletionLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiUser className="w-6 h-6 text-pink-500" />
          Minha Conta
        </h1>

        {/* Profile */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Dados pessoais</h2>
            <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
              <FiEdit2 className="w-4 h-4" />
              {editMode ? "Cancelar" : "Editar"}
            </Button>
          </div>

          {editMode ? (
            <div className="space-y-3">
              <Input label="Nome" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input label="WhatsApp" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <Button onClick={handleSaveProfile} loading={saving} size="sm">Salvar</Button>
              {saveMsg && <p className="text-sm text-green-600">{saveMsg}</p>}
            </div>
          ) : (
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Nome:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">WhatsApp:</span> {user.phone || "—"}</p>
            </div>
          )}
        </Card>

        {/* Change password */}
        <Card>
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <FiLock className="w-4 h-4 text-pink-500" />
            Alterar senha
          </h2>
          {pwSuccess ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <FiCheckCircle className="w-4 h-4" />
              Senha alterada com sucesso!
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <Input label="Senha atual" type="password" value={pwForm.current_password} onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))} required />
              <Input label="Nova senha" type="password" value={pwForm.new_password} onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))} required />
              <Input label="Confirmar nova senha" type="password" value={pwForm.new_password_confirm} onChange={(e) => setPwForm((f) => ({ ...f, new_password_confirm: e.target.value }))} required />
              {pwError && <p className="text-sm text-red-500">{pwError}</p>}
              <Button type="submit" loading={pwLoading} size="sm">Salvar senha</Button>
            </form>
          )}
        </Card>

        {/* My appointments link */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Meus agendamentos</h2>
              <p className="text-sm text-gray-500">Visualize seu histórico de agendamentos</p>
            </div>
            <Link href="/cliente/agendamentos">
              <Button variant="outline" size="sm">Ver agendamentos</Button>
            </Link>
          </div>
        </Card>

        {/* Data deletion */}
        <Card>
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <FiTrash2 className="w-4 h-4 text-red-400" />
            Exclusão de dados (LGPD)
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Você pode solicitar a exclusão dos seus dados a qualquer momento. A solicitação será analisada manualmente.
          </p>
          <Button variant="danger" size="sm" onClick={() => setDeletionModal(true)}>
            Solicitar exclusão de dados
          </Button>
        </Card>
      </main>

      <Modal open={deletionModal} onClose={() => setDeletionModal(false)} title="Solicitar exclusão de dados">
        {deletionSuccess ? (
          <div className="text-center space-y-3">
            <FiCheckCircle className="w-10 h-10 text-green-500 mx-auto" />
            <p className="text-sm text-gray-700">Solicitação registrada. Entraremos em contato em breve.</p>
            <Button onClick={() => setDeletionModal(false)} fullWidth>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-yellow-50 p-3 rounded-lg">
              <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Esta ação iniciará o processo de exclusão dos seus dados. Dados necessários para obrigações legais serão retidos conforme a legislação.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Motivo (opcional)</label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setDeletionModal(false)} fullWidth>Cancelar</Button>
              <Button variant="danger" onClick={handleDeletion} loading={deletionLoading} fullWidth>Confirmar solicitação</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
