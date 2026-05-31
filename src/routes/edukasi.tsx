import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import articleProtein from "@/assets/article-protein.jpg";
import articlePosyandu from "@/assets/article-posyandu.jpg";
import article1000hari from "@/assets/article-1000hari.jpg";

const coverMap: Record<string, string> = {
  protein: articleProtein,
  posyandu: articlePosyandu,
  "1000hari": article1000hari,
};

export const Route = createFileRoute("/edukasi")({
  head: () => ({
    meta: [
      { title: "Edukasi Gizi — Sehat Tumbuh" },
      {
        name: "description",
        content: "Panduan praktis pencegahan stunting untuk orang tua dan tenaga kesehatan.",
      },
      { property: "og:title", content: "Edukasi Gizi — Sehat Tumbuh" },
      {
        property: "og:description",
        content: "Artikel edukasi gizi balita dan pencegahan stunting.",
      },
    ],
  }),
  component: Edukasi,
});

function Edukasi() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-12 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 mb-3">
          Pusat Edukasi
        </p>
        <h1 className="font-serif text-5xl md:text-6xl leading-none text-ink mb-4">
          Literasi gizi untuk keluarga Indonesia.
        </h1>
        <p className="text-base text-ink/70 text-pretty">
          Artikel terkurasi dari tenaga kesehatan untuk membantu orang tua memberikan asupan terbaik
          bagi balita.
        </p>
      </div>

      {isLoading && <p className="text-sm text-ink/50">Memuat artikel...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(articles ?? []).map((a) => (
          <Link
            key={a.id}
            to="/edukasi/$slug"
            params={{ slug: a.slug }}
            className="group bg-card ring-1 ring-border rounded-3xl overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="aspect-[4/3] bg-peach-base/40 overflow-hidden">
              {a.cover_image && coverMap[a.cover_image] && (
                <img
                  src={coverMap[a.cover_image]}
                  alt={a.title}
                  loading="lazy"
                  width={768}
                  height={512}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <div className="p-6 flex flex-col flex-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-ink/50 mb-2">
                {a.category}
              </span>
              <h2 className="font-serif text-2xl leading-tight text-ink mb-3 text-pretty">
                {a.title}
              </h2>
              <p className="text-sm text-ink/60 line-clamp-3">{a.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
