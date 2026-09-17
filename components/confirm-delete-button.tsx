"use client";

import type { FormEvent } from "react";

export function ConfirmDeleteButton({
  action,
  itemName,
  label = "Excluir",
}: {
  action: (formData: FormData) => void | Promise<void>;
  itemName: string;
  label?: string;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const confirmed = window.confirm(`Deseja excluir ${itemName}?`);
    if (!confirmed) {
      event.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button type="submit" className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
        {label}
      </button>
    </form>
  );
}
