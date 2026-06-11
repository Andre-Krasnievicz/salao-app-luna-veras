export type UserRole = "admin" | "client";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  must_change_password: boolean;
  created_at: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

export interface Appointment {
  id: number;
  client_user_id?: number;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  start_time: string;
  end_time: string;
  status: "pending_payment" | "confirmed" | "cancelled" | "payment_failed";
  notes?: string;
  source: "public" | "admin";
  reservation_amount_cents: number;
  payment_status?: string;
  mercado_pago_preference_id?: string;
  created_at: string;
}

export interface SalonSettings {
  id: number;
  salon_name: string;
  admin_whatsapp?: string;
  reservation_amount_cents: number;
  appointment_duration_minutes: number;
  timezone: string;
  whatsapp_reminders_enabled: boolean;
  business_hours: BusinessHoursItem[];
}

export interface PublicSettings {
  salon_name: string;
  reservation_amount_cents: number;
  appointment_duration_minutes: number;
  timezone: string;
  business_hours: BusinessHoursItem[];
}

export interface BusinessHoursItem {
  weekday: number;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
}

export interface DashboardMetrics {
  site_visits: number;
  new_clients_30d: number;
  appointments_7d: number;
  appointments_30d: number;
}

export interface DataDeletionRequest {
  id: number;
  user_id?: number;
  user_name: string;
  user_email: string;
  status: "pending" | "completed" | "rejected";
  reason?: string;
  created_at: string;
  resolved_at?: string;
}

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Aguardando Pagamento",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  payment_failed: "Pagamento Falhou",
};

export const WEEKDAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
