export const dynamic = "force-dynamic";

import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { getDashboardData } from "@/lib/queries";

type CalendarDisplayEvent = {
  id: string;
  name: string;
  type: "Prazo" | "Pagamento" | "Evento" | "Casamento";
  notes: string | null;
  href: string | null;
};

const weekdays = [
  { short: "Seg", full: "Segunda-feira" },
  { short: "Ter", full: "Terça-feira" },
  { short: "Qua", full: "Quarta-feira" },
  { short: "Qui", full: "Quinta-feira" },
  { short: "Sex", full: "Sexta-feira" },
  { short: "Sáb", full: "Sábado" },
  { short: "Dom", full: "Domingo" },
];

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function monthKey(year: number, month: number) {
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const [{ items }, params, weddingSettings, calendarEvents] = await Promise.all([
    getDashboardData(),
    searchParams,
    prisma.weddingSettings.findUnique({ where: { id: "main" } }),
    prisma.calendarEvent.findMany({ orderBy: { date: "asc" } }),
  ]);
  const now = new Date();
  const monthMatch = params.month?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  const year = monthMatch ? Number(monthMatch[1]) : now.getFullYear();
  const month = monthMatch ? Number(monthMatch[2]) - 1 : now.getMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const leadingDays = (firstDay.getUTCDay() + 6) % 7;
  const calendarDays = Array.from(
    { length: Math.ceil((leadingDays + lastDay.getUTCDate()) / 7) * 7 },
    (_, index) => new Date(Date.UTC(year, month, 1 - leadingDays + index)),
  );
  const eventsByDate = new Map<string, CalendarDisplayEvent[]>();

  function addEvent(date: Date, event: CalendarDisplayEvent) {
    const key = dateKey(date);
    const events = eventsByDate.get(key) ?? [];
    events.push(event);
    eventsByDate.set(key, events);
  }

  for (const item of items) {
    if (item.dueDate) addEvent(item.dueDate, { id: item.id, name: item.name, type: "Prazo", notes: null, href: `/items/${item.id}` });
    if (item.paymentDate) addEvent(item.paymentDate, { id: item.id, name: item.name, type: "Pagamento", notes: null, href: `/items/${item.id}` });
  }
  for (const event of calendarEvents) {
    addEvent(event.date, { id: event.id, name: event.title, type: "Evento", notes: event.notes, href: null });
  }
  if (weddingSettings?.weddingDate) {
    addEvent(weddingSettings.weddingDate, { id: "wedding-date", name: "Casamento", type: "Casamento", notes: null, href: null });
  }

  const previousMonthKey = monthKey(year, month - 1);
  const nextMonthKey = monthKey(year, month + 1);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(firstDay);
  const today = new Date();
  const todayKey = dateKey(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
  const defaultEventDate = today.getFullYear() === year && today.getMonth() === month ? todayKey : `${monthKey(year, month)}-01`;
  const undatedItems = items.filter((item) => !item.dueDate && !item.paymentDate);
  const monthEvents = calendarEvents.filter((event) => event.date.getUTCFullYear() === year && event.date.getUTCMonth() === month);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-rose-500">Planejamento</p>
          <h1 className="mt-2 text-3xl font-semibold capitalize text-slate-900">Calendário</h1>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 sm:justify-start">
          <Link href={`/calendar?month=${previousMonthKey}`} aria-label="Mês anterior" title="Mês anterior" className="inline-flex size-10 items-center justify-center rounded-xl text-xl text-slate-700 hover:bg-slate-100">‹</Link>
          <h2 className="min-w-36 text-center text-base font-semibold capitalize text-slate-900">{monthLabel}</h2>
          <Link href={`/calendar?month=${nextMonthKey}`} aria-label="Próximo mês" title="Próximo mês" className="inline-flex size-10 items-center justify-center rounded-xl text-xl text-slate-700 hover:bg-slate-100">›</Link>
          <Link href={`/calendar?month=${monthKey(now.getFullYear(), now.getMonth())}`} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">Hoje</Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600" aria-label="Legenda do calendário">
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-rose-500" />Prazo do item</span>
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-sky-500" />Pagamento previsto</span>
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-500" />Evento</span>
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-amber-500" />Casamento</span>
      </div>

      <form action={createCalendarEvent} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        <label className="grid min-w-0 gap-1 text-xs font-medium text-slate-600">
          Evento
          <input name="title" required maxLength={100} placeholder="Prova do vestido" className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800" />
        </label>
        <label className="grid min-w-0 gap-1 text-xs font-medium text-slate-600">
          Data
          <input name="date" type="date" required defaultValue={defaultEventDate} className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800" />
        </label>
        <label className="grid min-w-0 gap-1 text-xs font-medium text-slate-600 sm:col-span-2 xl:col-span-1">
          Observações
          <input name="notes" maxLength={500} placeholder="Horário, local ou detalhes" className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800" />
        </label>
        <button type="submit" className="self-end rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Adicionar ao calendário</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekdays.map((weekday) => (
            <div key={weekday.full} aria-label={weekday.full} className="px-1 py-2 text-center text-[10px] font-semibold uppercase text-slate-500 sm:px-2 sm:py-3 sm:text-xs">
              <span className="sm:hidden">{weekday.short}</span>
              <span className="hidden sm:inline">{weekday.full}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((date) => {
            const key = dateKey(date);
            const isCurrentMonth = date.getUTCMonth() === month;
            const isToday = key === todayKey;
            const events = eventsByDate.get(key) ?? [];
            const hasEvents = events.length > 0;

            return (
              <div key={key} className={`min-h-24 min-w-0 border-b border-r border-slate-100 p-1 sm:min-h-32 sm:p-2 ${hasEvents ? "bg-amber-50 ring-1 ring-inset ring-amber-200" : isCurrentMonth ? "bg-white" : "bg-slate-50/70"}`}>
                <time dateTime={key} className={`inline-flex size-6 items-center justify-center rounded-full text-[11px] font-medium sm:size-7 sm:text-xs ${isToday && hasEvents ? "bg-amber-500 text-white" : isToday ? "bg-slate-900 text-white" : hasEvents ? "bg-amber-100 text-amber-900" : isCurrentMonth ? "text-slate-700" : "text-slate-400"}`}>
                  {date.getUTCDate()}
                </time>
                <div className="mt-1 space-y-1">
                  {events.map((event, index) => {
                    const eventStyle = event.type === "Prazo"
                      ? "bg-rose-50 text-rose-800 hover:bg-rose-100"
                      : event.type === "Pagamento"
                        ? "bg-sky-50 text-sky-800 hover:bg-sky-100"
                        : event.type === "Evento"
                          ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                          : "bg-amber-200 text-amber-950";
                    const shortType = event.type === "Prazo" ? "Pr" : event.type === "Pagamento" ? "Pg" : event.type === "Evento" ? "Ev" : "Cas";
                    const eventContent = (
                      <>
                        <span className="hidden shrink-0 sm:inline">{event.type}:</span>
                        <span className="shrink-0 sm:hidden">{shortType}</span>
                        <span className="min-w-0 truncate">{event.name}</span>
                        {event.notes ? <span className="hidden truncate font-normal sm:block">{event.notes}</span> : null}
                      </>
                    );
                    const eventClassName = `flex min-w-0 items-center gap-1 overflow-hidden rounded-md px-1 py-1 text-[9px] font-medium leading-tight sm:gap-1.5 sm:px-1.5 sm:text-xs ${eventStyle}`;

                    return event.href ? (
                      <Link key={`${event.id}-${event.type}-${index}`} href={event.href} title={`${event.type}: ${event.name}`} className={eventClassName}>
                        {eventContent}
                      </Link>
                    ) : (
                      <div key={`${event.id}-${event.type}-${index}`} title={`${event.type}: ${event.name}${event.notes ? ` - ${event.notes}` : ""}`} className={eventClassName}>
                        {eventContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {monthEvents.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Eventos cadastrados neste mês</h2>
            <span className="text-sm text-slate-500">{monthEvents.length}</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {monthEvents.map((event) => (
              <li key={event.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{event.title} <span className="font-normal text-slate-500">· {event.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span></p>
                  {event.notes ? <p className="mt-1 break-words text-sm text-slate-600">{event.notes}</p> : null}
                </div>
                <ConfirmDeleteButton action={deleteCalendarEvent.bind(null, event.id)} itemName={`o evento “${event.title}”`} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {undatedItems.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Itens sem data</h2>
            <span className="text-sm text-slate-500">{undatedItems.length}</span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {undatedItems.map((item) => (
              <li key={item.id}>
                <Link href={`/items/${item.id}`} className="inline-flex max-w-full rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">{item.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}