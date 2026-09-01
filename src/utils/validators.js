/**
 * Módulo de validaciones reutilizables del sistema
 */

/**
 * Valida los campos del formulario de postulación laboral
 * @param {Object} camposPostulacion Datos del formulario
 * @param {File|null} archivoCV Archivo PDF adjunto
 * @returns {Object} Errores encontrados
 */
export const validarFormularioEmpleo = (camposPostulacion, archivoCV) => {
    const erroresValidacion = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!camposPostulacion.name?.trim()) {
        erroresValidacion.name = 'El nombre completo es requerido.';
    } else if (camposPostulacion.name.trim().length < 3) {
        erroresValidacion.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!camposPostulacion.email) {
        erroresValidacion.email = 'El correo electrónico es requerido.';
    } else if (!emailRegex.test(camposPostulacion.email)) {
        erroresValidacion.email = 'Por favor, introduce un correo electrónico válido.';
    }

    if (!camposPostulacion.area) {
        erroresValidacion.area = 'Debes seleccionar un área de interés principal.';
    }

    if (!archivoCV) {
        erroresValidacion.cv = 'Debes adjuntar tu currículum (PDF).';
    }

    if (!camposPostulacion.privacy) {
        erroresValidacion.privacy = 'Debes aceptar las políticas de privacidad para continuar.';
    }

    return erroresValidacion;
};

/**
 * Valida los datos de contacto y visita para Levels y Gallery
 * @param {Object} datos Datos de contacto
 * @returns {Object} Errores encontrados
 */
export const validarDatosContacto = (datos) => {
    const errores = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!datos.nombre?.trim()) {
        errores.nombre = 'El nombre es obligatorio.';
    }
    if (!datos.email || !emailRegex.test(datos.email)) {
        errores.email = 'Email inválido.';
    }
    if (!datos.telefono || datos.telefono.length < 6) {
        errores.telefono = 'Teléfono inválido.';
    }
    return errores;
};
