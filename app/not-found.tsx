import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">Página não encontrada</h1>
      <p className="text-slate-500">A página que você acessou não existe ou foi removida.</p>
      <Link href="/dashboard" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Voltar ao dashboard</Link>
    </div>
  );
}
