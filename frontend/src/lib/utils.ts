import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(iso: string, fmt = "dd/MM/yyyy"): string {
  try {
    return format(parseISO(iso), fmt, { locale: ptBR });
  } catch {
    return iso;
  }
}

export function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function getAxiosError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const e = error as { response?: { data?: { detail?: string | { msg: string }[] } } };
    const detail = e.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  }
  return "Ocorreu um erro. Tente novamente.";
}

export function dateToYMD(d: Date): string {
  return format(d, "yyyy-MM-dd");
}
