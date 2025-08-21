
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_USE_MOCK_DATA: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MOCK_DELAY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
