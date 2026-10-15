'use client';

import { useEffect, useRef, useState } from 'react';

const content = {
  he: {
    status: 'האתר בבנייה',
    title: 'משהו חדש נבנה כאן.',
    line1: 'אנחנו עובדים על האתר החדש של ShmilApps.',
    line2: 'בקרוב נעלה לאוויר.',
    welcome: 'ברוכים הבאים ל־ShmilApps',
    intro: 'אנחנו הופכים צרכים מהעולם האמיתי לפתרונות דיגיטליים מעשיים - מתוכנות ואפליקציות בהתאמה אישית ועד AI יישומי, אוטומציות, סוכנים חכמים, מערכות מבוססות נתונים ואינטגרציות.',
    approach: 'הדרך שלנו פשוטה',
    steps: ['מבינים את הצורך', 'בונים את הפתרון הנכון', 'גורמים לו לעבוד בעולם האמיתי'],
    follow: 'עקבו אחרינו',
    sharing: 'עדכונים, תובנות ותוכן על תוכנה, AI ושווקים.',
    soundOn: 'הפעל קול',
    soundOff: 'כבה קול',
    rateUs: 'Rate Us',
    nav: {
      home: 'בית',
      services: 'שירותים',
      portfolio: 'תיק עבודות',
      follow: 'עקבו אחרינו',
      about: 'מי אנחנו',
      contact: 'צור קשר',
      assistant: 'עוזר AI',
      more: 'עוד...',
      less: 'פחות...',
      closeMenu: 'סגור תפריט',
      openMenu: 'פתח תפריט',
    },
    servicesMenu: ['פיתוח אפליקציות', 'פיתוח תוכנה ומערכות ניהול', 'פיתוח אתרי עסק ופיתוח מותגי תוכנה', 'איפיון צרכים (גם בצורת FDE אצל הלקוח)', 'אוטומציות ו־AI', 'אינטגרציה ופתרונות לעסקים', 'סקרי שוק', 'הוזלת הצעות מחיר קיימות', 'הדרכות והעשרה', 'סקירות מניות וקריפטו', 'תחקירי קריפטו מול בורסאות'],
    portfolioMenu: ['שמילונטורי', 'שמילקליק', 'מערכת ETF וירטואלית', 'קומנד סנטר לדיווחי תוצאות', 'בוט מסחר - קריפטו', 'אפליקציה לניהול מבנים', 'אפליקציה לניהול מכוורות'],
  },
  en: {
    status: 'Website under construction',
    title: 'Something new is taking shape.',
    line1: 'We’re building the new ShmilApps website.',
    line2: 'We’ll be online soon.',
    welcome: 'Welcome to ShmilApps',
    intro: 'We turn real-world needs into practical digital solutions - from custom software and applications to applied AI, automation, intelligent agents, data-driven systems and integrations.',
    approach: 'Our approach is simple',
    steps: ['Understand the need', 'Build the right solution', 'Make it work in the real world'],
    follow: 'Follow us',
    sharing: 'Updates, insights and content about software, AI and markets.',
    soundOn: 'Turn sound on',
    soundOff: 'Turn sound off',
    rateUs: 'Rate Us',
    nav: {
      home: 'Home',
      services: 'Services',
      portfolio: 'Portfolio',
      follow: 'Follow us',
      about: 'About',
      contact: 'Contact',
      assistant: 'AI Assistant',
      more: 'More...',
      less: 'Less...',
      closeMenu: 'Close menu',
      openMenu: 'Open menu',
    },
    servicesMenu: ['App development', 'Software and management systems', 'Business websites and software brand development', 'Needs discovery (including on-site FDE)', 'Automation and AI', 'Business integrations and solutions', 'Market research', 'Reducing existing quote costs', 'Training and enrichment', 'Stock and crypto research', 'Crypto exchange investigations'],
    portfolioMenu: ['Shmilventory', 'ShmilaClick', 'Virtual ETF system', 'Results command center', 'Crypto trading bot', 'Building management app', 'Apiary management app'],
  },
};

type SocialLink = { name: string; icon: string; href: string; labelKey?: 'rateUs'; wideIcon?: boolean };

const navAnchors = {
  home: '/#home',
  services: '/#services',
  portfolio: '/#portfolio',
  follow: '/#follow',
  about: '/#about',
  contact: '/#contact',
  assistant: '/ai-assistant',
};

type ServiceSummary = { title: string; summary: string; href: string };
type ServicePanel = { title: string; summary: string; body: string[]; bullets?: string[]; faqs?: { question: string; answer: string }[] };
type AiChatMessage = { role: 'user' | 'assistant'; content: string };


const portfolioCaseStudy = {
  he: {
    eyebrow: 'פרויקט לדוגמה',
    title: 'פיתוח אפליקציית ShmilVentory',
    subtitle: 'מערכת לניהול ספירות מלאי עבור חברה קמעונאית למוצרים חד־פעמיים בישראל',
    paragraphs: [
      'אפליקציית ShmilVentory פותחה עבור חברה קמעונאית למוצרים חד־פעמיים בישראל, במטרה להפוך את תהליך ספירות המלאי מתהליך ידני, איטי ומבוזר לתהליך דיגיטלי, מהיר ומבוקר.',
      'האפליקציה מאפשרת לעובדים לבצע ספירות מלאי ישירות מהטלפון האישי שלהם בגישת BYOD, ללא צורך במסופונים ייעודיים או ציוד יקר. העובד מתחבר באמצעות אימות SMS, בוחר סניף, סורק ברקוד, מצלם מוצר במידת הצורך, מזין כמות, והמידע נשמר במערכת מרכזית ומסודרת.',
      'המערכת כוללת ניהול ארגון מלא: עובדים, תפקידים והרשאות, סניפים, אזורי ניהול, מוצרים, תמונות מוצר, ספירות מלאי, דוחות וייצוא נתונים. בסיס הנתונים נבנה מאפס תוך כדי עבודה מול הצרכים האמיתיים של העסק, עם דגש על מקור אמת אחד, הרשאות ברורות, היסטוריית פעולות ותהליך עבודה פשוט למשתמשים בשטח.',
      'הפרויקט כולל גם התאמה לחיבור למערכת Priority / ERP. החיבור מתוכנן כך שניתן להתאים אותו לכל בית עסק לפי מבנה הנתונים, תהליכי העבודה והייצוא הקיים שלו, ולא כפתרון קשיח שמתאים רק למבנה אחד.',
    ],
    benefitsTitle: 'יתרונות מרכזיים',
    benefits: [
      'עבודה מהטלפון האישי של העובדים, ללא רכישת ציוד ייעודי.',
      'סריקת ברקודים מהירה ונוחה.',
      'תמונות מוצר לזיהוי קל יותר ולצמצום טעויות.',
      'ניהול עובדים, סניפים, תפקידים והרשאות.',
      'ניהול ספירות לפי סניף והרשאות.',
      'דוחות וייצוא נתונים לקבצי XLSX / CSV.',
      'תשתית לחיבור מותאם למערכת Priority / ERP.',
      'פתרון שנבנה סביב תהליך עבודה אמיתי בעסק פעיל.',
    ],
    techTitle: 'טכנולוגיות',
    tech: 'הפרויקט פותח באמצעות Flutter ו־Dart, עם Supabase לניהול אימות משתמשים, בסיס נתונים, Storage ופעולות שרת. במערכת נעשה שימוש ב־PostgreSQL, RPCs, Riverpod לניהול מצב, Drift / SQLite לאחסון מקומי וקאש, Mobile Scanner / ML Kit לסריקת ברקודים, Image Picker לתמונות מוצר, וכלי ייצוא ושיתוף לקבצי XLSX / CSV.',
    rolloutTitle: 'תהליך ההטמעה',
    rollout: 'תהליך ההטמעה היה טוב וחלק. המערכת נכנסה לעבודה בצורה הדרגתית, עם התאמות לפי הצרכים שעלו מהשטח, בלי לשבור את שגרת העבודה של העובדים. המשתמשים יכלו להתחיל לעבוד מהטלפונים האישיים שלהם, והמנהלים קיבלו שליטה טובה יותר על סניפים, עובדים, מוצרים וספירות מלאי. שביעות הרצון מהמערכת הייתה מעולה.',
    resultTitle: 'תוצאה עסקית',
    result: 'המערכת ShmilVentory חסכה זמן, הפחיתה צורך בציוד יקר, צמצמה עבודה ידנית ושיפרה את השליטה בתהליך ספירות המלאי. בעקבות הצלחת הפרויקט, המוצר נמכר גם בגרסת Lite לכמה בתי עסק קטנים, שנהנו מחיסכון משמעותי בהוצאות על ספירות מלאי ומפתרון פשוט יותר לניהול התהליך.',
  },
  en: {
    eyebrow: 'Case study',
    title: 'ShmilVentory app development',
    subtitle: 'Inventory counting system for an Israeli retail company in the disposable products market',
    paragraphs: [
      'ShmilVentory was developed for an Israeli retail company in the disposable products market, with the goal of turning a manual, slow and scattered inventory-counting process into a faster, digital and controlled workflow.',
      'The app lets employees perform inventory counts directly from their personal phones using a BYOD approach, without dedicated handheld terminals or expensive equipment. Employees sign in with SMS verification, choose a branch, scan a barcode, photograph a product when needed, enter quantity, and save the data into a centralized system.',
      'The system includes full organization management: employees, roles and permissions, branches, management areas, products, product images, inventory sessions, reports and data export. The database was built from scratch while working with the real needs of the business, with a focus on one source of truth, clear permissions, action history and a simple field workflow.',
      'The project also includes adaptation for Priority / ERP connectivity. The connection is designed to be adjusted per business according to its data structure, workflow and existing exports, instead of forcing one rigid integration model.',
    ],
    benefitsTitle: 'Key benefits',
    benefits: [
      'Employees work from their personal phones, without dedicated inventory hardware.',
      'Fast and convenient barcode scanning.',
      'Product images for easier identification and fewer mistakes.',
      'Employee, branch, role and permission management.',
      'Inventory sessions managed by branch and permissions.',
      'Reports and export to XLSX / CSV files.',
      'Infrastructure for a tailored Priority / ERP connection.',
      'A solution shaped around a real operational workflow.',
    ],
    techTitle: 'Technologies',
    tech: 'The project was built with Flutter and Dart, using Supabase for authentication, database, Storage and server operations. It also uses PostgreSQL, RPCs, Riverpod for state management, Drift / SQLite for local storage and caching, Mobile Scanner / ML Kit for barcode scanning, Image Picker for product images, and XLSX / CSV export and sharing tools.',
    rolloutTitle: 'Implementation process',
    rollout: 'The rollout was smooth and gradual, with adjustments based on needs that came up from the field. Employees could start working from their personal phones, while managers gained clearer control over branches, employees, products and inventory sessions. Satisfaction with the system was excellent.',
    resultTitle: 'Business result',
    result: 'ShmilVentory saved time, reduced the need for expensive hardware, minimized manual work and improved control over the inventory-counting process. Following the project’s success, a Lite version was also sold to several small businesses that benefited from a significant reduction in inventory-counting costs and a simpler way to manage the process.',
  },
} as const;

const serviceHrefs = [
  '/services/app-development',
  '/services/software-management',
  '/services/websites-and-branding',
  '/services/needs-discovery-fde',
  '/#services',
  '/#services',
  '/#services',
  '/#services',
  '/#services',
  '/#services',
  '/#services',
];

const servicesContent: Record<'he' | 'en', ServiceSummary[]> = {
  he: [
    { title: 'פיתוח אפליקציות', summary: 'אפליקציות מובייל ו־Web מותאמות לעסק, משלב הרעיון ועד מוצר עובד.', href: '/services/app-development' },
    { title: 'פיתוח תוכנה ומערכות ניהול', summary: 'מערכות פנימיות לניהול תהליכים, עובדים, לקוחות, מלאי, דוחות ותפעול.', href: '/services/software-management' },
    { title: 'פיתוח אתרי עסק ופיתוח מותגי תוכנה', summary: 'אתרי עסק, דפי נחיתה ונכסים דיגיטליים שמציגים את העסק או מוצר התוכנה בצורה מקצועית.', href: '/services/websites-and-branding' },
    { title: 'איפיון צרכים (גם בצורת FDE אצל הלקוח)', summary: 'הבנת הצרכים בשטח, מיפוי תהליכים ובניית כיוון ברור לפני פיתוח או אוטומציה.', href: '/services/needs-discovery-fde' },
    { title: 'אוטומציות ו־AI', summary: 'תהליכים חכמים, בוטים ועוזרי AI שמקצרים עבודה וחוסכים זמן.', href: '/#services' },
    { title: 'אינטגרציה ופתרונות לעסקים', summary: 'חיבור בין מערכות, כלים, טפסים, דאטה ותהליכים עסקיים קיימים.', href: '/#services' },
    { title: 'סקרי שוק', summary: 'בדיקת מתחרים, קהלי יעד, מחירים והזדמנויות לפני החלטה עסקית.', href: '/#services' },
    { title: 'הוזלת הצעות מחיר קיימות', summary: 'בדיקה מקצועית של הצעות מחיר קיימות, איתור פערים והצעת חלופות משתלמות.', href: '/#services' },
    { title: 'הדרכות והעשרה', summary: 'הדרכות AI, שוק ההון וקריפטו לעסקים, צוותים ויחידים.', href: '/#services' },
    { title: 'סקירות מניות וקריפטו', summary: 'מחקר וניתוח מסודר של חברה, מניה או מטבע קריפטו, כולל נתונים, סיכונים, תרחישים ונקודות שדורשות זהירות.', href: '/#services' },
    { title: 'תחקירי קריפטו מול בורסאות', summary: 'ליווי במקרים של אירועי מסחר חריגים, טעויות מערכת, מינוף, ליקווידציות ובניית תחקיר מסודר מול בורסות.', href: '/#services' },
  ],
  en: [
    { title: 'App development', summary: 'Mobile and web applications tailored to the business, from idea to working product.', href: '/services/app-development' },
    { title: 'Software and management systems', summary: 'Internal systems for managing processes, employees, customers, inventory, reports and operations.', href: '/services/software-management' },
    { title: 'Business websites and software brand development', summary: 'Business sites, landing pages and digital assets that present the business or software product professionally.', href: '/services/websites-and-branding' },
    { title: 'Needs discovery (including on-site FDE)', summary: 'Understanding needs in the field, mapping processes and building a clear direction before development or automation.', href: '/services/needs-discovery-fde' },
    { title: 'Automation and AI', summary: 'Smart workflows, bots and AI assistants that shorten work and save time.', href: '/#services' },
    { title: 'Business integrations and solutions', summary: 'Connecting systems, tools, forms, data and existing business processes.', href: '/#services' },
    { title: 'Market research', summary: 'Checking competitors, target audiences, pricing and opportunities before a business decision.', href: '/#services' },
    { title: 'Reducing existing quote costs', summary: 'Professional review of existing quotes, finding gaps and suggesting more efficient alternatives.', href: '/#services' },
    { title: 'Training and enrichment', summary: 'AI, capital markets and crypto training for businesses, teams and individuals.', href: '/#services' },
    { title: 'Stock and crypto research', summary: 'Structured research and analysis of a company, stock or crypto asset, including data, risks, scenarios and points that require caution.', href: '/#services' },
    { title: 'Crypto exchange investigations', summary: 'Support for unusual trading events, platform errors, leverage, liquidations and structured investigations with crypto exchanges.', href: '/#services' },
  ],
};


const appDevelopmentPage: Record<'he' | 'en', { title: string; subtitle: string; panels: ServicePanel[]; contact: { title: string; lines: string[]; phone: string; whatsapp: string; email: string } }> = {
  he: {
    title: 'פיתוח אפליקציות',
    subtitle: 'אפליקציות מובייל ו־Web מותאמות לעסק, משלב הרעיון ועד מוצר עובד.',
    panels: [
      { title: 'למי זה מתאים', summary: 'לעסקים, יזמים ובעלי רעיונות שרוצים להפוך צורך אמיתי למוצר דיגיטלי עובד.', body: ['השירות מתאים לעסקים, יזמים ובעלי רעיונות שרוצים להפוך צורך אמיתי למוצר דיגיטלי עובד.', 'זה יכול להיות אפליקציה ללקוחות, מערכת פנימית לעובדים, פלטפורמה להזמנות, כלי שירות, אפליקציית קהילה, אפליקציית ניהול או מוצר SaaS.', 'השירות מתאים במיוחד כשיש רעיון ברור, תהליך ידני שצריך להפוך לדיגיטלי, או צורך לבדוק אם אפשר לבנות פתרון יעיל לפני השקעה גדולה.'] },
      { title: 'תוצרים שיתקבלו', summary: 'אפיון, סקר שוק, MVP, מסכים, פיתוח, בדיקות, הדרכה, קוד מקור ותמיכה ראשונית.', body: [], bullets: ['אפיון ראשוני של האפליקציה', 'סקר שוק מקדים: בדיקת מתחרים, פתרונות קיימים, קהלי יעד, מודלים עסקיים והזדמנויות', 'הגדרת MVP - גרסה ראשונה וממוקדת של האפליקציה', 'מבנה מסכים ותהליכי שימוש', 'עיצוב בסיסי או מתקדם לפי הצורך', 'אפליקציית Web / מובייל / שניהם', 'ממשק ניהול במידת הצורך', 'חיבור למאגר נתונים', 'חיבור למשתמשים, הרשאות, טפסים, התראות או תשלומים לפי הפרויקט', 'בדיקות לפני עלייה לאוויר', 'העלאה לאוויר או הכנה לפרסום', 'הדרכה בסיסית לשימוש וניהול', 'קוד מקור וגישה לפרויקט - בסיום העבודה ניתן לקבל את קוד המקור או גישה מסודרת לפרויקט, בהתאם לסוג השירות, תנאי הפרויקט וההסכמות מראש', 'תמיכה ראשונית לאחר מסירה - לאחר העלייה לאוויר ניתנת תקופת תמיכה ראשונית לתיקונים, התאמות קטנות והסברים על שימוש במערכת'] },
      { title: 'התהליך', summary: 'מתחילים בהבנת הרעיון, ממשיכים לסקר שוק ו־MVP, ואז לאפיון, פיתוח, בדיקות ועלייה לאוויר.', body: ['העבודה מתחילה בהבנת הרעיון, המטרה העסקית והמשתמשים שאמורים להשתמש באפליקציה. בשלב הזה מחדדים מה באמת צריך לבנות, מה חשוב, מה מיותר בשלב הראשון, ומה יכול להישאר להמשך.', 'לאחר מכן אפשר לבצע סקר שוק מקדים. בסקר בודקים מתחרים, פתרונות קיימים, קהלי יעד, מודלים עסקיים, נקודות חוזקה וחולשה בשוק והזדמנויות שכדאי לקחת בחשבון לפני שנכנסים לפיתוח.', 'אחרי שלב ההבנה, האפיון וסקר השוק, מגדירים יחד את גרסת ה־MVP - הגרסה הראשונה והממוקדת של האפליקציה.', 'לאחר מכן בונים אפיון מסודר: מסכים, פעולות מרכזיות, סוגי משתמשים, הרשאות, תהליכי עבודה וחיבורים נדרשים. לאחר אישור הכיוון מתחיל הפיתוח עצמו, כולל בדיקות, תיקונים ושיפורים.', 'בסיום מבצעים בדיקות שימוש, מעלים את האפליקציה לסביבה פעילה או מכינים אותה לפרסום, ומסבירים איך לעבוד איתה בפועל.'] },
      { title: 'עבודה לדוגמה', summary: 'אפליקציה להזמנות, סטטוסים ועדכונים ללקוחות, עם מערכת ניהול פנימית לעסק.', body: ['לדוגמה: אפליקציה לעסק שרוצה לאפשר ללקוחות לבצע הזמנות, לעקוב אחרי סטטוס, לקבל עדכונים ולנהל את כל המידע במקום אחד.', 'בצד הלקוח יש ממשק פשוט וברור לביצוע פעולות, צפייה בסטטוס וקבלת עדכונים.', 'בצד העסק יש מערכת ניהול שמרכזת הזמנות, לקוחות, סטטוסים, הודעות ודוחות בסיסיים.', 'כך העסק מקבל גם חוויית לקוח טובה יותר וגם שליטה פנימית טובה יותר בתהליך.'] },
      { title: 'תמחור', summary: 'אפשר להתחיל מסקר שוק ב־99 ש״ח. אם ממשיכים לפיתוח, עלות הסקר מתקזזת ממחיר הפרויקט.', body: ['ניתן להתחיל מסקר שוק מקדים בעלות של 99 ש״ח.', 'סקר השוק כולל בדיקת מתחרים, פתרונות קיימים, קהלי יעד, מודלים עסקיים והזדמנויות. אם ממשיכים איתנו לפיתוח לאחר הסקר, עלות הסקר מתקזזת ממחיר הפרויקט.', 'מחיר פיתוח האפליקציה עצמה תלוי בהיקף העבודה, מספר המסכים, רמת העיצוב, סוג המשתמשים, כמות החיבורים למערכות אחרות, צורך בממשק ניהול, תשלומים, התראות, הרשאות ומורכבות כללית.', 'במקרים רבים אפשר להתחיל מ־MVP - גרסה ראשונה וממוקדת של האפליקציה - במקום לפתח את כל המערכת כבר מההתחלה.', 'לאחר סיום הפרויקט ניתן להמשיך למסלול ריטיינר חודשי לתמיכה, תחזוקה והמשך פיתוח. הריטיינר נקבע בתיאום מראש לפי היקף התמיכה, זמינות נדרשת, כמות שינויים צפויה ורמת האחריות הנדרשת.'] },
      { title: 'לוחות זמנים', summary: 'סקר שוק קצר יחסית; MVP בסיסי לרוב כמה שבועות; אפליקציה מורכבת יכולה לקחת כמה חודשים.', body: ['סקר שוק מקדים ניתן בדרך כלל להכין בזמן קצר יחסית, בהתאם לעומק הבדיקה הנדרש.', 'אפליקציה פשוטה או MVP בסיסי יכולים לקחת כמה שבועות.', 'אפליקציה מורכבת יותר, עם משתמשים, ניהול, דאטה, הרשאות ואינטגרציות, יכולה לקחת כמה חודשים.', 'הזמן תלוי בעיקר ברמת האפיון, כמות הפיצ׳רים, מורכבות החיבורים וקצב קבלת ההחלטות לאורך הדרך.'] },
      { title: 'שאלות נפוצות', summary: 'תשובות קצרות לגבי חנויות אפליקציות, MVP, סקר שוק, חיבורים למערכות ועיצוב.', body: [], faqs: [{ question: 'האם חייבים אפליקציה לחנויות App Store ו־Google Play?', answer: 'לא תמיד. לפעמים אפליקציית Web מתקדמת מספיקה, זולה יותר, מהירה יותר לפיתוח ונגישה מכל מכשיר.' }, { question: 'אפשר להתחיל מגרסה קטנה?', answer: 'כן. בהרבה מקרים עדיף להתחיל מ־MVP - גרסה ראשונה שמכילה רק את הדברים החשובים ביותר.' }, { question: 'מה זה MVP?', answer: 'MVP הוא מוצר ראשוני וממוקד שמכיל את הליבה של הרעיון. הוא מאפשר לבדוק שימוש אמיתי לפני שמשקיעים בפיתוח רחב ומורכב.' }, { question: 'האם סקר השוק חובה?', answer: 'לא תמיד, אבל הוא מומלץ במיוחד כשמדובר ברעיון חדש, מוצר חדש או אפליקציה שצריכה להתחרות בפתרונות קיימים.' }, { question: 'האם אפשר לחבר את האפליקציה למערכות קיימות?', answer: 'כן, במקרים רבים אפשר לחבר ל־CRM, גיליונות, מערכות תשלום, מערכות דיוור, API וכלים נוספים.' }, { question: 'האם מקבלים גם עיצוב?', answer: 'כן, לפי הצורך. אפשר לעבוד עם עיצוב בסיסי, עיצוב מתקדם או התאמה לשפה קיימת של העסק.' }] },
    ],
    contact: { title: 'צור קשר', lines: ['רוצים לבדוק אם הרעיון שלכם מתאים לאפליקציה?', 'דברו איתנו ונבין יחד מה נכון לבנות, מה אפשר להתחיל ממנו, ואיך להפוך את זה למוצר שעובד בפועל.'], phone: 'טלפון', whatsapp: 'WhatsApp', email: 'מייל' },
  },
  en: {
    title: 'App development',
    subtitle: 'Mobile and web applications tailored to the business, from idea to working product.',
    panels: [
      { title: 'Who it fits', summary: 'For businesses, entrepreneurs and idea owners who want to turn a real need into a working digital product.', body: ['This service fits businesses, entrepreneurs and idea owners who want to turn a real need into a working digital product.', 'It can be a customer app, an internal employee system, an ordering platform, a service tool, a community app, a management app or a SaaS product.', 'It is especially useful when there is a clear idea, a manual process that should become digital, or a need to test whether a solution is worth building before making a larger investment.'] },
      { title: 'Deliverables', summary: 'Discovery, market research, MVP definition, screens, development, testing, training, source access and initial support.', body: [], bullets: ['Initial app discovery and definition', 'Preliminary market research: competitors, existing solutions, target audiences, business models and opportunities', 'MVP definition - a focused first version of the app', 'Screen structure and user flows', 'Basic or advanced design as needed', 'Web app, mobile app or both', 'Admin interface when needed', 'Database connection', 'Users, permissions, forms, notifications or payments according to the project', 'Pre-launch testing', 'Launch or publishing preparation', 'Basic training for usage and management', 'Source code and project access - at the end of the work, source code or organized project access can be provided according to the service type, project terms and prior agreements', 'Initial post-delivery support for fixes, small adjustments and usage guidance'] },
      { title: 'The process', summary: 'We start with the idea, continue to market research and MVP, then move to specification, development, testing and launch.', body: ['The work starts by understanding the idea, business goal and the users who will use the app. At this stage we clarify what should really be built, what matters first and what can wait.', 'Then we can perform preliminary market research: competitors, existing solutions, target audiences, business models, strengths, weaknesses and opportunities.', 'After discovery, specification and market research, we define the MVP - the first focused version of the app.', 'Next we create a clear specification: screens, main actions, user types, permissions, workflows and required integrations. After approval, development begins with testing, fixes and improvements.', 'At the end we test usage, launch the app or prepare it for publishing, and explain how to work with it.'] },
      { title: 'Example project', summary: 'An ordering and status app for customers, with an internal management system for the business.', body: ['For example: an app for a business that wants customers to place orders, track status, receive updates and keep all information in one place.', 'The customer side has a simple interface for actions, status and updates.', 'The business side has a management system for orders, customers, statuses, messages and basic reports.', 'The business gets a better customer experience and better internal control of the process.'] },
      { title: 'Pricing', summary: 'You can start with market research for ₪99. If development continues with us, the research cost is deducted from the project price.', body: ['You can start with preliminary market research for ₪99.', 'The research includes competitors, existing solutions, target audiences, business models and opportunities. If you continue with us to development, the research cost is deducted from the project price.', 'The app development price depends on scope, number of screens, design level, user types, integrations, admin interface, payments, notifications, permissions and overall complexity.', 'In many cases it is possible to start with an MVP - a focused first version of the app - instead of building the entire system at once.', 'After the project is completed, monthly retainer support, maintenance and continued development can be arranged. The retainer is agreed in advance according to support scope, required availability, expected changes and responsibility level.'] },
      { title: 'Timelines', summary: 'Market research is usually short; a basic MVP may take a few weeks; a complex app can take several months.', body: ['Preliminary market research can usually be prepared fairly quickly, depending on the required depth.', 'A simple app or basic MVP may take a few weeks.', 'A more complex app with users, management, data, permissions and integrations can take several months.', 'The timeline mainly depends on specification depth, feature count, integration complexity and decision pace throughout the project.'] },
      { title: 'FAQ', summary: 'Short answers about app stores, MVP, market research, system integrations and design.', body: [], faqs: [{ question: 'Do we have to publish to the App Store and Google Play?', answer: 'Not always. Sometimes an advanced web app is enough, cheaper, faster to develop and accessible from every device.' }, { question: 'Can we start small?', answer: 'Yes. In many cases it is better to start with an MVP - a first version that includes only the most important parts.' }, { question: 'What is an MVP?', answer: 'An MVP is a focused first product that includes the core of the idea. It lets you test real usage before investing in broader development.' }, { question: 'Is market research mandatory?', answer: 'Not always, but it is recommended for a new idea, a new product or an app that will compete with existing solutions.' }, { question: 'Can the app connect to existing systems?', answer: 'Yes, in many cases it can connect to CRM systems, spreadsheets, payment systems, mailing tools, APIs and more.' }, { question: 'Is design included?', answer: 'Yes, as needed. We can work with basic design, advanced design or adapt to an existing business language.' }] },
    ],
    contact: { title: 'Contact', lines: ['Want to check whether your idea fits an app?', 'Let’s talk and understand what should be built, what to start with and how to turn it into a working product.'], phone: 'Phone', whatsapp: 'WhatsApp', email: 'Email' },
  },
};


const shmilaClickCaseStudy = {
  he: {
    quote: '״אין מפעל מוליכים למחצה שלא ירצה מערכת כזו…״',
    title: 'המערכת ShmilaClick',
    subtitle: 'תמונת מצב חזותית לרצפת הייצור',
    intro: 'מערכת שמרכזת מידע ממערכות שונות על גבי מפה חזותית של הציוד, ומאפשרת להבין במהירות מה עובד, היכן נדרשת תשומת לב ומה צריך לבדוק עכשיו.',
    challengeTitle: 'האתגר בשטח',
    challenge: 'מאות תאי עיבוד, תהליכים רבים ומידע המפוזר בין מערכות ודוחות. מנהל או מהנדס במשמרת צריך להבין במהירות את מצב הציוד, סדרי העדיפויות והפעילויות המתוכננות.',
    howTitle: 'איך המערכת עובדת',
    how: 'מפה חזותית של האזור מציגה את הציוד במיקומו ואת הסטטוסים שלו. לחיצה על מכונה פותחת מידע רלוונטי: היסטוריה ותקלות, פקודות עבודה, נתוני תהליך ובקרה, משכי השבתה, הערות משמרת ותוכניות עבודה. המידע מתעדכן באופן שוטף, וניתן לצרף מקורות נוספים לאותה מסגרת.',
    principle: 'העיקרון המנחה: ריכוז המידע הרלוונטי ממקורות שונים בממשק חזותי אחד, שניתן להרחיב עם הצרכים.',
    benefitsTitle: 'יתרונות מרכזיים',
    benefits: [
      'תמונת שליטה חזותית אחת - ממשק משותף שמרכז את המידע הרלוונטי ממערכות שונות, ומאפשר לכולם לעבוד מתוך תמונת מצב אחידה.',
      'נתונים בזמן אמת - הצגת מצב הציוד, הפעילויות והחריגות באופן שמתעדכן ברציפות.',
      'מיקוד לפי תפקיד - כל משתמש יכול להתמקד במידע, במשימות ובסדרי העדיפויות הרלוונטיים לעבודתו.',
      'הנעה לפעולה ומשחוק - המחשה חזותית של התקדמות, משימות ויעדים, שמעודדת מעורבות ועשייה.',
      'קבלת החלטות מהירה ומבוססת נתונים - הבנת המצב במבט וגישה לפרטים הנדרשים בלחיצה.',
      'תמיכה בריבוי משתמשים - מערכת שצמחה לשימוש יום־יומי של כ־1,000 משתמשים.',
      'מבנה מודולרי - אפשרות להוסיף מקורות מידע וחיבורים למערכות נוספות.',
      'נולדה מהשטח - פותחה מתוך היכרות ישירה עם הציוד, האנשים והאתגרים של סביבת ייצור פעילה.',
    ],
    techTitle: 'טכנולוגיות',
    tech: [
      'המערכת פותחה בשילוב של טכנולוגיות ושפות, ובהן Python, React, Java, VB ו־VBA, לצד עבודה עם SQL ובסיסי נתונים של Oracle.',
      'הפיתוח כלל חיבורים לעשרות מערכות שונות, תוך התמודדות עם הממשקים, מבני הנתונים ומגבלות הגישה של כל אחת מהן, וריכוז המידע בחוויית שימוש חזותית ואחידה.',
      'המערכת נבנתה עוד לפני עידן כלי ה־AI לכתיבת קוד, באמצעות פיתוח, אינטגרציה ועבודה הנדסית ישירה.',
    ],
    rolloutTitle: 'תהליך ההטמעה',
    rollout: [
      'המערכת צמחה מתוך הבנת העבודה בשטח, מרעיון ראשוני ועד ליישום מלא. ליאור הוביל אותה משני צדי התהליך: כמנהל מערך אחזקה בחדר נקי וכמוביל פיתוח המוצר.',
      'לאורך כחמש שנים התפתחה המערכת באמצעות שימוש בפועל, משוב מהמשתמשים והרחבת היכולות בהתאם לצרכים שעלו מהשטח.',
      'המערכת הוטמעה בשני מפעלי ייצור של חברת סמיקונדקטור גדולה, והגיעה לכ־1,000 משתמשים שבחרו בה ככלי עבודה יום־יומי.',
    ],
    history: 'ציון דרך היסטורי: במסמך IMEC משנת 2022 תועדו למעלה מ־800 משתמשים בישראל, פיילוט עם כ־100 משתמשים באריזונה ויותר משני מיליון פעולות מצטברות. נתונים אלה משקפים את מועד התיעוד.',
    resultTitle: 'תוצאה עסקית',
    result: 'המערכת שיפרה באופן מהותי את ניהול תחזוקת הציוד בסביבת ייצור שפועלת 24/7:',
    results: [
      'ייעול העבודה וצמצום זמני השבתה של מכונות.',
      'קיצור זמני תגובה ושיפור מהירות קבלת ההחלטות.',
      'שיפור תעדוף המשימות ותיאום הפעילויות.',
      'שיפור התיעוד, העברת המידע והשליטה באזור העבודה.',
      'יצירת תמונת מצב משותפת למנהלים ולצוותים בשטח.',
    ],
    videoTitle: 'סרטון הדמיה של המערכת',
    videoLabel: 'סרטון הדמיה של ShmilaClick',
    videoNote: 'סרטון המחשה של חוויית העבודה והרעיון, ולא תיעוד מצולם של סביבת הייצור המקורית.',
    context: 'המערכת פותחה על ידי ליאור במסגרת תפקיד קודם ומוצגת כדוגמה לניסיונו המקצועי. היא אינה מוצר מסחרי של ShmilApps. הניסיון הזה משמש בסיס לפיתוח פתרונות מותאמים לעסקים ולארגונים נוספים.',
  },
  en: {
    quote: '“There isn’t a semiconductor fab that wouldn’t want a system like this…”',
    title: 'ShmilaClick',
    subtitle: 'A visual operational picture of the manufacturing floor',
    intro: 'A system that brings information from multiple sources onto a visual equipment map, helping users quickly understand what is running, what needs attention and what to check next.',
    challengeTitle: 'The operational challenge',
    challenge: 'Hundreds of process chambers, many workflows and information scattered across systems and reports. Shift managers and engineers need to understand equipment status, priorities and planned activities quickly.',
    howTitle: 'How the system works',
    how: 'A visual area map shows equipment in its physical location and current status. Clicking a tool opens relevant information: history and errors, work orders, process and control data, downtime, shift notes and work plans. Information is updated continuously, and further sources can be added to the same framework.',
    principle: 'The guiding principle: bring relevant information from different sources into one visual interface that can expand as needs evolve.',
    benefitsTitle: 'Key benefits',
    benefits: [
      'One shared visual operational view - relevant information from multiple systems in a unified interface.',
      'Real-time data - continuously updated equipment status, activities and exceptions.',
      'Role-focused information - each user can focus on the data, tasks and priorities relevant to their work.',
      'Engagement and gamification - visual progress, tasks and goals encourage participation and action.',
      'Fast, data-based decisions - understand the situation at a glance and access supporting details with a click.',
      'Multi-user scale - the system grew to approximately 1,000 daily users.',
      'Modular architecture - additional data sources and system connections can be added.',
      'Born on the manufacturing floor - developed from firsthand knowledge of the equipment, people and challenges of live operations.',
    ],
    techTitle: 'Technologies',
    tech: [
      'Development combined Python, React, Java, VB and VBA, alongside SQL and Oracle databases.',
      'The work involved connections to dozens of different systems, addressing their individual interfaces, data structures and access constraints while bringing the information into one visual experience.',
      'The system was built before the era of AI coding tools, through direct software development, integration and engineering.',
    ],
    rolloutTitle: 'Development and rollout',
    rollout: [
      'The system grew from operational needs, from the initial idea to full implementation. Lior led both sides of the process: cleanroom maintenance management and product development.',
      'Over approximately five years, the system evolved through real use, user feedback and new capabilities responding to needs on the manufacturing floor.',
      'It was deployed at two manufacturing plants of a major semiconductor company and reached approximately 1,000 users who chose it as a daily working tool.',
    ],
    history: 'Historical milestone: the 2022 IMEC document recorded more than 800 users in Israel, a pilot with approximately 100 users in Arizona and over two million cumulative transactions. These figures reflect the time of that document.',
    resultTitle: 'Business impact',
    result: 'The system substantially improved equipment-maintenance management in a 24/7 manufacturing environment:',
    results: [
      'More efficient work and reduced equipment downtime.',
      'Faster responses and decision-making.',
      'Better task prioritization and activity coordination.',
      'Improved documentation, information sharing and operational visibility.',
      'A shared operational picture for managers and teams on the floor.',
    ],
    videoTitle: 'System demonstration video',
    videoLabel: 'ShmilaClick demonstration video',
    videoNote: 'An illustrative video of the workflow and concept, rather than footage of the original manufacturing environment.',
    context: 'Lior developed the system in a previous professional role. It is presented as an example of his experience, not as a commercial ShmilApps product. This experience informs tailored solutions for other businesses and organizations.',
  },
};

const softwareManagementPage: typeof appDevelopmentPage = {
  he: {
    title: 'פיתוח תוכנה ומערכות ניהול',
    subtitle: 'מערכות פנימיות לניהול תהליכים, עובדים, לקוחות, מלאי, דוחות ותפעול.',
    panels: [
      { title: 'למי זה מתאים', summary: 'לעסקים וארגונים שרוצים לחבר מידע, לייעל תהליכים ולקבל שליטה טובה יותר בעבודה השוטפת.', body: ['כשמידע מפוזר בין קבצים, מערכות ואנשים, אפשר לבנות מערכת שמחברת את התהליך ומציגה תמונה ברורה.', 'הפתרון מותאם למשתמשים, להרשאות ולדרך העבודה של העסק - ממערכת פנימית ממוקדת ועד מערכת ניהול רחבה.'] },
      { title: 'תוצרים שיתקבלו', summary: 'אפיון, ממשק ניהול, תהליכי עבודה, הרשאות, חיבורים ודוחות - לפי צורכי הפרויקט.', body: ['מגדירים יחד מה המערכת צריכה לפתור ואילו תוצרים נדרשים. ההיקף, הגישה לקוד והתמיכה נקבעים מראש בהסכם.'], bullets: ['מיפוי צרכים ותכנון תהליכי עבודה', 'ממשק משתמש וניהול מותאם', 'בסיס נתונים, משתמשים והרשאות לפי הצורך', 'חיבורים למערכות קיימות ודוחות ניהוליים', 'בדיקות, הדרכה והטמעה'] },
      { title: 'התהליך', summary: 'מתחילים בהבנת העבודה בשטח, מתכננים פתרון ממוקד, מפתחים ובודקים, ואז מטמיעים בהדרגה.', body: ['ממפים את המשתמשים, המידע, הקשיים והמערכות הקיימות. לאחר מכן מגדירים את הגרסה הראשונה ואת החיבורים הנדרשים.', 'הפיתוח מתקדם בשלבים, עם בדיקות ומשוב. המסירה כוללת הדרכה והתאמה לשימוש בפועל לפי היקף העבודה שסוכם.'] },
      { title: 'עבודה לדוגמה', summary: 'המערכת ShmilaClick - ניסיון בפיתוח מערכת חזותית לניהול תחזוקת ציוד בסביבת ייצור סמיקונדקטור.', body: ['המערכת ShmilaClick פותחה על ידי ליאור במסגרת תפקיד קודם, כדי לסייע בניהול חזותי של תחזוקת ציוד בחדרים נקיים בתעשיית המוליכים למחצה.', 'זו דוגמה לניסיון מקצועי קודם של המייסד, ולא מוצר מסחרי של ShmilApps. ההירו הוא המחשה עיצובית, ולא צילום של המערכת או של סביבת הייצור המקורית.'] },
      { title: 'תמחור', summary: 'המחיר נקבע לפי היקף המערכת, התהליכים, סוגי המשתמשים והחיבורים הנדרשים.', body: ['לאחר הבנת הצורך ניתן להגדיר היקף עבודה והצעה מתאימה. אפשר להתחיל בגרסה ממוקדת ולהרחיב בהמשך.', 'תחזוקה ותמיכה מתמשכת יכולות להינתן בנפרד, בתשלום ובתיאום מראש.'] },
      { title: 'לוחות זמנים', summary: 'נקבעים לאחר אפיון, בהתאם למורכבות, לאינטגרציות ולשלבי ההטמעה.', body: ['משך העבודה תלוי בהיקף התהליכים, באיכות המידע הקיים, בחיבורים הנדרשים ובקצב קבלת ההחלטות. מגדירים יחד אבני דרך ברורות.'] },
      { title: 'שאלות נפוצות', summary: 'אפשר להתחיל קטן, לחבר מערכות קיימות ולהתאים את הממשק והרשאות המשתמשים.', body: [], faqs: [{ question: 'אפשר לחבר את המערכת לכלים שכבר קיימים בעסק?', answer: 'במקרים רבים כן. בודקים את הממשקים, ההרשאות והמידע הזמין לפני שמתחייבים לחיבור.' }, { question: 'האם צריך להחליף את כל המערכות בבת אחת?', answer: 'לא בהכרח. אפשר לבנות פתרון ממוקד או שכבת ניהול, ולהתקדם בשלבים לפי הצורך.' }] },
    ],
    contact: { ...appDevelopmentPage.he.contact, lines: ['רוצים לחבר תהליכים ומידע למערכת אחת?', 'דברו איתנו ונבין יחד מה נכון לבנות ואיך להתחיל.'] },
  },
  en: {
    title: 'Software and management systems',
    subtitle: 'Internal systems for managing processes, employees, customers, inventory, reports and operations.',
    panels: [
      { title: 'Who it fits', summary: 'For businesses and organizations that want connected information, smoother processes and better operational control.', body: ['When information is scattered across files, tools and people, a tailored system can connect the workflow and provide a clear view.', 'The solution is designed around business users, permissions and daily operations, from a focused internal tool to a broader management system.'] },
      { title: 'Deliverables', summary: 'Specification, management interface, workflows, permissions, integrations and reports, according to project needs.', body: ['We define the problem and deliverables together. Scope, source access and support are agreed in advance.'], bullets: ['Needs discovery and workflow planning', 'Tailored user and management interface', 'Database, users and permissions as needed', 'Existing system integrations and management reports', 'Testing, training and rollout'] },
      { title: 'The process', summary: 'Understand operations, plan a focused solution, develop and test, then roll out in stages.', body: ['We map users, information, pain points and existing systems, then define the first version and required integrations.', 'Development proceeds in stages with testing and feedback. Delivery includes training and practical rollout according to the agreed scope.'] },
      { title: 'Example project', summary: 'ShmilaClick - experience developing visual equipment-maintenance management for semiconductor manufacturing.', body: ['Lior developed ShmilaClick in a previous professional role to support visual equipment-maintenance management in semiconductor cleanrooms.', 'This is the founder’s prior professional experience, not a commercial ShmilApps product. The hero is an illustration, not a screenshot of the original system or manufacturing environment.'] },
      { title: 'Pricing', summary: 'Based on system scope, workflows, user roles and required integrations.', body: ['After understanding the need, we define an appropriate scope and proposal. A focused first version can be expanded later.', 'Ongoing maintenance and support can be arranged separately, for an agreed fee.'] },
      { title: 'Timelines', summary: 'Defined after discovery, based on complexity, integrations and rollout stages.', body: ['Timing depends on workflow scope, existing data quality, integrations and decision pace. We agree on clear milestones together.'] },
      { title: 'FAQ', summary: 'Start small, connect existing tools and tailor the interface and user permissions.', body: [], faqs: [{ question: 'Can the system connect to our existing tools?', answer: 'Often yes. We review interfaces, access permissions and available data before committing to an integration.' }, { question: 'Do all our systems need to be replaced at once?', answer: 'Not necessarily. A focused solution or management layer can be built first, with further stages as needed.' }] },
    ],
    contact: { ...appDevelopmentPage.en.contact, lines: ['Want to bring workflows and information into one system?', 'Let’s understand what to build and where to start.'] },
  },
};

const websitesBrandingPage: typeof appDevelopmentPage = {
  he: {
    title: 'פיתוח אתרי עסק ופיתוח מותגי תוכנה',
    subtitle: 'אתרי עסק, דפי נחיתה ונכסים דיגיטליים שמציגים את העסק או מוצר התוכנה בצורה מקצועית.',
    panels: [
      { title: 'למי זה מתאים', summary: 'לעסקים שרוצים אתר שמייצג אותם וליזמים שרוצים להפוך מוצר תוכנה למותג שלם ומזוהה.', body: ['מהרעיון ועד למותג שאפשר לראות, לחוות ולזכור.', 'אתרי עסק ומותגי תוכנה שנבנים סביב הזהות, הקהל והמטרות שלכם - עם תשומת לב לכל פרט ולכל פיקסל.', 'אפשר לבנות אתר לעסק קיים, להשיק מוצר תוכנה חדש, לעצב מחדש נוכחות דיגיטלית או ליצור את המעטפת כולה מאפס.'] },
      { title: 'תוצרים שיתקבלו', summary: 'מעטפת מלאה לפי הצורך: זהות מותג, תוכן, אתר, עיצוב, מדיה, חוויות אינטראקטיביות וחיבורים.', body: ['השירות יכול לכלול את כל המרכיבים שהעסק או המוצר צריכים. בוחרים יחד מה מתאים לרצון, לקהל, לתקציב ולהיקף העבודה.'], bullets: ['בחירת שם, מסרים ובידול', 'לוגו ושפה חזותית', 'תכנון מבנה האתר וחוויית המשתמש', 'כתיבת תוכן ושפות נוספות לפי הצורך', 'עיצוב ופיתוח אתר עסק, אתר מוצר או דף נחיתה', 'תמונות, הירואים, סרטונים ואנימציות', 'התאמה למחשב, לטאבלט ולמובייל', 'חוויות אינטראקטיביות ועוזרי AI', 'חיבור לכלים ומערכות עסקיות לפי הצורך', 'חומרי השקה ונכסים דיגיטליים למותג', 'הגדרות בסיס לחיפוש ולנגישות בהתאם להיקף שסוכם', 'בדיקות, העלאה לאוויר והדרכה'] },
      { title: 'התהליך', summary: 'מכירים את העסק והקהל, מגדירים את המותג והמסרים, מעצבים, מפתחים ובודקים עד להשקה.', body: ['מתחילים בשיחת היכרות: מה העסק או המוצר עושים, למי הם פונים ומה האתר צריך להשיג.', 'מגבשים את המסרים, הזהות, השפה החזותית ומבנה העמודים. אפשר לכלול גם שם, לוגו ותכנון חומרי ההשקה.', 'יוצרים תוכן, עיצוב ומדיה, ומפתחים את האתר והחוויות שנבחרו. בוחנים טכנולוגיות ואפקטים בהתאם לערך שהם מוסיפים ולנוחות השימוש.', 'בודקים גדלי מסך, שפות, כיווניות, קישורים, טעינה וזרימת שימוש. לאחר אישור עולים לאוויר, מדריכים וממשיכים לשפר בהתאם לצורך.'] },
      { title: 'עבודה לדוגמה', summary: 'אתר ShmilApps - החיבור בין מותג, תוכן, עיצוב, מדיה וטכנולוגיה, עם תשומת לב לכל פרט ולכל פיקסל.', body: [] },
      { title: 'תמחור', summary: 'המחיר מותאם למעטפת הנדרשת: מאתר ממוקד ועד לפיתוח מותג ונוכחות דיגיטלית מקצה לקצה.', body: ['המחיר תלוי בהיקף המיתוג, מספר העמודים, עומק התוכן, כמות השפות, המדיה, האינטראקטיביות והחיבורים.', 'מגדירים מראש תוצרים, שלבים והיקף עבודה. אפשר להתחיל בליבה ולהרחיב בהמשך, בהתאם לצורך ולהיקף שסוכם.', 'אחסון, דומיין, שירותי צד שלישי ותחזוקה מתומחרים או מוסדרים לפי ההצעה. ניתן לתאם בנפרד תמיכה ועדכונים שוטפים.'] },
      { title: 'לוחות זמנים', summary: 'נקבעים לפי היקף האתר, עבודת המיתוג, יצירת המדיה והחיבורים הנדרשים.', body: ['דף נחיתה ממוקד, אתר עסק ואתר מוצר עשיר דורשים היקפי עבודה שונים. קובעים לוח זמנים ואבני דרך אחרי הבנת הצורך.', 'איסוף חומרים, יצירת תוכן, תרגום ומשוב על העיצוב משפיעים על ההתקדמות. ניתן להשיק בשלבים ולהוסיף יכולות בהמשך.'] },
      { title: 'שאלות נפוצות', summary: 'אפשר להתחיל בלי לוגו או תוכן, לשדרג אתר קיים ולשלב מדיה ו־AI כחלק מהפתרון.', body: [], faqs: [{ question: 'אין לי עדיין שם, לוגו או טקסטים. אפשר להתחיל?', answer: 'כן. אפשר לבנות יחד את המעטפת מתחילתה, או לעבוד עם חומרים וזהות קיימים.' }, { question: 'אפשר לשלב סרטונים, אנימציות ועוזר AI?', answer: 'כן, בהתאם לצורך ולהיקף שסוכם, תוך התחשבות במהירות, בקריאות ובנוחות השימוש.' }, { question: 'האתר יהיה מותאם למובייל ולשפות נוספות?', answer: 'ההתאמה למכשירים היא חלק מהתכנון. שפות נוספות ותרגום מוגדרים לפי הפרויקט.' }, { question: 'אפשר להמשיך לפתח את האתר אחרי ההשקה?', answer: 'כן. אפשר להוסיף עמודים, מדיה, יכולות וחיבורים, ולתאם תחזוקה ותמיכה בהמשך.' }] },
    ],
    contact: { ...appDevelopmentPage.he.contact, lines: ['רוצים אתר שמייצג אתכם או מותג שלם למוצר התוכנה שלכם?', 'ספרו לנו מה אתם מדמיינים, ונבנה יחד את הדרך לנוכחות דיגיטלית ברורה, מקצועית ומזוהה.'] },
  },
  en: {
    title: 'Business websites and software brand development',
    subtitle: 'Business sites, landing pages and digital assets that present the business or software product professionally.',
    panels: [
      { title: 'Who it fits', summary: 'For businesses that need a website reflecting their identity and founders turning software products into recognizable brands.', body: ['From an idea to a brand people can see, experience and remember.', 'Business websites and software brands built around your identity, audience and goals, with attention to every detail and every pixel.', 'Create a website for an existing business, launch a software product, refresh a digital presence or build the complete package from scratch.'] },
      { title: 'Deliverables', summary: 'A complete package as needed: brand identity, content, website, design, media, interactive experiences and integrations.', body: ['The service can cover everything your business or product needs. We define the right combination around your goals, audience, budget and agreed scope.'], bullets: ['Naming, messaging and positioning', 'Logo and visual identity', 'Website structure and user experience', 'Content and additional languages as needed', 'Business website, product site or landing page design and development', 'Images, hero artwork, videos and animation', 'Desktop, tablet and mobile layouts', 'Interactive experiences and AI assistants', 'Business tool and system integrations as needed', 'Launch materials and digital brand assets', 'Basic search and accessibility setup within the agreed scope', 'Testing, launch and training'] },
      { title: 'The process', summary: 'Understand the business and audience, define identity and messaging, design, develop and test through launch.', body: ['Start with the business or product, its audience and the website’s goals.', 'Define messaging, identity, visual language and page structure, including naming, logo and launch materials when needed.', 'Create content, design and media, then develop the website and chosen experiences. Technology and effects are selected for the value and usability they add.', 'Check screen sizes, languages, text direction, links, loading and user journeys. After approval, launch, hand over and improve as needed.'] },
      { title: 'Example project', summary: 'The ShmilApps website - brand, content, design, media and technology, with attention to every detail and every pixel.', body: [] },
      { title: 'Pricing', summary: 'Tailored to the package, from a focused website to complete brand and digital presence development.', body: ['Pricing depends on branding scope, page count, content, languages, media, interactivity and integrations.', 'Deliverables, stages and scope are agreed in advance. Start with the core and expand later, according to your needs and the agreed scope.', 'Hosting, domains, third-party services and maintenance are arranged according to the proposal. Ongoing support and updates can be agreed separately.'] },
      { title: 'Timelines', summary: 'Based on website scope, branding work, media creation and required integrations.', body: ['A focused landing page, business website and rich product site involve different workloads. We agree on timing and milestones after discovery.', 'Source materials, content creation, translation and design feedback affect progress. Staged launches can add capabilities over time.'] },
      { title: 'FAQ', summary: 'Start without a logo or copy, refresh an existing site and include media or AI in the solution.', body: [], faqs: [{ question: 'Can we start without a name, logo or website copy?', answer: 'Yes. We can build the package from the beginning or work with an existing identity and materials.' }, { question: 'Can you include video, animation and an AI assistant?', answer: 'Yes, according to the agreed needs and scope, with attention to speed, readability and usability.' }, { question: 'Will the site work on mobile and in other languages?', answer: 'Device adaptation is part of the design. Additional languages and translation are defined for the project.' }, { question: 'Can the website keep evolving after launch?', answer: 'Yes. Add pages, media, features and integrations, with maintenance and support agreed as needed.' }] },
    ],
    contact: { ...appDevelopmentPage.en.contact, lines: ['Want a website that represents you or a complete brand for your software product?', 'Tell us what you have in mind, and we will plan a clear, professional and recognizable digital presence together.'] },
  },
};

const needsDiscoveryPage: typeof appDevelopmentPage = {
  "he": {
    "title": "אפיון צרכים ותכנון פתרונות בגישת FDE",
    "subtitle": "הפתרון הנכון מתחיל בהבנת העבודה האמיתית.",
    "panels": [
      {
        "title": "למי זה מתאים",
        "summary": "לעסקים וארגונים שרוצים להבין מה באמת צריך לשפר, לפני שמחליטים מה לפתח.",
        "body": [
          "נכנסים לעומק הפעילות, מקשיבים לאנשים שעושים את העבודה וממפים תהליכים ומערכות. מזהים היכן אפשר לחסוך זמן, להפחית טעויות ולשפר תוצאות.",
          "FDE הוא קיצור של Forward Deployed Engineering: גישה הנדסית שמתחילה קרוב למשתמשים ולתהליכים שלהם, כולל עבודה אצל הלקוח בהתאם לצורך ולהיקף שסוכם."
        ],
        "bullets": [
          "תהליכים מסורבלים שהפתרון עבורם עדיין לא ברור",
          "מידע ועבודה שמפוזרים בין אקסלים, הודעות ומערכות",
          "תכנון מערכת, אפליקציה, אוטומציה או שילוב AI",
          "מערכת קיימת שכבר אינה עונה לצרכים",
          "בחירה בין פיתוח חדש, חיבור מערכות ושימוש בכלי קיים"
        ]
      },
      {
        "title": "תוצרים שיתקבלו",
        "summary": "מפת צרכים ותוכנית מעשית שאפשר להתקדם איתן לקבלת החלטות ולביצוע.",
        "body": [
          "התוצרים מותאמים להיקף הפרויקט ומוגדרים מראש."
        ],
        "bullets": [
          "מיפוי משתמשים, תהליכים, מערכות ומקורות מידע",
          "זיהוי בעיות, צווארי בקבוק והזדמנויות לשיפור",
          "הגדרת מטרות, דרישות וסדרי עדיפויות",
          "תכנון תהליכי עבודה וחוויית שימוש",
          "תרשימי זרימה, סקיצות מסכים או אבטיפוס לפי הצורך",
          "מיפוי חיבורים, הרשאות ותלויות",
          "חלוקה לשלבי ביצוע והגדרת גרסה ראשונה שימושית",
          "מדדים לבדיקת הצלחת הפתרון"
        ]
      },
      {
        "title": "התהליך",
        "summary": "מכירים את הצורך, לומדים את השטח, ממחישים פתרון ובונים תוכנית פעולה.",
        "body": [
          "מתחילים במטרות העסק, באתגרים ובתוצאה הרצויה.",
          "לומדים את דרך העבודה באמצעות שיחות עם משתמשים, בחינת מערכות ותהליכים ותצפיות לפי הצורך.",
          "מחברים את הצרכים העסקיים לדרישות מעשיות ומדייקים סדרי עדיפויות.",
          "ממחישים את הכיוון בתרשימים, מסכים או ניסוי ממוקד כשצריך לבדוק רעיון.",
          "מגדירים היקף, שלבים וקריטריונים להצלחה. אפשר להמשיך לליווי הפיתוח וההטמעה בהיקף שיסוכם."
        ]
      },
      {
        "title": "עבודה לדוגמה",
        "summary": "ShmilaClick: היכרות יומיומית עם השטח, משני צדי התהליך, שהפכה למערכת עבודה שימושית.",
        "body": [
          "היתרון התחיל בהיכרות יומיומית עם השטח. ליאור ניהל את מערך האחזקה באזור ובמקביל הוביל את פיתוח המערכת. ההיכרות עם האנשים, הציוד וההחלטות שנדרשו בזמן אמת אפשרה לתרגם צרכים אמיתיים לפתרון שהשתלב בעבודה.",
          "מידע שהיה מפוזר בין מערכות רבות, בעלי תפקידים עם צרכים שונים וסביבת ייצור שפועלת מסביב לשעון הובילו לפיתוח סביבת עבודה חזותית ואחידה.",
          "כך יתרונות גישת FDE באו לידי ביטוי בפועל: זיהוי בעיות מתוך העבודה עצמה, הבנת המידע שכל תפקיד צריך, משוב ישיר ממשתמשים והתאמות לפי השימוש היומיומי.",
          "המערכת הבשילה לאורך כחמש שנים, הוטמעה בשני מפעלי ייצור ושימשה כ־1,000 משתמשים. הניסיון משני הצדדים עזר לחבר בין הצורך התפעולי לבין הפתרון הטכנולוגי.",
          "זו דוגמה לניסיון מקצועי קודם של המייסד, ולא מוצר מסחרי של ShmilApps."
        ]
      },
      {
        "title": "תמחור",
        "summary": "הצעת עבודה מותאמת למורכבות התהליכים, למערכות ולרמת הפירוט הנדרשת.",
        "body": [
          "לאחר שיחת היכרות נגדיר היקף עבודה ותוצרים ברורים. אפשר להתחיל במיקוד צורך נקודתי, לבצע אפיון פרויקט או לשלב ליווי לאורך הביצוע.",
          "פיתוח והטמעה, אם נדרשים, מוגדרים בנפרד או כחלק מחבילה מוסכמת."
        ]
      },
      {
        "title": "לוחות זמנים",
        "summary": "שלבים ולוח זמנים מוסכם לפי ההיקף, זמינות בעלי התפקידים והמידע הנדרש.",
        "body": [
          "משך העבודה תלוי במספר התהליכים, המשתמשים והמערכות וברמת הפירוט. בתחילת העבודה נגדיר אבני דרך ותוצרים לכל שלב."
        ]
      },
      {
        "title": "שאלות נפוצות",
        "summary": "אפשר להתחיל גם מבעיה חוזרת, לבדוק מערכת קיימת ולהמשיך לפיתוח ולהטמעה.",
        "body": [],
        "faqs": [
          {
            "question": "צריך להגיע עם רעיון מגובש?",
            "answer": "אפשר להתחיל גם מבעיה חוזרת או מתחושה שיש דרך טובה יותר לעבוד."
          },
          {
            "question": "האם כל אפיון מוביל לפיתוח חדש?",
            "answer": "לעיתים הפתרון הוא שינוי תהליך, חיבור מערכות או כלי קיים."
          },
          {
            "question": "אפשר לאפיין מערכת שכבר קיימת?",
            "answer": "כן. מזהים פערים ומתכננים שיפור או הרחבה."
          },
          {
            "question": "אפשר לקבל גם פיתוח והטמעה?",
            "answer": "כן, אפשר להמשיך לביצוע ולליווי השימוש לפי היקף שיוגדר."
          },
          {
            "question": "איפה AI נכנס לתהליך?",
            "answer": "בוחנים היכן הוא תורם, תוך התייחסות לדיוק, עלות, פרטיות ותחזוקה."
          },
          {
            "question": "איך יודעים שהפתרון עובד?",
            "answer": "מגדירים מראש תוצאות ומדדים ובודקים אותם עם המשתמשים."
          }
        ]
      }
    ],
    "contact": {
      "title": "יש תהליך שמסבך לכם את העבודה?",
      "lines": [
        "בואו נבין אותו יחד.",
        "ספרו לנו איך אתם עובדים היום, איפה הקושי ומה הייתם רוצים לשפר."
      ],
      "phone": "טלפון",
      "whatsapp": "וואטסאפ",
      "email": "אימייל"
    }
  },
  "en": {
    "title": "Needs discovery and solution planning with FDE",
    "subtitle": "The right solution starts with understanding real work.",
    "panels": [
      {
        "title": "Who is it for",
        "summary": "Businesses and organizations that want to understand what to improve before deciding what to build.",
        "body": [
          "We learn how people work, map processes and systems, and identify opportunities to save time, reduce errors and improve results.",
          "FDE stands for Forward Deployed Engineering: an engineering approach close to users and their workflows, including on-site work according to the agreed scope."
        ],
        "bullets": [
          "Difficult workflows without a clear solution",
          "Work scattered across spreadsheets, messages and systems",
          "Planning software, an app, automation or AI",
          "Existing systems that no longer meet needs",
          "Choosing between new development, integrations and existing tools"
        ]
      },
      {
        "title": "Deliverables",
        "summary": "A needs map and practical plan for decisions and implementation.",
        "body": [
          "Deliverables are tailored to the project and agreed in advance."
        ],
        "bullets": [
          "Users, workflows, systems and data sources",
          "Problems, bottlenecks and improvement opportunities",
          "Goals, requirements and priorities",
          "Workflows and user experience",
          "Flow diagrams, screen sketches or a prototype as needed",
          "Integrations, permissions and dependencies",
          "Delivery stages and a useful first version",
          "Success measures"
        ]
      },
      {
        "title": "The process",
        "summary": "Understand the need, study the work, illustrate a solution and create an action plan.",
        "body": [
          "Start with business goals, challenges and the desired result.",
          "Learn through user conversations, system and process reviews, and observation as needed.",
          "Turn business needs into practical requirements and priorities.",
          "Use diagrams, screens or a focused experiment to validate ideas.",
          "Agree scope, stages and success criteria. Development and rollout support can follow under an agreed scope."
        ]
      },
      {
        "title": "Example project",
        "summary": "ShmilaClick: firsthand operational and development experience shaped a useful working system.",
        "body": [
          "Lior managed maintenance in the operational area while also leading system development. Daily knowledge of the people, equipment and real-time decisions helped translate actual needs into a solution that fit the work.",
          "Fragmented information, different user roles and round-the-clock manufacturing led to a shared visual workspace.",
          "The benefits associated with FDE are clear in this experience: discovering problems through real work, understanding what each role needs, receiving direct feedback and adapting to daily use.",
          "The system evolved over approximately five years, was deployed in two manufacturing plants and served approximately 1,000 users. Experience on both sides connected operational needs with technical decisions.",
          "This is the founder’s previous professional experience, not a commercial ShmilApps product."
        ]
      },
      {
        "title": "Pricing",
        "summary": "Tailored to process complexity, systems and the required level of detail.",
        "body": [
          "After an introductory conversation, we agree clear scope and deliverables. Options include focused discovery, project specification and ongoing implementation support.",
          "Development and rollout are scoped separately or included in an agreed package."
        ]
      },
      {
        "title": "Timelines",
        "summary": "Agreed milestones based on scope, stakeholder availability and the information required.",
        "body": [
          "Timing depends on processes, users, systems and the required detail. We define milestones and deliverables at the beginning."
        ]
      },
      {
        "title": "FAQ",
        "summary": "Start with a recurring problem, review an existing system or continue through development and rollout.",
        "body": [],
        "faqs": [
          {
            "question": "Do I need a fully formed idea?",
            "answer": "No. A recurring problem or an opportunity to improve is enough to start."
          },
          {
            "question": "Does every specification lead to new development?",
            "answer": "Sometimes a process change, integration or existing tool is the right solution."
          },
          {
            "question": "Can you review an existing system?",
            "answer": "Yes. We identify gaps and plan improvements or extensions."
          },
          {
            "question": "Can development and rollout follow?",
            "answer": "Yes, under an agreed scope."
          },
          {
            "question": "Where does AI fit?",
            "answer": "We assess its value alongside accuracy, cost, privacy and maintenance."
          },
          {
            "question": "How is success checked?",
            "answer": "We agree results and measures up front and validate them with users."
          }
        ]
      }
    ],
    "contact": {
      "title": "Is a workflow making work harder?",
      "lines": [
        "Let’s understand it together.",
        "Tell us how you work today, what gets in the way and what you want to improve."
      ],
      "phone": "Phone",
      "whatsapp": "WhatsApp",
      "email": "Email"
    }
  }
};

const websiteBrandCaseStudy = {
  he: {
    title: 'אתר ShmilApps',
    subtitle: 'מהרעיון ועד למותג שאפשר לראות, לחוות ולזכור',
    intro: 'האתר שבו אתם נמצאים הוא דוגמה לחיבור בין מיתוג, תוכן, עיצוב ופיתוח. כל חלק נבנה כחלק מחוויה אחת: זהות שחורה־ירוקה, דמות רובוט מזוהה, סרטון מותג, הירואים ייעודיים, שפות וניווט עקביים ועוזר AI.',
    benefitsTitle: 'יתרונות מרכזיים',
    benefits: ['זהות מותג עקבית - צבעים, מסרים, מדיה ודמות שמחברים בין העמודים.', 'תשומת לב לכל פרט ולכל פיקסל - טיפוגרפיה, יישור, ריווח, כפתורים והתנהגות במכשירים שונים.', 'חוויה בשתי שפות - עברית ואנגלית, עם התאמה לכיווניות ולניווט.', 'מדיה עשירה - סרטון מותג והירואים שנוצרו במיוחד לכל שירות.', 'עוזר AI פעיל - הכוונה ראשונית לשירותים ולצורכי המבקר.', 'בסיס מתפתח - אפשרות להוסיף בהמשך עמודים, תוכן, טכנולוגיות וחוויות חדשות.'],
    techTitle: 'טכנולוגיות ויכולות',
    tech: 'האתר משלב פיתוח ב־React ו־TypeScript, עיצוב רספונסיבי, וידאו, אייקונים וגרפיקה, תמונות WebP מותאמות לטעינה ועוזר AI המחובר לשירות שרת. תהליך העדכון מחבר בין ניהול הקוד לפרסום האתר.',
    processTitle: 'תהליך העבודה',
    process: 'העבודה התחילה בהגדרת המותג והמסרים והתקדמה לתוכן, מדיה, ניווט ודפי שירות. העיצוב וההתנהגות נבדקים ומשתפרים במחשב ובמובייל, עם התאמות לכל שפה ולכל אזור באתר.',
    resultTitle: 'התוצאה',
    result: 'נוכחות דיגיטלית שמציגה את השירותים, מדגימה יכולות בפועל ומאפשרת למבקר להבין מה מתאים לו וליצור קשר. האתר ממשיך להתפתח; יכולות נוספות יוצגו לאחר שייושמו.',
    previewTitle: 'מבט על האתר',
    screenshot: '/portfolio/shmilapps/shmilapps-home-preview-v2.webp',
    screenshotAlt: 'צילום מלא של דף הבית של ShmilApps עם סרטון הגלקסיה והמיתוג הירוק',
    linkText: 'לצפייה בדף הבית',
  },
  en: {
    title: 'The ShmilApps website',
    subtitle: 'From an idea to a brand people can see, experience and remember',
    intro: 'The website you are visiting brings branding, content, design and development into one experience: a black-and-green identity, recognizable robot mascot, brand video, dedicated service heroes, consistent bilingual navigation and an AI assistant.',
    benefitsTitle: 'Key benefits',
    benefits: ['Consistent brand identity across colors, messaging, media and the mascot.', 'Attention to every detail and every pixel, from typography and spacing to controls and device behavior.', 'A bilingual experience in Hebrew and English, with appropriate text direction and navigation.', 'Rich media, including a brand video and purpose-made service hero artwork.', 'An active AI assistant that helps visitors explore services and clarify their needs.', 'An evolving foundation for additional pages, content, technologies and experiences.'],
    techTitle: 'Technologies and capabilities',
    tech: 'React and TypeScript development, responsive styling, video, icons and graphics, WebP images optimized for loading, and an AI assistant connected to a server endpoint. Code management is connected to website publishing.',
    processTitle: 'The work behind it',
    process: 'The work started with identity and messaging, followed by content, media, navigation and service pages. Design and behavior are tested and refined on desktop and mobile, with adjustments for each language and page area.',
    resultTitle: 'The result',
    result: 'A digital presence that explains services, demonstrates working capabilities and helps visitors find the right direction and get in touch. The website keeps evolving; further capabilities will be presented after implementation.',
    previewTitle: 'A look at the website',
    screenshot: '/portfolio/shmilapps/shmilapps-home-preview-v2.webp',
    screenshotAlt: 'Full ShmilApps homepage screenshot with the galaxy video and green brand identity',
    linkText: 'View the homepage',
  },
};

const aiAssistantPage = {
  he: {
    title: 'עוזר AI של ShmilApps',
    subtitle: 'צ׳אט חכם שיעזור להבין איזה פתרון מתאים לכם, לשאול שאלות ולבנות פנייה מסודרת.',
    expert: 'מומחה AI של ShmilApps',
    status: 'זמין לשיחה על שירותי ShmilApps',
    welcome: 'שלום! אני עוזר ה־AI של ShmilApps. אפשר לשאול אותי על פיתוח אפליקציות, מערכות ניהול, אתרים, אוטומציות, סקרי שוק, סקירות מניות וקריפטו, ותחקירים מול בורסאות.',
    suggestionsLabel: 'שאלות מומלצות:',
    suggestions: ['איזה שירות מתאים לי?', 'כמה זמן לוקח לבנות אפליקציה?', 'איך מתחילים מאפיון או MVP?', 'מה אפשר לעשות עם אוטומציות ו־AI?'],
    placeholder: 'שאלו כל שאלה על השירותים של ShmilApps...',
    send: 'שלח',
    note: 'העוזר מוגבל לנושאי ShmilApps והשירותים שלנו, עם הגנות על אורך שיחה ועלויות.',
    loading: 'רגע, אני בודק...',
    error: 'משהו השתבש בשליחה. נסו שוב בעוד רגע.',
    empty: 'כתבו שאלה קצרה ואשמח לעזור.',
    limit: 'כדי לשמור על שיחה ממוקדת, כדאי לסכם את הפנייה ולהמשיך בוואטסאפ או במייל.',
  },
  en: {
    title: 'ShmilApps AI Assistant',
    subtitle: 'A smart chat assistant that helps visitors understand the right solution, ask questions and prepare a clear inquiry.',
    expert: 'ShmilApps AI Expert',
    status: 'Available for ShmilApps service questions',
    welcome: 'Hi! I am the ShmilApps AI assistant. You can ask me about app development, management systems, websites, automation, market research, stock and crypto research, and crypto exchange investigations.',
    suggestionsLabel: 'Suggested questions:',
    suggestions: ['Which service fits my need?', 'How long does app development take?', 'How do we start with discovery or MVP?', 'What can automation and AI do for my business?'],
    placeholder: 'Ask anything about ShmilApps services...',
    send: 'Send',
    note: 'The assistant is limited to ShmilApps topics and services, with conversation length and cost protections.',
    loading: 'One moment, I am checking...',
    error: 'Something went wrong while sending. Please try again in a moment.',
    empty: 'Write a short question and I will help.',
    limit: 'To keep the conversation focused, it is best to summarize the inquiry and continue by WhatsApp or email.',
  },
} as const;

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
  const [language, setLanguageState] = useState<'he' | 'en'>(() => {
    if (typeof window === 'undefined') return 'he';
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang === 'en' || urlLang === 'he') return urlLang;
    const storedLang = window.localStorage.getItem('shmilapps-language');
    return storedLang === 'en' ? 'en' : 'he';
  });
  const [socialOpen, setSocialOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suppressDropdowns, setSuppressDropdowns] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const aiChatBodyRef = useRef<HTMLDivElement>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);
  const aiSendingRef = useRef(false);
  const stickyHeroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stickyHero = stickyHeroRef.current;
    if (!stickyHero) return;
    const updateContentOffset = () => {
      document.documentElement.style.setProperty('--subpage-content-top', `${stickyHero.getBoundingClientRect().bottom + 20}px`);
    };
    const observer = new ResizeObserver(updateContentOffset);
    observer.observe(stickyHero);
    updateContentOffset();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--subpage-content-top');
    };
  }, []);


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

  const setLanguage = (nextLanguage: 'he' | 'en') => {
    setLanguageState(nextLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('shmilapps-language', nextLanguage);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLanguage);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const withLanguage = (href: string) => {
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
    const [pathAndQuery, hash = ''] = href.split('#');
    const [path, query = ''] = pathAndQuery.split('?');
    const params = new URLSearchParams(query);
    params.set('lang', language);
    const queryString = params.toString();
    return `${path}${queryString ? `?${queryString}` : ''}${hash ? `#${hash}` : ''}`;
  };

  const closeFocusedMenu = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleDropdownTitleClick = () => {
    setSuppressDropdowns(true);
    closeFocusedMenu();
  };

  useEffect(() => {
    const chatBody = aiChatBodyRef.current;
    if (!chatBody) return;
    chatBody.scrollTop = chatBody.scrollHeight;
  }, [aiMessages, aiLoading]);

  useEffect(() => {
    const input = aiInputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
  }, [aiInput]);

  const focusAiInput = () => aiInputRef.current?.focus({ preventScroll: true });

  const sendAiMessage = async (rawMessage?: string) => {
    focusAiInput();
    if (aiSendingRef.current) return;
    const messageText = (rawMessage ?? aiInput).trim();
    if (!messageText) {
      setAiError(aiPage.empty);
      return;
    }

    if (aiMessages.length >= 50) {
      setAiError(aiPage.limit);
      return;
    }

    const nextMessages: AiChatMessage[] = [...aiMessages, { role: 'user', content: messageText }];
    setAiMessages(nextMessages);
    setAiInput('');
    setAiError('');
    aiSendingRef.current = true;
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, messages: nextMessages }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.answer) {
        throw new Error('AI response failed');
      }

      setAiMessages([...nextMessages, { role: 'assistant', content: String(data.answer) }]);
    } catch {
      setAiError(aiPage.error);
      setAiMessages(nextMessages);
    } finally {
      aiSendingRef.current = false;
      setAiLoading(false);
      focusAiInput();
    }
  };

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
  const services = servicesContent[language];
  const appPage = appDevelopmentPage[language];
  const aiPage = aiAssistantPage[language];
  const isHebrew = language === 'he';
  const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname;
  const isAppDevelopmentRoute = currentPath === '/services/app-development';
  const isSoftwareManagementRoute = currentPath === '/services/software-management';
  const isWebsitesBrandingRoute = currentPath === '/services/websites-and-branding';
  const isFdeRoute = currentPath === '/services/needs-discovery-fde';
  const servicePage = isFdeRoute ? needsDiscoveryPage[language] : isWebsitesBrandingRoute ? websitesBrandingPage[language] : isSoftwareManagementRoute ? softwareManagementPage[language] : appPage;
  const softwareCase = shmilaClickCaseStudy[language];
  const serviceId = isFdeRoute ? 'needs-discovery-fde' : isWebsitesBrandingRoute ? 'websites-and-branding' : isSoftwareManagementRoute ? 'software-management' : 'app-development';
  const websiteCase = websiteBrandCaseStudy[language];
  const serviceHero = isFdeRoute ? '/brand/services/needs-discovery-fde-hero-6500x500-v1.webp' : isWebsitesBrandingRoute ? '/brand/services/business-websites-brand-hero-6500x500-v2.webp' : isSoftwareManagementRoute ? '/brand/services/software-management-hero-6500x500-v1.webp' : '/brand/services/app-development-hero-6500x500-v2.webp';
  const isAiAssistantRoute = currentPath === '/ai-assistant';
  return (
    <main dir={isHebrew ? 'rtl' : 'ltr'}>
      <header className="site-header" aria-label="Main navigation">
        <a className="brand-link" href={withLanguage(navAnchors.home)} aria-label="ShmilApps home" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-home-icon" aria-hidden="true">⌂</span>
          <span className="brand-sa-wrap"><span className="brand-sa">SA</span><span className="brand-dot" aria-hidden="true" /></span>
          <img className="brand-logo" src="/brand/shmilapps-mini-logo.png" alt="" />
          <span className="brand-dot desktop-brand-dot" aria-hidden="true" />
          <span className="brand-name">ShmilApps</span>
        </a>
        <nav className={`main-nav${suppressDropdowns ? ' suppress-dropdowns' : ''}`} aria-label="Website sections" dir={isHebrew ? 'rtl' : 'ltr'} onPointerLeave={() => setSuppressDropdowns(false)}>
          <a href={withLanguage(navAnchors.home)}>{text.nav.home}</a>
          <div className="nav-item has-menu">
            <a className="nav-menu-trigger" href={withLanguage(navAnchors.services)} onClick={handleDropdownTitleClick}><span className="nav-label">{text.nav.services}</span><span className="dropdown-arrow" aria-hidden="true">⌄</span></a>
            <div className="nav-menu">
              {text.servicesMenu.map((item, index) => <a key={item} href={withLanguage(serviceHrefs[index] ?? navAnchors.services)} onClick={handleDropdownTitleClick}>{item}</a>)}
              <a className="more-link" href={withLanguage(navAnchors.services)} onClick={handleDropdownTitleClick}>{text.nav.more}</a>
            </div>
          </div>
          <div className="nav-item has-menu">
            <a className="nav-menu-trigger" href={withLanguage(navAnchors.portfolio)} onClick={handleDropdownTitleClick}><span className="nav-label">{text.nav.portfolio}</span><span className="dropdown-arrow" aria-hidden="true">⌄</span></a>
            <div className="nav-menu">
              {text.portfolioMenu.map((item) => <a key={item} href={withLanguage(navAnchors.portfolio)} onClick={handleDropdownTitleClick}>{item}</a>)}
              <a className="more-link" href={withLanguage(navAnchors.portfolio)} onClick={handleDropdownTitleClick}>{text.nav.more}</a>
            </div>
          </div>
          <div className="nav-item has-menu">
            <a className="nav-menu-trigger" href={withLanguage(navAnchors.follow)} onClick={handleDropdownTitleClick}><span className="nav-label">{text.nav.follow}</span><span className="dropdown-arrow" aria-hidden="true">⌄</span></a>
            <div className="nav-menu social-nav-menu">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noreferrer" onClick={closeFocusedMenu}>{social.labelKey ? text[social.labelKey] : social.name}</a>
              ))}
              <a className="more-link" href={withLanguage(navAnchors.follow)} onClick={handleDropdownTitleClick}>{text.nav.more}</a>
            </div>
          </div>
          <a href={withLanguage(navAnchors.about)}>{text.nav.about}</a>
          <a href={withLanguage(navAnchors.contact)}>{text.nav.contact}</a>
        </nav>
        <div className="header-actions">
          <a className="ai-link" href={withLanguage(navAnchors.assistant)}>{text.nav.assistant}</a>
          <div className="language-switcher" role="group" aria-label="Language selection">
            <button className={isHebrew ? 'active' : ''} type="button" onClick={() => setLanguage('he')} aria-pressed={isHebrew}><img src="/brand/flag-il.svg" alt="" /> <span>HE</span></button>
            <button className={!isHebrew ? 'active' : ''} type="button" onClick={() => setLanguage('en')} aria-pressed={!isHebrew}><img src="/brand/flag-us.svg" alt="" /> <span>EN</span></button>
          </div>
          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? text.nav.closeMenu : text.nav.openMenu} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
        <div className={`mobile-menu-layer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
          <button className="mobile-menu-backdrop" type="button" onClick={() => setMobileMenuOpen(false)} aria-label={text.nav.closeMenu} />
          <nav id="mobile-navigation" className="mobile-drawer" aria-label="Mobile navigation">
            <div className="mobile-drawer-head">
              <strong>ShmilApps</strong>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label={text.nav.closeMenu}>×</button>
            </div>
            <a href={withLanguage(navAnchors.home)} onClick={() => setMobileMenuOpen(false)}>{text.nav.home}</a>
            <details>
              <summary>{text.nav.services}</summary>
              {text.servicesMenu.map((item, index) => <a key={item} href={withLanguage(serviceHrefs[index] ?? navAnchors.services)} onClick={() => setMobileMenuOpen(false)}>{item}</a>)}
              <a className="more-link" href={withLanguage(navAnchors.services)} onClick={() => setMobileMenuOpen(false)}>{text.nav.more}</a>
            </details>
            <details>
              <summary>{text.nav.portfolio}</summary>
              {text.portfolioMenu.map((item) => <a key={item} href={withLanguage(navAnchors.portfolio)} onClick={() => setMobileMenuOpen(false)}>{item}</a>)}
              <a className="more-link" href={withLanguage(navAnchors.portfolio)} onClick={() => setMobileMenuOpen(false)}>{text.nav.more}</a>
            </details>
            <details>
              <summary>{text.nav.follow}</summary>
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)}>{social.labelKey ? text[social.labelKey] : social.name}</a>
              ))}
              <a className="more-link" href={withLanguage(navAnchors.follow)} onClick={() => setMobileMenuOpen(false)}>{text.nav.more}</a>
            </details>
            <a href={withLanguage(navAnchors.about)} onClick={() => setMobileMenuOpen(false)}>{text.nav.about}</a>
            <a href={withLanguage(navAnchors.contact)} onClick={() => setMobileMenuOpen(false)}>{text.nav.contact}</a>
            <a className="mobile-ai-link" href={withLanguage(navAnchors.assistant)} onClick={() => setMobileMenuOpen(false)}>{text.nav.assistant}</a>
          </nav>
        </div>
      </header>
      {isAiAssistantRoute ? (
        <section id="ai-assistant-page" className="service-page ai-page" aria-labelledby="ai-page-title">
          <div ref={stickyHeroRef} className="service-sticky-area ai-sticky-area">
            <div className="service-sticky-hero ai-sticky-hero" aria-hidden="true" style={{ backgroundImage: 'url(/brand/services/ai-assistant-hero-6500x500-v2.webp)' }} />
            <div className="service-hero-titlebar" dir={isHebrew ? 'rtl' : 'ltr'}>
              <h2 id="ai-page-title">{aiPage.title}</h2>
              <p>{aiPage.subtitle}</p>
            </div>
          </div>
          <div className="service-page-content ai-page-content" dir={isHebrew ? 'rtl' : 'ltr'}>
            <section className="ai-chat-shell" aria-label={aiPage.title}>
              <header className="ai-chat-header">
                <div className="ai-chat-title">
                  <img src="/brand/ai/shmilapps-ai-bot-icon-192.png" alt="" />
                  <span>
                    <strong>{aiPage.expert}</strong>
                    <small>{aiPage.status}</small>
                  </span>
                </div>
                <span className="ai-chat-live-dot" aria-hidden="true" />
              </header>
              <div className="ai-chat-body" ref={aiChatBodyRef}>
                <article className="ai-message ai-message-bot">
                  <img src="/brand/ai/shmilapps-ai-bot-icon-192.png" alt="" />
                  <div>
                    <p>{aiPage.welcome}</p>
                    <time>{isHebrew ? 'עכשיו' : 'Now'}</time>
                  </div>
                </article>
                {aiMessages.map((message, index) => (
                  <article className={`ai-message ${message.role === 'assistant' ? 'ai-message-bot' : 'ai-message-user'}`} key={`${message.role}-${index}`}>
                    {message.role === 'assistant' ? <img src="/brand/ai/shmilapps-ai-bot-icon-192.png" alt="" /> : null}
                    <div>
                      <p>{message.content}</p>
                      <time>{isHebrew ? 'עכשיו' : 'Now'}</time>
                    </div>
                  </article>
                ))}
                {aiLoading ? (
                  <article className="ai-message ai-message-bot ai-message-loading">
                    <img src="/brand/ai/shmilapps-ai-bot-icon-192.png" alt="" />
                    <div><p>{aiPage.loading}</p></div>
                  </article>
                ) : null}
              </div>
              <div className="ai-suggestions" aria-label={aiPage.suggestionsLabel}>
                <span>{aiPage.suggestionsLabel}</span>
                {aiPage.suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => sendAiMessage(suggestion)} disabled={aiLoading}>{suggestion}</button>)}
              </div>
              <details
                className="ai-suggestions-mobile"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    event.currentTarget.open = false;
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.currentTarget.open = false;
                    event.currentTarget.querySelector('summary')?.focus();
                  }
                }}
              >
                <summary>{isHebrew ? 'שאלות מומלצות' : 'Suggested questions'}</summary>
                <div className="ai-suggestions-mobile-list">
                  {aiPage.suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" disabled={aiLoading} onClick={(event) => {
                      event.currentTarget.closest('details')?.removeAttribute('open');
                      sendAiMessage(suggestion);
                    }}>{suggestion}</button>
                  ))}
                </div>
              </details>
              <form className="ai-chat-input" onSubmit={(event) => { event.preventDefault(); sendAiMessage(); }}>
                <textarea
                  ref={aiInputRef}
                  rows={1}
                  value={aiInput}
                  onChange={(event) => setAiInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      sendAiMessage();
                    }
                  }}
                  placeholder={aiPage.placeholder}
                  aria-label={aiPage.placeholder}
                  maxLength={1500}
                />
                <button type="submit" disabled={aiLoading}>{aiPage.send}</button>
              </form>
              {aiError ? <p className="ai-chat-error" role="alert">{aiError}</p> : null}
            </section>
            <p className="ai-page-note">{aiPage.note}</p>
          </div>
        </section>
      ) : (isAppDevelopmentRoute || isSoftwareManagementRoute || isWebsitesBrandingRoute || isFdeRoute) ? (
        <section id={`service-${serviceId}`} className="service-page" aria-labelledby={`${serviceId}-title`}>
          <div ref={stickyHeroRef} className="service-sticky-area">
            <div className="service-sticky-hero" aria-hidden="true" style={{ backgroundImage: `url(${serviceHero})` }} />
            <div className="service-hero-titlebar" dir={isHebrew ? 'rtl' : 'ltr'}>
              <h2 id={`${serviceId}-title`}>{servicePage.title}</h2>
              <p>{servicePage.subtitle}</p>
            </div>
          </div>
          <div className="service-page-content">
            {servicePage.panels.map((panel) => {
              const isFdeExamplePanel = isFdeRoute && panel.title === servicePage.panels[3].title;
              const isExamplePanel = isAppDevelopmentRoute && panel.title === servicePage.panels[3].title;
              const isSoftwareExamplePanel = isSoftwareManagementRoute && panel.title === servicePage.panels[3].title;
              const isWebsiteExamplePanel = isWebsitesBrandingRoute && panel.title === servicePage.panels[3].title;
              return (
              <details className="service-detail" key={panel.title} dir={isHebrew ? 'rtl' : 'ltr'}>
                <summary>
                  <span>
                    <strong>{panel.title}</strong>
                    {isSoftwareExamplePanel ? <small className="service-case-quote">{softwareCase.quote}</small> : null}
                    <small className="service-summary-text">{panel.summary}</small>
                  </span>
                  <em><span className="more-text">{text.nav.more}</span><span className="less-text">{text.nav.less}</span></em>
                </summary>
                <div className="service-detail-body" dir={isHebrew ? 'rtl' : 'ltr'}>
                  {isExamplePanel ? (
                    <article className="case-study-card service-example-card" dir={isHebrew ? 'rtl' : 'ltr'}>
                      <header className="case-study-header">
                        <div className="case-study-logo-wrap">
                          <img src="/portfolio/shmilventory/shmilventory-logo.png" alt="ShmilVentory" />
                        </div>
                        <h3>{portfolioCaseStudy[language].title}</h3>
                        <p>{portfolioCaseStudy[language].subtitle}</p>
                      </header>
                      <div className="case-study-body">
                        {portfolioCaseStudy[language].paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      </div>
                      <div className="case-study-grid">
                        <section>
                          <h4>{portfolioCaseStudy[language].benefitsTitle}</h4>
                          <ul>
                            {portfolioCaseStudy[language].benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
                          </ul>
                        </section>
                        <section>
                          <h4>{portfolioCaseStudy[language].techTitle}</h4>
                          <p>{portfolioCaseStudy[language].tech}</p>
                          <h4>{portfolioCaseStudy[language].rolloutTitle}</h4>
                          <p>{portfolioCaseStudy[language].rollout}</p>
                          <h4>{portfolioCaseStudy[language].resultTitle}</h4>
                          <p>{portfolioCaseStudy[language].result}</p>
                        </section>
                      </div>
                      <div className="case-study-video-wrap">
                        <video controls preload="metadata" playsInline poster="/portfolio/shmilventory/shmilventory-video-poster.png" aria-label="ShmilVentory promotional video">
                          <source src="/portfolio/shmilventory/shmilventory-ad-web.mp4" type="video/mp4" />
                        </video>
                      </div>
                    </article>
                  ) : null}
                  {isSoftwareExamplePanel ? (
                    <article className="case-study-card service-example-card shmilaclick-case" dir={isHebrew ? 'rtl' : 'ltr'}>
                      <header className="case-study-header">
                        <h3>{softwareCase.title}</h3>
                        <p>{softwareCase.subtitle}</p>
                      </header>
                      <div className="case-study-body">
                        <p>{softwareCase.intro}</p>
                        <h4>{softwareCase.challengeTitle}</h4>
                        <p>{softwareCase.challenge}</p>
                        <h4>{softwareCase.howTitle}</h4>
                        <p>{softwareCase.how}</p>
                        <p>{softwareCase.principle}</p>
                      </div>
                      <div className="case-study-grid">
                        <section>
                          <h4>{softwareCase.benefitsTitle}</h4>
                          <ul>{softwareCase.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
                        </section>
                        <section>
                          <h4>{softwareCase.techTitle}</h4>
                          {softwareCase.tech.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                          <h4>{softwareCase.rolloutTitle}</h4>
                          {softwareCase.rollout.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                          <p className="case-study-history">{softwareCase.history}</p>
                          <h4>{softwareCase.resultTitle}</h4>
                          <p>{softwareCase.result}</p>
                          <ul>{softwareCase.results.map((result) => <li key={result}>{result}</li>)}</ul>
                        </section>
                      </div>
                      <section className="case-study-demo" aria-label={softwareCase.videoTitle}>
                        <h4>{softwareCase.videoTitle}</h4>
                        <div className="case-study-video-wrap">
                          <video controls preload="metadata" playsInline poster="/portfolio/shmilaclick/shmilaclick-video-poster.jpg" aria-label={softwareCase.videoLabel}>
                            <source src="/portfolio/shmilaclick/shmilaclick-ad-web.mp4" type="video/mp4" />
                          </video>
                        </div>
                        <p>{softwareCase.videoNote}</p>
                      </section>
                      <p className="case-study-context">{softwareCase.context}</p>
                    </article>
                  ) : null}
                  {isWebsiteExamplePanel ? (
                    <article className="case-study-card service-example-card website-brand-case" dir={isHebrew ? 'rtl' : 'ltr'}>
                      <header className="case-study-header">
                        <h3>{websiteCase.title}</h3>
                        <p>{websiteCase.subtitle}</p>
                      </header>
                      <div className="case-study-body"><p>{websiteCase.intro}</p></div>
                      <div className="case-study-grid">
                        <section>
                          <h4>{websiteCase.benefitsTitle}</h4>
                          <ul>{websiteCase.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
                        </section>
                        <section>
                          <h4>{websiteCase.techTitle}</h4><p>{websiteCase.tech}</p>
                          <h4>{websiteCase.processTitle}</h4><p>{websiteCase.process}</p>
                          <h4>{websiteCase.resultTitle}</h4><p>{websiteCase.result}</p>
                        </section>
                      </div>
                      <figure className="website-case-preview">
                        <a href={withLanguage('/#home')}>
                          <img src={websiteCase.screenshot} alt={websiteCase.screenshotAlt} loading="lazy" />
                        </a>
                        <figcaption>{websiteCase.previewTitle}</figcaption>
                      </figure>
                      <a className="website-case-link" href={withLanguage('/#home')}>{websiteCase.linkText}</a>
                    </article>
                  ) : null}
                  {!isExamplePanel && !isSoftwareExamplePanel && !isWebsiteExamplePanel ? panel.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}

                  {isFdeExamplePanel ? <section className="case-study-demo" aria-label={softwareCase.videoTitle}>
                    <h4>{softwareCase.videoTitle}</h4>
                    <div className="case-study-video-wrap"><video controls preload="metadata" playsInline poster="/portfolio/shmilaclick/shmilaclick-video-poster.jpg" aria-label={softwareCase.videoLabel}><source src="/portfolio/shmilaclick/shmilaclick-ad-web.mp4" type="video/mp4" /></video></div>
                    <p>{softwareCase.videoNote}</p>
                    <a className="website-case-link" href={withLanguage('/services/software-management')}>{isHebrew ? 'לדוגמה המלאה של ShmilaClick' : 'Explore the full ShmilaClick case study'}</a>
                  </section> : null}
                  {panel.bullets ? <ul>{panel.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
                  {panel.faqs ? <div className="faq-list">{panel.faqs.map((faq) => <div key={faq.question}><h4>{faq.question}</h4><p>{faq.answer}</p></div>)}</div> : null}
                </div>
              </details>
              );
            })}
            <section className="service-contact" aria-labelledby="service-contact-title" dir={isHebrew ? 'rtl' : 'ltr'}>
              <h3 id="service-contact-title">{servicePage.contact.title}</h3>
              {servicePage.contact.lines.map((line) => <p key={line}>{line}</p>)}
              <div className="service-contact-links">
                <a href="tel:+972547886780" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">☎</span><span>{servicePage.contact.phone}</span><bdi>+972547886780</bdi></a>
                <a href="https://wa.me/972547886780" target="_blank" rel="noreferrer" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">💬</span><span>{servicePage.contact.whatsapp}</span></a>
                <a href="mailto:shmilapps@gmail.com" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">✉</span><span>{servicePage.contact.email}</span><bdi>shmilapps@gmail.com</bdi></a>
              </div>
            </section>
          </div>
        </section>
      ) : (
      <section id="home" className="construction" aria-label="ShmilApps">
        <div className="glow" aria-hidden="true" />
        <div className="hero-showcase">
          <video ref={videoRef} className="logo-video" autoPlay loop muted playsInline preload="auto" aria-label="ShmilApps - Turning Ideas into Digital Reality">
            <source src="/brand/Galaxy_16x6_mobile.mp4" type="video/mp4" media="(max-width: 900px)" />
            <source src="/brand/Galaxy_10top_33bottom_desktop.mp4" type="video/mp4" />
          </video>
          <button className={`sound-toggle ${soundEnabled ? 'show-sound-off-action' : 'show-sound-on-action'}`} type="button" onClick={toggleSound} aria-label={soundEnabled ? text.soundOff : text.soundOn} aria-pressed={soundEnabled}>
            <svg className="speaker-icon" viewBox="0 0 32 32" aria-hidden="true">
              <path className="speaker-body" d="M4 13.5h6.1L18 6.7c.9-.8 2.3-.1 2.3 1.1v16.4c0 1.2-1.4 1.9-2.3 1.1l-7.9-6.8H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2Z" />
              <path className="sound-wave wave-one" d="M23.5 12.2a6.1 6.1 0 0 1 0 7.6" />
              <path className="sound-wave wave-two" d="M26.8 9.1a10.8 10.8 0 0 1 0 13.8" />
              <path className="mute-slash" d="M6.5 5.8 26 25.3" />
            </svg>
          </button>
          <aside id="follow" className={`social-panel ${socialOpen ? 'open' : ''}`} aria-labelledby="social-title">
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
        <section id="about" className="intro-section" aria-labelledby="welcome-title">
          <h2 id="welcome-title">{text.welcome}</h2>
          <p>{text.intro}</p>
          <h3>{text.approach}</h3>
          <ol className="approach-list">
            {text.steps.map((step, index) => (
              <li key={step}><span>{index + 1}</span>{step}</li>
            ))}
          </ol>
        </section>

        <section id="services" className="services-section" dir={isHebrew ? 'rtl' : 'ltr'} aria-labelledby="services-title">
          <div className="section-heading">
            <h2 id="services-title">{text.nav.services}</h2>
            <p>{isHebrew ? 'בחרו שירות כדי לקרוא הסבר קצר, או היכנסו לדף המלא של השירות הרלוונטי.' : 'Choose a service for a short overview, or open the full page for the relevant service.'}</p>
          </div>
          <div className="services-list">
            {services.map((service) => (
              <a className="service-card" href={withLanguage(service.href)} key={service.title} dir={isHebrew ? 'rtl' : 'ltr'}>
                <strong>{service.title}</strong>
                <span>{service.summary}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="portfolio" className="placeholder-section" aria-labelledby="portfolio-title">
          <h2 id="portfolio-title">{text.nav.portfolio}</h2>
          <p>{isHebrew ? 'בקרוב נציג כאן עבודות, מערכות ופרויקטים נבחרים.' : 'Soon we will showcase selected products, systems and projects here.'}</p>
        </section>

        <section id="ai-assistant" className="placeholder-section ai-placeholder" aria-labelledby="ai-title">
          <h2 id="ai-title">{text.nav.assistant}</h2>
          <p>{isHebrew ? 'כאן יוקם עוזר AI שיכיר את ShmilApps, השירותים, התהליכים והרעיונות שנוכל להציע.' : 'This area will host an AI assistant that knows ShmilApps, our services, processes and ideas.'}</p>
        </section>

        <section id="contact" className="service-contact home-contact" aria-labelledby="home-contact-title" dir={isHebrew ? 'rtl' : 'ltr'}>
          <h2 id="home-contact-title">{text.nav.contact}</h2>
          <p>{isHebrew ? 'רוצים לבדוק רעיון, שירות או שיתוף פעולה?' : 'Want to check an idea, service or collaboration?'}</p>
          <p>{isHebrew ? 'דברו איתנו ונבין יחד מה נכון לבנות ואיך להתחיל.' : 'Let’s talk and understand what makes sense to build and how to start.'}</p>
          <div className="service-contact-links">
            <a href="tel:+972547886780" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">☎</span><span>{appPage.contact.phone}</span><bdi>+972547886780</bdi></a>
            <a href="https://wa.me/972547886780" target="_blank" rel="noreferrer" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">💬</span><span>{appPage.contact.whatsapp}</span></a>
            <a href="mailto:shmilapps@gmail.com" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">✉</span><span>{appPage.contact.email}</span><bdi>shmilapps@gmail.com</bdi></a>
          </div>
        </section>


      </section>
      )}
      <footer>© 2026 ShmilApps · shmilapps.com</footer>
    </main>
  );
}

