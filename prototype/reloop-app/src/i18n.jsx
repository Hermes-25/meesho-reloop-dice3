import React,{createContext,useContext,useState,useEffect,useMemo} from 'react';
import {translateText} from './translations.mjs';
const LanguageContext=createContext({lang:'en',setLang:()=>{},t:(en)=>en});
export function LanguageProvider({children,initialLanguage}){
 const[lang,setLang]=useState(()=>initialLanguage||(typeof localStorage!=='undefined'&&localStorage.getItem('reloop-app-language'))||'en');
 useEffect(()=>{document.documentElement.lang=lang;localStorage.setItem('reloop-app-language',lang)},[lang]);
 const value=useMemo(()=>({lang,setLang,t:(en,hi)=>lang==='hi'?(hi||translateText(en,lang)):en}),[lang]);
 return React.createElement(LanguageContext.Provider,{value},children);
}
export const useLanguage=()=>useContext(LanguageContext);
// Translate only presentation strings. Never translate form values, IDs, links,
// API payloads, event handlers or the underlying inventory/financial records.
function LocalizedElement({as,children,...props}){
 const{lang}=useLanguage();
 const words=x=>typeof x==='string'?translateText(x,lang):Array.isArray(x)?x.map(words):x;
 const next={...props};
 if(props.translate!=='no')for(const key of ['title','placeholder','alt','aria-label'])if(typeof next[key]==='string')next[key]=words(next[key]);
 // Native options without explicit values must keep their canonical English value.
 if(as==='option'&&next.value===undefined&&typeof children==='string')next.value=children;
 const content=props.translate==='no'?children:words(children);
 return React.createElement(as,next,as==='title'&&Array.isArray(content)?content.join(''):content);
}
export function localizedElement(type,props,...children){return React.createElement(typeof type==='string'?LocalizedElement:type,typeof type==='string'?{...props,as:type}:props,...children)}
