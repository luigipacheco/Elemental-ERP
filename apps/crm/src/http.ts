import axios from 'axios';
import { config, STORAGE_KEYS } from './config';

/**
 * Shared axios instance preconfigured to talk to NocoDB. Every request
 * carries the JWT we stored at login; the data provider attaches the
 * matching `xc-token` if/when one is provisioned per-user.
 */
export const http = axios.create({
  baseURL: config.nocodbUrl,
  timeout: 30_000,
});

http.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(STORAGE_KEYS.authToken);
  if (token) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as Record<string, string>)['xc-auth'] = token;
  }
  return cfg;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.authToken);
      localStorage.removeItem(STORAGE_KEYS.user);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  },
);
