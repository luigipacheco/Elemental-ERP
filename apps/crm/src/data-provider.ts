import type { DataProvider, CrudFilters, CrudSorting, Pagination } from '@refinedev/core';
import { http } from './http';
import { config, STORAGE_KEYS } from './config';
import {
  denormalizePayload,
  normalizeRecord,
  normalizeRows,
  toNocoField,
} from './noco-normalize';

/**
 * NocoDB v2 data provider for Refine.
 *
 * The resource `name` is interpreted as the NocoDB table_name within the
 * "Elemental" base. We resolve table_name -> tableId on first use and cache
 * the result in memory; the cache is cleared on login/logout via storage.
 */

interface MetaCacheEntry {
  baseId: string;
  tableIds: Record<string, string>;
}

let metaCache: MetaCacheEntry | null = null;

async function ensureMeta(): Promise<MetaCacheEntry> {
  if (metaCache) return metaCache;

  const baseId = await resolveBaseId();
  const { data } = await http.get<{ list: Array<{ id: string; table_name: string }> }>(
    `/api/v2/meta/bases/${baseId}/tables`,
  );
  const tableIds: Record<string, string> = {};
  for (const t of data.list) tableIds[t.table_name] = t.id;
  metaCache = { baseId, tableIds };
  return metaCache;
}

async function resolveBaseId(): Promise<string> {
  const cached = localStorage.getItem(STORAGE_KEYS.baseId);
  if (cached) return cached;
  const { data } = await http.get<{ list: Array<{ id: string; title: string }> }>(
    '/api/v2/meta/bases/',
  );
  const base = data.list.find((b) => b.title === config.baseTitle);
  if (!base) throw new Error(`Base "${config.baseTitle}" not found in NocoDB.`);
  localStorage.setItem(STORAGE_KEYS.baseId, base.id);
  return base.id;
}

export function clearMetaCache() {
  metaCache = null;
  localStorage.removeItem(STORAGE_KEYS.baseId);
}

async function tableId(name: string): Promise<string> {
  const meta = await ensureMeta();
  const id = meta.tableIds[name];
  if (!id) throw new Error(`Resource "${name}" is not a known NocoDB table.`);
  return id;
}

function buildWhere(resource: string, filters?: CrudFilters): string | undefined {
  if (!filters?.length) return undefined;
  const parts: string[] = [];
  for (const f of filters) {
    if ('field' in f && f.value !== undefined && f.value !== null && f.value !== '') {
      const op = mapOperator(f.operator);
      if (!op) continue;
      parts.push(`(${toNocoField(resource, f.field)},${op},${escapeValue(f.value)})`);
    }
  }
  return parts.length ? parts.join('~and') : undefined;
}

function escapeValue(v: unknown): string {
  if (typeof v === 'string') return v.replace(/,/g, '%2C');
  return String(v);
}

function mapOperator(op: string): string | undefined {
  switch (op) {
    case 'eq': return 'eq';
    case 'ne': return 'neq';
    case 'gt': return 'gt';
    case 'gte': return 'ge';
    case 'lt': return 'lt';
    case 'lte': return 'le';
    case 'contains': return 'like';
    case 'ncontains': return 'nlike';
    case 'null': return 'null';
    case 'nnull': return 'notnull';
    default: return undefined;
  }
}

function buildSort(resource: string, sorters?: CrudSorting): string | undefined {
  if (!sorters?.length) return undefined;
  return sorters
    .map((s) => `${s.order === 'desc' ? '-' : ''}${toNocoField(resource, s.field)}`)
    .join(',');
}

function buildPagination(pagination?: Pagination): { limit: number; offset: number } {
  const current = pagination?.current ?? 1;
  const pageSize = pagination?.pageSize ?? 25;
  return { limit: pageSize, offset: (current - 1) * pageSize };
}

export const dataProvider: DataProvider = {
  getApiUrl: () => config.nocodbUrl,

  async getList({ resource, pagination, filters, sorters, meta }) {
    const tid = await tableId(resource);
    const { limit, offset } = buildPagination(pagination);
    const params: Record<string, string | number> = { limit, offset };
    const where = buildWhere(resource, filters);
    if (where) params.where = where;
    const sort = buildSort(resource, sorters);
    if (sort) params.sort = sort;
    if (meta?.viewId) params.viewId = meta.viewId;
    const { data } = await http.get(`/api/v2/tables/${tid}/records`, { params });
    return {
      data: normalizeRows(resource, data.list as Record<string, unknown>[]) as never[],
      total: data.pageInfo?.totalRows ?? data.list.length,
    };
  },

  async getOne({ resource, id }) {
    const tid = await tableId(resource);
    const { data } = await http.get(`/api/v2/tables/${tid}/records/${id}`);
    return { data: normalizeRecord(resource, data as Record<string, unknown>) as never };
  },

  async create({ resource, variables }) {
    const tid = await tableId(resource);
    const payload = denormalizePayload(resource, variables as Record<string, unknown>);
    const { data } = await http.post(`/api/v2/tables/${tid}/records`, payload);
    return { data: normalizeRecord(resource, data as Record<string, unknown>) as never };
  },

  async update({ resource, id, variables }) {
    const tid = await tableId(resource);
    const payload = denormalizePayload(resource, variables as Record<string, unknown>);
    const { data } = await http.patch(`/api/v2/tables/${tid}/records`, [{ Id: id, ...payload }]);
    const row = Array.isArray(data) ? data[0] : data;
    return { data: normalizeRecord(resource, row as Record<string, unknown>) as never };
  },

  async deleteOne({ resource, id }) {
    const tid = await tableId(resource);
    const { data } = await http.delete(`/api/v2/tables/${tid}/records`, {
      data: [{ Id: id }],
    });
    return { data: (Array.isArray(data) ? data[0] : data) as never };
  },

  async getMany({ resource, ids }) {
    const tid = await tableId(resource);
    const where = ids.map((id) => `(Id,eq,${id})`).join('~or');
    const { data } = await http.get(`/api/v2/tables/${tid}/records`, {
      params: { where, limit: ids.length },
    });
    return { data: normalizeRows(resource, data.list as Record<string, unknown>[]) as never[] };
  },

  async custom({ url, method, payload, query }) {
    const res = await http.request({
      url: url || config.nocodbUrl,
      method: method ?? 'get',
      data: payload,
      params: query,
    });
    return { data: res.data as never };
  },
};

export const nocodbMeta = {
  /** Fetch all views for a given resource (table_name). */
  async listViews(resource: string) {
    const tid = await tableId(resource);
    const { data } = await http.get<{ list: Array<{ id: string; title: string; type: number }> }>(
      `/api/v2/meta/tables/${tid}/views`,
    );
    return data.list;
  },

  async tableId(resource: string) {
    return tableId(resource);
  },

  async refresh() {
    metaCache = null;
  },
};
