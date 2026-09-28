import { loadEnvConfig } from "@next/env";
import { Prisma, PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

type ExportRow = Record<string, unknown>;

type SqliteExport = {
  categories: ExportRow[];
  responsibles: ExportRow[];
  weddingSettings: ExportRow[];
  calendarEvents: ExportRow[];
  suppliers: ExportRow[];
  items: ExportRow[];
  itemResponsibles: ExportRow[];
  payments: ExportRow[];
  installments: ExportRow[];
  materials: ExportRow[];
  tasks: ExportRow[];
};

function restoreDates(rows: ExportRow[], dateFields: string[]) {
  return rows.map((row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      dateFields.includes(key) && typeof value === "string" ? new Date(value) : value,
    ]),
  ));
}

async function insertMany<T>(rows: Record<string, unknown>[], insert: (data: T[]) => Promise<unknown>) {
  if (rows.length) await insert(rows as unknown as T[]);
}

async function main() {
  const exportPath = process.argv[2];
  if (!exportPath) {
    throw new Error("Informe o caminho do JSON exportado do SQLite: npm run db:import:sqlite -- <arquivo.json>");
  }

  const sqliteExport = JSON.parse(await readFile(exportPath, "utf8")) as SqliteExport;
  const tableNames: (keyof SqliteExport)[] = [
    "categories", "responsibles", "weddingSettings", "calendarEvents", "suppliers",
    "items", "itemResponsibles", "payments", "installments", "materials", "tasks",
  ];
  if (tableNames.some((name) => !Array.isArray(sqliteExport[name]))) {
    throw new Error("O arquivo não corresponde a um export completo do Planner de Casamento.");
  }

  const importedCounts = await prisma.$transaction(async (transaction) => {
    const existingCounts = await Promise.all([
      transaction.category.count(),
      transaction.responsible.count(),
      transaction.weddingSettings.count(),
      transaction.calendarEvent.count(),
      transaction.supplier.count(),
      transaction.item.count(),
      transaction.itemResponsible.count(),
      transaction.payment.count(),
      transaction.installment.count(),
      transaction.material.count(),
      transaction.task.count(),
    ]);

    if (existingCounts.some((count) => count > 0)) {
      throw new Error("O banco de destino não está vazio; a importação foi cancelada para evitar duplicações.");
    }

    const categories = restoreDates(sqliteExport.categories, ["createdAt", "updatedAt"]);
    await insertMany<Prisma.CategoryCreateManyInput>(
      categories.map((category) => ({ ...category, parentId: null })),
      (data) => transaction.category.createMany({ data }),
    );
    for (const category of categories) {
      if (typeof category.parentId === "string") {
        await transaction.category.update({
          where: { id: String(category.id) },
          data: { parentId: category.parentId },
        });
      }
    }

    await insertMany<Prisma.ResponsibleCreateManyInput>(
      restoreDates(sqliteExport.responsibles, ["createdAt", "updatedAt"]),
      (data) => transaction.responsible.createMany({ data }),
    );
    await insertMany<Prisma.WeddingSettingsCreateManyInput>(
      restoreDates(sqliteExport.weddingSettings, ["weddingDate", "updatedAt"]),
      (data) => transaction.weddingSettings.createMany({ data }),
    );
    await insertMany<Prisma.CalendarEventCreateManyInput>(
      restoreDates(sqliteExport.calendarEvents, ["date", "createdAt", "updatedAt"]),
      (data) => transaction.calendarEvent.createMany({ data }),
    );
    await insertMany<Prisma.SupplierCreateManyInput>(
      restoreDates(sqliteExport.suppliers, ["createdAt", "updatedAt"]),
      (data) => transaction.supplier.createMany({ data }),
    );
    await insertMany<Prisma.ItemCreateManyInput>(
      restoreDates(sqliteExport.items, ["dueDate", "paymentDate", "createdAt", "updatedAt"]),
      (data) => transaction.item.createMany({ data }),
    );
    await insertMany<Prisma.ItemResponsibleCreateManyInput>(
      restoreDates(sqliteExport.itemResponsibles, ["createdAt"]),
      (data) => transaction.itemResponsible.createMany({ data }),
    );
    await insertMany<Prisma.PaymentCreateManyInput>(
      restoreDates(sqliteExport.payments, ["date", "createdAt"]),
      (data) => transaction.payment.createMany({ data }),
    );
    await insertMany<Prisma.InstallmentCreateManyInput>(
      restoreDates(sqliteExport.installments, ["dueDate", "paidDate", "createdAt"]),
      (data) => transaction.installment.createMany({ data }),
    );
    await insertMany<Prisma.MaterialCreateManyInput>(
      restoreDates(sqliteExport.materials, ["dueDate", "createdAt"]),
      (data) => transaction.material.createMany({ data }),
    );
    await insertMany<Prisma.TaskCreateManyInput>(
      restoreDates(sqliteExport.tasks, ["dueDate", "createdAt"]),
      (data) => transaction.task.createMany({ data }),
    );

    return Object.fromEntries(tableNames.map((name) => [name, sqliteExport[name].length]));
  }, { maxWait: 10_000, timeout: 120_000 });

  console.log("SQLite import finished:", importedCounts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
