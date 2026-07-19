import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, Booking, OutgoingEmailLog, QuoteCalculated } from './types';
import { INITIAL_LEADS, INITIAL_BOOKINGS } from './data';
import { createLead, adminLogin, fetchLeads, updateLead, getToken, setToken } from './api';
import AdminDashboard from './components/AdminDashboard';
import SmeSolutions from './components/SmeSolutions';
import ServiceModal from './components/ServiceModal';
import {
  TrendingUp, BarChart3, Receipt, Users, ShieldCheck, Mail, Phone, MapPin,
  ArrowRight, Sparkles, CheckCircle2, ChevronRight, X, Play, Settings,
  Layers, Lock, Database, UserCheck, Check, MessageSquare, Menu, Clock,
  RefreshCw, AlertTriangle, Loader2
} from 'lucide-react';

// Appointment scheduler link — override with VITE_CALENDLY_URL in Vercel env vars.
const CALENDLY_URL =
  import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/specifinance/consultoria';

export default function App() {
  // Database States
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [emailLogs, setEmailLogs] = useState<OutgoingEmailLog[]>([]);

  // Toggle Admin backoffice view vs standard public landing page
  const [adminMode, setAdminMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Admin Authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  // Selected Service in landing page (for easy syncing with Cotizador)
  const [serviceOfInterest, setServiceOfInterest] = useState('full-growth');

  // Multi-Form / Input states for public diagnostic request
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formSize, setFormSize] = useState('11 - 50 empleados');
  const [formService, setFormService] = useState('Full Growth Partner');
  const [formNeeds, setFormNeeds] = useState('');
  const [formAgreed, setFormAgreed] = useState(false);

  // Success indicator for the main contact form
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Service Modal state
  const [activeServiceModal, setActiveServiceModal] = useState<string | null>(null);

  // Prefill the diagnostic form from a SmeSolutions card selection.
  const handleSelectSmeNeed = (serviceName: string, needsStr: string) => {
    setFormService(serviceName);
    setFormNeeds(needsStr);
  };
  const [diagnosticLeadCreated, setDiagnosticLeadCreated] = useState<Lead | null>(null);

  // Backend sync states
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // States for the 2-Pillar Interlocking Corporate Hub
  const [activePillarTab, setActivePillarTab] = useState<'financial' | 'marketing' | 'synergy'>('financial');

  // Load leads from the backend for the CRM (falls back to seed data in demo mode).
  const loadLeads = async () => {
    setLeadsLoading(true);
    const result = await fetchLeads();
    setLeadsLoading(false);
    if (result.ok && result.data) {
      setDbConnected(!!result.dbConnected);
      setLeads(result.dbConnected ? result.data.leads : INITIAL_LEADS);
    } else if (result.error && result.error.toLowerCase().includes('sesión')) {
      setToken(null);
      setIsAdminAuthenticated(false);
    }
  };

  // Keep the admin signed in across refreshes if a valid token is stored.
  useEffect(() => {
    if (!getToken()) return;
    (async () => {
      const result = await fetchLeads();
      if (result.ok && result.data) {
        setIsAdminAuthenticated(true);
        setDbConnected(!!result.dbConnected);
        setLeads(result.dbConnected ? result.data.leads : INITIAL_LEADS);
      } else {
        setToken(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };
  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  };

  // Handles updating lead states inside CRM (optimistic UI + backend persist)
  const handleUpdateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setLeads(prevLeads =>
      prevLeads.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead)
    );
    // Persist in the background; the optimistic update already refreshed the UI.
    void updateLead(leadId, { status: newStatus });
  };

  // Direct append of leads
  const handleAddLead = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
  };

  // Direct append of bookings
  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  // Append outbound Resend email log
  const handleSendEmailLog = (log: OutgoingEmailLog) => {
    setEmailLogs(prev => [log, ...prev]);
  };

  // Submit main Public Contact/Diagnostic Form -> registers the lead in the backend
  const handleSubmitDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAgreed) {
      setSubmitError('Debe aceptar la política de tratamiento de datos personales.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);

    const result = await createLead({
      fullName: formName,
      role: formRole,
      companyName: formCompany,
      email: formEmail,
      phone: formPhone,
      city: formCity,
      companySize: formSize,
      serviceOfInterest: formService,
      needsDescription: formNeeds,
    });

    setSubmitting(false);

    if (!result.ok || !result.data) {
      setSubmitError(result.error || 'No pudimos registrar su solicitud. Intente nuevamente.');
      return;
    }

    const newLead = result.data.lead;
    // Reflect immediately in the local CRM state for this session.
    handleAddLead(newLead);
    setDiagnosticLeadCreated(newLead);
    setFormSubmitted(true);

    // Redirect to Calendly for appointment
    window.open(CALENDLY_URL, '_blank');
  };

  // Handle Admin Auth Login (validated server-side, token stored locally)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const result = await adminLogin(adminEmail, adminPassword);
    setLoginLoading(false);
    if (result.ok) {
      setIsAdminAuthenticated(true);
      setAdminAuthError('');
      setAdminPassword('');
      await loadLeads();
    } else {
      setAdminAuthError(result.error || 'Usuario o clave incorrectos. Acceso denegado.');
    }
  };

  // Reset Public Diagnostic Form to let user create another
  const resetPublicForm = () => {
    setFormName('');
    setFormRole('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormCity('');
    setFormNeeds('');
    setFormSubmitted(false);
    setDiagnosticLeadCreated(null);
  };

  return (
    <div className="min-h-screen bg-background-soft text-deep-navy selection:bg-muted-gold/30">
      
      {/* Main TopNavBar */}
      <nav id="nav-primary" className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-border-subtle shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-4 flex justify-between items-center">
          <a href="#" className="font-heading font-extrabold text-2xl text-deep-navy tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-muted-gold rounded-sm block" />
            Specifinance
          </a>

          {/* Desktop Nav menus - Simulador removed */}
          {!adminMode && (
            <div className="hidden md:flex gap-8 items-center">
              <a href="#inicio" className="text-xs font-semibold uppercase tracking-wider text-deep-navy border-b-2 border-deep-navy pb-1">
                Inicio
              </a>
              <a href="#que-hacemos" className="text-xs font-semibold uppercase tracking-wider text-charcoal-text hover:text-deep-navy transition-colors">
                Qué hacemos
              </a>
              <a href="#servicios" className="text-xs font-semibold uppercase tracking-wider text-charcoal-text hover:text-deep-navy transition-colors">
                Servicios
              </a>
              <a href="#metodologia" className="text-xs font-semibold uppercase tracking-wider text-charcoal-text hover:text-deep-navy transition-colors">
                Metodología
              </a>
              <a href="#contacto" className="text-xs font-semibold uppercase tracking-wider text-charcoal-text hover:text-deep-navy transition-colors">
                Contacto
              </a>
            </div>
          )}

          <div className="flex gap-2.5 items-center">
             {/* Elegant, discrete Lock button to access backoffice / CRM safely */}
             <button 
                onClick={() => {
                  setAdminMode(!adminMode);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                  adminMode 
                    ? 'bg-deep-navy text-white border-deep-navy hover:bg-black opacity-100' 
                    : 'text-slate-300 hover:text-deep-navy hover:bg-slate-50 border-transparent hover:border-slate-200 opacity-20 hover:opacity-100'
                }`}
                id="nav-crm-toggle-lock"
             >
               <Lock className="w-3.5 h-3.5" />
             </button>

            <a 
              href="#contacto"
              className="bg-deep-navy text-white hover:bg-black px-5 py-2 rounded font-sans text-xs tracking-wider uppercase font-semibold transition-colors shadow-sm"
              id="cta-diagnostic-nav"
            >
              Solicitar diagnóstico
            </a>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button" 
              className="md:hidden text-deep-navy p-1"
              id="btn-mobile-menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-border-subtle px-6 py-4 space-y-4 shadow-lg absolute w-full left-0">
            <div className="flex flex-col gap-3 text-sm">
              <a href="#que-hacemos" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-charcoal-text block py-1.5 border-b border-slate-100">
                Qué hacemos
              </a>
              <a href="#servicios" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-charcoal-text block py-1.5 border-b border-slate-100">
                Servicios
              </a>
              <a href="#metodologia" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-charcoal-text block py-1.5 border-b border-slate-100">
                Metodología
              </a>
              <a href="#contacto" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-charcoal-text block py-1.5 border-b border-slate-100">
                Contacto
              </a>
              
              {/* Subtle mobile portal unlock link */}
              <button
                onClick={() => {
                  setAdminMode(!adminMode);
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-left py-2 text-indigo-700 font-bold flex items-center gap-1.5 text-xs uppercase"
              >
                <Lock className="w-3.5 h-3.5" />
                {adminMode ? 'Ver Landing Page' : 'Acceso Socios (CRM)'}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ADMIN CONTEXT DASHBOARD */}
      {adminMode ? (
        !isAdminAuthenticated ? (
          <main className="max-w-md mx-auto px-6 py-16">
            <div className="bg-white rounded-2xl border border-border-subtle p-8 shadow-xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-700 shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="font-heading font-extrabold text-2xl text-deep-navy">
                  Acceso Restringido CRM
                </h2>
                <p className="text-charcoal-text text-xs leading-relaxed px-4">
                  Consola Administrativa de Socios de <strong>Specifinance S.A.S</strong>
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-charcoal-text uppercase tracking-wider mb-1.5 font-sans">
                    Usuario / Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (adminAuthError) setAdminAuthError('');
                    }}
                    placeholder="ej: specifinance@gmail.com"
                    className="w-full px-3.5 py-2 text-xs border border-border-subtle rounded-lg bg-surface-gray/50 focus:bg-white focus:border-deep-navy focus:ring-1 focus:ring-deep-navy text-deep-navy outline-none"
                    id="admin-login-email-input"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-charcoal-text uppercase tracking-wider mb-1.5 font-sans">
                    Clave de Acceso
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (adminAuthError) setAdminAuthError('');
                    }}
                    placeholder="Ingrese contraseña de socio"
                    className="w-full px-3.5 py-2 text-xs border border-border-subtle rounded-lg bg-surface-gray/50 focus:bg-white focus:border-deep-navy focus:ring-1 focus:ring-deep-navy text-deep-navy outline-none animate-none"
                    id="admin-login-password-input"
                  />
                </div>

                {adminAuthError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2 text-red-800 text-xs leading-snug">
                    <X className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                    <span>{adminAuthError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-deep-navy hover:bg-black text-white py-2.5 rounded-lg font-heading font-medium text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg focus:outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  id="admin-login-submit"
                >
                  {loginLoading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando...</>
                  ) : (
                    <><UserCheck className="w-3.5 h-3.5" /> Verificar Credenciales</>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-border-subtle text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAdminMode(false);
                    setAdminAuthError('');
                  }}
                  className="text-indigo-650 hover:text-indigo-800 font-semibold text-xs text-center"
                >
                  ← Volver a la Landing Page Pública
                </button>
              </div>

            </div>
          </main>
        ) : (
          <main className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-6">
            {/* Live connection status: tells the operator whether leads are being persisted */}
            {dbConnected === false ? (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-xs text-amber-900 leading-normal flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Modo demostración — base de datos no conectada.</strong>
                  Los leads mostrados son datos de ejemplo y las solicitudes nuevas no se guardan. Conecta una base de datos <strong>Neon Postgres</strong> desde Vercel (pestaña Storage) para registrar clientes reales de forma permanente.
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-xs text-emerald-900 leading-normal flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span><strong>Base de datos conectada.</strong> Cada solicitud enviada desde la web queda registrada aquí automáticamente.</span>
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded text-xs text-blue-900 leading-normal flex justify-between items-start gap-3">
              <div className="flex gap-3 items-start">
                <Database className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Consola Backoffice Operativa (CRM):</strong>
                  Aquí llegan las solicitudes ingresadas desde la web. Use los filtros para encontrar leads, actualizar su estado (e.g. "Reunión Agendada"), redactar respuestas con plantillas y gestionar el seguimiento comercial.
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={loadLeads}
                  disabled={leadsLoading}
                  title="Actualizar leads desde el servidor"
                  className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1 rounded text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3 h-3 ${leadsLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
                <button
                  onClick={() => {
                    setToken(null);
                    setIsAdminAuthenticated(false);
                    setAdminMode(false);
                    setAdminEmail('');
                    setAdminPassword('');
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-3 py-1 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>

            <AdminDashboard
              leads={leads}
              bookings={bookings}
              emailLogs={emailLogs}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onAddLead={handleAddLead}
              onAddBooking={handleAddBooking}
              onSendEmail={handleSendEmailLog}
            />
          </main>
        )
      ) : (
        /* PUBLIC LANDING PORTAL */
        <div>
          {/* Hero Section */}
          <header id="inicio" className="relative overflow-hidden pt-12 pb-24 md:py-32">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              
              <div className="space-y-6">
                <motion.span variants={fadeInUp} className="inline-flex py-1 px-3 bg-white/70 border border-border-subtle rounded text-deep-navy font-sans text-[11px] tracking-widest uppercase font-semibold">
                  📈 Consultoría Boutique de Estrategia
                </motion.span>
                
                <motion.h1 variants={fadeInUp} className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-deep-navy leading-tight tracking-tight">
                  Dirección financiera y crecimiento corporativo basados en datos.
                </motion.h1>
                
                <motion.p variants={fadeInUp} className="text-charcoal-text text-base md:text-lg max-w-xl leading-relaxed">
                  Actuamos como la dirección financiera externa de tu empresa, alineando las decisiones comerciales, financieras y de crecimiento para maximizar la rentabilidad y el impacto de cada inversión.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-deep-navy text-white hover:bg-black hover:-translate-y-1 hover:shadow-xl text-center px-8 py-3.5 rounded font-heading font-medium text-sm transition-all duration-300 shadow-lg block"
                  >
                    Agenda una reunión gratuita para tu consultoría
                  </a>
                  <a 
                    href="#metodologia" 
                    className="border border-deep-navy text-deep-navy hover:bg-deep-navy hover:text-white text-center px-8 py-3.5 rounded font-heading font-medium text-sm transition-all duration-300 block"
                  >
                    Ver Metodología de Trabajo
                  </a>
                </motion.div>
              </div>

              {/* Graphic dashboard preview */}
              <motion.div variants={fadeInUp} className="relative">
                <div className="bg-white rounded-xl boutique-shadow border border-border-subtle p-3 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:border-indigo-200">
                  <img 
                    alt="Financial Dashboard" 
                    className="w-full h-auto rounded-lg shadow-sm" 
                    referrerPolicy="no-referrer"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX6w3wgJQFvvKPXhF0dxFHuPKeW4h5fgZIUt3ePTxgo10HZ1NjjchwE_gv_OeP_H4-Ch9WC_yHkWa0alJeb4uxwI1HlzY9hUOpvqcPuESXvYHQkgMRn_R8kE9ETw0exq4689SErSRxlJo2B0y_NuRyZ_4MQ9rk8h110-IECkBgqStgaVr3FGWNds3SOYD6VctfN1W-dQih2w_ypPXz2HStz_lVm6nX-jnSBNwKoGrQf51Owv3thEc5HUmDIld4lCXZB8yPuXCYs5o" 
                  />
                </div>
                {/* Floating Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-6 -left-6 bg-deep-navy text-white p-5 rounded-lg shadow-xl max-w-xs hidden md:block border border-white/10"
                >
                  <p className="font-heading text-lg font-bold leading-snug">
                    Finanzas + Marketing + Datos = <span className="text-growth-green font-extrabold">Crecimiento rentable</span>
                  </p>
                  <p className="text-white/60 text-[11px] mt-1.5 font-mono">
                    Auditoría Boutique Real con Retorno de Inversión.
                  </p>
                </motion.div>
              </motion.div>

            </motion.div>
          </header>

          {/* (Sección "Dilema" fusionada dentro de "¿Qué hacemos?" más abajo) */}

          {/* Value Connection Block - Visual & High Impact */}
          <motion.section 
            id="que-hacemos" 
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="py-24 bg-white"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                <motion.div variants={fadeInUp} className="lg:col-span-6 space-y-6">
                  <span className="inline-block py-1 px-3 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 font-sans text-[11px] tracking-widest uppercase font-semibold">
                    ✅ ¿Qué Hacemos?
                  </span>

                  <h2 className="font-heading font-extrabold text-3.5xl md:text-5xl text-deep-navy leading-tight tracking-tight">
                    Transformamos información financiera y comercial en <span className="text-indigo-650">crecimiento rentable</span>.
                  </h2>

                  <p className="text-charcoal-text text-sm md:text-base leading-relaxed">
                    En Specifinance integramos dirección financiera, estrategia de crecimiento y análisis de datos para ayudar a las empresas a tomar mejores decisiones, planificar de forma adecuada las finanzas de la empresa y aumentar su valor.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 group">
                    <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-white/50 rounded-xl border border-indigo-100 flex flex-col gap-1.5 transition-all hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-indigo-100 p-1.5 rounded-md">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Crecimiento Real</span>
                      </div>
                      <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-deep-navy to-indigo-600 leading-none drop-shadow-sm transition-all">+24%</span>
                      <span className="text-xs font-bold text-slate-800 font-sans tracking-tight uppercase">Incremento del EBITDA</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1 border-t border-indigo-50 pt-2">
                        Mejora promedio en rentabilidad tras optimizar estructuras de costos e inversión comercial.
                      </p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-green-50/50 to-white/50 rounded-xl border border-green-100 flex flex-col gap-1.5 transition-all hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:border-green-200 duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-green-100 p-1.5 rounded-md">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Visibilidad Total</span>
                      </div>
                      <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400 leading-none drop-shadow-sm transition-all">100%</span>
                      <span className="text-xs font-bold text-slate-800 font-sans tracking-tight uppercase">Decisiones Data-Driven</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1 border-t border-green-50 pt-2">
                        Cero conjeturas. Sustentamos el crecimiento integrando tableros de control y flujo de caja diario.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* The 4 core problems we solve (merged from the former "Dilemma" block) */}
                <motion.div variants={fadeInUp} className="lg:col-span-6 space-y-5">
                  <h3 className="font-heading font-bold text-lg md:text-xl text-deep-navy leading-snug">
                    ¿Qué está frenando realmente el crecimiento de tu empresa?
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-border-subtle space-y-2 shadow-sm hover:border-deep-navy transition-all duration-300 transform hover:-translate-y-1">
                      <span className="w-9 h-9 rounded-full bg-slate-100 text-deep-navy flex items-center justify-center font-bold text-sm">01</span>
                      <h4 className="font-heading font-bold text-xs text-deep-navy uppercase tracking-wider">Opacidad en Rentabilidad</h4>
                      <p className="text-charcoal-text text-[11px] leading-relaxed">Desconocimiento de la rentabilidad real por producto, cliente o unidad de negocio. No todo lo que factura deja dinero.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-border-subtle space-y-2 shadow-sm hover:border-deep-navy transition-all duration-300 transform hover:-translate-y-1">
                      <span className="w-9 h-9 rounded-full bg-slate-100 text-deep-navy flex items-center justify-center font-bold text-sm">02</span>
                      <h4 className="font-heading font-bold text-xs text-deep-navy uppercase tracking-wider">Marketing sin Retorno</h4>
                      <p className="text-charcoal-text text-[11px] leading-relaxed">Inversión publicitaria sin una medición clara del retorno sobre la inversión de marketing publicitario (ROMI) real.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-border-subtle space-y-2 shadow-sm hover:border-deep-navy transition-all duration-300 transform hover:-translate-y-1">
                      <span className="w-9 h-9 rounded-full bg-slate-100 text-deep-navy flex items-center justify-center font-bold text-sm">03</span>
                      <h4 className="font-heading font-bold text-xs text-deep-navy uppercase tracking-wider">Costos Ocultos de Planta</h4>
                      <p className="text-charcoal-text text-[11px] leading-relaxed">Fuga constante de capital en procesos ineficientes y costos operativos de personal o logística no identificados.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-border-subtle space-y-2 shadow-sm hover:border-deep-navy transition-all duration-300 transform hover:-translate-y-1">
                      <span className="w-9 h-9 rounded-full bg-slate-100 text-deep-navy flex items-center justify-center font-bold text-sm">04</span>
                      <h4 className="font-heading font-bold text-xs text-deep-navy uppercase tracking-wider">Intuición vs Datos</h4>
                      <p className="text-charcoal-text text-[11px] leading-relaxed">Decisiones de contratación, inventario y expansión basadas en sensaciones o el "feeling" empresarial.</p>
                    </div>
                  </div>

                  <p className="text-charcoal-text text-xs leading-relaxed border-t border-border-subtle pt-4">
                    <strong className="text-deep-navy">Identificar los problemas es solo el primer paso.</strong> Resolverlos es donde generamos valor.
                  </p>
                </motion.div>
              </div>

            </div>
          </motion.section>

          {/* (Sección comparativa "¿Por qué eligen Specifinance?" eliminada — redundante con el banner "mejor alternativa" en SmeSolutions) */}

          {/* TWO PILLARS CORPORATE INTERACTION SECTION */}
          <motion.section 
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="py-24 bg-white border-b border-border-subtle" 
            id="ejes-especializacion"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <motion.div variants={fadeInUp} className="lg:col-span-8 space-y-4">
                  <span className="inline-flex py-1 px-3 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 font-sans text-[11px] tracking-widest uppercase font-semibold">
                    🔑 Estructura Organizacional de Alto Valor
                  </span>
                  <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-deep-navy leading-tight tracking-tight">
                    Dirección Profesional Independiente. <span className="text-indigo-600">Sinergia Financiera Absoluta.</span>
                  </h2>
                  <p className="text-charcoal-text text-sm md:text-base max-w-3xl leading-relaxed">
                    Specifinance es una firma boutique que no improvisa. Operamos bajo dos ejes estratégicos fundamentales independientes en su desarrollo técnico, pero sincronizados de forma operativa para que cada centavo invertido comercialmente esté respaldado por un diagnóstico financiero real.
                  </p>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="lg:col-span-4 flex lg:justify-end">
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full lg:w-auto" id="pillar-tabs">
                    <button
                      onClick={() => setActivePillarTab('financial')}
                      className={`flex-1 lg:flex-initial text-center py-2.5 px-5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                        activePillarTab === 'financial'
                          ? 'bg-deep-navy text-white shadow-md transform scale-105'
                          : 'text-charcoal-text hover:text-deep-navy hover:bg-white'
                      }`}
                    >
                      💼 Eje Financiero
                    </button>
                    <button
                      onClick={() => setActivePillarTab('marketing')}
                      className={`flex-1 lg:flex-initial text-center py-2.5 px-5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                        activePillarTab === 'marketing'
                          ? 'bg-deep-navy text-white shadow-md transform scale-105'
                          : 'text-charcoal-text hover:text-deep-navy hover:bg-white'
                      }`}
                    >
                      📢 Eje Marketing
                    </button>
                    <button
                      onClick={() => setActivePillarTab('synergy')}
                      className={`flex-1 lg:flex-initial text-center py-2.5 px-5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                        activePillarTab === 'synergy'
                          ? 'bg-deep-navy text-white shadow-md transform scale-105'
                          : 'text-charcoal-text hover:text-deep-navy hover:bg-white'
                      }`}
                    >
                      🔗 Ciclo de Sinergia
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* ACTIVE TAB CONTENT CONTAINER */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activePillarTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-surface-gray rounded-2xl border border-border-subtle p-6 md:p-10 hover:shadow-md transition-shadow"
                >
                
                {/* 1. FINANCIAL PILLAR - Synthesized & Visual */}
                {activePillarTab === 'financial' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left: Leadership & Core Scope */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="flex gap-4 items-center p-4 bg-white rounded-xl border border-border-subtle shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-200">
                          JS
                        </div>
                        <div>
                          <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
                            CFO de la Firma
                          </span>
                          <h4 className="font-heading font-extrabold text-base text-deep-navy">
                            Juan Suarez
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                          Especialidades y Control de Caja:
                        </h4>
                        <p className="text-charcoal-text text-xs leading-relaxed">
                          Blindamos la liquidez y controlamos egresos ocultos para que el negocio siga operando con márgenes sólidos y saludables.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="bg-white p-2.5 rounded border border-border-subtle text-left">
                            <span className="text-[11px] font-bold text-deep-navy block">📊 EBITDA Sólido</span>
                            <span className="text-[9.5px] text-slate-500">Recortes inmediatos de ineficiencias de planta.</span>
                          </div>
                          <div className="bg-white p-2.5 rounded border border-border-subtle text-left">
                            <span className="text-[11px] font-bold text-deep-navy block">💸 Caja Semanal</span>
                            <span className="text-[9.5px] text-slate-500">Control absoluto de flujos de efectivo futuros.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Dual Card Visual comparison Before / After */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Antes: Red alert cards */}
                      <div className="bg-red-50/50 border border-red-100 p-5 rounded-xl space-y-3">
                        <span className="inline-block px-2 py-0.5 bg-red-1050/10 text-red-700 text-[9px] font-bold uppercase rounded">
                          Gestión Tradicional
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                          <li className="flex gap-1.5 items-start">
                            <span className="text-red-500 font-extrabold shrink-0">✕</span>
                            <span>Solo ves los resultados a mes vencido cuando el problema ya ocurrió.</span>
                          </li>
                          <li className="flex gap-1.5 items-start">
                            <span className="text-red-500 font-extrabold shrink-0">✕</span>
                            <span>Contabilidad fiscal básica sin visión estratégica comercial.</span>
                          </li>
                          <li className="flex gap-1.5 items-start">
                            <span className="text-red-500 font-extrabold shrink-0">✕</span>
                            <span>Incertidumbre en caja y dependencia constante de préstamos.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Después: Specifinance card */}
                      <div className="bg-indigo-50/55 border border-indigo-100 p-5 rounded-xl space-y-3">
                        <span className="inline-block px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold uppercase rounded shadow-sm">
                          Con Specifinance
                        </span>
                        <ul className="space-y-2 text-xs text-deep-navy leading-relaxed">
                          <li className="flex gap-1.5 items-start">
                            <span className="text-growth-green font-extrabold shrink-0">✓</span>
                            <span><strong>Dashboards Diarios:</strong> Decisiones instantáneas con datos en vivo.</span>
                          </li>
                          <li className="flex gap-1.5 items-start">
                            <span className="text-growth-green font-extrabold shrink-0">✓</span>
                            <span><strong>CFO de Élite:</strong> Gerencia activa continua sin salarios pesados de planta.</span>
                          </li>
                          <li className="flex gap-1.5 items-start">
                            <span className="text-growth-green font-extrabold shrink-0">✓</span>
                            <span><strong>Previsibilidad:</strong> Saber de antemano el flujo de caja a 30 y 90 días.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. MARKETING & GROWTH PILLAR - Synthesized & Visual */}
                {activePillarTab === 'marketing' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left: Leadership & Core Scope */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="flex gap-4 items-center p-4 bg-white rounded-xl border border-border-subtle shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-pink-1050/10 flex items-center justify-center text-pink-600 font-bold text-lg border border-pink-200">
                          SG
                        </div>
                        <div>
                          <span className="text-[9px] bg-pink-50 border border-pink-100 text-pink-700 px-2 py-0.5 rounded font-bold uppercase">
                            Growth Director
                          </span>
                          <h4 className="font-heading font-extrabold text-base text-deep-navy">
                            Samuel Galeano
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-pink-900 uppercase tracking-wider">
                          Nuestra Maquinaria de Ventas:
                        </h4>
                        <p className="text-charcoal-text text-xs leading-relaxed">
                          Invertimos capital en pauta digital solo cuando el CFO ha comprobado que el margen comercial de cada producto es altamente rentable para tu PyME.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="bg-white p-2.5 rounded border border-border-subtle text-left">
                            <span className="text-[11px] font-bold text-deep-navy block">🎨 Identidad Premium</span>
                            <span className="text-[9.5px] text-slate-500">Posicionamiento de alto ticket B2B.</span>
                          </div>
                          <div className="bg-white p-2.5 rounded border border-border-subtle text-left">
                            <span className="text-[11px] font-bold text-deep-navy block">📈 Pauta por Datos</span>
                            <span className="text-[9.5px] text-slate-500">Inyección enfocada al retorno total (ROMI).</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Dual Card Visual comparison Before / After */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Antes: Red alert cards */}
                      <div className="bg-red-50/50 border border-red-100 p-5 rounded-xl space-y-3">
                        <span className="inline-block px-2 py-0.5 bg-red-1050/10 text-red-700 text-[9px] font-bold uppercase rounded">
                          Marketing Común
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                          <li className="flex gap-1.5 items-start">
                            <span className="text-red-500 font-extrabold shrink-0">✕</span>
                            <span>Métricas vanidosas de likes o vistas que no traen dinero real al banco.</span>
                          </li>
                          <li className="flex gap-1.5 items-start">
                            <span className="text-red-500 font-extrabold shrink-0">✕</span>
                            <span>Invertir en pauta a ciegas sin calcular el coste de adquisición (CAC).</span>
                          </li>
                          <li className="flex gap-1.5 items-start">
                            <span className="text-red-500 font-extrabold shrink-0">✕</span>
                            <span>Poco valor percibido, lo que te obliga a bajar precios para competir.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Después: Specifinance card */}
                      <div className="bg-pink-50/40 border border-pink-100 p-5 rounded-xl space-y-3">
                        <span className="inline-block px-2 py-0.5 bg-pink-600 text-white text-[9px] font-bold uppercase rounded shadow-sm">
                          Con Specifinance
                        </span>
                        <ul className="space-y-2 text-xs text-deep-navy leading-relaxed">
                          <li className="flex gap-1.5 items-start">
                            <span className="text-growth-green font-extrabold shrink-0">✓</span>
                            <span><strong>Pauta Científica:</strong> Invertimos pauta sobre lo que realmente deja margen contable.</span>
                          </li>
                          <li className="flex gap-1.5 items-start">
                            <span className="text-growth-green font-extrabold shrink-0">✓</span>
                            <span><strong>Posicionamiento B2B:</strong> LinkedIn y branding de élite para ganar estatus corporativo.</span>
                          </li>
                          <li className="flex gap-1.5 items-start">
                            <span className="text-growth-green font-extrabold shrink-0">✓</span>
                            <span><strong>Métrica Única:</strong> Evaluamos el costo por lead calificado y el EBITDA final de ventas.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. SYNERGY CYCLE */}
                {activePillarTab === 'synergy' && (
                  <div className="space-y-8">
                    
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <span className="text-[10px] bg-green-50 text-green-700 font-mono tracking-widest px-3 py-1 rounded uppercase font-bold">
                        Bucle Virtuoso: SF Growth Framework
                      </span>
                      <h3 className="font-heading font-extrabold text-2xl text-deep-navy">
                        ¿Cómo trabajan de la mano Finanzas y Marketing?
                      </h3>
                      <p className="text-charcoal-text text-xs leading-relaxed">
                        A diferencia de contratar una agencia de marketing común que "quema plata" para buscar likes ficticios, o una firma contable tradicional que solo entrega un balance histórico frío para archivar, Specifinance unifica ambos mundos logrando que se retroalimenten constantemente:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative pt-4">
                      
                      {/* Step 1 */}
                      <div className="bg-white p-5 rounded-xl border border-border-subtle relative hover:border-indigo-500 transition-all">
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700">1</div>
                        <TrendingUp className="w-8 h-8 text-indigo-600 mb-3" />
                        <h4 className="font-heading font-bold text-sm text-deep-navy">1. Diagnóstico Financiero</h4>
                        <p className="text-charcoal-text text-xs mt-2 leading-relaxed">
                          El Director Financiero audita la estructura de costos y márgenes brutos. Detecta qué líneas de negocio entregan la rentabilidad real más elevada y en cuáles hay pérdidas operativas ocultas.
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-white p-5 rounded-xl border border-border-subtle relative hover:border-indigo-500 transition-all">
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700">2</div>
                        <BarChart3 className="w-8 h-8 text-indigo-600 mb-3" />
                        <h4 className="font-heading font-bold text-sm text-deep-navy">2. Redistribución de Caja</h4>
                        <p className="text-charcoal-text text-xs mt-2 leading-relaxed">
                          La tesorería restringe y corta presupuestos en canales ineficientes o líneas de bajo margen para liberar flujo de caja líquido. Ese presupuesto se transfiere directamente a crecimiento.
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-white p-5 rounded-xl border border-border-subtle relative hover:border-indigo-500 transition-all">
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700">3</div>
                        <CheckCircle2 className="w-8 h-8 text-indigo-600 mb-3" />
                        <h4 className="font-heading font-bold text-sm text-deep-navy">3. Ejecución Comercial</h4>
                        <p className="text-charcoal-text text-xs mt-2 leading-relaxed">
                          La Directora de Marketing diseña tácticas de captación (Rebranding, Pauta Directa, B2B LinkedIn) apuntando exclusivamente a las líneas con mejor retorno financiero. La pauta va a lo seguro.
                        </p>
                      </div>

                      {/* Step 4 */}
                      <div className="bg-white p-5 rounded-xl border border-border-subtle relative hover:border-indigo-500 transition-all">
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700">4</div>
                        <Sparkles className="w-8 h-8 text-indigo-600 mb-3" />
                        <h4 className="font-heading font-bold text-sm text-deep-navy">4. Re-Inyección de Retorno</h4>
                        <p className="text-charcoal-text text-xs mt-2 leading-relaxed">
                          La facturación de alto margen entra directamente a nutrir el capital circulante de la compañía, elevando el valor de la empresa en múltiplos sectoriales, preparándola para rondas o deudas.
                        </p>
                      </div>

                    </div>

                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg text-center max-w-xl mx-auto">
                      <p className="text-xs text-indigo-950 font-medium">
                        💼 <strong>Principio Rector de Specifinance:</strong> "Se invierte en pauta comercial solo para captar clientes con márgenes previamente validados y costeados por el CFO."
                      </p>
                    </div>

                  </div>
                )}
                
                </motion.div>
              </AnimatePresence>

            </div>
          </motion.section>

          {/* Financial Units Services list */}
          <motion.section 
            id="servicios" 
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="py-24 bg-surface-gray border-b border-border-subtle"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
              <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-semibold text-muted-gold uppercase tracking-widest block font-mono">
                  Portafolio de Soluciones
                </span>
                <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-deep-navy">
                  Nuestras Unidades de Servicio
                </h2>
                <p className="text-charcoal-text text-xs leading-relaxed max-w-md mx-auto">
                  Seleccione el formato que mejor se alinee a su escala operativa actual para ver o simular su presupuesto.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Unit 1 */}
                <motion.div variants={fadeInUp} className="bg-white p-8 rounded-xl border border-border-subtle flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100">
                  <div className="space-y-4">
                    <span className="inline-block px-2.5 py-1 text-[9px] bg-indigo-600 text-white rounded font-mono font-bold tracking-widest uppercase shadow-sm">
                      MÁS SOLICITADO
                    </span>
                    <h3 className="font-heading font-bold text-xl text-deep-navy">
                      Full Growth Partner
                    </h3>
                    <p className="text-charcoal-text text-xs leading-relaxed pb-2">
                      Actuamos como el aliado estratégico de crecimiento de tu empresa, integrando dirección financiera, análisis de datos y estrategia comercial para que cada inversión, campaña y decisión de expansión contribuya a resultados medibles, rentables y sostenibles.
                    </p>
                    <ul className="space-y-2 text-xs text-charcoal-text">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> CFO Externo y Growth Partner en un solo equipo.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Estrategia financiera, comercial y de marketing alineada.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Dashboards ejecutivos y seguimiento de KPIs clave.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Soporte estratégico para crecimiento, inversión y expansión.
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button 
                      onClick={() => setActiveServiceModal('full-partner')}
                      className="w-full text-center py-2.5 bg-deep-navy text-white hover:bg-indigo-900 shadow-sm transition-all text-xs font-semibold uppercase tracking-wider rounded border border-transparent"
                    >
                      Saber más e Iniciar Diagnóstico
                    </button>
                  </div>
                </motion.div>

                {/* Unit 2 */}
                <motion.div variants={fadeInUp} className="bg-white p-8 rounded-xl border border-border-subtle flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100">
                  <div className="space-y-4">
                    <span className="inline-block px-2.5 py-1 text-[9px] bg-slate-100 text-deep-navy rounded font-mono font-bold tracking-widest uppercase">
                      DIRECCIÓN ESTRUCTURAL
                    </span>
                    <h3 className="font-heading font-bold text-xl text-deep-navy">
                      CFO as a Service
                    </h3>
                    <p className="text-charcoal-text text-xs leading-relaxed pb-2">
                      Actuamos como el CFO externo de tu empresa, proporcionando planeación financiera, proyecciones estratégicas y acompañamiento continuo para mejorar la rentabilidad, optimizar el flujo de caja y respaldar decisiones de crecimiento con información confiable.
                    </p>
                    <ul className="space-y-2 text-xs text-charcoal-text">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Planeación financiera estratégica.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Proyecciones y modelación de escenarios.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Control de flujo de caja y liquidez.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Análisis de rentabilidad y desempeño.
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button 
                      onClick={() => setActiveServiceModal('cfo-service')}
                      className="w-full text-center py-2.5 bg-slate-50 border border-border-subtle text-deep-navy hover:bg-slate-100 hover:border-slate-300 shadow-sm transition-all text-xs font-semibold uppercase tracking-wider rounded"
                    >
                      Saber más e Iniciar Diagnóstico
                    </button>
                  </div>
                </motion.div>

                {/* Unit 3 */}
                <motion.div variants={fadeInUp} className="bg-white p-8 rounded-xl border border-border-subtle flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100">
                  <div className="space-y-4">
                    <span className="inline-block px-2.5 py-1 text-[9px] bg-slate-100 text-deep-navy rounded font-mono font-bold tracking-widest uppercase">
                      DATOS Y OPTIMIZACIÓN
                    </span>
                    <h3 className="font-heading font-bold text-xl text-deep-navy">
                      Data-Driven Growth
                    </h3>
                    <p className="text-charcoal-text text-xs leading-relaxed pb-2">
                      Diseñamos estrategias de crecimiento respaldadas por datos, analizando el desempeño comercial y de marketing para identificar oportunidades de optimización, adquisición de clientes y mejora del retorno sobre la inversión en publicidad.
                    </p>
                    <ul className="space-y-2 text-xs text-charcoal-text">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Planeación estratégica de marketing y crecimiento.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Optimización de inversión publicitaria y generación de demanda.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Análisis de datos comerciales y comportamiento de clientes.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-growth-green flex-shrink-0" /> Medición de indicadores de crecimiento y retorno de inversión.
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button 
                      onClick={() => setActiveServiceModal('data-driven')}
                      className="w-full text-center py-2.5 bg-slate-50 border border-border-subtle text-deep-navy hover:bg-slate-100 hover:border-slate-300 shadow-sm transition-all text-xs font-semibold uppercase tracking-wider rounded"
                    >
                      Saber más e Iniciar Diagnóstico
                    </button>
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.section>

          {/* SF Growth Framework */}
          <section id="metodologia" className="py-24 bg-white border-b border-border-subtle">
            <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
              <div className="text-center space-y-3">
                <h2 className="font-heading font-extrabold text-3xl text-deep-navy">
                  SF Growth Framework
                </h2>
                <p className="text-charcoal-text text-xs max-w-sm mx-auto">
                  La hoja de ruta estructurada y lógica que garantiza la mitigación de fugas y el escalamiento exitoso de toda PyME.
                </p>
              </div>

              <div className="relative">
                {/* Horizontal timeline line */}
                <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-0.5 bg-border-subtle z-0" />
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                  
                  <div className="text-center space-y-4 group">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold text-center flex items-center justify-center mx-auto text-lg font-mono shadow-[0_0_15px_rgba(79,70,229,0.1)] group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                      01
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-deep-navy tracking-tight group-hover:text-indigo-700 transition-colors">
                      Fase 1: Diagnóstico Estratégico
                    </h4>
                    <p className="text-charcoal-text text-xs leading-relaxed px-2">
                      Análisis financiero profundo, revisión de costos, flujo de caja, márgenes reales, modelo comercial y estructura de crecimiento para identificar áreas de mejora inmediata.
                    </p>
                  </div>

                  <div className="text-center space-y-4 group">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold text-center flex items-center justify-center mx-auto text-lg font-mono shadow-[0_0_15px_rgba(79,70,229,0.1)] group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                      02
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-deep-navy tracking-tight group-hover:text-indigo-700 transition-colors">
                      Fase 2: Dirección Estructurada
                    </h4>
                    <p className="text-charcoal-text text-xs leading-relaxed px-2">
                      Implementación de proyecciones financieras precisas, presupuestación estratégica, control total de liquidez y diseño de indicadores clave (KPIs) para una toma de decisiones informada.
                    </p>
                  </div>

                  <div className="text-center space-y-4 group">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold text-center flex items-center justify-center mx-auto text-lg font-mono shadow-[0_0_15px_rgba(79,70,229,0.1)] group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                      03
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-deep-navy tracking-tight group-hover:text-indigo-700 transition-colors">
                      Fase 3: Optimización y Ejecución
                    </h4>
                    <p className="text-charcoal-text text-xs leading-relaxed px-2">
                      Evaluación de inversión comercial, análisis de rentabilidad por canal, modelación de escenarios y ejecución táctica (Rebranding, Pauta, LinkedIn B2B) para disparar el flujo de caja.
                    </p>
                  </div>

                  <div className="text-center space-y-4 group">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold text-center flex items-center justify-center mx-auto text-lg font-mono shadow-[0_0_15px_rgba(79,70,229,0.1)] group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                      04
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-deep-navy tracking-tight group-hover:text-indigo-700 transition-colors">
                      Fase 4: Acompañamiento Continuo
                    </h4>
                    <p className="text-charcoal-text text-xs leading-relaxed px-2">
                      Comités periódicos de dirección estratégica, ajustes basados en resultados reales de marketing y finanzas, y monitoreo constante para asegurar rentabilidad a largo plazo.
                    </p>
                  </div>

                </div>
              </div>

              {/* Recuadro rescatado de la antigua sección de Gobernanza/Roadmap */}
              <div className="bg-gradient-to-br from-deep-navy to-slate-900 border border-indigo-500/20 rounded-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-1 space-y-2">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono tracking-widest px-2 py-0.5 rounded font-bold uppercase">
                    Visión Escalable
                  </span>
                  <h3 className="font-heading font-extrabold text-lg text-white">
                    Escalabilidad Tecnológica Integrada
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Cada fase del framework se apoya en tecnología propia para que tus decisiones tengan datos en vivo detrás.
                  </p>
                </div>
                <ul className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/80">
                  <li className="flex items-center gap-2"><span className="text-growth-green font-bold">✓</span> Integración nativa de datos financieros y de marketing.</li>
                  <li className="flex items-center gap-2"><span className="text-growth-green font-bold">✓</span> Consola central interactiva en tiempo real para clientes.</li>
                  <li className="flex items-center gap-2"><span className="text-growth-green font-bold">✓</span> Modelos deductivos y proyectivos de liquidez inteligentes.</li>
                  <li className="flex items-center gap-2"><span className="text-growth-green font-bold">✓</span> Benchmarking automatizado de sectores productivos.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Soluciones prácticas PyMEs (tarjetas) + banner de cierre "mejor alternativa" */}
          <SmeSolutions onSelectSmeNeed={handleSelectSmeNeed} />

          {/* (Sección "aliado idóneo" eliminada — su foto se reutiliza como fondo del banner "mejor alternativa") */}

          {/* COMBINED FORM & REAL SCHEDULER */}
          <section id="contacto" className="py-24 bg-deep-navy text-white relative">
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left description details */}
              <div className="lg:col-span-5 space-y-6">
                <span className="inline-block py-1 px-3 bg-white/10 rounded text-muted-gold font-mono text-[10px] uppercase font-bold tracking-widest">
                  Canal Directo de Auditoría
                </span>
                
                <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white">
                  Inicie su diagnóstico hoy.
                </h2>
                
                <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                  Complete el panel de solicitud de diagnóstico para registrar sus datos financieros en nuestra base de datos.
                </p>

                <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                  Una vez enviado,{' '}
                  <strong className="text-growth-green text-xs">se activará inmediatamente el módulo de reserva rápida</strong>{' '}
                  a la derecha para confirmar el dÍa y la hora exacta de su llamada sincrónica con un especialista.
                </p>

                <div className="border border-white/10 bg-white/5 p-4 rounded space-y-4">
                  <h4 className="text-xs font-heading font-bold text-muted-gold uppercase tracking-wider">
                    ¿Qué analizamos sin costo?
                  </h4>
                  <ul className="space-y-2 text-xs text-white/80">
                    <li className="flex gap-2">✓ Alianzas bancarias y estructura crediticia actual.</li>
                    <li className="flex gap-2">✓ Margen y EBITDA modelado por lÍnea comercial.</li>
                    <li className="flex gap-2">✓ Costo publicitario vs ingresos de caja reales.</li>
                  </ul>
                </div>
              </div>

              {/* Right column Form + Scheduler */}
              <div className="lg:col-span-7">
                
                {/* If submitted public form, display the Scheduler picker next! */}
                {formSubmitted && diagnosticLeadCreated ? (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Status diagnostic registered successfully */}
                    <div className="bg-white/10 border border-growth-green/55 p-6 rounded-xl space-y-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-growth-green/20 text-growth-green flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-heading font-bold text-base text-white">
                          ¡Diagnóstico Registrado en Base de Datos!
                        </h4>
                        <p className="text-white/80 text-xs max-w-sm mx-auto">
                          Estimado(a) <span className="font-bold underline text-muted-gold">{formName}</span>, registramos exitosamente su perfil {formCompany ? <>para <strong className="text-white">{formCompany}</strong></> : <>como contacto independiente / proyecto personal</>}.
                        </p>
                      </div>

                      <div className="text-[11px] text-white/60 bg-black/20 p-2.5 rounded font-mono text-left max-w-xs mx-auto">
                        ID Registro: {diagnosticLeadCreated.id} <br />
                        Plan de Interés: {diagnosticLeadCreated.serviceOfInterest} <br />
                        Asignación: En Espera de Agenda
                      </div>

                      <button
                        onClick={resetPublicForm}
                        className="w-full bg-muted-gold text-deep-navy hover:brightness-105 font-heading font-bold text-sm py-4 px-5 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-muted-gold"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Registrar otra solicitud
                      </button>
                    </div>

                    <div className="bg-white text-deep-navy rounded-xl overflow-hidden shadow-2xl p-8 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h4 className="font-heading font-bold text-lg text-deep-navy">
                        Continúe en Calendly...
                      </h4>
                      <p className="text-sm text-charcoal-text max-w-sm mx-auto">
                        Se ha abierto una nueva pestaña para que seleccione el horario de su consultoría. Si no se abrió automáticamente, puede acceder mediante el siguiente enlace:
                      </p>
                      <a
                        href={CALENDLY_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-4 bg-deep-navy text-white px-6 py-2.5 rounded font-heading font-medium text-sm transition-all duration-300 hover:bg-indigo-900 border border-transparent shadow shadow-indigo-500/10"
                      >
                        Abrir Calendly
                      </a>
                    </div>

                  </div>
                ) : (
                  
                  /* STANDARD PUBLIC DIAGNOSTIC REGISTERS FORM */
                  <form onSubmit={handleSubmitDiagnostic} className="bg-white text-deep-navy p-6 md:p-10 rounded-xl space-y-6 shadow-2xl border border-border-subtle">
                    
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                      <h3 className="font-heading font-extrabold text-lg text-deep-navy">
                        Solicitud de Diagnóstico Financiero
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          // Bypass / quick fill for testing!
                          setFormName('Sofía Restrepo');
                          setFormRole('Directora de Crecimiento');
                          setFormCompany('Restrepo & Co. SAS');
                          setFormEmail('sofia@restrepoco.com');
                          setFormPhone('+57 301 999 8888');
                          setFormCity('Bogotá - Textil');
                          setFormNeeds('Problemas graves de control presupuestal mensual y fugas operativas.');
                        }}
                        className="text-[10px] text-deep-navy hover:underline italic"
                        title="Rellenar campos con datos ficticios válidos"
                      >
                        [Autorellenar Test]
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider">
                          Nombre Completo
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ej: Sofía Restrepo"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full px-3 py-2 border border-border-subtle rounded focus:border-deep-navy text-xs focus:ring-0"
                          id="form-full-name"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider">
                          Cargo u Ocupación (Opcional)
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ej: Director, Consultor, Independiente"
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value)}
                          className="w-full px-3 py-2 border border-border-subtle rounded focus:border-deep-navy text-xs focus:ring-0 shadow-sm"
                          id="form-role"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider">
                          Empresa o Proyecto (Opcional)
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ej: Proyecto Personal, Nombre de Empresa"
                          value={formCompany}
                          onChange={(e) => setFormCompany(e.target.value)}
                          className="w-full px-3 py-2 border border-border-subtle rounded focus:border-deep-navy text-xs focus:ring-0 shadow-sm"
                          id="form-company"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider flex justify-between">
                          <span>Correo de Contacto</span>
                          <span className="text-[10px] text-indigo-600 font-bold lowercase normal-case">personal o corporativo</span>
                        </label>
                        <input 
                          type="email" 
                          required
                          placeholder="ejemplo@correo.com"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-border-subtle rounded focus:border-deep-navy text-xs focus:ring-0"
                          id="form-email"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider flex justify-between">
                          <span>Teléfono / Celular</span>
                          <span className="text-[10px] text-indigo-600 font-bold lowercase normal-case flex-shrink-0 ml-1">móvil o whatsapp</span>
                        </label>
                        <input 
                          type="tel" 
                          required
                          placeholder="+57 301 000 0000"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-border-subtle rounded focus:border-deep-navy text-xs focus:ring-0"
                          id="form-phone"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider">
                          Ciudad y Sector (Opcional)
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ej: Bogotá - Alimentos, o Remoto"
                          value={formCity}
                          onChange={(e) => setFormCity(e.target.value)}
                          className="w-full px-3 py-2 border border-border-subtle rounded focus:border-deep-navy text-xs focus:ring-0"
                          id="form-city"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider">
                          Tamaño de la Empresa / Proyecto
                        </label>
                        <select 
                          value={formSize}
                          onChange={(e) => setFormSize(e.target.value)}
                          className="w-full px-3 py-2 border border-border-subtle rounded text-xs bg-white"
                          id="form-size"
                        >
                          <option>Independiente / No aplica</option>
                          <option>1 - 10 empleados</option>
                          <option>11 - 50 empleados</option>
                          <option>51 - 200 empleados</option>
                          <option>Más de 200 empleados</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider">
                          Unidad de Interés de Specifinance
                        </label>
                        <select 
                          value={formService}
                          onChange={(e) => setFormService(e.target.value)}
                          className="w-full px-3 py-2 border border-border-subtle rounded text-xs bg-white"
                          id="form-interest"
                        >
                          <option value="Full Growth Partner">Full Growth Partner (Completo)</option>
                          <option value="CFO as a Service">CFO as a Service (Contabilidad/Caja)</option>
                          <option value="Data-Driven Growth">Data-Driven Growth (Modelación)</option>
                        </select>
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider">
                        ¿Cuál es su principal necesidad financiera o comercial de crecimiento hoy?
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Cuéntenos llanamente los cuellos de botella de su negocio..."
                        value={formNeeds}
                        onChange={(e) => setFormNeeds(e.target.value)}
                        className="w-full px-3 py-2 border border-border-subtle rounded focus:border-deep-navy text-xs focus:ring-0 font-sans"
                        id="form-needs"
                      />
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        required
                        checked={formAgreed}
                        onChange={(e) => setFormAgreed(e.target.checked)}
                        className="mt-0.5" 
                        id="form-agree-checkbox"
                      />
                      <span className="text-[11px] text-charcoal-text leading-tight">
                        Acepto los términos y condiciones de la política de tratamiento de datos personales de Specifinance.
                      </span>
                    </div>

                    {submitError && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2 text-red-800 text-xs leading-snug">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-deep-navy text-white hover:bg-indigo-900 font-heading font-medium text-sm py-3.5 px-4 rounded transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:shadow-xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-wait disabled:translate-y-0"
                      id="form-btn-submit"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Registrando su solicitud...</>
                      ) : (
                        <>Enviar Solicitud de Diagnóstico y Agendar Cita
                        <ArrowRight className="w-4 h-4 text-growth-green transition-transform group-hover:translate-x-1" /></>
                      )}
                    </button>

                  </form>
                )}

              </div>
            </div>
          </section>
        </div>
      )}

      {/* Corporate Footing */}
      <footer className="bg-deep-navy text-white/90 pt-16 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 font-sans">
          
          <div className="space-y-4 col-span-1 md:col-span-1">
            <h4 className="font-heading font-extrabold text-xl text-white tracking-tight">
              Specifinance
            </h4>
            <p className="text-white/60 text-xs leading-relaxed">
              Financial precision for modern growth. Consultoría Boutique de elite para organizaciones que exigen control absoluto de márgenes respaldados por datos.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <h5 className="font-heading font-bold text-white uppercase tracking-widest text-[10px]">
              Estructura Corporativa
            </h5>
            <ul className="space-y-2 text-white/50">
              <li><a href="#que-hacemos" className="hover:text-growth-green transition-colors">Qué hacemos</a></li>
              <li><a href="#servicios" className="hover:text-growth-green transition-colors">Unidades de Servicio</a></li>
              <li><a href="#metodologia" className="hover:text-growth-green transition-colors">SF Growth Framework</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h5 className="font-heading font-bold text-white uppercase tracking-widest text-[10px]">
              Términos Legales
            </h5>
            <ul className="space-y-2 text-white/50">
              <li><a href="#contacto" className="hover:text-growth-green transition-colors">Tratamiento de Datos</a></li>
              <li><a href="#contacto" className="hover:text-growth-green transition-colors">Aviso de Privacidad</a></li>
              <li><a href="#contacto" className="hover:text-growth-green transition-colors">Términos del Servicio</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h5 className="font-heading font-bold text-white uppercase tracking-widest text-[10px]">
              Contacto y Sede.
            </h5>
            <ul className="space-y-2 text-white/50">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-growth-green" /> specifinance@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-growth-green" /> +57 310 247 9396
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-growth-green" /> Bogotá D.C., Colombia
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-white/40">
          <span>
            © 2026 Specifinance. Todos los derechos reservados. Consultoría Boutique de Excelencia.
          </span>
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => {
                setAdminMode(!adminMode);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-muted-gold hover:underline"
            >
              Toggle Admin Backoffice Panel
            </button>
          </div>
        </div>
      </footer>

      {/* Service Detail Modal */}
      <ServiceModal 
        isOpen={activeServiceModal !== null}
        serviceId={activeServiceModal}
        onClose={() => setActiveServiceModal(null)}
        onSelectService={(serviceName, serviceId) => {
          setFormService(serviceName);
          setServiceOfInterest(serviceId);
        }}
      />

    </div>
  );
}
