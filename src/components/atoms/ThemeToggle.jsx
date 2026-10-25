import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle (Átomo)
 * Botón para alternar entre el modo claro y oscuro del sistema.
 * Cumple con los lineamientos de Atomic Design.
 */
const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        p-2 rounded-xl flex items-center gap-2 transition-all duration-200 cursor-pointer
        ${
          isDark
            ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }
        ${className}
      `}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Alternar modo de color"
    >
      <span className="material-symbols-outlined text-xl transition-transform duration-300 select-none">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
