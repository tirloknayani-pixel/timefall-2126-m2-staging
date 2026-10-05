import test from 'node:test';import assert from 'node:assert/strict';import {move,blocked,bounds,radius} from '../src/collision.js';
const boxes=[{minX:-1,maxX:1,minZ:-8,maxZ:-6}];
test('free movement preserves displacement',()=>{const p=move({x:0,z:11},2,-3,boxes);assert.ok(Math.abs(p.x-2)<1e-10&&Math.abs(p.z-8)<1e-10);});
test('long displacement cannot tunnel through beacon',()=>{const p=move({x:0,z:0},0,-20,boxes);assert.ok(p.z>=-6+radius-.001);assert.equal(blocked(p.x,p.z,boxes),false);});
test('boundaries stop movement on all sides',()=>{for(const [dx,dz] of [[1000,0],[-1000,0],[0,1000],[0,-1000]]){const p=move({x:3,z:1},dx,dz,[]);assert.ok(p.x>=bounds.minX+radius&&p.x<=bounds.maxX-radius&&p.z>=bounds.minZ+radius&&p.z<=bounds.maxZ-radius);}});
test('slides along walls instead of stopping both axes',()=>{const p=move({x:1.45,z:-7},-.5,-.5,boxes);assert.ok(p.z<-7.4);assert.ok(p.x>1.4);});
test('rounded collision corners permit physically clear positions',()=>{assert.equal(blocked(1.35,-5.65,boxes),false);assert.equal(blocked(1.15,-5.85,boxes),true);});
