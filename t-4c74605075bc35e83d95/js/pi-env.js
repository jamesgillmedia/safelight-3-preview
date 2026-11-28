/* pi environment: shell-first reveal, background warm-up, and the light study (light symbol). Off-photo only: the photo zoom layer is untouched. */
(function(){
var de=document.documentElement,PI=window.GJPI=window.GJPI||{},$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var E=PI.E||{},ED=PI.ED||{},e=PI.e||function(k){return E[k]==null?ED[k]:+E[k]};
function save(){if(PI.save)PI.save()}
/* ---------- 1. reveal: the shell is already up; bring the constellation in once the orbs in view have decoded ---------- */
var done=0;
function reveal(){if(done)return;done=1;window.__revealT=performance.now();de.classList.add('pi-rise');
  requestAnimationFrame(function(){de.classList.remove('pi-pre')});
  setTimeout(function(){de.classList.remove('pi-rise')},1400);
  /* any orb still on its way fades in when it lands, rather than popping */
  $$('#room img.orb').forEach(function(im){function ld(){im.classList.add('pi-ld','pi-ldt');setTimeout(function(){im.classList.remove('pi-ldt')},1000)}if(im.complete&&im.naturalWidth){im.classList.add('pi-ld');return}im.addEventListener('load',ld,{once:true});im.addEventListener('error',ld,{once:true})});de.classList.add('pi-orbfade');
  function later(){setTimeout(function(){var idle=window.requestIdleCallback||function(f){setTimeout(f,200)};idle(warm,{timeout:4000})},1200)}
  if(document.readyState==='complete')later();else addEventListener('load',later,{once:true})}
function inView(el){var r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&r.width>0}
function whenReady(){
  var ims=$$('#room img.orb,#sky img').filter(inView),cap=setTimeout(reveal,900);
  Promise.all(ims.map(function(im){if(im.complete&&im.naturalWidth)return im.decode?im.decode().catch(function(){}):0;return new Promise(function(res){im.addEventListener('load',function(){(im.decode?im.decode():Promise.resolve()).then(res,res)},{once:true});im.addEventListener('error',res,{once:true})})}))
  .then(function(){clearTimeout(cap);reveal()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(whenReady,0)});else setTimeout(whenReady,0);
/* ---------- 2. warm the piece photos in the background, low priority, one at a time ---------- */
function warm(){
  var c=navigator.connection||{};if(c.saveData||/2g/.test(c.effectiveType||''))return;
  var max=matchMedia('(max-width:700px)').matches?10:24,seen={},q=[];
  $$('img[data-src]').forEach(function(im){var u=im.getAttribute('data-src');if(u&&!seen[u]&&q.length<max){seen[u]=1;q.push(u)}});
  var idle=window.requestIdleCallback||function(f){return setTimeout(function(){f({timeRemaining:function(){return 8}})},120)};
  function next(){if(!q.length||de.classList.contains('in'))return;idle(function(){var u=q.shift(),im=new Image();try{im.fetchPriority='low'}catch(x){}im.decoding='async';im.onload=im.onerror=function(){setTimeout(next,60)};im.src=u},{timeout:2500})}
  next();window.__warmQ=q}
/* ---------- 3. the light symbol and the light study ---------- */
var top=$('#top');if(!top)return;
var btn=document.createElement('button');btn.type='button';btn.id='lightbtn';btn.setAttribute('aria-label','light and environment');btn.setAttribute('aria-pressed','false');
btn.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.1"/><g stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".75"><path d="M12 3.2v2.4M12 18.4v2.4M3.2 12h2.4M18.4 12h2.4M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M5.8 18.2l1.6-1.6M16.6 7.4l1.6-1.6"/></g></svg>';
/* phones: the top bar is full, so the light symbol (and the heart count) sit with the round controls at the foot of the screen */
var PMQ=matchMedia('(max-width:600px)');PI.placeBtn=function(b,ref){function put(){if(PMQ.matches){if(b.parentNode!==document.body)document.body.appendChild(b);b.classList.add('pi-foot')}else{b.classList.remove('pi-foot');var r=ref&&$(ref);if(r&&r.parentNode===top){if(b.nextSibling!==r)top.insertBefore(b,r)}else{var air=$('#airbtn');if(air)top.insertBefore(b,air);else top.appendChild(b)}}}put();if(PMQ.addEventListener)PMQ.addEventListener('change',put)};PI.placeBtn(btn,'#airbtn');
var P=document.createElement('div');P.id='pistudy';P.setAttribute('role','dialog');P.setAttribute('aria-label','light and environment');P.hidden=true;document.body.appendChild(P);
['pointerdown','pointermove','pointerup','touchstart','touchmove','wheel','click','keydown'].forEach(function(t){P.addEventListener(t,function(ev){ev.stopPropagation()},{passive:true})});
function tv(k){return GJ12&&GJ12.val?+GJ12.val(k):0}
function tset(k,v){if(GJ12&&GJ12.setTune)GJ12.setTune(k,v)}
var C=[
 ['view'],
 ['arrange'],
 ['library'],
 ['tune','archfield','archive field','tog'],['tune','sechide','hide secondary','tog'],['env','hearts','hearts and notes','tog'],
 ['environment'],
 ['env','on','environment','tog'],['env','fog','fog',0,1,.01],['env','fogh','fog height',0,1,.01],['env','fogs','fog speed',0,1,.01],['env','fogd','fog direction',-1,1,.01],
 ['env','bokeh','bokeh',0,1,.01],['env','tw','twinkle',0,1,.01],['env','react','response',0,1.5,.01],['env','fade','drift and fade','tog'],['env','breath','breathing',0,1.5,.01],['env','par','parallax',0,1.5,.01],
 ['light'],
 ['tune','glow','glow',0,1.5,.01],['tune','bloom','bloom',0,1.5,.01],['tune','stars','stars',0,1.6,.01],['tune','dimmer','light level',.3,1,.01],
 ['sky'],
 ['tune','drift','star drift',0,3,.01],['look','skylook','orbs drift and fade','tog'],['tune','skybreath','orb breathing',0,2,.01],['tune','skyfade','orb fade',0,1,.01],['tune','cdepth','depth',0,1.5,.01],
 ['sound'],
 ['env','sound','sound bed','tog'],['env','vol','bed level',0,.4,.01],['env','cont','lost in time continuous','tog'],
 ['movement'],
 ['env','enter','entering','tog'],
 ['project']
];
function row(c){var src=c[0],k=c[1],lab=c[2],id='pi-'+k;
  if(c[3]==='tog'){var on=src==='env'?e(k)>0:src==='look'?String(GJ12.val(k))==='b':tv(k)>0;
    return '<label class="pir tog"><span>'+lab+'</span><button type="button" class="pit'+(on?' on':'')+'" data-src="'+src+'" data-k="'+k+'" aria-pressed="'+on+'"><i></i></button></label>'}
  var v=src==='env'?e(k):tv(k);
  return '<label class="pir" for="'+id+'"><span>'+lab+'</span><input id="'+id+'" type="range" min="'+c[3]+'" max="'+c[4]+'" step="'+c[5]+'" value="'+v+'" data-src="'+src+'" data-k="'+k+'"><b>'+(+v).toFixed(2)+'</b></label>'}
function pieces(){return $$('#room a.st[data-k]').map(function(a){var t=(a.getAttribute('aria-label')||a.textContent||a.getAttribute('data-k')).replace(/\s+/g,' ').trim();return [a.getAttribute('data-k'),t]})}
var cur=null;
function projRows(){var L=pieces();if(!cur&&L.length)cur=L[0][0];var pr=(E.proj||{})[cur]||{a:0,w:.5};
  return '<label class="pir"><span>piece</span><select id="pi-proj">'+L.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===cur?' selected':'')+'>'+x[1].replace(/</g,'&lt;')+'</option>'}).join('')+'</select></label>'+
  '<label class="pir"><span>aura</span><input type="range" min="0" max="1" step=".01" value="'+pr.a+'" data-src="proj" data-k="a"><b>'+(+pr.a).toFixed(2)+'</b></label>'+
  '<label class="pir"><span>warmth</span><input type="range" min="0" max="1" step=".01" value="'+pr.w+'" data-src="proj" data-k="w"><b>'+(+pr.w).toFixed(2)+'</b></label>'}
function viewRows(){var sp=e('space')>0;return '<div class="piseg"><button type="button" data-a="space0" class="'+(sp?'':'on')+'" aria-pressed="'+!sp+'">orb sky</button><button type="button" data-a="space1" class="'+(sp?'on':'')+'" aria-pressed="'+sp+'">environment</button></div>'}
function arrRows(){var m=PI.arrMode?PI.arrMode():'strongest';return '<div class="piseg">'+(PI.ARR||[]).map(function(a){return '<button type="button" data-arr="'+a[0]+'" class="'+(a[0]===m?'on':'')+'" aria-pressed="'+(a[0]===m)+'">'+a[1]+'</button>'}).join('')+'</div>'}
function tuneSeen(){try{return sessionStorage.getItem("gj.tuneseen")==="1"||/[?&]tune(=|&|$)/.test(location.search)}catch(x){return false}}
function render(){var h='<div class="pih"><span>light and environment</span><button type="button" class="pix" aria-label="close">×</button></div><div class="pib">';
  C.forEach(function(c){if(c.length===1){h+='<div class="pis">'+c[0]+'</div>';if(c[0]==='project')h+=projRows();if(c[0]==='view')h+=viewRows();if(c[0]==='arrange')h+=arrRows();if(c[0]==='library')h+='<a class="pilink" href="archive/">Permanent Impermanence</a><p class="piline"><span class="gjl">It can be activated or left to rest.</span></p>'}else h+=row(c)});
  h+='</div><div class="pif"><button type="button" class="pibtn" data-a="reset">reset</button>'+(tuneSeen()?'<button type="button" class="pibtn" data-a="tune">full tune</button>':'')+'</div>';P.innerHTML=h;if(window.GJ12&&GJ12.piTag)GJ12.piTag()}
P.addEventListener('input',function(ev){var t=ev.target;if(t.tagName!=='INPUT')return;var v=+t.value,src=t.getAttribute('data-src'),k=t.getAttribute('data-k');var b=t.nextElementSibling;if(b)b.textContent=v.toFixed(2);
  if(src==='env'){E[k]=v;save();if(PI.level)PI.level()}else if(src==='tune')tset(k,v);else if(src==='proj'&&cur){E.proj=E.proj||{};var o=E.proj[cur]=E.proj[cur]||{a:0,w:.5};o[k]=v;save()}});
P.addEventListener('change',function(ev){if(ev.target.id==='pi-proj'){cur=ev.target.value;render()}});
P.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;
  if(t.classList.contains('pix')){open(false);return}
  if(t.classList.contains('pit')){var src=t.getAttribute('data-src'),k=t.getAttribute('data-k'),on=!t.classList.contains('on');t.classList.toggle('on',on);t.setAttribute('aria-pressed',String(on));
    if(src==='env'){E[k]=on?1:0;save();if(PI.level)PI.level();document.dispatchEvent(new CustomEvent('pi:env',{detail:{k:k}}))}else if(src==='look')tset(k,on?'b':'a');else tset(k,on?1:0);return}
  var a=t.getAttribute('data-a'),ar=t.getAttribute('data-arr');
  if(ar){if(PI.arrange)PI.arrange(ar);setTimeout(render,450);return}
  if(a==='space0'||a==='space1'){E.space=a==='space1'?1:0;save();document.dispatchEvent(new CustomEvent('pi:env',{detail:{k:'space'}}));render();return}
  if(a==='reset'){Object.keys(E).forEach(function(k){delete E[k]});save();['glow','bloom','stars','dimmer','drift','skylook','skybreath','skyfade','cdepth'].forEach(function(k){tset(k,null)});render()}
  if(a==='tune'){open(false);if(GJ12.deepTune)GJ12.deepTune()}});
function open(on){P.hidden=!on;btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',String(on));de.classList.toggle('pi-study',on);if(on)render()}
btn.addEventListener('click',function(ev){ev.stopPropagation();open(P.hidden)});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!P.hidden){open(false);ev.stopPropagation()}},true);
GJPI.open=open;
/* project aura, drawn by the shell behind the chosen piece */
PI.aura=function(g,s){var pr=E.proj;if(!pr)return;for(var k in pr){var o=pr[k];if(!o||!(o.a>0.01))continue;var im=document.querySelector('#room a.st[data-k="'+k+'"] img.orb');if(!im)continue;var r=im.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||!r.width)continue;
  var cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width*(1.3+o.a*1.4);g.globalAlpha=.42*o.a*(1-o.w);g.drawImage(s.fog,cx-R,cy-R,R*2,R*2);g.globalAlpha=.34*o.a*o.w;g.drawImage(s.bok,cx-R*.8,cy-R*.8,R*1.6,R*1.6)}};
})();
/* ---------- 4. entering: from the sky into a piece, the camera moves forward through the fog (no cut, no white) ---------- */
(function(){
var de=document.documentElement,PI=window.GJPI,cv=document.getElementById('gjshell');if(!PI||!cv)return;
var busy=0,MS=1050;PI.go=function(id){if(GJ12.openPiece)GJ12.openPiece(id);else if(GJ12.gotoPlate)GJ12.gotoPlate(id);else location.hash='#'+id};
function bg(){return de.classList.contains('red')?'6,3,4':'4,7,11'}
GJ12.enterPlate=function(id,a){
  if(busy)return true;
  if(PI.reduce||!(PI.e('enter')>0)||de.classList.contains('in')||!window.__revealT||performance.now()-window.__revealT<400)return false;
  var im=a&&(a.querySelector('img.orb')||a.querySelector('img'));var r=(im||a).getBoundingClientRect();if(!r.width)return false;
  busy=1;var done=0;
  PI.entering={t0:performance.now(),ms:MS,cx:r.left+r.width/2,cy:r.top+r.height/2,r:r,im:im&&im.complete&&im.naturalWidth?im:null,id:id};
  cv.style.zIndex='19';
  PI.enterFrame=function(g,s,k,W,H){var E=PI.entering;if(!E)return;
    var ve=k<.55?Math.pow(k/.55,1.6):1-Math.pow((k-.55)/.45,1.2);  /* veil rises, then lifts */
    if(E.im&&k<.6){var nat=Math.min(E.im.naturalWidth/Math.max(1,window.devicePixelRatio||1),Math.min(W,H)*.62),gr=Math.min(1,k/.55),sz=E.r.width+(Math.max(E.r.width,nat)-E.r.width)*gr*gr,cx=E.cx+(W/2-E.cx)*gr*.6,cy=E.cy+(H*.46-E.cy)*gr*.6;
      g.save();g.globalAlpha=1-Math.max(0,(k-.3)/.3);g.beginPath();g.arc(cx,cy,sz/2,0,6.283);g.clip();g.drawImage(E.im,cx-sz/2,cy-sz/2,sz,sz);g.restore()}
    g.globalAlpha=Math.max(0,Math.min(.96,ve*.96));g.fillStyle='rgb('+bg()+')';g.fillRect(0,0,W,H);
    /* mist passing the lens at the peak */
    g.globalAlpha=Math.max(0,.22*Math.sin(Math.PI*k));var R=Math.max(W,H)*(.6+k*1.2);g.drawImage(s.fog,W/2-R,H*.46-R*.55,R*2,R*1.1);
    if(!done&&k>=.55){done=1;try{PI.go(E.id)}catch(x){}}
    if(k>=1){PI.entering=null;PI.enterFrame=null;cv.style.zIndex='';busy=0}};
  setTimeout(function(){if(!done){done=1;try{PI.go(id)}catch(x){}}if(PI.entering){PI.entering=null;PI.enterFrame=null;cv.style.zIndex='';busy=0}},MS+600);
  return true};
/* leaving a piece: the camera pulls back as the sky returns */
var wasIn=de.classList.contains('in');
new MutationObserver(function(){var n=de.classList.contains('in');if(wasIn&&!n&&!PI.reduce)PI.leaving=performance.now();wasIn=n}).observe(de,{attributes:true,attributeFilter:['class']});
})();
/* ---------- 5. sound: Lost in Time as one continuous main track (toggle), an ambient bed underneath, tap to pause / resume ---------- */
(function(){
var de=document.documentElement,PI=window.GJPI;if(!PI)return;
var au=null,log=window.__piAudioLog=[];
function L(m){log.push([Math.round(performance.now()),m,au?+au.currentTime.toFixed(2):null]);if(log.length>400)log.shift()}
PI.cont=function(){return PI.e('cont')>0};
/* who is allowed to pause the song: a tap on its own controls (or its close), never scrolling, sections, clips or levels */
var CTRL='.plate.sound canvas.wn,.player .pp,.player .wave,.player canvas,#now .now-pp,#now .npp,#now .now-x,#now canvas,#now .now-wave,#now button,#litmoon';
var intent=0;
['pointerdown','click','keydown'].forEach(function(t){document.addEventListener(t,function(ev){var x=ev.target;if(x&&x.closest&&(x.closest(CTRL)||x.closest('#pistudy')))intent=performance.now()},true)});
/* a quick second tap on the same control is not a second toggle (no pause-then-resume flicker); double tap keeps its level-out meaning elsewhere */
var lastT=0,lastEl=null;
document.addEventListener('click',function(ev){var c=ev.target&&ev.target.closest&&ev.target.closest(CTRL);if(!c)return;var n=performance.now();if(c===lastEl&&n-lastT<320){ev.stopImmediatePropagation();ev.preventDefault();L('debounced second tap');return}lastEl=c;lastT=n},true);
document.addEventListener('dblclick',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest(CTRL)){ev.stopPropagation();ev.preventDefault()}},true);
function initSong(){au=document.getElementById('lit-audio')||document.querySelector('.player audio');
if(au){
  var nativePause=HTMLMediaElement.prototype.pause,duckN=0;
  au.pause=function(){
    var user=window.GJ12&&GJ12._litUserPause&&(performance.now()-GJ12._litUserPause<900);
    if(!PI.cont()||performance.now()-intent<900||user){L('pause (tap)');return nativePause.call(au)}
    L('pause blocked (continuous)');setTimeout(function(){var any=[].some.call(document.querySelectorAll('video'),function(x){return !x.paused&&!x.muted&&x.volume>0});if(any)duck(true)},0)};
  var vol0=1;function duck(on){if(on){if(!duckN){vol0=au.volume;au.volume=Math.max(.04,vol0*.3)}duckN=1;L('duck')}else if(duckN){duckN=0;au.volume=vol0;L('unduck')}}
  function anyLoud(){return [].some.call(document.querySelectorAll('video'),function(x){return !x.paused&&!x.muted&&x.volume>0})}
  ['play','volumechange'].forEach(function(t){document.addEventListener(t,function(ev){var v=ev.target;if(!v||v.tagName!=='VIDEO')return;if(anyLoud()&&!au.paused)duck(true);else if(!anyLoud())duck(false)},true)});
  /* unmuted video: duck under it instead of stopping the song; restore after */
  ['pause','ended'].forEach(function(t){document.addEventListener(t,function(ev){var v=ev.target;if(v&&v.tagName==='VIDEO'&&duckN){var any=[].some.call(document.querySelectorAll('video'),function(x){return !x.paused&&!x.muted&&x.volume>0});if(!any)duck(false)}},true)});
  ['play','pause','ended','seeking'].forEach(function(t){au.addEventListener(t,function(){L(t)})});
}
if(au){['play','pause','ended'].forEach(function(t){au.addEventListener(t,level)});au.addEventListener('play',function(){setTimeout(wake,60)})}L('song hooked')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSong);else initSong();
/* ambient bed: the site's own air (pink noise with a slow breath, as in atmosphere) plus a Safe Flight slot.
   Safe Flight: if media/audio/safe-flight.mp3 is present it loops under everything at -18 dB; it is not in this build yet. */
var AC=null,bed=null,started=0;
function ctx(){if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C()}if(AC.state==='suspended')AC.resume();return AC}
function build(){var c=ctx();if(!c||bed)return bed;
  var len=c.sampleRate*6,buf=c.createBuffer(2,len,c.sampleRate);
  for(var ch=0;ch<2;ch++){var d=buf.getChannelData(ch),b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(var j=0;j<len;j++){var w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[j]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}
    var fade=Math.round(c.sampleRate*.5);for(j=0;j<fade;j++){var k=j/fade;d[j]=d[j]*k+d[len-fade+j]*(1-k)}}
  var src=c.createBufferSource();src.buffer=buf;src.loop=true;src.loopEnd=buf.duration-.5;
  var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=.4;
  var br=c.createGain();br.gain.value=1;var lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.07;lg.gain.value=.28;lfo.connect(lg);lg.connect(br.gain);lfo.start();
  var master=c.createGain();master.gain.value=0;src.connect(lp);lp.connect(br);br.connect(master);master.connect(c.destination);src.start();
  bed={c:c,master:master,lp:lp,sf:null};
  /* Safe Flight underlay, only if the file exists */
  var SF=PI.safeFlight||null;/* set GJPI.safeFlight='media/audio/<file>' once the Safe Flight file is identified */
  Promise.resolve(SF).then(function(u){if(!u)return;var el=new Audio(u);el.loop=true;el.preload='auto';el.id='pi-safe-flight';el.setAttribute('data-keep','1');
    var sn=c.createMediaElementSource(el),sg=c.createGain();sg.gain.value=0;sn.connect(sg);sg.connect(c.destination);bed.sf={el:el,g:sg};el.pause=(function(np){return function(){if(performance.now()-intent<900)return np.call(el)}})(el.pause);var p=el.play();if(p&&p.catch)p.catch(function(){});level()}).catch(function(){});
  return bed}
function songOn(){return au&&!au.paused}
function level(){if(!bed)return;var c=bed.c,on=PI.e('sound')>0&&!!songOn(),v=+PI.e('vol');
  /* match Safelight: pausing the song also pauses the background bed */
  bed.master.gain.setTargetAtTime(on?v:0,c.currentTime,on?1.4:.12);
  if(bed.sf)bed.sf.g.gain.setTargetAtTime(on?.126:0,c.currentTime,on?1.4:.12)}
PI.level=level;
function start(){/* the second ambient noise bed is removed: only the atmosphere White Noise (A white, B pink, C brown) remains */}
['pointerdown','keydown','touchend'].forEach(function(t){document.addEventListener(t,start,{capture:true,passive:true})});
document.addEventListener('visibilitychange',function(){if(!bed)return;if(document.hidden)bed.c.suspend();else bed.c.resume()});
/* iOS can interrupt Web Audio when a media element starts; bring the bed back on the song's play and on the next touch, never restarting it */
function wake(){if(bed&&bed.c.state!=='running'&&!document.hidden){bed.c.resume();L('bed resumed from '+bed.c.state)}}
['pointerdown','touchend'].forEach(function(t){document.addEventListener(t,wake,{capture:true,passive:true})});
setInterval(wake,2000);
})();
/* ---------- 6. arrange: one choice applies to the orb sky, the environment and the archive; changes cross through the mist (no flash) ---------- */
(function(){
var de=document.documentElement,PI=window.GJPI;if(!PI)return;
var SKY={strongest:1,order:1,shuffle:1,grouped:1,light:1,colour:1,date:1,medium:1};
PI.ARR=[['strongest','selected'],['continuous','continuous'],['order','in order'],['grouped','by project'],['light','by light'],['colour','by colour'],['date','by date'],['medium','by medium'],['shuffle','shuffle']];
PI.arrMode=function(){var a=PI.E.arr;if(a==='continuous')return a;return (GJ12.orderMode&&GJ12.orderMode())||'strongest'};
function store(){try{localStorage.setItem('gj.pi.arrange',PI.arrMode());localStorage.setItem('gj.pi.arrange.ids',JSON.stringify(GJ12.orderIds?GJ12.orderIds():[]))}catch(x){}}
var busy=0;
PI.arrange=function(m){if(busy)return;var was=PI.arrMode();if(m===was)return;busy=1;
  var swap=function(){
    if(m==='continuous'){PI.E.arr='continuous';PI.E.arrPrevField=+GJ12.val('archfield')||0;PI.save();if(GJ12.setTune)GJ12.setTune('archfield',1);if(GJ12.setOrder)GJ12.setOrder('order')}
    else{if(PI.E.arr==='continuous'){delete PI.E.arr;if(GJ12.setTune)GJ12.setTune('archfield',PI.E.arrPrevField?1:null);delete PI.E.arrPrevField;PI.save()}if(SKY[m]&&GJ12.setOrder)GJ12.setOrder(m)}
    store();document.dispatchEvent(new CustomEvent('pi:arrange',{detail:{mode:m}}))};
  if(PI.reduce){swap();busy=0;return}
  de.classList.add('pi-arr');setTimeout(function(){swap();requestAnimationFrame(function(){de.classList.remove('pi-arr');setTimeout(function(){busy=0},420)})},380)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',store);else store();
})();
