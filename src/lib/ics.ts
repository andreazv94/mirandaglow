/** Crea un recordatorio de calendario (.ics) que funciona en iPhone, Android, Google y Outlook. Nada pasa por ningún servidor. */
export type Recordatorio = { titulo: string; texto: string; url: string; inicio: Date; minutos?: number; repetir: 'DAILY' | 'WEEKLY' | 'MONTHLY'; nombreArchivo: string };

const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function crearIcs(r: Recordatorio): string {
  const fin = new Date(r.inicio.getTime() + (r.minutos ?? 10) * 60000);
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Miranda Glow//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@mirandaglow.com`,
    `DTSTAMP:${f(new Date())}`, `DTSTART:${f(r.inicio)}`, `DTEND:${f(fin)}`,
    `RRULE:FREQ=${r.repetir}`,
    `SUMMARY:${esc(r.titulo)}`, `DESCRIPTION:${esc(r.texto + '\n' + r.url)}`, `URL:${r.url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(r.titulo)}`, 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}

export function descargarIcs(r: Recordatorio) {
  const blob = new Blob([crearIcs(r)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = r.nombreArchivo;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
