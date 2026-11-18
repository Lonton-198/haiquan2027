import { NextResponse } from 'next/server';

// Supabase errors are plain objects, not instances of Error.
// Preserve their human-readable messages instead of showing “Có lỗi xảy ra”.
export function failure(error: unknown) {
  const obj = error && typeof error === 'object' ? error as Record<string, unknown> : null;
  const message = error instanceof Error ? error.message
    : typeof obj?.message === 'string' && obj.message ? obj.message
    : typeof error === 'string' && error ? error
    : 'Có lỗi xảy ra. Hãy xem log API trên Vercel để biết nguyên nhân.';
  const status = message.includes('đăng nhập') ? 401
    : message.includes('không được cấp quyền') ? 403 : 400;
  // No API keys, request bodies or document contents are returned in errors.
  return NextResponse.json({ error: message, ...(typeof obj?.code === 'string' ? {code:obj.code}: {}) }, { status });
}
