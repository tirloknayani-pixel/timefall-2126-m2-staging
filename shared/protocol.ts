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
 'objective:interact':z.object({epoch,objectiveVersion:epoch,target:z.enum(['beacon','signal']),requestId:z.string().regex(/^[A-Za-z0-9_-]{8,64}$/)}).strict()
};
export type InputCommand=z.infer<typeof schemas['player:input']>;
export type Action=z.infer<typeof schemas['objective:interact']>;
export type PublicPlayer={id:string;nickname:string;color:string;connected:boolean;ready:boolean;x:number;z:number;angle:number;appliedSeq:number;lastSeq:number};
export type RoomState={code:string;epoch:number;revision:number;phase:'lobby'|'playing';hostId:string|null;serverTime:number;startedAt:number;arrivalEndsAt:number;objective:{stage:number;version:number};players:PublicPlayer[]};
export type Session={code:string;playerId:string;token:string};
export type Reply={ok:true;session?:Session;state?:RoomState;seq?:number}|{ok:false;error:string;message:string;seq?:number};
export const messages:Record<string,string>={BAD_PAYLOAD:'Check your display name and room code.',ROOM_NOT_FOUND:'That room was not found. Check the code.',ROOM_FULL:'This room already has six explorers.',ALREADY_JOINED:'Leave your current room first.',ROOM_STARTED:'This expedition has already started.',NOT_JOINED:'Join a room first.',NOT_HOST:'Only the host can do that.',NOT_READY:'Every connected explorer must be ready.',TOO_FEW_PLAYERS:'At least two connected explorers are needed.',STALE_EPOCH:'The expedition changed. Try again.',BAD_PHASE:'That action is unavailable right now.',OUT_OF_RANGE:'Move closer to the marked objective.',STALE_OBJECTIVE:'A teammate already advanced the objective.',DUPLICATE_ACTION:'That scan was already received.',ARRIVING:'Wait for the arrival to stabilize.',STALE_INPUT:'Movement was already received.',INVALID_SESSION:'Your reserved place expired. Join a room again.',SESSION_ACTIVE:'This explorer is already connected in another window.',RATE_LIMIT:'Too many requests. Wait a moment and try again.',SERVER_FULL:'The server is busy. Try again shortly.',INTERNAL_ERROR:'Something went wrong. Please try again.'};
