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
    portfolioMenu: ['שמילונטורי', 'שמילקליק', 'מערכת ETF וירטואלית', 'קומנד סנטר לדיווחי תוצאות', 'בוט מסחר — קריפטו', 'אפליקציה לניהול מבנים', 'אפליקציה לניהול מכוורות'],
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
    portfolioMenu: ['Shmilventory', 'ShmilClick', 'Virtual ETF system', 'Results command center', 'Crypto trading bot', 'Building management app', 'Apiary management app'],
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
  assistant: '/#ai-assistant',
};

type ServiceSummary = { title: string; summary: string; href: string };
type ServicePanel = { title: string; summary: string; body: string[]; bullets?: string[]; faqs?: { question: string; answer: string }[] };


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
  '/#services',
  '/#services',
  '/#services',
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
    { title: 'פיתוח תוכנה ומערכות ניהול', summary: 'מערכות פנימיות לניהול תהליכים, עובדים, לקוחות, מלאי, דוחות ותפעול.', href: '/#services' },
    { title: 'פיתוח אתרי עסק ופיתוח מותגי תוכנה', summary: 'אתרי עסק, דפי נחיתה ונכסים דיגיטליים שמציגים את העסק או מוצר התוכנה בצורה מקצועית.', href: '/#services' },
    { title: 'איפיון צרכים (גם בצורת FDE אצל הלקוח)', summary: 'הבנת הצרכים בשטח, מיפוי תהליכים ובניית כיוון ברור לפני פיתוח או אוטומציה.', href: '/#services' },
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
    { title: 'Software and management systems', summary: 'Internal systems for managing processes, employees, customers, inventory, reports and operations.', href: '/#services' },
    { title: 'Business websites and software brand development', summary: 'Business sites, landing pages and digital assets that present the business or software product professionally.', href: '/#services' },
    { title: 'Needs discovery (including on-site FDE)', summary: 'Understanding needs in the field, mapping processes and building a clear direction before development or automation.', href: '/#services' },
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
      { title: 'תוצרים שיתקבלו', summary: 'אפיון, סקר שוק, MVP, מסכים, פיתוח, בדיקות, הדרכה, קוד מקור ותמיכה ראשונית.', body: [], bullets: ['אפיון ראשוני של האפליקציה', 'סקר שוק מקדים: בדיקת מתחרים, פתרונות קיימים, קהלי יעד, מודלים עסקיים והזדמנויות', 'הגדרת MVP — גרסה ראשונה וממוקדת של האפליקציה', 'מבנה מסכים ותהליכי שימוש', 'עיצוב בסיסי או מתקדם לפי הצורך', 'אפליקציית Web / מובייל / שניהם', 'ממשק ניהול במידת הצורך', 'חיבור למאגר נתונים', 'חיבור למשתמשים, הרשאות, טפסים, התראות או תשלומים לפי הפרויקט', 'בדיקות לפני עלייה לאוויר', 'העלאה לאוויר או הכנה לפרסום', 'הדרכה בסיסית לשימוש וניהול', 'קוד מקור וגישה לפרויקט — בסיום העבודה ניתן לקבל את קוד המקור או גישה מסודרת לפרויקט, בהתאם לסוג השירות, תנאי הפרויקט וההסכמות מראש', 'תמיכה ראשונית לאחר מסירה — לאחר העלייה לאוויר ניתנת תקופת תמיכה ראשונית לתיקונים, התאמות קטנות והסברים על שימוש במערכת'] },
      { title: 'התהליך', summary: 'מתחילים בהבנת הרעיון, ממשיכים לסקר שוק ו־MVP, ואז לאפיון, פיתוח, בדיקות ועלייה לאוויר.', body: ['העבודה מתחילה בהבנת הרעיון, המטרה העסקית והמשתמשים שאמורים להשתמש באפליקציה. בשלב הזה מחדדים מה באמת צריך לבנות, מה חשוב, מה מיותר בשלב הראשון, ומה יכול להישאר להמשך.', 'לאחר מכן אפשר לבצע סקר שוק מקדים. בסקר בודקים מתחרים, פתרונות קיימים, קהלי יעד, מודלים עסקיים, נקודות חוזקה וחולשה בשוק והזדמנויות שכדאי לקחת בחשבון לפני שנכנסים לפיתוח.', 'אחרי שלב ההבנה, האפיון וסקר השוק, מגדירים יחד את גרסת ה־MVP — הגרסה הראשונה והממוקדת של האפליקציה.', 'לאחר מכן בונים אפיון מסודר: מסכים, פעולות מרכזיות, סוגי משתמשים, הרשאות, תהליכי עבודה וחיבורים נדרשים. לאחר אישור הכיוון מתחיל הפיתוח עצמו, כולל בדיקות, תיקונים ושיפורים.', 'בסיום מבצעים בדיקות שימוש, מעלים את האפליקציה לסביבה פעילה או מכינים אותה לפרסום, ומסבירים איך לעבוד איתה בפועל.'] },
      { title: 'עבודה לדוגמה', summary: 'אפליקציה להזמנות, סטטוסים ועדכונים ללקוחות, עם מערכת ניהול פנימית לעסק.', body: ['לדוגמה: אפליקציה לעסק שרוצה לאפשר ללקוחות לבצע הזמנות, לעקוב אחרי סטטוס, לקבל עדכונים ולנהל את כל המידע במקום אחד.', 'בצד הלקוח יש ממשק פשוט וברור לביצוע פעולות, צפייה בסטטוס וקבלת עדכונים.', 'בצד העסק יש מערכת ניהול שמרכזת הזמנות, לקוחות, סטטוסים, הודעות ודוחות בסיסיים.', 'כך העסק מקבל גם חוויית לקוח טובה יותר וגם שליטה פנימית טובה יותר בתהליך.'] },
      { title: 'תמחור', summary: 'אפשר להתחיל מסקר שוק ב־99 ש״ח. אם ממשיכים לפיתוח, עלות הסקר מתקזזת ממחיר הפרויקט.', body: ['ניתן להתחיל מסקר שוק מקדים בעלות של 99 ש״ח.', 'סקר השוק כולל בדיקת מתחרים, פתרונות קיימים, קהלי יעד, מודלים עסקיים והזדמנויות. אם ממשיכים איתנו לפיתוח לאחר הסקר, עלות הסקר מתקזזת ממחיר הפרויקט.', 'מחיר פיתוח האפליקציה עצמה תלוי בהיקף העבודה, מספר המסכים, רמת העיצוב, סוג המשתמשים, כמות החיבורים למערכות אחרות, צורך בממשק ניהול, תשלומים, התראות, הרשאות ומורכבות כללית.', 'במקרים רבים אפשר להתחיל מ־MVP — גרסה ראשונה וממוקדת של האפליקציה — במקום לפתח את כל המערכת כבר מההתחלה.', 'לאחר סיום הפרויקט ניתן להמשיך למסלול ריטיינר חודשי לתמיכה, תחזוקה והמשך פיתוח. הריטיינר נקבע בתיאום מראש לפי היקף התמיכה, זמינות נדרשת, כמות שינויים צפויה ורמת האחריות הנדרשת.'] },
      { title: 'לוחות זמנים', summary: 'סקר שוק קצר יחסית; MVP בסיסי לרוב כמה שבועות; אפליקציה מורכבת יכולה לקחת כמה חודשים.', body: ['סקר שוק מקדים ניתן בדרך כלל להכין בזמן קצר יחסית, בהתאם לעומק הבדיקה הנדרש.', 'אפליקציה פשוטה או MVP בסיסי יכולים לקחת כמה שבועות.', 'אפליקציה מורכבת יותר, עם משתמשים, ניהול, דאטה, הרשאות ואינטגרציות, יכולה לקחת כמה חודשים.', 'הזמן תלוי בעיקר ברמת האפיון, כמות הפיצ׳רים, מורכבות החיבורים וקצב קבלת ההחלטות לאורך הדרך.'] },
      { title: 'שאלות נפוצות', summary: 'תשובות קצרות לגבי חנויות אפליקציות, MVP, סקר שוק, חיבורים למערכות ועיצוב.', body: [], faqs: [{ question: 'האם חייבים אפליקציה לחנויות App Store ו־Google Play?', answer: 'לא תמיד. לפעמים אפליקציית Web מתקדמת מספיקה, זולה יותר, מהירה יותר לפיתוח ונגישה מכל מכשיר.' }, { question: 'אפשר להתחיל מגרסה קטנה?', answer: 'כן. בהרבה מקרים עדיף להתחיל מ־MVP — גרסה ראשונה שמכילה רק את הדברים החשובים ביותר.' }, { question: 'מה זה MVP?', answer: 'MVP הוא מוצר ראשוני וממוקד שמכיל את הליבה של הרעיון. הוא מאפשר לבדוק שימוש אמיתי לפני שמשקיעים בפיתוח רחב ומורכב.' }, { question: 'האם סקר השוק חובה?', answer: 'לא תמיד, אבל הוא מומלץ במיוחד כשמדובר ברעיון חדש, מוצר חדש או אפליקציה שצריכה להתחרות בפתרונות קיימים.' }, { question: 'האם אפשר לחבר את האפליקציה למערכות קיימות?', answer: 'כן, במקרים רבים אפשר לחבר ל־CRM, גיליונות, מערכות תשלום, מערכות דיוור, API וכלים נוספים.' }, { question: 'האם מקבלים גם עיצוב?', answer: 'כן, לפי הצורך. אפשר לעבוד עם עיצוב בסיסי, עיצוב מתקדם או התאמה לשפה קיימת של העסק.' }] },
    ],
    contact: { title: 'צור קשר', lines: ['רוצים לבדוק אם הרעיון שלכם מתאים לאפליקציה?', 'דברו איתנו ונבין יחד מה נכון לבנות, מה אפשר להתחיל ממנו, ואיך להפוך את זה למוצר שעובד בפועל.'], phone: 'טלפון', whatsapp: 'WhatsApp', email: 'מייל' },
  },
  en: {
    title: 'App development',
    subtitle: 'Mobile and web applications tailored to the business, from idea to working product.',
    panels: [
      { title: 'Who it fits', summary: 'For businesses, entrepreneurs and idea owners who want to turn a real need into a working digital product.', body: ['This service fits businesses, entrepreneurs and idea owners who want to turn a real need into a working digital product.', 'It can be a customer app, an internal employee system, an ordering platform, a service tool, a community app, a management app or a SaaS product.', 'It is especially useful when there is a clear idea, a manual process that should become digital, or a need to test whether a solution is worth building before making a larger investment.'] },
      { title: 'Deliverables', summary: 'Discovery, market research, MVP definition, screens, development, testing, training, source access and initial support.', body: [], bullets: ['Initial app discovery and definition', 'Preliminary market research: competitors, existing solutions, target audiences, business models and opportunities', 'MVP definition — a focused first version of the app', 'Screen structure and user flows', 'Basic or advanced design as needed', 'Web app, mobile app or both', 'Admin interface when needed', 'Database connection', 'Users, permissions, forms, notifications or payments according to the project', 'Pre-launch testing', 'Launch or publishing preparation', 'Basic training for usage and management', 'Source code and project access — at the end of the work, source code or organized project access can be provided according to the service type, project terms and prior agreements', 'Initial post-delivery support for fixes, small adjustments and usage guidance'] },
      { title: 'The process', summary: 'We start with the idea, continue to market research and MVP, then move to specification, development, testing and launch.', body: ['The work starts by understanding the idea, business goal and the users who will use the app. At this stage we clarify what should really be built, what matters first and what can wait.', 'Then we can perform preliminary market research: competitors, existing solutions, target audiences, business models, strengths, weaknesses and opportunities.', 'After discovery, specification and market research, we define the MVP — the first focused version of the app.', 'Next we create a clear specification: screens, main actions, user types, permissions, workflows and required integrations. After approval, development begins with testing, fixes and improvements.', 'At the end we test usage, launch the app or prepare it for publishing, and explain how to work with it.'] },
      { title: 'Example project', summary: 'An ordering and status app for customers, with an internal management system for the business.', body: ['For example: an app for a business that wants customers to place orders, track status, receive updates and keep all information in one place.', 'The customer side has a simple interface for actions, status and updates.', 'The business side has a management system for orders, customers, statuses, messages and basic reports.', 'The business gets a better customer experience and better internal control of the process.'] },
      { title: 'Pricing', summary: 'You can start with market research for ₪99. If development continues with us, the research cost is deducted from the project price.', body: ['You can start with preliminary market research for ₪99.', 'The research includes competitors, existing solutions, target audiences, business models and opportunities. If you continue with us to development, the research cost is deducted from the project price.', 'The app development price depends on scope, number of screens, design level, user types, integrations, admin interface, payments, notifications, permissions and overall complexity.', 'In many cases it is possible to start with an MVP — a focused first version of the app — instead of building the entire system at once.', 'After the project is completed, monthly retainer support, maintenance and continued development can be arranged. The retainer is agreed in advance according to support scope, required availability, expected changes and responsibility level.'] },
      { title: 'Timelines', summary: 'Market research is usually short; a basic MVP may take a few weeks; a complex app can take several months.', body: ['Preliminary market research can usually be prepared fairly quickly, depending on the required depth.', 'A simple app or basic MVP may take a few weeks.', 'A more complex app with users, management, data, permissions and integrations can take several months.', 'The timeline mainly depends on specification depth, feature count, integration complexity and decision pace throughout the project.'] },
      { title: 'FAQ', summary: 'Short answers about app stores, MVP, market research, system integrations and design.', body: [], faqs: [{ question: 'Do we have to publish to the App Store and Google Play?', answer: 'Not always. Sometimes an advanced web app is enough, cheaper, faster to develop and accessible from every device.' }, { question: 'Can we start small?', answer: 'Yes. In many cases it is better to start with an MVP — a first version that includes only the most important parts.' }, { question: 'What is an MVP?', answer: 'An MVP is a focused first product that includes the core of the idea. It lets you test real usage before investing in broader development.' }, { question: 'Is market research mandatory?', answer: 'Not always, but it is recommended for a new idea, a new product or an app that will compete with existing solutions.' }, { question: 'Can the app connect to existing systems?', answer: 'Yes, in many cases it can connect to CRM systems, spreadsheets, payment systems, mailing tools, APIs and more.' }, { question: 'Is design included?', answer: 'Yes, as needed. We can work with basic design, advanced design or adapt to an existing business language.' }] },
    ],
    contact: { title: 'Contact', lines: ['Want to check whether your idea fits an app?', 'Let’s talk and understand what should be built, what to start with and how to turn it into a working product.'], phone: 'Phone', whatsapp: 'WhatsApp', email: 'Email' },
  },
};

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
  const isHebrew = language === 'he';
  const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname;
  const isAppDevelopmentRoute = currentPath === '/services/app-development';
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
      {isAppDevelopmentRoute ? (
        <section id="service-app-development" className="service-page" aria-labelledby="app-development-title">
          <div className="service-sticky-area">
            <div className="service-sticky-hero" aria-hidden="true" style={{ backgroundImage: 'url(/brand/services/app-development-hero-10x1.png)' }} />
            <div className="service-hero-titlebar" dir={isHebrew ? 'rtl' : 'ltr'}>
              <h2 id="app-development-title">{appPage.title}</h2>
              <p>{appPage.subtitle}</p>
            </div>
          </div>
          <div className="service-page-content">
            {appPage.panels.map((panel) => {
              const isExamplePanel = panel.title === appPage.panels[3].title;
              return (
              <details className="service-detail" key={panel.title} dir={isHebrew ? 'rtl' : 'ltr'}>
                <summary>
                  <span>
                    <strong>{panel.title}</strong>
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
                  {!isExamplePanel ? panel.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}
                  {panel.bullets ? <ul>{panel.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
                  {panel.faqs ? <div className="faq-list">{panel.faqs.map((faq) => <div key={faq.question}><h4>{faq.question}</h4><p>{faq.answer}</p></div>)}</div> : null}
                </div>
              </details>
              );
            })}
            <section className="service-contact" aria-labelledby="service-contact-title" dir={isHebrew ? 'rtl' : 'ltr'}>
              <h3 id="service-contact-title">{appPage.contact.title}</h3>
              {appPage.contact.lines.map((line) => <p key={line}>{line}</p>)}
              <div className="service-contact-links">
                <a href="tel:+972547886780" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">☎</span><span>{appPage.contact.phone}</span><bdi>+972547886780</bdi></a>
                <a href="https://wa.me/972547886780" target="_blank" rel="noreferrer" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">💬</span><span>{appPage.contact.whatsapp}</span></a>
                <a href="mailto:shmilapps@gmail.com" dir={isHebrew ? 'rtl' : 'ltr'}><span className="contact-icon" aria-hidden="true">✉</span><span>{appPage.contact.email}</span><bdi>shmilapps@gmail.com</bdi></a>
              </div>
            </section>
          </div>
        </section>
      ) : (
      <section id="home" className="construction" aria-label="ShmilApps">
        <div className="glow" aria-hidden="true" />
        <div className="hero-showcase">
          <video ref={videoRef} className="logo-video" autoPlay loop muted playsInline preload="auto" aria-label="ShmilApps — Turning Ideas into Digital Reality">
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




