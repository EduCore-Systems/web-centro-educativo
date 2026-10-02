import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * FamilySidebar
 * Barra lateral exclusiva para el Portal de Familias.
 * Soporta modo fijo en Desktop (lg:w-64) y Drawer deslizante en Mobile.
 */
const FamilySidebar = ({
  isOpen,
  onClose,
  activeSection,
  onSelectSection,
  user,
  childrenCount,
  onOpenDocument,
  onLogout,
}) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'resumen', label: 'Resumen Familiar', icon: 'dashboard', desc: 'Ficha y datos del alumno' },
    { id: 'materias', label: 'Materias y Horarios', icon: 'menu_book', desc: 'Docentes y asignaturas' },
    { id: 'servicios', label: 'Servicios Escolares', icon: 'sports_soccer', desc: 'Deportes, comedor y transporte' },
    { id: 'documentacion', label: 'Documentación Oficial', icon: 'description', desc: 'Boletín y certificados' },
  ];

  const handleNavClick = (itemId) => {
    if (itemId === 'documentacion' && onOpenDocument) {
      onOpenDocument('certificado');
    } else if (onSelectSection) {
      onSelectSection(itemId);
    }
    if (onClose) onClose();
  };

  const displayName = user?.nombre || user?.name || user?.email?.split('@')[0] || 'Familia';

  return (
    <>
      {/* ── BACKDROP PARA MOBILE (solo cuando el drawer está abierto) ── */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* ── BARRA LATERAL (SIDEBAR) ── */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 shadow-sm
          flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Cabecera del Sidebar */}
        <div className="flex flex-col">
          {/* Logo y Nombre Institucional */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight block">
                  EduCore
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
                  Portal de Familias
                </span>
              </div>
            </div>

            {/* Botón cerrar solo visible en mobile */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Tarjeta de Familia Activa */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 truncate block">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {childrenCount} {childrenCount === 1 ? 'estudiante a cargo' : 'estudiantes a cargo'}
                </span>
              </div>
            </div>
          </div>

          {/* Menú de Navegación Contextual Familiar */}
          <nav className="p-3 space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Gestión Familiar
            </span>

            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer
                    ${isActive
                      ? 'bg-orange-50 text-orange-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }
                  `}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isActive ? 'text-orange-600' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs block truncate leading-tight">
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── PIE DEL SIDEBAR (ACCIONES DE CUENTA) ── */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          {/* Volver a la Web Institucional Pública */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg text-slate-400">home</span>
            <span>Sitio Institucional</span>
          </button>

          {/* Cerrar Sesión */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg text-red-500">logout</span>
            <span>Cerrar Sesión</span>
          </button>

          {/* Versión del sistema */}
          <div className="pt-2 text-center text-[10px] text-slate-400">
            EduCore v2.4 · Ciclo 2026
          </div>
        </div>
      </aside>
    </>
  );
};

export default FamilySidebar;
