// Seed / mock data. Swap the "live" functions in liveRates.js for real
// data once a rate-intelligence API key is connected — pages don't need
// to change, only the data source.
//
// All generator functions below now take a `competitors` array as a
// parameter (fetched live from the `competitors` table via useCompetitors)
// instead of a hardcoded per-property lookup — so they work identically
// for Dhavara/Azure and for any property you add yourself.

export const PROPERTIES = [
  { id: "dhavara", name: "Dhavara Boutique Hotel", location: "Jaipur, India", rooms: 42, currency: "INR" },
  { id: "azure", name: "Azure Beach Resort", location: "Phuket, Thailand", rooms: 68, currency: "THB" },
];

// Full channel list, in display order. "WEBSITE" = your direct rate.
export const OTAS = [
  "WEBSITE", "AGODA", "BOOKING.COM", "TRIP.COM", "EXPEDIA", "TRAVELOKA",
  "MAKEMYTRIP", "AIRBNB", "HRS", "TRIVAGO", "TRIPADVISOR", "LASTMINUTE",
  "SKYSCANNER", "BLUEPILLOW", "CLEARTRIP", "PRICELINE", "VIO.COM", "HUTCHGO", "KLOOK",
];

export const ROOM_TYPES = ["Deluxe Room", "Premium Suite", "Heritage Villa"];

// Deterministic pseudo-random so numbers don't jump around on every render
// (a real API feed would replace this entirely).
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Turns any property id into a stable "base rate" in a plausible hotel
// price range, so properties you add get consistent (if fictional) numbers
// instead of a hardcoded Dhavara/Azure-only check.
function baseRateFor(propertyId) {
  let hash = 0;
  for (let i = 0; i < propertyId.length; i++) {
    hash = (hash * 31 + propertyId.charCodeAt(i)) % 100000;
  }
  return 3500 + (hash % 3000); // ~3500–6500
}

export function seedRateHistory(propertyId) {
  const days = 14;
  const base = baseRateFor(propertyId);
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

export function seedComparisonTable(propertyId, competitors = []) {
  const base = baseRateFor(propertyId);
  const rows = [];
  ROOM_TYPES.forEach((room, ri) => {
    OTAS.forEach((ota, oi) => {
      const yourRate = base - 400 + ri * 900 + Math.round(seededRandom(ri * 97 + oi * 13) * 300 - 100);
      rows.push({
        room,
        ota,
        yourRate,
        competitors: competitors.map((c, ci) => ({
          name: c,
          rate: yourRate + Math.round(seededRandom(ri * 31 + oi * 7 + ci * 3) * 500 - 200),
        })),
      });
    });
  });
  return rows;
}

export function seedParityViolations(propertyId, competitors = []) {
  const names = competitors.length ? competitors : ["Comparable property"];
  const base = baseRateFor(propertyId);
  return [
    { channel: "BOOKING.COM", room: "Deluxe Room", yourDirect: base - 400, otaRate: Math.round((base - 400) * 0.926), diffPct: -7.4, severity: "high" },
    { channel: "AGODA", room: "Premium Suite", yourDirect: base + 500, otaRate: Math.round((base + 500) * 0.97), diffPct: -3.0, severity: "medium" },
    { channel: "EXPEDIA", room: "Heritage Villa", yourDirect: base + 1400, otaRate: base + 1400, diffPct: 0, severity: "ok" },
    { channel: "BOOKING.COM", room: "Premium Suite", yourDirect: base + 500, otaRate: Math.round((base + 500) * 0.934), diffPct: -6.6, severity: "high" },
  ].map((v, i) => ({ ...v, competitorNote: names[i % names.length] }));
}

// Heatmap: hotel (yours + competitors) x OTA channel grid of index-100 rates
// (100 = at parity with your website rate; >100 = pricier; <100 = cheaper).
export function seedHeatmapGrid(propertyId, propertyName, competitors = []) {
  const hotels = [propertyName || "Your property", ...competitors];

  return hotels.map((name, hi) => ({
    name,
    isYours: hi === 0,
    cells: OTAS.map((ota, oi) => {
      const seed = hi * 53 + oi * 17 + propertyId.length;
      const index = Math.round(88 + seededRandom(seed) * 40); // ~88-128
      return { ota, index };
    }),
  }));
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
    { id: 2, severity: "medium", title: "Competitor price drop", detail: "A tracked competitor dropped Premium Suite rate by 9%", time: "5h ago", read: false },
    { id: 3, severity: "low", title: "Demand spike detected", detail: "Search volume +22% for next weekend's dates", time: "1d ago", read: true },
    { id: 4, severity: "high", title: "Parity violation — Booking.com", detail: "Premium Suite undercut by 6.6% vs. direct rate", time: "1d ago", read: true },
    { id: 5, severity: "low", title: "New competitor tracked", detail: "A new competitor was added to your tracked set", time: "3d ago", read: true },
  ];
}
