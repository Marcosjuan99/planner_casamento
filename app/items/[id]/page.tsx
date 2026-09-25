export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isInstallmentDueSoon, isInstallmentOverdue, money } from "@/lib/finance";
import { addMaterial, updateInstallmentStatus, updateItemEstimatedValue, updateMaterial } from "@/lib/actions";
import { InstallmentStatusBadge } from "@/components/ui";

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
  const materialsEstimatedTotal = item.materials.reduce((sum, material) => sum + material.estimatedValue, 0);
  const materialsExceedBudget = materialsEstimatedTotal > item.estimatedValue;

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
                  <span>{installment.number}</span>
                  <form action={updateInstallmentStatus}>
                    <input type="hidden" name="id" value={installment.id} />
                    <select name="status" defaultValue={installment.status} className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs" aria-label={`Status da parcela ${installment.number}`}>
                      {['Pendente', 'Pago', 'Atrasado', 'Cancelado'].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button type="submit" className="ml-2 rounded-xl bg-slate-900 px-2 py-1 text-xs font-medium text-white">Salvar</button>
                  </form>
                  <InstallmentStatusBadge status={installment.status} isOverdue={isInstallmentOverdue(installment.status, installment.dueDate)} isDueSoon={isInstallmentDueSoon(installment.status, installment.dueDate)} />
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
            {materialsExceedBudget ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">Os materiais ultrapassaram o valor estimado do item.</p>
                <p className="mt-1">Materiais: {money(materialsEstimatedTotal)} · Estimado: {money(item.estimatedValue)}</p>
                <form action={updateItemEstimatedValue} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  <label className="grid gap-1 text-xs font-medium text-red-800">Atualizar valor estimado<input name="estimatedValue" defaultValue={(materialsEstimatedTotal / 100).toFixed(2).replace(".", ",")} className="w-44 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-slate-800" /></label>
                  <button type="submit" className="rounded-xl bg-red-700 px-3 py-2 text-sm font-medium text-white">Atualizar valor</button>
                </form>
              </div>
            ) : null}
            <form action={addMaterial} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 p-3 sm:grid-cols-2">
              <input type="hidden" name="itemId" value={item.id} />
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">Nome</span>
                <input name="name" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Quantidade</span>
                <input name="quantity" type="number" min="0.01" step="0.01" defaultValue="1" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Unidade</span>
                <input name="unit" placeholder="unidade, kg..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Valor estimado</span>
                <input name="estimatedValue" placeholder="R$ 0,00" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Valor real</span>
                <input name="actualValue" placeholder="R$ 0,00" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">Status</span>
                <select name="status" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  {['Não comprado', 'Pesquisando preço', 'Comprado', 'Cancelado'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <button type="submit" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white sm:col-span-2">Adicionar material</button>
            </form>
            <div className="mt-4 space-y-2">
              {item.materials.length ? item.materials.map((material) => (
                <div key={material.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3"><span>{material.name}</span><strong>{money(material.actualValue || material.estimatedValue)}</strong></div>
                  <div className="mt-1 text-slate-500">{material.status}</div>
                  <form action={updateMaterial} className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <input type="hidden" name="id" value={material.id} />
                    <label className="grid gap-1 text-xs text-slate-500">Estimado<input name="estimatedValue" defaultValue={(material.estimatedValue / 100).toFixed(2).replace(".", ",")} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                    <label className="grid gap-1 text-xs text-slate-500">Real<input name="actualValue" defaultValue={(material.actualValue / 100).toFixed(2).replace(".", ",")} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                    <button type="submit" className="rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white">Atualizar</button>
                  </form>
                </div>
              )) : <p className="text-sm text-slate-500">Nenhum material cadastrado.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
