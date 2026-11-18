"use client";
import {useState} from 'react';
import {browserDb} from '@/lib/supabase-browser';
import Mascot from '@/components/Mascot';
import {BookOpenCheck,LockKeyhole} from 'lucide-react';
export default function Login(){
 const [email,E]=useState(''),[password,P]=useState(''),[loading,L]=useState(false),[message,M]=useState(''),[signup,S]=useState(false);
 async function submit(e:React.FormEvent){
   e.preventDefault();L(true);M('');
   try{
     const db=browserDb();
     if(signup){
       const {data,error}=await db.auth.signUp({email,password});
       if(error)throw error;
       if(data.session)location.href='/dashboard';
       else M('Nếu địa chỉ email hợp lệ, hãy kiểm tra hộp thư để xác nhận tài khoản trước khi đăng nhập.');
     } else {
       const {error}=await db.auth.signInWithPassword({email,password});
       if(error)throw error;
       location.href='/dashboard';
     }
   }catch(e){M(e instanceof Error?e.message:'Có lỗi xảy ra.');}
   finally{L(false)}
 }
 return <main className="login-wrap login-v07"><div className="login-showcase"><Mascot size={300} className="login-mascot" mood="happy"/><span className="eyebrow">CHÀO BẠN, MÌNH LÀ LON TON!</span><h2>Cùng nhau học thêm một điều hay mỗi ngày.</h2><p>Học tập nhẹ nhàng, tiến bộ bền vững.</p></div><form className="login-card" onSubmit={submit}>
 <div className="brand-icon"><BookOpenCheck size={30}/></div><h1>Học cùng <em>lon ton</em></h1>
 <p>Học mỗi ngày, tiến bộ từng chút. Một tài khoản cho mọi không gian học.</p>
 <label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>E(e.target.value)} placeholder="email@example.com"/></label>
 <label>Mật khẩu<input required minLength={6} type="password" autoComplete={signup?'new-password':'current-password'} value={password} onChange={e=>P(e.target.value)} placeholder="••••••••"/></label>
 {message&&<div className="alert">{message}</div>}
 <button className="primary" disabled={loading}>{loading?'Đang xử lý...':signup?'Tạo tài khoản':'Đăng nhập'}</button>
 <button type="button" className="switch-auth" onClick={()=>{S(x=>!x);M('')}}>{signup?'Đã có tài khoản? Đăng nhập':'Chưa có tài khoản? Đăng ký'}</button>
 <div className="lock"><LockKeyhole size={14}/> Dữ liệu mỗi người được tách riêng và đồng bộ.</div>
 </form></main>
}
