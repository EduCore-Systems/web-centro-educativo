import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import StudentProfile from '../components/organisms/family/StudentProfile';
import StudentSubjects from '../components/organisms/family/StudentSubjects';

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTE: Tarjeta de un alumno en el selector
// Props:
//   student      → objeto del alumno con nombre, nivel, curso, etc.
//   isActive     → boolean que indica si es el hijo seleccionado actualmente
//   onClick      → función que se ejecuta al hacer click en la tarjeta
// ─────────────────────────────────────────────────────────────────────────────
const StudentCard = ({ student, isActive, onClick }) => {
  // Generamos las iniciales del nombre para mostrar en el avatar (ej: "Mateo Rossi" → "MR")
  const initials = (student.nombre || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-2xl shadow-sm flex items-center justify-between
        transition-all duration-200 cursor-pointer
        ${isActive
          ? 'bg-orange-50/30 ring-2 ring-orange-500'       // Estilo cuando está seleccionado
          : 'bg-white hover:shadow-md hover:bg-slate-50'   // Estilo cuando NO está seleccionado
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar con las iniciales del alumno */}
        <div className={`
          relative w-12 h-12 rounded-full flex items-center justify-center
          text-white font-bold text-lg shadow-sm flex-shrink-0
          ${isActive
            ? 'bg-gradient-to-br from-orange-500 to-amber-500'
            : 'bg-slate-200 text-slate-500'
          }
        `}>
          {initials}
          {/* Punto verde de "activo" que aparece solo en la tarjeta seleccionada */}
          {isActive && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </div>

        {/* Nombre, nivel y curso del alumno */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-900 truncate">{student.nombre}</span>
            {isActive && (
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider">
                Activo
              </span>
            )}
          </div>
          {/* Nivel formateado + Curso, ej: "Secundaria · 3° Año B" */}
          <p className="text-sm text-slate-500 truncate capitalize">
            {student.nivel} · {student.curso || 'Sin curso asignado'}
          </p>
        </div>
      </div>

      {/* Ícono de check (solo en el activo) o flecha (en los inactivos al pasar el mouse) */}
      {isActive
        ? <span className="material-symbols-outlined text-orange-500">check_circle</span>
        : <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500">arrow_forward</span>
      }
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: FamilyPanel
// Es la página completa del Portal de Padres. Por ahora solo muestra
// el encabezado y el selector de hijos (Paso 1).
// ─────────────────────────────────────────────────────────────────────────────
const FamilyPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();   // El usuario logueado (padre) desde el contexto global

  // Lista de todos los hijos que el sistema encontró para este padre en Firebase
  const [children, setChildren] = useState([]);

  // El hijo que el padre tiene seleccionado actualmente (objeto completo del alumno)
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Bandera para mostrar un spinner de carga mientras se consulta Firebase
  const [loading, setLoading] = useState(true);

  // ── Seguridad: Si alguien llega acá sin ser Padre, lo redirigimos al login ──
  useEffect(() => {
    if (user && user.role !== 'Padre' && user.role !== 'Padre/Tutor') {
      navigate('/login');
    }
  }, [user, navigate]);

  // ── Consulta a Firebase: buscar los alumnos de este padre ──
  // Se ejecuta cuando el componente carga y cuando cambia el usuario logueado
  useEffect(() => {
    if (!user?.uid) return; // Si no hay usuario logueado, no hacemos nada

    const fetchChildren = async () => {
      setLoading(true);
      try {
        // Buscar en la colección "students" todos donde parentId == uid del padre
        const q = query(
          collection(db, 'students'),
          where('parentId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);

        // Convertir los documentos de Firebase a un array de objetos JavaScript
        let results = querySnapshot.docs.map((doc) => ({
          id: doc.id,       // El ID del documento en Firebase (lo usaremos después)
          ...doc.data(),    // Todos los campos: nombre, nivel, curso, etc.
        }));

        // Si no encontró por parentId pero el usuario tiene studentIds asociados
        if (results.length === 0 && Array.isArray(user?.studentIds) && user.studentIds.length > 0) {
          const { doc: getDocRef, getDoc } = await import('firebase/firestore');
          const promises = user.studentIds.map(async (sId) => {
            const snap = await getDoc(getDocRef(db, 'students', sId));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
          });
          const fetched = await Promise.all(promises);
          results = fetched.filter(Boolean);
        }

        setChildren(results);

        // Seleccionar el primer hijo automáticamente
        if (results.length > 0) {
          setSelectedStudent(results[0]);
        }
      } catch (error) {
        console.error('Error al cargar los hijos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user?.uid, user?.studentIds]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── ENCABEZADO DE LA PÁGINA ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Portal de Familias
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Matrícula al Día
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Centro Educativo EduCore · Ciclo Lectivo 2025
            </p>
          </div>

          {/* Saludo personalizado con el nombre del padre logueado */}
          <div className="text-right">
            <p className="text-slate-500 text-sm">Bienvenido/a,</p>
            <p className="font-semibold text-slate-900">{user?.nombre || user?.name || 'Tutor'}</p>
          </div>
        </div>

        {/* ── SELECTOR DE HIJOS (PASO 1) ── */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-orange-500">family_restroom</span>
            <h2 className="text-lg font-semibold text-slate-700">
              Mis Hijos
            </h2>
            {!loading && children.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                {children.length} {children.length === 1 ? 'alumno' : 'alumnos'} vinculados
              </span>
            )}
          </div>

          {/* Estado: Cargando desde Firebase */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Skeleton loader: muestra 3 tarjetas grises mientras carga */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm animate-pulse flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Estado: Cargó pero no encontró hijos vinculados a este padre */}
          {!loading && children.length === 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">
                family_restroom
              </span>
              <p className="text-slate-500 font-medium">
                No se encontraron estudiantes vinculados a su cuenta.
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Contacte a la administración para vincular a sus hijos.
              </p>
            </div>
          )}

          {/* Estado: Encontró hijos → muestra las tarjetas */}
          {!loading && children.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {children.map((child) => (
                <StudentCard
                  key={child.id}
                  student={child}
                  isActive={selectedStudent?.id === child.id}   // Comparamos IDs para saber cuál está activo
                  onClick={() => setSelectedStudent(child)}      // Al hacer click, cambiamos el alumno seleccionado
                />
              ))}
            </div>
          )}
        </section>

        {/* ── ZONA DE CONTENIDO DEL HIJO SELECCIONADO ── */}
        {selectedStudent && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* PASO 2: Ficha y Perfil Académico del Estudiante */}
            <StudentProfile student={selectedStudent} />

            {/* PASO 3: Grilla de Materias y Docentes (RF-15) */}
            <StudentSubjects student={selectedStudent} />

            {/* Marcador de posición para Paso 4: Servicios y Deportes */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center min-h-[160px]">
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl text-orange-400 mb-2 block">
                  sports_soccer
                </span>
                <p className="text-slate-400 font-medium">
                  Próximo Paso 4: Servicios y Actividades (Deportes, Comedor y Transporte) de{' '}
                  <span className="text-orange-500 font-semibold">{selectedStudent.nombre}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FamilyPanel;
