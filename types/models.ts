import type { FieldValue } from 'firebase/firestore';

export type UserRole = 'patient' | 'therapist' | 'admin';

export type FirestoreDate =
  | Date
  | string
  | number
  | FieldValue
  | {
      toDate: () => Date;
    };

export type UserProfile = {
  id?: string;
  uid?: string;
  email?: string;
  displayName?: string;
  fullName?: string;
  name?: string;
  photoURL?: string;
  role?: UserRole | string;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
  [key: string]: unknown;
};

export type AppointmentStatus =
  | 'pending'
  | 'approved'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'missed';

export type Appointment = {
  id?: string;
  patientId?: string;
  therapistId: string;
  patientName?: string;
  therapistName?: string;
  appointmentDateTime: FirestoreDate;
  status?: AppointmentStatus | string;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
  [key: string]: unknown;
};

export type SessionMessage = {
  id?: string;
  sessionId?: string;
  senderId: string;
  recipientId?: string;
  text?: string;
  createdAt?: FirestoreDate;
  readAt?: FirestoreDate | null;
  [key: string]: unknown;
};

export type AppNotification = {
  id?: string;
  userId: string;
  role?: UserRole | string;
  type: string;
  title: string;
  message: string;
  appointmentId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: FirestoreDate;
  readAt?: FirestoreDate | null;
  [key: string]: unknown;
};

export type AvailabilitySlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
};

export type UpcomingSlotOption = AvailabilitySlot & {
  optionId: string;
  appointmentDateTime: Date;
  dateLabel: string;
  timeLabel: string;
  sortValue: number;
};
