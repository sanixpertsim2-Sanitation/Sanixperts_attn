create extension if not exists pgcrypto;

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default 'Sanitation Technician',
  face_signature text,
  created_at timestamptz default now()
);

create table if not exists line_status (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  status text not null,
  updated_by text,
  updated_at timestamptz default now()
);

create table if not exists pre_cleaning_logs (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  employee_name text,
  bags_covered int not null default 0,
  checklist jsonb,
  submitted_at timestamptz default now()
);

create table if not exists post_cleaning_logs (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  employee_name text,
  bags_retrieved int not null default 0,
  photo_data text,
  handover_required boolean default false,
  submitted_at timestamptz default now()
);

create table if not exists handover_tasks (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  task_text text not null,
  response text,
  description text,
  photo_data text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists handover_logs (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  employee_name text,
  reason text,
  notes jsonb,
  submitted_at timestamptz default now()
);

create table if not exists area_verification_logs (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  lead_name text,
  checklist jsonb,
  signature_data text,
  submitted_at timestamptz default now()
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

create table if not exists post_release_findings (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  finding text not null,
  reported_by text,
  created_at timestamptz default now()
);

create table if not exists event_logs (
  id uuid primary key default gen_random_uuid(),
  line_name text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create table if not exists cleaning_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  task_name text not null,
  cleaner_name text,
  image_url text,
  is_completed boolean default false
);
