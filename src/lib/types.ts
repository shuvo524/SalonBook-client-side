// Shared API shapes for SalonBook. These mirror the server contract exactly:
// every resource uses `id` (never `_id`), appointment dates are `YYYY-MM-DD`
// strings, and prices are USD numbers.

export interface Service {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number; // minutes
  image: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface ServicePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ServiceListResponse {
  services: Service[];
  pagination: ServicePagination;
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

export interface AppointmentService {
  id: string;
  serviceName: string;
  image: string;
  category: string;
  price: number;
  duration: number;
}

export interface AppointmentCustomer {
  id: string;
  name: string;
  email: string;
}

export interface Appointment {
  id: string;
  serviceId: AppointmentService;
  // Populated `{ id, name, email }` on admin lists; a plain id string elsewhere.
  customerId: AppointmentCustomer | string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Transaction {
  id: string;
  appointmentId:
    | {
        id: string;
        appointmentDate: string;
        timeSlot: string;
        servicePrice: number;
        status: AppointmentStatus;
        serviceId: { serviceName: string };
      }
    | string;
  customerId: AppointmentCustomer | string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "paid" | "failed";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  role: "customer" | "admin";
  isBlocked: boolean;
  createdAt: string;
}

export interface UserWithAppointmentCounts {
  user: User;
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
}

export interface CustomerStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  paidAppointments: number;
  totalSpent: number;
}

export interface AdminStats {
  totalCustomers: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalSuccessfulPayments: number;
  totalRevenue: number;
}

export interface CustomerDashboardData {
  stats: CustomerStats;
  recentAppointments: Appointment[];
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentAppointments: Appointment[];
}

/** The server wraps every response in `{ success, data }` / `{ success, message }`. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
}
