export const LAUNCHER={station:{x:8,z:-106},target:{x:0,z:-116},range:3.2,maxShots:8,requiredHits:2,hitRadius:2.4} as const;
export type LauncherShot={id:string;playerId:string;nickname:string;firedAt:number;power:number;aimX:number;aimZ:number;landingX:number;landingZ:number;hit:boolean};
export type LauncherState={id:string;status:'LOCKED'|'READY'|'COMPLETE';score:number;shots:LauncherShot[];result:string};
export const freshLauncher=(id:string):LauncherState=>({id,status:'LOCKED',score:0,shots:[],result:'Complete HELIX to unlock team Energy Launcher calibration.'});
