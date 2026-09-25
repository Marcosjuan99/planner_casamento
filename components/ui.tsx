import type { ReactNode } from "react";

export function DashboardCard({ title, value, detail, tone = "violet" }: { title: string; value: string; detail: string; tone?: "violet" | "emerald" | "amber" | "sky" | "rose" }) {
  const tones = {
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-2xl px-2.5 py-1.5 text-xs font-semibold ring-1 ${tones[tone]}`}>
        {title}
      </div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{detail}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    "Não iniciado": "bg-slate-100 text-slate-700",
    Planejando: "bg-blue-100 text-blue-700",
    "Em andamento": "bg-violet-100 text-violet-700",
    Contratado: "bg-emerald-100 text-emerald-700",
    "Parcialmente pago": "bg-amber-100 text-amber-700",
    Pago: "bg-emerald-100 text-emerald-700",
    Concluído: "bg-rose-100 text-rose-700",
    Cancelado: "bg-red-100 text-red-700",
    Pendente: "bg-amber-100 text-amber-800",
    Atrasado: "bg-red-100 text-red-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${palette[status] ?? "bg-slate-100 text-slate-700"}`}>{status}</span>;
}

export function InstallmentStatusBadge({ status, isOverdue, isDueSoon }: { status: string; isOverdue: boolean; isDueSoon: boolean }) {
  const label = isOverdue ? "Atrasada" : status === "Pago" ? "Paga" : isDueSoon ? "Vence em breve" : status;
  const className = isOverdue || status === "Atrasado" ? "bg-red-100 text-red-700" : status === "Pago" ? "bg-emerald-100 text-emerald-700" : isDueSoon ? "animate-pulse bg-amber-100 text-amber-800" : "bg-amber-50 text-amber-700";

  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}><span className="sr-only">Status: </span>{label}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const palette: Record<string, string> = {
    Baixa: "bg-slate-100 text-slate-700",
    Média: "bg-amber-100 text-amber-700",
    Alta: "bg-orange-100 text-orange-700",
    Urgente: "bg-red-100 text-red-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${palette[priority] ?? "bg-slate-100 text-slate-700"}`}>{priority}</span>;
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  );
}
