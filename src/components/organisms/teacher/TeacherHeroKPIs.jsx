import React from 'react';

/**
 * TeacherHeroKPIs
 * Tarjetas de métricas y resumen rápido para el portal del docente.
 * Muestra alumnos totales, materias a cargo, talleres extracurriculares y estado de asistencia.
 */
const TeacherHeroKPIs = ({
  totalStudentsCount = 0,
  subjectsCount = 0,
  sportsCount = 0,
  onGoToAttendance,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* KPI 1: Alumnos a Cargo */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">groups</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Alumnos a Cargo
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {totalStudentsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">alumnos</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium truncate mt-0.5">
            Matriculados en tus cursos
          </p>
        </div>
      </div>

      {/* KPI 2: Materias Asignadas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">menu_book</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Materias Activas
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {subjectsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">materias</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium truncate mt-0.5">
            Ciclo Lectivo 2026
          </p>
        </div>
      </div>

      {/* KPI 3: Deportes y Talleres */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">sports_soccer</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Deportes y Talleres
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {sportsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">actividades</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium truncate mt-0.5">
            Extracurriculares
          </p>
        </div>
      </div>

      {/* KPI 4: Registro de Asistencia Rápido */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-5 rounded-2xl text-white shadow-md shadow-orange-500/20 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-orange-100">
            Asistencia de Hoy
          </span>
          <span className="material-symbols-outlined text-xl text-white/90">how_to_reg</span>
        </div>
        <div className="my-2">
          <span className="text-sm font-bold block leading-snug">
            ¿Tomaste asistencia hoy?
          </span>
          <p className="text-[11px] text-orange-100 leading-tight">
            Registra el presentismo diario de tus alumnos en un clic.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToAttendance}
          className="mt-1 px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Ir a Asistencias</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default TeacherHeroKPIs;
