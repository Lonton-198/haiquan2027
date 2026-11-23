-- Chạy toàn bộ trong Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.documents (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, filename text not null, storage_path text not null, extracted_text text not null,
 created_at timestamptz not null default now());
create table if not exists public.lessons (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 document_id uuid not null references public.documents(id) on delete cascade,topic text not null,content jsonb not null,
 created_at timestamptz not null default now());
create table if not exists public.quizzes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 document_id uuid not null references public.documents(id) on delete cascade,title text not null, questions jsonb not null,
 created_at timestamptz not null default now());
create table if not exists public.attempts (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 quiz_id uuid not null references public.quizzes(id) on delete cascade,answers jsonb not null,
 correct integer not null,total integer not null,seconds integer not null default 0,
 created_at timestamptz not null default now());
create index if not exists documents_user_idx on public.documents(user_id,created_at desc);
create index if not exists lessons_user_idx on public.lessons(user_id,created_at desc);
create index if not exists quizzes_user_idx on public.quizzes(user_id,created_at desc);
create index if not exists attempts_user_idx on public.attempts(user_id,created_at desc);
alter table public.documents enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.attempts enable row level security;
drop policy if exists "own documents" on public.documents;
create policy "own documents" on public.documents for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own lessons" on public.lessons;
create policy "own lessons" on public.lessons for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own quizzes" on public.quizzes;
create policy "own quizzes" on public.quizzes for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own attempts" on public.attempts;
create policy "own attempts" on public.attempts for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('documents','documents',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id) do nothing;
drop policy if exists "own uploaded files" on storage.objects;
create policy "own uploaded files" on storage.objects for all to authenticated
using(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text);
