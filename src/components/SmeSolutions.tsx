import { useState } from 'react';
import { Briefcase, Palette, Cpu, ArrowRight, CheckCircle, HelpCircle, Sparkles } from 'lucide-react';

interface SmeSolutionsProps {
  onSelectSmeNeed: (serviceName: string, needsStr: string) => void;
}

/**
 * Soluciones prácticas para PyMEs (tarjetas problema → solución → CTA que
 * pre-rellenan el formulario) + banner de cierre "mejor alternativa".
 * Se reutiliza la foto del equipo como fondo del banner para dar riqueza visual.
 */
export default function SmeSolutions({ onSelectSmeNeed }: SmeSolutionsProps) {
  const [activeCard, setActiveCard] = useState<'restructuracion' | 'marca' | 'procesos'>('restructuracion');

  const handleApplyNow = (service: string, needsText: string) => {
    onSelectSmeNeed(service, needsText);
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  const pymeSolutions = [
    {
      id: 'restructuracion' as const,
      icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
      tag: 'Caja y Estática Financiera',
      title: '¿Buscas una Reestructuración Financiera Práctica?',
      pain: 'Tu flujo de caja está asfixiado, dependes de préstamos constantes o no logras identificar en qué canales o procesos se está evaporando el dinero semana tras semana.',
      solution: 'Montamos un plan de choque financiero en 15 días: auditamos egresos ocultos, renegociamos plazos y tasas con bancos, establecemos reglas de tesorería y liberamos capital circulante para que vuelvas a respirar tranquilo.',
      pillText: 'Recorte inmediato de fugas de capital y alivio de liquidez',
      benefitItems: [
        'Negociación quirúrgica de pasivos bancarios',
        'Control semanal automatizado de Flujo de Caja',
        'Costeo preciso por unidades de negocio',
        'Plan de choque para mitigar pérdidas urgentes'
      ],
      associatedService: 'CFO as a Service',
      presetNeeds: 'Busco una Reestructuración Financiera Práctica para mi empresa. Necesito auditar mis pasivos, recortar fugas de caja, renegociar con acreedores y estabilizar mi flujo de efectivo operativo inmediato.'
    },
    {
      id: 'marca' as const,
      icon: <Palette className="w-5 h-5 text-indigo-600" />,
      tag: 'Tracción y Valor Percibido',
      title: '¿Buscas una Identidad de Marca Digital Premium?',
      pain: 'Haces un trabajo excelente, pero tu presencia digital parece amateur o genérica. Te cuesta justificar tarifas premium y tus vendedores enfrentan objeciones recurrentes de precio.',
      solution: 'Diseñamos un posicionamiento de élite que inspira la confianza de una gran firma. Construimos tu ecosistema corporativo en LinkedIn, creamos materiales de venta impecables y establecemos una marca que vende sola.',
      pillText: 'Atrae clientes dispuestos a pagar más sin regatear',
      benefitItems: [
        'Diseño de identidad visual premium con alto impacto',
        'Alineamiento de marca corporativa para segmento B2B',
        'Estructura comercial de presentaciones infalibles',
        'Estrategia de posicionamiento de alta gama en LinkedIn'
      ],
      associatedService: 'Full Growth Partner',
      presetNeeds: 'Busco potenciar la Identidad de Marca Digital de mi PyME y crear una reputación corporativa premium. Deseo aumentar el valor percibido para justificar tarifas más altas y simplificar el proceso comercial.'
    },
    {
      id: 'procesos' as const,
      icon: <Cpu className="w-5 h-5 text-indigo-600" />,
      tag: 'Soberanía de Operaciones',
      title: '¿Buscas una Implementación Correcta en tu Empresa?',
      pain: 'La compañía depende enteramente de que el dueño esté encima de cada departamento supervisando. Falta estandarización, la operación es ineficiente y no hay números claros.',
      solution: 'Estructuramos tu empresa con herramental lógico de nivel corporativo. Configuramos automatizaciones comerciales, capacitamos a tu equipo sobre KPIs claros y montamos dashboards en vivo para que todo opere de forma predecible sin ti.',
      pillText: 'Sistemas predecibles y procesos independientes del dueño',
      benefitItems: [
        'Estandarización de procesos contables y de venta',
        'Tableros interactivos e integraciones de datos en tiempo real',
        'Definición de KPIs diarios por operario/vendedor',
        'Automatizaciones de seguimiento de clientes potenciales'
      ],
      associatedService: 'Data-Driven Growth',
      presetNeeds: 'Busco implementar procesos robustos y correctos de gestión en mi PyME. Deseo automatizar tareas repetitivas, independizar mi operación de mi presencia constante y monitorear el desempeño con tableros interactivos.'
    }
  ];

  return (
    <section className="py-24 bg-white/50 border-b border-border-subtle" id="soluciones-pymes">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">

        {/* Lean header (sin el texto que duplicaba la sección de los 2 ejes) */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex py-1 px-3 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 font-sans text-[11px] tracking-widest uppercase font-semibold">
            ⚡ Soluciones Prácticas para PyMEs
          </span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-deep-navy leading-tight tracking-tight">
            ¿Qué frente necesitas resolver <span className="text-indigo-600">primero</span>?
          </h2>
          <p className="text-charcoal-text text-sm md:text-base leading-relaxed">
            Elige tu reto principal y mira el plan de acción concreto que aplicamos. Al solicitarlo, dejamos tu diagnóstico preconfigurado para agilizar tu reserva.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto bg-slate-100 p-1.5 rounded-xl">
          {pymeSolutions.map((sol) => (
            <button
              key={sol.id}
              onClick={() => setActiveCard(sol.id)}
              className={`flex-1 md:flex-initial py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide transition-all uppercase cursor-pointer flex items-center justify-center gap-2 ${
                activeCard === sol.id
                  ? 'bg-deep-navy text-white shadow-sm'
                  : 'text-charcoal-text hover:text-deep-navy hover:bg-slate-200/50'
              }`}
            >
              <span className="flex-shrink-0">{sol.icon}</span>
              <span className="hidden sm:inline">{sol.id === 'restructuracion' ? 'Finanzas' : sol.id === 'marca' ? 'Marca Digital' : 'Implementación'}</span>
              <span className="sm:hidden">{sol.id === 'restructuracion' ? 'Finanzas' : sol.id === 'marca' ? 'Marca' : 'Procesos'}</span>
            </button>
          ))}
        </div>

        {/* Interactive View Grid */}
        <div className="bg-surface-gray rounded-2xl border border-border-subtle p-6 md:p-10 transition-all">
          {pymeSolutions.map((sol) => {
            if (activeCard !== sol.id) return null;
            return (
              <div key={sol.id} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-fade-in animate-duration-300">

                {/* Left panel: Custom description */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="inline-block py-0.5 px-2.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                      {sol.tag}
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl md:text-4xl text-deep-navy leading-tight">
                      {sol.title}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                      <h4 className="text-xs font-sans font-bold text-red-800 uppercase tracking-wider mb-1">
                        El Problema Común en PyMEs
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {sol.pain}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                      <h4 className="text-xs font-sans font-bold text-green-800 uppercase tracking-wider mb-1">
                        ¿Cómo te damos la mejor resolución pragmática?
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {sol.solution}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-border-subtle flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-deep-navy">
                      {sol.pillText}
                    </span>
                  </div>
                </div>

                {/* Right panel: Deliverables & CTA */}
                <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-xl border border-border-subtle shadow-md space-y-6">

                  <div className="space-y-1">
                    <h4 className="text-xs font-sans font-extrabold text-deep-navy uppercase tracking-wider">
                      Plan Acción Ejecutable
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Entregables prácticos y medibles de esta asesoría:
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {sol.benefitItems.map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <hr className="border-slate-100" />

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => handleApplyNow(sol.associatedService, sol.presetNeeds)}
                      className="w-full bg-deep-navy hover:bg-black text-white text-xs font-bold tracking-wider uppercase py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md group cursor-pointer"
                    >
                      <span>Solicitar Plan para mi Empresa</span>
                      <ArrowRight className="w-3.5 h-3.5 text-growth-green transition-transform group-hover:translate-x-1" />
                    </button>

                    <p className="text-[10px] text-center text-slate-400 italic">
                      Se aplicará de forma automática esta configuración en el módulo de diagnóstico para agilizar tu reserva.
                    </p>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Banner de cierre "mejor alternativa" — con la foto del equipo de fondo */}
        <div className="bg-gradient-to-br from-deep-navy to-slate-900 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden border border-white/10 shadow-xl">
          {/* Textura decorativa inline (sin dependencias externas). */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-slate-900/40 pointer-events-none" />
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <HelpCircle className="w-48 h-48 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6 text-left">
            <span className="inline-block py-1 px-2.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 rounded text-[10px] font-mono tracking-widest uppercase font-semibold">
              🎯 Maximizar Clientes Potenciales & Estrechar Relaciones
            </span>

            <h3 className="font-heading font-extrabold text-2xl md:text-4xl text-white leading-snug">
              ¿Por qué somos tu mejor alternativa para estabilizar y escalar tu negocio?
            </h3>

            <p className="text-white/80 text-xs md:text-sm leading-relaxed">
              Unimos la dirección analítica contable de un CEO/CFO externo con la maquinaria comercial de un Growth Marketer. Esto significa que <strong className="text-white">nunca tomamos una decisión de marketing sin calcular tus márgenes financieros primero</strong>, y <strong className="text-white">nunca reestructuramos tus costos sin diseñar un motor de ventas para sustituir ingresos</strong>. Es una retroalimentación perfecta de alto valor.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex gap-2.5 items-start">
                <span className="p-1 px-1.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 rounded text-xs font-bold font-mono">1</span>
                <div>
                  <h4 className="text-white font-bold text-xs">Sin Contratos de Permanencia Abusivos</h4>
                  <p className="text-white/60 text-[11px] mt-0.5">Operamos basándonos en la entrega periódica semanal de valor. Si no ves transformación, te vas libremente.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="p-1 px-1.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 rounded text-xs font-bold font-mono">2</span>
                <div>
                  <h4 className="text-white font-bold text-xs">Alineados con el Flujo Real de Caja</h4>
                  <p className="text-white/60 text-[11px] mt-0.5">Nuestra obsesión no son los likes estéticos en redes sociales ni las métricas vanidosas; medimos el crecimiento del EBITDA.</p>
                </div>
              </div>
            </div>

            {/* Conector (Fusión 2): puente narrativo antes de los botones */}
            <p className="text-white/90 text-sm md:text-base font-heading font-medium leading-relaxed border-t border-white/10 pt-6">
              Cada decisión financiera y comercial tiene impacto en tus resultados. Conversemos sobre cómo maximizar ese impacto.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contacto"
                className="bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white px-8 py-3.5 rounded text-xs tracking-wider uppercase font-extrabold transition-colors text-center inline-block cursor-pointer shadow-lg"
              >
                Agenda una sesión estratégica gratuita
              </a>
              <a
                href={import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/specifinance/consultoria'}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/30 hover:border-white text-white/90 hover:text-white px-8 py-3.5 rounded text-xs tracking-wider uppercase font-bold transition-colors text-center inline-block"
              >
                Reservar reunión por Calendly
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
