-- V0.7.1: archive an uploaded source without deleting its saved quizzes.
-- Keep the documents row so quizzes.document_id and lessons.document_id still point to it.
-- The API removes the Storage file and clears extracted_text after archiving.
-- This migration DOES NOT delete quizzes, attempts, review_progress or any existing document.
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS documents_user_active_idx
  ON public.documents(user_id, created_at DESC) WHERE deleted_at IS NULL;
