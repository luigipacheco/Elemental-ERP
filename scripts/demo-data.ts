/* eslint-disable no-console */
/**
 * scripts/demo-data.ts
 *
 * Seeds plausible CRM demo records via NocoDB's data API. Idempotent: only
 * inserts if the table is empty (so it's safe to re-run after `pnpm seed`
 * but it won't double-insert in a configured production database).
 *
 * Set `DEMO_DATA=true` in the environment to have docker-compose run this
 * automatically after the schema seed.
 */
import process from 'node:process';
import { NocoDbClient } from '@elemental/sdk';

const NOCODB_URL = process.env.NOCODB_URL ?? 'http://localhost:8080';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'change-me-please';

async function main() {
  const anon = new NocoDbClient({ baseUrl: NOCODB_URL });
  const { token: authToken } = await anon.signin(ADMIN_EMAIL, ADMIN_PASSWORD);
  const authed = new NocoDbClient({ baseUrl: NOCODB_URL, authToken });
  const { token: apiToken } = await authed.createApiToken('elemental-erp demo');
  const client = new NocoDbClient({ baseUrl: NOCODB_URL, apiToken });

  const { list: bases } = await client.listBases();
  const base = bases.find((b) => b.title === (process.env.NOCODB_BASE_TITLE ?? 'Elemental'));
  if (!base) throw new Error('Elemental base not found - run `pnpm seed` first.');

  const { list: tables } = await client.listTables(base.id);
  const tid = (name: string) => {
    const t = tables.find((x) => x.table_name === name);
    if (!t) throw new Error(`Table "${name}" not found - run \`pnpm seed\` first.`);
    return t.id;
  };

  // ---- Companies ----------------------------------------------------------
  const companies = await client.listRows(tid('companies'), { limit: 1 });
  if (companies.list.length > 0) {
    console.log('[demo] companies already populated, skipping all demo seeding');
    return;
  }

  const companyRows = await client.insertRows(tid('companies'), [
    { name: 'Northwind Mfg.',   domain: 'https://northwind.example', industry: 'Manufacturing', size: '51-200', country: 'US' },
    { name: 'Acme Robotics',    domain: 'https://acme.example',      industry: 'Robotics',      size: '11-50',  country: 'MX' },
    { name: 'Globex Foods',     domain: 'https://globex.example',    industry: 'Food & Bev',    size: '201-1000', country: 'US' },
    { name: 'Initech Tooling',  domain: 'https://initech.example',   industry: 'Manufacturing', size: '11-50',  country: 'US' },
    { name: 'Soylent Plastics', domain: 'https://soylent.example',   industry: 'Plastics',      size: '51-200', country: 'CA' },
  ]);
  console.log(`[demo] inserted ${companyRows.length} companies`);

  // ---- Contacts -----------------------------------------------------------
  const contactRows = await client.insertRows(tid('contacts'), [
    { first_name: 'Ada',   last_name: 'Lovelace',   email: 'ada@northwind.example',   phone: '+1-555-0101', title: 'COO',     tags: 'customer', owner: 'admin' },
    { first_name: 'Grace', last_name: 'Hopper',     email: 'grace@acme.example',      phone: '+52-55-0102', title: 'CTO',     tags: 'lead',     owner: 'admin' },
    { first_name: 'Linus', last_name: 'Torvalds',   email: 'linus@globex.example',    phone: '+1-555-0103', title: 'VP Ops',  tags: 'partner',  owner: 'admin' },
    { first_name: 'Marie', last_name: 'Curie',      email: 'marie@initech.example',   phone: '+1-555-0104', title: 'CEO',     tags: 'vip,lead', owner: 'admin' },
    { first_name: 'Alan',  last_name: 'Turing',     email: 'alan@soylent.example',    phone: '+1-555-0105', title: 'Engineer',tags: 'lead',     owner: 'admin' },
  ]);
  console.log(`[demo] inserted ${contactRows.length} contacts`);

  // ---- Deals --------------------------------------------------------------
  const today = new Date();
  const inDays = (n: number) => new Date(today.getTime() + n * 86_400_000).toISOString().slice(0, 10);

  const dealRows = await client.insertRows(tid('deals'), [
    { title: 'Northwind annual contract',  value: 48000, currency: 'USD', stage: 'Proposal',  close_date: inDays(14), owner: 'admin' },
    { title: 'Acme onboarding',            value: 12500, currency: 'USD', stage: 'Qualified', close_date: inDays(30), owner: 'admin' },
    { title: 'Globex co-packing pilot',    value: 92000, currency: 'USD', stage: 'Lead',      close_date: inDays(60), owner: 'admin' },
    { title: 'Initech CNC retainer',       value: 18000, currency: 'USD', stage: 'Won',       close_date: inDays(-5), owner: 'admin' },
    { title: 'Soylent injection molds',    value: 55000, currency: 'USD', stage: 'Lost',      close_date: inDays(-20), owner: 'admin' },
    { title: 'Northwind expansion (Q4)',   value: 75000, currency: 'USD', stage: 'Lead',      close_date: inDays(45), owner: 'admin' },
  ]);
  console.log(`[demo] inserted ${dealRows.length} deals`);

  // ---- Activities ---------------------------------------------------------
  const activityRows = await client.insertRows(tid('activities'), [
    { subject: 'Discovery call',         type: 'call',    body: 'Initial conversation about needs.',     due_at: inDays(0) + 'T15:00:00Z',  owner: 'admin', related_type: 'deal' },
    { subject: 'Send proposal',          type: 'email',   body: 'Send revised SOW draft.',               due_at: inDays(2) + 'T09:00:00Z',  owner: 'admin', related_type: 'deal' },
    { subject: 'On-site walkthrough',    type: 'meeting', body: 'Tour the existing line in Monterrey.',  due_at: inDays(7) + 'T14:00:00Z',  owner: 'admin', related_type: 'company' },
    { subject: 'Renewal reminder',       type: 'note',    body: 'Renewal anniversary in October.',       owner: 'admin', related_type: 'company' },
    { subject: 'Follow up after demo',   type: 'call',    body: 'Quick pulse check.',                    due_at: inDays(-1) + 'T10:00:00Z', completed_at: inDays(-1) + 'T10:30:00Z', owner: 'admin', related_type: 'contact' },
  ]);
  console.log(`[demo] inserted ${activityRows.length} activities`);

  // ---- Tasks --------------------------------------------------------------
  const taskRows = await client.insertRows(tid('tasks'), [
    { title: 'Draft pricing for Globex pilot', due_at: inDays(3) + 'T17:00:00Z',  priority: 'high',   status: 'todo',        assignee: 'admin' },
    { title: 'Review Initech contract',        due_at: inDays(1) + 'T17:00:00Z',  priority: 'medium', status: 'in_progress', assignee: 'admin' },
    { title: 'Schedule Q4 QBR',                due_at: inDays(10) + 'T17:00:00Z', priority: 'low',    status: 'todo',        assignee: 'admin' },
    { title: 'Archive Soylent opportunity',                                       priority: 'low',    status: 'done',        assignee: 'admin' },
    { title: 'Call Marie at Initech',          due_at: inDays(0) + 'T16:00:00Z',  priority: 'urgent', status: 'todo',        assignee: 'admin' },
  ]);
  console.log(`[demo] inserted ${taskRows.length} tasks`);

  console.log('[demo] done.');
}

main().catch((err) => {
  console.error('[demo] FAILED');
  console.error(err);
  process.exit(1);
});
