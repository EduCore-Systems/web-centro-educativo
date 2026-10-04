import React from 'react';

/**
 * TeacherSportsTab
 * Visualizador de actividades deportivas y talleres a cargo del docente.
 */
const TeacherSportsTab = ({ sports = [] }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Deportes y Talleres Extracurriculares
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Espacios formativos, entrenamientos y talleres a tu cargo.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          {sports.length} {sports.length === 1 ? 'actividad activa' : 'actividades activas'}
        </span>
      </div>

      {sports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">sports_soccer</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Sin talleres o deportes asignados
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Actualmente tu perfil no registra actividades deportivas o talleres extracurriculares a cargo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sp) => (
            <div
              key={sp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                    Taller Institucional
                  </span>
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">
                    verified
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  {sp.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {sp.description || 'Actividad formativa y deportiva orientada al desarrollo integral de los estudiantes.'}
                </p>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-emerald-600 dark:text-emerald-400 shrink-0">
                      schedule
                    </span>
                    <span>
                      {sp.schedules && sp.schedules.length > 0
                        ? sp.schedules.map((s) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(' · ')
                        : sp.schedule || 'Horario a coordinar'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-slate-400 dark:text-slate-500 shrink-0">
                      stadium
                    </span>
                    <span>Instalaciones del Campus Escolar</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500">Ciclo Lectivo 2026</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  En Dictado
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSportsTab;
