-- Vision Canvas safety policies for real-user testing.
-- Run this in the Supabase SQL Editor after checking that the column names match your table.
-- The frontend can improve UX, but these policies are the real security boundary.

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

-- Shared links should go through token-scoped RPC functions.
-- Do not add a broad policy like "share_token is not null" for SELECT, because
-- anonymous users could enumerate every shared row.

create or replace function public.get_shared_canvas(p_token text)
returns table (
  id uuid,
  state jsonb,
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

create or replace function public.update_shared_canvas(p_token text, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.canvases
  set state = p_state,
      updated_at = now()
  where share_token = p_token
    and share_permission = 'edit'
    and coalesce(is_deleted, false) = false;
end;
$$;

grant execute on function public.get_shared_canvas(text) to anon, authenticated;
grant execute on function public.update_shared_canvas(text, jsonb) to anon, authenticated;

-- Comment-only links should eventually write to a separate comments table/RPC.
-- Until that table exists, treat "Can comment" as controlled-test only.
