import { Pool, PoolClient, QueryResult, QueryResultRow, types } from "pg";
import { env } from "../env.js";
import { logger } from "../../utils/logger.js";

// Return DATE columns as 'YYYY-MM-DD' strings, not JS Date objects (avoids time zone shifts)
types.setTypeParser(types.builtins.DATE, (value) => value);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) =>
  logger.error({ err }, "Unexpected idle database client error"),
);

/** Anything that can run a query: the pool, or one client inside a transaction. */
export interface Queryable {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>>;
}

/** Run one parameterized query and return the rows. Pass a client to join a transaction. */
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
  db: Queryable = pool,
): Promise<T[]> {
  const result = await db.query<T>(text, params);
  return result.rows;
}

/** Run several queries atomically: all succeed, or none are applied. */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
