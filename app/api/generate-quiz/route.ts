import { NextRequest,NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';
import { jsonAI,quizSchema,isSupportedQuote } from '@/lib/ai';
export const runtime='nodejs';
export const maxDuration=120;
export async function POST(req:NextRequest){
 try{
 const {db,user}=await requireUser();const {documentId,topic,count}=await req.json();
 const n=Number(count);if(!Number.isInteger(n)||n<5||n>20)throw new Error('Mỗi lượt sinh 5–20 câu để đảm bảo chất lượng; có thể tạo nhiều bộ.');
 if(typeof documentId!=='string')throw new Error('Thiếu tài liệu');
 const {data:doc,error}=await db.from('documents').select('id,title,extracted_text').eq('id',documentId).eq('user_id',user.id).single();if(error||!doc)throw new Error('Không tìm thấy tài liệu');
 const focus=typeof topic==='string'?topic.trim().slice(0,160):'';
 const result=await jsonAI('Bạn là người soạn đề thi tuyển công chức Hải quan 2027, độ khó rất cao. CHỈ lấy căn cứ từ văn bản đã đưa. Trả về JSON object {"questions":[...]}. Mỗi câu: stem là tình huống vận dụng hoặc kết hợp quy định; choices đúng 4 phương án ngang độ dài, phân biệt tinh vi về ngoại lệ, điều kiện, chủ thể, phạm vi, thời hạn; answer là index 0–3; explanation phân tích có căn cứ; choice_explanations là mảng 4 phân tích đúng/sai từng lựa chọn; source_quote là một TRÍCH DẪN NGUYÊN VĂN CÓ LIÊN TỤC từ tài liệu, dài ít nhất 15 ký tự, dùng đối chiếu; difficulty nhận "khó" hoặc "rất khó". Không bịa quy định. Nếu thông tin không đủ hãy chỉ hỏi nội dung có căn cứ. Không viện dẫn nguồn khác.','Tạo '+n+' câu cho chủ đề '+(focus||'toàn bộ tài liệu')+' theo nguồn: '+doc.title+'\nNỘI DUNG NGUỒN (giới hạn 45.000 ký tự):\n'+doc.extracted_text.slice(0,45000),quizSchema);
 const verified=result.questions.filter(q=>isSupportedQuote(q.source_quote,doc.extracted_text));
 if(!verified.length)throw new Error('Không xác minh được trích dẫn câu hỏi với tài liệu. Hãy thử lại hoặc chọn nguồn khác.');
 const {data:quiz,error:saveErr}=await db.from('quizzes').insert({user_id:user.id,document_id:doc.id,title:'Đề '+(focus||doc.title)+' • '+new Date().toLocaleDateString('vi-VN'),questions:verified}).select('*').single();if(saveErr)throw saveErr;
 return NextResponse.json({quiz,warning:verified.length<n?`Chỉ ${verified.length}/${n} câu có trích dẫn nguồn khớp, đã loại câu chưa xác minh.`:null});
 }catch(e){return failure(e)}
}
