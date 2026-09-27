"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function parseMoney(value: FormDataEntryValue | null) {
  if (!value) return 0;
  const normalized = String(value)
    .replace(/[R$\s.]/g, "")
    .replace(",", ".");
  return Math.round(Number(normalized || 0) * 100);
}

function toDate(value: FormDataEntryValue | null) {
  const dateValue = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return null;

  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await prisma.category.create({
    data: {
      name,
      description: String(formData.get("description") || "") || null,
      icon: String(formData.get("icon") || "") || null,
      parentId: String(formData.get("parentId") || "") || null,
    },
  });

  revalidatePath("/categories");
}

export async function updateCategory(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;

  await prisma.category.update({
    where: { id },
    data: {
      name,
      description: String(formData.get("description") || "") || null,
      icon: String(formData.get("icon") || "") || null,
    },
  });

  revalidatePath("/categories");
  revalidatePath("/items");
  revalidatePath("/dashboard");
}

export async function createResponsible(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await prisma.responsible.create({
    data: {
      name,
      type: String(formData.get("type") || "Outro"),
      description: String(formData.get("description") || "") || null,
    },
  });

  revalidatePath("/responsibles");
}

export async function createSupplier(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await prisma.supplier.create({
    data: {
      name,
      company: String(formData.get("company") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      whatsapp: String(formData.get("whatsapp") || "") || null,
      instagram: String(formData.get("instagram") || "") || null,
      email: String(formData.get("email") || "") || null,
      service: String(formData.get("service") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      link: String(formData.get("link") || "") || null,
    },
  });

  revalidatePath("/suppliers");
}

export async function updateSupplier(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;

  await prisma.supplier.update({
    where: { id },
    data: {
      name,
      company: String(formData.get("company") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      whatsapp: String(formData.get("whatsapp") || "") || null,
      instagram: String(formData.get("instagram") || "") || null,
      email: String(formData.get("email") || "") || null,
      service: String(formData.get("service") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      link: String(formData.get("link") || "") || null,
    },
  });

  revalidatePath("/suppliers");
  revalidatePath("/items");
  revalidatePath("/dashboard");
}

export async function createItem(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  const item = await prisma.item.create({
    data: {
      name,
      categoryId: String(formData.get("categoryId") || "") || null,
      description: String(formData.get("description") || "") || null,
      status: String(formData.get("status") || "Planejando"),
      priority: String(formData.get("priority") || "Média"),
      dueDate: toDate(formData.get("dueDate")),
      paymentDate: toDate(formData.get("paymentDate")),
      notes: String(formData.get("notes") || "") || null,
      tags: String(formData.get("tags") || "") || null,
      acquisitionType: String(formData.get("acquisitionType") || "Compra"),
      sourceType: String(formData.get("sourceType") || "") || null,
      isGift: formData.get("isGift") === "on",
      estimatedValue: parseMoney(formData.get("estimatedValue")),
      contractedValue: parseMoney(formData.get("contractedValue")),
      finalValue: parseMoney(formData.get("finalValue")),
      amountForCouple: parseMoney(formData.get("amountForCouple")),
      supplierId: String(formData.get("supplierId") || "") || null,
    },
  });

  const responsibleId = String(formData.get("responsibleId") || "");
  if (responsibleId) {
    await prisma.itemResponsible.create({
      data: {
        itemId: item.id,
        responsibleId,
        role: "Responsável principal",
      },
    });
  }

  const materialNames = formData.getAll("materialName").map((value) => String(value).trim());
  const materialValues = formData.getAll("materialEstimatedValue");
  const materials = materialNames.flatMap((materialName, index) => {
    const estimatedValue = parseMoney(materialValues[index] ?? null);
    return materialName && estimatedValue > 0 ? [{
      itemId: item.id,
      name: materialName,
      estimatedValue,
      actualValue: parseMoney(formData.getAll("materialActualValue")[index] ?? null),
      dueDate: toDate(formData.get("dueDate")),
      status: "Não comprado",
    }] : [];
  });
  if (formData.get("hasMaterials") === "on" && materials.length) {
    await prisma.material.createMany({ data: materials });
  }

  revalidatePath("/items");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect("/items");
}

export async function updateItem(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;

  const materialIds = formData.getAll("materialId").map((value) => String(value));
  const materialNames = formData.getAll("materialName").map((value) => String(value).trim());
  const materialEstimatedValues = formData.getAll("materialEstimatedValue");
  const materialActualValues = formData.getAll("materialActualValue");
  const materialRows = materialNames.map((materialName, index) => ({
    id: materialIds[index] ?? "",
    name: materialName,
    estimatedValue: parseMoney(materialEstimatedValues[index] ?? null),
    actualValue: parseMoney(materialActualValues[index] ?? null),
  }));
  const hasMaterials = formData.get("hasMaterials") === "on";
  const responsibleId = String(formData.get("responsibleId") || "");

  await prisma.$transaction(async (transaction) => {
    await transaction.item.update({
      where: { id },
      data: {
        name,
        categoryId: String(formData.get("categoryId") || "") || null,
        description: String(formData.get("description") || "") || null,
        status: String(formData.get("status") || "Planejando"),
        priority: String(formData.get("priority") || "Média"),
        dueDate: toDate(formData.get("dueDate")),
        paymentDate: toDate(formData.get("paymentDate")),
        notes: String(formData.get("notes") || "") || null,
        tags: String(formData.get("tags") || "") || null,
        acquisitionType: String(formData.get("acquisitionType") || "Compra"),
        sourceType: String(formData.get("sourceType") || "") || null,
        isGift: formData.get("isGift") === "on",
        estimatedValue: parseMoney(formData.get("estimatedValue")),
        contractedValue: parseMoney(formData.get("contractedValue")),
        finalValue: parseMoney(formData.get("finalValue")),
        amountForCouple: parseMoney(formData.get("amountForCouple")),
        supplierId: String(formData.get("supplierId") || "") || null,
      },
    });

    await transaction.itemResponsible.deleteMany({ where: { itemId: id } });
    if (responsibleId) {
      await transaction.itemResponsible.create({
        data: { itemId: id, responsibleId, role: "Responsável principal" },
      });
    }

    const existingMaterials = await transaction.material.findMany({
      where: { itemId: id },
      select: { id: true },
    });
    const existingIds = new Set(existingMaterials.map((material) => material.id));
    const submittedExistingIds = materialRows.filter((material) => existingIds.has(material.id)).map((material) => material.id);
    if (hasMaterials) {
      await transaction.material.deleteMany({
        where: { itemId: id, id: { notIn: submittedExistingIds } },
      });
    } else {
      await transaction.material.deleteMany({ where: { itemId: id } });
    }

    if (hasMaterials) {
      for (const material of materialRows) {
        if (!material.name) continue;
        if (existingIds.has(material.id)) {
          await transaction.material.update({
            where: { id: material.id },
            data: {
              name: material.name,
              estimatedValue: material.estimatedValue,
              actualValue: material.actualValue,
            },
          });
        } else {
          await transaction.material.create({
            data: {
              itemId: id,
              name: material.name,
              estimatedValue: material.estimatedValue,
              actualValue: material.actualValue,
              dueDate: toDate(formData.get("dueDate")),
              status: "Não comprado",
            },
          });
        }
      }
    }
  });

  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect("/items");
}

export async function updateItemEstimatedValue(formData: FormData) {
  const id = String(formData.get("id") || "");
  const estimatedValue = parseMoney(formData.get("estimatedValue"));
  if (!id || estimatedValue <= 0) return;

  await prisma.item.update({ where: { id }, data: { estimatedValue } });
  revalidatePath(`/items/${id}`);
  revalidatePath("/items");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function addPayment(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  const amount = parseMoney(formData.get("amount"));
  if (!itemId || amount <= 0) return;

  await prisma.payment.create({
    data: {
      itemId,
      amount,
      date: toDate(formData.get("date")) ?? new Date(),
      description: String(formData.get("description") || "") || null,
    },
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/payments");
  redirect(`/items/${itemId}`);
}

export async function addInstallment(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  const amount = parseMoney(formData.get("amount"));
  const count = Math.max(1, Number(formData.get("count") || 1));
  if (!itemId || amount <= 0 || !Number.isInteger(count) || count > 60) return;

  const existingCount = await prisma.installment.count({ where: { itemId } });
  const startDate = toDate(formData.get("dueDate"));
  const status = String(formData.get("status") || "Pendente");
  const paymentMethod = String(formData.get("paymentMethod") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  await prisma.installment.createMany({
    data: Array.from({ length: count }, (_, index) => ({
      itemId,
      number: existingCount + index + 1,
      amount,
      dueDate: startDate ? addMonths(startDate, index) : null,
      status,
      paidDate: status === "Pago" ? new Date() : null,
      paymentMethod,
      notes,
    })),
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/payments");
  redirect(`/items/${itemId}`);
}

export async function updateInstallmentStatus(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "Pendente");
  if (!id || !["Pendente", "Pago", "Atrasado", "Cancelado"].includes(status)) return;

  const installment = await prisma.installment.findUnique({ where: { id } });
  if (!installment) return;

  await prisma.installment.update({
    where: { id },
    data: {
      status,
      paidDate: status === "Pago" ? new Date() : null,
    },
  });

  revalidatePath(`/items/${installment.itemId}`);
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect(`/items/${installment.itemId}`);
}

export async function updateInstallment(formData: FormData) {
  const id = String(formData.get("id") || "");
  const amount = parseMoney(formData.get("amount"));
  const status = String(formData.get("status") || "Pendente");
  if (!id || amount <= 0 || !["Pendente", "Pago", "Atrasado", "Cancelado"].includes(status)) return;

  const installment = await prisma.installment.findUnique({ where: { id } });
  if (!installment) return;

  await prisma.installment.update({
    where: { id },
    data: {
      amount,
      dueDate: toDate(formData.get("dueDate")),
      status,
      paidDate: status === "Pago" ? installment.paidDate ?? new Date() : null,
    },
  });

  revalidatePath(`/items/${installment.itemId}`);
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect("/payments");
}

export async function addTask(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  const name = String(formData.get("name") || "").trim();
  if (!itemId || !name) return;

  await prisma.task.create({
    data: {
      itemId,
      name,
      assignee: String(formData.get("assignee") || "") || null,
      dueDate: toDate(formData.get("dueDate")),
      status: String(formData.get("status") || "Pendente"),
      priority: String(formData.get("priority") || "Média"),
    },
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function addMaterial(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  const name = String(formData.get("name") || "").trim();
  if (!itemId || !name) return;

  await prisma.material.create({
    data: {
      itemId,
      name,
      quantity: Number(formData.get("quantity") || 1),
      unit: String(formData.get("unit") || "") || null,
      estimatedValue: parseMoney(formData.get("estimatedValue")),
      actualValue: parseMoney(formData.get("actualValue")),
      status: String(formData.get("status") || "Não comprado"),
      dueDate: toDate(formData.get("dueDate")),
      whereToBuy: String(formData.get("whereToBuy") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function updateMaterial(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const quantity = Number(formData.get("quantity") || 1);
  const estimatedValue = parseMoney(formData.get("estimatedValue"));
  const actualValue = parseMoney(formData.get("actualValue"));
  const status = String(formData.get("status") || "Não comprado");
  if (!id || !name || !Number.isFinite(quantity) || quantity <= 0 || estimatedValue < 0 || actualValue < 0) return;

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) return;

  await prisma.material.update({
    where: { id },
    data: {
      name,
      quantity,
      unit: String(formData.get("unit") || "") || null,
      estimatedValue,
      actualValue,
      status,
      dueDate: toDate(formData.get("dueDate")),
      whereToBuy: String(formData.get("whereToBuy") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath(`/items/${material.itemId}`);
  revalidatePath("/items");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/items");
  revalidatePath("/dashboard");
}

export async function deleteResponsible(id: string) {
  await prisma.responsible.delete({ where: { id } });
  revalidatePath("/responsibles");
  revalidatePath("/items");
  revalidatePath("/dashboard");
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
  revalidatePath("/items");
  revalidatePath("/dashboard");
}

export async function deleteItem(id: string) {
  await prisma.item.delete({ where: { id } });
  revalidatePath("/items");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/payments");
}

export async function deletePayment(id: string) {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return;

  await prisma.payment.delete({ where: { id } });
  revalidatePath(`/items/${payment.itemId}`);
  revalidatePath("/payments");
  revalidatePath("/dashboard");
}

export async function deleteInstallment(id: string) {
  const installment = await prisma.installment.findUnique({ where: { id } });
  if (!installment) return;

  await prisma.installment.delete({ where: { id } });
  revalidatePath(`/items/${installment.itemId}`);
  revalidatePath("/payments");
  revalidatePath("/dashboard");
}

export async function deleteMaterial(id: string) {
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) return;

  await prisma.material.delete({ where: { id } });
  revalidatePath(`/items/${material.itemId}`);
  revalidatePath("/items");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return;

  await prisma.task.delete({ where: { id } });
  revalidatePath(`/items/${task.itemId}`);
}
