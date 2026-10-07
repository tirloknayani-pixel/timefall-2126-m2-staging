import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {resolve} from 'node:path';
const base=process.env.BASE_URL;if(!base)throw new Error('BASE_URL required');const executablePath=process.env.CHROMIUM_PATH||resolve('../browser-runtime/chromium');const checks=[],errors=[],browsers=[];const pass=(n,c=true)=>{assert.ok(c,n);checks.push(n);console.log('PASS',n)};const launch=()=>chromium.launch({executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const health=await fetch(base+'/health');pass('M6 public /health returns 200',health.ok);const h=await health.json();pass('M6 public health preserves authoritative milestone',h.multiplayer===true&&h.simulationHz===20&&h.snapshotHz===10);
 for(const mobile of [false,true]){const b=await launch();browsers.push(b);const c=await b.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:960,height:640}});const p=await c.newPage();p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p.goto(base,{waitUntil:'networkidle'});if(mobile){
  pass('Touch viewport exposes touch mode',await p.evaluate(()=>document.body.classList.contains('touch')));
  await p.locator('#nickname').fill('Touch');await p.locator('#submitRoom').click();await p.waitForFunction(()=>!document.querySelector('#lobby')?.hasAttribute('hidden'));await p.locator('#help').click();
  const boxes=await p.evaluate(()=>{const ids=['helpDialog','joystick','interaction'];return Object.fromEntries(ids.map(id=>{const e=document.getElementById(id);if(!e)return[id,null];const r=e.getBoundingClientRect();return[id,{l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}]}))});pass('Mobile field guide fits viewport',boxes.helpDialog&&boxes.helpDialog.l>=0&&boxes.helpDialog.r<=390&&boxes.helpDialog.b<=844);
  pass('Mobile settings are touch-sized',await p.locator('#muteQuick').evaluate(e=>e.getBoundingClientRect().height>=38));
 }else{
  pass('M6 root title is release polish',await p.title()==='TIMEFALL: 2126 — M6 Release Polish');
  await p.locator('#nickname').fill('Desktop');await p.locator('#submitRoom').click();await p.waitForFunction(()=>!document.querySelector('#lobby')?.hasAttribute('hidden'));await p.locator('#help').click();
  pass('Field Guide onboarding is reopenable',await p.locator('#helpDialog').evaluate((e)=>e.hasAttribute('open'))&&await p.locator('.tutorial-cards').isVisible());
  await p.locator('#masterVolume').fill('0.4');await p.locator('#ambienceVolume').fill('0.2');await p.locator('#sfxVolume').fill('0.3');pass('Independent audio sliders update client settings',await p.evaluate(()=>window.__M6.audio.master===.4&&window.__M6.audio.ambience===.2&&window.__M6.audio.sfx===.3));
  await p.locator('#muteAudio').check();pass('Mute control updates accessible audio state',await p.evaluate(()=>window.__M6.audio.muted)&&await p.locator('#muteQuick').getAttribute('aria-pressed')==='true');await p.locator('#muteQuick').click();pass('Quick audio control unmutes',!await p.evaluate(()=>window.__M6.audio.muted));
  await p.locator('#reduceMotion').check();pass('Reduced motion toggles semantic body state',await p.evaluate(()=>window.__M6.reducedMotion&&document.body.classList.contains('reduced-motion')));
  await p.locator('#cameraSensitivity').fill('1.4');pass('Camera sensitivity setting applies',await p.evaluate(()=>window.__M6.cameraSensitivity===1.4));
  await p.locator('#closeHelp').click();await p.keyboard.press('Tab');pass('Keyboard navigation produces a focused control',await p.evaluate(()=>document.activeElement instanceof HTMLButtonElement||document.activeElement instanceof HTMLInputElement));
  await p.context().setOffline(true);await p.waitForTimeout(1200);pass('Disconnect shows reconnecting UX',await p.locator('#connectionBanner').isVisible());await p.context().setOffline(false);await p.waitForFunction(()=>window.__M6.network.connected,{timeout:15000});pass('Reconnect recovers same client session',await p.evaluate(()=>window.__M6.network.connected));
 }
 }
 pass('No serious browser console/runtime errors',errors.length===0);console.log('M6_BROWSER_SUMMARY',JSON.stringify({passed:checks.length,failed:0,errors}));
}catch(e){console.error('M6_BROWSER_FAILURE',e);process.exitCode=1}finally{await Promise.all(browsers.map(b=>b.close().catch(()=>{})));}
