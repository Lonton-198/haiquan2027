import Image from 'next/image';
export default function Mascot({className='',size=180}:{className?:string;size?:number}){
 return <Image src="/lon-ton-mascot.png" width={size} height={size} alt="Linh vật cún vàng lon ton đeo tai nghe, áo phao đen và ba lô" className={className} priority={size>200}/>;
}
