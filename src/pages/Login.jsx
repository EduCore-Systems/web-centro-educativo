import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { images } from '../services/imagesConfig';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ROLES_INFO = {
  Administrador: {
    label: 'Administrador',
    icon: 'admin_panel_settings',
    displayLabel: 'ADMINISTRADOR',
    permissions: ['gestionar_usuarios', 'ver_auditorias', 'configurar_sistema'],
  },
  Staff: {
    label: 'Staff',
    icon: 'badge',
    displayLabel: 'STAFF (DOCENTE)',
    permissions: [
      'cargar_asistencias',
      'registrar_notas',
      'publicar_anuncios_aula',
      'ver_agenda_clases',
    ],
  },
  'Padre/Tutor': {
    label: 'Padre/Tutor',
    icon: 'family_restroom',
    displayLabel: 'PADRE/TUTOR',
    permissions: [
      'ver_legajo_hijo',
      'autorizar_eventos',
      'ver_estado_cuotas',
      'comunicarse_con_docente',
    ],
  },
  Estudiante: {
    label: 'Estudiante',
    icon: 'school',
    displayLabel: 'ESTUDIANTE',
    permissions: [
      'ver_mis_notas',
      'ver_mis_asistencias',
      'descargar_material',
      'ver_horarios',
    ],
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { user, login, logout, resetPassword, sendPasswordResetLink, isLoggedIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el Modal de Recuperación de Contraseña
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetDni, setResetDni] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Redirigir según el rol del usuario autenticado
  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === 'user_admin' || user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'Padre' || user.role === 'Padre/Tutor' || user.role === 'user_padre') {
        navigate('/family');
      } else if (user.role === 'Staff' || user.role === 'Docente') {
        navigate('/teacher');
      } else if (user.role === 'Estudiante' || user.role === 'student' || user.role === 'user_student') {
        navigate('/student');
      }
    }
  }, [isLoggedIn, user, navigate]);

  const handleOpenForgotModal = (e) => {
    if (e) e.preventDefault();
    setResetIdentifier(identifier || '');
    setResetDni('');
    setResetNewPass('');
    setResetConfirmPass('');
    setResetError('');
    setResetSuccess('');
    setShowForgotModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetIdentifier.trim() || !resetDni.trim() || !resetNewPass.trim() || !resetConfirmPass.trim()) {
      setResetError('Por favor, completá todos los campos requeridos.');
      return;
    }

    if (resetNewPass.length < 6) {
      setResetError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (resetNewPass !== resetConfirmPass) {
      setResetError('Las contraseñas no coinciden. Verificalas.');
      return;
    }

    setResetLoading(true);
    const res = await resetPassword(resetIdentifier, resetDni, resetNewPass);
    setResetLoading(false);

    if (res.success) {
      setResetSuccess(res.message || 'Contraseña actualizada con éxito.');
      setIdentifier(resetIdentifier.trim());
      setPassword(resetNewPass.trim());
      setTimeout(() => {
        setShowForgotModal(false);
      }, 1800);
    } else {
      setResetError(res.error || 'No se pudo actualizar la contraseña.');
    }
  };

  const handleSendResetEmailLink = async () => {
    setResetError('');
    setResetSuccess('');
    const target = (resetIdentifier || identifier || '').trim();
    if (!target || !target.includes('@')) {
      setResetError('Ingresá una dirección de correo electrónico válida en el primer campo para enviarte el enlace.');
      return;
    }
    setResetLoading(true);
    const res = await sendPasswordResetLink(target);
    setResetLoading(false);
    if (res.success) {
      setResetSuccess(res.message || 'Correo de recuperación enviado.');
    } else {
      setResetError(res.error || 'No se pudo enviar el correo de recuperación.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');
    try {
      await login(identifier, password);
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setLoginError('Credenciales inválidas. Verifica tu correo y contraseña.');
          break;
        default:
          setLoginError(
            err.message || err.code || 'Error al iniciar sesión. Revisa tus credenciales.'
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIdentifier('');
    setPassword('');
  };

  if (isLoggedIn && user) {
    const ROL_A_INFO_KEY = {
      user_admin: 'Administrador',
      Staff: 'Staff',
      Administrativo: 'Staff',
      Padre: 'Padre/Tutor',
      'Padre/Tutor': 'Padre/Tutor',
      Estudiante: 'Estudiante',
    };
    const activeRoleKey = ROL_A_INFO_KEY[user.role] || 'Estudiante';
    const currentRole = ROLES_INFO[activeRoleKey];

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-16">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-[0px_20px_40px_rgba(35,44,81,0.06)] border border-slate-100 p-8 sm:p-12 text-center transition-all duration-300 hover:shadow-[0px_25px_50px_rgba(35,44,81,0.1)]">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 animate-bounce">
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {currentRole?.icon || 'verified_user'}
                </span>
              </div>
            </div>

            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight mb-4">
              HOLA {currentRole?.displayLabel || user.role.toUpperCase()},
              TIENES ESTOS PERMISOS:
            </h1>

            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 sm:p-8 my-6 text-left max-w-md mx-auto">
              <ul className="space-y-4">
                {currentRole?.permissions.map((permission, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-slate-700 text-base font-medium"
                  >
                    <span
                      className="material-symbols-outlined text-orange-600 font-bold bg-orange-100 rounded-full p-1 text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {(user.role === 'Padre' || user.role === 'Padre/Tutor') && (
                <button
                  type="button"
                  onClick={() => navigate('/family')}
                  className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold font-label rounded-full transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">family_restroom</span>
                  Ir al Portal Familiar
                </button>
              )}
              {user.role === 'user_admin' && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold font-label rounded-full transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  Ir al Panel Admin
                </button>
              )}
              {(user.role === 'Estudiante' || user.role === 'student') && (
                <button
                  type="button"
                  onClick={() => navigate('/student')}
                  className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold font-label rounded-full transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">school</span>
                  Ir al Portal del Alumno
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-label rounded-full transition-all duration-200 border border-slate-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-body flex items-center justify-center p-4 sm:p-8">
      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch bg-white rounded-xl shadow-[0px_20px_40px_rgba(35,44,81,0.06)] overflow-hidden">
        {/* Left Side: Visual/Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-amber-400 p-12 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-0"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-lime-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>

          <div className="relative z-10">
            <div className="mb-8">
              <img
                loading="lazy"
                alt="Logo Educar para Transformar"
                className="h-20 w-auto object-contain bg-white rounded-xl p-2 shadow-lg"
                src={images.logo}
                onError={(e) => {
                  e.target.src =
                    'https://lh3.googleusercontent.com/aida/ADBb0ugJ1I9qKGq-LA1zkyP0mAJ6KMVoto-k2Bhko7jS4BgxauPND3UeAT0onvR1k3ArEIe80EYEIMFR8Bwmy9Wq6vif1Hl7DAh1-BrEutL_eg8cYRnUjvE5tspD46XGp7iF9rIOZa8T-GNoMMlJIBDJIzgLlyIj-mRW9JHn4QnEsHs-VN4XmpP7DLXTLi0_GmkFUlL2utzr7RRQS131G6KzO_u524R8pUernkXd1WN1UmvTuth2AT7diNd-5Yg';
                }}
              />
            </div>
            <h1 className="font-headline font-extrabold text-5xl leading-tight tracking-tight text-white mb-6">
              Bienvenido a<br />
              Educar para
              <br />
              Transformar.
            </h1>
            <p className="font-body text-lg text-white/90 max-w-md">
              Transformando la interfaz educativa tradicional en una experiencia
              digital de nivel editorial para estudiantes, padres y profesores.
            </p>
          </div>

          <div className="relative z-10 mt-auto bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-sm">
            <div className="flex items-center gap-4">
              <span
                className="material-symbols-outlined text-lime-300"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lightbulb
              </span>
              <p className="font-body text-sm font-medium text-white">
                "La educación es el arma más poderosa que puedes usar para
                cambiar el mundo."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 xl:p-16 flex flex-col justify-center bg-white relative">
          {/* Volver (Go Back) Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors duration-200 focus:outline-none font-label text-sm font-semibold group cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:-translate-x-1">
              arrow_back
            </span>
            Volver
          </button>

          <div className="max-w-md w-full mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-10 text-center flex flex-col items-center mt-6">
              <img
                loading="lazy"
                alt="Logo Educar para Transformar"
                className="h-16 w-auto object-contain mb-4 bg-white rounded-xl p-2 shadow-md"
                src={images.logo}
                onError={(e) => {
                  e.target.src =
                    'https://lh3.googleusercontent.com/aida/ADBb0ugJ1I9qKGq-LA1zkyP0mAJ6KMVoto-k2Bhko7jS4BgxauPND3UeAT0onvR1k3ArEIe80EYEIMFR8Bwmy9Wq6vif1Hl7DAh1-BrEutL_eg8cYRnUjvE5tspD46XGp7iF9rIOZa8T-GNoMMlJIBDJIzgLlyIj-mRW9JHn4QnEsHs-VN4XmpP7DLXTLi0_GmkFUlL2utzr7RRQS131G6KzO_u524R8pUernkXd1WN1UmvTuth2AT7diNd-5Yg';
                }}
              />
              <h2 className="font-headline font-bold text-3xl text-slate-800 tracking-tight">
                Portal de Acceso
              </h2>
            </div>

            <div className="hidden lg:block mb-10">
              <h2 className="font-headline font-bold text-4xl text-slate-800 tracking-tight mb-2">
                Portal de Acceso
              </h2>
              <p className="font-body text-slate-500">
                Inicia sesión para continuar tu viaje.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* ID / Email Field */}
              <div>
                <label
                  className="block font-label text-sm font-medium text-slate-600 mb-2"
                  htmlFor="identifier"
                >
                  Correo Electrónico, Legajo o DNI
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">
                      mail
                    </span>
                  </div>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 text-slate-800 placeholder-slate-400 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-0 transition-colors font-body text-base"
                    id="identifier"
                    name="identifier"
                    placeholder="Ingresá tu correo electrónico, DNI o legajo"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block font-label text-sm font-medium text-slate-600"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenForgotModal}
                    className="font-label text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">
                      lock
                    </span>
                  </div>
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 text-slate-800 placeholder-slate-400 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-0 transition-colors font-body text-base"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  className="h-5 w-5 rounded-md bg-slate-50 border-slate-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  className="ml-3 block font-body text-sm text-slate-600 cursor-pointer select-none"
                  htmlFor="remember-me"
                >
                  Mantener sesión iniciada
                </label>
              </div>

              {/* Submit Button */}
              <button
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-full shadow-md text-base font-bold font-label text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-all active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verificando...' : 'Acceso Seguro'}
                <span className="material-symbols-outlined ml-2">
                  arrow_forward
                </span>
              </button>
              {loginError && (
                <p
                  test-dataid="login-error-text"
                  className="text-red-500 text-sm font-bold text-center mt-4 bg-red-50 p-2.5 rounded-xl border border-red-200"
                >
                  {loginError}
                </p>
              )}
            </form>

            {/* Help Link */}
            <div className="mt-8 text-center">
              <p className="font-body text-sm text-slate-500">
                ¿Necesitas ayuda para acceder a tu cuenta?{' '}
                <br className="sm:hidden" />
                <button
                  type="button"
                  onClick={() => navigate('/contacto')}
                  className="font-medium text-orange-600 hover:text-orange-700 transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Contactar Soporte
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL DE RECUPERACIÓN DE CONTRASEÑA ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 text-left">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">lock_reset</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-slate-900 text-lg">
                    Recuperar Contraseña
                  </h3>
                  <p className="text-xs text-slate-500">
                    Validación de identidad institucional con DNI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-red-600">error</span>
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Correo Electrónico, Legajo o Usuario
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3.5 top-1/2 -translate-y-1/2">
                    mail
                  </span>
                  <input
                    type="text"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="Ingresá tu correo electrónico, legajo o DNI"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  DNI del Titular Registrado (Para verificar)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3.5 top-1/2 -translate-y-1/2">
                    badge
                  </span>
                  <input
                    type="text"
                    value={resetDni}
                    onChange={(e) => setResetDni(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ingresá el número de documento (sin puntos)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nueva Contraseña (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3.5 top-1/2 -translate-y-1/2">
                    lock
                  </span>
                  <input
                    type={showResetPass ? 'text' : 'password'}
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    placeholder="Ingresá tu nueva contraseña"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass(!showResetPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showResetPass ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3.5 top-1/2 -translate-y-1/2">
                    lock
                  </span>
                  <input
                    type={showResetPass ? 'text' : 'password'}
                    value={resetConfirmPass}
                    onChange={(e) => setResetConfirmPass(e.target.value)}
                    placeholder="Repetí tu nueva contraseña"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {resetLoading ? 'Procesando...' : 'Actualizar Contraseña con DNI'}
              </button>
            </form>

            {/* Divisor */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                O recibir enlace por correo
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <button
              type="button"
              disabled={resetLoading}
              onClick={handleSendResetEmailLink}
              className="w-full py-2.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">forward_to_inbox</span>
              <span>Enviar correo de restablecimiento</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
