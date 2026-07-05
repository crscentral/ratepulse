import React, { useMemo, useState } from "react";
import { Filter, RefreshCw } from "lucide-react";
import { Card, PageHeader } from "../components/ui";
import { ROOM_TYPES, seedComparisonTable } from "../lib/seedData";
import { useCurrency } from "../components/CurrencyContext";
import { formatCurrency } from "../lib/currency";
import { useLiveRates } from "../lib/liveRates";
import { useCompetitors } from "../lib/useCompetitors";
import { useProperties } from "../components/PropertiesContext";

export default function ComparisonPage({ propertyId, setPropertyId }) {
  const { currency } = useCurrency();
  const { allProperties } = useProperties();
  const { competitors, loading } = useCompetitors(propertyId);
  const property = allProperties.find((p) => p.id === propertyId);
  const rows = useMemo(() => seedComparisonTable(propertyId, competitors), [propertyId, competitors]);
  const [roomFilter, setRoomFilter] = useState("All");

  const { live, loading: refreshing, refresh } = useLiveRates({
    propertyId,
    hotelName: property?.name,
    city: property?.location,
    fallback: rows,
  });

  if (loading) return null;

  const filtered = roomFilter === "All" ? rows : rows.filter((r) => r.room === roomFilter);

  return (
    <div>
      <PageHeader title="Rate Comparison" subtitle="Your rates vs. tracked competitors, by OTA channel and room type" propertyId={propertyId} setPropertyId={setPropertyId} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{live ? "Showing live rates" : "Sample data"}</span>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-300 disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh rates"}
          </button>
        </div>
      </div>

      <Card className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-100 bg-cream">
              <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Room Type</th>
              <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Channel</th>
              <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Your Rate</th>
              {competitors.map((c) => (
                <th key={c} className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.room}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.ota}</td>
                <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">{formatCurrency(row.yourRate, currency)}</td>
                {row.competitors.map((c, ci) => {
                  const diff = c.rate - row.yourRate;
                  return (
                    <td key={ci} className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-700">{formatCurrency(c.rate, currency)}</span>
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
