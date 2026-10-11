import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

/** Una clave de verdad, o vacía si es la de ejemplo (como en la V1). */
function realKey(value?: string): string {
  const v = (value || '').trim();
  return !v || v.startsWith('MY_') ? '' : v;
}

// V2 vive bajo /v2/ del mismo sitio y se construye DENTRO de la salida de V1,
// para que un solo despliegue publique las dos. Por eso no vacia el directorio:
// V1 se construye primero y esto entra despues, en su subcarpeta.
export default defineConfig(({ mode }) => {
  // Las claves de IA, del .env de la raíz del proyecto, como la V1. Se apunta a la raíz de forma
  // explícita: leídas desde v2/ (su root), desaparecerían del bundle sin que nada fallara.
  // ATENCIÓN: viajan dentro del bundle y son públicas. Solo claves con límite de gasto.
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  return {
  base: '/v2/',
  root: __dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@v1': path.resolve(__dirname, '../src'),
      '@sigils': path.resolve(__dirname, '../packages/sigils/src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist/v2'),
    emptyOutDir: true,
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
  },
  define: {
    'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(realKey(env.OPENROUTER_API_KEY)),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(realKey(env.GEMINI_API_KEY)),
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(realKey(env.OPENAI_API_KEY)),
  },
  };
});
