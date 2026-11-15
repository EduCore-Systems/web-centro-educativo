"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cf_triggerMonthlyRemindersManual = exports.cf_triggerDebtNotificationsManual = exports.cronDay20DebtReminder = exports.cronMonthlyTuitionReminder = void 0;
exports.isLastBusinessDay = isLastBusinessDay;
exports.executeDay20DebtNotificationProcess = executeDay20DebtNotificationProcess;
exports.executeMonthlyRemindersProcess = executeMonthlyRemindersProcess;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const email_1 = require("./email");
/**
 * Helper para verificar si hoy es el último día hábil del mes (Lunes a Viernes).
 */
function isLastBusinessDay(today = new Date()) {
    const currentMonth = today.getMonth();
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    // Si mañana es otro mes, hoy es el último día calendario
    const isMonthEnd = nextDay.getMonth() !== currentMonth;
    const dayOfWeek = today.getDay(); // 0 = Domingo, 6 = Sábado
    if (dayOfWeek === 0 || dayOfWeek === 6)
        return false;
    if (isMonthEnd)
        return true;
    // Si hoy es viernes y el fin de semana termina el mes
    if (dayOfWeek === 5) {
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + 1);
        const sunday = new Date(today);
        sunday.setDate(today.getDate() + 2);
        const monday = new Date(today);
        monday.setDate(today.getDate() + 3);
        return monday.getMonth() !== currentMonth;
    }
    return false;
}
/**
 * Plantilla HTML para Aviso de Deuda al día 20 (Funcionalidad 2 de la rúbrica)
 */
function renderDebtEmailTemplate({ parentName, studentName, amount, period, conceptDetails, }) {
    const formattedAmount = amount.toLocaleString('es-AR', { minimumFractionDigits: 2 });
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #ea580c; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Instituto Educativo EduCore</h2>
        <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Aviso Oficial de Deuda y Estado de Cobranzas · Día 20</p>
      </div>

      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p>Estimado/a tutor/a <strong>${parentName}</strong>,</p>
        
        <p>Le informamos que al día de la fecha (día 20 del mes) registramos un saldo pendiente de pago correspondiente a los aranceles escolares de su hijo/a <strong>${studentName}</strong> para el período <strong>${period}</strong>.</p>
        
        <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 14px; margin: 18px 0; border-radius: 4px;">
          <div style="font-size: 12px; color: #9a3412; font-weight: bold; text-transform: uppercase;">Importe Total en Mora:</div>
          <div style="font-size: 24px; color: #c2410c; font-weight: 800; margin-top: 4px;">$ ${formattedAmount}</div>
          ${conceptDetails ? `<div style="font-size: 12px; color: #64748b; margin-top: 6px;">Conceptos: ${conceptDetails}</div>` : ''}
        </div>

        <h3 style="font-size: 14px; color: #0f172a; margin-top: 20px;">Datos para Regularización mediante Transferencia Bancaria:</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-top: 8px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 35%;">Banco:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Banco Santander Río</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Titular:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Instituto Educativo EduCore</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">CUIT:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">30-71449201-8</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Alias CBU:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ea580c;">EDUCORE.CENTRO.PAGOS</td>
          </tr>
        </table>

        <p style="margin-top: 22px; font-size: 12px; color: #64748b;">
          Una vez realizada la transferencia, recuerde informar el pago adjuntando el comprobante correspondiente desde la <strong>Aplicación Móvil EduCore</strong> para asentar la acreditación en administración.
        </p>

        <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 24px;">
          Este correo ha sido generado automáticamente por el sistema de gestión administrativa escolar. Si ya realizó el pago en las últimas 48 hs, por favor desestime esta comunicación.
        </p>
      </div>
    </div>
  `;
}
/**
 * Plantilla HTML para Recordatorio Mensual con Factura (Funcionalidad 1 de la rúbrica)
 */
function renderMonthlyReminderTemplate({ parentName, studentName, period, baseTuition, diningAmount, transportAmount, sportsAmount, totalAmount, }) {
    const fmt = (n) => n.toLocaleString('es-AR', { minimumFractionDigits: 2 });
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Instituto Educativo EduCore</h2>
        <p style="margin: 5px 0 0; font-size: 13px; color: #94a3b8;">Liquidación Mensual de Aranceles · Período ${period}</p>
      </div>

      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p>Estimado/a tutor/a <strong>${parentName}</strong>,</p>
        <p>Ponemos a su disposición el detalle de la liquidación de aranceles correspondiente a su hijo/a <strong>${studentName}</strong> para el período <strong>${period}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
              <th style="padding: 10px;">Concepto</th>
              <th style="padding: 10px; text-align: right;">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px;">Cuota Mensual de Enseñanza Básica</td>
              <td style="padding: 10px; text-align: right; font-weight: 600;">$ ${fmt(baseTuition)}</td>
            </tr>
            ${diningAmount > 0 ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px;">Servicio de Comedor Escolar</td>
                <td style="padding: 10px; text-align: right; font-weight: 600;">$ ${fmt(diningAmount)}</td>
              </tr>
            ` : ''}
            ${transportAmount > 0 ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px;">Servicio de Transporte Escolar</td>
                <td style="padding: 10px; text-align: right; font-weight: 600;">$ ${fmt(transportAmount)}</td>
              </tr>
            ` : ''}
            ${sportsAmount > 0 ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px;">Actividades Deportivas / Extracurriculares</td>
                <td style="padding: 10px; text-align: right; font-weight: 600;">$ ${fmt(sportsAmount)}</td>
              </tr>
            ` : ''}
            <tr style="background-color: #fff7ed; font-size: 15px; font-weight: 800; color: #ea580c;">
              <td style="padding: 12px 10px;">TOTAL A ABONAR:</td>
              <td style="padding: 12px 10px; text-align: right;">$ ${fmt(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 12px; color: #64748b;">
          El primer vencimiento opera el día 10 del mes en curso. Podrá abonar y descargar su factura fiscal desde el Portal Web o la App Móvil EduCore.
        </p>
      </div>
    </div>
  `;
}
/**
 * ── AUTOMATIZACIÓN 1: Recordatorio Último Día Hábil (Funcionalidad 1) ──
 * Cron programado los días 28 a 31 a las 08:00 AM (Hora Argentina).
 */
exports.cronMonthlyTuitionReminder = (0, scheduler_1.onSchedule)({
    schedule: '0 8 28-31 * *',
    timeZone: 'America/Argentina/Buenos_Aires',
}, async (event) => {
    const today = new Date();
    if (!isLastBusinessDay(today)) {
        console.log('[cronMonthlyTuitionReminder] Hoy no es el último día hábil del mes. Omitiendo.');
        return;
    }
    console.log('[cronMonthlyTuitionReminder] Disparando recordatorio mensual de cuotas...');
    await executeMonthlyRemindersProcess();
});
/**
 * ── AUTOMATIZACIÓN 2: Aviso de Deuda el Día 20 de Cada Mes (Funcionalidad 2) ──
 * Cron programado a las 08:00 AM cada día 20 (Hora Argentina).
 */
exports.cronDay20DebtReminder = (0, scheduler_1.onSchedule)({
    schedule: '0 8 20 * *',
    timeZone: 'America/Argentina/Buenos_Aires',
}, async (event) => {
    console.log('[cronDay20DebtReminder] Iniciando envío automático de avisos de deuda día 20...');
    await executeDay20DebtNotificationProcess();
});
/**
 * Lógica central para procesar avisos de deuda del día 20.
 */
async function executeDay20DebtNotificationProcess() {
    const db = admin.firestore();
    const snap = await db.collection('payments').where('status', '==', 'pendiente').get();
    let sent = 0;
    const details = [];
    const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    for (const doc of snap.docs) {
        const payment = doc.data();
        const parentEmail = payment.parentEmail || payment.emailPadre;
        const parentName = payment.parentName || payment.nombrePadre || 'Tutor Responsable';
        const studentName = payment.studentName || payment.nombreAlumno || 'Estudiante';
        const totalAmount = payment.totalAmount || payment.monto || 0;
        const period = payment.period || 'Mes en curso';
        if (!parentEmail || totalAmount <= 0)
            continue;
        // Verificar si ya fue notificado en este mes para evitar duplicados
        const historyRef = db.collection('notifications_history');
        const existing = await historyRef
            .where('paymentId', '==', doc.id)
            .where('type', '==', 'deuda_dia_20')
            .where('monthKey', '==', currentMonthKey)
            .limit(1)
            .get();
        if (!existing.empty) {
            console.log(`[DebtNotice] El pago ${doc.id} ya fue notificado este mes.`);
            continue;
        }
        const html = renderDebtEmailTemplate({
            parentName,
            studentName,
            amount: totalAmount,
            period,
            conceptDetails: payment.conceptosDetalle || 'Aranceles curriculares y servicios activos',
        });
        try {
            await (0, email_1.sendEmail)({
                to: parentEmail,
                subject: `[EduCore] Aviso de Deuda al Día 20 · Alumno ${studentName}`,
                html,
            });
            await historyRef.add({
                paymentId: doc.id,
                type: 'deuda_dia_20',
                parentEmail,
                parentName,
                studentName,
                totalAmount,
                period,
                monthKey: currentMonthKey,
                sentAt: admin.firestore.Timestamp.now(),
                automated: true,
            });
            sent++;
            details.push({ paymentId: doc.id, parentEmail, studentName, amount: totalAmount });
        }
        catch (err) {
            console.error(`Error enviando aviso de deuda a ${parentEmail}:`, err);
        }
    }
    return { processed: snap.size, sent, details };
}
/**
 * Lógica central para procesar recordatorio mensual de cuotas.
 */
async function executeMonthlyRemindersProcess() {
    const db = admin.firestore();
    const snap = await db.collection('payments').get();
    let sent = 0;
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    for (const doc of snap.docs) {
        const payment = doc.data();
        const parentEmail = payment.parentEmail || payment.emailPadre;
        if (!parentEmail)
            continue;
        const html = renderMonthlyReminderTemplate({
            parentName: payment.parentName || 'Tutor Responsable',
            studentName: payment.studentName || 'Estudiante',
            period: payment.period || 'Próximo Período',
            baseTuition: payment.baseTuition || 85000,
            diningAmount: payment.diningAmount || 0,
            transportAmount: payment.transportAmount || 0,
            sportsAmount: payment.sportsAmount || 0,
            totalAmount: payment.totalAmount || 85000,
        });
        try {
            await (0, email_1.sendEmail)({
                to: parentEmail,
                subject: `[EduCore] Liquidación y Composición de Cuota Escolar · ${payment.studentName}`,
                html,
            });
            await db.collection('notifications_history').add({
                paymentId: doc.id,
                type: 'recordatorio_mensual',
                parentEmail,
                monthKey: currentMonthKey,
                sentAt: admin.firestore.Timestamp.now(),
                automated: true,
            });
            sent++;
        }
        catch (err) {
            console.error(`Error enviando recordatorio mensual a ${parentEmail}:`, err);
        }
    }
    return { processed: snap.size, sent };
}
/**
 * ── ENDPOINTS HTTP PARA DISPARO MANUAL Y AUDITORÍA EN DEMOSTRACIÓN ──
 */
exports.cf_triggerDebtNotificationsManual = (0, https_1.onRequest)({ cors: true, invoker: 'public' }, async (req, res) => {
    try {
        const result = await executeDay20DebtNotificationProcess();
        res.status(200).send({
            success: true,
            message: 'Automatización del Día 20 ejecutada correctamente.',
            ...result,
        });
    }
    catch (error) {
        console.error('Error en cf_triggerDebtNotificationsManual:', error);
        res.status(500).send({ error: error.message || 'Error interno.' });
    }
});
exports.cf_triggerMonthlyRemindersManual = (0, https_1.onRequest)({ cors: true, invoker: 'public' }, async (req, res) => {
    try {
        const result = await executeMonthlyRemindersProcess();
        res.status(200).send({
            success: true,
            message: 'Automatización de Recordatorio Mensual ejecutada correctamente.',
            ...result,
        });
    }
    catch (error) {
        console.error('Error en cf_triggerMonthlyRemindersManual:', error);
        res.status(500).send({ error: error.message || 'Error interno.' });
    }
});
//# sourceMappingURL=notifications.js.map