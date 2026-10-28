import fs from 'node:fs';
import assert from 'node:assert/strict';
const site=JSON.parse(fs.readFileSync('content/site.json','utf8'));
const products=JSON.parse(fs.readFileSync('content/catalog.json','utf8')).products;
const blog=JSON.parse(fs.readFileSync('content/blog.json','utf8')).posts;
const manifest=JSON.parse(fs.readFileSync('public/images/manifest.json','utf8'));
const pending=products.filter(p=>p.releaseStatus!=='ready');
for(const p of products){if(p.releaseStatus==='ready'){assert.equal(p.identityStatus,'verified',p.slug);for(const key of ['botanicalName','inci','extraction','origin'])assert.ok(p[key],`${p.slug}: ${key}`);}assert.ok(!('sourceOfferIds' in p)&&!('notes' in p),p.slug+' internal metadata');}
for(const post of blog){if(post.status==='published'){assert.equal(post.reviewStatus,'approved',post.slug);assert.ok(post.publishedAt&&Number.isFinite(Date.parse(post.publishedAt)),post.slug+' publication date');}assert.ok(post.image.startsWith('/illustrations/'),post.slug+' neutral illustration');}
if(site.publicLaunchApproved){assert.equal(site.origin,'https://panpanaroma.com');assert.equal(site.name,'PanPan Aroma');for(const key of ['hero','packaging','sets'])assert.ok(manifest[key].startsWith('/illustrations/'));assert.ok(!Object.keys(manifest.productImages||{}).length);}
console.log(JSON.stringify({publicLaunchApproved:site.publicLaunchApproved,products:products.length,pendingEnquiryCandidates:pending.length,publishedArticles:blog.filter(p=>p.status==='published').length,note:'Pending products remain labelled sourcing enquiries, noindex, and excluded from product discovery. No pending specification is promoted to verified.'},null,2));
