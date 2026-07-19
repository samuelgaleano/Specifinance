import { Lead, Booking } from './types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    fullName: 'Alejandra Gómez',
    role: 'CEO & Fundadora',
    companyName: 'Moda Sostenible S.A.S',
    email: 'alejandra.gomez@modasos.com',
    phone: '+57 312 456 7890',
    city: 'Medellín - Textil, Ecommerce',
    companySize: '11 - 50 empleados',
    serviceOfInterest: 'Full Growth Partner',
    needsDescription: 'Estamos creciendo rápido en ventas digitales, pero el margen EBITDA ha disminuido un 4% y tenemos problemas gravísimos de flujo de caja por inventarios.',
    status: 'Nuevo',
    createdAt: '2026-05-23T09:00:00Z',
    quotedPrice: 3200,
    estimatedRoi: 28
  },
  {
    id: 'lead-2',
    fullName: 'Carlos Sierra',
    role: 'Gerente de Finanzas',
    companyName: 'TecnoLogística Express',
    email: 'carlos.sierra@tecnolog.co',
    phone: '+57 320 888 1234',
    city: 'Bogotá - Transporte y Software',
    companySize: '51 - 200 empleados',
    serviceOfInterest: 'CFO as a Service',
    needsDescription: 'Queremos estructurar un plan tributario más eficiente y optimizar nuestra tesorería para levantar una ronda de inversión de USD 1.5M a finales de año.',
    status: 'Reunión Agendada',
    createdAt: '2026-05-22T14:30:00Z',
    quotedPrice: 2100,
    estimatedRoi: 18
  },
  {
    id: 'lead-3',
    fullName: 'Mariana Restrepo',
    role: 'Directora de Operaciones',
    companyName: 'Alimentos del Campo Ltda',
    email: 'm.restrepo@campofresco.com.co',
    phone: '+57 301 555 7766',
    city: 'Cali - Agroindustrial',
    companySize: '51 - 200 empleados',
    serviceOfInterest: 'Data-Driven Growth',
    needsDescription: 'Requerimos modelar escenarios de expansión a México, analizando detalladamente los unit economics por línea de cultivo procesada.',
    status: 'Contactado',
    createdAt: '2026-05-20T10:15:00Z',
    quotedPrice: 1800,
    estimatedRoi: 35
  },
  {
    id: 'lead-4',
    fullName: 'Roberto Senior',
    role: 'Gerente General',
    companyName: 'Grupo Constructor Andino',
    email: 'roberto.senior@grupodev.com',
    phone: '+57 315 999 5544',
    city: 'Barranquilla - Construcción',
    companySize: 'Más de 200 empleados',
    serviceOfInterest: 'Full Growth Partner',
    needsDescription: 'Manejamos márgenes amplios pero el control de caja tradicional es una pesadilla. Queremos tableros de control financieros automatizados.',
    status: 'Propuesta Enviada',
    createdAt: '2026-05-18T16:45:00Z',
    quotedPrice: 4500,
    estimatedRoi: 22
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    leadId: 'lead-2',
    clientName: 'Carlos Sierra',
    companyName: 'TecnoLogística Express',
    dateTime: '2026-05-26 a las 10:00 AM',
    serviceType: 'CFO as a Service',
    roomUrl: 'https://meet.google.com/abc-defg-hij',
    status: 'Confirmada'
  }
];

export interface ServiceUnit {
  id: string;
  name: string;
  category: string;
  tag: string;
  description: string;
  basePrice: number;
  benefits: string[];
}

export const SERVICIOS_METADATA: ServiceUnit[] = [
  {
    id: 'full-growth',
    name: 'Full Growth Partner',
    category: 'Estrategia Comercial + Dirección Financiera',
    tag: 'MÁS SOLICITADO',
    description: 'Gestión integral donde tomamos el control de la dirección financiera y supervisamos el crecimiento comercial bajo una única visión de datos.',
    basePrice: 3000,
    benefits: [
      'CFO + Growth Advisor Asignado',
      'Optimización proactiva de CAC/LTV corporativo',
      'Análisis exhaustivo del embudo de marketing integrado',
      'Comité de dirección semanal con informes en tiempo real'
    ]
  },
  {
    id: 'cfo-service',
    name: 'CFO as a Service',
    category: 'Estructural / Control Corporativo',
    tag: 'ESTRUCTURAL',
    description: 'Dirección financiera externa de alto nivel para PyMEs. Control de caja, planeación tributaria estratégica y análisis de márgenes.',
    basePrice: 1800,
    benefits: [
      'Reportes gerenciales mensuales y tableros interactivos',
      'Gestión de tesorería y optimización de capital de trabajo',
      'Planeación presupuestal y control de costos fijos',
      'Relacionamiento bancario y estructuración de deuda'
    ]
  },
  {
    id: 'data-driven',
    name: 'Data-Driven Growth',
    category: 'Expansión / Unit Economics',
    tag: 'EXPANSIÓN',
    description: 'Modelación de escenarios de expansión comercial, escalamiento de inversión publicitaria y estructuración económica de cohortes.',
    basePrice: 1500,
    benefits: [
      'Análisis profundo de cohortes y retención de valor',
      'Proyecciones de ventas y simulación Monte Carlo de riesgos',
      'Optimización de precios basada en elasticidad de demanda',
      'Diseño de incentivos para equipos de ventas'
    ]
  }
];

export const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM'
];

export const AVAILABLE_DAYS = [
  { dateString: '2026-05-26', label: 'Martes 26 de Mayo' },
  { dateString: '2026-05-27', label: 'Miércoles 27 de Mayo' },
  { dateString: '2026-05-28', label: 'Jueves 28 de Mayo' },
  { dateString: '2026-05-29', label: 'Viernes 29 de Mayo' },
  { dateString: '2026-06-01', label: 'Lunes 1 de Junio' },
  { dateString: '2026-06-02', label: 'Martes 2 de Junio' }
];
