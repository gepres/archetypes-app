import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
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
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
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
