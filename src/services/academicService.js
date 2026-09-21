import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

/**
 * SERVICIO DE GESTIÓN ACADÉMICA Y DEPORTIVA
 * Permite interactuar con las colecciones: courses, subjects, sports, schedules
 */

// =======================
// CURSOS (Courses)
// =======================

export const getCourses = async () => {
  const q = query(collection(db, 'courses'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createCourse = async (courseData) => {
  // courseData: { name: '1° Año A', level: 'secundaria' }
  const docRef = await addDoc(collection(db, 'courses'), courseData);
  return { id: docRef.id, ...courseData };
};

export const updateCourse = async (id, courseData) => {
  const docRef = doc(db, 'courses', id);
  await updateDoc(docRef, courseData);
};

export const deleteCourse = async (id) => {
  await deleteDoc(doc(db, 'courses', id));
};

// =======================
// MATERIAS (Subjects)
// =======================

export const getSubjects = async () => {
  const snapshot = await getDocs(collection(db, 'subjects'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createSubject = async (subjectData) => {
  // subjectData: { name: 'Matemáticas', courseId: '...', teacherId: '...' }
  const docRef = await addDoc(collection(db, 'subjects'), subjectData);
  return { id: docRef.id, ...subjectData };
};

export const updateSubject = async (id, subjectData) => {
  const docRef = doc(db, 'subjects', id);
  await updateDoc(docRef, subjectData);
};

export const deleteSubject = async (id) => {
  await deleteDoc(doc(db, 'subjects', id));
};

// =======================
// DEPORTES (Sports)
// =======================

export const getSports = async () => {
  const snapshot = await getDocs(collection(db, 'sports'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createSport = async (sportData) => {
  // sportData: { name: 'Fútbol', teacherId: '...' }
  const docRef = await addDoc(collection(db, 'sports'), sportData);
  return { id: docRef.id, ...sportData };
};

export const updateSport = async (id, sportData) => {
  const docRef = doc(db, 'sports', id);
  await updateDoc(docRef, sportData);
};

export const deleteSport = async (id) => {
  await deleteDoc(doc(db, 'sports', id));
};

// =======================
// HORARIOS (Schedules)
// =======================

export const getSchedules = async () => {
  const snapshot = await getDocs(collection(db, 'schedules'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createSchedule = async (scheduleData) => {
  // scheduleData: { referenceId: '...', type: 'subject'|'sport', dayOfWeek: 'Lunes', startTime: '08:00', endTime: '10:00' }
  const docRef = await addDoc(collection(db, 'schedules'), scheduleData);
  return { id: docRef.id, ...scheduleData };
};

export const updateSchedule = async (id, scheduleData) => {
  const docRef = doc(db, 'schedules', id);
  await updateDoc(docRef, scheduleData);
};

export const deleteSchedule = async (id) => {
  await deleteDoc(doc(db, 'schedules', id));
};
