export interface Lead {
  id: string;
  fullName: string;
  role: string;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  companySize: string;
  serviceOfInterest: string;
  needsDescription: string;
  status: 'Nuevo' | 'Contactado' | 'Reunión Agendada' | 'Propuesta Enviada' | 'Cerrado';
  createdAt: string;
  quotedPrice?: number;
  estimatedRoi?: number;
}

export interface Booking {
  id: string;
  leadId: string;
  clientName: string;
  companyName: string;
  dateTime: string;
  serviceType: string;
  roomUrl: string;
  status: 'Confirmada' | 'Cancelada' | 'Completada';
}

export interface QuoteCalculated {
  serviceId: string;
  serviceName: string;
  monthlyRevenue: number;
  complexity: 'Baja' | 'Media' | 'Alta';
  teamSize: number;
  estimatedPrice: number;
  potentialEbitdaGain: number; // in percentage
  estimatedSavings: number; // yearly money savings
}

export interface ResendEmailConfig {
  apiKey: string;
  senderEmail: string;
}

export interface OutgoingEmailLog {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'Enviado' | 'Fallido';
}
