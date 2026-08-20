/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GATE1_API_ENABLED?: string;
  readonly VITE_ENABLE_ANTI_CHEAT_TAB_SWITCH?: string;
  readonly VITE_ENABLE_ANTI_CHEAT_PASTE?: string;
  readonly VITE_ENABLE_STAGE3_HARD_CAP?: string;
  readonly VITE_ENABLE_STAGE3_RETAKE_LIMIT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

