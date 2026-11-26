/* Gill James, work examples. The sky, one work per screen, full-screen photographs, sound, 3D, red mode, and tuning behind ?tune. */
(function(){
var de=document.documentElement,LS={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* Bake later: paste the JSON from Tune → save as default into DEFAULTS. TUNE falls back to this. */
var DEFAULTS={glow:.5,stars:1,drift:1,stage:.56,spin:1,depth:1,panel:.74,mx:10,bounce:0,rail:1,bloom:1,spread:1,oblur:.12,osharp:.85,odepth:1,omin:44,strip:'a',moon:1,moonsize:46,moondial:0};
var TUNE={};
try{TUNE=JSON.parse(LS.get('gj.cks12.tune')||'{}')||{}}catch(e){TUNE={}}
function val(k){return TUNE[k]==null?DEFAULTS[k]:TUNE[k]}
window.GJ12={tune:{}};
function apply(){de.style.setProperty('--glow',val('glow'));de.style.setProperty('--stage',val('stage'));
  ['a','b','c'].forEach(function(x){de.classList.toggle('strip-'+x,val('strip')===x)});
  de.classList.toggle('moon-off',!(+val('moon')));de.classList.toggle('moon-dial-off',!(+val('moondial')));de.style.setProperty('--moon',(+val('moonsize')||46)+'px');
  GJ12.tune={spin:+val('spin'),depth:+val('depth'),panel:+val('panel'),bounce:+val('bounce'),rail:+val('rail'),bloom:+val('bloom'),spread:+val('spread'),oblur:+val('oblur'),osharp:+val('osharp'),odepth:+val('odepth'),omin:+val('omin'),glowv:+val('glow'),moon:+val('moon'),moonsize:+val('moonsize'),moondial:+val('moondial')};if(GJ12.reroom)GJ12.reroom();if(GJ12.reedge)GJ12.reedge();de.style.setProperty('--mx',val('mx')+'px');try{dispatchEvent(new Event('resize'))}catch(e){}de.style.setProperty('--persp',Math.round(1100/Math.max(.3,val('depth')))+'px');if(window.GJ12.restar)GJ12.restar()}
apply();
if(LS.get('gj.cks12.red')==='1')de.classList.add('red');
function $(s,r){return (r||document).querySelector(s)}function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function ready(f){if(document.readyState!=='loading')f();else document.addEventListener('DOMContentLoaded',f)}
ready(function(){
  var b=document.createElement('button');b.id='red';b.type='button';b.setAttribute('aria-label','red mode');
  b.addEventListener('click',function(){var on=de.classList.toggle('red');LS.set('gj.cks12.red',on?'1':'0')});
  document.body.appendChild(b);
  stars();wall();allview();fullview();room();plates();lightbox();player();moon();escbar();autoplayClips();$$('#weird-kid video,video[data-silent]').forEach(lockSilent);
  document.addEventListener('wheel',function(e){
    var lb=$('#lb'),fu=$('#full');
    if((lb&&lb.classList.contains('on'))||(fu&&fu.classList.contains('on')))e.preventDefault();
  },{passive:false,capture:true});

  /* Deep Tune stays hidden. Both fingers must stay still for 1.2s. Pinch or two-finger scroll never opens it. It does not open from the URL and does not stay open after a reload. */
  var TP={},tt=0,t0d=0;
  function tcl(){clearTimeout(tt);tt=0}
  function tkeys(){return Object.keys(TP)}
  function tdist(){var k=tkeys();if(k.length<2)return 0;var a=TP[k[0]],b=TP[k[1]];return Math.hypot(a.x-b.x,a.y-b.y)}
  document.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse')return;
    TP[e.pointerId]={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY};
    if(tkeys().length===2&&!tt){t0d=tdist();tt=setTimeout(function(){tt=0;if(tkeys().length===2&&!$('#tune'))tune()},1200)}
    else tcl();
  },true);
  document.addEventListener('pointermove',function(e){
    var q=TP[e.pointerId];if(!q)return;
    q.x=e.clientX;q.y=e.clientY;
    if(Math.hypot(q.x-q.sx,q.y-q.sy)>10)tcl();
    if(tkeys().length===2&&t0d&&Math.abs(tdist()-t0d)>12)tcl();
  },true);
  function tup(e){delete TP[e.pointerId];tcl()}
  document.addEventListener('pointerup',tup,true);
  document.addEventListener('pointercancel',tup,true);
  GJ12.deepTune=function(){if(!$('#tune'))tune()};
});
/* ---- the star field: quiet, with depth as you move down ---- */
function stars(){
  var cv=$('#stars');if(!cv)return;var g=cv.getContext('2d'),S=[],W=0,H=0,dpr=1,last=-1,t0=performance.now();
  function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
  function build(){S=[];var n=Math.round(150*val('stars'));for(var i=0;i<n;i++)S.push({x:rnd(i),y:rnd(i+500),d:.15+.85*rnd(i+900),r:.4+1.1*Math.pow(rnd(i+1300),3),p:rnd(i+1700)*6.28})}
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;last=-1}
  function draw(t){
    var sy=window.scrollY||0,tw=Math.floor((t-t0)/90);
    if(sy!==last||tw!==draw.tw){last=sy;draw.tw=tw;
      g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
      var red=de.classList.contains('red'),span=H*1.5,dr=val('drift');
      for(var i=0;i<S.length;i++){var s=S[i],y=((s.y*span-sy*s.d*.18*dr)%span+span)%span-H*.25,a=(.35+.65*s.d)*(.72+.28*Math.sin(s.p+(t-t0)*.0011*(.5+s.d)));
        g.globalAlpha=a;g.fillStyle=red?'#ff4457':'#eef3f5';g.beginPath();g.arc(s.x*W,y,s.r*(.6+.6*s.d),0,6.283);g.fill()}
      g.globalAlpha=1}
    requestAnimationFrame(draw)}
  GJ12.restar=function(){build();last=-1};
  build();size();addEventListener('resize',size);requestAnimationFrame(draw);
}
/* pictures: show what is already in hand at once, then the full one as soon as it has decoded. Nothing waits. */
var READY={};
function warm(src){if(!src||READY[src])return READY[src]||Promise.resolve();var im=new Image();im.decoding='async';im.src=src;
  READY[src]=(im.decode?im.decode():new Promise(function(ok){im.onload=ok;im.onerror=ok})).then(function(){READY[src]=true},function(){READY[src]=true});return READY[src]}
function sharp(img,big,th){if(!big)return;img._want=big;if(READY[big]===true||!th){if(img.getAttribute('src')!==big)img.src=big;return}
  if(img.getAttribute('src')!==th)img.src=th;var w=warm(big);if(w&&w.then)w.then(function(){if(img._want===big)img.src=big})}
function idle(f){(window.requestIdleCallback||function(g){return setTimeout(g,200)})(f)}
/* step out of an overlay that pushed a history entry, then carry on once the browser has gone back */
function afterBack(key,f){if(history.state&&history.state[key]){var done=0,go=function(){if(done)return;done=1;removeEventListener('popstate',go);setTimeout(f,0)};addEventListener('popstate',go);setTimeout(go,400);try{history.back()}catch(e){go()}}else setTimeout(f,0)}
/* ---- pinch: two fingers (and Safari's own gesture events, and ctrl + wheel on a trackpad). cb(scale, done, x, y) ---- */
function pinchOn(el,cb){
  var P={},d0=0,sc=1,cx=0,cy=0,on=0;
  el.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')return;P[e.pointerId]=[e.clientX,e.clientY];var k=Object.keys(P);if(k.length===2){d0=Math.hypot(P[k[0]][0]-P[k[1]][0],P[k[0]][1]-P[k[1]][1]);sc=1;on=1}});
  el.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;P[e.pointerId]=[e.clientX,e.clientY];var k=Object.keys(P);if(k.length<2||!on)return;
    var d=Math.hypot(P[k[0]][0]-P[k[1]][0],P[k[0]][1]-P[k[1]][1]);sc=d/(d0||1);cx=(P[k[0]][0]+P[k[1]][0])/2;cy=(P[k[0]][1]+P[k[1]][1])/2;cb(sc,false,cx,cy)});
  function up(e){if(!P[e.pointerId])return;delete P[e.pointerId];if(on&&Object.keys(P).length<2){on=0;cb(sc,true,cx,cy)}}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('gesturestart',function(e){e.preventDefault();on=0;P={}});
  el.addEventListener('gesturechange',function(e){e.preventDefault();sc=e.scale;cb(sc,false,e.clientX,e.clientY)});
  el.addEventListener('gestureend',function(e){e.preventDefault();cb(e.scale||sc,true,e.clientX,e.clientY)});
  var wt=0,ws=1;el.addEventListener('wheel',function(e){if(!e.ctrlKey)return;e.preventDefault();ws*=Math.exp(-e.deltaY*.01);cb(ws,false,e.clientX,e.clientY);clearTimeout(wt);wt=setTimeout(function(){var v=ws;ws=1;cb(v,true,e.clientX,e.clientY)},220)},{passive:false});
}
/* ---- the wall: every image of one piece, at the density you pinch to. Pinch closer for fewer and bigger, further for more. ---- */
var WALL={};
function wall(){
  var w=document.createElement('div');w.id='wall';w.setAttribute('role','dialog');
  w.innerHTML='<div class="wtop"><button type="button" class="pill wx">‹ back</button><span class="wt"></span><span class="wz"><button type="button" class="pill" data-z="-1" aria-label="more, smaller">−</button><button type="button" class="pill" data-z="1" aria-label="fewer, bigger">+</button></span></div><div class="wgrid"></div>';
  document.body.appendChild(w);
  var grid=$('.wgrid',w),ttl=$('.wt',w),k=null,cols=3,maxc=3,items=[];
  function maxCols(n){return Math.max(2,Math.min(innerWidth>900?9:6,Math.ceil(Math.sqrt(n*1.6))))}
  function setCols(c){cols=Math.max(1,Math.min(maxc,Math.round(c)));grid.style.setProperty('--cols',cols);w.setAttribute('data-cols',cols)}
  function shut(){w.classList.remove('on');document.body.style.overflow='';de.style.scrollSnapType='';grid.style.transform=''}
  function close(){if(history.state&&history.state.wall)history.back();else shut()}
  WALL.open=function(id,c,ox,oy){var G=GAL[id];if(!G||!G.items)return false;items=G.items();if(!items.length)return false;k=id;
    var p=document.getElementById(id);ttl.textContent=$('h2',p).textContent+' · '+items.length;w.style.setProperty('--c',p.getAttribute('data-c'));
    maxc=maxCols(items.length);setCols(c||maxc);
    grid.innerHTML=items.map(function(it,i){return '<button type="button" data-i="'+i+'" style="--d:'+Math.min(i,24)*14+'ms"><img src="'+it.th+'" alt="" loading="lazy" draggable="false"></button>'}).join('');
    /* each tile learns its photo's shape, so a single column shows whole photos without overlap */
    $$('img',grid).forEach(function(im){function f(){if(im.naturalWidth)im.parentNode.style.setProperty('--ar',(im.naturalHeight/im.naturalWidth*100).toFixed(2)+'%')}if(im.complete)f();else im.addEventListener('load',f)});
    grid.scrollTop=0;grid.style.transformOrigin=(ox==null?'50%':ox+'px')+' '+(oy==null?'30%':oy+'px');
    w.classList.remove('on');void w.offsetWidth;w.classList.add('on');document.body.style.overflow='hidden';de.style.scrollSnapType='none';
    try{history.pushState({wall:1},'')}catch(e){}return true};
  WALL.state=function(){return {on:w.classList.contains('on'),k:k,cols:cols,max:maxc,n:items.length}};WALL.shut=function(){shut();if(GJ12.now)GJ12.now()};
  function pick(i){var it=items[i],id=k;shut();afterBack('wall',function(){
    var p=document.getElementById(id);de.style.scrollBehavior='auto';p.scrollIntoView();de.style.scrollBehavior='';setTimeout(function(){GAL[id].showBig(it.big)},60)})}
  function toSky(){var id=k;shut();afterBack('wall',function(){ALLV.open(id)})}
  addEventListener('popstate',function(){if(w.classList.contains('on'))shut()});
  $('.wx',w).addEventListener('click',close);
  $('.wz',w).addEventListener('click',function(e){var b=e.target.closest('[data-z]');if(!b)return;var z=+b.getAttribute('data-z');if(z<0&&cols>=maxc){toSky();return}if(z>0&&cols<=1)return;setCols(cols-z)});
  grid.addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(b&&!WALL._p)pick(+b.getAttribute('data-i'))});
  pinchOn(w,function(sc,done,x,y){
    WALL._p=1;var want=cols/sc;
    if(!done){grid.style.transformOrigin=x+'px '+(y+grid.scrollTop)+'px';grid.style.transition='none';grid.style.transform='scale('+Math.max(.5,Math.min(2.4,sc))+')';return}
    grid.style.transition='';grid.style.transform='';setTimeout(function(){WALL._p=0},250);
    if(want>maxc*1.3){toSky();return}
    if(want<.7&&cols===1){var el=document.elementFromPoint(x,y),b=el&&el.closest&&el.closest('[data-i]');if(b){pick(+b.getAttribute('data-i'));return}}
    setCols(want)});
  document.addEventListener('keydown',function(e){if(w.classList.contains('on')&&e.key==='Escape')close()});
}
/* ---- one more step back: every board at once. Free zoom anywhere, scrolling snaps to boards. Zoom far enough into a board and it opens. ---- */
var ALLV={};
function allview(){
  var v=document.createElement('div');v.id='all';v.setAttribute('role','dialog');v.setAttribute('aria-label','every piece at once');
  v.innerHTML='<div class="wtop"><button type="button" class="pill ax">‹ sky</button><span class="wt">every piece</span><span class="wz"><button type="button" class="pill" data-z="-1" aria-label="step back, denser">−</button><button type="button" class="pill" data-z="1" aria-label="closer">+</button></span></div><div class="ascroll"><div class="aboards"></div></div>';
  document.body.appendChild(v);
  var sc=$('.ascroll',v),bd=$('.aboards',v),z=1,built=0,ZMIN=.3,ZMAX=1.9;
  function build(){if(built)return;built=1;var h='',FR=0;
    $$('.plate').forEach(function(p){var id=p.id,G=GAL[id],its=G&&G.items?G.items():[],c=p.getAttribute('data-c'),t=$('h2',p).textContent;
      if(!its.length){var orb=document.querySelector('#room a.st[data-k="'+id+'"] img.orb');its=orb?[{th:orb.getAttribute('src'),big:''}]:[]}
      h+='<section class="ab" data-k="'+id+'" style="--c:'+c+'"><h3><button type="button" data-open="'+id+'">'+t.replace(/</g,'&lt;')+'<small>'+(its.length>1?its.length:'')+'</small></button></h3><div class="ag" style="--n:'+Math.max(1,Math.min(4,Math.ceil(Math.sqrt(its.length||1))))+'">'+
        (its.length?its.map(function(it,i){return '<button type="button" data-k="'+id+'" data-big="'+(it.big||'')+'"'+(i?'':' data-l="'+t.replace(/"/g,'&quot;')+'"')+' data-f="'+(++FR<10?'0':'')+FR+'"><img src="'+it.th+'" alt="" loading="lazy" draggable="false"></button>'}).join(''):'<button type="button" class="txt" data-k="'+id+'" data-big="">open</button>')+'</div></section>'});
    bd.innerHTML=h}
  function nearTile(x,y){var best=null,bdist=1e12;$$('.ag button',bd).forEach(function(t){var r=t.getBoundingClientRect(),dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom),d=dx*dx+dy*dy;if(d<bdist){bdist=d;best=t}});return best}
  function setZ(nz,x,y){nz=Math.max(ZMIN,Math.min(ZMAX,nz));var q=sc.getBoundingClientRect();if(x==null){x=q.left+q.width/2;y=q.top+q.height*.4}
    var t=nearTile(x,y),r0=t&&t.getBoundingClientRect(),u=r0?(x-r0.left)/Math.max(1,r0.width):0,w=r0?(y-r0.top)/Math.max(1,r0.height):0;
    z=nz;bd.style.zoom=z;v.style.setProperty('--z',z);v.classList.toggle('far',z<.4);
    if(t){var r1=t.getBoundingClientRect();sc.scrollLeft+=r1.left+u*r1.width-x;sc.scrollTop+=r1.top+w*r1.height-y}
    v.classList.toggle('far',z<.4);$('.wt',v).textContent=z<.4?'contact sheet · everything':'every piece'}
  function shut(){v.classList.remove('on');document.body.style.overflow='';de.style.scrollSnapType=''}
  function close(){if(history.state&&history.state.all)history.back();else shut()}
  function boardAt(x,y){var t=nearTile(x,y);return t?t.getAttribute('data-k'):null}
  function leave(f){shut();afterBack('all',f)}
  function goPlate(id,big){leave(function(){var p=document.getElementById(id);de.style.scrollBehavior='auto';p.scrollIntoView();de.style.scrollBehavior='';if(big&&GAL[id]&&GAL[id].showBig)setTimeout(function(){GAL[id].showBig(big)},60)})}
  function openBoard(id){leave(function(){if(!WALL.open(id,0)){var p=document.getElementById(id);de.style.scrollBehavior='auto';p.scrollIntoView();de.style.scrollBehavior=''}})}
  ALLV.open=function(id){build();v.classList.add('on');document.body.style.overflow='hidden';de.style.scrollSnapType='none';
    setZ(innerWidth>900?.5:.46);sc.scrollTop=0;sc.scrollLeft=0;
    if(id){var b=bd.querySelector('.ab[data-k="'+id+'"]');if(b){var r=b.getBoundingClientRect(),q=sc.getBoundingClientRect();sc.scrollTop+=r.top-q.top-12;b.classList.remove('here');void b.offsetWidth;b.classList.add('here')}}
    try{history.pushState({all:1},'')}catch(e){}if(GJ12.now)GJ12.now()};
  ALLV.state=function(){return {on:v.classList.contains('on'),z:z,boards:bd.children.length,top:Math.round(sc.scrollTop)}};
  ALLV.zoom=function(nz){setZ(nz)};ALLV.shut=function(){shut();if(GJ12.now)GJ12.now()};
  addEventListener('popstate',function(){if(v.classList.contains('on'))shut()});
  $('.ax',v).addEventListener('click',function(){leave(function(){de.style.scrollBehavior='auto';document.getElementById('sky').scrollIntoView();de.style.scrollBehavior=''})});
  $('.wz',v).addEventListener('click',function(e){var b=e.target.closest('[data-z]');if(!b)return;var d=+b.getAttribute('data-z'),nz=z*(d>0?1.45:1/1.45);
    if(d<0&&z>.4&&nz<.4)nz=.3;if(d>0&&z<.4)nz=innerWidth>900?.5:.46;
    if(d>0&&z>=ZMAX*.98){var r=sc.getBoundingClientRect(),id=boardAt(r.left+r.width/2,r.top+r.height*.4);if(id)openBoard(id);return}
    sc.style.scrollBehavior='auto';setZ(nz);sc.style.scrollBehavior=''});
  bd.addEventListener('click',function(e){if(ALLV._p)return;var o=e.target.closest('[data-open]');if(o){openBoard(o.getAttribute('data-open'));return}
    var b=e.target.closest('.ag button');if(b)goPlate(b.getAttribute('data-k'),b.getAttribute('data-big'))});
  var z0=1;
  pinchOn(v,function(s2,done,x,y){
    if(!ALLV._p){ALLV._p=1;z0=z;sc.style.scrollSnapType='none';sc.style.scrollBehavior='auto'}
    var want=z0*s2;setZ(want,x,y);
    if(done){setTimeout(function(){ALLV._p=0},250);sc.style.scrollSnapType='';sc.style.scrollBehavior='';
      if(want>ZMAX*1.12){var id=boardAt(x,y);if(id)openBoard(id)}}});
  document.addEventListener('keydown',function(e){if(v.classList.contains('on')&&e.key==='Escape')close()});
  GJ12.all=ALLV;GJ12.wall=WALL;
}
/* ---- the whole picture: where a pinch into a star comes to rest. Pinch again to go deeper, pinch out to return, tap to open the work. ---- */
var FULL={};
function fullview(){
  var f=document.createElement('div');f.id='full';f.innerHTML='<img alt="" draggable="false">';document.body.appendChild(f);
  var im=$('img',f),id=null,busy=0,g=0,stale=0;
  function shut(){f.classList.remove('on','in');document.body.style.overflow='';de.style.scrollSnapType=''}
  FULL.open=function(k,big,small,r){if(f.classList.contains('on')&&id===k)return true;id=k;busy=1;g=0;stale=0;var p=document.getElementById(k);f.style.setProperty('--c',p?p.getAttribute('data-c'):'214,226,236');
    im._want=big;im.src=(READY[big]===true||!small)?big:small;if(READY[big]!==true){var w=warm(big);if(w&&w.then)w.then(function(){if(im._want===big)im.src=big})}
    f.classList.add('on');document.body.style.overflow='hidden';de.style.scrollSnapType='none';
    var cx=r.left+r.width/2-innerWidth/2,cy=r.top+r.height/2-innerHeight/2,sc=Math.max(.08,r.width/Math.min(innerWidth,innerHeight*.9));
    im.style.transition='none';im.style.transform='translate('+cx+'px,'+cy+'px) scale('+sc+')';im.style.borderRadius='50%';void im.offsetWidth;
    im.style.transition='';im.style.transform='';im.style.borderRadius='';f.classList.add('in');setTimeout(function(){busy=0},420);
    try{history.pushState({full:1},'')}catch(e){}return true};
  FULL.state=function(){return {on:f.classList.contains('on'),k:id,src:(im.getAttribute('src')||'').split('/').pop()}};FULL.shut=shut;
  addEventListener('popstate',function(){if(f.classList.contains('on'))shut()});
  function deeper(){var k=id;shut();afterBack('full',function(){if(!WALL.open(k,0)){var p=document.getElementById(k);de.style.scrollBehavior='auto';p.scrollIntoView();de.style.scrollBehavior=''}})}
  function out(){var k=id;shut();afterBack('full',function(){if(GJ12.roomFrom)GJ12.roomFrom(k)})}
  function work(){var k=id;shut();afterBack('full',function(){var p=document.getElementById(k);de.style.scrollBehavior='auto';p.scrollIntoView();de.style.scrollBehavior=''})}
  /* the pinch that brought you here ends here: a new two-finger pinch can go deeper or back. Wheel on desktop only zooms or pans this picture; it never leaves. */
  pinchOn(f,function(sc,done){if(FULL._wheel)return;FULL._p=1;
    if(!g){g=1;stale=busy}
    if(!done){if(!stale){im.style.transition='none';im.style.transform='scale('+Math.max(.5,Math.min(1.6,sc)).toFixed(3)+')'}return}
    g=0;im.style.transition='';im.style.transform='';setTimeout(function(){FULL._p=0},250);
    if(stale||busy){stale=0;return}if(sc>1.15)deeper();else if(sc<.85)out()});
  var fz=1,fpx=0,fpy=0;
  function fullFit(){fz=1;fpx=0;fpy=0;im.style.transform='';}
  f.addEventListener('wheel',function(e){
    if(!f.classList.contains('on'))return;
    e.preventDefault();e.stopPropagation();
    FULL._wheel=1;clearTimeout(fullFit.t);fullFit.t=setTimeout(function(){FULL._wheel=0},240);
    if(e.ctrlKey){fz=Math.max(1,Math.min(4,fz*Math.exp(-e.deltaY*.01)));if(fz===1){fpx=0;fpy=0}}
    else if(fz>1){fpx-=e.deltaX;fpy-=e.deltaY}
    else return;
    im.style.transition='none';im.style.transform='translate('+fpx+'px,'+fpy+'px) scale('+fz+')';
  },{passive:false,capture:true});
  var _fshut=shut;shut=function(){fullFit();_fshut()};FULL.shut=shut;
  f.addEventListener('click',function(){if(!FULL._p&&!FULL._wheel&&!busy)work()});
  document.addEventListener('keydown',function(e){if(f.classList.contains('on')&&e.key==='Escape')out()});
  GJ12.full=FULL;
}
/* ---- the constellation room: stars on a zigzag chain with drop lines, in depth. Drag sideways to move along it. ---- */
function room(){
  var el=$('#room');if(!el)return;var cv=$('canvas',el),g=cv.getContext('2d'),as=$$('a.st',el),n=as.length,W=0,H=0,dpr=1,
      YS=[70,-25,95,-75,30,-120,-10,-135,-15,-95,60,-55,80,-15],ZS=[60,-110,130,-40,-150,90,0,-90,140,-130,50,-70,120,-30],N=[],mid=0,pan=0,tp=0,vel=0,drag=null,moved=0,raf=0,t0=performance.now(),zoom=1,tz=1,foc=-1;
  as.forEach(function(a,i){if(a.classList.contains('eye'))mid=i});
  function rnd(i){var x=Math.sin(i*91.7+13.3)*43758.5453;return x-Math.floor(x)}
  function build(){var sp=Math.max(96,Math.min(150,W*.9/n))*(((window.GJ12.tune||{}).spread)||1),k=Math.min(1.25,Math.max(.8,H/520));N=[];
    /* v26: room on both sides of the Spirit Eye, so its neighbours can bloom into their covers */
    for(var i=0;i<n;i++){var eye=i===mid,y=(eye?-10:YS[i%YS.length])*k,gap=i===mid?0:(i<mid?-1:1)*sp*.95,o={a:as[i],x:(i-mid)*sp+gap,y:y,z:eye?0:ZS[i%ZS.length],eye:eye,low:null};
      if(!eye&&y<0||(!eye&&i%3===0))o.low={y:(150+rnd(i)*90)*k,dx:(rnd(i+40)-.5)*14};N.push(o)}}
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=el.clientWidth;H=el.clientHeight;cv.width=W*dpr;cv.height=H*dpr;build();clampPan();go()}
  function lim(){return N.length?[N[0].x,N[n-1].x]:[0,0]}
  function clampPan(){var l=lim();tp=Math.max(l[0],Math.min(l[1],tp))}
  var SPR={};function sprite(h){if(SPR[h])return SPR[h];var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'rgba('+h+',.62)');gr.addColorStop(.3,'rgba('+h+',.22)');gr.addColorStop(1,'rgba('+h+',0)');q.fillStyle=gr;q.fillRect(0,0,128,128);SPR[h]=c;return c}
  function TT(k,d){var t=window.GJ12.tune||{};return t[k]==null?d:t[k]}
  function proj(x,y,z,yaw){z=z*TT('odepth',1);yaw=yaw*Math.min(1.6,.4+.6*TT('odepth',1));var X=x-pan,c=Math.cos(yaw),s=Math.sin(yaw),xr=X*c-z*s,zr=X*s+z*c,f=780,k=f/(f+zr)*zoom,fy=foc>=0?N[foc].y*(1-1/zoom):0;return [W/2+xr*k,H*.44+(y-fy)*k,k]}
  function draw(t){
    var red=de.classList.contains('red'),l=lim(),yaw=((pan/(Math.max(1,l[1]-l[0])/2))*.32)+Math.sin((t-t0)*.00035)*.035,P=[],i;
    for(i=0;i<n;i++)P.push(proj(N[i].x,N[i].y,N[i].z,yaw));
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
    var line=red?'rgba(255,68,87,.45)':'rgba(255,214,214,.42)',core=red?'#ff5a6b':'#fff3f0',halo=red?'255,68,87':'255,196,196';
    g.lineWidth=1;g.strokeStyle=line;g.beginPath();for(i=0;i<n;i++){if(i)g.lineTo(P[i][0],P[i][1]);else g.moveTo(P[i][0],P[i][1])}g.stroke();
    var gw=((window.GJ12.tune||{}).glowv==null?.5:GJ12.tune.glowv)/.5,SP=sprite(halo);
    function orb(x,y,r,a){var R=r*6.5;g.globalAlpha=Math.min(1,a*gw);g.drawImage(SP,x-R,y-R,R*2,R*2);g.globalAlpha=Math.min(1,a+.15);g.fillStyle=core;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.globalAlpha=1}
    var BASE=Math.max(96,Math.min(170,W*.34));
    for(i=0;i<n;i++){var o=N[i],p=P[i],near=Math.max(0,1-Math.abs(p[0]-W/2)/(W*.75)),a=.55+.45*near;
      if(o.low){var q=proj(o.x+o.low.dx,o.low.y,o.z,yaw);g.strokeStyle=line;g.globalAlpha=.8;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();g.globalAlpha=1;orb(q[0],q[1],4.2*q[2],a*.8)}
      var cl=Math.max(0,Math.min(1,(1-Math.abs(p[0]-W/2)/Math.min(W*.5,300)-.4)/.45)),bl=o.eye?0:Math.max(cl*cl*(3-2*cl)*.9*(((window.GJ12.tune||{}).bloom==null?1:GJ12.tune.bloom)),i===foc?Math.min(2.3,(zoom-1)*1.15):0);
      if(o.bl==null)o.bl=0;o.bl+=(bl-o.bl)*.16;
      if(!o.eye){var os=Math.round(BASE*Math.max(o.bl,TT('omin',44)/BASE)*Math.min(1.25,p[2]/Math.max(.001,zoom))*2)/2,bo=TT('omin',44)>0?1:Math.min(1,o.bl*2.6),df=(TT('oblur',.12)*Math.max(0,1-near*1.15)*7).toFixed(1);
        o._w=os;o._px=p[0];o._py=p[1];if(o._bo!==bo){o._bo=bo;o.a.style.setProperty('--bo',bo.toFixed(3))}if(o._df!==df){o._df=df;o.a.style.setProperty('--df',df+'px')}}
      if(!o.eye)orb(p[0],p[1],(o.sel?8.5:6.2)*p[2],(o.sel?1.2:a)*(1-Math.min(.75,o.bl)));
      if(o.eye){o._px=p[0];o._py=p[1];o._sc=Math.max(.7,Math.min(1.15,H/470))}o.a.style.transform='translate('+p[0].toFixed(1)+'px,'+p[1].toFixed(1)+'px) scale('+(o.eye?o._sc:1).toFixed(3)+')';o.a.style.setProperty('--o',((.45+.55*near)*(foc>=0&&i!==foc?Math.max(0,1-(zoom-1)/.9):1)).toFixed(2));o.a.style.zIndex=o.eye?3:2}
    /* bloomed stars never cover each other: the one nearer the middle keeps its size, a neighbour gives way */
    var L=N.filter(function(o){return !o.eye}).sort(function(u,v){return Math.abs(u._px-W/2)-Math.abs(v._px-W/2)}),done=[];
    /* the Spirit Eye holds its place: neighbours give way to it, and a name it would cover fades out */
    var EY=N.filter(function(o){return o.eye&&o._px!=null}).map(function(o){if(!o._elw){var lb=o.a.querySelector('b');o._elw=lb?lb.offsetWidth:1}return {_px:o._px,_py:o._py,_s:120*o._sc,_lw:o._elw*o._sc,a:o.a,eye:1}});done=EY.slice();
    L.forEach(function(o,j){var r=o._w/2;done.forEach(function(q){var d=Math.hypot(o._px-q._px,o._py-q._py),rq=q._s/2;if(r>0&&d<r+rq+8)r=Math.max(0,d-rq-8);
        if(r>0){if(!q._lw){var lb=q.a.querySelector('b');q._lw=lb?lb.offsetWidth:0}var hw=q._lw/2+4,y1=q._py-rq-38,y0=q._py-rq-10,nx=Math.max(q._px-hw,Math.min(o._px,q._px+hw)),ny=Math.max(y1,Math.min(o._py,y0)),dl=Math.hypot(o._px-nx,o._py-ny);if(dl<r+12)r=Math.max(0,dl-12)}});
      if(r<9)r=0;o._s=Math.round(r*4)/2;if(o._os!==o._s){o._os=o._s;o.a.style.setProperty('--os',o._s+'px')}
      var lo=1;EY.forEach(function(q){if(!o._lw){var lb=o.a.querySelector('b');o._lw=lb?lb.offsetWidth:0}var R=q._s/2+6,hw=o._lw/2,y1=o._py-o._s/2-36,y0=o._py-o._s/2-12,nx=Math.max(o._px-hw,Math.min(q._px,o._px+hw)),ny=Math.max(y1,Math.min(q._py,y0));if(Math.hypot(q._px-nx,q._py-ny)<R)lo=0});
      o._elo=lo;o.a.style.zIndex=2+(L.length-j>0?0:0);done.push(o)});
    /* v28: every star shows its icon, and no icon sits on another star's name: the icon gives way, down to a small floor */
    var MINR=Math.min(16,TT('omin',44)/2);
    function lab(q){if(!q._lw){var lb=q.a.querySelector('b');q._lw=lb?lb.offsetWidth:0}var hw=q._lw/2+4,y0=q._py-q._s/2-12;return [q._px-hw,y0-24,q._px+hw,y0]}
    function dr(o,R){var nx=Math.max(R[0],Math.min(o._px,R[2])),ny=Math.max(R[1],Math.min(o._py,R[3]));return Math.hypot(o._px-nx,o._py-ny)}
    for(var pass=0;pass<2;pass++)L.forEach(function(o){if(!(o._s>0))return;var r=o._s/2;L.forEach(function(q){if(q===o)return;var d=dr(o,lab(q));if(d<r+4)r=Math.max(MINR,d-4)});
      if(r*2<o._s){o._s=Math.round(r*4)/2;if(o._os!==o._s){o._os=o._s;o.a.style.setProperty('--os',o._s+'px')}}});
    L.forEach(function(q){var lo=q._elo==null?1:q._elo,R=lab(q),hit=function(R){return L.some(function(o){return o!==q&&o._s>0&&dr(o,R)<o._s/2-2})},dn=0;
      if(hit(R)){var hw=(R[2]-R[0])/2,y0=q._py+q._s/2+10,R2=[q._px-hw,y0,q._px+hw,y0+24];if(!hit(R2))dn=1;else lo=0}
      if(q._dn!==dn){q._dn=dn;q.a.classList.toggle('lb',!!dn)}if(q._lo!==lo){q._lo=lo;q.a.style.setProperty('--lo',lo)}});
  }
  function run(t){raf=0;var moving=0;var rr=el.getBoundingClientRect();if(rr.bottom<-40||rr.top>innerHeight+40||document.hidden){raf=requestAnimationFrame(run);return}
    if(!drag){if(Math.abs(vel)>.05){tp+=vel;vel*=.93;clampPan();moving=1}var d=tp-pan;if(Math.abs(d)>.3){pan+=d*.18;moving=1}else pan=tp}
    if(Math.abs(tz-zoom)>.003)zoom+=(tz-zoom)*.2;else zoom=tz;if(zoom<=1.001&&tz<=1)foc=-1;
    draw(t||performance.now());raf=requestAnimationFrame(run)}
  function go(){if(!raf)raf=requestAnimationFrame(run)}
  el.addEventListener('pointerdown',function(e){drag={x:e.clientX,p:tp,lx:e.clientX,t:performance.now(),v:0};moved=0;vel=0});
  el.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x;if(Math.abs(dx)>6){if(!moved){moved=1;try{el.setPointerCapture(e.pointerId)}catch(x){}}}
    if(!moved)return;var now=performance.now();drag.v=-(e.clientX-drag.lx)/Math.max(1,now-drag.t)*16;drag.lx=e.clientX;drag.t=now;tp=drag.p-dx*1.15;var l=lim();if(tp<l[0])tp=l[0]-(l[0]-tp)*.3;if(tp>l[1])tp=l[1]+(tp-l[1])*.3;pan=tp});
  function up(){if(!drag)return;var d=drag;drag=null;if(moved){vel=d.v;clampPan();el._sw=Date.now()}}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  as.forEach(function(a,i){a.addEventListener('click',function(e){e.preventDefault();if(el._sw&&Date.now()-el._sw<350)return;var id=a.getAttribute('data-k');if((CUR&&CUR.id===id)||(FULL.state&&FULL.state().on&&FULL.state().k===id))return;if(GJ12._closedAt&&Date.now()-GJ12._closedAt<450&&id===GJ12._closedId)return;N.forEach(function(o){o.sel=0});N[i].sel=1;if(GJ12.gotoPlate)GJ12.gotoPlate(id);else location.hash='#'+id});a.addEventListener('dragstart',function(e){e.preventDefault()})});
  el.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();tp+=e.deltaX;clampPan()}},{passive:false});
  /* the objects in the stars use a sharper file made for this size, fetched and decoded ahead so nothing pops in */
  function edge(){de.style.setProperty('--oedge',(1+TT('oblur',.12)*30).toFixed(1)+'%');de.style.setProperty('--orim',TT('osharp',.85).toFixed(2));de.style.setProperty('--oshade',(Math.min(1,TT('odepth',1))*.55).toFixed(2))}
  edge();GJ12.reedge=edge;
  idle(function(){var q=Promise.resolve();N.forEach(function(o){var im=$('img.orb',o.a);if(!im)return;var k=o.a.getAttribute('data-k'),src='media/orbs/'+k+'.jpg';
    q=q.then(function(){return new Promise(function(ok){var t=new Image();t.decoding='async';t.onload=function(){(t.decode?t.decode():Promise.resolve()).then(function(){im.src=src;ok()},function(){ok()})};t.onerror=function(){ok()};t.src=src})})})});
  function hero(i){var id=N[i].a.getAttribute('data-k'),G=GAL[id],it=G&&G.items?G.items():[];return it.length?it[0].big:''}
  /* pinch toward a star: the room closes in on it, and at its closest the star opens into the wall of that piece */
  var z0=1;
  function nearestStar(x){var r=el.getBoundingClientRect(),best=0,bd=1e9;N.forEach(function(o,i){var q=o.a.getBoundingClientRect(),d=Math.abs(q.left+q.width/2-x);if(d<bd){bd=d;best=i}});return best}
  function openStar(i){var o=N[i],id=o.a.getAttribute('data-k'),im=$('img.orb',o.a)||$('img',o.a),q=(im||o.a).getBoundingClientRect(),h=hero(i);
    if((FULL.state&&FULL.state().on&&FULL.state().k===id)||(CUR&&CUR.id===id))return;
    if(!h||!FULL.open(id,h,im?(im.currentSrc||im.src):'',q)){location.hash='#'+id}
    setTimeout(function(){zoom=tz=1;foc=-1},600)}
  pinchOn(el,function(sc,done,x){
    if(FULL.state&&FULL.state().on)return;
    if(foc<0&&zoom<=1.01&&sc<1){if(done){if(sc<.85)ALLV.open()}else{el.style.transform='scale('+Math.max(.8,sc).toFixed(3)+')';el.style.opacity=Math.max(.3,1-(1-sc)*2)}if(done){el.style.transform='';el.style.opacity=''}return}
    el.style.transform='';el.style.opacity='';
    if(foc<0){foc=nearestStar(x);z0=zoom;tp=N[foc].x;vel=0;drag=null;warm(hero(foc))}
    var z=Math.max(1,Math.min(3.2,z0*sc));
    if(!done){zoom=tz=z;return}
    if(z>=1.7){tz=3.2;var i=foc;setTimeout(function(){openStar(i)},180)}else{tz=1}});
  GJ12.roomFrom=function(id){N.forEach(function(o,i){if(o.a.getAttribute('data-k')===id)foc=i});if(foc<0)return;pan=tp=N[foc].x;zoom=3.2;tz=1};
  GJ12.roomZoom=function(){return {zoom:zoom,tz:tz,foc:foc}};
  var ab=$('#allbtn');if(ab)ab.addEventListener('click',function(){ALLV.open()});
  $$('[data-sheet]').forEach(function(b){b.addEventListener('click',function(){ALLV.open();ALLV.zoom(.32);var s=$('#all .ascroll');if(s){s.scrollTop=0;s.scrollLeft=0}})});
  new ResizeObserver(size).observe(el);GJ12.reroom=function(){build();clampPan()};GJ12.room=function(){return {pan:pan,n:n,mid:mid,lim:lim()}};
  size();
}
/* ---- one work per screen ---- */
var CUR=null,GAL={};
function plates(){
  var ps=$$('.plate'),where=$('#where'),rail=$$('#rail a');
  rail.forEach(function(a){a.addEventListener('click',function(e){var id=(a.getAttribute('href')||'').replace(/^#/,'');e.preventDefault();if((CUR&&CUR.id===id)||(FULL.state&&FULL.state().on&&FULL.state().k===id))return;if(GJ12._closedAt&&Date.now()-GJ12._closedAt<450&&id===GJ12._closedId)return;if(GJ12.gotoPlate)GJ12.gotoPlate(id);else location.hash='#'+id})});
  ps.forEach(function(p){gallery(p)});
  function gotoPlate(id){
    var p=document.getElementById(id);if(!p)return;
    if(GJ12._closedAt&&Date.now()-GJ12._closedAt<450&&id===GJ12._closedId)return;
    de.style.scrollBehavior='auto';de.style.scrollSnapType='none';
    p.scrollIntoView();
    de.style.scrollBehavior='';de.style.scrollSnapType='';
    setCur(p);
    GJ12._navLock=Date.now()+500;
    GJ12._openedAt=Date.now();
  }
  GJ12.clearCur=function(){setCur(null)};
  GJ12.gotoPlate=gotoPlate;
  function setCur(p){
    if(CUR===p)return;CUR=p;
    de.classList.toggle('in',!!p);
    de.style.setProperty('--tint',p?p.getAttribute('data-c'):'214,226,236');
    rail.forEach(function(a){a.classList.toggle('on',!!p&&a.getAttribute('href')==='#'+p.id)});
    var pt=$('#ptitle');if(pt)pt.textContent=p?$('h2',p).textContent:'work examples';
    if(p){where.innerHTML='<b>'+p.getAttribute('data-sec')+'</b> · '+p.getAttribute('data-n');
      try{history.replaceState(null,'','#'+p.id)}catch(e){}}
    else{try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
    $$('video,audio').forEach(function(m){if(m.id==='lit-audio')return;if(!p||!p.contains(m)){try{m.pause()}catch(e){}}});
    if(GJ12.now)GJ12.now();
  }
  function pick(){var mid=innerHeight*.5,best=null;
    ps.forEach(function(p){var r=p.getBoundingClientRect();if(r.top<=mid&&r.bottom>mid)best=p;
      if(r.top<innerHeight*.85&&r.bottom>innerHeight*.15){p.classList.add('seen');if(p._near)p._near()}});
    setCur(best)}
  var tk=0;addEventListener('scroll',function(){if(!tk){tk=1;requestAnimationFrame(function(){tk=0;pick()})}},{passive:true});
  addEventListener('resize',pick);pick();setTimeout(pick,300);
  document.addEventListener('keydown',function(e){
    if($('#lb.on')||!CUR)return;var G=GAL[CUR.id];
    if(e.key==='ArrowRight'&&G)G.step(1);if(e.key==='ArrowLeft'&&G)G.step(-1)});
}
function gallery(p){
  var st=$('.stage',p),strip=$$('.strip button',p),img=$('img.main',st),m3=$('.dial',st),vid=$('video:not(.clip)',st),cv=$('video.clip',st),cap=$('.cap',p),at=0;
  if(!strip.length)return;
  function show(i,user){
    at=(i+strip.length)%strip.length;var b=strip[at],k=b.getAttribute('data-kind');
    strip.forEach(function(x,j){x.classList.toggle('on',j===at)});
    if(img)img.hidden=k!=='img';if(m3)m3.hidden=k!=='dial';
    if(vid){vid.hidden=k!=='video';if(k!=='video')try{vid.pause()}catch(e){}}
    if(cv){cv.hidden=k!=='clip';if(k!=='clip'){try{cv.pause()}catch(e){}}}
    if(user)p._picked=1;
    function arm(v,loop){if(!v)return;v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');try{v.playsInline=true}catch(e){};if(loop!=null)v.loop=!!loop}
    function kick(v){if(!v||v.hidden)return;var r=v.getBoundingClientRect(),vh=innerHeight||1;if(r.width<8||r.bottom<vh*.12||r.top>vh*.88)return;var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}
    if(k==='clip'&&cv){var cs=b.getAttribute('data-src'),auto=b.getAttribute('data-auto')==='1',nAuto=0;strip.forEach(function(x){if(x.getAttribute('data-auto')==='1')nAuto++});if(auto)arm(cv,nAuto<2);var po=b.getAttribute('data-poster')||'';if(po)cv.setAttribute('poster',po);if(cs&&cv.getAttribute('src')!==cs)cv.setAttribute('src',cs);if(auto)kick(cv)}
    if(k==='video'&&vid){if((p.id==='weird-kid')||vid.getAttribute('data-silent')==='1')lockSilent(vid);if(vid.getAttribute('data-auto')==='1'){arm(vid,true);kick(vid)}}
    if(k==='img'){var src=b.getAttribute('data-big'),tq=$('img',b);if(p._n){sharp(img,src,tq?(tq.currentSrc||tq.getAttribute('src')):'');var nb=strip[at+1];if(nb&&nb.getAttribute('data-big'))warm(nb.getAttribute('data-big'))}else img.setAttribute('data-src',src);img.alt=b.getAttribute('data-alt')||''}
    if(k==='dial'){if(m3._d)m3._d.say();if(typeof railPaint==='function')railPaint();return}
    var c=b.getAttribute('data-cap')||'',g=b.getAttribute('data-grp')||'';
    var imgs=strip.filter(function(x){return x.getAttribute('data-kind')==='img'}),n=imgs.indexOf(b);
    cap.innerHTML='';cap.appendChild(document.createTextNode(c));
    var sm=document.createElement('small');sm.textContent=k==='img'?((g?g+' · ':'')+(imgs.length>1?(n+1)+' of '+imgs.length:'')):(b.getAttribute('data-note')||'');cap.appendChild(sm);
    if(user&&b.scrollIntoView)try{b.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})}catch(e){}
    if(typeof railPaint==='function')railPaint();
  }
  strip.forEach(function(b,i){b.addEventListener('click',function(){show(i,true)})});
  if(cv)cv.addEventListener('ended',function(){if(cv.loop||cv.hidden)return;var autos=[];strip.forEach(function(x,i){if(x.getAttribute('data-auto')==='1')autos.push(i)});if(autos.length<2)return;var j=autos.indexOf(at);show(autos[(j<0?0:j+1)%autos.length])});
  /* the rail: slide a finger along it to flip through this piece's photographs at speed */
  var gr=$('.grail',p),imgsAll=strip.filter(function(x){return x.getAttribute('data-kind')==='img'});
  function railPaint(){if(!gr)return;var j=imgsAll.indexOf(strip[at]);gr.classList.toggle('off',j<0&&!!m3&&!m3.hidden);$('i',gr).style.left=(imgsAll.length>1&&j>=0?j/(imgsAll.length-1)*100:0)+'%'}
  if(gr&&imgsAll.length>1){
    gr.innerHTML='<i></i>'+imgsAll.map(function(x,j){return '<u style="left:'+(j/(imgsAll.length-1)*100)+'%"></u>'}).join('');
    var gd=0;function gAt(e){var r=gr.getBoundingClientRect(),g=(window.GJ12.tune&&GJ12.tune.rail)||1,f=Math.max(0,Math.min(1,(e.clientX-r.left-14)/Math.max(1,r.width-28)));if(gd&&gd!==1)f=Math.max(0,Math.min(1,gd.f+(f-gd.f)*g));return f}
    var gf=0,glx=0,glt=0;
    function gGo(e,fast){var f;if(gd&&gd!==1&&gd.rel){var now=performance.now(),dx=e.clientX-glx,sp=Math.abs(dx)/Math.max(1,now-glt),g=((window.GJ12.tune&&GJ12.tune.rail)||1)*Math.max(.55,Math.min(2.8,.55+sp*2.2));glx=e.clientX;glt=now;
        gf=Math.max(0,Math.min(1,gf+dx/Math.max(1,gr.clientWidth-28)*g));f=gf}else{f=gAt(e);gf=f;glx=e.clientX;glt=performance.now();if(gd&&gd!==1)gd.rel=1}
      var j=Math.round(f*(imgsAll.length-1)),b=imgsAll[j];gr.setAttribute('data-n',(j+1)+' / '+imgsAll.length);if(strip[at]!==b){show(strip.indexOf(b));if(fast){var th=$('img',b);if(th&&img)img.src=th.currentSrc||th.src}}$('i',gr).style.left=(f*100)+'%'}
    gr.addEventListener('pointerdown',function(e){gd=1;var f=gAt(e);gd={f:f};try{gr.setPointerCapture(e.pointerId)}catch(x){}gr.classList.add('on');gGo(e,true)});
    gr.addEventListener('pointermove',function(e){if(gd)gGo(e,true)});
    function gUp(){if(!gd)return;gd=0;gr.classList.remove('on');var b=strip[at];if(img&&b.getAttribute('data-kind')==='img')img.src=b.getAttribute('data-big');railPaint();if(b.scrollIntoView)try{b.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})}catch(x){}}
    gr.addEventListener('pointerup',gUp);gr.addEventListener('pointercancel',gUp);
  }else if(gr)gr.remove();
  $$('.nav',st).forEach(function(n){n.addEventListener('click',function(){show(at+(n.classList.contains('n')?1:-1),true)})});
  if(strip.length<2)$$('.nav',st).forEach(function(n){n.remove()});
  var sx=null,sy=0;
  if(img){
    img.addEventListener('touchstart',function(e){if(e.touches.length===1){sx=e.touches[0].clientX;sy=e.touches[0].clientY}else sx=null},{passive:true});
    img.addEventListener('touchend',function(e){if(sx==null)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;
      if(Math.abs(dx)>44&&Math.abs(dx)>Math.abs(dy)*1.3){img._sw=Date.now();show(at+(dx<0?1:-1),true)}},{passive:true});
    img.addEventListener('click',function(){if(img._sw&&Date.now()-img._sw<400)return;
      var imgs=strip.filter(function(x){return x.getAttribute('data-kind')==='img'});LB.open(imgs,imgs.indexOf(strip[at]),function(j){show(strip.indexOf(imgs[j]))})});
  }
  function showAuto(){if(p._picked||p._autoed)return;for(var i=0;i<strip.length;i++)if(strip[i].getAttribute('data-auto')==='1'){p._autoed=1;show(i);break}}
  p._near=function(){if(!p._n){p._n=1;var ds=img&&img.getAttribute('data-src');if(ds){var b0=strip[at],t0=b0&&$('img',b0);sharp(img,ds,t0?(t0.currentSrc||t0.getAttribute('src')):'');img.removeAttribute('data-src')}}if(m3&&!m3._d)dial(m3,p,cap);showAuto();if(GJ12.autoplay)GJ12.autoplay()};
  GAL[p.id]={step:function(d){if(m3&&!m3.hidden&&m3._d)m3._d.step(d);else show(at+d,true)},at:function(){return at},show:show,
    items:function(){var o=[];if(m3)$$('figure',m3).forEach(function(f){o.push({big:f.getAttribute('data-big'),th:f.getAttribute('data-big'),cap:f.getAttribute('data-cap')})});
      imgsAll.forEach(function(b){var t=$('img',b);o.push({big:b.getAttribute('data-big'),th:t?t.getAttribute('src'):b.getAttribute('data-big'),cap:b.getAttribute('data-cap')})});return o},
    showBig:function(src){var b=imgsAll.filter(function(x){return x.getAttribute('data-big')===src})[0];if(b){show(strip.indexOf(b),true);return}
      if(m3){var fs=$$('figure',m3),j=-1;fs.forEach(function(f,q){if(f.getAttribute('data-big')===src)j=q});if(j>=0){show(0,true);if(!m3._d)dial(m3,p,cap);var t=$$('.ticks button',m3)[j];if(m3._d&&m3._d.jump)m3._d.jump(j)}}}};
  /* pinch the picture smaller and it opens out into the wall of every image of this piece */
  pinchOn(st,function(sc,done){if(done&&sc<.82)WALL.open(p.id,2)});
  var wb=$('.wallbtn',p);if(wb)wb.addEventListener('click',function(){WALL.open(p.id,0)});
  if(m3)$$('.nav',st).forEach(function(n){n.addEventListener('click',function(e){if(!m3.hidden&&m3._d){e.stopImmediatePropagation();m3._d.step(n.classList.contains('n')?1:-1)}},true)});
  show(0);
}
/* ---- the photo dial: the real photographs set round a ring in order of angle. Drag to turn, it settles on the nearest. ---- */
function dial(el,p,cap){
  var ring=$('.ring',el),figs=$$('figure',ring),n=figs.length,step=360/n,a=0,ta=0,v=0,drag=null,raf=0,lab=$('.dl',el),ticks=$$('.ticks button',el);
  figs.forEach(function(f){var im=$('img',f);if(im.getAttribute('data-src')){im.src=im.getAttribute('data-src');im.removeAttribute('data-src')}});
  function lay(){var T=window.GJ12.tune||{},pn=T.panel||.74,H=el.clientHeight-40,h=H*.98,w=Math.min(el.clientWidth*pn,h*.86),r=(w/2)/Math.tan(Math.PI/n)*1.08;
    el.style.setProperty('--w',w+'px');el.style.setProperty('--h',h+'px');el.style.setProperty('--r',r+'px');el.style.setProperty('--cy',(4+H/2)+'px');
    figs.forEach(function(f,i){f.style.transform='rotateY('+(i*step)+'deg) translateZ('+r+'px)'});paint()}
  function idx(){return ((Math.round(a/step)%n)+n)%n}
  function paint(){
    ring.style.transform='translateZ(calc(var(--r)*-1)) rotateY('+(-a)+'deg)';
    figs.forEach(function(f,i){var d=((i*step-a)%360+540)%360-180,k=Math.max(0,1-Math.abs(d)/(step*1.25));f.style.opacity=(0.12+0.88*k).toFixed(3);f.style.pointerEvents=Math.abs(d)<step/2?'auto':'none'});
    var i=idx();if(paint.i!==i){paint.i=i;ticks.forEach(function(t,j){t.classList.toggle('on',j===i)});say()}}
  function say(){var f=figs[idx()];lab.textContent=f.getAttribute('data-o');
    if(el.hidden)return;cap.innerHTML='';cap.appendChild(document.createTextNode(f.getAttribute('data-cap')||''));
    var sm=document.createElement('small');sm.textContent=f.getAttribute('data-o')+' · '+(idx()+1)+' of '+n+' · drag to turn';cap.appendChild(sm)}
  function run(){raf=0;if(drag)return;var d=ta-a,b=(window.GJ12.tune&&GJ12.tune.bounce)||0;if(b<=0){v=d*.14;if(Math.abs(v)<.35)v=Math.abs(d)<.35?d:(d>0?.35:-.35)}else{v=v*(.55+.3*b)+d*(.12-.03*b)}a+=v;if(Math.abs(d)<.05&&Math.abs(v)<.05){a=ta;v=0;paint();return}paint();raf=requestAnimationFrame(run)}
  function go(){if(!raf)raf=requestAnimationFrame(run)}
  function spin(){return 0.32*((window.GJ12.tune&&GJ12.tune.spin)||1)*(step/72)}
  el.addEventListener('pointerdown',function(e){if(e.target.closest('.ticks'))return;drag={x:e.clientX,a:a,m:0,t:performance.now(),lx:e.clientX,vx:0};try{el.setPointerCapture(e.pointerId)}catch(x){}});
  el.addEventListener('pointermove',function(e){if(!drag||drag.rail)return;var dx=e.clientX-drag.x;if(Math.abs(dx)>6)drag.m=1;var now=performance.now();drag.vx=(e.clientX-drag.lx)/Math.max(1,now-drag.t);drag.lx=e.clientX;drag.t=now;a=drag.a-dx*spin();paint()});
  function nearest(j){var base=Math.round(a/360)*360,c=[base+j*step-360,base+j*step,base+j*step+360];c.sort(function(x,y){return Math.abs(x-a)-Math.abs(y-a)});return c[0]}
  /* letting go carries on the way you were going, then lands on a photograph. It never turns back. */
  function land(from,vel){var trav=a-from,proj=a+vel,dir=Math.abs(vel)>step*.08?(vel>0?1:-1):(Math.abs(trav)>step*.1?(trav>0?1:-1):0);
    if(!dir)ta=Math.round(a/step)*step;else if(dir>0)ta=Math.ceil(Math.max(a,proj)/step-.04)*step;else ta=Math.floor(Math.min(a,proj)/step+.04)*step;go()}
  function up(e){if(!drag)return;var d=drag;drag=null;
    if(!d.m){var f=figs[idx()],r=f.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&e.type==='pointerup'){LB.open(figs,idx(),function(j){ta=a=nearest(j);paint()});return}}
    land(d.a,-d.vx*spin()*70)}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  /* the rail under the photographs: slide a finger along it and the dial runs through them all, as fast as the finger moves */
  var rail=$('.ticks',el),rd=null;
  function railAt(x){var r=rail.getBoundingClientRect(),first=ticks[0].getBoundingClientRect(),last=ticks[n-1].getBoundingClientRect(),x0=first.left+first.width/2,x1=last.left+last.width/2;
    var g=(window.GJ12.tune&&GJ12.tune.rail)||1,f=(x-x0)/Math.max(1,x1-x0);if(rd)f=rd.f0+(f-rd.f0)*g;return Math.max(0,Math.min(1,f))*(n-1)}
  rail.addEventListener('pointerdown',function(e){e.stopPropagation();rail.classList.add('on');rd=null;var f=railAt(e.clientX)/(n-1);rd={f0:f,a0:a,la:a,t:performance.now(),v:0};try{rail.setPointerCapture(e.pointerId)}catch(x){}
    var base=Math.floor(a/360)*360,want=base+f*(n-1)*step;if(want-a>180)want-=360;if(a-want>180)want+=360;rd.base=want-f*(n-1)*step;drag={rail:1};a=want;paint()});
  rail.addEventListener('pointermove',function(e){if(!rd)return;e.stopPropagation();var na=rd.base+railAt(e.clientX)*step,now=performance.now();rd.v=(na-a)/Math.max(1,now-rd.t)*16;rd.t=now;a=na;paint()});
  function railUp(e){if(!rd)return;e.stopPropagation();rail.classList.remove('on');var o=rd;rd=null;drag=null;land(o.a0,o.v*2.5);ta=Math.max(o.base,Math.min(o.base+(n-1)*step,ta))}
  rail.addEventListener('pointerup',railUp);rail.addEventListener('pointercancel',railUp);
  addEventListener('resize',lay);new ResizeObserver(lay).observe(el);
  el._d={jump:function(j){ta=a=nearest(j);paint()},step:function(d){ta=Math.round(ta/step)*step+d*step;go()},say:say,state:function(){return {a:a,i:idx(),n:n}}};
  lay();a=-step*.6;ta=0;paint();say();go();
}
/* ---- full-screen photograph ---- */
var LB={};
function lightbox(){
  var lb=document.createElement('div');lb.id='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-label','photograph');
  lb.innerHTML='<div class="top"><button type="button" class="x">‹ back</button><span class="ct"></span></div><div class="st"><img alt=""><button type="button" class="nv p" aria-label="previous photograph">‹</button><button type="button" class="nv n" aria-label="next photograph">›</button></div><div class="cp"></div>';
  document.body.appendChild(lb);
  var img=$('img',lb),cap=$('.cp',lb),num=$('.ct',lb),set=[],at=0,cb=null;
  function show(i){at=(i+set.length)%set.length;var b=set[at];img.src=b.getAttribute('data-big');img.alt=b.getAttribute('data-alt')||'';cap.textContent=b.getAttribute('data-cap')||'';
    num.textContent=(at+1)+' of '+set.length;var one=set.length<2;$('.nv.p',lb).hidden=one;$('.nv.n',lb).hidden=one;if(cb)cb(at)}
  function shut(){lb.classList.remove('on');document.body.style.overflow='';de.style.scrollSnapType=''}
  function close(){if(history.state&&history.state.lb)history.back();else shut()}
  LB.open=function(s,i,f){set=s;cb=f;de.style.scrollSnapType='none';show(i);lb.classList.add('on');document.body.style.overflow='hidden';try{history.pushState({lb:1},'')}catch(e){}};LB.shut=shut;
  addEventListener('popstate',function(){if(lb.classList.contains('on'))shut()});
  $('.x',lb).addEventListener('click',close);
  $('.nv.p',lb).addEventListener('click',function(){show(at-1)});$('.nv.n',lb).addEventListener('click',function(){show(at+1)});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(at-1);if(e.key==='ArrowRight')show(at+1)});
  var sx=null,st=$('.st',lb);
  st.addEventListener('touchstart',function(e){sx=e.touches.length===1?e.touches[0].clientX:null},{passive:true});
  st.addEventListener('touchend',function(e){if(sx==null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50&&z<=1)show(at+(dx<0?1:-1))},{passive:true});
  var z=1,px=0,py=0;
  function fit(){z=1;px=0;py=0;img.style.transform='';}
  function applyZ(){img.style.transform=z<=1&&!px&&!py?'':'translate('+px+'px,'+py+'px) scale('+z+')'}
  var _show=show;show=function(i){fit();_show(i)};
  var _shut=shut;shut=function(){fit();_shut()};
  lb.addEventListener('wheel',function(e){
    if(!lb.classList.contains('on'))return;
    e.preventDefault();e.stopPropagation();
    if(e.ctrlKey){z=Math.max(1,Math.min(4,z*Math.exp(-e.deltaY*.01)));if(z===1){px=0;py=0}applyZ()}
    else if(z>1){px-=e.deltaX;py-=e.deltaY;applyZ()}
  },{passive:false,capture:true});
  LB.shut=shut;
}
/* ---- sound: one track, one button ---- */
function player(){
  var el=$('.player');if(!el)return;
  var au=$('audio',el),pp=$('.pp',el),cv=$('canvas',el),wave=$('.wave',el),t0=$('.t0',el),t1=$('.t1',el),peaks=[];
  if(au){au.id='lit-audio';au.setAttribute('data-keep','1')}
  try{peaks=JSON.parse(el.getAttribute('data-peaks')||'[]')}catch(e){}
  var dur=+el.getAttribute('data-dur')||0,c=el.getAttribute('data-c');
  function mmss(s){s=Math.max(0,Math.round(s));return (s/60|0)+':'+(s%60<10?'0':'')+(s%60)}
  function D(){return isFinite(au.duration)&&au.duration?au.duration:dur}
  function draw(){
    var dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;if(!w)return;
    if(cv.width!==Math.round(w*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
    var g=cv.getContext('2d'),n=peaks.length||1,red=de.classList.contains('red'),on=red?'#ff4457':'rgb('+c+')',off=red?'rgba(255,68,87,.35)':'rgba(238,243,245,.3)';
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);var head=D()?au.currentTime/D():0,bw=w/n;
    for(var i=0;i<n;i++){var p=peaks[i]||.1,bh=Math.max(2,p*(h-8));g.fillStyle=(i+.5)/n<=head?on:off;g.fillRect(i*bw+bw*.2,(h-bh)/2,Math.max(1,bw*.6),bh)}
    t0.textContent=mmss(au.currentTime);t1.textContent=mmss(D())}
  function seek(e){var r=wave.getBoundingClientRect(),f=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));if(D())au.currentTime=f*D();draw()}
  pp.addEventListener('click',function(){if(au.paused){var p=au.play();if(p&&p.catch)p.catch(function(){})}else au.pause()});
  ['play','pause','ended'].forEach(function(ev){au.addEventListener(ev,function(){pp.textContent=au.paused?'play':'pause';draw();paintNow()})});
  ['timeupdate','loadedmetadata','seeked'].forEach(function(ev){au.addEventListener(ev,function(){draw();paintNow()})});
  var now=document.createElement('div');now.id='now';now.setAttribute('role','region');now.setAttribute('aria-label','Lost in Time, now playing');
  now.innerHTML='<button type="button" class="now-pp" aria-label="play or pause">pause</button><span class="now-name">Lost in Time</span><button type="button" class="now-x" aria-label="stop and close">×</button><span class="now-bar" aria-hidden="true"><i></i></span>';
  document.body.appendChild(now);
  var npp=$('.now-pp',now),nbar=$('.now-bar i',now);
  function onLit(){
    var all=$('#all'),wall=$('#wall'),full=$('#full');
    if((all&&all.classList.contains('on'))||(wall&&wall.classList.contains('on'))||(full&&full.classList.contains('on')))return false;
    return !!(typeof CUR!=='undefined'&&CUR&&CUR.id==='lost-in-time');
  }
  function paintNow(){
    var live=!au.paused||(au.currentTime>0.05&&!au.ended&&now.classList.contains('held'));
    if(au.ended||(au.paused&&au.currentTime<0.05)){now.classList.remove('on','held');return}
    if(!au.paused)now.classList.add('held');
    var show=live&&!onLit();
    now.classList.toggle('on',show);
    npp.textContent=au.paused?'play':'pause';
    if(nbar&&D())nbar.style.width=(Math.max(0,Math.min(1,au.currentTime/D()))*100).toFixed(2)+'%';
  }
  npp.addEventListener('click',function(){if(au.paused){var p=au.play();if(p&&p.catch)p.catch(function(){})}else au.pause()});
  $('.now-x',now).addEventListener('click',function(){au.pause();try{au.currentTime=0}catch(e){}now.classList.remove('on','held');pp.textContent='play';draw()});
  function hushMusic(v){if(!v||v.tagName!=='VIDEO')return;if(v.closest&&v.closest('#weird-kid'))return;if(v.getAttribute&&v.getAttribute('data-silent')==='1')return;if(v.muted||v.volume===0)return;if(!au.paused)au.pause()}
  document.addEventListener('play',function(e){hushMusic(e.target)},true);
  document.addEventListener('volumechange',function(e){hushMusic(e.target)},true);
  addEventListener('scroll',paintNow,{passive:true});
  GJ12.now=paintNow;
  var down=false;
  wave.addEventListener('pointerdown',function(e){down=true;try{wave.setPointerCapture(e.pointerId)}catch(x){}seek(e)});
  wave.addEventListener('pointermove',function(e){if(down)seek(e)});
  wave.addEventListener('pointerup',function(){down=false});wave.addEventListener('pointercancel',function(){down=false});
  addEventListener('resize',draw);new MutationObserver(draw).observe(de,{attributes:true,attributeFilter:['class']});draw();
  /* the field: points over a horizon and their reflection in the water. The rail on the right sets how dense. The track lifts it while it plays. */
  var wn=$('canvas.wn',el.parentNode),vr=$('.vrail',el.parentNode);if(!wn)return;
  var g2=wn.getContext('2d'),PT=[],dens=.35,lv=0,W2=0,H2=0;
  function rnd(i){var x=Math.sin(i*78.233+12.9898)*43758.5453;return x-Math.floor(x)}
  for(var i=0;i<900;i++)PT.push({x:rnd(i),y:rnd(i+2000),r:.5+1.3*Math.pow(rnd(i+4000),2),p:rnd(i+6000)*6.28,s:.3+rnd(i+8000)});
  function vset(v){dens=Math.max(0,Math.min(1,v));if(vr)$('i',vr).style.top=((1-dens)*100)+'%'}
  if(vr){var vd=0;function vAt(e){var r=vr.getBoundingClientRect();vset(1-(e.clientY-r.top-12)/Math.max(1,r.height-24))}
    vr.addEventListener('pointerdown',function(e){vd=1;vr.classList.add('on');try{vr.setPointerCapture(e.pointerId)}catch(x){}vAt(e)});vr.addEventListener('pointermove',function(e){if(vd)vAt(e)});
    vr.addEventListener('pointerup',function(){vd=0;vr.classList.remove('on')});vr.addEventListener('pointercancel',function(){vd=0;vr.classList.remove('on')})}
  vset(.35);GJ12.field=function(){return {dens:dens,level:lv}};
  function field(t){requestAnimationFrame(field);var r=wn.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
    var dpr=Math.min(2,window.devicePixelRatio||1);if(W2!==wn.clientWidth||H2!==wn.clientHeight){W2=wn.clientWidth;H2=wn.clientHeight;wn.width=W2*dpr;wn.height=H2*dpr}
    var want=0;if(!au.paused&&peaks.length&&D()){want=peaks[Math.min(peaks.length-1,Math.floor(au.currentTime/D()*peaks.length))]||0}lv+=(want-lv)*.08;
    var red=de.classList.contains('red'),col=red?'255,68,87':'236,240,244',hz=H2*.6,n=Math.round(PT.length*Math.min(1,dens*(.55+1.1*lv)+.04));
    g2.setTransform(dpr,0,0,dpr,0,0);g2.clearRect(0,0,W2,H2);
    var gl=g2.createLinearGradient(0,hz-70,0,hz+2);gl.addColorStop(0,'rgba('+col+',0)');gl.addColorStop(1,'rgba('+col+','+(.07+.1*dens+.12*lv)+')');g2.fillStyle=gl;g2.fillRect(0,hz-70,W2,72);
    g2.fillStyle='rgba('+col+',.22)';g2.fillRect(0,hz,W2,1);
    for(var i=0;i<n;i++){var q=PT[i],x=((q.x+t*.000006*q.s)%1)*W2,y=q.y*hz*.98,a=(.35+.65*Math.abs(Math.sin(q.p+t*.0012*q.s)))*(.5+.5*q.s);
      g2.globalAlpha=a;g2.fillStyle='rgb('+col+')';g2.beginPath();g2.arc(x,y,q.r,0,6.283);g2.fill();
      var ry=hz+(hz-y)*.62;if(ry<H2){g2.globalAlpha=a*.34;g2.beginPath();g2.arc(x+Math.sin(t*.002+q.p)*1.5,ry,q.r*.9,0,6.283);g2.fill()}}
    g2.globalAlpha=1}
  requestAnimationFrame(field);
}
/* ---- tuning: only for Gill, behind ?tune ---- */
function tune(){
  if($('#tune'))return;
  var d=document.createElement('details');d.id='tune';d.open=true;
  var rows=[['glow','glow',0,1.4,.05],['spread','room spread',.6,1.8,.05],['bloom','star bloom',0,1.6,.05],['oblur','blur',0,1,.02],['osharp','sharpness',0,1,.02],['odepth','depth',0,2,.05],['omin','icon size, every star',0,96,2],['stars','stars',0,3,.1],['drift','depth drift',0,3,.1],['stage','picture size',.4,.7,.01],['panel','panel size',.4,1,.01],['mx','side margin',0,40,1],['bounce','flip bounce',0,1,.05],['rail','rail speed',.4,3,.1],['spin','dial spin',.3,3,.1],['depth','dial depth',.4,2.5,.05]];
  d.innerHTML='<summary>tune</summary><button type="button" class="tune-x" aria-label="close tune">×</button><div class="abc"><span>photo row</span><button data-l="a">A thumbs</button><button data-l="b">B dots</button><button data-l="c">C large</button></div>'+
    '<div class="abc"><span>moon</span><button type="button" data-moon="1">on</button><button type="button" data-moon="0">off</button></div>'+
    '<label>moon size<input type="range" data-k="moonsize" min="28" max="72" step="1"><output></output></label>'+
    '<div class="abc"><span>moon dial</span><button type="button" data-moondial="1">on</button><button type="button" data-moondial="0">off</button></div>'+
    rows.map(function(r){return '<label>'+r[1]+'<input type="range" data-k="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'"><output></output></label>'}).join('')+'<button type="button" data-reset>back to the design</button><button type="button" data-save-default>save as default</button><p class="tune-note" hidden></p>';
  document.body.appendChild(d);
  function close(){
    d.remove();
    document.removeEventListener('keydown',onkey,true);
    document.removeEventListener('pointerdown',onout,true);
  }
  function onkey(e){if(e.key==='Escape')close()}
  function onout(e){if(!d.contains(e.target))close()}
  document.addEventListener('keydown',onkey,true);
  setTimeout(function(){document.addEventListener('pointerdown',onout,true)},0);
  d.querySelector('.tune-x').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();close()});
  d.addEventListener('toggle',function(){if(!d.open)close()});
  function paint(){$$('input',d).forEach(function(i){i.value=val(i.getAttribute('data-k'));i.nextSibling.textContent=i.value});
    $$('[data-l]',d).forEach(function(b){b.classList.toggle('on',val('strip')===b.getAttribute('data-l'))});
    $$('[data-moon]',d).forEach(function(b){b.classList.toggle('on',String(+val('moon'))===b.getAttribute('data-moon'))});
    $$('[data-moondial]',d).forEach(function(b){b.classList.toggle('on',String(+val('moondial'))===b.getAttribute('data-moondial'))})}
  function save(){LS.set('gj.cks12.tune',JSON.stringify(TUNE));apply();paint()}
  d.addEventListener('input',function(e){var k=e.target.getAttribute('data-k');if(!k)return;TUNE[k]=+e.target.value;save()});
  d.addEventListener('click',function(e){var l=e.target.getAttribute&&e.target.getAttribute('data-l');if(l){TUNE.strip=l;save()}
    var mo=e.target.getAttribute&&e.target.getAttribute('data-moon');if(mo!=null){TUNE.moon=+mo;save()}
    var md=e.target.getAttribute&&e.target.getAttribute('data-moondial');if(md!=null){TUNE.moondial=+md;save()}
    if(e.target.hasAttribute&&e.target.hasAttribute('data-reset')){TUNE={};save()}
    if(e.target.hasAttribute&&e.target.hasAttribute('data-save-default')){
      var all={},k;for(k in DEFAULTS)if(Object.prototype.hasOwnProperty.call(DEFAULTS,k))all[k]=val(k);
      var json=JSON.stringify(all,null,2),note=d.querySelector('.tune-note');
      function said(ok){if(!note)return;note.hidden=false;note.textContent=ok?'copied, send to your agent to make it the default':'could not copy'}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(json).then(function(){said(true)}).catch(function(){said(false)})}
      else{try{var ta=document.createElement('textarea');ta.value=json;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();said(true)}catch(err){said(false)}}
    }});
  paint();
}


function overlayOn(){
  var lb=$('#lb'),f=$('#full'),w=$('#wall'),a=$('#all');
  return !!( $('#tune') || (lb&&lb.classList.contains('on')) || (f&&f.classList.contains('on')) || (w&&w.classList.contains('on')) || (a&&a.classList.contains('on')) );
}

function lockSilent(v){if(!v)return;v.muted=true;v.defaultMuted=true;v.volume=0;v.setAttribute('muted','');if(v._sil)return;v._sil=1;v.addEventListener('volumechange',function(){v.muted=true;v.defaultMuted=true;v.volume=0})}
function autoplayClips(){
  /* muted in-view loops; ignore Reduce Motion; lazy: preload=none until play() */
  function arm(v){if(!v)return;v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');try{v.playsInline=true}catch(e){}if((v.closest&&v.closest('#weird-kid'))||v.getAttribute('data-silent')==='1')lockSilent(v)}
  function vis(el){if(!el||el.hidden)return false;var r=el.getBoundingClientRect(),vh=innerHeight||1;return r.width>8&&r.height>8&&r.top<vh*.88&&r.bottom>vh*.12}
  function tick(){
    $$('video[data-auto]').forEach(function(v){
      var plate=v.closest('.plate'),on=vis(v)&&(!plate||vis(plate));
      if(on){arm(v);var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}
      else if(!v.paused){try{v.pause()}catch(e){}}
    });
  }
  $$('video[data-auto]').forEach(arm);
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(){tick()},{threshold:[0,.1,.25,.5,.75]});
    $$('video[data-auto]').forEach(function(v){io.observe(v);var p=v.closest('.plate');if(p)io.observe(p)});
  }
  addEventListener('scroll',function(){if(!tick._t){tick._t=1;requestAnimationFrame(function(){tick._t=0;tick()})}},{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden)$$('video[data-auto]').forEach(function(v){try{v.pause()}catch(e){}});else tick()});
  GJ12.autoplay=tick;
  tick();
}

function goSky(){
  GJ12._closedId=(CUR&&CUR.id)||GJ12._closedId;
  GJ12._closedAt=Date.now();
  GJ12._navLock=Date.now()+450;
  if(GJ12.clearCur)GJ12.clearCur();else de.classList.remove('in');
  if(typeof LB!=='undefined'&&LB.shut)LB.shut();
  if(typeof FULL!=='undefined'&&FULL.shut)FULL.shut();
  if(typeof WALL!=='undefined'&&WALL.shut)WALL.shut();
  if(typeof ALLV!=='undefined'&&ALLV.shut)ALLV.shut();
  var t=$('#tune');if(t){var x=t.querySelector('.tune-x');if(x)x.click();else t.remove()}
  document.body.style.overflow='';de.style.scrollSnapType='none';
  de.style.scrollBehavior='auto';
  var sky=document.getElementById('sky');if(sky)sky.scrollIntoView();
  de.style.scrollBehavior='';de.style.scrollSnapType='';
  try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  $$('video').forEach(function(m){try{m.pause()}catch(e){}});
  if(GJ12.now)GJ12.now();
}
GJ12.home=goSky;

function levelNow(){
  var a=$('#all');
  if(a&&a.classList.contains('on')) return (ALLV.state()&&ALLV.state().z<.4)?2:1;
  return 0;
}
function goLevel(n){
  n=(n%3+3)%3;
  if(n===0){goSky();return}
  if(typeof WALL!=='undefined'&&WALL.shut)WALL.shut();
  if(typeof FULL!=='undefined'&&FULL.shut)FULL.shut();
  if(typeof LB!=='undefined'&&LB.shut)LB.shut();
  ALLV.open();
  if(n===2)ALLV.zoom(.32);
}

function moon(){
  var slot=$('#moonslot');if(!slot){slot=document.createElement('div');slot.id='moonslot';document.body.appendChild(slot)}
  slot.setAttribute('aria-hidden','false');
  var b=document.createElement('button');b.id='moon';b.type='button';b.setAttribute('aria-label','moon, turn to move through the sky');
  b.innerHTML='<span class="mf-float"><i></i></span>';
  slot.appendChild(b);
  var fl=$('.mf-float',b);
  /* float always runs, including when the OS asks for less motion */
  function bob(t){
    if(fl){var x=Math.sin(t/4000)*5,y=Math.cos(t/5300)*4;fl.style.transform='translate('+x.toFixed(2)+'px,'+y.toFixed(2)+'px)'}
    requestAnimationFrame(bob);
  }
  requestAnimationFrame(bob);
  var drag=null;
  function ang(e,r){return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)}
  b.addEventListener('pointerdown',function(e){
    if(!+val('moondial')||!+val('moon'))return;
    e.preventDefault();
    try{b.setPointerCapture(e.pointerId)}catch(x){}
    var r=b.getBoundingClientRect();
    drag={x:e.clientX,y:e.clientY,a:ang(e,r),acc:0,turned:0};
  });
  b.addEventListener('pointermove',function(e){
    if(!drag)return;
    var r=b.getBoundingClientRect(),a=ang(e,r),d=a-drag.a;
    if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;
    drag.a=a;drag.acc+=d;
    if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)drag.moved=1;
    var step=Math.PI/5;
    while(drag.acc>step){drag.acc-=step;drag.turned=1;goLevel(levelNow()+1)}
    while(drag.acc<-step){drag.acc+=step;drag.turned=1;goLevel(levelNow()-1)}
  });
  function end(e){
    if(!drag)return;
    var d=drag;drag=null;
    if(d.turned||d.moved)return;
    if(GJ12._navLock&&Date.now()<GJ12._navLock)return;
    if(typeof CUR!=='undefined'&&CUR&&!overlayOn()){goSky();return}
    goLevel(levelNow()+1);
  }
  b.addEventListener('pointerup',end);
  b.addEventListener('pointercancel',function(){drag=null});
}

function escbar(){
  var el=$('#esc');if(!el)return;
  el.addEventListener('click',function(e){e.preventDefault();goSky()});
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(overlayOn())return;
    e.preventDefault();
    goSky();
  });
}

})();
/* v27 · bio tabs and the forest garden */
(function(){function go(){
  var lens=document.querySelector('.bio-lens');
  if(lens)lens.addEventListener('click',function(ev){
    var b=ev.target.closest&&ev.target.closest('button[data-bio]');if(!b)return;
    var k=b.getAttribute('data-bio');
    [].forEach.call(lens.querySelectorAll('button[data-bio]'),function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',on?'true':'false')});
    [].forEach.call(document.querySelectorAll('.bio-card'),function(c){var on=c.getAttribute('data-card')===k;c.classList.toggle('on',on);if(on)c.removeAttribute('hidden');else c.setAttribute('hidden','')});
  });
  var el=document.querySelector('.garden-layers');if(!el)return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(){el.classList.add('on')}
  if(reduce||!('IntersectionObserver' in window)){show();return}
  var io=new IntersectionObserver(function(ents){for(var i=0;i<ents.length;i++)if(ents[i].isIntersecting){show();io.disconnect();break}},{threshold:0.35});
  io.observe(el);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();

})();

document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');
  if(!a)return;
  var id=(a.getAttribute('href')||'').slice(1);
  if(!id)return;
  if(id==='sky'){e.preventDefault();if(window.GJ12&&GJ12.home)GJ12.home();return}
  var p=document.getElementById(id);
  if(p&&p.classList.contains('plate')){
    e.preventDefault();
    if(window.GJ12&&GJ12.gotoPlate)GJ12.gotoPlate(id);
  }
},true);
addEventListener('hashchange',function(){
  var id=(location.hash||'').replace(/^#/,'');
  if(!id||id==='sky'){if(id==='sky'&&window.GJ12&&GJ12.home)GJ12.home();return}
  if(window.GJ12&&GJ12.gotoPlate)GJ12.gotoPlate(id);
});
