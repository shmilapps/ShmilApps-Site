'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { researchOrderTerms, ResearchReportLanguage } from './ResearchOrderTerms';

const RequiredMark = () => <strong aria-hidden="true" style={{color:'#ff4d4f',fontWeight:900,fontSize:'1.2em',position:'relative',top:'0.28em',lineHeight:0}}>*</strong>;

export function openMarketResearchOrder() {
  const target = document.getElementById('market-order');
  if (!(target instanceof HTMLDetailsElement)) return;
  target.open = true;
  requestAnimationFrame(() => {
    const offset = document.querySelector('.service-sticky-area')?.getBoundingClientRect().bottom ?? 0;
    window.scrollTo({top: window.scrollY + target.getBoundingClientRect().top - offset - 16,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
}

export default function MarketResearchCheckout({language = 'he'}: {language?: 'he' | 'en'}) {
  const t = (he: string, en: string) => language === 'he' ? he : en;
  const orderDetailsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const openFromHash = () => {if (['#market-order', '#market-payment'].includes(location.hash)) openMarketResearchOrder();};
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);
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
  const [editing, setEditing] = useState(false);
  const editTicket = useRef('');
  const savedFingerprint = useRef('');
  // Changing the page language keeps the order and fields, but clears stale localized hints.
  useEffect(() => {
    setCouponMessage('');
    setFormMessage(paid
      ? t('התשלום אומת וההזמנה התקבלה. תודה!', 'Payment verified and order received. Thank you!')
      : savedOrder ? t('ההזמנה ומסמך האפיון נשמרו. אפשר לשלם בטופס שלמטה.', 'Your order and specification have been saved. Continue with the payment form below.') : '');
  }, [language]);

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
      if(event.data.status==='paid' && event.data.orderId===savedOrder){setPaid(true);setEditing(false);setPaymentOpen(false);setFormMessage(event.data.notifications?.customer==='sent'?t("התשלום אומת וההזמנה התקבלה. אישור ההזמנה והקבלה נשלחו למייל שהזנתם. תודה!","Payment verified and order received. Your confirmation and receipt have been emailed. Thank you!"):t("התשלום אומת וההזמנה התקבלה. משלוח האישור והקבלה עדיין בטיפול. אין צורך לשלם שוב.","Payment verified and order received. Your confirmation and receipt are being sent. Do not pay again."));}
      else setFormMessage(t("לא ניתן לאמת כרגע את התשלום. אם חויבתם, אין לשלם שוב. פנו אלינו עם אישור התשלום.","We cannot verify the payment right now. If you were charged, do not pay again. Contact us with your payment confirmation."));
    };
    window.addEventListener('message',onPayment);return()=>window.removeEventListener('message',onPayment);
  },[savedOrder,language]);

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
      setCouponMessage(quote.isTest===true && quote.amount===5 ? t("קוד הבדיקה אושר. חיוב בדיקה אמיתי בסך 5 ש״ח.","Test code accepted. This is a real ₪5 test payment.") : quote.accepted ? t("קוד ההנחה אושר. המחיר לתשלום: 69 ש״ח.","Discount code accepted. Total to pay: ₪69.") : coupon.trim() ? t("קוד ההנחה אינו תקין. המחיר הרגיל הוא 99 ש״ח.","Invalid discount code. The regular price is ₪99.") : t("המחיר הרגיל הוא 99 ש״ח.","The regular price is ₪99."));
    } catch {
      if (version !== requestVersion.current) return;
      setPrice(99);
      setCouponChecked(false);
      setCouponMessage(t("לא ניתן לבדוק את הקוד כרגע. נסו שוב.","Unable to check the code right now. Please try again."));
    } finally {
      if (version === requestVersion.current) setChecking(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage('');
    if (!formRef.current?.reportValidity()) return;
    if (coupon.trim() && !couponChecked) {
      setFormMessage(t("בדקו את קוד ההנחה או הסירו אותו לפני המעבר לתשלום.","Check your discount code or remove it before continuing to payment."));
      document.getElementById('market-coupon')?.focus();
      return;
    }
    if (!intakeEnabled) {setFormMessage(t("שמירת ההזמנה עדיין בהכנה. הפרטים והמסמך לא נשלחו.","Online ordering is currently unavailable. Your details and document have not been sent."));return;}
    if (saving || paid || (savedOrder && !editing)) return;
    const form=new FormData(event.currentTarget);
    const file=form.get('specification');
    if (!(file instanceof File) || !file.size || file.size>10*1024*1024) {setFormMessage(t("צרפו מסמך אפיון תקין, עד 10MB.","Attach a valid specification file, up to 10MB."));return;}
    setSaving(true);
    try {
      setFormMessage(t("מכינים את מסמך האפיון…","Preparing your specification…"));
      const hash=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
      const sha256=Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
      const payload={service:'market-research-full',fullName:form.get('fullName'),email:form.get('email'),phone:form.get('phone'),business:form.get('business'),description:form.get('description'),market:form.get('market'),reportLanguage:form.get('reportLanguage'),audience:form.get('audience'),links:form.get('links'),terms:form.get('terms')==='on',coupon,file:{name:file.name,size:file.size,sha256}};
      const fingerprint=JSON.stringify(payload);
      if(savedOrder && fingerprint===savedFingerprint.current){setEditing(false);setPaymentOpen(true);return;}
      const post=async(action:string,ticket?:string)=>{
        const response=await fetch('/api/research-orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,action,ticket,...(editTicket.current?{editTicket:editTicket.current}:{})})});
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
        setFormMessage(t("מעלים את המסמך באופן מאובטח…","Securely uploading your document…"));
        const upload=await fetch(pending.uploadUrl,{method:'PUT',headers:{'Content-Type':pending.contentType,'x-upsert':'false'},body:file,credentials:'omit',referrerPolicy:'no-referrer'});
        // A previous upload may have completed while its response was lost. The
        // server always verifies the immutable object's exact hash before saving.
        if (!upload.ok && ![400,409].includes(upload.status)) throw new Error('upload_failed');
        pending.uploaded=true;
      }
      setFormMessage(t("בודקים את המסמך ושומרים את ההזמנה…","Checking your document and saving your order…"));
      const saved=await post('finalize',pending.ticket);
      if (saved.status!=='saved' || typeof saved.orderId!=='string') throw new Error('save_unavailable');
      const destination=new URL(saved.checkoutUrl);
      if(destination.origin!=='https://pay.sumit.co.il' || ![5,69,99].includes(saved.amount)) throw new Error('save_unavailable');
      // SUMIT's documented hosted-checkout prefill parameters. Never add card data.
      destination.searchParams.set('name',String(payload.fullName || ''));
      destination.searchParams.set('emailaddress',String(payload.email || ''));
      setPrice(saved.amount); setCheckoutUrl(destination.toString()); setPaymentOpen(true);
      setSavedOrder(saved.orderId); editTicket.current=saved.editTicket || pending.ticket;
      savedFingerprint.current=fingerprint;setEditing(false);pendingUpload.current=null;
      setFormMessage(t("ההזמנה ומסמך האפיון נשמרו. אפשר לשלם בטופס שלמטה.","Your order and specification have been saved. Continue with the payment form below."));
    } catch(error) {
      const code=error instanceof Error?error.message:'';
      if (code==='upload_missing' && pendingUpload.current) pendingUpload.current.uploaded=false;
      if (['expired_session','invalid_session','changed_details','invalid_document'].includes(code)) pendingUpload.current=null;
      if(code==='order_not_editable')setEditing(false);
      const messages:Record<string,string>={
        order_not_editable:t('ההזמנה כבר אינה פתוחה לעריכה. אם שילמתם, אין לשלם שוב; פנו אלינו לשינוי הפרטים.','This order is no longer editable. If you have paid, do not pay again; contact us to change the details.'),
        invalid_edit_session:t('לא ניתן לאמת הרשאה לעריכת ההזמנה. פנו אלינו עם מספר ההזמנה.','Unable to verify permission to edit this order. Contact us with the order number.'),
        checkout_price_locked:t('המחיר של התשלום שכבר נפתח נשמר. ניתן לערוך את פרטי הבקשה ואת האפיון.','The price of the checkout already opened stays unchanged. You can edit request details and the specification.'),invalid_fields:t("השלימו את כל שדות החובה בפרטים תקינים.","Complete all required fields with valid details."),invalid_coupon:t("קוד ההנחה אינו תקין. בדקו אותו או הסירו אותו.","Invalid discount code. Check it or remove it."),invalid_document:t("תוכן המסמך אינו תואם לקובץ PDF, DOCX או TXT תקין. בחרו מסמך אחר.","The document is not a valid PDF, DOCX or TXT file. Choose another file."),expired_session:t("זמן ההעלאה הסתיים. לחצו שוב כדי להתחיל מחדש.","Your upload session expired. Please try again."),rate_limited:t("בוצעו יותר מדי ניסיונות. נסו שוב מאוחר יותר.","Too many attempts. Please try again later."),upload_missing:t("המסמך טרם הועלה. לחצו שוב כדי לנסות להעלות אותו.","Your document has not been uploaded. Please try again."),upload_failed:t("העלאת המסמך לא הושלמה. בדקו את החיבור ונסו שוב.","The upload did not finish. Check your connection and try again."),intake_not_ready:t("שמירת ההזמנות עדיין אינה זמינה. ההזמנה לא נשמרה.","Order saving is unavailable. Your order has not been saved.")};
      setFormMessage(messages[code] || t("לא ניתן לאשר שההזמנה נשמרה. לחצו שוב לניסיון נוסף.","Unable to confirm that your order was saved. Please try again."));
    } finally {setSaving(false);}
  }

  return <details ref={orderDetailsRef} className="service-detail online-order" id="market-order" dir={language === 'he' ? 'rtl' : 'ltr'}>
    <summary>
      <span className="online-order-heading"><strong>{t('הזמנה אונליין','Online order')}</strong><small className="service-summary-text">{t('סקר שוק מלא — פרטי הבקשה ותשלום מאובטח','Full market research — request details and secure payment')}</small></span>
      <button type="button" className="online-order-cta" onClick={event => {event.preventDefault();event.stopPropagation();openMarketResearchOrder();}}>{t('הזמן עכשיו','Order now')}</button>
      <em><span className="more-text">{t('עוד…','More…')}</span><span className="less-text">{t('פחות…','Less…')}</span></em>
    </summary>
    <div className="service-detail-body">
    <section className="market-payment-section market-order market-checkout" id="market-payment" aria-labelledby="market-payment-title">
    <div className="market-checkout-card">
      <img src="/portfolio/market-research/market-research-final.png" alt={t('דוגמה לכריכת סקר שוק מעמיק עבור מערכת לניהול שטחי חקלאות','Sample full market research report for an agricultural management system')} width="1680" height="936" loading="lazy" />
      <div>
        <h3 id="market-payment-title">{t("סקר שוק מלא","Full market research")}</h3>
        <p>{t("מחקר מעמיק בישראל ובחו״ל, ניתוח מתחרים והמלצות מוצר.","In-depth research in Israel and internationally, competitor analysis and product recommendations.")}</p>
        <p className="market-checkout-price">{price === 5 ? <><span>{t("חיוב בדיקה","Test payment")}</span><strong>{t("5 ש״ח","₪5")}</strong><span>{t("זהו תשלום בדיקה אמיתי","This is a real test payment")}</span></> : price === 69 ? <><span className="market-checkout-original">{t("מחיר רגיל: ","Regular price: ")}<s>{t("99 ש״ח","₪99")}</s></span><strong>{t("69 ש״ח","₪69")}</strong><span>{t("לאחר הנחה של 30 ש״ח","After a ₪30 discount")}</span></> : <><span>{t("מחיר השירות","Service price")}</span><strong>{t("99 ש״ח","₪99")}</strong></>}</p>
        <div className="market-checkout-coupon">
          <label htmlFor="market-coupon">{t("קוד קופון / קוד הנחה","Coupon / discount code")}</label>
          <div><input id="market-coupon" disabled={saving || !!savedOrder} value={coupon} dir="ltr" autoComplete="off" spellCheck={false} maxLength={80} aria-describedby="market-coupon-message" onChange={event => {
            requestVersion.current++;
            setCoupon(event.target.value); setPrice(99); setCouponChecked(false); setChecking(false); setCouponMessage(''); setFormMessage('');
          }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); if (!checking) void checkCoupon(); } }} /><button type="button" disabled={checking || saving || !!savedOrder} onClick={() => void checkCoupon()}>{checking ? t("בודקים…","Checking…") : t("בדיקת קוד","Check code")}</button></div>
          <p id="market-coupon-message" role="status">{couponMessage}</p>
        </div>
      </div>
    </div>
    <p>{researchOrderTerms[language].delivery}</p>
    <p>{researchOrderTerms[language].refund}</p>
    <p className="market-order-status">{intakeEnabled?<>{t('לאחר השלמת שדות החובה','After completing the required fields')} <span style={{whiteSpace:'nowrap'}}>( <RequiredMark /> )</span> {t('ושמירת מסמך האפיון, ייפתח כאן תשלום מאובטח בסאמיט לפי המחיר שאושר.','and saving your specification, secure SUMIT payment will open here at the confirmed price.')}</>:t("ההזמנה המקוונת בהכנה. אפשר למלא ולבדוק את הטופס; הפרטים והקובץ אינם נשלחים בשלב זה.","Online ordering is currently unavailable. Your details and file will not be sent.")}</p>
    {language === 'en' ? <p className="market-checkout-language-note">The secure SUMIT payment form is currently in Hebrew. You can order your research report in Hebrew, English or both.</p> : null}
    <form ref={formRef} onSubmit={submit} onInvalidCapture={() => setFormMessage(t("כדי להמשיך, השלימו את שדות החובה וצרפו מסמך אפיון.","Complete the required fields and attach a specification to continue."))}>
      <fieldset className="market-intake-fields" disabled={saving || paid || (!!savedOrder && !editing)}>
      <div className="market-order-grid">
        <label><span>{t("שם מלא ","Full name ")}<RequiredMark /></span><input name="fullName" autoComplete="name" required minLength={2} maxLength={120} pattern=".*\S.*" /></label>
        <label>{t("עסק / ארגון","Business / organization")}<input name="business" autoComplete="organization" maxLength={160} /></label>
        <label><span>{t("אימייל ","Email ")}<RequiredMark /></span><input type="email" name="email" autoComplete="email" dir="ltr" required maxLength={254} /></label>
        <label><span>{t("טלפון ","Phone ")}<RequiredMark /></span><input type="tel" name="phone" autoComplete="tel" dir="ltr" required minLength={7} maxLength={40} onChange={event => {
          const value = event.target.value; const digits = value.replace(/\D/g, '');
          event.target.setCustomValidity(/^\+?[\d ()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15 ? '' : t("הזינו מספר טלפון תקין.","Enter a valid phone number."));
        }} /></label>
      </div>
      <label><span>{t("מה תרצו לבדוק? ","What would you like to research? ")}<RequiredMark /></span><textarea name="description" required rows={4} maxLength={10000} onChange={event => event.target.setCustomValidity(event.target.value.trim() ? '' : t("כתבו מה תרצו לבדוק.","Describe what you would like to research."))} /></label>
      <div className="market-order-grid">
        <label><span>{t("שוק יעד ","Target market ")}<RequiredMark /></span><select name="market" defaultValue="both" required><option value="israel">{t("ישראל","Israel")}</option><option value="international">{t("חו״ל","International")}</option><option value="both">{t("ישראל וחו״ל","Israel and international")}</option></select></label>
        <ResearchReportLanguage language={language} requiredIndicator />
      </div>
      <label>{t("קהל יעד, מדינות ודגשים","Audience, countries and priorities")}<textarea name="audience" rows={3} maxLength={5000} /></label>
      <label>{t("מתחרים וקישורים מוכרים","Known competitors and links")}<textarea name="links" rows={3} maxLength={5000} /></label>
      <label><span>{t("מסמך אפיון ","Specification ")}<RequiredMark /></span><input type="file" name="specification" required accept=".pdf,.docx,.txt" aria-describedby="market-spec-help" onChange={event => {
        const input = event.target; const file = input.files?.[0]; setFilename(''); setFormMessage(''); input.setCustomValidity('');
        if (!file) return;
        if (!file.size || file.size > 10 * 1024 * 1024 || !/\.(pdf|docx|txt)$/i.test(file.name)) {
          input.value = ''; input.setCustomValidity(t("בחרו מסמך PDF, DOCX או TXT שאינו ריק, עד 10MB.","Choose a non-empty PDF, DOCX or TXT file, up to 10MB.")); input.reportValidity(); return;
        }
        setFilename(file.name);
      }} /></label>
      <small id="market-spec-help">{t('מסמך PDF, DOCX או TXT, עד 10MB. ככל שהאפיון מפורט יותר, הסקר יהיה ממוקד ורלוונטי יותר.','PDF, DOCX or TXT, up to 10MB. A detailed specification helps us deliver more focused and relevant research.')} {intakeEnabled?t("המסמך יועלה למאגר פרטי לאחר הלחיצה.","Your file will be uploaded to private storage when you continue."):t("הקובץ נשאר במכשיר בשלב הבדיקות.","Your file stays on your device while ordering is unavailable.")}</small>
      {filename ? <p className="market-file-name"><bdi>{filename}</bdi></p> : null}
      <label className="market-checkout-consent"><input type="checkbox" name="terms" required /><span>{t("קראתי את זמן האספקה ותנאי ההחזר המופיעים למעלה. ","I have read the delivery time and refund terms above. ")}<RequiredMark /></span></label>
      </fieldset>
      <button className="market-checkout-submit" type="submit" disabled={checking || saving || paid || (!!savedOrder && !editing)}>{saving?t("שומרים את ההזמנה…","Saving your order…"):savedOrder && !editing?(paid?t("ההזמנה שולמה","Order paid"):t("ההזמנה נשמרה","Order saved")):t(`מעבר לתשלום · ${price} ש״ח`,`Continue to payment · ₪${price}`)}</button>
      {savedOrder && !paymentOpen && !paid && !editing?<button className="market-checkout-submit" type="button" onClick={()=>setPaymentOpen(true)}>{t(`פתיחת התשלום · ${price} ש״ח`,`Reopen payment · ₪${price}`)}</button>:null}
      {editing ? <p className="market-checkout-edit-note">{t('אפשר לעדכן את פרטי הבקשה והאפיון. לחיצה על מעבר לתשלום תשמור את השינויים באותה הזמנה. המחיר והקופון של התשלום שכבר נפתח נשארים כפי שאושרו.','Edit the request details and specification. Continuing to payment saves the changes to the same order. The price and coupon of the checkout already opened remain as approved.')}</p> : null}
      {savedOrder?<p>{t("מספר הזמנה: ","Order number: ")}<bdi>{savedOrder}</bdi></p>:null}
      <p className="market-checkout-message" role="alert">{formMessage}</p>
    </form>
    {checkoutUrl && paymentOpen?<div ref={paymentRef} className="market-checkout-payment" style={{scrollMarginTop:'100px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
        <h3>{price===5?t("חיוב בדיקה","Test payment"):t("תשלום עבור סקר שוק מלא","Full market research payment")} · <bdi>{t(`${price} ש״ח`,`₪${price}`)}</bdi></h3>
        <button type="button" aria-label={t('סגירת טופס התשלום','Close payment form')} title={t('סגירת טופס התשלום','Close payment form')} onClick={()=>{setPaymentOpen(false);if(!paid){setEditing(true);setFormMessage(t('התשלום נסגר. ניתן לערוך את הבקשה ולהמשיך שוב לתשלום.','Payment closed. You can edit your request and continue to payment again.'));}}} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,width:'44px',height:'44px',fontSize:'30px',lineHeight:1,cursor:'pointer'}}>×</button>
      </div>
      <iframe ref={paymentFrameRef} title={`${price===5?t("תשלום בדיקה","Test payment"):t("תשלום עבור סקר שוק מלא","Full market research payment")} — SUMIT · ${price} ILS`} src={checkoutUrl} style={{display:'block',width:'100%',height:'850px',border:0,borderRadius:'12px',background:'#fff'}} allow="payment" referrerPolicy="no-referrer" />
      <p><a href={checkoutUrl} target="_blank" rel="noopener noreferrer">{t("אם טופס התשלום אינו מוצג, פתחו אותו בחלון נפרד","If the payment form is not displayed, open it in a separate window")}</a></p>
    </div>:null}
  </section>
    </div>
  </details>;
}
