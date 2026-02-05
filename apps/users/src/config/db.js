import { Pool } from 'pg';
import { mustGetEnv } from '@ilia/shared';

export function createDbPool() {
  const connectionString = mustGetEnv('USERS_DB_URL');

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  return pool;
}
