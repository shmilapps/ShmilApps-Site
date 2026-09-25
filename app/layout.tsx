import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'ShmilApps — האתר בבנייה',description:'האתר החדש של ShmilApps נמצא בבנייה. בקרוב נעלה לאוויר.',icons:{icon:'/brand/favicon.ico'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="he" dir="rtl"><body>{children}</body></html>}
