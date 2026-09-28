export const dynamic = "force-dynamic";

import Link from "next/link";
import { deleteItem, markItemCompleted, reopenItem } from "@/lib/actions";
import { getDashboardData } from "@/lib/queries";
import { StatusBadge, PriorityBadge } from "@/components/ui";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { getItemBudgetTotal, money } from "@/lib/finance";

export default async function ItemsPage() {
  const { items } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Gestão</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Itens do casamento</h1>
        </div>
        <Link href="/items/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">+ Novo item</Link>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Prioridade</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
              <th className="px-4 py-3 font-medium text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/items/${item.id}`} className="font-medium text-slate-800 hover:text-rose-700">{item.name}</Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={item.priority} /></td>
                <td className="px-4 py-3">{money(getItemBudgetTotal(item))}</td>
                <td className="px-4 py-3 text-slate-600">{item.responsibleConnections[0]?.responsible.name ?? "Sem responsável"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="inline-flex items-center justify-end gap-2">
                    {item.status === "Concluído" ? (
                      <form action={reopenItem.bind(null, item.id)}>
                        <button type="submit" className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">Reabrir</button>
                      </form>
                    ) : (
                      <form action={markItemCompleted.bind(null, item.id)}>
                        <button type="submit" className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Concluir</button>
                      </form>
                    )}
                    <Link href={`/items/${item.id}/edit`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Editar</Link>
                    <ConfirmDeleteButton action={deleteItem.bind(null, item.id)} itemName={`o item “${item.name}”`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
