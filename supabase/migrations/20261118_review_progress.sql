-- Học cùng lon ton v0.6 - chạy MỘT LẦN ở Supabase SQL Editor.
-- Không xóa bảng hoặc dữ liệu hiện có.
create table if not exists public.review_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_index integer not null check (question_index >= 0),
  repetitions integer not null default 0 check (repetitions >= 0),
  interval_days integer not null default 1 check (interval_days >= 1),
  last_correct boolean,
  last_reviewed_at timestamptz,
  due_at timestamptz not null default now(),
  primary key(user_id,quiz_id,question_index)
);
create index if not exists review_progress_due_idx on public.review_progress(user_id,due_at);
alter table public.review_progress enable row level security;
drop policy if exists "own review progress" on public.review_progress;
create policy "own review progress" on public.review_progress
for all to authenticated
using (auth.uid()=user_id and exists (
  select 1 from public.quizzes q where q.id=quiz_id and q.user_id=auth.uid()
))
with check (auth.uid()=user_id and exists (
  select 1 from public.quizzes q where q.id=quiz_id and q.user_id=auth.uid()
));
grant usage on schema public to authenticated;
grant select,insert,update,delete on public.review_progress to authenticated;
