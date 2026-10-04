import React from 'react';

/**
 * StudentCard (Molécula)
 * Tarjeta de selección de estudiante en el selector familiar.
 * Muestra avatar con iniciales, estado activo, nombre, nivel y curso.
 * Cumple con los principios de Atomic Design.
 */
const StudentCard = ({ student, isActive, onClick }) => {
  // Generamos las iniciales del nombre para mostrar en el avatar (ej: "Mateo Rossi" → "MR")
  const initials = (student.nombre || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-2xl shadow-xs flex items-center justify-between
        transition-all duration-200 cursor-pointer group
        ${
          isActive
            ? 'bg-orange-50/50 dark:bg-orange-950/40 ring-2 ring-orange-500 shadow-sm'
            : 'bg-white dark:bg-slate-900 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800'
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar con las iniciales del alumno */}
        <div
          className={`
            relative w-12 h-12 rounded-2xl flex items-center justify-center
            text-white font-bold text-base shadow-xs shrink-0
            ${
              isActive
                ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
            }
          `}
        >
          {initials}
          {/* Punto verde de "activo" que aparece solo en la tarjeta seleccionada */}
          {isActive && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>

        {/* Nombre, nivel y curso del alumno */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {student.nombre}
            </span>
            {isActive && (
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider">
                Seleccionado
              </span>
            )}
          </div>
          {/* Nivel formateado + Curso, ej: "Secundaria · 1° Año A" */}
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize mt-0.5">
            {student.nivel} · {student.curso || 'Sin curso asignado'}
          </p>
        </div>
      </div>

      {/* Ícono de check (solo en el activo) o flecha (en los inactivos) */}
      {isActive ? (
        <span className="material-symbols-outlined text-orange-500 text-xl">
          check_circle
        </span>
      ) : (
        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 text-xl transition-colors">
          chevron_right
        </span>
      )}
    </button>
  );
};

export default StudentCard;
