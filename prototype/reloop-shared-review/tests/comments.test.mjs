import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,mkdtempSync,rmSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,sep} from 'node:path';
import worker from '../worker.mjs';
function binding(db){return{prepare(sql){let values=[];return{bind(...v){values=v;return this},async first(){return db.prepare(sql).get(...values)},async all(){return{results:db.prepare(sql).all(...values)}},async run(){return db.prepare(sql).run(...values)}}}}}
const request=(data,extra={})=>new Request('https://review.example/api/comments',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://review.example','CF-Connecting-IP':'127.0.0.1',...extra},body:JSON.stringify(data)});
test('comments persist for another visitor, are idempotent and validate input',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'reloop-comments-'));const file=join(dir,'comments.sqlite');let db=new DatabaseSync(file);
 try{
  for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync(join('drizzle',file),'utf8'));
  let env={DB:binding(db)};
  const data={id:crypto.randomUUID(),screen:'S2',name:'Reviewer',body:'Make the photo guidance clearer.',context:'seller · phone · Hindi'};
  assert.equal((await worker.fetch(request(data),env)).status,201);
  assert.equal((await worker.fetch(request(data),env)).status,200);
  db.close();db=new DatabaseSync(file);env={DB:binding(db)};
  const loaded=await (await worker.fetch(new Request('https://review.example/api/comments?screen=S2'),env)).json();
  assert.equal(loaded.comments.length,1);assert.equal(loaded.comments[0].body,data.body);assert.equal('rate_key' in loaded.comments[0],false);
  assert.equal((await worker.fetch(request({...data,id:crypto.randomUUID(),screen:'not-a-screen'}),env)).status,400);
  assert.equal((await worker.fetch(request({...data,id:crypto.randomUUID(),body:''}),env)).status,400);
  assert.equal((await worker.fetch(request({...data,id:crypto.randomUUID()},{Origin:'https://elsewhere.example'}),env)).status,403);
  assert.equal((await worker.fetch(new Request('https://review.example/api/comments',{method:'DELETE'}),env)).status,405);
  for(let i=0;i<7;i++)assert.equal((await worker.fetch(request({...data,id:crypto.randomUUID()}),env)).status,201);
  assert.equal((await worker.fetch(request({...data,id:crypto.randomUUID()}),env)).status,429);
 }finally{db.close();assert.ok(realpathSync(dir).startsWith(realpathSync(tmpdir())+sep));rmSync(dir,{recursive:true,force:true})}
});

test('additive migration preserves legacy comments; replies remain complete, attached and durable',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'reloop-threads-')),file=join(dir,'comments.sqlite');let db=new DatabaseSync(file);
 try{
  db.exec('PRAGMA foreign_keys=ON');
  const migrations=readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort();
  db.exec(readFileSync(join('drizzle',migrations[0]),'utf8'));
  const root=crypto.randomUUID(),other=crypto.randomUUID();
  db.prepare('INSERT INTO review_comments VALUES (?,?,?,?,?,?,?)').run(root,'S2','Original reviewer','Keep my existing feedback intact.','seller · phone',123456,'old');
  db.prepare('INSERT INTO review_comments VALUES (?,?,?,?,?,?,?)').run(other,'B1','Buyer','Original buyer feedback.','buyer',123457,'old');
  const before=db.prepare('SELECT * FROM review_comments ORDER BY id').all();
  for(const migration of migrations.slice(1))db.exec(readFileSync(join('drizzle',migration),'utf8'));
  assert.deepEqual(db.prepare('SELECT id,screen,name,body,context,created_at,rate_key FROM review_comments ORDER BY id').all(),before);
  let env={DB:binding(db)};
  const reply={id:crypto.randomUUID(),parentId:root,screen:'S2',name:'Teammate',body:'Reply from another person.',context:'desktop'};
  assert.equal((await worker.fetch(request(reply),env)).status,201);
  assert.equal((await worker.fetch(request(reply),env)).status,200);
  assert.equal((await worker.fetch(request({...reply,body:'Conflicting retry'}),env)).status,409);
  const followup={...reply,id:crypto.randomUUID(),parentId:reply.id,name:'Another teammate',body:'Following up on the reply.'};
  assert.equal((await worker.fetch(request(followup),env)).status,201);
  assert.equal((await worker.fetch(request({...reply,id:crypto.randomUUID(),screen:'B1'}),env)).status,400);
  assert.equal((await worker.fetch(request({...reply,id:crypto.randomUUID(),parentId:crypto.randomUUID()}),env)).status,404);
  assert.equal((await worker.fetch(request({...reply,id:crypto.randomUUID(),parentId:17}),env)).status,400);
  // A long conversation must not evict the parent or older replies at the former 200-message limit.
  for(let i=0;i<205;i++)db.prepare('INSERT INTO review_comments VALUES (?,?,?,?,?,?,?,?,?)').run(crypto.randomUUID(),'S2','Fixture','Discussion '+i,'',Date.now()+i,'fixture',reply.id,root);
  db.close();db=new DatabaseSync(file);env={DB:binding(db)};
  const rows=(await (await worker.fetch(new Request('https://review.example/api/comments?screen=S2'),env)).json()).comments;
  assert.equal(rows.length,208);assert.equal(rows.find(r=>r.id===root).body,before.find(r=>r.id===root).body);
  assert.equal(rows.find(r=>r.id===reply.id).thread_id,root);
  assert.equal(rows.find(r=>r.id===followup.id).parent_id,reply.id);assert.equal(rows.find(r=>r.id===followup.id).thread_id,root);
  assert.ok(rows.every(r=>r.screen==='S2'&&!('rate_key' in r)));
  const all=(await (await worker.fetch(new Request('https://review.example/api/comments'),env)).json()).comments;assert.equal(all.length,209);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM review_comments WHERE parent_id IS NULL').get().n,2);
 }finally{db.close();assert.ok(realpathSync(dir).startsWith(realpathSync(tmpdir())+sep));rmSync(dir,{recursive:true,force:true})}
});
