-- Optional spouse / partner name for household planning context
alter table public.client_plans
  add column if not exists spouse_name text not null default '';
