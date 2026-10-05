export function controls(canvas:HTMLCanvasElement,onInteract:()=>void){
 const keys=new Set<string>();let yaw=0,pitch=.28,distance=7;let joyX=0,joyY=0,joystickId:number|null=null,cameraId:number|null=null,lastX=0,lastY=0;
 const joystick=document.querySelector<HTMLElement>('#joystick')!,stick=document.querySelector<HTMLElement>('#stick')!;
 let touch=matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0;
 const enableTouch=()=>{touch=true;document.body.classList.add('touch');};if(touch)enableTouch();
 window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||!(document.querySelector('#start') as HTMLElement).hidden)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'&&!e.repeat)onInteract();});
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 function reset(resetView=false){if(resetView){yaw=0;pitch=.28;distance=7;}keys.clear();joyX=joyY=0;joystickId=cameraId=null;stick.style.transform='translate(0,0)';}
 window.addEventListener('blur',()=>reset());document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
 joystick.addEventListener('pointerdown',e=>{if(joystickId!==null)return;enableTouch();joystickId=e.pointerId;joystick.setPointerCapture(e.pointerId);setStick(e);e.preventDefault();});
 function setStick(e:PointerEvent){const r=joystick.getBoundingClientRect(),max=r.width*.32;let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;const len=Math.hypot(x,y);if(len>max){x*=max/len;y*=max/len;}joyX=x/max;joyY=-y/max;stick.style.transform=`translate(${x}px,${y}px)`;}
 joystick.addEventListener('pointermove',e=>{if(e.pointerId===joystickId)setStick(e);});
 const releaseStick=(e:PointerEvent)=>{if(e.pointerId===joystickId){joystickId=null;joyX=joyY=0;stick.style.transform='translate(0,0)';}};for(const event of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(event,releaseStick as EventListener);
 canvas.addEventListener('pointerdown',e=>{if(cameraId!==null||e.button!==0)return;if(e.pointerType==='touch'){enableTouch();if(e.clientX<innerWidth*.42)return;}cameraId=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(e.pointerId!==cameraId)return;yaw-=(e.clientX-lastX)*.006;pitch=Math.max(.13,Math.min(1.03,pitch+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;});
 const releaseCamera=(e:PointerEvent)=>{if(e.pointerId===cameraId)cameraId=null;};for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,releaseCamera as EventListener);
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(3.5,Math.min(10,distance+e.deltaY*.006));},{passive:false});
 return {reset,get yaw(){return yaw;},get pitch(){return pitch;},get distance(){return distance;},get touch(){return touch;},movement(){let x=joyX+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),y=joyY+(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}return {x,y};}};
}
