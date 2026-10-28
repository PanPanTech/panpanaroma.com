import {site,originUrl} from '@/lib/site';
import {getPublicBlogPosts,blogPath} from '@/lib/blog';

const escapeXml=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
export function GET(){
  const posts=site.publicLaunchApproved?getPublicBlogPosts():[];
  const items=posts.map(post=>`<item><title>${escapeXml(post.title)}</title><link>${escapeXml(originUrl(blogPath(post)))}</link><guid isPermaLink="true">${escapeXml(originUrl(blogPath(post)))}</guid><description>${escapeXml(post.excerpt)}</description><pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate></item>`).join('');
  const xml=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>PanPan Aroma Sourcing Journal</title><link>${escapeXml(originUrl('/blog/'))}</link><description>Practical notes for essential oil wholesale, sampling and private label projects.</description><language>en</language><atom:link href="${escapeXml(originUrl('/blog/feed.xml'))}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml,{headers:{'Content-Type':'application/rss+xml; charset=utf-8','X-Robots-Tag':site.publicLaunchApproved?'index, follow':'noindex, nofollow'}});
}
