import React, { useState, useEffect } from 'react';
import Icon from '../../../atoms/Icon';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../../../services/academicService';

const CoursesManager = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Form state
  const [level, setLevel] = useState('secundaria');
  const [grade, setGrade] = useState('1° Año');
  const [division, setDivision] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error("Error al cargar cursos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Ajustar el grado por defecto si cambia el nivel
  useEffect(() => {
    if (level === 'inicial' && !grade.startsWith('Sala')) setGrade('Sala de 4');
    if (level === 'primaria' && !grade.includes('Grado')) setGrade('1° Grado');
    if (level === 'secundaria' && !grade.includes('Año')) setGrade('1° Año');
  }, [level, grade]);

  const handleOpenModal = (course = null) => {
    setError('');
    if (course) {
      setEditingCourse(course);
      setLevel(course.level);
      const parts = course.name.split(' ');
      setDivision(parts.pop() || 'A');
      setGrade(parts.join(' ') || '1° Año');
    } else {
      setEditingCourse(null);
      setLevel('secundaria');
      setGrade('1° Año');
      setDivision('A');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const name = `${grade} ${division}`;

    setIsSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, { name, level });
      } else {
        await createCourse({ name, level });
      }
      await fetchCourses();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el curso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este curso?")) return;
    try {
      await deleteCourse(id);
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el curso.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-xl font-bold text-slate-800">Cursos Registrados</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-label font-bold text-sm transition-colors border-none cursor-pointer"
        >
          <Icon name="add" />
          <span>Nuevo Curso</span>
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
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Nombre del Curso</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Nivel</th>
                  <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500">
                      No hay cursos registrados. Creá el primero.
                    </td>
                  </tr>
                ) : (
                  [...courses]
                    .sort((a, b) => {
                      const levelOrder = { inicial: 1, primaria: 2, secundaria: 3 };
                      if (levelOrder[a.level] !== levelOrder[b.level]) {
                        return levelOrder[a.level] - levelOrder[b.level];
                      }
                      return a.name.localeCompare(b.name);
                    })
                    .map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{course.name}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {course.level}
                        </span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(course)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer border-none"
                          title="Editar"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-lg transition-colors cursor-pointer border-none"
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
                <Icon name="class" className="text-orange-500" />
                {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nivel Educativo</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                  required
                >
                  <option value="inicial">Inicial</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Año / Grado</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                    required
                  >
                    {level === 'inicial' && (
                      <>
                        <option value="Sala de 3">Sala de 3</option>
                        <option value="Sala de 4">Sala de 4</option>
                        <option value="Sala de 5">Sala de 5</option>
                      </>
                    )}
                    {level === 'primaria' && (
                      <>
                        <option value="1° Grado">1° Grado</option>
                        <option value="2° Grado">2° Grado</option>
                        <option value="3° Grado">3° Grado</option>
                        <option value="4° Grado">4° Grado</option>
                        <option value="5° Grado">5° Grado</option>
                        <option value="6° Grado">6° Grado</option>
                        <option value="7° Grado">7° Grado</option>
                      </>
                    )}
                    {level === 'secundaria' && (
                      <>
                        <option value="1° Año">1° Año</option>
                        <option value="2° Año">2° Año</option>
                        <option value="3° Año">3° Año</option>
                        <option value="4° Año">4° Año</option>
                        <option value="5° Año">5° Año</option>
                        <option value="6° Año">6° Año</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5 w-1/3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">División</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                  <Icon name="error" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-4 border-none cursor-pointer"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Curso'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManager;
