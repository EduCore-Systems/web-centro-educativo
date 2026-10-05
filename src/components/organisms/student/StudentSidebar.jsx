import React from 'react';
import { images } from '../../../services/imagesConfig';
import ThemeToggle from '../../atoms/ThemeToggle';

/**
 * StudentSidebar (Organismo)
 * Barra lateral de navegación principal del Portal del Alumno.
 * Admite modo colapsable en desktop y cajón deslizable en mobile.
 * Implementa soporte total de modo oscuro y Atomic Design.
 */
const StudentSidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  activeSection,
  onSelectSection,
  student,
  onOpenDocument,
  onLogout,
}) => {
  const navItems = [
    {
      id: 'resumen',
      label: 'Mi Ficha Académica',
      icon: 'badge',
      badge: 'Principal',
    },
    {
      id: 'materias',
      label: 'Mis Asignaturas',
      icon: 'auto_stories',
    },
    {
      id: 'horario',
      label: 'Horario Semanal',
      icon: 'calendar_today',
    },
    {
      id: 'servicios',
      label: 'Servicios y Talleres',
      icon: 'sports_soccer',
    },
  ];

  const studentName = student?.nombre || student?.name || 'Estudiante';
  const studentInitials = studentName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <>
      {/* ── BACKDROP PARA PANTALLAS MÓVILES ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── BARRA LATERAL (DESKTOP FIJA + MOBILE SLIDE-OVER) ── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40 bg-white dark:bg-slate-900
          border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between
          transition-all duration-300 ease-in-out shadow-xs
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* PARTE SUPERIOR: MARCA Y PERFIL DEL ALUMNO */}
        <div>
          {/* Cabecera del Sidebar con Logo */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={images.logo}
                alt="Logo Educar"
                className="w-8 h-8 object-contain shrink-0"
              />
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-extrabold text-sm text-slate-800 dark:text-white block leading-tight">
                    EduCore
                  </span>
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider block">
                    Portal del Alumno
                  </span>
                </div>
              )}
            </div>

            {/* Botón para cerrar en Mobile */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Cerrar menú"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Tarjeta Resumen del Alumno */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className={`p-2.5 rounded-2xl bg-orange-50/50 dark:bg-slate-800/60 border border-orange-100/60 dark:border-slate-700/60 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {studentInitials || 'AL'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {studentName}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {student?.curso || 'Curso Asignado'} · {student?.nivel || 'Secundaria'}
                  </p>
                  <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[9px] font-bold">
                    Legajo: {student?.legajo || student?.studentID_login || 'EST-2026'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Menú de Navegación por Secciones */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectSection(item.id);
                    if (onClose) onClose();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs
                    transition-all duration-150 cursor-pointer text-left
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sección de Documentación Rápida */}
          {!isCollapsed && (
            <div className="px-3 pt-2">
              <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Mis Constancias
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onOpenDocument('boletin')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  <span className="material-symbols-outlined text-base text-slate-400 dark:text-slate-500">
                    description
                  </span>
                  <span className="truncate">Boletín Oficial</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDocument('certificado')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  <span className="material-symbols-outlined text-base text-slate-400 dark:text-slate-500">
                    verified
                  </span>
                  <span className="truncate">Certificado Regular</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PARTE INFERIOR: TEMA, COLAPSAR Y CERRAR SESIÓN */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Toggle de Modo Claro/Oscuro */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3 py-1.5'}`}>
            {!isCollapsed && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tema
              </span>
            )}
            <ThemeToggle />
          </div>

          {/* Botón de Colapsar (Solo Desktop) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            <span className="material-symbols-outlined text-lg">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
            {!isCollapsed && <span>Colapsar menú</span>}
          </button>

          {/* Botón Cerrar Sesión */}
          <button
            type="button"
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold
              text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer
              ${isCollapsed ? 'justify-center px-0' : ''}
            `}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
          >
            <span className="material-symbols-outlined text-lg text-red-500">
              logout
            </span>
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
