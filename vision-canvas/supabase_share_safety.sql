-- Vision Canvas safety policies and shared-link approval flow.
-- Run this in the Supabase SQL Editor.

alter table public.canvases enable row level security;

drop policy if exists "Owners can read canvases" on public.canvases;
drop policy if exists "Owners can insert canvases" on public.canvases;
drop policy if exists "Owners can update canvases" on public.canvases;
drop policy if exists "Owners can delete canvases" on public.canvases;
drop policy if exists "Shared links can read canvases" on public.canvases;
drop policy if exists "Shared edit links can update canvases" on public.canvases;

create policy "Owners can read canvases"
on public.canvases
for select
using (auth.uid() = user_id);

create policy "Owners can insert canvases"
on public.canvases
for insert
with check (auth.uid() = user_id);

create policy "Owners can update canvases"
on public.canvases
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Owners can delete canvases"
on public.canvases
for delete
using (auth.uid() = user_id);

create table if not exists public.canvas_access_requests (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  share_token text not null,
  guest_key text not null,
  guest_name text not null,
  requested_permission text not null check (requested_permission in ('comment','edit')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canvas_id, guest_key)
);

create table if not exists public.canvas_access_activity (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  guest_key text,
  guest_name text,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

alter table public.canvas_access_requests enable row level security;
alter table public.canvas_access_activity enable row level security;

drop policy if exists "Owners can read access requests" on public.canvas_access_requests;
drop policy if exists "Owners can update access requests" on public.canvas_access_requests;
drop policy if exists "Owners can read access activity" on public.canvas_access_activity;

create policy "Owners can read access requests"
on public.canvas_access_requests
for select
using (
  exists (
    select 1 from public.canvases c
    where c.id = canvas_id
      and c.user_id = auth.uid()
  )
);

create policy "Owners can update access requests"
on public.canvas_access_requests
for update
using (
  exists (
    select 1 from public.canvases c
    where c.id = canvas_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.canvases c
    where c.id = canvas_id
      and c.user_id = auth.uid()
  )
);

create policy "Owners can read access activity"
on public.canvas_access_activity
for select
using (
  exists (
    select 1 from public.canvases c
    where c.id = canvas_id
      and c.user_id = auth.uid()
  )
);

drop function if exists public.get_shared_canvas(text);
drop function if exists public.update_shared_canvas(text, jsonb);
drop function if exists public.update_shared_canvas(text, text, jsonb);
drop function if exists public.request_canvas_access(text, text, text, text);
drop function if exists public.get_canvas_access_status(text, text);
drop function if exists public.list_canvas_access_requests(uuid);
drop function if exists public.list_canvas_access_activity(uuid);
drop function if exists public.set_canvas_access_request(uuid, text);

create or replace function public.get_shared_canvas(p_token text)
returns table (
  id uuid,
  state text,
  name text,
  share_token text,
  share_permission text
)
language sql
security definer
set search_path = public
as $$
  select c.id, c.state, c.name, c.share_token, c.share_permission
  from public.canvases c
  where c.share_token = p_token
    and coalesce(c.is_deleted, false) = false
  limit 1;
$$;

create or replace function public.request_canvas_access(
  p_token text,
  p_guest_key text,
  p_guest_name text,
  p_permission text
)
returns table(status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_canvas_id uuid;
begin
  select c.id into target_canvas_id
  from public.canvases c
  where c.share_token = p_token
    and c.share_permission in ('comment','edit')
    and p_permission in ('comment','edit')
    and coalesce(c.is_deleted, false) = false
  limit 1;

  if target_canvas_id is null then
    return query select 'rejected'::text;
    return;
  end if;

  insert into public.canvas_access_requests (
    canvas_id, share_token, guest_key, guest_name, requested_permission, status
  )
  values (
    target_canvas_id, p_token, p_guest_key, coalesce(nullif(trim(p_guest_name),''),'Guest'), p_permission, 'pending'
  )
  on conflict (canvas_id, guest_key)
  do update set
    guest_name = excluded.guest_name,
    requested_permission = excluded.requested_permission,
    updated_at = now();

  insert into public.canvas_access_activity (canvas_id, guest_key, guest_name, action, detail)
  values (target_canvas_id, p_guest_key, coalesce(nullif(trim(p_guest_name),''),'Guest'), 'requested', p_permission);

  return query
    select r.status
    from public.canvas_access_requests r
    where r.canvas_id = target_canvas_id
      and r.guest_key = p_guest_key
    limit 1;
end;
$$;

create or replace function public.list_canvas_access_activity(p_canvas_id uuid)
returns table (
  id uuid,
  guest_name text,
  action text,
  detail text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select a.id, a.guest_name, a.action, a.detail, a.created_at
  from public.canvas_access_activity a
  join public.canvases c on c.id = a.canvas_id
  where a.canvas_id = p_canvas_id
    and c.user_id = auth.uid()
  order by a.created_at desc
  limit 30;
$$;

create or replace function public.get_canvas_access_status(p_token text, p_guest_key text)
returns table(status text)
language sql
security definer
set search_path = public
as $$
  select r.status
  from public.canvas_access_requests r
  where r.share_token = p_token
    and r.guest_key = p_guest_key
  limit 1;
$$;

create or replace function public.list_canvas_access_requests(p_canvas_id uuid)
returns table (
  id uuid,
  guest_name text,
  requested_permission text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select r.id, r.guest_name, r.requested_permission, r.status, r.created_at, r.updated_at
  from public.canvas_access_requests r
  join public.canvases c on c.id = r.canvas_id
  where r.canvas_id = p_canvas_id
    and c.user_id = auth.uid()
  order by r.created_at desc;
$$;

create or replace function public.set_canvas_access_request(p_request_id uuid, p_status text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if p_status not in ('approved','rejected') then
    return false;
  end if;

  update public.canvas_access_requests r
  set status = p_status,
      updated_at = now()
  from public.canvases c
  where r.id = p_request_id
    and c.id = r.canvas_id
    and c.user_id = auth.uid();

  get diagnostics updated_count = row_count;
  if updated_count > 0 then
    insert into public.canvas_access_activity (canvas_id, guest_key, guest_name, action, detail)
    select r.canvas_id, r.guest_key, r.guest_name,
      case when p_status = 'approved' then 'approved' else 'revoked' end,
      r.requested_permission
    from public.canvas_access_requests r
    where r.id = p_request_id;
  end if;
  return updated_count > 0;
end;
$$;

create or replace function public.update_shared_canvas(p_token text, p_guest_key text, p_state jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.canvases c
  set state = p_state::text,
      updated_at = now()
  where c.share_token = p_token
    and c.share_permission in ('comment','edit')
    and coalesce(c.is_deleted, false) = false
    and exists (
      select 1
      from public.canvas_access_requests r
      where r.canvas_id = c.id
        and r.guest_key = p_guest_key
        and r.status = 'approved'
        and (
          c.share_permission = 'edit'
          or (c.share_permission = 'comment' and r.requested_permission = 'comment')
        )
    );

  get diagnostics updated_count = row_count;
  if updated_count > 0 then
    insert into public.canvas_access_activity (canvas_id, guest_key, guest_name, action, detail)
    select c.id, r.guest_key, r.guest_name, 'saved', c.share_permission
    from public.canvases c
    join public.canvas_access_requests r on r.canvas_id = c.id
    where c.share_token = p_token
      and r.guest_key = p_guest_key
    limit 1;
  end if;
  return updated_count > 0;
end;
$$;

grant execute on function public.get_shared_canvas(text) to anon, authenticated;
grant execute on function public.update_shared_canvas(text, text, jsonb) to anon, authenticated;
grant execute on function public.request_canvas_access(text, text, text, text) to anon, authenticated;
grant execute on function public.get_canvas_access_status(text, text) to anon, authenticated;
grant execute on function public.list_canvas_access_requests(uuid) to anon, authenticated;
grant execute on function public.list_canvas_access_activity(uuid) to anon, authenticated;
grant execute on function public.set_canvas_access_request(uuid, text) to anon, authenticated;
