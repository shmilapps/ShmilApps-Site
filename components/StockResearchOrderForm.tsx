'use client';

import { useState } from 'react';

export default function StockResearchOrderForm({ language }: { language: 'he' | 'en' }) {
  const he = language === 'he';
  const [assetType, setAssetType] = useState('stock');
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  return <section className="market-order" id="stock-order" dir={he ? 'rtl' : 'ltr'} aria-labelledby="stock-order-title">
    <h3 id="stock-order-title">{he ? 'הזמנת סקירת מניה או מטבע' : 'Order stock or crypto research'}</h3>
    <p className="market-order-price">{he ? '99 ש״ח · סקירה של מניה אחת או מטבע אחד' : '₪99 · Research on one stock or one crypto asset'}</p>
    <p>{he ? 'כולל מחקר פונדמנטלי וניתוח טכני אקטואלי עם גרפים. עד 48 שעות מקבלת הסקירה תוכלו להודיע שאינכם שבעי רצון ולקבל החזר כספי מלא, ללא שאלות.' : 'Includes fundamental research and current technical analysis with charts. Within 48 hours of receiving the report, you can tell us you are not satisfied and receive a full refund, no questions asked.'}</p>
    <p className="market-order-status" role="note">{he ? 'ההזמנה המקוונת בהכנה. הטופס אינו שולח או שומר מידע עדיין, ולא ניתן לבצע תשלום. אפשר לפנות אלינו באמצעות פרטי הקשר שמתחת לטופס.' : 'Online ordering is being prepared. This form does not send or save information yet, and payment is unavailable. Contact us using the details below the form.'}</p>
    <form onSubmit={event => event.preventDefault()}>
      <div className="market-order-grid">
        <label>{he ? 'שם מלא' : 'Full name'}<input name="fullName" autoComplete="name" required maxLength={120}/></label>
        <label>{he ? 'אימייל' : 'Email'}<input type="email" name="email" autoComplete="email" dir="ltr" required maxLength={254}/></label>
        <label>{he ? 'טלפון' : 'Phone'}<input type="tel" name="phone" autoComplete="tel" dir="ltr" required maxLength={40}/></label>
        <label>{he ? 'סוג הסקירה' : 'Research type'}<select name="assetType" value={assetType} onChange={event => setAssetType(event.target.value)}><option value="stock">{he ? 'מניה' : 'Stock'}</option><option value="crypto">{he ? 'מטבע קריפטו' : 'Crypto asset'}</option></select></label>
        <label>{he ? 'שם החברה או המטבע' : 'Company or crypto asset name'}<input name="assetName" required maxLength={200}/></label>
        <label>{he ? 'סימול הנכס (Ticker)' : 'Asset ticker'}<input name="ticker" dir="ltr" required maxLength={80}/></label>
        {assetType === 'stock' ? <label>{he ? 'בורסת המסחר' : 'Stock exchange'}<input name="exchange" required maxLength={160}/></label> : <label>{he ? 'רשת וכתובת חוזה (אם רלוונטי)' : 'Network and contract address (if applicable)'}<input name="contract" dir="ltr" maxLength={400}/></label>}
        <label>{he ? 'שפת הסקירה' : 'Report language'}<select name="reportLanguage" defaultValue={language}><option value="he">עברית</option><option value="en">English</option></select></label>
      </div>
      <label>{he ? 'שאלות ודגשים לסקירה (לא חובה)' : 'Questions and research priorities (optional)'}<textarea name="questions" rows={4} maxLength={10000}/></label>
      <label>{he ? 'קישורים לאתר הרשמי או למידע רלוונטי (לא חובה)' : 'Official website or relevant links (optional)'}<textarea name="links" rows={2} maxLength={5000} dir="ltr"/></label>
      <label>{he ? 'מסמך נלווה (לא חובה)' : 'Supporting document (optional)'}<input type="file" name="attachment" accept=".pdf,.docx,.txt" onChange={event => { const file = event.target.files?.[0]; setError(''); setFilename(''); if (!file) return; if (file.size > 10 * 1024 * 1024 || !['pdf', 'docx', 'txt'].includes(file.name.split('.').pop()?.toLowerCase() ?? '')) { setError(he ? 'בחרו PDF, DOCX או TXT בגודל עד 10MB.' : 'Choose a PDF, DOCX or TXT file up to 10MB.'); event.target.value = ''; return; } setFilename(file.name); }}/></label>
      <small>{he ? 'הקובץ נבחר במכשיר בלבד ואינו מועלה כרגע.' : 'The file is selected on your device only and is not uploaded yet.'}</small>
      {filename ? <p className="market-file-name"><bdi>{filename}</bdi></p> : null}
      {error ? <p role="alert">{error}</p> : null}
      <label><input type="checkbox" name="monitoringInterest"/> {he ? 'מעניין אותי גם מעקב מותאם אישית באמצעות סקיל או משימה מתוזמנת (בתמחור נפרד).' : 'I am also interested in tailored monitoring through a skill or scheduled task (priced separately).'}</label>
      <fieldset disabled><legend>{he ? 'תשלום' : 'Payment'}</legend><label><input type="radio" name="payment"/> {he ? 'אשראי / ביט דרך Grow (בחיבור בהמשך)' : 'Card / bit through Grow (connection pending)'}</label><label><input type="radio" name="payment"/> {he ? 'העברה בנקאית (פרטים יתווספו בהמשך)' : 'Bank transfer (details to be added)'}</label></fieldset>
      <button type="submit" disabled>{he ? 'שליחה ותשלום יהיו זמינים בקרוב' : 'Submission and payment coming soon'}</button>
    </form>
  </section>;
}
