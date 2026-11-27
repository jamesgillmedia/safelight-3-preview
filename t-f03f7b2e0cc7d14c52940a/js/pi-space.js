/* environment mode (light study > view > environment). Off by default; the orb sky stays the default.
   The visitor stands inside his work: full-bleed photographs as walls of a corridor of light, moving forward through fog.
   Only CKS portfolio photographs (read from this page's own pieces). Each picture shows only once a sharp enough file has landed:
   small thumbnail far away, the 960 px web size nearer, the full file up close. Nothing is ever shown larger than its pixels. */
(function(){
var de=document.documentElement,PI=window.GJPI;if(!PI)return;
var M=null,root=null,world=null,F=[],camZ=0,tz=0,maxZ=1,raf=0,P=900,px=0,py=0,tx=0,ty=0,built='',vis=false,lastT=0;
function on(){return PI.e('space')>0}
function phone(){return innerWidth<700}
function load(cb){if(M)return cb();fetch('js/pi-media.json').then(function(r){return r.json()}).then(function(d){M=d;cb()}).catch(function(){})}
function order(){var ids=(GJ12.orderIds?GJ12.orderIds():Object.keys(M)).filter(function(id){return M[id]&&M[id].items.length});Object.keys(M).forEach(function(id){if(ids.indexOf(id)<0&&M[id].items.length)ids.push(id)});return ids}
function make(){
  if(!root){root=document.createElement('div');root.id='pispace';root.setAttribute('aria-label','environment: move forward through the work');
    root.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="pired" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".30 .59 .11 0 0  .05 .10 .02 0 0  .06 .12 .02 0 0  0 0 0 1 0"/></filter></svg><div class="pworld"></div><div class="pfog a"></div><div class="pfog b"></div><div class="pvig"></div>';
    var sky=document.getElementById('sky');(sky||document.body).insertBefore(root,sky?sky.firstChild:null);world=root.querySelector('.pworld');bind()}
  var mode=PI.arrMode?PI.arrMode():'strongest',key=mode+'|'+order().join(',')+'|'+phone();if(key===built)return;built=key;
  world.innerHTML='';F=[];
  var W=innerWidth,H=innerHeight,ph=phone(),D=ph?380:520,z=-D*.9,side=0,cont=mode==='continuous';
  P=ph?700:900;root.style.perspective=P+'px';
  order().forEach(function(id,pi){var m=M[id],its=m.items;
    its.forEach(function(it,j){var hero=!cont&&j===0,asp=it.fw/it.fh,h,w,x,y,a;
      if(hero){h=ph?H*.42:H*.62;w=h*asp;var mw=ph?W*.84:W*.6;if(w>mw){w=mw;h=w/asp}x=0;y=-H*.02;a=0}
      else{side=1-side;h=ph?H*.36:H*.52;w=h*asp;var mw2=ph?W*.62:W*.42;if(w>mw2){w=mw2;h=w/asp}x=(side?-1:1)*(ph?W*.34:W*.33);y=(j%3-1)*H*.05;a=(side?1:-1)*(ph?40:34)}
      var el=document.createElement('figure');el.className='pf'+(hero?' hero':'');el.setAttribute('data-id',id);
      el.style.width=w.toFixed(1)+'px';el.style.height=h.toFixed(1)+'px';
      el.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,'+z.toFixed(1)+'px) rotateY('+a+'deg) translate(-50%,-50%)';
      var im=document.createElement('img');im.alt='';im.decoding='async';im.draggable=false;el.appendChild(im);
      if(hero){var cap=document.createElement('figcaption');cap.textContent=m.title;el.appendChild(cap)}
      world.appendChild(el);
      F.push({el:el,im:im,id:id,it:it,z:z,w:w,hero:hero,a:a,lvl:-1,want:-1,shown:0});
      z-=hero?D*1.15:(side?D*.15:D*.85)});
    if(!cont)z-=D*.6});
  maxZ=Math.max(1,-z-D*1.2);if(tz>maxZ)tz=camZ=maxZ}
/* resolution: 0 thumb, 1 web 960, 2 full */
function src(it,l){return l===0?it.t:l===1?it.w:it.f}
function natW(it,l){return l===0?it.tw:l===1?it.ww:it.fw}
function needLevel(it,need){if(it.t&&it.tw>=need)return 0;if(it.w&&it.ww>=need)return 1;return 2}
var inflight=0;
function fetchLvl(f,l){if(f.loading===l||f.lvl>=l)return;if(inflight>4&&l>0)return;f.loading=l;inflight++;var u=src(f.it,l),pre=new Image();pre.decoding='async';
  pre.onload=function(){inflight--;(pre.decode?pre.decode():Promise.resolve()).catch(function(){}).then(function(){if(l>f.lvl){f.lvl=l;f.im.src=u}f.loading=-1})};
  pre.onerror=function(){inflight--;f.loading=-1;f.bad=(f.bad||0)+1};pre.src=u}
function frame(t){raf=requestAnimationFrame(frame);if(!vis||document.hidden)return;
  if(PI.reduce&&t-lastT<200)return;lastT=t;
  var k=PI.reduce?1:.085;camZ+=(tz-camZ)*k;px+=(tx-px)*.05;py+=(ty-py)*.05;
  var br=PI.reduce?0:PI.e('breath'),pa=PI.reduce?0:PI.e('par'),tt=PI.reduce?0:t;
  var bx=Math.sin(tt*.00011)*6*br,by=Math.cos(tt*.00008)*4*br;
  world.style.transform='translate3d('+(bx+px*-18*pa).toFixed(2)+'px,'+(by+py*-12*pa).toFixed(2)+'px,'+camZ.toFixed(1)+'px) rotateY('+(px*2.2*pa).toFixed(3)+'deg) rotateX('+(-py*1.6*pa).toFixed(3)+'deg)';
  var dpr=window.devicePixelRatio||1,fogd=4200*(1.15-.6*PI.e('fog'));
  /* measured: how many device pixels the picture really covers on screen right now (its nearest edge on the angled walls) */
  {for(var q=0;q<F.length;q++){var g=F[q];if(!g.shown){g.needR=0;continue}var r=g.el.getBoundingClientRect(),oh=g.el.offsetHeight||1;g.needR=(r.right<0||r.left>innerWidth)?0:Math.max(r.width,g.el.offsetWidth*(r.height/oh))*dpr}}
  for(var i=0;i<F.length;i++){var f=F[i],d=f.z+camZ;/* d<0 ahead */
    if(d>P*.82||d<-fogd-900){if(f.shown){f.el.style.visibility='hidden';f.shown=0}if(d<-fogd-900&&d>-fogd-2600&&f.lvl<0)fetchLvl(f,needLevel(f.it,f.w*dpr*P/(P-(-fogd)) ));continue}
    var s=P/(P-d),near=f.hero?1:1.45,need=Math.max(f.w*s*near*dpr,f.needR||0),L=needLevel(f.it,need);
    /* look ahead: what it will need a little closer */
    var s2=P/(P-Math.min(P*.6,d+900)),L2=needLevel(f.it,f.w*s2*near*dpr);
    if(f.lvl<L)fetchLvl(f,L);else if(f.lvl<L2)fetchLvl(f,L2);
    var sharp=f.lvl>=0&&natW(f.it,f.lvl)>=need*.92,tooClose=need>f.it.fw*.97;if(tooClose!==f.tc){f.tc=tooClose;f.el.style.transition=tooClose?'opacity .08s linear':''}
    var fog=Math.max(0,Math.min(1,1+d/fogd)),fade=d>P*.45?Math.max(0,1-(d-P*.45)/(P*.37)):1,
        op=(sharp&&!tooClose)?fog*fade:0,lit=.42+.58*Math.pow(fog,.8);
    if(!f.shown){f.el.style.visibility='visible';f.shown=1}
    var o=op.toFixed(3);if(o!==f.o){f.o=o;f.el.style.opacity=o}
    var b=lit.toFixed(2);if(b!==f.b){f.b=b;f.el.style.setProperty('--lit',b)}}
}
function show(v){if(v===vis)return;vis=v;de.classList.toggle('pi-space',v);if(root)root.classList.toggle('on',v)}
function check(){var want=on()&&!de.classList.contains('in');if(want){load(function(){make();show(true);if(!raf)raf=requestAnimationFrame(frame)})}else show(false)}
function bind(){
  root.addEventListener('wheel',function(e){if(!vis)return;var dz=(Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX)*1.4;
    if((dz>0&&tz>=maxZ)||(dz<0&&tz<=0&&(window.scrollY||0)>0))return;e.preventDefault();tz=Math.max(0,Math.min(maxZ,tz+dz))},{passive:false});
  var drag=null;
  root.addEventListener('pointerdown',function(e){if(!vis||e.button>0)return;drag={x:e.clientX,y:e.clientY,z:tz,t:performance.now(),m:0,id:e.pointerId};},{passive:true});
  addEventListener('pointermove',function(e){if(e.pointerType!=='touch'){tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2}
    if(!drag||e.pointerId!==drag.id)return;var dy=e.clientY-drag.y,dx=e.clientX-drag.x;if(Math.abs(dx)+Math.abs(dy)>6)drag.m=1;
    var dz=-(Math.abs(dy)>Math.abs(dx)?dy:dx)*(phone()?3.2:2.4),nz=drag.z+dz;
    if(nz>maxZ&&dy<0&&e.pointerType==='touch'){window.scrollBy(0,(nz-maxZ)/6);drag.z-=(nz-maxZ)}
    tz=Math.max(0,Math.min(maxZ,nz))},{passive:true});
  addEventListener('pointerup',function(e){if(!drag||e.pointerId!==drag.id)return;var d=drag;drag=null;if(d.m)return;
    var fe=e.target&&e.target.closest&&e.target.closest('#pispace .pf');if(!fe||+fe.style.opacity<.25)return;var id=fe.getAttribute('data-id');
    if(!(GJ12.enterPlate&&GJ12.enterPlate(id,fe)))PI.go(id)},{passive:true});
  addEventListener('pointercancel',function(){drag=null},{passive:true});
  addEventListener('deviceorientation',function(ev){if(ev.beta==null||!vis)return;if(bind.b==null){bind.b=ev.beta;bind.g=ev.gamma}tx=Math.max(-1,Math.min(1,(ev.gamma-bind.g)/18));ty=Math.max(-1,Math.min(1,(ev.beta-bind.b)/18))},{passive:true});
  document.addEventListener('keydown',function(e){if(!vis||e.ctrlKey||e.metaKey||e.altKey)return;var a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return;if(document.getElementById('pistudy')&&!document.getElementById('pistudy').hidden)return;
    var st=phone()?380:520;if(e.key==='ArrowUp'||e.key==='w'){tz=Math.min(maxZ,tz+st);e.preventDefault()}else if(e.key==='ArrowDown'||e.key==='s'){if(tz<=0)return;tz=Math.max(0,tz-st);e.preventDefault()}});
  var rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){built='';if(vis)make()},250)});
}
new MutationObserver(check).observe(de,{attributes:true,attributeFilter:['class']});
document.addEventListener('pi:env',function(e){if(e.detail&&e.detail.k==='space')check()});
document.addEventListener('pi:arrange',function(){if(!root)return;built='';make();camZ=tz=0});
PI.space={state:function(){return {on:vis,frames:F.length,camZ:camZ,maxZ:maxZ,shown:F.filter(function(f){return +f.o>.05}).length,levels:F.map(function(f){return f.lvl})}},go:function(z){tz=Math.max(0,Math.min(maxZ,z))}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check);else check();
})();
