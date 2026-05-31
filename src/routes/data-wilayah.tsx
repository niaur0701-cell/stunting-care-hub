import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber, statusColor } from "@/lib/format";

export const Route = createFileRoute("/data-wilayah")({
  head: () => ({
    meta: [
      { title: "Data Wilayah — Sehat Tumbuh" },
      {
        name: "description",
        content: "Tingkat prevalensi stunting per kabupaten/kota di seluruh Indonesia.",
      },
      { property: "og:title", content: "Data Wilayah Stunting — Sehat Tumbuh" },
      {
        property: "og:description",
        content: "Pantau prevalensi stunting per wilayah di Indonesia.",
      },
    ],
  }),
  component: DataWilayah,
});

function DataWilayah() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");

  const { data: regions, isLoading } = useQuery({
    queryKey: ["regions-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("regions")
        .select("*")
        .order("prevalence", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return (regions ?? []).filter((r) => {
      const matchesQ =
        !q ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.province.toLowerCase().includes(q.toLowerCase());
      const matchesStatus = statusFilter === "Semua" || r.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [regions, q, statusFilter]);

  const statuses = ["Semua", "Terkendali", "Waspada", "Tinggi", "Sangat Tinggi"];
  const avg =
    regions && regions.length
      ? (regions.reduce((a, r) => a + Number(r.prevalence), 0) / regions.length).toFixed(1)
      : "—";

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-12 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 mb-3">
          Pemantauan Wilayah
        </p>
        <h1 className="font-serif text-5xl md:text-6xl leading-none text-ink mb-4">
          Data Stunting per Wilayah Indonesia
        </h1>
        <p className="text-base text-ink/70 text-pretty">
          Tingkat prevalensi stunting berdasarkan data Survei Status Gizi Indonesia (SSGI) terbaru.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <SummaryCard label="Wilayah Dipantau" value={String(regions?.length ?? 0)} />
        <SummaryCard label="Rata-rata Prevalensi" value={`${avg}%`} />
        <SummaryCard
          label="Wilayah Sangat Tinggi"
          value={String((regions ?? []).filter((r) => r.status === "Sangat Tinggi").length)}
          accent
        />
        <SummaryCard
          label="Wilayah Terkendali"
          value={String((regions ?? []).filter((r) => r.status === "Terkendali").length)}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari wilayah atau provinsi..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-card ring-1 ring-border focus:ring-2 focus:ring-sky-dark outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                statusFilter === s
                  ? "bg-ink text-primary-foreground"
                  : "bg-card ring-1 ring-border hover:ring-ink/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card ring-1 ring-border rounded-3xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-ink/50 border-b border-border">
          <div className="col-span-5">Wilayah</div>
          <div className="col-span-3">Provinsi</div>
          <div className="col-span-2 text-right">Balita</div>
          <div className="col-span-2 text-right">Prevalensi</div>
        </div>
        {isLoading && <div className="p-10 text-center text-sm text-ink/50">Memuat data...</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-ink/50">Tidak ada wilayah yang cocok.</div>
        )}
        {filtered.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/60 last:border-0 hover:bg-sky-base/30 transition-colors items-center"
          >
            <div className="col-span-5">
              <p className="text-sm font-medium text-ink">{r.name}</p>
              <span
                className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${statusColor(
                  r.status
                )}`}
              >
                {r.status}
              </span>
            </div>
            <div className="col-span-3 text-sm text-ink/70">{r.province}</div>
            <div className="col-span-2 text-right text-sm text-ink/70 tabular-nums">
              {formatNumber(r.total_balita)}
            </div>
            <div className="col-span-2 text-right">
              <span className="font-serif text-2xl text-ink">{Number(r.prevalence).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-5 ring-1 ring-border ${
        accent ? "bg-peach-base/60" : "bg-card"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink/50">{label}</p>
      <p className="font-serif text-4xl mt-2 text-ink">{value}</p>
    </div>
  );
}
