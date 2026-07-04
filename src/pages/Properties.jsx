import React from "react";
import { Card, Badge, PageHeader } from "../components/ui";
import { PROPERTIES, COMPETITORS_BY_PROPERTY, OTAS } from "../lib/seedData";

export default function PropertiesPage({ propertyId, setPropertyId }) {
  return (
    <div>
      <PageHeader title="Properties" subtitle="Manage tracked properties and their competitor sets" propertyId={propertyId} setPropertyId={setPropertyId} />
      <div className="space-y-4">
        {PROPERTIES.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-navy">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.location} · {p.rooms} rooms</p>
              </div>
              <Badge tone="gold">OTAs: {OTAS.length - 1} channels</Badge>
            </div>
            <div className="text-xs text-gray-500 mb-1.5 font-medium">Competitor set</div>
            <div className="flex flex-wrap gap-2">
              {COMPETITORS_BY_PROPERTY[p.id].map((c) => (
                <span key={c} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">{c}</span>
              ))}
              <button className="px-2.5 py-1 border border-dashed border-gray-300 rounded-full text-xs text-gray-400 hover:border-gray-400">+ Add competitor</button>
            </div>
          </Card>
        ))}
        <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition">
          + Add new property
        </button>
      </div>
    </div>
  );
}
