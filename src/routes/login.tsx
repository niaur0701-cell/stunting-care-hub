import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login Admin — Sehat Tumbuh" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Silakan login.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Selamat datang kembali.");
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="text-sm text-ink/60 hover:text-ink">← Kembali</Link>
        <div className="mt-6 bg-card ring-1 ring-border rounded-3xl p-8">
          <h1 className="font-serif text-4xl text-ink mb-2">
            {mode === "login" ? "Masuk Admin" : "Daftar Admin"}
          </h1>
          <p className="text-sm text-ink/60 mb-8">
            {mode === "login"
              ? "Kelola data wilayah dan artikel edukasi."
              : "Buat akun untuk akses dashboard admin."}
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-ink/60">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-background ring-1 ring-border focus:ring-2 focus:ring-sky-dark outline-none text-sm"
                placeholder="admin@dinkes.go.id"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-ink/60">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-background ring-1 ring-border focus:ring-2 focus:ring-sky-dark outline-none text-sm"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
            </button>
          </form>
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-6 text-sm text-ink/60 hover:text-ink w-full text-center"
          >
            {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
          <p className="mt-6 text-xs text-ink/40 text-center text-pretty">
            Akun baru akan memiliki peran <strong>user</strong>. Peran admin diberikan langsung
            melalui backend.
          </p>
        </div>
      </div>
    </main>
  );
}
