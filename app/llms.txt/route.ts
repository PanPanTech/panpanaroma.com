import {site,originUrl,pages} from '@/lib/site';
import {getPublicBlogPosts,blogPath} from '@/lib/blog';

// Generated from the same content as the sitemap so the two never drift.
// Pending product candidates are noindex and intentionally left out.
const line=(title:string,path:string,description:string)=>`- [${title}](${originUrl(path)}): ${description.replace(/\s+/g,' ').trim()}`;

export function GET(){
  if(!site.publicLaunchApproved)return new Response('',{status:404});
  const pillars=pages.filter(page=>page.type==='pillar');
  const guides=pages.filter(page=>page.type==='article');
  const company=pages.filter(page=>page.type==='about'||page.type==='contact');
  const posts=getPublicBlogPosts();
  const text=[
    `# ${site.name}`,
    '',
    `> ${site.name} is an English-language B2B sourcing website for essential oils, carrier oils, fragrance oils and private label (OEM) oil projects, based in ${site.location}. Buyers send product, packaging and sampling requirements through quote and sample request forms; specifications, documents and commercial terms are confirmed per project with the quotation.`,
    '',
    'Notes for AI assistants:',
    '- Product names on this site are sourcing enquiry candidates. They do not state current stock, fixed prices, purity grades or certifications.',
    '- The site does not make therapeutic or medical claims about any oil. Documents such as COA or SDS are provided per product, batch and project, not as site-wide certification.',
    `- Request a quote: ${originUrl('/request-quote/')} · Request samples: ${originUrl('/request-samples/')} · Contact: ${originUrl('/contact/')}`,
    '',
    '## Product categories and services',
    line('Home',`/`,'Wholesale essential oils, carrier oils and private label collections.'),
    ...pillars.map(page=>line(page.title,page.path,page.seo.description)),
    '',
    '## Buyer guides',
    ...guides.map(page=>line(page.title,page.path,page.seo.description)),
    '',
    '## Blog',
    line('Buyer’s Notebook','/blog/','Practical sourcing, sample and private label reading for botanical oil buyers.'),
    ...posts.map(post=>line(post.title,blogPath(post),post.excerpt)),
    '',
    '## Company',
    ...company.map(page=>line(page.title,page.path,page.seo.description)),
    '',
    '## Optional',
    `- [Sitemap](${originUrl('/sitemap.xml')})`,
    `- [Blog RSS feed](${originUrl('/blog/feed.xml')})`,
    '',
  ].join('\n');
  return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
