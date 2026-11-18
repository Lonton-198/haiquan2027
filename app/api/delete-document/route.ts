import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';

export const runtime = 'nodejs';

// Soft-delete the source record (to protect foreign keys), but purge original bytes and text.
// Existing quizzes, attempts and spaced-repetition progress retain their document_id.
export async function POST(req: NextRequest) {
  try {
    const { db, user } = await requireUser();
    const body: unknown = await req.json();
    const id = typeof body === 'object' && body !== null && 'documentId' in body
      ? (body as {documentId?: unknown}).documentId : undefined;
    if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) {
      throw new Error('Mã tài liệu không hợp lệ.');
    }
    const { data: doc, error: readError } = await db.from('documents')
      .select('id,storage_path,deleted_at').eq('id', id).eq('user_id', user.id).single();
    if (readError || !doc) throw new Error('Không tìm thấy tài liệu thuộc tài khoản của bạn.');

    // Mark as deleted first: prevents new quizzes/viewing while cleanup runs.
    if (!doc.deleted_at) {
      const { error: markError } = await db.from('documents')
        .update({deleted_at: new Date().toISOString()})
        .eq('id', id).eq('user_id', user.id).is('deleted_at', null);
      if (markError) throw markError;
    }

    // Can be retried if Storage failed after the previous archive operation.
    if (doc.storage_path) {
      const { error: storageError } = await db.storage.from('documents').remove([doc.storage_path]);
      if (storageError) {
        // Preserve the old source if its deletion failed on the first attempt.
        if (!doc.deleted_at) await db.from('documents').update({deleted_at:null})
          .eq('id',id).eq('user_id',user.id);
        throw new Error('Không xóa được tệp trong Storage: '+storageError.message);
      }
    }
    // Keep title + id for legacy quizzes and lesson-specific review, discard source contents.
    const { error: purgeError } = await db.from('documents')
      .update({storage_path:'',extracted_text:''}).eq('id',id).eq('user_id',user.id);
    if (purgeError) throw new Error('Tệp đã xóa nhưng chưa dọn được phần chữ: '+purgeError.message);
    return NextResponse.json({ok:true});
  } catch (error) { return failure(error); }
}
