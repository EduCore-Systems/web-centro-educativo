import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  subscribeToFamilyConversations,
  subscribeToMessages,
  sendMessage,
  markConversationAsRead,
  getOrCreateConversation,
} from '../../../services/chatService';

/**
 * FamilyChatTab
 * Panel de mensajería y consultas del Portal de Familias.
 * Permite a los tutores comunicarse en tiempo real con los docentes a cargo de sus hijos,
 * garantizando constancia y trazabilidad oficial en Firestore.
 */
const FamilyChatTab = ({
  student,
  user,
  preselectedSubject = null,
  availableSubjects = [],
  onBackToDashboard,
}) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSubjectId, setNewChatSubjectId] = useState('');
  const [newChatInitialMessage, setNewChatInitialMessage] = useState('');

  const messagesEndRef = useRef(null);

  // 1. Suscribirse a las conversaciones de la familia en tiempo real
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToFamilyConversations(user.uid, (convs) => {
      setConversations(convs);

      // Si no hay chat activo y hay conversaciones, seleccionar la primera
      setActiveConversationId((prev) => {
        if (prev && convs.some((c) => c.id === prev)) return prev;
        return convs.length > 0 ? convs[0].id : null;
      });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Si se pasó una materia preseleccionada (ej. al hacer clic en "Consulta" en una tarjeta de materia)
  useEffect(() => {
    if (!preselectedSubject || !user?.uid || !student) return;

    const initPreselected = async () => {
      try {
        const teacherData = {
          id: preselectedSubject.teacherId || preselectedSubject.profesorId || 'docente',
          name: preselectedSubject.teacherName || preselectedSubject.profesor || 'Docente Titular',
          email: preselectedSubject.teacherEmail || '',
        };

        const conv = await getOrCreateConversation({
          student,
          parentUser: user,
          teacher: teacherData,
          subjectName: preselectedSubject.name,
        });

        if (conv?.id) {
          setActiveConversationId(conv.id);
        }
      } catch (err) {
        console.error('Error al abrir conversación de materia preseleccionada:', err);
      }
    };

    initPreselected();
  }, [preselectedSubject, user, student]);

  // Conversación seleccionada actualmente
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // 3. Suscribirse a los mensajes del chat activo en tiempo real
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    // Marcar como leídos para el padre
    markConversationAsRead(activeConversationId, 'Padre');

    const unsubscribe = subscribeToMessages(activeConversationId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeConversationId]);

  // Auto-scroll al fondo al recibir mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConversationId || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await sendMessage(activeConversationId, {
        senderId: user.uid,
        senderName: user.nombre || user.email?.split('@')[0] || 'Tutor',
        senderRole: 'Padre',
        text: textToSend,
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      alert('No se pudo enviar el mensaje. Intenta nuevamente.');
    } finally {
      setIsSending(false);
    }
  };

  // Iniciar nueva consulta desde el modal
  const handleStartNewConsultation = async (e) => {
    e.preventDefault();
    if (!newChatSubjectId || !student || !user) return;

    const subjectObj = availableSubjects.find((s) => s.id === newChatSubjectId);
    if (!subjectObj) return;

    try {
      const teacherData = {
        id: subjectObj.teacherId || subjectObj.profesorId || 'docente',
        name: subjectObj.teacherName || subjectObj.profesor || 'Docente Titular',
        email: subjectObj.teacherEmail || '',
      };

      const conv = await getOrCreateConversation({
        student,
        parentUser: user,
        teacher: teacherData,
        subjectName: subjectObj.name,
      });

      if (newChatInitialMessage.trim()) {
        await sendMessage(conv.id, {
          senderId: user.uid,
          senderName: user.nombre || 'Tutor',
          senderRole: 'Padre',
          text: newChatInitialMessage.trim(),
        });
      }

      setActiveConversationId(conv.id);
      setShowNewChatModal(false);
      setNewChatSubjectId('');
      setNewChatInitialMessage('');
    } catch (err) {
      console.error('Error al iniciar nueva consulta:', err);
      alert('Error al iniciar consulta: ' + err.message);
    }
  };

  // Filtrar conversaciones según el buscador
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        !term ||
        c.subjectName?.toLowerCase().includes(term) ||
        c.teacherName?.toLowerCase().includes(term) ||
        c.studentName?.toLowerCase().includes(term)
      );
    });
  }, [conversations, searchTerm]);

  // Formato de hora legible
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── ENCABEZADO DE SECCIÓN ── */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer mr-1"
                title="Volver al resumen"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
            )}
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Mensajes y Consultas Oficiales
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Canal institucional para comunicarse con los docentes de{' '}
            <strong className="text-slate-800 dark:text-slate-200">{student?.nombre || 'tus hijos'}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewChatModal(true)}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">add_comment</span>
          <span>Nueva Consulta</span>
        </button>
      </div>

      {/* ── CUERPO PRINCIPAL DEL CHAT (Doble columna estilo WhatsApp/Slack) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px] max-h-[700px]">
        {/* COLUMNA IZQUIERDA: Lista de Conversaciones (lg:col-span-4) */}
        <div className="lg:col-span-4 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40">
          {/* Buscador de Chats */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por materia o docente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-orange-500 text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Lista de hilos */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">
                  chat_bubble_outline
                </span>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Sin conversaciones abiertas
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Presiona "Nueva Consulta" para escribirle a un docente.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const unread = conv.unreadByParent || 0;

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-orange-50/80 dark:bg-orange-950/30 border-r-4 border-orange-500'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Avatar del Docente */}
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {conv.teacherName?.replace(/^Prof\.\s*/i, '').charAt(0) || 'D'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                          {conv.subjectName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {conv.teacherName}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-[11px] text-slate-400 truncate flex-1">
                          {conv.lastSenderRole === 'Padre' && <strong className="text-slate-600 dark:text-slate-300">Tú: </strong>}
                          {conv.lastMessage || 'Conversación iniciada'}
                        </p>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white font-black text-[9px] shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Ventana del Chat Activo (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white dark:bg-slate-900 h-full">
          {activeConversation ? (
            <>
              {/* Cabecera del Chat Activo */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {activeConversation.teacherName?.replace(/^Prof\.\s*/i, '').charAt(0) || 'D'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight truncate leading-tight">
                      {activeConversation.subjectName} · {activeConversation.teacherName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                      <span>Alumno: <strong className="text-slate-700 dark:text-slate-200">{activeConversation.studentName}</strong></span>
                      <span>·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Docente Titular
                      </span>
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                  Canal Oficial
                </span>
              </div>

              {/* Contenedor de Mensajes con Scroll */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/50">
                {/* Cartel de Trazabilidad Oficial */}
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                    <span className="material-symbols-outlined text-xs text-orange-600 dark:text-orange-400">lock</span>
                    Registro oficial institucional · Toda consulta queda asentada en el legajo escolar.
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Inicia la conversación escribiendo tu consulta a continuación.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderRole === 'Padre';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span
                              className={`font-bold text-[10px] uppercase tracking-wider ${
                                isMe ? 'text-orange-100' : 'text-orange-700 dark:text-orange-400'
                              }`}
                            >
                              {isMe ? 'Tú (Tutor)' : msg.senderName}
                            </span>
                            <span
                              className={`text-[9px] ${
                                isMe ? 'text-white/80' : 'text-slate-400 dark:text-slate-400'
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Caja de Entrada de Texto para Enviar Mensaje */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Escribe tu consulta o mensaje para el docente..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="h-11 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-3xl">forum</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                Bandeja de Consultas Familiares
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Selecciona una materia o profesor de la columna izquierda para ver los mensajes o inicia una nueva consulta.
              </p>
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Iniciar Consulta con Docente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: INICIAR NUEVA CONSULTA ── */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-orange-100 tracking-wider">
                  Nueva Consulta Escolar
                </span>
                <h3 className="text-lg font-black">{student?.nombre || 'Alumno'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleStartNewConsultation} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Seleccionar Materia y Docente Titular
                </label>
                <select
                  value={newChatSubjectId}
                  onChange={(e) => setNewChatSubjectId(e.target.value)}
                  required
                  className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">-- Elige la asignatura --</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} · {sub.teacherName || sub.profesor || 'Docente'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Mensaje inicial de consulta
                </label>
                <textarea
                  rows="3"
                  placeholder="Estimado docente, quería consultar respecto a..."
                  value={newChatInitialMessage}
                  onChange={(e) => setNewChatInitialMessage(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newChatSubjectId}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Iniciar Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyChatTab;
