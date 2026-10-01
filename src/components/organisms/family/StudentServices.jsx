import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Deportes institucionales con días y horarios representativos
 */
const DEPORTES_DISPONIBLES = [
  { id: 'XjMjzVd0XVwv0jJSa24c', nombre: 'Fútbol Intercolegial', dias: 'Lunes y Miércoles · 17:00 hs', icon: 'sports_soccer' },
  { id: 'iv6ahBrUCK0WdhZSw68a', nombre: 'Básquetbol Juvenil', dias: 'Martes y Jueves · 16:30 hs', icon: 'sports_basketball' },
  { id: 'IX1EM4Ximi9OzrZXJcGB', nombre: 'Natación Formativa', dias: 'Sábados · 10:00 hs', icon: 'pool' },
  { id: 'GX6lOytYeT0iO9g5GZt5', nombre: 'Vóleibol Mixto', dias: 'Viernes · 16:00 hs', icon: 'sports_volleyball' },
  { id: '5lW9VLF6xaD7dMILDixr', nombre: 'Taller de Ajedrez', dias: 'Miércoles · 15:30 hs', icon: 'chess' },
  { id: 'p7RnwuVEKZ4SLRL5NusH', nombre: 'Atletismo y Pista', dias: 'Martes y Jueves · 17:30 hs', icon: 'sprint' },
];

/**
 * Rutas de Transporte disponibles en la institución
 */
const RUTAS_TRANSPORTE = [
  { id: '4J7lRQ51zVgvXEkFL1vv', nombre: 'Recorrido Norte (Av. Alvear - Sarmiento)' },
  { id: 'FH7u86JtSZHreMtGkNWd', nombre: 'Recorrido Sur (Av. Castelli - Barranqueras)' },
  { id: 'KjLdXKB0RV3e76HJ1awi', nombre: 'Recorrido Oeste (Fontana - Av. 25 de Mayo)' },
  { id: 'U4nEWD5XseWIdICr6w1g', nombre: 'Recorrido Este (Costanera - Corrientes)' },
  { id: 'none', nombre: 'No utiliza servicio de transporte' },
];

/**
 * StudentServices (Paso 4)
 * Gestión integral de Actividades Extracurriculares, Comedor y Transporte Escolar (RF-16 y RF-17).
 */
const StudentServices = ({ student, onStudentUpdated }) => {
  // Estado local para los deportes seleccionados (IDs)
  const [selectedSports, setSelectedSports] = useState([]);

  // Estado local para el comedor escolar
  const [usaComedor, setUsaComedor] = useState(false);

  // Estado local para la ruta de transporte
  const [transporteRecorrido, setTransporteRecorrido] = useState('none');

  // Estados de carga y feedback de guardado
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincronizar estados locales cada vez que cambia el alumno seleccionado
  useEffect(() => {
    if (student) {
      // Sincronizar deportes (array de IDs)
      setSelectedSports(Array.isArray(student.deportes) ? student.deportes : []);

      // Sincronizar comedor
      setUsaComedor(Boolean(student.usa_comedor || student.diningRoomEnabled));

      // Sincronizar transporte
      setTransporteRecorrido(student.transporte_recorrido || 'none');
      setSaveSuccess(false);
    }
  }, [student]);

  // Manejador del toggle de un deporte (RF-16: Regla de máx 2 deportes)
  const handleSportToggle = (sportId) => {
    if (selectedSports.includes(sportId)) {
      // Si ya está seleccionado, lo quitamos
      setSelectedSports(selectedSports.filter((id) => id !== sportId));
    } else {
      // Si no está seleccionado, verificamos que no supere el límite de 2
      if (selectedSports.length >= 2) {
        alert('Regla institucional: Un alumno solo puede inscribirse en un máximo de 2 deportes extracurriculares simultáneos.');
        return;
      }
      setSelectedSports([...selectedSports, sportId]);
    }
  };

  // Guardar los cambios en Firestore
  const handleSaveChanges = async () => {
    if (!student?.id) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const studentRef = doc(db, 'students', student.id);
      const updateData = {
        deportes: selectedSports,
        usa_comedor: usaComedor,
        diningRoomEnabled: usaComedor,
        transporte_recorrido: transporteRecorrido,
      };

      await updateDoc(studentRef, updateData);

      // Feedback visual de éxito
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);

      // Notificar al componente padre para refrescar la ficha del alumno
      if (onStudentUpdated) {
        onStudentUpdated({
          ...student,
          ...updateData,
        });
      }
    } catch (error) {
      console.error('Error al guardar servicios:', error);
      alert('Error al guardar los cambios. Intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const isLimitReached = selectedSports.length >= 2;

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-orange-500 text-2xl">sports_soccer</span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Servicios y Actividades Extracurriculares
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de talleres, alimentación y logística escolar de <strong className="text-slate-700">{student?.nombre}</strong>
          </p>
        </div>

        {/* Mensaje de éxito al guardar */}
        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
            Cambios guardados correctamente
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── COLUMNA 1: DEPORTES EXTRACURRICULARES (7 columnas en desktop) ── */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            {/* Título de la tarjeta y cupos */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>Deportes Extracurriculares</span>
                  <span className="text-[11px] text-slate-400 font-normal">(RF-16)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regla institucional: Máximo de 2 disciplinas simultáneas.
                </p>
              </div>

              {/* Indicador de Cupos */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap ${
                isLimitReached
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <span className="material-symbols-outlined text-xs">
                  {isLimitReached ? 'lock' : 'check'}
                </span>
                {selectedSports.length} / 2 Cupos
              </span>
            </div>

            {/* Barra de progreso de cupos */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isLimitReached
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 w-full'
                      : selectedSports.length === 1
                      ? 'bg-orange-400 w-1/2'
                      : 'w-0'
                  }`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{isLimitReached ? 'Límite reglamentario alcanzado' : 'Cupos disponibles'}</span>
                <span className={isLimitReached ? 'text-orange-600 font-semibold' : ''}>
                  {selectedSports.length === 2 ? '100% Ocupado' : selectedSports.length === 1 ? '50% Ocupado' : '0%'}
                </span>
              </div>
            </div>

            {/* Lista de Deportes */}
            <div className="space-y-2 pt-1">
              {DEPORTES_DISPONIBLES.map((sport) => {
                const isChecked = selectedSports.includes(sport.id);
                const isDisabled = !isChecked && isLimitReached;

                return (
                  <label
                    key={sport.id}
                    className={`
                      flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 select-none
                      ${isChecked
                        ? 'bg-orange-50/60 border-orange-200 text-slate-900 cursor-pointer shadow-xs'
                        : isDisabled
                        ? 'bg-slate-50/70 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => handleSportToggle(sport.id)}
                        className="w-4 h-4 rounded text-orange-500 accent-orange-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold block truncate">
                          {sport.nombre}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {sport.dias}
                        </span>
                      </div>
                    </div>

                    {/* Estado badge */}
                    {isChecked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold whitespace-nowrap">
                        Inscripto
                      </span>
                    ) : isDisabled ? (
                      <span className="text-[11px] text-slate-400 italic whitespace-nowrap">
                        Bloqueado
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        Disponible
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Para cambiar de disciplina, desmarque una de las actuales.</span>
          </div>
        </div>

        {/* ── COLUMNA 2: TRANSPORTE Y COMEDOR (5 columnas en desktop) ── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Tarjeta de Transporte Escolar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">directions_bus</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Transporte Escolar</h4>
                  <p className="text-xs text-slate-400">(RF-17)</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                transporteRecorrido && transporteRecorrido !== 'none'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {transporteRecorrido && transporteRecorrido !== 'none' ? 'Activo' : 'Sin servicio'}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">
                Recorrido Asignado
              </label>
              <div className="relative">
                <select
                  value={transporteRecorrido}
                  onChange={(e) => setTransporteRecorrido(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm text-slate-800 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                >
                  {RUTAS_TRANSPORTE.map((ruta) => (
                    <option key={ruta.id} value={ruta.id === 'none' ? 'none' : ruta.nombre}>
                      {ruta.nombre}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-slate-400 absolute right-3 top-2.5 pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
            </div>

            {/* Detalle informativo de la ruta */}
            {transporteRecorrido && transporteRecorrido !== 'none' && (
              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-xs space-y-1 text-slate-600 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Parada estimada:</span>
                  <strong className="text-slate-800">Puerta principal · 07:15 hs</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Móvil asignado:</span>
                  <strong className="text-slate-800">Unidad 04 (Carlos Chofer)</strong>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta de Comedor Escolar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">restaurant</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Comedor Escolar</h4>
                  <p className="text-xs text-slate-400">Almuerzo y colación saludable (RF-17)</p>
                </div>
              </div>

              {/* Modern Switch Toggle */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={usaComedor}
                  onChange={(e) => setUsaComedor(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-500" />
              </label>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all duration-200 ${
              usaComedor
                ? 'bg-amber-50/50 border-amber-100 text-slate-700'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {usaComedor ? 'Plan Nutricional Activo' : 'Servicio Inactivo'}
                </span>
                {usaComedor && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Mensual
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {usaComedor
                  ? 'Menú supervisado por nutricionistas del colegio. Incluye plato principal, postre y colación.'
                  : 'Active el interruptor si desea que el estudiante almuerce en las instalaciones.'}
              </p>
            </div>
          </div>

          {/* BOTÓN GENERAL PARA GUARDAR TODOS LOS CAMBIOS */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveChanges}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">
                {isSaving ? 'sync' : 'save'}
              </span>
              <span>{isSaving ? 'Guardando en Firebase...' : 'Guardar Servicios'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentServices;
