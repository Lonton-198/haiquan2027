import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';
import { jsonAI, quizSchema, compact } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Keep each paid call small. The browser advances the saved job in separate requests.
const PER_CALL = 2;
const ATTEMPTS = 2;
const LIMITS = [10,20,30,40,60,100];
const DRAFT = /^⏳ \[(\d+)\] /;

// The model selects a source passage by index; the server supplies the actual quote.
// This prevents slight paraphrases/punctuation changes from invalidating every question.
const candidateSchema = z.object({
  stem: z.string(),
  choices: z.array(z.string()),
  answer: z.number().int(),
  explanation: z.string(),
  choice_explanations: z.array(z.string()),
  source_index: z.number().int(),
  difficulty: z.enum(['khó','rất khó']),
});
const candidatesSchema = z.object({ questions: z.array(candidateSchema) });
type Candidate = z.infer<typeof candidateSchema>;

function passages(text: string): string[] {
  // Prefer paragraphs, but split long paragraphs (common in PDF extraction).
  const normalized = text.replace(/\r\n/g,'\n').trim();
  const paragraphs = normalized.split(/\n\s*\n|\n(?=Điều\s+\d+\b)/gi).map(s=>s.trim()).filter(s=>s.length>=70);
  const parts = paragraphs.length ? paragraphs : [normalized];
  const out: string[] = [];
  for (const p of parts) {
    for(let i=0;i<p.length;i+=850) {
      const piece=p.slice(i,i+850).trim();
      if(piece.length>=70) out.push(piece);
    }
  }
  return out;
}
function selectPassages(parts: string[], current: number, attempt: number, topic: string): string[] {
  // Rotate across the source as more questions are saved rather than feeding the same first page.
  const max = Math.min(9,parts.length);
  const result: string[] = [];
  const focus = compact(topic);
  if(focus){
    const terms = focus.split(' ').filter(t=>t.length>3);
    const ranked = parts.map((p,i)=>({p,i,s:terms.filter(t=>compact(p).includes(t)).length})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
    for(const x of ranked.slice((current+attempt)%Math.max(1,ranked.length), (current+attempt)%Math.max(1,ranked.length)+3)) result.push(x.p);
  }
  const step = Math.max(1,Math.floor(parts.length/max));
  const offset = (current*3 + attempt*5)%parts.length;
  for(let i=0;i<parts.length && result.length<max;i++){
    const p=parts[(offset+i*step)%parts.length];
    if(!result.includes(p))result.push(p);
  }
  return result;
}
function fingerprint(s:string){
  return compact(s).replace(/[^\p{L}\p{N}]/gu,'').slice(0,600);
}
function valid(q:Candidate, evidence:string[], known:Set<string>): boolean {
  if(!Number.isInteger(q.source_index)||!evidence[q.source_index])return false;
  if(q.choices.length!==4||q.choice_explanations.length!==4)return false;
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)return false;
  if(q.stem.trim().length<35||q.explanation.trim().length<25)return false;
  if(q.choices.some(c=>c.trim().length<4)||q.choice_explanations.some(c=>c.trim().length<8))return false;
  if(new Set(q.choices.map(compact)).size!==4)return false;
  const key=fingerprint(q.stem);
  if(known.has(key))return false;
  return true;
}

export async function POST(req:NextRequest){
  try {
    const {db,user}=await requireUser();
    const body=await req.json();
    if(body.action==='start'){
      const target=Number(body.count);
      if(!Number.isInteger(target)||!LIMITS.includes(target))throw new Error('Số câu không hợp lệ.');
      if(typeof body.documentId!=='string')throw new Error('Thiếu tài liệu.');
      const {data:doc,error}=await db.from('documents').select('id,title').eq('id',body.documentId).eq('user_id',user.id).is('deleted_at',null).single();
      if(error||!doc)throw new Error('Không tìm thấy tài liệu.');
      const topic=typeof body.topic==='string'?body.topic.trim().slice(0,140):'';
      const title=`⏳ [${target}] Đề ${topic||doc.title} • ${new Date().toLocaleDateString('vi-VN')}`;
      const {data:quiz,error:saveError}=await db.from('quizzes').insert({user_id:user.id,document_id:doc.id,title,questions:[]}).select('id').single();
      if(saveError||!quiz)throw saveError||new Error('Không tạo được đề.');
      return NextResponse.json({quizId:quiz.id,target,done:0,complete:false});
    }
    if(body.action!=='batch'||typeof body.quizId!=='string')throw new Error('Yêu cầu không hợp lệ.');
    const {data:quiz,error:quizError}=await db.from('quizzes').select('id,title,document_id,questions').eq('id',body.quizId).eq('user_id',user.id).single();
    if(quizError||!quiz)throw new Error('Không tìm thấy bộ đề.');
    const match=DRAFT.exec(quiz.title);
    const rawQuestions=Array.isArray(quiz.questions)?quiz.questions:[];
    if(!match)return NextResponse.json({quizId:quiz.id,target:rawQuestions.length,done:rawQuestions.length,complete:true});
    const target=Number(match[1]);
    const old=quizSchema.safeParse({questions:rawQuestions});
    if(!old.success)throw new Error('Dữ liệu đề đã lưu không hợp lệ. Chưa thay đổi các câu cũ.');
    const existing=old.data.questions;
    if(existing.length>=target)return NextResponse.json({quizId:quiz.id,target,done:existing.length,complete:true});
    const {data:doc,error:docError}=await db.from('documents').select('title,extracted_text').eq('id',quiz.document_id).eq('user_id',user.id).is('deleted_at',null).single();
    if(docError||!doc)throw new Error('Không tìm thấy tài liệu nguồn.');
    const source=String(doc.extracted_text||'');
    if(source.trim().length<200)throw new Error('Tài liệu quá ít chữ để tạo đề.');
    const parts=passages(source);
    if(!parts.length)throw new Error('Không tách được đoạn căn cứ từ tài liệu.');
    const topic=quiz.title.replace(DRAFT,'');
    const want=Math.min(PER_CALL,target-existing.length);
    const known=new Set(existing.map(q=>fingerprint(q.stem)));
    const accepted: typeof existing=[];
    const rejects={structure:0,duplicate:0};
    let lastError='';

    for(let attempt=0;attempt<ATTEMPTS && accepted.length<want;attempt++){
      const refs=selectPassages(parts,existing.length,attempt,topic);
      const system=`Bạn là chuyên gia xây dựng đề tuyển công chức Hải quan 2027. Chỉ dựa vào văn bản nguồn được cung cấp, không tự bịa căn cứ. Tạo câu hỏi VẬN DỤNG RẤT CAO: tình huống có nhiều điều kiện/ngoại lệ, đối chiếu chủ thể và phạm vi, bốn phương án đều có tính nhiễu hợp lý và gần nhau. Phân tích rõ tại sao phương án đúng và từng phương án sai. Mỗi câu bắt buộc có 4 choices, 4 choice_explanations, answer là chỉ số 0-3, difficulty='rất khó'. source_index là số thứ tự (bắt đầu 0) của đoạn NGUỒN có đủ căn cứ cho câu; chỉ lựa chọn từ các số được đưa. Nếu nguồn không đủ căn cứ, trả ít câu hoặc mảng rỗng. Không chép/cải biên quy định ở ngoài nguồn.`;
      const prompt=`Tạo tối đa ${want-accepted.length} câu mới. Những câu không được lặp nội dung: ${JSON.stringify([...existing.slice(-40).map(q=>q.stem),...accepted.map(q=>q.stem)])}.\nTài liệu: ${doc.title}\nDữ liệu chứng cứ đánh số:\n${refs.map((p,i)=>`[${i}] ${p}`).join('\n\n')}`;
      try {
        const result=await jsonAI(system,prompt,candidatesSchema);
        for(const q of result.questions){
          if(accepted.length>=want)break;
          const evidence=refs[q.source_index];
          if(!evidence||!valid(q,refs,known)){rejects.structure++;continue;}
          const key=fingerprint(q.stem);
          if(known.has(key)){rejects.duplicate++;continue;}
          // The provenance comes from source bytes, NEVER from AI-generated text.
          // Keep a short exact excerpt for the existing quiz UI.
          const quote=evidence;
          known.add(key);
          accepted.push({...q,source_quote:quote,difficulty:'rất khó'});
        }
      } catch(err){lastError=err instanceof Error?err.message:'AI không trả dữ liệu hợp lệ';}
      if(accepted.length)break; // avoid paying for a second response if at least one question was saved
    }

    if(!accepted.length){
      // Return a pause instead of throwing away the saved quiz or silently retrying forever.
      return NextResponse.json({quizId:quiz.id,target,done:existing.length,complete:false,paused:true,
        reason:lastError||`Không tìm được câu đạt tiêu chuẩn trong lượt này (bị loại ${rejects.structure}). Không mất câu đã lưu; không tự gọi API thêm.`});
    }
    // Atomic append through a database function. Never put a growing array of
    // old questions in the URL: large draft quizzes otherwise trigger 414/400 errors.
    // The function checks the previous count under the row lock, preserving
    // questions saved by another browser tab.
    const {data:saved,error:saveError}=await db.rpc('append_quiz_batch',{
      p_quiz_id:quiz.id,
      p_expected_count:existing.length,
      p_target:target,
      p_new_questions:accepted,
    });
    if(saveError){
      if(saveError.code==='PGRST202')throw new Error('Chưa chạy SQL cập nhật v0.8.3 trong Supabase (append_quiz_batch).');
      throw saveError;
    }
    if(!saved || saved.saved!==true)return NextResponse.json({quizId:quiz.id,target,done:existing.length,complete:false,paused:true,
      reason:'Đề vừa được cập nhật từ một phiên làm việc khác. Tải lại trang để tiếp tục, không ghi đè các câu đã lưu.'});
    return NextResponse.json({quizId:quiz.id,target,done:saved.done,complete:saved.complete,added:accepted.length});
  }catch(err){return failure(err)}
}
