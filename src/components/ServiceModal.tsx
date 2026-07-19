import React, { useEffect } from 'react';
import { X, Check, ArrowRight, Target, LayoutDashboard, LineChart, TrendingUp, ShieldCheck, UserCheck } from 'lucide-react';

interface ServiceModalProps {
  isOpen: boolean;
  serviceId: string | null;
  onClose: () => void;
  onSelectService: (serviceName: string, serviceId: string) => void;
}

const serviceData: Record<string, any> = {
  'cfo-service': {
    title: 'CFO as a Service',
    subtitle: 'Dirección Financiera Externa',
    description: 'Actuamos como el CFO externo de la empresa, ayudando a la gerencia a tomar decisiones financieras respaldadas por análisis, proyecciones y métricas clave del negocio.',
    icon: <LayoutDashboard className="w-6 h-6 text-indigo-600" />,
    color: 'indigo',
    phases: [
      {
        name: 'Fase 1 – Diagnóstico Financiero',
        items: ['Estados financieros', 'Flujo de caja', 'Endeudamiento', 'Rentabilidad', 'Estructura de costos', 'Capital de trabajo']
      },
      {
        name: 'Fase 2 – Planeación Financiera',
        items: ['Presupuesto anual', 'Proyección de ingresos', 'Proyección de gastos', 'Proyección de caja', 'Escenarios de crecimiento']
      },
      {
        name: 'Fase 3 – Optimización',
        items: ['Costos innecesarios', 'Procesos ineficientes', 'Oportunidades de rentabilidad', 'Mejoras en capital de trabajo']
      },
      {
        name: 'Fase 4 – Dirección Financiera Continua',
        items: ['Revisar resultados', 'Ajustar presupuestos', 'Evaluar inversiones', 'Tomar decisiones estratégicas']
      }
    ],
    receives: [
      'Diagnóstico financiero completo', 'Planeación financiera estructurada', 'Proyecciones financieras', 'Control de flujo de caja', 'Análisis de rentabilidad', 'Dashboards financieros', 'Reuniones estratégicas periódicas', 'Recomendaciones para aumentar el valor de la empresa'
    ],
    results: [
      'Mayor control financiero', 'Mejor rentabilidad', 'Menor riesgo de liquidez', 'Mejor capacidad de crecimiento', 'Incremento del valor empresarial'
    ],
    formName: 'CFO as a Service'
  },
  'data-driven': {
    title: 'Data-Driven Growth',
    subtitle: 'Growth & Marketing Estratégico',
    description: 'Diseñamos y ejecutamos estrategias de marketing respaldadas por datos para aumentar la adquisición de clientes y maximizar el retorno de la inversión.',
    icon: <LineChart className="w-6 h-6 text-green-600" />,
    color: 'green',
    phases: [
      {
        name: 'Fase 1 – Diagnóstico Comercial',
        items: ['Clientes actuales', 'Embudo de ventas', 'Fuentes de adquisición', 'Competencia', 'Presencia digital']
      },
      {
        name: 'Fase 2 – Diseño Estratégico',
        items: ['Público objetivo', 'Canales de captación', 'Mensajes comerciales', 'Objetivos de crecimiento']
      },
      {
        name: 'Fase 3 – Implementación',
        items: ['Google Ads', 'Meta Ads', 'LinkedIn', 'Email Marketing', 'Automatizaciones', 'Contenido']
      },
      {
        name: 'Fase 4 – Optimización',
        items: ['CAC', 'ROAS', 'ROI', 'Conversiones', 'Leads', 'Ventas']
      }
    ],
    receives: [
      'Diagnóstico comercial y digital', 'Estrategia de crecimiento', 'Plan de marketing', 'Gestión y optimización de campañas', 'Dashboard comercial', 'Reportes de resultados', 'Reuniones de seguimiento'
    ],
    results: [
      'Más clientes potenciales', 'Mayor visibilidad', 'Mejor conversión', 'Menor costo de adquisición', 'Mayor retorno publicitario'
    ],
    formName: 'Data-Driven Growth'
  },
  'full-partner': {
    title: 'Full Growth Partner',
    subtitle: 'Dirección Integral de Crecimiento',
    description: 'Integramos dirección financiera, marketing y análisis de datos bajo una sola estrategia de crecimiento empresarial.',
    icon: <ShieldCheck className="w-6 h-6 text-deep-navy" />,
    color: 'slate',
    phases: [
      {
        name: 'Fase 1 – Diagnóstico Integral',
        items: ['Finanzas', 'Rentabilidad', 'Flujo de caja', 'Ventas', 'Marketing', 'Clientes', 'Operaciones']
      },
      {
        name: 'Fase 2 – Identificación de Oportunidades',
        items: ['Identificación de ventas en disminución', 'Detección de presiones en caja', 'Solución a dependencia de clientes']
      },
      {
        name: 'Fase 3 – Plan de Acción',
        items: ['Optimizar costos y rentabilidad', 'Implementar campañas de adquisición', 'Desarrollar nuevos canales comerciales', 'Mejorar conversión de ventas', 'Diseñar planes de expansión']
      },
      {
        name: 'Fase 4 – Dirección Estratégica Continua',
        items: ['Finanzas', 'Marketing', 'Crecimiento', 'Inversiones', 'Expansión']
      }
    ],
    receives: [
      'CFO Externo', 'Growth Partner', 'Diagnóstico integral del negocio', 'Planeación financiera y comercial', 'Estrategia de crecimiento', 'Dashboards ejecutivos', 'Seguimiento mensual', 'Recomendaciones estratégicas continuas'
    ],
    results: [
      'Crecimiento rentable', 'Más clientes', 'Mejor rentabilidad', 'Mejor flujo de caja', 'Decisiones respaldadas por datos', 'Incremento del valor de la empresa'
    ],
    formName: 'Full Growth Partner'
  }
};

export default function ServiceModal({ isOpen, serviceId, onClose, onSelectService }: ServiceModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !serviceId || !serviceData[serviceId]) return null;

  const data = serviceData[serviceId];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-deep-navy/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 animate-fade-in custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-5 border-b border-border-subtle flex justify-between items-start z-20">
          <div className="flex gap-4 items-center">
            <div className={`w-12 h-12 rounded-xl bg-${data.color}-50 flex items-center justify-center shrink-0 border border-${data.color}-100 shadow-sm`}>
              {data.icon}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-sans mb-1">{data.subtitle}</p>
              <h2 className="text-2xl font-heading font-extrabold text-deep-navy" id="modal-title">
                {data.title}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-12">
          
          {/* Introduction */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-deep-navy mb-3">¿Qué hacemos?</h3>
            <p className="text-slate-600 leading-relaxed max-w-3xl">
              {data.description}
            </p>
          </section>

          {/* Methodology */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-deep-navy mb-6">Metodología de Trabajo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Vertical line connecting phases */}
              <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-slate-200 -translate-x-1/2 z-0"></div>
              
              {data.phases.map((phase: any, index: number) => (
                <div key={index} className="bg-slate-50 border border-slate-200 p-5 rounded-xl block z-10 relative shadow-sm hover:shadow-md transition-shadow">
                  <span className="absolute -top-3 left-4 bg-deep-navy text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    {phase.name.split(' – ')[0]}
                  </span>
                  <h4 className="font-heading font-bold text-deep-navy mb-3 mt-1">{phase.name.split(' – ')[1]}</h4>
                  <ul className="space-y-2">
                    {phase.items.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <Target className="w-3.5 h-3.5 text-growth-green mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Direct Benefits (What you receive) */}
            <section className="bg-white border-2 border-indigo-50 p-6 rounded-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 mb-4 pb-2 border-b border-indigo-50">
                Qué recibe el cliente
              </h3>
              <ul className="space-y-3">
                {data.receives.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-growth-green/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-growth-green" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Expected Results */}
            <section className="bg-slate-900 text-white p-6 rounded-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-700">
                Resultados Esperados
              </h3>
              <ul className="space-y-3">
                {data.results.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-[-2px]">📈</span>
                    <span className="text-sm text-slate-200 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm px-6 py-5 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4 z-20">
          <div>
            <p className="text-xs text-slate-500 font-sans tracking-wide">
              ¿Listo para enfocar el crecimiento de su empresa?
            </p>
          </div>
          <button
            onClick={() => {
              onSelectService(data.formName, serviceId);
              onClose();
              document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto bg-deep-navy text-white px-8 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-indigo-900 transition-colors flex items-center justify-center gap-2"
          >
            Iniciar Diagnóstico
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
