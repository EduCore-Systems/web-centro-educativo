import React, { useState, useEffect } from 'react';
import Icon from '../../../atoms/Icon';
import { getSports, createSport, updateSport, deleteSport } from '../../../../services/academicService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../services/firebase';

const SportsManager = () => {
  const [sports, setSports] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Sports
      const data = await getSports();
      setSports(data);

      // 2. Fetch Teachers (Staff)
      const q = query(collection(db, 'users'), where('role', '==', 'Staff'));
      const tSnap = await getDocs(q);
      const tData = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(tData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (sport = null) => {
    setError('');
    if (sport) {
      setEditingSport(sport);
      setName(sport.name);
      setTeacherId(sport.teacherId || '');
    } else {
      setEditingSport(null);
      setName('');
      setTeacherId('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('El nombre del deporte es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sportData = { name, teacherId };
      if (editingSport) {
        await updateSport(editingSport.id, sportData);
      } else {
        await createSport(sportData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el deporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este deporte?")) return;
    try {
      await deleteSport(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el deporte.");
    }
  };

  const getTeacherName = (tId) => {
    if (!tId) return 'Sin asignar';
    const t = teachers.find(x => x.id === tId);
    return t ? t.nombre : 'Profesor Eliminado';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-xl font-bold text-slate-800">Deportes Registrados</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-label font-bold text-sm transition-colors border-none cursor-pointer"
        >
          <Icon name="add" />
          <span>Nuevo Deporte</span>
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
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Deporte</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Entrenador a cargo</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sports.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500">
                      No hay deportes registrados. Creá el primero.
                    </td>
                  </tr>
                ) : (
                  sports.map((sport) => (
                    <tr key={sport.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{sport.name}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${sport.teacherId ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                          {getTeacherName(sport.teacherId)}
                        </span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(sport)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          onClick={() => handleDelete(sport.id)}
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
                <Icon name="sports_soccer" className="text-orange-500" />
                {editingSport ? 'Editar Deporte' : 'Nuevo Deporte'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors cursor-pointer border-none"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Deporte</label>
                <input
                  type="text"
                  placeholder="Ej: Fútbol"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entrenador / Profesor</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                >
                  <option value="">Sin asignar / Pendiente</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
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
                  disabled={isSubmitting}
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

export default SportsManager;
