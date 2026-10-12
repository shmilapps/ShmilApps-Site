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
    sharing: 'עדכונים, תובנות ותוכן על תוכנה, AI ושווקים.',
    soundOn: 'הפעל קול',
    soundOff: 'כבה קול',
    rateUs: 'Rate Us',
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
    follow: 'Follow us',
    sharing: 'Updates, insights and content about software, AI and markets.',
    soundOn: 'Turn sound on',
    soundOff: 'Turn sound off',
    rateUs: 'Rate Us',
  },
};

type SocialLink = { name: string; icon: string; href: string; labelKey?: 'rateUs'; wideIcon?: boolean };

const socialLinks: SocialLink[] = [
  { name: 'LinkedIn', icon: '/brand/social/linkedin.svg', href: 'https://www.linkedin.com/company/shmilapps' },
  { name: 'Instagram', icon: 'https://api.iconify.design/skill-icons/instagram.svg', href: 'https://www.instagram.com/shmilapps/' },
  { name: 'TikTok', icon: 'https://api.iconify.design/logos/tiktok-icon.svg', href: 'https://www.tiktok.com/@shmilapps' },
  { name: 'Facebook', icon: 'https://api.iconify.design/logos/facebook.svg', href: 'https://www.facebook.com/shmilapps' },
  { name: 'YouTube', icon: 'https://api.iconify.design/logos/youtube-icon.svg', href: 'https://www.youtube.com/@ShmilApps' },
  { name: 'X (Twitter)', icon: 'https://api.iconify.design/simple-icons/x.svg?color=%23ffffff', href: 'https://x.com/shmilapps' },
  { name: 'Telegram', icon: 'https://api.iconify.design/logos/telegram.svg', href: 'https://t.me/ShmilApps' },
  { name: 'Discord', icon: 'https://api.iconify.design/logos/discord-icon.svg', href: 'https://discord.gg/Fkn9ysu3Wr' },
  { name: 'GitHub', icon: 'https://api.iconify.design/mdi/github.svg?color=%23ffffff', href: 'https://github.com/shmilapps' },
  { name: 'Google Review', labelKey: 'rateUs', icon: '/brand/social/google-review.png', href: 'https://g.page/r/CcEwvuImT8vJEBM/review', wideIcon: true },
];

export default function Home() {
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  const [socialOpen, setSocialOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
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

    video.muted = true;
    video.volume = 1;
    video.play().catch(() => undefined);
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextSoundEnabled = !soundEnabled;
    video.muted = !nextSoundEnabled;
    video.volume = nextSoundEnabled ? 1 : 0;
    video.play().then(() => setSoundEnabled(nextSoundEnabled)).catch(() => {
      video.muted = true;
      video.volume = 0;
      setSoundEnabled(false);
    });
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
            <source src="/brand/Galaxy_16x6_mobile.mp4" type="video/mp4" media="(max-width: 900px)" />
            <source src="/brand/Galaxy_16x6_desktop.mp4" type="video/mp4" />
          </video>
          <button className={`sound-toggle ${soundEnabled ? 'show-sound-off-action' : 'show-sound-on-action'}`} type="button" onClick={toggleSound} aria-label={soundEnabled ? text.soundOff : text.soundOn} aria-pressed={soundEnabled}>
            <svg className="speaker-icon" viewBox="0 0 32 32" aria-hidden="true">
              <path className="speaker-body" d="M4 13.5h6.1L18 6.7c.9-.8 2.3-.1 2.3 1.1v16.4c0 1.2-1.4 1.9-2.3 1.1l-7.9-6.8H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2Z" />
              <path className="sound-wave wave-one" d="M23.5 12.2a6.1 6.1 0 0 1 0 7.6" />
              <path className="sound-wave wave-two" d="M26.8 9.1a10.8 10.8 0 0 1 0 13.8" />
              <path className="mute-slash" d="M6.5 5.8 26 25.3" />
            </svg>
          </button>
          <aside className={`social-panel ${socialOpen ? 'open' : ''}`} aria-labelledby="social-title">
            <button className="social-toggle" type="button" onClick={() => setSocialOpen((open) => !open)} aria-expanded={socialOpen} aria-controls="social-links">
              <span id="social-title">{text.follow}</span>
            </button>
            <div id="social-links" className="social-content">
              <p>{text.sharing}</p>
              <div className="social-grid">
                {socialLinks.map((social) => (
                  <a key={social.name} className="social-link" href={social.href} target="_blank" rel="noreferrer">
                    <span className={`social-mark ${social.wideIcon ? 'review-mark' : ''}`} aria-hidden="true">
                      <img src={social.icon} alt="" />
                    </span>
                    <span>{social.labelKey ? text[social.labelKey] : social.name}</span>
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




