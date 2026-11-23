import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { requireUser } from '@/lib/supabase';
import { failure } from '@/lib/api';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  const {db,user}=await requireUser();
  const data=await req.formData(), file=data.get('file');
  if(!(file instanceof File))throw new Error('Chưa chọn tài liệu.');
  if(file.size>10*1024*1024)throw new Error('Tệp vượt giới hạn 10MB.');
  const ext=file.name.split('.').pop()?.toLowerCase();
  if(!['pdf','docx'].includes(ext||''))throw new Error('Chỉ hỗ trợ PDF và DOCX. File .doc cũ cần chuyển thành .docx.');
  const buffer=Buffer.from(await file.arrayBuffer());
  let text='';
  if(ext==='docx')text=(await mammoth.extractRawText({buffer})).value;
  else { const pdfParse=(await import('pdf-parse')).default; text=(await pdfParse(buffer)).text; }
  text=text.replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').trim();
  if(text.length<100)throw new Error('Không trích xuất được chữ. PDF scan ảnh cần OCR, chưa hỗ trợ ở bản này.');
  const path=`${user.id}/${crypto.randomUUID()}.${ext}`;
  const {error:uploadErr}=await db.storage.from('documents').upload(path,buffer,{contentType:ext==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  if(uploadErr)throw uploadErr;
  const {data:document,error:dbErr}=await db.from('documents').insert({user_id:user.id,title:file.name.replace(/\.[^.]+$/,''),filename:file.name,storage_path:path,extracted_text:text}).select('id,title').single();
  if(dbErr){await db.storage.from('documents').remove([path]);throw dbErr;}
  return NextResponse.json({document});
 }catch(e){return failure(e)}
}
