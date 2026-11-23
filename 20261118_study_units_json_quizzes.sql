-- v1.0: RUN ONCE, AFTER previous v0.7/v0.8 migrations. No existing row is deleted.
BEGIN;
CREATE TABLE IF NOT EXISTS public.study_units (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 title text NOT NULL CHECK (length(trim(title)) BETWEEN 2 AND 180),
 position integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,user_id)
);
CREATE INDEX IF NOT EXISTS study_units_user_idx ON public.study_units(user_id,position,created_at);
ALTER TABLE public.study_units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own study units" ON public.study_units;
CREATE POLICY "own study units" ON public.study_units FOR ALL TO authenticated
 USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.study_units TO authenticated;

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS study_unit_id uuid REFERENCES public.study_units(id) ON DELETE SET NULL;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS study_unit_id uuid REFERENCES public.study_units(id) ON DELETE SET NULL;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS quiz_type text NOT NULL DEFAULT 'lesson';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS import_key text;
-- For dedicated mixed-topic JSON exams, there is no corresponding source document.
ALTER TABLE public.quizzes ALTER COLUMN document_id DROP NOT NULL;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='quizzes_type_v10_check') THEN
  ALTER TABLE public.quizzes ADD CONSTRAINT quizzes_type_v10_check CHECK (quiz_type IN ('lesson','comprehensive'));
 END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS quizzes_import_key_user_unique ON public.quizzes(user_id,import_key) WHERE import_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS quizzes_unit_idx ON public.quizzes(user_id,study_unit_id);
CREATE INDEX IF NOT EXISTS documents_unit_idx ON public.documents(user_id,study_unit_id);

-- Give each existing document its own unit initially. Users may merge them in UI later.
INSERT INTO public.study_units(id,user_id,title,created_at)
SELECT d.id,d.user_id,CASE WHEN length(trim(d.title)) BETWEEN 2 AND 180 THEN trim(d.title) ELSE left('Bài học '||d.id::text,180) END,d.created_at FROM public.documents d
WHERE d.study_unit_id IS NULL
ON CONFLICT(id) DO NOTHING;
UPDATE public.documents d SET study_unit_id=d.id
WHERE d.study_unit_id IS NULL AND EXISTS (SELECT 1 FROM public.study_units u WHERE u.id=d.id AND u.user_id=d.user_id);
UPDATE public.quizzes q SET study_unit_id=d.study_unit_id
FROM public.documents d
WHERE q.document_id=d.id AND q.user_id=d.user_id AND q.study_unit_id IS NULL;

-- Automatically create a unit when a new theory document is uploaded by the old upload route.
CREATE OR REPLACE FUNCTION public.assign_document_study_unit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.study_unit_id IS NULL THEN
  INSERT INTO public.study_units(id,user_id,title) VALUES (NEW.id,NEW.user_id,CASE WHEN length(trim(NEW.title)) BETWEEN 2 AND 180 THEN trim(NEW.title) ELSE left('Bài học '||NEW.id::text,180) END)
  ON CONFLICT(id) DO NOTHING;
  NEW.study_unit_id := NEW.id;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.study_units WHERE id=NEW.study_unit_id AND user_id=NEW.user_id) THEN
  RAISE EXCEPTION 'Study unit must belong to the same user';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_assign_document_study_unit ON public.documents;
CREATE TRIGGER trg_assign_document_study_unit BEFORE INSERT OR UPDATE OF study_unit_id ON public.documents
 FOR EACH ROW EXECUTE FUNCTION public.assign_document_study_unit();

-- When a document is moved to another study unit, move its old AI quizzes with it.
CREATE OR REPLACE FUNCTION public.sync_quiz_study_unit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' AND NEW.study_unit_id IS DISTINCT FROM OLD.study_unit_id THEN
  UPDATE public.quizzes SET study_unit_id=NEW.study_unit_id
  WHERE document_id=NEW.id AND user_id=NEW.user_id AND quiz_type='lesson';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sync_quiz_study_unit ON public.documents;
CREATE TRIGGER trg_sync_quiz_study_unit AFTER UPDATE OF study_unit_id ON public.documents
 FOR EACH ROW EXECUTE FUNCTION public.sync_quiz_study_unit();

-- Guard quiz linking to another account's unit / document even if someone calls Supabase directly.
CREATE OR REPLACE FUNCTION public.guard_quiz_study_unit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.study_unit_id IS NOT NULL AND NOT EXISTS(
   SELECT 1 FROM public.study_units WHERE id=NEW.study_unit_id AND user_id=NEW.user_id
 ) THEN RAISE EXCEPTION 'Study unit does not belong to user'; END IF;
 IF NEW.document_id IS NOT NULL AND NOT EXISTS(
   SELECT 1 FROM public.documents WHERE id=NEW.document_id AND user_id=NEW.user_id
 ) THEN RAISE EXCEPTION 'Document does not belong to user'; END IF;
 IF NEW.quiz_type='comprehensive' AND NEW.study_unit_id IS NOT NULL THEN
   RAISE EXCEPTION 'Comprehensive quiz must not belong to one study unit';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_quiz_study_unit ON public.quizzes;
CREATE TRIGGER trg_guard_quiz_study_unit BEFORE INSERT OR UPDATE OF study_unit_id,document_id,quiz_type,user_id ON public.quizzes
 FOR EACH ROW EXECUTE FUNCTION public.guard_quiz_study_unit();
COMMIT;
