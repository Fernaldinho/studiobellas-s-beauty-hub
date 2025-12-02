export interface Professional {
  id: string;
  name: string;
  specialty: string;
  photo: string;
  services: string[];
  availableDays: number[]; // 0-6 (Sunday-Saturday)
  availableHours: { start: string; end: string };
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  professionalId: string;
  category: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  totalVisits: number;
  lastVisit: string;
  appointments: Appointment[];
}

export interface SalonSettings {
  name: string;
  description: string;
  whatsapp: string;
  coverPhoto: string;
  openingHours: { start: string; end: string };
  workingDays: number[];
}

export interface Subscription {
  isActive: boolean;
  plan: 'pro' | null;
  price: number;
  expiresAt: string | null;
}
