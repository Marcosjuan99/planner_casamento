"use client";

import { useState } from "react";

type MaterialRow = { id: number };

export function MaterialFields() {
  const [hasMaterials, setHasMaterials] = useState(false);
  const [materials, setMaterials] = useState<MaterialRow[]>([{ id: 0 }]);

  return (
    <div className="space-y-3 md:col-span-2">
      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          name="hasMaterials"
          value="on"
          checked={hasMaterials}
          onChange={(event) => setHasMaterials(event.target.checked)}
          className="h-4 w-4"
        />
        Irei gastar com materiais para este item
      </label>

      {hasMaterials ? (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          {materials.map((material, index) => (
            <div key={material.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_12rem_auto]">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Material {index + 1}</span>
                <input name="materialName" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" required={hasMaterials} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Valor estimado</span>
                <input name="materialEstimatedValue" placeholder="R$ 0,00" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" required={hasMaterials} />
              </label>
              {materials.length > 1 ? <button type="button" onClick={() => setMaterials((current) => current.filter((row) => row.id !== material.id))} className="self-end rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600">Remover</button> : <span />}
            </div>
          ))}
          <button type="button" onClick={() => setMaterials((current) => [...current, { id: Date.now() }])} className="rounded-xl border border-amber-300 px-3 py-2 text-sm font-medium text-amber-800">+ Adicionar outro material</button>
        </div>
      ) : null}
    </div>
  );
}
