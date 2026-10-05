import type {Collider} from './world-map.js';
/** M5 tuning: walking remains free. Two operators suffice for every room size. */
export const PORTAL={range:2.6,chargeMs:90_000,activeMs:30_000,energyCost:20,repairCost:2,damageMs:2500,damage:15,highAlert:40,syncMs:15_000} as const;
export const PORTAL_STATIONS={core:{x:0,z:-118},west:{x:-5,z:-124},east:{x:5,z:-124},repair:{x:-6,z:-132},security:{x:6,z:-132},decision:{x:0,z:-138},exit:{x:0,z:-144}};
export const PORTAL_SUPPLIES=[{id:'portal-cell',x:-6,z:-116,kind:'energy',amount:20},{id:'portal-material',x:6,z:-116,kind:'resources',amount:2},{id:'portal-med',x:6,z:-140,kind:'medical',amount:40}] as const;
export type Ending={kind:'return'|'costly'|'stranded'|'helix';title:string;story:string;resolvedAt:number;energy:number;materials:number;alert:number;route:string|null;decision:string|null;players:{id:string;nickname:string;health:number;connected:boolean;escaped:boolean}[]};
export type PortalState={id:string;status:'LOCKED'|'READY'|'CHARGING'|'UNSTABLE'|'ACTIVE'|'RESOLVED';route:'stable'|'surge'|null;deadline:number;contributors:{playerId:string;station:string;until:number}[];required:number;repaired:boolean;security:'active'|'disabled';decision:'return'|'helix'|null;votes:{playerId:string;choice:string}[];collected:string[];ending:Ending|null;result:string};
export const freshPortal=(id:string):PortalState=>({id,status:'LOCKED',route:null,deadline:0,contributors:[],required:2,repaired:false,security:'active',decision:null,votes:[],collected:[],ending:null,result:''});
const rect=(x:number,z:number,w:number,d:number):Collider=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
export const PORTAL_WALLS=[rect(-10,-132,1,40),rect(10,-132,1,40),rect(0,-152,21,1),rect(-8,-127,2,2),rect(8,-127,2,2)];
export const portalColliders=()=>PORTAL_WALLS;
export const portalPressure=(time:number)=>({x:Math.sin(time/2000)*3,z:-130,radius:2.4});
