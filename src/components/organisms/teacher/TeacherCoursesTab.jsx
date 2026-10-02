import React, { useState, useMemo } from 'react';
import StudentRosterModal from './StudentRosterModal';

/**
 * TeacherCoursesTab (Fase 2: Mis Cursos y Materias)
 * Muestra el listado interactivo de asignaturas y cursos a cargo del docente.
 * Incluye filtros por nivel educativo, buscador rápido y accesos directos.
 */
const TeacherCoursesTab = ({ subjects = [], onTakeAttendance }) => {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalSubject, setModalSubject] = useState(null);

  // Filtrado reactivo por término y nivel escolar
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchLevel =
        selectedLevel === 'all' ||
        (sub.courseLevel && sub.courseLevel.toLowerCase() === selectedLevel.toLowerCase());

      const matchSearch =
        !searchTerm.trim() ||
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.courseName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchLevel && matchSearch;
    });
  }, [subjects, selectedLevel, searchTerm]);

  // Colores por nivel educativo
  const getLevelBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'inicial':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Nivel Inicial',
        };
      case 'primaria':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Nivel Primario',
        };
      case 'secundaria':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
          label: 'Nivel Secundario',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          label: 'Institucional',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filtro por Nivel */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedLevel('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'all'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({subjects.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel('inicial')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'inicial'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inicial
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel('primaria')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'primaria'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Primaria
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel('secundaria')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'secundaria'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Secundaria
          </button>
        </div>

        {/* Buscador de Materias */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar materia o curso..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Tarjetas de Cursos y Materias */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No se encontraron materias
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {searchTerm || selectedLevel !== 'all'
              ? 'Intenta modificando los filtros de búsqueda o nivel escolar.'
              : 'Aún no tienes asignaturas registradas para este ciclo lectivo.'}
          </p>
          {(searchTerm || selectedLevel !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedLevel('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Restablecer Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => {
            const levelInfo = getLevelBadge(subject.courseLevel);
            const studentCount = subject.studentsCount || (subject.students ? subject.students.length : 0);

            return (
              <div
                key={subject.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Parte Superior: Nivel y Curso */}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${levelInfo.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${levelInfo.dot}`}></span>
                      {levelInfo.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {subject.courseName}
                    </span>
                  </div>

                  {/* Título de la Materia */}
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-orange-600 transition-colors">
                    {subject.name}
                  </h3>

                  {/* Horarios asignados */}
                  <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <span className="material-symbols-outlined text-base text-orange-600 shrink-0 mt-0.5">
                      schedule
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold block text-slate-700">Días y Horarios:</span>
                      <span className="text-slate-500 leading-relaxed block">
                        {subject.schedules && subject.schedules.length > 0
                          ? subject.schedules.map((s) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(' · ')
                          : 'Horario institucional asignado'}
                      </span>
                    </div>
                  </div>

                  {/* Cantidad de Alumnos Matriculados */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {[0, 1, 2].slice(0, Math.min(studentCount, 3)).map((idx) => (
                          <div
                            key={idx}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-orange-100 text-orange-800 text-[10px] font-bold flex items-center justify-center"
                          >
                            {idx + 1}
                          </div>
                        ))}
                      </div>
                      <span className="text-slate-600 font-semibold">
                        {studentCount} {studentCount === 1 ? 'alumno' : 'alumnos'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModalSubject(subject)}
                      className="text-orange-600 hover:text-orange-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Ver nómina</span>
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                  </div>
                </div>

                {/* Botón de Acción Rápida: Tomar Asistencia */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onTakeAttendance(subject)}
                    className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">how_to_reg</span>
                    <span>Tomar Asistencia</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Nómina de Alumnos */}
      <StudentRosterModal
        isOpen={!!modalSubject}
        onClose={() => setModalSubject(null)}
        subject={modalSubject}
        onTakeAttendance={onTakeAttendance}
      />
    </div>
  );
};

export default TeacherCoursesTab;
