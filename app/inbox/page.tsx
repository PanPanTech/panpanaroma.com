import {isAdmin} from '@/lib/admin';
import {chatGPTSignInPath,getChatGPTUser} from '@/app/chatgpt-auth';
import Inbox from '@/components/Inbox';
export const dynamic='force-dynamic';
export const metadata={title:'Team Inbox',robots:{index:false,follow:false}};
export default async function Page(){if(!await isAdmin()){const user=await getChatGPTUser();return <main id="main" className="wrap notfound"><span className="eyebrow">TEAM ACCESS</span><h1>{user?'Access restricted.':'Sign in to your workspace.'}</h1><p>{user?'This inbox is available to the configured PanPan Aroma site owner.':'Use the site owner’s ChatGPT account to review project enquiries.'}</p>{!user&&<a className="button" href={chatGPTSignInPath('/inbox/')} target="_top">Sign in with ChatGPT</a>}</main>;}return <main id="main"><Inbox/></main>;}
