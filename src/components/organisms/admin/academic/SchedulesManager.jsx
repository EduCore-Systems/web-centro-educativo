import React, { useState, useEffect } from 'react';
import Icon from '../../../atoms/Icon';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getSubjects, getSports } from '../../../../services/academicService';

const SchedulesManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sports, setSports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  // Form state
  const [type, setType] = useState('subject'); // 'subject' or 'sport'
  const [referenceId, setReferenceId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Lunes');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [schedData, subjData, sportData] = await Promise.all([
        getSchedules(),
        getSubjects(),
        getSports()
      ]);
      setSchedules(schedData);
      setSubjects(subjData);
      setSports(sportData);
    } catch (err) {
      console.error("Error al cargar horarios:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (schedule = null) => {
    setError('');
    if (schedule) {
      setEditingSchedule(schedule);
      setType(schedule.type);
      setReferenceId(schedule.referenceId);
      setDayOfWeek(schedule.dayOfWeek);
      setStartTime(schedule.startTime);
      setEndTime(schedule.endTime);
    } else {
      setEditingSchedule(null);
      setType('subject');
      setReferenceId(subjects.length > 0 ? subjects[0].id : '');
      setDayOfWeek('Lunes');
      setStartTime('08:00');
      setEndTime('10:00');
    }
    setIsModalOpen(true);
  };

  // When type changes, reset the referenceId to the first available of the new type
  useEffect(() => {
    if (!editingSchedule) {
      if (type === 'subject' && subjects.length > 0) setReferenceId(subjects[0].id);
      if (type === 'sport' && sports.length > 0) setReferenceId(sports[0].id);
    }
  }, [type, subjects, sports, editingSchedule]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!referenceId) {
      setError('Debes seleccionar una Materia o Deporte.');
      return;
    }
    if (startTime >= endTime) {
      setError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduleData = { type, referenceId, dayOfWeek, startTime, endTime };
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleData);
      } else {
        await createSchedule(scheduleData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el horario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este horario?")) return;
    try {
      await deleteSchedule(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el horario.");
    }
  };

  const getReferenceName = (type, refId) => {
    if (type === 'subject') {
      const s = subjects.find(x => x.id === refId);
      return s ? s.name : 'Materia Eliminada';
    } else {
      const s = sports.find(x => x.id === refId);
      return s ? s.name : 'Deporte Eliminado';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-xl font-bold text-slate-800">Cronograma de Horarios</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-label font-bold text-sm transition-colors border-none cursor-pointer"
        >
          <Icon name="add" />
          <span>Nuevo Horario</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Icon name="sync" className="animate-spin text-4xl text-orange-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Día</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Horario</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Tipo</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Actividad</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No hay horarios registrados. Creá el primero.
                    </td>
                  </tr>
                ) : (
                  // Sort schedules logically (by day and then time, for simplicity we just map here)
                  schedules
                    .sort((a, b) => daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime))
                    .map((sched) => (
                    <tr key={sched.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{sched.dayOfWeek}</td>
                      <td className="p-4 text-slate-600">
                        {sched.startTime} - {sched.endTime}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${sched.type === 'subject' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {sched.type === 'subject' ? 'Materia' : 'Deporte'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {getReferenceName(sched.type, sched.referenceId)}
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(sched)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          onClick={() => handleDelete(sched.id)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Icon name="delete" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Creación/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-xl font-bold text-slate-800 flex items-center gap-2">
                <Icon name="schedule" className="text-orange-500" />
                {editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors cursor-pointer border-none"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Actividad</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                  >
                    <option value="subject">Materia (Académico)</option>
                    <option value="sport">Deporte</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Seleccionar {type === 'subject' ? 'Materia' : 'Deporte'}
                </label>
                <select
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                  required
                >
                  {type === 'subject' && subjects.length === 0 && <option value="">No hay materias creadas</option>}
                  {type === 'sport' && sports.length === 0 && <option value="">No hay deportes creados</option>}
                  
                  {type === 'subject' && subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  {type === 'sport' && sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Día de la semana</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                >
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hora Inicio</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hora Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg text-center border border-red-100">
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !referenceId}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors cursor-pointer border-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesManager;
