export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Sistema</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Configurações</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Personalização</h2>
          <p className="mt-3 text-sm text-slate-600">Preparado para receber autenticação e ajustes finos do casamento no futuro.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Banco de dados</h2>
          <p className="mt-3 text-sm text-slate-600">SQLite em desenvolvimento com Prisma, pronto para evoluir para um banco relacional adequado a produção.</p>
        </div>
      </div>
    </div>
  );
}
