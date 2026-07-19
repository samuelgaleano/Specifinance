/**
 * Specifinance — Backend de leads sobre Google Sheets (Apps Script Web App).
 *
 * Pega TODO este código en Extensiones → Apps Script de tu Google Sheet y
 * despliega como Aplicación web (Ejecutar como: Yo / Acceso: Cualquier usuario).
 * El SECRET ya coincide con SHEETS_SECRET en Vercel — no necesitas cambiar nada.
 *
 * Importante: usa txt() para FORZAR texto en todas las columnas de texto, de modo
 * que "+57 300..." no se interprete como fórmula (#ERROR!) y que un teléfono como
 * "3012659700" no se guarde como número perdiendo ceros/formato.
 */
const SECRET = 'REEMPLAZA_CON_TU_SHEETS_SECRET'; // debe COINCIDIR con SHEETS_SECRET en Vercel

const HEADERS = [
  'ID','Nombre','Rol','Empresa','Email','Teléfono','Ciudad',
  'Tamaño Empresa','Servicio','Descripción','Estado',
  'Precio USD','ROI %','Fecha'
];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Leads');
  if (!sheet) sheet = ss.insertSheet('Leads');
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

/**
 * Fuerza a Google Sheets a guardar el valor como TEXTO. El apóstrofo inicial le
 * dice a Sheets "esto es texto literal": evita el #ERROR! (cuando empieza por
 * + = - @) y evita que teléfonos/números se reformateen. Al leer con getValues()
 * el apóstrofo NO se incluye, así que vuelve limpio.
 */
function txt(v) {
  if (v === null || v === undefined) return '';
  return "'" + String(v);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return json({ ok: false, error: 'Unauthorized' });

    if (body.action === 'create') {
      const l = body.lead;
      getSheet().appendRow([
        txt(l.id), txt(l.fullName), txt(l.role), txt(l.companyName), txt(l.email),
        txt(l.phone), txt(l.city), txt(l.companySize), txt(l.serviceOfInterest),
        txt(l.needsDescription), txt(l.status),
        l.quotedPrice != null ? Number(l.quotedPrice) : '',
        l.estimatedRoi != null ? Number(l.estimatedRoi) : '',
        txt(l.createdAt)
      ]);
      return json({ ok: true });
    }

    if (body.action === 'update') {
      const sheet = getSheet();
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === body.id) {
          if (body.status != null)       sheet.getRange(i + 1, 11).setValue(txt(body.status));
          if (body.quotedPrice != null)  sheet.getRange(i + 1, 12).setValue(Number(body.quotedPrice));
          if (body.estimatedRoi != null) sheet.getRange(i + 1, 13).setValue(Number(body.estimatedRoi));
          break;
        }
      }
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  try {
    if ((e.parameter.secret || '') !== SECRET) return json({ ok: false, error: 'Unauthorized' });
    if (e.parameter.action !== 'list') return json({ ok: false, error: 'Unknown action' });

    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return json({ ok: true, leads: [] });

    const leads = data.slice(1).map(function (r) {
      return {
        id: r[0], fullName: r[1], role: r[2], companyName: r[3],
        email: r[4], phone: r[5], city: r[6], companySize: r[7],
        serviceOfInterest: r[8], needsDescription: r[9], status: r[10],
        quotedPrice: r[11] !== '' ? Number(r[11]) : undefined,
        estimatedRoi: r[12] !== '' ? Number(r[12]) : undefined,
        createdAt: r[13]
      };
    }).reverse(); // más recientes primero

    return json({ ok: true, leads: leads });
  } catch (err) {
    return json({ ok: false, error: err.toString() });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
