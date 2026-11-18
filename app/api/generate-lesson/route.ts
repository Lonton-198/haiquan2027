import { NextRequest,NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';
import { jsonAI,lessonSchema } from '@/lib/ai';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
 const {db,user}=await requireUser(); const {documentId,topic}=await req.json();
 if(typeof documentId!=='string')throw new Error('Thiếu tài liệu');
 const {data:doc,error}=await db.from('documents').select('id,title,extracted_text').eq('id',documentId).eq('user_id',user.id).single();if(error||!doc)throw new Error('Không tìm thấy tài liệu');
 const focus=typeof topic==='string'?topic.trim().slice(0,160):'';
 const lesson=await jsonAI('Bạn là giảng viên ôn thi công chức Hải quan Việt Nam. Chỉ sử dụng dữ liệu được cung cấp. Không sáng tác quy phạm, không khẳng định văn bản còn hiệu lực khi chưa kiểm chứng. Trả về JSON với các trường title, summary, key_points (mảng chuỗi), pitfalls (mảng chuỗi), cases (mảng chuỗi). Nếu thiếu thông tin phải nêu rõ.','Tài liệu: '+doc.title+'\nChủ đề mong muốn: '+(focus||'Tổng quan nội dung tài liệu')+'\nNỘI DUNG NGUỒN (giới hạn 30.000 ký tự):\n'+doc.extracted_text.slice(0,30000),lessonSchema);
 const {data:row,error:saveErr}=await db.from('lessons').insert({user_id:user.id,document_id:doc.id,topic:focus||'Tổng quan',content:lesson}).select('*').single();if(saveErr)throw saveErr;
 return NextResponse.json({lesson:row});
 }catch(e){return failure(e)}
}
