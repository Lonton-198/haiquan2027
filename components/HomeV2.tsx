'use client';
import {useMemo,useState} from 'react';
import Mascot from '@/components/Mascot';
import type {LonTonTheme} from '@/components/ThemeBackdrop';
import type {StudyUnit} from '@/components/StudyLibrary';
import {Anchor,ArrowRight,BookOpen,CalendarDays,CheckCircle2,ChevronRight,Clock3,Compass,Flame,GraduationCap,Landmark,Medal,RotateCcw,Search,Ship,Target,TrendingUp, Waves, Sparkles, FileText, Layers3, ShieldCheck} from 'lucide-react';

type Entry={created_at:string;correct:number;total:number};
type Review={due_at:string};
type Section='overview'|'documents'|'quizzes'|'review'|'results';
type Props={theme?:LonTonTheme;name:string;units:StudyUnit[];docCount:number;quizCount:number;attempts:Entry[];reviewRows:Review[];streak:number;percent:number;onGo:(section:Section)=>void;onOpenUnit:(unitId:string)=>void};
const weekdays=['CN','T2','T3','T4','T5','T6','T7'];
const dayKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export default function HomeV2({theme='ocean',name,units,docCount,quizCount,attempts,reviewRows,streak,percent,onGo,onOpenUnit}:Props){
 const [search,setSearch]=useState('');const [mode,setMode]=useState<'week'|'timeline'>('timeline');
 const today=useMemo(()=>new Date(),[]);const dateNow=today.getTime();
 const due=reviewRows.filter(r=>new Date(r.due_at).getTime()<=dateNow).length;
 const dates=Array.from({length:7},(_,i)=>{const date=new Date(today.getFullYear(),today.getMonth(),today.getDate()+i);return {date,count:reviewRows.filter(r=>dayKey(new Date(r.due_at))===dayKey(date)).length}});
 const activity=Array.from({length:7},(_,i)=>{const date=new Date(today.getFullYear(),today.getMonth(),today.getDate()-6+i);return {date,count:attempts.filter(a=>dayKey(new Date(a.created_at))===dayKey(date)).length}});
 const maxActivity=Math.max(1,...activity.map(a=>a.count));const filtered=units.filter(u=>u.title.toLowerCase().includes(search.trim().toLowerCase()));
 const firstName=name.trim().split(/\s+/)[0]||'bạn';
 return <div className="v2-home">
  <div className="v2-headline"><div><span className="v2-kicker"><Waves size={16}/> {theme==='ocean'?'OCEAN':theme==='forest'?'FOREST':'CITY'} WORKSPACE · HỌC CÙNG LON TON</span><h1>Chào {firstName}, hôm nay học gì? <span>✦</span></h1><p>Mỗi ngày một bước tiến. Cùng lon ton chinh phục kiến thức và kỳ thi Hải quan!</p></div><div className="v2-headline-chip"><ShieldCheck size={17}/> Không gian học của bạn</div></div>
  <div className="v2-three-columns">
   <aside className="v2-study-rail v2-glass"><div className="v2-section-title"><div><span className="v2-overline">THƯ VIỆN HỌC TẬP</span><h2>Không gian học</h2></div><Compass size={24}/></div>
    <button className="v2-space-selected" onClick={()=>onGo('overview')}><span className="v2-space-icon"><Landmark size={21}/></span><span><b>Ôn thi Hải quan 2027</b><small>{units.length} bài học · {quizCount} bộ đề</small></span><ChevronRight size={17}/></button>
    <label className="v2-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm bài học, chuyên đề..." aria-label="Tìm bài học"/></label>
    <div className="v2-list-title"><span>DANH SÁCH BÀI HỌC</span><b>{filtered.length}</b></div>
    <div className="v2-unit-scroll">{filtered.length?filtered.map((unit,i)=><button onClick={()=>onOpenUnit(unit.id)} className="v2-unit" key={unit.id}><span>{String(units.indexOf(unit)+1).padStart(2,'0')}</span><b>{unit.title}</b><ChevronRight size={16}/></button>):<p className="v2-no-units">{units.length?'Không tìm thấy bài học.':'Chưa có bài học. Mở thư viện để bắt đầu.'}</p>}</div>
    <button className="v2-rail-link" onClick={()=>onGo('documents')}><BookOpen size={18}/> Mở thư viện <ArrowRight size={17}/></button>
    <div className="v2-rail-scenery" aria-hidden="true"/>
   </aside>
   <div className="v2-primary-column">
    <section className="v2-hero"><div className="v2-hero-content"><span className="v2-hero-tag"><Anchor size={16}/> GÓC HỌC TẬP CỦA BẠN</span><h2>Hôm nay mình<br/><em>học gì nào?</em> <span>⚡</span></h2><p>Mỗi bài học là một chặng hải trình. Tích lũy kiến thức, luyện đề và vững bước tới mục tiêu!</p><button onClick={()=>onGo(due?'review':'documents')}><span>{due?`Ôn ${due} câu đến hạn`:'Bắt đầu học ngay'}</span><ArrowRight size={20}/></button></div><div className="v2-hero-mascot"><Mascot size={290} mood="calm"/></div><span className="v2-hero-caption">⚓ Kiên trì mỗi ngày!</span></section>
    <div className="v2-metrics">
     <button className="v2-metric" onClick={()=>onGo('documents')}><span className="v2-metric-icon blue"><BookOpen/></span><strong>{docCount}</strong><small>Tài liệu</small></button>
     <button className="v2-metric" onClick={()=>onGo('results')}><span className="v2-metric-icon mint"><Target/></span><strong>{percent}%</strong><small>Trả lời đúng</small></button>
     <button className="v2-metric" onClick={()=>onGo('results')}><span className="v2-metric-icon gold"><Flame/></span><strong>{streak} ngày</strong><small>Chuỗi học</small></button>
     <button className="v2-metric" onClick={()=>onGo('review')}><span className="v2-metric-icon violet"><RotateCcw/></span><strong>{due}</strong><small>Câu đến hạn</small></button>
    </div>
    <section className="v2-content-card v2-today"><div className="v2-card-heading"><div><span>HÀNH TRÌNH HÔM NAY</span><h3><Sparkles size={21}/> Góc học hôm nay</h3></div><span className="v2-light-icon">✦</span></div><div className="v2-tasks">
      <button onClick={()=>onGo('review')}><span className="v2-task-icon mint"><RotateCcw/></span><span><strong>Ôn tập ngắt quãng</strong><small>{due?`${due} câu đã đến hạn — ôn lại ngay`:'Chưa có câu đến hạn, tiếp tục học nhé!'}</small></span><ChevronRight/></button>
      <button onClick={()=>onGo('quizzes')}><span className="v2-task-icon blue"><GraduationCap/></span><span><strong>Luyện đề Hải quan</strong><small>{quizCount} bộ đề hoàn chỉnh trong ngân hàng</small></span><ChevronRight/></button>
      <button onClick={()=>onGo('documents')}><span className="v2-task-icon orange"><FileText/></span><span><strong>Đọc lý thuyết</strong><small>{docCount} tài liệu đang chờ bạn khám phá</small></span><ChevronRight/></button>
    </div></section>
    <section className="v2-content-card v2-activity"><div className="v2-card-heading"><div><span>ĐƯỜNG ĐẾN MỤC TIÊU</span><h3><TrendingUp size={21}/> Tiến độ 7 ngày</h3></div><span className="v2-chart-tag">{attempts.length} lượt làm đề</span></div><div className="v2-chart">{activity.map((a,i)=><div className="v2-bar" key={dayKey(a.date)}><b>{a.count||''}</b><div className="v2-bar-track"><span style={{height:`${Math.max(3,a.count/maxActivity*100)}%`,animationDelay:`${i*50}ms`}}/></div><small>{weekdays[a.date.getDay()]}</small></div>)}</div><div className="v2-chart-foot"><span>Đếm lượt luyện đề thực tế</span><button onClick={()=>onGo('results')}>Xem thống kê <ArrowRight size={15}/></button></div></section>
    <div className="v2-shortcuts"><button onClick={()=>onGo('documents')}><BookOpen size={21}/><span><b>Thư viện lý thuyết</b><small>Học chắc từng chuyên đề</small></span><ArrowRight size={17}/></button><button onClick={()=>onGo('quizzes')}><Layers3 size={21}/><span><b>Kho luyện đề</b><small>Rèn phản xạ, tăng điểm số</small></span><ArrowRight size={17}/></button></div>
   </div>
   <aside className="v2-plan-rail v2-glass"><div className="v2-section-title"><div><span className="v2-overline">NHỊP HỌC THÔNG MINH</span><h2>Lịch ôn tập</h2></div><CalendarDays size={24}/></div><div className="v2-plan-month">Tháng {today.getMonth()+1}, {today.getFullYear()}</div><div className="v2-toggle"><button className={mode==='timeline'?'on':''} onClick={()=>setMode('timeline')}>Dòng thời gian</button><button className={mode==='week'?'on':''} onClick={()=>setMode('week')}>7 ngày</button></div>
    {mode==='timeline'?<div className="v2-timeline">{dates.map((d,i)=><button key={dayKey(d.date)} className={i===0?'today':''} onClick={()=>onGo('review')}><span className="v2-date"><small>{i===0?'HÔM NAY':i===1?'NGÀY MAI':weekdays[d.date.getDay()]}</small><b>{d.date.getDate()}</b><small>tháng {d.date.getMonth()+1}</small></span><span className="v2-date-work">{d.count?<><Clock3 size={15}/> {d.count} câu đến hạn</>:'Chưa có bài ôn đến hạn'}</span></button>)}</div>:<div className="v2-week">{dates.map((d,i)=><button key={dayKey(d.date)} className={i===0?'today':''} onClick={()=>onGo('review')}><small>{weekdays[d.date.getDay()]}</small><b>{d.date.getDate()}</b><span>{d.count} câu</span></button>)}</div>}
    <button className="v2-plan-cta" onClick={()=>onGo('review')}><RotateCcw size={18}/> Mở ôn tập thông minh <ArrowRight size={17}/></button>
    <div className="v2-achievement"><span className="v2-medal"><Medal size={24}/></span><div><b>Thành tích học tập</b><small>{attempts.length?`${attempts.length} lượt luyện đề đã hoàn thành`:'Bắt đầu luyện đề để mở huy hiệu đầu tiên'}</small></div></div>
    <div className="v2-plan-mascot"><Mascot size={115} mood="happy"/><span>Cứ tiến lên từng chút! 🌊</span></div>
   </aside>
  </div>
 </div>;
}
