# Specifinance — Landing + CRM de leads

Sitio web de **Specifinance** (dirección financiera & growth) con:

- **Landing page** profesional y responsive.
- **Formulario de diagnóstico** que registra cada cliente potencial (lead) de forma **permanente** en una base de datos.
- **Panel de administrador (CRM)** para ver, filtrar y gestionar todos los leads desde cualquier dispositivo.

Stack: **Vite + React 19 + TypeScript + Tailwind 4** (frontend) y **Vercel Functions + Neon Postgres** (backend `/api`).

---

## 🚀 Desplegar en Vercel (paso a paso)

### 1) Sube el proyecto a Vercel
- Opción A (recomendada): sube esta carpeta a un repositorio de **GitHub** y en [vercel.com](https://vercel.com) haz **Add New → Project → Import** ese repo.
- Opción B: instala la CLI (`npm i -g vercel`) y ejecuta `vercel` dentro de la carpeta.

Vercel detecta **Vite** automáticamente (build: `vite build`, salida: `dist`). No necesitas configurar nada más del build.

### 2) Conecta la base de datos (para que los leads se guarden)
En tu proyecto de Vercel:
1. Pestaña **Storage → Create Database → Neon (Postgres)**.
2. **Connect to Project** (selecciona este proyecto y todos los entornos).

Esto inyecta sola la variable `DATABASE_URL`. **La tabla de leads se crea automáticamente** la primera vez que llega una solicitud (no tienes que hacer migraciones).

> Si NO conectas la base de datos, el sitio funciona igual pero en **modo demostración**: el panel muestra datos de ejemplo y avisa con un banner ámbar. Conéctala para guardar clientes reales.

### 3) Configura las variables de entorno
En **Settings → Environment Variables** agrega:

| Variable | Valor | Para qué |
|---|---|---|
| `ADMIN_EMAIL` | `specifinance@gmail.com` | Usuario del panel admin |
| `ADMIN_PASSWORD` | *(una clave segura tuya)* | Clave del panel admin |
| `ADMIN_TOKEN_SECRET` | *(cadena larga y aleatoria)* | Firma de la sesión admin |
| `VITE_CALENDLY_URL` | *(tu enlace real de Calendly)* | Agendamiento tras enviar el formulario |

`DATABASE_URL` la pone Neon sola (paso 2). Ver ejemplo en [.env.example](.env.example).

> Tras cambiar variables, vuelve a desplegar (**Deployments → Redeploy**) para que tomen efecto.

### 4) Conecta tu dominio `specifinance.com` (comprado en Squarespace)
En Vercel: **Settings → Domains → Add** → escribe `specifinance.com` (y `www.specifinance.com`).
Vercel te mostrará los registros DNS. En **Squarespace → Settings → Domains → specifinance.com → DNS**:

1. **Dominio raíz** `specifinance.com` → registro **A** apuntando a la IP que indique Vercel (normalmente `76.76.21.21`).
2. **Subdominio** `www` → registro **CNAME** apuntando a `cname.vercel-dns.com`.

> Usa siempre los valores **exactos que muestre tu panel de Vercel** (pueden variar). La propagación DNS y el certificado HTTPS tardan de minutos a unas horas.

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

> Nota: las funciones `/api` solo corren en Vercel. En local con `npm run dev` el sitio se ve en **modo demostración** (el formulario no persiste). Para probar el backend completo en local usa `vercel dev` (requiere la CLI de Vercel y la base de datos conectada).

Otros comandos:

```bash
npm run build      # build de producción a /dist
npm run lint       # chequeo de tipos (tsc)
npm run preview    # previsualiza el build de producción
```

---

## 📁 Estructura

```
api/                 Funciones serverless (backend)
  _lib.ts            DB (Neon), auth por token, helpers
  leads.ts           POST crear lead (público) · GET/PATCH (admin)
  login.ts           Login del admin → token firmado
src/
  App.tsx            Landing + lógica de formularios y CRM
  api.ts             Cliente del backend (fetch + token + manejo de errores)
  components/        AdminDashboard, Scheduler, ServiceModal, SmeSolutions
  data.ts, types.ts  Datos semilla y tipos
public/              favicon, og-image, robots.txt, sitemap.xml, manifest
vercel.json          Rewrites SPA (excluye /api) + headers + cache
```
