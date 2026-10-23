import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005';

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

class QueryBuilder implements PromiseLike<any> {
  private tableName: string;
  private action: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private selects: string = '*';
  private filters: any[] = [];
  private orders: any[] = [];
  private isSingle: boolean = false;
  private bodyData: any = null;
  private token: string | null;

  constructor(tableName: string, token: string | null) {
    this.tableName = tableName;
    this.token = token;
  }

  select(columns = '*') {
    this.action = 'select';
    this.selects = columns;
    return this;
  }

  insert(data: any) {
    this.action = 'insert';
    this.bodyData = data;
    return this;
  }

  upsert(data: any, options?: any) {
    this.action = 'upsert';
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

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    const execute = async () => {
      try {
        const headers: any = {
          'Content-Type': 'application/json',
        };
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${BACKEND_URL}/api/db`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            table: this.tableName,
            action: this.action,
            selects: this.selects,
            filters: this.filters,
            orders: this.orders,
            single: this.isSingle,
            data: this.bodyData
          }),
          cache: 'no-store'
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

export async function createServerClient(customToken?: string) {
  let token = customToken || null;
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('sb-token')?.value || null;
    } catch {
      token = null;
    }
  }

  return {
    auth: {
      async getUser(passedToken?: string) {
        const t = passedToken || token;
        if (!t) return { data: { user: null }, error: { message: 'No token' } };
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/session`, {
            headers: { Authorization: `Bearer ${t}` },
            cache: 'no-store'
          });
          const result = await res.json();
          if (result.session && result.session.user) {
             return { data: { user: result.session.user }, error: null };
          }
          return { data: { user: null }, error: { message: 'Invalid session' } };
        } catch (e) {
          return { data: { user: null }, error: { message: (e as Error).message } };
        }
      }
    },
    from(table: string) {
      return new QueryBuilder(table, token);
    },
    storage: {
      from(bucket: string) {
        return {
          remove: async (paths: string[]) => {
            console.log(`Mock delete from ${bucket}:`, paths);
            return { data: null, error: null };
          },
          upload: async (path: string, file: any) => {
            console.log(`Mock upload to ${bucket}:`, path);
            return { data: { path }, error: null };
          },
          getPublicUrl: (path: string) => {
            return { data: { publicUrl: `/uploads/${bucket}/${path}` } };
          },
          createSignedUrl: async (path: string, expiresIn: number) => {
            return { data: { signedUrl: `/uploads/${bucket}/${path}` }, error: null };
          }
        };
      }
    }
  };
}
