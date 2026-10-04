import React from 'react';

/**
 * TeacherNavTabs (Molécula)
 * Barra de pestañas para alternar entre las secciones modulares del Portal Docente.
 * Brinda acceso directo a cursos, asistencia, consultas, cronograma y deportes.
 */
const TeacherNavTabs = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'courses',
      label: 'Mis Cursos y Materias',
      icon: 'auto_stories',
    },
    {
      id: 'attendance',
      label: 'Tomar Asistencia',
      icon: 'how_to_reg',
    },
    {
      id: 'messages',
      label: 'Mensajes con Familias',
      icon: 'forum',
    },
    {
      id: 'schedule',
      label: 'Cronograma Semanal',
      icon: 'calendar_today',
    },
    {
      id: 'sports',
      label: 'Deportes y Talleres',
      icon: 'sports_soccer',
    },
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar mb-6 transition-colors">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
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
          </button>
        );
      })}
    </div>
  );
};

export default TeacherNavTabs;
