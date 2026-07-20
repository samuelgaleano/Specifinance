# Specifinance — Landing + CRM de leads

Sitio web de **Specifinance** (dirección financiera & growth) con:

- **Landing page** profesional y responsive.
- **Formulario de diagnóstico** que registra cada cliente potencial (lead) de forma **permanente** en **Google Sheets**.
- **Panel de administrador (CRM)** para ver, filtrar y gestionar todos los leads desde cualquier dispositivo.

Stack: **Vite + React 19 + TypeScript + Tailwind 4** (frontend) y **Vercel Functions + Google Sheets** (backend `/api`, sin base de datos y con costo $0).

---

## 🚀 Desplegar en Vercel (paso a paso)

### 1) Sube el proyecto a Vercel
- Opción A (recomendada): sube esta carpeta a un repositorio de **GitHub** y en [vercel.com](https://vercel.com) haz **Add New → Project → Import** ese repo.
- Opción B: instala la CLI (`npm i -g vercel`) y ejecuta `vercel` dentro de la carpeta.

Vercel detecta **Vite** automáticamente (build: `vite build`, salida: `dist`). No necesitas configurar nada más del build.

### 2) Conecta el almacenamiento (Google Sheets — para que los leads se guarden)
1. Crea un **Google Sheet** (por ejemplo, "Leads").
2. **Extensiones → Apps Script** y pega TODO el contenido de [`google-apps-script.gs`](google-apps-script.gs).
3. Cambia la constante `SECRET` por una cadena larga y aleatoria.
4. **Implementar → Nueva implementación → Aplicación web** (Ejecutar como: **Yo** · Acceso: **Cualquier usuario**). Copia la **URL `/exec`** que te entrega.

> Si NO configuras el almacenamiento, el sitio funciona igual pero en **modo demostración**: el panel muestra datos de ejemplo y avisa con un banner ámbar. Conéctalo para guardar clientes reales.

### 3) Configura las variables de entorno
En **Settings → Environment Variables** agrega:

| Variable | Valor | Para qué |
|---|---|---|
| `SHEETS_WEBHOOK_URL` | *(la URL `/exec` del paso 2)* | Endpoint del Apps Script que recibe/lee los leads |
| `SHEETS_SECRET` | *(igual al `SECRET` del Apps Script)* | Autentica al backend contra el Apps Script |
| `ADMIN_EMAIL` | *(tu correo)* | Usuario del panel admin |
| `ADMIN_PASSWORD` | *(una clave segura tuya)* | Clave del panel admin |
| `ADMIN_TOKEN_SECRET` | *(cadena larga y aleatoria)* | Firma de la sesión admin (si falta, usa `ADMIN_PASSWORD`) |
| `VITE_CALENDLY_URL` | *(tu enlace real de Calendly)* | Agendamiento tras enviar el formulario |

Ver ejemplo en [.env.example](.env.example).

> Tras cambiar variables, vuelve a desplegar (**Deployments → Redeploy**) para que tomen efecto.

### 4) Conecta tu dominio `specifinance.com`
En Vercel: **Settings → Domains → Add** → escribe `specifinance.com` (y `www.specifinance.com`) y sigue los registros DNS que te indique tu panel. La propagación DNS y el certificado HTTPS tardan de minutos a unas horas.

---

## 🔐 Acceso al panel de administrador (CRM)
1. En el sitio, clic en el **candado** 🔒 discreto de la barra superior (junto a "Solicitar diagnóstico").
2. Ingresa con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
3. Verás todos los leads en tiempo real, con filtros, estados, plantillas de correo y seguimiento.

La sesión queda guardada en el navegador; usa **Cerrar Sesión** para salir.

---

## 💻 Desarrollo local

**Requisitos:** Node.js 18+

```bash
npm install
npm run dev        # http://localhost:3000
```

> Nota: las funciones `/api` solo corren en Vercel. En local con `npm run dev` el sitio se ve en **modo demostración** (el formulario no persiste). Para probar el backend completo en local usa `vercel dev` (requiere la CLI de Vercel y las variables de entorno configuradas).

Otros comandos:

```bash
npm run build      # build de producción a /dist
npm run lint       # chequeo de tipos (tsc)
npm run preview    # previsualiza el build de producción
```

---

## 📁 Estructura

```
api/                   Funciones serverless (backend)
  _lib.ts              Google Sheets, auth por token HMAC, helpers
  leads.ts             POST crear lead (público) · GET/PATCH (admin)
  login.ts             Login del admin → token firmado
src/
  App.tsx              Landing + lógica de formularios y CRM
  api.ts               Cliente del backend (fetch + token + manejo de errores)
  components/          AdminDashboard, Scheduler, ServiceModal, SmeSolutions
  data.ts, types.ts    Datos semilla y tipos
public/                favicon, og-image, hero-dashboard.svg, robots.txt, sitemap.xml, manifest
google-apps-script.gs  Web App de Google Sheets (doPost/doGet) — se pega en Apps Script
vercel.json            Rewrites SPA (excluye /api) + headers de seguridad + cache
```

---

## 🔒 Seguridad
- Credenciales y secretos viven **solo en variables de entorno** (nunca en el repositorio).
- Sesión de admin con **token HMAC** firmado en el servidor y verificación *timing-safe*; *fail-closed* si faltan las variables.
- Formulario público con **honeypot anti-spam**.
- Headers de seguridad en `vercel.json` (HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
