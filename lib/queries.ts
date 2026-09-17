import { prisma } from "@/lib/db";

export async function getDashboardData() {
  const items = await prisma.item.findMany({
    include: {
      payments: true,
      installments: true,
      materials: true,
      tasks: true,
      category: true,
      responsibleConnections: { include: { responsible: true } },
      supplier: true,
    },
  });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { items: true } } },
  });

  const responsibles = await prisma.responsible.findMany({
    include: { items: { include: { item: true } } },
  });

  const suppliers = await prisma.supplier.findMany();

  return { items, categories, responsibles, suppliers };
}
