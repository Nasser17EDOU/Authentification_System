// src/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    // Server Config
    APP_NAME: string;
    NODE_ENV: "development" | "production" | "test";
    PORT: string;
    ALLOWED_ORIGINS: string;

    // Database
    DB_HOST: string;
    DB_PORT?: string;
    DB_USER: string;
    DB_PASSWORD?: string;
    DB_NAME: string;

    // Sessions/Secrets
    SESSION_NAME: string;
    SESSION_SECRET: string;

    // Super Admin Credentials
    SUPER_ADMIN_LOGIN: string;
    SUPER_ADMIN_NOM: string;
    SUPER_ADMIN_PRENOM?: string;
    SUPER_ADMIN_EMAIL?: string;
    SUPER_ADMIN_TEL?: string;
    SUPER_ADMIN_GENRE?: "Masculin" | "Féminin";
    SUPER_ADMIN_INIT_PASSWORD?: string; // Optional for security reasons
  }
}
