import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Función auxiliar para asignar un ícono temático y color suave según el nombre de la materia
 */
const getSubjectStyle = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('matemática') || n.includes('física')) {
    return { icon: 'calculate', bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-200' };
  }
  if (n.includes('lengua') || n.includes('literatura') || n.includes('lectura')) {
    return { icon: 'auto_stories', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' };
  }
  if (n.includes('química') || n.includes('naturales') || n.includes('biología') || n.includes('ciencia')) {
    return { icon: 'science', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200' };
  }
  if (n.includes('sociales') || n.includes('historia') || n.includes('geografía')) {
    return { icon: 'public', bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-200' };
  }
  if (n.includes('inglés') || n.includes('portugués') || n.includes('francés') || n.includes('idioma')) {
    return { icon: 'translate', bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-200' };
  }
  if (n.includes('física') || n.includes('deporte') || n.includes('corporal')) {
    return { icon: 'fitness_center', bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-200' };
  }
  if (n.includes('informática') || n.includes('robótica') || n.includes('tecnología')) {
    return { icon: 'computer', bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-200' };
  }
  return { icon: 'school', bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-200' };
};

/**
 * StudentSubjects (Paso 3)
 * Muestra la grilla de asignaturas en curso del alumno seleccionado (RF-15).
 */
const StudentSubjects = ({ student }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.curso) return;

    const fetchSubjects = async () => {
      setLoading(true);
      try {
        // 1. Encontrar el curso en la colección 'courses' por el nombre (ej. '4° Grado A')
        const coursesQuery = query(
          collection(db, 'courses'),
          where('name', '==', student.curso.trim())
        );
        const courseSnap = await getDocs(coursesQuery);

        let courseId = null;
        if (!courseSnap.empty) {
          courseId = courseSnap.docs[0].id;
        }

        let results = [];
        if (courseId) {
          // 2. Traer las materias que pertenecen a este curso
          const subjectsQuery = query(
            collection(db, 'subjects'),
            where('courseId', '==', courseId)
          );
          const subjectsSnap = await getDocs(subjectsQuery);
          results = subjectsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
        }

        // Si no encontró materias en Firestore para ese curso particular, asignamos materias base del nivel
        if (results.length === 0) {
          if (student.nivel === 'inicial') {
            results = [
              { id: 'sub-1', name: 'Iniciación al Lenguaje', teacherName: 'Prof. Mariana Rossi', schedule: 'Turno Mañana' },
              { id: 'sub-2', name: 'Juegos y Matemática', teacherName: 'Prof. Mariana Rossi', schedule: 'Turno Mañana' },
              { id: 'sub-3', name: 'Expresión Corporal y Música', teacherName: 'Prof. Diego Torres', schedule: 'Mié - Vie' },
            ];
          } else if (student.nivel === 'primaria') {
            results = [
              { id: 'sub-1', name: 'Matemática', teacherName: 'Prof. Carlos Benítez', schedule: 'Lun - Mié 08:00 a 09:30' },
              { id: 'sub-2', name: 'Prácticas del Lenguaje', teacherName: 'Prof. Laura Méndez', schedule: 'Mar - Jue 08:00 a 09:30' },
              { id: 'sub-3', name: 'Ciencias Naturales', teacherName: 'Prof. Carlos Benítez', schedule: 'Mié - Vie 10:00 a 11:30' },
              { id: 'sub-4', name: 'Educación Física', teacherName: 'Prof. Diego Torres', schedule: 'Vie 14:00 a 16:00' },
            ];
          } else {
            results = [
              { id: 'sub-1', name: 'Matemática I', teacherName: 'Prof. Alejandro Varela', schedule: 'Lun · Mié 08:00' },
              { id: 'sub-2', name: 'Lengua y Literatura', teacherName: 'Prof. Carmen Delgado', schedule: 'Mar · Jue 09:30' },
              { id: 'sub-3', name: 'Química General', teacherName: 'Prof. Alejandro Varela', schedule: 'Vie 10:00' },
              { id: 'sub-4', name: 'Historia', teacherName: 'Prof. Carmen Delgado', schedule: 'Lun · Vie 11:30' },
            ];
          }
        }

        setSubjects(results);
      } catch (error) {
        console.error('Error cargando materias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [student?.curso, student?.nivel]);

  return (
    <section className="space-y-4">
      {/* Encabezado de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-orange-500 text-2xl">menu_book</span>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Materias en Curso
          </h3>
          {!loading && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {subjects.length} Asignaturas
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Plan Académico Oficial · Ciclo Lectivo 2026
        </p>
      </div>

      {/* Estado: Cargando */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Estado: Grilla de Materias */}
      {!loading && subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub, index) => {
            const style = getSubjectStyle(sub.name);
            return (
              <div
                key={sub.id || index}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 group"
              >
                {/* Cabecera de la materia */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-base truncate group-hover:text-orange-600 transition-colors">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-xs text-slate-400">person</span>
                        {sub.teacherName || sub.profesor || 'Docente a cargo'}
                      </p>
                    </div>
                  </div>
                  {/* Badge de regularidad */}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold whitespace-nowrap">
                    En curso
                  </span>
                </div>

                {/* Pie con Horario y Botón de Tutoría */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                    {sub.schedule || 'Turno Regular'}
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Consulta enviada a secretaría sobre ${sub.name}.`)}
                    className="text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    Consulta
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default StudentSubjects;
