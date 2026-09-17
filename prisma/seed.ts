import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingCategories = await prisma.category.count();
  if (existingCategories > 0) {
    console.log("Seed already present.");
    return;
  }

  const local = await prisma.category.create({
    data: { name: "Local", description: "Espaço e cerimônia", icon: "📍" },
  });

  const servicos = await prisma.category.create({
    data: { name: "Serviços", description: "Cerimonial, fotos e produção", icon: "🧾" },
  });

  const alimentacao = await prisma.category.create({
    data: { name: "Alimentação", description: "Buffet, bebidas e doces", icon: "🍽️" },
  });

  const pai = await prisma.responsible.create({ data: { name: "Pai", type: "Família", description: "Responsável por apoio familiar" } });
  const casal = await prisma.responsible.create({ data: { name: "Casal", type: "Casal", description: "Responsabilidade principal" } });
  const sogra = await prisma.responsible.create({ data: { name: "Sogra", type: "Família", description: "Produção e apoio" } });

  const fornecedorCerimonial = await prisma.supplier.create({
    data: {
      name: "Casa de Eventos",
      company: "Evento & Co",
      phone: "(11) 99999-0000",
      email: "contato@eventoco.com",
      service: "Cerimonial",
    },
  });

  const itemEspaco = await prisma.item.create({
    data: {
      name: "Espaço do casamento",
      categoryId: local.id,
      description: "Meu pai vai fornecer o espaço do casamento.",
      status: "Concluído",
      priority: "Alta",
      acquisitionType: "Presente",
      sourceType: "Presente",
      isGift: true,
      estimatedValue: 500000,
      amountForCouple: 0,
      finalValue: 500000,
      notes: "Possui caráter de presente familiar.",
      supplierId: null,
    },
  });

  await prisma.itemResponsible.create({
    data: { itemId: itemEspaco.id, responsibleId: pai.id, role: "Presente" },
  });

  const itemCerimonialista = await prisma.item.create({
    data: {
      name: "Cerimonialista",
      categoryId: servicos.id,
      description: "Organização do evento e cronograma.",
      status: "Parcialmente pago",
      priority: "Alta",
      acquisitionType: "Contratação",
      sourceType: "Serviço",
      estimatedValue: 400000,
      contractedValue: 400000,
      finalValue: 400000,
      amountForCouple: 400000,
      supplierId: fornecedorCerimonial.id,
    },
  });

  await prisma.itemResponsible.create({
    data: { itemId: itemCerimonialista.id, responsibleId: casal.id, role: "Responsável principal" },
  });

  await prisma.payment.create({
    data: {
      itemId: itemCerimonialista.id,
      amount: 100000,
      date: new Date("2026-09-10T00:00:00.000Z"),
      description: "Entrada do cerimonialista",
    },
  });

  await prisma.installment.createMany({
    data: [
      { itemId: itemCerimonialista.id, number: 1, amount: 50000, dueDate: new Date("2026-10-15T00:00:00.000Z"), status: "Pago", paymentMethod: "Pix" },
      { itemId: itemCerimonialista.id, number: 2, amount: 50000, dueDate: new Date("2026-11-15T00:00:00.000Z"), status: "Pendente", paymentMethod: "Transferência" },
      { itemId: itemCerimonialista.id, number: 3, amount: 50000, dueDate: new Date("2026-12-15T00:00:00.000Z"), status: "Pendente", paymentMethod: "Transferência" },
    ],
  });

  const buffet = await prisma.item.create({
    data: {
      name: "Buffet",
      categoryId: alimentacao.id,
      description: "Produção por familiar com materiais adicionais.",
      status: "Planejando",
      priority: "Média",
      acquisitionType: "Produzido por familiar",
      sourceType: "Produzido por familiar",
      estimatedValue: 250000,
      amountForCouple: 0,
      finalValue: 250000,
      notes: "A sogra vai produzir o buffet e o casal compra materiais.",
    },
  });

  await prisma.itemResponsible.create({
    data: { itemId: buffet.id, responsibleId: sogra.id, role: "Produção" },
  });

  await prisma.material.createMany({
    data: [
      { itemId: buffet.id, name: "Carnes", quantity: 30, unit: "kg", estimatedValue: 50000, actualValue: 0, status: "Não comprado" },
      { itemId: buffet.id, name: "Massas", quantity: 15, unit: "kg", estimatedValue: 20000, actualValue: 0, status: "Pesquisando preço" },
      { itemId: buffet.id, name: "Bebidas", quantity: 40, unit: "unidades", estimatedValue: 80000, actualValue: 0, status: "Não comprado" },
    ],
  });

  await prisma.task.createMany({
    data: [
      { itemId: itemCerimonialista.id, name: "Contratar cerimonialista", assignee: "Casal", dueDate: new Date("2026-09-20T00:00:00.000Z"), status: "Concluído", priority: "Alta" },
      { itemId: buffet.id, name: "Definir cardápio", assignee: "Sogra", dueDate: new Date("2026-09-30T00:00:00.000Z"), status: "Pendente", priority: "Média" },
    ],
  });

  console.log("Seed data created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
