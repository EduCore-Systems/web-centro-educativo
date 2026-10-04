import React, { useState, useEffect, useRef } from 'react';
import { subscribeToTeacherConversations, markConversationAsRead } from '../../../services/chatService';

const formatNotificationTime = (timestamp) => {
  if (!timestamp) return 'Reciente';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return 'Reciente';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * TeacherNotificationsDropdown (Molécula)
 * Menú desplegable interactivo de notificaciones para el docente.
 * Muestra consultas familiares no leídas y avisos institucionales en tiempo real.
 */
const TeacherNotificationsDropdown = ({
  user,
  onNavigateToMessages,
  onNavigateToAttendance,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState([]);
  const dropdownRef = useRef(null);

  // 1. Suscripción en tiempo real a las consultas no leídas del docente
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTeacherConversations(user, (convs) => {
      const unread = convs.filter((c) => (c.unreadByTeacher || 0) > 0);
      setUnreadConversations(unread);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Cerrar al hacer clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        unreadConversations.map((c) => markConversationAsRead(c.id, 'Docente'))
      );
      setUnreadConversations([]);
    } catch (err) {
      console.error('Error al marcar notificaciones como leídas:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de la Campana */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          p-2 rounded-xl transition-all duration-200 cursor-pointer relative
          ${
            isOpen
              ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
          }
        `}
        title="Centro de Notificaciones"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadConversations.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600 ring-2 ring-white dark:ring-slate-900"></span>
          </span>
        )}
      </button>

      {/* Popover / Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Cabecera del Dropdown */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600 text-lg">
                notifications_active
              </span>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Notificaciones
              </h3>
              {unreadConversations.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                  {unreadConversations.length} nueva{unreadConversations.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unreadConversations.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 cursor-pointer"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* 1. Consultas no leídas de familias */}
            {unreadConversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigateToMessages) onNavigateToMessages();
                }}
                className="w-full text-left p-3.5 hover:bg-orange-50/50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-lg">chat</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {conv.parentName || 'Familia'} ({conv.studentName})
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatNotificationTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-1">
                    {conv.lastMessage || 'Nueva consulta sobre ' + conv.subjectName}
                  </p>
                  <span className="inline-block px-1.5 py-0.2 rounded bg-orange-100/80 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[10px] font-semibold">
                    {conv.subjectName}
                  </span>
                </div>
              </button>
            ))}

            {/* 2. Recordatorio Institucional de Asistencia */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNavigateToAttendance) onNavigateToAttendance();
              }}
              className="w-full text-left p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    Toma de Asistencia
                  </p>
                  <span className="text-[10px] text-slate-400">Hoy</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Recuerde registrar el presentismo de sus comisiones lectivas del día.
                </p>
              </div>
            </button>
          </div>

          {/* Pie del Dropdown */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNavigateToMessages) onNavigateToMessages();
              }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 transition-colors cursor-pointer"
            >
              Ver bandeja de mensajes completa →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherNotificationsDropdown;
