export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { createCategory, deleteCategory } from "@/lib/actions";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Organização</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Categorias</h1>
      </div>

      <form action={createCategory} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <label className="space-y-2 md:col-span-1">
          <span className="text-sm font-medium text-slate-700">Nome</span>
          <input name="name" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" required />
        </label>
        <label className="space-y-2 md:col-span-1">
          <span className="text-sm font-medium text-slate-700">Ícone</span>
          <input name="icon" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" placeholder="📍" />
        </label>
        <label className="space-y-2 md:col-span-1">
          <span className="text-sm font-medium text-slate-700">Descrição</span>
          <input name="description" className="w-full rounded-2xl border border-slate-200 px-3 py-2.5" />
        </label>
        <button type="submit" className="rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white md:col-span-3">Adicionar categoria</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon ?? "📦"}</span>
                <h2 className="text-xl font-semibold text-slate-900">{category.name}</h2>
              </div>
              <ConfirmDeleteButton action={deleteCategory.bind(null, category.id)} itemName={`a categoria “${category.name}”`} />
            </div>
            <p className="text-sm text-slate-600">{category.description ?? "Sem descrição"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
