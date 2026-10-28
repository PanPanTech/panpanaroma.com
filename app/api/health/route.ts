import {env} from 'cloudflare:workers';
export async function GET(){try{if(!env.DB)throw new Error('No binding');await env.DB.prepare('SELECT id FROM inquiries LIMIT 1').first();return Response.json({status:'ok',inquiryStorage:'ready'},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({status:'unavailable'},{status:503});}}
