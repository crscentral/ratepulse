import React, { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { Card, PageHeader } from "../components/ui";
import { COMPETITORS_BY_PROPERTY, ROOM_TYPES, seedComparisonTable } from "../lib/seedData";

export default function ComparisonPage({ propertyId, setPropertyId }) {
  const rows = useMemo(() => seedComparisonTable(propertyId), [propertyId]);
  const competitors = COMPETITORS_BY_PROPERTY[propertyId];
  const [roomFilter, setRoomFilter] = useState("All");
  const filtered = roomFilter === "All" ? rows : rows.filter((r) => r.room === roomFilter);

  return (
    <div>
      <PageHeader title="Rate Comparison" subtitle="Your rates vs. tracked competitors, by OTA channel and room type" propertyId={propertyId} setPropertyId={setPropertyId} />

      <div className="flex items-center gap-2 mb-4">
        <Filter size={14} className="text-gray-400" />
        {["All", ...ROOM_TYPES].map((r) => (
          <button
            key={r}
            onClick={() => setRoomFilter(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              roomFilter === r ? "bg-navy text-white border-navy" : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-100 bg-cream">
              <th className="px-4 py-3 font-medium text-gray-600">Room Type</th>
              <th className="px-4 py-3 font-medium text-gray-600">Channel</th>
              <th className="px-4 py-3 font-medium text-gray-600">Your Rate</th>
              {competitors.map((c) => (
                <th key={c} className="px-4 py-3 font-medium text-gray-600">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-700">{row.room}</td>
                <td className="px-4 py-3 text-gray-500">{row.ota}</td>
                <td className="px-4 py-3 font-semibold text-navy">₹{row.yourRate.toLocaleString()}</td>
                {row.competitors.map((c, ci) => {
                  const diff = c.rate - row.yourRate;
                  return (
                    <td key={ci} className="px-4 py-3">
                      <span className="text-gray-700">₹{c.rate.toLocaleString()}</span>
                      <span className={`ml-1.5 text-xs ${diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-500" : "text-gray-400"}`}>
                        {diff > 0 ? "▲" : diff < 0 ? "▼" : "–"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
