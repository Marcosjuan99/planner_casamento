import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const outputPath = resolve(process.argv[2] ?? join(tmpdir(), `planner-casamento-sqlite-${Date.now()}.json`));
  const [categories, responsibles, weddingSettings, calendarEvents, suppliers, items, itemResponsibles, payments, installments, materials, tasks] = await prisma.$transaction([
    prisma.category.findMany(),
    prisma.responsible.findMany(),
    prisma.weddingSettings.findMany(),
    prisma.calendarEvent.findMany(),
    prisma.supplier.findMany(),
    prisma.item.findMany(),
    prisma.itemResponsible.findMany(),
    prisma.payment.findMany(),
    prisma.installment.findMany(),
    prisma.material.findMany(),
    prisma.task.findMany(),
  ]);
  const data = { categories, responsibles, weddingSettings, calendarEvents, suppliers, items, itemResponsibles, payments, installments, materials, tasks };

  await writeFile(outputPath, JSON.stringify(data, null, 2), { flag: "wx" });
  console.log("SQLite export created:", outputPath);
  console.log("Record counts:", Object.fromEntries(Object.entries(data).map(([name, rows]) => [name, rows.length])));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
