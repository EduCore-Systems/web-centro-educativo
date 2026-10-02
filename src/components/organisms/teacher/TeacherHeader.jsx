import React from 'react';

/**
 * TeacherHeader
 * Barra superior fija para el portal del docente.
 * Muestra el botón de menú para mobile/desktop, la fecha actual y badge del docente.
 */
const TeacherHeader = ({ onToggleSidebar, user }) => {
  const teacherName = user?.nombre || 'Docente';
  const teacherRole = user?.role || 'Staff';

  // Fecha actual en español
  const todayStr = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const formattedDate = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs flex items-center justify-between px-4 sm:px-8">
      {/* Botón menú y títulos */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="Alternar menú lateral"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div>
          <h1 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-tight">
            Panel Docente
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Gestión académica y seguimiento de alumnos
          </p>
        </div>
      </div>

      {/* Acciones y datos del docente */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Chip de fecha actual */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          <span className="material-symbols-outlined text-base text-orange-600">today</span>
          <span>{formattedDate}</span>
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer relative"
            title="Notificaciones"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white"></span>
          </button>
        </div>

        {/* Perfil rápido en header */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {teacherName.charAt(0)}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
              {teacherName}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {teacherRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TeacherHeader;
