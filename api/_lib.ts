/**
 * Shared backend utilities for the Specifinance serverless API (Vercel Functions).
 *
 * Storage: Google Sheets via Apps Script web app (no DB required, $0 forever).
 * The API degrades gracefully to demo mode when SHEETS_WEBHOOK_URL is not set.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type LeadStatus =
  | 'Nuevo'
  | 'Contactado'
  | 'Reunión Agendada'
  | 'Propuesta Enviada'
  | 'Cerrado';

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
  status: LeadStatus;
  createdAt: string;
  quotedPrice?: number;
  estimatedRoi?: number;
}

// ---------------------------------------------------------------------------
// Google Sheets (Apps Script web app as backend)
// ---------------------------------------------------------------------------
const SHEETS_URL = process.env.SHEETS_WEBHOOK_URL || '';
const SHEETS_SECRET = process.env.SHEETS_SECRET || '';

export const isSheetsConfigured = (): boolean => !!SHEETS_URL;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Append a new lead row to the sheet. */
export async function sheetsCreateLead(lead: Lead): Promise<void> {
  if (!SHEETS_URL) return;
  await fetch(SHEETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: SHEETS_SECRET, action: 'create', lead }),
  });
}

/** Read all leads from the sheet. */
export async function sheetsFetchLeads(): Promise<Lead[]> {
  if (!SHEETS_URL) return [];
  const url = `${SHEETS_URL}?secret=${encodeURIComponent(SHEETS_SECRET)}&action=list`;
  const res = await fetch(url);
  const data: any = await res.json();
  return (data.leads ?? []) as Lead[];
}

/** Update status/price/roi of a lead by id. */
export async function sheetsUpdateLead(
  id: string,
  fields: { status?: string | null; quotedPrice?: number | null; estimatedRoi?: number | null },
): Promise<void> {
  if (!SHEETS_URL) return;
  await fetch(SHEETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: SHEETS_SECRET, action: 'update', id, ...fields }),
  });
}

// ---------------------------------------------------------------------------
// Auth (HMAC-signed bearer token — real server-side check, no secrets in client)
// ---------------------------------------------------------------------------
// El secreto de firma vive SOLO en variables de entorno (nunca en el repo).
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || '';

const TWELVE_HOURS = 1000 * 60 * 60 * 12;

export function signToken(email: string, ttlMs = TWELVE_HOURS): string {
  const exp = Date.now() + ttlMs;
  const body = Buffer.from(`${email}|${exp}`).toString('base64url');
  const sig = createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token?: string | null): boolean {
  // Sin secreto configurado, ninguna sesión es válida (fail-closed).
  if (!token || !TOKEN_SECRET) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  const expected = createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const [, expStr] = Buffer.from(body, 'base64url').toString().split('|');
    return Date.now() < Number(expStr);
  } catch {
    return false;
  }
}

export function requireAdmin(req: { headers: Record<string, any> }): boolean {
  const header = (req.headers['authorization'] || req.headers['Authorization'] || '') as string;
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return verifyToken(token);
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------
export function setCors(res: { setHeader: (k: string, v: string) => void }): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function parseBody(req: { body?: any }): Record<string, any> {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return b as Record<string, any>;
}

export function str(v: unknown, max = 2000): string {
  if (v == null) return '';
  return String(v).slice(0, max).trim();
}
