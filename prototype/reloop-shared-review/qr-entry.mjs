import QRCode from "qrcode";
export const drawQR=(canvas,text)=>QRCode.toCanvas(canvas,text,{width:260,margin:2,errorCorrectionLevel:"M"});
