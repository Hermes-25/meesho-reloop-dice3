export function workspaceLinks(me){
 const links=me.role==='seller'?[['/inventory','My stock','Package'],['/orders','Recovery orders','Truck'],['/source','Source fresh stock','ShoppingBag']]:me.role==='ops'?[['/operations','Dashboard','ShieldCheck'],['/market','Lots & auctions','ClipboardList'],['/source','Procurement oversight','ShoppingBag'],['/issues','Issues & settlements','AlertCircle']]:[...(me.capabilities?.buy?[['/market','Buy surplus','Search']]:[]),['/source','Supply fresh stock','ShoppingBag'],['/orders','Orders','Truck'],['/partner','Business capabilities','Settings']];
 return [...(me.role!=='ops'?[['/dashboard','Dashboard','Dashboard']]:[]),...links,['/activity','Activity','Clock']];
}
export const homePath=me=>me.role==='ops'?'/operations':'/dashboard';
export function routeAllowed(me,path){
 if(path==='/dashboard')return ['seller','partner'].includes(me.role);
 if(path==='/activity'||path.startsWith('/orders')||path==='/supply-orders')return true;
 if(path.startsWith('/inventory'))return me.role==='seller';
 if(path==='/market')return me.role==='ops'||me.role==='partner'&&me.capabilities?.buy;
 if(path.startsWith('/market/'))return me.role==='seller'||me.role==='ops'||me.role==='partner'&&me.capabilities?.buy;
 if(path==='/source/new')return me.role==='seller';
 if(path.startsWith('/source'))return ['seller','partner','ops'].includes(me.role);
 if(path==='/partner')return me.role==='partner';
 if(['/operations','/issues'].includes(path))return me.role==='ops';
 return false;
}
