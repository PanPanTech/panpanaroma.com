type DiscoveryInput={
  launchApproved:boolean;
  pages:{path:string}[];
  products:{category:string;slug:string;releaseStatus:string}[];
  posts:{slug:string;status:string;reviewStatus:string;publishedAt:string|null;updatedAt:string}[];
};
export type DiscoveryEntry={path:string;lastModified?:string};

// Drafts may be reviewed privately, but must never enter public discovery feeds.
export function discoveryEntries(input:DiscoveryInput):DiscoveryEntry[]{
  if(!input.launchApproved)return [];
  const entries:DiscoveryEntry[]=[{path:'/'},{path:'/resources/'},{path:'/blog/'},...input.pages.map(page=>({path:page.path})),...input.products.filter(product=>product.releaseStatus==='ready').map(product=>({path:`/${product.category}/${product.slug}/`}))];
  for(const post of input.posts){
    if(post.status!=='published'||post.reviewStatus!=='approved'||!post.publishedAt||!Number.isFinite(Date.parse(post.publishedAt)))continue;
    entries.push({path:`/blog/${post.slug}/`,...(Number.isFinite(Date.parse(post.updatedAt))?{lastModified:post.updatedAt}:{})});
  }
  return [...new Map(entries.map(entry=>[entry.path,entry])).values()];
}
