"use client";
import {useEffect,useState,useRef} from 'react';
import {browserDb} from '@/lib/supabase-browser';
import Mascot from '@/components/Mascot';
import {BookOpen,FileUp,Layers,GraduationCap,ChartNoAxesCombined,LogOut,FileText,Plus,LoaderCircle,ArrowLeft,CheckCircle2,XCircle,Clock,ShieldCheck,Home,Brain,Landmark,ChevronRight,CalendarDays,RotateCcw,BookOpenCheck,Check,Palette,Flame,Target,Bookmark,BookmarkCheck} from 'lucide-react';
type Doc={id:string;title:string;filename:string;created_at:string};
type DocumentView={document:{id:string;title:string;filename:string;text:string};url:string};
type Lesson={id:string;topic:string;content:{title:string;summary:string;key_points:string[];pitfalls:string[];cases:string[]};created_at:string};
type Q={stem:string;choices:[string,string,string,string];answer:number;explanation:string;choice_explanations:[string,string,string,string];source_quote:string;difficulty:string};
type Quiz={id:string;title:string;questions:Q[];created_at:string};
type Attempt={id:string;quiz_id:string;correct:number;total:number;seconds:number;created_at:string;answers:(number|null)[]};
type Tab='overview'|'documents'|'lessons'|'quizzes'|'review'|'results';
type ReviewRow={quiz_id:string;question_index:number;repetitions:number;interval_days:number;due_at:string;last_correct:boolean|null};
type ReviewCard={quiz_id:string;question_index:number;quiz_title:string;q:Q};
const tabs:[Tab,string,typeof BookOpen][]=[['overview','Tổng quan',Home],['documents','Bài học',FileText],['quizzes','Luyện đề',GraduationCap],['review','Ôn tập thông minh',Brain],['results','Thống kê',ChartNoAxesCombined]];
async function post(url:string,body:BodyInit,form=false){const res=await fetch(url,{method:'POST',headers:form?undefined:{'Content-Type':'application/json'},body});const out=await res.json();if(!res.ok)throw new Error(out.error||'Có lỗi xảy ra');return out;}
export default function Dashboard(){
 const [userEmail,UE]=useState(''),[docs,D]=useState<Doc[]>([]),[lessons,LS]=useState<Lesson[]>([]),[quizzes,QS]=useState<Quiz[]>([]),[attempts,AS]=useState<Attempt[]>([]);
 const [tab,T]=useState<Tab>('overview'),[docId,DI]=useState(''),[topic,TP]=useState(''),[count,CO]=useState(60),[busy,B]=useState(''),[error,E]=useState(''),[notice,N]=useState('');
 const [currentQuiz,CQ]=useState<Quiz|null>(null),[answers,A]=useState<(number|null)[]>([]),[result,R]=useState<Attempt|null>(null),[elapsed,S]=useState(0);const timer=useRef<ReturnType<typeof setInterval>|null>(null);
 const [viewer,V]=useState<DocumentView|null>(null),[query,FQ]=useState(''),[progress,P]=useState<{done:number;target:number}|null>(null);
 const [workspace,W]=useState<'home'|'customs'>('home');
 const [accent,SETACCENT]=useState('#2864b4');
 const [paletteOpen,SETPO]=useState(false);
 const [marked,SETMARKED]=useState<number[]>([]);
 const palettes=[{name:'Xanh đại dương',value:'#2864b4'},{name:'Xanh ngọc',value:'#087d75'},{name:'Tím lavender',value:'#7954b0'},{name:'Hồng san hô',value:'#bd5479'},{name:'Cam ấm',value:'#b46a2d'},{name:'Xanh lá',value:'#28765b'}];
 useEffect(()=>{try{const saved=localStorage.getItem('lonton-accent');if(saved&&/^#[0-9a-fA-F]{6}$/.test(saved))SETACCENT(saved)}catch{}},[]);
 function chooseAccent(value:string){if(!/^#[0-9a-fA-F]{6}$/.test(value))return; SETACCENT(value);try{localStorage.setItem('lonton-accent',value)}catch{}}
 const studyDays=Array.from(new Set(attempts.map(a=>new Date(a.created_at).toLocaleDateString('en-CA'))));
 const streak=(()=>{const days=new Set(studyDays);const date=new Date();if(!days.has(date.toLocaleDateString('en-CA')))date.setDate(date.getDate()-1);let n=0;while(days.has(date.toLocaleDateString('en-CA'))){n++;date.setDate(date.getDate()-1)}return n})();
 const percent=attempts.length?Math.round(100*attempts.reduce((sum,a)=>sum+a.correct,0)/Math.max(1,attempts.reduce((sum,a)=>sum+a.total,0))):0;

 const [userId,UID]=useState('');
 const [reviewDoc,RD]=useState('');
 const [reviewRows,RR]=useState<ReviewRow[]>([]);
 const reviewsDue=reviewRows.filter(r=>dueDate(r.due_at)).length;
 const [reviewCards,RC]=useState<ReviewCard[]>([]);
 const [reviewAnswers,RA]=useState<(number|null)[]>([]);
 const [reviewConfidence,RF]=useState<('sure'|'unsure')[]>([]);
 const [reviewSubmitted,RS]=useState(false);
 const [reviewSize,RZ]=useState(20);
 const db=browserDb();
 const randomize=<T,>(items:T[])=>items.map(item=>({item,key:Math.random()})).sort((a,b)=>a.key-b.key).map(x=>x.item);
 const dueDate=(date:string)=>new Date(date).getTime()<=Date.now();
 async function loadReview(){
   if(!userId)return;
   const r=await db.from('review_progress').select('quiz_id,question_index,repetitions,interval_days,due_at,last_correct').eq('user_id',userId);
   if(r.error)throw new Error('Chưa cài SQL ôn tập v0.6 trong Supabase: '+r.error.message);
   RR((r.data||[]) as ReviewRow[]);
 }
 function beginReview(){
   const all:ReviewCard[]=quizzes.filter(q=>!isDraft(q) && (q as Quiz & {document_id?:string}).document_id===reviewDoc)
    .flatMap(quiz=>quiz.questions.map((q,question_index)=>({quiz_id:quiz.id,question_index,quiz_title:quiz.title,q})));
   const found=(c:ReviewCard)=>reviewRows.find(r=>r.quiz_id===c.quiz_id&&r.question_index===c.question_index);
   const due=randomize(all.filter(c=>{const r=found(c);return !!r&&dueDate(r.due_at)}))
      .sort((a,b)=>new Date(found(a)!.due_at).getTime()-new Date(found(b)!.due_at).getTime());
   const fresh=randomize(all.filter(c=>!found(c)));
   const picked=[...due,...fresh].slice(0,reviewSize);
   RC(picked);RA(picked.map(()=>null));RS(false);RF(picked.map(()=>'sure'));E('');
   if(!picked.length)N('Bài này hiện không có câu đến hạn hoặc chưa học. Hãy quay lại vào ngày ôn tiếp theo.');else N('');
 }
 async function submitReview(){
   if(!userId||reviewSubmitted||reviewCards.length===0)return;
   await work('review',async()=>{
     const now=new Date();
     const rows=reviewCards.map((c,i)=>{
       const prev=reviewRows.find(r=>r.quiz_id===c.quiz_id&&r.question_index===c.question_index);
       const correct=reviewAnswers[i]===c.q.answer;
       const reps=correct?(prev?.repetitions||0)+1:0;
       const schedule=[1,3,7,14,30,60];
       const interval= !correct?1:reviewConfidence[i]==='unsure'?Math.min(2,prev?.interval_days||2):schedule[Math.min(reps-1,schedule.length-1)];
       return {user_id:userId,quiz_id:c.quiz_id,question_index:c.question_index,repetitions:reps,
         interval_days:interval,last_correct:correct,last_reviewed_at:now.toISOString(),
         due_at:new Date(now.getTime()+interval*86400000).toISOString()};
     });
     const {error}=await db.from('review_progress').upsert(rows,{onConflict:'user_id,quiz_id,question_index'});
     if(error)throw error;
     RS(true);await loadReview();N('Đã lưu kết quả và lịch ôn tiếp theo. Không gọi AI, không phát sinh token.');
   });
 }

 async function openDoc(id:string){
   B('view');E('');try{
     const res=await fetch('/api/document?id='+encodeURIComponent(id),{cache:'no-store'});
     const data=await res.json();if(!res.ok)throw new Error(data.error||'Không mở được tài liệu.');
     V(data);FQ('');T('lessons');
   }catch(e){E(e instanceof Error?e.message:'Không mở được tài liệu')}finally{B('')}
 }
 async function generateBatches(initialId:string){
   let last=-1;let target=0;let complete=false;
   // Limit paid requests per click; keep progress already saved if a batch fails.
   for(let i=0;i<40&&!complete;i++){
     const status=await post('/api/generate-quiz',JSON.stringify({action:'batch',quizId:initialId}));
     last=status.done;target=status.target;complete=status.complete;
     P({done:last,target});
     await refresh();
     if(status.paused){
       throw new Error(`Đã lưu ${last}/${target} câu. ${status.reason||'Tạm dừng để tránh tốn API.'}`);
     }
     if(!complete && (!status.added || status.added<1)){
       throw new Error(`Đã lưu ${last}/${target} câu. Tạm dừng vì đợt này không có câu hợp lệ.`);
     }
   }
   if(!complete)throw new Error(`Đã lưu ${last}/${target} câu. Đã chạm giới hạn lượt tạo cho một lần bấm để kiểm soát chi phí.`);
   N('Đã lưu trọn bộ '+target+' câu. Có thể làm lại nhiều lần mà không tốn phí tạo đề.');
 }
 async function createQuiz(){await work('quiz',async()=>{
   const created=await post('/api/generate-quiz',JSON.stringify({action:'start',documentId:docId,topic,count}));
   P({done:0,target:created.target});
   try{await generateBatches(created.quizId)}finally{await refresh()}
 })}
 async function resumeQuiz(id:string){await work('quiz',async()=>{P(null);await generateBatches(id)})}
 function isDraft(q:Quiz){return q.title.startsWith('⏳ [')}
 function targetSize(q:Quiz){return Number(/^⏳ \[(\d+)\]/.exec(q.title)?.[1]||q.questions.length)}
 async function refresh(){const [a,b,c,d]=await Promise.all([db.from('documents').select('id,title,filename,created_at').order('created_at',{ascending:false}),db.from('lessons').select('*').order('created_at',{ascending:false}),db.from('quizzes').select('id,document_id,title,questions,created_at').order('created_at',{ascending:false}),db.from('attempts').select('*').order('created_at',{ascending:false})]);
 for(const r of [a,b,c,d])if(r.error)throw r.error;
 D(a.data||[]);LS((b.data||[]) as Lesson[]);QS((c.data||[]) as Quiz[]);AS((d.data||[]) as Attempt[]);if(!docId&&a.data?.length)DI(a.data[0].id);if(!reviewDoc&&a.data?.length)RD(a.data[0].id);}
 useEffect(()=>{db.auth.getUser().then(({data:{user}})=>{if(!user)location.href='/login';else{UE(user.email||'');UID(user.id);refresh().catch(e=>E(e.message))}})},[]);
 useEffect(()=>{if(currentQuiz&&!result){timer.current=setInterval(()=>S(n=>n+1),1000);return()=>{if(timer.current)clearInterval(timer.current)}}},[currentQuiz,result]);
 async function work(key:string,fn:()=>Promise<void>){B(key);E('');N('');try{await fn();await refresh()}catch(e){E(e instanceof Error?e.message:'Lỗi không rõ')}finally{B('')}}
 function startQuiz(quiz:Quiz,attempt?:Attempt){SETMARKED([]);CQ(quiz);A(attempt?.answers||quiz.questions.map(()=>null));R(attempt||null);S(attempt?.seconds||0);window.scrollTo({top:0,behavior:'smooth'})}
 async function submit(){if(!currentQuiz||result)return;await work('submit',async()=>{const data=await post('/api/submit',JSON.stringify({quizId:currentQuiz.id,answers,seconds:elapsed}));R(data.attempt);N('Đã chấm bài. Xem lời giải chi tiết ngay bên dưới.')})}
 const selected=docs.find(d=>d.id===docId);
 return <div className="shell" style={{"--accent":accent} as React.CSSProperties}><aside className="sidebar"><button className="logo logo-button" onClick={()=>{W('home');CQ(null);RC([]);E('');N('')}}><div className="logo-mark"><Mascot size={48} className="logo-mascot"/></div><div>Học cùng <b>lon ton</b><small>GÓC HỌC TẬP CỦA BẠN</small></div></button>
 <div className="nav-title">KHÔNG GIAN HỌC</div><button className={'nav '+(workspace==='home'?'active':'')} onClick={()=>{W('home');CQ(null);RC([]);E('')}}><Home size={19}/> Trang chủ</button>
 {workspace==='customs'&&<><div className="workspace-caption"><Landmark size={16}/> Ôn thi Hải quan 2027</div><nav>{tabs.map(([key,title,Icon])=><button key={key} onClick={()=>{T(key);CQ(null);RC([]);E('');N('')}} className={(tab===key||(tab==='lessons'&&key==='documents'))?'nav active':'nav'}><Icon size={19}/>{title}</button>)}</nav></>}
 <div className="side-bottom"><ShieldCheck size={17}/> Học tập đồng bộ<span>Windows · MacBook · Điện thoại</span></div></aside>
 <main className="main"><header className="top"><div className="mobile-logo">Học cùng lon ton</div><div className="top-sub">Học mỗi ngày, tiến bộ từng chút.</div><div className="user"><div className="color-settings"><button type="button" className="palette-trigger" title="Tùy chọn màu yêu thích" aria-label="Tùy chọn màu yêu thích" aria-expanded={paletteOpen} onClick={()=>SETPO(!paletteOpen)}><Palette size={19}/><span className="palette-dot" style={{background:accent}}/></button>{paletteOpen&&<div className="palette-popover"><div className="palette-title">Màu sắc của bạn</div><p>Đổi màu giao diện, tự lưu trên trình duyệt này.</p><div className="palette-grid">{palettes.map(p=><button key={p.value} className={'color-swatch '+(accent===p.value?'selected':'')} style={{background:p.value}} title={p.name} aria-label={p.name} onClick={()=>chooseAccent(p.value)}>{accent===p.value&&<Check size={17}/>}</button>)}</div><label className="custom-color">Tự chọn màu <input type="color" value={accent} onChange={e=>chooseAccent(e.target.value)} aria-label="Chọn màu tùy ý"/></label><button type="button" className="palette-close" onClick={()=>SETPO(false)}>Đóng</button></div>}</div><span>{userEmail}</span><button title="Đăng xuất" onClick={async()=>{await db.auth.signOut();location.href='/login'}}><LogOut size={19}/></button></div></header>
 <div className="body">{workspace==='home'?<><div className="hero hero-v07"><div className="hero-copy"><span className="eyebrow">GÓC HỌC TẬP CỦA BẠN</span><h1>Hôm nay mình học gì nào? ✨</h1><p>Một chút mỗi ngày, tiến bộ từng chút. Cún lon ton đồng hành cùng bạn trên hành trình chinh phục kiến thức!</p><button className="hero-cta" onClick={()=>{W('customs');T('overview')}}>Vào không gian Hải quan <ChevronRight size={18}/></button></div><Mascot className="hero-mascot" size={264}/></div><div className="achievement-strip"><div><Flame size={21}/><b>{streak} ngày</b><span>Chuỗi ngày luyện đề</span></div><div><Target size={21}/><b>{percent}%</b><span>Tỷ lệ đúng tích lũy</span></div><div><BookOpen size={21}/><b>{docs.length} bài</b><span>Trong thư viện</span></div></div><div className="section-head"><div><h2>Không gian học tập</h2><p>Tài liệu, đề thi và lịch ôn được lưu riêng theo tài khoản.</p></div></div><div className="spaces"><button className="space-card" onClick={()=>{W('customs');T('overview');E('');N('')}}><div className="space-mark"><Landmark size={26}/></div><div><h3>Ôn thi Hải quan 2027</h3><p>Mỗi tài liệu một bài · Luyện đề rất khó · Ôn lặp lại</p><span>{docs.length} bài học · {quizzes.filter(q=>!isDraft(q)).length} bộ đề hoàn thành</span></div><ChevronRight size={22}/></button><div className="space-card space-coming"><div className="space-mark neutral"><Plus/></div><div><h3>Thêm không gian học</h3><p>Chúng ta có thể bổ sung các lĩnh vực khác trong những phiên bản sau.</p></div></div></div></>:
 <><div className="crumb"><button onClick={()=>{W('home');CQ(null);RC([])}}>Học cùng lon ton</button><ChevronRight size={14}/> Ôn thi Hải quan 2027</div><div className="eyebrow">KHÔNG GIAN ÔN THI</div><h1>{tab==='overview'?'Ôn thi Hải quan 2027':tabs.find(t=>t[0]===tab)?.[1]||'Đọc tài liệu'}</h1><p className="muted">Mỗi file Word/PDF là một bài riêng. Luyện tập và theo dõi tiến độ theo tài khoản của mày.</p>
 {tab==='overview'&&<><div className="stats"><div className="stat"><div className="stat-icon sand"><FileText/></div><b>{docs.length}</b><span>Bài học</span></div><div className="stat"><div className="stat-icon mint"><GraduationCap/></div><b>{quizzes.filter(q=>!isDraft(q)).length}</b><span>Bộ đề hoàn thành</span></div><div className="stat"><div className="stat-icon lavender"><ChartNoAxesCombined/></div><b>{attempts.length}</b><span>Lượt làm đề</span></div><div className="stat"><div className="stat-icon peach"><Brain/></div><b>1–3–7</b><span>Nhịp ôn ngắt quãng</span></div></div><div className="daily-banner"><div className="daily-icon"><Mascot size={100}/></div><div><span className="eyebrow">NHỊP HỌC MỖI NGÀY</span><h3>{reviewsDue>0?`${reviewsDue} câu đang đến hạn ôn`:'Sẵn sàng cho buổi học hôm nay?'}</h3><p>Ôn theo từng bài bằng các câu hỏi đã lưu. Không tốn thêm phí AI.</p></div><button className="outline" onClick={()=>{T('review');loadReview().catch(e=>E(e.message))}}>Ôn tập ngay <ChevronRight size={16}/></button></div><div className="quick-grid"><button onClick={()=>T('documents')}><BookOpen/><b>Đọc bài học</b><span>Đọc nguyên tài liệu đã tải</span></button><button onClick={()=>T('quizzes')}><GraduationCap/><b>Luyện đề</b><span>Tạo hoặc làm lại đề cũ</span></button><button onClick={()=>{T('review');loadReview().catch(e=>E(e.message))}}><Brain/><b>Ôn tập hôm nay</b><span>Chọn câu đến hạn theo từng bài</span></button></div><section className="panel"><div className="section-head"><div><h2>Danh sách bài học</h2><p>Mỗi tài liệu là một bài; mở lại, luyện đề và ôn thông minh ngay tại đây.</p></div></div>{docs.length===0?<p className="empty">Chưa có bài nào. Vào mục Bài học để tải file Word/PDF lên.</p>:docs.map(d=><div className="lesson-card" key={d.id}><div className="lesson-card-main"><div className="lesson-book-icon"><FileText size={23}/></div><div><b>{d.title}</b><small>{d.filename} · {new Date(d.created_at).toLocaleDateString('vi-VN')}</small></div></div><div className="lesson-actions"><button className="outline" onClick={()=>{DI(d.id);openDoc(d.id)}}>Đọc tài liệu</button><button className="outline" onClick={()=>{DI(d.id);T('quizzes')}}>Luyện đề</button><button className="outline" onClick={()=>{RD(d.id);T('review');loadReview().catch(e=>E(e.message))}}>Ôn lặp lại</button></div></div>)}</section></>}
 {error&&<div className="alert">{error}</div>}{notice&&<div className="success">{notice}</div>}
 {currentQuiz?<section className="panel"><button className="back" onClick={()=>{CQ(null);R(null)}}><ArrowLeft size={16}/> Quay lại danh sách</button><div className="section-head"><div><span className="eyebrow">{result?'KẾT QUẢ BÀI THI':'ĐANG LÀM BÀI'}</span><h2>{currentQuiz.title}</h2></div><span className="pill"><Clock size={15}/> {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')}</span></div><div className="exam-tools"><div className="exam-meta"><b>{answers.filter(a=>a!==null).length}/{answers.length} đã trả lời</b><span>{marked.length} câu đánh dấu</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${answers.length?100*answers.filter(a=>a!==null).length/answers.length:0}%`}}/></div><div className="question-nav">{currentQuiz.questions.map((_,i)=><button key={i} className={(answers[i]!==null?'answered ':'')+(marked.includes(i)?'flagged':'')} title={`Tới câu ${i+1}${marked.includes(i)?' (đánh dấu)':''}`} onClick={()=>document.getElementById('question-'+i)?.scrollIntoView({behavior:'smooth',block:'center'})}>{i+1}</button>)}</div></div>{result&&<div className="score"><b>{result.correct}/{result.total}</b><span>Câu trả lời đúng · {Math.round(100*result.correct/result.total)}%</span></div>}{currentQuiz.questions.map((q,i)=><div key={i} id={'question-'+i} className="question"><div className="qhead"><strong>Câu {i+1}</strong><span className="pill small">{q.difficulty}</span><button className={'bookmark-question '+(marked.includes(i)?'on':'')} title={marked.includes(i)?'Bỏ đánh dấu':'Đánh dấu câu phân vân'} onClick={()=>SETMARKED(old=>old.includes(i)?old.filter(x=>x!==i):[...old,i])}>{marked.includes(i)?<BookmarkCheck size={17}/>:<Bookmark size={17}/>}</button>{result&&(answers[i]===q.answer?<span className="correct"><CheckCircle2 size={16}/> Đúng</span>:<span className="wrong"><XCircle size={16}/> Sai</span>)}</div><p className="stem">{q.stem}</p><div className="choices">{q.choices.map((choice,j)=><label key={j} className={'choice '+(answers[i]===j?'chosen ':'')+(result&&q.answer===j?'right ':'')+(result&&answers[i]===j&&j!==q.answer?'incorrect':'')}><input type="radio" name={'question-'+i} checked={answers[i]===j} disabled={!!result} onChange={()=>A(old=>old.map((a,k)=>k===i?j:a))}/><span className="letter">{String.fromCharCode(65+j)}</span>{choice}</label>)}</div>{result&&<div className="explanation"><strong>Giải thích và đối chiếu nguồn</strong><p>{q.explanation}</p>{q.choice_explanations.map((why,k)=><p key={k}><b>{String.fromCharCode(65+k)}:</b> {why}</p>)}<blockquote>Trích dẫn từ tài liệu: “{q.source_quote}”</blockquote><small>AI tạo lời giải từ nguồn đã tải lên. Cần đối chiếu văn bản pháp luật đang có hiệu lực khi dùng trong thực tế.</small></div>}</div>)}{!result&&<div className="submit-row"><span>Đã trả lời {answers.filter(a=>a!==null).length}/{answers.length} câu</span><button className="primary" disabled={!!busy} onClick={submit}>{busy?'Đang chấm...':'Nộp bài & chấm điểm'}</button></div>}</section>:
 <>{tab==='documents'&&<section className="panel"><div className="section-head"><div><span className="eyebrow">KHO KIẾN THỨC</span><h2>Tài liệu học tập</h2><p>Thêm giáo trình và văn bản pháp luật để AI dùng làm nguồn.</p></div></div><label className="dropzone"><FileUp size={34}/><b>Chọn tài liệu Word / PDF</b><span>PDF có chữ hoặc DOCX · Tối đa 10MB · Không hỗ trợ PDF scan ảnh</span><input type="file" accept=".pdf,.docx" disabled={!!busy} onChange={e=>{const file=e.target.files?.[0];if(file)work('upload',async()=>{const form=new FormData();form.append('file',file);await post('/api/upload',form,true);N('Đã thêm tài liệu thành công.');});e.target.value=''}}/>{busy==='upload'&&<span><LoaderCircle className="spin" size={16}/> Đang xử lý tài liệu</span>}</label><div className="list">{docs.length===0?<p className="empty">Chưa có tài liệu. Hãy tải tài liệu đầu tiên của mày lên.</p>:docs.map(d=><div key={d.id} className="list-item"><FileText size={22}/><div><b>{d.title}</b><small>{d.filename} · {new Date(d.created_at).toLocaleDateString('vi-VN')}</small></div><button className="outline" onClick={()=>{DI(d.id);openDoc(d.id)}}>Đọc tài liệu</button></div>)}</div></section>}
 {tab==='lessons'&&<section className="panel"><div className="section-head"><div><span className="eyebrow">THƯ VIỆN NGUYÊN VĂN</span><h2>Đọc lại tài liệu đã tải lên</h2><p>Không dùng AI, không phát sinh token. PDF xem ngay; Word đọc đầy đủ phần chữ và tải bản gốc để giữ định dạng.</p></div></div>
 <div className="generator"><label>Chọn tài liệu<select value={docId} onChange={e=>{DI(e.target.value);V(null)}}><option value="">Chọn tài liệu</option>{docs.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label><button className="primary" disabled={!docId||!!busy} onClick={()=>openDoc(docId)}><BookOpen size={17}/> {busy==='view'?'Đang mở...':'Mở tài liệu'}</button></div>
 {viewer&&<div className="doc-reader"><div className="reader-tools"><strong>{viewer.document.title}</strong><a className="outline" href={viewer.url} download={viewer.document.filename} target="_blank" rel="noopener noreferrer">Tải file gốc</a></div>
 {viewer.document.filename.toLowerCase().endsWith('.pdf')?<iframe title={viewer.document.title} src={viewer.url+'#toolbar=1'} className="pdf-frame"/>:<><label className="doc-search">Tìm nhanh trong nội dung<input value={query} onChange={e=>FQ(e.target.value)} placeholder="Nhập từ khóa..."/></label><div className="original-text">{query?viewer.document.text.split('\n').filter(line=>line.toLowerCase().includes(query.toLowerCase())).join('\n')||'Không tìm thấy trong phần chữ đã trích xuất.':viewer.document.text}</div><p className="footnote">Đây là toàn bộ phần chữ đã trích xuất khi tải DOCX lên; bảng, hình ảnh và định dạng Word có thể khác bản gốc. Nhấn Tải file gốc để xem nguyên dạng bằng Word.</p></>}
 </div>}
 {docs.length===0&&<p className="empty">Hãy tải một tài liệu lên ở mục Tài liệu trước.</p>}</section>}
 {tab==='quizzes'&&<section className="panel"><div className="section-head"><div><span className="eyebrow">THỬ THÁCH BẢN THÂN</span><h2>Luyện đề vận dụng rất cao</h2><p>Đề 60 câu được tạo theo từng đợt, lưu chung một bộ. Tình huống nhiều tầng điều kiện, bốn đáp án nhiễu tinh vi, lời giải đối chiếu nguồn.</p></div></div><div className="generator"><label>Nguồn tài liệu<select value={docId} onChange={e=>DI(e.target.value)}><option value="">Chọn tài liệu</option>{docs.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label><label>Trọng tâm (không bắt buộc)<input value={topic} onChange={e=>TP(e.target.value)} placeholder="VD: Điều kiện và ngoại lệ"/></label><label>Số câu mỗi bộ<select value={count} onChange={e=>CO(Number(e.target.value))}>{[10,20,30,40,60,100].map(n=><option key={n} value={n}>{n} câu</option>)}</select></label><button className="primary" disabled={!docId||!!busy} onClick={createQuiz}><Plus size={17}/> {busy==='quiz'?'Đang tạo và lưu đề...':'Tạo bộ đề vận dụng rất cao'}</button></div>
 {busy==='quiz'&&<div className="progress-box"><b>Đang tạo đề: {progress?.done||0}/{progress?.target||count} câu</b><div className="progress-track"><div className="progress-fill" style={{width:`${Math.min(100,100*(progress?.done||0)/(progress?.target||count))}%`}}/></div><small>Câu đã tạo được lưu trong Supabase sau từng lượt. Đừng tạo thêm bộ khác trong khi đang chạy.</small></div>}
 <p className="footnote">Chỉ dùng kiến thức trong nguồn đã tải lên. AI tạo từng nhóm 2 câu, kiểm tra đủ 4 đáp án và lưu ngay. Khi không có câu hợp lệ, quá trình tự dừng để tránh tốn phí; các câu cũ không mất. Đề AI vẫn cần người học rà soát căn cứ pháp lý.</p><div className="list">{quizzes.length===0?<p className="empty">Chưa có bộ đề nào.</p>:quizzes.map(q=><div key={q.id} className="list-item"><GraduationCap size={23}/><div><b>{q.title}</b><small>{q.questions.length}/{isDraft(q)?targetSize(q):q.questions.length} câu · {new Date(q.created_at).toLocaleDateString('vi-VN')}</small></div>{isDraft(q)?<button className="outline" disabled={!!busy} onClick={()=>resumeQuiz(q.id)}>Tiếp tục tạo</button>:<button className="outline" onClick={()=>startQuiz(q)}>Làm bài</button>}</div>)}</div></section>}
 {tab==='review'&&<section className="panel"><div className="section-head"><div><span className="eyebrow">KHÔNG GỌI AI · ÔN LẠI CÂU CŨ</span><h2>Ôn tập ngắt quãng theo bài</h2><p>Chọn một file để ôn. Câu đến hạn được ưu tiên, sau đó bổ sung câu chưa từng ôn và trộn ngẫu nhiên.</p></div></div>
 <div className="generator"><label>Chọn bài học<select value={reviewDoc} onChange={e=>{RD(e.target.value);RC([]);RS(false)}}><option value="">Chọn bài</option>{docs.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label><label>Giới hạn câu trong phiên<select value={reviewSize} onChange={e=>RZ(Number(e.target.value))}>{[10,15,20,30,60].map(n=><option key={n} value={n}>{n} câu</option>)}</select></label><button className="outline" onClick={()=>work('load-review',loadReview)} disabled={!!busy}>Cập nhật lịch ôn</button><button className="primary" onClick={beginReview} disabled={!reviewDoc||!!busy}><RotateCcw size={17}/> Bắt đầu ôn bài này</button></div>
 <p className="footnote">Lịch mẫu theo từng câu: sai → ôn sau 1 ngày; đúng chắc → khoảng cách 1, 3, 7, 14, 30, 60 ngày; đúng nhưng phân vân → sau tối đa 2 ngày. Các câu đã đến hạn được ưu tiên. Không cần OpenAI API.</p>
 {reviewDoc&&<div className="review-status"><CalendarDays size={18}/><span>Bài này có {quizzes.filter(q=>!isDraft(q)&&(q as Quiz & {document_id?:string}).document_id===reviewDoc).reduce((sum,q)=>sum+q.questions.length,0)} câu trong các đề hoàn chỉnh. Chỉ đề tạo xong mới được ôn.</span></div>}
 {reviewCards.length>0&&<div className="review-session"><h3>Phiên ôn: {reviewCards.length} câu</h3>{reviewCards.map((c,i)=><div className="question" key={c.quiz_id+'-'+c.question_index}><div className="qhead"><strong>Câu {i+1}</strong><span className="pill small">{c.quiz_title}</span></div><p className="stem">{c.q.stem}</p><div className="choices">{c.q.choices.map((choice,j)=><label key={j} className={'choice '+(reviewAnswers[i]===j?'chosen ':'')+(reviewSubmitted&&c.q.answer===j?'right ':'')+(reviewSubmitted&&reviewAnswers[i]===j&&j!==c.q.answer?'incorrect':'')}><input type="radio" name={'review-'+i} disabled={reviewSubmitted} checked={reviewAnswers[i]===j} onChange={()=>RA(old=>old.map((a,k)=>i===k?j:a))}/><span className="letter">{String.fromCharCode(65+j)}</span>{choice}</label>)}</div>{!reviewSubmitted&&<div className="confidence-per-question"><span>Tự đánh giá:</span><button className={reviewConfidence[i]==='sure'?'selected':''} onClick={()=>RF(old=>old.map((x,k)=>k===i?'sure':x))}>Nhớ chắc</button><button className={reviewConfidence[i]==='unsure'?'selected':''} onClick={()=>RF(old=>old.map((x,k)=>k===i?'unsure':x))}>Còn phân vân</button></div>}{reviewSubmitted&&<div className="explanation"><strong>{reviewAnswers[i]===c.q.answer?'Chính xác':'Cần ôn lại'}</strong><p>{c.q.explanation}</p>{c.q.choice_explanations.map((x,j)=><p key={j}><b>{String.fromCharCode(65+j)}:</b> {x}</p>)}<blockquote>{c.q.source_quote}</blockquote></div>}</div>)}{!reviewSubmitted?<div className="submit-row"><span>Đã trả lời {reviewAnswers.filter(a=>a!==null).length}/{reviewCards.length} câu</span><button className="primary" disabled={!!busy||reviewAnswers.some(a=>a===null)} onClick={submitReview}>Chấm & lên lịch ôn tiếp</button></div>:<div className="review-finished"><Check size={19}/> Đã lưu: {reviewCards.filter((c,i)=>reviewAnswers[i]===c.q.answer).length}/{reviewCards.length} câu đúng. Câu sai sẽ đến hạn sớm hơn. <button className="outline" onClick={()=>{RC([]);RS(false)}}>Quay lại bài</button></div>}</div>}
 </section>}
 {tab==='results'&&<section className="panel"><div className="section-head"><div><span className="eyebrow">THEO DÕI TIẾN BỘ</span><h2>Lịch sử luyện tập</h2><p>Kết quả luôn được lưu trong tài khoản và đồng bộ giữa các thiết bị.</p></div></div><div className="list">{attempts.length===0?<p className="empty">Chưa có bài thi đã hoàn thành.</p>:attempts.map(a=><div className="list-item" key={a.id}><ChartNoAxesCombined size={23}/><div><b>{quizzes.find(q=>q.id===a.quiz_id)?.title||'Bộ đề'}</b><small>{new Date(a.created_at).toLocaleString('vi-VN')} · {a.correct}/{a.total} đúng · {Math.floor(a.seconds/60)} phút</small></div><button className="outline" onClick={()=>{const q=quizzes.find(x=>x.id===a.quiz_id);if(q)startQuiz(q,a)}}>Xem lời giải</button></div>)}</div></section>}</>}
 </>}<footer>HỌC CÙNG LON TON · Ôn thi Hải quan 2027 · Thông tin AI tạo cần được đối chiếu với nguồn gốc và hiệu lực văn bản.</footer></div></main></div>}
