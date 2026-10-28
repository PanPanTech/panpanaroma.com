export type BlogCategory={id:string;label:string;description:string};
export type BlogCardItem={slug:string;href:string;title:string;excerpt:string;category:string;kind:'article'|'guide';status:'draft'|'published';publishedAt:string|null;updatedAt:string|null;readMinutes:number};

// Keep discovery independent of publication and routing: the server supplies only the visible entries.
export function filterBlogItems(items:BlogCardItem[],query='',category=''){
  const words=query.trim().toLocaleLowerCase('en').split(/\s+/).filter(Boolean);
  return items.filter(item=>(!category||item.category===category)&&words.every(word=>`${item.title} ${item.excerpt}`.toLocaleLowerCase('en').includes(word)));
}
