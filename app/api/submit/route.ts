import { NextRequest,NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';
import { quizSchema } from '@/lib/ai';
export async function POST(req:NextRequest){
 try{
 const {db,user}=await requireUser();const {quizId,answers,seconds}=await req.json();
 if(typeof quizId!=='string'||!Array.isArray(answers))throw new Error('Dữ liệu bài làm không hợp lệ');
 const {data:quiz,error}=await db.from('quizzes').select('id,questions').eq('id',quizId).eq('user_id',user.id).single();if(error||!quiz)throw new Error('Không tìm thấy đề thi');
 const parsed=quizSchema.parse({questions:quiz.questions});
 if(answers.length!==parsed.questions.length||answers.some(a=>a!==null&&(!Number.isInteger(a)||a<0||a>3)))throw new Error('Đáp án không hợp lệ');
 const correct=parsed.questions.reduce((s,q,i)=>s+(answers[i]===q.answer?1:0),0);
 const {data:attempt,error:saveErr}=await db.from('attempts').insert({user_id:user.id,quiz_id:quizId,answers,correct,total:parsed.questions.length,seconds:Math.max(0,Math.min(86400,Math.floor(Number(seconds)||0)))}).select('*').single();if(saveErr)throw saveErr;
 return NextResponse.json({attempt});
 }catch(e){return failure(e)}
}
