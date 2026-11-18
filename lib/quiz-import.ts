import {z} from 'zod';

const text = (min:number,max=12000)=>z.string().trim().min(min).max(max);
const question = z.object({
 stem:text(12,12000),
 choices:z.tuple([text(1,4000),text(1,4000),text(1,4000),text(1,4000)]),
 answer:z.union([z.number().int().min(0).max(3),z.enum(['A','B','C','D'])]),
 explanation:text(8,16000),
 choice_explanations:z.tuple([z.string().max(8000),z.string().max(8000),z.string().max(8000),z.string().max(8000)]).optional(),
 source_quote:z.string().max(8000).optional(),
 difficulty:z.enum(['khó','rất khó']).default('rất khó'),
}).strict();
export const importQuizSchema=z.object({
 format:z.literal('lonton-quiz-v1'),
 title:text(3,180),
 kind:z.enum(['lesson','comprehensive']),
 questions:z.array(question).min(1).max(200),
}).strict();
export type ImportedExam=z.infer<typeof importQuizSchema>;
export function validateExam(raw:unknown){
 const parsed=importQuizSchema.safeParse(raw);
 if(!parsed.success){
  const issues=parsed.error.issues.slice(0,12).map(x=>`${x.path.join('.')||'file'}: ${x.message}`);
  throw new Error('File JSON chưa đúng cấu trúc: '+issues.join(' | '));
 }
 const seen=new Set<string>();
 return {...parsed.data,questions:parsed.data.questions.map((q,i)=>{
  const key=q.stem.toLowerCase().normalize('NFC').replace(/\s+/g,' ').trim();
  if(seen.has(key))throw new Error(`Câu ${i+1} trùng nguyên văn nội dung câu hỏi trong cùng bộ đề.`);
  seen.add(key);
  if(new Set(q.choices.map(x=>x.toLowerCase().trim())).size!==4) throw new Error(`Câu ${i+1}: bốn phương án không được trùng nhau.`);
  return {
   stem:q.stem, choices:q.choices,
   answer:typeof q.answer==='number'?q.answer:'ABCD'.indexOf(q.answer),
   explanation:q.explanation,
   choice_explanations:q.choice_explanations||['','','',''],
   source_quote:q.source_quote||'Căn cứ: xem phần giải thích của bộ đề nhập.',
   difficulty:q.difficulty,
  };
 })};
}
