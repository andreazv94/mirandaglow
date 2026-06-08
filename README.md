# Miranda Glow ✦

Web de skincare personalizado: un test que recomienda una rutina, más un blog
de guías. Monetización por **afiliación** (Awin/Sephora, Amazon, etc.).

Hecho con **Astro** (web ultrarrápida y muy buena para SEO) + **React** para el
quiz interactivo. Sin servidor, sin base de datos, sin mantenimiento.

---

## 🚀 Arrancar en local

Necesitas Node.js 18 o superior.

```bash
npm install      # instala dependencias (solo la primera vez)
npm run dev      # arranca en http://localhost:4321
npm run build    # genera la web final en /dist
npm run preview  # previsualiza el build
```

---

## 📁 Dónde está cada cosa

```
src/
  data/productos.ts          ← ⭐ TUS PRODUCTOS Y ENLACES DE AFILIADO (lo más importante)
  components/
    Quiz.tsx                 ← el test (lógica de recomendación incluida)
    ProductoAfiliado.astro   ← tarjeta de producto para usar en los artículos
  content/blog/              ← ⭐ TUS ARTÍCULOS (un .mdx por artículo)
  pages/                     ← las páginas (home, /test, /blog)
  layouts/Layout.astro       ← cabecera, footer y SEO comunes
  styles/global.css          ← paleta opalita y estilos base
```

### Para añadir o cambiar un producto
Edita **`src/data/productos.ts`**. Cambia el campo `url` por tu enlace de
afiliado real (ahora pone `https://ejemplo.com/?aff=TU_ID`). Como todo está
centralizado aquí, el cambio se aplica al quiz Y a todos los artículos a la vez.

### Para escribir un artículo nuevo
Crea un archivo en **`src/content/blog/`**, por ejemplo `mi-articulo.mdx`:

```mdx
---
titulo: "Mi título"
descripcion: "Resumen corto para Google y para compartir."
fecha: 2026-06-15
concern: "Manchas"
---

import ProductoAfiliado from '../../components/ProductoAfiliado.astro';

Texto del artículo en markdown normal...

<ProductoAfiliado id="vitC" />

Más texto...
```

El artículo aparece solo en `/blog` y en su URL `/blog/mi-articulo`.
El `id` del producto debe coincidir con uno de `productos.ts`.

> ⚠️ Los enlaces de afiliado ya llevan `rel="sponsored nofollow"` automático.
> Esto lo exige Google: NO lo quites o pueden penalizarte el posicionamiento.

---

## 🌐 Publicar la web (gratis, sin servidor)

Tu web NO necesita servidor ni FTP. Se publica en una plataforma gratuita que
construye y aloja todo. Tu dominio (mirandaglow.com) está en Dinahosting, pero
**dominio y alojamiento son cosas separadas**: el dominio sigue en Dinahosting
y solo lo "apuntas" a la plataforma.

### Paso 1 — Sube el código a GitHub
Crea un repositorio en GitHub (gratis) y sube esta carpeta:

```bash
git init
git add .
git commit -m "Primera versión de Miranda Glow"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mirandaglow.git
git push -u origin main
```

### Paso 2 — Conéctalo a una plataforma (elige una)
- **Netlify** o **Cloudflare Pages**: ideales para Astro, plan gratis generoso.
- **Vercel**: también funciona perfecto.

Entra, dale a "importar proyecto desde GitHub", elige el repo. Detectará Astro
solo. Comando de build: `npm run build`. Carpeta de salida: `dist`.
A partir de aquí, **cada vez que hagas `git push`, la web se actualiza sola.**

### Paso 3 — Conectar tu dominio de Dinahosting
1. En la plataforma (Netlify/Cloudflare/Vercel), añade tu dominio
   `mirandaglow.com`. Te dará unos datos DNS (o unos *nameservers*).
2. Entra en el panel de **Dinahosting** → tu dominio → zona DNS.
3. La opción más sencilla suele ser cambiar los **nameservers** del dominio por
   los que te da la plataforma. Si prefieres no tocarlos, añade los registros
   que te indiquen (normalmente un registro `A` y un `CNAME` para el `www`).
4. Guarda. Los cambios DNS tardan de minutos a 24-48h en propagarse: si justo
   después no carga, es normal, espera un poco.

> Cuando el dominio sea definitivo, cambia `site:` en `astro.config.mjs` por tu
> URL real (ya está puesto `https://mirandaglow.com`). Eso mantiene correctos
> el sitemap y las URLs canónicas para Google.

### Paso 4 — Dar de alta en Google
Crea una cuenta en **Google Search Console**, verifica tu dominio y envía tu
sitemap: `https://mirandaglow.com/sitemap.xml`. Así Google empieza a indexarte.

---

## 💸 Recordatorio de negocio
La web es solo la mitad. El dinero llega cuando hay **tráfico**, y el tráfico
viene del **contenido** (los artículos del blog) posicionado en Google. Publica
con constancia (1-2 artículos/semana), enfócate en guías tipo "mejores X para Y"
y comparativas, y enlaza siempre al test. El SEO tarda 3-6 meses en arrancar.
