# Deploy on Vercel

## Git and GitHub

The repository remote is `https://github.com/Marcosjuan99/planner_casamento.git`, and the deployment branch is `main`. Git commit identity is configured locally for this clone. To push commits, authenticate with GitHub using your usual HTTPS credential manager or SSH key; never put a token in this repository.

```bash
git status
git add .
git commit -m "Describe the change"
git push origin main
```

In Vercel, import `Marcosjuan99/planner_casamento` from GitHub, keep the project root at the repository root, and use the detected Next.js settings. The build command is `npm run build`; Vercel installs from `package-lock.json`. Node.js 20.9 or newer is required.

## Supabase database on Vercel

The app uses Prisma directly with PostgreSQL; it does not need the Supabase JavaScript SDK or an API key. Do not use the local SQLite database in production.

1. Create a Supabase project and set its database password.
2. In the Supabase dashboard, open **Connect** and copy the **Transaction pooler** connection string (port `6543`). Use it as `DATABASE_URL` and add `pgbouncer=true&connection_limit=1&sslmode=require` to its query parameters. Keep any existing parameters and join additions with `&`.
3. In **Connect**, choose **Session pooler** (port `5432`) and copy that connection string as `DIRECT_URL`. Prisma uses this for migrations. This pooler also works from IPv4-only build environments, unlike the direct database endpoint on projects without IPv4 support.
4. In Vercel, open **Project Settings > Environment Variables** and add both exact, password-filled URLs for **Production**. Set **Preview** to a separate Supabase staging project, or leave Preview deployments disabled until one is configured. Do not point Preview at the production database.
5. Redeploy. The build generates the PostgreSQL Prisma Client and runs the checked-in migrations in `prisma/migrations` before building Next.js.

The build fails with Prisma `P1012` if either variable is missing. Never use the example placeholders as real values, commit database URLs, or expose a database password, Supabase `service_role` key, or database URL in browser code. Local development continues to use SQLite via `.env`.

## Move local data to Supabase

The local database is `prisma/dev.db` and is ignored by Git. Export it before switching Prisma to PostgreSQL. The target Supabase project must be new/empty; the import intentionally cancels if it finds records.

```bash
npm run db:generate:local
npm run db:export:sqlite -- "$HOME/planner-casamento-backup.json"
```

Stop the dev server. In a terminal, set `DATABASE_URL` to the Supabase Transaction pooler URL and `DIRECT_URL` to the Session pooler URL for the empty Supabase project. Do not put either value in Git. Then run:

```bash
npm run db:generate:vercel
npx prisma migrate deploy --schema=prisma/schema.vercel.prisma
npm run db:import:sqlite -- "$HOME/planner-casamento-backup.json"
unset DATABASE_URL DIRECT_URL
npm run db:generate:local
```

The migration creates the tables; the importer preserves record IDs, dates, and relations. It cancels if destination tables already contain data. Never run this import over a database with production records. The `unset` command removes the temporary connection strings from the current shell; regenerate the SQLite client before resuming local development.

## Access protection

This app currently has no sign-in or user authorization. A public Vercel deployment exposes planner data to anyone who can reach it. Enable Vercel Deployment Protection or add application authentication before storing private information.
