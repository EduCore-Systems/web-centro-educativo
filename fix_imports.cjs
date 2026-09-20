const fs = require('fs');
const file = 'src/components/organisms/admin/AdminCreationTab.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { getAuth, createUserWithEmailAndPassword } from 'firebase/app'; // Check if needed\r\n",
  ""
);

fs.writeFileSync(file, content);
