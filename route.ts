import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';
import { jsonAI, quizSchema, isSupportedQuote, compact } from '@/lib/ai';
export const runtime = 'nodejs';
export const maxDuration = 120;
const prefix = '⏳ [';
const QUESTION_CHUNK = 3;
const MAX_ATTEMPTS_PER_BATCH = 2;
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
    const want = Math.min(QUESTION_CHUNK, remaining);
    const text = String(doc.extracted_text || '');
    if (text.trim().length < 200) throw new Error('Tài liệu thiếu nội dung chữ để tạo câu hỏi.');
    const previous = existing.slice(-20).map(q => q.stem.slice(0, 180));
    const known = new Set(existing.map(q => compact(q.stem)));
    const accepted: typeof existing = [];
    const rejected = { format: 0, quote: 0, duplicate: 0 };
    let lastIssue = '';

    // Keep each request short, allowing the model to produce complete explanations.
    // A zero-valid response gets one bounded automatic retry, never an infinite paid loop.
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_BATCH && accepted.length < want; attempt++) {
      const windowSize = 18000;
      const maxStart = Math.max(0, text.length - windowSize);
      const batchPosition = Math.floor(existing.length / QUESTION_CHUNK) + attempt;
      const cycle = Math.max(1, Math.ceil(target / QUESTION_CHUNK));
      const start = Math.round(maxStart * ((batchPosition % cycle) / Math.max(1, cycle - 1)));
      const source = text.slice(start, start + windowSize);
      const system = `Bạn là chuyên gia biên soạn đề tuyển công chức Hải quan 2027. Chỉ sử dụng tài liệu nguồn được đưa trong prompt. Mỗi câu phải VẬN DỤNG RẤT CAO: tình huống kết hợp quy định, điều kiện, phạm vi, ngoại lệ và chủ thể; 4 đáp án gần nhau, đều hợp lý. Không được tự bịa quy định. Mỗi câu có chính xác 4 phương án choices, 4 choice_explanations giải thích riêng từng đáp án, answer là số 0-3, explanation phân tích lập luận, difficulty là 'rất khó'. source_quote là 1 đoạn chữ NGUYÊN VĂN liên tục dài ít nhất 15 ký tự được sao chép trực tiếp từ tài liệu nguồn, KHÔNG tóm tắt, không dùng dấu ba chấm. Hãy chọn đoạn trích nguồn TRƯỚC, rồi xây dựng câu hỏi dựa vào chính đoạn đó. Nếu nguồn không đủ để đặt câu khó mà đúng, trả ít câu hơn số lượng yêu cầu. JSON phải theo schema.`;
      const prompt = `Tạo tối đa ${want - accepted.length} câu MỚI. Không lặp lại câu trước: ${JSON.stringify([...previous, ...accepted.map(q => q.stem)])}. Ưu tiên tính đúng đắn và tính đầy đủ của 4 lựa chọn, 4 lời giải và nguồn trích hơn số lượng.
TÊN TÀI LIỆU: ${doc.title}
TRÍCH ĐOẠN TÀI LIỆU:
${source}`;
      try {
        const result = await jsonAI(system, prompt, quizSchema);
        for (const q of result.questions) {
          if (accepted.length >= want) break;
          if (q.choices.length !== 4 || q.choice_explanations.length !== 4 ||
              q.choices.some(c => !c.trim()) || q.choice_explanations.some(c => !c.trim()) ||
              !q.explanation.trim() || q.stem.trim().length < 20 ||
              !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
            rejected.format++;
            continue;
          }
          if (!isSupportedQuote(q.source_quote, text)) { rejected.quote++; continue; }
          const key = compact(q.stem);
          if (known.has(key)) { rejected.duplicate++; continue; }
          known.add(key);
          accepted.push(q);
        }
      } catch (err) {
        lastIssue = err instanceof Error ? err.message : 'AI không tạo được câu hợp lệ';
        // Do not repeat requests that failed due to quota, authentication or model access.
        if (/\b(401|403|429)\b|quota|credits|billing|api.key|khóa api|số dư/i.test(lastIssue)) throw err;
      }
      // If we already have valid questions, persist them instead of paying for a retry.
      if (accepted.length > 0) break;
    }
    if (!accepted.length) {
      throw new Error(`Đợt này chưa tạo được câu đạt chuẩn sau tối đa ${MAX_ATTEMPTS_PER_BATCH} lượt. Lý do: ${lastIssue || `thiếu định dạng ${rejected.format}, trích dẫn không khớp ${rejected.quote}, trùng câu ${rejected.duplicate}`}. Các câu cũ vẫn được giữ. Không nên thử liên tục để tránh tốn API.`);
    }
    const updated=[...existing,...accepted];
    const complete=updated.length>=target;
    const title=complete?quiz.title.replace(/^⏳ \[\d+\] /,''):quiz.title;
    const {error:saveError}=await db.from('quizzes').update({questions:updated,title}).eq('id',quiz.id).eq('user_id',user.id);
    if(saveError)throw saveError;
    return NextResponse.json({quizId:quiz.id,target,done:updated.length,complete,added:accepted.length});
  }catch(e){return failure(e)}
}
