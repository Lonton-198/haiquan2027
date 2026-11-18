import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export function browserDb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
export async function serverDb() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
    cookies: {
      getAll() {return store.getAll()},
      setAll(items) { try {items.forEach(({name,value,options})=>store.set(name,value,options))}catch{/* server component */} }
    }
  });
}
export async function requireUser() {
  const db=await serverDb();
  const {data:{user},error}=await db.auth.getUser();
  if(error||!user) throw new Error('Vui lòng đăng nhập lại.');
  const owner=process.env.OWNER_EMAIL?.trim().toLowerCase();
  if(owner && user.email?.toLowerCase()!==owner) throw new Error('Tài khoản không được cấp quyền.');
  return {db,user};
}
