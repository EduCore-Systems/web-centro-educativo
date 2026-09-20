const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');

// Replace CRLF with LF just for matching, then we can convert back later if needed
content = content.replace(/\r\n/g, '\n');

// 1. Remove state
content = content.replace(
  /const \[cursoAsignado, setCursoAsignado\] = useState\(''\);\n  const \[aprobacionError, setAprobacionError\] = useState\(''\);\n  const \[isAprobando, setIsAprobando\] = useState\(false\);\n  const \[isCustomCurso, setIsCustomCurso\] = useState\(false\);[\s\S]*?secundaria: \[\n      '1° Año A', '1° Año B',\n      '2° Año A', '2° Año B',\n      '3° Año A', '3° Año B',\n      '4° Año A', '4° Año B',\n      '5° Año A', '5° Año B'\n    \]\n  };/m,
  `const [aprobacionError, setAprobacionError] = useState('');\n  const [isAprobando, setIsAprobando] = useState(false);`
);

// 2. Update handleAprobarSolicitud
content = content.replace(
  /const handleAprobarSolicitud = async \(\) => \{\n    \/\/ Validación: el curso es obligatorio antes de aprobar\n    if \(!cursoAsignado\.trim\(\)\) \{\n      setAprobacionError\('Debés asignar un curso antes de aprobar\.'\);\n      return;\n    \}\n    setIsAprobando\(true\);\n    setAprobacionError\(''\);/,
  `const handleAprobarSolicitud = async (cursoAsignado) => {\n    setIsAprobando(true);\n    setAprobacionError('');`
);

// 3. Update the end of handleAprobarSolicitud
content = content.replace(
  /\/\/ Cerramos y actualizamos la vista\n      setAprobandoSolicitud\(null\);\n      setCursoAsignado\(''\);\n      fetchDashboardData\(\);/,
  `// Cerramos y actualizamos la vista\n      setAprobandoSolicitud(null);\n      fetchDashboardData();`
);

// 4. Replace Modal Block
content = content.replace(
  /{\/\* Modal de Aprobación de Solicitud \*\/}[\s\S]*?Aprobar Solicitud[\s\S]*?Confirmar Aprobación[\s\S]*?<\/button>\n            <\/div>\n          <\/div>\n        <\/div>\n      \)}/m,
  `{/* Modal de Aprobación de Solicitud */}
      <AdminApprovalModal
        solicitud={aprobandoSolicitud}
        isAprobando={isAprobando}
        aprobacionError={aprobacionError}
        onClose={() => setAprobandoSolicitud(null)}
        onApprove={handleAprobarSolicitud}
      />`
);

// 5. Replace state calls in table
content = content.replace(
  /setAprobandoSolicitud\(solicitud\);\n                                setCursoAsignado\(''\);\n                                setAprobacionError\(''\);\n                                setIsCustomCurso\(false\);/g,
  `setAprobandoSolicitud(solicitud);\n                                setAprobacionError('');`
);

fs.writeFileSync('src/pages/AdminPanel.jsx', content);
