import React, { useState } from 'react';
import { TIME_SLOTS, AVAILABLE_DAYS, SERVICIOS_METADATA } from '../data';
import { Booking } from '../types';
import { Calendar, Clock, Video, User, Mail, Building, Laptop, ChevronRight, CheckCircle, Ticket } from 'lucide-react';

interface SchedulerProps {
  onBookingSuccess: (booking: Booking) => void;
  preselectedService?: string;
  preselectedCompanyName?: string;
  preselectedClientName?: string;
  preselectedEmail?: string;
}

export default function Scheduler({
  onBookingSuccess,
  preselectedService = 'Full Growth Partner',
  preselectedCompanyName = '',
  preselectedClientName = '',
  preselectedEmail = ''
}: SchedulerProps) {
  const [selectedDay, setSelectedDay] = useState(AVAILABLE_DAYS[0]);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [clientName, setClientName] = useState(preselectedClientName);
  const [companyName, setCompanyName] = useState(preselectedCompanyName);
  const [companyEmail, setCompanyEmail] = useState(preselectedEmail);
  const [selectedService, setSelectedService] = useState(preselectedService);

  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Auto-sync preselected values if they arrive
  React.useEffect(() => {
    if (preselectedClientName) setClientName(preselectedClientName);
    if (preselectedCompanyName) setCompanyName(preselectedCompanyName);
    if (preselectedEmail) setCompanyEmail(preselectedEmail);
    if (preselectedService) setSelectedService(preselectedService);
  }, [preselectedClientName, preselectedCompanyName, preselectedEmail, preselectedService]);

  const handleNextStep = () => {
    if (bookingStep === 1) {
      setBookingStep(2);
    }
  };

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !companyName || !companyEmail) {
      alert('Por favor complete todos los datos requeridos.');
      return;
    }

    const meetingId = `meet-${Math.random().toString(36).substring(2, 11)}`;
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      leadId: `lead-user-${Date.now()}`,
      clientName,
      companyName,
      dateTime: `${selectedDay.label} a las ${selectedSlot}`,
      serviceType: selectedService,
      roomUrl: `https://meet.google.com/sf-${meetingId}`,
      status: 'Confirmada'
    };

    setCreatedBooking(newBooking);
    setBookingStep(3);
    onBookingSuccess(newBooking);
  };

  const resetScheduler = () => {
    setBookingStep(1);
    setCreatedBooking(null);
  };

  return (
    <div className="bg-white border border-border-subtle rounded-xl overflow-hidden boutique-shadow">
      {/* Steps indicator header */}
      <div className="bg-surface-gray border-b border-border-subtle px-6 py-4 flex justify-between items-center">
        <span className="font-heading text-sm text-deep-navy font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-gold" />
          Agenda de Sesión Estratégica
        </span>
        <div className="flex gap-1">
          <span className={`w-2 h-2 rounded-full ${bookingStep >= 1 ? 'bg-deep-navy' : 'bg-border-subtle'}`} />
          <span className={`w-2 h-2 rounded-full ${bookingStep >= 2 ? 'bg-deep-navy' : 'bg-border-subtle'}`} />
          <span className={`w-2 h-2 rounded-full ${bookingStep >= 3 ? 'bg-deep-navy' : 'bg-border-subtle'}`} />
        </div>
      </div>

      {bookingStep === 1 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-text uppercase tracking-wider mb-2">
                1. Seleccione la fecha deseada (Hábiles)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_DAYS.map((day) => (
                  <button
                    key={day.dateString}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`p-3 rounded border text-xs font-medium text-center transition-all cursor-pointer ${
                      selectedDay.dateString === day.dateString
                        ? 'border-deep-navy bg-deep-navy text-white font-semibold'
                        : 'border-border-subtle bg-white hover:border-charcoal-text text-deep-navy'
                    }`}
                    id={`btn-day-${day.dateString}`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-text uppercase tracking-wider mb-2">
                2. Seleccione un bloque horario disponible (Hora de Bogotá)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2.5 rounded border text-xs font-mono text-center transition-all cursor-pointer ${
                      selectedSlot === slot
                        ? 'border-deep-navy bg-deep-navy text-white font-semibold'
                        : 'border-border-subtle bg-white hover:border-charcoal-text text-deep-navy'
                    }`}
                    id={`btn-slot-${slot}`}
                  >
                    <Clock className="w-3.5 h-3.5 inline mr-1 opacity-85" />
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-gray p-4 rounded border border-border-subtle">
            <p className="text-xs text-charcoal-text leading-relaxed">
              <span className="font-semibold text-deep-navy block mb-1">Bloque Reservado:</span>
              Asesoría de 45 minutos online el dÍa <strong className="text-deep-navy">{selectedDay.label}</strong> a las <strong className="text-deep-navy">{selectedSlot}</strong> orientada a auditoria rápida y propuesta inicial.
            </p>
          </div>

          <button
            onClick={handleNextStep}
            type="button"
            className="w-full bg-deep-navy text-white hover:bg-black py-3 px-4 font-heading font-medium text-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
            id="scheduler-btn-next"
          >
            Siguiente: Confirmar Datos
            <ChevronRight className="w-4 h-4 text-muted-gold" />
          </button>
        </div>
      )}

      {bookingStep === 2 && (
        <form onSubmit={handleBookSession} className="p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-gold" />
                Nombre Completo
              </label>
              <input
                required
                type="text"
                placeholder="Ej: Sofía Martínez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded text-sm focus:border-deep-navy focus:ring-0"
                id="booking-client-name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-muted-gold" />
                Empresa S.A.S / Ltda
              </label>
              <input
                required
                type="text"
                placeholder="Ej: Martínez Consultores S.A"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded text-sm focus:border-deep-navy focus:ring-0"
                id="booking-company-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-gold" />
                Correo Corporativo
              </label>
              <input
                required
                type="email"
                placeholder="sofia@empresa.com"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded text-sm focus:border-deep-navy focus:ring-0"
                id="booking-company-email"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-text uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-muted-gold" />
                Servicios a Discutir
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded text-sm bg-white focus:border-deep-navy focus:ring-0"
                id="booking-selected-service"
              >
                {SERVICIOS_METADATA.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="Consulta Diagnóstica General">Consulta Diagnóstica General</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <div className="bg-surface-gray p-3 rounded text-xs border border-border-subtle space-y-1">
              <span className="font-semibold text-deep-navy block">Resumen del Turno:</span>
              <p>Fecha: <strong className="text-deep-navy">{selectedDay.label}</strong></p>
              <p>Hora: <strong className="text-deep-navy">{selectedSlot}</strong> (GMT-5)</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setBookingStep(1)}
              type="button"
              className="w-1/3 border border-deep-navy text-deep-navy font-heading font-medium text-xs hover:bg-surface-container-low transition-colors rounded cursor-pointer"
              id="booking-btn-back"
            >
              Volver
            </button>
            <button
              type="submit"
              className="w-2/3 bg-deep-navy hover:bg-black text-white font-heading font-medium text-sm py-3 px-4 rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
              id="booking-btn-submit"
            >
              Agendar Mi Sesión Real
              <CheckCircle className="w-4 h-4 text-growth-green" />
            </button>
          </div>
        </form>
      )}

      {bookingStep === 3 && createdBooking && (
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-growth-green/10 text-growth-green rounded-full flex items-center justify-center mx-auto scale-up">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h4 className="font-heading text-xl font-bold text-deep-navy">
              ¡Reunión Agendada con Éxito!
            </h4>
            <p className="text-sm text-charcoal-text max-w-md mx-auto">
              Hemos reservado su bloque y generado el canal de acceso seguro. Recibirá un correo de confirmación de inmediato.
            </p>
          </div>

          <div className="bg-surface-gray border border-border-subtle p-5 rounded-lg max-w-md mx-auto text-left space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-text">Cliente:</span>
              <span className="font-semibold text-deep-navy">{createdBooking.clientName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-text">Compañía:</span>
              <span className="font-semibold text-deep-navy">{createdBooking.companyName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-text">Fecha y Hora:</span>
              <span className="font-semibold text-deep-navy">{createdBooking.dateTime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-text">Unidad:</span>
              <span className="font-semibold text-deep-navy">{createdBooking.serviceType}</span>
            </div>

            <hr className="border-border-subtle" />

            {/* Video link box */}
            <div className="bg-white p-3 rounded border border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-growth-green flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-charcoal-text uppercase font-semibold block">Sala Privada</span>
                  <span className="text-xs font-mono text-deep-navy font-semibold truncate max-w-[200px] block">
                    {createdBooking.roomUrl}
                  </span>
                </div>
              </div>
              <a
                href={createdBooking.roomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-deep-navy hover:bg-black text-white p-2 rounded text-xs transition-colors"
                title="Ir a Sala Virtual"
                id="btn-access-room"
              >
                Unirse
              </a>
            </div>
          </div>

          <div className="pt-4 max-w-xs mx-auto">
            <button
              onClick={resetScheduler}
              type="button"
              className="w-full border border-border-subtle text-charcoal-text hover:border-deep-navy py-2 px-3 text-xs rounded transition-colors cursor-pointer"
              id="scheduler-btn-reset"
            >
              Agendar Otra Reunión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
