import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function serverDb() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return store.getAll(); },
      setAll(items: { name: string; value: string; options?: any }[]) {
        try { items.forEach(({name, value, options}) => store.set(name, value, options)); }
        catch { /* Not allowed to modify cookies in a Server Component. */ }
      }
    }
  });
}
export async function requireUser() {
  const db = await serverDb();
  const {data:{user}, error} = await db.auth.getUser();
  if(error || !user) throw new Error('Vui lòng đăng nhập lại.');
  // Per-account RLS protects all users; OWNER_EMAIL is not an access restriction.
  return {db, user};
}
