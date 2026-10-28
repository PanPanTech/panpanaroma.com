import test from 'node:test';
import assert from 'node:assert/strict';
import {filterBlogItems} from '../lib/blog-filter.ts';
const items=[{title:'Sample comparison log',excerpt:'Connect a sample to its documents.',category:'quality'},{title:'Private label artwork',excerpt:'Choose your label route.',category:'private-label'},{title:'Essential oil RFQ checklist',excerpt:'Prepare the quantity and packaging.',category:'sourcing'}];
test('blog search combines title and excerpt without case sensitivity',()=>assert.equal(filterBlogItems(items,'SAMPLE documents')[0].category,'quality'));
test('blog category restricts the selected topic',()=>assert.equal(filterBlogItems(items,'','private-label')[0].title,'Private label artwork'));
test('search applies inside a category and can produce an empty result',()=>assert.equal(filterBlogItems(items,'sample','sourcing').length,0));
test('unknown query produces no unrelated entries',()=>assert.deepEqual(filterBlogItems(items,'no-such-phrase'),[]));
test('clearing blog controls restores the source list without mutation',()=>{const before=JSON.stringify(items);assert.equal(filterBlogItems(items).length,items.length);assert.equal(JSON.stringify(items),before);});
