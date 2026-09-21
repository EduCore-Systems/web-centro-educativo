import React, { useState, useEffect } from 'react';
import Icon from '../../../atoms/Icon';
import { getCourses, getSubjects, getSports, getSchedules } from '../../../../services/academicService';
import { getStudents, getTransportRoutes } from '../../../../services/additionalServices';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../services/firebase';

const AdminReportsTab = () => {
  const [reportType, setReportType] = useState('student');
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sports, setSports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Selections for Individual Reports
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        studentsData,
        coursesData,
        subjectsData,
        sportsData,
        schedulesData,
        routesData
      ] = await Promise.all([
        getStudents(),
        getCourses(),
        getSubjects(),
        getSports(),
        getSchedules(),
        getTransportRoutes()
      ]);

      const q = query(collection(db, 'users'), where('role', '==', 'Staff'));
      const tSnap = await getDocs(q);
      const teachersData = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setStudents(studentsData);
      setCourses(coursesData);
      setSubjects(subjectsData);
      setSports(sportsData);
      setSchedules(schedulesData);
      setRoutes(routesData);
      setTeachers(teachersData);
    } catch (err) {
      console.error("Error al cargar datos para reportes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Helpers for formatting ---
  const getCourseName = (id) => courses.find(c => c.id === id)?.name || 'N/A';
  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || 'N/A';
  const getSportName = (id) => sports.find(s => s.id === id)?.name || 'N/A';
  const getTeacherName = (id) => teachers.find(t => t.id === id)?.nombre || 'N/A';
  const getRouteName = (id) => routes.find(r => r.id === id)?.name || 'Sin Asignar';

  // --- RENDER REPORTE POR ALUMNO ---
  const renderStudentReport = () => {
    const student = students.find(s => s.id === selectedStudentId);
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Seleccionar Alumno
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none text-sm font-bold"
            >
              <option value="">-- Buscar Alumno --</option>
              {students.filter(s => s.status !== 'pendiente').map(s => (
                <option key={s.id} value={s.id}>{s.nombre} ({s.dni})</option>
              ))}
            </select>
          </div>
        </div>

        {student && (
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                {student.nombre.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">{student.nombre}</h4>
                <p className="text-sm text-slate-500">DNI: {student.dni} | Nivel: <span className="uppercase font-bold">{student.nivel}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Materias (Asumiendo que el alumno cursa todas las materias del nivel por defecto para este TP, o se puede ver por el curso asignado. Como no se hace inscripción a materia explícita en el TP sino a curso, mostraremos las del nivel) */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Icon name="menu_book" className="text-blue-500" /> Materias del Nivel
                </h5>
                <ul className="space-y-2">
                  {subjects.filter(sub => {
                    const c = courses.find(c => c.id === sub.courseId);
                    return c && c.level === student.nivel;
                  }).map(sub => (
                    <li key={sub.id} className="text-sm text-slate-600 flex justify-between">
                      <span className="font-bold">{sub.name}</span>
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">{getTeacherName(sub.teacherId)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deportes Inscriptos (Mock: asumimos que los que tienen su ID o nivel, pero para este caso listamos todos los deportes como info general si no hay tabla relacional) */}
              {/* Nota: En un sistema real habría una tabla pivot Alumno_Deporte. Como no la hicimos, mostramos info estática o deportes del profe */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Icon name="sports_soccer" className="text-emerald-500" /> Actividades
                </h5>
                <p className="text-sm text-slate-500 italic">Inscripción a deportes pendiente de tabla relacional.</p>
              </div>

              {/* Transporte */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Icon name="directions_bus" className="text-orange-500" /> Transporte
                </h5>
                <p className="text-sm font-bold text-slate-800">
                  {student.transportRouteId ? getRouteName(student.transportRouteId) : 'No utiliza transporte'}
                </p>
              </div>

              {/* Comedor */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Icon name="restaurant" className="text-red-500" /> Comedor
                </h5>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  {student.diningRoomEnabled ? (
                    <><span className="w-2 h-2 rounded-full bg-green-500"></span> Habilitado</>
                  ) : (
                    <><span className="w-2 h-2 rounded-full bg-slate-300"></span> No Habilitado</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- RENDER REPORTE POR DOCENTE ---
  const renderTeacherReport = () => {
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    
    // Calcular qué dicta
    const teacherSubjects = subjects.filter(s => s.teacherId === selectedTeacherId);
    const teacherSports = sports.filter(s => s.teacherId === selectedTeacherId);

    // Calcular horarios
    const mySchedules = schedules.filter(sch => {
      if (sch.type === 'subject') return teacherSubjects.some(s => s.id === sch.referenceId);
      if (sch.type === 'sport') return teacherSports.some(s => s.id === sch.referenceId);
      return false;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Seleccionar Docente
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none text-sm font-bold"
            >
              <option value="">-- Buscar Docente --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {teacher && (
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                {teacher.nombre.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">{teacher.nombre}</h4>
                <p className="text-sm text-slate-500">Rol: {teacher.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Icon name="assignment" className="text-blue-500" /> Cursos y Materias a cargo
                </h5>
                <ul className="space-y-2">
                  {teacherSubjects.length === 0 && <li className="text-sm text-slate-500">Ninguna materia asignada.</li>}
                  {teacherSubjects.map(sub => (
                    <li key={sub.id} className="text-sm text-slate-600">
                      <span className="font-bold">{sub.name}</span> en <span className="italic">{getCourseName(sub.courseId)}</span>
                    </li>
                  ))}
                  {teacherSports.map(sp => (
                    <li key={sp.id} className="text-sm text-emerald-600">
                      <span className="font-bold">Deporte:</span> {sp.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Icon name="schedule" className="text-orange-500" /> Cronograma (Horarios)
                </h5>
                <ul className="space-y-2">
                  {mySchedules.length === 0 && <li className="text-sm text-slate-500">Sin horarios registrados.</li>}
                  {mySchedules
                    .sort((a,b) => a.dayOfWeek.localeCompare(b.dayOfWeek))
                    .map(sch => (
                    <li key={sch.id} className="text-sm text-slate-700 flex justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold">{sch.dayOfWeek}</span>
                      <span>{sch.startTime} - {sch.endTime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controles de Reporte */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <Icon name="analytics" className="text-xl" />
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-slate-800">Generación de Reportes</h3>
              <p className="text-sm text-slate-500">Seleccioná el tipo de reporte que deseás visualizar</p>
            </div>
          </div>

          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setSelectedStudentId('');
              setSelectedTeacherId('');
            }}
            className="px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-orange-500 w-full md:w-auto"
          >
            <optgroup label="Reportes Individuales">
              <option value="student">1. Ficha por Alumno</option>
              <option value="teacher">2. Reporte por Docente</option>
            </optgroup>
            <optgroup label="Listados Agrupados (Pendiente)" disabled>
              <option value="course">3. Alumnos por Curso</option>
              <option value="subject">4. Alumnos por Materia</option>
              <option value="level">5. Docentes por Nivel</option>
              <option value="sport">6. Alumnos por Deporte</option>
              <option value="transport">7. Alumnos por Transporte</option>
            </optgroup>
          </select>
        </div>

        {/* CONTENIDO DEL REPORTE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Icon name="sync" className="animate-spin text-4xl mb-4 text-orange-500" />
            <p className="font-bold">Cruzando datos del sistema...</p>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {reportType === 'student' && renderStudentReport()}
            {reportType === 'teacher' && renderTeacherReport()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsTab;
