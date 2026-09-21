import React from 'react';
import Icon from '../../../atoms/Icon';

const AdminReportsTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl min-h-[500px]">
        <div className="text-center p-12 text-slate-500">
          <Icon name="analytics" className="text-4xl mb-4 opacity-50" />
          <h3 className="font-bold text-lg mb-2">Módulo de Reportes</h3>
          <p>Cargando datos para generar reportes...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsTab;
