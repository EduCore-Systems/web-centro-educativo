import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import StudentProfile from '../components/organisms/family/StudentProfile';
import StudentSubjects from '../components/organisms/family/StudentSubjects';
import StudentServices from '../components/organisms/family/StudentServices';
import FamilyDocumentModal from '../components/organisms/family/FamilyDocumentModal';
import FamilySidebar from '../components/organisms/family/FamilySidebar';
import FamilyChatTab from '../components/organisms/family/FamilyChatTab';
import StudentCard from '../components/molecules/family/StudentCard';
import FamilyNavTabs from '../components/molecules/family/FamilyNavTabs';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: FamilyPanel
// Página modular del Portal de Familias estructurada bajo Atomic Design.
// ─────────────────────────────────────────────────────────────────────────────
const FamilyPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Lista de todos los hijos que el sistema encontró para este padre en Firebase
  const [children, setChildren] = useState([]);

  // El hijo que el padre tiene seleccionado actualmente (objeto completo del alumno)
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Bandera para mostrar un spinner de carga mientras se consulta Firebase
  const [loading, setLoading] = useState(true);

  // Estados para el Sidebar y Navegación
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('resumen');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      navigate('/login', { replace: true });
    }
  };

  // Estados para el Modal de Vinculación de Estudiante
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkDni, setLinkDni] = useState('');
  const [linkFeedback, setLinkFeedback] = useState('');

  // Función para seleccionar la sección modular activa
  const handleScrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Estado para consulta directa a docente desde la tarjeta de materia
  const [preselectedChatSubject, setPreselectedChatSubject] = useState(null);

  const handleOpenChatWithTeacher = (subject) => {
    setPreselectedChatSubject(subject);
    setActiveSection('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Materias del alumno actual para el Boletín
  const [currentSubjects, setCurrentSubjects] = useState([]);

  useEffect(() => {
    if (!selectedStudent?.curso) return;

    const fetchCurrentSubjects = async () => {
      try {
        const coursesQuery = query(
          collection(db, 'courses'),
          where('name', '==', selectedStudent.curso.trim())
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
          setCurrentSubjects(results);
        } else {
          setCurrentSubjects([
            { id: '1', name: 'Matemática', teacherName: 'Prof. Carlos Benítez', schedule: 'Lun - Mié 08:00' },
            { id: '2', name: 'Prácticas del Lenguaje', teacherName: 'Prof. Laura Méndez', schedule: 'Mar - Jue 08:00' },
            { id: '3', name: 'Ciencias Naturales', teacherName: 'Prof. Carlos Benítez', schedule: 'Mié - Vie 10:00' },
            { id: '4', name: 'Ciencias Sociales', teacherName: 'Prof. Laura Méndez', schedule: 'Lun - Jue 10:00' }
          ]);
        }
      } catch (err) {
        console.error('Error cargando materias para documento:', err);
      }
    };

    fetchCurrentSubjects();
  }, [selectedStudent?.curso]);

  // Estado para el Visor Formal de Documentos (Boletín / Certificado Regular)
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    type: 'boletin',
  });

  // Actualizar el estado del alumno localmente cuando se guardan servicios (Paso 4)
  const handleStudentUpdated = (updatedStudent) => {
    setSelectedStudent(updatedStudent);
    setChildren((prev) =>
      prev.map((c) => (c.id === updatedStudent.id ? updatedStudent : c))
    );
  };

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
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* ── BARRA LATERAL FAMILIAR (SIDEBAR) ── */}
      <FamilySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        activeSection={activeSection}
        onSelectSection={handleScrollToSection}
        user={user}
        childrenCount={children.length}
        onOpenDocument={(docType) => {
          if (!selectedStudent) return;
          setDocumentModal({ isOpen: true, type: docType });
        }}
        onLogout={handleLogout}
      />

      {/* ── ÁREA DE CONTENIDO PRINCIPAL (Margen dinámico sin superposición) ── */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'lg:pl-0' : 'lg:pl-64'}
        `}
      >
        {/* Barra superior de Dashboard */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Botón menú hamburguesa (visible en mobile) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Botón para alternar Sidebar en Desktop / Laptop */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-orange-600 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            >
              <span className="material-symbols-outlined text-2xl">
                {isSidebarCollapsed ? 'menu_open' : 'menu'}
              </span>
            </button>

            {/* Identificador de Portal */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-xl hidden sm:block">family_restroom</span>
              <span className="font-bold text-slate-800 text-sm">Portal Familiar</span>
            </div>
          </div>

          {/* Acciones de la barra superior */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Ciclo 2026 Activo
            </span>

            {/* Avatar / Nombre del tutor */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(user?.nombre || user?.name || 'T').charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-800">
                {user?.nombre || user?.name || 'Tutor'}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Portal de Familias
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Matrícula al Día
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                Centro Educativo EduCore · Ciclo Lectivo 2026
              </p>
            </div>

          {/* Botones de Documentación Rápida */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!selectedStudent) return;
                setDocumentModal({ isOpen: true, type: 'boletin' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-slate-500">download</span>
              <span>Boletín Actual</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!selectedStudent) return;
                setDocumentModal({ isOpen: true, type: 'certificado' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Certificado Regular</span>
            </button>
          </div>
        </div>

        {/* ── SELECTOR DE HIJOS (PASO 1) ── */}
        <section id="resumen" className="mb-8 scroll-mt-20">
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

          {/* Estado: Encontró hijos → muestra las tarjetas + Botón de Vincular */}
          {!loading && children.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {children.map((child) => (
                <StudentCard
                  key={child.id}
                  student={child}
                  isActive={selectedStudent?.id === child.id}   // Comparamos IDs para saber cuál está activo
                  onClick={() => setSelectedStudent(child)}      // Al hacer click, cambiamos el alumno seleccionado
                />
              ))}

              {/* Botón "+ Vincular Estudiante" (Estilo Stitch) */}
              <button
                type="button"
                onClick={() => {
                  setLinkDni('');
                  setLinkFeedback('');
                  setIsLinkModalOpen(true);
                }}
                className="w-full min-h-[76px] p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-orange-400 bg-white hover:bg-orange-50/20 text-slate-500 hover:text-orange-600 transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                </div>
                <span>Vincular Estudiante</span>
              </button>
            </div>
          )}
        </section>

        {/* ── ZONA DE CONTENIDO MODULAR DEL HIJO SELECCIONADO ── */}
        {selectedStudent && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Barra de navegación modular (Molécula) */}
            <FamilyNavTabs
              activeSection={activeSection}
              onSelectSection={handleScrollToSection}
            />

            {/* 1. Ficha y Perfil Académico del Estudiante */}
            {activeSection === 'resumen' && (
              <StudentProfile student={selectedStudent} />
            )}

            {/* 2. Grilla de Materias y Docentes (RF-15) */}
            {activeSection === 'materias' && (
              <StudentSubjects
                student={selectedStudent}
                onOpenChatWithTeacher={handleOpenChatWithTeacher}
              />
            )}

            {/* 3. Gestión de Servicios Extracurriculares, Transporte y Comedor (RF-16 y RF-17) */}
            {activeSection === 'servicios' && (
              <StudentServices
                student={selectedStudent}
                onStudentUpdated={handleStudentUpdated}
              />
            )}

            {/* 4. Canal de Mensajes y Consultas con Docentes */}
            {activeSection === 'chat' && (
              <FamilyChatTab
                student={selectedStudent}
                user={user}
                preselectedSubject={preselectedChatSubject}
                availableSubjects={currentSubjects}
                onBackToDashboard={() => handleScrollToSection('resumen')}
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
        student={selectedStudent}
        subjects={currentSubjects}
      />

      {/* ── MODAL: VINCULAR ESTUDIANTE A LA CUENTA ── */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Vincular Estudiante</h3>
                  <p className="text-xs text-slate-500">Agregue otro hijo a su panel familiar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                DNI o Legajo del Estudiante
              </label>
              <input
                type="text"
                value={linkDni}
                onChange={(e) => setLinkDni(e.target.value)}
                placeholder="Ej. 50111222 o EST-2026-101"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-400">
                La solicitud será remitida a secretaría académica para validar el parentesco y confirmar la vinculación.
              </p>

              {linkFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  {linkFeedback}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!linkDni.trim()) {
                    alert('Por favor ingrese un DNI o Legajo válido.');
                    return;
                  }
                  setLinkFeedback(`Solicitud de vinculación para el DNI/Legajo ${linkDni} enviada con éxito.`);
                  setTimeout(() => {
                    setIsLinkModalOpen(false);
                    setLinkFeedback('');
                  }, 2500);
                }}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyPanel;
