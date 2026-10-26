export const researchOrderTerms = {
  he: {
    delivery: 'הדוח יימסר בתוך עד 72 שעות מקבלת הבקשה המלאה, החומרים הנדרשים והתשלום. ספירת הזמן מתחילה לאחר קבלת שלושתם.',
    refund: 'עד 48 שעות מקבלת הדוח תוכלו להודיע שאינכם שבעי רצון ולקבל החזר כספי מלא, ללא שאלות.',
    languages: 'אפשר להזמין דוח בעברית, באנגלית או בשתי השפות.',
  },
  en: {
    delivery: 'The report will be delivered within 72 hours of receiving the complete request, required materials and payment. The clock starts once all three have been received.',
    refund: 'Within 48 hours of receiving the report, you can tell us you are not satisfied and receive a full refund, no questions asked.',
    languages: 'Choose a report in Hebrew, English or both languages.',
  },
};

export function ResearchReportLanguage({ language, requiredIndicator = false, label }: { language: 'he' | 'en'; requiredIndicator?: boolean; label?:string }) {
  return <label><span>{label ?? (language === 'he' ? 'שפת הדוח' : 'Report language')}{requiredIndicator ? <> <strong aria-hidden="true" style={{color:'#ff4d4f',fontWeight:900,fontSize:'1.2em',position:'relative',top:'0.28em',lineHeight:0}}>*</strong></> : null}</span>
    <select name="reportLanguage" defaultValue={language} required>
      <option value="he">עברית</option>
      <option value="en">English</option>
      <option value="both">{language === 'he' ? 'דו לשוני - עברית ואנגלית' : 'Bilingual - Hebrew and English'}</option>
    </select>
  </label>;
}
