import React, { useState } from 'react';

const predefinedCourses = {
  inicial: [
    'Sala de 3 Años - Mañana', 'Sala de 3 Años - Tarde',
    'Sala de 4 Años - Mañana', 'Sala de 4 Años - Tarde',
    'Sala de 5 Años - Mañana', 'Sala de 5 Años - Tarde'
  ],
  primaria: [
    '1° Grado A', '1° Grado B',
    '2° Grado A', '2° Grado B',
    '3° Grado A', '3° Grado B',
    '4° Grado A', '4° Grado B',
    '5° Grado A', '5° Grado B',
    '6° Grado A', '6° Grado B',
    '7° Grado A', '7° Grado B'
  ],
  secundaria: [
    '1° Año A', '1° Año B',
    '2° Año A', '2° Año B',
    '3° Año A', '3° Año B',
    '4° Año A', '4° Año B',
    '5° Año A', '5° Año B'
  ]
};

const AdminApprovalModal = ({
  solicitud,
  onClose,
  onApprove,
  isAprobando,
  aprobacionError
}) => {
  const [cursoAsignado, setCursoAsignado] = useState('');
  const [isCustomCurso, setIsCustomCurso] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!solicitud) return null;

  const handleConfirm = () => {
    if (!cursoAsignado.trim()) {
      setLocalError('Debés asignar un curso antes de aprobar.');
      return;
    }
    setLocalError('');
    onApprove(cursoAsignado.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
        <h3 className="font-headline text-2xl font-bold text-slate-800 mb-1">
          Aprobar Solicitud
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Revisá los datos y asigná el curso para activar al alumno.
        </p>
        <div className="bg-slate-50 rounded-2xl p-4 space-y-1 mb-6 text-sm">
          <p><strong>Alumno:</strong> {solicitud.nombre} (DNI: {solicitud.dni})</p>
          <p><strong>Nivel:</strong> {solicitud.nivel?.toUpperCase()}</p>
          <p><strong>Tutor:</strong> {solicitud.nombreTutor}</p>
          <p><strong>Email tutor:</strong> {solicitud.emailPadre}</p>
          <p><strong>DNI tutor (será su contraseña inicial):</strong> {solicitud.dniTutor}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="cursoSelect">
            Curso asignado *
          </label>
          
          {!isCustomCurso ? (
            <select
              id="cursoSelect"
              value={cursoAsignado}
              onChange={(e) => {
                if (e.target.value === 'otro') {
                  setIsCustomCurso(true);
                  setCursoAsignado('');
                } else {
                  setCursoAsignado(e.target.value);
                }
              }}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm appearance-none mb-2"
            >
              <option value="" disabled>Seleccione un curso...</option>
              {solicitud?.nivel && predefinedCourses[solicitud.nivel]?.map((curso) => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
              <option value="otro">Otro (personalizado)...</option>
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                id="cursoCustom"
                placeholder="Ej: 3° Grado A, Sala de 4, 2° Año B"
                value={cursoAsignado}
                onChange={(e) => setCursoAsignado(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm"
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => {
                  setIsCustomCurso(false);
                  setCursoAsignado('');
                }}
                className="text-xs text-orange-600 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Volver a la lista de cursos
              </button>
            </div>
          )}
        </div>
        {(localError || aprobacionError) && (
          <p className="text-red-600 text-sm font-medium mb-4">{localError || aprobacionError}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isAprobando}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isAprobando}
            className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors cursor-pointer border-none disabled:opacity-60"
          >
            {isAprobando ? 'Procesando...' : '✓ Confirmar Aprobación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalModal;
