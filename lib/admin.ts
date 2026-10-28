import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function isAdmin(){const user=await getChatGPTUser();if(!user)return false;const configured=env.ADMIN_EMAIL?.toLowerCase().trim();if(configured)return user.email.toLowerCase()===configured;return process.env.NODE_ENV==='development'&&user.userId==='local_seedy'&&user.email==='seedy@sites.test';}
