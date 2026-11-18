import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';
export const runtime = 'nodejs';
export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) throw new Error('Thiếu mã tài liệu.');
    const {db,user} = await requireUser();
    const {data:doc,error} = await db.from('documents')
      .select('id,title,filename,storage_path,extracted_text')
      .eq('user_id',user.id).eq('id',id).single();
    if(error || !doc) throw new Error('Không tìm thấy tài liệu thuộc tài khoản.');
    const {data:signed,error:signError} = await db.storage.from('documents')
      .createSignedUrl(doc.storage_path,60*10);
    if(signError || !signed?.signedUrl) throw new Error('Không tạo được đường dẫn mở tài liệu: '+(signError?.message||''));
    return NextResponse.json({document:{id:doc.id,title:doc.title,filename:doc.filename,text:doc.extracted_text},url:signed.signedUrl});
  }catch(e){return failure(e)}
}
