export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getMaterialsTotal, isInstallmentDueSoon, isInstallmentOverdue, money } from "@/lib/finance";
import { addMaterial, deleteMaterial, updateInstallmentStatus, updateMaterial } from "@/lib/actions";
import { InstallmentStatusBadge } from "@/components/ui";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

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
  const materialsTotal = getMaterialsTotal(item.materials);
  const totalValue = Math.max(item.finalValue || item.contractedValue || item.estimatedValue, materialsTotal);
  const remaining = Math.max(totalValue - totalPaid, 0);
  const materialsExcess = Math.max(materialsTotal - item.estimatedValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Detalhes</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{item.name}</h1>
        </div>
        <Link href="/items" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Voltar</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Status</p><p className="mt-2 text-xl font-semibold">{item.status}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Prioridade</p><p className="mt-2 text-xl font-semibold">{item.priority}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Valor total</p><p className="mt-2 text-xl font-semibold">{money(totalValue)}</p></div>
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
                <div key={installment.id} className="flex flex-col items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span>Parcela {installment.number}</span>
                  <form action={updateInstallmentStatus} className="flex flex-wrap items-center gap-2">
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
            {materialsExcess > 0 ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">Os materiais ultrapassaram o valor estimado do item.</p>
                <p className="mt-1">Materiais: {money(materialsTotal)} · Estimado: {money(item.estimatedValue)} · Excedente: {money(materialsExcess)}</p>
                <p className="mt-1 font-medium">O excedente já está incluído no valor total do item.</p>
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
              {item.materials.length ? item.materials.map((material) => {
                const materialExcess = Math.max(material.actualValue - material.estimatedValue, 0);

                return (
                  <div key={material.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2"><span className="break-words">{material.name}</span><strong>{money(material.actualValue || material.estimatedValue)}</strong></div>
                    <div className="mt-1 text-slate-500">{material.status}</div>
                    {materialExcess > 0 ? (
                      <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                        Este material ultrapassou a estimativa em {money(materialExcess)}. Estimado: {money(material.estimatedValue)} · Real: {money(material.actualValue)}.
                      </p>
                    ) : null}
                    <div className="mt-2 space-y-2">
                      <form action={updateMaterial} className="grid gap-2 sm:grid-cols-2">
                        <input type="hidden" name="id" value={material.id} />
                        <label className="grid gap-1 text-xs text-slate-500">Nome<input name="name" defaultValue={material.name} required className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                        <label className="grid gap-1 text-xs text-slate-500">Quantidade<input name="quantity" type="number" min="0.01" step="0.01" defaultValue={material.quantity} required className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                        <label className="grid gap-1 text-xs text-slate-500">Unidade<input name="unit" defaultValue={material.unit ?? ""} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                        <label className="grid gap-1 text-xs text-slate-500">Estimado<input name="estimatedValue" defaultValue={(material.estimatedValue / 100).toFixed(2).replace(".", ",")} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                        <label className="grid gap-1 text-xs text-slate-500">Real<input name="actualValue" defaultValue={(material.actualValue / 100).toFixed(2).replace(".", ",")} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                        <label className="grid gap-1 text-xs text-slate-500">Status<select name="status" defaultValue={material.status} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800">{['Não comprado', 'Pesquisando preço', 'Comprado', 'Cancelado'].map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                        <label className="grid gap-1 text-xs text-slate-500">Data limite<input name="dueDate" type="date" defaultValue={material.dueDate ? new Date(material.dueDate).toISOString().slice(0, 10) : ""} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                        <label className="grid gap-1 text-xs text-slate-500">Onde comprar<input name="whereToBuy" defaultValue={material.whereToBuy ?? ""} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                        <label className="grid gap-1 text-xs text-slate-500 sm:col-span-2">Observações<textarea name="notes" defaultValue={material.notes ?? ""} rows={2} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800" /></label>
                        <button type="submit" className="rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white">Salvar material</button>
                      </form>
                      <ConfirmDeleteButton action={deleteMaterial.bind(null, material.id)} itemName={`o material “${material.name}”`} />
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-slate-500">Nenhum material cadastrado.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
