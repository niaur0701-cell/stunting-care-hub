import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/", label: "Beranda" },
  { to: "/data-wilayah", label: "Data Wilayah" },
  { to: "/edukasi", label: "Edukasi" },
  { to: "/tentang", label: "Tentang" },
] as const;

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-serif text-2xl text-ink tracking-tight">
            Sehat Tumbuh
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-ink" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium px-4 py-2 rounded-full bg-ink text-primary-foreground hover:opacity-90 transition"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm font-medium px-4 py-2 rounded-full ring-1 ring-ink/10 hover:ring-ink/30 transition-colors"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-2 rounded-full ring-1 ring-ink/10 hover:ring-ink/30 transition-colors"
            >
              Login Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
