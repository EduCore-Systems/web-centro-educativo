import React from 'react';

/**
 * StudentRosterModal
 * Modal para visualizar la nómina completa de alumnos matriculados en un curso/materia.
 */
const StudentRosterModal = ({ isOpen, onClose, subject, onTakeAttendance }) => {
  if (!isOpen || !subject) return null;

  const students = subject.students || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-orange-100 block">
                {subject.courseLevel ? subject.courseLevel.toUpperCase() : 'NIVEL GENERAL'} · {subject.courseName}
              </span>
              <h3 className="text-xl font-black text-white leading-tight">
                {subject.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Resumen de la materia */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-orange-600">schedule</span>
            <span>
              {subject.schedules && subject.schedules.length > 0
                ? subject.schedules.map(s => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(' · ')
                : 'Horario institucional coordinado'}
            </span>
          </div>
          <div className="font-bold text-slate-800">
            {students.length} alumnos matriculados
          </div>
        </div>

        {/* Lista de Alumnos */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
          {students.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                person_off
              </span>
              <p className="text-sm font-semibold">No hay alumnos asignados a este curso todavía.</p>
            </div>
          ) : (
            students.map((st, idx) => {
              const initials = (st.nombre || 'Al')
                .split(' ')
                .slice(0, 2)
                .map(n => n[0]?.toUpperCase())
                .join('');

              return (
                <div key={st.id || idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-sm block truncate">
                        {st.nombre}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>DNI: <strong className="text-slate-600">{st.dni || 'Sin DNI'}</strong></span>
                        <span>·</span>
                        <span>Legajo: <strong className="text-slate-600">{st.studentID_login || st.id}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold shrink-0">
                    {st.status || 'Activo'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer del Modal con Acciones */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar Nómina
          </button>

          {onTakeAttendance && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onTakeAttendance(subject);
              }}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">how_to_reg</span>
              <span>Tomar Asistencia de esta Materia</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRosterModal;
