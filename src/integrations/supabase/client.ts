// Custom Supabase Client Shim/Mock
// Redirects all Supabase SDK queries to the local Node.js Express server.
import type { Session } from '@supabase/supabase-js';

const isClient = typeof window !== 'undefined';
// When in browser, use relative path so Next.js proxy (/api) forwards to backend without CORS/firewall issues.
const BACKEND_URL = isClient ? '' : (process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005');

// Recursively prepends the backend URL to any string value that is a path starting with '/uploads/'
function prependBackendUrl(obj: any): any {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    if (obj.startsWith('/uploads/')) {
      return `${BACKEND_URL}${obj}`;
    }
    if (obj.startsWith('uploads/')) {
      return `${BACKEND_URL}/${obj}`;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = prependBackendUrl(obj[i]);
    }
    return obj;
  }
  
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = prependBackendUrl(obj[key]);
      }
    }
    return obj;
  }
  
  return obj;
}

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }
};

const removeCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  }
};

const storage = {
  getItem: (key: string) => typeof window !== 'undefined' ? localStorage.getItem(key) : null,
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
      if (key === 'sb-token') {
        setCookie('sb-token', value);
      }
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      if (key === 'sb-token') {
        removeCookie('sb-token');
      }
    }
  },
};

// Storage for active auth listeners
const authListeners = new Set<(event: string, session: Session | null) => void>();
let currentSession: Session | null = null;
let currentUser: any = null;

// Read token from localStorage on boot
const savedToken = storage.getItem('sb-token');
const savedUser = storage.getItem('sb-user');
if (savedToken && savedUser) {
  try {
    currentUser = JSON.parse(savedUser);
    currentSession = {
      access_token: savedToken,
      token_type: 'bearer',
      expires_in: 604800,
      expires_at: Math.floor(Date.now() / 1000) + 604800,
      refresh_token: savedToken,
      user: currentUser,
    } as Session;
    setCookie('sb-token', savedToken);
  } catch (e) {
    storage.removeItem('sb-token');
    storage.removeItem('sb-user');
  }
}

// Fetch helper that injects JWT token with strict no-cache
async function apiFetch(url: string, options: RequestInit = {}) {
  const token = storage.getItem('sb-token');
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(options.headers || {}),
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${BACKEND_URL}${url}`, {
    cache: 'no-store',
    ...options,
    headers,
  });
}

class QueryBuilder implements PromiseLike<any> {
  private tableName: string;
  private action: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private selects: string = '*';
  private filters: any[] = [];
  private orders: any[] = [];
  private isSingle: boolean = false;
  private limitCount: number | null = null;
  private offsetCount: number | null = null;
  private bodyData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns = '*') {
    if (this.action === 'select' || !this.action) {
      this.action = 'select';
    }
    this.selects = columns;
    return this;
  }

  insert(data: any) {
    this.action = 'insert';
    this.bodyData = data;
    return this;
  }

  upsert(data: any, options?: any) {
    this.action = 'upsert'; // Custom backend now supports UPSERT (ON CONFLICT DO UPDATE)
    this.bodyData = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.bodyData = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push({ type: 'gt', column, value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ type: 'lt', column, value });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  like(column: string, value: any) {
    this.filters.push({ type: 'like', column, value });
    return this;
  }

  ilike(column: string, value: any) {
    this.filters.push({ type: 'ilike', column, value });
    return this;
  }

  in(column: string, value: any[]) {
    this.filters.push({ type: 'in', column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(num: number) {
    this.limitCount = num;
    return this;
  }

  range(from: number, to: number) {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  // Promise support
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    const execute = async () => {
      try {
        const response = await apiFetch('/api/db', {
          method: 'POST',
          body: JSON.stringify({
            table: this.tableName,
            action: this.action,
            selects: this.selects,
            filters: this.filters,
            orders: this.orders,
            single: this.isSingle,
            limit: this.limitCount,
            offset: this.offsetCount,
            data: this.bodyData
          })
        });

        const result = await response.json();
        if (result && result.data) {
          result.data = prependBackendUrl(result.data);
        }
        return result;
      } catch (err) {
        return { data: null, error: { message: (err as Error).message } };
      }
    };
    return execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },

  async rpc(fn: string, args?: any) {
    // Basic mock for RPC calls.
    // Replace with real API call if the custom Express backend handles it.
    try {
      const response = await apiFetch(`/api/rpc/${fn}`, {
        method: 'POST',
        body: JSON.stringify(args || {})
      });
      const result = await response.json();
      return { data: result.data, error: result.error ? { message: result.error } : null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  },

  functions: {
    async invoke(fn: string, options?: any) {

      try {
        const response = await apiFetch(`/api/functions/${fn}`, {
          method: 'POST',
          body: options?.body ? JSON.stringify(options.body) : undefined
        });
        const result = await response.json();
        return { data: result.data, error: result.error ? { message: result.error } : null };
      } catch (err) {
        return { data: null, error: { message: (err as Error).message } };
      }
    }
  },

  auth: {
    async getSession() {
      try {
        const response = await apiFetch('/api/auth/session');
        const result = await response.json();
        
        if (result.session) {
          return { data: { session: currentSession }, error: null };
        } else {
          storage.removeItem('sb-token');
          storage.removeItem('sb-user');
          currentSession = null;
          currentUser = null;
          return { data: { session: null }, error: null };
        }
      } catch {
        return { data: { session: currentSession }, error: null };
      }
    },

    async getUser() {
      return { data: { user: currentUser }, error: null };
    },

    async signInWithPassword({ username, password }: any) {
      try {
        const response = await apiFetch('/api/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (result.error) {
          return { data: null, error: { message: result.error } };
        }

        currentSession = result.session;
        currentUser = result.user;
        
        storage.setItem('sb-token', result.session.access_token);
        storage.setItem('sb-user', JSON.stringify(result.user));

        // Notify listeners
        authListeners.forEach(cb => cb('SIGNED_IN', currentSession));

        return { data: { user: currentUser, session: currentSession }, error: null };
      } catch (err) {
        return { data: null, error: { message: (err as Error).message } };
      }
    },

    async signUp({ username, password, options }: any) {
      try {
        const name = options?.data?.name || '';
        const response = await apiFetch('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ username, password, name })
        });
        const result = await response.json();

        if (result.error) {
          return { data: null, error: { message: result.error } };
        }

        // Do not auto-login after sign up so user must log in manually with username and password
        return { data: { user: result.user, session: null }, error: null };
      } catch (err) {
        return { data: null, error: { message: (err as Error).message } };
      }
    },

    async updateUser(attributes: { password?: string; data?: { name?: string; [key: string]: any } }) {
      try {
        const response = await apiFetch('/api/auth/update-user', {
          method: 'POST',
          body: JSON.stringify(attributes)
        });
        const result = await response.json();
        if (result.error) {
          return { data: null, error: { message: result.error } };
        }
        if (result.user) {
          currentUser = result.user;
          storage.setItem('sb-user', JSON.stringify(result.user));
        }
        return { data: { user: currentUser }, error: null };
      } catch (err) {
        return { data: null, error: { message: (err as Error).message } };
      }
    },

    async signOut(options?: any) {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST' });
      } catch (_err) {
        // Ignore network errors on logout
      }

      storage.removeItem('sb-token');
      storage.removeItem('sb-user');
      currentSession = null;
      currentUser = null;

      // Notify listeners
      authListeners.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    },

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      authListeners.add(callback);
      
      // Fire initial callback
      setTimeout(() => {
        callback(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession);
      }, 0);

      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            }
          }
        }
      };
    }
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(pathStr: string, file: File, options?: any) {
          try {
            const formData = new FormData();
            formData.append('bucket', bucket);
            formData.append('path', pathStr);
            if (options) {
              formData.append('options', JSON.stringify(options));
            }
            // Append file LAST so Multer has all text fields available
            formData.append('file', file);

            const token = storage.getItem('sb-token');
            const headers = {} as Record<string, string>;
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${BACKEND_URL}/api/storage/upload`, {
              method: 'POST',
              headers,
              body: formData
            });

            const result = await response.json();
            return { data: result.data, error: result.error ? { message: result.error } : null };
          } catch (err) {
            return { data: null, error: { message: (err as Error).message } };
          }
        },

        getPublicUrl(pathStr: string) {
          if (!pathStr) {
            return { data: { publicUrl: '' } };
          }
          if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) {
            return { data: { publicUrl: pathStr } };
          }
          const cleanPath = pathStr.replace(/\\/g, '/');
          let publicUrl = '';
          
          if (cleanPath.startsWith('/uploads/')) {
            publicUrl = cleanPath;
          } else if (cleanPath.startsWith(`${bucket}/`)) {
            publicUrl = `/uploads/${cleanPath}`;
          } else {
            publicUrl = `/uploads/${bucket}/${cleanPath}`;
          }

          const privateBuckets = ['wbs-evidence', 'service-documents'];
          if (privateBuckets.includes(bucket)) {
            const token = storage.getItem('sb-token');
            if (token) {
              publicUrl = `${publicUrl}?token=${token}`;
            }
          }

          return {
            data: {
              publicUrl
            }
          };
        },
        async remove(paths: string[]) {
          return { data: null, error: null };
        },
        async createSignedUrl(path: string, expiresIn: number) {
          return { data: { signedUrl: `/uploads/${bucket}/${path}` }, error: null };
        },
        async list(pathStr?: string, options?: any) {
          return { data: [] as any[], error: null };
        },
        async download(pathStr: string) {
          return { data: new Blob(), error: null };
        }
      };
    }
  }
};

// Connect to backend Server-Sent Events (SSE) for realtime database updates
if (typeof window !== 'undefined') {
  const setupRealtime = () => {
    try {
      const sseUrl = '/api/realtime';
      const sse = new EventSource(sseUrl);
      
      sse.onmessage = (event) => {
        try {
          const change = JSON.parse(event.data);
          // Dispatch a custom event on the window object to notify React Query
          window.dispatchEvent(new CustomEvent('supabase-db-change', { detail: change }));
          console.log(`[REALTIME] Database change event received for table: ${change.table}`);
        } catch (e) {
          console.error('[REALTIME] Failed to parse message payload:', e);
        }
      };

      sse.onerror = (err) => {
        console.warn('[REALTIME] SSE connection lost. Attempting reconnect...');
        sse.close();
        // Reconnect after 5 seconds
        setTimeout(setupRealtime, 5000);
      };
    } catch (e) {
      console.error('[REALTIME] Failed to setup SSE:', e);
    }
  };

  setupRealtime();
}

export type Database = any;
export type Tables<T = any> = any;
export type Enums<T = any> = any;