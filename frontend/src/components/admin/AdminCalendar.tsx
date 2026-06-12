"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { addDays, format, startOfDay, isSameDay, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { adminApi } from "@/lib/api";
import { Appointment, SalonSettings } from "@/types";
import { formatTime } from "@/lib/utils";
import Badge, { statusToBadge } from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AdminCalendarProps {
  onSlotClick?: (date: Date, time?: string) => void;
  onAppointmentClick?: (appt: Appointment) => void;
  refreshKey?: number;
}

export default function AdminCalendar({ onSlotClick, onAppointmentClick, refreshKey }: AdminCalendarProps) {
  const [mounted, setMounted] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(new Date(0));
  const [selectedDay, setSelectedDay] = useState<Date>(new Date(0));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SalonSettings | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const loadAppointments = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await adminApi.getAppointments(dateStr);
      setAppointments(res.data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const today = startOfDay(new Date());
    setWeekStart(today);
    setSelectedDay(today);
    setMounted(true);
  }, []);

  useEffect(() => {
    loadAppointments(selectedDay);
  }, [selectedDay, loadAppointments, refreshKey]);

  useEffect(() => {
    adminApi.getSettings().then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  // date-fns getDay(): 0=Sun,1=Mon..6=Sat → backend weekday: 0=Mon..6=Sun
  const hours = useMemo(() => {
    if (!settings?.business_hours?.length) {
      return Array.from({ length: 10 }, (_, i) => 8 + i);
    }
    const weekday = (getDay(selectedDay) + 6) % 7;
    const bh = settings.business_hours.find((b) => b.weekday === weekday);
    if (!bh || !bh.is_open) return [];
    const startHour = parseInt(bh.opens_at.split(":")[0], 10);
    const endHour = parseInt(bh.closes_at.split(":")[0], 10);
    return Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  }, [settings, selectedDay]);

  const getAppointmentForHour = (hour: number) => {
    return appointments.find((a) => {
      const h = new Date(a.start_time).getHours();
      return h === hour && (a.status === "confirmed" || a.status === "pending_payment");
    });
  };

  if (!mounted) return <LoadingSpinner className="py-8" />;

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="p-2 rounded-lg border border-gray-200 hover:bg-pink-50 hover:border-pink-200 transition-colors"
        >
          <FiChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex-1 grid grid-cols-7 gap-1">
          {days.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs transition-all ${
                isSameDay(day, selectedDay)
                  ? "bg-pink-500 text-white shadow-sm"
                  : "hover:bg-pink-50 text-gray-600"
              }`}
            >
              <span className="font-medium">{format(day, "EEE", { locale: ptBR })}</span>
              <span className={`text-lg font-bold ${isSameDay(day, new Date()) && !isSameDay(day, selectedDay) ? "text-pink-500" : ""}`}>
                {format(day, "d")}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="p-2 rounded-lg border border-gray-200 hover:bg-pink-50 hover:border-pink-200 transition-colors"
        >
          <FiChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-pink-50 border-b border-pink-100">
          <p className="text-sm font-semibold text-pink-700">
            {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner className="py-8" />
        ) : hours.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Fechado neste dia.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {hours.map((hour) => {
              const appt = getAppointmentForHour(hour);
              return (
                <div key={hour} className="flex items-stretch min-h-[56px]">
                  <div className="w-16 flex items-center justify-center text-xs text-gray-400 border-r border-gray-100 flex-shrink-0">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  <div
                    className={`flex-1 px-4 py-2 flex items-center cursor-pointer transition-colors ${
                      appt
                        ? "bg-pink-50 hover:bg-pink-100"
                        : "bg-gray-50/50 hover:bg-pink-50"
                    }`}
                    onClick={() => {
                      if (appt) {
                        onAppointmentClick?.(appt);
                      } else {
                        const slotDate = new Date(selectedDay);
                        slotDate.setHours(hour, 0, 0, 0);
                        onSlotClick?.(slotDate, `${String(hour).padStart(2, "0")}:00`);
                      }
                    }}
                  >
                    {appt ? (
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-1.5 h-full min-h-[36px] bg-pink-400 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{appt.client_name || "Cliente"}</p>
                          <p className="text-xs text-gray-500">{formatTime(appt.start_time)} - {formatTime(appt.end_time)}</p>
                        </div>
                        <Badge variant={statusToBadge(appt.status)}>
                          {appt.status === "confirmed" ? "Confirmado" : appt.status === "pending_payment" ? "Aguardando" : appt.status}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 select-none">Disponível — clique para agendar</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
