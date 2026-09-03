import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// V2 vive bajo /v2/ del mismo sitio y se construye DENTRO de la salida de V1,
// para que un solo despliegue publique las dos. Por eso no vacia el directorio:
// V1 se construye primero y esto entra despues, en su subcarpeta.
export default defineConfig({
  base: '/v2/',
  root: __dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@v1': path.resolve(__dirname, '../src'),
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
});
