import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Hải Quan 2027 | Góc ôn thi',description:'Kho tài liệu, bài học và luyện đề Hải quan cá nhân'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
