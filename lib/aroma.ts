export const aromaFamilies = [
  {id:'citrus',label:'Citrus',zh:'柑橘',hint:'Bright peel and zest directions',color:'#e7c96b'},
  {id:'floral',label:'Floral',zh:'花香',hint:'Petal-like and rounded floral directions',color:'#caa0ad'},
  {id:'herbal',label:'Herbal',zh:'草本',hint:'Green leaf and aromatic herb directions',color:'#9bad80'},
  {id:'minty',label:'Fresh & minty',zh:'清新薄荷',hint:'Cool, fresh and camphor-like directions',color:'#93b5ac'},
  {id:'woody',label:'Woody',zh:'木质',hint:'Dry wood and forest-like directions',color:'#b39a78'},
  {id:'resinous',label:'Resinous',zh:'树脂',hint:'Balsamic and resin-like directions',color:'#c3a66b'},
  {id:'spicy',label:'Spicy',zh:'辛香',hint:'Warm spice and aromatic seed directions',color:'#c28f73'},
  {id:'earthy',label:'Earthy',zh:'大地',hint:'Root-like and deep earthy directions',color:'#9c9c77'},
] as const;
export type AromaFamily=typeof aromaFamilies[number]['id'];
export type AromaItem={name:string;aromaFamily?:string;aromaNotes?:string[]};
export const aromaLabel=(id?:string)=>aromaFamilies.find(f=>f.id===id)?.label||'Botanical selection';
export function filterAromaItems<T extends AromaItem>(items:T[],query='',family='',sort='name'):T[]{
  const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(p=>{
    if(family&&p.aromaFamily!==family)return false;
    const text=[p.name,aromaLabel(p.aromaFamily),...(p.aromaNotes||[])].join(' ').toLowerCase();
    return terms.every(t=>text.includes(t));
  }).sort((a,b)=>{
    if(sort==='family'){const order=aromaFamilies.findIndex(f=>f.id===a.aromaFamily)-aromaFamilies.findIndex(f=>f.id===b.aromaFamily);if(order)return order;}
    return a.name.localeCompare(b.name,'en');
  });
}
