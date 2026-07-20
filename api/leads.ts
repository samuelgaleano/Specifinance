/**
 * /api/leads
 *   POST   (public)  -> register a new potential client from the website form
 *   GET    (admin)   -> list all leads for the CRM dashboard
 *   PATCH  (admin)   -> update a lead (status / quote / ROI)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  isSheetsConfigured,
  sheetsCreateLead,
  sheetsFetchLeads,
  sheetsUpdateLead,
  requireAdmin,
  setCors,
  parseBody,
  str,
  type Lead,
} from './_lib.js';

/**
 * Suggested monthly fee (USD) + estimated EBITDA ROI (%) per service unit.
 *
 * WHERE THE DOLLAR VALUE COMES FROM:
 * When a lead submits the form they pick a "Unidad de Interés" (the service).
 * We map that service to its published base monthly price — the same figure
 * shown in the public catalog (src/data.ts → SERVICIOS_METADATA.basePrice) —
 * so the CRM pipeline value always matches what the client was quoted.
 * It is only a starting estimate: the admin can edit quotedPrice on each lead.
 */
function estimate(service: string): { price: number; roi: number } {
  if (service.includes('CFO')) return { price: 1800, roi: 18 };  // CFO as a Service
  if (service.includes('Data')) return { price: 1500, roi: 35 }; // Data-Driven Growth
  if (service.includes('Full')) return { price: 3000, roi: 28 }; // Full Growth Partner
  return { price: 1800, roi: 24 };                               // fallback / sin servicio
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const sheetsReady = isSheetsConfigured();

  try {
    // ------------------------------------------------------------------
    // Create a lead (public — this is what the website form calls)
    // ------------------------------------------------------------------
    if (req.method === 'POST') {
      const b = parseBody(req);

      // Honeypot anti-spam: si el campo trampa llega con contenido, es un bot → se ignora en silencio.
      const isSpam = str(b.honeypot ?? b.company_website, 200).length > 0;

      const fullName = str(b.fullName, 160);
      const email = str(b.email, 200);
      const phone = str(b.phone, 60);

      if (!fullName || !email) {
        return res.status(400).json({ ok: false, error: 'Nombre y correo son obligatorios.' });
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ ok: false, error: 'El correo no es válido.' });
      }

      const service = str(b.serviceOfInterest, 120) || 'Full Growth Partner';
      const est = estimate(service);

      const lead: Lead = {
        id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fullName,
        role: str(b.role, 120) || 'Personal / No aplica',
        companyName: str(b.companyName, 160) || 'Uso Personal / Proyecto',
        email,
        phone,
        city: str(b.city, 160) || 'No especificada',
        companySize: str(b.companySize, 80) || 'No especificado',
        serviceOfInterest: service,
        needsDescription: str(b.needsDescription, 4000) || 'Diagnóstico de rentabilidad estándar.',
        status: 'Nuevo',
        createdAt: new Date().toISOString(),
        quotedPrice: Number.isFinite(b.quotedPrice) ? Number(b.quotedPrice) : est.price,
        estimatedRoi: Number.isFinite(b.estimatedRoi) ? Number(b.estimatedRoi) : est.roi,
      };

      if (!isSpam) await sheetsCreateLead(lead);

      return res.status(201).json({ ok: true, lead, persisted: sheetsReady && !isSpam, dbConnected: sheetsReady });
    }

    // ------------------------------------------------------------------
    // List leads (admin only)
    // ------------------------------------------------------------------
    if (req.method === 'GET') {
      if (!requireAdmin(req)) {
        return res.status(401).json({ ok: false, error: 'No autorizado.' });
      }
      if (!sheetsReady) {
        return res.status(200).json({ ok: true, leads: [], dbConnected: false });
      }
      const leads = await sheetsFetchLeads();
      return res.status(200).json({ ok: true, leads, dbConnected: true });
    }

    // ------------------------------------------------------------------
    // Update a lead (admin only)
    // ------------------------------------------------------------------
    if (req.method === 'PATCH') {
      if (!requireAdmin(req)) {
        return res.status(401).json({ ok: false, error: 'No autorizado.' });
      }
      const b = parseBody(req);
      const id = str(b.id, 120);
      if (!id) return res.status(400).json({ ok: false, error: 'Falta el id del lead.' });

      if (!sheetsReady) return res.status(200).json({ ok: true, dbConnected: false });

      const status = b.status != null ? str(b.status, 60) : null;
      const quotedPrice = Number.isFinite(b.quotedPrice) ? Number(b.quotedPrice) : null;
      const estimatedRoi = Number.isFinite(b.estimatedRoi) ? Number(b.estimatedRoi) : null;

      await sheetsUpdateLead(id, { status, quotedPrice, estimatedRoi });
      return res.status(200).json({ ok: true, dbConnected: true });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  } catch (err) {
    console.error('[api/leads] error:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
}
