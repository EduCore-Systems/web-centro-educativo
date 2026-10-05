import React, { useState, useMemo } from 'react';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

/**
 * Deportes institucionales con sus días y horarios para cruzar con la matrícula del alumno
 */
const DEPORTES_CATALOGO = {
  XjMjzVd0XVwv0jJSa24c: { nombre: 'Fútbol Intercolegial', dias: ['Lunes', 'Miércoles'], hora: '17:00 - 18:30', lugar: 'Cancha Principal' },
  iv6ahBrUCK0WdhZSw68a: { nombre: 'Básquetbol Juvenil', dias: ['Martes', 'Jueves'], hora: '16:30 - 18:00', lugar: 'Gimnasio Cubierto' },
  IX1EM4Ximi9OzrZXJcGB: { nombre: 'Natación Formativa', dias: ['Sábados'], hora: '10:00 - 11:30', lugar: 'Natatorio Olímpico' },
  GX6lOytYeT0iO9g5GZt5: { nombre: 'Vóleibol Mixto', dias: ['Viernes'], hora: '16:00 - 17:30', lugar: 'Playón Deportivo' },
  '5lW9VLF6xaD7dMILDixr': { nombre: 'Taller de Ajedrez', dias: ['Miércoles'], hora: '15:30 - 17:00', lugar: 'Biblioteca Central' },
  p7RnwuVEKZ4SLRL5NusH: { nombre: 'Atletismo y Pista', dias: ['Martes', 'Jueves'], hora: '17:30 - 19:00', lugar: 'Pista de Atletismo' },
};

/**
 * StudentScheduleView (Organismo)
 * Visualizador semanal del cronograma de clases y actividades del alumno.
 * Cruza asignaturas curriculares con deportes y talleres extracurriculares inscriptos.
 */
const StudentScheduleView = ({ student, subjects = [] }) => {
  const [selectedDayMobile, setSelectedDayMobile] = useState('Lunes');

  // Consolidar todos los bloques horarios de la semana
  const weeklySchedule = useMemo(() => {
    const items = [];

    // 1. Agregar materias curriculares
    subjects.forEach((sub, idx) => {
      // Si la materia tiene schedules estructurados
      if (Array.isArray(sub.schedules) && sub.schedules.length > 0) {
        sub.schedules.forEach((sch) => {
          items.push({
            id: `sub-${sub.id || idx}-${sch.dayOfWeek}-${sch.startTime}`,
            title: sub.name,
            subtitle: sub.teacherName || sub.profesor || 'Docente a cargo',
            dayOfWeek: sch.dayOfWeek,
            startTime: sch.startTime || '08:00',
            endTime: sch.endTime || '09:30',
            type: 'subject',
            room: 'Aula ' + (student?.curso || '1° A'),
          });
        });
      } else {
        // Fallback inteligente para materias estándar según índice
        const standardDays = [
          ['Lunes', 'Miércoles'],
          ['Martes', 'Jueves'],
          ['Miércoles', 'Viernes'],
          ['Lunes', 'Jueves'],
          ['Martes', 'Viernes'],
        ];
        const assignedDays = standardDays[idx % standardDays.length];
        const startTime = idx % 2 === 0 ? '08:00' : '10:00';
        const endTime = idx % 2 === 0 ? '09:30' : '11:30';

        assignedDays.forEach((day) => {
          items.push({
            id: `sub-${sub.id || idx}-${day}-${startTime}`,
            title: sub.name,
            subtitle: sub.teacherName || sub.profesor || 'Docente a cargo',
            dayOfWeek: day,
            startTime,
            endTime,
            type: 'subject',
            room: 'Aula ' + (student?.curso || '1° A'),
          });
        });
      }
    });

    // 2. Agregar deportes y talleres extracurriculares inscriptos
    const studentSports = Array.isArray(student?.deportes) ? student.deportes : [];
    studentSports.forEach((sportId) => {
      const sportInfo = DEPORTES_CATALOGO[sportId];
      if (sportInfo) {
        sportInfo.dias.forEach((day) => {
          const [start, end] = sportInfo.hora.split(' - ');
          items.push({
            id: `sport-${sportId}-${day}`,
            title: sportInfo.nombre,
            subtitle: sportInfo.lugar,
            dayOfWeek: day,
            startTime: start?.trim() || '16:30',
            endTime: end?.trim() || '18:00',
            type: 'sport',
            room: sportInfo.lugar,
          });
        });
      }
    });

    // Ordenar cronológicamente por hora de inicio
    return items.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
  }, [student, subjects]);

  // Agrupar por día de la semana
  const itemsByDay = useMemo(() => {
    const grouped = {};
    DAYS_OF_WEEK.forEach((day) => {
      grouped[day] = weeklySchedule.filter(
        (i) => i.dayOfWeek?.toLowerCase() === day.toLowerCase()
      );
    });
    return grouped;
  }, [weeklySchedule]);

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector para Mobile */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Cronograma Semanal de Clases
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Horarios lectivos coordinados para el ciclo lectivo en curso · Turno Mañana y Talleres.
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
                  {dayItems.length} {dayItems.length === 1 ? 'actividad' : 'actividades'}
                </span>
              </div>

              {/* Clases asignadas a este día */}
              <div className="p-3 flex-1 flex flex-col gap-2.5 min-h-[320px] bg-white dark:bg-slate-900">
                {dayItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-8 text-center">
                    <span className="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600 mb-1">
                      free_cancellation
                    </span>
                    <span className="text-[11px]">Sin clases asignadas</span>
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
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
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
          <span>Actividades para el {selectedDayMobile}</span>
          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            {(itemsByDay[selectedDayMobile] || []).length} actividades
          </span>
        </h3>

        {(itemsByDay[selectedDayMobile] || []).length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
            No tienes actividades agendadas para este día.
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
                {item.type === 'sport' ? 'Taller' : 'Materia'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentScheduleView;
