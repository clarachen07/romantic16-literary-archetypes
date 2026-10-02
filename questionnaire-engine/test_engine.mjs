import fs from 'node:fs';
import assert from 'node:assert/strict';
import {objective, estimate, scoreTraits, analyze, nextQuestion, nextAdaptive} from './engine.mjs';
const bank = JSON.parse(fs.readFileSync(new URL('./question_bank.json', import.meta.url), 'utf8'));
const seed = 'test-session-8461';
let tests = 0;
function test(name, fn) { fn(); tests++; console.log(`PASS ${name}`); }
const allAnchors = Object.fromEntries(bank.anchors.map(q => [q.id, 3]));
const allCore = Object.fromEntries(bank.core_scenes.map(q => [q.id, {best:q.options[0].type, worst:q.options[3].type}]));
const base = {anchors:allAnchors, core:allCore, adaptive:[]};
test('all 16 types have exactly two core exposures; graph is connected', () => {
  const counts = Object.fromEntries(bank.types.map(t => [t.code, 0]));
  const graph = Object.fromEntries(bank.types.map(t => [t.code, new Set()]));
  bank.core_scenes.forEach(q => q.options.forEach(o => {counts[o.type]++; q.options.forEach(v => {if(v.type!==o.type)graph[o.type].add(v.type)});}));
  assert(Object.values(counts).every(x=>x===2)); assert(Object.values(graph).every(x=>x.size===6));
  const visited = new Set(); const todo = [bank.types[0].code];
  while(todo.length) { const x=todo.pop(); if(visited.has(x))continue; visited.add(x); todo.push(...graph[x]); }
  assert.equal(visited.size,16);
});
test('empty responses are uninformative, zero scores', () => { const x=estimate(bank,{},seed); assert(x.ranking.every(t=>t.score===0)); });
test('reverse scoring and missing values',()=>{
  const x=scoreTraits(bank,{anchors:{T01:5,T06:1,T11:5,T02:null}});
  assert.equal(x.E.mean,5); assert.equal(x.E.position,100); assert.equal(x.C.usable,false);
});
test('best/worst cannot be the same or outside the block',()=>{
  assert.throws(()=>estimate(bank,{core:{S1:{best:'FREE',worst:'FREE'}}},seed));
  assert.throws(()=>estimate(bank,{core:{S1:{best:'FREE',worst:'HOME'}}},seed));
});
test('analytic gradient matches central finite differences',()=>{
  const input={...base,adaptive:[{a:'FREE',b:'MIND',format:'behavior',answer:'a'}]};
  const u=bank.types.map((_,i)=>0.1*Math.sin(i)); const f=objective(bank,input,u); const h=1e-5;
  for(let i=0;i<u.length;i++){ const a=[...u], b=[...u]; a[i]+=h;b[i]-=h; const d=(objective(bank,input,a).value-objective(bank,input,b).value)/(2*h); assert(Math.abs(d-f.grad[i])<1e-6); }
});
test('optimizer converges and utilities sum to zero',()=>{
  const x=estimate(bank,base,seed); assert(x.gradientNorm<1e-6); assert(Math.abs(x.ranking.reduce((s,t)=>s+t.score,0))<1e-6);
});
test('traits do not secretly change literary motive classification',()=>{
  const x=estimate(bank,base,seed); const y=estimate(bank,{...base,anchors:Object.fromEntries(bank.anchors.map(q=>[q.id,5]))},seed);
  assert.deepEqual(x.ranking,y.ranking);
});
test('neither adds no utility evidence',()=>{
  const x=estimate(bank,base,seed);const y=estimate(bank,{...base,adaptive:[{a:'FREE',b:'MIND',format:'contrast',answer:'neither'}]},seed);
  assert.deepEqual(x.ranking,y.ranking);
});
test('choosing A increases A-minus-B utility',()=>{
  const x=estimate(bank,base,seed); const y=estimate(bank,{...base,adaptive:[{a:'FREE',b:'MIND',format:'behavior',answer:'a'}]},seed);
  assert(y.utilities.FREE-y.utilities.MIND > x.utilities.FREE-x.utilities.MIND);
});
test('routing starts at anchors and skip advances the item',()=>{
  assert.equal(nextQuestion(bank,{},seed).id,'T01'); assert.equal(nextQuestion(bank,{anchors:{T01:null}},seed).id,'T02');
});
test('second adaptive item introduces an unseen challenger',()=>{
  const first=nextAdaptive(bank,base,seed);
  const input={...base,adaptive:[{...first,answer:'equal'}]}; const second=nextAdaptive(bank,input,seed);
  assert.equal(second.format,'behavior'); assert([second.a,second.b].some(t=>![first.a,first.b].includes(t)));
});
test('complete neutral/skipped case has no manufactured primary type',()=>{
  let input={anchors:allAnchors,core:Object.fromEntries(bank.core_scenes.map(q=>[q.id,null])),adaptive:[]};
  for(let i=0;i<4;i++){const q=nextAdaptive(bank,input,seed); input.adaptive.push({...q,answer:'neither'});}
  const x=analyze(bank,input,seed); assert.equal(x.status,'insufficient');assert.equal(x.primary,null);assert.equal(nextAdaptive(bank,input,seed),null);
});
test('all 120 type pairs have complete fallback wording',()=>{
  let n=0;for(let i=0;i<bank.types.length;i++)for(let j=i+1;j<bank.types.length;j++){
    const a=bank.types[i].code,b=bank.types[j].code;
    assert(bank.adaptive.cost_options[a]&&bank.adaptive.cost_options[b]&&bank.adaptive.behavior_options[a]&&bank.adaptive.behavior_options[b]);n++;
  }assert.equal(n,120);
});
test('100 synthetic paths stop at 25–27 answers without duplicate pair-format',()=>{
  let rng=7919; const rand=()=>((rng=Math.imul(rng,1664525)+1013904223>>>0)/2**32);
  for(let run=0;run<100;run++){
    const input={anchors:allAnchors,core:{},adaptive:[]};
    for(const q of bank.core_scenes){const opts=q.options.map(o=>o.type);const b=Math.floor(rand()*4);const rem=opts.filter((_,i)=>i!==b); input.core[q.id]={best:opts[b],worst:rem[Math.floor(rand()*3)]};}
    for(let i=0;i<4;i++){const q=nextAdaptive(bank,input,`synthetic-${run}`);if(!q)break; input.adaptive.push({...q,answer:['a','b','equal','neither'][Math.floor(rand()*4)]});}
    assert(input.adaptive.length>=2&&input.adaptive.length<=4);assert.equal(nextAdaptive(bank,input,`synthetic-${run}`),null);
  }
});
console.log(`\n${tests} engineering checks passed. No human psychometric validity has been tested.`);
