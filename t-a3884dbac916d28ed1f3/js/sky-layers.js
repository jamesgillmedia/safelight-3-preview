/* Constellation layers ported as a quiet field: star layers, depth parallax, glimmer, horizon glow, drift.
   Drawn on #stars. Constellation lines stay with the room. No typography engine packed. */
(function(){
  var cv, g, W=0, H=0, dpr=1, FIELD=[], t0=0, ox=0, oy=0, gx=-9, gy=-9, ga=0, raf=0;
  var RM=false; try{ RM=matchMedia('(prefers-reduced-motion: reduce)').matches }catch(e){}
  function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
  function clamp(v,a,b){return v<a?a:v>b?b:v}
  var SOFT=null;
  function softDot(){
    if(SOFT)return SOFT;
    var c=document.createElement('canvas');c.width=c.height=32;var q=c.getContext('2d'),gr=q.createRadialGradient(16,16,0,16,16,16);
    gr.addColorStop(0,'rgba(228,236,248,1)');gr.addColorStop(.28,'rgba(220,230,245,.7)');gr.addColorStop(.6,'rgba(210,224,242,.18)');gr.addColorStop(1,'rgba(210,224,242,0)');
    q.fillStyle=gr;q.fillRect(0,0,32,32);return SOFT=c;
  }
  function build(){
    FIELD=[];
    /* four layers, counts and depth factors after the typography-sky field */
    [[0,150,.22,.42,.42],[1,110,.48,.58,.72],[2,78,.86,.74,.9],[3,40,1.25,.9,1.05]].forEach(function(L){
      var pts=[];for(var i=0;i<L[1];i++)pts.push({u:rnd(L[0]*1000+i),v:rnd(L[0]*3000+i),ph:rnd(L[0]*5100+i),b:.15+.85*Math.pow(rnd(L[0]*700+i),2),r:.4+L[4]*rnd(L[0]*90+i)});
      FIELD.push({i:L[0],f:L[2],a:L[3],near:L[0]>=2,pts:pts});
    });
  }
  function size(){
    if(!cv)return;
    dpr=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
  }
  function pan(){
    var p=0,y=window.scrollY||0;
    try{if(window.GJ12&&GJ12.room){var r=GJ12.room();if(r&&isFinite(r.pan))p=r.pan}}catch(e){}
    return {p:p,y:y};
  }
  function draw(t){
    raf=requestAnimationFrame(draw);
    if(!g)return;
    var red=document.documentElement.classList.contains('red')||document.documentElement.getAttribute('data-theme')==='full';
    var P=pan(), dt=(t-(t0||t))/1000;t0=t;
    var drift=RM?0:((window.GJ12&&GJ12.tune&&GJ12.cam&&GJ12.cam.drift)||0.012);
    if(window.GJ12&&GJ12.cam&&GJ12.cam.drift===0)drift=0;
    if(!RM){ox+=drift*22*dt;oy+=Math.sin(t*0.00011)*0.02}
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
    var ink=red?'255,68,87':'220,230,245';
    var spr=softDot(), m=Math.min(W,H)||390;
    FIELD.forEach(function(L){
      var slide=L.f*0.85, M=m*(.12+L.f*.04), TW=W+2*M, TH=H+2*M;
      var lx=ox*L.f + P.p*L.f*0.12, ly=oy*L.f + P.y*L.f*0.04;
      L.pts.forEach(function(s){
        var rx=s.u*TW+lx, ry=s.v*TH+ly;
        var x=((rx%TW)+TW)%TW-M, y=((ry%TH)+TH)%TH-M;
        var tw=0.5+0.5*Math.sin(s.ph+(t*0.0011*(.4+s.b)));
        var al=L.a*(.22+s.b*.55)*tw;
        if(al<.02)return;
        var rr=s.r*(.7+L.f*.25);
        if(L.near){
          g.globalAlpha=al;var d2=rr*4.2;g.drawImage(spr,x-d2/2,y-d2/2,d2,d2);
        }else{
          g.fillStyle='rgba('+ink+','+al.toFixed(3)+')';
          g.beginPath();g.arc(x,y,rr,0,7);g.fill();
        }
      });
    });
    /* glimmer on touch */
    if(ga>0.02){
      var R=88*ga, gr=g.createRadialGradient(gx,gy,0,gx,gy,R);
      gr.addColorStop(0,'rgba('+(red?'255,68,87':'255,236,220')+','+(0.55*ga)+')');
      gr.addColorStop(.35,'rgba('+(red?'255,68,87':'205,225,255')+','+(0.16*ga)+')');
      gr.addColorStop(1,'rgba(220,230,245,0)');
      g.fillStyle=gr;g.beginPath();g.arc(gx,gy,R,0,7);g.fill();
      ga*=RM?0:0.9;
    }
    g.globalAlpha=1;
  }
  function glimmer(x,y){gx=x;gy=y;ga=1}
  function bind(){
    function at(e){glimmer(e.clientX,e.clientY)}
    ['pointerdown','pointermove'].forEach(function(ev){
      addEventListener(ev,function(e){
        var r=document.getElementById('room');
        var all=document.getElementById('all');
        if(all&&all.classList.contains('on'))return;
        if(r&&r.getBoundingClientRect().bottom>0&&r.getBoundingClientRect().top<innerHeight) at(e);
      },{passive:true});
    });
  }
  function boot(){
    cv=document.getElementById('stars');if(!cv)return;
    g=cv.getContext('2d');
    if(!document.getElementById('horizon')){
      var h=document.createElement('div');h.id='horizon';h.setAttribute('aria-hidden','true');
      document.body.insertBefore(h, document.body.firstChild);
    }
    build();size();bind();
    addEventListener('resize',size);
    if(!raf)raf=requestAnimationFrame(draw);
    window.CKS_SKY={glimmer:glimmer,rebuild:function(){build();size()}};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
