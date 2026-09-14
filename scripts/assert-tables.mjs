// Smoke test for CI. Confirms the seed produced the expected CRM tables.
// Plain Node ESM + fetch so no compile step is needed in the CI step.

const NOCODB_URL = process.env.NOCODB_URL ?? 'http://localhost:8080';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'change-me-please';
const BASE_TITLE = process.env.NOCODB_BASE_TITLE ?? 'Elemental';

const EXPECTED = ['companies', 'contacts', 'deals', 'activities', 'tasks'];

async function main() {
  const signin = await fetch(`${NOCODB_URL}/api/v1/auth/user/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!signin.ok) {
    throw new Error(`Signin failed: ${signin.status} ${await signin.text()}`);
  }
  const { token } = await signin.json();

  const basesRes = await fetch(`${NOCODB_URL}/api/v2/meta/bases/`, {
    headers: { 'xc-auth': token },
  });
  if (!basesRes.ok) throw new Error(`List bases failed: ${basesRes.status}`);
  const { list: bases } = await basesRes.json();
  const base = bases.find((b) => b.title === BASE_TITLE);
  if (!base) throw new Error(`Base "${BASE_TITLE}" not found`);

  const tablesRes = await fetch(`${NOCODB_URL}/api/v2/meta/bases/${base.id}/tables`, {
    headers: { 'xc-auth': token },
  });
  if (!tablesRes.ok) throw new Error(`List tables failed: ${tablesRes.status}`);
  const { list: tables } = await tablesRes.json();
  const found = new Set(tables.map((t) => t.table_name));

  const missing = EXPECTED.filter((t) => !found.has(t));
  if (missing.length) {
    console.error('Missing tables:', missing.join(', '));
    console.error('Found:', [...found].join(', '));
    process.exit(1);
  }
  console.log(`OK: all ${EXPECTED.length} CRM tables present in base "${BASE_TITLE}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
