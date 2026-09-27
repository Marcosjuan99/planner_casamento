"use client";

import { useState } from "react";

type MaterialInput = {
  id: string;
  name: string;
  estimatedValue: number;
  actualValue: number;
};

type MaterialRow = MaterialInput & { key: string };

function moneyInputValue(value: number) {
  return (value / 100).toFixed(2).replace(".", ",");
}

export function MaterialFields({ initialMaterials = [] }: { initialMaterials?: MaterialInput[] }) {
  const [hasMaterials, setHasMaterials] = useState(initialMaterials.length > 0);
  const [materials, setMaterials] = useState<MaterialRow[]>(() => initialMaterials.length
    ? initialMaterials.map((material) => ({ ...material, key: material.id }))
    : [{ id: "", name: "", estimatedValue: 0, actualValue: 0, key: "new-material" }]);

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
            <div key={material.key} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]">
              <input type="hidden" name="materialId" value={material.id} />
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Material {index + 1}</span>
                <input name="materialName" defaultValue={material.name} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" required={hasMaterials} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Valor estimado</span>
                <input name="materialEstimatedValue" defaultValue={moneyInputValue(material.estimatedValue)} placeholder="R$ 0,00" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" required={hasMaterials} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Valor real</span>
                <input name="materialActualValue" defaultValue={moneyInputValue(material.actualValue)} placeholder="R$ 0,00" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
              </label>
              {materials.length > 1 ? <button type="button" onClick={() => setMaterials((current) => current.filter((row) => row.key !== material.key))} className="self-end rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600">Remover</button> : <span />}
            </div>
          ))}
          <button type="button" onClick={() => setMaterials((current) => [...current, { id: "", name: "", estimatedValue: 0, actualValue: 0, key: crypto.randomUUID() }])} className="rounded-xl border border-amber-300 px-3 py-2 text-sm font-medium text-amber-800">+ Adicionar outro material</button>
        </div>
      ) : null}
    </div>
  );
}
