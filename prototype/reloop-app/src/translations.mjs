import core from './hi-core.mjs';
import journeys from './hi-journeys.mjs';
import errors from './hi-errors.mjs';
import personas from './hi-personas.mjs';
import financials from './hi-financials.mjs';
import dashboard from './hi-dashboard.mjs';
import {catalogProducts,catalogCities} from './catalog.mjs';
export const hindi={...core,...journeys,...errors,...personas,...financials,...dashboard,...Object.fromEntries(catalogProducts.flatMap(p=>[[p.title,p.titleHi],[p.description,p.descriptionHi]])),...Object.fromEntries(catalogCities.flatMap(c=>[[c.city,c.cityHi],[c.state,c.stateHi]]))};
const patterns=[
 [/^(\d+) quotes$/,(_,n)=>n+' ऑफ़र'],
 [/^(\d+) units$/,(_,n)=>n+' नग'],
 [/^needed by (.+)$/,(_,date)=>'चाहिए तारीख तक '+date],
 [/^(\d+) matching lots$/,(_,n)=>n+' मिलते-जुलते लॉट'],
 [/^(\d+) recovery lots$/,(_,n)=>n+' बचे स्टॉक के लॉट'],
 [/^Seller contribution (\d+)$/,(_,n)=>'विक्रेता का स्टॉक '+n],
 [/^(Seller|Supplier) (\d+)$/,(_,r,n)=>(r==='Seller'?'विक्रेता ':'सप्लायर ')+n],
 [/^Show all (\d+) actions$/,(_,n)=>'सभी '+n+' काम देखें'],
 [/^No (exceptions|ready actions) in this selection\.$/,(_,x)=>x==='exceptions'?'इस चयन में कोई समस्या नहीं है।':'इस चयन में कोई तैयार काम नहीं है।'],
 [/^Accepted units · seller (\d+) \(declared (\d+)\)$/,(_,n,q)=>'मंज़ूर नग · विक्रेता '+n+' (बताए '+q+')'],
 [/^City totals, including locations not mapped \((\d+)\)$/,(_,n)=>'सभी शहरों का हिसाब, नक्शे से बाहर की जगहें भी ('+n+')'],
 [/^(\d+)h$/,(_,n)=>n+' घंटे'],[/^(\d+)d (\d+)h$/,(_,d,h)=>d+' दिन '+h+' घंटे'],[/^(\d+(?:\.\d+)?) days$/,(_,n)=>n+' दिन'],
 [/^Illustrative demo record · (.+)$/,(_,s)=>'उदाहरण का रिकॉर्ड · '+({pickup:'पिकअप',review:'जाँच',shipped:'रास्ते में',delivered:'डिलीवर',settled:'भुगतान पूरा',ready_dispatch:'भेजने को तैयार',awaiting_payment:'भुगतान का इंतज़ार'}[s]||s)],
 [/^(?:Illustrative sample view|Stock evidence) (\d+)$/,(_,n)=>'सामान की फ़ोटो '+n],
 [/^Seller (\d+) evidence (\d+)$/,(_,n,v)=>'विक्रेता '+n+' की फ़ोटो '+v],
 [/^(.+): (\d+) active orders, (\d+) exceptions\. Filter city\.$/,(_,c,n,e)=>(hindi[c]||c)+': '+n+' चालू ऑर्डर, '+e+' समस्याएँ। शहर चुनें।'],
 [/^Daily recovery settlements, (.+) total\. Exact values in table below\.$/,(_,n)=>'हर दिन निपटाई गई कुल रकम '+n+'। पूरा हिसाब नीचे तालिका में है।']
];
export function translateText(value,lang='hi'){
 if(lang!=='hi'||typeof value!=='string')return value;
 const key=value.replace(/\s+/g,' ').trim();if(!key)return value;
 let translated=hindi[key];
 if(!translated)for(const[pattern,replace]of patterns)if(pattern.test(key)){translated=key.replace(pattern,replace);break}
 if(!translated&&key.includes(' · ')){const parts=key.split(' · ');const mapped=parts.map(x=>translateText(x,lang));if(mapped.some((x,i)=>x!==parts[i]))translated=mapped.join(' · ')}
 return translated?value.slice(0,value.length-value.trimStart().length)+translated+value.slice(value.trimEnd().length):value;
}
