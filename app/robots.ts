import {site} from '@/lib/site';
export default function robots(){return {rules:site.publicLaunchApproved?{userAgent:'*',allow:'/',disallow:['/api/','/inbox/','/request-quote/','/request-samples/']}:{userAgent:'*',disallow:'/'},sitemap:site.origin+'/sitemap.xml'};}
