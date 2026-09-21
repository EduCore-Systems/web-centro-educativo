const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');

// Replace CRLF
content = content.replace(/\r\n/g, '\n');

const academicButtonStr = `            {user?.role === 'user_admin' && (
              <button
                onClick={() => setActiveTab('academic')}
                className={\`px-6 py-2.5 rounded-full font-label font-bold text-sm transition-all cursor-pointer \${activeTab === 'academic'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900'
                  }\`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="school" className="text-lg" />
                  <span>Gestión Académica</span>
                </div>
              </button>
            )}`;

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

if (content.includes(academicButtonStr)) {
  content = content.replace(academicButtonStr, academicButtonStr + '\n' + servicesButtonStr);
} else {
  console.log("Could not find academicButtonStr");
}

const academicTabRenderStr = `        {/* Academic Tab Content */}
        {activeTab === 'academic' && user?.role === 'user_admin' && (
          <AdminAcademicTab />
        )}`;

const servicesTabRenderStr = `        {/* Services Tab Content */}
        {activeTab === 'services' && user?.role === 'user_admin' && (
          <AdminServicesTab />
        )}`;

if (content.includes(academicTabRenderStr)) {
  content = content.replace(academicTabRenderStr, academicTabRenderStr + '\n\n' + servicesTabRenderStr);
} else {
  console.log("Could not find academicTabRenderStr");
}

const importAcademicTab = "import AdminAcademicTab from '../components/organisms/admin/academic/AdminAcademicTab';";
if (content.includes(importAcademicTab)) {
  content = content.replace(importAcademicTab, importAcademicTab + "\nimport AdminServicesTab from '../components/organisms/admin/services/AdminServicesTab';");
}

fs.writeFileSync('src/pages/AdminPanel.jsx', content);
