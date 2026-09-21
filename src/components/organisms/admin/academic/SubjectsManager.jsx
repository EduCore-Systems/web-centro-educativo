import React, { useState, useEffect } from 'react';
import Icon from '../../../atoms/Icon';
import { getSubjects, createSubject, updateSubject, deleteSubject, getCourses } from '../../../../services/academicService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../services/firebase';

const SubjectsManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Subjects
      const data = await getSubjects();
      setSubjects(data);

      // 2. Fetch Courses
      const cData = await getCourses();
      setCourses(cData);

      // 3. Fetch Teachers (Staff)
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

  const handleOpenModal = (subject = null) => {
    setError('');
    if (subject) {
      setEditingSubject(subject);
      setName(subject.name);
      setCourseId(subject.courseId);
      setTeacherId(subject.teacherId || '');
    } else {
      setEditingSubject(null);
      setName('');
      setCourseId(courses.length > 0 ? courses[0].id : '');
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
    
    if (!name.trim() || !courseId) {
      setError('El nombre y el curso son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const subjectData = { name, courseId, teacherId };
      if (editingSubject) {
        await updateSubject(editingSubject.id, subjectData);
      } else {
        await createSubject(subjectData);
      }
      await loadData(); // Reload all to see changes
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar la materia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta materia?")) return;
    try {
      await deleteSubject(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la materia.");
    }
  };

  const getCourseName = (cId) => {
    const c = courses.find(x => x.id === cId);
    return c ? c.name : 'Curso Eliminado';
  };

  const getTeacherName = (tId) => {
    if (!tId) return 'Sin asignar';
    const t = teachers.find(x => x.id === tId);
    return t ? t.nombre : 'Profesor Eliminado';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-xl font-bold text-slate-800">Materias Registradas</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-label font-bold text-sm transition-colors border-none cursor-pointer"
        >
          <Icon name="add" />
          <span>Nueva Materia</span>
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
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Materia</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Curso Asignado</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Profesor a cargo</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">
                      No hay materias registradas. Creá la primera.
                    </td>
                  </tr>
                ) : (
                  subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{sub.name}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                          {getCourseName(sub.courseId)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${sub.teacherId ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                          {getTeacherName(sub.teacherId)}
                        </span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(sub)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
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
                <Icon name="menu_book" className="text-orange-500" />
                {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre de la Materia</label>
                <input
                  type="text"
                  placeholder="Ej: Matemáticas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Curso al que pertenece</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                  required
                >
                  {courses.length === 0 && <option value="">No hay cursos creados</option>}
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profesor Asignado</label>
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
                  disabled={isSubmitting || courses.length === 0}
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

export default SubjectsManager;
