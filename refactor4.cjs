const fs = require('fs');

const adminPanelPath = 'src/pages/AdminPanel.jsx';
let content = fs.readFileSync(adminPanelPath, 'utf8');

content = content.replace(/\r\n/g, '\n');

// 1. Extract the state variables for the Create tab
const stateRegex = /\/\/ Creation Type State \('parent_student' or 'administrative'\)[\s\S]*?const \[adminRole, setAdminRole\] = useState\('Staff'\);\n/m;
const matchState = content.match(stateRegex);
const stateCode = matchState ? matchState[0] : '';
content = content.replace(stateRegex, '');

// Extract the submitting state
const submitStateRegex = /const \[isSubmitting, setIsSubmitting\] = useState\(false\);\n  const \[successModalOpen, setSuccessModalOpen\] = useState\(false\);\n  const \[successModalData, setSuccessModalData\] = useState\(\{ title: '', message: '' \}\);\n  const \[formError, setFormError\] = useState\(''\);\n/m;
const matchSubmitState = content.match(submitStateRegex);
const submitStateCode = matchSubmitState ? matchSubmitState[0] : '';
content = content.replace(submitStateRegex, '');

// Extract handlers
const handlersRegex = /\/\/ M.todo para enviar formulario de Creaci.n[\s\S]*?const handleRemoveStudentField = \(index\) => \{\n    setStudents\(students\.filter\(\(\_, i\) => i !== index\)\);\n  \};\n/m;
const matchHandlers = content.match(handlersRegex);
const handlersCode = matchHandlers ? matchHandlers[0] : '';
content = content.replace(handlersRegex, '');

// Extract HTML
const htmlRegex = /{\/\* Creation Tab Content \*\/}\n        {activeTab === 'create' && user\?\.role === 'user_admin' && \([\s\S]*?\)\n        \)}\n      <\/div>\n    \)}\n/m;
const matchHtml = content.match(htmlRegex);
let htmlCode = matchHtml ? matchHtml[0] : '';
content = content.replace(htmlRegex, `{/* Creation Tab Content */}
        {activeTab === 'create' && user?.role === 'user_admin' && (
          <AdminCreationTab onSwitchToDashboard={() => setActiveTab('dashboard')} />
        )}\n`);

// Extract Success Modal
const successModalRegex = /{\/\* Success Reusable Modal \*\/}[\s\S]*?\/>\n/m;
const matchSuccessModal = content.match(successModalRegex);
let successModalCode = matchSuccessModal ? matchSuccessModal[0] : '';
content = content.replace(successModalRegex, '');

// Update Success Modal logic in AdminCreationTab to use onSwitchToDashboard
successModalCode = successModalCode.replace(/setActiveTab\('dashboard'\);/, 'onSwitchToDashboard();');

// Assemble AdminCreationTab.jsx
const adminCreationTabCode = `import React, { useState } from 'react';
import Icon from '../../atoms/Icon';
import SuccessModal from '../../molecules/SuccessModal';
import { auth } from '../../../services/firebase';

const AdminCreationTab = ({ onSwitchToDashboard }) => {
${stateCode}
${submitStateCode}

${handlersCode}

  return (
    <>
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl max-w-4xl mx-auto">
${htmlCode.replace(/{\/\* Creation Tab Content \*\/}\n        {activeTab === 'create' && user\?\.role === 'user_admin' && \(\n          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl max-w-4xl mx-auto">\n/, '')
  .replace(/\)\n        \)}\n      <\/div>\n    \)}\n$/, '')}
      </div>
      ${successModalCode}
    </>
  );
};

export default AdminCreationTab;
`;

fs.writeFileSync('src/components/organisms/admin/AdminCreationTab.jsx', adminCreationTabCode);

// Add import to AdminPanel.jsx
content = content.replace(
  "import AdminEditProfileModal from '../components/organisms/admin/AdminEditProfileModal';",
  "import AdminEditProfileModal from '../components/organisms/admin/AdminEditProfileModal';\nimport AdminCreationTab from '../components/organisms/admin/AdminCreationTab';"
);

fs.writeFileSync('src/pages/AdminPanel.jsx', content);

console.log('Extraction complete');
