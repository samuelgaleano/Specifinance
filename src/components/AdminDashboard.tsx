import React, { useState } from 'react';
import { Lead, Booking, OutgoingEmailLog } from '../types';
import { INITIAL_LEADS, INITIAL_BOOKINGS } from '../data';
import { 
  Users, Calendar, TrendingUp, Mail, Send, Key, Search, Plus, Filter, CheckCircle2, 
  Trash2, Briefcase, FileCode, Check, AlertCircle, Copy, Clock, Compass, DollarSign,
  MessageSquare, PhoneCall, CheckSquare, PlusCircle, Activity, ShieldAlert, Award, Hash, ArrowUpRight
} from 'lucide-react';

interface AdminDashboardProps {
  leads: Lead[];
  bookings: Booking[];
  emailLogs: OutgoingEmailLog[];
  onUpdateLeadStatus: (leadId: string, status: Lead['status']) => void;
  onAddLead: (lead: Lead) => void;
  onAddBooking: (booking: Booking) => void;
  onSendEmail: (log: OutgoingEmailLog) => void;
}

export default function AdminDashboard({
  leads,
  bookings,
  emailLogs,
  onUpdateLeadStatus,
  onAddLead,
  onAddBooking,
  onSendEmail
}: AdminDashboardProps) {
  // Navigation & Search
  const [activeTab, setActiveTab] = useState<'leads' | 'bookings' | 'email-logs' | 'settings'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Selected Lead for email/detail views
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);

  // CRM Follow-up & Closing states
  const [leadMemos, setLeadMemos] = useState<Record<string, { id: string; text: string; date: string }[]>>({
    'lead-1': [
      { id: 'n1', text: 'Se queja de que el contador local no entrega reportes a tiempo. Requiere estructura de costos clara.', date: '24 de Mayo, 10:20 AM' },
      { id: 'n2', text: 'Pauta activa en Instagram no rinde óptimamente. Coordinar embudos de marketing digital con Dr. Samuel Galeano.', date: '25 de Mayo, 02:45 PM' }
    ],
    'lead-2': [
      { id: 'n3', text: 'Comentó que el flujo de tesorería es inestable. Preparar análisis de tasa de quemado (Burn Rate) para llamada directiva.', date: '23 de Mayo, 11:30 AM' }
    ],
    'lead-3': [
      { id: 'n4', text: 'Gran interés en unit economics. Solicitar balance de pérdidas y ganancias del periodo anterior.', date: '21 de Mayo, 09:00 AM' }
    ],
    'lead-4': [
      { id: 'n5', text: 'Enviada cotización formal por $4,500 USD que cubre estrategia y dirección financiera.', date: '20 de Mayo, 03:00 PM' }
    ]
  });

  const [newMemoText, setNewMemoText] = useState('');

  const [closingProbabilities, setClosingProbabilities] = useState<Record<string, number>>({
    'lead-1': 40,
    'lead-2': 85,
    'lead-3': 60,
    'lead-4': 75
  });

  const [leadTasksChecked, setLeadTasksChecked] = useState<Record<string, Record<string, boolean>>>({
    'lead-1': { 'Llamada de contacto inicial': true },
    'lead-2': { 'Llamada de contacto inicial': true, 'Confirmar recepción de mensaje': true },
  });

  const [detailTab, setDetailTab] = useState<'info' | 'followup' | 'tasks' | 'metrics'>('info');

  // Email Composer states
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Quick Session Form inside dashboard
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSessionClient, setNewSessionClient] = useState('');
  const [newSessionCompany, setNewSessionCompany] = useState('');
  const [newSessionEmail, setNewSessionEmail] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('25 de Mayo');
  const [newSessionTime, setNewSessionTime] = useState('10:00 AM');
  const [newSessionService, setNewSessionService] = useState('Full Growth Partner');

  // Filter leads based on query
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Pipeline Metrics
  const calculatedPipeline = leads.reduce((acc, lead) => acc + (lead.quotedPrice || 1500), 0);
  const weightedPipeline = leads.reduce((acc, lead) => acc + (lead.quotedPrice || 1500) * ((closingProbabilities[lead.id] || 50) / 100), 0);
  const totalCompletedMeetings = bookings.filter(b => b.status === 'Confirmada').length;
  const avgEbitdaTarget = leads.length > 0 
    ? (leads.reduce((acc, lead) => acc + (lead.estimatedRoi || 24), 0) / leads.length).toFixed(1)
    : '24.0';

  // Load a preset template for the composer
  const handleLoadTemplate = (type: 'proposal' | 'diag_confirm' | 'followup') => {
    if (!selectedLead) return;

    const price = selectedLead.quotedPrice || 2500;
    const ebitda = selectedLead.estimatedRoi || 2.4;

    if (type === 'proposal') {
      setEmailSubject(`Propuesta Estratégica Specifinance para  ${selectedLead.companyName}`);
      setEmailBody(`Estimado(a) ${selectedLead.fullName},\n\nUn gusto saludarle de nuevo.\n\nBasados en el diagnóstico estratégico inicial de ${selectedLead.companyName}, hemos estructurado nuestra propuesta para la unidad "${selectedLead.serviceOfInterest}".\n\nPropuesta Económica:\n- Retenedor mensual estimado: $${price.toLocaleString()} USD\n- Optimización EBITDA proyectada: +${ebitda}% anual\n\nQuedamos a su disposición para coordinar una breve llamada aclaratoria mañana e iniciar la auditoría profunda de estados financieros.\n\nAtentamente,\nEquipo de Consultores de Specifinance`);
    } else if (type === 'diag_confirm') {
      setEmailSubject(`Confirmación de Recepción de Diagnóstico - Specifinance`);
      setEmailBody(`Estimado(a) ${selectedLead.fullName},\n\nHemos recibido con éxito su solicitud de Diagnóstico Financiero Boutique para su empresa "${selectedLead.companyName}".\n\nDetalles del Negocio Reportados:\n- Tamaño de Empresa: ${selectedLead.companySize}\n- Ubicación y Sector: ${selectedLead.city}\n- Principal Desafío Comentado: "${selectedLead.needsDescription}"\n\nUno de nuestros directores de finanzas asignados se pondrá en contacto por esta vÍa o al teléfono ${selectedLead.phone} en las próximas 24 horas hábiles para coordinar la sesión estratégica sin costo.\n\nAtentamente,\nSpecifinance`);
    } else {
      setEmailSubject(`Seguimiento estratégico de resultados - Specifinance`);
      setEmailBody(`Estimada Sofía y equipo de ${selectedLead.companyName},\n\nLe escribo para dar seguimiento a los indicadores de Margen Bruto y del ROMI publicitario comentados en nuestra última sesión de trabajo.\n\nHemos diseñado un tablero modelo preliminar con base en sus datos que nos encantaría presentar el próximo martes.\n\n¿Tiene 15 minutos disponibles?\n\nSaludos cordiales,\nSocio Consultor Financiero\nSpecifinance`);
    }
  };

  const handleSendResendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !emailSubject || !emailBody) return;

    setIsSending(true);

    // Simulate Resend API Latency
    setTimeout(() => {
      const newLog: OutgoingEmailLog = {
        id: `email-${Date.now()}`,
        toEmail: selectedLead.email,
        subject: emailSubject,
        body: emailBody,
        sentAt: new Date().toISOString(),
        status: 'Enviado'
      };

      onSendEmail(newLog);
      setIsSending(false);
      setEmailSubject('');
      setEmailBody('');
      
      // Update Lead Status automatically to indicates outbound contact
      if (selectedLead.status === 'Nuevo') {
        onUpdateLeadStatus(selectedLead.id, 'Contactado');
      }
    }, 1200);
  };

  const handleQuickAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionClient || !newSessionCompany || !newSessionEmail) return;

    const newBooking: Booking = {
      id: `booking-quick-${Date.now()}`,
      leadId: `lead-quick-${Date.now()}`,
      clientName: newSessionClient,
      companyName: newSessionCompany,
      dateTime: `${newSessionDate} a las ${newSessionTime}`,
      serviceType: newSessionService,
      roomUrl: `https://meet.google.com/sf-${Math.random().toString(36).substring(2, 11)}`,
      status: 'Confirmada'
    };

    onAddBooking(newBooking);

    // Auto-create corresponding Lead if not present
    const correspondingLead: Lead = {
      id: newBooking.leadId,
      fullName: newSessionClient,
      role: 'Gerente General',
      companyName: newSessionCompany,
      email: newSessionEmail,
      phone: '+57 300 123 4567',
      city: 'Creado desde Backoffice',
      companySize: '11 - 50 empleados',
      serviceOfInterest: newSessionService,
      needsDescription: 'Agendado rápido por backoffice.',
      status: 'Reunión Agendada',
      createdAt: new Date().toISOString(),
      quotedPrice: 2400,
      estimatedRoi: 25
    };
    onAddLead(correspondingLead);

    // Reset Form
    setNewSessionClient('');
    setNewSessionCompany('');
    setNewSessionEmail('');
    setShowAddSession(false);
  };

  // Resend Integration sample code in TS
  const resendTsCodeString = `
import { Resend } from 'resend';

// Inicialización del cliente de correo
const resend = new Resend(process.env.RESEND_API_KEY || '${resendApiKey || "re_yourApiKey"}');

async function sendDiagnosticEmail() {
  try {
    const data = await resend.emails.send({
      from: 'Specifinance <consultoria@specifinance.com>',
      to: ['${selectedLead?.email || "cliente@empresa.com"}'],
      subject: '${emailSubject || "Propuesta de Dirección Financiera"}',
      html: \`
        <div style="font-family: sans-serif; padding: 20px; color: #0F172A;">
          <h2>Specifinance - Consultoría de Alto Rendimiento</h2>
          <p>Estimado Cliente,</p>
          <p>Estructuramos un plan financiero a medida:</p>
          <ul>
            <li><strong>Propuesta económica:</strong> $${selectedLead?.quotedPrice?.toLocaleString() || "2,500"} USD/mes</li>
            <li><strong>Optimización EBITDA estimada:</strong> +${selectedLead?.estimatedRoi || "24"}%</li>
          </ul>
        </div>
      \`
    });
    console.log("Email enviado con éxito, ID:", data.id);
  } catch (error) {
    console.error("Error enviando correo con Resend:", error);
  }
}
  `.trim();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(resendTsCodeString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-white border border shadow-sm rounded-xl overflow-hidden mt-8">
      {/* Dashboard Top Header bar */}
      <div className="bg-deep-navy px-6 py-5 text-white flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-growth-green rounded-full animate-pulse" />
            <span className="text-[10px] text-growth-green font-semibold tracking-widest uppercase font-mono">
              Backoffice & CRM Live
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-medium tracking-tight">
            Consola Administrativa de Socios
          </h2>
        </div>

        {/* Metric widgets inside header */}
        <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <div className="bg-white/5 px-4 py-2 rounded border border-white/10 min-w-[120px]">
            <span className="text-[9px] text-white/50 block font-semibold uppercase font-sans">
              Pipeline Total
            </span>
            <span className="text-sm font-mono font-bold text-growth-green">
              ${calculatedPipeline.toLocaleString()} USD
            </span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded border border-white/10 min-w-[120px]">
            <span className="text-[9px] text-white/50 block font-semibold uppercase font-sans">
              Pipeline Ponderado
            </span>
            <span className="text-sm font-mono font-bold text-indigo-400">
              ${Math.round(weightedPipeline).toLocaleString()} USD
            </span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded border border-white/10 min-w-[120px]">
            <span className="text-[9px] text-white/50 block font-semibold uppercase font-sans">
              Sesiones Agendadas
            </span>
            <span className="text-sm font-mono font-bold text-white">
              {totalCompletedMeetings}
            </span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded border border-white/10 min-w-[120px]">
            <span className="text-[9px] text-white/50 block font-semibold uppercase font-sans">
              EBITDA Promedio Target
            </span>
            <span className="text-sm font-mono font-bold text-muted-gold">
              +{avgEbitdaTarget}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-surface-gray border-b border-border-subtle px-6 flex justify-between items-center overflow-x-auto">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('leads')}
            type="button"
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-deep-navy text-deep-navy font-bold'
                : 'border-transparent text-charcoal-text hover:text-deep-navy'
            }`}
            id="tab-leads"
          >
            <Users className="w-4 h-4" />
            Clientes Potenciales ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            type="button"
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-deep-navy text-deep-navy font-bold'
                : 'border-transparent text-charcoal-text hover:text-deep-navy'
            }`}
            id="tab-bookings"
          >
            <Calendar className="w-4 h-4" />
            Sesiones Clínicas ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('email-logs')}
            type="button"
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'email-logs'
                ? 'border-deep-navy text-deep-navy font-bold'
                : 'border-transparent text-charcoal-text hover:text-deep-navy'
            }`}
            id="tab-email-logs"
          >
            <Mail className="w-4 h-4" />
            Bitácora de Correo Resend ({emailLogs.length})
          </button>
        </div>

        {/* Quick action button */}
        <button
          onClick={() => setShowAddSession(true)}
          type="button"
          className="bg-deep-navy hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold cursor-pointer"
          id="btn-quick-session"
        >
          <Plus className="w-3.5 h-3.5" />
          Rápido: Agendar Sesión
        </button>
      </div>

      {/* Main split work area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle min-h-[500px]">
        
        {/* LEFT COLUMN: Main lists: columns 8 */}
        <div className="lg:col-span-8 p-6 space-y-6">
          
          {/* Active Tab: Leads */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              {/* Filters search */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-charcoal-text">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por cliente, empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-border-subtle rounded focus:border-deep-navy"
                    id="search-input-leads"
                  />
                </div>

                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-charcoal-text" />
                  <span className="text-xs text-charcoal-text">Filtrar Estado:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs py-1 px-2 border border-border-subtle rounded bg-white"
                    id="status-filter-leads"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Nuevo">Nuevos</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Reunión Agendada">Reunión Agendada</option>
                    <option value="Propuesta Enviada">Propuesta Enviada</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
              </div>

              {/* CRM leads List cards */}
              {filteredLeads.length === 0 ? (
                <div className="text-center py-10 text-charcoal-text italic text-xs">
                  No se encontraron registros de clientes con los filtros aplicados.
                </div>
              ) : (
                <div className="grid grid-cols-1 divide-y divide-border-subtle border border-border-subtle rounded overflow-hidden">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-4 transition-all cursor-pointer text-left flex items-start justify-between gap-4 ${
                        selectedLead?.id === lead.id
                          ? 'bg-deep-navy/5 shadow-inner'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                      id={`lead-item-${lead.id}`}
                    >
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-sm text-deep-navy truncate block">
                            {lead.fullName}
                          </span>
                          <span className="text-xs text-charcoal-text font-medium italic block truncate">
                            {lead.companyName}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-text truncate">
                          {lead.serviceOfInterest} • {lead?.city}
                        </p>
                        <p className="text-[10px] text-charcoal-text truncate italic">
                          "{lead.needsDescription}"
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between h-12 gap-1 flex-shrink-0">
                        {/* Status chip */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                          lead.status === 'Nuevo' ? 'bg-amber-100 text-amber-800' :
                          lead.status === 'Contactado' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'Reunión Agendada' ? 'bg-purple-100 text-purple-850' :
                          lead.status === 'Propuesta Enviada' ? 'bg-indigo-100 text-indigo-800' : 'bg-growth-green/10 text-growth-green'
                        }`}>
                          {lead.status}
                        </span>

                        <span className="text-xs font-mono font-bold text-deep-navy">
                          ${(lead.quotedPrice || 2500).toLocaleString()} USD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h3 className="text-sm font-heading font-semibold text-deep-navy">
                Lista de Sesiones y Agendas Guardadas en Base de Datos
              </h3>

              {bookings.length === 0 ? (
                <div className="text-center py-10 text-sm text-charcoal-text italic">
                  No hay reuniones guardadas aún.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookings.map((book) => (
                    <div key={book.id} className="bg-white border border-border-subtle p-4 rounded-lg flex flex-col justify-between hover:shadow-sm" id={`booking-card-${book.id}`}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-muted-gold font-bold block">
                              {book.serviceType}
                            </span>
                            <h4 className="font-heading font-semibold text-sm text-deep-navy mt-0.5">
                              {book.clientName}
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 bg-growth-green/10 text-growth-green text-[9px] rounded font-semibold uppercase">
                            {book.status}
                          </span>
                        </div>

                        <p className="text-xs text-charcoal-text">
                          Empresa: <strong className="text-deep-navy">{book.companyName}</strong>
                        </p>

                        <div className="bg-surface-gray py-2 px-3 rounded text-xs flex items-center gap-1.5 text-deep-navy font-mono">
                          <Clock className="w-3.5 h-3.5 text-charcoal-text" />
                          {book.dateTime}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border-subtle mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-charcoal-text font-mono truncate max-w-[150px]">
                          {book.roomUrl}
                        </span>
                        <a
                          href={book.roomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-deep-navy text-white hover:bg-black px-2.5 py-1 rounded transition-colors"
                          id={`btn-join-booking-${book.id}`}
                        >
                          Ir a Sala
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Email Logs */}
          {activeTab === 'email-logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-heading font-semibold text-deep-navy">
                  Bitácora de Envíos Realizados vía Resend
                </h3>
                <span className="text-xs text-charcoal-text">
                  Total enviados: {emailLogs.length}
                </span>
              </div>

              {emailLogs.length === 0 ? (
                <div className="text-center py-12 text-charcoal-text italic text-xs">
                  Aún no se han enviado correos. Seleccione un cliente en la pestaña principal y redacte su propuesta mediante el compositor.
                </div>
              ) : (
                <div className="space-y-4">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="bg-white border border-border-subtle rounded-lg p-5 space-y-3" id={`log-card-${log.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-charcoal-text">
                            Para: <strong className="text-deep-navy font-mono">{log.toEmail}</strong>
                          </p>
                          <h4 className="font-heading font-semibold text-sm text-deep-navy mt-1">
                            Asunto: {log.subject}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="inline-block py-0.5 px-2 bg-emerald-50 text-growth-green text-[9px] rounded font-bold uppercase tracking-wider">
                            {log.status}
                          </span>
                          <span className="block text-[10px] text-charcoal-text italic mt-1">
                            {new Date(log.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <pre className="p-3 bg-surface-gray rounded text-xs text-charcoal-text font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto border border-border-subtle">
                        {log.body}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Work desk: columns 4 */}
        <div className="lg:col-span-4 p-6 bg-slate-50 flex flex-col justify-between h-full">
          <div>
            {/* Lead CRM Detail Workspace Card */}
            <div className="bg-white border border-border-subtle rounded-xl shadow-sm mb-6 overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0 font-sans">
                  <Compass className="w-4 h-4 text-muted-gold flex-shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider block font-sans truncate">
                    Workspace Directivo
                  </span>
                </div>
                {selectedLead && (
                  <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded font-bold uppercase text-growth-green">
                    {selectedLead.status}
                  </span>
                )}
              </div>

              {selectedLead ? (
                <div>
                  {/* Lead Basic ID header */}
                  <div className="p-4 border-b border-border-subtle bg-slate-50/50">
                    <span className="text-[9px] text-charcoal-text font-mono font-medium block uppercase tracking-wide">Compañía en Proceso</span>
                    <h4 className="text-base font-extrabold text-slate-950 tracking-tight truncate">{selectedLead.companyName}</h4>
                    <p className="text-xs text-charcoal-text font-medium mt-0.5">{selectedLead.fullName} • <span className="text-indigo-700 font-bold">{selectedLead.role}</span></p>
                  </div>

                  {/* Operational Tabs Selector */}
                  <div className="grid grid-cols-4 border-b border-border-subtle bg-slate-100 text-[10px] font-bold text-center">
                    <button
                      type="button"
                      onClick={() => setDetailTab('info')}
                      className={`py-2 border-r border-border-subtle transition-all cursor-pointer ${detailTab === 'info' ? 'bg-white text-indigo-700' : 'text-charcoal-text hover:bg-slate-200'}`}
                    >
                      Ficha
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('followup')}
                      className={`py-2 border-r border-border-subtle transition-all cursor-pointer ${detailTab === 'followup' ? 'bg-white text-indigo-700' : 'text-charcoal-text hover:bg-slate-200'}`}
                    >
                      Bitácora
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('tasks')}
                      className={`py-2 border-r border-border-subtle transition-all cursor-pointer ${detailTab === 'tasks' ? 'bg-white text-indigo-700' : 'text-charcoal-text hover:bg-slate-200'}`}
                    >
                      Tareas
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('metrics')}
                      className={`py-2 transition-all cursor-pointer ${detailTab === 'metrics' ? 'bg-white text-indigo-700' : 'text-charcoal-text hover:bg-slate-200'}`}
                    >
                      Cierre
                    </button>
                  </div>

                  {/* VIEW: Info/Ficha */}
                  {detailTab === 'info' && (
                    <div className="p-4 space-y-4 animate-fade-in text-left">
                      <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                        <div>
                          <span className="text-[9px] text-charcoal-text font-mono block">CIUDAD / SECTOR</span>
                          <span className="font-extrabold text-deep-navy">{selectedLead.city}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-charcoal-text font-mono block">TAMAÑO EMPRESA</span>
                          <span className="font-extrabold text-deep-navy">{selectedLead.companySize}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-charcoal-text font-mono block">E-MAIL INSTITUCIONAL</span>
                          <span className="font-mono text-indigo-600 block truncate" title={selectedLead.email}>{selectedLead.email}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-charcoal-text font-mono block">TELÉFONO</span>
                          <span className="font-medium text-deep-navy block font-mono">{selectedLead.phone}</span>
                        </div>
                      </div>

                      <div className="bg-surface-gray border border-border-subtle rounded-lg p-3 text-xs leading-normal">
                        <span className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wide block mb-1">Necesidad Declarada del Cliente:</span>
                        <p className="text-slate-650 italic">"{selectedLead.needsDescription}"</p>
                      </div>

                      {/* Rapid Contact Integrations */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-charcoal-text font-mono block font-bold uppercase">Conexiones Inmediatas de Seguimiento:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const calendly = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/specifinance/consultoria';
                              const text = `Hola ${selectedLead.fullName}, le escribe el equipo directivo de Specifinance S.A.S. Hemos estado analizando la necesidad de su empresa ${selectedLead.companyName} respecto a "${selectedLead.serviceOfInterest}". Nos encantaría agendar un breve diagnóstico de 15 minutos en nuestro Calendly: ${calendly}`;
                              window.open(`https://api.whatsapp.com/send?phone=${encodeURIComponent(selectedLead.phone.replace(/[^0-9+]/g, ''))}&text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Iniciar WhatsApp
                          </button>
                          <a
                            href={`tel:${selectedLead.phone}`}
                            className="bg-blue-650 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded text-[10px] flex items-center justify-center gap-1 text-center cursor-pointer transition-colors shadow-sm"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            Llamar Directo
                          </a>
                        </div>
                      </div>

                      {/* Status Management Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                        <span className="text-[9px] text-charcoal-text font-mono block font-bold uppercase">Etapa del Proceso:</span>
                        <div className="flex flex-wrap gap-1">
                          {(['Nuevo', 'Contactado', 'Reunión Agendada', 'Propuesta Enviada', 'Cerrado'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                onUpdateLeadStatus(selectedLead.id, st);
                                setSelectedLead({ ...selectedLead, status: st });
                              }}
                              className={`px-2 py-0.5 text-[9px] rounded font-semibold transition-colors cursor-pointer ${
                                selectedLead.status === st
                                  ? 'bg-indigo-700 text-white shadow-sm font-bold'
                                  : 'bg-slate-100 hover:bg-slate-200 border border-border-subtle/60 text-charcoal-text'
                              }`}
                              id={`status-badge-update-${st}`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* VIEW: Bitácora/Followup */}
                  {detailTab === 'followup' && (
                    <div className="p-4 space-y-4 animate-fade-in text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-charcoal-text font-mono font-bold uppercase">Bitácora de Seguimiento Directivo</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold font-mono">
                          {leadMemos[selectedLead.id]?.length || 0} Registros
                        </span>
                      </div>

                      {/* Add note Form */}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newMemoText.trim()) return;
                        const newMemo = {
                          id: `memo-${Date.now()}`,
                          text: newMemoText.trim(),
                          date: `${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} • ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
                        };
                        setLeadMemos(prev => ({
                          ...prev,
                          [selectedLead.id]: [newMemo, ...(prev[selectedLead.id] || [])]
                        }));
                        setNewMemoText('');
                      }} className="space-y-2">
                        <textarea
                          rows={2}
                          value={newMemoText}
                          onChange={(e) => setNewMemoText(e.target.value)}
                          placeholder="Añada una nota ejecutiva sobre el seguimiento (ej: 'Socio aceptó el retenedor preliminar'...)"
                          className="w-full text-[11px] p-2 border border-border-subtle rounded leading-normal resize-none outline-none focus:border-indigo-600 bg-slate-50"
                        />
                        <button
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase py-1 px-2.5 rounded flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-growth-green" />
                          Registrar Nota Directiva
                        </button>
                      </form>

                      {/* Note Timeline cards list */}
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {(!leadMemos[selectedLead.id] || leadMemos[selectedLead.id].length === 0) ? (
                          <p className="text-[11px] text-charcoal-text italic text-center py-4">No hay notas directivas registradas para este lead.</p>
                        ) : (
                          leadMemos[selectedLead.id].map((m) => (
                            <div key={m.id} className="p-2.5 bg-slate-50 border border-border-subtle rounded leading-normal text-left text-[11px] relative">
                              <span className="text-[9px] text-charcoal-text font-mono block mb-1 font-bold text-indigo-750">{m.date}</span>
                              <p className="text-slate-800 whitespace-pre-line leading-relaxed">"{m.text}"</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setLeadMemos(prev => ({
                                    ...prev,
                                    [selectedLead.id]: (prev[selectedLead.id] || []).filter(note => note.id !== m.id)
                                  }));
                                }}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-750 font-bold text-xs"
                                title="Eliminar nota"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* VIEW: Tareas / Checklist */}
                  {detailTab === 'tasks' && (
                    <div className="p-4 space-y-4 animate-fade-in text-left">
                      <div>
                        <span className="text-[9px] text-charcoal-text font-mono font-bold uppercase block">Proceso de Calificación & Cierre</span>
                        <span className="text-xs text-charcoal-text">Tareas estratégicas requeridas para culminar con éxito la etapa actual:</span>
                      </div>

                      {/* Progress Bar of Checklist Tasks */}
                      {(() => {
                        const getTasksForStatus = (statusStr: string) => {
                          switch(statusStr) {
                            case 'Nuevo':
                              return [
                                'Sondear sitio web de la empresa y perfiles de directivos',
                                'Enviar correo de confirmación de diagnóstico',
                                'Coordinar llamada telefónica inicial de 5 minutos'
                              ];
                            case 'Contactado':
                              return [
                                'Identificar cuellos de botella del flujo de caja',
                                'Agendar sesión clínica formal de 30 minutos',
                                'Solicitar estados financieros básicos del Q1'
                              ];
                            case 'Reunión Agendada':
                              return [
                                'Preparar simulación de EBITDA con la calculadora de sinergia',
                                'Confirmar link de Google Meet / Teams con el cliente',
                                'Verificar que asista el Gerente General'
                              ];
                            case 'Propuesta Enviada':
                              return [
                                'Enviar borrador de propuesta económica por Resend',
                                'Llamada de clarificación sobre el retenedor y variables',
                                'Realizar el seguimiento a las 48 horas de enviado'
                              ];
                            case 'Cerrado':
                              return [
                                'Redactar contrato comercial final de consultoría',
                                'Agendar la sesión de Kickoff / Inducción del equipo',
                                'Crear la carpeta compartida de Drive para auditorías'
                              ];
                            default:
                              return [];
                          }
                        };

                        const allTasks = getTasksForStatus(selectedLead.status);
                        const checkedMap = leadTasksChecked[selectedLead.id] || {};
                        const completedCount = allTasks.filter(tsk => checkedMap[tsk]).length;
                        const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

                        return (
                          <div className="space-y-1.5 bg-indigo-50/50 border border-indigo-150 p-2.5 rounded-lg font-sans">
                            <div className="flex justify-between items-center text-[10px] font-bold text-indigo-850">
                              <span className="flex items-center gap-1 font-sans">
                                <Activity className="w-3.5 h-3.5 animate-pulse text-indigo-700" />
                                PROGRESO DE CIERRE
                              </span>
                              <span>{completedCount}/{allTasks.length} ({progressPercent}%)</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-750 h-full transition-all duration-350"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>

                            {/* Actual Task list mapping */}
                            <div className="space-y-2 pt-2 text-[11px]">
                              {allTasks.map((taskStr, index) => {
                                const isChecked = !!checkedMap[taskStr];
                                return (
                                  <label
                                    key={index}
                                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer select-none transition-all ${
                                      isChecked
                                        ? 'bg-growth-green/5 border-growth-green/20 text-slate-500 line-through'
                                        : 'bg-white border-border-subtle text-slate-900 hover:bg-slate-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        setLeadTasksChecked(prev => {
                                          const leadMap = prev[selectedLead.id] || {};
                                          return {
                                            ...prev,
                                            [selectedLead.id]: {
                                              ...leadMap,
                                              [taskStr]: !isChecked
                                            }
                                          };
                                        });
                                      }}
                                      className="mt-0.5 rounded text-indigo-700 focus:ring-indigo-550 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <span className="leading-snug text-[10.5px] font-medium">{taskStr}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* VIEW: Metrics / Squeeze */}
                  {detailTab === 'metrics' && (
                    <div className="p-4 space-y-4 animate-fade-in text-left leading-relaxed">
                      <div>
                        <span className="text-[9px] text-charcoal-text font-mono font-bold uppercase block">Comercialización y Factibilidad</span>
                        <span className="text-xs text-charcoal-text">Valores económicos e índice de éxito ponderado sobre el cliente:</span>
                      </div>

                      <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 border border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/60">Precio Cotizado (Mensual):</span>
                          <span className="font-mono font-bold text-growth-green text-sm">${(selectedLead.quotedPrice || 2500).toLocaleString()} USD</span>
                        </div>

                        {/* Interactive Probability Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-white/60">Éxito en Cierre (Probabilidad):</span>
                            <span className="font-mono font-bold text-indigo-400">{(closingProbabilities[selectedLead.id] ?? 50)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={closingProbabilities[selectedLead.id] ?? 50}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setClosingProbabilities(prev => ({
                                ...prev,
                                [selectedLead.id]: val
                              }));
                            }}
                            className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs font-bold">
                          <span className="text-white/80">Valor Ponderado de Éxito:</span>
                          <span className="font-mono text-white text-sm">
                            ${Math.round((selectedLead.quotedPrice || 2500) * ((closingProbabilities[selectedLead.id] ?? 50) / 100)).toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      {/* Forecast of results for company */}
                      <div className="p-3 border border-indigo-150 bg-indigo-50/50 rounded-xl space-y-2">
                        <span className="text-[9px] font-mono text-indigo-800 font-bold block uppercase tracking-wider flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-indigo-700 font-bold" />
                          RESULTADOS ESTIMADOS DE INTERVENCIÓN
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 border border-indigo-100 rounded">
                            <span className="text-[9px] text-charcoal-text font-mono block">EBITDA OBJETIVO</span>
                            <span className="font-bold text-deep-navy text-[11px]">+{selectedLead.estimatedRoi || 24}% Anual</span>
                          </div>
                          <div className="bg-white p-2 border border-indigo-100 rounded">
                            <span className="text-[9px] text-charcoal-text font-mono block">SINOPSIS RETORNO (x8)</span>
                            <span className="font-bold text-growth-green text-[11px] font-mono">${Math.round((selectedLead.quotedPrice || 2500) * 8).toLocaleString()} USD</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              ) : (
                <div className="p-8 text-center text-charcoal-text italic text-xs">
                  Ningún lead seleccionado en la base de datos.
                </div>
              )}
            </div>

            {/* Email Composer Composer inside Admin Panel */}
            {selectedLead && (
              <div className="bg-white p-4 border border-border-subtle rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-text flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-growth-green" />
                    Enviar Correo (Resend Integrado)
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleLoadTemplate('proposal')}
                      className="text-[10px] text-deep-navy hover:underline cursor-pointer"
                      title="Escribir propuesta estimativa"
                    >
                      Propuesta
                    </button>
                    <span className="text-white/20">|</span>
                    <button
                      onClick={() => handleLoadTemplate('diag_confirm')}
                      className="text-[10px] text-deep-navy hover:underline cursor-pointer"
                      title="Notificar recepción"
                    >
                      Recibido
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendResendEmail} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Asunto del correo"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-border-subtle rounded focus:border-deep-navy focus:ring-0"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="Redacte su mensaje formal aquí..."
                      required
                      rows={5}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-border-subtle rounded focus:border-deep-navy focus:ring-0 font-mono leading-normal"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-deep-navy hover:bg-black text-white text-xs py-2 rounded font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    id="submit-send-email"
                  >
                    {isSending ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Disparar Resend Mail
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* TS Node Snippet Section */}
          <div className="bg-deep-navy text-white/90 p-4 border border-white/10 rounded-lg shadow-sm mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-growth-green font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" />
                Integración API Resend.ts
              </span>
              <button
                onClick={handleCopyCode}
                className="text-[10px] text-white/70 hover:text-white flex items-center gap-1"
                title="Copiar código Node/TypeScript"
              >
                {copiedCode ? <Check className="w-3 h-3 text-growth-green" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="text-[9px] text-white/70 font-mono leading-tight whitespace-pre-wrap overflow-x-auto max-h-32 bg-black/40 p-2.5 rounded border border-white/5">
              {resendTsCodeString}
            </pre>
            <p className="text-[9px] text-white/50 italic mt-1.5">
              *Integre esta función en la ruta de su servidor Node.js/Express para automatizar las alertas.
            </p>
          </div>
        </div>

      </div>

      {/* MODAL: Simple additions scheduler modal */}
      {showAddSession && (
        <div className="fixed inset-0 bg-deep-navy/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-border-subtle">
            <h3 className="font-heading font-medium text-lg text-deep-navy flex items-center gap-2">
              <Plus className="w-5 h-5 text-growth-green" />
              Crear Turno de Reunión Manual
            </h3>
            <p className="text-xs text-charcoal-text">
              Agrega una sesión de inmediato en la base de datos de Specifinance para simular el agendamiento instantáneo.
            </p>

            <form onSubmit={handleQuickAddSession} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-charcoal-text uppercase tracking-wider mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: David Ruiz"
                  value={newSessionClient}
                  onChange={(e) => setNewSessionClient(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-deep-navy border border-border-subtle rounded focus:border-deep-navy"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-charcoal-text uppercase tracking-wider mb-1">
                  Empresa S.A.S
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ruiz Inversiones"
                  value={newSessionCompany}
                  onChange={(e) => setNewSessionCompany(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-deep-navy border border-border-subtle rounded focus:border-deep-navy"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-charcoal-text uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="david@ruizinv.cl"
                  value={newSessionEmail}
                  onChange={(e) => setNewSessionEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-deep-navy border border-border-subtle rounded focus:border-deep-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-charcoal-text uppercase tracking-wider mb-1">
                    Fecha de Reunión
                  </label>
                  <input
                    type="text"
                    required
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs text-deep-navy border border-border-subtle rounded focus:border-deep-navy"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-charcoal-text uppercase tracking-wider mb-1">
                    Hora
                  </label>
                  <input
                    type="text"
                    required
                    value={newSessionTime}
                    onChange={(e) => setNewSessionTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs text-deep-navy border border-border-subtle rounded focus:border-deep-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-charcoal-text uppercase tracking-wider mb-1">
                  Servicios Solicitados
                </label>
                <select
                  value={newSessionService}
                  onChange={(e) => setNewSessionService(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-deep-navy border border-border-subtle rounded bg-white"
                >
                  <option>Full Growth Partner</option>
                  <option>CFO as a Service</option>
                  <option>Data-Driven Growth</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddSession(false)}
                  className="px-3 py-1.5 border border-border-subtle text-charcoal-text text-xs rounded hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-deep-navy text-white text-xs rounded hover:bg-black font-semibold"
                >
                  Confirmar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
