import { useEffect, useRef, useState } from 'react';

// Lee códigos de barras con la cámara, en el propio móvil.
// Usa el lector del navegador si existe (Chrome en Android) y,
// si no (iPhone), uno propio (zxing) que servimos desde /zxing.

const FORMATOS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

type Detector = { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> };

async function crearDetector(): Promise<Detector> {
  const Nativo = (window as unknown as { BarcodeDetector?: { new (o: unknown): Detector; getSupportedFormats?: () => Promise<string[]> } }).BarcodeDetector;
  try {
    if (Nativo && (await Nativo.getSupportedFormats?.())?.includes('ean_13')) return new Nativo({ formats: FORMATOS });
  } catch {}
  const m = await import('barcode-detector/ponyfill');
  m.prepareZXingModule({
    overrides: { locateFile: (ruta: string, prefijo: string) => (ruta.endsWith('.wasm') ? '/zxing/zxing_reader.wasm' : prefijo + ruta) },
    fireImmediately: false,
  });
  return new m.BarcodeDetector({ formats: FORMATOS as never }) as unknown as Detector;
}

/** Comprueba el dígito de control (EAN-8, UPC-A, EAN-13) para no aceptar lecturas a medias. */
export function codigoValido(c: string) {
  if (!/^\d{8,14}$/.test(c)) return false;
  const d = c.split('').map(Number);
  const control = d.pop()!;
  const suma = d.reverse().reduce((s, n, i) => s + n * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (suma % 10)) % 10 === control;
}

export default function EscanerCodigo({ onCodigo, onCerrar }: { onCodigo: (c: string) => void; onCerrar: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<'arrancando' | 'buscando' | 'sin-camara'>('arrancando');
  const [manual, setManual] = useState('');
  const [errManual, setErrManual] = useState(false);

  useEffect(() => {
    dlg.current?.showModal();
    let stream: MediaStream | null = null;
    let vivo = true;
    let t: ReturnType<typeof setTimeout>;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!vivo) return stream.getTracks().forEach((x) => x.stop());
        const v = video.current!;
        v.srcObject = stream;
        await v.play();
        const det = await crearDetector();
        setEstado('buscando');
        const mirar = async () => {
          if (!vivo) return;
          try {
            if (v.readyState >= 2) {
              const r = await det.detect(v);
              const c = r.map((x) => x.rawValue).find(codigoValido);
              if (c) {
                navigator.vibrate?.(60);
                vivo = false;
                onCodigo(c);
                return;
              }
            }
          } catch {}
          t = setTimeout(mirar, 180);
        };
        mirar();
      } catch {
        setEstado('sin-camara');
      }
    })();
    return () => {
      vivo = false;
      clearTimeout(t);
      stream?.getTracks().forEach((x) => x.stop());
    };
  }, []);

  function enviarManual(e: React.FormEvent) {
    e.preventDefault();
    const c = manual.replace(/\D/g, '');
    if (codigoValido(c)) onCodigo(c);
    else setErrManual(true);
  }

  return (
    <dialog ref={dlg} className="esc" aria-label="Escanear código de barras" onCancel={(e) => { e.preventDefault(); onCerrar(); }}>
      <div className="esc-cam">
        <video ref={video} playsInline muted />
        {estado !== 'sin-camara' && <div className="esc-marco" aria-hidden="true"><i /></div>}
        <p className="esc-txt" role="status">
          {estado === 'arrancando' && 'Abriendo la cámara…'}
          {estado === 'buscando' && 'Apunta al código de barras del envase'}
          {estado === 'sin-camara' && 'No podemos usar la cámara. Revisa los permisos o escribe el número.'}
        </p>
        <button type="button" className="esc-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
      </div>
      <form className="esc-manual" onSubmit={enviarManual}>
        <label htmlFor="esc-num">O escribe los números de debajo del código</label>
        <div>
          <input id="esc-num" inputMode="numeric" autoComplete="off" value={manual} placeholder="8 410 000 000 000"
            onChange={(e) => { setManual(e.target.value); setErrManual(false); }} />
          <button className="btn" type="submit">Buscar</button>
        </div>
        {errManual && <p className="esc-err">Ese número no es un código de barras válido. Revísalo.</p>}
      </form>
    </dialog>
  );
}
