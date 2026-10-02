import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AdminSidebar
 * Barra lateral para el Panel de Administrador.
 * Permite cambiar entre las secciones:
 * - dashboard (Usuarios y Solicitudes)
 * - create (Altas de usuarios y personal)
 * - academic (Cursos, Materias y Horarios)
 * - services (Deportes y Transporte)
 * - reports (Centro de Reportes y Finanzas)
 */
const AdminSidebar = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard de Usuarios', icon: 'dashboard', desc: 'Alumnos, tutores y personal' },
    { id: 'create', label: 'Crear Usuarios', icon: 'person_add', desc: 'Altas y registros administrativos' },
    { id: 'academic', label: 'Gestión Académica', icon: 'school', desc: 'Cursos, materias y horarios' },
    { id: 'services', label: 'Servicios Escolares', icon: 'directions_bus', desc: 'Transporte y deportes' },
    { id: 'reports', label: 'Centro de Reportes', icon: 'monitoring', desc: 'Estadísticas, listas y finanzas' },
  ];

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
    if (onClose) onClose();
  };

  const adminName = user?.nombre || user?.email?.split('@')[0] || 'Administrador';

  return (
    <>
      {/* ── BACKDROP MOBILE ── */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* ── SIDEBAR LATERAL ── */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 shadow-sm
          flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col">
          {/* Logo y Encabezado de Administración */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight block">
                  EduCore
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
                  Control Central
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

          {/* Tarjeta de Administrador Activo */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 truncate block">
                  {adminName}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold block truncate">
                  ● Administrador General
                </span>
              </div>
            </div>
          </div>

          {/* Menú de Módulos */}
          <nav className="p-3 space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Módulos del Sistema
            </span>

            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
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

        {/* ── PIE DEL SIDEBAR ── */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          {/* Volver a la Web Institucional */}
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

          <div className="pt-2 text-center text-[10px] text-slate-400">
            EduCore Admin v2.4
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
