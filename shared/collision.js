export const bounds={minX:-22,maxX:22,minZ:-42,maxZ:22};
export const radius=0.42;
export function blocked(x,z,boxes){
 if(x<bounds.minX+radius||x>bounds.maxX-radius||z<bounds.minZ+radius||z>bounds.maxZ-radius)return true;
 return boxes.some(b=>{const nx=Math.max(b.minX,Math.min(x,b.maxX)),nz=Math.max(b.minZ,Math.min(z,b.maxZ));return (x-nx)**2+(z-nz)**2<radius**2;});
}
export function move(position,dx,dz,boxes){
 const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/0.15));
 let x=position.x,z=position.z;
 for(let i=0;i<n;i++){if(!blocked(x+dx/n,z,boxes))x+=dx/n;if(!blocked(x,z+dz/n,boxes))z+=dz/n;}
 return {x,z};
}
