# AssetYield API

Node.js (Express 5) API that serves every piece of content on the AssetYield
website from PostgreSQL 13, and stores pilot requests from its form.

## Run it

```powershell
copy .env.example .env      # then set the postgres password in DATABASE_URL
npm install
npm run db:setup            # creates the "assetyield" database, schema and dummy data
npm run dev                 # http://127.0.0.1:4000/api, restarts on file changes
npm test                    # unit + HTTP tests; no database needed
```

`npm run db:setup` drops and recreates the `assetyield` schema, so it also
deletes any saved pilot requests. It never touches other schemas or databases.

## Structure

Each request flows down the layers and back up; each layer only talks to the
one below it.

```
routes  →  middleware  →  controller  →  service  →  repository  →  PostgreSQL
```

| Folder | Job |
| --- | --- |
| `src/config/` | Reads and validates environment variables once at startup. |
| `src/db/` | Connection pool (`search_path=assetyield`) and query helpers. |
| `src/errors/` | Typed errors (`NotFoundError`, `ValidationError`, …) that map to status codes. |
| `src/middleware/` | Request id, request log, security headers, rate limit, API-key auth, zod validation, 404 and error handler. |
| `src/validators/` | zod schemas for bodies, query strings and URL params. |
| `src/repositories/` | SQL only. One file per area; every query is parameterised. |
| `src/services/` | Business logic. `calculation.service.js` is the blueprint's calculation engine (yield, multiplier, band position, value per hour, waste value, flags). |
| `src/controllers/` | Reads validated input from the request, calls a service, sends the response. |
| `src/routes/` | Maps URLs to middleware and controllers. `routes/index.js` lists every endpoint. |
| `src/app.js` | Builds the Express app (used by `server.js` and the tests). |
| `src/server.js` | Starts listening and shuts down cleanly on Ctrl+C. |
| `db/` | `schema.sql`, `seed.sql` and the `setup.js` loader. |
| `test/` | `node:test` suites. |

## Endpoints

All under `/api`. Responses are JSON and never cached.

| Method | Path | What it returns |
| --- | --- | --- |
| GET | `/health` | API uptime and database status (503 if the database is down) |
| GET | `/site` | Site settings and the page list |
| GET | `/pages/:slug` | One page's intro and named sections |
| GET | `/content` | Names of the content collections |
| GET | `/content/:collection` | `steps`, `timeline`, `tiers`, `routes`, `metrics`, `flags`, `roles`, `commercial`, `scope-rules`, `pilot-checklist` |
| GET | `/machines` | Machines with their company |
| GET | `/machines/:assetCode` | One machine |
| GET | `/machines/:assetCode/shifts?limit=20` | Recent shift closes with calculated metrics and flags |
| GET | `/machines/:assetCode/scopes` | Every scope version, so revisions can be compared |
| GET | `/demo-shift?machine=CR-04` | Everything the website's live shift record needs |
| GET | `/ledger-example` | The latest correction and the log it replaced |
| POST | `/pilot-requests` | Saves a pilot request; rate limited per client IP |
| GET | `/pilot-requests?limit=25&offset=0` | Saved requests (needs `X-API-Key`) |
| GET | `/pilot-requests/:id` | One saved request (needs `X-API-Key`) |

Errors always look like this:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Some fields need attention.",
    "details": { "name": "Enter your name." },
    "requestId": "9b2f…"
  }
}
```

## Admin endpoints

Set `ADMIN_API_KEY` in `.env` (16+ characters) and restart. Then:

```powershell
curl.exe -H "X-API-Key: <your key>" http://127.0.0.1:4000/api/pilot-requests
```

Without `ADMIN_API_KEY` those routes answer 503 rather than being open.

## Notes

- The rate limiter is in memory, so it resets on restart and only works for a
  single API process. Move it to a shared store before running several.
- The API trusts `X-Forwarded-For` only from loopback (the website's server on
  the same machine). In production, put the website behind a proxy that sets
  that header, so visitors can't choose their own address.
- `interval_logs` and `log_outputs` are write-once: a database trigger rejects
  updates and deletes. Corrections are new rows pointing at the original.
