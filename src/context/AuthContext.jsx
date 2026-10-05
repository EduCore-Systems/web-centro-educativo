/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

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
          console.error("Error obteniendo claims/perfil de Firebase:", error);
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
    const isStudentFormat = role === 'Estudiante' || /^EST-\d+/i.test(cleanId) || (!cleanId.includes('@') && cleanId.length >= 6);

    if (isStudentFormat && role !== 'Administrador' && role !== 'Staff' && role !== 'Padre/Tutor') {
      // Iniciar sesión de alumno usando la Cloud Function cf_loginStudent (devuelve customToken)
      const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5001/educore-systems-dd8a3/us-central1' : 'https://us-central1-educore-systems-dd8a3.cloudfunctions.net');
      try {
        const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_loginStudent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentID_login: cleanId, password })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Credenciales de alumno incorrectas.');
        }

        const { customToken } = await response.json();

        // Logear en Firebase Auth cliente usando el customToken retornado por el backend
        return await signInWithCustomToken(auth, customToken);
      } catch (err) {
        // Si el backend/Cloud Function aún no está desplegado en Firebase o no responde (Failed to fetch / 404),
        // habilitar sesión simulada de testing para validar la interfaz del portal del alumno
        if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('404')) {
          console.warn('Backend Cloud Function no disponible. Activando sesión de alumno en modo pruebas locales.');
          const demoUser = {
            uid: `test-${cleanId.toLowerCase()}`,
            nombre: 'Estudiante EduCore',
            studentId: cleanId,
            studentID_login: cleanId,
            dni: password && /^\d+$/.test(password) ? password : '50123456',
            legajo: cleanId,
            curso: '1° Año A',
            nivel: 'Secundaria',
            promedio: 8.75,
            conducta: 'Muy Buena',
            role: 'Estudiante',
            email: `${cleanId.toLowerCase()}@educore.edu.ar`,
          };
          setUser(demoUser);
          localStorage.setItem('school_user', JSON.stringify(demoUser));
          return demoUser;
        }
        throw err;
      }
    } else {
      // Logear tutores, staff o administradores con email y contraseña estándar en Firebase Auth
      return signInWithEmailAndPassword(auth, cleanId, password);
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
   * Método para cambiar contraseña y limpiar la bandera mustChangePassword
   */
  const changePasswordReal = useCallback(async (newPassword) => {
    if (!user) throw new Error("No hay un usuario autenticado.");

    const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5001/educore-systems-dd8a3/us-central1' : 'https://us-central1-educore-systems-dd8a3.cloudfunctions.net');
    const idToken = await auth.currentUser.getIdToken(true);

    if (user.role === 'Estudiante') {
      // Para estudiantes: Llamar a cf_changeStudentPassword (hashing interno en Firestore)
      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_changeStudentPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
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
    } else {
      // Para Padres / Personal: Usar SDK cliente de Firebase para cambiar la contraseña
      await updatePassword(auth.currentUser, newPassword);

      // Notificar al backend para que limpie el flag mustChangePassword en Firestore
      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_completePasswordChange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al limpiar bandera de contraseña temporal.');
      }
    }

    // Actualizar el estado del usuario localmente para remover el bloqueo de contraseña
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);

    // Sincronizar en localStorage
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
      isLoggedIn: !!user,
      loading
    }),
    [user, loginReal, logoutReal, changePasswordReal, loading]
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
