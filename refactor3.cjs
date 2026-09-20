const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');

// Replace CRLF with LF just for matching
content = content.replace(/\r\n/g, '\n');

// 1. Add Import
content = content.replace(
  "import AdminApprovalModal from '../components/organisms/admin/AdminApprovalModal';",
  "import AdminApprovalModal from '../components/organisms/admin/AdminApprovalModal';\nimport AdminEditProfileModal from '../components/organisms/admin/AdminEditProfileModal';"
);

// 2. Replace the giant Modal block
const regex = /{\/\* Modal de Edición de Datos \*\/}[\s\S]*?Guardar Cambios\n            <\/button>\n          <\/div>\n        <\/form>\n          <\/div>\n        <\/div>\n      \)}/m;

const replacement = `{/* Modal de Edición de Datos */}
      <AdminEditProfileModal
        editingUser={editingUser}
        onClose={() => setEditingUser(null)}
        onChangeField={handleEditFieldChange}
        onSubmit={handleEditSubmit}
      />`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/pages/AdminPanel.jsx', content);
