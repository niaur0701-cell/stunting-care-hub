import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import articleProtein from "@/assets/article-protein.jpg";
import articlePosyandu from "@/assets/article-posyandu.jpg";
import article1000hari from "@/assets/article-1000hari.jpg";

const coverMap: Record<string, string> = {
  protein: articleProtein,
  posyandu: articlePosyandu,
  "1000hari": article1000hari,
};

export const Route = createFileRoute("/edukasi/$slug")({
  component: ArticleDetail,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 className="font-serif text-4xl text-ink mb-4">Artikel tidak ditemukan</h1>
      <Link to="/edukasi" className="text-sm underline">Kembali ke daftar artikel</Link>
    </div>
  ),
});

function ArticleDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) {
    return <main className="max-w-3xl mx-auto px-6 py-20 text-sm text-ink/50">Memuat...</main>;
  }
  if (!data) throw notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <Link to="/edukasi" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-8">
        <ArrowLeft className="size-4" /> Semua artikel
      </Link>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-ink/50">
        {data.category}
      </span>
      <h1 className="font-serif text-4xl md:text-6xl leading-tight text-ink mt-3 mb-8 text-pretty">
        {data.title}
      </h1>
      {data.cover_image && coverMap[data.cover_image] && (
        <img
          src={coverMap[data.cover_image]}
          alt={data.title}
          width={768}
          height={512}
          className="w-full aspect-[3/2] object-cover rounded-3xl mb-8"
        />
      )}
      <p className="text-lg text-ink/80 leading-relaxed text-pretty whitespace-pre-line">
        {data.content}
      </p>
    </main>
  );
}
