import React from 'react';

/**
 * StudentNavTabs (Molécula)
 * Barra de pestañas para alternar entre las secciones modulares del portal del alumno.
 * Diseñada bajo Atomic Design con soporte pleno de modo oscuro y responsive.
 */
const StudentNavTabs = ({ activeSection, onSelectSection }) => {
  const tabs = [
    {
      id: 'resumen',
      label: 'Mi Ficha Académica',
      icon: 'badge',
      desc: 'Datos, promedios y asistencias',
    },
    {
      id: 'materias',
      label: 'Mis Asignaturas',
      icon: 'auto_stories',
      desc: 'Docentes y contenidos en curso',
    },
    {
      id: 'horario',
      label: 'Horario Semanal',
      icon: 'calendar_today',
      desc: 'Grilla de clases y talleres',
    },
    {
      id: 'servicios',
      label: 'Servicios y Talleres',
      icon: 'sports_soccer',
      desc: 'Deportes, comedor y transporte',
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
          </button>
        );
      })}
    </div>
  );
};

export default StudentNavTabs;
