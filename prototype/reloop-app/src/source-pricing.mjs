// Amounts are integer paise; the supplier fee is deducted only on completion.
export const sourceCost=(qty,price)=>{
 const goods=qty*price,logistics=qty*800,supplierFee=Math.round(goods*45/1000);
 return {goods,premium:0,logistics,total:goods+logistics,supplierFee,supplierNet:goods-supplierFee,pricingModel:'source-supplier-4.5-v1'};
};
