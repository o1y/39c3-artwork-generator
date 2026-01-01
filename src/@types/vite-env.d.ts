/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IMPRESSUM_NAME: string;
  readonly VITE_IMPRESSUM_ADDRESS: string;
  readonly VITE_IMPRESSUM_PHONE: string;
  readonly VITE_IMPRESSUM_EMAIL: string;
  readonly VITE_ENABLE_PUBLIC_GALLERY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
