import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// HTML de la app web. Carga el mismo sincronizador que la web:
// si tienes cuenta, tu rutina y tu test se guardan en ella.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <script src="/js/cuenta.js" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
