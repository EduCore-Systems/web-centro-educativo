import React, { useState } from 'react';
import Icon from '../../../atoms/Icon';
import CoursesManager from './CoursesManager';
import SubjectsManager from './SubjectsManager';
import SportsManager from './SportsManager';
import SchedulesManager from './SchedulesManager';

const AdminAcademicTab = () => {
  const [academicSubTab, setAcademicSubTab] = useState('courses');

  return (
    <div className="space-y-6">
      {/* Filters & Navigation Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Tab Navigation */}
        <div className="w-full md:w-auto overflow-x-auto">
          <div className="flex bg-slate-200/60 p-1.5 rounded-full border border-slate-200 min-w-max">
            <button
              onClick={() => setAcademicSubTab('courses')}
              className={`px-6 py-2 rounded-full font-label font-bold text-xs transition-all cursor-pointer border-none ${academicSubTab === 'courses'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
            >
              Cursos
            </button>
            <button
              onClick={() => setAcademicSubTab('subjects')}
              className={`px-6 py-2 rounded-full font-label font-bold text-xs transition-all cursor-pointer border-none ${academicSubTab === 'subjects'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
            >
              Materias
            </button>
            <button
              onClick={() => setAcademicSubTab('sports')}
              className={`px-6 py-2 rounded-full font-label font-bold text-xs transition-all cursor-pointer border-none ${academicSubTab === 'sports'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
            >
              Deportes
            </button>
            <button
              onClick={() => setAcademicSubTab('schedules')}
              className={`px-6 py-2 rounded-full font-label font-bold text-xs transition-all cursor-pointer border-none ${academicSubTab === 'schedules'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
            >
              Horarios
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl min-h-[500px]">
        {academicSubTab === 'courses' && (
          <CoursesManager />
        )}
        
        {academicSubTab === 'subjects' && (
          <SubjectsManager />
        )}

        {academicSubTab === 'sports' && (
          <SportsManager />
        )}

        {academicSubTab === 'schedules' && (
          <SchedulesManager />
        )}
      </div>
    </div>
  );
};

export default AdminAcademicTab;
