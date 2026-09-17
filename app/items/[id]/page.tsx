export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { money } from "@/lib/finance";

export default async function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      category: true,
      payments: true,
      installments: true,
      materials: true,
      tasks: true,
      responsibleConnections: { include: { responsible: true } },
      supplier: true,
    },
  });

  if (!item) notFound();

  const totalPaid = item.payments.reduce((sum, payment) => sum + payment.amount, 0) + item.installments.filter((installment) => installment.status === "Pago").reduce((sum, installment) => sum + installment.amount, 0);
  const remaining = Math.max((item.finalValue || item.contractedValue || item.estimatedValue) - totalPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Detalhes</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{item.name}</h1>
        </div>
        <Link href="/items" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Voltar</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Status</p><p className="mt-2 text-xl font-semibold">{item.status}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Prioridade</p><p className="mt-2 text-xl font-semibold">{item.priority}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Valor total</p><p className="mt-2 text-xl font-semibold">{money(item.finalValue || item.contractedValue || item.estimatedValue)}</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Resumo financeiro</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Valor estimado</span><strong>{money(item.estimatedValue)}</strong></div>
              <div className="flex justify-between"><span>Valor contratado</span><strong>{money(item.contractedValue)}</strong></div>
              <div className="flex justify-between"><span>Valor pago</span><strong>{money(totalPaid)}</strong></div>
              <div className="flex justify-between"><span>Restante</span><strong>{money(remaining)}</strong></div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Parcelas</h2>
            <div className="mt-4 space-y-2">
              {item.installments.length ? item.installments.map((installment) => (
                <div key={installment.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                  <span>{installment.number} — {installment.status}</span>
                  <strong>{money(installment.amount)}</strong>
                </div>
              )) : <p className="text-sm text-slate-500">Nenhuma parcela cadastrada.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Tarefas</h2>
            <div className="mt-4 space-y-2">
              {item.tasks.length ? item.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                  <span>{task.name}</span>
                  <strong>{task.status}</strong>
                </div>
              )) : <p className="text-sm text-slate-500">Nenhuma tarefa cadastrada.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Dados do item</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><strong>Categoria:</strong> {item.category?.name ?? "—"}</li>
              <li><strong>Responsável:</strong> {item.responsibleConnections[0]?.responsible.name ?? "—"}</li>
              <li><strong>Fornecedor:</strong> {item.supplier?.name ?? "—"}</li>
              <li><strong>Tipo:</strong> {item.acquisitionType}</li>
              <li><strong>Presente:</strong> {item.isGift ? "Sim" : "Não"}</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Materiais</h2>
            <div className="mt-4 space-y-2">
              {item.materials.length ? item.materials.map((material) => (
                <div key={material.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                  <div className="flex justify-between"><span>{material.name}</span><strong>{money(material.estimatedValue)}</strong></div>
                  <div className="mt-1 text-slate-500">{material.status}</div>
                </div>
              )) : <p className="text-sm text-slate-500">Nenhum material cadastrado.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
