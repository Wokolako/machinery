import { queryOne } from "../db/pool.js";

export function ping() {
  return queryOne(`
    SELECT now() AS "dbTime",
           current_database() AS "database",
           current_setting('server_version') AS "serverVersion"
  `);
}
