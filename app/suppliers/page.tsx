export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { createSupplier, deleteSupplier } from "@/lib/actions";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Parceiros</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Fornecedores</h1>
      </div>

      <form action={createSupplier} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Nome</span><input name="name" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Empresa</span><input name="company" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Serviço</span><input name="service" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Telefone</span><input name="phone" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">WhatsApp</span><input name="whatsapp" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">E-mail</span><input name="email" type="email" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" /></label>
        <label className="space-y-2 md:col-span-3"><span className="text-sm font-medium text-slate-700">Observações</span><textarea name="notes" rows={3} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" /></label>
        <button type="submit" className="rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white md:col-span-3">Adicionar fornecedor</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{supplier.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{supplier.company ?? supplier.service ?? "Fornecedor"}</p>
              </div>
              <ConfirmDeleteButton action={deleteSupplier.bind(null, supplier.id)} itemName={`o fornecedor “${supplier.name}”`} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{supplier.email ?? supplier.phone ?? "Contato não informado"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
