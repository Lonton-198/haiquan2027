"use client";
import {useState} from 'react';
import {browserDb} from '@/lib/supabase-browser';
import {BookOpen,LockKeyhole} from 'lucide-react';
export default function Login(){const [email,E]=useState(''),[password,P]=useState(''),[loading,L]=useState(false),[message,M]=useState('');
 async function login(e:React.FormEvent){e.preventDefault();L(true);M('');const {error}=await browserDb().auth.signInWithPassword({email,password});L(false);if(error)M('Đăng nhập thất bại: '+error.message);else location.href='/dashboard'}
 return <main className="login-wrap"><form className="login-card" onSubmit={login}><div className="brand-icon"><BookOpen size={30}/></div><h1>Hải Quan <em>2027</em></h1><p>Không gian ôn thi dành riêng cho bạn.</p><label>Email<input required type="email" value={email} onChange={e=>E(e.target.value)} placeholder="email@example.com"/></label><label>Mật khẩu<input required type="password" value={password} onChange={e=>P(e.target.value)} placeholder="••••••••"/></label>{message&&<div className="alert">{message}</div>}<button className="primary" disabled={loading}>{loading?'Đang đăng nhập...':'Đăng nhập'}</button><small>Tài khoản cần được tạo trước trong Supabase Auth. Không mở đăng ký công khai.</small><div className="lock"><LockKeyhole size={14}/> Dữ liệu riêng tư, đồng bộ đám mây</div></form></main>}
