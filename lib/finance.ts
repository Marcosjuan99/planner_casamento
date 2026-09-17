import type { Item, Payment, Installment, Material, Task } from "@prisma/client";

export function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function getUpcomingDeadline(date: Date | null) {
  if (!date) return null;
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getItemFinancialSummary(item: Item & { payments: Payment[]; installments: Installment[]; materials: Material[] }) {
  const paymentsTotal = item.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const installmentsPaid = item.installments.filter((installment) => installment.status === "Pago").reduce((sum, installment) => sum + installment.amount, 0);
  const installmentsPending = item.installments.filter((installment) => installment.status !== "Pago" && installment.status !== "Cancelado").reduce((sum, installment) => sum + installment.amount, 0);
  const materialsTotal = item.materials.reduce((sum, material) => sum + material.estimatedValue, 0);
  const paidTotal = paymentsTotal + installmentsPaid;
  const remaining = Math.max(item.finalValue || item.contractedValue || item.estimatedValue, 0) - paidTotal;

  return {
    paymentsTotal,
    installmentsPaid,
    installmentsPending,
    materialsTotal,
    paidTotal,
    remaining,
    percentPaid: percent(paidTotal, Math.max(item.finalValue || item.contractedValue || item.estimatedValue, 1)),
  };
}

export function getDashboardStats(items: (Item & { payments: Payment[]; installments: Installment[]; materials: Material[]; tasks: Task[] })[]) {
  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedValue, 0);
  const totalPaid = items.reduce((sum, item) => sum + getItemFinancialSummary(item).paidTotal, 0);
  const totalRemaining = items.reduce((sum, item) => sum + getItemFinancialSummary(item).remaining, 0);
  const totalCommitted = items.reduce((sum, item) => sum + item.contractedValue + item.installments.filter((i) => i.status !== "Cancelado" && i.status !== "Pago").reduce((t, i) => t + i.amount, 0), 0);
  const giftsTotal = items.filter((item) => item.isGift).reduce((sum, item) => sum + item.estimatedValue, 0);
  const materialsTotal = items.reduce((sum, item) => sum + item.materials.reduce((t, material) => t + material.estimatedValue, 0), 0);
  const completed = items.filter((item) => item.status === "Concluído").length;
  const pending = items.filter((item) => item.status !== "Concluído" && item.status !== "Cancelado").length;
  const overdue = items.filter((item) => item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "Concluído" && item.status !== "Cancelado").length;
  const urgent = items.filter((item) => item.priority === "Urgente").length;

  return {
    totalEstimated,
    totalPaid,
    totalRemaining,
    totalCommitted,
    giftsTotal,
    materialsTotal,
    completed,
    pending,
    overdue,
    urgent,
  };
}
