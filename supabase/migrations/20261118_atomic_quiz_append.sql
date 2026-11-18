-- v0.8.3: append only a new batch atomically, without putting entire old JSON in the request URL.
-- Existing quiz rows and saved questions are not modified by this migration.
create or replace function public.append_quiz_batch(
  p_quiz_id uuid,
  p_expected_count integer,
  p_target integer,
  p_new_questions jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_done integer;
  v_title text;
  v_added integer;
begin
  if auth.uid() is null then
    raise exception 'Vui lòng đăng nhập lại.';
  end if;
  if p_expected_count < 0 or p_target not in (10, 20, 30, 40, 60, 100) then
    raise exception 'Số câu không hợp lệ.';
  end if;
  if p_new_questions is null or jsonb_typeof(p_new_questions) <> 'array' then
    raise exception 'Dữ liệu câu hỏi phải là một mảng.';
  end if;
  v_added := jsonb_array_length(p_new_questions);
  if v_added < 1 or v_added > 2 or p_expected_count + v_added > p_target then
    raise exception 'Số câu bổ sung không hợp lệ.';
  end if;

  update public.quizzes as q
  set questions = q.questions || p_new_questions,
      title = case
        when jsonb_array_length(q.questions) + v_added >= p_target
          then regexp_replace(q.title, '^⏳ \[[0-9]+\] ', '')
        else q.title
      end
  where q.id = p_quiz_id
    and q.user_id = auth.uid()
    and jsonb_typeof(q.questions) = 'array'
    and jsonb_array_length(q.questions) = p_expected_count
    and q.title like ('⏳ [' || p_target::text || '] %')
  returning jsonb_array_length(q.questions), q.title into v_done, v_title;

  if not found then
    return jsonb_build_object('saved', false);
  end if;
  return jsonb_build_object('saved', true, 'done', v_done, 'complete', v_done >= p_target);
end;
$$;

revoke all on function public.append_quiz_batch(uuid, integer, integer, jsonb) from public;
revoke all on function public.append_quiz_batch(uuid, integer, integer, jsonb) from anon;
grant execute on function public.append_quiz_batch(uuid, integer, integer, jsonb) to authenticated;
