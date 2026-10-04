import React from 'react';

/**
 * FamilyNavTabs (Molécula)
 * Barra de pestañas para alternar entre las secciones modulares del portal de familias.
 * Elimina la visualización monolítica y permite una navegación limpia e intuitiva.
 */
const FamilyNavTabs = ({ activeSection, onSelectSection, unreadChatCount = 0 }) => {
  const tabs = [
    {
      id: 'resumen',
      label: 'Ficha del Estudiante',
      icon: 'badge',
      desc: 'Datos personales y académicos',
    },
    {
      id: 'materias',
      label: 'Materias y Docentes',
      icon: 'menu_book',
      desc: 'Asignaturas, horarios y equipo pedagógico',
    },
    {
      id: 'servicios',
      label: 'Servicios Escolares',
      icon: 'sports_soccer',
      desc: 'Deportes, comedor y transporte',
    },
    {
      id: 'chat',
      label: 'Consultas con Docentes',
      icon: 'forum',
      desc: 'Canal oficial de tutoría',
      badge: unreadChatCount > 0 ? unreadChatCount : null,
    },
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar transition-colors">
      {tabs.map((tab) => {
        const isActive = activeSection === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectSection(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap
              transition-all duration-200 cursor-pointer shrink-0
              ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm ring-1 ring-orange-400/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
              }
            `}
          >
            <span
              className={`material-symbols-outlined text-lg ${
                isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>

            {tab.badge && (
              <span
                className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${
                    isActive
                      ? 'bg-white text-orange-600'
                      : 'bg-orange-500 text-white animate-pulse'
                  }
                `}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FamilyNavTabs;
