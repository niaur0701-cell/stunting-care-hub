
-- Roles enum and table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "users_read_own_roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Auto-assign 'user' role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Regions
create table public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null,
  prevalence numeric(5,2) not null default 0,
  total_balita integer not null default 0,
  status text not null default 'Terkendali',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

grant select on public.regions to anon, authenticated;
grant insert, update, delete on public.regions to authenticated;
grant all on public.regions to service_role;

alter table public.regions enable row level security;

create policy "regions_public_read" on public.regions
  for select to anon, authenticated using (true);
create policy "regions_admin_insert" on public.regions
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "regions_admin_update" on public.regions
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "regions_admin_delete" on public.regions
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Articles
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Edukasi',
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;

alter table public.articles enable row level security;

create policy "articles_public_read" on public.articles
  for select to anon, authenticated using (published = true or public.has_role(auth.uid(), 'admin'));
create policy "articles_admin_insert" on public.articles
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "articles_admin_update" on public.articles
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "articles_admin_delete" on public.articles
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Seed data
insert into public.regions (name, province, prevalence, total_balita, status) values
  ('Kab. Garut', 'Jawa Barat', 28.4, 215000, 'Tinggi'),
  ('Kab. Banyumas', 'Jawa Tengah', 19.1, 142000, 'Waspada'),
  ('Kab. Bogor', 'Jawa Barat', 24.9, 489000, 'Tinggi'),
  ('Kota Bandung', 'Jawa Barat', 17.2, 198000, 'Waspada'),
  ('Kab. Timor Tengah Selatan', 'NTT', 35.2, 56000, 'Sangat Tinggi'),
  ('Kota Surabaya', 'Jawa Timur', 14.8, 218000, 'Terkendali'),
  ('Kab. Sumba Barat', 'NTT', 31.7, 18000, 'Sangat Tinggi'),
  ('DKI Jakarta', 'DKI Jakarta', 14.8, 760000, 'Terkendali'),
  ('Kab. Lombok Tengah', 'NTB', 26.3, 95000, 'Tinggi'),
  ('Kab. Brebes', 'Jawa Tengah', 22.1, 168000, 'Waspada');

insert into public.articles (title, slug, category, excerpt, content, cover_image) values
  ('Pentingnya Protein Hewani dalam 1000 Hari Pertama Kehidupan',
   'protein-hewani-1000-hari',
   'Gizi',
   'Mengenal sumber protein lokal yang mudah didapat untuk mencegah gangguan pertumbuhan balita.',
   'Protein hewani memiliki kandungan asam amino esensial yang lengkap dan sangat dibutuhkan pada masa 1000 hari pertama kehidupan. Telur, ikan, ayam, dan daging merupakan sumber protein lokal yang terjangkau dan mudah didapat di seluruh wilayah Indonesia. Konsumsi rutin protein hewani terbukti menurunkan risiko stunting hingga 47% berdasarkan studi multinasional.',
   'protein'),
  ('Menjaga Gizi Ibu Hamil untuk Mencegah Stunting Sejak Dini',
   'gizi-ibu-hamil',
   'Kehamilan',
   'Asupan nutrisi yang tepat selama kehamilan menentukan tumbuh kembang anak di masa depan.',
   'Kehamilan adalah periode kritis pertama dari 1000 hari pertama kehidupan. Ibu hamil membutuhkan tambahan 300 kalori per hari, asam folat 400 mcg, zat besi 27 mg, serta protein 71 gram per hari. Pemeriksaan kehamilan rutin minimal 6 kali selama kehamilan sangat dianjurkan.',
   'posyandu'),
  ('Peran Posyandu dalam Pemantauan Pertumbuhan Balita',
   'peran-posyandu',
   'Komunitas',
   'Posyandu menjadi garda depan dalam deteksi dini stunting di tingkat desa dan kelurahan.',
   'Posyandu (Pos Pelayanan Terpadu) adalah ujung tombak layanan kesehatan ibu dan anak di Indonesia. Kunjungan rutin setiap bulan memungkinkan kader memantau tinggi badan, berat badan, dan lingkar kepala balita. Data ini diinput ke sistem EPPGBM yang menjadi dasar intervensi pemerintah.',
   '1000hari');
