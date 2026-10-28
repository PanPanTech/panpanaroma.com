import data from '@/content/blog.json';
import {articles,originUrl,site} from '@/lib/site';
import type {BlogCardItem,BlogCategory} from '@/lib/blog-filter';

export type BlogPost={slug:string;title:string;category:string;excerpt:string;answer:string;status:'draft'|'published';reviewStatus:'pending-review'|'approved';publishedAt:string|null;updatedAt:string;author:{name:string;type:'Organization';path:string};image:string;imageAlt:string;seo:{title:string;description:string;keywords:string[]};sections:{id:string;heading:string;paragraphs:string[];bullets?:string[]}[];faq:{question:string;answer:string}[];sources:{title:string;href:string;note:string}[];related:{label:string;href:string}[]};
export const blogPosts=data.posts as BlogPost[];
export const blogCategories=data.categories as BlogCategory[];
export const blogPath=(post:Pick<BlogPost,'slug'>)=>`/blog/${post.slug}/`;
export const getPublicBlogPosts=()=>blogPosts.filter(post=>post.status==='published'&&post.reviewStatus==='approved'&&!!post.publishedAt&&!Number.isNaN(Date.parse(post.publishedAt)));
export const isPostIndexable=(post:BlogPost)=>site.publicLaunchApproved&&getPublicBlogPosts().some(item=>item.slug===post.slug);
export const getBlogPost=(slug:string)=>(site.publicLaunchApproved?getPublicBlogPosts():blogPosts).find(post=>post.slug===slug);
export const blogReadMinutes=(post:BlogPost)=>Math.max(2,Math.ceil([post.answer,...post.sections.flatMap(section=>[section.heading,...section.paragraphs,...(section.bullets||[])]),...post.faq.flatMap(item=>[item.question,item.answer])].join(' ').split(/\s+/).length/200));
export const formatBlogDate=(date:string)=>new Intl.DateTimeFormat('en',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(date));
export function getBlogItems():BlogCardItem[]{
  const visiblePosts=site.publicLaunchApproved?getPublicBlogPosts():blogPosts;
  const guides=articles.map(page=>({slug:page.path.split('/').filter(Boolean).at(-1)!,href:page.path,title:page.title,excerpt:page.description,category:(data.legacyGuideCategories as Record<string,string>)[page.path]||'sourcing',kind:'guide' as const,status:'published' as const,publishedAt:null,updatedAt:null,readMinutes:Math.max(2,Math.ceil([page.intro,...page.sections.flatMap(section=>section.body)].join(' ').split(/\s+/).length/200))}));
  return [...visiblePosts.map(post=>({slug:post.slug,href:blogPath(post),title:post.title,excerpt:post.excerpt,category:post.category,kind:'article' as const,status:post.status,publishedAt:post.publishedAt,updatedAt:post.updatedAt,readMinutes:blogReadMinutes(post)})),...guides];
}
const organization={'@type':'Organization',name:site.name,url:site.origin};
export function blogPostingSchema(post:BlogPost){
  const url=originUrl(blogPath(post));
  const published=getPublicBlogPosts().some(item=>item.slug===post.slug);
  return {'@context':'https://schema.org','@type':'BlogPosting','@id':url+'#article',url,mainEntityOfPage:{'@type':'WebPage','@id':url},headline:post.title,description:post.excerpt,image:[originUrl(post.image)],author:{'@type':post.author.type,name:post.author.name,url:originUrl(post.author.path)},publisher:organization,inLanguage:'en',articleSection:blogCategories.find(category=>category.id===post.category)?.label,creativeWorkStatus:published?'Published':'Draft',dateModified:post.updatedAt,...(published&&post.publishedAt?{datePublished:post.publishedAt}:{}),isPartOf:{'@type':'Blog','@id':originUrl('/blog/')+'#blog',name:'PanPan Aroma Buyer’s Notebook',url:originUrl('/blog/')}};
}
export const blogBreadcrumbSchema=(post?:BlogPost)=>({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:originUrl('/')},{'@type':'ListItem',position:2,name:'Blog',item:originUrl('/blog/')},...(post?[{'@type':'ListItem',position:3,name:post.title,item:originUrl(blogPath(post))}]:[])]});
export function blogIndexSchema(){return {'@context':'https://schema.org','@type':'Blog','@id':originUrl('/blog/')+'#blog',name:'PanPan Aroma Buyer’s Notebook',description:'Practical sourcing, sample and private label reading for botanical oil buyers.',url:originUrl('/blog/'),inLanguage:'en',publisher:organization,blogPost:(site.publicLaunchApproved?getPublicBlogPosts():blogPosts).map(post=>({'@type':'BlogPosting','@id':originUrl(blogPath(post))+'#article',headline:post.title,url:originUrl(blogPath(post))}))};}
