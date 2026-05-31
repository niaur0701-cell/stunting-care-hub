export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="max-w-[40ch]">
          <p className="font-serif text-2xl text-ink">Sehat Tumbuh</p>
          <p className="text-sm text-ink/60 mt-2 text-pretty">
            Inisiatif keterbukaan data dan edukasi gizi untuk menurunkan angka stunting di Indonesia.
          </p>
        </div>
        <div className="flex flex-col text-left md:text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2">
            Kontak Layanan
          </p>
          <p className="text-sm text-ink/80">Dinas Kesehatan Provinsi</p>
          <p className="text-sm text-ink/80">Jl. Kesehatan No. 12, Indonesia</p>
          <p className="text-sm text-ink/80 mt-1">hubungi@sehattumbuh.go.id</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center">
        <p className="text-xs text-ink/40">© {new Date().getFullYear()} Sehat Tumbuh — Menuju Indonesia Emas</p>
      </div>
    </footer>
  );
}
