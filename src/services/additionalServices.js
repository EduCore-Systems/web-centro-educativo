import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * SERVICIOS ADICIONALES (TRANSPORTE Y COMEDOR)
 */

// =======================
// TRANSPORTE (Recorridos)
// =======================

export const getTransportRoutes = async () => {
  const snapshot = await getDocs(collection(db, 'transportRoutes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createTransportRoute = async (routeData) => {
  // routeData: { name: 'Recorrido Norte', cost: 5000 }
  const docRef = await addDoc(collection(db, 'transportRoutes'), routeData);
  return { id: docRef.id, ...routeData };
};

export const updateTransportRoute = async (id, routeData) => {
  const docRef = doc(db, 'transportRoutes', id);
  await updateDoc(docRef, routeData);
};

export const deleteTransportRoute = async (id) => {
  await deleteDoc(doc(db, 'transportRoutes', id));
};

// =======================
// ESTUDIANTES (Asignaciones)
// =======================

export const getStudents = async () => {
  const snapshot = await getDocs(collection(db, 'students'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Asignar o desasignar recorrido de transporte a un alumno
export const updateStudentTransport = async (studentId, transportRouteId) => {
  const docRef = doc(db, 'students', studentId);
  await updateDoc(docRef, { transportRouteId });
};

// Habilitar o deshabilitar servicio de comedor
export const updateStudentDining = async (studentId, diningRoomEnabled) => {
  const docRef = doc(db, 'students', studentId);
  await updateDoc(docRef, { diningRoomEnabled });
};
