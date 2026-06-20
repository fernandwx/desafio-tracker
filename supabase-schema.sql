-- Execute isso no SQL Editor do Supabase

create table entries (
  id uuid default gen_random_uuid() primary key,
  user_name text not null,
  date date not null,
  reels integer not null default 0,
  tasks integer not null default 0,
  what_did text,
  feeling integer not null check (feeling between 1 and 5),
  created_at timestamp with time zone default now()
);

-- Impede mais de um registro por pessoa por dia
create unique index entries_user_date_idx on entries (user_name, date);

-- Permite leitura e escrita pública (sem login de usuário)
alter table entries enable row level security;

create policy "Leitura pública" on entries
  for select using (true);

create policy "Inserção pública" on entries
  for insert with check (true);

create policy "Exclusão pública" on entries
  for delete using (true);
