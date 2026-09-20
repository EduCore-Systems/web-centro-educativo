const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');

// 1. Add Import
content = content.replace(
  "import SuccessModal from '../components/molecules/SuccessModal';",
  "import SuccessModal from '../components/molecules/SuccessModal';\nimport AdminApprovalModal from '../components/organisms/admin/AdminApprovalModal';"
);

// 2. Remove state and predefinedCourses
const stateBlockToRemove = `  const [cursoAsignado, setCursoAsignado] = useState('');
  const [aprobacionError, setAprobacionError] = useState('');
  const [isAprobando, setIsAprobando] = useState(false);
  const [isCustomCurso, setIsCustomCurso] = useState(false);

  const predefinedCourses = {
    inicial: [
      'Sala de 3 Años - Mañana', 'Sala de 3 Años - Tarde',
      'Sala de 4 Años - Mañana', 'Sala de 4 Años - Tarde',
      'Sala de 5 Años - Mañana', 'Sala de 5 Años - Tarde'
    ],
    primaria: [
      '1° Grado A', '1° Grado B',
      '2° Grado A', '2° Grado B',
      '3° Grado A', '3° Grado B',
      '4° Grado A', '4° Grado B',
      '5° Grado A', '5° Grado B',
      '6° Grado A', '6° Grado B',
      '7° Grado A', '7° Grado B'
    ],
    secundaria: [
      '1° Año A', '1° Año B',
      '2° Año A', '2° Año B',
      '3° Año A', '3° Año B',
      '4° Año A', '4° Año B',
      '5° Año A', '5° Año B'
    ]
  };`;

const stateBlockReplacement = `  const [aprobacionError, setAprobacionError] = useState('');
  const [isAprobando, setIsAprobando] = useState(false);`;

content = content.replace(stateBlockToRemove, stateBlockReplacement);

// 3. Update handleAprobarSolicitud
content = content.replace(
  `  const handleAprobarSolicitud = async () => {
    // Validación: el curso es obligatorio antes de aprobar
    if (!cursoAsignado.trim()) {
      setAprobacionError('Debés asignar un curso antes de aprobar.');
      return;
    }
    setIsAprobando(true);
    setAprobacionError('');`,
  `  const handleAprobarSolicitud = async (cursoAsignado) => {
    setIsAprobando(true);
    setAprobacionError('');`
);

// 4. Update the end of handleAprobarSolicitud
content = content.replace(
  `      // Cerramos y actualizamos la vista
      setAprobandoSolicitud(null);
      setCursoAsignado('');
      fetchDashboardData();`,
  `      // Cerramos y actualizamos la vista
      setAprobandoSolicitud(null);
      fetchDashboardData();`
);

// 5. Replace the Modal JSX block in the render
const modalBlockStart = `{/* Modal de Aprobación de Solicitud */}`;
const modalBlockEnd = `)}

    </div>`;

const startIndex = content.indexOf(modalBlockStart);
if (startIndex !== -1) {
  let endIndex = content.indexOf(modalBlockEnd, startIndex);
  if (endIndex !== -1) {
    const replacement = `{/* Modal de Aprobación de Solicitud */}
      <AdminApprovalModal
        solicitud={aprobandoSolicitud}
        isAprobando={isAprobando}
        aprobacionError={aprobacionError}
        onClose={() => setAprobandoSolicitud(null)}
        onApprove={handleAprobarSolicitud}
      />\n\n    </div>`;
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex + modalBlockEnd.length);
  }
}

// 6. Remove the other references to setIsCustomCurso and setCursoAsignado in the table buttons
content = content.replace(
  `                                setAprobandoSolicitud(solicitud);
                                setCursoAsignado('');
                                setAprobacionError('');
                                setIsCustomCurso(false);`,
  `                                setAprobandoSolicitud(solicitud);
                                setAprobacionError('');`
);

fs.writeFileSync('src/pages/AdminPanel.jsx', content);
