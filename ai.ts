import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY' });
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

export const lessonSchema = z.object({
  title: z.string(),
  summary: z.string(),
  key_points: z.array(z.string()),
  pitfalls: z.array(z.string()),
  cases: z.array(z.string()),
});

// Arrays are supported by OpenAI Structured Outputs; positional z.tuple is not.
export const questionSchema = z.object({
  stem: z.string(),
  choices: z.array(z.string()),
  answer: z.number().int(),
  explanation: z.string(),
  choice_explanations: z.array(z.string()),
  source_quote: z.string(),
  difficulty: z.enum(['khó', 'rất khó']),
});
export const quizSchema = z.object({ questions: z.array(questionSchema) });

export function compact(t: string) {
  return t.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim().replace(/[“”]/g, '"');
}
export function isSupportedQuote(quote: string, source: string) {
  return quote.trim().length >= 15 && compact(source).includes(compact(quote));
}

export async function jsonAI<T>(system: string, prompt: string, schema: z.ZodType<T>): Promise<T> {
  if (!process.env.OPENAI_API_KEY) throw new Error('Chưa cấu hình OPENAI_API_KEY.');
  const isQuiz = Object.is(schema, quizSchema);
  const response = await client.chat.completions.parse({
    model,
    messages: [
      { role: 'system', content: system + (isQuiz ? '\nLƯU Ý KIỂM TRA: Mỗi câu cần đúng 4 lựa chọn, đúng 4 lời giải đáp án. source_quote phải là chuỗi chép NGUYÊN VĂN, LIÊN TỤC từ phần NGUỒN TÀI LIỆU, tuyệt đối không diễn đạt lại, không thêm dấu ba chấm. Nếu không tìm được đoạn trích chính xác, không tạo câu đó.' : '') },
      { role: 'user', content: prompt },
    ],
    response_format: zodResponseFormat(schema, isQuiz ? 'quiz_result' : 'lesson_result'),
    max_completion_tokens: 6500,
  });
  const choice = response.choices[0];
  if (choice?.finish_reason === 'length') throw new Error('AI trả lời quá dài và bị cắt. Hãy chọn Tiếp tục tạo.');
  if (choice?.message.refusal) throw new Error('AI từ chối yêu cầu. Hãy chọn trọng tâm khác.');
  if (!choice?.message.parsed) throw new Error('AI không trả đủ cấu trúc dữ liệu. Hãy thử lại.');
  const checked = schema.safeParse(choice.message.parsed);
  if (!checked.success) throw new Error('AI trả dữ liệu sai cấu trúc. Hãy thử lại.');

  // Do not throw away an entire batch if one question is incomplete.
  // The route validates each question separately against the original source.
  return checked.data;
}
