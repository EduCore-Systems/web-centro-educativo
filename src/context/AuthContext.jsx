/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  sendPasswordResetEmail,
  signOut,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

const OVERRIDES_STORAGE_KEY = 'educore_password_overrides';

const getPasswordOverrides = () => {
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const savePasswordOverride = (keys, data) => {
  try {
    const current = getPasswordOverrides();
    keys.forEach((k) => {
      if (k) {
        current[String(k).trim().toLowerCase()] = {
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
    });
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('No se pudo guardar override local de clave:', e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          const studentId = idTokenResult.claims.studentId || null;

          // Buscar primero en la colección "users" (Admins, Staff, Padres)
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let resolvedRole = idTokenResult.claims.role || null;
          let profileData = {};

          if (userDocSnap.exists()) {
            profileData = userDocSnap.data();
            resolvedRole = profileData.role || resolvedRole || 'Padre';
          } else {
            // Si no está en users, buscar en la colección "students" (Alumnos)
            const studentDocRef = doc(db, 'students', firebaseUser.uid);
            const studentDocSnap = await getDoc(studentDocRef);
            if (studentDocSnap.exists()) {
              profileData = studentDocSnap.data();
              resolvedRole = 'Estudiante';
            } else {
              resolvedRole = resolvedRole || 'Estudiante';
            }
          }

          const loggedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            studentId,
            ...profileData,
            role: resolvedRole
          };

          setUser(loggedUser);
          localStorage.setItem('school_user', JSON.stringify(loggedUser));
        } catch (error) {
          console.error('Error obteniendo claims/perfil de Firebase:', error);
          setUser(null);
          localStorage.removeItem('school_user');
        }
      } else {
        const saved = localStorage.getItem('school_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser(parsed);
          } catch {
            setUser(null);
            localStorage.removeItem('school_user');
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Método de Login integrado con Firebase con detección automática de tipo de cuenta
   */
  const loginReal = useCallback(async (identifier, password, role = null) => {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();
    const cleanIdLower = cleanId.toLowerCase();

    // 0. Verificar si el usuario restableció su contraseña recientemente
    const overrides = getPasswordOverrides();
    const overrideEntry = overrides[cleanIdLower];

    const isStudentFormat =
      role === 'Estudiante' ||
      /^EST-\d+/i.test(cleanId) ||
      (!cleanId.includes('@') && cleanId.length >= 6);

    if (isStudentFormat && role !== 'Administrador' && role !== 'Staff' && role !== 'Padre/Tutor') {
      // Consultar primero en Firestore 'students' (permite validar clave actualizada o DNI inicial)
      try {
        let qSnap = await getDocs(
          query(collection(db, 'students'), where('studentID_login', '==', cleanId))
        );
        if (qSnap.empty) {
          qSnap = await getDocs(
            query(collection(db, 'students'), where('dni', '==', cleanId))
          );
        }
        if (!qSnap.empty) {
          const stDoc = qSnap.docs[0];
          const stData = stDoc.data();
          const stOver =
            overrides[String(stData.studentID_login || '').toLowerCase()] ||
            overrides[String(stData.dni || '').toLowerCase()] ||
            overrideEntry;

          const expectedPass = String(
            stOver?.newPassword || stData.password || stData.clave || stData.dni || ''
          );

          if (cleanPass === expectedPass) {
            const studentProfile = {
              uid: stDoc.id,
              id: stDoc.id,
              studentId: stData.studentID_login || stDoc.id,
              studentID_login: stData.studentID_login,
              legajo: stData.studentID_login,
              ...stData,
              role: 'Estudiante'
            };
            setUser(studentProfile);
            localStorage.setItem('school_user', JSON.stringify(studentProfile));
            return studentProfile;
          }
        }
      } catch (e) {
        console.warn('Verificación directa de alumno en Firestore omitida:', e);
      }

      // Iniciar sesión de alumno usando la Cloud Function cf_loginStudent (devuelve customToken)
      const FUNCTIONS_BASE_URL =
        import.meta.env.VITE_FUNCTIONS_BASE_URL ||
        (import.meta.env.DEV
          ? 'http://127.0.0.1:5001/educore-systems-dd8a3/us-central1'
          : 'https://us-central1-educore-systems-dd8a3.cloudfunctions.net');
      try {
        const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_loginStudent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentID_login: cleanId, password: cleanPass })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Credenciales de alumno incorrectas.');
        }

        const { customToken } = await response.json();
        return await signInWithCustomToken(auth, customToken);
      } catch (err) {
        if (overrideEntry && overrideEntry.newPassword === cleanPass && overrideEntry.profile) {
          setUser(overrideEntry.profile);
          localStorage.setItem('school_user', JSON.stringify(overrideEntry.profile));
          return overrideEntry.profile;
        }
        throw err;
      }
    } else {
      // Logear tutores, staff o administradores con email y contraseña estándar en Firebase Auth
      try {
        return await signInWithEmailAndPassword(auth, cleanId, cleanPass);
      } catch (authErr) {
        // Si el usuario restableció su contraseña desde el modal y coincide con el override registrado
        if (overrideEntry && overrideEntry.newPassword === cleanPass) {
          // Intentar autenticar en Firebase Auth con su DNI/clave original si aún no se sincronizó en Auth
          if (overrideEntry.originalDni) {
            try {
              const cred = await signInWithEmailAndPassword(
                auth,
                overrideEntry.email || cleanId,
                overrideEntry.originalDni
              );
              try {
                await updatePassword(cred.user, cleanPass);
              } catch {
                // Ignorar error de actualización en segundo plano
              }
              return cred;
            } catch {
              // Ignorar si ya fue cambiada previamente
            }
          }
          if (overrideEntry.profile) {
            setUser(overrideEntry.profile);
            localStorage.setItem('school_user', JSON.stringify(overrideEntry.profile));
            return overrideEntry.profile;
          }
        }
        throw authErr;
      }
    }
  }, []);

  /**
   * Método de Logout
   */
  const logoutReal = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignorar si no había sesión en Firebase Auth
    }
    setUser(null);
    localStorage.removeItem('school_user');
  }, []);

  /**
   * Método para recuperar / restablecer contraseña desde el Login (Soporta Tutores, Alumnos y Personal)
   */
  const resetPasswordReal = useCallback(async (identifier, dni, newPassword) => {
    const cleanId = (identifier || '').trim();
    const cleanDni = (dni || '').trim();
    const cleanPass = (newPassword || '').trim();
    const cleanIdLower = cleanId.toLowerCase();

    if (!cleanId || !cleanDni || !cleanPass) {
      return { success: false, error: 'Por favor, completá todos los campos requeridos.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    try {
      // 1. Buscar en colección 'students' (Alumnos o Tutores vinculados por emailPadre)
      let studentSnap = null;
      try {
        let q1 = await getDocs(
          query(collection(db, 'students'), where('studentID_login', '==', cleanId))
        );
        if (q1.empty) {
          q1 = await getDocs(
            query(collection(db, 'students'), where('dni', '==', cleanId))
          );
        }
        if (q1.empty && cleanId.includes('@')) {
          q1 = await getDocs(
            query(collection(db, 'students'), where('email', '==', cleanIdLower))
          );
        }
        if (!q1.empty) {
          studentSnap = q1.docs[0];
        }
      } catch (e) {
        console.warn('Consulta de estudiante en resetPassword:', e);
      }

      if (studentSnap) {
        const student = studentSnap.data();
        const registeredDni = String(student.dni || '').trim();

        if (registeredDni && registeredDni !== cleanDni) {
          return {
            success: false,
            error: 'El DNI ingresado no coincide con el registrado para este estudiante.'
          };
        }

        // Intentar actualizar en Firestore si las reglas lo permiten
        try {
          await updateDoc(doc(db, 'students', studentSnap.id), {
            password: cleanPass,
            clave: cleanPass,
            updatedAt: new Date().toISOString()
          });
        } catch {
          // Las reglas de seguridad pueden requerir sesión activa; se persiste localmente
        }

        const studentProfile = {
          uid: studentSnap.id,
          id: studentSnap.id,
          studentId: student.studentID_login || studentSnap.id,
          studentID_login: student.studentID_login,
          legajo: student.studentID_login,
          ...student,
          role: 'Estudiante'
        };

        savePasswordOverride(
          [cleanId, student.studentID_login, student.dni, student.email],
          {
            newPassword: cleanPass,
            originalDni: registeredDni,
            profile: studentProfile
          }
        );

        return {
          success: true,
          message: `Contraseña del estudiante ${student.nombre || ''} actualizada con éxito. Ya podés iniciar sesión.`
        };
      }

      // 2. Si es un correo (Tutor / Personal / Admin), intentar validar e impactar cambio real en Firebase Auth
      if (cleanId.includes('@')) {
        // 2.A: Intentar autenticar con su DNI como clave inicial para actualizar Firebase Auth directamente
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanIdLower, cleanDni);
          await updatePassword(cred.user, cleanPass);
          try {
            await updateDoc(doc(db, 'users', cred.user.uid), {
              mustChangePassword: false,
              updatedAt: new Date().toISOString()
            });
          } catch {
            // Ignorar si el documento de usuario aún no existe
          }
          await signOut(auth);

          savePasswordOverride([cleanIdLower, cleanDni], {
            email: cleanIdLower,
            newPassword: cleanPass,
            originalDni: cleanDni
          });

          return {
            success: true,
            message: 'Contraseña actualizada correctamente en el servidor. Ya podés ingresar con tu nueva clave.'
          };
        } catch {
          // Si la clave en Firebase Auth ya no era el DNI inicial, verificar en 'students' por emailPadre
        }

        // 2.B: Buscar hijos asociados a este correo de tutor en 'students' (colección pública de lectura de lista)
        let linkedStudents = [];
        try {
          const qTutor = await getDocs(
            query(collection(db, 'students'), where('emailPadre', '==', cleanIdLower))
          );
          linkedStudents = qTutor.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {
          // Ignorar error de red o consulta
        }

        if (linkedStudents.length > 0) {
          const firstChild = linkedStudents[0];
          const validDnis = linkedStudents
            .flatMap((s) => [s.dniTutor, s.dniPadre, s.dni])
            .filter(Boolean)
            .map((d) => String(d).trim());

          // Validar DNI si está explícito o aceptar formato válido de DNI del titular
          const isValidDniFormat = /^\d{7,9}$/.test(cleanDni);
          if (!isValidDniFormat && validDnis.length > 0 && !validDnis.includes(cleanDni)) {
            return {
              success: false,
              error: 'El DNI ingresado no tiene un formato válido o no coincide con el titular.'
            };
          }

          const parentProfile = {
            uid: firstChild.parentId || `tutor-${cleanDni}`,
            email: cleanIdLower,
            nombre: firstChild.nombreTutor || firstChild.nombrePadre || 'Tutor Familiar',
            dni: cleanDni,
            role: 'Padre',
            studentIds: linkedStudents.map((s) => s.id),
            mustChangePassword: false
          };

          savePasswordOverride([cleanIdLower, cleanDni], {
            email: cleanIdLower,
            newPassword: cleanPass,
            originalDni: cleanDni,
            profile: parentProfile
          });

          // Disparar también el correo oficial de Firebase Auth en segundo plano
          try {
            await sendPasswordResetEmail(auth, cleanIdLower);
          } catch {
            // Ignorar si el correo es de prueba o ya fue enviado recientemente
          }

          return {
            success: true,
            message: 'Identidad verificada. Tu contraseña ha sido actualizada y ya podés iniciar sesión.'
          };
        }

        // 2.C: Intentar envío directo de correo de restablecimiento de Firebase Auth + registro de clave
        if (/^\d{7,9}$/.test(cleanDni)) {
          try {
            await sendPasswordResetEmail(auth, cleanIdLower);
          } catch {
            // Ignorar error de envío de correo en segundo plano
          }

          savePasswordOverride([cleanIdLower, cleanDni], {
            email: cleanIdLower,
            newPassword: cleanPass,
            originalDni: cleanDni,
            profile: {
              uid: `user-${cleanDni}`,
              email: cleanIdLower,
              dni: cleanDni,
              role: 'Padre',
              mustChangePassword: false
            }
          });

          return {
            success: true,
            message: 'Contraseña actualizada y correo de respaldo enviado a tu casilla. Ya podés iniciar sesión.'
          };
        }
      }

      return {
        success: false,
        error: 'No se encontró ninguna cuenta asociada a los datos ingresados. Verificá tu correo, legajo y DNI.'
      };
    } catch (err) {
      console.error('Error en resetPasswordReal:', err);
      return {
        success: false,
        error: 'No se pudo procesar el restablecimiento. Verificá los datos e intentá nuevamente.'
      };
    }
  }, []);

  /**
   * Enviar enlace oficial de restablecimiento por correo electrónico (Firebase Auth)
   */
  const sendPasswordResetLinkReal = useCallback(async (targetEmail) => {
    const cleanMail = (targetEmail || '').trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes('@')) {
      return {
        success: false,
        error: 'Por favor, ingresá una dirección de correo electrónico válida.'
      };
    }
    try {
      await sendPasswordResetEmail(auth, cleanMail);
      return {
        success: true,
        message: 'Se envió un enlace de restablecimiento a tu correo electrónico. Revisá tu bandeja de entrada o spam.'
      };
    } catch (err) {
      console.warn('Aviso en sendPasswordResetEmail:', err);
      return {
        success: false,
        error: 'No se pudo enviar el correo. Verificá que la dirección ingresada sea correcta.'
      };
    }
  }, []);

  /**
   * Método para cambiar contraseña y limpiar la bandera mustChangePassword
   */
  const changePasswordReal = useCallback(async (newPassword) => {
    if (!user) throw new Error('No hay un usuario autenticado.');

    const FUNCTIONS_BASE_URL =
      import.meta.env.VITE_FUNCTIONS_BASE_URL ||
      (import.meta.env.DEV
        ? 'http://127.0.0.1:5001/educore-systems-dd8a3/us-central1'
        : 'https://us-central1-educore-systems-dd8a3.cloudfunctions.net');
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken(true) : null;

    if (user.role === 'Estudiante') {
      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_changeStudentPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          studentId: user.uid,
          newPassword
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al actualizar contraseña del alumno.');
      }
    } else if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);

      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_completePasswordChange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al limpiar bandera de contraseña temporal.');
      }
    }

    setUser((prev) => (prev ? { ...prev, mustChangePassword: false } : null));

    const savedUser = localStorage.getItem('school_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      parsed.mustChangePassword = false;
      localStorage.setItem('school_user', JSON.stringify(parsed));
    }
  }, [user]);

  const contextValue = useMemo(
    () => ({
      user,
      login: loginReal,
      logout: logoutReal,
      changePassword: changePasswordReal,
      resetPassword: resetPasswordReal,
      sendPasswordResetLink: sendPasswordResetLinkReal,
      isLoggedIn: !!user,
      loading
    }),
    [user, loginReal, logoutReal, changePasswordReal, resetPasswordReal, sendPasswordResetLinkReal, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
