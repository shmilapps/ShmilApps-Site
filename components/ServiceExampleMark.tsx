'use client';
import {useEffect,useRef,useState} from 'react';
const images:Record<string,string>={
 'quote-cost-reduction':'/brand/examples/dollars.png',
 'training-enrichment':'/brand/examples/bitcoin.png',
 'stock-crypto-research':'/brand/examples/link.png',
 'app-development':'/portfolio/shmilventory/shmilventory-logo.png',
 'software-management':'/brand/examples/monitor.png',
 'needs-discovery-fde':'/brand/examples/monitor.png',
 'websites-and-branding':'/brand/shmilapps-hero-transparent.webp',
 'automation-ai':'/brand/ai/shmilapps-ai-bot-icon-512.png',
 'business-integrations':'/brand/examples/integration.png',
 'market-research':'/brand/examples/market.png?v=rtl'
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
 return <span ref={ref} className={'service-example-mark'+(service==='websites-and-branding'?' brand-motion':'')} aria-hidden="true">{image?(animate?<video src="/brand/LogoClip_10sec.mp4" poster={image} autoPlay muted loop playsInline preload="metadata" onError={()=>setAnimate(false)}/>:<img src={image} alt="" width="128" height="68" loading="lazy"/>):service==='crypto-exchange-investigations'?<svg viewBox="0 0 120 100"><defs><linearGradient id="heart-shine" x2=".7" y2="1"><stop stopColor="#ff8795"/><stop offset=".45" stopColor="#f32e4d"/><stop offset="1" stopColor="#a30930"/></linearGradient></defs><path fill="url(#heart-shine)" d="M60 91C44 78 10 54 10 30 10 3 43-3 60 20 77-3 110 3 110 30c0 24-34 48-50 61Z"/><path fill="none" stroke="#ffb4bd" strokeWidth="5" strokeLinecap="round" d="M25 29q6-14 20-8"/></svg>:null}</span>;
}
