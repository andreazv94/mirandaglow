// ============================================================
//  "TU PIEL HOY": consejos según el tiempo
// ============================================================
//  Datos de Open-Meteo (https://open-meteo.com), sin clave.
//  OJO: el plan gratuito de Open-Meteo es para uso NO comercial.
//  Si la web pasa a generar ingresos, contrata su plan de pago
//  (o cambia de proveedor) y pon la clave en API_KEY.
//
//  Privacidad: las coordenadas se redondean a 2 decimales
//  (~1 km) antes de enviarlas, y solo se guardan en el navegador.
// ============================================================

const API_KEY = ''; // plan comercial de Open-Meteo, si lo contratas
const base = (sub: string) => (API_KEY ? `https://customer-${sub}.open-meteo.com` : `https://${sub}.open-meteo.com`);
const key = API_KEY ? `&apikey=${API_KEY}` : '';

export type Lugar = { nombre: string; lat: number; lon: number };
export type Tiempo = {
  temp: number; humedad: number; viento: number; rachas: number; uvMax: number;
  tMax: number; tMin: number; aqi?: number; polen?: { tipo: string; valor: number }[];
};
export type Consejo = { nivel: 'alto' | 'medio' | 'info'; titulo: string; texto: string };

const r2 = (n: number) => Math.round(n * 100) / 100;
const num = (n: number) => String(n).replace('.', ',');

export async function buscarCiudad(nombre: string): Promise<Lugar | null> {
  const u = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombre)}&count=1&language=es&format=json`;
  const d = await (await fetch(u)).json();
  const x = d?.results?.[0];
  return x ? { nombre: x.name, lat: r2(x.latitude), lon: r2(x.longitude) } : null;
}

export async function tiempoEn(lat: number, lon: number): Promise<Tiempo> {
  lat = r2(lat); lon = r2(lon);
  const f = `${base('api')}/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m' +
    '&daily=uv_index_max,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1' + key;
  const a = `${base('air-quality-api')}/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    '&current=european_aqi,grass_pollen,olive_pollen,birch_pollen,alder_pollen,ragweed_pollen,mugwort_pollen&timezone=auto' + key;
  const [fd, ad] = await Promise.all([
    fetch(f).then((r) => r.json()),
    fetch(a).then((r) => r.json()).catch(() => null),
  ]);
  const c = fd.current, d = fd.daily;
  const nombresPolen: Record<string, string> = {
    grass_pollen: 'gramíneas', olive_pollen: 'olivo', birch_pollen: 'abedul',
    alder_pollen: 'aliso', ragweed_pollen: 'ambrosía', mugwort_pollen: 'artemisa',
  };
  const polen = ad?.current
    ? Object.entries(nombresPolen)
        .map(([k, tipo]) => ({ tipo, valor: Number(ad.current[k] ?? 0) }))
        .filter((p) => p.valor > 0)
        .sort((x, y) => y.valor - x.valor)
    : undefined;
  return {
    temp: Math.round(c.temperature_2m), humedad: Math.round(c.relative_humidity_2m),
    viento: Math.round(c.wind_speed_10m), rachas: Math.round(c.wind_gusts_10m ?? c.wind_speed_10m),
    uvMax: Math.round((d.uv_index_max?.[0] ?? 0) * 10) / 10,
    tMax: Math.round(d.temperature_2m_max?.[0] ?? c.temperature_2m), tMin: Math.round(d.temperature_2m_min?.[0] ?? c.temperature_2m),
    aqi: ad?.current?.european_aqi != null ? Math.round(ad.current.european_aqi) : undefined,
    polen,
  };
}

export function nivelUV(uv: number) {
  if (uv < 3) return 'bajo';
  if (uv < 6) return 'moderado';
  if (uv < 8) return 'alto';
  if (uv < 11) return 'muy alto';
  return 'extremo';
}

export function consejos(t: Tiempo): Consejo[] {
  const out: Consejo[] = [];
  const uv = nivelUV(t.uvMax);

  // Sol
  if (t.uvMax >= 8)
    out.push({ nivel: 'alto', titulo: `Índice UV ${uv} (${num(t.uvMax)})`, texto: 'Protector solar SPF 50+ en cara, cuello, orejas y manos, y renuévalo cada 2 horas si estás fuera. Evita el sol de 12 a 17 h y usa gorra y gafas de sol.' });
  else if (t.uvMax >= 3)
    out.push({ nivel: 'medio', titulo: `Índice UV ${uv} (${num(t.uvMax)})`, texto: 'Ponte protector solar antes de salir, también aunque esté nublado. Si vas a estar al aire libre, renuévalo a media jornada.' });
  else
    out.push({ nivel: 'info', titulo: `Índice UV bajo (${num(t.uvMax)})`, texto: 'Hoy el sol es flojo, pero el protector sigue siendo el mejor antiedad. Si usas retinol o ácidos, no te lo saltes.' });

  // Viento
  if (t.rachas >= 45 || t.viento >= 30)
    out.push({ nivel: 'alto', titulo: `Hace mucho viento (rachas de ${t.rachas} km/h)`, texto: 'El viento reseca y agrieta. Lleva bálsamo de labios y repítelo durante el día, y usa una crema algo más rica. Si tienes la piel sensible o rosácea, protégete la cara con una bufanda.' });
  else if (t.rachas >= 30 || t.viento >= 20)
    out.push({ nivel: 'medio', titulo: `Hace aire (${t.viento} km/h)`, texto: 'Hidrata bien los labios y no te olvides de la crema antes de salir.' });

  // Frío y calor
  if (t.tMin <= 5)
    out.push({ nivel: 'medio', titulo: `Frío (mínima de ${t.tMin} °C)`, texto: 'El frío debilita la barrera de la piel. Cremas con ceramidas, agua templada (no caliente) al lavarte la cara y bálsamo de labios. Cuidado también con las manos.' });
  if (t.tMax >= 30)
    out.push({ nivel: 'medio', titulo: `Calor (máxima de ${t.tMax} °C)`, texto: 'Texturas ligeras en gel o fluido. Si sudas, lávate la cara al llegar a casa y vuelve a ponerte protector. Bebe agua.' });

  // Humedad
  if (t.humedad < 35)
    out.push({ nivel: 'medio', titulo: `Aire seco (humedad del ${t.humedad} %)`, texto: 'La piel pierde agua más rápido. Un sérum con ácido hialurónico o glicerina debajo de la crema ayuda, y la calefacción no muy alta.' });
  else if (t.humedad > 75 && t.temp >= 22)
    out.push({ nivel: 'info', titulo: `Calor húmedo (humedad del ${t.humedad} %)`, texto: 'Puedes usar menos crema o una más ligera. Si tienes la piel grasa, un limpiador suave por la noche evita granitos.' });

  // Contaminación
  if (t.aqi != null && t.aqi > 60)
    out.push({ nivel: 'medio', titulo: `Contaminación alta (índice europeo ${t.aqi})`, texto: 'Haz doble limpieza por la noche y usa un antioxidante como la vitamina C por la mañana, debajo del protector.' });

  // Polen
  const alto = t.polen?.find((p) => p.valor >= 50);
  if (alto)
    out.push({ nivel: 'medio', titulo: `Polen de ${alto.tipo} alto`, texto: 'Si tienes alergia, piel atópica o rojeces, puede que notes picor en párpados y mejillas. Lávate la cara al llegar a casa, no te frotes los ojos y usa productos sin perfume.' });

  const orden = { alto: 0, medio: 1, info: 2 };
  return out.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
}
