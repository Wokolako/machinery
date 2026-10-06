import { query, queryOne } from "../db/pool.js";

const columns = `
  id, name, company, requester_kind AS "requesterKind", sites, machines, notes,
  created_at AS "createdAt"
`;

export function insert({ name, company, requesterKind, sites, machines, notes }) {
  return queryOne(
    `INSERT INTO pilot_requests (name, company, requester_kind, sites, machines, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${columns}`,
    [name, company, requesterKind, sites, machines, notes],
  );
}

export function findPage({ limit, offset }) {
  return query(
    `SELECT ${columns}
     FROM pilot_requests
     ORDER BY created_at DESC, id
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
}

export async function count() {
  const row = await queryOne("SELECT count(*) AS total FROM pilot_requests");
  return row.total;
}

export function findById(id) {
  return queryOne(`SELECT ${columns} FROM pilot_requests WHERE id = $1`, [id]);
}
