const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

const servicesButtonStr = `            {user?.role === 'user_admin' && (
              <button
                onClick={() => setActiveTab('services')}
                className={\`px-6 py-2.5 rounded-full font-label font-bold text-sm transition-all cursor-pointer \${activeTab === 'services'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900'
                  }\`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="restaurant" className="text-lg" />
                  <span>Servicios</span>
                </div>
              </button>
            )}`;

const reportsButtonStr = `            {user?.role === 'user_admin' && (
              <button
                onClick={() => setActiveTab('reports')}
                className={\`px-6 py-2.5 rounded-full font-label font-bold text-sm transition-all cursor-pointer \${activeTab === 'reports'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900'
                  }\`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="analytics" className="text-lg" />
                  <span>Reportes</span>
                </div>
              </button>
            )}`;

if (content.includes(servicesButtonStr)) {
  content = content.replace(servicesButtonStr, servicesButtonStr + '\n' + reportsButtonStr);
} else {
  console.log("Could not find servicesButtonStr");
}

const servicesTabRenderStr = `        {/* Services Tab Content */}
        {activeTab === 'services' && user?.role === 'user_admin' && (
          <AdminServicesTab />
        )}`;

const reportsTabRenderStr = `        {/* Reports Tab Content */}
        {activeTab === 'reports' && user?.role === 'user_admin' && (
          <AdminReportsTab />
        )}`;

if (content.includes(servicesTabRenderStr)) {
  content = content.replace(servicesTabRenderStr, servicesTabRenderStr + '\n\n' + reportsTabRenderStr);
} else {
  console.log("Could not find servicesTabRenderStr");
}

const importServicesTab = "import AdminServicesTab from '../components/organisms/admin/services/AdminServicesTab';";
if (content.includes(importServicesTab)) {
  content = content.replace(importServicesTab, importServicesTab + "\nimport AdminReportsTab from '../components/organisms/admin/reports/AdminReportsTab';");
}

fs.writeFileSync('src/pages/AdminPanel.jsx', content);
