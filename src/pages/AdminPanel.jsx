import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/atoms/Icon';
import SuccessModal from '../components/molecules/SuccessModal';
import AdminApprovalModal from '../components/organisms/admin/AdminApprovalModal';
import AdminEditProfileModal from '../components/organisms/admin/AdminEditProfileModal';
import AdminDashboardTab from '../components/organisms/admin/AdminDashboardTab';
import AdminCreationTab from '../components/organisms/admin/AdminCreationTab';
import AdminAcademicTab from '../components/organisms/admin/academic/AdminAcademicTab';
import AdminServicesTab from '../components/organisms/admin/services/AdminServicesTab';
import AdminReportsTab from '../components/organisms/admin/reports/AdminReportsTab';
import AdminSidebar from '../components/organisms/admin/AdminSidebar';
import { db, auth, firebaseConfig } from '../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Tab State y Sidebar Mobile State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  
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

  // Mapeo de títulos según el tab activo
  const TAB_TITLES = {
    dashboard: { title: 'Dashboard de Usuarios', subtitle: 'Gestión de tutores, estudiantes y activación de credenciales.' },
    create: { title: 'Alta de Usuarios', subtitle: 'Registro administrativo de personal y cuentas institucionales.' },
    academic: { title: 'Gestión Académica', subtitle: 'Administración de cursos, materias y horarios de cursado.' },
    services: { title: 'Servicios Institucionales', subtitle: 'Configuración de rutas de transporte y actividades deportivas.' },
    reports: { title: 'Centro de Reportes', subtitle: 'Estadísticas pedagógicas, nóminas y reportes financieros.' },
  };

  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 font-body flex">
      {/* ── BARRA LATERAL (SIDEBAR) ── */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onLogout={logout}
      />

      {/* ── CONTENIDO PRINCIPAL (Desplazado con lg:pl-64) ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header superior de Dashboard */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Botón menú hamburguesa (visible en mobile) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-xl hidden sm:block">admin_panel_settings</span>
              <span className="font-bold text-slate-800 text-sm">Control Administrativo</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Nivel Administrador
            </span>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(user?.nombre || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-800">
                {user?.nombre || user?.email?.split('@')[0] || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
          {/* Header del Módulo Activo */}
          <div className="mb-8">
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentTabInfo.title}
            </h1>
            <p className="font-body text-slate-500 text-sm mt-1">
              {currentTabInfo.subtitle}
            </p>
          </div>

        {/* Dashboard Tab Content */}
        <AdminDashboardTab
          activeTab={activeTab}
          dashboardSubTab={dashboardSubTab}
          setDashboardSubTab={setDashboardSubTab}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          isLoadingData={isLoadingData}
          dataError={dataError}
          filteredStudents={filteredStudents}
          filteredStaff={filteredStaff}
          solicitudesPendientes={solicitudesPendientes}
          parentsList={parentsList}
          setAprobandoSolicitud={setAprobandoSolicitud}
          setAprobacionError={setAprobacionError}
          handleRechazarSolicitud={handleRechazarSolicitud}
          setEditingUser={setEditingUser}
          handleResetPassword={handleResetPassword}
        />

        {/* Creation Tab Content */}
        {activeTab === 'create' && user?.role === 'user_admin' && (
          <AdminCreationTab onSwitchToDashboard={() => setActiveTab('dashboard')} />
        )}

        {/* Academic Tab Content */}
        {activeTab === 'academic' && user?.role === 'user_admin' && (
          <AdminAcademicTab />
        )}

        {/* Services Tab Content */}
        {activeTab === 'services' && user?.role === 'user_admin' && (
          <AdminServicesTab />
        )}

        {/* Reports Tab Content */}
        {activeTab === 'reports' && user?.role === 'user_admin' && (
          <AdminReportsTab />
        )}

      </main>
      </div>

      
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
