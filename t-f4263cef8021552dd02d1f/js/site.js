/* Gill James, work examples. The sky, one work per screen, full-screen photographs, sound, 3D, red mode, and tuning behind ?tune. */
(function(){
var de=document.documentElement,LS={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* Bake later: paste the JSON from Tune → save as default into DEFAULTS. TUNE falls back to this. */
var DEFAULTS={glow:.5,stars:1,drift:1,stage:.56,spin:1,depth:1,panel:.74,mx:10,bounce:0,rail:1,bloom:1,spread:1,oblur:.12,osharp:.85,odepth:1,omin:44,strip:'a',moon:0,moonsize:46,moondial:0,feel:'b',finertia:.85,fdamp:.96,fsettle:.08,open:'a',skylook:'a',skydrift:.5,skyfade:.7,skybreath:.4,cdepth:.4,amb:1,skyplay:1,dialspd:1,findpull:1,redctl:'c',dimmer:1,type:1,mood:.4,tunelayout:'b',olease:.08,oease:.1,pinchout:.74,pinchfloor:.88,wallpinch:.82,chrome:2,arrows:1,tunehold:1.2,redhold:.55,pulledge:60,pulldist:70,filmauto:1,clipauto:0,redtone:2,redlight:1,owtdauto:0,pulse:.7,holdmenu:1,holdms:.45,deephold:1.2,redtimer:0,dimedge:1};
var TUNE={};
try{TUNE=JSON.parse(LS.get('gj.cks12.tune')||'{}')||{}}catch(e){TUNE={}}
try{if(LS.get('gj.cks12.moon-off-default')!=='1'){if(TUNE&&Object.prototype.hasOwnProperty.call(TUNE,'moon'))delete TUNE.moon;LS.set('gj.cks12.moon-off-default','1')}}catch(e){}
function val(k){return TUNE[k]==null?DEFAULTS[k]:TUNE[k]}
function dimK(){var d=+val('dimmer');return isNaN(d)?1:Math.max(0,Math.min(1,d))}
function live(k){var v=val(k),m=.22+.78*dimK();if(k==='glow'||k==='bloom'||k==='amb'||k==='stars'||k==='drift'||k==='skydrift')return (+v)*m;return v}
function chromeMs(){return Math.max(400,(+val('chrome')||2)*1000)}
window.GJ12={tune:{}};
GJ12.val=val;GJ12.live=live;

function apply(){de.style.setProperty('--glow',live('glow'));de.style.setProperty('--stage',val('stage'));
  ['a','b','c'].forEach(function(x){de.classList.toggle('strip-'+x,val('strip')===x)});
  de.classList.toggle('moon-off',!(+val('moon')));de.classList.toggle('moon-dial-off',!(+val('moondial')));de.style.setProperty('--moon',(+val('moonsize')||46)+'px');
  de.classList.toggle('skyplay',+val('skyplay')!==0);de.classList.toggle('arrows-off',!(+val('arrows')));de.classList.toggle('owtd-still',+val('owtdauto')===0);de.classList.toggle('pulse-off',!(+val('pulse')));de.classList.toggle('holdmenu-off',!(+val('holdmenu')));de.classList.toggle('dimedge-off',!(+val('dimedge')));de.setAttribute('data-redctl',String(val('redctl')||'c'));de.style.setProperty('--type',(+val('type')||1));de.style.setProperty('--dimmer',dimK());de.style.setProperty('--glow',live('glow'));if(GJ12.relit)GJ12.relit();if(GJ12.redPaint)GJ12.redPaint();
  GJ12.tune={spin:+val('spin'),depth:+val('depth'),panel:+val('panel'),bounce:+val('bounce'),rail:+val('rail'),bloom:+live('bloom'),spread:+val('spread'),oblur:+val('oblur'),osharp:+val('osharp'),odepth:+val('odepth'),omin:+val('omin'),glowv:+live('glow'),moon:+val('moon'),moonsize:+val('moonsize'),moondial:+val('moondial'),cdepth:+val('cdepth'),feel:val('feel'),finertia:+val('finertia'),fdamp:+val('fdamp'),fsettle:+val('fsettle'),skylook:val('skylook'),skydrift:+val('skydrift'),skyfade:+val('skyfade'),skybreath:+live('skybreath'),amb:+live('amb'),skyplay:+val('skyplay'),dialspd:+val('dialspd'),findpull:+val('findpull'),redctl:val('redctl'),dimmer:dimK(),type:+val('type'),mood:+val('mood'),olease:+val('olease'),oease:+val('oease'),pinchout:+val('pinchout'),pinchfloor:+val('pinchfloor'),wallpinch:+val('wallpinch'),chrome:+val('chrome'),arrows:+val('arrows'),tunehold:+val('tunehold'),redhold:+val('redhold'),pulledge:+val('pulledge'),pulldist:+val('pulldist'),filmauto:+val('filmauto'),clipauto:+val('clipauto'),redtone:+val('redtone'),redlight:+val('redlight'),owtdauto:+val('owtdauto'),pulse:+val('pulse'),holdmenu:+val('holdmenu'),holdms:+val('holdms'),deephold:+val('deephold'),redtimer:+val('redtimer'),dimedge:+val('dimedge')};if(GJ12.reroom)GJ12.reroom();if(GJ12.reedge)GJ12.reedge();de.style.setProperty('--mx',val('mx')+'px');try{dispatchEvent(new Event('resize'))}catch(e){}de.style.setProperty('--persp',Math.round(1100/Math.max(.3,val('depth')))+'px');if(window.GJ12.restar)GJ12.restar()}
apply();
if(LS.get('gj.cks12.red')==='1')de.classList.add('red');
function $(s,r){return (r||document).querySelector(s)}function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function stillGone(v){if(!v||!v.parentNode)return;var img=v.parentNode.querySelector('img.clipstill');if(!img)return;setTimeout(function(){if(v.classList.contains('clip-go'))img.hidden=true},480)}
function bareVideo(v){if(!v)return;v.controls=false;v.removeAttribute('controls');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');try{v.playsInline=true}catch(e){}v.setAttribute('disablepictureinpicture','');v.setAttribute('controlslist','nodownload nofullscreen noremoteplayback noplaybackrate novolume')}
function vidCurrent(v){if(!v)return false;var p=v.closest('.plate');if(!p)return false;var G=GAL[p.id];if(!G)return p.querySelector('.stage video')===v;var b=p.querySelector('.strip button.on');var k=b&&b.getAttribute('data-kind');if(v.classList.contains('clip'))return k==='clip';return k==='video'}
function isFilmVid(v){var p=v&&v.closest&&v.closest('.plate');return !!(p&&p.getAttribute('data-sec')==='Film'&&!v.classList.contains('clip'))}
function isAutoFilm(v){if(!isFilmVid(v))return false;var p=v.closest('.plate');if(p&&p.id==='owtd'&&+val('owtdauto')===0)return false;return true}
function syncVidPlay(v){if(!v||!v.parentNode)return;var st=v.parentNode,btn=st.querySelector('.vidplay'),cur=vidCurrent(v),playing=!v.paused&&!v.ended,film=isAutoFilm(v);if(btn){btn.hidden=film||!cur||playing;btn.textContent='';btn.setAttribute('aria-label',playing?'pause':'play');btn.classList.toggle('glyph',!film)}st.classList.toggle('vid-ready',!!cur&&!playing&&!film);st.classList.toggle('vid-on',!!cur&&playing)}
function bindVidPlay(v){if(!v||v._playBound)return;v._playBound=1;bareVideo(v);var st=v.parentNode;if(!st)return;var btn=st.querySelector(':scope > .vidplay');if(!btn){btn=document.createElement('button');btn.type='button';btn.className='vidplay';btn.setAttribute('aria-label','play');btn.textContent='play';btn.hidden=true;st.appendChild(btn)}
  function cue(){if(!st)return;st.classList.add('vid-cue');clearTimeout(st._cueT);st._cueT=setTimeout(function(){st.classList.remove('vid-cue')},280)}
  function toggle(e){if(e){e.preventDefault();e.stopPropagation()}if(!vidCurrent(v))return;cue();if(v.paused){if(v.preload==='none')v.preload='metadata';v.hidden=false;var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}else{try{v.pause()}catch(err){}}syncVidPlay(v)}
  btn.addEventListener('click',toggle);
  v.addEventListener('click',function(e){toggle(e)});
  v.addEventListener('play',function(){v.hidden=false;v.classList.add('clip-go');v.classList.remove('clip-wait');stillGone(v);syncVidPlay(v)});
  v.addEventListener('pause',function(){syncVidPlay(v)});
  v.addEventListener('ended',function(){syncVidPlay(v)});
  if(!st._vidTap){st._vidTap=1;st.addEventListener('click',function(e){if(e.target.closest('.nav,.dial,.ticks,.grail,.wallbtn'))return;var hit=$$('video',st).filter(vidCurrent)[0];if(!hit)return;if(e.target.closest('.vidplay')||e.target===hit||(e.target.classList&&e.target.classList.contains('clipstill'))||st.classList.contains('vid-ready')||st.classList.contains('vid-on')){if(hit._playBound){/* toggle via click on still or empty stage */
      if(e.target.closest('.vidplay')||e.target===hit)return;
      if(hit.paused){if(hit.preload==='none')hit.preload='metadata';hit.hidden=false;var pr=hit.play();if(pr&&pr.catch)pr.catch(function(){})}else{try{hit.pause()}catch(err){}}syncVidPlay(hit)}}})}
  syncVidPlay(v);
}
function ready(f){if(document.readyState!=='loading')f();else document.addEventListener('DOMContentLoaded',f)}
ready(function(){
  var b=document.createElement('button');b.id='red';b.type='button';b.setAttribute('aria-label','red mode');b.innerHTML='<b lang="cr">ᑕᐣᓯ</b>';
  var redT=null;
  function armRedTimer(){clearTimeout(redT);redT=null;var m=+val('redtimer')||0;if(m>0&&de.classList.contains('red'))redT=setTimeout(function(){setRed(false)},Math.round(m*60*1000))}
  function setRed(on){de.classList.toggle('red',!!on);LS.set('gj.cks12.red',on?'1':'0');if(GJ12.redPaint)GJ12.redPaint();armRedTimer()}
  GJ12.setRed=setRed;
  /* tap on #red is handled by holdBind when menus are on, and by the fallback click below when they are off */
  document.body.appendChild(b);
  var disc=document.createElement('button');disc.id='disc';disc.type='button';disc.setAttribute('aria-label','red mode, tap to switch, hold for its dial');disc.innerHTML='<span class="vis"><i></i></span>';
  document.body.appendChild(disc);
  var pad=document.createElement('div');pad.id='redpad';pad.setAttribute('aria-hidden','true');
  pad.innerHTML='<svg viewBox="0 0 160 160" aria-hidden="true"><circle class="rp-ring" cx="80" cy="80" r="70"/><line class="rp-ax" x1="80" y1="14" x2="80" y2="146"/><line class="rp-ax" x1="14" y1="80" x2="146" y2="80"/><circle class="rp-stop" cx="80" cy="26" r="1.6"/><circle class="rp-stop" cx="80" cy="62" r="1.6"/><circle class="rp-stop" cx="80" cy="98" r="1.6"/><circle class="rp-stop" cx="80" cy="134" r="1.6"/><circle class="rp-dot" cx="80" cy="80" r="5"/></svg><b class="rp-tone"></b><span class="rp-l">lightness</span><i class="rp-v"></i>';
  document.body.appendChild(pad);
  var veil=document.createElement('div');veil.id='redveil';document.body.appendChild(veil);
  var TONES=[{id:'dim',name:'dim',ink:'#FF4457',lamp:.35},{id:'rose',name:'rose',ink:'#FFB0B8',lamp:.55},{id:'crimson',name:'crimson',ink:'#FF4457',lamp:.80},{id:'bright',name:'bright',ink:'#FF4457',lamp:1}];
  var ORDER=[3,2,1,0],rpDrag=null,rpHide=0;
  function hexRGB(h){h=String(h||'').replace('#','');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]}
  function redPaint(){
    var tone=TONES[+val('redtone')]||TONES[2],l=+val('redlight');if(isNaN(l))l=1;l=Math.max(.2,Math.min(1,l));
    var a=hexRGB(tone.ink),bg=[6,3,4],k=(.35+.65*tone.lamp)*l;
    var ink='rgb('+a.map(function(v,i){return Math.round(bg[i]+(v-bg[i])*Math.min(1,k/.85))}).join(',')+')';
    de.style.setProperty('--red-ink',ink);de.style.setProperty('--red-light',l.toFixed(3));de.style.setProperty('--lamp',tone.lamp);
    var dot=pad.querySelector('.rp-dot'),tn=pad.querySelector('.rp-tone'),vv=pad.querySelector('.rp-v');
    var r=Math.max(0,ORDER.indexOf(+val('redtone')||2));
    if(dot){dot.setAttribute('cy',26+r*36);dot.setAttribute('cx',(14+(l-.2)/.8*132).toFixed(1))}
    if(tn)tn.textContent=tone.name;if(vv)vv.textContent=Math.round(l*100)+'%';
  }
  GJ12.redPaint=redPaint;redPaint();
  function rpShow(){clearTimeout(rpHide);redPaint();pad.classList.add('on')}
  function rpLater(){clearTimeout(rpHide);rpHide=setTimeout(function(){pad.classList.remove('on')},1800)}
  var rpApi={start:function(x,y){rpDrag={x:x,y:y,r0:Math.max(0,ORDER.indexOf(+val('redtone')||2)),l0:(+val('redlight')||1)};if(!de.classList.contains('red'))setRed(true);rpShow()},
    move:function(x,y){if(!rpDrag)return;var r=Math.max(0,Math.min(3,Math.round(rpDrag.r0+(y-rpDrag.y)/36)));var l=Math.max(.2,Math.min(1,rpDrag.l0+(x-rpDrag.x)/160*.8));
      TUNE.redtone=ORDER[r];TUNE.redlight=Math.round(l*100)/100;LS.set('gj.cks12.tune',JSON.stringify(TUNE));redPaint()},
    end:function(){if(!rpDrag)return;rpDrag=null;rpLater()},
    open:function(){return pad.classList.contains('on')},
    hide:function(){clearTimeout(rpHide);pad.classList.remove('on')}};
  pad.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();try{pad.setPointerCapture(e.pointerId)}catch(x){}rpApi.start(e.clientX,e.clientY)});
  pad.addEventListener('pointermove',function(e){if(rpDrag)rpApi.move(e.clientX,e.clientY)});
  pad.addEventListener('pointerup',rpApi.end);pad.addEventListener('pointercancel',rpApi.end);
  (function(){
    var hold=null,ignoreUntil=0,lastTap=0;
    disc.addEventListener('pointerdown',function(e){e.preventDefault();ignoreUntil=0;try{disc.setPointerCapture(e.pointerId)}catch(x){}
      hold={x:e.clientX,y:e.clientY,fired:false};
      hold.t=setTimeout(function(){hold.fired=true;ignoreUntil=Date.now()+1500;rpApi.start(hold.x,hold.y)},Math.round(((+val('holdmenu')!==0?(+val('deephold')||1.2):(+val('redhold')||.55))*1000)))});
    disc.addEventListener('pointermove',function(e){
      if(hold&&hold.fired){rpApi.move(e.clientX,e.clientY);return}
      if(hold&&!hold.swipe&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>10){clearTimeout(hold.t);hold.swipe=true}});
    disc.addEventListener('pointerup',function(e){
      var h=hold;if(h)clearTimeout(h.t);hold=null;
      if(h&&h.fired){rpApi.end();return}
      if(h&&h.swipe){var dy=e.clientY-h.y;if(Math.abs(dy)<28)return;var l=+val('redlight')||1;TUNE.redlight=Math.max(.2,Math.min(1,Math.round((l+(dy>0?-.2:.2))*100)/100));if(!de.classList.contains('red'))setRed(true);LS.set('gj.cks12.tune',JSON.stringify(TUNE));redPaint();return}
      if(h&&Date.now()-lastTap<320){lastTap=0;TUNE.redtone=2;TUNE.redlight=1;setRed(true);LS.set('gj.cks12.tune',JSON.stringify(TUNE));redPaint();return}
      if(h)lastTap=Date.now();
      if(!h||Date.now()<ignoreUntil)return;
      if(rpApi.open()){rpApi.hide();return}
      setRed(!de.classList.contains('red'));
    });
    disc.addEventListener('pointercancel',function(){if(hold){clearTimeout(hold.t);if(hold.fired)rpApi.end()}hold=null});
  })();


  GJ12.redPad=rpApi;

  /* left-edge dimmer, oz style: drag up the left edge to brighten, down to dim. Off with the Tune toggle. */
  (function(){
    var edge=document.createElement('div');edge.id='dimedge';edge.setAttribute('aria-hidden','true');document.body.appendChild(edge);
    var down=null;
    function at(y){var h=Math.max(1,innerHeight||1),f=Math.max(0,Math.min(1,1-(y/(h))));TUNE.dimmer=Math.round(f*100)/100;LS.set('gj.cks12.tune',JSON.stringify(TUNE));apply()}
    edge.addEventListener('pointerdown',function(e){if(!(+val('dimedge')))return;e.preventDefault();down=1;try{edge.setPointerCapture(e.pointerId)}catch(x){}at(e.clientY)});
    edge.addEventListener('pointermove',function(e){if(down)at(e.clientY)});
    function up(){down=0};edge.addEventListener('pointerup',up);edge.addEventListener('pointercancel',up);
  })();

  /* tiny corner Mark: drag to set text size */
  (function(){
    var top=$('#top'),btn=$('#typebtn');
    if(!btn){btn=document.createElement('button');btn.id='typebtn';btn.type='button';btn.setAttribute('aria-label','text size');btn.innerHTML='<b lang="cr">ᑕᐣᓯ</b>';if(top)top.appendChild(btn);else document.body.appendChild(btn)}
    var down=null;
    btn.addEventListener('pointerdown',function(e){if(e.target&&e.target.closest&&e.target.closest('#holdfan'))return;down={x:e.clientX,t:+val('type')||1};try{btn.setPointerCapture(e.pointerId)}catch(x){}});
    btn.addEventListener('pointermove',function(e){if(!down)return;if(Math.abs(e.clientX-down.x)<4)return;TUNE.type=Math.max(.85,Math.min(1.3,Math.round((down.t+(e.clientX-down.x)/140)*100)/100));down.moved=1;LS.set('gj.cks12.tune',JSON.stringify(TUNE));apply()});
    btn.addEventListener('pointerup',function(){down=null});btn.addEventListener('pointercancel',function(){down=null});
    GJ12.typeBtn=btn;
  })();

  /* tap = primary, hold ~450ms = radial menu, drag out and release to pick, hold ~1.2s = deeper dial. iOS callouts off. */
  function holdBind(el,opt){
    if(!el||el._holdBound)return;el._holdBound=1;
    var st=null,fan=null,glowT=0;
    function on(){return +val('holdmenu')!==0}
    function ms(){return Math.round((+val('holdms')||.45)*1000)}
    function deepMs(){return Math.round((+val('deephold')||1.2)*1000)}
    function killFan(){if(fan){fan.remove();fan=null}}
    function items(){return (opt.items&&opt.items())||[]}
    function showFan(){
      killFan();
      var its=items();if(!its.length)return;
      fan=document.createElement('div');fan.id='holdfan';fan.setAttribute('aria-hidden','true');
      var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      fan.style.left=cx+'px';fan.style.top=cy+'px';
      var W=innerWidth||390,H=innerHeight||844,n=its.length,edge=72;
      var nearR=cx>W-edge,nearL=cx<edge,nearT=cy<edge,nearB=cy>H-edge,useStack=nearR||nearL||nearT||nearB;
      var dirX=(W*.5>=cx)?1:-1,dirY=(H*.5>=cy)?1:-1,vert=Math.min(cx,W-cx)<Math.min(cy,H-cy);
      its.forEach(function(it,i){
        var b=document.createElement('button');b.type='button';b.textContent=it.lab;
        var bx,by;
        if(useStack){
          if(vert){bx=cx+dirX*88;by=cy+dirY*(50+i*44)}
          else{by=cy+dirY*64;bx=cx+dirX*(56+i*70)}
        }else{
          var ang=-Math.PI/2+(i-(n-1)/2)*(Math.PI/4.6);
          bx=cx+Math.cos(ang)*82;by=cy+Math.sin(ang)*82;
        }
        bx=Math.max(40,Math.min(W-40,bx));by=Math.max(28,Math.min(H-28,by));
        b.style.transform='translate('+Math.round(bx-cx)+'px,'+Math.round(by-cy)+'px)';
        fan.appendChild(b);it.el=b;
      });
      document.body.appendChild(fan);
    }
    function pickAt(x,y){
      if(!fan)return null;
      var hit=null,best=40;
      $$('#holdfan button').forEach(function(b){
        var r=b.getBoundingClientRect(),d=Math.hypot(x-(r.left+r.width/2),y-(r.top+r.height/2));
        b.classList.toggle('hot',d<40);
        if(d<best){best=d;hit=b}
      });
      return hit;
    }
    el.addEventListener('click',function(e){
      if(on()){e.preventDefault();e.stopPropagation();return}
      if(opt.tap)opt.tap();
    });
    el.addEventListener('pointerdown',function(e){
      if(!on()||(e.button&&e.button!==0))return;
      e.preventDefault();e.stopPropagation();
      try{el.setPointerCapture(e.pointerId)}catch(x){}
      st={x:e.clientX,y:e.clientY,fan:0,deep:0};
      el.classList.add('holding');
      el.style.setProperty('--hold','0');
      var t0=Date.now();
      glowT=setInterval(function(){if(!st)return;el.style.setProperty('--hold',String(Math.min(1,(Date.now()-t0)/ms())))},16);
      st.t1=setTimeout(function(){if(!st)return;st.fan=1;showFan()},ms());
      st.t2=setTimeout(function(){if(!st||!opt.deep)return;st.deep=1;clearInterval(glowT);killFan();el.classList.remove('holding');el.style.removeProperty('--hold');opt.deep()},deepMs());
    });
    el.addEventListener('pointermove',function(e){if(st)pickAt(e.clientX,e.clientY)});
    function up(e){
      if(!st)return;
      clearTimeout(st.t1);clearTimeout(st.t2);clearInterval(glowT);
      el.classList.remove('holding');el.style.removeProperty('--hold');
      var s=st;st=null;
      if(s.deep){killFan();return}
      var hit=s.fan&&pickAt(e.clientX,e.clientY);
      var its=items();
      killFan();
      if(hit){its.forEach(function(it){if(it.el===hit&&it.fn)it.fn()});return}
      if(!s.fan&&opt.tap)opt.tap();
    }
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    el.addEventListener('contextmenu',function(e){e.preventDefault()});
  }
  GJ12.holdBind=holdBind;

  holdBind(b,{
    tap:function(){setRed(!de.classList.contains('red'))},
    items:function(){return [
      {lab:de.classList.contains('red')?'red off':'red on',fn:function(){setRed(!de.classList.contains('red'))}},
      {lab:'type',fn:function(){var t=$('#typebtn');if(t)t.focus()}},
      {lab:'pad',fn:function(){if(rpApi)rpApi.start(innerWidth*.5,innerHeight*.7)}}
    ]},
    deep:function(){if(rpApi)rpApi.start(innerWidth*.85,innerHeight*.85)}
  });
  /* Mark already had a click toggle; holdBind tap replaces it */
  b.onclick=null;


  var typeb=$('#typebtn');
  if(typeb)holdBind(typeb,{
    tap:function(){},
    items:function(){return [
      {lab:'smaller',fn:function(){TUNE.type=Math.max(.85,Math.round(((+val('type')||1)-.08)*100)/100);LS.set('gj.cks12.tune',JSON.stringify(TUNE));apply()}},
      {lab:'as drawn',fn:function(){TUNE.type=DEFAULTS.type;LS.set('gj.cks12.tune',JSON.stringify(TUNE));apply()}},
      {lab:'larger',fn:function(){TUNE.type=Math.min(1.3,Math.round(((+val('type')||1)+.08)*100)/100);LS.set('gj.cks12.tune',JSON.stringify(TUNE));apply()}}
    ]}
  });

  var allb=$('#allbtn');
  if(allb)holdBind(allb,{
    tap:function(){if(GJ12.allOpen)GJ12.allOpen();else if(allb.click){allb._holdBound=0;allb.click();allb._holdBound=1}},
    items:function(){return [
      {lab:'every piece',fn:function(){if(GJ12.allOpen)GJ12.allOpen()}},
      {lab:'sky',fn:function(){if(GJ12.goSky)GJ12.goSky();else location.hash='#sky'}}
    ]}
  });

  document.addEventListener('contextmenu',function(e){var t=e.target;if(t&&t.closest&&t.closest('#red,#disc,#typebtn,#allbtn,#esc,#airbtn,button.vidplay,.st'))e.preventDefault()},true);

  /* rail / dial pulse: soft starlight breath. Faster brighter when the dial is moving. Oz ignores reduced motion. */
  (function(){
    var v=0;
    function kick(x){v=Math.max(v,Math.min(1,Math.abs(+x)||0))}
    function tick(){
      v*=0.96;
      var amt=+val('pulse')||0;
      de.classList.toggle('pulse-off',amt<=0);
      var a=amt<=0?0:(.3+amt*(.25+v*.75));
      var t=Math.max(.85,(3.05-v*1.65)/Math.max(.35,amt||1));
      de.style.setProperty('--pulse-a',a.toFixed(3));
      de.style.setProperty('--pulse-t',t.toFixed(2)+'s');
      requestAnimationFrame(tick);
    }
    GJ12.pulseKick=kick;
    tick();
  })();


  stars();wall();allview();fullview();room();plates();lightbox();player();moon();escbar();autoplayClips();if(typeof goSky==='function')GJ12.goSky=goSky;if(typeof ALLV!=='undefined'&&ALLV.open)GJ12.allOpen=function(){ALLV.open()};$$('#weird-kid video,video[data-silent]').forEach(lockSilent);
  /* wheel is free in #lb and #full so the picture can scroll and pan */

  /* Deep Tune stays hidden. Both fingers must stay still for 1.2s. Pinch or two-finger scroll never opens it. It does not open from the URL and does not stay open after a reload. */
  var TP={},tt=0,t0d=0;
  function tcl(){clearTimeout(tt);tt=0}
  function tkeys(){return Object.keys(TP)}
  function tdist(){var k=tkeys();if(k.length<2)return 0;var a=TP[k[0]],b=TP[k[1]];return Math.hypot(a.x-b.x,a.y-b.y)}
  document.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse')return;
    TP[e.pointerId]={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY};
    if(tkeys().length===2&&!tt){t0d=tdist();tt=setTimeout(function(){tt=0;if(tkeys().length===2&&!$('#tune'))tune()},Math.round((+val('tunehold')||1.2)*1000))}
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
  GJ12.deepTune=function(){if(!$('#tune'))tune()};if(/[?&]tune(=|&|$)/.test(location.search))setTimeout(function(){if(!$('#tune'))tune()},0);document.addEventListener('keydown',function(e){if((e.key!=='t'&&e.key!=='T')||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;var a=document.activeElement,t=a&&a.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT'||(a&&a.isContentEditable))return;if(!$('#tune'))tune()});
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
  var P={},d0=0,sc=1,cx=0,cy=0,on=0,mx0=0,my0=0,spread=0,pan=0,pinch=0,lastDone=0,src='';
  function info(){return {pinch:!!pinch,spread:spread,pan:pan,src:src,n:Object.keys(P).length}}
  function arm(sx,sy){d0=sx;sc=1;on=1;mx0=sy[0];my0=sy[1];spread=0;pan=0;pinch=0}
  function note(d,x,y){spread=Math.max(spread,Math.abs(d-(d0||d)));pan=Math.max(pan,Math.hypot(x-mx0,y-my0));pinch=spread>12&&spread>pan*.55}
  function end(scale,x,y){if(!on)return;on=0;var now=Date.now();if(now-lastDone<120)return;lastDone=now;cb(scale,true,x,y,info())}
  el.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')return;P[e.pointerId]=[e.clientX,e.clientY];var k=Object.keys(P);if(k.length===2){src='ptr';arm(Math.hypot(P[k[0]][0]-P[k[1]][0],P[k[0]][1]-P[k[1]][1]),[(P[k[0]][0]+P[k[1]][0])/2,(P[k[0]][1]+P[k[1]][1])/2])}});
  el.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;P[e.pointerId]=[e.clientX,e.clientY];var k=Object.keys(P);if(k.length<2||!on||src!=='ptr')return;
    var d=Math.hypot(P[k[0]][0]-P[k[1]][0],P[k[0]][1]-P[k[1]][1]);sc=d/(d0||1);cx=(P[k[0]][0]+P[k[1]][0])/2;cy=(P[k[0]][1]+P[k[1]][1])/2;note(d,cx,cy);if(pinch)cb(sc,false,cx,cy,info())});
  function up(e){if(!P[e.pointerId])return;delete P[e.pointerId];if(on&&src==='ptr'&&Object.keys(P).length<2)end(sc,cx,cy)}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('gesturestart',function(e){e.preventDefault();if(on&&src==='ptr')return;src='ges';arm(1,[e.clientX,e.clientY]);sc=1});
  el.addEventListener('gesturechange',function(e){e.preventDefault();if(src==='ptr')return;sc=e.scale||1;cx=e.clientX;cy=e.clientY;note(sc,cx,cy);if(Math.abs(sc-1)>.08){pinch=pinch||Math.abs(sc-1)>.12;if(pinch)cb(sc,false,cx,cy,info())}});
  el.addEventListener('gestureend',function(e){e.preventDefault();if(src==='ptr')return;end(e.scale||sc,e.clientX,e.clientY)});
  var wt=0,ws=1;el.addEventListener('wheel',function(e){if(!e.ctrlKey)return;e.preventDefault();ws*=Math.exp(-e.deltaY*.01);var inf={pinch:true,src:'wheel',spread:Math.abs(ws-1),pan:0};cb(ws,false,e.clientX,e.clientY,inf);clearTimeout(wt);wt=setTimeout(function(){var v=ws;ws=1;var now=Date.now();if(now-lastDone<120)return;lastDone=now;cb(v,true,e.clientX,e.clientY,inf)},220)},{passive:false});
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
      var orb=document.querySelector('#room a.st[data-k="'+id+'"] img.orb, #room a.st[data-k="'+id+'"] img');
      var orbSrc=orb&&orb.getAttribute('src');
      if(!its.length)its=orbSrc?[{th:orbSrc,big:''}]:[];
      h+='<section class="ab" data-k="'+id+'" style="--c:'+c+'"><h3><button type="button" data-open="'+id+'">'+t.replace(/</g,'&lt;')+'<small>'+(its.length>1?its.length:'')+'</small></button></h3><div class="ag" style="--n:'+Math.max(1,Math.min(4,Math.ceil(Math.sqrt(its.length||1))))+'">'+
        (its.length?its.map(function(it,i){var th=(i===0&&orbSrc)?orbSrc:(it.th);return '<button type="button" data-k="'+id+'" data-big="'+(it.big||'')+'"'+(i?'':' data-l="'+t.replace(/"/g,'&quot;')+'"')+' data-f="'+(++FR<10?'0':'')+FR+'"><img src="'+th+'" alt="" loading="lazy" draggable="false"></button>'}).join(''):'<button type="button" class="txt" data-k="'+id+'" data-big="">open</button>')+'</div></section>'});
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
  function goPlate(id,big){leave(function(){if(!id)return;if(window.GJ12&&GJ12.gotoPlate)GJ12.gotoPlate(id);else{var p=document.getElementById(id);if(!p)return;de.style.scrollBehavior='auto';p.scrollIntoView();de.style.scrollBehavior=''}if(big&&GAL[id]&&GAL[id].showBig)setTimeout(function(){GAL[id].showBig(big)},80)})}
  function openBoard(id){leave(function(){if(WALL.open(id,0))return;if(window.GJ12&&GJ12.gotoPlate)GJ12.gotoPlate(id);else{var p=document.getElementById(id);if(!p)return;de.style.scrollBehavior='auto';p.scrollIntoView();de.style.scrollBehavior=''}})}
  ALLV.open=function(id){build();var already=v.classList.contains('on');v.classList.add('on');document.body.style.overflow='hidden';de.style.scrollSnapType='none';
    if(!already){setZ(innerWidth>900?.5:.46);sc.scrollTop=0;sc.scrollLeft=0}
    if(id){var b=bd.querySelector('.ab[data-k="'+id+'"]');if(b){var r=b.getBoundingClientRect(),q=sc.getBoundingClientRect();sc.scrollTop+=r.top-q.top-12;b.classList.remove('here');void b.offsetWidth;b.classList.add('here')}}
    if(!already)try{history.pushState({all:1},'')}catch(e){}if(GJ12.now)GJ12.now()};
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
  pinchOn(v,function(s2,done,x,y,inf){
    if(!(inf&&inf.pinch)){if(done)ALLV._p=0;return}
    if(!ALLV._p){ALLV._p=1;z0=z}
    var want=z0*s2;setZ(want,x,y);
    if(done){setTimeout(function(){ALLV._p=0},250);
      if(want>ZMAX*1.12){var id=boardAt(x,y);if(id)openBoard(id);return}
      if(s2<(+val('pinchout')||.74))close()}});
  document.addEventListener('keydown',function(e){if(v.classList.contains('on')&&e.key==='Escape')close()});
  /* edge pull from the very top, only when already at the top, closes to the sky */
  (function(){
    var py=null;
    sc.addEventListener('touchstart',function(e){py=null;if(!v.classList.contains('on')||e.touches.length!==1)return;if(sc.scrollTop>1)return;var t=e.touches[0],edge=24+(parseFloat(getComputedStyle(de).getPropertyValue('--st'))||0);if(t.clientY>edge+56)return;py={y:t.clientY,x:t.clientX}},{passive:true});
    sc.addEventListener('touchmove',function(e){if(!py)return;var t=e.touches[0],dy=t.clientY-py.y,dx=t.clientX-py.x;if(dy<10)return;if(Math.abs(dx)>dy*.7){py=null;return}},{passive:true});
    sc.addEventListener('touchend',function(e){if(!py)return;var t=(e.changedTouches&&e.changedTouches[0])||{},dy=(t.clientY||0)-py.y,dx=(t.clientX||0)-py.x;py=null;if(sc.scrollTop>1)return;if(dy>70&&Math.abs(dx)<=dy*.7)close()},{passive:true});
    sc.addEventListener('touchcancel',function(){py=null},{passive:true});
  })();
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
    if(e.ctrlKey){e.preventDefault();e.stopPropagation();FULL._wheel=1;clearTimeout(fullFit.t);fullFit.t=setTimeout(function(){FULL._wheel=0},240);fz=Math.max(1,Math.min(4,fz*Math.exp(-e.deltaY*.01)));if(fz===1){fpx=0;fpy=0};im.style.transition='none';im.style.transform='translate('+fpx+'px,'+fpy+'px) scale('+fz+')'}
    else if(fz>1){e.preventDefault();e.stopPropagation();FULL._wheel=1;clearTimeout(fullFit.t);fullFit.t=setTimeout(function(){FULL._wheel=0},240);fpx-=e.deltaX;fpy-=e.deltaY;im.style.transition='none';im.style.transform='translate('+fpx+'px,'+fpy+'px) scale('+fz+')'}
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
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=el.clientWidth;H=el.clientHeight;cv.width=W*dpr;cv.height=H*dpr;build();if(!initedHome){var hx=(location.hash||'').replace(/^#/,'');if(!hx||hx==='sky')homePan();else clampPan();initedHome=1}else if(!userPan){var hx=(location.hash||'').replace(/^#/,'');if(!hx||hx==='sky')homePan();else clampPan()}else clampPan();go()}
  function lim(){return N.length?[N[0].x,N[n-1].x]:[0,0]}
  function clampPan(){var l=lim();tp=Math.max(l[0],Math.min(l[1],tp))}
  var SPR={};function sprite(h){if(SPR[h])return SPR[h];var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'rgba('+h+',.62)');gr.addColorStop(.3,'rgba('+h+',.22)');gr.addColorStop(1,'rgba('+h+',0)');q.fillStyle=gr;q.fillRect(0,0,128,128);SPR[h]=c;return c}
  function TT(k,d){var t=window.GJ12.tune||{};return t[k]==null?d:t[k]}
  var COL={}, ambC=[214,226,236];
  function parseC(str){var p=String(str||'214,226,236').split(',');return [+p[0]||214,+p[1]||226,+p[2]||236]}
  function sampleThumb(img, fb){try{if(!img||!img.naturalWidth)return fb;var c=document.createElement('canvas');c.width=c.height=12;var x=c.getContext('2d');x.drawImage(img,0,0,12,12);var d=x.getImageData(0,0,12,12).data,r=0,g2=0,b=0,n=0;for(var i=0;i<d.length;i+=4){if(d[i+3]<40)continue;r+=d[i];g2+=d[i+1];b+=d[i+2];n++}if(n)return [Math.round(r/n),Math.round(g2/n),Math.round(b/n)]}catch(e){}return fb}
  function colorOf(o){var id=o.a.getAttribute('data-k'),p=id&&document.getElementById(id),fb=parseC(p&&p.getAttribute('data-c'));if(COL[id])return COL[id];var im=$('img',o.a);if(im&&im.complete&&im.naturalWidth){COL[id]=sampleThumb(im,fb);return COL[id]}return fb}
  function ambLight(){if(!(+val('amb'))||de.classList.contains('red')||de.classList.contains('in'))return;var best=null,bd=1e9,sec=null,sd=1e9;
    for(var i=0;i<n;i++){if(N[i]._px==null)continue;var d=Math.abs(N[i]._px-W/2);if(d<bd){sd=bd;sec=best;bd=d;best=N[i]}else if(d<sd){sd=d;sec=N[i]}}
    if(!best)return;var c1=colorOf(best),c2=sec?colorOf(sec):c1,mix=sec?Math.max(0,Math.min(1,1-bd/Math.max(1,bd+sd))):1;
    var tR=c1[0]*mix+c2[0]*(1-mix),tG=c1[1]*mix+c2[1]*(1-mix),tB=c1[2]*mix+c2[2]*(1-mix);
    ambC[0]+=(tR-ambC[0])*.07;ambC[1]+=(tG-ambC[1])*.07;ambC[2]+=(tB-ambC[2])*.07;
    de.style.setProperty('--tint',[ambC[0]|0,ambC[1]|0,ambC[2]|0].join(','))}

  function proj(x,y,z,yaw,i){z=z*TT('odepth',1);yaw=yaw*Math.min(1.6,.4+.6*TT('odepth',1));var cd=+val('cdepth')||0;if(cd){yaw+=lean*.14*cd;z=z*(1+.18*cd)}var sk=String(val('skylook')||'a');if(sk==='b'&&i!=null){var br=+val('skybreath')||.4,dr=+val('skydrift')||.5,tAcc=(performance.now())*.001;x+=Math.sin(tAcc*br*.7+i*1.7)*dr*2.2;y+=Math.cos(tAcc*br*.5+i*2.1)*dr*1.6}var X=x-pan,c=Math.cos(yaw),s=Math.sin(yaw),xr=X*c-z*s,zr=X*s+z*c,f=780,k=f/(f+zr)*zoom,fy=foc>=0?N[foc].y*(1-1/zoom):0;if(cd)k*=1+cd*.08*((z>0?1:-1)*Math.min(1,Math.abs(z)/160));return [W/2+xr*k,H*.44+(y-fy)*k,k]}
  function draw(t){
    var red=de.classList.contains('red'),l=lim(),yaw=((pan/(Math.max(1,l[1]-l[0])/2))*.32)+Math.sin((t-t0)*.00022)*.02,P=[],i;
    for(i=0;i<n;i++)P.push(proj(N[i].x,N[i].y,N[i].z,yaw,i));
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
    var line=red?'rgba(255,68,87,.32)':'rgba(230,236,248,.28)',core=red?'#ff5a6b':'#e8eef8',halo=red?'255,68,87':'214,226,236';
    g.lineWidth=1;g.strokeStyle=line;g.beginPath();for(i=0;i<n;i++){if(i)g.lineTo(P[i][0],P[i][1]);else g.moveTo(P[i][0],P[i][1])}g.stroke();
    var gw=((window.GJ12.tune||{}).glowv==null?.5:GJ12.tune.glowv)/.5,SP=sprite(halo);
    function orb(x,y,r,a){var R=r*6.5;g.globalAlpha=Math.min(1,a*gw);g.drawImage(SP,x-R,y-R,R*2,R*2);g.globalAlpha=Math.min(1,a+.15);g.fillStyle=core;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.globalAlpha=1}
    var BASE=Math.max(96,Math.min(170,W*.34));
    for(i=0;i<n;i++){var o=N[i],p=P[i],near=Math.max(0,1-Math.abs(p[0]-W/2)/(W*.75)),a=.55+.45*near;var cd=+val('cdepth')||0;if(cd)a=Math.min(1,a*(.82+ .3*cd*(p[2]||1)));if(String(val('skylook')||'a')==='b'){var fd=+val('skyfade')||.7,br=+val('skybreath')||.4,tws=.72+ .28*Math.sin((t-t0)*.001*(.8+br)+i*2.17);a*=1-fd*(1-tws)*.45}
      if(o.low){var q=proj(o.x+o.low.dx,o.low.y,o.z,yaw,i);g.strokeStyle=line;g.globalAlpha=.8;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();g.globalAlpha=1;orb(q[0],q[1],4.2*q[2],a*.8)}
      var cl=Math.max(0,Math.min(1,(1-Math.abs(p[0]-W/2)/Math.min(W*.5,300)-.4)/.45)),bl=o.eye?0:Math.max(cl*cl*(3-2*cl)*.9*(((window.GJ12.tune||{}).bloom==null?1:GJ12.tune.bloom)),i===foc?Math.min(2.3,(zoom-1)*1.15):0);
      if(o.bl==null)o.bl=0;o.bl+=(bl-o.bl)*(+val('olease')||.08);
      if(!o.eye){var os=Math.round(BASE*Math.max(o.bl,TT('omin',44)/BASE)*Math.min(1.25,p[2]/Math.max(.001,zoom))*2)/2,bo=TT('omin',44)>0?1:Math.min(1,o.bl*2.6),df=(TT('oblur',.12)*Math.max(0,1-near*1.15)*7).toFixed(1);
        o._w=os;o._px=p[0];o._py=p[1];if(o._bo!==bo){o._bo=bo;o.a.style.setProperty('--bo',bo.toFixed(3))}if(o._df!==df){o._df=df;o.a.style.setProperty('--df',df+'px')}}
      if(!o.eye)orb(p[0],p[1],(o.sel?8.5:6.2)*p[2],(o.sel?1.2:a)*(1-Math.min(.75,o.bl)));
      if(o.eye){o._px=p[0];o._py=p[1];o._sc=Math.max(.7,Math.min(1.15,H/470))}o.a.style.transform='translate('+p[0].toFixed(1)+'px,'+p[1].toFixed(1)+'px) scale('+(o.eye?o._sc:1).toFixed(3)+')';o.a.style.setProperty('--o',((.45+.55*near)*(foc>=0&&i!==foc?Math.max(0,1-(zoom-1)/.9):1)).toFixed(2));o.a.style.zIndex=o.eye?3:2}
    ambLight();
    /* bloomed stars never cover each other: the one nearer the middle keeps its size, a neighbour gives way */
    var L=N.filter(function(o){return !o.eye}).sort(function(u,v){return Math.abs(u._px-W/2)-Math.abs(v._px-W/2)}),done=[];
    /* the Spirit Eye holds its place: neighbours give way to it, and a name it would cover fades out */
    var EY=N.filter(function(o){return o.eye&&o._px!=null}).map(function(o){if(!o._elw){var lb=o.a.querySelector('b');o._elw=lb?lb.offsetWidth:1}return {_px:o._px,_py:o._py,_s:120*o._sc,_lw:o._elw*o._sc,a:o.a,eye:1}});done=EY.slice();
    L.forEach(function(o,j){var r=o._w/2;done.forEach(function(q){var d=Math.hypot(o._px-q._px,o._py-q._py),rq=q._s/2;if(r>0&&d<r+rq+8)r=Math.max(0,d-rq-8);
        if(r>0){if(!q._lw){var lb=q.a.querySelector('b');q._lw=lb?lb.offsetWidth:0}var hw=q._lw/2+4,y1=q._py-rq-38,y0=q._py-rq-10,nx=Math.max(q._px-hw,Math.min(o._px,q._px+hw)),ny=Math.max(y1,Math.min(o._py,y0)),dl=Math.hypot(o._px-nx,o._py-ny);if(dl<r+12)r=Math.max(0,dl-12)}});
      if(r<9)r=0;o._s=r*2;if(o._osE==null)o._osE=o._s;o._osE+=(o._s-o._osE)*(+val('oease')||.1);o.a.style.setProperty('--os',Math.max(0,o._osE).toFixed(2)+'px')
      var lo=1;EY.forEach(function(q){if(!o._lw){var lb=o.a.querySelector('b');o._lw=lb?lb.offsetWidth:0}var R=q._s/2+6,hw=o._lw/2,y1=o._py-o._s/2-36,y0=o._py-o._s/2-12,nx=Math.max(o._px-hw,Math.min(q._px,o._px+hw)),ny=Math.max(y1,Math.min(q._py,y0));if(Math.hypot(q._px-nx,q._py-ny)<R)lo=0});
      o._elo=lo;o.a.style.zIndex=2+(L.length-j>0?0:0);done.push(o)});
    /* v28: every star shows its icon, and no icon sits on another star's name: the icon gives way, down to a small floor */
    var MINR=Math.min(16,TT('omin',44)/2);
    function lab(q){if(!q._lw){var lb=q.a.querySelector('b');q._lw=lb?lb.offsetWidth:0}var hw=q._lw/2+4,y0=q._py-q._s/2-12;return [q._px-hw,y0-24,q._px+hw,y0]}
    function dr(o,R){var nx=Math.max(R[0],Math.min(o._px,R[2])),ny=Math.max(R[1],Math.min(o._py,R[3]));return Math.hypot(o._px-nx,o._py-ny)}
    for(var pass=0;pass<2;pass++)L.forEach(function(o){if(!(o._s>0))return;var r=o._s/2;L.forEach(function(q){if(q===o)return;var d=dr(o,lab(q));if(d<r+4)r=Math.max(MINR,d-4)});
      if(r*2<o._s){o._s=r*2;if(o._osE==null)o._osE=o._s;o._osE+=(o._s-o._osE)*(+val('oease')||.1);o.a.style.setProperty('--os',Math.max(0,o._osE).toFixed(2)+'px')}});
    L.forEach(function(q){var lo=q._elo==null?1:q._elo,R=lab(q),hit=function(R){return L.some(function(o){return o!==q&&o._s>0&&dr(o,R)<o._s/2-2})},dn=0;
      if(hit(R)){var hw=(R[2]-R[0])/2,y0=q._py+q._s/2+10,R2=[q._px-hw,y0,q._px+hw,y0+24];if(!hit(R2))dn=1;else lo=0}
      if(q._dn!==dn){q._dn=dn;q.a.classList.toggle('lb',!!dn)}if(q._lo!==lo){q._lo=lo;q.a.style.setProperty('--lo',lo)}});
  }
  var lean=0,tlean=0,userPan=0,initedHome=0;
  function feelId(){return String(val('feel')||'a')}
  function homePan(){var mode=String(val('open')||'a');vel=0;if(mode==='b'){for(var i=0;i<n;i++)if(as[i].getAttribute('data-k')==='lost-in-time'){tp=N[i].x;pan=N[i].x;return}}tp=0;pan=0}
  function run(t){raf=0;var moving=0;var rr=el.getBoundingClientRect();if(rr.bottom<-40||rr.top>innerHeight+40||document.hidden){raf=requestAnimationFrame(run);return}
    var fid=feelId();
    if(!drag){if(fid==='a'){if(Math.abs(vel)>.05){tp+=vel;vel*=.93;clampPan();moving=1}var d=tp-pan;if(Math.abs(d)>.3){pan+=d*.18;moving=1}else pan=tp}
      else{var I=+val('finertia')||(fid==='c'?1.15:.85),D=+val('fdamp')||(fid==='c'?.975:.96),S=+val('fsettle')||(fid==='c'?.055:.08);if(Math.abs(vel)>.02){tp+=vel*I;vel*=D;var l2=lim();if(tp<=l2[0]||tp>=l2[1]){vel*=.6;clampPan()}else clampPan();moving=1}var d=tp-pan;if(Math.abs(d)>.15){pan+=d*S;moving=1}else pan=tp}}
    lean+=((tlean||0)-lean)*.1;
    if(Math.abs(tz-zoom)>.003)zoom+=(tz-zoom)*.2;else zoom=tz;if(zoom<=1.001&&tz<=1)foc=-1;
    draw(t||performance.now());raf=requestAnimationFrame(run)}
  function go(){if(!raf)raf=requestAnimationFrame(run)}
  el.addEventListener('pointerdown',function(e){drag={x:e.clientX,p:tp,lx:e.clientX,t:performance.now(),v:0};moved=0;vel=0;tlean=0});
  el.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x;if(Math.abs(dx)>6){if(!moved){moved=1;try{el.setPointerCapture(e.pointerId)}catch(x){}}}
    if(!moved)return;var now=performance.now(),fid=feelId(),inst=-(e.clientX-drag.lx)/Math.max(1,now-drag.t)*(fid==='a'?16:12);drag.v=fid==='a'?inst:drag.v*.7+inst*.3;drag.lx=e.clientX;drag.t=now;var gain=fid==='a'?1.15:(fid==='c'?.92:1);tp=drag.p-dx*gain;var l=lim(),rb=fid==='a'?.3:.18;if(tp<l[0])tp=l[0]-(l[0]-tp)*rb;if(tp>l[1])tp=l[1]+(tp-l[1])*rb;pan=tp;tlean=Math.max(-1,Math.min(1,-dx/(W||390)*(+val('cdepth')||0)));userPan=1});
  function up(){if(!drag)return;var d=drag;drag=null;tlean=0;if(moved){vel=d.v;if(feelId()!=='a')vel=Math.max(-28,Math.min(28,vel));clampPan();el._sw=Date.now()}}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  as.forEach(function(a,i){a.addEventListener('click',function(e){e.preventDefault();if(el._sw&&Date.now()-el._sw<350)return;var id=a.getAttribute('data-k');if((CUR&&CUR.id===id)||(FULL.state&&FULL.state().on&&FULL.state().k===id))return;if(GJ12._navLock&&Date.now()<GJ12._navLock)return;if(GJ12._closedAt&&Date.now()-GJ12._closedAt<450&&id===GJ12._closedId)return;N.forEach(function(o){o.sel=0});N[i].sel=1;if(GJ12.gotoPlate)GJ12.gotoPlate(id);else location.hash='#'+id});a.addEventListener('dragstart',function(e){e.preventDefault()})});
  el.addEventListener('wheel',function(e){var dx=e.deltaX,dy=e.deltaY;if(Math.abs(dx)<Math.abs(dy)){if(Math.abs(dy)<1)return;dx=dy}e.preventDefault();if(feelId()==='a'){tp+=dx;clampPan()}else{tp+=dx;vel+=dx*.18;vel=Math.max(-32,Math.min(32,vel));clampPan();userPan=1}},{passive:false});
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
  pinchOn(el,function(sc,done,x,y,inf){
    if(FULL.state&&FULL.state().on)return;
    if(typeof overlayOn==='function'&&overlayOn())return;
    if(ALLV.state&&ALLV.state().on)return;
    if(foc<0&&zoom<=1.01&&sc<1){
      var real=inf&&inf.pinch;
      if(done){el.style.transform='';if(real&&sc<(+val('pinchout')||.74))ALLV.open()}
      else if(real){el.style.transform='scale('+Math.max(+val('pinchfloor')||.88,sc).toFixed(3)+')'}
      if(done){el.style.transform=''}return}
    el.style.transform='';el.style.opacity='';
    if(foc<0){foc=nearestStar(x);z0=zoom;tp=N[foc].x;vel=0;drag=null;warm(hero(foc))}
    var z=Math.max(1,Math.min(3.2,z0*sc));
    if(!done){zoom=tz=z;return}
    if(z>=1.7){tz=3.2;var i=foc;setTimeout(function(){openStar(i)},180)}else{tz=1}});
  GJ12.roomFrom=function(id){N.forEach(function(o,i){if(o.a.getAttribute('data-k')===id)foc=i});if(foc<0)return;pan=tp=N[foc].x;zoom=3.2;tz=1};
  GJ12.roomZoom=function(){return {zoom:zoom,tz:tz,foc:foc}};
  var ab=$('#allbtn');if(ab)ab.addEventListener('click',function(){ALLV.open()});
  $$('[data-sheet]').forEach(function(b){b.addEventListener('click',function(){ALLV.open();ALLV.zoom(.32);var s=$('#all .ascroll');if(s){s.scrollTop=0;s.scrollLeft=0}})});
  new ResizeObserver(size).observe(el);GJ12.reroom=function(){build();if(!userPan)homePan();else clampPan()};GJ12.roomHome=function(force){if(force)userPan=0;homePan()};GJ12.room=function(){return {pan:pan,n:n,mid:mid,lim:lim()}};
  size();
}
/* ---- one work per screen ---- */
var CUR=null,GAL={};
function plates(){
  var ps=$$('.plate'),where=$('#where'),rail=$$('#rail a');
  rail.forEach(function(a){a.addEventListener('click',function(e){if(railEl&&railEl._skip){e.preventDefault();e.stopPropagation();return}var id=(a.getAttribute('href')||'').replace(/^#/,'');e.preventDefault();if((CUR&&CUR.id===id)||(FULL.state&&FULL.state().on&&FULL.state().k===id))return;if(GJ12._navLock&&Date.now()<GJ12._navLock)return;if(GJ12._closedAt&&Date.now()-GJ12._closedAt<450&&id===GJ12._closedId)return;if(GJ12.gotoPlate)GJ12.gotoPlate(id);else location.hash='#'+id})});
  var railEl=$('#rail');
  if(railEl&&rail.length){
    var rd=null,rPos=0,rVel=0,rRaf=0,rLive=-1;
    function railIds(){return rail.map(function(a){return (a.getAttribute('href')||'').replace(/^#/,'')})}
    function curIdx(){var id=CUR&&CUR.id,ids=railIds(),i=ids.indexOf(id);return i<0?0:i}
    function markRail(i){i=Math.max(0,Math.min(rail.length-1,Math.round(i)));rail.forEach(function(a,j){a.classList.toggle('on',j===i)})}
    function goRail(i){i=Math.max(0,Math.min(rail.length-1,Math.round(i)));var id=railIds()[i];if(id&&GJ12.gotoPlate)GJ12.gotoPlate(id);markRail(i)}
    function dSpd(){return Math.max(.3,+val('dialspd')||1)}
    function coast(){rRaf=0;rVel*=.9;rPos+=rVel;if(GJ12.pulseKick)GJ12.pulseKick(Math.min(1,Math.abs(rVel)/2));if(rPos<0){rPos=0;rVel=0}if(rPos>rail.length-1){rPos=rail.length-1;rVel=0}
      markRail(rPos);if(Math.abs(rVel)>.02){rRaf=requestAnimationFrame(coast);return}
      var t=Math.round(rPos);rPos+=(t-rPos)*.22;if(Math.abs(t-rPos)>.02){rRaf=requestAnimationFrame(coast);return}
      rPos=t;goRail(t)}
    railEl.addEventListener('pointerdown',function(e){if(!de.classList.contains('in'))return;rd={y:e.clientY,t:performance.now(),i:curIdx(),ly:e.clientY,v:0,m:0};rPos=rd.i;rVel=0;if(rRaf){cancelAnimationFrame(rRaf);rRaf=0}try{railEl.setPointerCapture(e.pointerId)}catch(x){}});
    railEl.addEventListener('pointermove',function(e){if(!rd)return;var now=performance.now(),dy=e.clientY-rd.ly,dt=Math.max(1,now-rd.t),sp=Math.abs(dy)/dt,g=dSpd()*(sp<.18?1:(1+Math.min(3.2,(sp-.18)*10)));
      if(Math.abs(e.clientY-rd.y)>6)rd.m=1;rd.v=(-dy/dt)*g*16;rd.ly=e.clientY;rd.t=now;rPos+=(-dy)/(22)*g;rPos=Math.max(0,Math.min(rail.length-1,rPos));markRail(rPos);
      if(GJ12.pulseKick)GJ12.pulseKick(Math.min(1,Math.abs(rd.v)/2));if(rd.m&&Math.abs(rd.v)<.35&&Math.round(rPos)!==rLive){rLive=Math.round(rPos);goRail(rLive)}});
    function railUp(){if(!rd)return;var o=rd;rd=null;if(!o.m)return;railEl._skip=1;setTimeout(function(){railEl._skip=0},350);rVel=o.v;if(Math.abs(rVel)<.12){goRail(rPos);return}if(!rRaf)rRaf=requestAnimationFrame(coast)}
    railEl.addEventListener('pointerup',railUp);railEl.addEventListener('pointercancel',railUp);
  }
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
    if(p){p.classList.add('seen');if(p._near)p._near()}
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
  ps.forEach(function(p){var st=$('.stage',p);if(!st)return;var t=null;function showC(){p.classList.add('chrome-on');p.classList.remove('chrome-off');clearTimeout(t);t=setTimeout(function(){p.classList.remove('chrome-on');p.classList.add('chrome-off')},chromeMs())}showC();['pointermove','pointerdown','touchstart','mousemove'].forEach(function(ev){st.addEventListener(ev,showC,{passive:true})});});
}
function gallery(p){
  var st=$('.stage',p),strip=$$('.strip button',p),img=$('img.main',st),m3=$('.dial',st),vid=$('video:not(.clip)',st),cv=$('video.clip',st),cap=$('.cap',p),at=0;
  if(!strip.length)return;
  function show(i,user){
    at=(i+strip.length)%strip.length;var b=strip[at],k=b.getAttribute('data-kind');
    strip.forEach(function(x,j){x.classList.toggle('on',j===at)});
    if(img)img.hidden=k!=='img';if(m3)m3.hidden=k!=='dial';
    if(vid){if(k!=='video'){vid.hidden=true;vid.classList.remove('clip-go');vid.classList.add('clip-wait');try{vid.pause()}catch(e){}}}
    if(cv){if(k!=='clip'){cv.hidden=true;cv.classList.remove('clip-go');cv.classList.add('clip-wait');try{cv.pause()}catch(e){}}var cstill=cv.parentNode&&cv.parentNode.querySelector('img.clipstill');if(cstill)cstill.hidden=k!=='clip'}
    if(vid){var vstill=vid.parentNode&&vid.parentNode.querySelector('img.clipstill');if(vstill)vstill.hidden=k!=='video'}
    if(user)p._picked=1;
    function layStill(v,po){if(!v||!v.parentNode)return;var src=po||v.getAttribute('poster')||'';var img=v.parentNode.querySelector('img.clipstill');if(!img){img=document.createElement('img');img.className='clipstill';img.alt='';img.draggable=false;img.decoding='async';v.parentNode.insertBefore(img,v)}if(src&&img.getAttribute('src')!==src)img.src=src;img.hidden=false;if(src)v.setAttribute('poster',src);v.classList.add('clip-wait');v.classList.remove('clip-go');bareVideo(v);bindVidPlay(v)}
    function cueVid(v,loop,start){if(!v)return;bareVideo(v);if(v.classList.contains('clip')||v.hasAttribute('muted')||v.getAttribute('data-silent')==='1'){v.muted=true;v.defaultMuted=true;v.setAttribute('muted','')}if(loop!=null)v.loop=!!loop;layStill(v,v.getAttribute('poster')||'');v.hidden=true;v.classList.add('clip-wait');v.classList.remove('clip-go');syncVidPlay(v);if(start){if(v.preload==='none')v.preload='metadata';v.hidden=false;var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}}
    if(k==='clip'&&cv){var cs=b.getAttribute('data-src'),po=b.getAttribute('data-poster')||'';if(po)cv.setAttribute('poster',po);if(cs&&cv.getAttribute('src')!==cs)cv.setAttribute('src',cs);cueVid(cv,true,user==='play')}
    if(k==='video'&&vid){if((p.id==='weird-kid')||vid.getAttribute('data-silent')==='1')lockSilent(vid);cueVid(vid,true,user==='play')}
    if(k==='img'){var src=b.getAttribute('data-big'),tq=$('img',b);if(p._n){sharp(img,src,tq?(tq.currentSrc||tq.getAttribute('src')):'');var nb=strip[at+1];if(nb&&nb.getAttribute('data-big'))warm(nb.getAttribute('data-big'))}else img.setAttribute('data-src',src);img.alt=b.getAttribute('data-alt')||''}
    if(k==='dial'){if(m3._d)m3._d.say();if(typeof railPaint==='function')railPaint();return}
    var c=b.getAttribute('data-cap')||'',g=b.getAttribute('data-grp')||'';
    var imgs=strip.filter(function(x){return x.getAttribute('data-kind')==='img'}),n=imgs.indexOf(b);
    cap.innerHTML='';cap.appendChild(document.createTextNode(c));
    var sm=document.createElement('small');sm.textContent=k==='img'?((g?g+' · ':'')+(imgs.length>1?(n+1)+' of '+imgs.length:'')):(b.getAttribute('data-note')||'');cap.appendChild(sm);
    if(user&&b.scrollIntoView)try{b.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})}catch(e){}
    if(typeof railPaint==='function')railPaint();
  }
  strip.forEach(function(b,i){b.addEventListener('click',function(){var k0=b.getAttribute('data-kind');show(i,(k0==='clip'||k0==='video')?'play':true)})});
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
  function showAuto(){/* open on the first rail item; never jump to a clip */}
  p._near=function(){if(!p._n){p._n=1;var ds=img&&img.getAttribute('data-src');if(ds){var b0=strip[at],t0=b0&&$('img',b0);sharp(img,ds,t0?(t0.currentSrc||t0.getAttribute('src')):'');img.removeAttribute('data-src')}}if(m3&&!m3._d)dial(m3,p,cap);showAuto();if(GJ12.autoplay)GJ12.autoplay()};
  GAL[p.id]={step:function(d){if(m3&&!m3.hidden&&m3._d)m3._d.step(d);else show(at+d,true)},at:function(){return at},show:show,
    items:function(){var o=[];if(m3)$$('figure',m3).forEach(function(f){o.push({big:f.getAttribute('data-big'),th:f.getAttribute('data-big'),cap:f.getAttribute('data-cap')})});
      imgsAll.forEach(function(b){var t=$('img',b);o.push({big:b.getAttribute('data-big'),th:t?t.getAttribute('src'):b.getAttribute('data-big'),cap:b.getAttribute('data-cap')})});return o},
    showBig:function(src){var b=imgsAll.filter(function(x){return x.getAttribute('data-big')===src})[0];if(b){show(strip.indexOf(b),true);return}
      if(m3){var fs=$$('figure',m3),j=-1;fs.forEach(function(f,q){if(f.getAttribute('data-big')===src)j=q});if(j>=0){show(0,true);if(!m3._d)dial(m3,p,cap);var t=$$('.ticks button',m3)[j];if(m3._d&&m3._d.jump)m3._d.jump(j)}}}};
  /* pinch the picture smaller and it opens out into the wall of every image of this piece */
  pinchOn(st,function(sc,done){if(done&&sc<(+val('wallpinch')||.82))WALL.open(p.id,2)});
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
  rail.addEventListener('pointermove',function(e){if(!rd)return;e.stopPropagation();var na=rd.base+railAt(e.clientX)*step,now=performance.now();rd.v=(na-a)/Math.max(1,now-rd.t)*16;rd.t=now;a=na;if(GJ12.pulseKick)GJ12.pulseKick(Math.min(1,Math.abs(rd.v)/8));paint()});
  function railUp(e){if(!rd)return;e.stopPropagation();rail.classList.remove('on');var o=rd;rd=null;drag=null;land(o.a0,o.v*2.5*(+val('dialspd')||1));ta=Math.max(o.base,Math.min(o.base+(n-1)*step,ta))}
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
  (function ghost(el){var t=null;function showC(){el.classList.add('chrome-on');el.classList.remove('chrome-off');clearTimeout(t);t=setTimeout(function(){el.classList.remove('chrome-on');el.classList.add('chrome-off')},chromeMs())}showC();['pointermove','pointerdown','touchstart','mousemove','keydown'].forEach(function(ev){el.addEventListener(ev,showC,{passive:true})});})(lb);
  var z=1,px=0,py=0,z0=1,pinching=0,pan=null,moved=0;
  function fit(){z=1;px=0;py=0;img.style.transform='';}
  function applyZ(){img.style.transform=z<=1&&!px&&!py?'':'translate('+px+'px,'+py+'px) scale('+z+')'}
  var _show=show;show=function(i){fit();_show(i)};
  var _shut=shut;shut=function(){fit();_shut()};
  lb.addEventListener('wheel',function(e){
    if(!lb.classList.contains('on'))return;
    e.preventDefault();e.stopPropagation();
    if(e.ctrlKey||z<=1){z=Math.max(1,Math.min(4,z*Math.exp(-e.deltaY*.01)));if(z===1){px=0;py=0}applyZ()}
    else {px-=e.deltaX;py-=e.deltaY;applyZ()}
  },{passive:false,capture:true});
  pinchOn(st,function(sc,done){
    if(!pinching){pinching=1;z0=z}
    z=Math.max(1,Math.min(4,z0*sc));if(z===1){px=0;py=0}applyZ();
    img.style.transition='none';
    if(done){pinching=0;setTimeout(function(){img.style.transition=''},0)}
  });
  st.addEventListener('pointerdown',function(e){
    if(e.target.closest&&e.target.closest('.nv,.x'))return;
    if(z<=1)return;
    if(e.pointerType!=='mouse'&&!e.isPrimary)return;
    pan={x:e.clientX,y:e.clientY,px:px,py:py};moved=0;
    try{st.setPointerCapture(e.pointerId)}catch(x){}
  });
  st.addEventListener('pointermove',function(e){
    if(!pan)return;
    var dx=e.clientX-pan.x,dy=e.clientY-pan.y;
    if(Math.hypot(dx,dy)>8)moved=1;
    px=pan.px+dx;py=pan.py+dy;applyZ();
  });
  function panUp(){pan=null}
  st.addEventListener('pointerup',panUp);st.addEventListener('pointercancel',panUp);
  st.addEventListener('click',function(e){
    if(e.target.closest&&e.target.closest('.nv,.x,button'))return;
    if(moved||pinching){moved=0;return}
    close();
  });
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
  function skyOn(){return +val('skyplay')!==0}
  function starWave(g,w,h,mid){
    var n=peaks.length||1,red=de.classList.contains('red');
    var ink=red?'#ff4457':'#f4f8ff',head=D()?au.currentTime/D():0,bw=w/n,y0=mid==null?h/2:mid;
    g.lineWidth=1;g.lineCap='round';
    for(var i=0;i<n;i++){
      var x=i*bw+bw/2,ph=peaks[i]||.1,hh=ph*(y0<h*.5?Math.max(24,y0):h)*.42+2,lit=(i+.5)/n<=head;
      g.globalAlpha=lit?.7:.16;g.strokeStyle=ink;
      g.beginPath();g.moveTo(x,y0-hh);g.lineTo(x,y0+hh*.36);g.stroke();
      g.globalAlpha=lit?.95:.35;g.fillStyle=ink;
      g.beginPath();g.arc(x,y0-hh,lit?1.4:.9,0,6.283);g.fill();
      if(lit&&i%3===0){g.globalAlpha=.16;g.beginPath();g.arc(x,y0-hh,5,0,6.283);g.fill()}
    }
    g.globalAlpha=.8;g.strokeStyle=ink;
    g.beginPath();g.moveTo(head*w,y0-h*.4);g.lineTo(head*w,y0+h*.16);g.stroke();
    g.globalAlpha=1;
  }
  function drawNowWave(){
    var ncv=$('.now-wave',now);if(!ncv)return;
    var dpr=Math.min(2,window.devicePixelRatio||1),w=ncv.clientWidth,h=ncv.clientHeight;if(!w||!h)return;
    if(ncv.width!==Math.round(w*dpr)){ncv.width=Math.round(w*dpr);ncv.height=Math.round(h*dpr)}
    var g=ncv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);starWave(g,w,h,h*.62);
  }
  function draw(){
    var dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;if(!w)return;
    if(cv.width!==Math.round(w*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
    var g=cv.getContext('2d');
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
    if(skyOn())starWave(g,w,h,h/2);
    else{
      var n=peaks.length||1,red=de.classList.contains('red'),on=red?'#ff4457':'rgb('+c+')',off=red?'rgba(255,68,87,.35)':'rgba(238,243,245,.3)';
      var head=D()?au.currentTime/D():0,bw=w/n;
      for(var i=0;i<n;i++){var p=peaks[i]||.1,bh=Math.max(2,p*(h-8));g.fillStyle=(i+.5)/n<=head?on:off;g.fillRect(i*bw+bw*.2,(h-bh)/2,Math.max(1,bw*.6),bh)}
    }
    t0.textContent=mmss(au.currentTime);t1.textContent=mmss(D());
    drawNowWave();
  }
  GJ12.relit=draw;
  function seek(e){var r=wave.getBoundingClientRect(),f=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));if(D())au.currentTime=f*D();draw()}
  pp.addEventListener('click',function(){if(au.paused){var p=au.play();if(p&&p.catch)p.catch(function(){})}else au.pause()});
  ['play','pause','ended'].forEach(function(ev){au.addEventListener(ev,function(){pp.textContent=au.paused?'play':'pause';draw();paintNow()})});
  ['timeupdate','loadedmetadata','seeked'].forEach(function(ev){au.addEventListener(ev,function(){draw();paintNow()})});
  var now=document.createElement('div');now.id='now';now.setAttribute('role','region');now.setAttribute('aria-label','Lost in Time, now playing');
  now.innerHTML='<b class="now-mark" lang="cr">ᑕᐣᓯ</b><canvas class="now-wave" aria-hidden="true"></canvas><button type="button" class="now-pp" aria-label="play or pause">pause</button><span class="now-name">Lost in Time</span><button type="button" class="now-x" aria-label="stop and close">×</button><span class="now-bar" aria-hidden="true"><i></i></span>';
  document.body.appendChild(now);
  var npp=$('.now-pp',now),nbar=$('.now-bar i',now),nwave=$('.now-wave',now);
  function onLit(){
    var all=$('#all'),wall=$('#wall'),full=$('#full');
    if((all&&all.classList.contains('on'))||(wall&&wall.classList.contains('on'))||(full&&full.classList.contains('on')))return false;
    return !!(typeof CUR!=='undefined'&&CUR&&CUR.id==='lost-in-time');
  }
  function paintNow(){
    if(now.classList.contains('morphing')){npp.textContent=au.paused?'play':'pause';drawNowWave();return}
    var docked=now.classList.contains('docked');
    var live=!au.paused||docked||(au.currentTime>0.05&&!au.ended&&now.classList.contains('held'));
    if(!docked&&(au.ended||(au.paused&&au.currentTime<0.05))){now.classList.remove('on','held');return}
    if(!au.paused)now.classList.add('held');
    var show=(live||docked)&&!onLit();
    now.classList.toggle('on',show);
    npp.textContent=au.paused?'play':'pause';
    if(nbar&&D())nbar.style.width=(Math.max(0,Math.min(1,au.currentTime/D()))*100).toFixed(2)+'%';
    if(show)drawNowWave();
  }
  npp.addEventListener('click',function(){if(au.paused){var p=au.play();if(p&&p.catch)p.catch(function(){})}else au.pause()});
  $('.now-x',now).addEventListener('click',function(e){e.stopPropagation();au.pause();try{au.currentTime=0}catch(err){}now.classList.remove('on','held','docked','morphing');now.style.cssText='';pp.textContent='play';draw()});
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
    g2.globalAlpha=1;
    if(skyOn())starWave(g2,W2,H2,hz)}
  requestAnimationFrame(field);
  var wdown=null;
  wn.addEventListener('pointerdown',function(e){if(!skyOn())return;if(e.target.closest&&e.target.closest('.vrail'))return;wdown={x:e.clientX,y:e.clientY,m:0};try{wn.setPointerCapture(e.pointerId)}catch(x){}});
  wn.addEventListener('pointermove',function(e){if(!wdown)return;if(Math.abs(e.clientX-wdown.x)>8){wdown.m=1;var r=wn.getBoundingClientRect();if(D())au.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*D();draw()}});
  wn.addEventListener('pointerup',function(){if(!wdown)return;var d=wdown;wdown=null;if(!d.m){if(au.paused){var p=au.play();if(p&&p.catch)p.catch(function(){})}else au.pause()}draw()});
  if(nwave){
    var nd=null;
    nwave.addEventListener('pointerdown',function(e){if(now.classList.contains('morphing'))return;e.stopPropagation();nd={x:e.clientX,m:0};try{nwave.setPointerCapture(e.pointerId)}catch(x){}});
    nwave.addEventListener('pointermove',function(e){if(!nd)return;if(Math.abs(e.clientX-nd.x)>8){nd.m=1;var r=nwave.getBoundingClientRect();if(D())au.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*D();draw()}});
    nwave.addEventListener('pointerup',function(){nd=null});
  }
  function clearNowBox(){now.style.left=now.style.right=now.style.top=now.style.bottom=now.style.width=now.style.height=now.style.borderRadius=now.style.transition='';}
  function morphMs(){return 750}
  GJ12.litEsc=function(){
    if(!skyOn())return;
    var card=el.parentNode,r=card.getBoundingClientRect();
    now.classList.add('held','docked','on','morphing','as-card');
    now.style.transition='none';
    now.style.left=r.left+'px';now.style.right='auto';now.style.top=r.top+'px';now.style.bottom='auto';
    now.style.width=r.width+'px';now.style.height=r.height+'px';
    now.style.borderRadius=getComputedStyle(card).borderRadius||'18px';
    drawNowWave();
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      now.style.transition='left .75s cubic-bezier(.22,.82,.22,1),top .75s cubic-bezier(.22,.82,.22,1),width .75s cubic-bezier(.22,.82,.22,1),height .75s cubic-bezier(.22,.82,.22,1),border-radius .75s cubic-bezier(.22,.82,.22,1)';
      now.classList.remove('as-card');now.classList.add('to-mini');
      clearNowBox();
      setTimeout(function(){now.classList.remove('morphing','to-mini');now.style.transition='';paintNow();drawNowWave()},morphMs()+30);
    })});
  };
  function morphToFull(){
    if(onLit()||now.classList.contains('morphing'))return;
    now.classList.add('morphing','from-mini','on','docked');
    if(GJ12._closedAt){GJ12._closedAt=0;GJ12._closedId=null}
    if(GJ12.gotoPlate)GJ12.gotoPlate('lost-in-time');
    requestAnimationFrame(function(){
      var card=el.parentNode.getBoundingClientRect();
      now.style.transition='left .75s cubic-bezier(.22,.82,.22,1),top .75s cubic-bezier(.22,.82,.22,1),width .75s cubic-bezier(.22,.82,.22,1),height .75s cubic-bezier(.22,.82,.22,1),border-radius .75s cubic-bezier(.22,.82,.22,1)';
      now.style.left=card.left+'px';now.style.right='auto';now.style.top=card.top+'px';now.style.bottom='auto';
      now.style.width=card.width+'px';now.style.height=card.height+'px';
      now.style.borderRadius=getComputedStyle(el.parentNode).borderRadius||'18px';
      now.classList.add('as-card');
      setTimeout(function(){now.classList.remove('on','morphing','from-mini','as-card','docked');clearNowBox();paintNow();draw()},morphMs()+30);
    });
  }
  now.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.now-pp,.now-x'))return;if(now.classList.contains('on')&&!onLit())morphToFull()});
}
/* ---- tuning: only for Gill, behind ?tune ---- */
function tune(){
  if($('#tune'))return;
  var d=document.createElement('details');d.id='tune';d.open=true;
  var PRESETS={
    calm:{glow:.32,stars:.7,drift:.6,bloom:.55,spread:1,oblur:.16,osharp:.78,odepth:.85,cdepth:.35,feel:'b',finertia:.85,fdamp:.96,fsettle:.08,open:'a',skylook:'a',moon:0},
    glow:{glow:.95,stars:1.15,drift:1,bloom:1.35,spread:1.05,osharp:.9,oblur:.1,cdepth:.55,feel:'a',open:'a',skylook:'a',moon:0},
    night:{glow:.4,stars:1.85,drift:1.35,bloom:.8,cdepth:.45,moon:1,moonsize:52,moondial:0,feel:'a',open:'a',skylook:'a'}
  };
  var SECS={
    sky:['stars','drift','bloom','spread','oblur','osharp','odepth','cdepth','omin','skylook','skydrift','skyfade','skybreath'],
    motion:['feel','finertia','fdamp','fsettle','olease','oease','dialspd','rail','pulse','pinchout','pinchfloor','wallpinch'],
    plates:['spin','depth','panel','bounce','stage','mx','strip','chrome','arrows'],
    light:['glow','amb','dimmer','mood'],
    red:['redctl','redtone','redlight','redtimer','dimedge'],
    sound:['skyplay'],
    type:['type'],
    search:['findpull','pulledge','pulldist'],
    time:['tunehold','redhold','holdmenu','holdms','deephold'],
    play:['filmauto','clipauto','owtdauto','open'],
    moon:['moon','moonsize','moondial']
  };
  function row(k,lab,a,b,st){return '<label>'+lab+'<input type="range" data-k="'+k+'" min="'+a+'" max="'+b+'" step="'+st+'"><output></output></label>'}
  function abc(lab,key,opts){return '<div class="abc"><span>'+lab+'</span>'+opts.map(function(o){return '<button type="button" data-'+key+'="'+o[0]+'">'+o[1]+'</button>'}).join('')+'</div>'}
  function sec(id,title,body){return '<details class="tune-sec sec-'+id+'" '+(id==='sky'?'open':'')+'><summary><span>'+title+'</span><button type="button" class="tune-sec-reset" data-reset-sec="'+id+'">reset</button></summary><div class="tune-sec-b">'+body+'</div></details>'}
  var knobs=
    abc('photo row','l',[['a','A thumbs'],['b','B dots'],['c','C large']])+
    abc('moon','moon',[['1','on'],['0','off']])+
    row('moonsize','moon size',28,72,1)+
    abc('moon dial','moondial',[['1','on'],['0','off']])+
    abc('scroll feel','feel',[['a','A now'],['b','B calm'],['c','C slow']])+
    abc('opening','open',[['a','A centre'],['b','B Lost in Time']])+
    abc('skylook','skylook',[['a','A now'],['b','B impermanence']])+
    abc('sky player','skyplay',[['1','on'],['0','off']])+
    abc('red control','redctl',[['a','A ᑕᐣᓯ'],['b','B oz'],['c','C both']])+
    abc('arrows','arrows',[['1','on'],['0','off']])+
    abc('films autoplay','filmauto',[['1','on'],['0','off']])+
    abc('clips autoplay','clipauto',[['1','on'],['0','off']])+
    abc('One With the Devil autoplay','owtdauto',[['1','on'],['0','off']])+
    abc('hold menus','holdmenu',[['1','on'],['0','off']])+
    abc('left dimmer','dimedge',[['1','on'],['0','off']])+
    row('glow','glow',0,1.4,.05)+row('spread','room spread',.6,1.8,.05)+row('bloom','star bloom',0,1.6,.05)+
    row('oblur','blur',0,1,.02)+row('osharp','sharpness',0,1,.02)+row('odepth','depth',0,2,.05)+
    row('cdepth','star depth',0,1.4,.05)+row('amb','surround light',0,1,.05)+row('dimmer','dimmer',0,1,.02)+
    row('mood','calm to lively',0,1,.02)+row('type','text size',.85,1.3,.01)+
    row('omin','icon size, every star',0,96,2)+row('stars','stars',0,3,.1)+row('drift','depth drift',0,3,.1)+
    row('stage','picture size',.4,.7,.01)+row('panel','panel size',.4,1,.01)+row('mx','side margin',0,40,1)+
    row('bounce','flip bounce',0,1,.05)+row('rail','rail speed',.4,3,.1)+row('dialspd','dial speed',.4,3,.1)+row('pulse','rail pulse',0,1.5,.05)+
    row('spin','dial spin',.3,3,.1)+row('depth','dial depth',.4,2.5,.05)+
    row('olease','orb ease',.02,.3,.01)+row('oease','orb size ease',.02,.3,.01)+
    row('finertia','inertia',.4,1.6,.05)+row('fdamp','damping',.88,.99,.005)+row('fsettle','settle speed',.03,.3,.005)+
    row('skydrift','sky drift',0,1.5,.05)+row('skyfade','sky fade',0,1,.05)+row('skybreath','breath speed',.1,1.5,.05)+
    row('pinchout','pinch out to all',.5,.9,.01)+row('pinchfloor','pinch floor',.7,.98,.01)+row('wallpinch','pinch to wall',.6,.95,.01)+
    row('chrome','arrow hide, seconds',.4,6,.1)+row('findpull','search pull',.5,2,.05)+
    row('pulledge','search edge, px',24,120,2)+row('pulldist','search pull, px',40,140,2)+
    row('tunehold','tune hold, seconds',.6,2.4,.05)+row('redhold','red dial hold, seconds',.25,1.2,.05)+
    row('holdms','menu hold, seconds',.25,1,.05)+row('deephold','deeper dial, seconds',.7,2,.05)+
    row('redtone','red tone',0,3,1)+row('redlight','red lightness',.2,1,.02)+row('redtimer','red auto-off, minutes',0,60,1)+
    '<div class="air-slot"></div>'+
    '<button type="button" data-reset>back to the design</button><button type="button" data-save-preset>save preset</button><button type="button" data-save-default>copy as default</button><p class="tune-note" hidden></p>';
  var grouped=
    sec('sky','sky, stars, depth, drift',
      abc('skylook','skylook',[['a','A now'],['b','B impermanence']])+
      row('stars','stars',0,3,.1)+row('drift','depth drift',0,3,.1)+row('bloom','star bloom',0,1.6,.05)+
      row('spread','room spread',.6,1.8,.05)+row('oblur','blur',0,1,.02)+row('osharp','sharpness',0,1,.02)+
      row('odepth','depth',0,2,.05)+row('cdepth','star depth',0,1.4,.05)+row('omin','icon size, every star',0,96,2)+
      row('skydrift','sky drift',0,1.5,.05)+row('skyfade','sky fade',0,1,.05)+row('skybreath','breath speed',.1,1.5,.05))+
    sec('motion','constellation, scroll, dial',
      abc('scroll feel','feel',[['a','A now'],['b','B calm'],['c','C slow']])+
      row('finertia','inertia',.4,1.6,.05)+row('fdamp','damping',.88,.99,.005)+row('fsettle','settle speed',.03,.3,.005)+
      row('olease','orb ease',.02,.3,.01)+row('oease','orb size ease',.02,.3,.01)+
      row('dialspd','dial speed',.4,3,.1)+row('rail','rail speed',.4,3,.1)+row('pulse','rail pulse',0,1.5,.05)+
      row('pinchout','pinch out to all',.5,.9,.01)+row('pinchfloor','pinch floor',.7,.98,.01)+row('wallpinch','pinch to wall',.6,.95,.01))+
    sec('plates','pictures, dials, arrows',
      abc('photo row','l',[['a','A thumbs'],['b','B dots'],['c','C large']])+
      abc('arrows','arrows',[['1','on'],['0','off']])+
      row('spin','dial spin',.3,3,.1)+row('depth','dial depth',.4,2.5,.05)+row('panel','panel size',.4,1,.01)+
      row('bounce','flip bounce',0,1,.05)+row('stage','picture size',.4,.7,.01)+row('mx','side margin',0,40,1)+row('chrome','arrow hide, seconds',.4,6,.1))+
    sec('light','light, surround, dimmer',
      row('glow','glow',0,1.4,.05)+row('amb','surround light',0,1,.05)+row('dimmer','dimmer',0,1,.02)+row('mood','calm to lively',0,1,.02))+
    sec('red','red mode',
      abc('red control','redctl',[['a','A ᑕᐣᓯ'],['b','B oz'],['c','C both']])+
      abc('left dimmer','dimedge',[['1','on'],['0','off']])+
      row('redtone','red tone',0,3,1)+row('redlight','red lightness',.2,1,.02)+row('redtimer','red auto-off, minutes',0,60,1))+
    sec('sound','sound, players',
      abc('sky player','skyplay',[['1','on'],['0','off']]))+
    sec('air','atmosphere, white noise','<div class="air-slot"></div>')+
    sec('type','text size',row('type','text size',.85,1.3,.01))+
    sec('search','search pull',
      row('findpull','search pull',.5,2,.05)+row('pulledge','search edge, px',24,120,2)+row('pulldist','search pull, px',40,140,2))+
    sec('time','tap and hold',
      abc('hold menus','holdmenu',[['1','on'],['0','off']])+
      row('tunehold','tune hold, seconds',.6,2.4,.05)+row('redhold','red dial hold, seconds',.25,1.2,.05)+
      row('holdms','menu hold, seconds',.25,1,.05)+row('deephold','deeper dial, seconds',.7,2,.05))+
    sec('play','opening and autoplay',
      abc('opening','open',[['a','A centre'],['b','B Lost in Time']])+
      abc('films autoplay','filmauto',[['1','on'],['0','off']])+
      abc('clips autoplay','clipauto',[['1','on'],['0','off']])+
      abc('One With the Devil autoplay','owtdauto',[['1','on'],['0','off']]))+
    sec('moon','moon',
      abc('moon','moon',[['1','on'],['0','off']])+row('moonsize','moon size',28,72,1)+abc('moon dial','moondial',[['1','on'],['0','off']]))+
    '<div class="tune-presets">'+
    abc('presets','preset',[['calm','calm'],['glow','glow'],['night','night'],['saved','saved']])+
    '<button type="button" data-reset>back to the design</button><button type="button" data-save-preset>save preset</button><button type="button" data-save-default>copy as default</button><p class="tune-note" hidden></p></div>';
  d.innerHTML='<div class="tune-bar"><span>tune</span><span class="tune-acts">'+
    '<span class="abc tune-lay">'+
    '<button type="button" data-tunelayout="a">A now</button>'+
    '<button type="button" data-tunelayout="b">B simple</button></span>'+
    '<button type="button" class="tune-done" aria-label="done, close tune">done</button>'+
    '<button type="button" class="tune-x" aria-label="close tune">×</button></span></div>'+
    '<div class="tune-body">'+
      '<div class="tune-simple">'+
        '<div class="tdim" role="slider" aria-label="light and motion" aria-valuemin="0" aria-valuemax="1"><span>light</span><div class="tdim-track"><i></i></div></div>'+
        '<div class="tfeel" role="slider" aria-label="feel, calm to lively"><span>calm</span><div class="tfeel-track"><i></i></div><span>lively</span></div>'+
        '<div class="ttype" role="slider" aria-label="text size"><b class="aa">Aa</b><b lang="cr">ᑕᐣᓯ</b></div>'+
        '<button type="button" class="tred" aria-label="red mode" aria-pressed="false"><b lang="cr">ᑕᐣᓯ</b></button>'+
      '</div>'+
      '<p class="tune-allh">all settings</p>'+
      '<div class="tune-grouped">'+grouped+'</div>'+
      '<div class="tune-flat">'+
        '<div class="abc"><span>presets</span><button type="button" data-preset="calm">calm</button><button type="button" data-preset="glow">glow</button><button type="button" data-preset="night">night</button></div>'+
        knobs+
      '</div>'+
    '</div>';

  try{var sv=JSON.parse(LS.get('gj.cks12.presets.saved')||'null');if(sv)PRESETS.saved=sv}catch(e){}
  document.body.appendChild(d);
  d.classList.add('lay-'+(val('tunelayout')||'b'));
  var prevOverflow=document.body.style.overflow,prevSnap=de.style.scrollSnapType;
  document.body.style.overflow='hidden';de.style.scrollSnapType='none';
  de.classList.add('tune-on');
  function close(){
    if(close._done)return;close._done=1;
    GJ12._tuneClosedAt=Date.now();
    de.classList.remove('tune-on');
    document.body.style.overflow=prevOverflow||'';de.style.scrollSnapType=prevSnap||'';
    d.remove();
    document.removeEventListener('keydown',onkey,true);
    document.removeEventListener('pointerdown',onout,true);
    GJ12.tuneClose=null;
  }
  GJ12.tuneClose=close;
  function onkey(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();close()}}
  function onout(e){if(d.contains(e.target))return;if(e.target.closest&&(e.target.closest('#esc')||e.target.id==='esc'))return;close()}
  document.addEventListener('keydown',onkey,true);
  setTimeout(function(){document.addEventListener('pointerdown',onout,true)},0);
  function stopBubble(e){e.stopPropagation()}
  d.addEventListener('wheel',stopBubble,{passive:true});
  var sy=null,st0=0,fromBar=0;
  d.addEventListener('touchstart',function(e){if(e.touches.length!==1){sy=null;return}var body=d.querySelector('.tune-body');sy=e.touches[0].clientY;st0=body?body.scrollTop:0;fromBar=!!(e.target.closest&&e.target.closest('.tune-bar,.tune-done,.tune-x'));stopBubble(e)},{passive:true});
  d.addEventListener('touchmove',function(e){stopBubble(e);if(sy==null||e.touches.length!==1)return;var dy=e.touches[0].clientY-sy;if((fromBar||st0<=1)&&dy>64){sy=null;close()}},{passive:true});
  d.addEventListener('touchend',function(){sy=null},{passive:true});
  function closeClick(e){e.preventDefault();e.stopPropagation();close()}
  d.querySelector('.tune-x').addEventListener('click',closeClick);
  var dn=d.querySelector('.tune-done');if(dn)dn.addEventListener('click',closeClick);
  d.addEventListener('toggle',function(){if(!d.open)close()});
  function paintVis(){
    var dim=d.querySelector('.tdim-track i');if(dim)dim.style.left=(dimK()*100)+'%';
    var fe=d.querySelector('.tfeel-track i');if(fe)fe.style.left=((+val('mood')||0)*100)+'%';
    var typ=d.querySelector('.ttype');if(typ)typ.style.setProperty('--t',(+val('type')||1));
    var tr=d.querySelector('.tred');if(tr){var on=de.classList.contains('red');tr.classList.toggle('on',on);tr.setAttribute('aria-pressed',on?'true':'false')}
    d.classList.remove('lay-a','lay-b');d.classList.add('lay-'+(val('tunelayout')||'b'));
    $$('[data-tunelayout]',d).forEach(function(b){b.classList.toggle('on',String(val('tunelayout')||'b')===b.getAttribute('data-tunelayout'))});
  }
  function paint(){$$('input',d).forEach(function(i){var k=i.getAttribute('data-k');if(!k||!i.nextSibling)return;i.value=val(k);i.nextSibling.textContent=i.value});
    $$('[data-l]',d).forEach(function(b){b.classList.toggle('on',val('strip')===b.getAttribute('data-l'))});
    Object.keys(DEFAULTS).forEach(function(k){
      $$('[data-'+k+']',d).forEach(function(b){b.classList.toggle('on',String(val(k))===b.getAttribute('data-'+k))});
    });
    $$('[data-preset]',d).forEach(function(b){b.classList.remove('on')});
    paintVis()}
  function save(){LS.set('gj.cks12.tune',JSON.stringify(TUNE));apply();paint();if(GJ12.reroom)GJ12.reroom()}
  d.addEventListener('input',function(e){var k=e.target.getAttribute('data-k');if(!k)return;TUNE[k]=+e.target.value;save()});
  d.addEventListener('click',function(e){var t=e.target;if(!t||!t.getAttribute)return;
    var l=t.getAttribute('data-l');if(l){TUNE.strip=l;save();return}
    var mo=t.getAttribute('data-moon');if(mo!=null){TUNE.moon=+mo;save();return}
    var md=t.getAttribute('data-moondial');if(md!=null){TUNE.moondial=+md;save();return}
    var fe=t.getAttribute('data-feel');if(fe){TUNE.feel=fe;if(fe==='a'){TUNE.finertia=1;TUNE.fdamp=.93;TUNE.fsettle=.18}else if(fe==='b'){TUNE.finertia=.85;TUNE.fdamp=.96;TUNE.fsettle=.08}else if(fe==='c'){TUNE.finertia=1.15;TUNE.fdamp=.975;TUNE.fsettle=.055}save();return}
    var op=t.getAttribute('data-open');if(op){TUNE.open=op;save();if(GJ12.roomHome)GJ12.roomHome(true);return}
    var sk=t.getAttribute('data-skylook');if(sk){TUNE.skylook=sk;save();return}
    var pr=t.getAttribute('data-preset');if(pr&&PRESETS[pr]){var o=PRESETS[pr],k;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))TUNE[k]=o[k];save();$$('[data-preset]',d).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-preset')===pr)});return}
    var tl=t.getAttribute('data-tunelayout');if(tl){TUNE.tunelayout=tl;save();return}
    var rs=t.getAttribute('data-reset-sec');if(rs){if(t.closest)t.closest('summary')&&(t.closest('summary').parentElement.open=true);e.preventDefault();e.stopPropagation();if(SECS[rs])SECS[rs].forEach(function(k){delete TUNE[k]});save();return}
    if(t.hasAttribute('data-save-preset')){var all={},kk;for(kk in DEFAULTS)if(Object.prototype.hasOwnProperty.call(DEFAULTS,kk))all[kk]=val(kk);try{LS.set('gj.cks12.presets.saved',JSON.stringify(all))}catch(err){}PRESETS.saved=all;var note=d.querySelector('.tune-note');if(note){note.hidden=false;note.textContent='preset saved'}return}
    if(t.attributes){var ai,name,key,vv,handled=false;for(ai=0;ai<t.attributes.length;ai++){name=t.attributes[ai].name;if(name.indexOf('data-')!==0)continue;key=name.slice(5);if(!Object.prototype.hasOwnProperty.call(DEFAULTS,key))continue;if(key==='open'||key==='feel'||key==='moon'||key==='moondial'||key==='skylook')continue;vv=t.getAttribute(name);TUNE[key]=(typeof DEFAULTS[key]==='number')?+vv:vv;handled=true}if(handled){save();if(GJ12.autoplay)GJ12.autoplay();return}}
    if(t.hasAttribute('data-reset')){TUNE={};save();return}
    if(t.hasAttribute('data-save-default')){
      var all={},k;for(k in DEFAULTS)if(Object.prototype.hasOwnProperty.call(DEFAULTS,k))all[k]=val(k);
      var json=JSON.stringify(all,null,2),note=d.querySelector('.tune-note');
      function said(ok){if(!note)return;note.hidden=false;note.textContent=ok?'copied, send to your agent to make it the default':'could not copy'}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(json).then(function(){said(true)}).catch(function(){said(false)})}
      else{try{var ta=document.createElement('textarea');ta.value=json;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();said(true)}catch(err){said(false)}}
    }});
  function slide(el,set){if(!el)return;var down=0;
    function at(e){var r=el.getBoundingClientRect(),f=Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width)));set(f)}
    el.addEventListener('pointerdown',function(e){down=1;try{el.setPointerCapture(e.pointerId)}catch(x){}at(e)});
    el.addEventListener('pointermove',function(e){if(down)at(e)});
    el.addEventListener('pointerup',function(){down=0});el.addEventListener('pointercancel',function(){down=0});
  }
  slide(d.querySelector('.tdim-track'),function(f){TUNE.dimmer=Math.round(f*100)/100;save()});
  slide(d.querySelector('.tfeel-track'),function(f){TUNE.mood=Math.round(f*100)/100;if(f<.33){TUNE.feel='b';TUNE.finertia=.85;TUNE.fdamp=.96;TUNE.fsettle=.08}else if(f>.66){TUNE.feel='a';TUNE.finertia=1;TUNE.fdamp=.93;TUNE.fsettle=.18}save()});
  (function(){
    var el=d.querySelector('.ttype');if(!el)return;
    var down=null,pz=null,t0=1;
    el.addEventListener('pointerdown',function(e){down={x:e.clientX,t:+val('type')||1};try{el.setPointerCapture(e.pointerId)}catch(x){}});
    el.addEventListener('pointermove',function(e){if(!down||pz)return;TUNE.type=Math.max(.85,Math.min(1.3,Math.round((down.t+(e.clientX-down.x)/140)*100)/100));save()});
    el.addEventListener('pointerup',function(){down=null});el.addEventListener('pointercancel',function(){down=null});
    el.addEventListener('touchstart',function(e){if(e.touches.length===2){e.preventDefault();down=null;pz=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);t0=+val('type')||1}},{passive:false});
    el.addEventListener('touchmove',function(e){if(!pz||e.touches.length!==2)return;e.preventDefault();var z=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);TUNE.type=Math.max(.85,Math.min(1.3,Math.round((t0*z/Math.max(1,pz))*100)/100));save()},{passive:false});
    el.addEventListener('touchend',function(e){if(!e.touches||e.touches.length<2)pz=null},{passive:true});
  })();
  var tred=d.querySelector('.tred');
  if(tred)tred.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(GJ12.setRed)GJ12.setRed(!de.classList.contains('red'));else{de.classList.toggle('red');LS.set('gj.cks12.red',de.classList.contains('red')?'1':'0');if(GJ12.redPaint)GJ12.redPaint()}paintVis()});
  paint();
}


function overlayOn(){
  var lb=$('#lb'),f=$('#full'),w=$('#wall'),a=$('#all');
  return !!( $('#tune') || (lb&&lb.classList.contains('on')) || (f&&f.classList.contains('on')) || (w&&w.classList.contains('on')) || (a&&a.classList.contains('on')) );
}

function lockSilent(v){if(!v)return;v.muted=true;v.defaultMuted=true;v.volume=0;v.setAttribute('muted','');if(v._sil)return;v._sil=1;v.addEventListener('volumechange',function(){v.muted=true;v.defaultMuted=true;v.volume=0})}
function autoplayClips(){
  /* still first; never autoplay; pause when the plate leaves view; tap uses the site play button */
  function vis(el){if(!el||el.hidden)return false;var r=el.getBoundingClientRect(),vh=innerHeight||1;return r.width>8&&r.height>8&&r.top<vh*.88&&r.bottom>vh*.12}
  function layStill(v){if(!v||!v.parentNode)return;var src=v.getAttribute('poster')||'';var img=v.parentNode.querySelector('img.clipstill');if(!img){img=document.createElement('img');img.className='clipstill';img.alt='';img.draggable=false;img.decoding='async';v.parentNode.insertBefore(img,v)}if(src&&img.getAttribute('src')!==src)img.src=src;img.hidden=!vidCurrent(v);v.classList.add('clip-wait');v.classList.remove('clip-go');bareVideo(v);bindVidPlay(v);syncVidPlay(v)}
  function tick(){
    $$('.plate video').forEach(function(v){
      var plate=v.closest('.plate'),on=de.classList.contains('in')&&plate&&vis(plate)&&(typeof CUR==='undefined'||!CUR||CUR===plate);
      if(isFilmVid(v)){
        if((plate&&plate.id==='weird-kid')||v.getAttribute('data-silent')==='1')lockSilent(v);
        v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');
        if(isAutoFilm(v)&&on&&+val('filmauto')!==0){v.hidden=false;if(v.paused){if(v.preload==='none')v.preload='metadata';var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}}
        else if(!v.paused){try{v.pause()}catch(e){}}
      }else{
        if(on&&+val('clipauto')===1){v.hidden=false;if(v.paused){if(v.preload==='none')v.preload='metadata';var pr2=v.play();if(pr2&&pr2.catch)pr2.catch(function(){})}}
        else if(!on&&!v.paused){try{v.pause()}catch(e){}}
      }
      syncVidPlay(v);
    });
  }
  $$('.plate video').forEach(function(v){layStill(v);v.classList.add('clip-wait');if(isFilmVid(v)){v.muted=true;v.setAttribute('muted','');if((v.closest&&v.closest('#weird-kid'))||v.getAttribute('data-silent')==='1')lockSilent(v)}else{v.hidden=true;if((v.closest&&v.closest('#weird-kid'))||v.getAttribute('data-silent')==='1')lockSilent(v)}});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(){tick()},{threshold:[0,.1,.25,.5,.75]});
    $$('.plate').forEach(function(p){io.observe(p)});
  }
  addEventListener('scroll',function(){if(!tick._t){tick._t=1;requestAnimationFrame(function(){tick._t=0;tick()})}},{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden)$$('.plate video').forEach(function(v){try{v.pause()}catch(e){}});else tick()});
  GJ12.autoplay=tick;
  tick();
}

function goSky(){
  if(GJ12.litEsc&&CUR&&CUR.id==='lost-in-time')GJ12.litEsc();
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
  function closeTuneFirst(){if(window.GJ12&&GJ12.tuneClose){GJ12.tuneClose();return true}var t=$('#tune');if(t){var x=t.querySelector('.tune-x,.tune-done');if(x)x.click();else t.remove();return true}return false}
  el.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(closeTuneFirst())return;goSky()});
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(closeTuneFirst()){e.preventDefault();e.stopImmediatePropagation();return}
    if(overlayOn())return;
    e.preventDefault();
    goSky();
  },true);
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

;(function(){function go(){var a=document.querySelector('#room a.st[data-k="owtd"]'),im=a&&a.querySelector('img.orb');if(!im||a.querySelector('video.orbv'))return;if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;var v=document.createElement('video');v.className='orbv';v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.preload='auto';v.addEventListener('playing',function(){var t0=0;function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/900);v.style.setProperty('--vf',k.toFixed(3));if(k<1)requestAnimationFrame(f)}requestAnimationFrame(f)},{once:true});v.src='media/orbs/owtd-loop.mp4?v=2';im.parentNode.insertBefore(v,im.nextSibling);var p=v.play();if(p&&p.catch)p.catch(function(){})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go()})();
