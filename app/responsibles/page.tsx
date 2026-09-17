export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { createResponsible, deleteResponsible } from "@/lib/actions";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

export default async function ResponsiblesPage() {
  const responsibles = await prisma.responsible.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Pessoas</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Responsáveis</h1>
      </div>

      <form action={createResponsible} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Nome</span>
          <input name="name" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Tipo</span>
          <input name="type" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="Família" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Descrição</span>
          <input name="description" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>
        <button type="submit" className="rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white md:col-span-3">Adicionar responsável</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {responsibles.map((responsible) => (
          <div key={responsible.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{responsible.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{responsible.type}</p>
              </div>
              <ConfirmDeleteButton action={deleteResponsible.bind(null, responsible.id)} itemName={`o responsável “${responsible.name}”`} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{responsible.description ?? "Sem descrição"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
