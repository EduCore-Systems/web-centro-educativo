const fs = require('fs');

let adminContent = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');

// Normalize to LF
adminContent = adminContent.replace(/\r\n/g, '\n');

// Find the handlers block
const startStr = "// Handler to call api cf_createParentAndStudents";
const endStr = "setStudents(updated);\n  };";

const startIdx = adminContent.indexOf(startStr);
const endIdx = adminContent.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const handlersBlock = adminContent.substring(startIdx, endIdx + endStr.length);
  
  // Remove handlers from AdminPanel.jsx
  adminContent = adminContent.substring(0, startIdx) + adminContent.substring(endIdx + endStr.length);
  fs.writeFileSync('src/pages/AdminPanel.jsx', adminContent);

  // Insert handlers into AdminCreationTab.jsx
  let tabContent = fs.readFileSync('src/components/organisms/admin/AdminCreationTab.jsx', 'utf8');
  
  tabContent = tabContent.replace(/\r\n/g, '\n');
  tabContent = tabContent.replace("import { getAuth, createUserWithEmailAndPassword } from 'firebase/app'; // Check if needed\n", "");

  // Insert handlers before the `return (`
  tabContent = tabContent.replace("  return (", handlersBlock + "\n\n  return (");
  
  fs.writeFileSync('src/components/organisms/admin/AdminCreationTab.jsx', tabContent);
  console.log("Handlers moved!");
} else {
  console.log("Could not find handlers block");
}
