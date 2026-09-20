import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Icon from '../components/atoms/Icon';
import SuccessModal from '../components/molecules/SuccessModal';
import AdminApprovalModal from '../components/organisms/admin/AdminApprovalModal';
import AdminEditProfileModal from '../components/organisms/admin/AdminEditProfileModal';
import { db, auth } from '../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'create'

  
  // Dashboard Sub-Tab ('students' or 'staff')
  const [dashboardSubTab, setDashboardSubTab] = useState('students');

  //estado del modal de aprobacion de solicitudes
  const [aprobandoSolicitud, setAprobandoSolicitud] = useState(null);
  const [aprobacionError, setAprobacionError] = useState('');
  const [isAprobando, setIsAprobando] = useState(false);

  // Profile Editor Modal State
  const [editingUser, setEditingUser] = useState(null); // { id, type, fields: { nombre, email, dni, ... } }

  // Loading, Errors, and Modal States
  
  // Auto-switch tab if user is not admin
  useEffect(() => {
    if (activeTab === 'create' && user && user.role !== 'user_admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, user]);

  // Dashboard Data State
  const [parentsList, setParentsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // Filters State
  const [searchFilter, setSearchFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('todos');

  // Check Auth & Role on mount - Only user_admin allowed
  useEffect(() => {
    const checkAdminAuth = async () => {
      // 1. Check local mock/real context
      const savedUser = localStorage.getItem('school_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      if (currentUser && currentUser.role === 'user_admin') {
        return;
      }

      // 2. Check real Firebase Auth
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();
        const role = idTokenResult.claims.role;
        if (role === 'user_admin') {
          return;
        }
      }

      // If not allowed, redirect to login
      console.warn("Acceso denegado al Panel de Administración. Requiere rol user_admin.");
      navigate('/login');
    };
    checkAdminAuth();
  }, [navigate]);

  // Fetch Firestore users and students on mount & when dashboard tab is active
  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    setDataError('');
    try {
      // In v2 / emulator, or real environment
      const parentsSnap = await getDocs(collection(db, 'users'));
      const studentsSnap = await getDocs(collection(db, 'students'));

      const parents = parentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setParentsList(parents);
      setStudentsList(students);
    } catch (err) {
      console.error("Error cargando datos de Firestore:", err);
      setDataError("No se pudieron cargar datos reales de Firestore. Mostrando datos simulados.");

      // Fallback a datos simulados premium para visualización en local
      setParentsList([
        { id: 'parent-1', nombre: 'Eduardo Gómez', email: 'eduardo@ejemplo.com', emailInvalid: false, studentIds: ['student-1', 'student-2'] },
        { id: 'parent-2', nombre: 'María Rodríguez', email: 'maria.invalid@gmail.com', emailInvalid: true, studentIds: ['student-3'] }
      ]);
      setStudentsList([
        { id: 'student-1', studentID_login: 'EST-2026-88123', parentId: 'parent-1', emailPadre: 'eduardo@ejemplo.com', nombre: 'Lucía Gómez', dni: '48123456', nivel: 'inicial', status: 'active' },
        { id: 'student-2', studentID_login: 'EST-2026-90412', parentId: 'parent-1', emailPadre: 'eduardo@ejemplo.com', nombre: 'Mateo Gómez', dni: '45123987', nivel: 'primaria', status: 'pendingParentActivation' },
        { id: 'student-3', studentID_login: 'EST-2026-10492', parentId: 'parent-2', emailPadre: 'maria.invalid@gmail.com', nombre: 'Sofía Rodríguez', dni: '42987123', nivel: 'secundaria', status: 'pendingParentActivation' }
      ]);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab]);

  

  const addStudentField = () => {
    setStudents([...students, { nombre: '', dni: '', fechaNacimiento: '', nivel: 'inicial', genero: 'Masculino' }]);
  };

  const removeStudentField = (index) => {
    if (students.length === 1) return;
    const updated = students.filter((_, i) => i !== index);
    setStudents(updated);
  };

  // Restablecer contraseña al DNI
  const handleResetPassword = async (userId, userType, userDni) => {
    if (!userDni) {
      alert('Error: El DNI del usuario es requerido para el restablecimiento.');
      return;
    }
    if (!window.confirm(`¿Estás seguro de que deseas restablecer la contraseña al DNI (${userDni}) por defecto?`)) {
      return;
    }
    try {
      const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5001/educore-systems-dd8a3/us-central1' : 'https://us-central1-educore-systems-dd8a3.cloudfunctions.net');
      let token = 'mock-admin-token';
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_resetUserPasswordToDni`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, userType })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Fallo de API.');
      }

      alert('Contraseña restablecida con éxito al DNI. El usuario deberá cambiarla la próxima vez que ingrese.');
      fetchDashboardData();
    } catch (err) {
      alert(`Error al restablecer contraseña: ${err.message}`);
    }
  };

  // Guardar cambios del formulario de edición
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5001/educore-systems-dd8a3/us-central1' : 'https://us-central1-educore-systems-dd8a3.cloudfunctions.net');
      let token = 'mock-admin-token';
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_updateUserProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetId: editingUser.id,
          targetType: editingUser.type,
          fields: editingUser.fields
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Fallo de API.');
      }

      alert('Perfil actualizado con éxito.');
      setEditingUser(null);
      fetchDashboardData();
    } catch (err) {
      alert(`Error al actualizar perfil: ${err.message}`);
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditingUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        fields: {
          ...prev.fields,
          [field]: value
        }
      };
    });
  };

  // filtro para solo alumnos y tutores activos
  const filteredStudents = studentsList.filter(student => {
    if (student.status === 'pendiente') return false;

    const matchesSearch =
      (student.nombre || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (student.studentID_login || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (student.dni || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (student.emailPadre || '').toLowerCase().includes(searchFilter.toLowerCase());

    const matchesLevel = levelFilter === 'todos' || (student.nivel || 'inicial') === levelFilter;

    return matchesSearch && matchesLevel;
  });

  // Solicitudes pendientes — para el sub-tab "Solicitudes"
  const solicitudesPendientes = studentsList.filter(s => s.status === 'pendiente');

  const filteredStaff = parentsList.filter(user => {
    // Solo personal institucional (user_admin, Staff, Administrativo)
    const isStaff = user.role === 'user_admin' || user.role === 'Staff' || user.role === 'Administrativo';
    if (!isStaff) return false;

    const matchesSearch =
      (user.nombre || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (user.dni || '').toLowerCase().includes(searchFilter.toLowerCase());

    return matchesSearch;
  });

  const handleAprobarSolicitud = async (cursoAsignado) => {
    setIsAprobando(true);
    setAprobacionError('');

    try {
      const existingSecondaryApp = getApps().find(app => app.name === 'secondary');
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      const secondaryApp = existingSecondaryApp || initializeApp(firebaseConfig, 'secondary');
      const secondaryAuth = getAuth(secondaryApp);

      // Creamos la cuenta del padre en Firebase Auth con su email y su DNI como contraseña
      const credencialPadre = await createUserWithEmailAndPassword(
        secondaryAuth,
        aprobandoSolicitud.emailPadre,
        aprobandoSolicitud.dniTutor
      );
      const uidPadre = credencialPadre.user.uid;

      // Importante: cerrar sesión en la instancia secundaria
      await signOut(secondaryAuth);

      // Creamos el perfil del tutor en users
      await setDoc(doc(db, 'users', uidPadre), {
        role: 'Padre',
        nombre: aprobandoSolicitud.nombreTutor,
        email: aprobandoSolicitud.emailPadre,
        dni: aprobandoSolicitud.dniTutor,
        telefono: aprobandoSolicitud.telefonoTutor || '',
        mustChangePassword: true,
        emailInvalid: false,
        studentIds: [aprobandoSolicitud.id],
      });

      // Actualizamos el documento del alumno en Firestore vinculando el uid del padre
      await updateDoc(doc(db, 'students', aprobandoSolicitud.id), {
        status: 'activo',
        curso: cursoAsignado.trim(),
        parentId: uidPadre,
      });

      // Cerramos y actualizamos la vista
      setAprobandoSolicitud(null);
      fetchDashboardData();

      alert(`✅ Solicitud aprobada con éxito. La cuenta del tutor ${aprobandoSolicitud.nombreTutor} fue creada. Su contraseña inicial es su DNI: ${aprobandoSolicitud.dniTutor}`);
    } catch (error) {
      console.error('Error al aprobar solicitud', error);
      if (error.code === 'auth/email-already-in-use') {
        setAprobacionError('Este email ya tiene una cuenta en el sistema. El tutor puede iniciar sesión directamente.');
      } else {
        setAprobacionError('Ocurrió un error: ' + error.message);
      }
    } finally {
      setIsAprobando(false);
    }
  };

  const handleRechazarSolicitud = async (studentId, nombreAlumno) => {
    //confirm() muestra un dialogo del navegador pidiendo confirmación.
    const confirmar = window.confirm(
      `¿Seguro que quieres rechazar la solicitud de ${nombreAlumno}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      //deleteDoc elimina el documento de firestore.
      await deleteDoc(doc(db, 'students', studentId));
      fetchDashboardData(); //recarga la lista
    } catch (err) {
      alert('Error al rechazar la solicitud: ' + err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 font-body">
      <Navbar noButtons={true} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-slate-800 tracking-tight">Panel de Administración</h1>
            <p className="font-body text-slate-500 mt-2">Gestión de tutores, estudiantes y activación de credenciales.</p>
          </div>

          {/* Tab Selection buttons */}
          <div className="flex bg-slate-200/60 p-1.5 rounded-full border border-slate-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2.5 rounded-full font-label font-bold text-sm transition-all cursor-pointer ${activeTab === 'dashboard'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="dashboard" className="text-lg" />
                <span>Dashboard de Usuarios</span>
              </div>
            </button>
            {user?.role === 'user_admin' && (
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-2.5 rounded-full font-label font-bold text-sm transition-all cursor-pointer ${activeTab === 'create'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="person_add" className="text-lg" />
                  <span>Crear Usuarios</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative w-full md:w-96">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Icon name="search" />
                </span>
                <input
                  id="searchFilter"
                  type="text"
                  placeholder="Buscar por alumno, email del tutor o ID..."
                  aria-label="Buscar por alumno, email del tutor o ID"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <label htmlFor="levelFilter" className="text-sm font-semibold text-slate-500 whitespace-nowrap">Nivel Educativo:</label>
                <select
                  id="levelFilter"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full md:w-48 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none transition-all text-sm appearance-none"
                >
                  <option value="todos">Todos los niveles</option>
                  <option value="inicial">Nivel Inicial</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                </select>
              </div>
            </div>

            {/* Warn message if Firestore failed and mock data is shown */}
            {dataError && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center gap-3 text-amber-800">
                <Icon name="warning" className="text-amber-500 text-2xl" />
                <p className="text-sm font-medium">{dataError}</p>
              </div>
            )}

            {/* Sub-tabs Selector */}
            <div className="flex bg-slate-200/40 p-1 rounded-xl border border-slate-200/50 max-w-md">
              <button
                onClick={() => setDashboardSubTab('students')}
                className={`flex-1 py-2 rounded-lg font-label font-bold text-xs transition-all cursor-pointer border-none ${dashboardSubTab === 'students'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
              >
                Estudiantes y Tutores
              </button>
              <button
                onClick={() => setDashboardSubTab('staff')}
                className={`flex-1 py-2 rounded-lg font-label font-bold text-xs transition-all cursor-pointer border-none ${dashboardSubTab === 'staff'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
              >
                Personal Institucional
              </button>
              <button
                onClick={() => setDashboardSubTab('pendientes')}
                className={`relative flex-1 py-2 px-3 rounded-lg font-label font-bold text-xs transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                  dashboardSubTab === 'pendientes'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : solicitudesPendientes.length > 0
                      ? 'bg-amber-100/80 text-amber-900 hover:bg-amber-200 border border-amber-300'
                      : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                <span>Solicitudes</span>
                {/* Contador con fondo rojo bien visible y legible */}
                {solicitudesPendientes.length > 0 && (
                  <span className="bg-red-600 text-white text-[11px] font-extrabold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-sm ring-2 ring-white">
                    {solicitudesPendientes.length}
                  </span>
                )}
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                {isLoadingData ? (
                  <div className="p-12 text-center text-slate-500">
                    <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="font-semibold">Cargando base de datos...</p>
                  </div>
                ) : (dashboardSubTab === 'students' ? filteredStudents.length === 0 : filteredStaff.length === 0) ? (
                  <div className="p-16 text-center text-slate-500">
                    <Icon name="person_off" className="text-5xl text-slate-300 mb-4" />
                    <p className="font-bold text-lg">No se encontraron usuarios</p>
                    <p className="text-sm mt-1">Prueba con otros criterios de búsqueda o añade nuevos usuarios.</p>
                  </div>
                ) : dashboardSubTab === 'students' ? (
                  <>
                    {/* Vista Desktop (Tabla) */}
                    <div className="hidden md:block">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-label font-bold text-xs uppercase tracking-wider">
                            <th className="py-4 px-6">Estudiante / ID</th>
                            <th className="py-4 px-6">Nivel</th>
                            <th className="py-4 px-6">Tutor / Contacto</th>
                            <th className="py-4 px-6">Estado (Clave)</th>
                            <th className="py-4 px-6 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-body text-sm text-slate-700">
                          {filteredStudents.map((student) => {
                            const parent = parentsList.find(p => p.id === student.parentId) || { nombre: 'Sin Tutor', email: '', dni: '', mustChangePassword: true, emailInvalid: false };
                            return (
                              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-5 px-6">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-slate-800">{student.nombre}</span>
                                    <span className="text-xs text-slate-400 font-mono">
                                      {student.studentID_login} | DNI: {student.dni} | Género: {student.genero || 'No especificado'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${(student.nivel || 'inicial') === 'inicial' ? 'bg-secondary-container/20 text-secondary' :
                                    (student.nivel || 'inicial') === 'primaria' ? 'bg-primary-container/20 text-primary' :
                                      'bg-tertiary-container/20 text-tertiary-dim'
                                    }`}>
                                    {(student.nivel || 'inicial').toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-slate-700">{parent.nombre}</span>
                                    <span className="text-xs text-slate-500">{parent.email || student.emailPadre}</span>
                                    {parent.dni && <span className="text-xs text-slate-500">DNI: {parent.dni}</span>}
                                    {parent.emailInvalid && (
                                      <span className="flex items-center gap-0.5 text-red-500 font-bold uppercase tracking-wider text-[9px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200 w-max mt-0.5">
                                        <Icon name="error" className="text-[10px]" />
                                        Email Inválido
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="flex flex-col gap-1.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold w-max ${student.mustChangePassword
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-green-50 text-green-700 border border-green-200'
                                      }`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${student.mustChangePassword ? 'bg-amber-500' : 'bg-green-600'}`} />
                                      Alumno: {student.mustChangePassword ? 'Temporal (DNI)' : 'Cambiada'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold w-max ${parent.mustChangePassword
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-green-50 text-green-700 border border-green-200'
                                      }`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${parent.mustChangePassword ? 'bg-amber-500' : 'bg-green-600'}`} />
                                      Tutor: {parent.mustChangePassword ? 'Temporal (DNI)' : 'Cambiada'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5 bg-orange-50/50 p-1.5 rounded-lg border border-orange-100">
                                      <span className="text-[10px] font-bold text-orange-700 uppercase">Alumno:</span>
                                      <button
                                        type="button"
                                        onClick={() => handleResetPassword(student.id, 'student', student.dni)}
                                        title="Restablecer clave del estudiante al DNI"
                                        className="p-1 rounded bg-white text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer border border-orange-200/50"
                                      >
                                        <Icon name="lock_reset" className="text-sm" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingUser({
                                          id: student.id,
                                          type: 'student',
                                          fields: {
                                            nombre: student.nombre || '',
                                            dni: student.dni || '',
                                            fechaNacimiento: student.fechaNacimiento || '',
                                            nivel: student.nivel || 'inicial',
                                            genero: student.genero || 'Masculino'
                                          }
                                        })}
                                        title="Editar datos del alumno"
                                        className="p-1 rounded bg-white text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer border border-orange-200/50"
                                      >
                                        <Icon name="edit" className="text-sm" />
                                      </button>
                                    </div>
                                    {student.parentId && (
                                      <div className="flex items-center gap-1.5 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100">
                                        <span className="text-[10px] font-bold text-indigo-700 uppercase">Tutor:</span>
                                        <button
                                          type="button"
                                          onClick={() => handleResetPassword(student.parentId, 'parent', parent.dni)}
                                          title="Restablecer clave del tutor al DNI"
                                          className="p-1 rounded bg-white text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer border border-indigo-200/50"
                                        >
                                          <Icon name="lock_reset" className="text-sm" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingUser({
                                            id: student.parentId,
                                            type: 'parent',
                                            fields: {
                                              nombre: parent.nombre || '',
                                              dni: parent.dni || '',
                                              email: parent.email || student.emailPadre || ''
                                            }
                                          })}
                                          title="Editar datos del tutor"
                                          className="p-1 rounded bg-white text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer border border-indigo-200/50"
                                        >
                                          <Icon name="edit" className="text-sm" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista Mobile (Tarjetas) */}
                    <div className="block md:hidden space-y-4 p-4 bg-slate-50/50">
                      {filteredStudents.map((student) => {
                        const parent = parentsList.find(p => p.id === student.parentId) || { nombre: 'Sin Tutor', email: '', dni: '', mustChangePassword: true, emailInvalid: false };
                        return (
                          <div key={student.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 text-left">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-base text-slate-800 leading-tight">{student.nombre}</span>
                                <span className="text-xs text-slate-400 font-mono">{student.studentID_login}</span>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${(student.nivel || 'inicial') === 'inicial' ? 'bg-secondary-container/20 text-secondary' :
                                (student.nivel || 'inicial') === 'primaria' ? 'bg-primary-container/20 text-primary' :
                                  'bg-tertiary-container/20 text-tertiary-dim'
                                }`}>
                                {(student.nivel || 'inicial').toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-50 py-2">
                              <div>
                                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">DNI Alumno</span>
                                <span className="font-bold text-slate-700">{student.dni}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Género</span>
                                <span className="font-bold text-slate-700">{student.genero || 'No especificado'}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Tutor Responsable</span>
                              <div className="flex flex-col">
                                <span className="font-bold text-xs text-slate-700">{parent.nombre}</span>
                                <span className="text-xs text-slate-500">{parent.email || student.emailPadre}</span>
                                {parent.dni && <span className="text-xs text-slate-500">DNI: {parent.dni}</span>}
                                {parent.emailInvalid && (
                                  <span className="flex items-center gap-1 text-red-500 font-bold uppercase tracking-wider text-[9px] mt-1">
                                    <Icon name="error" className="text-[10px]" />
                                    Email Inválido
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${student.mustChangePassword ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'
                                }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${student.mustChangePassword ? 'bg-amber-500' : 'bg-green-600'}`} />
                                Alumno: {student.mustChangePassword ? 'Temporal' : 'Activa'}
                              </span>
                              {student.parentId && (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${parent.mustChangePassword ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'
                                  }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${parent.mustChangePassword ? 'bg-amber-500' : 'bg-green-600'}`} />
                                  Tutor: {parent.mustChangePassword ? 'Temporal' : 'Activa'}
                                </span>
                              )}
                            </div>

                            <div className="flex gap-2.5 pt-2 border-t border-slate-50">
                              <div className="flex-1 flex flex-col gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Alumno</span>
                                <div className="flex justify-center gap-2 mt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleResetPassword(student.id, 'student', student.dni)}
                                    title="Restablecer clave al DNI"
                                    className="flex-1 py-1.5 px-2 rounded bg-white text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer border border-orange-200/50 flex items-center justify-center gap-1"
                                  >
                                    <Icon name="lock_reset" className="text-sm" />
                                    <span className="text-[10px] font-bold">Reset</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingUser({
                                      id: student.id,
                                      type: 'student',
                                      fields: {
                                        nombre: student.nombre || '',
                                        dni: student.dni || '',
                                        fechaNacimiento: student.fechaNacimiento || '',
                                        nivel: student.nivel || 'inicial',
                                        genero: student.genero || 'Masculino'
                                      }
                                    })}
                                    title="Editar datos"
                                    className="flex-1 py-1.5 px-2 rounded bg-white text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer border border-orange-200/50 flex items-center justify-center gap-1"
                                  >
                                    <Icon name="edit" className="text-sm" />
                                    <span className="text-[10px] font-bold">Editar</span>
                                  </button>
                                </div>
                              </div>

                              {student.parentId && (
                                <div className="flex-1 flex flex-col gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Tutor</span>
                                  <div className="flex justify-center gap-2 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleResetPassword(student.parentId, 'parent', parent.dni)}
                                      title="Restablecer clave al DNI"
                                      className="flex-1 py-1.5 px-2 rounded bg-white text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer border border-indigo-200/50 flex items-center justify-center gap-1"
                                    >
                                      <Icon name="lock_reset" className="text-sm" />
                                      <span className="text-[10px] font-bold">Reset</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingUser({
                                        id: student.parentId,
                                        type: 'parent',
                                        fields: {
                                          nombre: parent.nombre || '',
                                          dni: parent.dni || '',
                                          email: parent.email || student.emailPadre || ''
                                        }
                                      })}
                                      title="Editar datos"
                                      className="flex-1 py-1.5 px-2 rounded bg-white text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer border border-indigo-200/50 flex items-center justify-center gap-1"
                                    >
                                      <Icon name="edit" className="text-sm" />
                                      <span className="text-[10px] font-bold">Editar</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : dashboardSubTab === 'staff' ? (
                  <>
                    {/* Vista Desktop (Tabla) */}
                    <div className="hidden md:block">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-label font-bold text-xs uppercase tracking-wider">
                            <th className="py-4 px-6">Nombre / DNI</th>
                            <th className="py-4 px-6">Rol Institucional</th>
                            <th className="py-4 px-6">Contacto (Email)</th>
                            <th className="py-4 px-6">Estado (Clave)</th>
                            <th className="py-4 px-6 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-body text-sm text-slate-700">
                          {filteredStaff.map((staff) => (
                            <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-5 px-6">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-slate-800">{staff.nombre}</span>
                                  <span className="text-xs text-slate-400 font-mono">DNI: {staff.dni || 'No registrado'}</span>
                                </div>
                              </td>
                              <td className="py-5 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${staff.role === 'user_admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                                  staff.role === 'Administrativo' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                    'bg-green-50 text-green-700 border border-green-200'
                                  }`}>
                                  {staff.role === 'user_admin' ? 'Administrador General' :
                                    staff.role === 'Administrativo' ? 'Administrativo' :
                                      'Docente / Staff'}
                                </span>
                              </td>
                              <td className="py-5 px-6">
                                <span className="text-slate-600">{staff.email}</span>
                              </td>
                              <td className="py-5 px-6">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${staff.mustChangePassword
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-green-50 text-green-700 border border-green-200'
                                  }`}>
                                  <span className={`h-2 w-2 rounded-full ${staff.mustChangePassword ? 'bg-amber-500 animate-pulse' : 'bg-green-600'}`} />
                                  {staff.mustChangePassword ? 'Temporal (DNI)' : 'Clave Segura'}
                                </span>
                              </td>
                              <td className="py-5 px-6 text-center">
                                <div className="flex justify-center items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleResetPassword(staff.id, 'administrative', staff.dni)}
                                    title="Restablecer clave del personal al DNI"
                                    className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200/50"
                                  >
                                    <Icon name="lock_reset" className="text-base" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingUser({
                                      id: staff.id,
                                      type: 'administrative',
                                      fields: {
                                        nombre: staff.nombre || '',
                                        dni: staff.dni || '',
                                        email: staff.email || '',
                                        role: staff.role || 'Staff'
                                      }
                                    })}
                                    title="Editar datos del personal"
                                    className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200/50"
                                  >
                                    <Icon name="edit" className="text-base" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista Mobile (Tarjetas) */}
                    <div className="block md:hidden space-y-4 p-4 bg-slate-50/50">
                      {filteredStaff.map((staff) => (
                        <div key={staff.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 text-left">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-base text-slate-800 leading-tight">{staff.nombre}</span>
                              <span className="text-xs text-slate-400 font-mono">DNI: {staff.dni || 'No registrado'}</span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${staff.role === 'user_admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                              staff.role === 'Administrativo' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                'bg-green-50 text-green-700 border border-green-200'
                              }`}>
                              {staff.role === 'user_admin' ? 'Admin' :
                                staff.role === 'Administrativo' ? 'Admin. Interno' :
                                  'Docente'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Correo Electrónico</span>
                            <span className="text-xs text-slate-700 font-medium">{staff.email}</span>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Estado de Credenciales</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold mt-1 ${staff.mustChangePassword ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'
                              }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${staff.mustChangePassword ? 'bg-amber-500 animate-pulse' : 'bg-green-600'}`} />
                              Clave: {staff.mustChangePassword ? 'Temporal (DNI)' : 'Cambiada / Segura'}
                            </span>
                          </div>

                          <div className="flex gap-3 pt-3 border-t border-slate-50">
                            <button
                              type="button"
                              onClick={() => handleResetPassword(staff.id, 'administrative', staff.dni)}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200/50 flex items-center justify-center gap-2 text-xs font-bold"
                            >
                              <Icon name="lock_reset" className="text-sm" />
                              <span>Restablecer Clave</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUser({
                                id: staff.id,
                                type: 'administrative',
                                fields: {
                                  nombre: staff.nombre || '',
                                  dni: staff.dni || '',
                                  email: staff.email || '',
                                  role: staff.role || 'Staff'
                                }
                              })}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200/50 flex items-center justify-center gap-2 text-xs font-bold"
                            >
                              <Icon name="edit" className="text-sm" />
                              <span>Editar Datos</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : dashboardSubTab === 'pendientes' ? (
                  <div className="p-6 space-y-4">
                    {solicitudesPendientes.length === 0 ? (
                      <div className="p-16 text-center text-slate-500">
                        <p className="font-bold text-lg">No hay solicitudes pendientes</p>
                        <p className="text-sm mt-1">Todas las preinscripciones han sido procesadas.</p>
                      </div>
                    ) : solicitudesPendientes.map((solicitud) => (
                      <div key={solicitud.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                          {/* Datos del alumno y tutor */}
                          <div className="flex-1 space-y-2">
                            <div>
                              <p className="text-xs text-amber-600 font-bold uppercase">Alumno</p>
                              <p className="font-bold text-slate-800 text-lg">{solicitud.nombre}</p>
                              <p className="text-sm text-slate-500">
                                DNI: {solicitud.dni} | Nivel: {solicitud.nivel?.toUpperCase()} | Nac.: {solicitud.fechaNacimiento}
                              </p>
                              <p className="text-xs font-mono text-slate-400">{solicitud.studentID_login}</p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-600 font-bold uppercase mt-2">Tutor Responsable</p>
                              <p className="font-semibold text-slate-700">{solicitud.nombreTutor}</p>
                              <p className="text-sm text-slate-500">
                                {solicitud.emailPadre} | DNI: {solicitud.dniTutor} | Tel: {solicitud.telefonoTutor}
                              </p>
                            </div>
                          </div>

                          {/* Botones de acción */}
                          <div className="flex flex-col gap-2 min-w-[180px]">
                            <button
                              onClick={() => {
                                setAprobandoSolicitud(solicitud);
                                setAprobacionError('');
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer border-none"
                            >
                              ✓ Revisar y Aprobar
                            </button>
                            <button
                              onClick={() => handleRechazarSolicitud(solicitud.id, solicitud.nombre)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer border-none"
                            >
                              ✗ Rechazar
                            </button>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Creation Tab Content */}
        {activeTab === 'create' && user?.role === 'user_admin' && (
          <AdminCreationTab onSwitchToDashboard={() => setActiveTab('dashboard')} />
        )}

  </main>

      
      {/* Modal de Edición de Datos */}
      <AdminEditProfileModal
        editingUser={editingUser}
        onClose={() => setEditingUser(null)}
        onChangeField={handleEditFieldChange}
        onSubmit={handleEditSubmit}
      />

      {/* Modal de Aprobación de Solicitud */}
      <AdminApprovalModal
        solicitud={aprobandoSolicitud}
        isAprobando={isAprobando}
        aprobacionError={aprobacionError}
        onClose={() => setAprobandoSolicitud(null)}
        onApprove={handleAprobarSolicitud}
      />

    </div>
  );
};

export default AdminPanel;
