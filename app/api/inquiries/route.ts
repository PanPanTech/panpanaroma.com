import {env} from 'cloudflare:workers';
import {validateInquiry,sameOrigin,safeCsvCell} from '@/lib/validation';
import {isAdmin} from '@/lib/admin';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'Invalid request origin.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Please send a JSON request.'},415);
 let body;try{const raw=await request.text();if(raw.length>15000)return json({error:'Your request is too long.'},413);body=JSON.parse(raw);}catch{return json({error:'Please send a valid request.'},400);}
 const{data,errors}=validateInquiry(body);if(!data||Object.keys(errors).length)return json({errors},422);
 if(data.website)return json({errors:{form:'Your request could not be accepted. Please try again.'}},422);
 if(!env.DB)return json({error:'The request service is temporarily unavailable. Please try again later.'},503);
 try{
  const recent=await env.DB.prepare('SELECT COUNT(*) AS n FROM inquiries WHERE email = ? AND created_at > ?').bind(data.email.toLowerCase(),new Date(Date.now()-3600000).toISOString()).first<{n:number}>();
  if(recent&&(recent.n>=8))return json({error:'Several requests have been received. Please wait before sending another.'},429);
  const id=crypto.randomUUID(),reference='MIYA-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+id.slice(0,8).toUpperCase(),now=new Date().toISOString();
  await env.DB.batch([
   env.DB.prepare('INSERT INTO inquiries (id,reference,kind,name,company,email,country,product,quantity,packaging,customization,timeline,message,source,status,is_test,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,reference,data.kind,data.name,data.company,data.email.toLowerCase(),data.country,data.product,data.quantity,data.packaging,data.customization,data.timeline,data.message,data.source,'new',data.email.toLowerCase().endsWith('@example.test')?1:0,now,now),
   env.DB.prepare('INSERT INTO events (id,kind,page,product,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),data.kind==='contact'?'contact_submitted':data.kind==='sample'?'sample_submitted':data.kind==='documents'?'documents_submitted':'quote_submitted',data.source,data.product,now)
  ]);
  return json({reference,received:true},201);
 }catch(error){console.error('Inquiry persistence failed',error instanceof Error?error.name:'Error');return json({error:'Your request could not be saved. Please try again.'},503);}
}
export async function GET(request:Request){if(!await isAdmin())return json({error:'Not authorized.'},401);if(!env.DB)return json({error:'Storage unavailable.'},503);const url=new URL(request.url),status=url.searchParams.get('status'),exportCsv=url.searchParams.get('format')==='csv',includeTests=url.searchParams.get('tests')==='1';const where:string[]=[],values:string[]=[];if(status){where.push('status = ?');values.push(status);}if(!includeTests)where.push('is_test = 0');const clause=where.length?' WHERE '+where.join(' AND '):'';const query=env.DB.prepare('SELECT * FROM inquiries'+clause+' ORDER BY created_at DESC LIMIT '+(exportCsv?'5000':'100')).bind(...values);const result=await query.all();if(exportCsv){const keys=['reference','kind','name','company','email','country','product','quantity','packaging','customization','timeline','message','source','status','created_at','updated_at'];const csv='\uFEFF'+[keys.map(safeCsvCell).join(','),...result.results.map(r=>keys.map(k=>safeCsvCell(r[k])).join(','))].join('\r\n');return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="miya-inquiries.csv"','Cache-Control':'no-store'}});}const stats=await env.DB.prepare('SELECT status, COUNT(*) AS count FROM inquiries'+(includeTests?'':' WHERE is_test = 0')+' GROUP BY status').all();return json({items:result.results,stats:stats.results});}
