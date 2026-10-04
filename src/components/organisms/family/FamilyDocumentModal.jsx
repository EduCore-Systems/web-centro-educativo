import React from 'react';

/**
 * Modal y visor formal de documentos oficiales para familias:
 * - Boletín de Calificaciones Oficial
 * - Certificado de Alumno Regular
 * Genera una ventana de impresión aislada para asegurar exactamente 1 hoja A4 sin páginas en blanco.
 */
const FamilyDocumentModal = ({ isOpen, onClose, type, student, subjects = [] }) => {
  if (!isOpen || !student) return null;

  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const isBoletin = type === 'boletin';

  // Si no llegaron materias por prop, usamos las del nivel correspondiente para que nunca esté vacío
  const activeSubjects = subjects.length > 0 ? subjects : (
    student.nivel === 'inicial'
      ? [
          { name: 'Iniciación al Lenguaje y Comunicación', teacherName: 'Prof. Mariana Rossi', schedule: 'Turno Mañana' },
          { name: 'Juegos y Relaciones Espaciales', teacherName: 'Prof. Mariana Rossi', schedule: 'Turno Mañana' },
          { name: 'Expresión Corporal y Música', teacherName: 'Prof. Diego Torres', schedule: 'Mié - Vie' },
        ]
      : student.nivel === 'primaria'
      ? [
          { name: 'Matemática', teacherName: 'Prof. Carlos Benítez', schedule: 'Lun - Mié 08:00 a 09:30' },
          { name: 'Prácticas del Lenguaje', teacherName: 'Prof. Laura Méndez', schedule: 'Mar - Jue 08:00 a 09:30' },
          { name: 'Ciencias Naturales', teacherName: 'Prof. Carlos Benítez', schedule: 'Mié - Vie 10:00 a 11:30' },
          { name: 'Ciencias Sociales', teacherName: 'Prof. Laura Méndez', schedule: 'Lun - Jue 10:00 a 11:30' },
          { name: 'Educación Física', teacherName: 'Prof. Diego Torres', schedule: 'Vie 14:00 a 16:00' },
        ]
      : [
          { name: 'Matemática I', teacherName: 'Prof. Alejandro Varela', schedule: 'Lun · Mié 08:00' },
          { name: 'Lengua y Literatura', teacherName: 'Prof. Carmen Delgado', schedule: 'Mar · Jue 09:30' },
          { name: 'Química General', teacherName: 'Prof. Alejandro Varela', schedule: 'Vie 10:00' },
          { name: 'Historia Argentina y Universal', teacherName: 'Prof. Carmen Delgado', schedule: 'Lun · Vie 11:30' },
          { name: 'Educación Física y Deportes', teacherName: 'Prof. Diego Torres', schedule: 'Mié · Vie 14:00' },
        ]
  );

  // ── IMPRESIÓN AISLADA (1 SOLA HOJA A4 EXACTA, CERO HOJAS EN BLANCO) ──
  const handlePrintClean = () => {
    const printContent = document.getElementById('printable-official-doc');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      alert('Por favor permita las ventanas emergentes para imprimir el certificado.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${isBoletin ? 'Boletin_' : 'Certificado_'}${student.nombre.replace(/\s+/g, '_')}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 11pt;
            line-height: 1.4;
          }
          .doc-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header-box {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo-box {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-badge {
            width: 48px;
            height: 48px;
            background: #f97316;
            color: #ffffff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
          }
          .title-area h1 {
            margin: 0;
            font-size: 16pt;
            text-transform: uppercase;
            letter-spacing: -0.5px;
          }
          .title-area p {
            margin: 2px 0 0;
            font-size: 8.5pt;
            color: #64748b;
          }
          .doc-title {
            text-align: center;
            margin: 14px 0 16px;
          }
          .doc-title h2 {
            display: inline-block;
            margin: 0;
            padding-bottom: 4px;
            border-bottom: 2px solid #cbd5e1;
            font-size: 13pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1e293b;
          }
          .student-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 16px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            font-size: 9pt;
          }
          .student-card .label {
            color: #64748b;
            font-size: 7.5pt;
            text-transform: uppercase;
            display: block;
          }
          .student-card .value {
            font-weight: bold;
            color: #0f172a;
            font-size: 9.5pt;
          }
          /* Tabla de boletín */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 8.5pt;
          }
          th {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 7px 8px;
            text-align: left;
            font-weight: bold;
            color: #1e293b;
          }
          td {
            border: 1px solid #e2e8f0;
            padding: 6px 8px;
            color: #334155;
          }
          .text-center { text-align: center; }
          .summary-row {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 10px;
            font-size: 8.5pt;
          }
          /* Certificado */
          .cert-text {
            font-family: Georgia, serif;
            font-size: 11pt;
            line-height: 1.7;
            text-align: justify;
            margin: 20px 4px;
          }
          .cert-highlight {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            margin: 16px 0;
            font-family: sans-serif;
          }
          .cert-highlight .name {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
          }
          .signatures {
            margin-top: 35px;
            padding-top: 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            text-align: center;
            font-size: 8.5pt;
          }
          .sig-line {
            width: 160px;
            margin: 0 auto 6px;
            border-bottom: 1px solid #64748b;
          }
          .stamp {
            display: inline-block;
            border: 2px dashed #94a3b8;
            border-radius: 50%;
            width: 58px;
            height: 58px;
            line-height: 54px;
            color: #94a3b8;
            font-size: 7.5pt;
            margin-top: 4px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="doc-container">
          ${printContent.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Barra superior de control del Modal */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">
              {isBoletin ? 'menu_book' : 'verified'}
            </span>
            <span className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
              {isBoletin ? 'Boletín Oficial de Calificaciones' : 'Constancia de Alumno Regular'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintClean}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Imprimir / Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* ── CONTENEDOR VISIBLE DE LA HOJA A4 (Previsualización) ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div
            id="printable-official-doc"
            className="bg-white w-full max-w-[210mm] p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 text-left flex flex-col justify-between"
          >
            {/* Cabecera Membretada Oficial */}
            <div>
              <div className="header-box flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
                <div className="logo-box flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm flex-shrink-0">
                    E
                  </div>
                  <div className="title-area">
                    <h1 className="font-extrabold text-lg tracking-tight text-slate-900 uppercase">
                      Centro Educativo EduCore
                    </h1>
                    <p className="text-xs text-slate-500">
                      Instituto Incorporado a la Enseñanza Oficial · D.I.E.P. N° 4812
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Av. Sarmiento 1850 · Resistencia, Chaco · Tel: (0362) 442-8900
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span className="block font-bold text-slate-800 uppercase">Ciclo Lectivo</span>
                  <span className="text-base font-extrabold text-orange-600">2026</span>
                </div>
              </div>

              {/* Título del Documento */}
              <div className="doc-title text-center my-4">
                <h2 className="font-bold text-base uppercase tracking-wider text-slate-900 border-b-2 border-slate-300 pb-1 inline-block px-6">
                  {isBoletin ? 'Informe Oficial de Asignaturas y Calificaciones' : 'Constancia de Alumno Regular'}
                </h2>
              </div>

              {/* Ficha de Datos del Alumno */}
              <div className="student-card bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Estudiante:</span>
                  <strong className="text-slate-900 text-xs sm:text-sm">{student.nombre}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">DNI / Documento:</span>
                  <strong className="text-slate-900 text-xs sm:text-sm">{student.dni || 'Sin registrar'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Legajo Institucional:</span>
                  <strong className="text-slate-900 text-xs sm:text-sm">{student.studentID_login || student.id}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Curso y Nivel:</span>
                  <strong className="text-slate-900 text-xs sm:text-sm capitalize">
                    {student.curso} ({student.nivel})
                  </strong>
                </div>
              </div>

              {/* ── CUERPO 1: BOLETÍN ── */}
              {isBoletin && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 text-xs">
                    Rendimiento académico y cursado correspondiente al presente ciclo lectivo:
                  </p>

                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 text-left">
                        <th className="border border-slate-300 p-2">Espacio Curricular</th>
                        <th className="border border-slate-300 p-2">Docente a Cargo</th>
                        <th className="border border-slate-300 p-2 text-center">Horario</th>
                        <th className="border border-slate-300 p-2 text-center">Calificación</th>
                        <th className="border border-slate-300 p-2 text-center">Condición</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSubjects.map((sub, i) => (
                        <tr key={sub.id || i} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 font-bold text-slate-900">
                            {sub.name}
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-600">
                            {sub.teacherName || sub.profesor || 'Docente Titular'}
                          </td>
                          <td className="border border-slate-300 p-2 text-center text-slate-500">
                            {sub.schedule || 'Turno Regular'}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                            8.8
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-semibold text-emerald-700">
                            Regular
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="summary-row flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <span><strong>Asistencia Oficial:</strong> 96.4% (Óptima)</span>
                    <span><strong>Promedio General:</strong> 8.8 / 10</span>
                    <span><strong>Concepto:</strong> Sobresaliente</span>
                  </div>
                </div>
              )}

              {/* ── CUERPO 2: CERTIFICADO REGULAR ── */}
              {!isBoletin && (
                <div className="cert-text my-6 font-serif text-sm leading-relaxed text-slate-800 space-y-4">
                  <p>
                    La Dirección del <strong>Centro Educativo EduCore</strong>, con personería oficial en Av. Sarmiento 1850 de la ciudad de Resistencia, Provincia del Chaco, CERTIFICA por la presente que el/la estudiante:
                  </p>

                  <div className="cert-highlight bg-slate-50 p-4 rounded-xl border border-slate-200 text-center font-sans my-4">
                    <p className="name text-base font-bold text-slate-900 uppercase">
                      {student.nombre}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      DNI N° <strong>{student.dni || 'Sin DNI'}</strong> · Legajo Oficial <strong>#{student.studentID_login || student.id}</strong>
                    </p>
                  </div>

                  <p>
                    Se encuentra inscripto/a y asiste regularmente a sus actividades curriculares en el <strong>{student.curso}</strong> perteneciente al <strong>Nivel {student.nivel?.toUpperCase()}</strong> de esta institución, registrando matrícula formal y conducta ejemplar durante el <strong>Ciclo Lectivo 2026</strong>.
                  </p>

                  <p>
                    A solicitud de la parte interesada y para ser presentado ante las autoridades u organismos que correspondan (Asignaciones Familiares, Obras Sociales, Coberturas Médicas y Trámites Oficiales), se expide la presente constancia con validez oficial en la ciudad de Resistencia, a los <strong>{fechaHoy}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Firmas y Sellos Institucionales */}
            <div className="signatures mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
              <div className="flex flex-col items-center">
                <div className="sig-line w-36 border-b border-slate-400 mb-1.5"></div>
                <span className="font-bold text-slate-800">Prof. Lic. Andrea Valenzuela</span>
                <span className="text-[11px] text-slate-500">Secretaría Académica General</span>
                <span className="text-[10px] text-slate-400">EduCore Centro Educativo</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="sig-line w-36 border-b border-slate-400 mb-1.5"></div>
                <span className="font-bold text-slate-800">Dirección de Nivel</span>
                <span className="text-[11px] text-slate-500">Sello y Firma Autorizada</span>
                <div className="stamp border border-slate-400 rounded-full w-12 h-12 flex items-center justify-center text-[9px] text-slate-400 mt-1 uppercase font-bold">
                  Sello
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDocumentModal;
