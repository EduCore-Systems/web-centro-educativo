import React, { useState } from 'react';
import Icon from '../../../atoms/Icon';
import TransportManager from './TransportManager';
import DiningManager from './DiningManager';

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
          <TransportManager />
        )}
        
        {servicesSubTab === 'dining' && (
          <DiningManager />
        )}
      </div>
    </div>
  );
};

export default AdminServicesTab;
