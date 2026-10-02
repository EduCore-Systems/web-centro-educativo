import React, { useState, useEffect } from 'react';
import { db } from '../../../../services/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * AdminFinancialReport (RF-08)
 * Panel de Control Financiero y Morosidad para el Administrador:
 * - KPIs de Recaudación (Facturado, Cobrado, Pendiente, Tasa de Cobro)
 * - Desglose de ingresos por concepto (Cuota base, Comedor, Transporte, Deportes)
 * - Nómina de estudiantes con estado de pago y acción de Notificación de Deuda (RF-06/07)
 */
const AdminFinancialReport = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'pagado' | 'pendiente'
  const [levelFilter, setLevelFilter] = useState('todos');   // 'todos' | 'inicial' | 'primaria' | 'secundaria'
  const [notifiedStudents, setNotifiedStudents] = useState({});

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'payments'));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPayments(data);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulación formal de envío de correo de aviso de deuda al tutor (RF-06 / RF-07)
  const handleNotifyDebt = async (payment) => {
    setNotifiedStudents((prev) => ({ ...prev, [payment.id]: 'enviando' }));

    // Simulamos latencia de red y envío de correo vía backend
    setTimeout(() => {
      setNotifiedStudents((prev) => ({ ...prev, [payment.id]: 'enviado' }));
      alert(
        `Aviso de deuda enviado correctamente a ${payment.parentEmail || 'tutor'}.\nEstudiante: ${payment.studentName}\nImporte adeudado: $${payment.totalAmount.toLocaleString('es-AR')}`
      );
    }, 700);
  };

  // Marcar como pagado manualmente si el padre pagó en secretaría
  const handleMarkAsPaid = async (paymentId) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: 'pagado',
        paidAt: new Date().toLocaleDateString('es-AR') + ' (Presencial)',
        paymentMethod: 'Efectivo / Caja Escolar',
      });
      fetchPayments();
    } catch (err) {
      console.error('Error al registrar cobro:', err);
    }
  };

  // --- CÁLCULOS FINANCIEROS GLOBALES ---
  const totalFacturado = payments.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalCobrado = payments
    .filter((p) => p.status === 'pagado')
    .reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPendiente = payments
    .filter((p) => p.status === 'pendiente')
    .reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const tasaCobranza = totalFacturado > 0 ? ((totalCobrado / totalFacturado) * 100).toFixed(1) : 0;

  // Desglose por concepto
  const totalComedor = payments.reduce((acc, p) => acc + (p.diningAmount || 0), 0);
  const totalTransporte = payments.reduce((acc, p) => acc + (p.transportAmount || 0), 0);
  const totalDeportes = payments.reduce((acc, p) => acc + (p.sportsAmount || 0), 0);
  const totalCuotaBase = payments.reduce((acc, p) => acc + (p.baseTuition || 0), 0);

  // Filtrado de la nómina
  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    const matchesLevel = levelFilter === 'todos' || (p.nivel || '').toLowerCase() === levelFilter;
    return matchesStatus && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-orange-500">
          sync
        </span>
        <p className="font-bold text-sm">Procesando balance financiero institucional...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── TARJETAS DE KPIS FINANCIEROS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Facturación Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Facturación Mes
            </span>
            <span className="text-xl font-extrabold text-slate-900 block truncate">
              ${totalFacturado.toLocaleString('es-AR')}
            </span>
            <span className="text-[10px] text-slate-400">11 Cuotas emitidas</span>
          </div>
        </div>

        {/* KPI 2: Recaudación Percibida */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Total Cobrado
            </span>
            <span className="text-xl font-extrabold text-emerald-700 block truncate">
              ${totalCobrado.toLocaleString('es-AR')}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {payments.filter((p) => p.status === 'pagado').length} Alumnos al día
            </span>
          </div>
        </div>

        {/* KPI 3: Saldo Pendiente (Morosidad) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              Saldo en Mora
            </span>
            <span className="text-xl font-extrabold text-rose-700 block truncate">
              ${totalPendiente.toLocaleString('es-AR')}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">
              {payments.filter((p) => p.status === 'pendiente').length} Cuotas impagas
            </span>
          </div>
        </div>

        {/* KPI 4: Tasa de Cobranza */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">donut_large</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">
              Efectividad de Cobro
            </span>
            <span className="text-xl font-extrabold text-orange-600 block">
              {tasaCobranza}%
            </span>
            <span className="text-[10px] text-slate-400">Meta mensual: 80%</span>
          </div>
        </div>
      </div>

      {/* ── DESGLOSE DE INGRESOS POR CONCEPTO ── */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-base">pie_chart</span>
            <span>Composición de Ingresos Institucionales</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">Ciclo Octubre 2026</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cuota Pedagógica</span>
            <strong className="text-sm text-slate-900 block mt-0.5">${totalCuotaBase.toLocaleString('es-AR')}</strong>
            <span className="text-[10px] text-slate-500">Base obligatoria</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-amber-600 block text-[10px] uppercase font-bold">Comedor Escolar</span>
            <strong className="text-sm text-slate-900 block mt-0.5">${totalComedor.toLocaleString('es-AR')}</strong>
            <span className="text-[10px] text-slate-500">Plan nutricional</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-sky-600 block text-[10px] uppercase font-bold">Transporte</span>
            <strong className="text-sm text-slate-900 block mt-0.5">${totalTransporte.toLocaleString('es-AR')}</strong>
            <span className="text-[10px] text-slate-500">Logística de micros</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-emerald-600 block text-[10px] uppercase font-bold">Talleres Deportivos</span>
            <strong className="text-sm text-slate-900 block mt-0.5">${totalDeportes.toLocaleString('es-AR')}</strong>
            <span className="text-[10px] text-slate-500">Actividades extracurriculares</span>
          </div>
        </div>
      </div>

      {/* ── TABLA DE CONTROL DE PAGOS Y MOROSIDAD ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              Nómina de Cobranzas y Estado de Alumnos
            </h4>
            <p className="text-xs text-slate-500">
              Listado detallado con acceso a recordatorios de pago por correo a los tutores.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pagado">✓ Al Día (Pagado)</option>
              <option value="pendiente">⚠️ En Mora (Pendiente)</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="todos">Todos los Niveles</option>
              <option value="inicial">Inicial</option>
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>
        </div>

        {/* Tabla Responsive */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <th className="p-3.5">Estudiante</th>
                <th className="p-3.5">Curso / Nivel</th>
                <th className="p-3.5">Tutor / Correo</th>
                <th className="p-3.5 text-right">Desglose Cuota</th>
                <th className="p-3.5 text-right">Total Facturado</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const isPaid = p.status === 'pagado';
                const notificationState = notifiedStudents[p.id];

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Alumno */}
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{p.studentName}</span>
                      <span className="text-[11px] text-slate-400">DNI: {p.studentDni}</span>
                    </td>

                    {/* Curso / Nivel */}
                    <td className="p-3.5">
                      <span className="text-slate-700 font-semibold block">{p.curso}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{p.nivel}</span>
                    </td>

                    {/* Tutor */}
                    <td className="p-3.5">
                      <span className="text-slate-700 block truncate max-w-[160px] font-medium">
                        {p.parentEmail}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Vence: {p.dueDate || '10/10/2026'}
                      </span>
                    </td>

                    {/* Desglose */}
                    <td className="p-3.5 text-right text-[11px] text-slate-500">
                      <div>Base: ${p.baseTuition?.toLocaleString('es-AR')}</div>
                      {p.diningAmount > 0 && <div className="text-amber-600">+ Comedor: ${p.diningAmount.toLocaleString('es-AR')}</div>}
                      {p.transportAmount > 0 && <div className="text-sky-600">+ Transporte: ${p.transportAmount.toLocaleString('es-AR')}</div>}
                      {p.sportsAmount > 0 && <div className="text-emerald-600">+ Deportes: ${p.sportsAmount.toLocaleString('es-AR')}</div>}
                    </td>

                    {/* Total */}
                    <td className="p-3.5 text-right font-extrabold text-sm text-slate-900">
                      ${p.totalAmount?.toLocaleString('es-AR')}
                    </td>

                    {/* Estado Badge */}
                    <td className="p-3.5 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="p-3.5 text-center">
                      {isPaid ? (
                        <span className="text-[11px] text-slate-400 italic">
                          Abonado {p.paidAt || '04/10'}
                        </span>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botón de Notificación de Deuda (RF-06/07) */}
                          <button
                            type="button"
                            onClick={() => handleNotifyDebt(p)}
                            disabled={notificationState === 'enviando' || notificationState === 'enviado'}
                            className={`
                              px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer
                              ${notificationState === 'enviado'
                                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                : notificationState === 'enviando'
                                ? 'bg-slate-100 text-slate-400'
                                : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'
                              }
                            `}
                            title="Enviar aviso por correo al tutor"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {notificationState === 'enviado' ? 'done' : 'mail'}
                            </span>
                            <span>{notificationState === 'enviado' ? 'Avisado' : 'Avisar'}</span>
                          </button>

                          {/* Botón registrar cobro en caja */}
                          <button
                            type="button"
                            onClick={() => handleMarkAsPaid(p.id)}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 cursor-pointer"
                            title="Registrar cobro manual"
                          >
                            <span className="material-symbols-outlined text-base">check_circle</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancialReport;
