import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

/**
 * SERVICIO DEL PORTAL DOCENTE (Teacher Service)
 * Orquesta la carga de materias, cursos, alumnos, deportes y horarios del docente autenticado.
 */

/**
 * Obtiene las materias asignadas al docente autenticado.
 * Soporta vinculación por teacherId (doc-xxx), por UID de Firebase Auth, o por coincidencia de nombre/email.
 */
export const getTeacherAcademicData = async (user) => {
  if (!user) return { subjects: [], sports: [], courses: [], schedules: [], students: [] };

  const teacherId = user.teacherId || null;
  const userUid = user.uid || null;
  const userEmail = user.email || '';
  const userNombre = user.nombre || '';

  // 1. Obtener cursos, materias, deportes, horarios y alumnos en paralelo
  const [coursesSnap, subjectsSnap, sportsSnap, schedulesSnap, studentsSnap] = await Promise.all([
    getDocs(collection(db, 'courses')),
    getDocs(collection(db, 'subjects')),
    getDocs(collection(db, 'sports')),
    getDocs(collection(db, 'schedules')),
    getDocs(collection(db, 'students')),
  ]);

  const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allSubjects = subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allSports = sportsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allSchedules = schedulesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allStudents = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Mapa de cursos por id para acceso O(1)
  const courseMap = {};
  courses.forEach(c => {
    courseMap[c.id] = c;
    if (c.name) courseMap[c.name] = c;
  });

  // 2. Filtrar materias pertenecientes a este docente
  const teacherSubjects = allSubjects.filter(sub => {
    if (teacherId && sub.teacherId === teacherId) return true;
    if (userUid && sub.teacherId === userUid) return true;
    if (sub.teacherEmail && sub.teacherEmail.toLowerCase() === userEmail.toLowerCase()) return true;
    if (sub.teacherName && userNombre && sub.teacherName.toLowerCase().includes(userNombre.toLowerCase().split(' ')[1] || '---')) return true;
    return false;
  }).map(sub => {
    const course = courseMap[sub.courseId] || { name: 'Curso General', level: 'primaria' };
    const schedules = allSchedules.filter(sch => sch.referenceId === sub.id && sch.type === 'subject');
    const enrolledStudents = allStudents.filter(st => st.curso && (st.curso === course.name || st.courseId === sub.courseId));

    return {
      ...sub,
      courseName: course.name,
      courseLevel: course.level || 'primaria',
      schedules,
      students: enrolledStudents,
      studentsCount: enrolledStudents.length,
    };
  });

  // 3. Filtrar deportes y talleres a cargo del docente
  const teacherSports = allSports.filter(sp => {
    if (teacherId && sp.teacherId === teacherId) return true;
    if (userUid && sp.teacherId === userUid) return true;
    if (sp.teacherEmail && sp.teacherEmail.toLowerCase() === userEmail.toLowerCase()) return true;
    if (sp.teacherName && userNombre && sp.teacherName.toLowerCase().includes(userNombre.toLowerCase().split(' ')[1] || '---')) return true;
    return false;
  }).map(sp => {
    const schedules = allSchedules.filter(sch => sch.referenceId === sp.id && sch.type === 'sport');
    return {
      ...sp,
      schedules,
    };
  });

  // 4. Calcular alumnos únicos a cargo
  const uniqueStudentsMap = new Map();
  teacherSubjects.forEach(sub => {
    sub.students.forEach(st => {
      uniqueStudentsMap.set(st.id || st.studentID_login || st.dni, st);
    });
  });
  const uniqueStudents = Array.from(uniqueStudentsMap.values());

  return {
    subjects: teacherSubjects,
    sports: teacherSports,
    courses,
    schedules: allSchedules,
    students: uniqueStudents,
    totalStudentsCount: uniqueStudents.length,
  };
};

/**
 * Obtiene los alumnos matriculados en un curso específico por su nombre o ID.
 */
export const getStudentsByCourseName = async (courseName) => {
  if (!courseName) return [];
  const q = query(collection(db, 'students'), where('curso', '==', courseName));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
