const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');

// Replace CRLF just in case
content = content.replace(/\r\n/g, '\n');

// Find the Create User button to add the Academic button right after it
const createButtonStr = `            {user?.role === 'user_admin' && (
              <button
                onClick={() => setActiveTab('create')}
                className={\`px-6 py-2.5 rounded-full font-label font-bold text-sm transition-all cursor-pointer \${activeTab === 'create'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900'
                  }\`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="person_add" className="text-lg" />
                  <span>Crear Usuarios</span>
                </div>
              </button>
            )}`;

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

if (content.includes(createButtonStr)) {
  content = content.replace(createButtonStr, createButtonStr + '\n' + academicButtonStr);
} else {
  console.log("Could not find createButtonStr");
}

// Add the rendering of AdminAcademicTab
const creationTabRenderStr = `        {activeTab === 'create' && user?.role === 'user_admin' && (
          <AdminCreationTab onSwitchToDashboard={() => setActiveTab('dashboard')} />
        )}`;

const academicTabRenderStr = `        {/* Academic Tab Content */}
        {activeTab === 'academic' && user?.role === 'user_admin' && (
          <AdminAcademicTab />
        )}`;

if (content.includes(creationTabRenderStr)) {
  content = content.replace(creationTabRenderStr, creationTabRenderStr + '\n\n' + academicTabRenderStr);
} else {
  console.log("Could not find creationTabRenderStr");
}

// Add import
const importCreationTab = "import AdminCreationTab from '../components/organisms/admin/AdminCreationTab';";
if (content.includes(importCreationTab)) {
  content = content.replace(importCreationTab, importCreationTab + "\nimport AdminAcademicTab from '../components/organisms/admin/academic/AdminAcademicTab';");
}

fs.writeFileSync('src/pages/AdminPanel.jsx', content);
