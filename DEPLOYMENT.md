# Vercel deployment

## GitHub connection

1. In Vercel, choose **Add New Project** and import `benditocasamento/Planner-casamento` from GitHub.
2. If the repository is not listed, connect the GitHub account and grant Vercel access to this repository.
3. Keep the project root at the repository root and use the default Next.js build command (`npm run build`).

Vercel installs dependencies and redeploys when commits are pushed to the connected branch. No Vercel package is required inside this Next.js app.

## Neon configuration

The local SQLite file is not persistent storage on Vercel. Create a Neon PostgreSQL database (the Vercel Marketplace integration is supported) and add these project environment variables in Vercel before the first deployment:

- `DATABASE_URL`: pooled Neon connection URL for application queries.
- `DIRECT_URL`: unpooled/direct Neon connection URL for Prisma migrations.

Set both variables for Production and Preview. Do not commit real connection URLs. `.env.example` contains placeholders only.

The production build generates the PostgreSQL Prisma Client, applies `prisma/migrations`, then builds Next.js. Local development continues using the original SQLite schema and `prisma/dev.db`.

## Import local records

The safety export created for this setup is at:

`%TEMP%\planner-casamento-sqlite-1790638956601.json`

Stop the local dev server before switching Prisma Client generation. In PowerShell, set the Neon connection URLs in the current terminal, then import into the migrated, empty Neon database:

```powershell
$env:DATABASE_URL = "<pooled Neon URL>"
$env:DIRECT_URL = "<direct Neon URL>"
npm run db:import:sqlite -- "$env:TEMP\planner-casamento-sqlite-1790638956601.json"
Remove-Item Env:DATABASE_URL,Env:DIRECT_URL
npm run db:generate:local
```

The importer preserves IDs, dates, and relations. It cancels before writing if any destination table already contains records. Do not run the import after users have started entering production data.

To create a fresh export later, run `npm run db:export:sqlite -- "<path outside the repository>"` while local Prisma is generated for SQLite. The exporter never overwrites an existing file. If you previously generated the PostgreSQL client, stop the dev server and run `npm run db:generate:local` before exporting.