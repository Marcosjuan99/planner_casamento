# Deploy on Vercel

## Git and GitHub

The repository remote is `https://github.com/benditocasamento/Planner-casamento.git`, and the current deployment branch is `main`. Git commit identity is configured locally for this clone. To push commits, authenticate with GitHub using your usual HTTPS credential manager or SSH key; never put a token in this repository.

```bash
git status
git add .
git commit -m "Describe the change"
git push origin main
```

In Vercel, import `benditocasamento/Planner-casamento` from GitHub, keep the project root at the repository root, and use the detected Next.js settings. The build command is `npm run build`; Vercel installs from `package-lock.json`. Node.js 20.9 or newer is required.

## Production database

Vercel's filesystem is not persistent, so do not use the local SQLite database in production. Create a PostgreSQL database (Neon is supported) and set these environment variables in Vercel for Production before the first deployment. Configure Preview with a separate staging database so preview builds cannot apply migrations to production:

- `DATABASE_URL`: pooled PostgreSQL connection URL for application queries.
- `DIRECT_URL`: direct, unpooled PostgreSQL connection URL for Prisma migrations.

Use the provider's exact connection strings. Keep secrets out of `.env.example`, Git, and commits. The production build generates the PostgreSQL Prisma Client, applies committed migrations in `prisma/migrations`, and builds Next.js. A missing/invalid database URL or an unreachable database will fail the build; local development continues using SQLite via `.env`.

## Local data

The local database is `prisma/dev.db` and is ignored by Git. To transfer local data to a new, empty PostgreSQL database, first export it while the local Prisma Client is generated:

```bash
npm run db:generate:local
npm run db:export:sqlite -- "$HOME/planner-casamento-backup.json"
```

Then stop the dev server, set `DATABASE_URL` and `DIRECT_URL` to the production database in the current shell, and run:

```bash
npm run db:generate:vercel
npx prisma migrate deploy --schema=prisma/schema.vercel.prisma
npm run db:import:sqlite -- "$HOME/planner-casamento-backup.json"
npm run db:generate:local
```

The importer cancels if destination tables already contain data. Do not import over a database with production records. Restore local environment variables and regenerate the SQLite client before resuming local development.

## Access protection

This app currently has no sign-in or user authorization. A public Vercel deployment exposes planner data to anyone who can reach it. Enable Vercel Deployment Protection or add application authentication before storing private information.