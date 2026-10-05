import express from 'express';import {createServer} from 'node:http';import {Server} from 'socket.io';import {resolve} from 'node:path';
import {schemas,messages,type Reply} from '../shared/protocol.js';import {RoomManager,RuleError} from './engine.js';
type Options={graceMs?:number;clock?:()=>number;manual?:boolean;staticRoot?:string};
export function createTimefallApp(options:Options={}){
 const app=express(),http=createServer(app);app.disable('x-powered-by');
 const io=new Server(http,{maxHttpBufferSize:16*1024,pingInterval:5000,pingTimeout:10000,serveClient:false,allowRequest:(req,callback)=>{const origin=req.headers.origin;try{callback(null,!origin||new URL(origin).host===req.headers.host);}catch{callback(null,false);}}});
 let ticks=0;const stats={snapshots:0,inputAccepted:0,rejected:0,connections:0};
 const broadcast=(code:string)=>{if(manager.rooms.has(code)){io.to(code).emit('room:state',manager.state(code));stats.snapshots++;}};
 const manager=new RoomManager(options.graceMs??90_000,options.clock??Date.now,n=>io.to(n.code).emit('room:notice',n),broadcast);
 const step=()=>{manager.tick();if(++ticks%2===0)for(const [code,room] of manager.rooms)if(room.phase==='playing'&&[...room.players.values()].some(p=>p.socketId))broadcast(code);};
 const timer=options.manual?null:setInterval(step,50);
 const creationBudgets=new Map<string,{at:number;count:number}>();
 io.on('connection',socket=>{stats.connections++;const buckets=new Map<string,{tokens:number;at:number}>();let lastErrorAt=0;
 const permit=(event:string)=>{const now=(options.clock??Date.now)(),input=event==='player:input',rate=input?45:8,capacity=input?80:16;const key=input?'movement':'operations';let b=buckets.get(key);if(!b){b={tokens:capacity,at:now};buckets.set(key,b);}b.tokens=Math.min(capacity,b.tokens+(now-b.at)*rate/1000);b.at=now;if(b.tokens<1)return false;b.tokens--;return true;};
 for(const [event,schema] of Object.entries(schemas)){socket.on(event,(payload:unknown,ack?:unknown)=>{let reply:Reply;
 try{if(!permit(event))throw new RuleError('RATE_LIMIT');const parsed=schema.safeParse(payload);if(!parsed.success)throw new RuleError('BAD_PAYLOAD');const value=parsed.data as any;let session;
 switch(event){
 case 'room:create':{const now=(options.clock??Date.now)(),ip=socket.handshake.address;let b=creationBudgets.get(ip);if(!b||now-b.at>60_000){b={at:now,count:0};creationBudgets.set(ip,b);}if(++b.count>20)throw new RuleError('RATE_LIMIT');session=manager.create(socket.id,value.nickname);break;}
 case 'room:join':session=manager.join(socket.id,value.code,value.nickname);break;
 case 'room:resume':session=manager.resume(socket.id,value.code,value.token);break;
 case 'room:ready':manager.ready(socket.id,value.ready,value.epoch);break;
 case 'room:start':manager.start(socket.id,value.epoch);break;
 case 'room:reset':manager.reset(socket.id,value.epoch);break;
 case 'room:leave':{const old=manager.membership(socket.id);manager.leave(socket.id);if(old)socket.leave(old.code);break;}
 case 'player:input':manager.input(socket.id,value);stats.inputAccepted++;break;
 case 'facility:action':manager.facilityAction(socket.id,value);break;
 case 'survival:action':manager.survivalAction(socket.id,value);break;
 case 'objective:interact':manager.interact(socket.id,value);break;
 }
 if(session)socket.join(session.code);const member=manager.membership(socket.id);reply={ok:true,...(session?{session}:{}),...(member&&event!=='player:input'?{state:manager.state(member.code)}:{}),...(event==='player:input'?{seq:value.seq}:{})};
 }catch(error){stats.rejected++;const code=error instanceof RuleError?error.code:'INTERNAL_ERROR';reply={ok:false,error:code,message:messages[code]??messages.INTERNAL_ERROR};}
 if(typeof ack==='function')ack(reply);else if(!reply.ok&&Date.now()-lastErrorAt>1000){lastErrorAt=Date.now();socket.emit('protocol:error',reply);}
 });}
 socket.on('disconnect',()=>manager.disconnect(socket.id));
 });
 const budgetTimer=setInterval(()=>{const now=(options.clock??Date.now)();for(const [ip,b] of creationBudgets)if(now-b.at>60_000)creationBudgets.delete(ip);},60_000);budgetTimer.unref();
 app.get('/health',(_req,res)=>res.json({status:'ok',milestone:4,multiplayer:true,simulationHz:20,snapshotHz:10}));
 app.use((_req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');next();});
 app.use(express.static(options.staticRoot??resolve('dist'),{maxAge:0}));app.use((_req,res)=>res.status(404).send('Not found'));
 return {app,http,io,manager,stats,step,async listen(port=0){return await new Promise<number>(resolve=>{http.listen(port,'0.0.0.0',()=>{const address=http.address();resolve(typeof address==='object'&&address?address.port:port);});});},async close(){if(timer)clearInterval(timer);clearInterval(budgetTimer);await new Promise<void>(resolve=>io.close(()=>http.close(()=>resolve())));}};
}
