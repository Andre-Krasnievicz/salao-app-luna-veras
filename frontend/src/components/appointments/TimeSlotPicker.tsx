"use client";

import React, { useEffect, useState, useCallback } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FiChevronLeft, FiChevronRight, FiClock } from "react-icons/fi";
import { publicApi } from "@/lib/api";
import { TimeSlot } from "@/types";
import { formatTime } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface TimeSlotPickerProps {
  onSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
  durationMinutes?: number;
}

export default function TimeSlotPicker({ onSelect, selectedSlot, durationMinutes }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSlots = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await publicApi.getAvailability(dateStr, durationMinutes);
      setSlots(res.data.slots);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [durationMinutes]);

  useEffect(() => {
    loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const goBack = () => setSelectedDate((d) => addDays(d, -1));
  const goNext = () => setSelectedDate((d) => addDays(d, 1));

  const availableSlots = slots.filter((s) => s.available);
  const bookedSlots = slots.filter((s) => !s.available);

  return (
    <div className="space-y-4">
      {/* Date navigator */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4">
        <button onClick={goBack} className="p-2 rounded-lg border border-gray-200 hover:bg-pink-50 transition-colors">
          <FiChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex-1 text-center">
          <p className="font-semibold text-gray-800 capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <p className="text-xs text-gray-500">{format(selectedDate, "yyyy")}</p>
        </div>
        <button onClick={goNext} className="p-2 rounded-lg border border-gray-200 hover:bg-pink-50 transition-colors">
          <FiChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {loading ? (
        <LoadingSpinner className="py-8" />
      ) : slots.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
          <FiClock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Nenhum horário disponível neste dia.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Horários disponíveis ({availableSlots.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot?.start_time === slot.start_time;
              return (
                <button
                  key={slot.start_time}
                  onClick={() => onSelect(slot)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
                    isSelected
                      ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700"
                  }`}
                >
                  {formatTime(slot.start_time)}
                </button>
              );
            })}
          </div>

          {bookedSlots.length > 0 && (
            <>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-2">
                Horários indisponíveis ({bookedSlots.length})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {bookedSlots.map((slot) => (
                  <div
                    key={slot.start_time}
                    className="py-3 px-2 rounded-xl text-sm font-medium bg-pink-50 text-pink-300 border border-pink-100 cursor-not-allowed text-center"
                  >
                    {formatTime(slot.start_time)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
