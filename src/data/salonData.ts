import { Professional, Service, Appointment, SalonSettings } from '@/types/salon';
import professional1 from '@/assets/professional-1.jpg';
import professional2 from '@/assets/professional-2.jpg';
import professional3 from '@/assets/professional-3.jpg';
import professional4 from '@/assets/professional-4.jpg';

export const professionals: Professional[] = [
  {
    id: '1',
    name: 'Ana Paula',
    specialty: 'Cabeleireira',
    photo: professional1,
    services: ['1', '2', '3'],
    availableDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    availableHours: { start: '09:00', end: '18:00' },
  },
  {
    id: '2',
    name: 'Juliana Costa',
    specialty: 'Nail Designer',
    photo: professional2,
    services: ['4', '5', '6'],
    availableDays: [1, 2, 3, 4, 5],
    availableHours: { start: '10:00', end: '19:00' },
  },
  {
    id: '3',
    name: 'Michele',
    specialty: 'Lash Designer',
    photo: professional3,
    services: ['7', '8'],
    availableDays: [2, 3, 4, 5, 6],
    availableHours: { start: '09:00', end: '17:00' },
  },
  {
    id: '4',
    name: 'Carla Mendes',
    specialty: 'Depilação',
    photo: professional4,
    services: ['9', '10'],
    availableDays: [1, 2, 3, 4, 5],
    availableHours: { start: '08:00', end: '16:00' },
  },
];

export const services: Service[] = [
  // Cabeleireira
  { id: '1', name: 'Corte Feminino', price: 80, duration: 45, professionalId: '1', category: 'Cabelo' },
  { id: '2', name: 'Escova Progressiva', price: 250, duration: 180, professionalId: '1', category: 'Cabelo' },
  { id: '3', name: 'Coloração', price: 150, duration: 120, professionalId: '1', category: 'Cabelo' },
  // Nail Designer
  { id: '4', name: 'Manicure', price: 45, duration: 60, professionalId: '2', category: 'Unhas' },
  { id: '5', name: 'Pedicure', price: 55, duration: 60, professionalId: '2', category: 'Unhas' },
  { id: '6', name: 'Unhas em Gel', price: 120, duration: 90, professionalId: '2', category: 'Unhas' },
  // Lash
  { id: '7', name: 'Extensão de Cílios', price: 180, duration: 120, professionalId: '3', category: 'Cílios' },
  { id: '8', name: 'Manutenção Cílios', price: 90, duration: 60, professionalId: '3', category: 'Cílios' },
  // Depilação
  { id: '9', name: 'Depilação Completa', price: 200, duration: 90, professionalId: '4', category: 'Depilação' },
  { id: '10', name: 'Depilação Meia Perna', price: 60, duration: 30, professionalId: '4', category: 'Depilação' },
];

export const sampleAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Maria Silva',
    clientPhone: '11999999999',
    serviceId: '1',
    professionalId: '1',
    date: '2024-12-03',
    time: '10:00',
    status: 'confirmed',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    clientName: 'Joana Santos',
    clientPhone: '11988888888',
    serviceId: '4',
    professionalId: '2',
    date: '2024-12-03',
    time: '14:00',
    status: 'confirmed',
    createdAt: '2024-12-01T11:00:00Z',
  },
];

export const defaultSalonSettings: SalonSettings = {
  name: "Studio'Bella's Mulheres",
  description: 'Seu momento de beleza e cuidado pessoal',
  whatsapp: '11999999999',
  coverPhoto: '/placeholder.svg',
  openingHours: { start: '08:00', end: '19:00' },
  workingDays: [1, 2, 3, 4, 5, 6],
};
