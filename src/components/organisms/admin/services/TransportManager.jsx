import React, { useState, useEffect } from 'react';
import Icon from '../../../atoms/Icon';
import { getTransportRoutes, createTransportRoute, updateTransportRoute, deleteTransportRoute, getStudents, updateStudentTransport } from '../../../../services/additionalServices';

const TransportManager = () => {
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Search for students
  const [studentSearch, setStudentSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [routesData, studentsData] = await Promise.all([
        getTransportRoutes(),
        getStudents()
      ]);
      setRoutes(routesData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Error al cargar datos de transporte:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (route = null) => {
    setError('');
    if (route) {
      setEditingRoute(route);
      setName(route.name);
      setCost(route.cost);
    } else {
      setEditingRoute(null);
      setName('');
      setCost('');
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
      setError('El nombre del recorrido es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const routeData = { name, cost: Number(cost) || 0 };
      if (editingRoute) {
        await updateTransportRoute(editingRoute.id, routeData);
      } else {
        await createTransportRoute(routeData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el recorrido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este recorrido? Los alumnos asignados a él quedarán sin recorrido.")) return;
    try {
      await deleteTransportRoute(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el recorrido.");
    }
  };

  const handleAssignTransport = async (studentId, routeId) => {
    try {
      await updateStudentTransport(studentId, routeId);
      // Actualizar estado local para que sea instantáneo sin recargar toda la BD
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, transportRouteId: routeId } : s));
    } catch (error) {
      console.error("Error asignando transporte:", error);
      alert("Error al asignar transporte al alumno.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.status !== 'pendiente' && 
    (s.nombre || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* SECCIÓN 1: RECORRIDOS */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-xl font-bold text-slate-800">Recorridos de Transporte</h3>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-label font-bold text-sm transition-colors border-none cursor-pointer"
          >
            <Icon name="add" />
            <span>Nuevo Recorrido</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <Icon name="sync" className="animate-spin text-3xl text-orange-500" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Recorrido</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Costo Mensual</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Pasajeros</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">
                        No hay recorridos registrados.
                      </td>
                    </tr>
                  ) : (
                    routes.map((route) => {
                      const pasajeros = students.filter(s => s.transportRouteId === route.id).length;
                      return (
                        <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                            <Icon name="directions_bus" className="text-slate-400" />
                            {route.name}
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-600">
                            ${route.cost}
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                              {pasajeros} alumnos
                            </span>
                          </td>
                          <td className="p-4 flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(route)}
                              className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Icon name="edit" />
                            </button>
                            <button
                              onClick={() => handleDelete(route.id)}
                              className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Icon name="delete" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <hr className="border-slate-100" />

      {/* SECCIÓN 2: ASIGNACIÓN DE ALUMNOS */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-headline text-xl font-bold text-slate-800">Asignación de Alumnos</h3>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all w-full md:w-64"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 shadow-sm">
                <tr className="border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Alumno</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Curso / Nivel</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Recorrido Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{student.nombre}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {student.nivel}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={student.transportRouteId || ''}
                        onChange={(e) => handleAssignTransport(student.id, e.target.value)}
                        className={`px-3 py-1.5 border-2 rounded-xl text-sm font-bold transition-all outline-none cursor-pointer ${
                          student.transportRouteId ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <option value="">No utiliza transporte</option>
                        {routes.map(r => (
                          <option key={r.id} value={r.id}>{r.name} (${r.cost})</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500">
                      No se encontraron alumnos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal de Creación/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-xl font-bold text-slate-800 flex items-center gap-2">
                <Icon name="directions_bus" className="text-orange-500" />
                {editingRoute ? 'Editar Recorrido' : 'Nuevo Recorrido'}
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Recorrido</label>
                <input
                  type="text"
                  placeholder="Ej: Recorrido Norte"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Costo Mensual ($)</label>
                <input
                  type="number"
                  placeholder="Ej: 50000"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
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

export default TransportManager;
