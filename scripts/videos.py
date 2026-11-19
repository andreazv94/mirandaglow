"""
Vídeos explicativos de Miranda Glow (animaciones sin voz, con texto).

Uso:  python3 scripts/videos.py            (necesita ffmpeg y Pillow)
Salida: public/video/<nombre>.mp4 y <nombre>.jpg (póster)

Cada vídeo es una lista de escenas. Cada escena se dibuja fotograma a
fotograma con Pillow y se codifica en un solo .mp4; al final se unen.
"""
import math, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

W = H = 1080
FPS = 30
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'public', 'video')
FONTS = os.environ.get('MG_FONTS', '/tmp/vid')  # serif.ttf y sans.ttf (Newsreader y Hanken Grotesk)

PEARL, MIST, BLUSH = (244, 248, 248), (228, 240, 241), (246, 231, 234)
INK, SOFT, TEAL, AQUA = (34, 54, 58), (95, 115, 118), (43, 124, 139), (169, 216, 220)
SKIN, NAIL, CREAM, AMBAR, ROSA = (233, 196, 170), (242, 214, 200), (255, 255, 255), (154, 95, 23), (233, 175, 192)


def font(kind, size, weight=400, opsz=None):
    f = ImageFont.truetype(os.path.join(FONTS, f'{kind}.ttf'), size)
    axes = [weight] + ([opsz or min(72, max(6, size // 2))] if kind == 'serif' else [])
    f.set_variation_by_axes(axes)
    return f


def ease(x):  # suave al entrar y al salir
    x = max(0.0, min(1.0, x))
    return 0.5 - 0.5 * math.cos(math.pi * x)


def appear(t, start, dur=0.5):
    return ease((t - start) / dur)


def mix(c1, c2, a):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * a) for i in range(3))


def text(d, xy, s, f, fill=INK, anchor='mm', alpha=1.0, bg=PEARL):
    if alpha <= 0:
        return
    d.text(xy, s, font=f, fill=mix(bg, fill, alpha), anchor=anchor)


def wrap(d, s, f, maxw):
    words, lines, cur = s.split(), [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if d.textlength(test, font=f) <= maxw:
            cur = test
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines


def render_scene(path, dur, draw, bg=PEARL, fade=0.35):
    n = int(round(dur * FPS))
    tmp = path[:-4] + '.part.mp4'
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                          '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '20',
                          '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
    for i in range(n):
        t = i / FPS
        img = Image.new('RGB', (W, H), bg)
        draw(ImageDraw.Draw(img), t, img)
        a = min(1.0, t / fade, (dur - t) / fade) if fade else 1.0
        if a < 1:
            img = Image.blend(Image.new('RGB', (W, H), bg), img, max(0.0, a))
        p.stdin.write(img.tobytes())
    p.stdin.close()
    if p.wait() != 0:
        sys.exit(f'ffmpeg falló en {path}')
    os.replace(tmp, path)


def build(name, scenes, poster_scene=1, poster_t=None):
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        files = []
        for k, (dur, draw, bg) in enumerate(scenes):
            f = os.path.join(tmp, f'{k:02d}.mp4')
            render_scene(f, dur, draw, bg)
            files.append(f)
        lst = os.path.join(tmp, 'list.txt')
        open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
        out = os.path.join(OUT, f'{name}.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                        '-c', 'copy', '-movflags', '+faststart', out + '.part.mp4'], check=True)
        os.replace(out + '.part.mp4', out)
    dur, draw, bg = scenes[poster_scene]
    img = Image.new('RGB', (W, H), bg)
    draw(ImageDraw.Draw(img), poster_t if poster_t is not None else dur * 0.8, img)
    img.save(os.path.join(OUT, f'{name}.jpg'), quality=86)
    print('ok', out)


# ---------- Piezas comunes ----------
def titulo(t1, t2, bg=PEARL):
    def draw(d, t, img):
        text(d, (W // 2, 470), t1, font('serif', 92, 300), alpha=appear(t, 0.1, 0.7), bg=bg)
        text(d, (W // 2, 580), t2, font('sans', 40, 500), TEAL, alpha=appear(t, 0.6, 0.6), bg=bg)
    return draw


def cierre(bg=MIST):
    def draw(d, t, img):
        text(d, (W // 2, 500), 'Miranda Glow', font('serif', 96, 400), alpha=appear(t, 0.1, 0.6), bg=bg)
        text(d, (W // 2, 600), 'Cuidado de la piel por ingredientes', font('sans', 36, 400), SOFT, alpha=appear(t, 0.4), bg=bg)
        text(d, (W // 2, 660), 'mirandaglow.com', font('sans', 36, 600), TEAL, alpha=appear(t, 0.6), bg=bg)
    return draw


# ---------- Vídeo 1: la regla de los dos dedos ----------
def dedos(d, t, img):
    cx, base, top, fw = W // 2, 860, 250, 150
    for k, x in enumerate((cx - 95, cx + 95)):
        h = top + (40 if k else 0)
        d.rounded_rectangle((x - fw // 2, h, x + fw // 2, base + 200), radius=fw // 2, fill=SKIN)
        d.rounded_rectangle((x - 46, h + 16, x + 46, h + 116), radius=40, fill=NAIL)
        for j in (1, 2):
            yy = h + j * (base - h) // 3 + 40
            d.arc((x - 40, yy - 10, x + 40, yy + 10), 200, 340, fill=(214, 172, 146), width=3)
        grow = ease((t - 0.6) / 2.6)
        y_end = base - (base - (h + 130)) * grow
        if grow > 0:
            d.rounded_rectangle((x - 32, y_end, x + 32, base), radius=32, fill=CREAM, outline=(210, 220, 222), width=3)
    text(d, (W // 2, 120), 'Una línea a lo largo de dos dedos', font('sans', 44, 600), alpha=appear(t, 0.3))
    a = appear(t, 3.6, 0.6)
    if a > 0:
        d.rounded_rectangle((W // 2 - 300, 950, W // 2 + 300, 1040), radius=45, fill=mix(PEARL, INK, a))
        text(d, (W // 2, 995), '= cara y cuello', font('sans', 46, 700), (255, 255, 255), alpha=a, bg=INK)


def recordatorios(d, t, img):
    bg = BLUSH
    r = 70 + 6 * math.sin(t * 3)
    d.ellipse((W // 2 - r, 230 - r, W // 2 + r, 230 + r), fill=(242, 196, 120))
    for k in range(12):
        ang = k * math.pi / 6 + t * 0.4
        x1, y1 = W // 2 + math.cos(ang) * 100, 230 + math.sin(ang) * 100
        x2, y2 = W // 2 + math.cos(ang) * 130, 230 + math.sin(ang) * 130
        d.line((x1, y1, x2, y2), fill=(242, 196, 120), width=8)
    text(d, (W // 2, 480), 'Cada mañana.', font('serif', 80, 300), alpha=appear(t, 0.2), bg=bg)
    text(d, (W // 2, 580), 'También en invierno y nublado.', font('sans', 42, 500), SOFT, alpha=appear(t, 0.8), bg=bg)
    text(d, (W // 2, 760), 'Al sol, renuévalo cada 2 horas', font('sans', 46, 700), TEAL, alpha=appear(t, 2.2), bg=bg)
    text(d, (W // 2, 830), 'y después de bañarte o sudar.', font('sans', 42, 500), SOFT, alpha=appear(t, 2.6), bg=bg)


VIDEO_PROTECTOR = [
    (3.0, titulo('¿Cuánto protector?', 'La regla de los dos dedos'), PEARL),
    (6.0, dedos, PEARL),
    (5.0, recordatorios, BLUSH),
    (2.5, cierre(), MIST),
]


# ---------- Vídeo 2: el orden de la rutina ----------
def pasos(cab, sub, items, bg):
    def draw(d, t, img):
        text(d, (W // 2, 130), cab, font('serif', 84, 300), alpha=appear(t, 0.1), bg=bg)
        text(d, (W // 2, 210), sub, font('sans', 36, 500), TEAL, alpha=appear(t, 0.4), bg=bg)
        for k, (nombre, nota, dens) in enumerate(items):
            a = appear(t, 0.9 + k * 1.0, 0.5)
            if a <= 0:
                continue
            y = 340 + k * 165
            x0 = 130 + int((1 - a) * 40)
            d.ellipse((x0, y - 42, x0 + 84, y + 42), fill=mix(bg, TEAL, a))
            text(d, (x0 + 42, y), str(k + 1), font('sans', 42, 700), (255, 255, 255), alpha=a, bg=TEAL)
            text(d, (x0 + 120, y - 16), nombre, font('sans', 50, 700), anchor='lm', alpha=a, bg=bg)
            if nota:
                text(d, (x0 + 120, y + 30), nota, font('sans', 34, 400), SOFT, anchor='lm', alpha=a, bg=bg)
            # gota que se vuelve más densa: de líquido a crema
            gx = W - 190
            col = mix(bg, mix(AQUA, CREAM, dens), a)
            d.ellipse((gx - 30 - dens * 14, y - 30 - dens * 6, gx + 30 + dens * 14, y + 30 + dens * 6), fill=col, outline=mix(bg, (190, 210, 212), a), width=3)
    return draw


def regla(d, t, img):
    bg = MIST
    text(d, (W // 2, 380), 'La regla de oro', font('sans', 44, 600), TEAL, alpha=appear(t, 0.1), bg=bg)
    for k, s in enumerate(['De lo más líquido', 'a lo más denso.']):
        text(d, (W // 2, 500 + k * 110), s, font('serif', 92, 300), alpha=appear(t, 0.5 + k * 0.5), bg=bg)
    text(d, (W // 2, 780), 'Y un solo activo fuerte por noche.', font('sans', 40, 500), SOFT, alpha=appear(t, 1.8), bg=bg)


VIDEO_RUTINA = [
    (2.5, titulo('El orden de tu rutina', 'Mañana y noche, en un minuto'), PEARL),
    (6.0, pasos('Mañana', 'Protege', [('Limpiar', 'suave, o solo agua', 0.1), ('Sérum', 'vitamina C o niacinamida', 0.3), ('Crema', 'sella la hidratación', 0.7), ('Protector solar', 'siempre el último', 1.0)], PEARL), PEARL),
    (6.0, pasos('Noche', 'Repara', [('Desmaquillar', 'si llevas maquillaje', 0.4), ('Limpiar', 'segundo limpiador', 0.1), ('Tratamiento', 'uno por noche', 0.3), ('Crema', 'algo más rica', 0.8)], BLUSH), BLUSH),
    (4.0, regla, MIST),
    (2.5, cierre(PEARL), PEARL),
]


# ---------- Vídeo 3: leer una etiqueta ----------
INCI = ['Aqua', 'Glycerin', 'Niacinamide', 'Butylene Glycol', 'Propanediol', 'Sodium Hyaluronate', 'Panthenol',
        'Phenoxyethanol', 'Carbomer', 'Parfum', 'Rosa Canina Fruit Oil', 'Linalool', 'Limonene']


def etiqueta(d, t, img):
    bg = PEARL
    text(d, (W // 2, 110), 'Detrás del bote', font('serif', 76, 300), alpha=appear(t, 0.1), bg=bg)
    f = font('sans', 44, 500)
    x, y, lh, maxx = 110, 240, 92, W - 110
    pos = []
    for k, w in enumerate(INCI):
        s = w + (', ' if k < len(INCI) - 1 else '.')
        wd = d.textlength(s, font=f)
        if x + wd > maxx:
            x, y = 110, y + lh
        pos.append((x, y, d.textlength(w, font=f)))
        x += wd
    # subrayados de colores
    hi1 = appear(t, 2.6, 0.6)
    for k in range(3):
        x0, y0, wd = pos[k]
        d.rectangle((x0, y0 + 14, x0 + wd * hi1, y0 + 34), fill=mix(bg, (203, 230, 218), hi1))
    hi2 = appear(t, 5.6, 0.6)
    x0, y0, wd = pos[10]
    d.rectangle((x0, y0 + 14, x0 + wd * hi2, y0 + 34), fill=mix(bg, (243, 211, 220), hi2))
    for k, (x0, y0, wd) in enumerate(pos):
        s = INCI[k] + (', ' if k < len(INCI) - 1 else '.')
        text(d, (x0, y0), s, f, INK if k < 3 or k == 10 else SOFT, anchor='lm', alpha=appear(t, 0.5 + k * 0.12, 0.3), bg=bg)
    # línea del 1 %
    a1 = appear(t, 4.2, 0.5)
    if a1 > 0:
        x0, y0, wd = pos[6]
        yy = y0 + lh // 2
        for xx in range(110, int(110 + (maxx - 470 - 110) * a1), 26):
            d.line((xx, yy, xx + 14, yy), fill=AMBAR, width=4)
        text(d, (maxx, yy), 'desde aquí, menos del 1 %', font('sans', 32, 600), AMBAR, anchor='rm', alpha=a1, bg=bg)
    text(d, (W // 2, 860), 'Lo que más hay va primero.', font('sans', 46, 700), TEAL, alpha=appear(t, 3.0) * (1 - appear(t, 5.4, 0.3)), bg=bg)
    text(d, (W // 2, 860), 'El ingrediente del anuncio, al final:', font('sans', 46, 700), (163, 72, 94), alpha=appear(t, 5.8), bg=bg)
    text(d, (W // 2, 930), 'hay muy poco.', font('sans', 46, 700), (163, 72, 94), alpha=appear(t, 6.3), bg=bg)


def lector(d, t, img):
    bg = MIST
    text(d, (W // 2, 440), '¿Qué lleva tu crema?', font('serif', 84, 300), alpha=appear(t, 0.1), bg=bg)
    text(d, (W // 2, 550), 'Hazle una foto en el lector de', font('sans', 42, 500), SOFT, alpha=appear(t, 0.6), bg=bg)
    text(d, (W // 2, 610), 'mirandaglow.com/ingredientes', font('sans', 44, 700), TEAL, alpha=appear(t, 0.9), bg=bg)


VIDEO_ETIQUETA = [
    (2.5, titulo('Leer una etiqueta', 'en 10 segundos'), PEARL),
    (8.5, etiqueta, PEARL),
    (3.5, lector, MIST),
    (2.5, cierre(PEARL), PEARL),
]

if __name__ == '__main__':
    quien = sys.argv[1:] or ['protector', 'rutina', 'etiqueta']
    if 'protector' in quien: build('protector-dos-dedos', VIDEO_PROTECTOR, 1, 5.5)
    if 'rutina' in quien: build('orden-rutina', VIDEO_RUTINA, 1, 5.5)
    if 'etiqueta' in quien: build('leer-etiqueta', VIDEO_ETIQUETA, 1, 8.0)
