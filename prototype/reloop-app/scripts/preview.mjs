// Isolated local QA. Never touches the live database or review comments.
import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {applicationService} from '../../reloop-shared-review/application-service.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),db=new DatabaseSync(':memory:');
const review=path.resolve(root,'../reloop-shared-review');
for(const f of readdirSync(path.join(review,'drizzle')).filter(x=>x.endsWith('.sql')).sort())db.exec(readFileSync(path.join(review,'drizzle',f),'utf8'));
const binding={async batch(st){db.exec('BEGIN');try{const r=[];for(const s of st)r.push(await s.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}},prepare(sql){let values=[];return{bind(...v){values=v;return this},async first(){return db.prepare(sql).get(...values)},async all(){return{results:db.prepare(sql).all(...values)}},async run(){return db.prepare(sql).run(...values)}}}};
const objects=new Map(),env={DB:binding,APP_GATEWAY_SECRET:'isolated-local-test',APP_SETUP_SECRET:'isolated-local-operator',BUCKET:{async put(k,b){objects.set(k,b)},async get(k){return objects.has(k)?{body:objects.get(k)}:null},async delete(k){objects.delete(k)}}};
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.wasm':'application/wasm','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1:4327');if(url.pathname.startsWith('/api/')){const parts=[];for await(const x of req)parts.push(x);const headers={...req.headers,'X-ReLoop-Gateway':'isolated-local-test','X-ReLoop-Client-IP':'local'};const r=await applicationService(new Request('http://127.0.0.1:4327/api/application'+url.pathname.slice(4),{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(parts)}:{})}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return}let file=path.resolve(root,'dist','.'+decodeURIComponent(url.pathname));if(!file.startsWith(path.join(root,'dist')+path.sep))file=path.join(root,'dist','index.html');if(!existsSync(file)||!path.extname(file))file=path.join(root,'dist','index.html');res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(file))}catch(e){console.error(e.message);res.writeHead(500);res.end('Preview failed')}}).listen(4327,'127.0.0.1',()=>console.log('Isolated application preview http://127.0.0.1:4327'));
