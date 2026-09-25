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

export function isInstallmentOverdue(status: string, dueDate: Date | null) {
  if (status !== "Pendente" || !dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function isInstallmentDueSoon(status: string, dueDate: Date | null) {
  if (status !== "Pendente" || !dueDate) return false;
  const now = Date.now();
  const fiveDaysFromNow = now + 5 * 24 * 60 * 60 * 1000;
  const dueTime = new Date(dueDate).getTime();
  return dueTime >= now && dueTime <= fiveDaysFromNow;
}

export function getItemFinancialSummary(item: Item & { payments: Payment[]; installments: Installment[]; materials: Material[] }) {
  const paymentsTotal = item.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const installmentsPaid = item.installments.filter((installment) => installment.status === "Pago").reduce((sum, installment) => sum + installment.amount, 0);
  const installmentsPending = item.installments.filter((installment) => installment.status !== "Pago" && installment.status !== "Cancelado").reduce((sum, installment) => sum + installment.amount, 0);
  const materialsTotal = item.materials.reduce((sum, material) => sum + (material.actualValue || material.estimatedValue), 0);
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

function isWithinPeriod(date: Date | null, startDate: Date, endDate: Date) {
  if (!date) return false;
  const value = new Date(date);
  return value >= startDate && value <= endDate;
}

export function getDashboardStats(items: (Item & { payments: Payment[]; installments: Installment[]; materials: Material[]; tasks: Task[] })[], period: { startDate?: Date; endDate?: Date } = {}) {
  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedValue, 0);
  const totalPaid = items.reduce((sum, item) => sum + getItemFinancialSummary(item).paidTotal, 0);
  const totalRemaining = items.reduce((sum, item) => sum + getItemFinancialSummary(item).remaining, 0);
  const hasPeriod = period.startDate && period.endDate;
  const totalCommitted = items.reduce((sum, item) => {
    if (item.isGift || item.status === "Cancelado") return sum;
    const installmentCommitment = item.installments
      .filter((installment) => installment.status !== "Cancelado" && installment.status !== "Pago" && (!hasPeriod || isWithinPeriod(installment.dueDate, period.startDate!, period.endDate!)))
      .reduce((total, installment) => total + installment.amount, 0);
    const hasInstallments = item.installments.length > 0;
    const itemCommitment = !hasInstallments && !item.payments.length && (!hasPeriod || isWithinPeriod(item.paymentDate, period.startDate!, period.endDate!)) ? item.finalValue || item.contractedValue || item.estimatedValue : 0;
    const firstInstallmentDate = item.installments
      .map((installment) => installment.dueDate)
      .filter((date): date is Date => Boolean(date))
      .sort((left, right) => left.getTime() - right.getTime())[0] ?? null;
    const materialDate = item.dueDate ?? firstInstallmentDate ?? item.paymentDate;
    const materialsCommitment = item.materials.reduce((total, material) => {
      const value = material.estimatedValue || material.actualValue;
      return total + (value > 0 && (!hasPeriod || isWithinPeriod(material.dueDate ?? materialDate, period.startDate!, period.endDate!)) ? value : 0);
    }, 0);
    return sum + installmentCommitment + itemCommitment + materialsCommitment;
  }, 0);
  const giftsTotal = items.filter((item) => item.isGift).reduce((sum, item) => sum + item.estimatedValue, 0);
  const materialsTotal = items.reduce((sum, item) => sum + item.materials.reduce((total, material) => total + (material.actualValue || material.estimatedValue), 0), 0);
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
