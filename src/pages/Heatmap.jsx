import React, { useMemo } from "react";
import { Card, PageHeader } from "../components/ui";
import { seedHeatmap } from "../lib/seedData";

export default function HeatmapPage({ propertyId, setPropertyId }) {
  const cells = useMemo(() => seedHeatmap(), [propertyId]);
  const colorFor = (status) => (status === "below" ? "#DC2626" : status === "above" ? "#16A34A" : "#C9A84C");
  const labelFor = (status) => (status === "below" ? "Below competitors" : status === "above" ? "Above competitors" : "At parity");
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div>
      <PageHeader title="Heatmap" subtitle="Daily rate position vs. competitor set, next 4 weeks" propertyId={propertyId} setPropertyId={setPropertyId} />
      <Card className="p-5">
        <div className="flex gap-4 mb-5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#DC2626" }} /> Below competitors</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#C9A84C" }} /> At parity</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#16A34A" }} /> Above competitors</div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayLabels.map((d) => (
            <div key={d} className="text-xs text-center text-gray-400 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((c, i) => (
            <div
              key={i}
              title={labelFor(c.status)}
              className="aspect-square rounded-md flex items-center justify-center text-[10px] text-white font-medium"
              style={{ background: colorFor(c.status), opacity: 0.9 }}
            >
              {c.week * 7 + c.day + 1}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
