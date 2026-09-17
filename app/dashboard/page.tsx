export const dynamic = "force-dynamic";

import Link from "next/link";
import { getDashboardData } from "@/lib/queries";
import { DashboardCard, StatusBadge, PriorityBadge } from "@/components/ui";
import { getDashboardStats, money } from "@/lib/finance";

export default async function DashboardPage() {
  const { items } = await getDashboardData();
  const stats = getDashboardStats(items);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Visão geral</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dashboard do Casamento</h1>
        </div>
        <Link href="/items/new" className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm">+ Novo item</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Orçamento total" value={money(stats.totalEstimated)} detail="Estimada para o casamento" tone="violet" />
        <DashboardCard title="Valor já gasto" value={money(stats.totalPaid)} detail="Pagamentos + parcelas" tone="emerald" />
        <DashboardCard title="Valor comprometido" value={money(stats.totalCommitted)} detail="Compromissos futuros" tone="amber" />
        <DashboardCard title="Valor restante" value={money(stats.totalRemaining)} detail="Saldo para pagar" tone="sky" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Presentes" value={money(stats.giftsTotal)} detail="Itens recebidos como presente" tone="rose" />
        <DashboardCard title="Materiais" value={money(stats.materialsTotal)} detail="Estimativa de materiais" tone="sky" />
        <DashboardCard title="Itens concluídos" value={String(stats.completed)} detail="Finalizados" tone="emerald" />
        <DashboardCard title="Itens urgentes" value={String(stats.urgent)} detail="Alta prioridade" tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Itens em destaque</h2>
          <div className="space-y-4">
            {items.slice(0, 6).map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{item.name}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.description ?? "Sem descrição"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  <span className="text-sm font-medium text-slate-700">{money(item.estimatedValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Resumo</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Itens pendentes</span><strong>{stats.pending}</strong></div>
              <div className="flex justify-between"><span>Atrasados</span><strong>{stats.overdue}</strong></div>
              <div className="flex justify-between"><span>Urgentes</span><strong>{stats.urgent}</strong></div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Ações rápidas</h3>
            <div className="mt-4 grid gap-2">
              <Link href="/items" className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">Ver todos os itens</Link>
              <Link href="/categories" className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Gerenciar categorias</Link>
              <Link href="/reports" className="rounded-2xl bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700">Relatórios financeiros</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
