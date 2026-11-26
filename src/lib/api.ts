// Tiny fetch helper for the SalonBook API. Every page uses this — no raw
// fetch calls scattered through components. It adds the JWT, unwraps the
// `{ success, data }` envelope, and throws the server's message on error.

import type {
  AdminDashboardData,
  Appointment,
  CustomerDashboardData,
  Service,
  ServiceListResponse,
  Transaction,
  User,
  UserWithAppointmentCounts,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const TOKEN_KEY = "salonbook_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Send `Authorization: Bearer <token>` (default false). */
  auth?: boolean;
  /** Send a multipart form instead of JSON (used for image uploads). */
  form?: FormData;
  /** Plain JSON body. */
  json?: unknown;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = false, form, json, ...init } = options;
  const headers = new Headers(init.headers);
  if (!form) headers.set("Content-Type", "application/json");
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body: form ?? (json !== undefined ? JSON.stringify(json) : undefined),
  });

  const payload: unknown = await res.json().catch(() => null);
  const body =
    payload && typeof payload === "object"
      ? (payload as { success?: boolean; data?: unknown; message?: string })
      : null;

  if (!res.ok || !body?.success) {
    throw new ApiError(
      body?.message ?? `Request failed (${res.status})`,
      res.status,
    );
  }
  return body.data as T;
}

/**
 * Exchange the Better Auth session cookie for a JWT. Used after every
 * sign-in (email, Google) and when restoring a session after refresh.
 * The session cookie is required, so this sends `credentials: "include"`.
 * Same-origin call: the session cookie lives on the client origin now
 * (auth goes through the Next.js /api rewrite), so this must NOT call
 * the server URL directly.
 */
export async function exchangeToken(): Promise<{
  token: string;
  user: User;
}> {
  const res = await fetch(`/api/auth/token`, {
    method: "POST",
    credentials: "include",
  });
  const payload: unknown = await res.json().catch(() => null);
  const body =
    payload && typeof payload === "object"
      ? (payload as {
          success?: boolean;
          data?: { token?: string; user?: User };
          message?: string;
        })
      : null;
  const data = body?.data;
  if (!res.ok || !body?.success || !data?.token || !data?.user) {
    throw new ApiError(
      body?.message ?? "Could not restore your session.",
      res.status,
    );
  }
  return { token: data.token, user: data.user };
}

/** End the Better Auth session on the server. Local cleanup happens in the caller.
 * Same-origin call (see exchangeToken): the session cookie lives on the
 * client origin, so sign-out must go through the /api rewrite too. */
export async function signOutRequest(): Promise<void> {
  try {
    await fetch(`/api/auth/sign-out`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Signing out locally is what matters; a failed server call must not
    // trap the user in a signed-in UI.
  }
}

export const api = {
  // -- Public ---------------------------------------------------------------
  getCategories: () =>
    request<{ categories: string[] }>("/api/meta/categories"),
  getTimeSlots: () =>
    request<{ timeSlots: string[] }>("/api/meta/time-slots"),
  getServices: (params: {
    search?: string;
    category?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    if (params.sort) query.set("sort", params.sort);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    const suffix = query.toString();
    return request<ServiceListResponse>(
      `/api/services${suffix ? `?${suffix}` : ""}`,
    );
  },
  getService: (id: string) =>
    request<{ service: Service }>(`/api/services/${id}`),

  // -- Appointments ---------------------------------------------------------
  createAppointment: (body: {
    serviceId: string;
    appointmentDate: string;
    timeSlot: string;
    message?: string;
  }) =>
    request<{ appointment: Appointment }>("/api/appointments", {
      method: "POST",
      auth: true,
      json: body,
    }),
  getMyAppointments: (status?: string) =>
    request<{ appointments: Appointment[] }>(
      `/api/appointments/my${status ? `?status=${status}` : ""}`,
      { auth: true },
    ),
  getAllAppointments: (params: { status?: string; paymentStatus?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.paymentStatus) query.set("paymentStatus", params.paymentStatus);
    const suffix = query.toString();
    return request<{ appointments: Appointment[] }>(
      `/api/appointments${suffix ? `?${suffix}` : ""}`,
      { auth: true },
    );
  },
  getAppointment: (id: string) =>
    request<{ appointment: Appointment }>(`/api/appointments/${id}`, {
      auth: true,
    }),
  cancelMyAppointment: (id: string) =>
    request<{ appointment: Appointment }>(`/api/appointments/${id}/cancel`, {
      method: "PATCH",
      auth: true,
    }),
  confirmAppointment: (id: string) =>
    request<{ appointment: Appointment }>(`/api/appointments/${id}/confirm`, {
      method: "PATCH",
      auth: true,
    }),
  cancelAppointmentAsAdmin: (id: string) =>
    request<{ appointment: Appointment }>(
      `/api/appointments/${id}/cancel-admin`,
      { method: "PATCH", auth: true },
    ),

  // -- Payments -------------------------------------------------------------
  createCheckout: (appointmentId: string) =>
    request<{ checkoutUrl: string; sessionId: string }>(
      `/api/payments/checkout/${appointmentId}`,
      { method: "POST", auth: true },
    ),
  getMyTransactions: () =>
    request<{ transactions: Transaction[] }>("/api/payments/transactions/my", {
      auth: true,
    }),
  getAllTransactions: (status?: string) =>
    request<{ transactions: Transaction[] }>(
      `/api/payments/transactions${status ? `?status=${status}` : ""}`,
      { auth: true },
    ),

  // -- Services (admin) -----------------------------------------------------
  getAdminServices: () =>
    request<{ services: Service[] }>("/api/services/admin/all", {
      auth: true,
    }),
  createService: (form: FormData) =>
    request<{ service: Service }>("/api/services", {
      method: "POST",
      auth: true,
      form,
    }),
  updateService: (id: string, form: FormData) =>
    request<{ service: Service }>(`/api/services/${id}`, {
      method: "PUT",
      auth: true,
      form,
    }),
  updateServiceStatus: (id: string, status: "active" | "inactive") =>
    request<{ service: Service }>(`/api/services/${id}/status`, {
      method: "PATCH",
      auth: true,
      json: { status },
    }),
  deleteService: (id: string) =>
    request<{ deleted: boolean }>(`/api/services/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  // -- Users (admin) --------------------------------------------------------
  getUsers: (role?: string) =>
    request<{ users: User[] }>(`/api/users${role ? `?role=${role}` : ""}`, {
      auth: true,
    }),
  getUserDetails: (id: string) =>
    request<UserWithAppointmentCounts>(`/api/users/${id}`, { auth: true }),
  setUserBlocked: (id: string, isBlocked: boolean) =>
    request<{ user: User }>(`/api/users/${id}/block`, {
      method: "PATCH",
      auth: true,
      json: { isBlocked },
    }),

  // -- Profile --------------------------------------------------------------
  getProfile: () => request<{ user: User }>("/api/profile/me", { auth: true }),
  updateProfile: (body: { name?: string; phone?: string; image?: string }) =>
    request<{ user: User }>("/api/profile/me", {
      method: "PATCH",
      auth: true,
      json: body,
    }),
  updateProfileWithImage: (form: FormData) =>
    request<{ user: User }>("/api/profile/me", {
      method: "PATCH",
      auth: true,
      form,
    }),

  // -- Dashboards -----------------------------------------------------------
  getCustomerDashboard: () =>
    request<CustomerDashboardData>("/api/dashboard/customer", { auth: true }),
  getAdminDashboard: () =>
    request<AdminDashboardData>("/api/dashboard/admin", { auth: true }),
};
