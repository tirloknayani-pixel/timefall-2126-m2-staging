export type Collider={minX:number;maxX:number;minZ:number;maxZ:number};
export const SPEED=4.4, TICK_MS=50, SNAPSHOT_MS=100, ARRIVAL_MS=4500;
export const COLORS=['#62edff','#ffbd72','#b896ff','#8df0a6','#ff8fab','#f4ea91'];
export const BUILDINGS=[[-15,-9,9,14,12],[15,-9,9,19,12],[-16,-27,10,22,12],[16,-29,10,15,15],[-15,15,8,9,7],[16,14,9,12,8]];
const rect=(x:number,z:number,w:number,d:number):Collider=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
export const COLLIDERS:Collider[]=[...BUILDINGS.map(([x,z,w,,d])=>rect(x,z,w,d)),...([[-7,-12],[7,-32],[-9,-29]].map(([x,z])=>rect(x,z,2,1.1))),...[-8,8].map(x=>rect(x,0,1.1,1.4)),...([[-5,-17],[4,-25],[-4,-36]].map(([x,z])=>rect(x,z,1.5,1.3))),...[-8.5,8.5].flatMap(x=>[-7,-22,-37].map(z=>rect(x,z,.24,.24))),rect(0,-7,1.35,1.1)];
export const spawnPosition=(slot:number)=>({x:[-1.7,1.7,-3.1,3.1,-1.7,1.7][slot],z:[11,11,12,12,14,14][slot]});
