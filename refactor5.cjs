const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');

const sliceBlock = (startStr, endStr) => {
  const start = content.indexOf(startStr);
  if (start === -1) return '';
  const end = content.indexOf(endStr, start);
  if (end === -1) return '';
  const block = content.substring(start, end + endStr.length);
  content = content.substring(0, start) + content.substring(end + endStr.length);
  return block;
};

// 1. Extract State
const stateBlock = sliceBlock(
  "// Creation Type State ('parent_student' or 'administrative')",
  "const [adminRole, setAdminRole] = useState('Staff');\r\n"
);

// 2. Extract Submit State
const submitStateBlock = sliceBlock(
  "const [isSubmitting, setIsSubmitting] = useState(false);",
  "const [formError, setFormError] = useState('');\r\n"
);

// 3. Extract Handlers
const handlersBlock = sliceBlock(
  "// Método para enviar formulario de Creación",
  "setStudents(students.filter((_, i) => i !== index));\r\n  };\r\n"
);

// 4. Extract HTML
const startHtml = "{/* Creation Tab Content */}";
const endHtml = "        )}\r\n      </div>\r\n    )}\r\n";
const htmlStartIdx = content.indexOf(startHtml);
const htmlEndIdx = content.indexOf(endHtml, htmlStartIdx);
const rawHtmlBlock = content.substring(htmlStartIdx, htmlEndIdx + endHtml.length);
content = content.substring(0, htmlStartIdx) + `{/* Creation Tab Content */}
        {activeTab === 'create' && user?.role === 'user_admin' && (
          <AdminCreationTab onSwitchToDashboard={() => setActiveTab('dashboard')} />
        )}\n` + content.substring(htmlEndIdx + endHtml.length);

let cleanHtmlBlock = rawHtmlBlock
  .replace("{/* Creation Tab Content */}\r\n        {activeTab === 'create' && user?.role === 'user_admin' && (\r\n          <div className=\"bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl max-w-4xl mx-auto\">\r\n", "")
  .replace("        )}\r\n      </div>\r\n    )}\r\n", "");

// 5. Extract Success Modal
let successModalBlock = sliceBlock(
  "{/* Success Reusable Modal */}",
  "/>\r\n"
);

if (successModalBlock) {
  successModalBlock = successModalBlock.replace("setActiveTab('dashboard');", "onSwitchToDashboard();");
}

const finalComponent = `import React, { useState } from 'react';
import Icon from '../../atoms/Icon';
import SuccessModal from '../../molecules/SuccessModal';
import { auth } from '../../../services/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/app'; // Check if needed

const AdminCreationTab = ({ onSwitchToDashboard }) => {
${stateBlock}
${submitStateBlock}

${handlersBlock}

  return (
    <>
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xl max-w-4xl mx-auto">
${cleanHtmlBlock}
      </div>
${successModalBlock}
    </>
  );
};

export default AdminCreationTab;
`;

fs.writeFileSync('src/components/organisms/admin/AdminCreationTab.jsx', finalComponent);

// Add Import
if (!content.includes('AdminCreationTab')) {
  content = content.replace(
    "import AdminEditProfileModal from '../components/organisms/admin/AdminEditProfileModal';",
    "import AdminEditProfileModal from '../components/organisms/admin/AdminEditProfileModal';\nimport AdminCreationTab from '../components/organisms/admin/AdminCreationTab';"
  );
}

fs.writeFileSync('src/pages/AdminPanel.jsx', content);
console.log('Extraction complete');
