import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Icon from '../components/atoms/Icon';
import SuccessModal from '../components/molecules/SuccessModal';
import AdminApprovalModal from '../components/organisms/admin/AdminApprovalModal';
import AdminEditProfileModal from '../components/organisms/admin/AdminEditProfileModal';
import AdminDashboardTab from '../components/organisms/admin/AdminDashboardTab';
import AdminCreationTab from '../components/organisms/admin/AdminCreationTab';
import { db, auth, firebaseConfig } from '../services/firebase';
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
