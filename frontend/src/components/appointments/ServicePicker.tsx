"use client";

import React from "react";
import { Service } from "@/types";
import { formatCurrency } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ServicePickerProps {
  services: Service[];
  selected: number[];
  onChange: (ids: number[]) => void;
  loading?: boolean;
}

export default function ServicePicker({ services, selected, onChange, loading }: ServicePickerProps) {
  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const grouped = services.reduce<Record<string, Service[]>>((acc, svc) => {
    (acc[svc.category] ??= []).push(svc);
    return acc;
  }, {});

  const selectedServices = services.filter((s) => selected.includes(s.id));
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalCents = selectedServices.reduce((acc, s) => acc + s.price_cents, 0);
  const hasPrice = selectedServices.some((s) => s.price_cents > 0);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loading && services.length === 0) {
    return <p className="text-center text-gray-500 py-10">Nenhum serviço disponível.</p>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-pink-600 uppercase tracking-wide mb-3">
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((svc) => {
              const isSelected = selected.includes(svc.id);
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => toggle(svc.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                    isSelected
                      ? "bg-pink-500 border-pink-500 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                  }`}
                >
                  <p className="font-medium text-sm">{svc.name}</p>
                  <p className={`text-xs mt-0.5 ${isSelected ? "text-pink-100" : "text-gray-400"}`}>
                    {svc.duration_minutes}min
                    {svc.price_cents > 0 ? ` · ${formatCurrency(svc.price_cents)}` : ""}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-pink-100 px-4 py-3 rounded-b-2xl shadow-sm">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-pink-600">{selected.length}</span> serviço(s) selecionado(s)
            {" · "}
            <span className="font-semibold">Duração: {totalDuration}min</span>
            {hasPrice && (
              <>
                {" · "}
                <span className="font-semibold">Total: {formatCurrency(totalCents)}</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
