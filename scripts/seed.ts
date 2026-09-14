/* eslint-disable no-console */
/**
 * scripts/seed.ts
 *
 * Idempotent NocoDB bootstrap. Runs:
 *   1. wait for NocoDB to answer /health
 *   2. ensure the bootstrap admin user exists (signup, fall back to signin)
 *   3. ensure a "Elemental" base exists
 *   4. for each module's schema:
 *        - create any missing tables (without link columns)
 *        - create any missing link columns once all tables exist
 *        - create any missing views
 *
 * On every subsequent boot it's a no-op: every step checks-then-acts.
 *
 * Wired up in `infra/docker-compose.yml` as a one-shot service that writes a
 * `/marker/.seeded` file when finished.
 */
import process from 'node:process';
import { NocoDbClient, type TableDefinition } from '@elemental/sdk';
import { crmModule } from '@elemental/module-crm';

const NOCODB_URL = process.env.NOCODB_URL ?? 'http://localhost:8080';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'change-me-please';
const BASE_TITLE = process.env.NOCODB_BASE_TITLE ?? 'Elemental';

async function waitForNocoDb(client: NocoDbClient, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  let lastErr: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${NOCODB_URL}/api/v1/health`);
      if (res.ok) return;
    } catch (err) {
      lastErr = err;
    }
    await sleep(2_000);
  }
  throw new Error(`NocoDB did not become healthy within ${timeoutMs}ms: ${String(lastErr)}`);
}

async function ensureAuth(): Promise<{ authToken: string; apiToken: string }> {
  const anon = new NocoDbClient({ baseUrl: NOCODB_URL });
  let authToken: string;
  try {
    const res = await anon.signup(ADMIN_EMAIL, ADMIN_PASSWORD);
    authToken = res.token;
    console.log('[seed] admin user created');
  } catch (err) {
    console.log('[seed] signup failed (likely already exists), attempting signin');
    const res = await anon.signin(ADMIN_EMAIL, ADMIN_PASSWORD);
    authToken = res.token;
  }

  const authed = new NocoDbClient({ baseUrl: NOCODB_URL, authToken });
  const tokenRes = await authed.createApiToken('elemental-erp seed');
  return { authToken, apiToken: tokenRes.token };
}

async function ensureBase(client: NocoDbClient): Promise<string> {
  const base = await client.findOrCreateBase(BASE_TITLE);
  console.log(`[seed] base "${base.title}" -> ${base.id}`);
  return base.id;
}

interface SeedContext {
  baseId: string;
  /** name -> tableId */
  tableIds: Record<string, string>;
}

async function applyModuleSchema(
  client: NocoDbClient,
  baseId: string,
  schema: TableDefinition[],
): Promise<SeedContext> {
  const existing = await client.listTables(baseId);
  const tableIds: Record<string, string> = Object.fromEntries(
    existing.list.map((t) => [t.table_name, t.id]),
  );

  // Pass 1: create base tables (no link columns yet).
  for (const def of schema) {
    if (tableIds[def.name]) {
      console.log(`[seed]   table "${def.name}" already exists, skipping`);
      continue;
    }
    console.log(`[seed]   creating table "${def.name}"...`);
    const created = await client.createTable(baseId, def);
    tableIds[def.name] = created.id;
  }

  // Pass 2: create link columns now that every table exists.
  for (const def of schema) {
    const tableId = tableIds[def.name];
    if (!tableId) continue;
    const links = def.fields.filter((f) => f.type === 'LinkToAnotherRecord');
    if (links.length === 0) continue;

    const refreshed = await client.listTables(baseId);
    const target = refreshed.list.find((t) => t.table_name === def.name);
    const existingCols = new Set(target?.columns?.map((c) => c.column_name) ?? []);

    for (const link of links) {
      if (existingCols.has(link.name)) continue;
      const targetTableId = tableIds[link.relation!.targetTable];
      if (!targetTableId) {
        console.warn(
          `[seed]   skipping link "${def.name}.${link.name}" -> "${link.relation!.targetTable}" (target missing)`,
        );
        continue;
      }
      console.log(`[seed]   linking "${def.name}.${link.name}" -> "${link.relation!.targetTable}"`);
      try {
        await client.createLink(tableId, link, targetTableId);
      } catch (err) {
        console.warn(`[seed]   link failed (${(err as Error).message})`);
      }
    }
  }

  // Pass 3: create views.
  for (const def of schema) {
    if (!def.views?.length) continue;
    const tableId = tableIds[def.name];
    if (!tableId) continue;

    const existingViews = await client.listViews(tableId);
    const seen = new Set(existingViews.list.map((v) => v.title));
    for (const view of def.views) {
      if (seen.has(view.name)) continue;
      console.log(`[seed]   view "${def.name}.${view.name}" (${view.type})`);
      try {
        await client.createView(tableId, view);
      } catch (err) {
        console.warn(`[seed]   view failed (${(err as Error).message})`);
      }
    }
  }

  return { baseId, tableIds };
}

async function main() {
  console.log(`[seed] waiting for NocoDB at ${NOCODB_URL}...`);
  const probe = new NocoDbClient({ baseUrl: NOCODB_URL });
  await waitForNocoDb(probe);

  const { apiToken } = await ensureAuth();
  console.log('[seed] obtained API token');

  const client = new NocoDbClient({ baseUrl: NOCODB_URL, apiToken });
  const baseId = await ensureBase(client);

  const modules = [crmModule];
  for (const mod of modules) {
    console.log(`[seed] applying module "${mod.id}" v${mod.version}`);
    await applyModuleSchema(client, baseId, mod.schema);
  }

  console.log('[seed] done.');
  console.log('');
  console.log('  NocoDB API token (save this in your secret store):');
  console.log(`    ${apiToken}`);
  console.log('');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error('[seed] FAILED');
  console.error(err);
  process.exit(1);
});
