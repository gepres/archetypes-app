/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Claves que vite.config.ts inyecta desde el .env en tiempo de build.
// Cadena vacia cuando la variable no esta definida o es un marcador del .env.example.
interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
