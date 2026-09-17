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
  if (!value || String(value).trim() === "") return null;
  return new Date(String(value));
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

  revalidatePath("/items");
  redirect("/items");
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
  if (!itemId || amount <= 0) return;

  const count = await prisma.installment.count({ where: { itemId } });

  await prisma.installment.create({
    data: {
      itemId,
      number: count + 1,
      amount,
      dueDate: toDate(formData.get("dueDate")),
      status: String(formData.get("status") || "Pendente"),
      paymentMethod: String(formData.get("paymentMethod") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/payments");
  redirect(`/items/${itemId}`);
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
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return;

  await prisma.task.delete({ where: { id } });
  revalidatePath(`/items/${task.itemId}`);
}
