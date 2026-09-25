export const dynamic = "force-dynamic";

import { getDashboardData } from "@/lib/queries";
import { money } from "@/lib/finance";

export default async function ReportsPage() {
  const { items, categories } = await getDashboardData();
  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedValue, 0);
  const totalContracted = items.reduce((sum, item) => sum + item.contractedValue, 0);
  const totalPaid = items.reduce((sum, item) => sum + item.payments.reduce((t, payment) => t + payment.amount, 0), 0);
  const totalInstallments = items.reduce((sum, item) => sum + item.installments.filter((installment) => installment.status === "Pago").reduce((t, installment) => t + installment.amount, 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Financeiro</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Relatórios</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total estimado</p><p className="mt-2 text-2xl font-semibold">{money(totalEstimated)}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total contratado</p><p className="mt-2 text-2xl font-semibold">{money(totalContracted)}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total pago</p><p className="mt-2 text-2xl font-semibold">{money(totalPaid + totalInstallments)}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total restante</p><p className="mt-2 text-2xl font-semibold">{money(Math.max(totalEstimated - (totalPaid + totalInstallments), 0))}</p></div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Por categoria</h2>
        <div className="mt-4 space-y-3">
          {categories.map((category) => {
            const categoryTotal = items.filter((item) => item.categoryId === category.id).reduce((sum, item) => sum + item.estimatedValue, 0);
            return (
              <div key={category.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                <span>{category.name}</span>
                <strong>{money(categoryTotal)}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
