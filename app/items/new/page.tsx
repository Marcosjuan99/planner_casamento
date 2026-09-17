export const dynamic = "force-dynamic";

import { createItem } from "@/lib/actions";
import { getDashboardData } from "@/lib/queries";

export default async function NewItemPage() {
  const { categories, responsibles, suppliers } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Cadastro</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Novo item do casamento</h1>
      </div>

      <form action={createItem} className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Nome</span>
          <input name="name" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Categoria</span>
          <select name="categoryId" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select name="status" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            {['Não iniciado', 'Planejando', 'Em andamento', 'Contratado', 'Parcialmente pago', 'Pago', 'Concluído', 'Cancelado'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Prioridade</span>
          <select name="priority" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            {['Baixa', 'Média', 'Alta', 'Urgente'].map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Responsável</span>
          <select name="responsibleId" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            <option value="">Sem responsável</option>
            {responsibles.map((responsible) => (
              <option key={responsible.id} value={responsible.id}>{responsible.name}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Fornecedor</span>
          <select name="supplierId" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            <option value="">Nenhum</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Tipo de obtenção</span>
          <select name="acquisitionType" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5">
            {['Compra', 'Contratação', 'Presente', 'Produzido por familiar', 'Produzido pelo casal', 'Aluguel', 'Serviço', 'Outro'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Data limite</span>
          <input type="date" name="dueDate" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Descrição</span>
          <textarea name="description" rows={3} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Valor estimado</span>
          <input name="estimatedValue" placeholder="R$ 0,00" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Valor para o casal</span>
          <input name="amountForCouple" placeholder="R$ 0,00" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Valor contratado</span>
          <input name="contractedValue" placeholder="R$ 0,00" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Valor final</span>
          <input name="finalValue" placeholder="R$ 0,00" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700 md:col-span-2">
          <input type="checkbox" name="isGift" className="h-4 w-4" />
          Esse item é um presente ou ajuda recebida
        </label>

        <button type="submit" className="rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white md:col-span-2">Salvar item</button>
      </form>
    </div>
  );
}
