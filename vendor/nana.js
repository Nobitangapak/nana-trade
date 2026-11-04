// Nana 3D hologram avatar. Model: RobotExpressive by Tomás Laulhé (Quaternius), CC0 1.0; mods by Don McCurdy.
import * as THREE from 'three';
import {GLTFLoader} from './GLTFLoader.js';
export function start(box,onFail){
  let R; try{R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})}catch(e){onFail();return null}
  if(!R.getContext()){onFail();return null}
  R.setPixelRatio(Math.min(devicePixelRatio||1,1.5)); const W=()=>box.clientWidth,H=()=>box.clientHeight; R.setSize(W(),H()); box.appendChild(R.domElement);
  const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(35,W()/H(),.1,100); C.position.set(0,2.6,9.5); C.lookAt(0,2,0);
  S.add(new THREE.HemisphereLight(0x66ffff,0x220044,1.2)); const L1=new THREE.PointLight(0xff2bd6,40,20),L2=new THREE.PointLight(0x00f0ff,40,20); L1.position.set(-3,4,3);L2.position.set(3,3,-2);S.add(L1,L2);
  const grid=new THREE.GridHelper(30,30,0xff2bd6,0x00f0ff); grid.material.transparent=true; grid.material.opacity=.35; S.add(grid);
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.4,1.55,64),new THREE.MeshBasicMaterial({color:0x00f0ff,transparent:true,opacity:.8,side:2})); ring.rotation.x=-Math.PI/2; ring.position.y=.02; S.add(ring);
  const scan=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,.05,48,1,true),new THREE.MeshBasicMaterial({color:0x00f0ff,transparent:true,opacity:.35,side:2,blending:THREE.AdditiveBlending})); S.add(scan);
  const N=300,g=new THREE.BufferGeometry(),pp=new Float32Array(N*3); for(let i=0;i<N;i++){pp[i*3]=(Math.random()-.5)*12;pp[i*3+1]=Math.random()*7;pp[i*3+2]=(Math.random()-.5)*8}
  g.setAttribute('position',new THREE.BufferAttribute(pp,3)); const parts=new THREE.Points(g,new THREE.PointsMaterial({color:0xff6bf0,size:.06,transparent:true,opacity:.8,blending:THREE.AdditiveBlending})); S.add(parts);
  let mixer,acts={},cur,model,mats=[],glow=0,dim=false,scanning=true;
  const clock=new THREE.Clock();
  new GLTFLoader().load('vendor/RobotExpressive.glb',gl=>{model=gl.scene; model.scale.setScalar(.75);
    model.traverse(o=>{if(o.isMesh){const m=new THREE.MeshStandardMaterial({color:0x0a1030,emissive:0x00e5ff,emissiveIntensity:.55,metalness:.3,roughness:.35,transparent:true,opacity:.88});m.userData.base=.55;o.material=m;mats.push(m)}});
    S.add(model); mixer=new THREE.AnimationMixer(model); gl.animations.forEach(a=>acts[a.name]=mixer.clipAction(a));
    ['Wave','Jump','No','ThumbsUp','Yes'].forEach(n=>{if(acts[n]){acts[n].setLoop(THREE.LoopOnce);acts[n].clampWhenFinished=true}});
    mixer.addEventListener('finished',()=>play('Idle')); play('Idle'); box.classList.add('ready')},undefined,()=>onFail());
  function play(n,fade=.35){const a=acts[n]; if(!a||a===cur&&n==='Idle')return; a.reset().fadeIn(fade).play(); if(cur&&cur!==a)cur.fadeOut(fade); cur=a}
  let vis=!document.hidden; document.addEventListener('visibilitychange',()=>{vis=!document.hidden; if(vis)clock.getDelta()});
  addEventListener('resize',()=>{R.setSize(W(),H());C.aspect=W()/H();C.updateProjectionMatrix()});
  (function loop(){requestAnimationFrame(loop); if(!vis)return; const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
    mixer&&mixer.update(dt); if(model){model.rotation.y+=dt*.35; model.position.y=.15+Math.sin(t*1.6)*.08}
    glow=Math.max(0,glow-dt*.8); const col=glow>0&&R.userData.col?R.userData.col:null;
    mats.forEach(m=>{m.emissiveIntensity=(dim?.12:m.userData.base+Math.sin(t*3)*.08)+glow*1.6; m.emissive.setHex(col||0x00e5ff)});
    ring.material.opacity=dim?.15:.5+Math.sin(t*2)*.3; ring.scale.setScalar(1+glow*.6);
    scan.visible=scanning&&!dim; scan.position.y=((t*.9)%1)*3.4; parts.rotation.y+=dt*.05;
    const a=g.attributes.position.array; for(let i=1;i<a.length;i+=3){a[i]+=dt*.4; if(a[i]>7)a[i]=0} g.attributes.position.needsUpdate=true;
    R.render(S,C)})();
  return {
    win(){play(acts.Jump?'Jump':'Wave'); setTimeout(()=>play('Wave'),1100); glow=1; R.userData.col=0x39ff88},
    loss(){play('No'); glow=.6; R.userData.col=0xff4d6d},
    health(alive){dim=!alive; scanning=alive},
    snap(){return R.domElement.toDataURL('image/png')}
  };
}
