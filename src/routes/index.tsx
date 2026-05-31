import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { statusColor } from "@/lib/format";
import heroImg from "@/assets/hero-mother-child.jpg";
import articleProtein from "@/assets/article-protein.jpg";

const coverMap: Record<string, string> = {
  protein: articleProtein,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sehat Tumbuh — Data & Edukasi Stunting Indonesia" },
      {
        name: "description",
        content:
          "Monitoring prevalensi stunting per wilayah dan edukasi gizi untuk mewujudkan generasi balita Indonesia yang sehat.",
      },
      { property: "og:title", content: "Sehat Tumbuh — Data & Edukasi Stunting Indonesia" },
      {
        property: "og:description",
        content: "Platform terpadu data stunting per wilayah dan edukasi gizi balita.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: regions } = useQuery({
    queryKey: ["regions-top"],
    queryFn: async () => {
      const { data } = await supabase
        .from("regions")
        .select("id, name, province, prevalence")
        .order("prevalence", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: article } = useQuery({
    queryKey: ["article-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, slug, title, excerpt, cover_image, category")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const nationalPrevalence = 21.6;
  const previousYear = 24.4;
  const trend = (nationalPrevalence - previousYear).toFixed(1);

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      {/* Hero */}
      <section className="mb-16">
        <h1 className="font-serif text-5xl md:text-7xl leading-none tracking-tight text-balance text-ink max-w-[20ch] mb-8">
          Membangun masa depan lewat gizi yang terjaga.
        </h1>
        <p className="text-base md:text-lg text-ink/70 text-pretty max-w-[60ch] mb-10">
          Platform terpadu untuk monitoring data stunting per wilayah dan penyediaan literasi gizi
          demi pertumbuhan balita Indonesia yang optimal.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/data-wilayah"
            className="bg-sky-dark text-ink text-sm font-medium pr-5 pl-3 py-2.5 flex items-center gap-2 rounded-full hover:-translate-y-0.5 transition-transform"
          >
            <ArrowDownLeft className="size-4" />
            Lihat Data Wilayah
          </Link>
          <Link
            to="/edukasi"
            className="text-sm font-medium py-2.5 px-6 rounded-full ring-1 ring-ink/15 hover:ring-ink/40 transition-colors"
          >
            Edukasi Gizi
          </Link>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Stats card */}
        <div className="md:col-span-8 bg-sky-base ring-1 ring-black/5 rounded-3xl p-8 flex flex-col justify-between min-h-[340px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
              Prevalensi Nasional
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-white/50 rounded-md ring-1 ring-black/5">
              SSGI 2023
            </span>
          </div>
          <div>
            <div className="font-serif text-7xl md:text-9xl leading-none text-ink">
              {nationalPrevalence}%
            </div>
            <p className="mt-4 text-sm font-medium text-ink/70 text-pretty max-w-[44ch]">
              Angka prevalensi stunting nasional turun{" "}
              <span className="text-status-low font-semibold">{trend}%</span> dibanding tahun
              sebelumnya, namun tetap memerlukan intervensi berkelanjutan.
            </p>
          </div>
        </div>

        {/* Region list */}
        <div className="md:col-span-4 bg-card ring-1 ring-black/5 rounded-3xl p-6 flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] mb-5 flex items-center gap-2 text-ink/70">
            <MapPin className="size-4 text-ink/40" />
            Wilayah Prioritas
          </h3>
          <div className="space-y-0 divide-y divide-border">
            {(regions ?? []).map((r) => (
              <div key={r.id} className="flex justify-between items-center py-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink/90 truncate">{r.name}</p>
                  <p className="text-[11px] text-ink/50">{r.province}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    r.prevalence >= 25
                      ? "text-status-high"
                      : r.prevalence >= 20
                      ? "text-status-mid"
                      : "text-ink"
                  }`}
                >
                  {Number(r.prevalence).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/data-wilayah"
            className="mt-auto pt-5 text-sm font-medium text-ink/70 hover:text-ink transition-colors flex items-center gap-1"
          >
            Selengkapnya <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Image card */}
        <div className="md:col-span-5 ring-1 ring-black/5 rounded-3xl overflow-hidden bg-peach-base/40 aspect-square md:aspect-auto md:min-h-[460px]">
          <img
            src={heroImg}
            alt="Seorang ibu Indonesia menyuapi balita yang sehat dengan penuh kasih sayang"
            width={800}
            height={1000}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article card */}
        <Link
          to="/edukasi/$slug"
          params={{ slug: article?.slug ?? "" }}
          className="md:col-span-4 bg-peach-base ring-1 ring-black/5 rounded-3xl p-6 flex flex-col group"
        >
          <div className="mb-4 overflow-hidden rounded-xl aspect-video bg-peach-dark/40">
            {article?.cover_image && coverMap[article.cover_image] && (
              <img
                src={coverMap[article.cover_image]}
                alt={article.title}
                loading="lazy"
                width={768}
                height={512}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink/50 mb-2">
            {article?.category ?? "Artikel"}
          </span>
          <h4 className="font-serif text-2xl leading-tight mb-2 text-pretty text-ink">
            {article?.title ?? "Memuat artikel..."}
          </h4>
          <p className="text-xs text-ink/60 line-clamp-2">{article?.excerpt}</p>
        </Link>

        {/* CTA admin */}
        <div className="md:col-span-3 bg-ink text-primary-foreground ring-1 ring-black/5 rounded-3xl p-6 flex flex-col justify-between">
          <div className="size-10 bg-white/10 rounded-lg flex items-center justify-center">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-1">
              Portal Khusus
            </p>
            <h4 className="text-sm font-medium mb-4">Kelola Data Wilayah</h4>
            <Link
              to="/login"
              className="block text-center w-full bg-white text-ink text-xs font-semibold py-2.5 rounded-lg hover:scale-[1.02] transition-transform"
            >
              Masuk sebagai Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Status legend */}
      <section className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Terkendali", desc: "< 15%", cls: "bg-status-low/10 text-status-low" },
          { label: "Waspada", desc: "15–19%", cls: "bg-status-mid/10 text-status-mid" },
          { label: "Tinggi", desc: "20–29%", cls: "bg-status-high/10 text-status-high" },
          { label: "Sangat Tinggi", desc: "≥ 30%", cls: "bg-status-high/15 text-status-high" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card ring-1 ring-border p-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${s.cls}`}>
              {s.label}
            </span>
            <p className="font-serif text-2xl mt-3">{s.desc}</p>
            <p className="text-xs text-ink/50">Prevalensi stunting</p>
          </div>
        ))}
      </section>
    </main>
  );
}

// suppress unused warning
void statusColor;
