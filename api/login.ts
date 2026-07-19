/**
 * /api/login  (POST) — validates admin credentials against environment
 * variables and returns a short-lived signed token. Credentials never live
 * in the client bundle.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors, parseBody, signToken } from './_lib.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  try {
    const b = parseBody(req);
    const email = String(b.email || '').toLowerCase().trim();
    const password = String(b.password || '');

    // Las credenciales viven SOLO en variables de entorno (nunca en el repo).
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

    // Fail-closed: sin credenciales configuradas en el servidor, se niega el acceso.
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return res.status(500).json({ ok: false, error: 'Autenticación no configurada en el servidor.' });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.status(200).json({ ok: true, token: signToken(ADMIN_EMAIL), email: ADMIN_EMAIL });
    }

    return res.status(401).json({ ok: false, error: 'Usuario o clave incorrectos. Acceso denegado.' });
  } catch (err) {
    console.error('[api/login] error:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor de autenticación.' });
  }
}
