import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Học cùng lon ton | Không gian học tập',description:'Học cùng lon ton — tài liệu, luyện đề và ôn tập thông minh theo từng bài.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
