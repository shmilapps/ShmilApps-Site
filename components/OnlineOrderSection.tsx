 'use client';
import {useEffect,type ReactNode} from 'react';
export function openOnlineOrder(id:string){
 const target=document.getElementById(id);if(!(target instanceof HTMLDetailsElement))return;
 target.open=true;requestAnimationFrame(()=>{const offset=document.querySelector('.service-sticky-area')?.getBoundingClientRect().bottom??0;
 window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-offset-16,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
}
export default function OnlineOrderSection({id,language,subtitle,children}:{id:string;language:'he'|'en';subtitle:string;children:ReactNode}){
 const he=language==='he';useEffect(()=>{const open=()=>{if(location.hash==='#'+id||(id==='market-order'&&location.hash==='#market-payment'))openOnlineOrder(id);};open();window.addEventListener('hashchange',open);return()=>window.removeEventListener('hashchange',open);},[id]);
 return <details className="service-detail online-order" id={id} dir={he?'rtl':'ltr'}><summary><span className="online-order-heading"><strong>{he?'הזמנה אונליין':'Online order'}</strong><small className="service-summary-text">{subtitle}</small></span><button type="button" className="online-order-cta" onClick={event=>{event.preventDefault();event.stopPropagation();openOnlineOrder(id);}}>{he?'הזמן עכשיו':'Order now'}</button><em><span className="more-text">{he?'עוד…':'More…'}</span><span className="less-text">{he?'פחות…':'Less…'}</span></em></summary><div className="service-detail-body">{children}</div></details>;
}
