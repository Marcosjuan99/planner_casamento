export const dynamic = "force-dynamic";

import Link from "next/link";
import { addInstallment, addPayment, deleteInstallment, updateInstallment } from "@/lib/actions";
import { isInstallmentDueSoon, isInstallmentOverdue, money } from "@/lib/finance";
import { getDashboardData } from "@/lib/queries";
import { InstallmentStatusBadge, StatusBadge } from "@/components/ui";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ supplierId?: string; status?: string }> }) {
  const { supplierId, status } = await searchParams;
  const { items, suppliers } = await getDashboardData();
  const selectedSupplierId = supplierId ?? "";
  const selectedStatus = ["Pendente", "Pago", "Atrasado", "Cancelado"].includes(status ?? "") ? status : "";
  const filteredItems = selectedSupplierId ? items.filter((item) => item.supplierId === selectedSupplierId) : items;

  const payments = filteredItems.flatMap((item) =>
    item.payments.map((payment) => ({
      ...payment,
      itemName: item.name,
    })),
  );

  const installments = filteredItems.flatMap((item) =>
    item.installments.map((installment) => ({
      ...installment,
      itemName: item.name,
    })),
  );
  const visibleInstallments = selectedStatus ? installments.filter((installment) => installment.status === selectedStatus) : installments;
  const paidInstallments = installments.filter((installment) => installment.status === "Pago");

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0) + installments.filter((installment) => installment.status === "Pago").reduce((sum, installment) => sum + installment.amount, 0);
  const totalPending = installments.filter((installment) => installment.status !== "Pago" && installment.status !== "Cancelado").reduce((sum, installment) => sum + installment.amount, 0);
  const nextDue = installments.filter((installment) => installment.status !== "Pago" && installment.status !== "Cancelado").sort((a, b) => Number(new Date(a.dueDate ?? 0)) - Number(new Date(b.dueDate ?? 0)))[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Financeiro</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Pagamentos</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total pago</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{money(totalPaid)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pendentes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{money(totalPending)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Próximo vencimento</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{nextDue ? new Date(nextDue.dueDate ?? new Date()).toLocaleDateString("pt-BR") : "Sem parcelas"}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pagamentos avulsos</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{payments.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form action={addPayment} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Registrar pagamento avulso</h2>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Item</span>
            <select name="itemId" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Valor</span>
              <input name="amount" placeholder="R$ 0,00" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Data</span>
              <input type="date" name="date" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Descrição</span>
            <textarea name="description" rows={3} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
          </label>

          <button type="submit" className="rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white">Salvar pagamento</button>
        </form>

        <form action={addInstallment} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Adicionar parcelas</h2>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Item</span>
            <select name="itemId" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Valor</span>
              <input name="amount" placeholder="R$ 0,00" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Quantidade</span>
              <input name="count" type="number" min="1" max="60" defaultValue="1" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select name="status" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
                {['Pendente', 'Pago', 'Atrasado', 'Cancelado'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Primeiro vencimento</span>
            <input type="date" name="dueDate" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
          </label>

          <button type="submit" className="rounded-full bg-slate-900 px-4 py-2.5 font-medium text-white">Salvar parcela</button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Parcelas</h2>
          <div className="flex flex-wrap gap-2" aria-label="Filtrar parcelas por status">
            <Link href={selectedSupplierId ? `/payments?supplierId=${selectedSupplierId}` : "/payments"} className={!selectedStatus ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white" : "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"}>Todas</Link>
            {['Pendente', 'Pago', 'Atrasado', 'Cancelado'].map((filterStatus) => (
              <Link key={filterStatus} href={`/payments?${selectedSupplierId ? `supplierId=${selectedSupplierId}&` : ""}status=${encodeURIComponent(filterStatus)}`} className={selectedStatus === filterStatus ? "rounded-full ring-2 ring-slate-900 ring-offset-1" : ""}>
                <StatusBadge status={filterStatus} />
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Parcela</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleInstallments.map((installment) => (
                <tr key={installment.id}>
                  <td className="px-4 py-3 text-slate-800">{installment.itemName}</td>
                  <td className="px-4 py-3">{installment.number}</td>
                  <td className="px-4 py-3">
                      <input form={`installment-${installment.id}`} name="dueDate" type="date" defaultValue={installment.dueDate ? new Date(installment.dueDate).toISOString().slice(0, 10) : ""} className="rounded-xl border border-slate-200 px-2 py-1 text-xs" aria-label={`Vencimento da parcela ${installment.number}`} />
                  </td>
                  <td className="px-4 py-3">
                      <input form={`installment-${installment.id}`} name="amount" defaultValue={(installment.amount / 100).toFixed(2).replace(".", ",")} className="w-24 rounded-xl border border-slate-200 px-2 py-1 text-xs" aria-label={`Valor da parcela ${installment.number}`} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                    <form id={`installment-${installment.id}`} action={updateInstallment} className="inline-flex items-center gap-2">
                      <input type="hidden" name="id" value={installment.id} />
                      <select name="status" defaultValue={installment.status} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700" aria-label={`Status da parcela ${installment.number}`}>
                        {['Pendente', 'Pago', 'Atrasado', 'Cancelado'].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button type="submit" className="ml-2 rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white">Salvar</button>
                    </form>
                    <div className="flex items-center gap-2">
                      <InstallmentStatusBadge status={installment.status} isOverdue={isInstallmentOverdue(installment.status, installment.dueDate)} isDueSoon={isInstallmentDueSoon(installment.status, installment.dueDate)} />
                      <ConfirmDeleteButton action={deleteInstallment.bind(null, installment.id)} itemName={`a parcela ${installment.number} de “${installment.itemName}”`} />
                    </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Histórico de pagamentos</h2>
          <form method="get" className="flex items-center gap-2">
            <label htmlFor="supplier-filter" className="text-sm text-slate-600">Fornecedor</label>
            <select id="supplier-filter" name="supplierId" defaultValue={selectedSupplierId} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">Todos</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
            <button type="submit" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">Filtrar</button>
          </form>
        </div>
        <div className="mt-4 space-y-3">
          {payments.length || paidInstallments.length ? <>
            {payments.map((payment) => (
            <div key={payment.id} className="flex flex-col gap-2 rounded-2xl bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-slate-800">{payment.itemName}</p>
                <p className="text-sm text-slate-500">{payment.description ?? "Pagamento avulso"}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{money(payment.amount)}</p>
                <p className="text-xs text-slate-500">{new Date(payment.date).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
            ))}
            {paidInstallments.map((installment) => (
              <div key={installment.id} className="flex flex-col gap-2 rounded-2xl bg-emerald-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div><p className="font-medium text-emerald-900">{installment.itemName}</p><p className="text-sm text-emerald-700">Parcela {installment.number} paga</p></div>
                <div className="text-right"><p className="font-semibold text-emerald-900">{money(installment.amount)}</p><p className="text-xs text-emerald-700">{installment.paidDate ? new Date(installment.paidDate).toLocaleDateString("pt-BR") : "Pagamento registrado"}</p></div>
              </div>
            ))}
          </> : <p className="text-sm text-slate-500">Nenhum pagamento registrado.</p>}
        </div>
      </div>
    </div>
  );
}
