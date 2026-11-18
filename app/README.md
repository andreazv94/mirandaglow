# Miranda Glow · App

App de rutina diaria hecha con Expo (React Native). Ahora mismo se publica
como **app web** en `mirandaglow.com/app`; más adelante se puede sacar en
iOS y Android con el mismo código.

- Usa el **mismo test y motor de recomendación que la web**
  (`../src/components/quiz-logic.ts`) y el mismo catálogo de productos
  (`../src/data/productos.ts`). Si cambias un producto o una regla, cambia
  en los dos sitios.
- Todo (diagnóstico, pasos hechos, productos que tienes) se guarda solo en
  el dispositivo de la usuaria.
- El escáner de productos está marcado como "Próximamente".

## Desarrollo

```bash
cd app
npm install
npx expo start --web     # o: npx expo start (móvil con Expo Go)
```

## Publicar cambios de la app en la web

Desde la raíz del proyecto:

```bash
npm run build:app        # genera la app en public/app
```

Sube los cambios (incluida la carpeta `public/app`) y Cloudflare publica
la web con la app dentro.
