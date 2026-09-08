import {chromium} from "playwright";
import {writeFile} from "node:fs/promises";
import assert from "node:assert/strict";
const browser=await chromium.connectOverCDP(process.env.MDL_CDP || "http://127.0.0.1:9224");
const page=browser.contexts()[0].pages()[0];
await page.addInitScript(()=>{
 if(window.__v2Probe)return;
 const pending=new Set(),timestamps=[];
 let maxPending=0,commits=0,renderers=0;
 const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
 window.requestAnimationFrame=callback=>{
  const id=request(t=>{pending.delete(id);timestamps.push(t);if(timestamps.length>200)timestamps.shift();callback(t);});
  pending.add(id);maxPending=Math.max(maxPending,pending.size);return id;
 };
 window.cancelAnimationFrame=id=>{pending.delete(id);cancel(id);};
 window.__REACT_DEVTOOLS_GLOBAL_HOOK__={supportsFiber:true,inject(){return ++renderers;},onCommitFiberRoot(){commits++;},onCommitFiberUnmount(){}};
 window.__v2Probe=()=>{const a=timestamps.slice(-121),intervals=a.slice(1).map((t,i)=>t-a[i]);const avg=intervals.reduce((s,v)=>s+v,0)/intervals.length;return{fps:1000/avg,averageMs:avg,worstMs:Math.max(...intervals),activeLoops:pending.size,maxPending,commits,renderers};};
});
if(!await page.evaluate(()=>typeof window.__v2Probe==="function"))await page.reload();
await page.getByRole("button",{name:"Reset",exact:true}).click();
await page.getByRole("button",{name:/02.*DAMPING/}).click();
await page.getByRole("button",{name:"Play",exact:true}).click();
console.log("Waiting for actual native focus");
await page.waitForFunction(()=>!document.querySelector(".playback").textContent.includes("Suspended"),{},{timeout:60000});
await page.waitForTimeout(100);
const baseline=await page.evaluate(()=>window.__v2Probe());
await page.waitForTimeout(10000);
const normal=await page.evaluate(()=>({...window.__v2Probe(),focused:document.hasFocus(),visibility:document.visibilityState}));
assert(normal.focused,"Native window must be active for a valid measurement");
assert(normal.renderers>0 && baseline.commits>0,"Production React commit hook must be verified");
normal.reactCommitsDuringPlayback=normal.commits-baseline.commits;
await page.getByRole("button",{name:"Pause",exact:true}).click();
await page.getByRole("slider",{name:"Scrub simulation time"}).fill("0.2");
async function dragMeasure(selector){
 await page.locator(selector).scrollIntoViewIfNeeded();
 await page.evaluate(selector=>{
  const input=document.querySelector(selector),body=document.querySelector(".carriage");
  let start=null;const times=[];
  const listener=()=>{start=performance.now();};
  const observer=new MutationObserver(()=>{if(start!==null){times.push(performance.now()-start);start=null;}});
  input.addEventListener("input",listener);observer.observe(body,{attributes:true,attributeFilter:["transform"]});
  window.__endV2Latency=()=>{input.removeEventListener("input",listener);observer.disconnect();times.sort((a,b)=>a-b);return{samples:times.length,p95Ms:times[Math.floor(.95*times.length)],maxMs:times.at(-1),method:"native packaged WebView2 input-to-SVG mutation; not optical latency"};};
 },selector);
 const box=await page.locator(selector).boundingBox();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();
 const start=Date.now();let i=0;
 while(Date.now()-start<10000){await page.mouse.move(box.x+box.width*(.5+.4*Math.sin(i++/12)),box.y+box.height*.5);await page.waitForTimeout(16);}
 await page.mouse.up();return page.evaluate(()=>window.__endV2Latency());
}
const latency=await dragMeasure(".damping-controls .instrument-slider");
await page.getByRole("button",{name:"Reset",exact:true}).click();
await page.getByRole("button",{name:"Phase Space",exact:true}).click();
const scrub=await dragMeasure(".timeline-scrubber");
await page.getByRole("button",{name:"Reset",exact:true}).click();
const beforeCycles=await page.evaluate(()=>({probe:window.__v2Probe(),nodes:document.querySelectorAll("*").length}));
await page.evaluate(async()=>{
 for(let i=0;i<1000;i++){
  document.querySelector('button[aria-label="Play"]').click();await new Promise(r=>setTimeout(r,0));
  document.querySelector('button[aria-label="Pause"]').click();await new Promise(r=>setTimeout(r,0));
 }
});
const afterCycles=await page.evaluate(()=>({probe:window.__v2Probe(),nodes:document.querySelectorAll("*").length,paused:!!document.querySelector('button[aria-label="Play"]')}));
console.log(JSON.stringify({normal,latency,scrub,beforeCycles,afterCycles},null,2));
assert(normal.activeLoops===1);assert(normal.reactCommitsDuringPlayback===0);assert(afterCycles.probe.activeLoops===0);assert(latency.samples>20 && scrub.samples>20);
const result={environment:"Packaged Tauri/WebView2 0.2.0 with validation-only RAF and verified React commit hooks",normal,latency,scrub,beforeCycles,afterCycles,method:"RAF wrapper tracks application requests without adding a measurement loop. Hooks are injected through CDP for QA only; not shipped in the application."};
await writeFile("docs/validation/native-v2-performance.json",JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
