import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/items", label: "Itens" },
  { href: "/categories", label: "Categorias" },
  { href: "/responsibles", label: "Responsáveis" },
  { href: "/suppliers", label: "Fornecedores" },
  { href: "/payments", label: "Pagamentos" },
  { href: "/reports", label: "Relatórios" },
  { href: "/calendar", label: "Calendário" },
  { href: "/settings", label: "Configurações" },
];

export function Sidebar() {
  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:w-64 md:flex-none md:rounded-3xl md:p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-lg text-rose-700">💍</div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Casamento</p>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Planner</h1>
        </div>
      </div>

      <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:mx-0 md:flex-col md:overflow-visible md:pb-0">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex shrink-0 items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 md:rounded-2xl dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-300"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
