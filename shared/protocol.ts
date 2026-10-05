import type {PortalState} from './portal.js';
import type {FacilityState} from './facility.js';
import type {SurvivalState} from './survival.js';
import {z} from 'zod';
export const CODE_ALPHABET='23456789ABCDEFGHJKMNPQRSTVWXYZ';
const epoch=z.number().int().nonnegative().max(1_000_000_000);
const code=z.string().trim().toUpperCase().regex(/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{5}$/);
const nickname=z.string().trim().min(1).max(16).refine(v=>!/[\p{C}<>]/u.test(v),'Use a short display name without special control characters.');
export const schemas={
 'room:create':z.object({nickname}).strict(),
 'room:join':z.object({nickname,code}).strict(),
 'room:resume':z.object({code,token:z.string().regex(/^[A-Za-z0-9_-]{43}$/)}).strict(),
 'room:ready':z.object({ready:z.boolean(),epoch}).strict(),
 'room:start':z.object({epoch}).strict(),
 'room:reset':z.object({epoch}).strict(),
 'room:leave':z.object({}).strict(),
 'player:input':z.object({epoch,seq:z.number().int().positive().max(1_000_000_000),x:z.number().finite().min(-1).max(1),z:z.number().finite().min(-1).max(1)}).strict().refine(v=>Math.hypot(v.x,v.z)<=1.001),
 'portal:action':z.object({epoch,requestId:z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),eventId:z.string().max(80),kind:z.enum(['collect','route','stabilize','repair','security','vote','cross']),target:z.string().min(1).max(80)}).strict(),
 'facility:action':z.object({epoch,requestId:z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),eventId:z.string().max(80),kind:z.enum(['sync','read','solve','route','power','collect','scanner','patrol','archive']),target:z.string().min(1).max(80)}).strict(),
 'survival:action':z.object({epoch,requestId:z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),eventId:z.string().max(80),kind:z.enum(['collect','revive','choose','contribute']),target:z.string().min(1).max(80)}).strict(),
 'objective:interact':z.object({epoch,objectiveVersion:epoch,target:z.enum(['beacon','signal']),requestId:z.string().regex(/^[A-Za-z0-9_-]{8,64}$/)}).strict()
};
export type PortalAction=z.infer<typeof schemas['portal:action']>;
export type FacilityAction=z.infer<typeof schemas['facility:action']>;
export type SurvivalAction=z.infer<typeof schemas['survival:action']>;
export type InputCommand=z.infer<typeof schemas['player:input']>;
export type Action=z.infer<typeof schemas['objective:interact']>;
export type PublicPlayer={id:string;nickname:string;color:string;connected:boolean;ready:boolean;x:number;z:number;angle:number;appliedSeq:number;lastSeq:number;health:number;incapacitated:boolean};
export type RoomState={code:string;epoch:number;revision:number;phase:'lobby'|'playing';hostId:string|null;serverTime:number;startedAt:number;arrivalEndsAt:number;objective:{stage:number;version:number};survival:SurvivalState;facility:FacilityState;portal:PortalState;players:PublicPlayer[]};
export type Session={code:string;playerId:string;token:string};
export type Reply={ok:true;session?:Session;state?:RoomState;seq?:number}|{ok:false;error:string;message:string;seq?:number};
export const messages:Record<string,string>={BAD_PAYLOAD:'Check your display name and room code.',ROOM_NOT_FOUND:'That room was not found. Check the code.',ROOM_FULL:'This room already has six explorers.',ALREADY_JOINED:'Leave your current room first.',ROOM_STARTED:'This expedition has already started.',NOT_JOINED:'Join a room first.',NOT_HOST:'Only the host can do that.',NOT_READY:'Every connected explorer must be ready.',TOO_FEW_PLAYERS:'At least two connected explorers are needed.',STALE_EPOCH:'The expedition changed. Try again.',BAD_PHASE:'That action is unavailable right now.',OUT_OF_RANGE:'Move closer to the marked objective.',STALE_OBJECTIVE:'A teammate already advanced the objective.',DUPLICATE_ACTION:'That scan was already received.',ARRIVING:'Wait for the arrival to stabilize.',STALE_INPUT:'Movement was already received.',INVALID_SESSION:'Your reserved place expired. Join a room again.',SESSION_ACTIVE:'This explorer is already connected in another window.',RATE_LIMIT:'Too many requests. Wait a moment and try again.',SERVER_FULL:'The server is busy. Try again shortly.',INTERNAL_ERROR:'Something went wrong. Please try again.'};

Object.assign(messages,{INCAPACITATED:'You need a teammate to revive you.',ALREADY_COLLECTED:'A teammate already collected this supply.',INVALID_TARGET:'That target is unavailable.',ALREADY_REVIVED:'That explorer is already standing.',INSUFFICIENT_SUPPLIES:'Collect more supplies first.',STALE_EVENT:'This security event has changed.',EVENT_RESOLVED:'This encounter has already resolved.',DUPLICATE_CONTRIBUTION:'You have already contributed. Ask another explorer.',ROLE_TAKEN:'That terminal is already powered. Use the other terminal.',NEED_BEACON:'Scan the emergency beacon first.'});

Object.assign(messages,{FACILITY_LOCKED:'Complete the security encounter and trace the north signal first.',NEED_TEAMMATE:'Two explorers must recover ALPHA and BETA clues separately.'});

Object.assign(messages,{TEAM_CHOICE:'Your teammate selected a different future. Confirm their choice to proceed.'});
