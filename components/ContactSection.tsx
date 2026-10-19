'use client';

import { useId, useState } from 'react';

type Props = { language: 'he' | 'en'; services: { title: string }[]; standalone?: boolean };

function ContactIcon({ type }: { type: 'phone' | 'chat' | 'mail' | 'shield' | 'send' | 'pin' }) {
  const paths = {
    phone: <path d="M5 3h4l2 5-3 2c2 4 4 6 8 8l2-3 5 2v4c0 2-2 3-4 2C10 21 3 14 2 6c0-2 1-3 3-3Z"/>,
    chat: <path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5Z"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    shield: <><path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="m22 2-11 11"/></>,
    pin: <><path d="M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/></>,
  };
  return <svg viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export default function ContactSection({ language, services, standalone = false }: Props) {
  const he = language === 'he';
  const uid = useId();
  const Heading = standalone ? 'h1' : 'h2';
  const [prepared, setPrepared] = useState(false);
  const initialTopic = standalone && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('topic') === 'other' ? 'other' : '';
  return <section id="contact" className={`contact-experience${standalone ? ' contact-standalone' : ''}`} dir={he ? 'rtl' : 'ltr'} aria-labelledby={`${uid}-title`}>
    <header className="contact-heading">
      <Heading id={`${uid}-title`}>{he ? 'בואו נהפוך את הרעיון שלכם למציאות' : 'Let’s turn your idea into reality'}</Heading>
      <p>{he ? 'ספרו לנו מה תרצו לבנות או לשפר. שיחת היכרות ללא עלות וללא התחייבות, בדרך שנוחה לכם.' : 'Tell us what you would like to build or improve. Start with a free, no-obligation introductory conversation, in the way that suits you.'}</p>
    </header>
    <div className="contact-experience-grid">
      <aside className="contact-side">
        <section className="contact-direct-card" aria-labelledby={`${uid}-direct`}>
          <div className="contact-person"><div><h3 id={`${uid}-direct`}>{he ? 'בואו נדבר ישירות' : 'Let’s talk directly'}</h3><p>{he ? 'ליאור שמילה · ShmilApps' : 'Lior Shmila · ShmilApps'}</p></div><img src="/brand/ai/shmilapps-ai-bot-icon-192.png" alt="" width="82" height="82" loading="lazy"/></div>
          <div className="contact-direct-links">
            <a className="contact-direct-link contact-whatsapp" href="https://wa.me/972547886780" target="_blank" rel="noreferrer"><span className="contact-direct-icon"><ContactIcon type="chat"/></span><span><small>{he ? 'וואטסאפ ישיר לליאור' : 'WhatsApp Lior directly'}</small><bdi>054-7886780</bdi></span></a>
            <a className="contact-direct-link" href="tel:+972547886780"><span className="contact-direct-icon"><ContactIcon type="phone"/></span><span><small>{he ? 'טלפון' : 'Phone'}</small><bdi>054-7886780</bdi></span></a>
            <a className="contact-direct-link" href="mailto:shmilapps@gmail.com"><span className="contact-direct-icon"><ContactIcon type="mail"/></span><span><small>{he ? 'אימייל' : 'Email'}</small><bdi>shmilapps@gmail.com</bdi></span></a>
          </div>
          <p className="contact-location"><ContactIcon type="pin"/>{he ? 'ישראל · פרויקטים בארץ ובעולם' : 'Israel · Projects locally and worldwide'}</p>
        </section>
        <section className="contact-promise"><ContactIcon type="shield"/><div><strong>ShmilApps Promise</strong><p>{he ? 'הקשבה לצורך שלכם, הסברים ברורים והצעת מחיר שקופה, ללא התחייבות.' : 'Your needs heard, clear explanations and transparent pricing, with no obligation.'}</p></div></section>
      </aside>
      <form className="contact-inquiry-form" aria-labelledby={`${uid}-form-title`} onSubmit={event => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        const topic = String(values.get('topic') || '');
        const topicName = topic === 'other' ? (he ? 'שירות נוסף / אחר' : 'Additional / other service') : topic;
        const fields = [
          he ? 'פנייה חדשה מאתר ShmilApps' : 'New inquiry from the ShmilApps website',
          `${he ? 'שם' : 'Name'}: ${String(values.get('fullName') || '').trim()}`,
          `${he ? 'טלפון' : 'Phone'}: ${String(values.get('phone') || '').trim()}`,
          ...(values.get('email') ? [`${he ? 'אימייל' : 'Email'}: ${String(values.get('email')).trim()}`] : []),
          `${he ? 'נושא' : 'Subject'}: ${topicName}`,
          '', String(values.get('message') || '').trim(),
        ];
        window.open('https://wa.me/972547886780?text=' + encodeURIComponent(fields.join('\n')), '_blank', 'noopener,noreferrer');
        setPrepared(true);
      }}>
        <h3 id={`${uid}-form-title`}>{he ? 'ספרו לנו מה יש לכם בראש' : 'Tell us what you have in mind'}</h3>
        <div className="contact-fields-grid">
          <label htmlFor={`${uid}-name`}>{he ? 'שם מלא *' : 'Full name *'}<input id={`${uid}-name`} name="fullName" autoComplete="name" required maxLength={120} placeholder={he ? 'איך קוראים לכם?' : 'Your name'}/></label>
          <label htmlFor={`${uid}-phone`}>{he ? 'טלפון *' : 'Phone *'}<input id={`${uid}-phone`} name="phone" type="tel" dir="ltr" autoComplete="tel" required maxLength={40} placeholder="054-0000000"/></label>
          <label htmlFor={`${uid}-email`}>{he ? 'אימייל' : 'Email'}<input id={`${uid}-email`} name="email" type="email" dir="ltr" autoComplete="email" maxLength={254} placeholder="you@example.com"/></label>
          <label htmlFor={`${uid}-topic`}>{he ? 'נושא הפנייה / סוג הפרויקט *' : 'Subject / project type *'}<select id={`${uid}-topic`} name="topic" required defaultValue={initialTopic}><option value="" disabled>{he ? 'בחרו נושא' : 'Choose a topic'}</option>{services.map(service => <option value={service.title} key={service.title}>{service.title}</option>)}<option value="other">{he ? 'שירות נוסף / אחר' : 'Additional / other service'}</option></select></label>
        </div>
        <label className="contact-message-label" htmlFor={`${uid}-message`}>{he ? 'ספרו בקצרה על הרעיון או הצורך שלכם *' : 'Briefly describe your idea or need *'}<textarea id={`${uid}-message`} name="message" required rows={4} maxLength={5000} placeholder={he ? 'מה תרצו לבנות, לשפר או לפתור?' : 'What would you like to build, improve or solve?'}/></label>
        <button className="contact-submit" type="submit"><ContactIcon type="send"/>{he ? 'שלחו פנייה בוואטסאפ' : 'Send your inquiry via WhatsApp'}</button>
        <p className="contact-form-note">{he ? 'בלחיצה ייפתח וואטסאפ עם פרטי הפנייה לאישור ולשליחה שלכם.' : 'WhatsApp will open with your inquiry ready for you to review and send.'}</p>
        {prepared ? <p className="contact-form-status" role="status">{he ? 'הפנייה הוכנה בוואטסאפ. השלימו שם את השליחה.' : 'Your inquiry is ready in WhatsApp. Complete the send there.'}</p> : null}
      </form>
    </div>
  </section>;
}
