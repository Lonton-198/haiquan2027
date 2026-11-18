import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';
import { jsonAI, quizSchema, isSupportedQuote, compact } from '@/lib/ai';
export const runtime = 'nodejs';
export const maxDuration = 120;
const prefix = '⏳ [';
const QUESTION_CHUNK = 6;
function targetFromTitle(title:string) {
  const match = /^⏳ \[(\d+)\] /.exec(title);
  return match ? Number(match[1]) : null;
}
export async function POST(req:NextRequest) {
  try {
    const {db,user} = await requireUser();
    const body = await req.json();
    if (body.action === 'start') {
      const {documentId,topic,count} = body;
      const target = Number(count);
      if(!Number.isInteger(target) || ![10,20,30,40,60,100].includes(target)) throw new Error('Số câu không hợp lệ.');
      if(typeof documentId !== 'string') throw new Error('Thiếu tài liệu.');
      const {data:doc,error} = await db.from('documents').select('id,title').eq('id',documentId).eq('user_id',user.id).single();
      if(error||!doc) throw new Error('Không tìm thấy tài liệu.');
      const focus = typeof topic==='string' ? topic.trim().slice(0,140) : '';
      const name = 'Đề '+(focus || doc.title)+' • '+new Date().toLocaleDateString('vi-VN');
      const {data:quiz,error:insertError} = await db.from('quizzes').insert({user_id:user.id,document_id:doc.id,title:`${prefix}${target}] ${name}`,questions:[]}).select('id,title,questions').single();
      if(insertError || !quiz) throw insertError||new Error('Không lưu được bộ đề.');
      return NextResponse.json({quizId:quiz.id,target,done:0,complete:false});
    }
    if(body.action !== 'batch' || typeof body.quizId !== 'string') throw new Error('Yêu cầu tạo đề không hợp lệ.');
    const {data:quiz,error:quizError} = await db.from('quizzes').select('id,title,document_id,questions').eq('id',body.quizId).eq('user_id',user.id).single();
    if(quizError||!quiz) throw new Error('Không tìm thấy bộ đề.');
    const target=targetFromTitle(quiz.title);
    if(target===null) return NextResponse.json({quizId:quiz.id,target:quiz.questions.length,done:quiz.questions.length,complete:true});
    const existing = quizSchema.parse({questions:quiz.questions}).questions;
    const remaining=target-existing.length;
    if(remaining<=0) return NextResponse.json({quizId:quiz.id,target,done:existing.length,complete:true});
    const {data:doc,error:docError} = await db.from('documents').select('id,title,extracted_text').eq('id',quiz.document_id).eq('user_id',user.id).single();
    if(docError||!doc) throw new Error('Không tìm thấy tài liệu nguồn.');
    const want = Math.min(QUESTION_CHUNK,remaining);
    const text=doc.extracted_text as string;
    // Rotate windows across the ENTIRE source for broader coverage, each with overlap.
    const windowSize=35000;
    const maxStart=Math.max(0,text.length-windowSize);
    const batches=Math.ceil(target/QUESTION_CHUNK);
    const index=Math.floor(existing.length/QUESTION_CHUNK);
    const start=batches<=1?0:Math.round(maxStart*index/(batches-1));
    const source=text.slice(start,start+windowSize);
    const previous=existing.slice(-12).map(q=>q.stem.slice(0,180));
    const system=`Bạn là chuyên gia biên soạn đề tuyển công chức Hải quan 2027. CHỈ DÙNG TÀI LIỆU NGUỒN ĐƯỢC CUNG CẤP. Trả về JSON object có mảng questions với ĐÚNG số câu được yêu cầu. Mỗi câu phải ở mức VẬN DỤNG RẤT CAO: tình huống nhiều điều kiện, kết hợp quy định có trong nguồn, thay đổi chủ thể/thời hạn/phạm vi/ngoại lệ, đòi hỏi suy luận chứ không hỏi chép nguyên văn. 4 lựa chọn gần nhau về chiều dài, đều có vẻ hợp lý; mỗi lựa chọn chỉ lệch tinh vi ở điều kiện, thẩm quyền hoặc ngoại lệ. Không dùng các đáp án ngớ ngẩn hoặc 'tất cả đều đúng'. answer là chỉ số 0,1,2,3; explanation là phân tích logic và căn cứ; choice_explanations là 4 giải thích đúng/sai RIÊNG BIỆT. source_quote là đoạn trích NGUYÊN VĂN, LIÊN TỤC, >=15 ký tự có trong tài liệu; trích nguyên chữ, không thêm dấu ba chấm. difficulty luôn là 'rất khó'. KHÔNG tự bịa điều khoản, số ngày, cơ quan, hiệu lực hay trường hợp ngoại lệ. Khi nguồn không đủ để đặt câu suy luận, chỉ hỏi điều kiện được văn bản xác nhận. Đảm bảo đáp án chính xác dựa trên văn bản. Hạn chế các tình huống trùng với câu trước.`;
    const prompt=`Tạo chính xác ${want} câu mới thuộc bộ đề: ${quiz.title.replace(/^⏳ \[\d+\] /,'')}. Đợt ${index+1}/${batches}. Tránh trùng với các câu sau: ${JSON.stringify(previous)}.\nNGUỒN TÀI LIỆU: ${doc.title}\n${source}`;
    const result=await jsonAI(system,prompt,quizSchema);
    const known=new Set(existing.map(q=>compact(q.stem)));
    const accepted=[];
    for(const q of result.questions) {
      const key=compact(q.stem);
      if(!isSupportedQuote(q.source_quote,text) || known.has(key)) continue;
      known.add(key); accepted.push(q);
      if(accepted.length===want)break;
    }
    if(!accepted.length) throw new Error('Không có câu mới đạt kiểm tra trích dẫn. Các câu đã tạo vẫn được giữ; hãy bấm Tiếp tục tạo để thử lại.');
    const updated=[...existing,...accepted];
    const complete=updated.length>=target;
    const title=complete?quiz.title.replace(/^⏳ \[\d+\] /,''):quiz.title;
    const {error:saveError}=await db.from('quizzes').update({questions:updated,title}).eq('id',quiz.id).eq('user_id',user.id);
    if(saveError)throw saveError;
    return NextResponse.json({quizId:quiz.id,target,done:updated.length,complete,added:accepted.length});
  }catch(e){return failure(e)}
}
