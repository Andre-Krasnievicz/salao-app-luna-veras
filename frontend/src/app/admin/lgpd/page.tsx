"use client";

import React, { useEffect, useState } from "react";
import { FiShield } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { adminApi } from "@/lib/api";
import { DataDeletionRequest } from "@/types";
import { formatDateTime } from "@/lib/utils";

const statusBadge = (s: string) => s === "pending" ? "yellow" : s === "completed" ? "green" : "red";
const statusLabel = (s: string) => s === "pending" ? "Pendente" : s === "completed" ? "Concluído" : "Rejeitado";

export default function AdminLgpdPage() {
  const [requests, setRequests] = useState<DataDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.getDeletionRequests()
      .then((res) => setRequests(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await adminApi.updateDeletionRequest(id, status);
      load();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiShield className="w-6 h-6 text-pink-500" />
          Solicitações LGPD
        </h1>
        <p className="text-sm text-gray-600">
          Gerencie as solicitações de exclusão de dados dos clientes conforme a LGPD.
        </p>

        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : requests.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-gray-500 py-8">Nenhuma solicitação registrada.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{req.user_name}</p>
                      <Badge variant={statusBadge(req.status)}>{statusLabel(req.status)}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{req.user_email}</p>
                    {req.reason && <p className="text-sm text-gray-600 italic">&ldquo;{req.reason}&rdquo;</p>}
                    <p className="text-xs text-gray-400">Solicitado em {formatDateTime(req.created_at)}</p>
                    {req.resolved_at && <p className="text-xs text-gray-400">Resolvido em {formatDateTime(req.resolved_at)}</p>}
                  </div>
                  {req.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        loading={updating === req.id}
                        onClick={() => updateStatus(req.id, "completed")}
                      >
                        Concluir
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={updating === req.id}
                        onClick={() => updateStatus(req.id, "rejected")}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
