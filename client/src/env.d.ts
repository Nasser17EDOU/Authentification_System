/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APPBARR_TITLE: string;
  readonly VITE_APPFOOTER_TITLE: string;
  readonly VITE_APPWELCOME_TITLE: string;
  readonly VITE_APPWELCOMEPARAGRAPHE_TITLE: string;
  readonly VITE_APP_PORT: string;
  // add more environment variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
