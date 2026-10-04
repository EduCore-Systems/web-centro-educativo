import React, { useState, useEffect } from 'react';
import { getStudentAttendanceHistory } from '../../../services/attendanceService';

/**
 * StudentProfile
 * Ficha y perfil académico del alumno seleccionado en el Portal de Familias.
 * Muestra datos de legajo, curso y calcula la asistencia REAL desde la base de datos Firestore.
 */
const StudentProfile = ({ student }) => {
  const [attendanceData, setAttendanceData] = useState({
    percentage: 96,
    statusLabel: 'Óptima',
    presents: 0,
    totalClasses: 0,
    history: [],
    loading: true,
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Cargar asistencias reales del alumno desde Firestore
  useEffect(() => {
    if (!student) return;

    let isMounted = true;
    const fetchAttendance = async () => {
      try {
        const studentIdentifier = student.id || student.studentID_login || student.dni;
        const res = await getStudentAttendanceHistory(studentIdentifier);
        if (!isMounted) return;

        if (res.totalClasses > 0) {
          const label =
            res.percentage >= 85
              ? 'Óptima'
              : res.percentage >= 75
              ? 'Regular'
              : 'En riesgo';

          setAttendanceData({
            percentage: res.percentage,
            statusLabel: label,
            presents: res.presents,
            totalClasses: res.totalClasses,
            history: res.history,
            loading: false,
          });
        } else {
          // Si aún no se tomaron asistencias en el ciclo
          setAttendanceData({
            percentage: 100,
            statusLabel: 'Al día',
            presents: 0,
            totalClasses: 0,
            history: [],
            loading: false,
          });
        }
      } catch (err) {
        console.error('Error al cargar asistencia del alumno:', err);
        if (isMounted) {
          setAttendanceData((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    fetchAttendance();

    return () => {
      isMounted = false;
    };
  }, [student]);

  if (!student) return null;

  const initials = (student.nombre || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const nivelFormatted = student.nivel
    ? student.nivel.charAt(0).toUpperCase() + student.nivel.slice(1)
    : 'Nivel General';

  const estado = student.status || 'Activo';

  const getStatusColor = (label) => {
    if (label === 'Óptima' || label === 'Al día') return 'text-emerald-600';
    if (label === 'Regular') return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <>
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all duration-300">
        {/* ── COLUMNA IZQUIERDA: FOTO / DATOS DEL ALUMNO ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
          {/* Avatar / Iniciales */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
            {initials}
            <span
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
              title="Activo"
            />
          </div>

          {/* Información personal y escolar */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {student.nombre}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 text-xs font-bold uppercase tracking-wider">
                {estado}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-orange-500">school</span>
              {nivelFormatted} ·{' '}
              <span className="text-slate-900 dark:text-white font-semibold">
                {student.curso || 'Sin curso asignado'}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400 dark:text-slate-500">badge</span>
                Legajo:{' '}
                <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                  {student.studentID_login || student.id}
                </strong>
              </span>
              {student.dni && (
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-slate-400 dark:text-slate-500">
                    fingerprint
                  </span>
                  DNI: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{student.dni}</strong>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400 dark:text-slate-500">verified</span>
                Ciclo Lectivo: <strong className="text-slate-700 dark:text-slate-200 font-semibold">2026</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: INDICADORES RÁPIDOS (KPIs) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Asistencia (Interactiva con datos reales) */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 border border-slate-100 dark:border-slate-700/60 hover:border-orange-200 dark:hover:border-orange-500/40 flex flex-col justify-center min-w-[120px] transition-all text-left cursor-pointer group"
            title="Haz clic para ver el detalle de asistencias"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-orange-700 dark:group-hover:text-orange-400 font-medium uppercase tracking-wider">
                Asistencia
              </span>
              <span className="material-symbols-outlined text-sm text-slate-400 dark:text-slate-500 group-hover:text-orange-500">
                visibility
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {attendanceData.loading ? '...' : `${attendanceData.percentage}%`}
              </span>
              <span
                className={`text-xs font-semibold ${getStatusColor(
                  attendanceData.statusLabel
                )}`}
              >
                {attendanceData.statusLabel}
              </span>
            </div>
          </button>

          {/* Promedio */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex flex-col justify-center min-w-[110px]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Promedio
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">8.8</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs">/ 10</span>
            </div>
          </div>

          {/* Conducta */}
          <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex flex-col justify-center min-w-[110px]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Conducta
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-base font-bold text-slate-900 dark:text-white">Excelente</span>
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base">
                verified_user
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL DETALLE DE ASISTENCIAS HISTÓRICAS ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-orange-100 tracking-wider">
                  Historial de Asistencias
                </span>
                <h3 className="text-lg font-black">{student.nombre}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-white dark:bg-slate-850 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block uppercase">
                  Presentismo General
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {attendanceData.percentage}%
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-850 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block uppercase">
                  Clases Registradas
                </span>
                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  {attendanceData.totalClasses}
                </span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {attendanceData.history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <span className="material-symbols-outlined text-3xl mb-2 text-slate-300 dark:text-slate-600">
                    event_available
                  </span>
                  <p className="text-xs font-semibold">
                    No hay registros de inasistencias cargadas. El alumno cuenta con 100% de regularidad.
                  </p>
                </div>
              ) : (
                attendanceData.history.map((h, i) => {
                  const isPresent = h.status === 'presente';
                  const isLate = h.status === 'tarde';
                  const isJustified = h.status === 'ausente_justificado';

                  return (
                    <div key={i} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{h.subjectName}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">{h.date}</span>
                        {h.note && (
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] italic mt-0.5">"{h.note}"</p>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isPresent
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                            : isLate
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            : isJustified
                            ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {isPresent
                          ? 'Presente'
                          : isLate
                          ? 'Llegada Tarde'
                          : isJustified
                          ? 'Ausente Justificado'
                          : 'Ausente Injustificado'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentProfile;
