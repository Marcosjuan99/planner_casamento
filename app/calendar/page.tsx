export const dynamic = "force-dynamic";

import { getDashboardData } from "@/lib/queries";

export default async function CalendarPage() {
  const { items } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Planejamento</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Calendário</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
            <p className="mt-2 text-sm text-slate-500">Prazo: {item.dueDate ? new Date(item.dueDate).toLocaleDateString("pt-BR") : "Sem prazo"}</p>
            <p className="mt-1 text-sm text-slate-600">Status: {item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
