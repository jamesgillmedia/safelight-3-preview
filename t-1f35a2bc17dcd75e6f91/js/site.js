/* Gill James, work examples. The sky, one work per screen, full-screen photographs, sound, 3D, red mode, and tuning behind ?tune. */
(function(){
var de=document.documentElement,LS={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var DEF={glow:.5,stars:1,drift:1,stage:.56,spin:1,depth:1,panel:.74,mx:10,bounce:0,rail:1,bloom:1,spread:1,strip:'a'},TUNE={};
try{TUNE=JSON.parse(LS.get('cks-v19m.tune')||'{}')||{}}catch(e){TUNE={}}
function val(k){return TUNE[k]==null?DEF[k]:TUNE[k]}
window.GJ12={tune:{}};
function apply(){de.style.setProperty('--glow',val('glow'));de.style.setProperty('--stage',val('stage'));
  ['a','b','c'].forEach(function(x){de.classList.toggle('strip-'+x,val('strip')===x)});
  GJ12.tune={spin:+val('spin'),depth:+val('depth'),panel:+val('panel'),bounce:+val('bounce'),rail:+val('rail'),bloom:+val('bloom'),spread:+val('spread'),glowv:+val('glow')};if(GJ12.reroom)GJ12.reroom();de.style.setProperty('--mx',val('mx')+'px');try{dispatchEvent(new Event('resize'))}catch(e){}de.style.setProperty('--persp',Math.round(1100/Math.max(.3,val('depth')))+'px');if(window.GJ12.restar)GJ12.restar();applyText()}
apply();
if(LS.get('cks-v19m.red')==='1')de.classList.add('red');
function $(s,r){return (r||document).querySelector(s)}function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
var navLock=0,navDepth=0;
function jumpTo(id,opt){var p=document.getElementById(id);if(!p)return false;var snap=de.style.scrollSnapType;de.style.scrollSnapType='none';de.style.scrollBehavior='auto';p.scrollIntoView();de.style.scrollBehavior='';requestAnimationFrame(function(){requestAnimationFrame(function(){de.style.scrollSnapType=snap})});if(!(opt&&opt.nohist)&&!navLock){try{var st=history.state||{};if(!(st.view==='piece'&&st.id===id)){history.pushState({view:'piece',id:id,from:opt&&opt.from},'','#'+id);navDepth++}else history.replaceState({view:'piece',id:id,from:(opt&&opt.from)||st.from},'','#'+id)}catch(e){}}return true}
function navLevel(){var lb=document.getElementById('lb'),w=document.getElementById('wall'),v=document.getElementById('all');if(lb&&lb.classList.contains('on'))return 'lb';if(w&&w.classList.contains('on'))return 'wall';if(v&&v.classList.contains('on'))return 'all';if(typeof CUR!=='undefined'&&CUR)return 'piece';return 'sky'}
function goSkyVis(id){navLock++;var all=window.ALLV;if(all&&document.getElementById('all')&&document.getElementById('all').classList.contains('on')){try{all.open; document.getElementById('all').classList.remove('on');document.body.style.overflow='';de.style.scrollSnapType=''}catch(e){}}de.style.scrollSnapType='none';de.style.scrollBehavior='auto';var sky=document.getElementById('sky');if(sky)sky.scrollIntoView();de.style.scrollBehavior='';requestAnimationFrame(function(){requestAnimationFrame(function(){de.style.scrollSnapType=''})});if(id&&window.GJ12&&GJ12.roomFrom)try{GJ12.roomFrom(id)}catch(e){}if(typeof CUR!=='undefined')try{/* setCur via scroll */}catch(e){}setTimeout(function(){navLock=0},80)}
function goHome(){var lb=document.getElementById('lb'),w=document.getElementById('wall');if(lb&&lb.classList.contains('on'))lb.classList.remove('on');if(w&&w.classList.contains('on'))w.classList.remove('on');document.body.style.overflow='';if(navDepth>0){navLock=1;try{history.go(-navDepth)}catch(e){}navDepth=0;setTimeout(function(){if(window.ALLV)ALLV.open(null,{land:true});navLock=0},60);return}if(window.ALLV)ALLV.open(null,{land:true})}
function goUp(){var lv=navLevel(),st=history.state||{};if(lv==='lb'){var lb=document.getElementById('lb');if(st.lb){try{history.back()}catch(e){lb.classList.remove('on')}}else lb.classList.remove('on');document.body.style.overflow='';return}if(lv==='wall'){if(st.wall){try{history.back()}catch(e){document.getElementById('wall').classList.remove('on')}}else document.getElementById('wall').classList.remove('on');document.body.style.overflow='';de.style.scrollSnapType='';return}if(lv==='all'){if(st.all){try{history.back()}catch(e){}}return}if(lv==='piece'){if(st.view==='piece'){try{history.back()}catch(e){if(st.from==='all'&&window.ALLV)ALLV.open(CUR&&CUR.id,{land:true});else goSkyVis(CUR&&CUR.id)}return}if(st.from==='all'&&window.ALLV){ALLV.open(CUR&&CUR.id);return}goSkyVis(CUR&&CUR.id);return}if(lv==='sky'){if(window.ALLV)ALLV.open();return}}
window.goUp=goUp;window.goHome=goHome;
function applyText(){var n=1;try{n=parseFloat(sessionStorage.getItem('cks-v19m.text')||'1')}catch(e){}if(!isFinite(n))n=1;n=Math.max(.9,Math.min(1.5,n));de.style.setProperty('--text-scale',n.toFixed(3));return n}
GJ12.jumpTo=jumpTo;

function ready(f){if(document.readyState!=='loading')f();else document.addEventListener('DOMContentLoaded',f)}
function redDot(){
  var b=document.createElement('button');b.id='red';b.type='button';b.setAttribute('aria-label','red mode');
  var pad=document.createElement('div');pad.id='redpad';pad.innerHTML='<button type="button" data-th="night">night</button><button type="button" data-th="red">red</button><button type="button" data-th="full">full red</button>';
  document.body.appendChild(b);document.body.appendChild(pad);
  var KEY='cks-v19m.red',POS='cks-v19m.redpos',theme=LS.get(KEY)||'night';
  if(theme==='1')theme='red';if(theme==='0')theme='night';
  function setTheme(th){theme=th;de.classList.toggle('red',th==='red'||th==='full');de.setAttribute('data-theme',th==='full'?'full':(th==='red'?'red':'night'));de.classList.toggle('full-red',th==='full');LS.set(KEY,th);pad.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-th')===th)});if(window.CKS_ATMOS)CKS_ATMOS.apply()}
  function place(x,y,snap){var r=28,m=10,st=10,sb=innerHeight-r-m,sr=innerWidth-r-m;x=Math.max(m,Math.min(sr,x));y=Math.max(st,Math.min(sb,y));if(snap)x=(x+r/2<innerWidth/2)?m:sr;b.style.left=x+'px';b.style.top=y+'px';b.style.right='auto';b.style.bottom='auto';LS.set(POS,JSON.stringify({x:x,y:y}));pad.style.left=((x<innerWidth/2)?(x+r+8):(x-168))+'px';pad.style.top=y+'px'}
  try{var p=JSON.parse(LS.get(POS)||'null');if(p&&isFinite(p.x))place(p.x,p.y,true);else place(12,innerHeight-56,true)}catch(e){place(12,innerHeight-56,true)}
  setTheme(theme);
  var drag=null,hold=0,moved=0;
  b.addEventListener('pointerdown',function(e){e.preventDefault();moved=0;drag={x:e.clientX,y:e.clientY,l:b.offsetLeft,t:b.offsetTop};try{b.setPointerCapture(e.pointerId)}catch(x){};hold=setTimeout(function(){if(!moved){pad.classList.add('on');hold=0}},480)});
  b.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6){moved=1;if(hold){clearTimeout(hold);hold=0}place(drag.l+dx,drag.t+dy,false)}});
  function up(){if(!drag)return;drag=null;if(hold){clearTimeout(hold);hold=0}place(b.offsetLeft,b.offsetTop,true);if(!moved&&!pad.classList.contains('on'))setTheme((theme==='red'||theme==='full')?'night':'red')}
  b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);
  pad.addEventListener('click',function(e){var th=e.target.getAttribute&&e.target.getAttribute('data-th');if(th){setTheme(th);pad.classList.remove('on')}});
  addEventListener('pointerdown',function(e){if(e.target!==b&&!pad.contains(e.target))pad.classList.remove('on')});
  addEventListener('resize',function(){place(b.offsetLeft,b.offsetTop,true)});
}
ready(function(){
  applyText();
  redDot();
  stars();wall();allview();room();plates();lightbox();player();if(/[?&]tune\b/.test(location.search))tune();window.WALL=WALL;window.GAL=GAL;window.ALLV=ALLV;window.jumpTo=jumpTo;
  /* Deep Tune stays hidden: hold two fingers still for a moment and it opens */
  var TP={},tt=0;function tcl(){clearTimeout(tt);tt=0}
  document.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')return;TP[e.pointerId]=[e.clientX,e.clientY];if(Object.keys(TP).length===2&&!tt)tt=setTimeout(function(){tt=0;if(Object.keys(TP).length===2&&!$('#tune'))tune()},750)},true);
  document.addEventListener('pointermove',function(e){var q=TP[e.pointerId];if(q&&Math.hypot(e.clientX-q[0],e.clientY-q[1])>14)tcl()},true);
  function tup(e){delete TP[e.pointerId];tcl()}document.addEventListener('pointerup',tup,true);document.addEventListener('pointercancel',tup,true);
  GJ12.deepTune=function(){if(!$('#tune'))tune()};
  var h=(location.hash||'').replace('#','');
  if(!h||h==='sky'){ALLV.open(null,{land:true})}
  else if(document.getElementById(h)){jumpTo(h)}
  var esc=document.getElementById('escbtn'),mk=document.getElementById('markhome');
  if(esc)esc.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();goUp()});
  if(mk)mk.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();goHome()});
  document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;e.preventDefault();goUp()});
  var sy=0,stt=0;
  document.addEventListener('touchstart',function(e){if(e.touches.length!==1)return;sy=e.touches[0].clientY;stt=performance.now()},{passive:true});
  document.addEventListener('touchend',function(e){if(!e.changedTouches.length)return;var dy=e.changedTouches[0].clientY-sy;if(dy>80&&(performance.now()-stt)<520&&sy<110)goUp()},{passive:true});
  de.classList.add('esc-on');
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
    grid.scrollTop=0;grid.style.transformOrigin=(ox==null?'50%':ox+'px')+' '+(oy==null?'30%':oy+'px');
    w.classList.remove('on');void w.offsetWidth;w.classList.add('on');document.body.style.overflow='hidden';de.style.scrollSnapType='none';
    try{history.pushState({wall:1},'')}catch(e){}return true};
  WALL.state=function(){return {on:w.classList.contains('on'),k:k,cols:cols,max:maxc,n:items.length}};
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
  function build(){if(built)return;built=1;var h='',FR=0,feat=(window.CKS19&&CKS19.featured)||['spirit-eye','sculpture','cup','scoop','crescent','owtd','lost-in-time','lost-coffee','canopy'];
    var list=$$('.plate').slice().sort(function(a,b){var ia=feat.indexOf(a.id),ib=feat.indexOf(b.id);if(ia<0)ia=80+$$('.plate').indexOf(a);if(ib<0)ib=80+$$('.plate').indexOf(b);return ia-ib});
    list.forEach(function(p){var id=p.id,G=GAL[id],its=G&&G.items?G.items():[],c=p.getAttribute('data-c'),t=$('h2',p).textContent;
      if(!its.length){var orb=document.querySelector('#room a.st[data-k="'+id+'"] img.orb');its=orb?[{th:orb.getAttribute('src'),big:''}]:[]}
      h+='<section class="ab'+(feat.indexOf(id)>=0?' feat':'')+'" data-k="'+id+'" style="--c:'+c+'"><h3><button type="button" data-open="'+id+'">'+t.replace(/</g,'&lt;')+'<small>'+(its.length>1?its.length:'')+'</small></button></h3><div class="ag" style="--n:'+Math.max(1,Math.min(4,Math.ceil(Math.sqrt(its.length||1))))+'">'+
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
  function goPlate(id,big){shut();jumpTo(id,{from:'all'});if(big&&GAL[id]&&GAL[id].showBig)setTimeout(function(){GAL[id].showBig(big)},60)}
  function openBoard(id){if(id==='cv'||id==='about'){shut();jumpTo(id,{from:'all'});return}goSky(id)}
  function goSky(id){leave(function(){de.style.scrollBehavior='auto';document.getElementById('sky').scrollIntoView();de.style.scrollBehavior='';if(id&&GJ12.roomFrom)try{GJ12.roomFrom(id)}catch(e){}})}
  ALLV.open=function(id,opt){build();v.classList.add('on');v.classList.toggle('home',!!(opt&&opt.land));document.body.style.overflow='hidden';de.style.scrollSnapType='none';
    setZ((opt&&opt.land)?(innerWidth>900?.82:.74):(innerWidth>900?.5:.46));sc.scrollTop=0;sc.scrollLeft=0;
    if(id){var b=bd.querySelector('.ab[data-k="'+id+'"]');if(b){var r=b.getBoundingClientRect(),q=sc.getBoundingClientRect();sc.scrollTop+=r.top-q.top-12;b.classList.remove('here');void b.offsetWidth;b.classList.add('here')}}
    if(!(opt&&opt.nohist)){if(opt&&opt.land){try{history.replaceState({view:'all'},'',location.pathname+location.search);navDepth=0}catch(e){}}else{try{history.pushState({view:'all',all:1},'');navDepth++}catch(e){}}}};
  ALLV.state=function(){return {on:v.classList.contains('on'),z:z,boards:bd.children.length,top:Math.round(sc.scrollTop)}};
  ALLV.zoom=function(nz){setZ(nz)};
  addEventListener('popstate',function(){var st=history.state||{};if(v.classList.contains('on')&&st.view!=='all'&&!st.all)shut();else if((st.view==='all'||st.all)&&!v.classList.contains('on'))ALLV.open(st.id,{land:true,nohist:true})});
  $('.ax',v).addEventListener('click',function(){leave(function(){de.style.scrollBehavior='auto';document.getElementById('sky').scrollIntoView();de.style.scrollBehavior=''})});
  $('.wz',v).addEventListener('click',function(e){var b=e.target.closest('[data-z]');if(!b)return;var d=+b.getAttribute('data-z'),nz=z*(d>0?1.45:1/1.45);
    if(d<0&&z>.4&&nz<.4)nz=.3;if(d>0&&z<.4)nz=innerWidth>900?.5:.46;
    if(d>0&&z>=ZMAX*.98){var r=sc.getBoundingClientRect(),id=boardAt(r.left+r.width/2,r.top+r.height*.4);goSky(id);return}
    sc.style.scrollBehavior='auto';setZ(nz);sc.style.scrollBehavior=''});
  bd.addEventListener('click',function(e){if(ALLV._p)return;var o=e.target.closest('[data-open]');if(o){openBoard(o.getAttribute('data-open'));return}
    var b=e.target.closest('.ag button');if(b)goPlate(b.getAttribute('data-k'),b.getAttribute('data-big'))});
  var z0=1;
  pinchOn(v,function(s2,done,x,y){
    if(!ALLV._p){ALLV._p=1;z0=z;sc.style.scrollSnapType='none';sc.style.scrollBehavior='auto'}
    var want=z0*s2;setZ(want,x,y);
    if(done){setTimeout(function(){ALLV._p=0},250);sc.style.scrollSnapType='';sc.style.scrollBehavior='';
      if(want>ZMAX*1.12){var id=boardAt(x,y);goSky(id)}}});
  document.addEventListener('keydown',function(e){if(v.classList.contains('on')&&e.key==='Escape'&&!v.classList.contains('home'))close()});
  GJ12.all=ALLV;GJ12.wall=WALL;
}
/* ---- the constellation room: stars on a zigzag chain with drop lines, in depth. Drag sideways to move along it. ---- */
function room(){
  var el=$('#room');if(!el)return;var cv=$('canvas',el),g=cv.getContext('2d'),as=$$('a.st',el),n=as.length,W=0,H=0,dpr=1,
      YS=[70,-25,95,-75,30,-120,-10,-135,-15,-95,60,-55,80,-15],ZS=[60,-110,130,-40,-150,90,0,-90,140,-130,50,-70,120,-30],N=[],mid=0,pan=0,tp=0,vel=0,drag=null,moved=0,raf=0,t0=performance.now(),zoom=1,tz=1,foc=-1;
  as.forEach(function(a,i){if(a.classList.contains('eye'))mid=i});
  function rnd(i){var x=Math.sin(i*91.7+13.3)*43758.5453;return x-Math.floor(x)}
  function build(){var sp=Math.max(96,Math.min(150,W*.9/n))*(((window.GJ12.tune||{}).spread)||1),k=Math.min(1.25,Math.max(.8,H/520));N=[];
    for(var i=0;i<n;i++){var eye=i===mid,y=(eye?-10:YS[i%YS.length])*k,o={a:as[i],x:(i-mid)*sp,y:y,z:eye?0:ZS[i%ZS.length],eye:eye,low:null};
      if(!eye&&y<0||(!eye&&i%3===0))o.low={y:(150+rnd(i)*90)*k,dx:(rnd(i+40)-.5)*14};N.push(o)}}
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=el.clientWidth;H=el.clientHeight;cv.width=W*dpr;cv.height=H*dpr;build();clampPan();go()}
  function lim(){return N.length?[N[0].x,N[n-1].x]:[0,0]}
  function clampPan(){var l=lim();tp=Math.max(l[0],Math.min(l[1],tp))}
  function proj(x,y,z,yaw){var X=x-pan,c=Math.cos(yaw),s=Math.sin(yaw),xr=X*c-z*s,zr=X*s+z*c,f=780,k=f/(f+zr)*zoom,fy=foc>=0?N[foc].y*(1-1/zoom):0;return [W/2+xr*k,H*.44+(y-fy)*k,k]}
  function draw(t){
    var red=de.classList.contains('red'),l=lim(),yaw=((pan/(Math.max(1,l[1]-l[0])/2))*.32)+Math.sin((t-t0)*.00035)*.035,P=[],i;
    for(i=0;i<n;i++)P.push(proj(N[i].x,N[i].y,N[i].z,yaw));
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
    var line=red?'rgba(255,68,87,.45)':'rgba(255,214,214,.42)',core=red?'#ff5a6b':'#fff3f0',halo=red?'255,68,87':'255,196,196';
    g.lineWidth=1;g.strokeStyle=line;g.beginPath();for(i=0;i<n;i++){if(i)g.lineTo(P[i][0],P[i][1]);else g.moveTo(P[i][0],P[i][1])}g.stroke();
    function orb(x,y,r,a){var gw=((window.GJ12.tune||{}).glowv==null?.5:GJ12.tune.glowv)/.5,R=r*6.5;var gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,'rgba('+halo+','+Math.min(1,.62*a*gw)+')');gr.addColorStop(.3,'rgba('+halo+','+Math.min(1,.22*a*gw)+')');gr.addColorStop(1,'rgba('+halo+',0)');
      g.fillStyle=gr;g.beginPath();g.arc(x,y,R,0,6.283);g.fill();g.globalAlpha=Math.min(1,a+.15);g.fillStyle=core;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.globalAlpha=1}
    for(i=0;i<n;i++){var o=N[i],p=P[i],near=Math.max(0,1-Math.abs(p[0]-W/2)/(W*.75)),a=.55+.45*near;
      if(o.low){var q=proj(o.x+o.low.dx,o.low.y,o.z,yaw);g.strokeStyle=line;g.globalAlpha=.8;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();g.globalAlpha=1;orb(q[0],q[1],4.2*q[2],a*.8)}
      var cl=Math.max(0,Math.min(1,(1-Math.abs(p[0]-W/2)/(W*.5)-.62)/.3)),bl=o.eye?0:Math.max(cl*.62*(((window.GJ12.tune||{}).bloom==null?1:GJ12.tune.bloom)),i===foc?Math.min(2.3,(zoom-1)*1.15):0);
      if(o.bl==null)o.bl=0;o.bl+=(bl-o.bl)*.16;o.a.style.setProperty('--b',o.bl.toFixed(3));o.a.style.setProperty('--bo',Math.min(1,o.bl*2.4).toFixed(3));
      if(!o.eye)orb(p[0],p[1],(o.sel?8.5:6.2)*p[2],(o.sel?1.2:a)*(1-Math.min(.75,o.bl)));
      o.a.style.transform='translate('+p[0].toFixed(1)+'px,'+p[1].toFixed(1)+'px) scale('+(o.eye?Math.max(.7,Math.min(1.15,H/470)):1).toFixed(3)+')';o.a.style.setProperty('--o',((.45+.55*near)*(foc>=0&&i!==foc?Math.max(0,1-(zoom-1)/.9):1)).toFixed(2));o.a.style.zIndex=o.eye?3:2}
  }
  function run(t){raf=0;var moving=0;
    if(!drag){if(Math.abs(vel)>.05){tp+=vel;vel*=.93;clampPan();moving=1}var d=tp-pan;if(Math.abs(d)>.3){pan+=d*.18;moving=1}else pan=tp}
    if(Math.abs(tz-zoom)>.003)zoom+=(tz-zoom)*.2;else zoom=tz;if(zoom<=1.001&&tz<=1)foc=-1;
    draw(t||performance.now());raf=requestAnimationFrame(run)}
  function go(){if(!raf)raf=requestAnimationFrame(run)}
  el.addEventListener('pointerdown',function(e){drag={x:e.clientX,p:tp,lx:e.clientX,t:performance.now(),v:0};moved=0;vel=0});
  el.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x;if(Math.abs(dx)>6){if(!moved){moved=1;try{el.setPointerCapture(e.pointerId)}catch(x){}}}
    if(!moved)return;var now=performance.now();drag.v=-(e.clientX-drag.lx)/Math.max(1,now-drag.t)*16;drag.lx=e.clientX;drag.t=now;tp=drag.p-dx*1.15;var l=lim();if(tp<l[0])tp=l[0]-(l[0]-tp)*.3;if(tp>l[1])tp=l[1]+(tp-l[1])*.3;pan=tp});
  function up(){if(!drag)return;var d=drag;drag=null;if(moved){vel=d.v;clampPan();el._sw=Date.now()}}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  as.forEach(function(a,i){a.addEventListener('click',function(e){if(el._sw&&Date.now()-el._sw<350){e.preventDefault();return}e.preventDefault();N.forEach(function(o){o.sel=0});N[i].sel=1;jumpTo(a.getAttribute('data-k'))});a.addEventListener('dragstart',function(e){e.preventDefault()})});
  el.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();tp+=e.deltaX;clampPan()}},{passive:false});
  /* pinch toward a star: the room closes in on it, and at its closest the star opens into the wall of that piece */
  var z0=1;
  function nearestStar(x){var r=el.getBoundingClientRect(),best=0,bd=1e9;N.forEach(function(o,i){var q=o.a.getBoundingClientRect(),d=Math.abs(q.left+q.width/2-x);if(d<bd){bd=d;best=i}});return best}
  function openStar(i){var o=N[i],id=o.a.getAttribute('data-k'),q=o.a.getBoundingClientRect(),G=GAL[id];
    if(!G||!G.items||!G.items().length){if(window.CKS19&&CKS19.settleHide)CKS19.settleHide();jumpTo(id);setTimeout(function(){zoom=tz=1;foc=-1},200);return}
    if(!WALL.open(id,0,q.left+q.width/2,q.top+q.height/2)){jumpTo(id)}
    if(window.CKS19&&CKS19.settleHide)CKS19.settleHide();
    setTimeout(function(){zoom=tz=1;foc=-1},500)}
  var SETTLE=2.3,ENTER=3.1;
  pinchOn(el,function(sc,done,x){
    if(foc<0&&zoom<=1.01&&sc<1){if(done){if(sc<.85)ALLV.open();if(window.CKS19&&CKS19.settleHide)CKS19.settleHide()}else{el.style.transform='scale('+Math.max(.8,sc).toFixed(3)+')';el.style.opacity=Math.max(.3,1-(1-sc)*2)}if(done){el.style.transform='';el.style.opacity=''}return}
    el.style.transform='';el.style.opacity='';
    if(foc<0){foc=nearestStar(x);z0=zoom;tp=N[foc].x;vel=0;drag=null}
    var z=Math.max(1,Math.min(3.6,z0*sc));
    if(window.CKS19&&CKS19.settle&&foc>=0)CKS19.settle(N[foc],z,done);
    if(!done){zoom=tz=z;return}
    if(z>=ENTER){tz=SETTLE;var i=foc;setTimeout(function(){openStar(i)},180)}
    else if(z>=SETTLE*0.88){tz=SETTLE}
    else{tz=1;if(window.CKS19&&CKS19.settleHide)CKS19.settleHide()}});
  GJ12.roomFrom=function(id,close){N.forEach(function(o,i){if(o.a.getAttribute('data-k')===id)foc=i});if(foc<0)return;pan=tp=N[foc].x;if(close){zoom=3.2;tz=1}else{zoom=tz=1;foc=-1}};
  GJ12.roomZoom=function(){return {zoom:zoom,tz:tz,foc:foc}};
  var ab=$('#allbtn');if(ab)ab.addEventListener('click',function(){ALLV.open()});
  new ResizeObserver(size).observe(el);GJ12.reroom=function(){build();clampPan()};GJ12.room=function(){return {pan:pan,n:n,mid:mid,lim:lim()}};
  size();
}
/* ---- one work per screen ---- */
var CUR=null,GAL={};
function plates(){
  var ps=$$('.plate'),where=$('#where'),rail=$$('#rail a');
  ps.forEach(function(p){gallery(p)});
  function setCur(p){
    if(CUR===p)return;CUR=p;
    de.classList.toggle('in',!!p);
    de.style.setProperty('--tint',p?p.getAttribute('data-c'):'214,226,236');
    rail.forEach(function(a){a.classList.toggle('on',!!p&&a.getAttribute('href')==='#'+p.id)});
    var pt=$('#ptitle');if(pt)pt.textContent=p?$('h2',p).textContent:'work examples';
    if(p){where.innerHTML='<b>'+p.getAttribute('data-sec')+'</b> · '+p.getAttribute('data-n');
      if(!navLock){try{var st=history.state||{};if(st.view==='piece'){history.replaceState(Object.assign({},st,{view:'piece',id:p.id}),'','#'+p.id)}else if(!st.view||st.view==='sky'){history.replaceState({view:'piece',id:p.id},'','#'+p.id)}}catch(e){}}}
    else{if(!navLock){try{var st2=history.state||{};history.replaceState(Object.assign({},st2,{view:st2.view||'sky'}),'',location.pathname+location.search)}catch(e){}}}
    $$('video,audio').forEach(function(m){if(!p||!p.contains(m)){try{m.pause()}catch(e){}}});
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
  var st=$('.stage',p),strip=$$('.strip button',p),img=$('img.main',st),m3=$('.dial',st),vid=$('video',st),cap=$('.cap',p),at=0;
  if(!strip.length)return;
  function show(i,user){
    at=(i+strip.length)%strip.length;var b=strip[at],k=b.getAttribute('data-kind');
    strip.forEach(function(x,j){x.classList.toggle('on',j===at)});
    if(img)img.hidden=k!=='img';if(m3)m3.hidden=k!=='dial';if(vid){if(k==='video'){var vs=b.getAttribute('data-big'),vp=b.getAttribute('data-poster');if(vs&&vid.getAttribute('src')!==vs)vid.src=vs;if(vp)vid.setAttribute('poster',vp);vid.hidden=false}else{vid.hidden=true;try{vid.pause()}catch(e){}}}
    if(k==='img'){var src=b.getAttribute('data-big');if(p._n){if(img.getAttribute('src')!==src)img.src=src}else img.setAttribute('data-src',src);img.alt=b.getAttribute('data-alt')||''}
    if(k==='dial'){if(m3._d)m3._d.say();if(typeof railPaint==='function')railPaint();return}
    var c=b.getAttribute('data-cap')||'',g=b.getAttribute('data-grp')||'';
    var imgs=strip.filter(function(x){return x.getAttribute('data-kind')==='img'}),n=imgs.indexOf(b);
    cap.innerHTML='';cap.appendChild(document.createTextNode(c));
    var sm=document.createElement('small');sm.textContent=k==='img'?((g?g+' · ':'')+(imgs.length>1?(n+1)+' of '+imgs.length:'')):(b.getAttribute('data-note')||'');cap.appendChild(sm);
    if(user&&b.scrollIntoView)try{b.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})}catch(e){}
    if(typeof railPaint==='function')railPaint();
  }
  strip.forEach(function(b,i){b.addEventListener('click',function(){show(i,true)})});
  /* the rail: slide a finger along it to flip through this piece's photographs at speed */
  var gr=$('.grail',p),imgsAll=strip.filter(function(x){return x.getAttribute('data-kind')==='img'});
  function railPaint(){if(!gr)return;var j=imgsAll.indexOf(strip[at]);gr.classList.toggle('off',j<0&&!!m3&&!m3.hidden);var d=$('i',gr);if(d)d.style.left=(imgsAll.length>1&&j>=0?j/(imgsAll.length-1)*100:0)+'%'}
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
  p._near=function(){if(!p._n){p._n=1;var ds=img&&img.getAttribute('data-src');if(ds){img.src=ds;img.removeAttribute('data-src')}}if(m3&&!m3._d)dial(m3,p,cap)};
  GAL[p.id]={step:function(d){if(m3&&!m3.hidden&&m3._d)m3._d.step(d);else show(at+d,true)},at:function(){return at},show:show,
    items:function(){var o=[];if(m3)$$('figure',m3).forEach(function(f){o.push({big:f.getAttribute('data-big'),th:f.getAttribute('data-big'),cap:f.getAttribute('data-cap')})});
      strip.forEach(function(b){var t=$('img',b);o.push({big:b.getAttribute('data-big'),th:t?t.getAttribute('src'):b.getAttribute('data-big'),cap:b.getAttribute('data-cap')})});return o},
    showBig:function(src){var b=strip.filter(function(x){return x.getAttribute('data-big')===src})[0];if(b){show(strip.indexOf(b),true);return}
      if(m3){var fs=$$('figure',m3),j=-1;fs.forEach(function(f,q){if(f.getAttribute('data-big')===src)j=q});if(j>=0){show(0,true);if(!m3._d)dial(m3,p,cap);var t=$$('.ticks button',m3)[j];if(m3._d&&m3._d.jump)m3._d.jump(j)}}}};
  /* pinch the picture smaller and it opens out into the wall of every image of this piece */
  pinchOn(st,function(sc,done){if(done&&sc<.82){if(window.goUp)goUp();else WALL.open(p.id,2)}});
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
  LB.open=function(s,i,f){set=s;cb=f;de.style.scrollSnapType='none';show(i);lb.classList.add('on');document.body.style.overflow='hidden';try{history.pushState({lb:1},'')}catch(e){}};
  addEventListener('popstate',function(){if(lb.classList.contains('on'))shut()});
  $('.x',lb).addEventListener('click',close);
  $('.nv.p',lb).addEventListener('click',function(){show(at-1)});$('.nv.n',lb).addEventListener('click',function(){show(at+1)});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(at-1);if(e.key==='ArrowRight')show(at+1)});
  var sx=null,st=$('.st',lb);
  st.addEventListener('touchstart',function(e){sx=e.touches.length===1?e.touches[0].clientX:null},{passive:true});
  st.addEventListener('touchend',function(e){if(sx==null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)show(at+(dx<0?1:-1))},{passive:true});
}
/* ---- sound: one track, one button ---- */
function player(){
  var el=$('.player');if(!el)return;
  var au=$('audio',el),pp=$('.pp',el),cv=$('canvas',el),wave=$('.wave',el),t0=$('.t0',el),t1=$('.t1',el),peaks=[];
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
  ['play','pause','ended'].forEach(function(ev){au.addEventListener(ev,function(){pp.textContent=au.paused?'play':'pause';draw()})});
  ['timeupdate','loadedmetadata','seeked'].forEach(function(ev){au.addEventListener(ev,draw)});
  var down=false;
  wave.addEventListener('pointerdown',function(e){down=true;try{wave.setPointerCapture(e.pointerId)}catch(x){}seek(e)});
  wave.addEventListener('pointermove',function(e){if(down)seek(e)});
  wave.addEventListener('pointerup',function(){down=false});wave.addEventListener('pointercancel',function(){down=false});
  addEventListener('resize',draw);new MutationObserver(draw).observe(de,{attributes:true,attributeFilter:['class']});draw();
  /* White Noise atmosphere inside the player window. The rail sets density. The track lifts it. */
  var wn=$('canvas.wn',el.parentNode),vr=$('.vrail',el.parentNode);if(!wn)return;
  var g2=wn.getContext('2d'),PT=[],dens=.35,lv=0,W2=0,H2=0,reduce=false;
  try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  function rnd(i){var x=Math.sin(i*78.233+12.9898)*43758.5453;return x-Math.floor(x)}
  for(var i=0;i<1400;i++)PT.push({x:rnd(i),y:rnd(i+2000),r:.4+1.8*Math.pow(rnd(i+4000),2.2),p:rnd(i+6000)*6.28,s:.25+rnd(i+8000),k:rnd(i+10000)});
  function vset(v){dens=Math.max(0,Math.min(1,v));if(vr)$('i',vr).style.top=((1-dens)*100)+'%'}
  if(vr){var vd=0;function vAt(e){var r=vr.getBoundingClientRect();vset(1-(e.clientY-r.top-12)/Math.max(1,r.height-24))}
    vr.addEventListener('pointerdown',function(e){vd=1;vr.classList.add('on');try{vr.setPointerCapture(e.pointerId)}catch(x){}vAt(e)});vr.addEventListener('pointermove',function(e){if(vd)vAt(e)});
    vr.addEventListener('pointerup',function(){vd=0;vr.classList.remove('on')});vr.addEventListener('pointercancel',function(){vd=0;vr.classList.remove('on')})}
  vset(.35);GJ12.field=function(){return {dens:dens,level:lv}};
  function field(t){requestAnimationFrame(field);var r=wn.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
    var dpr=Math.min(2,window.devicePixelRatio||1);if(W2!==wn.clientWidth||H2!==wn.clientHeight){W2=wn.clientWidth;H2=wn.clientHeight;wn.width=W2*dpr;wn.height=H2*dpr}
    var want=0;if(!au.paused&&peaks.length&&D()){want=peaks[Math.min(peaks.length-1,Math.floor(au.currentTime/D()*peaks.length))]||0}lv+=(want-lv)*.08;
    var red=de.classList.contains('red')||de.getAttribute('data-theme')==='red'||de.getAttribute('data-theme')==='full';
    var col=red?'255,68,87':'236,240,244';
    g2.setTransform(dpr,0,0,dpr,0,0);g2.clearRect(0,0,W2,H2);
    var bg=g2.createLinearGradient(0,0,0,H2);bg.addColorStop(0,'rgba(6,8,12,1)');bg.addColorStop(1,'rgba(10,12,16,1)');g2.fillStyle=bg;g2.fillRect(0,0,W2,H2);
    /* fine grain */
    /* dense film grain so it reads as atmosphere, not a star chart */
    var gn=Math.round((1600+4200*dens)*( .5+.8*lv));
    if(reduce)gn=Math.round(900+2000*dens);
    g2.fillStyle='rgb('+col+')';
    var npts=PT.length;
    for(var i=0;i<gn;i++){
      var q=PT[i%npts],fall=reduce?0:((t*.012*q.s*(.25+dens)+i*.001)%1);
      var x=((q.x+ (i/gn)*.07)%1)*W2, y=((q.y+fall)%1)*H2;
      var a=(.06+.16*q.k)*(.55+dens*.7+.4*lv);
      g2.globalAlpha=a;
      g2.fillRect(x,y,1,1);
    }
    /* slower dust flakes */
    var fn=Math.round(80+360*dens*(.5+lv));
    if(reduce)fn=Math.round(40+120*dens);
    for(var j=0;j<fn;j++){
      var q=PT[(j*7+40)%npts],fall=reduce?0:((q.y+t*.000028*q.s*(.7+dens+lv))%1);
      var x=((q.x+(reduce?0:Math.sin(t*.00025+q.p)*.012*q.s))%1)*W2, y=fall*H2;
      g2.globalAlpha=(.10+.28*q.s)*(.35+.65*dens)*(.75+.4*lv);
      g2.fillRect(x,y,q.r<.8?1:2,q.r<.8?1:2);
    }
    g2.globalAlpha=1;
  }
  requestAnimationFrame(field);

  /* volume + a persistent mini player that loops only Lost in Time, same audio */
  au.loop=true;
  var vol=$('.vol input',el),mini=document.getElementById('mini');
  if(!mini){mini=document.createElement('div');mini.id='mini';mini.innerHTML='<button type="button" class="pp" aria-label="play or pause">play</button><span class="mt">Lost in Time · Lost Coffee</span><input type="range" class="vol" min="0" max="1" step="0.01" value="1" aria-label="volume">';document.body.appendChild(mini)}
  var mpp=$('.pp',mini),mvol=mini.querySelector('input.vol');
  function setVol(v){v=Math.max(0,Math.min(1,+v));au.volume=v;if(vol)vol.value=v;if(mvol)mvol.value=v;try{sessionStorage.setItem('cks-v19m.vol',String(v))}catch(e){}}
  try{var sv=sessionStorage.getItem('cks-v19m.vol');if(sv!=null)setVol(sv)}catch(e){}
  if(vol)vol.addEventListener('input',function(){setVol(vol.value)});
  if(mvol)mvol.addEventListener('input',function(){setVol(mvol.value)});
  function syncMini(){if(mpp)mpp.textContent=au.paused?'play':'pause';mini.hidden=false}
  ['play','pause','ended','timeupdate'].forEach(function(ev){au.addEventListener(ev,syncMini)});
  if(mpp)mpp.addEventListener('click',function(){if(au.paused){var p=au.play();if(p&&p.catch)p.catch(function(){})}else au.pause()});
  syncMini();
}
/* ---- tuning: only for Gill, behind ?tune ---- */
function tune(){
  var d=document.createElement('details');d.id='tune';d.open=true;
  var rows=[['glow','glow',0,1.4,.05],['spread','room spread',.6,1.8,.05],['bloom','star bloom',0,1.6,.05],['stars','stars',0,3,.1],['drift','depth drift',0,3,.1],['stage','picture size',.4,.7,.01],['panel','panel size',.4,1,.01],['mx','side margin',0,40,1],['bounce','flip bounce',0,1,.05],['rail','rail speed',.4,3,.1],['spin','dial spin',.3,3,.1],['depth','dial depth',.4,2.5,.05]];
  d.innerHTML='<summary>tune</summary><label>text size<input type="range" data-text min="0.9" max="1.5" step="0.05"><output></output></label><div class="abc"><span>photo row</span><button data-l="a">A thumbs</button><button data-l="b">B dots</button><button data-l="c">C large</button></div>'+
    rows.map(function(r){return '<label>'+r[1]+'<input type="range" data-k="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'"><output></output></label>'}).join('')+'<button data-reset>back to the design</button>';
  document.body.appendChild(d);
  function paint(){$$('input',d).forEach(function(i){if(i.hasAttribute('data-text')){var n=applyText();i.value=n;i.nextSibling.textContent=Math.round(n*16)+'px'}else if(i.getAttribute('data-k')){i.value=val(i.getAttribute('data-k'));i.nextSibling.textContent=i.value}});
    $$('[data-l]',d).forEach(function(b){b.classList.toggle('on',val('strip')===b.getAttribute('data-l'))})}
  function save(){LS.set('cks-v19m.tune',JSON.stringify(TUNE));apply();paint()}
  d.addEventListener('input',function(e){if(e.target.hasAttribute('data-text')){try{sessionStorage.setItem('cks-v19m.text',e.target.value)}catch(x){}applyText();paint();return}var k=e.target.getAttribute('data-k');if(!k)return;TUNE[k]=+e.target.value;save()});
  d.addEventListener('click',function(e){var l=e.target.getAttribute&&e.target.getAttribute('data-l');if(l){TUNE.strip=l;save()}
    if(e.target.hasAttribute&&e.target.hasAttribute('data-reset')){TUNE={};save()}});
  paint();
}
})();
