/**
 * Build/runtime configuration. All values come from Vite's `import.meta.env`,
 * meaning they are baked into the static build. To change them after deploy
 * you have to rebuild the `crm` Docker image.
 */
export const config = {
  /** NocoDB public URL, e.g. https://admin.example.com */
  nocodbUrl: (import.meta.env.VITE_NOCODB_URL as string | undefined) ?? 'http://localhost:8080',
  /** Branded app name shown in the header. */
  appName: (import.meta.env.VITE_CRM_BASE_NAME as string | undefined) ?? 'Elemental CRM',
  /** NocoDB base title we expect to find. Must match scripts/seed.ts */
  baseTitle: 'Elemental',
};

export const STORAGE_KEYS = {
  authToken: 'elemental.auth.token',
  user: 'elemental.auth.user',
  baseId: 'elemental.base.id',
} as const;
