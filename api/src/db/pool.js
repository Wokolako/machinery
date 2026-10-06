import pg from "pg";
import { config } from "../config/index.js";

// Return numeric and bigint columns as JS numbers. Safe here: every numeric we
// store is a kilogram, hour or multiplier value, and ids stay far below 2^53.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => Number(v));
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => Number(v));

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: config.DB_POOL_MAX,
  // Every query runs against the assetyield schema without qualifying names.
  options: "-c search_path=assetyield",
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  // An idle client lost its connection; the pool replaces it on next use.
  console.error("[db] idle client error:", err.message);
});

/** Runs a parameterised query and returns its rows. */
export async function query(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

/** Runs a query and returns the first row, or undefined. */
export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0];
}

export async function closePool() {
  await pool.end();
}
