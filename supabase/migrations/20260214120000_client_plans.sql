-- client_plans: matches lib/actions.ts and lib/types.ts (jsonb sections)
-- Run via Supabase SQL Editor or: supabase db push (if using Supabase CLI)

create table public.client_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_name text not null,
  income_optimization jsonb not null default '{}'::jsonb,
  emergency_builder jsonb not null default '{}'::jsonb,
  revenue_replacer jsonb not null default '{}'::jsonb,
  asset_builder jsonb not null default '{}'::jsonb,
  legacy_enhancer jsonb not null default '{}'::jsonb,
  legacy_defender jsonb not null default '{}'::jsonb,
  dynasty_creator jsonb not null default '{}'::jsonb,
  tax_planner jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_plans_user_id_idx on public.client_plans (user_id);
create index client_plans_updated_at_idx on public.client_plans (updated_at desc);

alter table public.client_plans enable row level security;

create policy "client_plans_select_own"
  on public.client_plans for select
  using (auth.uid() = user_id);

create policy "client_plans_insert_own"
  on public.client_plans for insert
  with check (auth.uid() = user_id);

create policy "client_plans_update_own"
  on public.client_plans for update
  using (auth.uid() = user_id);

create policy "client_plans_delete_own"
  on public.client_plans for delete
  using (auth.uid() = user_id);

create or replace function public.client_plans_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger client_plans_set_updated_at
  before update on public.client_plans
  for each row
  execute function public.client_plans_set_updated_at();
