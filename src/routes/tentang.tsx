import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Sehat Tumbuh" },
      {
        name: "description",
        content: "Inisiatif keterbukaan data dan edukasi gizi untuk menurunkan angka stunting Indonesia.",
      },
      { property: "og:title", content: "Tentang Sehat Tumbuh" },
      {
        property: "og:description",
        content: "Misi dan visi platform data stunting nasional.",
      },
    ],
  }),
  component: Tentang,
});

function Tentang() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 mb-4">Tentang</p>
      <h1 className="font-serif text-5xl md:text-7xl leading-none text-ink mb-10 text-balance">
        Sehat Tumbuh adalah komitmen bersama untuk Indonesia Emas 2045.
      </h1>

      <div className="prose prose-lg max-w-none space-y-6 text-ink/80">
        <p className="text-lg leading-relaxed text-pretty">
          Stunting adalah kondisi gagal tumbuh akibat kekurangan gizi kronis sejak dalam kandungan
          hingga usia dua tahun. Dampaknya tidak hanya pada tinggi badan, tetapi juga perkembangan
          kognitif dan produktivitas anak di masa depan.
        </p>
        <p className="leading-relaxed text-pretty">
          Sehat Tumbuh dibangun sebagai platform terbuka yang menjembatani data stunting dari setiap
          wilayah dengan masyarakat luas. Kami percaya transparansi data dan akses edukasi yang
          merata adalah dua pilar utama dalam menurunkan angka stunting nasional.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-16">
        {[
          {
            title: "Transparansi Data",
            desc: "Akses terbuka ke prevalensi stunting per wilayah berdasarkan SSGI terbaru.",
            bg: "bg-sky-base",
          },
          {
            title: "Edukasi Merata",
            desc: "Literasi gizi yang dapat dipahami semua kalangan, dari kota hingga desa.",
            bg: "bg-peach-base",
          },
          {
            title: "Kolaborasi",
            desc: "Sinergi antara pemerintah, tenaga kesehatan, dan komunitas masyarakat.",
            bg: "bg-card ring-1 ring-border",
          },
        ].map((p) => (
          <div key={p.title} className={`${p.bg} rounded-3xl p-7`}>
            <h3 className="font-serif text-2xl text-ink mb-2">{p.title}</h3>
            <p className="text-sm text-ink/70 text-pretty">{p.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
