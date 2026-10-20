-- Wedding invitation & RSVP schema
-- Guests never query these tables directly. The public RSVP flow runs in
-- Next.js server actions (service role, server-only) after verifying an
-- invitation code or secret link token. Admins read/write through RLS.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin allow-list (authorization). Authentication is Supabase Auth.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users a
    join auth.users u on lower(u.email) = a.email
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

drop policy if exists "admin_users_select_admin" on public.admin_users;
create policy "admin_users_select_admin" on public.admin_users
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Invitation codes
-- ---------------------------------------------------------------------------
create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text := '';
  bytes bytea := extensions.gen_random_bytes(8);
  i int;
begin
  for i in 0..7 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Invitations (one per household / party)
-- ---------------------------------------------------------------------------
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default public.generate_invite_code()
    check (code ~ '^[A-Z0-9]{6,12}$'),
  access_token text not null unique
    default encode(extensions.gen_random_bytes(24), 'hex'),
  party_name text not null check (char_length(party_name) between 1 and 120),
  guest_names text[] not null default '{}',
  email text check (email is null or char_length(email) <= 254),
  max_guests int not null default 1 check (max_guests between 1 and 12),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

drop policy if exists "invitations_admin_all" on public.invitations;
create policy "invitations_admin_all" on public.invitations
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- RSVP responses (exactly one per invitation -> no duplicates)
-- ---------------------------------------------------------------------------
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique
    references public.invitations(id) on delete cascade,
  status text not null check (status in ('attending', 'declined')),
  respondent_name text not null check (char_length(respondent_name) between 1 and 120),
  attendee_count int not null check (attendee_count between 0 and 12),
  attendee_names text[] not null default '{}',
  dietary_requirements text
    check (dietary_requirements is null or char_length(dietary_requirements) <= 500),
  message text check (message is null or char_length(message) <= 1000),
  revision int not null default 1,
  updated_by text not null default 'guest' check (updated_by in ('guest', 'admin')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rsvps_status_count check (
    (status = 'declined' and attendee_count = 0)
    or (status = 'attending' and attendee_count >= 1)
  )
);

alter table public.rsvps enable row level security;

drop policy if exists "rsvps_admin_all" on public.rsvps;
create policy "rsvps_admin_all" on public.rsvps
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Enforce party size limits in the database, regardless of caller.
create or replace function public.enforce_rsvp_limits()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  allowed int;
begin
  select max_guests into allowed
  from public.invitations where id = new.invitation_id;

  if allowed is null then
    raise exception 'Invitation not found';
  end if;
  if new.attendee_count > allowed then
    raise exception 'Attendee count exceeds the % guest(s) allowed', allowed;
  end if;
  if coalesce(array_length(new.attendee_names, 1), 0) > new.attendee_count then
    raise exception 'More attendee names than attendees';
  end if;

  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.revision := old.revision + 1;
    new.submitted_at := old.submitted_at;
  end if;
  return new;
end;
$$;

drop trigger if exists rsvps_enforce_limits on public.rsvps;
create trigger rsvps_enforce_limits
  before insert or update on public.rsvps
  for each row execute function public.enforce_rsvp_limits();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists invitations_touch on public.invitations;
create trigger invitations_touch
  before update on public.invitations
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Rate limiting for public code lookups (called by the server only)
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count int not null default 0
);

alter table public.rate_limits enable row level security;
-- No policies: only the service role (which bypasses RLS) can touch it.

create or replace function public.check_rate_limit(
  p_key text, p_max int, p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count int;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
          else r.count + 1
        end,
        window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
          else r.window_start
        end
  returning count into current_count;

  return current_count <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;

revoke all on function public.generate_invite_code() from public, anon;
grant execute on function public.generate_invite_code() to authenticated, service_role;
