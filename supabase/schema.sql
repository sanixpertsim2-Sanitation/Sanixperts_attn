create table if not exists event_logs (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create table if not exists damage_reports (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  equipment_area text not null,
  description text not null,
  severity text not null,
  status text not null default 'Open',
  reported_by text,
  created_at timestamptz default now(),
  photo_data text,
  fixed_by text,
  closed_at timestamptz,
  close_photo_data text
);
