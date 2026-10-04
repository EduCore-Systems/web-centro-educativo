import React, { useState, useMemo } from 'react';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

/**
 * TeacherScheduleTab
 * Visualizador del cronograma semanal de clases y actividades del docente.
 * Ordena las materias y deportes asignados de Lunes a Viernes.
 */
const TeacherScheduleTab = ({ subjects = [], sports = [] }) => {
  const [selectedDayMobile, setSelectedDayMobile] = useState('Lunes');

  // Consolidar todos los ítems de horario del docente
  const scheduleItems = useMemo(() => {
    const items = [];

    // Materias
    subjects.forEach((sub) => {
      (sub.schedules || []).forEach((sch) => {
        items.push({
          id: `${sub.id}-${sch.dayOfWeek}-${sch.startTime}`,
          title: sub.name,
          subtitle: sub.courseName || 'Curso General',
          dayOfWeek: sch.dayOfWeek,
          startTime: sch.startTime || '08:00',
          endTime: sch.endTime || '09:30',
          type: 'subject',
          level: sub.courseLevel,
        });
      });
    });

    // Deportes y Talleres
    sports.forEach((sp) => {
      (sp.schedules || []).forEach((sch) => {
        items.push({
          id: `${sp.id}-${sch.dayOfWeek}-${sch.startTime}`,
          title: sp.name,
          subtitle: 'Taller Extracurricular',
          dayOfWeek: sch.dayOfWeek,
          startTime: sch.startTime || '17:00',
          endTime: sch.endTime || '18:30',
          type: 'sport',
          level: 'todos',
        });
      });
    });

    // Ordenar por hora de inicio
    return items.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
  }, [subjects, sports]);

  // Agrupar ítems por día de la semana
  const itemsByDay = useMemo(() => {
    const grouped = {};
    DAYS_OF_WEEK.forEach((day) => {
      grouped[day] = scheduleItems.filter((i) => i.dayOfWeek?.toLowerCase() === day.toLowerCase());
    });
    return grouped;
  }, [scheduleItems]);

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector para Mobile */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Cronograma de Clases y Actividades
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Horarios lectivos coordinados para el ciclo lectivo en curso.
          </p>
        </div>

        {/* Selector de día para pantallas pequeñas */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto w-full pb-1">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDayMobile(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedDayMobile === day
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Semanal para Desktop (5 columnas: Lun a Vie) */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayItems = itemsByDay[day] || [];
          return (
            <div
              key={day}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col"
            >
              {/* Encabezado de la columna del día */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-center">
                <span className="font-black text-slate-900 dark:text-white text-sm block">
                  {day}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {dayItems.length} {dayItems.length === 1 ? 'bloque' : 'bloques'}
                </span>
              </div>

              {/* Clases asignadas a este día */}
              <div className="p-3 flex-1 flex flex-col gap-2.5 min-h-[300px] bg-white dark:bg-slate-900">
                {dayItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-8 text-center">
                    <span className="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600 mb-1">
                      free_cancellation
                    </span>
                    <span className="text-[11px]">Sin clases fijadas</span>
                  </div>
                ) : (
                  dayItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all hover:shadow-xs ${
                        item.type === 'sport'
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100'
                          : 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200/80 dark:border-orange-800/60 text-orange-950 dark:text-orange-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          {item.startTime} - {item.endTime}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.type === 'sport'
                              ? 'bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-orange-200/70 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300'
                          }`}
                        >
                          {item.type === 'sport' ? 'Taller' : 'Materia'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {item.subtitle}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista de lista para Mobile (muestra el día seleccionado) */}
      <div className="lg:hidden bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span>Clases para el {selectedDayMobile}</span>
          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            {(itemsByDay[selectedDayMobile] || []).length} bloques
          </span>
        </h3>

        {(itemsByDay[selectedDayMobile] || []).length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
            No tienes asignaciones fijas para este día.
          </p>
        ) : (
          (itemsByDay[selectedDayMobile] || []).map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                item.type === 'sport'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100'
                  : 'bg-orange-50/60 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/60 text-orange-950 dark:text-orange-100'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  {item.startTime} - {item.endTime}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  item.type === 'sport'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300'
                }`}
              >
                {item.type === 'sport' ? 'Deporte' : 'Materia'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherScheduleTab;
