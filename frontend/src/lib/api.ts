import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Intercept 401 to redirect to login.
// Skip redirect for /api/auth/me — a 401 there just means "not logged in", which is normal on public pages.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const requestUrl: string = error.config?.url ?? "";
      const path = window.location.pathname;
      const isAuthCheck = requestUrl.endsWith("/api/auth/me");
      if (
        !isAuthCheck &&
        !path.startsWith("/login") &&
        !path.startsWith("/cadastro") &&
        !path.startsWith("/redefinir")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirm: string;
    terms_accepted: boolean;
    privacy_policy_accepted: boolean;
  }) => api.post("/api/auth/register", data),

  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),

  logout: () => api.post("/api/auth/logout"),

  me: () => api.get("/api/auth/me"),

  forgotPassword: (email: string) =>
    api.post("/api/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string, password_confirm: string) =>
    api.post("/api/auth/reset-password", { token, password, password_confirm }),
};

// Public
export const publicApi = {
  getSettings: () => api.get("/api/settings/public"),
  getAvailability: (date: string) => api.get(`/api/availability?date=${date}`),
  recordVisit: (path: string) => api.post("/api/site-visits", { path }),
};

// Client
export const clientApi = {
  getProfile: () => api.get("/api/client/profile"),
  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put("/api/client/profile", data),
  changePassword: (data: {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => api.put("/api/client/change-password", data),
  getAppointments: () => api.get("/api/client/appointments"),
  requestDataDeletion: (reason?: string) =>
    api.post("/api/client/data-deletion-request", { reason }),
  createAppointment: (start_time: string) =>
    api.post("/api/appointments/public", { start_time }),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get("/api/admin/dashboard"),
  getSettings: () => api.get("/api/admin/settings"),
  updateSettings: (data: object) => api.put("/api/admin/settings", data),
  getAppointments: (date?: string) =>
    api.get(`/api/admin/appointments${date ? `?date=${date}` : ""}`),
  createAppointment: (data: {
    client_name: string;
    client_phone: string;
    client_email?: string;
    start_time: string;
    notes?: string;
  }) => api.post("/api/admin/appointments", data),
  updateAppointment: (id: number, data: object) =>
    api.patch(`/api/admin/appointments/${id}`, data),
  deleteAppointment: (id: number) => api.delete(`/api/admin/appointments/${id}`),
  getDeletionRequests: () => api.get("/api/admin/data-deletion-requests"),
  updateDeletionRequest: (id: number, status: string) =>
    api.patch(`/api/admin/data-deletion-requests/${id}?status=${status}`),
};

export default api;
