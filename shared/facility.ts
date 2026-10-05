import type {Collider} from './world-map.js';
export const FACILITY={range:2.6,syncMs:8000,energyCost:12,materialCost:3,scannerDamage:12,patrolDamage:18,hazardMs:2500} as const;
export const STATIONS={west:{x:-4,z:-42},east:{x:4,z:-42},alpha:{x:-6,z:-62},beta:{x:6,z:-62},cipher:{x:0,z:-64},route:{x:-5,z:-84},generator:{x:-5,z:-90},relay:{x:5,z:-90},scanner:{x:-6,z:-56},patrol:{x:6,z:-78},archive:{x:6,z:-101}};
export const CACHES=[{id:'facility-cell',x:-6,z:-53,kind:'energy',amount:18},{id:'facility-material',x:6,z:-53,kind:'resources',amount:3},{id:'facility-med',x:-6,z:-76,kind:'medical',amount:35},{id:'facility-reserve',x:6,z:-76,kind:'energy',amount:14}] as const;
export const GLYPHS=['SOL','LUNA','NOVA'] as const;
export type FacilityState={id:string;stage:number;sync:{playerId:string;station:string;until:number}[];observations:{playerId:string;channel:string;glyph:string}[];routing:string|null;contributions:{playerId:string;station:string}[];collected:string[];scanner:'active'|'disabled';scannerUntil:number;patrol:'active'|'diverted'|'aggressive';archive:boolean;result:string};
export const freshFacility=(id:string):FacilityState=>({id,stage:0,sync:[],observations:[],routing:null,contributions:[],collected:[],scanner:'active',scannerUntil:0,patrol:'active',archive:false,result:''});
const rect=(x:number,z:number,w:number,d:number):Collider=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
export const FACILITY_WALLS=[rect(-10,-78,1,68),rect(10,-78,1,68),rect(-7.5,-112,5,1),rect(7.5,-112,5,1),...[-1,1].flatMap(s=>[rect(s*7.5,-68,5,1),rect(s*7.5,-96,5,1)]),rect(-3,-74,1,5),rect(3,-81,1,4)];
export function facilityColliders(f:FacilityState,objectiveStage:number,resolved:boolean){return [...FACILITY_WALLS,...(objectiveStage<2||!resolved||f.stage<1?[rect(0,-46,19,1)]:[]),...(f.stage<2?[rect(0,-68,10,1)]:[]),...(f.stage<3?[rect(0,-96,10,1)]:[]),...(f.stage<3?[rect(0,-106,19,1)]:[])];}
export const requiredOperators=(count:number)=>Math.min(2,count);
