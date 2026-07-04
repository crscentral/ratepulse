// Seed / mock data. Swap this module for a real data-fetching service
// once a licensed OTA rate-intelligence provider is connected —
// nothing in the pages needs to change, only these functions.

export const PROPERTIES = [
  { id: "dhavara", name: "Dhavara Boutique Hotel", location: "Jaipur, India", rooms: 42 },
  { id: "azure", name: "Azure Beach Resort", location: "Phuket, Thailand", rooms: 68 },
];

export const COMPETITORS_BY_PROPERTY = {
  dhavara: ["Haveli Regency", "The Pink Manor", "Rambagh Court", "Jaipur Palacio"],
  azure: ["Lagoon Vista Resort", "Andaman Breeze", "Patong Cove Hotel", "Siam Sands"],
};

export const OTAS = ["Booking.com", "Agoda", "Expedia", "Direct"];
export const ROOM_TYPES = ["Deluxe Room", "Premium Suite", "Heritage Villa"];

export function seedRateHistory(propertyId) {
  const days = 14;
  const base = propertyId === "dhavara" ? 4200 : 5600;
  const out = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const drift = Math.sin(i / 2.3) * 180 + (i > 8 ? 220 : 0);
    const yourRate = Math.round(base + drift);
    const compAvg = Math.round(base + drift * 0.6 + 150 + Math.sin(i / 1.7) * 120);
    out.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      yourRate,
      compAvg,
    });
  }
  return out;
}

export function seedComparisonTable(propertyId) {
  const competitors = COMPETITORS_BY_PROPERTY[propertyId];
  const rows = [];
  ROOM_TYPES.forEach((room, ri) => {
    OTAS.forEach((ota) => {
      const yourRate =
        3800 + ri * 900 + (ota === "Direct" ? -150 : ota === "Booking.com" ? 80 : ota === "Agoda" ? 40 : 60);
      rows.push({
        room,
        ota,
        yourRate,
        competitors: competitors.map((c, ci) => ({
          name: c,
          rate: yourRate + Math.round(Math.sin(ci + ri) * 300) - 100 + ci * 40,
        })),
      });
    });
  });
  return rows;
}

export function seedParityViolations(propertyId) {
  const competitors = COMPETITORS_BY_PROPERTY[propertyId];
  return [
    { channel: "Booking.com", room: "Deluxe Room", yourDirect: 3800, otaRate: 3520, diffPct: -7.4, severity: "high" },
    { channel: "Agoda", room: "Premium Suite", yourDirect: 4700, otaRate: 4560, diffPct: -3.0, severity: "medium" },
    { channel: "Expedia", room: "Heritage Villa", yourDirect: 5600, otaRate: 5600, diffPct: 0, severity: "ok" },
    { channel: "Booking.com", room: "Premium Suite", yourDirect: 4700, otaRate: 4390, diffPct: -6.6, severity: "high" },
  ].map((v, i) => ({ ...v, competitorNote: competitors[i % competitors.length] }));
}

export function seedHeatmap() {
  const weeks = 4;
  const days = 7;
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const r = Math.random();
      let status = "parity";
      if (r < 0.22) status = "below";
      else if (r > 0.8) status = "above";
      cells.push({ week: w, day: d, status });
    }
  }
  return cells;
}

export function seedRecommendations() {
  return [
    {
      title: "Raise Deluxe Room rate by 8%",
      rationale:
        "Competitor set trending up 12% over 7 days while your rate held flat. Demand signal: rising search volume for your dates.",
      impact: "+₹18,400 projected weekly RevPAR uplift",
      confidence: "High",
    },
    {
      title: "Match Booking.com rate to Direct channel",
      rationale:
        "Active parity violation detected — Booking.com is undercutting your direct rate by 7.4%, which risks rate-parity penalties and cannibalizes direct bookings.",
      impact: "Protects direct booking margin",
      confidence: "High",
    },
    {
      title: "Hold Heritage Villa pricing through next weekend",
      rationale: "Competitor set is at rough parity; no clear signal to move. Occupancy pace is on track against forecast.",
      impact: "Neutral — maintain position",
      confidence: "Medium",
    },
    {
      title: "Test a 5% discount on Premium Suite for shoulder dates",
      rationale:
        "Booking pace for the upcoming Tue–Thu window is 15% below the trailing 4-week average versus 2 nearby competitors already discounting.",
      impact: "Fill risk mitigation for low-demand midweek dates",
      confidence: "Medium",
    },
  ];
}

export function seedAlerts() {
  return [
    { id: 1, severity: "high", title: "Parity violation — Booking.com", detail: "Deluxe Room undercut by 7.4% vs. direct rate", time: "2h ago", read: false },
    { id: 2, severity: "medium", title: "Competitor price drop", detail: "Haveli Regency dropped Premium Suite rate by 9%", time: "5h ago", read: false },
    { id: 3, severity: "low", title: "Demand spike detected", detail: "Search volume +22% for next weekend's dates", time: "1d ago", read: true },
    { id: 4, severity: "high", title: "Parity violation — Booking.com", detail: "Premium Suite undercut by 6.6% vs. direct rate", time: "1d ago", read: true },
    { id: 5, severity: "low", title: "New competitor tracked", detail: "Jaipur Palacio added to competitor set", time: "3d ago", read: true },
  ];
}
