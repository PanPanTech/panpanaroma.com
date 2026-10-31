import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createHash} from 'node:crypto';
const site=JSON.parse(fs.readFileSync('content/site.json','utf8'));
const products=JSON.parse(fs.readFileSync('content/catalog.json','utf8')).products;
const blog=JSON.parse(fs.readFileSync('content/blog.json','utf8')).posts;
const manifest=JSON.parse(fs.readFileSync('public/images/manifest.json','utf8'));
const imagePolicy=JSON.parse(fs.readFileSync('content/image-policy.json','utf8'));
const normalizeBrand=value=>String(value||'').normalize('NFKC').replace(/\s+/gu,'').toLowerCase();
assert.equal(imagePolicy.clientDate,'2026-10-27','image policy decision date');
assert.equal(imagePolicy.preferredBrand,'MIYUKI','preferred image brand');
assert.equal(imagePolicy.preferredBottleSize,'10ml','preferred bottle size');
assert.ok(Array.isArray(imagePolicy.blockedBrands)&&imagePolicy.blockedBrands.length,'blocked image brands');
const blockedBrands=imagePolicy.blockedBrands.map(normalizeBrand);
for(const brand of ['MUMIANHUA','木棉花'])assert.ok(blockedBrands.includes(normalizeBrand(brand)),brand+' remains blocked');
assert.ok(Array.isArray(imagePolicy.blockedImageSha256)&&imagePolicy.blockedImageSha256.length>=36,'known blocked image hashes retained');
for(const hash of imagePolicy.blockedImageSha256)assert.match(hash,/^[a-f0-9]{64}$/,'blocked image SHA256');
const blockedHashes=new Set(imagePolicy.blockedImageSha256);
const pending=products.filter(p=>p.releaseStatus!=='ready');
for(const p of products){if(p.releaseStatus==='ready'){assert.equal(p.identityStatus,'verified',p.slug);for(const key of ['botanicalName','inci','extraction','origin'])assert.ok(p[key],`${p.slug}: ${key}`);}assert.ok(!('sourceOfferIds' in p)&&!('notes' in p),p.slug+' internal metadata');}
const publicRoot=path.resolve('public');
const assets=new Map((manifest.assets||[]).map(asset=>[asset.file,asset]));
assert.equal(assets.size,(manifest.assets||[]).length,'unique image manifest paths');
let publicFilesScanned=0;
// Scan every regular public file, including unreferenced or renamed images.
// A filename or missing manifest entry must not bypass the image prohibition.
function checkPublicFiles(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  assert.ok(!entry.isSymbolicLink(),'public assets must not contain unscanned symbolic links: '+path.relative(publicRoot,file));
  if(entry.isDirectory()){checkPublicFiles(file);continue;}
  if(!entry.isFile())continue;
  const hash=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.ok(!blockedHashes.has(hash),'blocked brand image in public assets: '+path.relative(publicRoot,file));
  publicFilesScanned++;
 }
}
checkPublicFiles(publicRoot);
function checkImage(file){
 assert.ok(typeof file==='string'&&file.startsWith('/')&&!file.startsWith('//'),'local image path');
 const local=path.resolve(publicRoot,'.'+file);
 assert.ok(local.startsWith(publicRoot+path.sep)&&fs.existsSync(local),file+' exists');
 const asset=assets.get(file);assert.ok(asset?.alt&&asset.caption,file+' image description');
 assert.ok(['photograph','catalogue-image','illustration'].includes(asset.kind),file+' image type');
 assert.ok(Object.hasOwn(asset,'brand'),file+' explicit image brand');
 assert.ok(asset.kind==='illustration'?asset.brand===null||typeof asset.brand==='string':typeof asset.brand==='string'&&asset.brand.trim(),file+' image brand value');
 assert.ok(!blockedBrands.some(brand=>normalizeBrand(asset.brand).includes(brand)),file+' blocked image brand');
 assert.ok(!Object.keys(asset).some(key=>/sourceRelativePath|sourceAbsolutePath|sourceOfferIds/i.test(key)),file+' no internal source paths');
 return asset;
}
for(const asset of assets.values())checkImage(asset.file);
for(const post of blog){if(post.status==='published'){assert.equal(post.reviewStatus,'approved',post.slug);assert.ok(post.publishedAt&&Number.isFinite(Date.parse(post.publishedAt)),post.slug+' publication date');}checkImage(post.image);}
for(const [slug,file] of Object.entries(manifest.productImages||{})){assert.ok(products.some(p=>p.slug===slug),slug+' known product');checkImage(file);}
if(manifest.productFallback){assert.equal(checkImage(manifest.productFallback).role,'packaging-option','generic image clearly identified as packaging');}
if(site.publicLaunchApproved){assert.equal(site.origin,'https://www.panpanaroma.com');assert.equal(site.name,'PanPan Aroma');for(const key of ['hero','packaging','sets'])checkImage(manifest[key]);}
console.log(JSON.stringify({publicLaunchApproved:site.publicLaunchApproved,products:products.length,pendingEnquiryCandidates:pending.length,publishedArticles:blog.filter(p=>p.status==='published').length,productPhotoMappings:Object.keys(manifest.productImages||{}).length,catalogueImages:[...assets.values()].filter(asset=>asset.kind==='catalogue-image').length,photographs:[...assets.values()].filter(asset=>asset.kind==='photograph').length,imagePolicyDate:imagePolicy.clientDate,blockedImageHashes:blockedHashes.size,publicFilesScanned,note:'Images are reviewed independently of supply specifications. Pending products remain sourcing enquiries, noindex, and excluded from product discovery; photographs do not promote unverified specifications.'},null,2));
