'use client';

import { useRef, useState, type FormEvent } from 'react';
import { researchOrderTerms, ResearchReportLanguage } from './ResearchOrderTerms';

export default function MarketResearchCheckout() {
  const formRef = useRef<HTMLFormElement>(null);
  const [coupon, setCoupon] = useState('');
  const [price, setPrice] = useState(99);
  const [couponChecked, setCouponChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [filename, setFilename] = useState('');
  const requestVersion = useRef(0);

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
      if (!response.ok || ![69, 99].includes(quote.amount)) throw new Error();
      setPrice(quote.amount);
      setCouponChecked(quote.accepted === true);
      setCouponMessage(quote.accepted ? 'קוד ההנחה אושר. המחיר לתשלום: 69 ש״ח.' : coupon.trim() ? 'קוד ההנחה אינו תקין. המחיר הרגיל הוא 99 ש״ח.' : 'המחיר הרגיל הוא 99 ש״ח.');
    } catch {
      if (version !== requestVersion.current) return;
      setPrice(99);
      setCouponChecked(false);
      setCouponMessage('לא ניתן לבדוק את הקוד כרגע. נסו שוב.');
    } finally {
      if (version === requestVersion.current) setChecking(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage('');
    if (!formRef.current?.reportValidity()) return;
    if (coupon.trim() && !couponChecked) {
      setFormMessage('בדקו את קוד ההנחה או הסירו אותו לפני המעבר לתשלום.');
      document.getElementById('market-coupon')?.focus();
      return;
    }
    // Fail closed until private order/file storage and verified SUMIT callbacks are connected.
    // A valid form alone must never expose an untracked payment link.
    setFormMessage('התשלום המקוון עדיין בהכנה. הפרטים והמסמך לא נשלחו. לתיאום ההזמנה אפשר לפנות אלינו במייל.');
  }

  return <section className="market-payment-section market-order market-checkout" id="market-payment" dir="rtl" aria-labelledby="market-payment-title">
    <div className="market-checkout-card">
      <img src="/portfolio/market-research/market-research-agri.png" alt="דוגמה לכריכת סקר שוק מעמיק עבור מערכת לניהול שטחי חקלאות" width="1680" height="936" loading="lazy" />
      <div>
        <h3 id="market-payment-title">סקר שוק מלא</h3>
        <p>מחקר מעמיק בישראל ובחו״ל, ניתוח מתחרים והמלצות מוצר.</p>
        <p className="market-checkout-price">{price === 69 ? <><span className="market-checkout-original">מחיר רגיל: <s>99 ש״ח</s></span><strong>69 ש״ח</strong><span>לאחר הנחה של 30 ש״ח</span></> : <><span>מחיר השירות</span><strong>99 ש״ח</strong></>}</p>
        <div className="market-checkout-coupon">
          <label htmlFor="market-coupon">קוד קופון / קוד הנחה</label>
          <div><input id="market-coupon" value={coupon} dir="ltr" autoComplete="off" spellCheck={false} maxLength={80} aria-describedby="market-coupon-message" onChange={event => {
            requestVersion.current++;
            setCoupon(event.target.value); setPrice(99); setCouponChecked(false); setChecking(false); setCouponMessage(''); setFormMessage('');
          }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); if (!checking) void checkCoupon(); } }} /><button type="button" disabled={checking} onClick={() => void checkCoupon()}>{checking ? 'בודקים…' : 'בדיקת קוד'}</button></div>
          <p id="market-coupon-message" role="status">{couponMessage}</p>
        </div>
      </div>
    </div>
    <p>{researchOrderTerms.he.delivery}</p>
    <p>{researchOrderTerms.he.refund}</p>
    <p className="market-order-status">ההזמנה המקוונת בהכנה. אפשר למלא ולבדוק את הטופס; הפרטים והקובץ אינם נשלחים בשלב זה.</p>
    <form ref={formRef} onSubmit={submit} onInvalidCapture={() => setFormMessage('כדי להמשיך, השלימו את שדות החובה וצרפו מסמך אפיון.')}>
      <div className="market-order-grid">
        <label>שם מלא (חובה)<input name="fullName" autoComplete="name" required minLength={2} maxLength={120} pattern=".*\S.*" /></label>
        <label>עסק / ארגון (לא חובה)<input name="business" autoComplete="organization" maxLength={160} /></label>
        <label>אימייל (חובה)<input type="email" name="email" autoComplete="email" dir="ltr" required maxLength={254} /></label>
        <label>טלפון (חובה)<input type="tel" name="phone" autoComplete="tel" dir="ltr" required minLength={7} maxLength={40} onChange={event => {
          const value = event.target.value; const digits = value.replace(/\D/g, '');
          event.target.setCustomValidity(/^\+?[\d ()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15 ? '' : 'הזינו מספר טלפון תקין.');
        }} /></label>
      </div>
      <label>מה תרצו לבדוק? (חובה)<textarea name="description" required rows={4} maxLength={10000} onChange={event => event.target.setCustomValidity(event.target.value.trim() ? '' : 'כתבו מה תרצו לבדוק.')} /></label>
      <div className="market-order-grid">
        <label>שוק יעד<select name="market" defaultValue="both" required><option value="israel">ישראל</option><option value="international">חו״ל</option><option value="both">ישראל וחו״ל</option></select></label>
        <ResearchReportLanguage language="he" />
      </div>
      <label>קהל יעד, מדינות ודגשים (לא חובה)<textarea name="audience" rows={3} maxLength={5000} /></label>
      <label>מתחרים וקישורים מוכרים (לא חובה)<textarea name="links" rows={3} maxLength={5000} /></label>
      <label>מסמך אפיון (חובה)<input type="file" name="specification" required accept=".pdf,.docx,.txt" aria-describedby="market-spec-help" onChange={event => {
        const input = event.target; const file = input.files?.[0]; setFilename(''); setFormMessage(''); input.setCustomValidity('');
        if (!file) return;
        if (!file.size || file.size > 10 * 1024 * 1024 || !/\.(pdf|docx|txt)$/i.test(file.name)) {
          input.value = ''; input.setCustomValidity('בחרו מסמך PDF, DOCX או TXT שאינו ריק, עד 10MB.'); input.reportValidity(); return;
        }
        setFilename(file.name);
      }} /></label>
      <small id="market-spec-help">מסמך PDF, DOCX או TXT, עד 10MB. ככל שהאפיון מפורט יותר, הסקר יהיה ממוקד ורלוונטי יותר. הקובץ נשאר במכשיר בשלב הבדיקות.</small>
      {filename ? <p className="market-file-name"><bdi>{filename}</bdi></p> : null}
      <label className="market-checkout-consent"><input type="checkbox" name="terms" required />קראתי את זמן האספקה ותנאי ההחזר המופיעים למעלה.</label>
      <button className="market-checkout-submit" type="submit" disabled={checking}>מעבר לתשלום · {price} ש״ח</button>
      <p className="market-checkout-message" role="alert">{formMessage}</p>
    </form>
  </section>;
}
