import type { FieldDefinition, TableDefinition, ViewDefinition } from './field-types.js';

/**
 * Tiny typed wrapper around the NocoDB v2 meta + data APIs.
 *
 * NocoDB exposes two flavours of endpoints we use:
 *   - Meta API (`/api/v2/meta/...`): create bases, tables, columns, views.
 *   - Data API (`/api/v2/tables/{tableId}/records`): CRUD on rows.
 *
 * Auth is via `xc-token` (a NocoDB API token issued from the admin UI or
 * created at first boot via `/api/v2/auth/user/signup` -> token endpoint).
 *
 * We deliberately keep this client schema-light so that minor NocoDB API
 * shape changes only require touching a handful of methods.
 */
export interface NocoDbClientOptions {
  /** Base URL like https://admin.example.com - no trailing slash. */
  baseUrl: string;
  /** API token (xc-token header). Preferred over JWT for server-to-server. */
  apiToken?: string;
  /** JWT auth token. Used for the seed script's bootstrap signup flow. */
  authToken?: string;
}

export interface NocoBase {
  id: string;
  title: string;
}

export interface NocoTable {
  id: string;
  title: string;
  table_name: string;
  base_id: string;
  columns?: NocoColumn[];
}

export interface NocoColumn {
  id: string;
  title: string;
  column_name: string;
  uidt: string;
  pv?: boolean;
  rqd?: boolean;
}

export interface NocoView {
  id: string;
  title: string;
  type: number;
  fk_model_id: string;
}

export class NocoDbError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly body: unknown,
  ) {
    super(`NocoDB ${status} ${url}: ${JSON.stringify(body)}`);
    this.name = 'NocoDbError';
  }
}

export class NocoDbClient {
  constructor(private readonly opts: NocoDbClientOptions) {
    if (!opts.baseUrl) throw new Error('NocoDbClient: baseUrl is required');
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.opts.apiToken) h['xc-token'] = this.opts.apiToken;
    if (this.opts.authToken) h['xc-auth'] = this.opts.authToken;
    return h;
  }

  private async req<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.opts.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const parsed = text ? safeJson(text) : undefined;
    if (!res.ok) throw new NocoDbError(res.status, url, parsed ?? text);
    return parsed as T;
  }

  // ---- auth bootstrap ---------------------------------------------------

  /**
   * First-boot signup. Idempotent-ish: returns 400 if the email already
   * exists; callers should treat that as success and fall through to signin.
   */
  async signup(email: string, password: string) {
    return this.req<{ token: string }>('POST', '/api/v1/auth/user/signup', { email, password });
  }

  async signin(email: string, password: string) {
    return this.req<{ token: string }>('POST', '/api/v1/auth/user/signin', { email, password });
  }

  /**
   * Mint a long-lived API token from a freshly-acquired JWT.
   * Used once during seed to obtain the `xc-token` we then reuse forever.
   */
  async createApiToken(description = 'elemental-erp seed token') {
    return this.req<{ token: string }>('POST', '/api/v1/tokens', { description });
  }

  // ---- bases (a.k.a. projects) ------------------------------------------

  async listBases() {
    return this.req<{ list: NocoBase[] }>('GET', '/api/v2/meta/bases/');
  }

  async createBase(title: string) {
    return this.req<NocoBase>('POST', '/api/v2/meta/bases/', {
      title,
      meta: { iconColor: '#36BFFF' },
    });
  }

  async findOrCreateBase(title: string): Promise<NocoBase> {
    const { list } = await this.listBases();
    const existing = list.find((b) => b.title === title);
    if (existing) return existing;
    return this.createBase(title);
  }

  // ---- tables -----------------------------------------------------------

  async listTables(baseId: string) {
    return this.req<{ list: NocoTable[] }>('GET', `/api/v2/meta/bases/${baseId}/tables`);
  }

  async createTable(baseId: string, def: TableDefinition): Promise<NocoTable> {
    const columns = def.fields
      .filter((f) => f.type !== 'LinkToAnotherRecord')
      .map(toColumn);
    return this.req<NocoTable>('POST', `/api/v2/meta/bases/${baseId}/tables`, {
      table_name: def.name,
      title: def.title,
      columns,
      meta: def.icon ? { icon: def.icon } : undefined,
    });
  }

  async createColumn(tableId: string, field: FieldDefinition) {
    if (field.type === 'LinkToAnotherRecord') {
      throw new Error('Use createLink for LinkToAnotherRecord fields');
    }
    return this.req<NocoColumn>('POST', `/api/v2/meta/tables/${tableId}/columns`, toColumn(field));
  }

  /**
   * Create a relation between two existing tables. Both must already exist
   * before this is called - the seed orchestrator handles ordering.
   */
  async createLink(tableId: string, field: FieldDefinition, targetTableId: string) {
    if (field.type !== 'LinkToAnotherRecord' || !field.relation) {
      throw new Error('createLink requires a LinkToAnotherRecord field with relation metadata');
    }
    return this.req<NocoColumn>('POST', `/api/v2/meta/tables/${tableId}/columns`, {
      column_name: field.name,
      title: field.title ?? field.name,
      uidt: 'LinkToAnotherRecord',
      type: field.relation.type,
      childId: targetTableId,
      parentId: tableId,
    });
  }

  // ---- views ------------------------------------------------------------

  async listViews(tableId: string) {
    return this.req<{ list: NocoView[] }>('GET', `/api/v2/meta/tables/${tableId}/views`);
  }

  async createView(tableId: string, def: ViewDefinition) {
    const endpointByType: Record<ViewDefinition['type'], string> = {
      grid: 'grids',
      kanban: 'kanbans',
      gallery: 'galleries',
      form: 'forms',
      calendar: 'calendars',
    };
    const endpoint = endpointByType[def.type];
    return this.req<NocoView>('POST', `/api/v2/meta/tables/${tableId}/${endpoint}`, {
      title: def.name,
      // group_by_column_id is only meaningful for kanban; we resolve the id
      // upstream because we have the column list at seed time.
    });
  }

  // ---- data -------------------------------------------------------------

  async insertRow<T extends Record<string, unknown>>(tableId: string, data: T) {
    return this.req<T & { Id: number }>('POST', `/api/v2/tables/${tableId}/records`, data);
  }

  async insertRows<T extends Record<string, unknown>>(tableId: string, rows: T[]) {
    return this.req<Array<T & { Id: number }>>(
      'POST',
      `/api/v2/tables/${tableId}/records`,
      rows,
    );
  }

  async listRows(tableId: string, params: { limit?: number; offset?: number; where?: string } = {}) {
    const search = new URLSearchParams();
    if (params.limit) search.set('limit', String(params.limit));
    if (params.offset) search.set('offset', String(params.offset));
    if (params.where) search.set('where', params.where);
    const qs = search.toString();
    return this.req<{ list: Array<Record<string, unknown>>; pageInfo: { totalRows: number } }>(
      'GET',
      `/api/v2/tables/${tableId}/records${qs ? `?${qs}` : ''}`,
    );
  }
}

function toColumn(f: FieldDefinition) {
  return {
    column_name: f.name,
    title: f.title ?? f.name,
    uidt: f.type,
    rqd: f.required ?? false,
    pv: f.isDisplayValue ?? false,
    cdf: f.defaultValue,
    dtxp:
      f.type === 'SingleSelect' || f.type === 'MultiSelect'
        ? (f.options ?? [])
            .map((o) => `'${o.title.replace(/'/g, "''")}'`)
            .join(',')
        : undefined,
    formula: f.type === 'Formula' ? f.formula : undefined,
    description: f.description,
  };
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
