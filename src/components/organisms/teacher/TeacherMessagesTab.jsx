import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  subscribeToTeacherConversations,
  subscribeToMessages,
  sendMessage,
  markConversationAsRead,
} from '../../../services/chatService';

/**
 * TeacherMessagesTab
 * Centro de comunicación y consultas del Portal Docente.
 * Permite a los docentes responder consultas oficiales de tutores/familias
 * manteniendo un registro inmutable con fecha, hora y autoría en Firestore.
 */
const TeacherMessagesTab = ({ user, subjects = [] }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unread'
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Suscripción en tiempo real a las consultas dirigidas al docente
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTeacherConversations(user, (convs) => {
      setConversations(convs);

      // Si no hay conversación activa y hay chats disponibles, seleccionar el primero
      setActiveConversationId((prev) => {
        if (prev && convs.some((c) => c.id === prev)) return prev;
        return convs.length > 0 ? convs[0].id : null;
      });
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Conversación activa
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // 3. Suscripción en tiempo real a los mensajes de la conversación activa
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    // Marcar como leída por el docente
    markConversationAsRead(activeConversationId, 'Docente');

    const unsubscribe = subscribeToMessages(activeConversationId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeConversationId]);

  // 4. Auto-scroll al final del hilo cuando llegan mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Filtrado de conversaciones
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Filtro no leídos
      if (filterMode === 'unread' && (!c.unreadByTeacher || c.unreadByTeacher === 0)) {
        return false;
      }

      // Filtro por materia
      if (selectedSubjectFilter !== 'all' && c.subjectName !== selectedSubjectFilter) {
        return false;
      }

      // Filtro por buscador
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const student = (c.studentName || '').toLowerCase();
        const parent = (c.parentName || '').toLowerCase();
        const subject = (c.subjectName || '').toLowerCase();
        const course = (c.studentCourse || '').toLowerCase();
        return (
          student.includes(query) ||
          parent.includes(query) ||
          subject.includes(query) ||
          course.includes(query)
        );
      }

      return true;
    });
  }, [conversations, filterMode, selectedSubjectFilter, searchTerm]);

  // Total de mensajes no leídos
  const totalUnread = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadByTeacher || 0), 0);
  }, [conversations]);

  // 6. Envío de respuesta del docente
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversationId || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await sendMessage(activeConversationId, {
        senderId: user.uid,
        senderName: user.nombre || 'Docente Titular',
        senderRole: 'Docente',
        text: textToSend,
      });
    } catch (err) {
      console.error('Error al responder consulta:', err);
      alert('Hubo un error al enviar el mensaje. Por favor intente nuevamente.');
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Respuestas rápidas institucionales
  const quickResponses = [
    'Buenas tardes. Con gusto le respondo la inquietud.',
    'Estimada familia, el estudiante viene participando con mucho compromiso.',
    'Confirmado. Le recuerdo que la entrega límite es el próximo viernes.',
    'Cualquier consulta adicional, quedo a su disposición en este canal.',
  ];

  const handleUseQuickResponse = (text) => {
    setInputText((prev) => (prev ? `${prev} ${text}` : text));
  };

  // Formato amigable de hora/fecha
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── CABECERA PRINCIPAL ── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">forum</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Mensajes y Consultas de Familias
              </h2>
              {totalUnread > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold animate-pulse">
                  {totalUnread} sin responder
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Canal oficial de tutoría y diálogo pedagógico con constancia institucional en tiempo real.
            </p>
          </div>
        </div>

        {/* Indicador de trazabilidad */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Registro Oficial Habilitado</span>
        </div>
      </div>

      {/* ── CONTENEDOR SPLIT: BANDEJA Y CHAT ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] max-h-[780px]">
        {/* ── COLUMNA IZQUIERDA: BANDEJA DE ENTRADA (Lg: 5 cols) ── */}
        <div
          className={`lg:col-span-5 border-r border-slate-200/80 flex flex-col bg-slate-50/50 ${
            showMobileChat ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Barra de Búsqueda y Filtros */}
          <div className="p-4 border-b border-slate-200/80 bg-white space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por alumno, tutor o materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Chips de filtro */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unread')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterMode === 'unread'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                <span>Sin responder</span>
                {totalUnread > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      filterMode === 'unread' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                    }`}
                  >
                    {totalUnread}
                  </span>
                )}
              </button>

              {/* Selector de materia si el docente tiene más de 1 */}
              {subjects.length > 1 && (
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="ml-auto text-xs bg-slate-100 border-none text-slate-600 font-semibold rounded-full px-2.5 py-1 focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="all">Todas las materias</option>
                  {subjects.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Lista scrolleable de conversaciones */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
                  mark_chat_read
                </span>
                <p className="text-xs font-semibold text-slate-600">No hay consultas en esta sección</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cuando los tutores envíen consultas sobre sus asignaturas, aparecerán listadas aquí.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const hasUnread = (conv.unreadByTeacher || 0) > 0;
                const initials = (conv.studentName || 'AL')
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join('');

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setShowMobileChat(true);
                    }}
                    className={`w-full text-left p-4 transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-orange-50/60 border-l-4 border-l-orange-500'
                        : hasUnread
                        ? 'bg-white hover:bg-slate-50 font-medium'
                        : 'bg-white/60 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {/* Avatar del alumno */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${
                          isActive
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {initials}
                      </div>
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-600 rounded-full ring-2 ring-white"></span>
                      )}
                    </div>

                    {/* Datos de la consulta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs truncate ${
                            hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                          }`}
                        >
                          {conv.studentName || 'Estudiante'}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDate(conv.lastMessageAt)}
                        </span>
                      </div>

                      {/* Asignatura y Curso */}
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          {conv.subjectName}
                        </span>
                        {conv.studentCourse && (
                          <span className="text-[10px] text-slate-400 truncate">
                            · {conv.studentCourse}
                          </span>
                        )}
                      </div>

                      {/* Tutor y último mensaje */}
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">
                          person
                        </span>
                        <span className="font-medium text-slate-700">{conv.parentName || 'Tutor'}:</span>
                        <span>{conv.lastMessage || 'Consulta iniciada'}</span>
                      </p>
                    </div>

                    {/* Badge contador no leídos */}
                    {hasUnread && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                        {conv.unreadByTeacher}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── COLUMNA DERECHA: HILO DEL CHAT ACTIVO (Lg: 7 cols) ── */}
        <div
          className={`lg:col-span-7 flex flex-col bg-white ${
            !showMobileChat ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Header de la conversación activa */}
              <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Botón Volver (solo visible en Mobile) */}
                  <button
                    type="button"
                    onClick={() => setShowMobileChat(false)}
                    className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-600"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                  </button>

                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {(activeConversation.studentName || 'AL')
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase())
                      .join('')}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {activeConversation.studentName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                        {activeConversation.subjectName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs text-slate-400">group</span>
                      <span>Tutor: {activeConversation.parentName || 'Familia'}</span>
                      {activeConversation.parentEmail && (
                        <span className="text-slate-400">({activeConversation.parentEmail})</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Sello institucional */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-sm text-slate-500">verified</span>
                  <span>Canal Institucional</span>
                </div>
              </div>

              {/* Mensajes del Hilo */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
                {/* Banner institucional de trazabilidad */}
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-base shrink-0 mt-0.5">
                    lock
                  </span>
                  <div>
                    <span className="font-bold">Comunicación Pedagógica Institucional:</span> Las respuestas
                    emitidas por el equipo docente quedan registradas de manera oficial con fecha y hora para
                    garantizar transparencia y seguimiento del alumno.
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
                      chat_bubble_outline
                    </span>
                    <p className="text-xs font-semibold text-slate-600">No hay mensajes previos</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Escriba un mensaje debajo para responder a la familia.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isDocente =
                      msg.senderRole === 'Docente' ||
                      msg.senderRole === 'Staff' ||
                      msg.senderRole === 'Admin' ||
                      msg.senderId === user.uid;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isDocente ? 'items-end' : 'items-start'}`}
                      >
                        {/* Cabecera del mensaje: Autor y hora */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-600">
                            {isDocente ? `Usted (${user.nombre || 'Docente'})` : msg.senderName || 'Tutor'}
                          </span>
                          <span>·</span>
                          <span>{formatTime(msg.createdAt)}</span>
                        </div>

                        {/* Burbuja */}
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words ${
                            isDocente
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-xs font-medium'
                              : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Respuestas rápidas institucionales */}
              <div className="px-4 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                  Sugerencias:
                </span>
                {quickResponses.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUseQuickResponse(qr)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer border border-transparent hover:border-orange-200"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Formulario de Respuesta */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200/80">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Escriba su respuesta a la familia (Enter para enviar, Shift+Enter para salto de línea)..."
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="h-11 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">send</span>
                        <span className="hidden sm:inline">Responder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <span className="material-symbols-outlined text-3xl">chat</span>
              </div>
              <h3 className="text-sm font-bold text-slate-700">Seleccione una consulta</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Elija una conversación de la bandeja de entrada para ver el historial y responder directamente al tutor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherMessagesTab;
