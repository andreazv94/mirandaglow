# Handoff: App de rutina de cuidado de la piel (Miranda Glow móvil)

## Resumen
App móvil (iOS y Android) que diagnostica el tipo de piel, genera una rutina de mañana y noche, permite fotografiar productos para identificarlos y colocarlos en el paso correcto, avisa de conflictos entre activos, reparte los activos fuertes a lo largo de la semana y envía recordatorios diarios con un tono cálido.

Repositorio destino: `andreazv94/mirandaglow` (rama `main`). La web existente aporta el quiz y el catálogo de productos; esta app reutiliza esa lógica pero **no** su identidad visual: el diseño móvil usa el sistema Nocturne (oscuro), incluido en este paquete.

## Sobre los archivos de diseño
Los archivos HTML de este paquete son **referencias de diseño**, no código de producción. Muestran el aspecto y el comportamiento previstos. El trabajo consiste en **recrear estas pantallas en el entorno del proyecto** (React Native, Expo, SwiftUI + Jetpack Compose, o lo que decida el equipo) siguiendo sus patrones y librerías. Si aún no hay app móvil en el repo, elige el framework más adecuado (recomendación: React Native con Expo, por compartir código entre iOS y Android) e implementa allí.

`support.js`, `ios-frame.jsx` y `android-frame.jsx` son andamiaje del prototipo (runtime de plantillas y marcos de dispositivo). **No portar**: existen solo para que el HTML se vea como un móvil en el navegador.

## Fidelidad
**Alta fidelidad.** Colores, tipografía, espaciado, estados e interacciones son definitivos. Reprodúcelos con exactitud usando los tokens del sistema Nocturne (`_ds/.../styles.css`). Las fotos de productos y de rostro son marcadores de posición: en la app real son imágenes subidas por la persona usuaria.

## Cómo abrir el prototipo
Abre `Rutina de Piel App.dc.html` en un navegador. Contiene dos bloques:

- **Bloque 2** (arriba): notificaciones en pantalla de bloqueo, primer día con estante vacío, y dos pantallas Android.
- **Bloque 1** (abajo): `1a` es el prototipo iOS **interactivo** — haz clic dentro del móvil para recorrer todo el flujo. `1b`, `1c`, `1d` son variaciones estáticas de la pantalla de rutina que se exploraron; la decisión fue combinar `1b` (lista) con `1c` (modo ritual), que es lo implementado en `1a`. `1e` es la versión Android de la misma pantalla.

---

## Pantallas

### 1. Onboarding / diagnóstico
**Propósito:** cuatro preguntas que determinan la rutina inicial.

**Layout:** columna única. Padding `74px 20px 28px` (el superior deja sitio a la barra de estado). Barra de progreso de 3px arriba, contador, pregunta, ayuda, lista de opciones, y al fondo la fila de botones.

**Componentes:**
- Barra de progreso: alto 3px, radio 99px, pista `rgba(233,233,237,.12)`, relleno `--color-accent`, ancho `(índice+1)/4 * 100%`, transición `width .35s ease`.
- Contador: 10px, `letter-spacing .12em`, mayúsculas, `--color-accent`. Texto: "Pregunta N de 4".
- Pregunta: 25px, `line-height 1.15`, margen `10px 0 4px`.
- Ayuda: 12px, `--color-neutral-400`, alto mínimo 18px (evita saltos entre preguntas).
- Opción: fila flex, gap 10px, padding 13px, radio 8px, fondo `--color-surface`, sombra `--shadow-sm`. Título 15px peso 500; subtítulo 11.5px `--color-neutral-400`. Seleccionada: `box-shadow: inset 0 0 0 1px var(--color-accent)` y círculo de 20px relleno de acento con "✓" en `--color-bg`. Hover: `background: color-mix(in srgb, var(--color-text) 5%, var(--color-surface))`.
- Botones: "Atrás" (`.btn-ghost`, solo desde la pregunta 2) y el principal (`.btn-primary`, `flex:1`, alto mínimo 46px, 15px). Texto: "Continuar", y "Ver mi rutina" en la última.

**Preguntas y opciones (copy literal):**
1. "¿Cómo notas tu piel al final del día?" — ayuda: "Elige la que más se parezca."
   - "Tirante y seca" / "Sin brillos, a veces descamación" → `seca`
   - "Brillante por todas partes" / "Sobre todo en la zona T" → `grasa`
   - "Brillos en T, normal en mejillas" / "Lo más común" → `mixta`
   - "Equilibrada, ni seca ni grasa" / "Cómoda casi siempre" → `normal`
2. "¿Qué te gustaría mejorar?" (**selección múltiple**) — ayuda: "Puedes marcar varias."
   - "Granitos y acné" → `acne` · "Manchas y tono desigual" → `manchas` · "Líneas y firmeza" → `edad` · "Luminosidad general" → `luz` · "Sequedad y tirantez" → `sequedad`
3. "¿Tu piel reacciona con facilidad?" — ayuda: "Nos dice a qué ritmo introducir activos."
   - "Sí, se irrita y enrojece" / "Fórmulas suaves" → `sensible` · "A veces, según el producto" → `algo` · "No, tolera casi todo" → `resistente`
4. "¿Cuánta experiencia tienes?" — ayuda: "Para no abrumarte el primer día."
   - "Empiezo de cero" / "Rutina simple de 3 pasos" → `novata` · "Lo básico: limpio e hidrato" → `media` · "Uso activos (ácidos, retinol…)" → `avanzada`

**Comportamiento:** en las preguntas de opción única, elegir avanza sola tras 160 ms. En la múltiple hay que pulsar "Continuar" y no avanza con cero selecciones. Al terminar, pantalla de generación (1500 ms) con un círculo de 56px con borde de acento y `box-shadow: 0 0 42px color-mix(in srgb, var(--color-accent) 45%, transparent)`, título "Armando tu rutina" (17px) y subtítulo "Cruzamos tu tipo de piel, tus objetivos y tu tolerancia a los activos."

---

### 2. Rutina de hoy
**Propósito:** pantalla de uso diario. Marcar pasos o entrar en el modo ritual.

**Cabecera** (padding `70px 20px 12px`): a la izquierda kicker de 10px en acento ("Martes 1 de septiembre") y título de 28px ("Buenos días" / "Buenas noches" según el momento). A la derecha, `.tag.tag-neutral` con el tipo de piel; pulsarlo reinicia el diagnóstico (en producción, abrir el perfil).

**Cuerpo** (padding `0 20px 120px`, columna con gap 14px):
1. **Aviso de la noche anterior**: caja con fondo `--color-accent-900`, `inset 0 0 0 1px var(--color-accent-800)`, radio 8px, barra vertical de 3px en acento a la izquierda, gap 11px. Etiqueta "Recordatorio de anoche" (10px, `--color-accent-300`) y texto 13.5px `--color-accent-100`. Cerrable con "×".
2. **Progreso**: tarjeta con "N de M pasos hechos" y "Racha de 11 días" (12px `--color-neutral-400`), y barra de 4px con relleno de acento.
3. **Selector AM/PM**: dos mitades, padding 9px, radio 8px, 13.5px. Activa: texto acento + `inset 0 0 0 1px var(--color-accent)`. Inactiva: `--color-neutral-400` + `inset 0 0 0 1px var(--color-divider)`. Hover: `color-mix(in srgb, var(--color-accent) 10%, transparent)`.
4. **Botón "Empezar la rutina paso a paso"** (`.btn-primary.btn-block`, alto mínimo 48px).
5. **Tarjetas de paso** (una por producto del momento activo): fila con círculo de marcado de 26px a la izquierda (área táctil ampliada con padding 9px) y contenido. Kicker "Paso N · Categoría" (10px acento), nombre 16px peso 500 (pulsarlo abre el detalle del producto), descripción 12px `--color-neutral-400`, y dos tags: frecuencia (`.tag-neutral`) y activo (`.tag-outline`). Marcado: círculo relleno de acento con "✓", nombre a `opacity .5` y `line-through`.
6. **Sugerencia**: tarjeta con `inset 0 0 0 1px var(--color-accent-800)`, kicker "Sugerencia para ti", texto, y dos botones: "Añadir al paso N" (el número se calcula insertando el producto en la rutina ordenada) y "No, gracias".
7. **Accesos**: dos botones `.btn-secondary` en fila, "Semana de activos" y "Tratamientos".

**Barra inferior** (sticky): fondo `color-mix(in srgb, var(--color-bg) 88%, transparent)` con `backdrop-filter: blur(14px)`, borde superior `0 -1px 0 rgba(233,233,237,.1)`, padding `9px 12px 26px`. Cinco elementos: Hoy, Estante, botón central de Escanear (círculo de 46px con borde de acento, `margin-top:-16px`, glow `0 0 26px`), Progreso, Perfil. Iconos Phosphor de 22px; activo en `--color-accent`, inactivo en `--color-neutral-500`, hover `--color-accent-300`.

---

### 3. Modo ritual (paso a paso)
Pantalla completa sobre la rutina. Padding `66px 22px 30px`. Arriba, una barra de progreso segmentada (un segmento por paso, 3px, acento los completados) y una "×" para salir. Kicker "Paso N de M · Categoría", título 31px, indicación 14px `--color-neutral-300` con `max-width:30ch`, marcador de foto de 210px (radio 12px, degradado `linear-gradient(150deg,#1e2133,#131624)`), dos tags, y abajo `.btn-primary.btn-block` de 50px ("Hecho, siguiente paso" / "Hecho, terminar" en el último) más "Saltar este paso hoy" (12.5px, `--color-neutral-500`).

Marcar "Hecho" completa el paso en la rutina y avanza. El último cierra el modo ritual.

**Indicaciones por categoría:**
- Limpieza: "Masajea 30 segundos sobre la piel húmeda y aclara con agua templada."
- Tratamiento: "Dos o tres gotas. Extiende sin frotar y espera un minuto antes del siguiente paso."
- Hidratación: "Una cantidad como una avellana, de dentro hacia fuera, cuello incluido."
- Protección: "Dos dedos de producto. Repite a media tarde si te da el sol."

---

### 4. Escanear producto
Visor de 300px (radio 14px, degradado `linear-gradient(170deg,#1c1f31,#101220)`) con un rectángulo guía de 172×214px con borde de acento y glow. Pie de texto que cambia por estado: "Encuadra la etiqueta del producto" → "Analizando la etiqueta…" → "Producto reconocido".

Estados: **cámara** (botón "Hacer la foto") → **analizando** (1400 ms; fila con círculo de 22px y "Leyendo la etiqueta y buscando el producto…") → **resultado**.

Resultado: tarjeta con `inset 0 0 0 1px var(--color-accent-800)`, kicker "Identificado · 94% de confianza", nombre 18px, explicación de dónde encaja, tags de momento y activo. Si la rutina ya contiene retinol, debajo aparece el aviso de conflicto: "Ya usas retinol: no lo mezcles con el exfoliante la misma noche. Si lo guardas, te dejamos el retinol el martes y el viernes, y el exfoliante el jueves." Botones "Guardar en mi estante" y "Otra foto". Guardar añade el producto al estante y navega allí.

En producción: reconocimiento por foto de etiqueta contra el catálogo, con confianza mostrada y opción de corregir manualmente.

---

### 5. Mis productos (estante)
Resumen "N productos guardados · M en tu rutina actual". Lista de filas pulsables (abren el detalle): miniatura de 44×56px (radio 5px, degradado `linear-gradient(160deg,--color-neutral-800,--color-neutral-900)`, texto "foto"), nombre 15px, "Categoría · frecuencia" 11.5px, y tags de momento (`.tag-accent`) y activo (`.tag-neutral`).

**Vacío:** caja con `inset 0 0 0 1px var(--color-divider)`, título "Aún no tienes nada guardado", texto "Haz una foto a lo que ya usas, aunque sea un solo bote. Con eso ordenamos los pasos y te avisamos de las mezclas que no van juntas." y botón "Escanear mi primer producto". (La versión ampliada de esta pantalla está en el bloque `2b` del prototipo.)

Al final, aviso permanente sobre mezclas: "Ojo con mezclar retinol y ácido salicílico la misma noche: los alternamos por ti en el calendario."

---

### 6. Detalle de producto
Padding `66px 20px 30px`. "‹ Volver", kicker "Categoría · Activo", nombre 27px, tres tags (momento, frecuencia, "En tu rutina" / "Solo en tu estante"), descripción, marcador de foto de 170px, bloque "Ingredientes principales" (13px, `line-height 1.7`) y bloque "Compatibilidad": una caja de aviso por conflicto, o "Se lleva bien con todo lo que tienes ahora en la rutina." Abajo, `.btn-secondary.btn-block`: "Quitar de la rutina" si el producto se añadió manualmente, "Añadir a la rutina" si solo está en el estante, "Cerrar" si forma parte de la rutina generada.

---

### 7. Semana de activos
Introducción que cambia según haya retinol en la rutina. Rejilla: columna izquierda de 112px con el nombre del activo (13px) y su nota (10.5px), y siete celdas de 26px (radio 6px) por fila. Activa: `--color-accent-800`; activa y hoy: `--color-accent`; inactiva: `inset 0 0 0 1px var(--color-divider)`. Cabecera de días "L M X J V S D" (11px), hoy en acento.

Plan por defecto (solo se muestran las filas cuyos productos están en la rutina): Retinol "2 noches" (M, V) · Ácido salicílico "1-2 noches" (J) · Vitamina C "cada mañana" · Niacinamida "una vez al día" · Hialurónico "mañana y noche" · Limpieza + crema "siempre".

Debajo: "Si te salta una noche de activo no pasa nada: la movemos al día siguiente y te avisamos." y botón "Ajustar la frecuencia".

---

### 8. Tratamientos recomendados
Introducción: "Sugerencias para [tipo de piel]. Acepta lo que te apetezca probar; el resto no vuelve a aparecer."

Tarjetas con kicker de categoría, tag de estado ("Sugerido" / "En tu rutina" / "Descartado"), nombre 17px, motivo, pauta (12px `--color-accent-300`) y, mientras estén pendientes, "Añadir a la rutina" / "Ahora no".

Contenido:
- Exfoliación — "Exfoliante con ácido salicílico" — "Desobstruye poros y baja los granitos. Se introduce despacio y nunca junto al retinol." — "2-3 noches por semana, alternando con otros activos"
- Luminosidad — "Sérum de vitamina C" — "Unifica el tono y suma antioxidante de día, justo antes del protector solar." — "Cada mañana, sobre piel limpia"
- Cuidado semanal — "Mascarilla calmante de avena" — "Un rescate para las semanas en las que la piel ha tenido activos fuertes." — "Una vez por semana, 10 minutos"

---

### 9. Progreso
Comparador antes/después: contenedor de 300px con la foto antigua de fondo y la reciente recortada con `clip-path: inset(0 0 0 X%)`, línea vertical de 1px en acento en la posición X y tirador circular de 32px con borde de acento. Etiquetas "Antes" (izquierda, `--color-neutral-400`) y "Hoy" (derecha, acento). Debajo, un control deslizante (`accent-color: var(--color-accent)`) que mueve X; en la app nativa debe ser arrastrable directamente sobre la imagen.

Dos métricas en tarjeta: "6 semanas de fotos" y "86% rutinas completadas". Nota en caja de acento: "Desde que la niacinamida entró en la rutina, las cinco últimas semanas registran menos brillos en la zona T." Botón "Hacer la foto de esta semana".

Guía superior: "Misma luz, misma distancia, cara lavada. Te avisamos cada domingo para la foto."

---

### 10. Perfil y avisos
Tarjeta de diagnóstico con "Piel mixta · 2 objetivos · 5 productos en rutina" (singular/plural correctos) y "Repetir el test" (`.btn-ghost`, sin padding izquierdo).

Lista de recordatorios con interruptor (42×24px, radio 99px; encendido: fondo `--color-accent-800`, borde de acento y bolita de 18px en acento a `left:21px`; apagado: borde `--color-divider` y bolita `--color-neutral-600` a `left:3px`; transición `left .18s ease`):
- "Aviso de la rutina de noche" — "A las 22:00, y te recuerda qué activo toca" (por defecto encendido)
- "Aviso de la rutina de mañana" — "A las 08:00, con el protector solar al final" (encendido)
- "Reaplicar protector solar" — "A media tarde, solo si has salido de casa" (apagado)
- "Resumen del domingo" — "Cómo ha ido la semana y qué toca la siguiente" (encendido)

Selector de tono: "Cálido" / "Directo" (mismo control que AM/PM). Debajo, vista previa en vivo: `Así suena ahora: "…"`.

---

## Notificaciones
El texto depende de tres cosas: si hay retinol en la rutina, el momento del día y el tono elegido.

**Con retinol, cálido** — noche: "Ayer usaste retinol, así que hoy tu piel prefiere una noche tranquila: tratamiento suave, crema y a dormir." / mañana: "Anoche tocó retinol. Hoy el protector solar es tu mejor amigo, no te lo dejes."

**Con retinol, directo** — noche: "Retinol usado ayer. Hoy sin exfoliantes: tratamiento suave e hidratación." / mañana: "Retinol usado anoche. Piel más sensible al sol: aplica SPF50."

**Sin retinol, cálido** — noche: "Rutina de noche en N pasos. Empieza cuando quieras y te los voy marcando." / mañana: "Buenos días. N pasos y sales de casa con el protector puesto."

**Sin retinol, directo** — noche: "Rutina de noche: N pasos. Márcalos al terminar." / mañana: "Rutina de mañana: N pasos, protector incluido."

En pantalla de bloqueo (bloque `2a`): tarjetas de radio 14px sobre `rgba(35,37,50,.85)`, remitente "MIRANDA GLOW" y hora en 11px `--color-neutral-500`, título 14px peso 500, cuerpo 13px `--color-neutral-300`. Las notificaciones más antiguas bajan de opacidad de fondo (`.7`, `.55`).

---

## Motor de recomendación
Reglas exactas del prototipo (`construirRutina`), derivadas del quiz de la web:

1. Limpiador: bálsamo nutritivo si la piel es seca o el objetivo incluye sequedad; gel suave en el resto.
2. Por objetivo, se añaden: `acne` → exfoliante BHA + niacinamida; `manchas` → vitamina C + niacinamida; `edad` → vitamina C + retinol; `luz` → vitamina C; `sequedad` → hialurónico.
3. Si no se eligió ningún objetivo, la rutina base añade vitamina C e hialurónico.
4. Hidratante: crema nutritiva si piel seca o sequedad; ligera en el resto.
5. Protector solar siempre.
6. Se eliminan duplicados manteniendo el orden.
7. Si la experiencia es `novata`, se recorta a los dos primeros tratamientos + hidratante ligera + SPF.

Cada producto lleva `momento` (`am`, `pm`, `ambos`) y `orden` (1 limpieza, 2 tratamiento ligero, 3 tratamiento fuerte, 4 hidratación, 5 protección). La rutina de un momento se filtra por `momento` y se ordena por `orden`.

**Conflictos declarados:** retinol ↔ ácido salicílico (nunca la misma noche); vitamina C ↔ BHA (espaciar horas). El calendario semanal es quien resuelve el reparto.

**Catálogo del prototipo** (categorías sin marca): gel limpiador suave, bálsamo limpiador nutritivo, sérum de vitamina C, sérum de niacinamida 10%, sérum de ácido hialurónico, retinol encapsulado 0,3%, exfoliante con ácido salicílico, crema hidratante ligera, crema nutritiva reparadora, protector solar facial SPF50. Los ingredientes de cada uno están en el objeto `INFO` del prototipo.

---

## Estado necesario
- `fase`: `onboarding` | `generando` | `app`
- `qi` (pregunta actual) y `respuestas` (4 posiciones; la segunda es un array)
- `tab`: `hoy` | `estante` | `escanear` | `progreso` | `perfil` | `semana` | `trat`
- `momento`: `am` | `pm`
- `hechos`: mapa de id de producto → completado (debe reiniciarse cada día y guardar histórico para la racha y el porcentaje)
- `ritual` (booleano) y `ritualIdx`
- `detalle`: id del producto abierto, o nulo
- `extra`: productos añadidos manualmente al estante o la rutina
- `sugerencia`: `pendiente` | `aceptada` | `rechazada`
- `trat`: mapa de tratamiento → `si` | `no`
- `escaneo`: `camara` | `analizando` | `resultado`
- `comparador` (0-100), `tono` (`Cálido` | `Directo`), `ajustes` (cuatro interruptores)

Persistencia real: perfil y respuestas del quiz, estante, marcados diarios con fecha, fotos de progreso, preferencias de aviso. Programación local de notificaciones según los interruptores y el calendario de activos.

---

## Tokens de diseño (Nocturne)
Tómalos de `_ds/nocturne-.../styles.css`; no fijes hex a mano. Valores de referencia:

- Fondo `--color-bg` #161826 · texto `--color-text` #e9e9ed · acento `--color-accent` #9184d9
- Superficie `--color-surface`, divisor `--color-divider`, rampas `--color-neutral-100…900` y `--color-accent-100…900`
- Sombras `--shadow-sm/md/lg` (nunca sombras propias)
- Radio base 8px (tarjetas), 12-14px (contenedores de imagen), 99px (píldoras). En Android, radios mayores (14-16px) y botones de píldora.
- Tipografía Inter; escala usada: 10px kicker en mayúsculas con `letter-spacing .12em`, 11.5-12.5px secundario, 13.5-15px cuerpo, 16-18px títulos de tarjeta, 25-31px títulos de pantalla. Sin pesos por encima de 500.
- Espaciado: gap 8px dentro de grupos, 14px entre bloques, padding 12-14px en tarjetas, 20px lateral de pantalla.
- Iconos: Phosphor, 22px en la barra de pestañas.
- Área táctil mínima 44px en todos los controles.
- Foco de teclado: `outline: 2px solid var(--color-accent); outline-offset: 2px`.

Reglas del sistema que hay que respetar: botones primarios con contorno de acento, nunca relleno; nada de negros ni blancos puros; el acento se usa como línea, borde y brillo, no como fondo extenso.

## Diferencias iOS / Android
El contenido es idéntico; cambia el envoltorio. Android: radios de 14-16px en tarjetas, botones de píldora (`border-radius: 99px`), tipografía del sistema, y navegación inferior Material en lugar de la barra iOS con botón central elevado. Ver `2c`, `2d` y `1e` en el prototipo.

## Recursos
No hay imágenes reales. Todos los marcadores de foto (producto, rostro) son degradados y deben sustituirse por las fotos que suba la persona usuaria. Iconos: Phosphor, incluidos como SVG inline en el prototipo. Fuente: Inter.

## Archivos de este paquete
- `Rutina de Piel App.dc.html` — todas las pantallas, prototipo iOS interactivo incluido.
- `_ds/nocturne-.../styles.css` — tokens y clases del sistema de diseño. Esta es la fuente de verdad visual.
- `_ds/nocturne-.../readme.md` — guía del sistema Nocturne.
- `_ds/nocturne-.../_ds_bundle.js` — componentes del sistema.
- `support.js`, `ios-frame.jsx`, `android-frame.jsx` — andamiaje del prototipo. No portar.
