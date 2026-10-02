import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * TeacherPanel (Fase 1: Estructura Base)
 * Panel exclusivo para Docentes y Staff institucional.
 */
const TeacherPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      navigate('/login', { replace: true });
    }
  };

  const teacherName = user?.nombre || user?.email?.split('@')[0] || 'Profesor';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      {/* Header temporal de la Fase 1 */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">EduCore Staff</h1>
            <p className="text-xs text-slate-500">Portal del Docente · Ciclo Lectivo 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-800">{teacherName}</span>
            <span className="text-xs text-orange-600 font-semibold">{user?.role || 'Docente'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Contenido temporal de bienvenida de Fase 1 */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-3xl font-bold">
            <span className="material-symbols-outlined text-3xl">how_to_reg</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            ¡Bienvenido, {teacherName}!
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Tu acceso al <strong>Portal del Docente</strong> está correctamente autenticado y enlazado. En la Fase 2 montaremos el layout definitivo de Stitch con tus materias y la toma de asistencia.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Fase 1: Enrutamiento Conectado
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherPanel;
