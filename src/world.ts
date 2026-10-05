import {BUILDINGS,COLLIDERS} from '../shared/world-map';
import * as T from 'three';
export type Box={minX:number;maxX:number;minZ:number;maxZ:number};
export function buildWorld(scene:T.Scene){
 const boxes:Box[]=[],solids:T.Object3D[]=[];
 const mats={ground:new T.MeshStandardMaterial({color:0x172632,roughness:1}),dark:new T.MeshStandardMaterial({color:0x192d3b,roughness:.85}),wall:new T.MeshStandardMaterial({color:0x304553,roughness:.9}),edge:new T.MeshStandardMaterial({color:0x506876,roughness:.7}),cyan:new T.MeshBasicMaterial({color:0x64ecff}),amber:new T.MeshBasicMaterial({color:0xffb968}),purple:new T.MeshBasicMaterial({color:0xb896ff}),black:new T.MeshStandardMaterial({color:0x07111b}),white:new T.MeshStandardMaterial({color:0xb6c7cd})};
 const cube=new T.BoxGeometry(1,1,1);
 const staticBoxes:T.Mesh[]=[];
 function box(x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material,solid=false){const m=new T.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(w,h,d);scene.add(m);staticBoxes.push(m);if(solid){boxes.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});solids.push(m);}return m;}
 function cylinder(x:number,y:number,z:number,r:number,h:number,mat:T.Material,n=12){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,n),mat);m.position.set(x,y,z);scene.add(m);return m;}
 function ring(x:number,y:number,z:number,r:number,tube:number,mat:T.Material,horizontal=false){const m=new T.Mesh(new T.TorusGeometry(r,tube,6,64),mat);m.position.set(x,y,z);if(horizontal)m.rotation.x=-Math.PI/2;scene.add(m);return m;}
 function sign(text:string,x:number,y:number,z:number,w:number,h:number,color='#72eaff'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#091623';ctx.fillRect(0,0,512,128);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(3,3,506,122);ctx.fillStyle=color;ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);scene.add(m);return m;}
 box(0,-.25,-22,160,.5,180,mats.ground);
 // A narrow expedition avenue framed by monumental, inexpensive geometry.
 box(0,.006,-15,13,.012,85,mats.dark);
 for(const x of [-6.8,6.8]){box(x,.015,-12,.06,.025,68,mats.cyan);for(let z=16;z>-43;z-=5)box(x*.91,.022,z,.18,.04,1.1,mats.amber);}
 const buildings=BUILDINGS;
 for(const [x,z,w,h,d] of buildings){box(x,h/2,z,w,h,d,mats.wall,true);box(x,h+.2,z,w+.5,.4,d+.5,mats.edge);box(x,h*.75,z,w+.2,.25,d+.2,mats.dark);for(let yy=3;yy<h-1;yy+=3){box(x-w/2-.025,yy,z,.04,.18,d-1,mats.cyan);box(x+w/2+.025,yy,z,.04,.18,d-1,mats.cyan);}for(let xx=x-w/2+1;xx<x+w/2;xx+=2)box(xx,h*.45,z+d/2+.025,.22,h*.58,.04,mats.black);box(x,h*.3,z+d/2+.06,w*.6,.12,.05,mats.amber);}
 // Broken roof fragments and fallen facade panels establish an abandoned city.
 for(const [x,z] of [[-7,-12],[7,-32],[-9,-29]]){const debris=box(x,.28,z,2,.55,1.1,mats.wall,true);debris.rotation.y=.22;box(x+.3,.63,z,.13,.15,1.3,mats.amber);}
 for(const [x,z] of [[-15,-9],[16,-29]]){const fallen=box(x+(x<0?4:-4),2.6,z-1,.5,5,1,mats.edge);fallen.rotation.z=x<0?-.35:.35;}
 // Distant skyline: merged-looking silhouettes with no textures.
 for(let i=0;i<34;i++){const x=(i%2?-1:1)*(28+(i%6)*9),z=-12-Math.floor(i/2)*6,h=12+(i*7%25);box(x,h/2,z,5+(i%3)*2,h,6,mats.dark);if(i%3===0)box(x,h+.5,z,.15,2,.15,mats.cyan);}
 for(const x of [-8,8]){box(x,3.8,0,1.1,7.6,1.4,mats.edge,true);box(x,3.8,.73,.15,6,.04,mats.cyan);}box(0,7.6,0,17.2,.8,1.4,mats.dark);sign('SECTOR 07',0,7.65,.73,5,1.1);
 // Arrival pad, flat enough to keep the slice's movement planar.
 cylinder(0,.035,11,5,.07,mats.black,48);const arrivalRing=ring(0,.085,11,4.4,.055,mats.cyan,true);ring(0,.08,11,3.9,.035,mats.edge,true);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*4.7,.5,11+Math.sin(a)*4.7,.4,1,.4,mats.edge);}
 // Physical city props also participate in collision.
 for(const [x,z] of [[-5,-17],[4,-25],[-4,-36]]){box(x,.6,z,1.5,1.2,1.3,mats.edge,true);box(x,1.25,z,1.3,.06,1.1,mats.amber);}
 for(const x of [-8.5,8.5])for(const z of [-7,-22,-37]){box(x,2.5,z,.24,5,.24,mats.edge,true);box(x,5,z,1.7,.18,.55,mats.black);box(x,4.88,z,1.5,.04,.4,mats.amber);}
 // Beacon console, presented as a local survey instrument in M1.
 const beacon=new T.Group();beacon.position.set(0,0,-7);scene.add(beacon);
 box(0,.7,-7,1.35,1.4,1.1,mats.dark,true);box(0,1.5,-7,1.6,.14,1.3,mats.edge);const screen=box(0,1.8,-6.9,1,.5,.06,mats.cyan);screen.rotation.x=-.22;
 const beaconRing=ring(0,3.3,-7,.6,.035,mats.cyan);const beaconCore=new T.Mesh(new T.OctahedronGeometry(.3),mats.cyan);beaconCore.position.set(0,3.3,-7);scene.add(beaconCore);
 const beam=new T.Mesh(new T.CylinderGeometry(.06,.4,9,12,1,true),new T.MeshBasicMaterial({color:0x65eaff,transparent:true,opacity:.08,depthWrite:false}));beam.position.set(0,5.8,-7);scene.add(beam);sign('EMERGENCY BEACON',0,2.5,-6.3,2.4,.6);
 sign('TIME PORTAL / NORTH',0,5,-24,5,1);for(const x of [-8,8])box(x,2.5,-24,.25,5,.25,mats.edge);
 // Slice boundary is physically visible, with the finale landmark beyond it.
 box(0,.8,-43,45,1.6,.7,mats.dark);box(0,1.7,-42.8,45,.1,.2,mats.amber);sign('TRANSIT SEALED',0,2.8,-42.55,4,.85,'#ffbd72');
 for(const x of [-23,23])box(x,.65,-10,.8,1.3,65,mats.dark);box(0,.65,23,46,1.3,.8,mats.dark);
 // Portal landmark: no full finale logic in M1.
 box(0,.5,-67,19,1,10,mats.dark);for(const x of [-7,7]){box(x,6,-67,2,12,3,mats.edge);box(x,6,-65.4,.12,9,.1,mats.purple);}box(0,12,-67,16,1,3,mats.edge);
 const portalRing=ring(0,6.8,-65,5,.18,mats.purple);const portalInner=ring(0,6.8,-65,4.55,.045,mats.cyan);
 const portal=new T.Mesh(new T.CircleGeometry(4.45,64),new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 p;void main(){p=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 p;uniform float time;void main(){float r=length(p);float a=atan(p.y,p.x);float bands=.5+.5*sin(r*32.-time*1.6+a*2.);float edge=smoothstep(.25,1.,r);vec3 c=mix(vec3(.08,.14,.3),vec3(.55,.3,.95),bands*edge);gl_FragColor=vec4(c,.72);}' }));portal.position.set(0,6.8,-65.02);scene.add(portal);
 const dustGeo=new T.BufferGeometry(),positions=new Float32Array(180*3);for(let i=0;i<180;i++){positions[i*3]=Math.sin(i*37)*40;positions[i*3+1]=1+(i%29)*.3;positions[i*3+2]=Math.cos(i*19)*45-12;}dustGeo.setAttribute('position',new T.BufferAttribute(positions,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:0x9bd8e0,size:.045,transparent:true,opacity:.42,depthWrite:false}));scene.add(dust);
 // Decorative hovering drone: no encounter or AI claims in this milestone.
 const drone=new T.Group();const body=new T.Mesh(new T.OctahedronGeometry(.65),mats.edge);body.scale.set(1.6,.6,1);drone.add(body);const eye=new T.Mesh(new T.SphereGeometry(.12,8,6),mats.amber);eye.position.set(0,0,.54);drone.add(eye);drone.position.set(7,6,-18);scene.add(drone);
 // Batch static cuboids by material. Preserve independent collision meshes for camera rays.
 const batches=new Map<T.Material,T.Mesh[]>();
 for(const mesh of staticBoxes){const material=mesh.material as T.Material;const list=batches.get(material)||[];list.push(mesh);batches.set(material,list);mesh.updateMatrixWorld(true);scene.remove(mesh);}
 for(const [material,meshes] of batches){const instanced=new T.InstancedMesh(cube,material,meshes.length);for(let i=0;i<meshes.length;i++)instanced.setMatrixAt(i,meshes[i].matrixWorld);instanced.instanceMatrix.needsUpdate=true;instanced.computeBoundingSphere();scene.add(instanced);}
 const ray=new T.Raycaster();
 function animate(t:number,reduced:boolean){beaconCore.rotation.y=t*.7;beaconRing.rotation.z=reduced?0:t*.35;portalRing.rotation.z=reduced?0:t*.08;portalInner.rotation.z=reduced?0:-t*.12;(portal.material as T.ShaderMaterial).uniforms.time.value=reduced?0:t;drone.position.y=6+(reduced?0:Math.sin(t*.6)*.25);arrivalRing.visible=true;}
 function cameraPosition(target:T.Vector3,wanted:T.Vector3){const direction=wanted.clone().sub(target);const distance=direction.length();ray.set(target,direction.normalize());ray.far=distance;const hit=ray.intersectObjects(solids,false)[0];return hit?target.clone().addScaledVector(direction,Math.max(.08,hit.distance-.2)):wanted;}
 return {boxes:COLLIDERS,solids,animate,cameraPosition,beaconCore,portal};
}
export function buildAvatar(scene:T.Scene,color=0x62edff){const g=new T.Group(),suit=new T.MeshStandardMaterial({color:0x142430,roughness:.8}),trim=new T.MeshBasicMaterial({color}),helmet=new T.MeshStandardMaterial({color:0xb5c8cf,metalness:.4,roughness:.45}),visor=new T.MeshBasicMaterial({color:0x193f55});
 function part(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);return m;}
 part(.65,.65,.4,0,1.15,0,suit);part(.48,.08,.43,0,1.35,0,trim);part(.48,.44,.43,0,1.73,0,helmet);part(.4,.2,.03,0,1.75,-.23,visor);part(.38,.42,.18,0,1.2,.27,helmet);const legs=[part(.22,.65,.25,-.19,.5,0,suit),part(.22,.65,.25,.19,.5,0,suit)];const arms=[part(.18,.58,.21,-.44,1.13,0,suit),part(.18,.58,.21,.44,1.13,0,suit)];part(.15,.13,.24,-.44,.9,0,trim);part(.15,.13,.24,.44,.9,0,trim);
 const shadow=new T.Mesh(new T.CircleGeometry(.65,24),new T.MeshBasicMaterial({color:0x020810,transparent:true,opacity:.4,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.03;scene.add(shadow);scene.add(g);g.position.set(0,0,11);
 return {group:g,setColor(color:string){trim.color.set(color);},dispose(){scene.remove(g,shadow);const materials=new Set<T.Material>(),geometries=new Set<T.BufferGeometry>();g.traverse(obj=>{if(obj instanceof T.Mesh){geometries.add(obj.geometry);for(const mat of Array.isArray(obj.material)?obj.material:[obj.material])materials.add(mat);}});geometries.add(shadow.geometry);materials.add(shadow.material);for(const geo of geometries)geo.dispose();for(const mat of materials)mat.dispose();},animate(t:number,moving:boolean){for(let i=0;i<2;i++){legs[i].rotation.x=moving?Math.sin(t*10+i*Math.PI)*.35:0;arms[i].rotation.x=moving?-Math.sin(t*10+i*Math.PI)*.25:0;}shadow.position.x=g.position.x;shadow.position.z=g.position.z;}};
}
