/**
 * Thin client for the Specifinance backend (/api serverless functions).
 * Handles the admin token, network errors and the demo/no-database fallback.
 */
import { Lead } from './types';

// Same origin by default; override with VITE_API_BASE only if the API lives elsewhere.
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const TOKEN_KEY = 'sf_admin_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null): void => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors (private mode) */
  }
};

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export interface CreateLeadInput {
  fullName: string;
  role?: string;
  companyName?: string;
  email: string;
  phone: string;
  city?: string;
  companySize?: string;
  serviceOfInterest: string;
  needsDescription?: string;
  quotedPrice?: number;
  estimatedRoi?: number;
  /** Campo trampa anti-spam: siempre vacío en envíos humanos. */
  honeypot?: string;
}

export interface ApiResult<T> {
  ok: boolean;
  error?: string;
  dbConnected?: boolean;
  data?: T;
}

/** Register a potential client (called by the public website form). */
export async function createLead(input: CreateLeadInput): Promise<ApiResult<{ lead: Lead }>> {
  try {
    const res = await fetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error || 'No se pudo registrar la solicitud.' };
    }
    return { ok: true, dbConnected: json.dbConnected, data: { lead: json.lead } };
  } catch {
    return { ok: false, error: 'Sin conexión con el servidor. Intenta de nuevo.' };
  }
}

/** Admin login — returns a token stored locally for subsequent requests. */
export async function adminLogin(
  email: string,
  password: string,
): Promise<ApiResult<{ email: string }>> {
  try {
    const res = await fetch(`${BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error || 'Usuario o clave incorrectos.' };
    }
    setToken(json.token);
    return { ok: true, data: { email: json.email } };
  } catch {
    return { ok: false, error: 'Sin conexión con el servidor. Intenta de nuevo.' };
  }
}

/** Fetch every lead for the CRM (admin only). */
export async function fetchLeads(): Promise<ApiResult<{ leads: Lead[] }>> {
  try {
    const res = await fetch(`${BASE}/api/leads`, { headers: { ...authHeaders() } });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) return { ok: false, error: 'Sesión expirada. Vuelve a entrar.' };
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error || 'No se pudieron cargar los leads.' };
    }
    return { ok: true, dbConnected: json.dbConnected, data: { leads: json.leads || [] } };
  } catch {
    return { ok: false, error: 'Sin conexión con el servidor.' };
  }
}

/** Update a lead's status / quote (admin only). */
export async function updateLead(
  id: string,
  patch: { status?: Lead['status']; quotedPrice?: number; estimatedRoi?: number },
): Promise<ApiResult<unknown>> {
  try {
    const res = await fetch(`${BASE}/api/leads`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id, ...patch }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) return { ok: false, error: json.error || 'No se pudo actualizar.' };
    return { ok: true, dbConnected: json.dbConnected };
  } catch {
    return { ok: false, error: 'Sin conexión con el servidor.' };
  }
}
