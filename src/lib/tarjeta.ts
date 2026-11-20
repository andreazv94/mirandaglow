// ============================================================
//  Tarjeta para compartir: una imagen 1080×1350 (formato de
//  Instagram/TikTok) hecha en el propio móvil con <canvas>.
// ============================================================
export type Tarjeta = {
  /** Qué se analizó: "Nivea Creme" o "Mi crema" */
  titulo: string;
  /** "Para piel seca y sensible" */
  subtitulo?: string;
  color: 'verde' | 'naranja' | 'rojo' | 'gris';
  veredicto: string;
  puntos: { ok: boolean; t: string }[];
};

const C = {
  fondo: '#F4F8F8', tinta: '#22363A', suave: '#5F7376', linea: '#D5E3E4', teal: '#2B7C8B',
  verde: '#55B98A', naranja: '#E8A54B', rojo: '#E0606F', gris: '#9AAEB0',
};

function lineas(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const out: string[] = [];
  let l = '';
  for (const p of texto.split(/\s+/)) {
    const prueba = l ? `${l} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && l) { out.push(l); l = p; } else l = prueba;
  }
  if (l) out.push(l);
  return out;
}

export async function dibujarTarjeta(t: Tarjeta): Promise<Blob> {
  try { await document.fonts.ready; } catch {}
  const W = 1080, H = 1350, M = 88;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  const serif = "'Newsreader Variable', Georgia, serif";
  const sans = "'Hanken Grotesk Variable', Helvetica, Arial, sans-serif";

  ctx.fillStyle = C.fondo; ctx.fillRect(0, 0, W, H);
  // marca
  ctx.fillStyle = C.tinta; ctx.font = `400 46px ${serif}`; ctx.fillText('Miranda Glow', M, 130);
  ctx.fillStyle = C.suave; ctx.font = `500 28px ${sans}`; ctx.fillText('Lee la etiqueta, no el anuncio.', M, 178);

  // tarjeta blanca
  const y0 = 240, alto = H - y0 - 170;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.roundRect(M - 24, y0, W - 2 * (M - 24), alto, 44); ctx.fill();
  ctx.fillStyle = C[t.color];
  ctx.beginPath(); ctx.roundRect(M - 24, y0, 16, alto, [44, 0, 0, 44]); ctx.fill();

  let y = y0 + 96;
  ctx.fillStyle = C.teal; ctx.font = `600 30px ${sans}`;
  for (const l of lineas(ctx, t.titulo, W - 2 * M - 40).slice(0, 2)) { ctx.fillText(l, M + 20, y); y += 42; }
  y += 22;
  // semáforo
  const luces: (keyof typeof C)[] = ['rojo', 'naranja', 'verde'];
  luces.forEach((k, i) => {
    ctx.beginPath(); ctx.arc(M + 44 + i * 58, y + 4, 20, 0, Math.PI * 2);
    ctx.fillStyle = k === t.color ? C[k] : '#E6EEEF'; ctx.fill();
  });
  y += 96;
  ctx.fillStyle = C.tinta; ctx.font = `400 74px ${serif}`;
  for (const l of lineas(ctx, t.veredicto, W - 2 * M - 40).slice(0, 2)) { ctx.fillText(l, M + 20, y); y += 84; }
  if (t.subtitulo) { ctx.fillStyle = C.suave; ctx.font = `500 32px ${sans}`; ctx.fillText(t.subtitulo, M + 20, y + 4); y += 40; }
  y += 30;
  ctx.strokeStyle = C.linea; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(M + 20, y); ctx.lineTo(W - M - 20, y); ctx.stroke();
  y += 64;
  ctx.font = `500 34px ${sans}`;
  for (const p of t.puntos.slice(0, 4)) {
    if (y > y0 + alto - 70) break;
    ctx.beginPath(); ctx.arc(M + 40, y - 11, 20, 0, Math.PI * 2);
    ctx.fillStyle = p.ok ? '#DDF1E7' : '#FBEBD3'; ctx.fill();
    ctx.fillStyle = p.ok ? '#2E8A5F' : '#B06F12'; ctx.font = `700 24px ${sans}`; ctx.textAlign = 'center';
    ctx.fillText(p.ok ? '✓' : '!', M + 40, y - 2); ctx.textAlign = 'left';
    ctx.fillStyle = C.tinta; ctx.font = `500 34px ${sans}`;
    const ls = lineas(ctx, p.t, W - 2 * M - 110).slice(0, 2);
    ls.forEach((l, i) => ctx.fillText(l, M + 84, y + i * 44));
    y += ls.length * 44 + 30;
  }
  // pie
  ctx.fillStyle = C.tinta; ctx.font = `600 34px ${sans}`; ctx.fillText('Analiza tu crema gratis en', M, H - 96);
  ctx.fillStyle = C.teal; ctx.font = `600 40px ${sans}`; ctx.fillText('mirandaglow.com', M, H - 48);
  ctx.fillStyle = C.suave; ctx.font = `500 24px ${sans}`; ctx.textAlign = 'right';
  ctx.fillText('Orientativo. Sin marcas que paguen.', W - M, H - 52); ctx.textAlign = 'left';

  return await new Promise((ok) => cv.toBlob((b) => ok(b!), 'image/png'));
}

/** Comparte la imagen (menú del móvil) o, si no se puede, la descarga. */
export async function compartirTarjeta(t: Tarjeta): Promise<'compartida' | 'descargada' | 'cancelada'> {
  const blob = await dibujarTarjeta(t);
  const file = new File([blob], 'mirandaglow.png', { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Miranda Glow', text: 'Mira lo que lleva esta crema 👇 mirandaglow.com' });
      return 'compartida';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelada';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'mirandaglow.png'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'descargada';
}
