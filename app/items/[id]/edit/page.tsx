export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { updateItem } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { getDashboardData } from "@/lib/queries";

function dateInputValue(date: Date | null) {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

function moneyInputValue(value: number) {
  return (value / 100).toFixed(2).replace(".", ",");
}

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, referenceData] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: { responsibleConnections: true },
    }),
    getDashboardData(),
  ]);

  if (!item) notFound();

  const responsibleId = item.responsibleConnections[0]?.responsibleId ?? "";
  const { categories, responsibles, suppliers } = referenceData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Edição</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Editar item</h1>
        </div>
        <Link href="/items" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Voltar</Link>
      </div>

      <form action={updateItem} className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <input type="hidden" name="id" value={item.id} />

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Nome</span>
          <input name="name" defaultValue={item.name} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Categoria</span>
          <select name="categoryId" defaultValue={item.categoryId ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            <option value="">Sem categoria</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select name="status" defaultValue={item.status} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            {['Não iniciado', 'Planejando', 'Em andamento', 'Contratado', 'Parcialmente pago', 'Pago', 'Concluído', 'Cancelado'].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Prioridade</span>
          <select name="priority" defaultValue={item.priority} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            {['Baixa', 'Média', 'Alta', 'Urgente'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Responsável</span>
          <select name="responsibleId" defaultValue={responsibleId} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            <option value="">Sem responsável</option>
            {responsibles.map((responsible) => <option key={responsible.id} value={responsible.id}>{responsible.name}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Fornecedor</span>
          <select name="supplierId" defaultValue={item.supplierId ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            <option value="">Nenhum</option>
            {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Tipo de obtenção</span>
          <select name="acquisitionType" defaultValue={item.acquisitionType} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            {['Compra', 'Contratação', 'Presente', 'Produzido por familiar', 'Produzido pelo casal', 'Aluguel', 'Serviço', 'Outro'].map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Data limite</span>
          <input type="date" name="dueDate" defaultValue={dateInputValue(item.dueDate)} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Data provável de pagamento</span>
          <input type="date" name="paymentDate" defaultValue={dateInputValue(item.paymentDate)} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Descrição</span>
          <textarea name="description" defaultValue={item.description ?? ""} rows={3} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Valor estimado</span>
          <input name="estimatedValue" defaultValue={moneyInputValue(item.estimatedValue)} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Valor para o casal</span>
          <input name="amountForCouple" defaultValue={moneyInputValue(item.amountForCouple)} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Valor contratado</span>
          <input name="contractedValue" defaultValue={moneyInputValue(item.contractedValue)} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Valor final</span>
          <input name="finalValue" defaultValue={moneyInputValue(item.finalValue)} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Tags</span>
          <input name="tags" defaultValue={item.tags ?? ""} placeholder="Ex.: urgente, decoração" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Origem / tipo da fonte</span>
          <input name="sourceType" defaultValue={item.sourceType ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Observações</span>
          <textarea name="notes" defaultValue={item.notes ?? ""} rows={4} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700 md:col-span-2">
          <input type="checkbox" name="isGift" defaultChecked={item.isGift} className="h-4 w-4" />
          Esse item é um presente ou ajuda recebida
        </label>

        <button type="submit" className="rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white md:col-span-2">Salvar alterações</button>
      </form>
    </div>
  );
}
