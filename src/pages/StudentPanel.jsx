import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Componentes según Atomic Design
import StudentNavTabs from '../components/molecules/student/StudentNavTabs';
import StudentSidebar from '../components/organisms/student/StudentSidebar';
import StudentScheduleView from '../components/organisms/student/StudentScheduleView';
import StudentProfile from '../components/organisms/family/StudentProfile';
import StudentSubjects from '../components/organisms/family/StudentSubjects';
import StudentServices from '../components/organisms/family/StudentServices';
import FamilyDocumentModal from '../components/organisms/family/FamilyDocumentModal';
import ThemeToggle from '../components/atoms/ThemeToggle';

/**
 * StudentPanel (Página)
 * Portal oficial del Alumno en EduCore.
 * Ofrece visualización en modo de solo lectura de la ficha académica,
 * materias y horarios, cronograma semanal y servicios escolares contratados.
 * Diseñado bajo Atomic Design con soporte pleno de modo oscuro.
 */
const StudentPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Objeto con el perfil completo del estudiante
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de navegación y sidebar
  const [activeSection, setActiveSection] = useState('resumen');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Estado para el Visor Formal de Documentos (Boletín / Certificado Regular)
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    type: 'boletin',
  });

  // Materias del alumno actual para la grilla y el boletín
  const [currentSubjects, setCurrentSubjects] = useState([]);

  // 1. Control de acceso: Verificar que el usuario tenga rol de Estudiante
  useEffect(() => {
    if (user && user.role !== 'Estudiante' && user.role !== 'student') {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // 2. Cargar perfil del alumno desde Firestore
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchStudentProfile = async () => {
      setLoading(true);
      try {
        let studentData = null;

        // A) Intentar buscar en la colección "students" por UID de Auth
        if (user.uid) {
          const directRef = doc(db, 'students', user.uid);
          const directSnap = await getDoc(directRef);
          if (directSnap.exists()) {
            studentData = { id: directSnap.id, ...directSnap.data() };
          }
        }

        // B) Si no se encontró por ID directo, buscar por studentID_login o DNI
        if (!studentData && (user.studentID_login || user.dni)) {
          const identifier = user.studentID_login || user.dni;
          const q = query(
            collection(db, 'students'),
            where('studentID_login', '==', identifier)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            studentData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          }
        }

        // C) Si aún no está en Firestore o es una sesión demo, usar datos de Auth
        if (!studentData) {
          studentData = {
            id: user.uid || 'demo-student',
            nombre: user.nombre || user.name || 'Estudiante EduCore',
            dni: user.dni || '50123456',
            legajo: user.legajo || user.studentID_login || 'EST-2026-101',
            curso: user.curso || '1° Año A',
            nivel: user.nivel || 'Secundaria',
            promedio: user.promedio || 8.75,
            conducta: user.conducta || 'Muy Buena',
            deportes: user.deportes || ['XjMjzVd0XVwv0jJSa24c'],
            usa_comedor: Boolean(user.usa_comedor),
            transporte_recorrido: user.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
          };
        }

        if (isMounted) {
          setStudent(studentData);
        }
      } catch (err) {
        console.error('Error al cargar perfil del estudiante:', err);
        if (isMounted) {
          setStudent({
            id: user.uid || 'fallback-student',
            nombre: user.nombre || 'Estudiante',
            curso: '1° Año A',
            nivel: 'Secundaria',
            promedio: 8.5,
            conducta: 'Muy Buena',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStudentProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // 3. Cargar las materias asociadas al curso del alumno
  useEffect(() => {
    if (!student?.curso) return;

    let isMounted = true;
    const fetchCourseSubjects = async () => {
      try {
        const coursesQuery = query(
          collection(db, 'courses'),
          where('name', '==', student.curso.trim())
        );
        const courseSnap = await getDocs(coursesQuery);
        if (!courseSnap.empty) {
          const courseId = courseSnap.docs[0].id;
          const subjectsQuery = query(
            collection(db, 'subjects'),
            where('courseId', '==', courseId)
          );
          const subjectsSnap = await getDocs(subjectsQuery);
          const results = subjectsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (isMounted) setCurrentSubjects(results);
        } else {
          if (isMounted) {
            setCurrentSubjects([
              { id: '1', name: 'Matemática', teacherName: 'Prof. Carlos Benítez', schedule: 'Lun - Mié 08:00' },
              { id: '2', name: 'Prácticas del Lenguaje', teacherName: 'Prof. Laura Méndez', schedule: 'Mar - Jue 08:00' },
              { id: '3', name: 'Ciencias Naturales', teacherName: 'Prof. Carlos Benítez', schedule: 'Mié - Vie 10:00' },
              { id: '4', name: 'Ciencias Sociales', teacherName: 'Prof. Laura Méndez', schedule: 'Lun - Jue 10:00' },
              { id: '5', name: 'Inglés Técnico', teacherName: 'Prof. Andrea Varela', schedule: 'Martes 11:30' },
            ]);
          }
        }
      } catch (err) {
        console.error('Error al cargar materias del alumno:', err);
      }
    };

    fetchCourseSubjects();

    return () => {
      isMounted = false;
    };
  }, [student?.curso]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      navigate('/login', { replace: true });
    }
  };

  const handleScrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* ── BARRA LATERAL DEL ALUMNO (SIDEBAR) ── */}
      <StudentSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        activeSection={activeSection}
        onSelectSection={handleScrollToSection}
        student={student}
        onOpenDocument={(docType) => {
          setDocumentModal({ isOpen: true, type: docType });
        }}
        onLogout={handleLogout}
      />

      {/* ── ÁREA DE CONTENIDO PRINCIPAL (Margen dinámico sin superposición) ── */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >
        {/* Barra superior del Dashboard */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa (Mobile) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Botón colapsar Sidebar en Desktop */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-orange-400 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            >
              <span className="material-symbols-outlined text-2xl">
                {isSidebarCollapsed ? 'menu_open' : 'menu'}
              </span>
            </button>

            {/* Identificador de Portal */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-xl hidden sm:block">school</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">Portal del Alumno</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Solo Lectura
              </span>
            </div>
          </div>

          {/* Acciones de la barra superior */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Ciclo 2026 Activo
            </span>

            {/* Alternador de Modo Claro/Oscuro */}
            <ThemeToggle />

            {/* Avatar del Alumno */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(student?.nombre || user?.nombre || 'E').charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {student?.nombre || user?.nombre || 'Estudiante'}
              </span>
            </div>
          </div>
        </header>

        {/* Contenedor central con scroll */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ── ENCABEZADO DE LA PÁGINA (ESTILO STITCH) ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Hola, {student?.nombre ? student.nombre.split(' ')[0] : 'Estudiante'} 👋
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Matrícula Regular
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Centro Educativo EduCore · {student?.curso || '1° Año A'} ({student?.nivel || 'Secundaria'})
              </p>
            </div>

            {/* Botones de Documentación Rápida */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setDocumentModal({ isOpen: true, type: 'boletin' })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-slate-500 dark:text-slate-400">download</span>
                <span>Descargar Boletín</span>
              </button>

              <button
                type="button"
                onClick={() => setDocumentModal({ isOpen: true, type: 'certificado' })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Certificado Regular</span>
              </button>
            </div>
          </div>

          {/* Estado de Carga */}
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Cargando tu información académica...
              </p>
            </div>
          )}

          {/* ── CONTENIDO MODULAR DEL ALUMNO ── */}
          {!loading && student && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Barra de navegación modular (Molécula) */}
              <StudentNavTabs
                activeSection={activeSection}
                onSelectSection={handleScrollToSection}
              />

              {/* 1. Mi Ficha Académica (Perfil, Calificaciones y Asistencia) */}
              {activeSection === 'resumen' && (
                <StudentProfile student={student} />
              )}

              {/* 2. Mis Asignaturas en curso (modo solo lectura) */}
              {activeSection === 'materias' && (
                <StudentSubjects
                  student={student}
                  readOnly={true}
                />
              )}

              {/* 3. Horario Semanal de Clases */}
              {activeSection === 'horario' && (
                <StudentScheduleView
                  student={student}
                  subjects={currentSubjects}
                />
              )}

              {/* 4. Servicios Escolares y Talleres (modo solo lectura) */}
              {activeSection === 'servicios' && (
                <StudentServices
                  student={student}
                  readOnly={true}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL VISOR FORMAL DE DOCUMENTOS (BOLETÍN / CERTIFICADO REGULAR) ── */}
      <FamilyDocumentModal
        isOpen={documentModal.isOpen}
        onClose={() => setDocumentModal((prev) => ({ ...prev, isOpen: false }))}
        type={documentModal.type}
        student={student}
        subjects={currentSubjects}
      />
    </div>
  );
};

export default StudentPanel;
