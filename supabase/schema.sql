-- ============================================================
-- Bookit Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
--    Extends auth.users with role and display name.
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'attendee'
               check (role in ('attendee', 'organizer', 'venue_staff', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'attendee')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 2. EVENTS
-- ────────────────────────────────────────────────────────────
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  description  text,
  date         date not null,
  time         time not null,
  location     text not null,
  image_url    text,
  capacity     int not null default 0,
  status       text not null default 'draft'
                 check (status in ('draft', 'published')),
  created_at   timestamptz not null default now(),
  end_date     date,
  recurring_days text
);


-- ────────────────────────────────────────────────────────────
-- 3. TICKET TYPES
-- ────────────────────────────────────────────────────────────
create table public.ticket_types (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  name       text not null,
  price      numeric(10,2) not null default 0.00,
  quantity   int not null default 0,
  created_at timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────
-- 4. ORDERS
-- ────────────────────────────────────────────────────────────
create table public.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  event_id     uuid not null references public.events(id) on delete cascade,
  status       text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'cancelled')),
  total_amount numeric(10,2) not null default 0.00,
  created_at   timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────
-- 5. TICKETS
-- ────────────────────────────────────────────────────────────
create table public.tickets (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  qr_code        text not null unique default gen_random_uuid()::text,
  is_used        boolean not null default false,
  created_at     timestamptz not null default now()
);


-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.events      enable row level security;
alter table public.ticket_types enable row level security;
alter table public.orders      enable row level security;
alter table public.tickets     enable row level security;


-- ────────────────────────────────────────────────────────────
-- PROFILES policies
-- ────────────────────────────────────────────────────────────
-- Users can read and update only their own profile
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);


-- ────────────────────────────────────────────────────────────
-- EVENTS policies
-- ────────────────────────────────────────────────────────────
-- Anyone (including unauthenticated) can view published events
create policy "events: public read published"
  on public.events for select
  using (status = 'published');

-- Organizers can see all their own events (including drafts)
create policy "events: organizer read own"
  on public.events for select
  using (auth.uid() = organizer_id);

-- Organizers can create events
create policy "events: organizer insert"
  on public.events for insert
  with check (auth.uid() = organizer_id);

-- Organizers can update their own events
create policy "events: organizer update"
  on public.events for update
  using (auth.uid() = organizer_id);

-- Organizers can delete their own events
create policy "events: organizer delete"
  on public.events for delete
  using (auth.uid() = organizer_id);


-- ────────────────────────────────────────────────────────────
-- TICKET TYPES policies
-- ────────────────────────────────────────────────────────────
-- Anyone can read ticket types for published events
create policy "ticket_types: public read"
  on public.ticket_types for select
  using (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and events.status = 'published'
    )
  );

-- Organizers can read ticket types for their own events
create policy "ticket_types: organizer read own"
  on public.ticket_types for select
  using (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and events.organizer_id = auth.uid()
    )
  );

-- Organizers can insert/update/delete ticket types on their events
create policy "ticket_types: organizer insert"
  on public.ticket_types for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "ticket_types: organizer update"
  on public.ticket_types for update
  using (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "ticket_types: organizer delete"
  on public.ticket_types for delete
  using (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and events.organizer_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- ORDERS policies
-- ────────────────────────────────────────────────────────────
-- Users can see their own orders
create policy "orders: select own"
  on public.orders for select
  using (auth.uid() = user_id);

-- Organizers can see orders for their events
create policy "orders: organizer read"
  on public.orders for select
  using (
    exists (
      select 1 from public.events
      where events.id = orders.event_id
        and events.organizer_id = auth.uid()
    )
  );

-- Authenticated users can place orders
create policy "orders: insert own"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Users can cancel their own pending orders
create policy "orders: update own"
  on public.orders for update
  using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- TICKETS policies
-- ────────────────────────────────────────────────────────────
-- Users can see their own tickets
create policy "tickets: select own"
  on public.tickets for select
  using (auth.uid() = user_id);

-- Venue staff and organizers can read tickets for validation
create policy "tickets: staff read"
  on public.tickets for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('venue_staff', 'organizer', 'admin')
    )
  );

-- System inserts tickets (via service role in edge functions)
-- Authenticated users can insert their own tickets
create policy "tickets: insert own"
  on public.tickets for insert
  with check (auth.uid() = user_id);

-- Venue staff can mark tickets as used
create policy "tickets: staff update"
  on public.tickets for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('venue_staff', 'organizer', 'admin')
    )
  );
