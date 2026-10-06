// Creates the database if needed, then loads schema.sql and seed.sql.
// Usage: npm run db:setup   (destructive: drops and recreates the assetyield schema)
import { readFile } from "node:fs/promises";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const target = new URL(url);
const dbName = decodeURIComponent(target.pathname.slice(1));
if (!/^[a-z_][a-z0-9_]*$/.test(dbName)) {
  console.error(`Database name "${dbName}" must be lowercase letters, digits and underscores.`);
  process.exit(1);
}

async function ensureDatabase() {
  const adminUrl = new URL(url);
  adminUrl.pathname = "/postgres";
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (rowCount === 0) {
      // Name is validated above; identifiers can't be passed as parameters.
      await admin.query(`CREATE DATABASE ${dbName} ENCODING 'UTF8' TEMPLATE template0`);
      console.log(`Created database ${dbName}.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
    const { rows } = await admin.query("SHOW server_version");
    console.log(`PostgreSQL ${rows[0].server_version}`);
  } finally {
    await admin.end();
  }
}

async function load() {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    for (const file of ["schema.sql", "seed.sql"]) {
      const sql = await readFile(new URL(file, import.meta.url), "utf8");
      await client.query(sql);
      console.log(`Loaded ${file}.`);
    }
    const { rows } = await client.query(`
      SELECT
        (SELECT count(*) FROM assetyield.site_pages)     AS pages,
        (SELECT count(*) FROM assetyield.page_sections)  AS sections,
        (SELECT count(*) FROM assetyield.interval_logs)  AS logs,
        (SELECT count(*) FROM assetyield.machines)       AS machines
    `);
    console.log("Row counts:", rows[0]);
  } finally {
    await client.end();
  }
}

try {
  await ensureDatabase();
  await load();
  console.log("Done.");
} catch (err) {
  console.error("Setup failed:", err.message);
  process.exit(1);
}
