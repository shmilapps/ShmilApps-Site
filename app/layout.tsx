import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'ShmilApps',description:'ShmilApps הופכת רעיונות וצרכים מהעולם האמיתי לפתרונות דיגיטליים מעשיים.',icons:{icon:'/brand/favicon.ico'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="he" dir="rtl"><body>{children}</body></html>}

