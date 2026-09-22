import React, { useState, useEffect } from 'react';
import Icon from '../../../atoms/Icon';
import { getStudents, updateStudentDining } from '../../../../services/additionalServices';

const DiningManager = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const studentsData = await getStudents();
      setStudents(studentsData);
    } catch (err) {
      console.error("Error al cargar alumnos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDining = async (studentId, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Actualización optimista local
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, diningRoomEnabled: newStatus } : s));
    
    try {
      await updateStudentDining(studentId, newStatus);
    } catch (error) {
      console.error("Error al actualizar comedor:", error);
      alert("Error de conexión al habilitar/deshabilitar comedor.");
      // Rollback en caso de error
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, diningRoomEnabled: currentStatus } : s));
    }
  };

  const filteredStudents = students.filter(s => 
    s.status !== 'pendiente' && 
    (s.nombre || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline text-xl font-bold text-slate-800">Servicio de Comedor</h3>
          <p className="text-sm text-slate-500 mt-1">Habilitá o deshabilitá el acceso al comedor para cada alumno.</p>
        </div>
        
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

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Icon name="sync" className="animate-spin text-4xl text-orange-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
                <tr className="border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Alumno</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Curso / Nivel</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-center">Estado del Servicio</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">
                      No se encontraron alumnos.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const isEnabled = !!student.diningRoomEnabled;
                    return (
                      <tr key={student.id} className={`transition-colors ${isEnabled ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 font-bold text-slate-800">{student.nombre}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {student.nivel}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {isEnabled ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                              <Icon name="restaurant" className="text-sm" />
                              Habilitado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                              <Icon name="block" className="text-sm" />
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleDining(student.id, isEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-none ${
                              isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
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
    </div>
  );
};

export default DiningManager;
