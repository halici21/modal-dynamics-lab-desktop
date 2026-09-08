import {createSdof, DEFAULT_SDOF, CRITICAL_TOLERANCE} from "../src/physics/sdof.ts";
import {writeFile} from "node:fs/promises";
import assert from "node:assert/strict";
const cases={D:{...DEFAULT_SDOF,damping:4},E:{...DEFAULT_SDOF,damping:20},F:{...DEFAULT_SDOF,damping:40},G:{mass:2,stiffness:0,damping:4,x0:.1,v0:.5},H:{...DEFAULT_SDOF,damping:0}};
const references={};
for(const [id,p]of Object.entries(cases)){
 const s=createSdof(p);references[id]={parameters:p,omega:s.omega,frequency:s.frequency,zeta:s.zeta,criticalDamping:s.criticalDamping,dampedOmega:s.dampedOmega,roots:s.roots,regime:s.regime,samples:[0,.1,.2,.37,1,3].map(t=>s.sample(t))};
}
let samples=0,maxResidual=0,maxEnergyIncrease=0,maxDerivativeError=0;
const started=performance.now();
for(const mass of [.25,1,10])for(const stiffness of [0,.01,100,500])for(const z of [0,1e-10,.1,.9,1-1e-9,1,1+1e-9,2,10])for(const x0 of [-.2,0,.2])for(const v0 of [-1,0,1]){
 const damping=stiffness?2*z*Math.sqrt(mass*stiffness):z,s=createSdof({mass,stiffness,damping,x0,v0});let energy=s.energy;
 for(const t of [.001,.01,.1,.5,2,8]){const r=s.sample(t),h=1e-6;
  assert(Object.values(r).every(Number.isFinite));assert(r.dampingForce*r.v<=0);
  maxResidual=Math.max(maxResidual,Math.abs(r.residual));maxEnergyIncrease=Math.max(maxEnergyIncrease,r.total-energy);energy=r.total;
  maxDerivativeError=Math.max(maxDerivativeError,Math.abs((s.sample(t+h).total-s.sample(t-h).total)/(2*h)+r.power)/Math.max(1,r.power));samples++;
 }
}
assert(maxResidual<1e-10);assert(maxEnergyIncrease<1e-10);assert(maxDerivativeError<1e-4);
const boundaries=[-2e-8,-.5e-8,-1e-12,0,1e-12,.5e-8,2e-8].map(eps=>{const s=createSdof({...DEFAULT_SDOF,damping:20*(1+eps)});return{epsilon:eps,zeta:s.zeta,regime:s.regime,at02:s.sample(.2)};});
const integrals=[0,4,20,40].map(damping=>{const s=createSdof({...DEFAULT_SDOF,damping}),n=10000,h=2/n;let sum=0;for(let i=0;i<=n;i++)sum+=(i===0||i===n?1:i%2?4:2)*s.sample(i*h).power;const integral=sum*h/3,loss=s.sample(2).dissipated;assert(Math.abs(integral-loss)<1e-9);return{damping,integral,loss,error:integral-loss};});
const result={references,sweep:{samples,maxResidual,maxEnergyIncrease,maxRelativeEnergyDerivativeError:maxDerivativeError,elapsedMs:performance.now()-started},criticalTolerance:CRITICAL_TOLERANCE,boundaries,independentSimpsonIntegrals:integrals};
await writeFile("docs/validation/v2-numerical.json",JSON.stringify(result,null,2));console.log(JSON.stringify(result.sweep,null,2));
