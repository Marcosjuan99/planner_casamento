export const dynamic = "force-dynamic";

import { addInstallment, addPayment } from "@/lib/actions";
import { money } from "@/lib/finance";
import { getDashboardData } from "@/lib/queries";

export default async function PaymentsPage() {
  const { items } = await getDashboardData();

  const payments = items.flatMap((item) =>
    item.payments.map((payment) => ({
      ...payment,
      itemName: item.name,
    })),
  );

  const installments = items.flatMap((item) =>
    item.installments.map((installment) => ({
      ...installment,
      itemName: item.name,
    })),
  );

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
          <h2 className="text-xl font-semibold text-slate-900">Adicionar parcela</h2>

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
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select name="status" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
                {['Pendente', 'Pago', 'Atrasado', 'Cancelado'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Vencimento</span>
            <input type="date" name="dueDate" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
          </label>

          <button type="submit" className="rounded-full bg-slate-900 px-4 py-2.5 font-medium text-white">Salvar parcela</button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Parcelas</h2>
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
              {installments.map((installment) => (
                <tr key={installment.id}>
                  <td className="px-4 py-3 text-slate-800">{installment.itemName}</td>
                  <td className="px-4 py-3">{installment.number}</td>
                  <td className="px-4 py-3">{installment.dueDate ? new Date(installment.dueDate).toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="px-4 py-3">{money(installment.amount)}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{installment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Pagamentos avulsos</h2>
        <div className="mt-4 space-y-3">
          {payments.length ? payments.map((payment) => (
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
          )) : <p className="text-sm text-slate-500">Nenhum pagamento avulso registrado.</p>}
        </div>
      </div>
    </div>
  );
}
