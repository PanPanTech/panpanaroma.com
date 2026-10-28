import {site,originUrl,pages,products} from '@/lib/site';
import {blogPosts} from '@/lib/blog';
import {discoveryEntries} from '@/lib/discovery';
export default function sitemap(){return discoveryEntries({launchApproved:site.publicLaunchApproved,pages,products,posts:blogPosts}).map(entry=>({url:originUrl(entry.path),...(entry.lastModified?{lastModified:entry.lastModified}:{})}));}
