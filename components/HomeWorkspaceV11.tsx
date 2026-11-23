'use client';

import {useMemo,useState} from 'react';
import Mascot from '@/components/Mascot';
import {Anchor,ArrowRight,BookOpen,CalendarDays,CheckCircle2,ChevronRight,Clock3,Compass,Flame,GraduationCap,Landmark,Medal,RotateCcw,Ship,Target,TrendingUp} from 'lucide-react';
import type {StudyUnit} from '@/components/StudyLibrary';

type Entry={created_at:string;correct:number;total:number};
type Review={due_at:string};
type Section='overview'|'documents'|'quizzes'|'review'|'results';
type Props={name:string;units:StudyUnit[];docCount:number;quizCount:number;attempts:Entry[];reviewRows:Review[];streak:number;percent:number;onGo:(section:Section)=>void;onOpenUnit:(unitId:string)=>void};
function dayKey(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const dayNames=['CN','T2','T3','T4','T5','T6','T7'];
export default function HomeWorkspaceV11({name,units,docCount,quizCount,attempts,reviewRows,streak,percent,onGo,onOpenUnit}:Props){
 const [view,setView]=useState<'timeline'|'week'>('timeline');
 const [filter,setFilter]=useState('');
 const today=useMemo(()=>new Date(),[]);
 const now=today.getTime();
 const due=reviewRows.filter(row=>new Date(row.due_at).getTime()<=now).length;
 const days=Array.from({length:7},(_,i)=>{const d=new Date(today.getFullYear(),today.getMonth(),today.getDate()+i);const key=dayKey(d);return {key,date:d,count:reviewRows.filter(r=>dayKey(new Date(r.due_at))===key).length};});
 const recent=Array.from({length:7},(_,i)=>{const d=new Date(today.getFullYear(),today.getMonth(),today.getDate()-6+i);return {date:d,count:attempts.filter(a=>dayKey(new Date(a.created_at))===dayKey(d)).length};});
 const maxCount=Math.max(1,...recent.map(x=>x.count));
 const filtered=units.filter(u=>u.title.toLowerCase().includes(filter.trim().toLowerCase()));
 const firstName=name.trim().split(/\s+/)[0]||'bạn';
 const totalQuestions=attempts.reduce((sum,a)=>sum+a.total,0);
 return <div className="ow-home">
  <div className="ow-heading"><div><span className="ow-overline"><Anchor size={14}/> OCEAN WORKSPACE · HỌC CÙNG LON TON</span><h1>Góc học của {firstName} <span>🌊</span></h1><p>Một nơi thật yên để học đều đặn, ghi nhớ lâu hơn và tiến bộ mỗi ngày.</p></div><div className="ow-heading-mascot"><Mascot size={95} mood="calm"/></div></div>
  <div className="ow-layout">
   <aside className="ow-library"><div className="ow-pane-title"><div><span>THƯ VIỆN CỦA BẠN</span><h2>Không gian học</h2></div><Compass size={22}/></div>
    <button className="ow-space-item current" onClick={()=>onGo('overview')}><Landmark size={21}/><span><b>Ôn thi Hải quan 2027</b><small>{units.length} bài học · {quizCount} bộ đề</small></span><ChevronRight size={16}/></button>
    <label className="ow-search">Tìm bài học<input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Tên bài hoặc chuyên đề..."/></label>
    <div className="ow-list-heading"><span>DANH SÁCH BÀI HỌC</span><b>{filtered.length}</b></div>
    <div className="ow-unit-list">{filtered.length?filtered.map((u,i)=><button key={u.id} className="ow-unit" onClick={()=>onOpenUnit(u.id)}><span className="ow-unit-num">{String(units.indexOf(u)+1).padStart(2,'0')}</span><span>{u.title}</span><ChevronRight size={15}/></button>):<p className="ow-no-units">{units.length?'Không tìm thấy bài phù hợp.':'Chưa có bài học. Mở thư viện để tạo bài mới.'}</p>}</div>
    <button className="ow-library-link" onClick={()=>onGo('documents')}><BookOpen size={17}/> Mở toàn bộ thư viện <ArrowRight size={16}/></button>
    <div className="ow-lighthouse" aria-hidden="true"><div className="ow-light-beam"/><div className="ow-light-tower"><span/></div><div className="ow-sea-line"/><div className="ow-island"/></div>
   </aside>
   <div className="ow-main-column"><section className="ow-banner"><div className="ow-banner-copy"><span className="ow-banner-label"><Ship size={16}/> HÀNH TRÌNH TRI THỨC</span><h2>Hôm nay mình<br/>học gì nào?</h2><p>Cứ đi từng bước nhỏ, rồi sẽ đến được bến bờ mục tiêu.</p><button onClick={()=>onGo(due?'review':'documents')}>{due?`Ôn ${due} câu đến hạn`:'Bắt đầu học ngay'} <ArrowRight size={18}/></button></div><div className="ow-banner-dog"><Mascot size={225} mood="calm"/></div><div className="ow-banner-waves" aria-hidden="true"/></section>
    <div className="ow-metrics"><button onClick={()=>onGo('documents')}><BookOpen size={20}/><strong>{docCount}</strong><small>Tài liệu</small></button><button onClick={()=>onGo('results')}><Target size={20}/><strong>{percent}%</strong><small>Trả lời đúng</small></button><button onClick={()=>onGo('results')}><Flame size={20}/><strong>{streak} ngày</strong><small>Chuỗi học</small></button><button onClick={()=>onGo('review')}><RotateCcw size={20}/><strong>{due}</strong><small>Câu đến hạn</small></button></div>
    <section className="ow-card ow-today"><div className="ow-card-head"><div><span>NHỊP HỌC MỖI NGÀY</span><h2>Góc học hôm nay</h2></div><CheckCircle2 size={22}/></div><div className="ow-tasks"><button onClick={()=>onGo('review')}><span className="ow-task-icon mint"><RotateCcw/></span><span><b>Ôn tập ngắt quãng</b><small>{due?`${due} câu đã đến hạn — ôn lại ngay`:'Hiện không có câu đến hạn'}</small></span><ChevronRight/></button><button onClick={()=>onGo('quizzes')}><span className="ow-task-icon amber"><GraduationCap/></span><span><b>Luyện đề Hải quan</b><small>{quizCount} bộ đề hoàn chỉnh trong ngân hàng</small></span><ChevronRight/></button><button onClick={()=>onGo('documents')}><span className="ow-task-icon blue"><BookOpen/></span><span><b>Đọc tài liệu lý thuyết</b><small>{docCount} tài liệu hiện có</small></span><ChevronRight/></button></div></section>
    <section className="ow-card ow-activities"><div className="ow-card-head"><div><span>KẾT QUẢ THỰC TẾ</span><h2>Hoạt động 7 ngày gần đây</h2></div><TrendingUp size={22}/></div><div className="ow-bars">{recent.map(x=><div className="ow-bar-col" key={dayKey(x.date)}><b>{x.count||''}</b><div className="ow-bar-track"><div style={{height:`${Math.max(x.count?9:2,100*x.count/maxCount)}%`}}/></div><small>{dayNames[x.date.getDay()]}</small></div>)}</div><p>{attempts.length} lượt làm đề · {totalQuestions} lượt trả lời đã ghi nhận</p></section>
   </div>
   <aside className="ow-planner"><div className="ow-pane-title"><div><span>NHẮC HỌC THÔNG MINH</span><h2>Lịch ôn tập</h2></div><CalendarDays size={22}/></div><p className="ow-month">Tháng {today.getMonth()+1}, {today.getFullYear()}</p><div className="ow-segment"><button className={view==='timeline'?'selected':''} onClick={()=>setView('timeline')}>Dòng thời gian</button><button className={view==='week'?'selected':''} onClick={()=>setView('week')}>7 ngày</button></div>
    {view==='timeline'?<div className="ow-timeline">{days.map((x,i)=><button className={'ow-day '+(i===0?'first':'')} key={x.key} onClick={()=>onGo('review')}><div className="ow-day-date"><small>{i===0?'HÔM NAY':i===1?'NGÀY MAI':dayNames[x.date.getDay()]}</small><b>{x.date.getDate()}</b><span>tháng {x.date.getMonth()+1}</span></div><div className="ow-day-task">{x.count?<><Clock3 size={17}/><strong>{x.count} câu đến hạn</strong><ChevronRight size={15}/></>:<span>Chưa có câu ôn đến hạn</span>}</div></button>)}</div>:<div className="ow-week-grid">{days.map((x,i)=><button key={x.key} className={i===0?'current':''} onClick={()=>onGo('review')}><small>{dayNames[x.date.getDay()]}</small><b>{x.date.getDate()}</b><span>{x.count} câu</span></button>)}</div>}
    <button className="ow-planner-footer" onClick={()=>onGo('review')}><RotateCcw size={17}/> Đến trang ôn lặp lại <ArrowRight size={17}/></button>
    <div className="ow-achievement"><Medal size={24}/><div><b>Thành tích của mày</b><small>{attempts.length===0?'Làm đề đầu tiên để mở huy hiệu!':`${attempts.length} lượt luyện đề đã hoàn thành.`}</small></div></div>
   </aside>
  </div>
  <div className="ow-footer"><Anchor size={16}/> Biển xanh · Kiến thức vững · Đồng hành cùng lon ton</div>
 </div>;
}
