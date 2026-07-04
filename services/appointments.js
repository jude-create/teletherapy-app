import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNotification } from './notifications';

const APPOINTMENTS_COLLECTION = 'appointments';

const normalizeDate = (value) => {
  if (!value) return new Date(0);
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
};

const sortAppointments = (appointments) =>
  appointments.sort(
    (first, second) =>
      normalizeDate(second.updatedAt || second.createdAt || second.appointmentDateTime) -
      normalizeDate(first.updatedAt || first.createdAt || first.appointmentDateTime)
  );

const mapAppointment = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
});

export const saveAppointment = async (patientId, appointment) => {
  const appointmentDate =
    appointment.appointmentDateTime instanceof Date
      ? appointment.appointmentDateTime
      : normalizeDate(appointment.appointmentDateTime);

  const appointmentRecord = {
    ...appointment,
    patientId,
    appointmentDateTime: appointmentDate,
    status: appointment.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const result = await addDoc(collection(db, APPOINTMENTS_COLLECTION), appointmentRecord);

  await Promise.all([
    createNotification({
      userId: appointment.therapistId,
      role: 'therapist',
      type: 'appointment_requested',
      title: 'New appointment request',
      message: `${appointment.patientName || 'A patient'} requested ${formatAppointmentDate(appointmentDate)}.`,
      appointmentId: result.id,
      metadata: { patientId, status: appointmentRecord.status },
    }),
    createNotification({
      userId: patientId,
      role: 'patient',
      type: 'appointment_requested',
      title: 'Appointment request sent',
      message: `Your request with ${appointment.therapistName || 'your therapist'} is waiting for confirmation.`,
      appointmentId: result.id,
      metadata: { therapistId: appointment.therapistId, status: appointmentRecord.status },
    }),
  ]);

  return result.id;
};

export const getAppointmentsForPatient = async (patientId) => {
  if (!patientId) return [];

  const snapshot = await getDocs(
    query(collection(db, APPOINTMENTS_COLLECTION), where('patientId', '==', patientId))
  );

  return sortAppointments(snapshot.docs.map(mapAppointment));
};

export const getAppointmentsForTherapist = async (therapistId) => {
  if (!therapistId) return [];

  const snapshot = await getDocs(
    query(collection(db, APPOINTMENTS_COLLECTION), where('therapistId', '==', therapistId))
  );

  return sortAppointments(snapshot.docs.map(mapAppointment));
};

export const updateAppointmentStatus = async (appointmentId, status, options = {}) => {
  if (!appointmentId) throw new Error('Appointment id is required.');
  if (!['pending', 'approved', 'confirmed', 'rejected', 'cancelled', 'completed', 'missed'].includes(status)) {
    throw new Error('Unsupported appointment status.');
  }
  const normalizedStatus = status === 'confirmed' ? 'approved' : status;

  const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const snapshot = await getDoc(appointmentRef);
  const appointment = snapshot.exists() ? snapshot.data() : null;

  await updateDoc(appointmentRef, {
    status: normalizedStatus,
    updatedAt: serverTimestamp(),
  });

  if (appointment?.patientId) {
    const patientTitles = {
      approved: 'Appointment confirmed',
      rejected: 'Appointment rejected',
      cancelled: 'Appointment cancelled',
      completed: 'Appointment completed',
      missed: 'Appointment marked missed',
      pending: 'Appointment updated',
    };
    const patientMessages = {
      approved: `${appointment.therapistName || 'Your therapist'} confirmed ${formatAppointmentDate(appointment.appointmentDateTime)}.`,
      rejected: `${appointment.therapistName || 'Your therapist'} declined this appointment request.`,
      cancelled: `Your appointment with ${appointment.therapistName || 'your therapist'} was cancelled.`,
      completed: `Your appointment with ${appointment.therapistName || 'your therapist'} was marked completed.`,
      missed: `Your appointment with ${appointment.therapistName || 'your therapist'} was marked missed.`,
      pending: `Your appointment with ${appointment.therapistName || 'your therapist'} was updated.`,
    };
    await createNotification({
      userId: appointment.patientId,
      role: 'patient',
      type: `appointment_${normalizedStatus}`,
      title: patientTitles[normalizedStatus] || 'Appointment updated',
      message: patientMessages[normalizedStatus] || patientMessages.pending,
      appointmentId,
      metadata: { therapistId: appointment.therapistId, status: normalizedStatus },
    });
  }

  if (options.notifyTherapist && appointment?.therapistId && normalizedStatus === 'cancelled') {
    await createNotification({
      userId: appointment.therapistId,
      role: 'therapist',
      type: 'appointment_cancelled',
      title: 'Appointment cancelled',
      message: `${appointment.patientName || appointment.patientEmail || 'A patient'} cancelled ${formatAppointmentDate(appointment.appointmentDateTime)}.`,
      appointmentId,
      metadata: { patientId: appointment.patientId, status: normalizedStatus },
    });
  }
};

export const updateAppointmentSessionLink = async (appointmentId, sessionLink) => {
  if (!appointmentId) throw new Error('Appointment id is required.');

  const trimmedLink = sessionLink.trim();
  if (!/^https?:\/\/\S+\.\S+/.test(trimmedLink)) {
    throw new Error('Enter a valid meeting link that starts with http:// or https://.');
  }

  const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const snapshot = await getDoc(appointmentRef);
  const appointment = snapshot.exists() ? snapshot.data() : null;

  await updateDoc(appointmentRef, {
    sessionLink: trimmedLink,
    sessionLinkUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (appointment?.patientId) {
    await createNotification({
      userId: appointment.patientId,
      role: 'patient',
      type: 'session_link_added',
      title: 'Session link ready',
      message: `${appointment.therapistName || 'Your therapist'} added a video link for your appointment.`,
      appointmentId,
      metadata: { therapistId: appointment.therapistId },
    });
  }
};

export const formatAppointmentDate = (value) => {
  const date = normalizeDate(value);
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : date.toLocaleString();
};
