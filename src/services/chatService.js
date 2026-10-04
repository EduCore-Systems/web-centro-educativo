import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * SERVICIO DE CHAT Y REGISTRO DE CONSULTAS INSTITUCIONALES (chatService)
 * Gestiona hilos de conversación y mensajes entre Familias y Docentes.
 * Todo intercambio queda grabado con fecha, hora, autor y trazabilidad oficial.
 */

/**
 * Busca una conversación existente o crea una nueva entre el tutor y el docente.
 */
export const getOrCreateConversation = async ({
  student,
  parentUser,
  teacher,
  subjectName,
}) => {
  if (!parentUser?.uid || !teacher) {
    throw new Error('Datos incompletos para iniciar o buscar la conversación.');
  }

  const studentId = student?.id || student?.studentID_login || student?.dni || 'general';
  const teacherId = teacher.id || teacher.uid || teacher.teacherId || 'docente';
  const cleanSubject = subjectName || 'Consulta General';

  // 1. Buscar si ya existe una conversación abierta para este tutor, alumno y docente/materia
  const q = query(
    collection(db, 'conversations'),
    where('parentId', '==', parentUser.uid),
    where('studentId', '==', studentId)
  );

  const snap = await getDocs(q);
  let existingConv = null;

  snap.forEach((d) => {
    const data = d.data();
    if (
      (data.teacherId === teacherId || data.teacherEmail === teacher.email) &&
      data.subjectName === cleanSubject
    ) {
      existingConv = { id: d.id, ...data };
    }
  });

  if (existingConv) {
    return existingConv;
  }

  // 2. Si no existe, crear la nueva conversación con metadata completa
  const newConvData = {
    studentId,
    studentName: student?.nombre || 'Alumno',
    studentCourse: student?.curso || 'Curso General',
    studentDni: student?.dni || '',
    studentLegajo: student?.studentID_login || studentId,
    parentId: parentUser.uid,
    parentName: parentUser.nombre || parentUser.email?.split('@')[0] || 'Tutor',
    parentEmail: parentUser.email || '',
    parentPhone: parentUser.telefono || student?.telefono || '',
    teacherId,
    teacherName: teacher.name || teacher.nombre || 'Docente Titular',
    teacherEmail: teacher.email || '',
    subjectName: cleanSubject,
    lastMessage: 'Consulta iniciada',
    lastMessageAt: serverTimestamp(),
    lastSenderRole: 'Sistema',
    unreadByTeacher: 0,
    unreadByParent: 0,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'conversations'), newConvData);
  return { id: docRef.id, ...newConvData };
};

/**
 * Escucha en tiempo real todas las conversaciones de un tutor / familia.
 */
export const subscribeToFamilyConversations = (parentUid, callback) => {
  if (!parentUid) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'conversations'),
    where('parentId', '==', parentUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const convs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Ordenar en memoria por fecha del último mensaje (más reciente primero)
      convs.sort((a, b) => {
        const timeA = a.lastMessageAt?.toMillis ? a.lastMessageAt.toMillis() : (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0);
        const timeB = b.lastMessageAt?.toMillis ? b.lastMessageAt.toMillis() : (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0);
        return timeB - timeA;
      });

      callback(convs);
    },
    (err) => {
      console.error('Error al escuchar conversaciones de familia:', err);
      callback([]);
    }
  );
};

/**
 * Escucha en tiempo real todas las consultas recibidas por un docente.
 */
export const subscribeToTeacherConversations = (teacher, callback) => {
  if (!teacher) {
    callback([]);
    return () => {};
  }

  const teacherId = teacher.teacherId || null;
  const userUid = teacher.uid || null;
  const userEmail = (teacher.email || '').toLowerCase();
  const teacherName = (teacher.nombre || '').toLowerCase();

  const colRef = collection(db, 'conversations');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const allConvs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Filtrar las que corresponden a este docente
      const myConvs = allConvs.filter((c) => {
        if (teacherId && c.teacherId === teacherId) return true;
        if (userUid && c.teacherId === userUid) return true;
        if (userEmail && c.teacherEmail && c.teacherEmail.toLowerCase() === userEmail) return true;
        if (teacherName && c.teacherName && c.teacherName.toLowerCase().includes(teacherName.split(' ')[1] || '---')) return true;
        return false;
      });

      // Ordenar por fecha más reciente
      myConvs.sort((a, b) => {
        const timeA = a.lastMessageAt?.toMillis ? a.lastMessageAt.toMillis() : (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0);
        const timeB = b.lastMessageAt?.toMillis ? b.lastMessageAt.toMillis() : (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0);
        return timeB - timeA;
      });

      callback(myConvs);
    },
    (err) => {
      console.error('Error al escuchar conversaciones del docente:', err);
      callback([]);
    }
  );
};

/**
 * Escucha en tiempo real el hilo de mensajes individuales de una conversación.
 */
export const subscribeToMessages = (conversationId, callback) => {
  if (!conversationId) {
    callback([]);
    return () => {};
  }

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');

  return onSnapshot(
    messagesRef,
    (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Ordenar cronológicamente (más antiguo primero)
      msgs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeA - timeB;
      });

      callback(msgs);
    },
    (err) => {
      console.error('Error al escuchar mensajes del chat:', err);
      callback([]);
    }
  );
};

/**
 * Envía un mensaje en la conversación y actualiza la cabecera del hilo.
 */
export const sendMessage = async (
  conversationId,
  { senderId, senderName, senderRole, text }
) => {
  if (!conversationId || !text || !text.trim()) {
    throw new Error('Mensaje vacío o conversación inválida.');
  }

  const cleanText = text.trim();
  const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
  const convDocRef = doc(db, 'conversations', conversationId);

  // 1. Guardar mensaje individual
  const messageData = {
    senderId,
    senderName: senderName || 'Usuario',
    senderRole: senderRole || 'Padre',
    text: cleanText,
    createdAt: serverTimestamp(),
    read: false,
  };

  await addDoc(messagesColRef, messageData);

  // 2. Actualizar cabecera de la conversación
  const convUpdates = {
    lastMessage: cleanText,
    lastMessageAt: serverTimestamp(),
    lastSenderRole: senderRole || 'Padre',
    ...(senderRole === 'Padre'
      ? { unreadByTeacher: increment(1) }
      : { unreadByParent: increment(1) }),
  };

  await updateDoc(convDocRef, convUpdates);
};

/**
 * Marca la conversación como leída para el rol actual (resetea el contador de no leídos).
 */
export const markConversationAsRead = async (conversationId, readerRole) => {
  if (!conversationId || !readerRole) return;

  try {
    const convDocRef = doc(db, 'conversations', conversationId);
    if (readerRole === 'Staff' || readerRole === 'Docente') {
      await updateDoc(convDocRef, { unreadByTeacher: 0 });
    } else {
      await updateDoc(convDocRef, { unreadByParent: 0 });
    }
  } catch (err) {
    console.error('Error al marcar conversación como leída:', err);
  }
};
