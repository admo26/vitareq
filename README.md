# Vitafleet Vitareq (prototype)

Full-stack Next.js app deployed on Vercel with Atlassian Design System UI and a REST API secured by OAuth 2 (Auth0). Data is stored via Prisma. Local dev uses SQLite; production recommended: Neon Postgres.

## Local development

1. Install dependencies
```bash
npm i
```

2. Set env vars (already created `.env`):
- `DATABASE_URL` (defaults to SQLite `file:./dev.db`)
- `SKIP_AUTH=true` to bypass OAuth locally

3. Migrate DB and generate client
```bash
npx prisma migrate dev
```

4. Start dev server
```bash
npm run dev
```

Open `http://localhost:3000`.

## REST API

- `GET /api/requirements` | `POST /api/requirements`
- `GET /api/requirements/:id` | `PUT /api/requirements/:id` | `DELETE /api/requirements/:id`
- `GET /api/risks` | `POST /api/risks`
- `GET /api/risks/:id` | `PUT /api/risks/:id` | `DELETE /api/risks/:id`

Auth: In prod, send `Authorization: Bearer <access_token>` (Auth0 audience). Locally, auth is skipped with `SKIP_AUTH=true`.

## UI

- Atlaskit components with simple pages:
  - `/requirements` – list/create Requirements
  - `/risks` – list/create Risks

## Deploy to Vercel

1. Push this repo to GitHub and import into Vercel.
2. In Vercel Project Settings → Environment Variables, set:
   - `DATABASE_URL` (Neon Postgres `postgres://...`)
   - `AUTH0_DOMAIN` (e.g. `your-tenant.us.auth0.com`)
   - `AUTH0_AUDIENCE` (Auth0 API identifier)
   - `SKIP_AUTH` = `false`
3. Add a Vercel Postgres or external Neon database. Run migrations:
```bash
npx prisma migrate deploy
```
4. Redeploy.

## Configure Auth0 (OAuth 2)

- Create an API in Auth0, copy its Identifier as `AUTH0_AUDIENCE`.
- Create a Regular Web Application client.
- In your SPA or machine-to-machine client, request an access token with the API audience.
- API endpoints verify JWTs via JWKS (`src/lib/auth.ts`).

## Switching to Postgres (Neon)

- Update `DATABASE_URL` to your Neon connection string.
- Re-run migrations in the deployed environment with `prisma migrate deploy`.

## Notes

- This is a prototype; models and UI are intentionally simple.
- Add indexes/constraints as needed for real workloads.
