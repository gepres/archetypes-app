import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { handleGeminiChat } from './src/server/geminiHandler';

// Los .env.example vienen con marcadores tipo "MY_GEMINI_API_KEY": no son claves.
function realKey(value?: string): string {
  const v = (value || '').trim();
  return !v || v.startsWith('MY_') ? '' : v;
}

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/gemini/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body);
              const result = await handleGeminiChat(parsed);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: true, text: err?.message || 'Error processing request' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Se lee el .env sin prefijo para no tener que renombrar las variables ya existentes.
  // ATENCION: lo que se inyecte aqui viaja dentro del bundle y es publico para
  // cualquiera que abra el sitio. Solo claves con limite de gasto.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      geminiApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og-image.png'],
        manifest: {
          name: 'Arquetipos Universales',
          short_name: 'Arquetipos',
          description:
            'Mapa simbólico de los 18 arquetipos universales, con narrativa masculina, femenina y universal: test, oráculo diario, diario de reflexión y retos de desarrollo.',
          lang: 'es',
          dir: 'ltr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0B1110',
          theme_color: '#0B1110',
          categories: ['lifestyle', 'education', 'health'],
          icons: [
            { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          // El bundle ronda los 2 MB y el tope por defecto de Workbox es justo 2 MB
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: '/index.html',
          // Las APIs de IA y Firebase nunca deben servirse desde caché.
          // /v2/ es otra aplicación dentro del mismo sitio: si el service worker
          // de V1 responde a esas navegaciones con su propio index, V2 no carga.
          navigateFallbackDenylist: [/^\/api/, /^\/v2(\/|$)/],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    define: {
      'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(realKey(env.OPENROUTER_API_KEY)),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(realKey(env.GEMINI_API_KEY)),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(realKey(env.OPENAI_API_KEY)),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
