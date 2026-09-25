'use client';

import { useEffect, useRef, useState } from 'react';

const content = {
  he: {
    status: 'האתר בבנייה',
    title: 'משהו חדש נבנה כאן.',
    line1: 'אנחנו עובדים על האתר החדש של ShmilApps.',
    line2: 'בקרוב נעלה לאוויר.',
    welcome: 'ברוכים הבאים ל־ShmilApps',
    intro: 'אנחנו הופכים צרכים מהעולם האמיתי לפתרונות דיגיטליים מעשיים — מתוכנות ואפליקציות בהתאמה אישית ועד AI יישומי, אוטומציות, סוכנים חכמים, מערכות מבוססות נתונים ואינטגרציות.',
    approach: 'הדרך שלנו פשוטה',
    steps: ['מבינים את הצורך', 'בונים את הפתרון הנכון', 'גורמים לו לעבוד בעולם האמיתי'],
    follow: 'עקבו אחרינו',
    sharing: 'ברשתות שלנו אנחנו משתפים פתרונות שבנינו, תהליכי עבודה, תובנות מקצועיות, הדרכות ותוכן מעולמות התוכנה, ה־AI, שוק ההון והקריפטו.',
    soundOn: 'הפעל קול',
  },
  en: {
    status: 'Website under construction',
    title: 'Something new is taking shape.',
    line1: 'We’re building the new ShmilApps website.',
    line2: 'We’ll be online soon.',
    welcome: 'Welcome to ShmilApps',
    intro: 'We turn real-world needs into practical digital solutions — from custom software and applications to applied AI, automation, intelligent agents, data-driven systems and integrations.',
    approach: 'Our approach is simple',
    steps: ['Understand the need', 'Build the right solution', 'Make it work in the real world'],
    follow: 'Follow ShmilApps',
    sharing: 'Across our channels we share products we build, working processes, professional insights, training and content about software, AI, capital markets and crypto.',
    soundOn: 'Turn sound on',
  },
};

const socialLinks = [
  { name: 'LinkedIn', icon: '/brand/social/linkedin.svg', href: 'https://www.linkedin.com/company/shmilapps' },
  { name: 'Instagram', icon: 'https://api.iconify.design/skill-icons/instagram.svg', href: 'https://www.instagram.com/shmilapps/' },
  { name: 'TikTok', icon: 'https://api.iconify.design/logos/tiktok-icon.svg', href: 'https://www.tiktok.com/@shmilapps' },
  { name: 'Facebook', icon: 'https://api.iconify.design/logos/facebook.svg', href: 'https://www.facebook.com/shmilapps' },
  { name: 'YouTube', icon: 'https://api.iconify.design/logos/youtube-icon.svg', href: 'https://www.youtube.com/@ShmilApps' },
  { name: 'X (Twitter)', icon: 'https://api.iconify.design/simple-icons/x.svg?color=%23ffffff', href: 'https://x.com/shmilapps' },
  { name: 'Telegram', icon: 'https://api.iconify.design/logos/telegram.svg', href: 'https://t.me/ShmilApps' },
  { name: 'Discord', icon: 'https://api.iconify.design/logos/discord-icon.svg', href: 'https://discord.gg/Fkn9ysu3Wr' },
  { name: 'GitHub', icon: 'https://api.iconify.design/mdi/github.svg?color=%23ffffff', href: 'https://github.com/shmilapps' },
];

export default function Home() {
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  const [socialOpen, setSocialOpen] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 900px)');
    const reloadVideo = () => videoRef.current?.load();
    mobileViewport.addEventListener('change', reloadVideo);
    return () => mobileViewport.removeEventListener('change', reloadVideo);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    const playAttempt = video.play();
    if (playAttempt) {
      playAttempt.catch(() => {
        video.muted = true;
        video.play().catch(() => undefined);
        setSoundBlocked(true);
      });
    }
  }, []);

  const enableSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video.play().then(() => setSoundBlocked(false)).catch(() => setSoundBlocked(true));
  };

  const text = content[language];
  const isHebrew = language === 'he';
  return (
    <main dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="language-switcher" role="group" aria-label="Language selection">
        <button className={isHebrew ? 'active' : ''} type="button" onClick={() => setLanguage('he')} aria-pressed={isHebrew}><img src="/brand/flag-il.svg" alt="" /> <span>HE</span></button>
        <button className={!isHebrew ? 'active' : ''} type="button" onClick={() => setLanguage('en')} aria-pressed={!isHebrew}><img src="/brand/flag-us.svg" alt="" /> <span>EN</span></button>
      </div>
      <section className="construction" aria-labelledby="page-title">
        <div className="glow" aria-hidden="true" />
        <div className="hero-showcase">
          <video ref={videoRef} className="logo-video" autoPlay loop playsInline poster="/brand/shmilapps-hero-transparent.webp" aria-label="ShmilApps — Turning Ideas into Digital Reality">
            <source src="/brand/LogoClip_Mobile_1080x1560.mp4" type="video/mp4" media="(max-width: 900px)" />
            <source src="/brand/LogoClip_Desktop_1920x720.mp4" type="video/mp4" />
          </video>
          {soundBlocked && (
            <button className="sound-toggle" type="button" onClick={enableSound}>{text.soundOn}</button>
          )}
          <aside className={`social-panel ${socialOpen ? 'open' : ''}`} aria-labelledby="social-title">
            <button className="social-toggle" type="button" onClick={() => setSocialOpen((open) => !open)} aria-expanded={socialOpen} aria-controls="social-links">
              <span id="social-title">{text.follow}</span>
            </button>
            <div id="social-links" className="social-content">
              <p>{text.sharing}</p>
              <div className="social-grid">
                {socialLinks.map((social) => (
                  <a key={social.name} className="social-link" href={social.href} target="_blank" rel="noreferrer">
                    <span className="social-mark" aria-hidden="true">
                      <img src={social.icon} alt="" />
                    </span>
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
        <div className="construction-copy">

          <h1 id="page-title">{text.title}</h1>
          <p>{text.line1}<br />{text.line2}</p>
          <div className="contact-links">
            <a href="mailto:shmilapps@gmail.com">shmilapps@gmail.com</a>
            <a href="tel:+972547886780">+972547886780</a>
          </div>
        </div>

        <section className="intro-section" aria-labelledby="welcome-title">
          <h2 id="welcome-title">{text.welcome}</h2>
          <p>{text.intro}</p>
          <h3>{text.approach}</h3>
          <ol className="approach-list">
            {text.steps.map((step, index) => (
              <li key={step}><span>{index + 1}</span>{step}</li>
            ))}
          </ol>
        </section>

      </section>
      <footer>© 2026 ShmilApps · shmilapps.com</footer>
    </main>
  );
}

