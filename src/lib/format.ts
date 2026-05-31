export function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("sangat tinggi")) return "text-status-high bg-status-high/10";
  if (s.includes("tinggi")) return "text-status-high bg-status-high/10";
  if (s.includes("waspada")) return "text-status-mid bg-status-mid/10";
  return "text-status-low bg-status-low/10";
}

export function statusFromPrevalence(p: number): string {
  if (p >= 30) return "Sangat Tinggi";
  if (p >= 20) return "Tinggi";
  if (p >= 15) return "Waspada";
  return "Terkendali";
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}
