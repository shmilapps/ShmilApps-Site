 'use client';
import {useState} from 'react';
import MarketResearchCheckout from './MarketResearchCheckout';
import OnlineOrderSection from './OnlineOrderSection';
import {orderCatalog,type OrderProductId} from './orderCatalog';
export default function ServiceOnlineOrder({language,branding=false}:{language:'he'|'en';branding?:boolean}){
 const [selected,setSelected]=useState<OrderProductId|null>(null);const he=language==='he';const ids:OrderProductId[]=branding?['logo-full','advertising-video']:['asset-research-full'];
 return <OnlineOrderSection id={branding?'branding-order':'stock-order'} language={language} subtitle={branding?(he?'לוגו וסרטון פרסומת — בחרו מוצר להזמנה':'Logo and advertising video — choose a product'):(he?'תחקיר מניה או מטבע — פרטי בקשה ותשלום':'Stock or crypto research — request and payment')}>
 {ids.map(id=>{const p=orderCatalog[id];return <div key={id}>{branding?<button className="online-product-row" type="button" aria-expanded={selected===id} aria-controls={id+'-form'} onClick={()=>setSelected(selected===id?null:id)}><img src={p.image} alt="" width="90" height="90" loading="lazy"/><span><strong>{p[language]}</strong><small>{he?`${p.regular} ש״ח${id==='advertising-video'?' לדקה':''}`:`₪${p.regular}${id==='advertising-video'?' per minute':''}`}</small></span><span aria-hidden="true">{selected===id?'−':'+'}</span></button>:null}<div id={id+'-form'} hidden={branding&&selected!==id}><MarketResearchCheckout language={language} productId={id} embedded/></div></div>;})}
 </OnlineOrderSection>;
}
