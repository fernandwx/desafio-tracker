-- ATENÇÃO: rode isso no SQL Editor do Supabase
-- Se já tinha a tabela antiga, rode o DROP primeiro

drop table if exists entries;

create table entries (
  id uuid default gen_random_uuid() primary key,
  user_name text not null,
  date date not null,

  -- PRODUCAO
  reels integer not null default 0,
  sprints integer not null default 0,
  carrosseis integer not null default 0,
  what_did text,

  -- EXECUCAO
  deadline_status text not null check (deadline_status in ('all','partial','none')),
  extra_demand boolean not null default false,
  extra_demand_desc text,

  -- PROATIVIDADE
  new_idea boolean not null default false,
  new_idea_desc text,
  helped_team text,
  solved_problem boolean not null default false,
  solved_problem_desc text,

  -- COMPROMETIMENTO
  effort_score integer not null check (effort_score between 0 and 10),
  redo_what text,
  gave_max text not null check (gave_max in ('yes','could_more')),

  -- PONTUACAO
  score integer not null default 0,

  created_at timestamp with time zone default now()
);

-- Impede mais de um check-in por pessoa por dia
create unique index entries_user_date_idx on entries (user_name, date);

-- Segurança por linha (RLS)
alter table entries enable row level security;

create policy "Leitura publica" on entries for select using (true);
create policy "Insercao publica" on entries for insert with check (true);
create policy "Exclusao publica" on entries for delete using (true);
