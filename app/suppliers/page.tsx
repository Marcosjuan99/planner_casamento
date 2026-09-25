export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { createSupplier, deleteSupplier, updateSupplier } from "@/lib/actions";
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
            <form action={updateSupplier} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={supplier.id} />
              <input name="name" defaultValue={supplier.name} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required aria-label="Nome do fornecedor" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="company" defaultValue={supplier.company ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="Empresa" aria-label="Empresa" />
                <input name="service" defaultValue={supplier.service ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="Serviço" aria-label="Serviço" />
                <input name="phone" defaultValue={supplier.phone ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="Telefone" aria-label="Telefone" />
                <input name="whatsapp" defaultValue={supplier.whatsapp ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="WhatsApp" aria-label="WhatsApp" />
                <input name="email" type="email" defaultValue={supplier.email ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="E-mail" aria-label="E-mail" />
                <input name="instagram" defaultValue={supplier.instagram ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="Instagram" aria-label="Instagram" />
                <input name="link" defaultValue={supplier.link ?? ""} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 sm:col-span-2" placeholder="Link" aria-label="Link" />
              </div>
              <textarea name="notes" defaultValue={supplier.notes ?? ""} rows={2} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="Observações" aria-label="Observações" />
              <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Salvar alterações</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
