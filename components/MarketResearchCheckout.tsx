'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { researchOrderTerms, ResearchReportLanguage } from './ResearchOrderTerms';

const RequiredMark = () => <strong aria-hidden="true" style={{color:'#ff4d4f',fontWeight:900,fontSize:'1.2em',position:'relative',top:'0.28em',lineHeight:0}}>*</strong>;

export default function MarketResearchCheckout() {
  const formRef = useRef<HTMLFormElement>(null);
  const [coupon, setCoupon] = useState('');
  const [price, setPrice] = useState(99);
  const [couponChecked, setCouponChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [filename, setFilename] = useState('');
  const [intakeEnabled, setIntakeEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOrder, setSavedOrder] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paid, setPaid] = useState(false);
  const paymentFrameRef=useRef<HTMLIFrameElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{if(paymentOpen) paymentRef.current?.scrollIntoView({behavior:'smooth',block:'start'});},[paymentOpen]);
  const pendingUpload = useRef<{fingerprint:string; ticket:string; uploadUrl:string; contentType:string; uploaded:boolean} | null>(null);
  const requestVersion = useRef(0);

  useEffect(() => {
    const controller=new AbortController();
    fetch('/api/research-orders',{signal:controller.signal}).then(response=>response.ok?response.json():null).then(config=>{if (!controller.signal.aborted) setIntakeEnabled(config?.intakeEnabled===true);}).catch(()=>{});
    return ()=>controller.abort();
  },[]);

  useEffect(()=>{
    const onPayment=(event:MessageEvent)=>{
      if(event.origin!==window.location.origin || event.source!==paymentFrameRef.current?.contentWindow || event.data?.type!=='shmilapps:payment-result')return;
      if(event.data.status==='paid' && event.data.orderId===savedOrder){setPaid(true);setPaymentOpen(false);setFormMessage(event.data.notifications?.customer==='sent'?'התשלום אומת וההזמנה התקבלה. אישור ההזמנה והקבלה נשלחו למייל שהזנתם. תודה!':'התשלום אומת וההזמנה התקבלה. משלוח האישור והקבלה עדיין בטיפול. אין צורך לשלם שוב.');}
      else setFormMessage('לא ניתן לאמת כרגע את התשלום. אם חויבתם, אין לשלם שוב. פנו אלינו עם אישור התשלום.');
    };
    window.addEventListener('message',onPayment);return()=>window.removeEventListener('message',onPayment);
  },[savedOrder]);

  async function checkCoupon() {
    const version = ++requestVersion.current;
    setChecking(true);
    setCouponMessage('');
    try {
      const response = await fetch('/api/research-quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'market-research-full', coupon }),
      });
      const quote = await response.json();
      if (version !== requestVersion.current) return;
      if (!response.ok || ![5, 69, 99].includes(quote.amount)) throw new Error();
      setPrice(quote.amount);
      setCouponChecked(quote.accepted === true);
      setCouponMessage(quote.isTest===true && quote.amount===5 ? 'קוד הבדיקה אושר. חיוב בדיקה אמיתי בסך 5 ש״ח.' : quote.accepted ? 'קוד ההנחה אושר. המחיר לתשלום: 69 ש״ח.' : coupon.trim() ? 'קוד ההנחה אינו תקין. המחיר הרגיל הוא 99 ש״ח.' : 'המחיר הרגיל הוא 99 ש״ח.');
    } catch {
      if (version !== requestVersion.current) return;
      setPrice(99);
      setCouponChecked(false);
      setCouponMessage('לא ניתן לבדוק את הקוד כרגע. נסו שוב.');
    } finally {
      if (version === requestVersion.current) setChecking(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage('');
    if (!formRef.current?.reportValidity()) return;
    if (coupon.trim() && !couponChecked) {
      setFormMessage('בדקו את קוד ההנחה או הסירו אותו לפני המעבר לתשלום.');
      document.getElementById('market-coupon')?.focus();
      return;
    }
    if (!intakeEnabled) {setFormMessage('שמירת ההזמנה עדיין בהכנה. הפרטים והמסמך לא נשלחו.');return;}
    if (saving || savedOrder) return;
    const form=new FormData(event.currentTarget);
    const file=form.get('specification');
    if (!(file instanceof File) || !file.size || file.size>10*1024*1024) {setFormMessage('צרפו מסמך אפיון תקין, עד 10MB.');return;}
    setSaving(true);
    try {
      setFormMessage('מכינים את מסמך האפיון…');
      const hash=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
      const sha256=Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
      const payload={service:'market-research-full',fullName:form.get('fullName'),email:form.get('email'),phone:form.get('phone'),business:form.get('business'),description:form.get('description'),market:form.get('market'),reportLanguage:form.get('reportLanguage'),audience:form.get('audience'),links:form.get('links'),terms:form.get('terms')==='on',coupon,file:{name:file.name,size:file.size,sha256}};
      const fingerprint=JSON.stringify(payload);
      const post=async(action:string,ticket?:string)=>{
        const response=await fetch('/api/research-orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,action,ticket})});
        const data=await response.json().catch(()=>({}));
        if (!response.ok) throw new Error(data.error || 'save_unavailable');
        return data;
      };
      if (pendingUpload.current?.fingerprint!==fingerprint) {
        const prepared=await post('prepare');
        if (typeof prepared.ticket!=='string' || typeof prepared.uploadUrl!=='string' || typeof prepared.contentType!=='string') throw new Error('save_unavailable');
        const destination=new URL(prepared.uploadUrl);
        if (destination.protocol!=='https:' || destination.hostname!=='ufolbezpnhyrsyuxuaox.supabase.co' || !destination.pathname.startsWith('/storage/v1/object/upload/sign/order-specifications/intake/')) throw new Error('save_unavailable');
        pendingUpload.current={fingerprint,ticket:prepared.ticket,uploadUrl:destination.toString(),contentType:prepared.contentType,uploaded:false};
      }
      const pending=pendingUpload.current;
      if (!pending) throw new Error('save_unavailable');
      if (!pending.uploaded) {
        setFormMessage('מעלים את המסמך באופן מאובטח…');
        const upload=await fetch(pending.uploadUrl,{method:'PUT',headers:{'Content-Type':pending.contentType,'x-upsert':'false'},body:file,credentials:'omit',referrerPolicy:'no-referrer'});
        // A previous upload may have completed while its response was lost. The
        // server always verifies the immutable object's exact hash before saving.
        if (!upload.ok && ![400,409].includes(upload.status)) throw new Error('upload_failed');
        pending.uploaded=true;
      }
      setFormMessage('בודקים את המסמך ושומרים את ההזמנה…');
      const saved=await post('finalize',pending.ticket);
      if (saved.status!=='saved' || typeof saved.orderId!=='string') throw new Error('save_unavailable');
      const destination=new URL(saved.checkoutUrl);
      if(destination.origin!=='https://pay.sumit.co.il' || ![5,69,99].includes(saved.amount)) throw new Error('save_unavailable');
      // SUMIT's documented hosted-checkout prefill parameters. Never add card data.
      destination.searchParams.set('name',String(payload.fullName || ''));
      destination.searchParams.set('emailaddress',String(payload.email || ''));
      setPrice(saved.amount); setCheckoutUrl(destination.toString()); setPaymentOpen(true);
      setSavedOrder(saved.orderId); pendingUpload.current=null;
      setFormMessage('ההזמנה ומסמך האפיון נשמרו. אפשר לשלם בטופס שלמטה.');
    } catch(error) {
      const code=error instanceof Error?error.message:'';
      if (code==='upload_missing' && pendingUpload.current) pendingUpload.current.uploaded=false;
      if (['expired_session','invalid_session','changed_details','invalid_document'].includes(code)) pendingUpload.current=null;
      const messages:Record<string,string>={invalid_fields:'השלימו את כל שדות החובה בפרטים תקינים.',invalid_coupon:'קוד ההנחה אינו תקין. בדקו אותו או הסירו אותו.',invalid_document:'תוכן המסמך אינו תואם לקובץ PDF, DOCX או TXT תקין. בחרו מסמך אחר.',expired_session:'זמן ההעלאה הסתיים. לחצו שוב כדי להתחיל מחדש.',rate_limited:'בוצעו יותר מדי ניסיונות. נסו שוב מאוחר יותר.',upload_missing:'המסמך טרם הועלה. לחצו שוב כדי לנסות להעלות אותו.',upload_failed:'העלאת המסמך לא הושלמה. בדקו את החיבור ונסו שוב.',intake_not_ready:'שמירת ההזמנות עדיין אינה זמינה. ההזמנה לא נשמרה.'};
      setFormMessage(messages[code] || 'לא ניתן לאשר שההזמנה נשמרה. לחצו שוב לניסיון נוסף.');
    } finally {setSaving(false);}
  }

  return <section className="market-payment-section market-order market-checkout" id="market-payment" dir="rtl" aria-labelledby="market-payment-title">
    <div className="market-checkout-card">
      <img src="/portfolio/market-research/market-research-agri.png" alt="דוגמה לכריכת סקר שוק מעמיק עבור מערכת לניהול שטחי חקלאות" width="1680" height="936" loading="lazy" />
      <div>
        <h3 id="market-payment-title">סקר שוק מלא</h3>
        <p>מחקר מעמיק בישראל ובחו״ל, ניתוח מתחרים והמלצות מוצר.</p>
        <p className="market-checkout-price">{price === 5 ? <><span>חיוב בדיקה</span><strong>5 ש״ח</strong><span>זהו תשלום בדיקה אמיתי</span></> : price === 69 ? <><span className="market-checkout-original">מחיר רגיל: <s>99 ש״ח</s></span><strong>69 ש״ח</strong><span>לאחר הנחה של 30 ש״ח</span></> : <><span>מחיר השירות</span><strong>99 ש״ח</strong></>}</p>
        <div className="market-checkout-coupon">
          <label htmlFor="market-coupon">קוד קופון / קוד הנחה</label>
          <div><input id="market-coupon" disabled={saving || !!savedOrder} value={coupon} dir="ltr" autoComplete="off" spellCheck={false} maxLength={80} aria-describedby="market-coupon-message" onChange={event => {
            requestVersion.current++;
            setCoupon(event.target.value); setPrice(99); setCouponChecked(false); setChecking(false); setCouponMessage(''); setFormMessage('');
          }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); if (!checking) void checkCoupon(); } }} /><button type="button" disabled={checking || saving || !!savedOrder} onClick={() => void checkCoupon()}>{checking ? 'בודקים…' : 'בדיקת קוד'}</button></div>
          <p id="market-coupon-message" role="status">{couponMessage}</p>
        </div>
      </div>
    </div>
    <p>{researchOrderTerms.he.delivery}</p>
    <p>{researchOrderTerms.he.refund}</p>
    <p className="market-order-status">{intakeEnabled?<>לאחר השלמת שדות החובה <span style={{whiteSpace:'nowrap'}}>( <RequiredMark /> )</span> ושמירת מסמך האפיון, ייפתח כאן תשלום מאובטח בסאמיט לפי המחיר שאושר.</>:'ההזמנה המקוונת בהכנה. אפשר למלא ולבדוק את הטופס; הפרטים והקובץ אינם נשלחים בשלב זה.'}</p>
    <form ref={formRef} onSubmit={submit} onInvalidCapture={() => setFormMessage('כדי להמשיך, השלימו את שדות החובה וצרפו מסמך אפיון.')}>
      <fieldset className="market-intake-fields" disabled={saving || !!savedOrder}>
      <div className="market-order-grid">
        <label><span>שם מלא <RequiredMark /></span><input name="fullName" autoComplete="name" required minLength={2} maxLength={120} pattern=".*\S.*" /></label>
        <label>עסק / ארגון<input name="business" autoComplete="organization" maxLength={160} /></label>
        <label><span>אימייל <RequiredMark /></span><input type="email" name="email" autoComplete="email" dir="ltr" required maxLength={254} /></label>
        <label><span>טלפון <RequiredMark /></span><input type="tel" name="phone" autoComplete="tel" dir="ltr" required minLength={7} maxLength={40} onChange={event => {
          const value = event.target.value; const digits = value.replace(/\D/g, '');
          event.target.setCustomValidity(/^\+?[\d ()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15 ? '' : 'הזינו מספר טלפון תקין.');
        }} /></label>
      </div>
      <label><span>מה תרצו לבדוק? <RequiredMark /></span><textarea name="description" required rows={4} maxLength={10000} onChange={event => event.target.setCustomValidity(event.target.value.trim() ? '' : 'כתבו מה תרצו לבדוק.')} /></label>
      <div className="market-order-grid">
        <label><span>שוק יעד <RequiredMark /></span><select name="market" defaultValue="both" required><option value="israel">ישראל</option><option value="international">חו״ל</option><option value="both">ישראל וחו״ל</option></select></label>
        <ResearchReportLanguage language="he" requiredIndicator />
      </div>
      <label>קהל יעד, מדינות ודגשים<textarea name="audience" rows={3} maxLength={5000} /></label>
      <label>מתחרים וקישורים מוכרים<textarea name="links" rows={3} maxLength={5000} /></label>
      <label><span>מסמך אפיון <RequiredMark /></span><input type="file" name="specification" required accept=".pdf,.docx,.txt" aria-describedby="market-spec-help" onChange={event => {
        const input = event.target; const file = input.files?.[0]; setFilename(''); setFormMessage(''); input.setCustomValidity('');
        if (!file) return;
        if (!file.size || file.size > 10 * 1024 * 1024 || !/\.(pdf|docx|txt)$/i.test(file.name)) {
          input.value = ''; input.setCustomValidity('בחרו מסמך PDF, DOCX או TXT שאינו ריק, עד 10MB.'); input.reportValidity(); return;
        }
        setFilename(file.name);
      }} /></label>
      <small id="market-spec-help">מסמך PDF, DOCX או TXT, עד 10MB. ככל שהאפיון מפורט יותר, הסקר יהיה ממוקד ורלוונטי יותר. {intakeEnabled?'המסמך יועלה למאגר פרטי לאחר הלחיצה.':'הקובץ נשאר במכשיר בשלב הבדיקות.'}</small>
      {filename ? <p className="market-file-name"><bdi>{filename}</bdi></p> : null}
      <label className="market-checkout-consent"><input type="checkbox" name="terms" required /><span>קראתי את זמן האספקה ותנאי ההחזר המופיעים למעלה. <RequiredMark /></span></label>
      </fieldset>
      <button className="market-checkout-submit" type="submit" disabled={checking || saving || !!savedOrder}>{saving?'שומרים את ההזמנה…':savedOrder?(paid?'ההזמנה שולמה':'ההזמנה נשמרה'):`מעבר לתשלום · ${price} ש״ח`}</button>
      {savedOrder && !paymentOpen && !paid?<button className="market-checkout-submit" type="button" onClick={()=>setPaymentOpen(true)}>פתיחת התשלום · {price} ש״ח</button>:null}
      {savedOrder?<p>מספר הזמנה: <bdi>{savedOrder}</bdi></p>:null}
      <p className="market-checkout-message" role="alert">{formMessage}</p>
    </form>
    {checkoutUrl && paymentOpen?<div ref={paymentRef} className="market-temporary-payment" style={{scrollMarginTop:'100px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
        <h3>{price===5?'חיוב בדיקה':'תשלום עבור סקר שוק מלא'} · {price} ש״ח</h3>
        <button type="button" aria-label="סגירת טופס התשלום" title="סגירת טופס התשלום" onClick={()=>setPaymentOpen(false)} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,width:'44px',height:'44px',fontSize:'30px',lineHeight:1,cursor:'pointer'}}>×</button>
      </div>
      <iframe ref={paymentFrameRef} title={`${price===5?'תשלום בדיקה':'תשלום עבור סקר שוק מלא'} מאובטח בסאמיט — ${price} ש״ח`} src={checkoutUrl} style={{display:'block',width:'100%',height:'850px',border:0,borderRadius:'12px',background:'#fff'}} allow="payment" referrerPolicy="no-referrer" />
      <p><a href={checkoutUrl} target="_blank" rel="noopener noreferrer">אם טופס התשלום אינו מוצג, פתחו אותו בחלון נפרד</a></p>
    </div>:null}
  </section>;
}
