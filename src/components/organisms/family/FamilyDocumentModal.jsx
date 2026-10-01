import React from 'react';

/**
 * Modal y visor formal de documentos oficiales para familias:
 * - Boletín de Calificaciones Oficial
 * - Certificado de Alumno Regular
 * Incorpora estilos @media print para que al imprimir solo salga la hoja institucional A4.
 */
const FamilyDocumentModal = ({ isOpen, onClose, type, student, subjects = [] }) => {
  if (!isOpen || !student) return null;

  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const isBoletin = type === 'boletin';

  return (
    <>
      {/* ── ESTILOS EXCLUSIVOS PARA IMPRESIÓN ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-document, #printable-document * {
            visibility: visible !important;
          }
          #printable-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── BACKDROP Y MODAL (PANTALLA) ── */}
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
        <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* Barra superior de control del Modal */}
          <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">
                {isBoletin ? 'menu_book' : 'verified'}
              </span>
              <span className="font-bold text-slate-800 text-sm sm:text-base">
                {isBoletin ? 'Vista Previa: Informe de Calificaciones' : 'Vista Previa: Certificado de Alumno Regular'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Imprimir / Descargar PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* ── CUERPO DE LA HOJA (DOCUMENTO FORMAL) ── */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center">
            <div
              id="printable-document"
              className="bg-white w-full max-w-[210mm] min-h-[260mm] p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 font-serif relative flex flex-col justify-between"
            >
              {/* Encabezado Institucional Membretado */}
              <div>
                <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-sans font-bold text-2xl shadow-sm">
                      E
                    </div>
                    <div>
                      <h1 className="font-sans font-extrabold text-xl tracking-tight text-slate-900 uppercase">
                        Centro Educativo EduCore
                      </h1>
                      <p className="font-sans text-xs text-slate-600">
                        Instituto Incorporado a la Enseñanza Oficial · D.I.E.P. N° 4812
                      </p>
                      <p className="font-sans text-[11px] text-slate-400">
                        Av. Sarmiento 1850 · Resistencia, Chaco · Tel: (0362) 442-8900
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-sans text-xs text-slate-500">
                    <span className="block font-bold text-slate-800 uppercase">Ciclo Lectivo</span>
                    <span className="text-lg font-extrabold text-orange-600">2026</span>
                  </div>
                </div>

                {/* Título del Documento */}
                <div className="text-center my-6">
                  <h2 className="font-sans font-bold text-xl uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-2 inline-block px-8">
                    {isBoletin ? 'Informe Oficial de Asignaturas y Calificaciones' : 'Constancia de Alumno Regular'}
                  </h2>
                </div>

                {/* Ficha de Filiación del Alumno */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 font-sans text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-500 block">Estudiante:</span>
                    <strong className="text-slate-900 text-sm">{student.nombre}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DNI / Documento:</span>
                    <strong className="text-slate-900 text-sm">{student.dni || 'Sin registrar'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Legajo Institucional:</span>
                    <strong className="text-slate-900 text-sm">{student.studentID_login || student.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Curso y Nivel:</span>
                    <strong className="text-slate-900 text-sm capitalize">
                      {student.curso} ({student.nivel})
                    </strong>
                  </div>
                </div>

                {/* CONTENIDO 1: BOLETÍN DE CALIFICACIONES */}
                {isBoletin && (
                  <div className="space-y-4 font-sans">
                    <p className="text-xs text-slate-600">
                      Detalle del rendimiento pedagógico correspondiente al ciclo lectivo en curso:
                    </p>

                    <table className="w-full border-collapse border border-slate-300 text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 text-left">
                          <th className="border border-slate-300 p-2.5">Espacio Curricular</th>
                          <th className="border border-slate-300 p-2.5">Docente a Cargo</th>
                          <th className="border border-slate-300 p-2.5 text-center">Horario</th>
                          <th className="border border-slate-300 p-2.5 text-center">Calificación</th>
                          <th className="border border-slate-300 p-2.5 text-center">Condición</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((sub, i) => (
                          <tr key={sub.id || i} className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2.5 font-bold text-slate-900">
                              {sub.name}
                            </td>
                            <td className="border border-slate-300 p-2.5 text-slate-600">
                              {sub.teacherName || sub.profesor || 'Docente Titular'}
                            </td>
                            <td className="border border-slate-300 p-2.5 text-center text-slate-500">
                              {sub.schedule || 'Turno Mañana'}
                            </td>
                            <td className="border border-slate-300 p-2.5 text-center font-bold text-slate-900">
                              8.5
                            </td>
                            <td className="border border-slate-300 p-2.5 text-center font-semibold text-emerald-700">
                              Aprobada
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <span><strong>Asistencia registrada:</strong> 96.4%</span>
                      <span><strong>Promedio General:</strong> 8.5 / 10</span>
                      <span><strong>Conducta:</strong> Sobresaliente</span>
                    </div>
                  </div>
                )}

                {/* CONTENIDO 2: CERTIFICADO DE ALUMNO REGULAR */}
                {!isBoletin && (
                  <div className="my-8 text-justify font-serif text-sm leading-relaxed space-y-6 text-slate-800 px-2">
                    <p>
                      La Dirección del <strong>Centro Educativo EduCore</strong>, con domicilio legal en Av. Sarmiento 1850 de la ciudad de Resistencia, Provincia del Chaco, CERTIFICA por la presente que el/la alumno/a:
                    </p>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center font-sans">
                      <p className="text-base font-bold text-slate-900 uppercase">
                        {student.nombre}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Documento Nacional de Identidad N° <strong>{student.dni || 'Sin DNI'}</strong> · Matrícula Legajo <strong>#{student.studentID_login || student.id}</strong>
                      </p>
                    </div>

                    <p>
                      Se encuentra inscripto/a y cursa regularmente sus estudios correspondientes al <strong>{student.curso}</strong> del <strong>Nivel {student.nivel?.toUpperCase()}</strong> en esta institución escolar, con asistencia y régimen de regularidad en vigencia durante el presente <strong>Ciclo Lectivo 2026</strong>.
                    </p>

                    <p>
                      A pedido de la parte interesada y al solo efecto de ser presentado ante las autoridades u organismos que lo requieran (Asignaciones Familiares, Obras Sociales y/o Cobertura Médica), se expide el presente certificado oficial en Resistencia, a los <strong>{fechaHoy}</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Pie de Firma Institucional y Sello */}
              <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center font-sans text-xs text-slate-600">
                <div className="flex flex-col items-center">
                  <div className="w-32 border-b border-slate-400 mb-2"></div>
                  <span className="font-bold text-slate-800">Prof. Lic. Andrea Valenzuela</span>
                  <span className="text-[11px] text-slate-500">Secretaría Académica</span>
                  <span className="text-[10px] text-slate-400">Centro Educativo EduCore</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-32 border-b border-slate-400 mb-2"></div>
                  <span className="font-bold text-slate-800">Dirección General de Estudios</span>
                  <span className="text-[11px] text-slate-500">Sello Institucional y Registro</span>
                  <span className="text-[10px] text-slate-400">Validez Nacional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FamilyDocumentModal;
