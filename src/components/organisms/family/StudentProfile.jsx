import React from 'react';

/**
 * StudentProfile (Paso 2)
 * Componente que renderiza la ficha y el perfil académico del alumno seleccionado.
 * Cumple con el requerimiento de consulta de datos del estudiante:
 * - Nombre, DNI, Legajo institucional.
 * - Nivel y Curso escolar.
 * - Estado de regularidad.
 * - Métricas rápidas de seguimiento (Asistencia, Promedio, Conducta).
 */
const StudentProfile = ({ student }) => {
  if (!student) return null;

  // Generar iniciales para el avatar en caso de que no tenga foto
  const initials = (student.nombre || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Nivel capitalizado para mostrar prolijo
  const nivelFormatted = student.nivel
    ? student.nivel.charAt(0).toUpperCase() + student.nivel.slice(1)
    : 'Nivel General';

  const estado = student.status || 'Activo';

  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all duration-300">
      {/* ── COLUMNA IZQUIERDA: FOTO / DATOS DEL ALUMNO ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
        {/* Avatar / Iniciales */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
          {initials}
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Activo" />
        </div>

        {/* Información personal y escolar */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {student.nombre}
            </h2>
            <span className="px-3 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
              {estado}
            </span>
          </div>

          <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-orange-500">school</span>
            {nivelFormatted} · <span className="text-slate-900 font-semibold">{student.curso || 'Sin curso asignado'}</span>
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-slate-400">badge</span>
              Legajo: <strong className="text-slate-700 font-semibold">{student.studentID_login || student.id}</strong>
            </span>
            {student.dni && (
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">fingerprint</span>
                DNI: <strong className="text-slate-700 font-semibold">{student.dni}</strong>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-slate-400">verified</span>
              Ciclo Lectivo: <strong className="text-slate-700 font-semibold">2026</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── COLUMNA DERECHA: INDICADORES RÁPIDOS (KPIs) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
        {/* Asistencia */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-w-[110px]">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            Asistencia
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900">96%</span>
            <span className="text-emerald-600 text-xs font-semibold">Óptima</span>
          </div>
        </div>

        {/* Promedio */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-w-[110px]">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            Promedio
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-orange-600">8.8</span>
            <span className="text-slate-400 text-xs">/ 10</span>
          </div>
        </div>

        {/* Conducta */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center min-w-[110px]">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            Conducta
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-base font-bold text-slate-900">Excelente</span>
            <span className="material-symbols-outlined text-emerald-600 text-base">verified_user</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentProfile;
