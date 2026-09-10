import { drizzle } from 'drizzle-orm/libsql';
import { getClient } from '../lib/db';
import * as schema from './schema';

export function getDb() {
  const client = getClient();
  return drizzle(client, { schema });
}
