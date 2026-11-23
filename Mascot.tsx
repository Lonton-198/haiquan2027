import Image from 'next/image';

export type MascotMood = 'calm' | 'happy' | 'thinking' | 'cheer';

/** Each mood uses a transparent PNG. The calm mood retains the user's original mascot image. */
export default function Mascot({className='',size=180,mood='calm'}:{className?:string;size?:number;mood?:MascotMood}){
 const src=mood==='calm'?'/lon-ton-mascot.png':`/lon-ton-mascot-${mood}.png`;
 return <Image src={src} width={size} height={size} alt={`Cún lon ton mặc áo phao đen, đeo tai nghe (${mood})`} className={className} priority={size>200} style={{objectFit:'contain'}}/>;
}
