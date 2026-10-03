export function bidBudget({resale,repair=0,other=0,saleable=85,margin=20,qty}){
 if(![resale,repair,other,saleable,margin,qty].every(Number.isFinite)||resale<=0||resale>100000000||repair<0||repair>100000000||other<0||other>100000000||qty<1||qty>10000||saleable<0||saleable>100||margin<0||margin>=100)return null;
 const ceiling=share=>{const revenue=qty*resale*share/100,targetCost=revenue*(1-margin/100),fixed=qty*(repair+other+800);let p=Math.max(0,Math.floor((targetCost-fixed)/(qty*1.125)));while(p>0&&qty*p+Math.round(qty*p*.125)+fixed>targetCost)p--;return p};
 return {ceiling:ceiling(saleable),stressCeiling:ceiling(Math.max(0,saleable-10)),expectedRevenue:qty*resale*saleable/100};
}
