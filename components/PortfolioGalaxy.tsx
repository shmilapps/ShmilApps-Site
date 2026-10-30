'use client';

import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import './portfolio-galaxy.css';
import {orbitCount,galaxyFrame,galaxyLayout,pointOnGalaxy} from './galaxyMotion';

type Technology={id:string;name:string;logo:string;enabled:boolean};
type Project={id:string;title:string;subtitle:{he:string;en:string};description:{he:string;en:string};video:string;poster:string;href:string};
const projects:Project[]=[
 {id:'shmilventory',title:'ShmilVentory',subtitle:{he:'ניהול מלאי בכף היד',en:'Inventory in your hands'},description:{he:'אפליקציה לניהול מלאי עם סריקת ברקודים, תמונות מוצר, עבודה עם נתונים מקומיים וייצוא מידע. פותחה ב־Flutter ו־Dart עם Supabase ו־PostgreSQL.',en:'An inventory app with barcode scanning, product images, local data and exports. Built with Flutter, Dart, Supabase and PostgreSQL.'},video:'/portfolio/shmilventory/shmilventory-ad-web.mp4',poster:'/portfolio/shmilventory/shmilventory-video-poster.png',href:'/services/app-development'},
 {id:'shmilaclick',title:'ShmilaClick!',subtitle:{he:'תמונת מצב אחת למערכות רבות',en:'One view across many systems'},description:{he:'מערכת תוכנה וניהול המחברת נתונים ותהליכים לתמונת מצב תפעולית. משלבת Python, React, Java, VB ו־VBA לצד SQL ובסיסי נתונים של Oracle.',en:'A management system connecting data and processes into an operational overview. Combines Python, React, Java, VB and VBA with SQL and Oracle databases.'},video:'/portfolio/shmilaclick/shmilaclick-ad-web.mp4',poster:'/portfolio/shmilaclick/shmilaclick-video-poster.jpg',href:'/services/software-management'},
 {id:'brand',title:'ShmilApps',subtitle:{he:'מותג בתנועה',en:'A brand in motion'},description:{he:'זהות המותג של ShmilApps בתנועה: לוגו, שפה חזותית ואנימציה בצבעי האתר.',en:'The ShmilApps identity in motion: logo, visual language and animation in the site’s signature colors.'},video:'/brand/LogoClip_10sec.mp4',poster:'/portfolio/shmilapps/logo-cover.webp',href:'/services/websites-and-branding'},
 {id:'advertising',title:'ShmilApps · Promo',subtitle:{he:'מרעיון לפרסומת',en:'From an idea to an advertisement'},description:{he:'סרטון פרסומת של ShmilApps, המשלב את שפת המותג עם תוכן שיווקי בווידאו.',en:'A ShmilApps promotional video combining the brand’s visual language with video marketing.'},video:'/portfolio/shmilapps/status-promo.mp4',poster:'/portfolio/shmilapps/status-cover.webp',href:'/services/websites-and-branding'}
];

function TechnologyStrip({items,reverse,paused}:{items:Technology[];reverse?:boolean;paused:boolean}){
 const orderedItems=reverse?[...items].reverse():items;
 return <div className={'galaxy-tech-strip'+(reverse?' reverse':'')} dir="ltr">
  <div className="galaxy-tech-track" style={{animationPlayState:paused?'paused':'running'} as CSSProperties}>
   {[0,1].map(copy=><div className="galaxy-tech-group" key={copy} aria-hidden={copy===1?true:undefined}>
    {orderedItems.map(t=><span className="galaxy-tech-item" key={t.id}><img src={t.logo} alt="" width="26" height="26" loading="lazy"/><span>{t.name}</span></span>)}
   </div>)}
  </div>
 </div>;
}

export default function PortfolioGalaxy({language}:{language:'he'|'en'}){
 const he=language==='he';
 const [technologies,setTechnologies]=useState<Technology[]>([]);
 const [selected,setSelected]=useState<Project|null>(null);
 const [manualPause,setManualPause]=useState(false);
 const [visible,setVisible]=useState(false);
 const [reduced,setReduced]=useState(false);
 const [pageHidden,setPageHidden]=useState(false);
 const section=useRef<HTMLElement>(null);
 const stage=useRef<HTMLDivElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLElement|null>(null);
 const elapsed=useRef(0);
 const paused=manualPause||!!selected||reduced||!visible||pageHidden;

 useEffect(()=>{
  const controller=new AbortController();
  fetch('/data/portfolio-technologies.json',{signal:controller.signal,cache:'no-cache'})
   .then(r=>{if(!r.ok)throw new Error('catalog');return r.json();})
   .then(data=>setTechnologies((data.technologies||[]).filter((t:Technology)=>t.enabled&&typeof t.name==='string'&&typeof t.logo==='string'&&t.logo.startsWith('/brand/technologies/'))))
   .catch(()=>{});
  return()=>controller.abort();
 },[]);
 useEffect(()=>{
  const visibility=()=>setPageHidden(document.hidden);visibility();document.addEventListener('visibilitychange',visibility);
  const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReduced(mq.matches);update();mq.addEventListener('change',update);
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'100px'});
  if(section.current)observer.observe(section.current);
  return()=>{mq.removeEventListener('change',update);observer.disconnect();document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useLayoutEffect(()=>{
  const element=stage.current;if(!element)return;
  let frame=0,last=0;
  const cards=Array.from(element.querySelectorAll<HTMLElement>('.galaxy-orbit-card'));
  const paint=(time:number)=>{
   if(last&&!paused&&!document.hidden)elapsed.current+=Math.min(time-last,50)/1000;
   last=time;
   const content=element.parentElement!;
   const width=content.clientWidth,height=content.clientHeight;
   const layout=galaxyLayout(width,height);
   const image=content.querySelector<HTMLElement>('.galaxy-space-image');
   if(image){Object.assign(image.style,{left:layout.left+'px',top:layout.top+'px',width:layout.width+'px',height:layout.height+'px'});}
   const stageTop=element.getBoundingClientRect().top-content.getBoundingClientRect().top;
   cards.forEach((card,index)=>{
    const motion=galaxyFrame(index,elapsed.current);
    const point=pointOnGalaxy(motion,layout);
    const x=point.x-width/2;
    const y=point.y-stageTop-element.clientHeight/2;
    card.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) scale(${motion.scale})`;
    card.style.opacity=String(motion.opacity);
    card.style.zIndex=String(Math.round(motion.progress*100));
    card.style.pointerEvents=motion.progress>.08&&motion.opacity>.15?'auto':'none';
    const video=card.querySelector('video');
    if(video){
     const shouldPlay=!paused&&motion.active&&motion.opacity>.03;
     if(!shouldPlay){video.pause();video.dataset.galaxyPlaying='0';}
     else if(video.dataset.galaxyPlaying!=='1'){
      video.dataset.galaxyPlaying='1';void video.play().catch(()=>{video.dataset.galaxyPlaying='0';});
     }
    }
   });
   if(!paused)frame=requestAnimationFrame(paint);
  };
  paint(performance.now());
  const resize=new ResizeObserver(()=>{if(paused)paint(performance.now());});
  resize.observe(element.parentElement!);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();};
 },[paused]);
 useEffect(()=>{
  stage.current?.querySelectorAll('video').forEach(v=>{
   if(paused){v.pause();v.dataset.galaxyPlaying='0';}
  });
 },[paused]);
 useEffect(()=>{
  if(!selected||!dialog.current)return;
  const modal=dialog.current;
  modal.showModal();
  const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{modal.close();document.body.style.overflow=oldOverflow;opener.current?.focus({preventScroll:true});};
 },[selected]);
 const open=(project:Project,target:HTMLElement)=>{opener.current=target;setSelected(project);};
 return <section id="portfolio" className="portfolio-galaxy-section" ref={section} aria-labelledby="portfolio-title" dir={he?'rtl':'ltr'}>
  <TechnologyStrip items={technologies} paused={paused}/>
  <div className="galaxy-content">
   <img className="galaxy-space-surroundings" src="/brand/examples/portfolio-galaxy-panorama.webp" alt="" loading="lazy" aria-hidden="true"/>
   <img className="galaxy-space-image" src="/brand/examples/portfolio-galaxy-selected.webp" alt="" loading="lazy" aria-hidden="true"/>
  <div className="galaxy-heading"><h2 id="portfolio-title" dir={he?'rtl':'ltr'}>{he?<>גלקסיית <em>עבודות</em></>:<>Portfolio <em>Galaxy</em></>}</h2><p>{he?'רעיונות שהפכו למציאות | עבודות נבחרות | לחצו וגלו את הסיפור של כל אחת.':'Ideas turned into reality | Selected work | Click to discover each story.'}</p></div>
  <div className={'galaxy-stage'+(reduced?' reduced':'')} ref={stage}>
   {Array.from({length:orbitCount},(_,index)=>{const p=projects[(index+Math.floor(index/4))%projects.length];return <button key={index} data-arm={Math.floor(index/4)+1} className="galaxy-orbit-card" tabIndex={index<projects.length?0:-1} aria-label={he?'פתיחת העבודה: '+p.title:'Open project: '+p.title} aria-hidden={index>=projects.length?true:undefined} onClick={e=>open(p,e.currentTarget)}>
    <video muted playsInline loop preload="none" poster={p.poster}>{visible&&!reduced&&<source src={'/portfolio/previews/'+p.id+'.mp4'} type="video/mp4"/>}</video>
    <span><strong>{p.title}</strong><small>{p.subtitle[language]}</small></span>
   </button>;})}
  </div>
  <div className="galaxy-controls"><button type="button" onClick={()=>setManualPause(x=>!x)} aria-pressed={manualPause} aria-label={manualPause?(he?'המשך תנועה':'Resume motion'):(he?'עצירת תנועה':'Pause motion')} title={manualPause?(he?'המשך תנועה':'Resume motion'):(he?'עצירת תנועה':'Pause motion')}><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">{manualPause?<path d="M8 4 21 12 8 20Z" fill="currentColor"/>:<g fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></g>}</svg></button><p className="galaxy-promise"><span>{he?'מבינים שכל עבודה, היא עולם שלם עבורכם.':'We understand that every project means the world to you.'}</span><strong>{he?'גם עבורנו!':'It does to us, too!'}</strong></p></div>
  </div>
  <TechnologyStrip items={technologies} reverse paused={paused}/>
  {selected&&<dialog className="galaxy-dialog" ref={dialog} aria-labelledby="galaxy-project-title" onCancel={e=>{e.preventDefault();setSelected(null);}} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
   <article dir={he?'rtl':'ltr'}><button type="button" className="galaxy-dialog-close" onClick={()=>setSelected(null)} autoFocus aria-label={he?'סגירת פרטי העבודה':'Close project details'}>×</button>
    <video key={selected.id} controls autoPlay playsInline preload="metadata" poster={selected.poster}><source src={selected.video} type="video/mp4"/></video>
    <div className="galaxy-dialog-copy"><h3 id="galaxy-project-title">{selected.title}</h3><h4>{selected.subtitle[language]}</h4><p>{selected.description[language]}</p><a href={selected.href+'?lang='+language}>{he?'לפרטים ולדוגמה המלאה':'Explore the full case study'} ↗</a></div>
   </article>
  </dialog>}
 </section>;
}
