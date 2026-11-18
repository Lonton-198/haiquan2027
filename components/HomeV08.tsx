"use client";
import Mascot from '@/components/Mascot';
import {Anchor,ArrowRight,BookOpen,CalendarDays,CheckCircle2,ClipboardList,FileText,Flame,GraduationCap,Landmark,Medal,Plus,RotateCcw,Ship,Target,Trophy,TrendingUp,Zap} from 'lucide-react';

type Entry={created_at:string;correct:number;total:number};
type Review={due_at:string};
type HomeProps={name:string;docCount:number;quizCount:number;attempts:Entry[];reviewRows:Review[];streak:number;percent:number;onGo:(section:'overview'|'documents'|'quizzes'|'review'|'results')=>void};
function dayKey(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const shortDays=['CN','T2','T3','T4','T5','T6','T7'];
export default function HomeV08({name,docCount,quizCount,attempts,reviewRows,streak,percent,onGo}:HomeProps){
 const today=new Date();const dayStart=new Date(today.getFullYear(),today.getMonth(),today.getDate());
 const due=reviewRows.filter(r=>new Date(r.due_at).getTime()<=Date.now()).length;
 const week=Array.from({length:7},(_,i)=>{const d=new Date(dayStart);d.setDate(d.getDate()-6+i);const key=dayKey(d);return {date:d,key,count:attempts.filter(a=>dayKey(new Date(a.created_at))===key).length};});
 const high=Math.max(1,...week.map(d=>d.count));
 const calendar=Array.from({length:7},(_,i)=>{const d=new Date(dayStart);d.setDate(d.getDate()+i);return {date:d,count:reviewRows.filter(r=>dayKey(new Date(r.due_at))===dayKey(d)).length};});
 const totalAnswered=attempts.reduce((s,a)=>s+a.total,0);
 const earned=[{title:'Bắt đầu hành trình',hint:'Hoàn thành bài thi đầu tiên',unlocked:attempts.length>=1,icon:BookOpen,cls:'gold'}, {title:'100 câu đầu tiên',hint:'Trả lời đủ 100 câu',unlocked:totalAnswered>=100,icon:Target,cls:'aqua'}, {title:'Chăm chỉ 7 ngày',hint:'Chuỗi học 7 ngày liên tục',unlocked:streak>=7,icon:Flame,cls:'orange'}, {title:'Cao thủ Hải quan',hint:'Đạt ít nhất 90% trong một đề từ 10 câu',unlocked:attempts.some(a=>a.total>=10&&a.correct/a.total>=.9),icon:Trophy,cls:'purple'}];
 const named=name.trim().split(/\s+/)[0]||'bạn';
 return <div className="marine-home">
  <section className="marine-hero" aria-label="Chào mừng học tập"><div className="marine-sky"/><div className="marine-sun"/><div className="marine-cloud cloud-a"/><div className="marine-cloud cloud-b"/><div className="marine-harbor" aria-hidden="true"><Ship/><span className="marine-waves">〰 〰 〰 〰 〰 〰</span></div>
   <div className="marine-hero-copy"><span className="marine-kicker"><Anchor size={15}/> HỌC CÙNG LON TON · HẢI QUAN 2027</span><h1>Hôm nay mình<br/><em>học gì nào?</em> <span>⚡</span></h1><p>Chào {named}! Cùng cún lon ton chinh phục kiến thức, tích lũy từng ngày và tự tin bước vào kỳ thi Hải quan.</p><button className="marine-button" onClick={()=>onGo('overview')}>Vào góc học Hải quan <ArrowRight size={18}/></button></div>
   <div className="marine-mascot-backdrop"/><Mascot className="marine-main-mascot" size={340} mood="calm"/>
   <div className="marine-hero-tag">🌊 Kiên trì mỗi ngày!</div>
  </section>
  <div className="marine-stats" aria-label="Thống kê học tập">
   <div className="marine-stat blue"><div className="marine-stat-icon"><BookOpen/></div><div><b>{docCount}</b><span>Bài trong thư viện</span></div></div>
   <div className="marine-stat green"><div className="marine-stat-icon"><Target/></div><div><b>{percent}%</b><span>Tỷ lệ trả lời đúng</span></div></div>
   <div className="marine-stat orange"><div className="marine-stat-icon"><Flame/></div><div><b>{streak} ngày</b><span>Chuỗi ngày luyện đề</span></div></div>
   <div className="marine-stat violet"><div className="marine-stat-icon"><ClipboardList/></div><div><b>{attempts.length}</b><span>Lượt làm đề</span></div></div>
   <div className="marine-stat cyan"><div className="marine-stat-icon"><RotateCcw/></div><div><b>{due}</b><span>Câu đến hạn ôn</span></div></div>
  </div>
  <div className="marine-dashboard-grid">
   <section className="marine-card marine-today"><header><h2><Zap/> Góc học hôm nay</h2><span className="marine-label">GỢI Ý CHO BẠN</span></header><div className="marine-task-list">
    <button onClick={()=>onGo('review')} className="marine-task"><span className="marine-task-ic amber"><RotateCcw size={21}/></span><span><b>{due?`Ôn ${due} câu đến hạn`:'Ôn tập ngắt quãng'}</b><small>{due?'Câu hỏi đã đến lịch ôn lại':'Chọn bài để ôn và củng cố kiến thức'}</small></span><ArrowRight size={18}/></button>
    <button onClick={()=>onGo('quizzes')} className="marine-task"><span className="marine-task-ic blue"><GraduationCap size={21}/></span><span><b>Luyện đề Hải quan</b><small>{quizCount} bộ đề hoàn chỉnh có thể luyện lại</small></span><ArrowRight size={18}/></button>
    <button onClick={()=>onGo('documents')} className="marine-task"><span className="marine-task-ic green"><FileText size={21}/></span><span><b>Đọc và ôn tài liệu</b><small>{docCount} tài liệu đang có trong thư viện</small></span><ArrowRight size={18}/></button>
   </div><button className="marine-task-cta" onClick={()=>onGo(due>0?'review':'overview')}>Bắt đầu học ngay <ArrowRight size={17}/></button>
   </section>
   <section className="marine-card marine-chart"><header><h2><TrendingUp/> Tiến độ 7 ngày</h2><span className="marine-label">LƯỢT LÀM ĐỀ</span></header><div className="marine-chart-area" role="img" aria-label={'Số lượt làm đề trong 7 ngày: '+week.map(d=>`${shortDays[d.date.getDay()]} ${d.count}`).join(', ')}>{week.map(({date,key,count})=><div className="marine-bar-col" key={key}><b>{count||''}</b><div className="marine-bar-track"><div className="marine-bar" style={{height:`${Math.max(count?12:3, count/high*100)}%`}}/></div><span>{shortDays[date.getDay()]}</span></div>)}</div><p className="marine-card-note">Dựa trên các bài thi đã nộp, không phát sinh chi phí AI.</p><button className="marine-text-link" onClick={()=>onGo('results')}>Xem lịch sử luyện tập <ArrowRight size={15}/></button></section>
   <section className="marine-card marine-calendar"><header><h2><CalendarDays/> Lịch ôn sắp tới</h2><span className="marine-label">7 NGÀY TỚI</span></header><div className="marine-calendar-days">{calendar.map(({date,count},i)=><button key={dayKey(date)} onClick={()=>onGo('review')} className={'marine-date '+(i===0?'today':'')} title={`${count} câu đến hạn vào ${date.toLocaleDateString('vi-VN')}`}><span>{shortDays[date.getDay()]}</span><b>{date.getDate()}</b><small>{count?`${count} câu`:'–'}</small></button>)}</div><div className="marine-calendar-summary"><CheckCircle2 size={19}/><span>{due>0?`Có ${due} câu cần ôn ngay hôm nay.`:'Không có câu quá hạn. Tiếp tục học để xây lịch ôn nhé!'}</span></div><button className="marine-text-link" onClick={()=>onGo('review')}>Đến không gian ôn tập <ArrowRight size={15}/></button></section>
  </div>
  <div className="marine-bottom-grid"><section className="marine-card marine-spaces"><header><h2><Landmark/> Không gian học tập</h2><span className="marine-label">LỐI TẮT</span></header><p className="marine-card-intro">Không còn ô trống: đi thẳng đến phần mày muốn học.</p><div className="marine-shortcuts"><button className="shortcut coral" onClick={()=>onGo('documents')}><FileText/><b>Kho tài liệu</b><span>Quản lý Word/PDF</span><ArrowRight size={15}/></button><button className="shortcut azure" onClick={()=>onGo('quizzes')}><GraduationCap/><b>Luyện đề</b><span>{quizCount} bộ đề đã có</span><ArrowRight size={15}/></button><button className="shortcut mint" onClick={()=>onGo('review')}><RotateCcw/><b>Ôn lặp lại</b><span>{due} câu đến hạn</span><ArrowRight size={15}/></button><button className="shortcut lilac" onClick={()=>onGo('results')}><TrendingUp/><b>Kết quả</b><span>Xem tiến bộ</span><ArrowRight size={15}/></button></div></section>
   <section className="marine-card marine-badges"><header><h2><Medal/> Huy hiệu học tập</h2><span className="marine-label">THÀNH TÍCH THẬT</span></header><div className="marine-badge-grid">{earned.map(({title,hint,unlocked,icon:Icon,cls})=><div className={'marine-badge '+cls+(unlocked?'':' locked')} key={title} title={hint}><span><Icon size={26}/></span><b>{title}</b><small>{unlocked?'Đã mở khóa':'Chưa mở khóa'}</small></div>)}</div><p className="marine-card-note">Huy hiệu tự mở khi đạt mục tiêu; không dùng dữ liệu minh họa.</p></section>
  </div><div className="marine-sea-footer"><Anchor size={16}/> Hải quan 2027 · Học chắc kiến thức, bền bỉ mỗi ngày · <span>🐾 Lon ton đồng hành</span></div>
 </div>;
}
