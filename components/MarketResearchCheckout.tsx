'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import OnlineOrderSection,{openOnlineOrder} from './OnlineOrderSection';
import {orderCatalog,type OrderProductId} from './orderCatalog';
import { researchOrderTerms, ResearchReportLanguage } from './ResearchOrderTerms';

const RequiredMark = () => <strong aria-hidden="true" style={{color:'#ff4d4f',fontWeight:900,fontSize:'1.2em',position:'relative',top:'0.28em',lineHeight:0}}>*</strong>;

export function openMarketResearchOrder(){openOnlineOrder('market-order');}
export default function MarketResearchCheckout({language='he',productId='market-research-full',embedded=false}:{language?:'he'|'en';productId?:OrderProductId;embedded?:boolean}) {
  const t=(he:string,en:string)=>language==='he'?he:en;
  const product=orderCatalog[productId], video=productId==='advertising-video', asset=productId==='asset-research-full', marketProduct=productId==='market-research-full';
  const name=product[language];const prefix=productId;const [quantity,setQuantity]=useState(1);const [assetType,setAssetType]=useState('stock');
  const regular=product.regular*quantity;const money=(value:number)=>t(`${value} ש״ח`,`₪${value}`);
  const validAmount=(value:number)=>Number.isSafeInteger(value)&&([regular,product.discounted*quantity,...(marketProduct?[5]:[])].includes(value));
  const formRef = useRef<HTMLFormElement>(null);
  const [coupon, setCoupon] = useState('');
  const [price, setPrice] = useState<number>(product.regular);
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
    fetch('/api/research-orders',{signal:controller.signal}).then(response=>response.ok?response.json():null).then(config=>{if (!controller.signal.aborted) setIntakeEnabled((config as {intakeEnabled?:boolean}|null)?.intakeEnabled===true);}).catch(()=>{});
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
        body: JSON.stringify({ service: productId, coupon,quantity }),
      });
      const quote = await response.json() as {amount:number;accepted?:boolean;isTest?:boolean};
      if (version !== requestVersion.current) return;
      if (!response.ok || !validAmount(quote.amount)) throw new Error();
      setPrice(quote.amount);
      setCouponChecked(quote.accepted === true);
      setCouponMessage(quote.isTest ? t('קוד בדיקה אושר. זהו חיוב אמיתי של 5 ש״ח.','Test code accepted. This is a real ₪5 payment.') : quote.accepted ? t(`קוד ההנחה אושר. לתשלום: ${money(quote.amount)}`,`Discount accepted. Total: ${money(quote.amount)}`) : t(`המחיר הרגיל: ${money(regular)}${coupon.trim()?' — קוד ההנחה אינו תקין.':''}`,`Regular price: ${money(regular)}${coupon.trim()?' — Invalid discount code.':''}`));
    } catch {
      if (version !== requestVersion.current) return;
      setPrice(regular);
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
      document.getElementById(prefix+'-coupon')?.focus();
      return;
    }
    if (!intakeEnabled) {setFormMessage(t("שמירת ההזמנה עדיין בהכנה. הפרטים והמסמך לא נשלחו.","Online ordering is currently unavailable. Your details and document have not been sent."));return;}
    if (saving || paid || (savedOrder && !editing)) return;
    const form=new FormData(event.currentTarget);
    let file=form.get('specification');
    if(!marketProduct&&(!(file instanceof File)||!file.size)){
      const entries=Array.from(form.entries()).filter(([key,value])=>key!=='specification'&&key!=='terms'&&typeof value==='string');
      file=new File([`${name}\n${entries.map(([key,value])=>`${key}: ${value}`).join('\n')}\nquantity: ${quantity}`],'order-specification.txt',{type:'text/plain'});
    }
    if (!(file instanceof File) || !file.size || file.size>10*1024*1024) {setFormMessage(t("צרפו מסמך אפיון תקין, עד 10MB.","Attach a valid specification file, up to 10MB."));return;}
    setSaving(true);
    try {
      setFormMessage(t("מכינים את מסמך האפיון…","Preparing your specification…"));
      const hash=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
      const sha256=Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
      const payload={service:productId,quantity,uiLanguage:language,assetType:form.get('assetType'),assetName:form.get('assetName'),ticker:form.get('ticker'),exchange:form.get('exchange'),contract:form.get('contract'),monitoringInterest:form.get('monitoringInterest')==='on'?'yes':'',brandName:form.get('brandName'),tagline:form.get('tagline'),style:form.get('style'),colors:form.get('colors'),goal:form.get('goal'),platform:form.get('platform'),format:form.get('format'),voiceover:form.get('voiceover'),fullName:form.get('fullName'),email:form.get('email'),phone:form.get('phone'),business:form.get('business'),description:form.get('description'),market:form.get('market'),reportLanguage:form.get('reportLanguage'),audience:form.get('audience'),links:form.get('links'),terms:form.get('terms')==='on',coupon,file:{name:file.name,size:file.size,sha256}};
      const fingerprint=JSON.stringify(payload);
      if(savedOrder && fingerprint===savedFingerprint.current){setEditing(false);setPaymentOpen(true);return;}
      const post=async(action:string,ticket?:string)=>{
        const response=await fetch('/api/research-orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,action,ticket,...(editTicket.current?{editTicket:editTicket.current}:{})})});
        const data=await response.json().catch(()=>({})) as {error?:string;ticket?:string;uploadUrl?:string;contentType?:string;status?:string;orderId?:string;checkoutUrl?:string;amount:number;editTicket?:string};
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
      const destination=new URL(saved.checkoutUrl||'');
      if(destination.origin!=='https://pay.sumit.co.il' || !validAmount(saved.amount)) throw new Error('save_unavailable');
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
        edit_rate_limited:t('בוצעו עריכות רבות להזמנה בזמן קצר. הפרטים שמילאתם נשמרו בטופס; נסו שוב מאוחר יותר או פנו אלינו עם מספר ההזמנה.','This order has been edited many times in a short period. Your details remain in the form. Try again later or contact us with the order number.'),
        order_not_editable:t('ההזמנה כבר אינה פתוחה לעריכה. אם שילמתם, אין לשלם שוב; פנו אלינו לשינוי הפרטים.','This order is no longer editable. If you have paid, do not pay again; contact us to change the details.'),
        invalid_edit_session:t('לא ניתן לאמת הרשאה לעריכת ההזמנה. פנו אלינו עם מספר ההזמנה.','Unable to verify permission to edit this order. Contact us with the order number.'),
        checkout_price_locked:t('המחיר של התשלום שכבר נפתח נשמר. ניתן לערוך את פרטי הבקשה ואת האפיון.','The price of the checkout already opened stays unchanged. You can edit request details and the specification.'),invalid_fields:t("השלימו את כל שדות החובה בפרטים תקינים.","Complete all required fields with valid details."),invalid_coupon:t("קוד ההנחה אינו תקין. בדקו אותו או הסירו אותו.","Invalid discount code. Check it or remove it."),invalid_document:t("תוכן המסמך אינו תואם לקובץ PDF, DOCX או TXT תקין. בחרו מסמך אחר.","The document is not a valid PDF, DOCX or TXT file. Choose another file."),expired_session:t("זמן ההעלאה הסתיים. לחצו שוב כדי להתחיל מחדש.","Your upload session expired. Please try again."),rate_limited:t("בוצעו יותר מדי ניסיונות. נסו שוב מאוחר יותר.","Too many attempts. Please try again later."),upload_missing:t("המסמך טרם הועלה. לחצו שוב כדי לנסות להעלות אותו.","Your document has not been uploaded. Please try again."),upload_failed:t("העלאת המסמך לא הושלמה. בדקו את החיבור ונסו שוב.","The upload did not finish. Check your connection and try again."),intake_not_ready:t("שמירת ההזמנות עדיין אינה זמינה. ההזמנה לא נשמרה.","Order saving is unavailable. Your order has not been saved.")};
      setFormMessage(messages[code] || t("לא ניתן לאשר שההזמנה נשמרה. לחצו שוב לניסיון נוסף.","Unable to confirm that your order was saved. Please try again."));
    } finally {setSaving(false);}
  }

  const content = <>
    <section className="market-payment-section market-order market-checkout" id={prefix+'-payment'} aria-labelledby={prefix+'-title'}>
    <div className="market-checkout-card">
      <img src={product.image} alt={name} width={marketProduct?1680:1254} height={marketProduct?936:1254} loading="lazy" />
      <div>
        <h3 id={prefix+'-title'}>{name}</h3>
        <p>{marketProduct?t("מחקר מעמיק בישראל ובחו״ל, ניתוח מתחרים והמלצות מוצר.","In-depth research in Israel and internationally, competitor analysis and product recommendations."):asset?t("מחקר פונדמנטלי וניתוח טכני לנכס אחד.","Fundamental research and technical analysis of one asset."):video?t("סרטון פרסומת לפי אורך, בדקות שלמות.","An advertising video priced by whole minutes."):t("פיתוח לוגו בהתאם לבקשה ולזהות המותג.","Logo development based on your brief and brand identity.")}</p>
        <p className="market-checkout-price"><span>{price===5&&marketProduct?t('חיוב בדיקה אמיתי','Real test payment'):t('מחיר השירות','Service price')}</span>{price!==regular?<s>{money(regular)}</s>:null}<strong>{money(price)}</strong>{video?<span>{quantity===1?t('דקה שלמה אחת','1 whole minute'):`${quantity} ${t('דקות שלמות','whole minutes')}`} · {money(price/quantity)} {t('לדקה','per minute')}</span>:null}</p>
        {video?<label><span>{t('אורך הסרטון בדקות שלמות ','Video length in whole minutes ')}<RequiredMark /></span><input aria-label={t('אורך הסרטון בדקות שלמות','Video length in whole minutes')} type="number" min={1} max={60} step={1} required value={quantity} disabled={saving||!!savedOrder} onChange={event=>{const next=event.target.valueAsNumber;if(Number.isInteger(next)&&next>=1&&next<=60){setQuantity(next);setPrice(product.regular*next);setCouponChecked(false);setCouponMessage('');requestVersion.current++;setChecking(false);}}}/></label>:null}
        <div className="market-checkout-coupon">
          <label htmlFor={prefix+'-coupon'}>{t("קוד קופון / קוד הנחה","Coupon / discount code")}</label>
          <div><input id={prefix+'-coupon'} disabled={saving || !!savedOrder} value={coupon} dir="ltr" autoComplete="off" spellCheck={false} maxLength={80} aria-describedby={prefix+'-coupon-message'} onChange={event => {
            requestVersion.current++;
            setCoupon(event.target.value); setPrice(regular); setCouponChecked(false); setChecking(false); setCouponMessage(''); setFormMessage('');
          }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); if (!checking) void checkCoupon(); } }} /><button type="button" disabled={checking || saving || !!savedOrder} onClick={() => void checkCoupon()}>{checking ? t("בודקים…","Checking…") : t("בדיקת קוד","Check code")}</button></div>
          <p id={prefix+'-coupon-message'} role="status">{couponMessage}</p>
        </div>
      </div>
    </div>
    {product.research?<><p>{researchOrderTerms[language].delivery}</p><p>{researchOrderTerms[language].refund}</p></>:<p>{t('הכיוון היצירתי, היקף התוצרים ולוחות הזמנים יתואמו בהתאם לבקשה.','Creative direction, deliverables and timing will be coordinated based on your request.')}</p>}
    <p className="market-order-status">{intakeEnabled?<>{t('לאחר השלמת שדות החובה','After completing the required fields')} <span style={{whiteSpace:'nowrap'}}>( <RequiredMark /> )</span> {t('ושמירת מסמך האפיון, ייפתח כאן תשלום מאובטח בסאמיט לפי המחיר שאושר.','and saving your specification, secure SUMIT payment will open here at the confirmed price.')}</>:t("ההזמנה המקוונת בהכנה. אפשר למלא ולבדוק את הטופס; הפרטים והקובץ אינם נשלחים בשלב זה.","Online ordering is currently unavailable. Your details and file will not be sent.")}</p>
    {language === 'en' ? <p className="market-checkout-language-note">The secure SUMIT payment form is currently in Hebrew. Your request can be completed here in English.</p> : null}
    <form ref={formRef} onSubmit={submit} onInvalidCapture={() => setFormMessage(marketProduct?t('כדי להמשיך, השלימו את שדות החובה וצרפו מסמך אפיון.','Complete the required fields and attach a specification to continue.'):t('כדי להמשיך, השלימו את שדות החובה.','Complete the required fields to continue.'))}>
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
      <div className="market-order-grid">
      {asset?<><label><span>{t('סוג הנכס ','Asset type ')}<RequiredMark /></span><select name="assetType" value={assetType} onChange={event=>setAssetType(event.target.value)}><option value="stock">{t('מניה','Stock')}</option><option value="crypto">{t('מטבע קריפטו','Crypto asset')}</option></select></label><label><span>{t('שם החברה או המטבע ','Company or asset name ')}<RequiredMark /></span><input name="assetName" required maxLength={200}/></label><label><span>{t('סימול הנכס ','Ticker ')}<RequiredMark /></span><input name="ticker" required maxLength={80} dir="ltr"/></label>{assetType==='stock'?<label><span>{t('בורסת המסחר ','Stock exchange ')}<RequiredMark /></span><input name="exchange" required maxLength={160}/></label>:<label>{t('רשת וכתובת חוזה','Network and contract address')}<input name="contract" maxLength={400} dir="ltr"/></label>}</>:null}
      {!product.research?<><label><span>{t('שם המותג / העסק ','Brand / business name ')}<RequiredMark /></span><input name="brandName" required maxLength={200}/></label>{video?<><label><span>{t('מטרת הסרטון ','Video goal ')}<RequiredMark /></span><input name="goal" required maxLength={1000}/></label><label>{t('פלטפורמה לפרסום','Publishing platform')}<input name="platform" maxLength={200}/></label><label>{t('יחס מסך וכיוון','Aspect ratio and orientation')}<select name="format"><option value="9:16">9:16 · {t('אנכי','Portrait')}</option><option value="16:9">16:9 · {t('אופקי','Landscape')}</option><option value="1:1">1:1</option></select></label><label>{t('קריינות ושפה','Voiceover and language')}<input name="voiceover" maxLength={1000}/></label></>:<><label>{t('סלוגן','Tagline')}<input name="tagline" maxLength={200}/></label><label>{t('סגנון מועדף','Preferred style')}<input name="style" maxLength={1000}/></label><label>{t('צבעים מועדפים','Preferred colors')}<input name="colors" maxLength={200}/></label></>}</>:null}
      </div>
      <label><span>{product.research?t('מה תרצו לבדוק? ','What would you like to research? '):t('פרטי הבקשה והדגשים ','Request details and priorities ')}<RequiredMark /></span><textarea name="description" required rows={4} maxLength={10000} onChange={event => event.target.setCustomValidity(event.target.value.trim() ? '' : t("כתבו מה תרצו לבדוק.","Describe what you would like to research."))} /></label>
      <div className="market-order-grid">
        <label><span>{t("שוק יעד ","Target market ")}<RequiredMark /></span><select name="market" defaultValue="both" required><option value="israel">{t("ישראל","Israel")}</option><option value="international">{t("חו״ל","International")}</option><option value="both">{t("ישראל וחו״ל","Israel and international")}</option></select></label>
        <ResearchReportLanguage language={language} requiredIndicator label={product.research?undefined:t('שפת התוצר','Deliverable language')} />
      </div>
      <label>{t("קהל יעד, מדינות ודגשים","Audience, countries and priorities")}<textarea name="audience" rows={3} maxLength={5000} /></label>
      <label>{product.research?t('מתחרים וקישורים מוכרים','Known competitors and links'):t('קישורים ודוגמאות להשראה','Links and reference examples')}<textarea name="links" rows={3} maxLength={5000} /></label>
      <label><span>{t('מסמך אפיון ','Specification ')}{marketProduct?<RequiredMark />:null}</span><input type="file" name="specification" required={marketProduct} accept=".pdf,.docx,.txt" aria-describedby={prefix+'-spec-help'} onChange={event => {
        const input = event.target; const file = input.files?.[0]; setFilename(''); setFormMessage(''); input.setCustomValidity('');
        if (!file) return;
        if (!file.size || file.size > 10 * 1024 * 1024 || !/\.(pdf|docx|txt)$/i.test(file.name)) {
          input.value = ''; input.setCustomValidity(t("בחרו מסמך PDF, DOCX או TXT שאינו ריק, עד 10MB.","Choose a non-empty PDF, DOCX or TXT file, up to 10MB.")); input.reportValidity(); return;
        }
        setFilename(file.name);
      }} /></label>
      {!marketProduct?<p>{t('אפשר לצרף אפיון משלכם. ללא קובץ, פרטי הטופס יישמרו כמסמך אפיון ויצורפו להזמנה.','Attach your own brief, or we will save your form details as a specification and attach it to the order.')}</p>:null}<small id={prefix+'-spec-help'}>{t('מסמך PDF, DOCX או TXT, עד 10MB. אפיון מפורט מסייע להתאים את התוצר לבקשה.','PDF, DOCX or TXT, up to 10MB. A detailed brief helps us tailor the deliverable to your request.')} {intakeEnabled?t("המסמך יועלה למאגר פרטי לאחר הלחיצה.","Your file will be uploaded to private storage when you continue."):t("הקובץ נשאר במכשיר בשלב הבדיקות.","Your file stays on your device while ordering is unavailable.")}</small>
      {filename ? <p className="market-file-name"><bdi>{filename}</bdi></p> : null}
      {asset?<label><input type="checkbox" name="monitoringInterest"/>{t(' מעניין אותי גם מעקב מותאם אישית (בתמחור נפרד).',' I am also interested in tailored monitoring (priced separately).')}</label>:null}
      <label className="market-checkout-consent"><input type="checkbox" name="terms" required /><span>{product.research?t('קראתי את זמן האספקה ותנאי ההחזר המופיעים למעלה. ','I have read the delivery time and refund terms above. '):t('בדקתי את פרטי הבקשה והמחיר ואני מאשר/ת להעביר את ההזמנה לטיפול. ','I have checked the request details and price and approve submitting this order. ')}<RequiredMark /></span></label>
      </fieldset>
      <button className="market-checkout-submit" type="submit" disabled={checking || saving || paid || (!!savedOrder && !editing)}>{saving?t("שומרים את ההזמנה…","Saving your order…"):savedOrder && !editing?(paid?t("ההזמנה שולמה","Order paid"):t("ההזמנה נשמרה","Order saved")):t(`מעבר לתשלום · ${price} ש״ח`,`Continue to payment · ₪${price}`)}</button>
      {savedOrder && !paymentOpen && !paid && !editing?<button className="market-checkout-submit" type="button" onClick={()=>setPaymentOpen(true)}>{t(`פתיחת התשלום · ${price} ש״ח`,`Reopen payment · ₪${price}`)}</button>:null}
      {editing ? <p className="market-checkout-edit-note">{t('אפשר לעדכן את פרטי הבקשה והאפיון. לחיצה על מעבר לתשלום תשמור את השינויים באותה הזמנה. המחיר והקופון של התשלום שכבר נפתח נשארים כפי שאושרו.','Edit the request details and specification. Continuing to payment saves the changes to the same order. The price and coupon of the checkout already opened remain as approved.')}</p> : null}
      {savedOrder?<p>{t("מספר הזמנה: ","Order number: ")}<bdi>{savedOrder}</bdi></p>:null}
      <p className="market-checkout-message" role="alert">{formMessage}</p>
    </form>
    {checkoutUrl && paymentOpen?<div ref={paymentRef} className="market-checkout-payment" style={{scrollMarginTop:'100px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
        <h3>{price===5?t("חיוב בדיקה","Test payment"):t(`תשלום עבור ${name}`,`${name} payment`)} · <bdi>{t(`${price} ש״ח`,`₪${price}`)}</bdi></h3>
        <button type="button" aria-label={t('סגירת טופס התשלום','Close payment form')} title={t('סגירת טופס התשלום','Close payment form')} onClick={()=>{setPaymentOpen(false);if(!paid){setEditing(true);setFormMessage(t('התשלום נסגר. ניתן לערוך את הבקשה ולהמשיך שוב לתשלום.','Payment closed. You can edit your request and continue to payment again.'));}}} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,width:'44px',height:'44px',fontSize:'30px',lineHeight:1,cursor:'pointer'}}>×</button>
      </div>
      <iframe ref={paymentFrameRef} title={`${price===5?t("תשלום בדיקה","Test payment"):t(`תשלום עבור ${name}`,`${name} payment`)} — SUMIT · ${price} ILS`} src={checkoutUrl} style={{display:'block',width:'100%',height:'850px',border:0,borderRadius:'12px',background:'#fff'}} allow="payment" referrerPolicy="no-referrer" />
      <p><a href={checkoutUrl} target="_blank" rel="noopener noreferrer">{t("אם טופס התשלום אינו מוצג, פתחו אותו בחלון נפרד","If the payment form is not displayed, open it in a separate window")}</a></p>
    </div>:null}
  </section>
  </>;
  return embedded?content:<OnlineOrderSection id="market-order" language={language} subtitle={t('סקר שוק מלא — פרטי הבקשה ותשלום מאובטח','Full market research — request details and secure payment')}>{content}</OnlineOrderSection>;
}
