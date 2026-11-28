/* "permanent impermanence" - the new top screen (cks21-pi-top). Concept name for code and comments only: no visible wording.
   A dark night with a few faint stars and a hint of haze (css/pi-top.css), and the CKS constellation along the bottom as stars only.
   Scrolling raises it: each star travels from its place in the bottom band to its place in the sky below (eased, staggered by depth),
   while the sky arrives under it, and then the hierarchy continues as before.
   Star positions are NOT copies: they come from the constellation's own layout (GJ12.constellation(), a read-only hook in site.js);
   without that hook they are read from the live star links in #room, so this file ports to another build on its own.
   One fixed canvas, transforms/alpha only, no layout reads while it draws. Red mode: safelight red glows. Reduced motion: a plain fade. */
(function(){
  'use strict';
  var de=document.documentElement,sec=document.getElementById('pitop'),sky=document.getElementById('sky');
  if(!sec||!sky)return;
  /* the three tunables for Gill: density of the faint night stars, haze strength, how much of the first scroll the rise takes */
  /* starter defaults (Gill, Nov 27 6:54 PM PT): points to tune from, not final.
     density 1 = ~185 night stars at 1440x900, then scaled by viewport area.
     haze 1 = medium (css/pi-top.css). land .5 = mid-height of the viewport when the constellation has risen.
     cue 1 = the wordless scroll cue. ptd, pth, ptr, ptl, ptc, pts, ptw remain the URL switches. */
  var CFG={density:1,haze:1,rise:.9,land:.5,cue:1,tau:70,settle:1,wheelUp:1};
  try{var q=new URLSearchParams(location.search);['density:ptd','haze:pth','rise:ptr','land:ptl','cue:ptc','settle:pts','wheelUp:ptw'].forEach(function(p){p=p.split(':');var v=parseFloat(q.get(p[1]));if(!isNaN(v))CFG[p[0]]=v})}catch(e){}
  var GJPT=window.GJPT=window.GJPT||{};GJPT.cfg=CFG;
  GJPT.top=function(){return sec.offsetHeight||0};           /* the height of this screen, for anything that needs "top of the sky" */
  GJPT.nStars=function(){return BG.length};
  de.style.setProperty('--pt-haze',CFG.haze);
  var cv=document.createElement('canvas');cv.id='pitopc';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);
  var vl=document.createElement('div');vl.id='pitopv';vl.setAttribute('aria-hidden','true');document.body.insertBefore(vl,document.querySelector('main')||cv);
  var cue=document.createElement('div');cue.id='pitopcue';cue.setAttribute('aria-hidden','true');cue.innerHTML='<i></i><b></b>';document.body.appendChild(cue);
  var g=cv.getContext('2d'),W=0,H=0,dpr=1,PH=0,roomL=0,roomT=0,rmeasT=-1e9,reduce=false,raf=0,live=false,d=0,dTarget=0,lastT=0,t0=performance.now(),nStar=0;
  try{var mq=matchMedia('(prefers-reduced-motion: reduce)');reduce=mq.matches;if(mq.addEventListener)mq.addEventListener('change',function(e){reduce=e.matches;wake()})}catch(e){}
  function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
  function sm(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
  function ease(k){return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2}   /* in/out quad: answers the first touch of the scroll, still settles softly */
  /* soft glow sprites, one per mode */
  var SPR={};function spr(red){var k=red?'r':'n';if(SPR[k])return SPR[k];var c=document.createElement('canvas'),s=64;c.width=c.height=s;var x=c.getContext('2d'),gr=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2),h=red?'255,68,87':'214,226,236';
    gr.addColorStop(0,'rgba('+h+',.62)');gr.addColorStop(.3,'rgba('+h+',.22)');gr.addColorStop(1,'rgba('+h+',0)');x.fillStyle=gr;x.fillRect(0,0,s,s);return SPR[k]=c}
  /* the faint night stars of this screen (the sky below keeps the site's own field) */
  var BG=[],REF=1440*900;function bgBuild(){var n=Math.round(185*(W*H)/REF*CFG.density);n=Math.max(24,Math.min(400,n));BG=[];for(var i=0;i<n;i++)BG.push({x:rnd(i+11),y:rnd(i+211)*.94,r:.35+.8*Math.pow(rnd(i+411),3),a:.1+.38*rnd(i+611),par:.12+.5*rnd(i+811),ph:rnd(i+1011)*6.283,w:.0004+.0011*rnd(i+1211)})}
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);PH=sec.offsetHeight;bgBuild();rmeasT=-1e9;wake()}
  addEventListener('resize',size);
  /* where the sky's room sits when the sky has snapped to the top (measured rarely, never per frame) */
  function measure(now){if(now-rmeasT<900)return;rmeasT=now;var room=document.getElementById('room');if(!room)return;var r=room.getBoundingClientRect();PH=sec.offsetHeight;roomL=r.left;roomT=r.top+(window.scrollY||0)-PH}
  /* the constellation, from its own data */
  function readStars(){
    var G=window.GJ12,c=G&&G.constellation&&G.constellation();
    if(c&&c.stars&&c.stars.length)return c.stars;
    /* fallback (no hook): the live star links in #room, relative to the room */
    var room=document.getElementById('room'),as=room?room.querySelectorAll('a.st'):[],rr=room&&room.getBoundingClientRect(),out=[],i,b;
    for(i=0;i<as.length;i++){b=as[i].getBoundingClientRect();out.push({k:as[i].getAttribute('data-k'),eye:as[i].classList.contains('eye'),x:b.left+b.width/2-rr.left,y:b.top+b.height/2-rr.top,s:1,rx:b.left+b.width/2-rr.left-rr.width/2,ry:b.top+b.height/2-rr.top-rr.height*.44,rz:0})}
    return out}
  /* the bottom band: the whole chain, shrunk to a thin strip, keeping its own zigzag and depth. Each star (and each drop star) is one item. */
  var L=[],Lkey='',BAND=0;
  function layout(st){
    var key=st.length+':'+st.map(function(o){return o.k}).join(',')+':'+W+'x'+H;if(key===Lkey&&L.length)return;Lkey=key;L=[];
    var pts=[],i,o,mx=1,my=1,kz,u,v;
    for(i=0;i<st.length;i++){o=st[i];kz=780/(780+(o.rz||0));u=(o.rx==null?o.x:o.rx)*kz;v=(o.ry==null?0:o.ry)*kz;pts.push({u:u,v:v});mx=Math.max(mx,Math.abs(u));my=Math.max(my,Math.abs(v))}
    var pad=Math.max(24,Math.min(70,W*.08)),sx=(W/2-pad)/mx;BAND=Math.min(H*.07,60);var sy=BAND/my,cy=H*.88;
    for(i=0;i<pts.length;i++){o=st[i];kz=780/(780+(o.rz||0));
      var x0=W/2+pts[i].u*sx,y0=cy+pts[i].v*sy,r=rnd(i*7+3);
      L.push({i:i,low:0,eye:!!o.eye,x0:x0,y0:y0,dl:.2*(1-Math.max(0,Math.min(1,(kz-.6)/.5))),r:r});
      if(o.lx!=null)L.push({i:i,low:1,eye:false,x0:x0,y0:y0+BAND*.7,dl:.2*(1-Math.max(0,Math.min(1,(kz-.6)/.5))),r:rnd(i*7+5)})}
  }
  var inited=false,lastSy=0,momoHeld=false,lastDraw=0;
  function frame(now){
    raf=0;
    var sy=window.scrollY||0;
    if(PH<=0)PH=sec.offsetHeight;
    dTarget=Math.max(0,Math.min(1,sy/(PH*Math.max(.2,CFG.rise))));
    if(!inited||Math.abs(sy-lastSy)>PH*.5){d=dTarget;inited=true}   /* a jump (the Mark, Esc, a link, a reload) lands at once; only real scrolling is eased */
    lastSy=sy;
    if(document.hidden||(sy>=PH-1&&d>=.999)){setLive(false);return}
    measure(now);settleCheck(now,sy);
    /* resting at the top, only the slow twinkle moves: 30 fps is plenty; while it is being scrolled, every frame */
    var moving=Math.abs(dTarget-d)>.0005||now-lastMove<250;
    if(!moving&&!reduce&&now-lastDraw<31){raf=requestAnimationFrame(frame);return}
    if(reduce&&!moving&&lastDraw){raf=0;return}
    lastDraw=now;
    var dt=lastT?Math.min(64,now-lastT):16;lastT=now;
    if(reduce)d=dTarget;else{d+=(dTarget-d)*(1-Math.exp(-dt/CFG.tau));if(Math.abs(dTarget-d)<.0004)d=dTarget}
    var red=de.classList.contains('red'),S=spr(red),tt=reduce?0:now-t0;
    setLive(true);
    /* the sky it becomes arrives with it */
    /* set on the elements themselves (not as inherited custom properties: that would restyle the whole page every frame) */
    var va=1-sm(.25,.95,d);sky.style.opacity=sm(.5,.95,d).toFixed(3);vl.style.opacity=va.toFixed(3);
    var mo=document.getElementById('momo-egg');if(mo&&mo.classList.contains('front')){mo.style.opacity=sm(.85,1,d).toFixed(3);momoHeld=true}else if(momoHeld&&mo){mo.style.opacity='';momoHeld=false}
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
    var fade=reduce?1-sm(.3,.8,d):1-sm(.78,1,d);                         /* hand over to the real stars of the sky */
    var core=red?'#ff5a6b':'#e8eef8',i,b,a,x,y;
    /* night stars: drift up a little slower than the page, and let go as the sky arrives */
    var nf=1-sm(.15,.8,d);
    if(nf>.01){g.fillStyle=core;
      for(i=0;i<BG.length;i++){b=BG[i];a=b.a*nf*(reduce?1:(.78+.22*Math.sin(tt*b.w+b.ph)));if(a<.01)continue;x=b.x*W;y=b.y*H-sy*b.par;if(y<-4)continue;
        g.globalAlpha=Math.min(1,a*(red?1.5:1));if(b.r>.85){g.beginPath();g.arc(x,y,b.r,0,6.283);g.fill()}else g.fillRect(x-b.r,y-b.r,b.r*2,b.r*2)}
      g.globalAlpha=1}
    /* the constellation: bottom band -> mid-height of the viewport (CFG.land), keeping its own zigzag */
    var st=readStars(),yShift=0;
    if(st.length){layout(st);
      var sum=0,cnt=0,ii,oo;
      for(ii=0;ii<L.length;ii++){oo=st[L[ii].i];if(!oo)continue;sum+=roomT+(L[ii].low?oo.ly:oo.y);cnt++}
      if(cnt)yShift=(H*CFG.land)-sum/cnt;
      for(i=0;i<L.length;i++){var l=L[i],o=st[l.i];if(!o)continue;
        var e=reduce?0:ease(Math.max(0,Math.min(1,(d-l.dl)/.8))),
          lx=l.low?o.lx:o.x,ly=l.low?o.ly:o.y,sc=(l.low?o.ls:o.s)||1,
          px=l.x0+(roomL+lx-l.x0)*e,py=l.y0+(roomT+ly+yShift-l.y0)*e,
          r0=(l.low?1.1:1.4)+(l.eye?.9:0)+l.r*.8,r1=l.low?4.2*sc:(l.eye?r0:6.2*sc),
          tw=reduce?1:(.82+.18*Math.sin(tt*(.0006+.0007*l.r)+i*2.1)),
          al=(l.low?.62:1)*(.3+.55*e)*tw*fade*(red?1.3:1);
        drawStar(g,S,core,px,py,r0+(r1-r0)*e,al)}
    }
    g.globalAlpha=1;
    /* wordless scroll cue: visible only at rest at the top, fades as soon as scrolling starts */
    if(cue){var ca=CFG.cue?(reduce?.38:.55)*(1-sm(0,.1,Math.max(d,sy/Math.max(1,PH)))):0;cue.style.opacity=ca.toFixed(3);cue.style.display=(CFG.cue&&live&&ca>.01)?'block':'none'}
    raf=requestAnimationFrame(frame);
  }
  function drawStar(g,S,core,x,y,r,a){
    if(a<.01)return;var R=r*6.5;g.globalAlpha=Math.min(1,a*.9);g.drawImage(S,x-R,y-R,R*2,R*2);g.globalAlpha=Math.min(1,a+.12);g.fillStyle=core;g.beginPath();g.arc(x,y,r,0,6.283);g.fill()}

  /* scrolling inside this screen is free (no scroll-snap tug-of-war); on release it settles to whichever end it was heading for */
  var sPrev=window.scrollY||0,dirAcc=0,lastMove=0,touching=false,isFree=false,returning=0;
  function smoothTo(y){try{scrollTo({top:y,behavior:reduce?'instant':'smooth'})}catch(e){scrollTo(0,y)}}
  function updFree(y){var f=y<(PH||sec.offsetHeight)-8;if(f!==isFree){isFree=f;de.classList.toggle('pt-free',f)}}
  addEventListener('touchstart',function(){touching=true},{passive:true});
  addEventListener('touchend',function(){touching=false;lastMove=performance.now()},{passive:true});
  addEventListener('touchcancel',function(){touching=false},{passive:true});
  function settleCheck(now,sy){
    if(!CFG.settle||touching||!lastMove||now-lastMove<170||sy<=PH*.015||sy>=PH-2)return;
    lastMove=0;var tgt=Math.abs(dirAcc)>1?(dirAcc>0?PH:0):(sy>PH/2?PH:0);dirAcc=0;smoothTo(tgt)}
  /* wheel / two-finger swipe up at the very top of the sky goes back up to this screen (the room would otherwise take it as a sideways pan) */
  function overlayOpen(){return de.classList.contains('in')||de.classList.contains('tune-on')||de.classList.contains('mdial-held')||!!document.querySelector('#full.on,#lb.on,#tune,#all.on,#wall.on,#find.on,#subframe.on')}
  var wacc=0,wt=0;
  document.addEventListener('wheel',function(e){
    if(!CFG.wheelUp||e.ctrlKey||e.deltaY>=0||Math.abs(e.deltaY)<Math.abs(e.deltaX))return;
    var y=window.scrollY||0,P=PH||sec.offsetHeight;if(!P||Math.abs(y-P)>3||overlayOpen())return;
    var t=e.target;if(t&&t.closest&&t.closest('#pistudy,#find,input,textarea,select,.player,#wn-card'))return;
    e.preventDefault();e.stopPropagation();
    var now=performance.now(),dy=-e.deltaY*(e.deltaMode===1?16:1);if(now-wt>260)wacc=0;wt=now;wacc+=dy;
    if(wacc>=24&&!returning){returning=1;wacc=0;smoothTo(0);setTimeout(function(){returning=0},900)}
  },{passive:false,capture:true});
  var rising=false;
  function setLive(v){
    if(v!==live){live=v;de.classList.toggle('pt-live',v)}
    if(v!==rising){rising=v;de.classList.toggle('pt-rise',v);if(!v){sky.style.opacity='';vl.style.opacity='';if(cue){cue.style.opacity='0';cue.style.display='none'}var mo=document.getElementById('momo-egg');if(mo)mo.style.opacity='';momoHeld=false}}
  }
  function wake(){if(!raf)raf=requestAnimationFrame(frame)}
  addEventListener('scroll',function(){var sy=window.scrollY||0,dy=sy-sPrev;sPrev=sy;if(dy){lastMove=performance.now();dirAcc=dirAcc*.7+dy}updFree(sy);if(sy<(PH||sec.offsetHeight)-1||d>0)wake()},{passive:true});
  document.addEventListener('visibilitychange',function(){lastT=0;if(!document.hidden)wake()});
  try{if(window.ResizeObserver){new ResizeObserver(function(){rmeasT=-1e9;PH=sec.offsetHeight;wake()}).observe(sky)}}catch(e){}
  addEventListener('load',function(){rmeasT=-1e9;PH=sec.offsetHeight;wake()});
  new MutationObserver(function(){wake()}).observe(de,{attributes:true,attributeFilter:['class']});
  updFree(window.scrollY||0);size();
})();
