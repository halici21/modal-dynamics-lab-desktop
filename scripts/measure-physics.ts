import { performance } from 'node:perf_hooks';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createSdof, DEFAULT_SDOF } from '../src/physics/sdof';
import { chain, rayleigh } from '../src/physics/systems';
import { solveModal, modalResponse } from '../src/physics/modal';
import { directFRF, modalFRF } from '../src/physics/frequency';
import { uniformFE, assembleFE, solveFE } from '../src/physics/fem';
import { responseSpectrum } from '../src/physics/spectra';
const out:Record<string,unknown>={environment:'Node development benchmark; warmed p50/p95 wall time, ms per operation',date:new Date().toISOString()};
function measure(name:string,fn:()=>unknown,count=100){for(let i=0;i<10;i++)fn();const samples=[];for(let i=0;i<count;i++){const t=performance.now();fn();samples.push(performance.now()-t);}samples.sort((a,b)=>a-b);out[name]={p50:samples[Math.floor(count*.5)],p95:samples[Math.floor(count*.95)],max:samples.at(-1),count};}
const sdof=createSdof({...DEFAULT_SDOF,damping:4});let time=0;measure('dampedSdofSample',()=>sdof.sample((time++%10000)/1000),10000);
for(const n of [2,3,10]){const s=chain(Array(n).fill(1),Array(n+1).fill(100));measure(n+'DOFModalSolve',()=>solveModal(s),1000);}
const s=chain(Array(10).fill(1),Array(11).fill(100));s.C=rayleigh(s.M,s.K,.2,.002);const modal=solveModal(s),response=modalResponse(modal,Array(10).fill(.01),Array(10).fill(0));measure('10DOFSample',()=>response.sample((time++%1000)/100),10000);
measure('10DOFDirectFRF201Points',()=>Array.from({length:201},(_,i)=>directFRF(s,i*.2)),20);
measure('10DOFModalFRF201Points',()=>Array.from({length:201},(_,i)=>modalFRF(modal,i*.2)),20);
measure('beam8Assembly',()=>assembleFE(uniformFE('beam',8)),200);
measure('beam8ModalSolve',()=>solveFE(uniformFE('beam',8)),200);
const acc=Array.from({length:151},(_,i)=>Math.sin(i*.2));measure('spectrum9Oscillators',()=>responseSpectrum(acc,.02,[.1,.2,.3,.5,.75,1,1.5,2,3],.05,8),20);
mkdirSync('docs/validation/full-physics-r1',{recursive:true});writeFileSync('docs/validation/full-physics-r1/performance.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
