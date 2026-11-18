import OpenAI from 'openai';
import { z } from 'zod';
const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY'});
const model=process.env.OPENAI_MODEL || 'gpt-4.1-mini';
export const lessonSchema=z.object({title:z.string(),summary:z.string(),key_points:z.array(z.string()),pitfalls:z.array(z.string()),cases:z.array(z.string())});
export const questionSchema=z.object({stem:z.string(),choices:z.tuple([z.string(),z.string(),z.string(),z.string()]),answer:z.number().int().min(0).max(3),explanation:z.string(),choice_explanations:z.tuple([z.string(),z.string(),z.string(),z.string()]),source_quote:z.string().min(15),difficulty:z.enum(['khó','rất khó'])});
export const quizSchema=z.object({questions:z.array(questionSchema)});
export async function jsonAI<T>(system:string,prompt:string,schema:z.ZodType<T>):Promise<T> {
 if(!process.env.OPENAI_API_KEY)throw new Error('Chưa cấu hình OPENAI_API_KEY.');
 const response=await client.chat.completions.create({model,messages:[{role:'system',content:system},{role:'user',content:prompt}],response_format:{type:'json_object'},max_completion_tokens:13000});
 const content=response.choices[0]?.message?.content;
 if(!content)throw new Error('AI không trả lời.');
 try {return schema.parse(JSON.parse(content))} catch {throw new Error('AI trả dữ liệu chưa hợp lệ. Hãy thử lại.')}
}
export function compact(t:string){return t.toLowerCase().replace(/\s+/g,' ').trim().replace(/[“”]/g,'"')}
export function isSupportedQuote(quote:string,source:string){return compact(source).includes(compact(quote))}
