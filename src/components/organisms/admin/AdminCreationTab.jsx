import React, { useState } from 'react';
import Icon from '../../atoms/Icon';
import SuccessModal from '../../molecules/SuccessModal';
import { auth } from '../../../services/firebase';

const AdminCreationTab = ({ onSwitchToDashboard }) => {
// Creation Type State ('parent_student' or 'administrative')
  const [creationType, setCreationType] = useState('parent_student');

  // Form State for creating Parent & Students
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentDni, setParentDni] = useState('');
  const [students, setStudents] = useState([
    { nombre: '', dni: '', fechaNacimiento: '', nivel: 'inicial', genero: 'Masculino' }
  ]);

  // Form State for creating Administrative/Staff User
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminDni, setAdminDni] = useState('');
  const [adminRole, setAdminRole] = useState('Staff');

const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '' });
  const [formError, setFormError] = useState('');




// Handler to call api cf_createParentAndStudents
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!parentEmail.trim() || !parentName.trim() || !parentDni.trim()) {
      setFormError('Por favor, completa todos los datos del tutor (nombre, email y DNI).');
      return;
    }

    // Validate students list
    for (const std of students) {
      if (!std.nombre.trim() || !std.dni.trim() || !std.fechaNacimiento || !std.genero) {
        setFormError('Por favor, completa todos los datos de los estudiantes (incluyendo género).');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5001/educore-systems-dd8a3/us-central1' : 'https://us-central1-educore-systems-dd8a3.cloudfunctions.net');

      let token = 'mock-admin-token';
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_createParentAndStudents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          parentEmail: parentEmail.trim(),
          parentName: parentName.trim(),
          parentDni: parentDni.trim(),
          students
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error en la petición.');
      }

      await response.json();

      setSuccessModalData({
        title: '¡Tutor y Alumnos Creados!',
        message: `Se ha registrado a ${parentName} con DNI ${parentDni}. Las cuentas han sido activadas. El tutor podrá ingresar usando su DNI como contraseña temporal.`
      });
      setSuccessModalOpen(true);

      // Reset Form
      setParentEmail('');
      setParentName('');
      setParentDni('');
      setStudents([{ nombre: '', dni: '', fechaNacimiento: '', nivel: 'inicial', genero: 'Masculino' }]);

    } catch (err) {
      console.error(err);
      setFormError(`Fallo al registrar: ${err.message || 'Error de conexión.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!adminEmail.trim() || !adminName.trim() || !adminRole || !adminDni.trim()) {
      setFormError('Por favor, completa todos los campos del formulario (incluyendo DNI).');
      return;
    }

    setIsSubmitting(true);
    try {
      const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5001/educore-systems-dd8a3/us-central1' : 'https://us-central1-educore-systems-dd8a3.cloudfunctions.net');

      let token = 'mock-admin-token';
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_createAdministrativeUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: adminEmail.trim(),
          name: adminName.trim(),
          role: adminRole,
          dni: adminDni.trim()
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error en la petición.');
      }

      await response.json();

      setSuccessModalData({
        title: '¡Usuario Creado!',
        message: `Se ha registrado a ${adminName} con el rol de ${adminRole}. Cuenta activa. El usuario podrá ingresar utilizando su DNI como contraseña temporal.`
      });
      setSuccessModalOpen(true);

      // Reset Form
      setAdminEmail('');
      setAdminName('');
      setAdminDni('');
      setAdminRole('Staff');

    } catch (err) {
      console.error(err);
      setFormError(`Fallo al registrar: ${err.message || 'Error de conexión.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper dynamic fields addition/removal for students
  const handleStudentChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl max-w-4xl mx-auto">
        <h2 className="font-headline text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
          <Icon name="person_add" className="text-orange-500" />
          <span>
            {creationType === 'parent_student'
              ? 'Registrar Tutor y Estudiantes'
              : 'Registrar Personal / Administrativo'}
          </span>
        </h2>

        {/* Sub-selector for creation type */}
        <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200 mb-8 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              setCreationType('parent_student');
              setFormError('');
            }}
            className={`flex-1 py-2 rounded-full font-label font-bold text-xs transition-all cursor-pointer border-none ${creationType === 'parent_student'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
          >
            Tutor y Estudiantes
          </button>
          <button
            type="button"
            onClick={() => {
              setCreationType('administrative');
              setFormError('');
            }}
            className={`flex-1 py-2 rounded-full font-label font-bold text-xs transition-all cursor-pointer border-none ${creationType === 'administrative'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
          >
            Personal / Administrativo
          </button>
        </div>

        {creationType === 'parent_student' ? (
          <form onSubmit={handleCreateSubmit} className="space-y-8">
            {/* Tutor Section */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 space-y-4 text-left">
              <h3 className="font-label font-bold text-xs uppercase tracking-widest text-slate-500">Datos del Padre/Tutor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="createParentName" className="text-sm font-semibold text-slate-600">Nombre Completo del Tutor</label>
                  <input
                    id="createParentName"
                    type="text"
                    placeholder="Ej. Andrés Martínez"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="createParentDni" className="text-sm font-semibold text-slate-600">DNI del Tutor</label>
                  <input
                    id="createParentDni"
                    type="text"
                    placeholder="Número de DNI"
                    value={parentDni}
                    onChange={(e) => setParentDni(e.target.value.replace(/\D/g, ''))}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="createParentEmail" className="text-sm font-semibold text-slate-600">Correo Electrónico</label>
                  <input
                    id="createParentEmail"
                    type="email"
                    placeholder="tutor@ejemplo.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Hijos Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-label font-bold text-xs uppercase tracking-widest text-slate-500">Estudiantes Vinculados</h3>
                <button
                  type="button"
                  onClick={addStudentField}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold text-xs rounded-full transition-all cursor-pointer border-none"
                >
                  <Icon name="add" className="text-sm" />
                  <span>Añadir Hijo</span>
                </button>
              </div>

              <div className="space-y-4">
                {students.map((student, idx) => (
                  <div key={idx} className="relative border border-slate-100 p-4 sm:p-6 rounded-2xl bg-white shadow-sm space-y-4 text-left">
                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudentField(idx)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <Icon name="delete" />
                      </button>
                    )}

                    <h4 className="font-label font-bold text-xs text-orange-600">Estudiante #{idx + 1}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`studentName_${idx}`} className="text-xs font-semibold text-slate-600">Nombre Completo</label>
                        <input
                          id={`studentName_${idx}`}
                          type="text"
                          placeholder="Ej. Lucas Martínez"
                          value={student.nombre}
                          onChange={(e) => handleStudentChange(idx, 'nombre', e.target.value)}
                          className="px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`studentDni_${idx}`} className="text-xs font-semibold text-slate-600">DNI</label>
                        <input
                          id={`studentDni_${idx}`}
                          type="text"
                          placeholder="Número de DNI"
                          value={student.dni}
                          onChange={(e) => handleStudentChange(idx, 'dni', e.target.value.replace(/\D/g, ''))}
                          className="px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`studentDob_${idx}`} className="text-xs font-semibold text-slate-600">Fecha de Nacimiento</label>
                        <input
                          id={`studentDob_${idx}`}
                          type="date"
                          value={student.fechaNacimiento}
                          onChange={(e) => handleStudentChange(idx, 'fechaNacimiento', e.target.value)}
                          className="px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`studentLevel_${idx}`} className="text-xs font-semibold text-slate-600">Nivel Educativo</label>
                        <select
                          id={`studentLevel_${idx}`}
                          value={student.nivel}
                          onChange={(e) => handleStudentChange(idx, 'nivel', e.target.value)}
                          className="px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-xs appearance-none"
                          required
                        >
                          <option value="inicial">Nivel Inicial</option>
                          <option value="primaria">Primaria</option>
                          <option value="secundaria">Secundaria</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`studentGender_${idx}`} className="text-xs font-semibold text-slate-600">Género</label>
                        <select
                          id={`studentGender_${idx}`}
                          value={student.genero || 'Masculino'}
                          onChange={(e) => handleStudentChange(idx, 'genero', e.target.value)}
                          className="px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-xs appearance-none"
                          required
                        >
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro / No Binario</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-500 font-bold bg-red-50 border border-red-100 p-3.5 rounded-xl text-center">{formError}</p>
            )}

            {/* Submit Buttons */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base rounded-full shadow-lg shadow-orange-600/10 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed border-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creando Cuentas y Vinculando...</span>
                </>
              ) : (
                <>
                  <Icon name="person_add" className="mr-2" />
                  <span>Crear Cuentas y Enviar Activación</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateAdminSubmit} className="space-y-8">
            {/* Personal Section */}
            <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-200/60 space-y-4 text-left">
              <h3 className="font-label font-bold text-xs uppercase tracking-widest text-slate-500">Datos del Personal / Administrativo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-600">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-600">DNI del Personal</label>
                  <input
                    type="text"
                    placeholder="Número de DNI"
                    value={adminDni}
                    onChange={(e) => setAdminDni(e.target.value.replace(/\D/g, ''))}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-600">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="juan.perez@ejemplo.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-600">Rol Institucional</label>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all text-sm appearance-none"
                    required
                  >
                    <option value="Staff">Docente / Staff</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="user_admin">Administrador General</option>
                  </select>
                </div>
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-500 font-bold bg-red-50 border border-red-100 p-3.5 rounded-xl text-center">{formError}</p>
            )}

            {/* Submit Buttons */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base rounded-full shadow-lg shadow-orange-600/10 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed border-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creando Cuenta...</span>
                </>
              ) : (
                <>
                  <Icon name="person_add" className="mr-2" />
                  <span>Crear Cuenta de Personal</span>
                </>
              )}
            </button>
          </form>

      </div>
{/* Success Reusable Modal */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          onSwitchToDashboard();
        }}
        title={successModalData.title}
        message={successModalData.message}
        buttonText="Excelente"
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />

    </>
  );
};

export default AdminCreationTab;
