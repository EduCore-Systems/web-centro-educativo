import React, { useState } from 'react';
import Icon from '../../../atoms/Icon';

const AdminServicesTab = () => {
  const [servicesSubTab, setServicesSubTab] = useState('transport');

  return (
    <div className="space-y-6">
      {/* Filters & Navigation Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Tab Navigation */}
        <div className="w-full md:w-auto overflow-x-auto">
          <div className="flex bg-slate-200/60 p-1.5 rounded-full border border-slate-200 min-w-max">
            <button
              onClick={() => setServicesSubTab('transport')}
              className={`px-6 py-2 rounded-full font-label font-bold text-xs transition-all cursor-pointer border-none ${servicesSubTab === 'transport'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
            >
              Transporte
            </button>
            <button
              onClick={() => setServicesSubTab('dining')}
              className={`px-6 py-2 rounded-full font-label font-bold text-xs transition-all cursor-pointer border-none ${servicesSubTab === 'dining'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
            >
              Comedor
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl min-h-[500px]">
        {servicesSubTab === 'transport' && (
          <div className="text-center p-12 text-slate-500">
            <Icon name="directions_bus" className="text-4xl mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">Gestión de Transporte</h3>
            <p>Aquí construiremos los recorridos y la asignación de alumnos.</p>
          </div>
        )}
        
        {servicesSubTab === 'dining' && (
          <div className="text-center p-12 text-slate-500">
            <Icon name="restaurant" className="text-4xl mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">Gestión de Comedor</h3>
            <p>Aquí gestionaremos la habilitación de alumnos al comedor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServicesTab;
