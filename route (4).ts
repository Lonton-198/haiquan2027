import {NextRequest,NextResponse} from 'next/server';
import {requireUser} from '@/lib/supabase';
import {failure} from '@/lib/api';
import {validateExam} from '@/lib/quiz-import';
import {createHash} from 'node:crypto';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 try{
  const {db,user}=await requireUser();
  const raw=await req.text();
  if(Buffer.byteLength(raw,'utf8')>2_000_000)throw new Error('File JSON vượt quá giới hạn 2MB.');
  let parsed:unknown;
  try{parsed=JSON.parse(raw)}catch{throw new Error('File không phải JSON hợp lệ. Hãy kiểm tra dấu ngoặc và dấu phẩy.')}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Định dạng file không hợp lệ.');
  const input=parsed as Record<string,unknown>;
  const unitId=typeof input.study_unit_id==='string'?input.study_unit_id:'';
  const docId=typeof input.document_id==='string'?input.document_id:'';
  const content=Object.fromEntries(Object.entries(input).filter(([key])=>!['study_unit_id','document_id'].includes(key)));
  const exam=validateExam(content);
  if(exam.kind==='lesson'){
   if(!unitId)throw new Error('Đề theo bài phải chọn một Bài học trước khi nhập.');
   const {data:unit,error}=await db.from('study_units').select('id').eq('id',unitId).eq('user_id',user.id).single();
   if(error||!unit)throw new Error('Bài học không tồn tại hoặc không thuộc tài khoản của bạn.');
  }else if(unitId||docId){throw new Error('Đề tổng hợp phải nằm ở kho đề tổng hợp riêng.');}
  let linkedDoc:string|null=null;
  if(docId){
   const {data,error}=await db.from('documents').select('id').eq('id',docId).eq('study_unit_id',unitId).eq('user_id',user.id).single();
   if(error||!data)throw new Error('Tài liệu nguồn không nằm trong bài học đã chọn.');
   linkedDoc=docId;
  }
  // Identical JSON is idempotent for the same account. A changed file creates a new exam.
  const importKey=createHash('sha256').update(JSON.stringify({content:exam,unitId,docId})).digest('hex');
  const {data:existing}=await db.from('quizzes').select('id,title').eq('user_id',user.id).eq('import_key',importKey).maybeSingle();
  if(existing)return NextResponse.json({id:existing.id,duplicate:true,title:existing.title,count:exam.questions.length});
  const {data,error}=await db.from('quizzes').insert({user_id:user.id,title:exam.title,
   document_id:linkedDoc,study_unit_id:exam.kind==='lesson'?unitId:null,
   quiz_type:exam.kind,import_key:importKey,questions:exam.questions}).select('id,title').single();
  if(error){
   if(error.code==='23505')return NextResponse.json({duplicate:true,title:exam.title,count:exam.questions.length});
   throw new Error(error.message);
  }
  return NextResponse.json({id:data.id,title:data.title,count:exam.questions.length,duplicate:false});
 }catch(e){return failure(e)}
}
