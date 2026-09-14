import { crmModule } from '@elemental/module-crm';

/** NocoDB column title -> our internal field name, per table. */
const titleToName: Record<string, Record<string, string>> = {};
/** Our internal field name -> NocoDB column title, per table. */
const nameToTitle: Record<string, Record<string, string>> = {};

/** Link columns NocoDB names differently from our schema titles. */
const extraTitleToName: Record<string, Record<string, string>> = {
  contacts: { Companies: 'company' },
  deals: { Companies: 'company', Contacts: 'primary_contact' },
  activities: {
    Companies: 'related_company',
    Contacts: 'related_contact',
    Deals: 'related_deal',
  },
  tasks: {
    Companies: 'related_company',
    Contacts: 'related_contact',
    Deals: 'related_deal',
  },
};

for (const table of crmModule.schema) {
  const t2n: Record<string, string> = {};
  const n2t: Record<string, string> = {};
  for (const field of table.fields) {
    const title = field.title ?? field.name;
    t2n[title] = field.name;
    n2t[field.name] = title;
  }
  Object.assign(t2n, extraTitleToName[table.name] ?? {});
  for (const [title, name] of Object.entries(extraTitleToName[table.name] ?? {})) {
    n2t[name] = title;
  }
  titleToName[table.name] = t2n;
  nameToTitle[table.name] = n2t;
}

export function normalizeRecord(
  resource: string,
  row: Record<string, unknown>,
): Record<string, unknown> {
  const map = titleToName[resource];
  if (!map) return row;

  const out: Record<string, unknown> = {
    Id: row.Id ?? row.id,
    CreatedAt: row.CreatedAt,
    UpdatedAt: row.UpdatedAt,
  };

  for (const [title, name] of Object.entries(map)) {
    if (title in row) {
      const val = row[title];
      // NocoDB sometimes returns 0 for empty links.
      out[name] = val === 0 ? null : val;
    } else if (name in row) {
      out[name] = row[name];
    }
  }

  return out;
}

export function normalizeRows(resource: string, rows: Record<string, unknown>[]) {
  return rows.map((r) => normalizeRecord(resource, r));
}

/** Convert app field names to NocoDB column titles for writes/filters. */
export function toNocoField(resource: string, field: string): string {
  return nameToTitle[resource]?.[field] ?? field;
}

/** Convert a payload of internal names to NocoDB titles for create/update. */
export function denormalizePayload(
  resource: string,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const map = nameToTitle[resource];
  if (!map) return payload;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    const nocoKey = map[key] ?? key;
    out[nocoKey] = value;
  }
  return out;
}
