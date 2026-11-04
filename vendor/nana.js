// Nana 2.5D trader avatar (generated anime art) + decorative animated candlestick background. No external libs.
export function start(box,onFail){
  const POSES={neutral:'vendor/char_neutral.webp',happy:'vendor/char_happy.webp',sad:'vendor/char_sad.webp'};
  const cv=document.createElement('canvas'); cv.className='cbg'; box.prepend(cv); const x=cv.getContext('2d');
  const tag=document.createElement('div'); tag.className='deco'; tag.textContent='grafik dekoratif · bukan PnL'; box.appendChild(tag);
  const rig=document.createElement('div'); rig.className='rig'; box.appendChild(rig);
  const imgs={}; let loaded=0,failed=false;
  for(const [k,src] of Object.entries(POSES)){const im=new Image(); im.src=src; im.className='pose'+(k==='neutral'?' on':''); im.draggable=false;
    im.onload=()=>{if(++loaded===3)box.classList.add('ready')}; im.onerror=()=>{if(!failed){failed=true;onFail()}}; rig.appendChild(im); imgs[k]=im}
  const glint=document.createElement('div'); glint.className='glint'; rig.appendChild(glint);
  let pose='neutral',until=0,dim=false,glow=0,glowCol='0,240,255',tx=0,ty=0,ptx=0,pty=0;
  function setPose(p){pose=p; for(const k in imgs)imgs[k].classList.toggle('on',k===p)}
  box.addEventListener('pointermove',e=>{const r=box.getBoundingClientRect();ptx=((e.clientX-r.left)/r.width-.5)*2;pty=((e.clientY-r.top)/r.height-.5)*2});
  box.addEventListener('pointerleave',()=>{ptx=pty=0});
  addEventListener('deviceorientation',e=>{if(e.gamma!=null){ptx=Math.max(-1,Math.min(1,e.gamma/30));pty=Math.max(-1,Math.min(1,(e.beta-45)/30))}});
  // decorative candle layers
  const DPR=Math.min(devicePixelRatio||1,1.5); let W,H;
  function rs(){W=box.clientWidth;H=box.clientHeight;cv.width=W*DPR;cv.height=H*DPR;x.setTransform(DPR,0,0,DPR,0,0)} rs(); addEventListener('resize',rs);
  function mkLayer(w,gap,speed,alpha,amp,yb){let p=50,arr=[];const L={w,gap,speed,alpha,amp,yb,off:0,arr,
    next(){const o=p,c=o+(Math.random()-.48)*amp,h=Math.max(o,c)+Math.random()*amp*.5,l=Math.min(o,c)-Math.random()*amp*.5;p=Math.max(15,Math.min(85,c));return{o,c,h,l,g:0}}};
    for(let i=0;i<80;i++){const k=L.next();k.g=1;arr.push(k)} return L}
  const layers=[mkLayer(5,4,10,.22,6,.35),mkLayer(8,5,18,.35,7,.5),mkLayer(12,7,30,.55,8,.62)];
  let vis=!document.hidden; document.addEventListener('visibilitychange',()=>{vis=!document.hidden;last=performance.now()});
  let last=performance.now(),t=0;
  (function loop(n){requestAnimationFrame(loop); if(!vis)return; const dt=Math.min(.05,(n-last)/1000); last=n; t+=dt;
    x.clearRect(0,0,W,H);
    layers.forEach((L,li)=>{L.off+=L.speed*dt*(dim?.3:1); const step=L.w+L.gap; while(L.off>=step){L.off-=step;L.arr.shift();L.arr.push(L.next())}
      const cur=L.arr[L.arr.length-1]; cur.g=Math.min(1,cur.g+dt*.8);
      const sc=H*.5/100, base=H*L.yb, px=(ptx*(li+1)*4);
      for(let i=0;i<L.arr.length;i++){const k=L.arr[i],X=W-(L.arr.length-i)*step+L.off+px; if(X<-step)continue;
        const c=k.o+(k.c-k.o)*k.g,up=c>=k.o,col=up?'57,255,136':'255,77,109'; x.globalAlpha=L.alpha*(dim?.4:1);
        x.strokeStyle=x.fillStyle=`rgb(${col})`; x.shadowColor=`rgb(${col})`; x.shadowBlur=li==2?8:0;
        const Y=v=>base+(50-v)*sc*1.4; x.beginPath(); x.moveTo(X+L.w/2,Y(k.h)); x.lineTo(X+L.w/2,Y(k.l)); x.lineWidth=1; x.stroke();
        const y1=Y(Math.max(k.o,c)),y2=Y(Math.min(k.o,c)); x.fillRect(X,y1,L.w,Math.max(1.5,y2-y1))}});
    x.globalAlpha=1; x.shadowBlur=0;
    // character life
    tx+=(ptx-tx)*Math.min(1,dt*4); ty+=(pty-ty)*Math.min(1,dt*4);
    if(pose!=='neutral'&&performance.now()>until)setPose('neutral');
    const br=Math.sin(t*2.2), bob=Math.sin(t*1.1)*3, typ=pose==='neutral'?Math.sin(t*18)*.4*(Math.sin(t*.7)>.3?1:0):0;
    let jump=0; if(pose==='happy'){const k=(until-performance.now())/1000; jump=Math.max(0,Math.sin(t*9))*10*Math.min(1,k)}
    const shake=pose==='sad'?Math.sin(t*14)*3*Math.max(0,(until-performance.now())/4000):0;
    const slump=dim?6:0;
    rig.style.transform=`translate(${tx*8+shake}px,${bob-jump+slump+typ}px) rotateY(${tx*8}deg) rotateX(${-ty*5}deg) rotate(${Math.sin(t*.8)*.8}deg)`;
    for(const k in imgs) imgs[k].style.transform=`scale(${1+br*.008},${1+br*.014})`;
    glow=Math.max(0,glow-dt*.5); const g=dim?.1:.35+glow; rig.style.filter=`drop-shadow(0 0 ${8+glow*22}px rgba(${glow>0?glowCol:'0,240,255'},${g})) drop-shadow(-4px 0 6px rgba(255,43,214,.35))${dim?' brightness(.55) saturate(.5)':''}`;
  })(last);
  return {
    win(){setPose('happy');until=performance.now()+4000;glow=1;glowCol='57,255,136'},
    loss(){setPose('sad');until=performance.now()+4000;glow=.8;glowCol='255,77,109'},
    health(al){dim=!al;box.classList.toggle('sleepy',!al)},
    snap(){const c=document.createElement('canvas'),w=W,h=H;c.width=w*2;c.height=h*2;const y=c.getContext('2d');y.scale(2,2);y.drawImage(cv,0,0,w,h);
      const im=imgs[pose],ih=h*.98,iw=ih*im.naturalWidth/im.naturalHeight;y.shadowColor='rgba(0,240,255,.6)';y.shadowBlur=14;y.drawImage(im,(w-iw)/2,h-ih,iw,ih);return c.toDataURL('image/png')}
  };
}
