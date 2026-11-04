// Nana anime VRM avatar. Model: VRM1_Constraint_Twist_Sample (c) 2022 pixiv Inc., VRM Public License 1.0 (redistribution & modification allowed).
import * as THREE from 'three';
import {GLTFLoader} from './GLTFLoader.js';
import {VRMLoaderPlugin,VRMUtils} from './three-vrm.module.min.js';
export function start(box,onFail){
  let R; try{R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})}catch(e){onFail();return null}
  if(!R.getContext()){onFail();return null}
  R.setPixelRatio(Math.min(devicePixelRatio||1,1.5)); const W=()=>box.clientWidth,H=()=>box.clientHeight; R.setSize(W(),H()); box.appendChild(R.domElement);
  const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(28,W()/H(),.1,50); C.position.set(0,1.0,3.9); C.lookAt(0,.82,0);
  S.add(new THREE.AmbientLight(0xffffff,.9)); const D=new THREE.DirectionalLight(0xffffff,1.6); D.position.set(1,2,3); S.add(D);
  const rimA=new THREE.DirectionalLight(0xff2bd6,1.4); rimA.position.set(-2,1.5,-2); const rimB=new THREE.DirectionalLight(0x00f0ff,1.4); rimB.position.set(2,1.5,-2); S.add(rimA,rimB);
  const grid=new THREE.GridHelper(20,40,0xff2bd6,0x00f0ff); grid.material.transparent=true; grid.material.opacity=.35; S.add(grid);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.45,.5,64),new THREE.MeshBasicMaterial({color:0x00f0ff,transparent:true,opacity:.8,side:2})); ring.rotation.x=-Math.PI/2; ring.position.y=.01; S.add(ring);
  const scan=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.02,48,1,true),new THREE.MeshBasicMaterial({color:0x00f0ff,transparent:true,opacity:.3,side:2,blending:THREE.AdditiveBlending,depthWrite:false})); S.add(scan);
  const N=220,g=new THREE.BufferGeometry(),pp=new Float32Array(N*3); for(let i=0;i<N;i++){pp[i*3]=(Math.random()-.5)*5;pp[i*3+1]=Math.random()*2.6;pp[i*3+2]=(Math.random()-.5)*3-0.5}
  g.setAttribute('position',new THREE.BufferAttribute(pp,3)); const parts=new THREE.Points(g,new THREE.PointsMaterial({color:0xff8bf0,size:.018,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); S.add(parts);
  const look=new THREE.Object3D(); look.position.set(0,1.3,3); S.add(look);
  let vrm=null,mode='idle',mt=0,dim=false,scanning=true,glow=0,glowCol=0x39ff88,nextBlink=2,blinkT=-1,lookT=0,lookTarget=new THREE.Vector3(0,1.3,3),pointerT=-10;
  const L=new GLTFLoader(); L.register(p=>new VRMLoaderPlugin(p));
  L.load('vendor/nana.vrm',gl=>{vrm=gl.userData.vrm; VRMUtils.removeUnnecessaryVertices(gl.scene); VRMUtils.combineSkeletons&&VRMUtils.combineSkeletons(gl.scene);
    VRMUtils.rotateVRM0(vrm); vrm.scene.traverse(o=>{o.frustumCulled=false}); S.add(vrm.scene); vrm.lookAt&&(vrm.lookAt.target=look); box.classList.add('ready')},undefined,e=>{console.warn('vrm',e);onFail()});
  box.addEventListener('pointermove',e=>{const r=box.getBoundingClientRect();lookTarget.set(((e.clientX-r.left)/r.width-.5)*3,1.3-((e.clientY-r.top)/r.height-.5)*2,3);pointerT=clock.elapsedTime});
  box.addEventListener('pointerdown',e=>box.dispatchEvent(new PointerEvent('pointermove',e)));
  const clock=new THREE.Clock(); let vis=!document.hidden; document.addEventListener('visibilitychange',()=>{vis=!document.hidden;if(vis)clock.getDelta()});
  addEventListener('resize',()=>{R.setSize(W(),H());C.aspect=W()/H();C.updateProjectionMatrix()});
  const B=n=>vrm&&vrm.humanoid.getNormalizedBoneNode(n);
  function ex(n,v){vrm&&vrm.expressionManager&&vrm.expressionManager.setValue(n,v)}
  (function loop(){requestAnimationFrame(loop); if(!vis)return; const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime; mt+=dt;
    if(mode!=='idle'&&mt>3.2)mode='idle';
    glow=Math.max(0,glow-dt*.6); ring.material.color.setHex(glow>0?glowCol:0x00f0ff); ring.material.opacity=dim?.15:.45+Math.sin(t*2)*.25+glow; ring.scale.setScalar(1+glow*.8);
    scan.visible=scanning&&!dim; scan.position.y=((t*.5)%1)*1.6;
    const a=g.attributes.position.array; for(let i=1;i<a.length;i+=3){a[i]+=dt*.2;if(a[i]>2.6)a[i]=0} g.attributes.position.needsUpdate=true;
    if(vrm){const br=Math.sin(t*2.1);
      // base pose: arms down, natural
      B('leftUpperArm').rotation.set(0,0,-1.2-br*.02); B('rightUpperArm').rotation.set(0,0,1.2+br*.02);
      B('leftLowerArm').rotation.set(0,0,-.15); B('rightLowerArm').rotation.set(0,0,.15);
      B('spine').rotation.set(br*.015,0,Math.sin(t*.7)*.025); B('chest')&&B('chest').rotation.set(br*.02,0,0);
      vrm.scene.position.y=0; vrm.scene.rotation.y=Math.sin(t*.35)*.25;
      const hd=B('head'); hd.rotation.set(Math.sin(t*.9)*.03,Math.sin(t*.5)*.12,Math.sin(t*.6)*.04);
      let happy=0,sad=0,relaxed=0,sleepy=0;
      if(mode==='win'){happy=1; const j=Math.max(0,Math.sin(mt*7)); if(mt<1.4)vrm.scene.position.y=j*.12;
        B('rightUpperArm').rotation.set(0,0,-1.0-Math.sin(mt*10)*.25); B('rightLowerArm').rotation.set(0,0,-1.0-Math.sin(mt*10)*.2)}
      else if(mode==='loss'){sad=1; hd.rotation.y=Math.sin(mt*9)*.25*Math.max(0,1-mt/2); hd.rotation.x=.15}
      else if(dim){sleepy=1; hd.rotation.x=.25+Math.sin(t*.6)*.05; B('spine').rotation.x=.1}
      else if(scanning){relaxed=.35}
      ex('happy',happy); ex('sad',sad); ex('relaxed',relaxed); ex('neutral',happy||sad?0:.3);
      // blink
      nextBlink-=dt; if(nextBlink<0){blinkT=0;nextBlink=2+Math.random()*3} let bl=sleepy?.6:0; if(blinkT>=0){blinkT+=dt;bl=Math.max(bl,Math.sin(Math.min(1,blinkT/.16)*Math.PI));if(blinkT>.16)blinkT=-1}
      if(happy)bl=Math.max(bl,.0); ex('blink',bl);
      // look-around
      lookT-=dt; if(t-pointerT>3&&lookT<0){lookTarget.set((Math.random()-.5)*2.2,1.1+Math.random()*.5,3);lookT=1.5+Math.random()*2.5}
      look.position.lerp(lookTarget,Math.min(1,dt*3));
      vrm.update(dt)}
    R.render(S,C)})();
  return {win(){mode='win';mt=0;glow=1;glowCol=0x39ff88},loss(){mode='loss';mt=0;glow=.7;glowCol=0xff4d6d},health(al){dim=!al;scanning=al},snap(){return R.domElement.toDataURL('image/png')}};
}
