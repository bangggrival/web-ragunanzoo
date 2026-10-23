/**
 * Query Compiler
 * Menerjemahkan JSON request builder dari client-side shim menjadi PostgreSQL query yang aman dan lengkap.
 */

// Validation helpers to prevent SQL Injection in identifiers
function validateIdentifier(name, type = 'Identifier') {
  if (typeof name !== 'string') {
    throw new Error(`Invalid ${type}: must be a string.`);
  }
  const identifierRegex = /^[a-zA-Z0-9_]+$/;
  if (!identifierRegex.test(name)) {
    throw new Error(`Invalid ${type} format: "${name}". Only alphanumeric and underscore allowed.`);
  }
}

function validateSelects(selects) {
  if (!selects || selects.trim() === '*') return;
  if (typeof selects !== 'string') {
    throw new Error('Invalid selects: must be a string.');
  }

  // Parse comma-separated columns
  const parts = selects.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return;

  for (const part of parts) {
    // 1. Plain identifier
    if (/^[a-zA-Z0-9_]+$/.test(part)) continue;
    // 2. Identifier with alias (e.g., column as alias OR column alias)
    if (/^[a-zA-Z0-9_]+\s+(?:as\s+)?[a-zA-Z0-9_]+$/i.test(part)) continue;
    // 3. Simple standard SQL aggregates: count(*), count(col), min(col), max(col), avg(col), sum(col)
    if (/^(count|min|max|avg|sum)\(([a-zA-Z0-9_*]+)\)(?:\s+(?:as\s+)?[a-zA-Z0-9_]+)?$/i.test(part)) continue;

    throw new Error(`Invalid selects format: "${part}". Potential SQL Injection or unauthorized expression detected.`);
  }
}

function compileWhereClauses(filters = [], startParamIndex = 1) {
  const whereClauses = [];
  const values = [];

  filters.forEach((filter) => {
    if (!filter || !filter.column) return;
    validateIdentifier(filter.column, 'Filter column');

    const paramIndex = startParamIndex + values.length;
    const col = `"${filter.column}"`;

    if (filter.type === 'eq') {
      if (filter.value === null) {
        whereClauses.push(`${col} IS NULL`);
      } else {
        whereClauses.push(`${col} = $${paramIndex}`);
        values.push(filter.value);
      }
    } else if (filter.type === 'neq') {
      if (filter.value === null) {
        whereClauses.push(`${col} IS NOT NULL`);
      } else {
        whereClauses.push(`${col} != $${paramIndex}`);
        values.push(filter.value);
      }
    } else if (filter.type === 'gt') {
      whereClauses.push(`${col} > $${paramIndex}`);
      values.push(filter.value);
    } else if (filter.type === 'gte') {
      whereClauses.push(`${col} >= $${paramIndex}`);
      values.push(filter.value);
    } else if (filter.type === 'lt') {
      whereClauses.push(`${col} < $${paramIndex}`);
      values.push(filter.value);
    } else if (filter.type === 'lte') {
      whereClauses.push(`${col} <= $${paramIndex}`);
      values.push(filter.value);
    } else if (filter.type === 'like') {
      whereClauses.push(`${col} LIKE $${paramIndex}`);
      values.push(filter.value);
    } else if (filter.type === 'ilike') {
      whereClauses.push(`${col} ILIKE $${paramIndex}`);
      values.push(filter.value);
    } else if (filter.type === 'in') {
      if (Array.isArray(filter.value) && filter.value.length > 0) {
        const placeholders = filter.value.map((_, idx) => `$${startParamIndex + values.length + idx}`).join(', ');
        whereClauses.push(`${col} IN (${placeholders})`);
        values.push(...filter.value);
      } else {
        whereClauses.push('1 = 0');
      }
    }
  });

  return { whereClauses, values };
}

export function compileSelect(table, selects, filters = [], orders = [], single = false, limit = null, offset = null) {
  validateIdentifier(table, 'Table name');
  validateSelects(selects);

  // Validate order column names
  orders.forEach(order => {
    if (order && order.column) {
      validateIdentifier(order.column, 'Order column');
    }
  });

  let formattedSelects = '*';
  if (selects && selects.trim() && selects.trim() !== '*') {
    const parts = selects.split(',').map(s => s.trim()).filter(Boolean);
    const safeParts = parts.map(part => {
      // 1. Plain identifier
      if (/^[a-zA-Z0-9_]+$/.test(part)) {
        return `"${part}"`;
      }
      // 2. Identifier with alias
      const aliasMatch = part.match(/^([a-zA-Z0-9_]+)\s+(?:as\s+)?([a-zA-Z0-9_]+)$/i);
      if (aliasMatch) {
        return `"${aliasMatch[1]}" AS "${aliasMatch[2]}"`;
      }
      // 3. Simple aggregate
      const aggMatch = part.match(/^(count|min|max|avg|sum)\(([a-zA-Z0-9_*]+)\)(?:\s+(?:as\s+)?([a-zA-Z0-9_]+))?$/i);
      if (aggMatch) {
        const fn = aggMatch[1].toUpperCase();
        const inner = aggMatch[2] === '*' ? '*' : `"${aggMatch[2]}"`;
        const alias = aggMatch[3] ? ` AS "${aggMatch[3]}"` : '';
        return `${fn}(${inner})${alias}`;
      }
      throw new Error(`Invalid select column: "${part}"`);
    });
    formattedSelects = safeParts.join(', ');
  }

  let sql = `SELECT ${formattedSelects} FROM "${table}"`;
  const { whereClauses, values } = compileWhereClauses(filters, 1);

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  if (orders.length > 0) {
    const orderClauses = orders.map((o) => `"${o.column}" ${o.ascending === false ? 'DESC' : 'ASC'}`);
    sql += ` ORDER BY ${orderClauses.join(', ')}`;
  }

  if (single) {
    sql += ` LIMIT 1`;
  } else if (typeof limit === 'number' && limit > 0) {
    sql += ` LIMIT ${Math.floor(limit)}`;
  }

  if (typeof offset === 'number' && offset > 0) {
    sql += ` OFFSET ${Math.floor(offset)}`;
  }

  return { sql, values };
}

function sanitizeColumnValue(val, col) {
  if (val === null || val === undefined) return val;
  // Specific JSON/JSONB columns or complex structures
  if (col === 'additional_tariffs' || col === 'options' || col === 'answers' || col === 'metadata' || col === 'social_media') {
    if (typeof val !== 'string') {
      return JSON.stringify(val);
    }
    return val;
  }
  // If value is an array of objects, node-postgres treats it as Postgres array literal which fails on json/jsonb
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      return JSON.stringify(val);
    }
    return val;
  }
  if (typeof val === 'object' && !(val instanceof Date)) {
    return JSON.stringify(val);
  }
  return val;
}

export function compileInsert(table, data) {
  validateIdentifier(table, 'Table name');

  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('Insert data array cannot be empty');
    }
    const columns = Object.keys(data[0]);
    columns.forEach(col => validateIdentifier(col, 'Insert column'));

    const values = [];
    const rowPlaceholders = [];

    data.forEach(row => {
      const placeholders = columns.map(col => {
        values.push(sanitizeColumnValue(row[col], col));
        return `$${values.length}`;
      });
      rowPlaceholders.push(`(${placeholders.join(', ')})`);
    });

    const sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${rowPlaceholders.join(', ')} RETURNING *`;
    return { sql, values };
  }

  Object.keys(data).forEach(col => validateIdentifier(col, 'Insert column'));
  const columns = Object.keys(data).map(col => `"${col}"`);
  const placeholders = Object.keys(data).map((_, idx) => `$${idx + 1}`).join(', ');
  const sql = `INSERT INTO "${table}" (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const values = Object.keys(data).map(col => sanitizeColumnValue(data[col], col));
  return { sql, values };
}

export function compileUpsert(table, data) {
  validateIdentifier(table, 'Table name');

  let conflictTarget = '"id"';
  let conflictCols = ['id'];

  if (table === 'system_configs') {
    conflictTarget = '"key"';
    conflictCols = ['key'];
  } else if (table === 'user_permissions') {
    conflictTarget = '"user_id", "permission_key"';
    conflictCols = ['user_id', 'permission_key'];
  } else if (table === 'service_availability') {
    conflictTarget = '"date", "program_type"';
    conflictCols = ['date', 'program_type'];
  } else if (table === 'user_roles') {
    conflictTarget = '"user_id"';
    conflictCols = ['user_id'];
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('Upsert data array cannot be empty');
    }
    const columns = Object.keys(data[0]);
    columns.forEach(col => validateIdentifier(col, 'Insert column'));

    const values = [];
    const rowPlaceholders = [];

    data.forEach(row => {
      const placeholders = columns.map(col => {
        values.push(sanitizeColumnValue(row[col], col));
        return `$${values.length}`;
      });
      rowPlaceholders.push(`(${placeholders.join(', ')})`);
    });

    const setClauses = columns
      .filter(col => !conflictCols.includes(col))
      .map(col => `"${col}" = EXCLUDED."${col}"`)
      .join(', ');

    let sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${rowPlaceholders.join(', ')}`;
    if (setClauses) {
      sql += ` ON CONFLICT (${conflictTarget}) DO UPDATE SET ${setClauses}`;
    } else {
      sql += ` ON CONFLICT (${conflictTarget}) DO NOTHING`;
    }
    sql += ` RETURNING *`;
    return { sql, values };
  }

  Object.keys(data).forEach(col => validateIdentifier(col, 'Insert column'));
  const columns = Object.keys(data).map(col => `"${col}"`);
  const placeholders = Object.keys(data).map((_, idx) => `$${idx + 1}`).join(', ');

  const setClauses = Object.keys(data)
    .filter(col => !conflictCols.includes(col))
    .map((col) => `"${col}" = EXCLUDED."${col}"`)
    .join(', ');

  let sql = `INSERT INTO "${table}" (${columns.join(', ')}) VALUES (${placeholders})`;
  if (setClauses) {
    sql += ` ON CONFLICT (${conflictTarget}) DO UPDATE SET ${setClauses}`;
  } else {
    sql += ` ON CONFLICT (${conflictTarget}) DO NOTHING`;
  }
  sql += ` RETURNING *`;

  const values = Object.keys(data).map(col => sanitizeColumnValue(data[col], col));
  return { sql, values };
}

export function compileUpdate(table, data, filters = []) {
  validateIdentifier(table, 'Table name');
  Object.keys(data).forEach(col => validateIdentifier(col, 'Update column'));

  const columns = Object.keys(data);
  const setClauses = [];
  const values = [];

  columns.forEach((col, idx) => {
    setClauses.push(`"${col}" = $${idx + 1}`);
    values.push(sanitizeColumnValue(data[col], col));
  });

  let sql = `UPDATE "${table}" SET ${setClauses.join(', ')}`;

  const { whereClauses, values: filterValues } = compileWhereClauses(filters, values.length + 1);
  values.push(...filterValues);

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  sql += ` RETURNING *`;
  return { sql, values };
}

export function compileDelete(table, filters = []) {
  validateIdentifier(table, 'Table name');

  let sql = `DELETE FROM "${table}"`;
  const { whereClauses, values } = compileWhereClauses(filters, 1);

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  sql += ` RETURNING *`;
  return { sql, values };
}
