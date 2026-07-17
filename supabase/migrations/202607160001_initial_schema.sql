create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.mokpo_regions (
  id uuid primary key default gen_random_uuid(), code text not null unique, slug text not null unique, name text not null,
  latitude double precision not null, longitude double precision not null, boundary_is_approximate boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.mock_scenarios (
  id text primary key, name text not null, description text not null, seed text not null, settings jsonb not null default '{}'::jsonb,
  is_mock boolean not null default true check (is_mock), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.mock_water_quality_records (
  id uuid primary key default gen_random_uuid(), external_id text not null unique, region_code text not null references public.mokpo_regions(code),
  risk_level text not null check (risk_level in ('unknown','normal','interest','caution','warning')), risk_score int not null check (risk_score between 0 and 100),
  water_quality_status text not null check (water_quality_status in ('normal','abnormal','unknown')), pollutant_type text not null,
  measured_value numeric, threshold_value numeric, observed_at timestamptz not null, published_at timestamptz not null, expires_at timestamptz,
  reasons jsonb not null default '[]'::jsonb, confidence text not null check (confidence in ('low','medium','high')), missing_data boolean not null default false,
  is_mock boolean not null default true check (is_mock), scenario_id text references public.mock_scenarios(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.mock_disease_case_records (
  id uuid primary key default gen_random_uuid(), external_id text not null unique, region_code text not null references public.mokpo_regions(code),
  risk_level text not null check (risk_level in ('unknown','normal','interest','caution','warning')), risk_score int not null check (risk_score between 0 and 100), disease_type text not null,
  confirmed_case_count int not null default 0 check (confirmed_case_count >= 0), suspected_case_count int not null default 0 check (suspected_case_count >= 0),
  water_quality_status text not null default 'unknown', pollutant_type text not null default '', measured_value numeric, threshold_value numeric,
  observed_at timestamptz not null, published_at timestamptz not null, expires_at timestamptz, reasons jsonb not null default '[]'::jsonb,
  confidence text not null check (confidence in ('low','medium','high')), missing_data boolean not null default false, is_mock boolean not null default true check (is_mock),
  scenario_id text references public.mock_scenarios(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.mock_health_alerts (
  id uuid primary key default gen_random_uuid(), external_id text not null unique, region_code text not null references public.mokpo_regions(code), scenario_id text references public.mock_scenarios(id),
  title text not null, description text not null, risk_level text not null check (risk_level in ('unknown','normal','interest','caution','warning')),
  starts_at timestamptz not null, ends_at timestamptz, published_at timestamptz not null, active boolean not null default true, is_mock boolean not null default true check (is_mock),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.mock_healthcare_facilities (
  id uuid primary key default gen_random_uuid(), external_id text not null unique, region_code text references public.mokpo_regions(code), name text not null,
  facility_type text not null check (facility_type in ('hospital','clinic','emergency','health-center')), address text not null, phone text not null,
  latitude double precision not null, longitude double precision not null, departments jsonb not null default '[]'::jsonb, hours text not null, emergency boolean not null default false,
  is_mock boolean not null default true check (is_mock), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.visit_histories (
  id uuid primary key default gen_random_uuid(), client_id text not null, user_id uuid not null references auth.users(id) on delete cascade, region_code text not null references public.mokpo_regions(code),
  note text not null default '' check (char_length(note) <= 100), visit_start date not null, visit_end date not null, consented_at timestamptz not null,
  retention_days int not null default 90 check (retention_days between 1 and 3650), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (visit_start <= visit_end), unique(user_id, client_id)
);
create table public.favorite_regions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, region_code text not null references public.mokpo_regions(code),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,region_code)
);
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade unique, preferences jsonb not null default '{}'::jsonb,
  browser_permission_granted boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, region_code text references public.mokpo_regions(code),
  notification_type text not null, title text not null, description text not null, risk_level text not null, href text not null, read_at timestamptz, is_mock boolean not null default true check (is_mock),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.safety_guides (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, description text not null, actions jsonb not null default '[]'::jsonb,
  cautions jsonb not null default '[]'::jsonb, content_updated_at date not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.simulation_settings (
  id uuid primary key default gen_random_uuid(), scenario_id text references public.mock_scenarios(id), seed text not null, start_date date not null, end_date date not null,
  initial_region_code text references public.mokpo_regions(code), settings jsonb not null default '{}'::jsonb, created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.data_sync_logs (
  id uuid primary key default gen_random_uuid(), provider text not null, status text not null, message text not null default '', record_count int not null default 0,
  is_mock boolean not null default true check (is_mock), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index idx_water_region_observed on public.mock_water_quality_records(region_code, observed_at desc);
create index idx_cases_region_observed on public.mock_disease_case_records(region_code, observed_at desc);
create index idx_alerts_region_active on public.mock_health_alerts(region_code, active, starts_at desc);
create index idx_facilities_region_type on public.mock_healthcare_facilities(region_code, facility_type);
create index idx_visits_user_dates on public.visit_histories(user_id, visit_start desc, visit_end);
create index idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index idx_sync_logs_created on public.data_sync_logs(created_at desc);

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','mokpo_regions','mock_scenarios','mock_water_quality_records','mock_disease_case_records','mock_health_alerts','mock_healthcare_facilities','visit_histories','favorite_regions','notification_preferences','notifications','safety_guides','simulation_settings','data_sync_logs'] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.mokpo_regions enable row level security;
alter table public.mock_scenarios enable row level security;
alter table public.mock_water_quality_records enable row level security;
alter table public.mock_disease_case_records enable row level security;
alter table public.mock_health_alerts enable row level security;
alter table public.mock_healthcare_facilities enable row level security;
alter table public.visit_histories enable row level security;
alter table public.favorite_regions enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.safety_guides enable row level security;
alter table public.simulation_settings enable row level security;
alter table public.data_sync_logs enable row level security;

create policy "profiles own select" on public.profiles for select to authenticated using (id=auth.uid());
create policy "profiles own update" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
create policy "regions public read" on public.mokpo_regions for select to anon,authenticated using (true);
create policy "scenarios public read" on public.mock_scenarios for select to anon,authenticated using (true);
create policy "water public read" on public.mock_water_quality_records for select to anon,authenticated using (is_mock);
create policy "cases public read" on public.mock_disease_case_records for select to anon,authenticated using (is_mock);
create policy "alerts public read" on public.mock_health_alerts for select to anon,authenticated using (is_mock);
create policy "facilities public read" on public.mock_healthcare_facilities for select to anon,authenticated using (is_mock);
create policy "safety public read" on public.safety_guides for select to anon,authenticated using (true);
create policy "visits own all" on public.visit_histories for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "favorites own all" on public.favorite_regions for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "preferences own all" on public.notification_preferences for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "notifications own all" on public.notifications for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id) values(new.id); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

comment on table public.visit_histories is 'Private, user-owned administrative-dong visit records. No precise addresses or GPS tracks.';
comment on column public.mokpo_regions.boundary_is_approximate is 'True: demo coordinates/areas are not official administrative boundaries.';
