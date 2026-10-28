import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.env.MIYA_QA_ORIGIN||'http://127.0.0.1:5183';
const raw=fs.readFileSync('content/catalog.json','utf8'),products=JSON.parse(raw).products,manifest=JSON.parse(fs.readFileSync('public/images/manifest.json','utf8'));
assert.equal(products.length,55);assert.equal(new Set(products.map(p=>p.id)).size,55);assert.equal(new Set(products.map(p=>p.slug)).size,55);
assert.equal(products.filter(p=>p.category==='essential-oils').length,46);assert.equal(products.filter(p=>p.category==='carrier-oils').length,6);assert.equal(products.filter(p=>p.category==='botanical-enquiries').length,3);
assert.ok(products.every(p=>p.releaseStatus==='draft'&&p.identityStatus==='pending'));assert.ok(!raw.includes('sourceRefs'));assert.ok(!/[A-Z]:\\/i.test(raw));
for(const asset of manifest.assets)assert.ok(fs.statSync('public'+asset.file).size>0,asset.file);
const results=[];
for(const family of ['citrus','floral','herbal','minty','woody','resinous','spicy','earthy']){
 const response=await fetch(origin+'/essential-oils/?aroma='+family);assert.equal(response.status,200);const html=await response.text();const expected=products.filter(p=>p.category==='essential-oils'&&p.aromaFamily===family).length;
 assert.equal((html.match(/<article class="product-card"/g)||[]).length,expected,'SSR filter '+family);assert.ok(html.includes('aria-pressed="true"'));
 results.push({family,count:expected});
}
const generic=products.find(p=>p.category==='essential-oils'&&!manifest.productImages[p.slug]);assert.ok(generic);
const illustration=await(await fetch(origin+`/${generic.category}/${generic.slug}/`)).text();assert.ok(illustration.includes('not a product photograph'));assert.ok(!illustration.includes('src=""'));
for(const slug of ['rose','jasmine','sandalwood']){const html=await(await fetch(origin+'/botanical-enquiries/'+slug+'/')).text();assert.ok(html.includes('Botanical Sourcing Enquiry'));assert.ok(html.includes('noindex'));}
const request=await(await fetch(origin+'/request-quote/?product=Bergamot%20Essential%20Oil&source=%2Fessential-oils%2Fbergamot%2F')).text();assert.ok(request.includes('value="Bergamot Essential Oil"'));
fs.mkdirSync('outputs',{recursive:true});fs.writeFileSync('outputs/qa-expansion-v2.json',JSON.stringify({passed:true,products:55,essentialOilCandidates:46,specialtyEnquiries:3,carrierOils:6,aromaFamilies:results,verifiedImageMappings:Object.keys(manifest.productImages).length,illustrationFallback:'passed',specialtyClassification:'passed',productPrefill:'passed',sourcePathsNotPublished:true},null,2));
console.log(JSON.stringify({passed:true,products:55,aromaFamilies:8,filteredCategoryPages:results.length}));
