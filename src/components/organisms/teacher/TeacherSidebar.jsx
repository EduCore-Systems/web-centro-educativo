import React from 'react';

/**
 * TeacherSidebar
 * Barra lateral de navegación para el Portal del Docente.
 * Diseño fiel al mockup de Stitch con Tailwind y Material Symbols.
 * Soporta responsive drawer en Mobile y colapsado en Desktop.
 */
const TeacherSidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  user,
  onLogout,
}) => {
  const teacherName = user?.nombre || 'Docente Titular';
  const teacherInitials = (teacherName.replace(/^Prof\.\s*/i, ''))
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || 'DC';

  const teacherRole = user?.especialidad || 'Docente Titular · Metodología';

  const menuItems = [
    { id: 'courses', label: 'Mis Cursos y Materias', icon: 'auto_stories' },
    { id: 'attendance', label: 'Tomar Asistencia', icon: 'how_to_reg' },
    { id: 'schedule', label: 'Mi Cronograma Semanal', icon: 'calendar_today' },
    { id: 'sports', label: 'Deportes y Talleres', icon: 'sports_soccer' },
  ];

  const handleItemClick = (tabId) => {
    onSelectTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop para mobile cuando el drawer está abierto */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Aside barra lateral */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)]
          flex flex-col justify-between pt-6 pb-6 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col gap-6">
          {/* Logo y Encabezado */}
          <div className="px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg block leading-tight tracking-tight">
                  EduCore
                </span>
                <span className="text-[11px] text-orange-600 font-bold tracking-wider uppercase block">
                  Portal Staff
                </span>
              </div>
            </div>

            {/* Botón para colapsar en Desktop */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ocultar menú lateral"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            {/* Botón cerrar para mobile */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Tarjeta de perfil del docente autenticado */}
          <div className="mx-4 p-3 rounded-2xl bg-orange-50/60 border border-orange-100/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-200 text-orange-900 font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {teacherInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">
                {teacherName}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {teacherRole}
              </span>
            </div>
          </div>

          {/* Subtítulo de navegación */}
          <div className="px-6">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Menú Principal
            </span>
          </div>

          {/* Menú de enlaces */}
          <nav className="flex flex-col gap-1.5 px-4">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-left
                    ${
                      isActive
                        ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sección inferior con Ciclo Lectivo y Botón Salir */}
        <div className="flex flex-col gap-3 px-4 pt-4 border-t border-slate-100">
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-orange-600">calendar_month</span>
              <span className="text-xs font-semibold">Ciclo Lectivo 2026</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;
