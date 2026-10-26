'use client';
import {useEffect,useRef,useState} from 'react';
const images:Record<string,string>={
 'app-development':'/portfolio/shmilventory/shmilventory-logo.png',
 'software-management':'/brand/examples/monitor.png',
 'needs-discovery-fde':'/brand/examples/monitor.png',
 'websites-and-branding':'/brand/shmilapps-hero-transparent.webp',
 'automation-ai':'/brand/ai/shmilapps-ai-bot-icon-512.png',
 'business-integrations':'/brand/examples/integration.png',
 'market-research':'/brand/examples/market.png'
};
export default function ServiceExampleMark({service}:{service:string}){
 const image=images[service];const ref=useRef<HTMLSpanElement>(null);const [animate,setAnimate]=useState(false);
 useEffect(()=>{
  if(service!=='websites-and-branding'||!ref.current)return;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
  const update=()=>setAnimate(visible&&!media.matches);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{rootMargin:'100px'});observer.observe(ref.current);media.addEventListener('change',update);
  return()=>{observer.disconnect();media.removeEventListener('change',update);};
 },[service]);
 return <span ref={ref} className={'service-example-mark'+(service==='websites-and-branding'?' brand-motion':'')} aria-hidden="true">{image?(animate?<video src="/brand/LogoClip_10sec.mp4" poster={image} autoPlay muted loop playsInline preload="metadata" onError={()=>setAnimate(false)}/>:<img src={image} alt="" width="128" height="68" loading="lazy"/>):service==='stock-crypto-research'?<svg viewBox="0 0 120 100"><path fill="#375bd2" fillRule="evenodd" d="M60 5 100 28v45L60 96 20 73V28Zm0 17L35 36v29l25 14 25-14V36Z"/></svg>:service==='crypto-exchange-investigations'?<svg viewBox="0 0 120 100"><defs><linearGradient id="heart-shine" x2=".7" y2="1"><stop stopColor="#ff8795"/><stop offset=".45" stopColor="#f32e4d"/><stop offset="1" stopColor="#a30930"/></linearGradient></defs><path fill="url(#heart-shine)" d="M60 91C44 78 10 54 10 30 10 3 43-3 60 20 77-3 110 3 110 30c0 24-34 48-50 61Z"/><path fill="none" stroke="#ffb4bd" strokeWidth="5" strokeLinecap="round" d="M25 29q6-14 20-8"/></svg>:service==='training-enrichment'?<svg viewBox="0 0 120 100"><defs><linearGradient id="btc-gold" x2="1" y2="1"><stop stopColor="#ffe77e"/><stop offset="1" stopColor="#eb861b"/></linearGradient></defs><ellipse cx="64" cy="51" rx="42" ry="44" fill="#a86413"/><circle cx="59" cy="48" r="43" fill="url(#btc-gold)" stroke="#ffeab6" strokeWidth="2"/><circle cx="59" cy="48" r="35" fill="none" stroke="#d48b21" strokeWidth="2"/><text x="59" y="67" textAnchor="middle" fill="#fff4d3" fontSize="57" fontFamily="Arial" fontWeight="bold">₿</text></svg>:<svg viewBox="0 0 128 100"><defs><linearGradient id="cash-green" x2="0" y2="1"><stop stopColor="#b6ef86"/><stop offset="1" stopColor="#37813e"/></linearGradient></defs>{[0,1,2].map(i=><g key={i} transform={`translate(${i*4},${23-i*7}) rotate(${-10+i*7} 60 30)`}><rect x="8" y="10" width="100" height="51" rx="6" fill="url(#cash-green)" stroke="#d4f7bd" strokeWidth="2"/><rect x="15" y="17" width="86" height="37" rx="6" fill="none" stroke="#348047" strokeWidth="2"/><ellipse cx="58" cy="35" rx="19" ry="21" fill="#286c38"/><text x="58" y="45" textAnchor="middle" fill="#e7ffce" fontFamily="Arial" fontSize="30" fontWeight="bold">$</text></g>)}</svg>}</span>;
}
