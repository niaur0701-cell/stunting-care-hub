import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { statusFromPrevalence, formatNumber, statusColor } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Dashboard Admin — Sehat Tumbuh" }] }),
  component: AdminDashboard,
});

type Tab = "regions" | "articles";

function AdminDashboard() {
  const { isAdmin, loading, user } = useAuth();
  const [tab, setTab] = useState<Tab>("regions");

  if (loading) return <p className="p-16 text-center text-sm text-ink/50">Memuat...</p>;

  if (!isAdmin) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-ink mb-3">Akses Terbatas</h1>
        <p className="text-sm text-ink/60">
          Akun <strong>{user?.email}</strong> belum memiliki peran admin. Hubungi pengelola sistem
          untuk mendapatkan akses.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 mb-2">
          Dashboard Admin
        </p>
        <h1 className="font-serif text-5xl text-ink">Kelola Data & Konten</h1>
      </div>

      <div className="flex gap-2 mb-8">
        {(["regions", "articles"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-medium px-5 py-2.5 rounded-full transition-colors ${
              tab === t ? "bg-ink text-primary-foreground" : "bg-card ring-1 ring-border hover:ring-ink/30"
            }`}
          >
            {t === "regions" ? "Data Wilayah" : "Artikel Edukasi"}
          </button>
        ))}
      </div>

      {tab === "regions" ? <RegionsManager /> : <ArticlesManager />}
    </main>
  );
}

function RegionsManager() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-regions"],
    queryFn: async () => {
      const { data } = await supabase.from("regions").select("*").order("prevalence", { ascending: false });
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("Hapus wilayah ini?")) return;
    const { error } = await supabase.from("regions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Wilayah dihapus");
    qc.invalidateQueries({ queryKey: ["admin-regions"] });
    qc.invalidateQueries({ queryKey: ["regions-all"] });
    qc.invalidateQueries({ queryKey: ["regions-top"] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink/60">{data?.length ?? 0} wilayah terdaftar</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-sky-dark text-ink text-sm font-medium px-4 py-2 rounded-full"
        >
          <Plus className="size-4" /> Tambah Wilayah
        </button>
      </div>

      <div className="bg-card ring-1 ring-border rounded-3xl overflow-hidden">
        {(data ?? []).map((r) => (
          <div key={r.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/60 last:border-0 items-center">
            <div className="col-span-4">
              <p className="text-sm font-medium">{r.name}</p>
              <p className="text-xs text-ink/50">{r.province}</p>
            </div>
            <div className="col-span-3">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${statusColor(r.status)}`}>
                {r.status}
              </span>
            </div>
            <div className="col-span-2 text-sm tabular-nums text-ink/70">{formatNumber(r.total_balita)}</div>
            <div className="col-span-2 font-serif text-2xl">{Number(r.prevalence).toFixed(1)}%</div>
            <div className="col-span-1 flex gap-1 justify-end">
              <button onClick={() => { setEditing(r); setShowForm(true); }} className="p-2 rounded-lg hover:bg-sky-base">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <RegionForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["admin-regions"] });
            qc.invalidateQueries({ queryKey: ["regions-all"] });
            qc.invalidateQueries({ queryKey: ["regions-top"] });
          }}
        />
      )}
    </div>
  );
}

function RegionForm({ initial, onClose, onSaved }: { initial: any | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [province, setProvince] = useState(initial?.province ?? "");
  const [prevalence, setPrevalence] = useState<number>(initial?.prevalence ?? 0);
  const [balita, setBalita] = useState<number>(initial?.total_balita ?? 0);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name, province, prevalence, total_balita: balita,
      status: statusFromPrevalence(prevalence),
      updated_at: new Date().toISOString(),
    };
    const { error } = initial
      ? await supabase.from("regions").update(payload).eq("id", initial.id)
      : await supabase.from("regions").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Wilayah diperbarui" : "Wilayah ditambahkan");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl p-8 max-w-lg w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-3xl">{initial ? "Edit Wilayah" : "Tambah Wilayah"}</h3>
          <button type="button" onClick={onClose}><X className="size-5" /></button>
        </div>
        <div className="space-y-4">
          <Field label="Nama Wilayah">
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </Field>
          <Field label="Provinsi">
            <input required value={province} onChange={(e) => setProvince(e.target.value)} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prevalensi (%)">
              <input required type="number" step="0.1" min="0" max="100" value={prevalence}
                onChange={(e) => setPrevalence(parseFloat(e.target.value))} className="input" />
            </Field>
            <Field label="Total Balita">
              <input required type="number" min="0" value={balita}
                onChange={(e) => setBalita(parseInt(e.target.value))} className="input" />
            </Field>
          </div>
          <p className="text-xs text-ink/50">
            Status otomatis: <strong>{statusFromPrevalence(prevalence)}</strong>
          </p>
        </div>
        <button type="submit" disabled={saving} className="mt-6 w-full bg-ink text-primary-foreground py-3 rounded-xl font-medium text-sm disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
      <style>{`.input{width:100%;padding:.75rem 1rem;border-radius:.75rem;background:var(--background);outline:1px solid var(--border);font-size:.875rem}.input:focus{outline:2px solid var(--sky-dark)}`}</style>
    </div>
  );
}

function ArticlesManager() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("Hapus artikel ini?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Artikel dihapus");
    qc.invalidateQueries({ queryKey: ["admin-articles"] });
    qc.invalidateQueries({ queryKey: ["articles-all"] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink/60">{data?.length ?? 0} artikel</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-sky-dark text-ink text-sm font-medium px-4 py-2 rounded-full">
          <Plus className="size-4" /> Tambah Artikel
        </button>
      </div>

      <div className="grid gap-3">
        {(data ?? []).map((a) => (
          <div key={a.id} className="bg-card ring-1 ring-border rounded-2xl p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-ink/50">{a.category}</span>
              <h4 className="font-serif text-xl mt-1">{a.title}</h4>
              <p className="text-xs text-ink/50 line-clamp-1 mt-1">{a.excerpt}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(a); setShowForm(true); }} className="p-2 rounded-lg hover:bg-sky-base">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => remove(a.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ArticleForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["admin-articles"] });
            qc.invalidateQueries({ queryKey: ["articles-all"] });
          }}
        />
      )}
    </div>
  );
}

function ArticleForm({ initial, onClose, onSaved }: { initial: any | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Gizi");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [cover, setCover] = useState(initial?.cover_image ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title, slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      category, excerpt, content, cover_image: cover || null,
      published: true,
      updated_at: new Date().toISOString(),
    };
    const { error } = initial
      ? await supabase.from("articles").update(payload).eq("id", initial.id)
      : await supabase.from("articles").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Artikel diperbarui" : "Artikel ditambahkan");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-6 overflow-y-auto" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl p-8 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-3xl">{initial ? "Edit Artikel" : "Tambah Artikel"}</h3>
          <button type="button" onClick={onClose}><X className="size-5" /></button>
        </div>
        <div className="space-y-4">
          <Field label="Judul"><input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug (opsional)"><input value={slug} onChange={(e) => setSlug(e.target.value)} className="input" placeholder="auto dari judul" /></Field>
            <Field label="Kategori"><input value={category} onChange={(e) => setCategory(e.target.value)} className="input" /></Field>
          </div>
          <Field label="Cover (protein / posyandu / 1000hari)">
            <input value={cover} onChange={(e) => setCover(e.target.value)} className="input" placeholder="protein" />
          </Field>
          <Field label="Ringkasan"><textarea required value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input min-h-[80px]" /></Field>
          <Field label="Konten"><textarea required value={content} onChange={(e) => setContent(e.target.value)} className="input min-h-[180px]" /></Field>
        </div>
        <button type="submit" disabled={saving} className="mt-6 w-full bg-ink text-primary-foreground py-3 rounded-xl font-medium text-sm disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
      <style>{`.input{width:100%;padding:.75rem 1rem;border-radius:.75rem;background:var(--background);outline:1px solid var(--border);font-size:.875rem;font-family:inherit}.input:focus{outline:2px solid var(--sky-dark)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-ink/60">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
