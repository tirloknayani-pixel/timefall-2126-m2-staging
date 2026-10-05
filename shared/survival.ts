/** M3 tuning: walking never spends energy. Two distinct operators, capped at two. */
export const SURVIVAL={health:100,energy:30,resources:2,reviveHealth:40,reviveRange:2.8,collectRange:2.5,terminalRange:3,eventMs:45_000,damageIntervalMs:2000,hazardDamage:25,alertPerDetection:3,energyCost:45,repairCost:4,timeoutDamage:30,timeoutAlert:15} as const;
export const SECURITY={x:0,z:-24,radius:4.2};
export const TERMINALS={prime:{x:-3,z:-17},ground:{x:3,z:-17}};
export const SUPPLIES=[{id:'cell-west',kind:'energy',x:-3,z:2,amount:20},{id:'cell-east',kind:'energy',x:3,z:2,amount:20},{id:'repair-west',kind:'resources',x:-3,z:-10,amount:2},{id:'repair-east',kind:'resources',x:3,z:-10,amount:2},{id:'med-east',kind:'medical',x:6,z:-19,amount:35},{id:'med-arrival',kind:'medical',x:5,z:7,amount:35}] as const;
export type Choice='energy'|'repair'|'bypass';
export type SurvivalState={energy:number;resources:number;alert:number;collected:string[];event:{id:string;status:'idle'|'active'|'success'|'timeout';choice:Choice|null;deadline:number;contributors:{playerId:string;role:'prime'|'ground'}[];required:number;result:string};security:'active'|'disabled'|'shielded'|'aggressive';};
export const freshSurvival=():SurvivalState=>({energy:SURVIVAL.energy,resources:SURVIVAL.resources,alert:0,collected:[],event:{id:'',status:'idle',choice:null,deadline:0,contributors:[],required:2,result:''},security:'active'});
