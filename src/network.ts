import {io,type Socket} from 'socket.io-client';
import type {RoomState,Session,Reply,InputCommand} from '../shared/protocol';
import {move} from '../shared/collision.js';import {COLLIDERS,SPEED,TICK_MS} from '../shared/world-map';
const KEY='timefall-m2-session';
export class Network{
 readonly socket:Socket=io({autoConnect:false,transports:['websocket','polling'],tryAllTransports:true,reconnection:true,reconnectionDelay:500,reconnectionDelayMax:2500});
 state:RoomState|null=null;session:Session|null=null;status='Connecting…';connected=false;offset=0;prediction={x:0,z:11};sequence=0;pending:InputCommand[]=[];
 snapshots=0;inputs=0;inputRejections=0;corrections=0;maxCorrection=0;receivedBytes=0;private timer:ReturnType<typeof setInterval>|null=null;private lastStateTime=-1;
 onState:(state:RoomState)=>void=()=>{};onNotice:(text:string)=>void=()=>{};onStatus:(text:string)=>void=()=>{};getInput:()=>{x:number;z:number}=()=>({x:0,z:0});
 constructor(){try{const s=JSON.parse(sessionStorage.getItem(KEY)||'null');if(s&&typeof s.code==='string'&&typeof s.token==='string'&&typeof s.playerId==='string')this.session=s;}catch{}
 this.socket.on('connect',async()=>{this.connected=!this.session;this.setStatus('Connected');if(this.session){this.setStatus('Restoring your place…');const reply=await this.request('room:resume',{code:this.session.code,token:this.session.token});if(!reply.ok){if(reply.error!=='SESSION_ACTIVE')this.clearSession();this.setStatus(reply.message);this.onNotice(reply.message);}else {this.connected=true;this.setStatus('Connected');}}});
 this.socket.on('disconnect',()=>{this.connected=false;this.pending=[];this.setStatus(this.session?'Reconnecting…':'Disconnected');});
 this.socket.on('connect_error',()=>{this.connected=false;this.setStatus(this.session?'Reconnecting…':'Server unavailable. Retrying…');});
 this.socket.on('room:state',(state:RoomState)=>this.accept(state));this.socket.on('room:notice',(n:{text:string})=>this.onNotice(n.text));this.socket.on('protocol:error',(reply:Reply)=>{if(!reply.ok)this.onNotice(reply.message);});
 }
 start(){this.socket.connect();this.timer=setInterval(()=>this.sendInput(),TICK_MS);}
 private setStatus(text:string){this.status=text;this.onStatus(text);}
 private save(){try{if(this.session)sessionStorage.setItem(KEY,JSON.stringify(this.session));else sessionStorage.removeItem(KEY);}catch{}}
 clearSession(){this.session=null;this.state=null;this.pending=[];this.lastStateTime=-1;this.sequence=0;this.save();}
 async request(event:string,payload:unknown):Promise<Reply>{if(!this.socket.connected)return {ok:false,error:'DISCONNECTED',message:'Connection lost. Wait for reconnection.'};return await new Promise(resolve=>{this.socket.timeout(6000).emit(event,payload,(error:Error|null,reply:Reply)=>{if(error){resolve({ok:false,error:'TIMEOUT',message:'No response yet. Check your connection.'});return;}if(reply.ok){if(reply.session){this.session=reply.session;this.lastStateTime=-1;this.save();}if(reply.state)this.accept(reply.state);}resolve(reply);});});}
 private accept(state:RoomState){if(!this.session||state.code!==this.session.code||state.serverTime<this.lastStateTime||(this.state&&state.epoch<this.state.epoch))return;const changedEpoch=state.epoch!==this.state?.epoch;this.lastStateTime=state.serverTime;this.offset=state.serverTime-Date.now();this.snapshots++;this.receivedBytes+=JSON.stringify(state).length;const me=state.players.find(p=>p.id===this.session!.playerId);if(!me)return;
 if(changedEpoch){this.pending=[];this.sequence=me.lastSeq;}else this.sequence=Math.max(this.sequence,me.lastSeq);
 this.pending=this.pending.filter(command=>command.epoch===state.epoch&&command.seq>me.appliedSeq);let predicted={x:me.x,z:me.z};for(const command of this.pending)predicted=move(predicted,command.x*SPEED*.05,command.z*SPEED*.05,COLLIDERS);
 const correction=Math.hypot(predicted.x-this.prediction.x,predicted.z-this.prediction.z);if(!changedEpoch&&correction>.05){this.corrections++;this.maxCorrection=Math.max(this.maxCorrection,correction);}this.prediction=predicted;this.state=state;this.onState(state);
 }
 private sendInput(){const state=this.state;if(!this.connected||!this.session||!state||state.phase!=='playing'||Date.now()+this.offset<state.arrivalEndsAt)return;const m=this.getInput();const command:InputCommand={epoch:state.epoch,seq:++this.sequence,x:m.x,z:m.z};this.pending.push(command);if(this.pending.length>40)this.pending.shift();this.prediction=move(this.prediction,command.x*SPEED*.05,command.z*SPEED*.05,COLLIDERS);this.inputs++;
 this.socket.timeout(6000).emit('player:input',command,(error:Error|null,reply:Reply)=>{if(error||!reply?.ok){this.inputRejections++;this.pending=this.pending.filter(p=>p.seq!==command.seq);}});
 }
 async interact(target:'beacon'|'signal'){if(!this.state)return;const requestId=Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');const reply=await this.request('objective:interact',{epoch:this.state.epoch,objectiveVersion:this.state.objective.version,target,requestId});if(!reply.ok)this.onNotice(reply.message);return reply;}
 async leave(){const reply=await this.request('room:leave',{});if(reply.ok)this.clearSession();return reply;}
 get me(){return this.state?.players.find(p=>p.id===this.session?.playerId);}
 diagnostics(){return {connected:this.connected,status:this.status,code:this.session?.code,playerId:this.session?.playerId,socketId:this.socket.id,transport:this.socket.io.engine?.transport.name,snapshots:this.snapshots,inputs:this.inputs,inputRejections:this.inputRejections,corrections:this.corrections,maxCorrection:this.maxCorrection,receivedBytes:this.receivedBytes,pending:this.pending.length,prediction:{...this.prediction},state:this.state};}
}
