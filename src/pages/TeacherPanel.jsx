import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTeacherAcademicData } from '../services/teacherService';
import TeacherSidebar from '../components/organisms/teacher/TeacherSidebar';
import TeacherHeader from '../components/organisms/teacher/TeacherHeader';
import TeacherHeroKPIs from '../components/organisms/teacher/TeacherHeroKPIs';
import TeacherCoursesTab from '../components/organisms/teacher/TeacherCoursesTab';
import TeacherAttendanceTab from '../components/organisms/teacher/TeacherAttendanceTab';
import TeacherScheduleTab from '../components/organisms/teacher/TeacherScheduleTab';
import TeacherSportsTab from '../components/organisms/teacher/TeacherSportsTab';
import TeacherMessagesTab from '../components/organisms/teacher/TeacherMessagesTab';

/**
 * TeacherPanel (Fase 2 & 3 Completa)
 * Panel integral para el personal docente y staff de EduCore.
 * Administra materias, nómina de alumnos, cronograma lectivo, deportes y toma de asistencia.
 */
const TeacherPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Estados de navegación y visibilidad del sidebar
  const [activeTab, setActiveTab] = useState('courses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('teacher_sidebar_collapsed') === 'true';
  });

  // Datos académicos enlazados con Firestore
  const [academicData, setAcademicData] = useState({
    subjects: [],
    sports: [],
    courses: [],
    schedules: [],
    students: [],
    totalStudentsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Materia seleccionada para derivar directo a la toma de asistencia
  const [attendanceSubject, setAttendanceSubject] = useState(null);

  // Guardar estado del colapsado en localStorage
  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('teacher_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Carga de datos del docente desde Firestore
  const loadTeacherData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getTeacherAcademicData(user);
      setAcademicData(data);
    } catch (err) {
      console.error('Error al cargar datos del docente:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

  // Cierre de sesión seguro
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      navigate('/login', { replace: true });
    }
  };

  // Atajo para ir a tomar asistencia desde una materia particular
  const handleTakeAttendanceFromCourse = (subject) => {
    setAttendanceSubject(subject);
    setActiveTab('attendance');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body text-slate-800">
      {/* ── BARRA LATERAL (SIDEBAR) ── */}
      <TeacherSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onLogout={handleLogout}
      />

      {/* ── CONTENIDO PRINCIPAL (con padding dinámico según sidebar) ── */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-0' : 'lg:pl-72'
        }`}
      >
        {/* Barra Superior Fija */}
        <TeacherHeader
          onToggleSidebar={() => {
            if (window.innerWidth >= 1024) {
              handleToggleCollapse();
            } else {
              setIsSidebarOpen((prev) => !prev);
            }
          }}
          user={user}
        />

        {/* Cuerpo del Dashboard */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
              <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-semibold text-slate-600">
                Sincronizando información académica del docente...
              </p>
            </div>
          ) : (
            <>
              {/* Tarjetas de Métricas (Hero KPIs) */}
              <TeacherHeroKPIs
                totalStudentsCount={academicData.totalStudentsCount}
                subjectsCount={academicData.subjects.length}
                sportsCount={academicData.sports.length}
                onGoToAttendance={() => {
                  setActiveTab('attendance');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {/* Contenido según la pestaña activa */}
              {activeTab === 'courses' && (
                <TeacherCoursesTab
                  subjects={academicData.subjects}
                  onTakeAttendance={handleTakeAttendanceFromCourse}
                />
              )}

              {activeTab === 'attendance' && (
                <TeacherAttendanceTab
                  subjects={academicData.subjects}
                  preselectedSubject={attendanceSubject}
                  user={user}
                />
              )}

              {activeTab === 'messages' && (
                <TeacherMessagesTab
                  user={user}
                  subjects={academicData.subjects}
                />
              )}

              {activeTab === 'schedule' && (
                <TeacherScheduleTab
                  subjects={academicData.subjects}
                  sports={academicData.sports}
                />
              )}

              {activeTab === 'sports' && (
                <TeacherSportsTab sports={academicData.sports} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherPanel;
