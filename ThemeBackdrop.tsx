"use client";
import {useEffect} from 'react';
export type LonTonTheme = 'ocean' | 'forest' | 'city';
export const LONTON_THEME_KEY = 'lonton-scene-theme-v2';
export const LONTON_THEMES = [
 {id:'ocean' as const,name:'Biển',subtitle:'Đại dương · Hải đăng',icon:'🌊',image:'/ocean-coast-art.jpg'},
 {id:'forest' as const,name:'Rừng',subtitle:'Núi rừng · Suối xanh',icon:'🌲',image:'/theme-forest.jpg'},
 {id:'city' as const,name:'Đô thị',subtitle:'Thành phố · Hoàng hôn',icon:'🌆',image:'/theme-city.svg'},
];
export function readLonTonTheme():LonTonTheme{
 try {const candidate=window.localStorage.getItem(LONTON_THEME_KEY); if(candidate==='forest'||candidate==='city')return candidate;}catch{}
 return 'ocean';
}
export function applyLonTonTheme(theme:LonTonTheme){
 document.documentElement.dataset.lontonTheme=theme;
 try {window.localStorage.setItem(LONTON_THEME_KEY,theme);}catch{}
}
export default function ThemeBackdrop(){
 useEffect(()=>{applyLonTonTheme(readLonTonTheme());},[]);
 return <div className="lonton-scene-backgrounds" aria-hidden="true">
   <div className="lonton-scene lonton-scene-ocean"/>
   <div className="lonton-scene lonton-scene-forest"/>
   <div className="lonton-scene lonton-scene-city"/>
 </div>;
}
