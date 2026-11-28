/* visitor tune and reader mode. Everything a visitor sets stays in this browser (localStorage); nothing is sent anywhere.
   Gill's full Tune stays behind ?tune and the T key. */
(function(){
var de=document.documentElement,PI=window.GJPI||{},G=window.GJ12||{},$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var VK='gj.pi.visitor',V={};try{V=JSON.parse(localStorage.getItem(VK)||'{}')||{}}catch(e){V={}}
function vsave(){try{localStorage.setItem(VK,JSON.stringify(V))}catch(e){}}
var OSR=false;try{OSR=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
function calm(){return V.motion?V.motion==='calm':OSR}
function applyMotion(){var c=calm();de.classList.toggle('vt-calm',c);PI.reduce=c||OSR}
applyMotion();
function red(){return de.classList.contains('red')}
function snd(){return PI.e?PI.e('sound')>0:true}
function setSnd(on){if(PI.E){PI.E.sound=on?1:0;if(PI.save)PI.save();if(PI.level)PI.level()}
  if(!on)$$('audio').forEach(function(a){if(!a.paused)a.pause()})}
function rl(){return G.val?+G.val('redlight'):1}
var GLYPH='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M4.5 8.2c3.2-1.1 6.1 1.1 9.3 0s4.4-.6 5.7 0" opacity=".9"/><path d="M4.5 15.8c2.2.7 4-.8 6.6 0s5.6.9 8.4-.2" opacity=".65"/></g><circle cx="14.2" cy="8" r="1.5" fill="currentColor"/><circle cx="8.6" cy="15.6" r="1.5" fill="currentColor" opacity=".8"/></svg>';
/* ---------- the glyph and the small panel ---------- */
var top=$('#top'),btn=document.createElement('button');btn.type='button';btn.id='vtbtn';btn.setAttribute('aria-label','tune, for visitors');btn.setAttribute('aria-expanded','false');btn.innerHTML=GLYPH;
if(PI.placeBtn)PI.placeBtn(btn,'#lightbtn');else if(top)top.appendChild(btn);
var P=document.createElement('div');P.id='vtune';P.setAttribute('role','dialog');P.setAttribute('aria-label','tune');P.hidden=true;document.body.appendChild(P);
['pointerdown','pointermove','pointerup','touchstart','touchmove','wheel','click','keydown'].forEach(function(t){P.addEventListener(t,function(ev){ev.stopPropagation()},{passive:true})});
function seg(k,opts,cur){return '<span class="vt-seg" role="group">'+opts.map(function(o){var on=o[0]===cur;return '<button type="button" data-v="'+k+'" data-o="'+o[0]+'" aria-pressed="'+on+'"'+(on?' class="on"':'')+'>'+o[1]+'</button>'}).join('')+'</span>'}
function paint(){var am=PI.arrMode?PI.arrMode():(G.orderMode?G.orderMode():'strongest');
  P.innerHTML='<p class="vt-h"><b lang="cr">ᑕᐣᓯ</b> tune</p>'+
  '<div class="vt-r"><span>red mode</span>'+seg('red',[['1','on'],['0','off']],red()?'1':'0')+'</div>'+
  '<label class="vt-r vt-sl'+(red()?'':' vt-off')+'"><span>brightness</span><input type="range" min=".4" max="1" step=".02" value="'+rl()+'" data-v="redlight" aria-label="red mode brightness"></label>'+
  '<div class="vt-r"><span>sound</span>'+seg('snd',[['1','on'],['0','off']],snd()?'1':'0')+'</div>'+
  '<div class="vt-r"><span>motion</span>'+seg('motion',[['calm','calm'],['full','full']],calm()?'calm':'full')+'</div>'+
  '<div class="vt-r vt-arr"><span>arrange</span><span class="vt-seg vt-wrap" role="group">'+(PI.ARR||[['strongest','selected']]).map(function(a){var on=a[0]===am;return '<button type="button" data-v="arr" data-o="'+a[0]+'" aria-pressed="'+on+'"'+(on?' class="on"':'')+'>'+a[1]+'</button>'}).join('')+'</span></div>'+
  '<div class="vt-r"><span>reader mode</span>'+seg('read',[['1','on'],['0','off']],de.classList.contains('reading')?'1':'0')+'</div>'+
  '<p class="vt-n">kept in this browser only</p>'}
function open(o){if(o==null)o=P.hidden;if(o){paint();P.hidden=false;btn.classList.add('on');btn.setAttribute('aria-expanded','true');var f=P.querySelector('button.on')||P.querySelector('button');if(f)f.focus({preventScroll:true})}else{P.hidden=true;btn.classList.remove('on');btn.setAttribute('aria-expanded','false')}}
btn.addEventListener('click',function(e){e.stopPropagation();open()});
document.addEventListener('pointerdown',function(e){if(!P.hidden&&!P.contains(e.target)&&!e.target.closest('#vtbtn,.rd-vt'))open(false)},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!P.hidden){open(false);e.stopImmediatePropagation();btn.focus({preventScroll:true})}},true);
P.addEventListener('click',function(e){var b=e.target.closest('button[data-v]');if(!b)return;var k=b.getAttribute('data-v'),o=b.getAttribute('data-o');
  if(k==='red'){if(G.setRed)G.setRed(o==='1');else de.classList.toggle('red',o==='1')}
  else if(k==='snd')setSnd(o==='1');
  else if(k==='motion'){V.motion=o;vsave();applyMotion()}
  else if(k==='arr'){if(PI.arrange)PI.arrange(o);else if(G.setOrder)G.setOrder(o)}
  else if(k==='read'){reader(o==='1')}
  setTimeout(paint,k==='arr'?1200:0);setTimeout(function(){var n=P.querySelector('button[data-v="'+k+'"][data-o="'+o+'"]');if(n)n.focus({preventScroll:true})},k==='arr'?1210:10)});
P.addEventListener('input',function(e){var r=e.target;if(r.getAttribute('data-v')!=='redlight')return;if(G.setTune)G.setTune('redlight',+r.value)});
/* ---------- reader mode: everything on one quiet page, one column ---------- */
var R=null,M=null,saved={y:0,ry:0,focus:null},io=null;
function loadM(cb){if(M)return cb();fetch('js/pi-media.json').then(function(r){return r.json()}).then(function(d){M=d;cb()}).catch(function(){M={};cb()})}
function txtClone(sec){var w=document.createElement('div');w.className='rd-txt';
  [].forEach.call(sec.children,function(ch){if(ch.matches('.stage,.strip,.grail,.dial,video,audio,canvas,iframe,.player'))return;var c=ch.cloneNode(true);w.appendChild(c)});
  $$('small,button,[role=tablist],video,audio,canvas,iframe,.player,.vrail,.wn,.strip,.stage,.grail,[hidden],.bio-card:not(.on),script,style',w).forEach(function(n){n.remove()});
  $$('p.cap,p.kick',w).forEach(function(p){if(!p.textContent.trim())p.remove()});
  $$('[id]',w).forEach(function(n){n.removeAttribute('id')});$$('[aria-live]',w).forEach(function(n){n.removeAttribute('aria-live')});
  $$('[style]',w).forEach(function(n){n.removeAttribute('style')});
  $$('h1,h2',w).forEach(function(h){var n=document.createElement(h.tagName==='H1'?'h2':h.tagName);n.innerHTML=h.innerHTML;h.replaceWith(n)});
  return w}
function figs(sec){var id=sec.id,m=M[id],out=[],seen={},last='';
  function meta(f){var el=sec.querySelector('[data-big="'+f+'"]');return el?{alt:el.getAttribute('data-alt')||'',cap:el.getAttribute('data-cap')||''}:{alt:'',cap:''}}
  var items=m&&m.items&&m.items.length?m.items:[];
  if(!items.length){var im=sec.querySelector('.stage img.main');if(im&&im.getAttribute('src'))items=[{f:im.getAttribute('src'),alt:im.getAttribute('alt')||''}]}
  items.forEach(function(it){if(seen[it.f])return;seen[it.f]=1;var mt=meta(it.f),cap=mt.cap&&mt.cap!==last?mt.cap:'';if(mt.cap)last=mt.cap;
    var fg=document.createElement('figure');fg.className='rd-fig';var box=document.createElement('div');box.className='rd-im';if(it.fw&&it.fh)box.style.aspectRatio=it.fw+' / '+it.fh;
    var img=document.createElement('img');img.alt=it.alt!=null?it.alt:mt.alt;img.decoding='async';img.className='rd-lo';img.setAttribute('data-f',it.f);if(it.w)img.setAttribute('data-w',it.w);img.setAttribute('data-ww',it.ww||0);img.setAttribute('data-fw',it.fw||0);
    if(it.t)img.src=it.t;box.appendChild(img);fg.appendChild(box);
    if(cap){var fc=document.createElement('figcaption');fc.textContent=cap;fg.appendChild(fc)}out.push(fg)});
  return out}
function need(img){var r=img.getBoundingClientRect();return Math.ceil((r.width||img.parentNode.clientWidth||600)*(window.devicePixelRatio||1))}
function swap(img,u,cb){var n=new Image();n.decoding='async';n.onload=function(){var go=function(){img.src=u;img.classList.remove('rd-lo');img.setAttribute('data-at',u);cb&&cb()};if(n.decode)n.decode().then(go,go);else go()};n.onerror=function(){cb&&cb()};n.src=u}
function sharpen(img){if(img._rd)return;img._rd=1;var w=img.getAttribute('data-w'),ww=+img.getAttribute('data-ww')||0,f=img.getAttribute('data-f');
  function full(){if(img.getAttribute('data-at')!==f&&(!w||need(img)>ww))swap(img,f)}
  if(w)swap(img,w,full);else swap(img,f)}
function build(){R=document.createElement('div');R.id='reader';R.hidden=true;R.setAttribute('role','region');R.setAttribute('aria-label','reader mode');
  var bar='<div class="rd-bar"><button type="button" class="rd-back">‹ back to the sky</button><button type="button" class="rd-vt" aria-label="tune, for visitors">'+GLYPH+'</button></div>';
  var sky=$('#sky'),h1=sky&&sky.querySelector('h1'),sub=sky&&sky.querySelector('.sub');
  var head='<header class="rd-head"><p class="rd-mark" lang="cr" aria-hidden="true">ᑕᐣᓯ</p></header>';
  R.innerHTML=bar+'<article class="rd-page">'+head+'</article>';
  var pg=R.querySelector('.rd-page'),hd=R.querySelector('.rd-head');
  if(h1){var a=document.createElement('h1');a.textContent=h1.textContent;hd.appendChild(a)}
  if(sub){var b=document.createElement('p');b.className='rd-sub';b.textContent=sub.textContent;hd.appendChild(b)}
  var ln=document.createElement('p');ln.className='rd-line';ln.innerHTML='<span class="gjl"></span>';hd.appendChild(ln);
  $$('main section.plate[id]').forEach(function(sec){var s=document.createElement('section');s.className='rd-work';s.setAttribute('data-for',sec.id);
    var t=txtClone(sec);s.appendChild(t);var h=t.querySelector('h2');if(h){h.id='rd-'+sec.id;s.setAttribute('aria-labelledby',h.id)}
    figs(sec).forEach(function(f){s.appendChild(f)});pg.appendChild(s)});
  document.body.appendChild(R);
  if(window.GJLine)GJLine.paint();
  io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){sharpen(e.target);io.unobserve(e.target)}})},{root:R,rootMargin:'900px 0px'});
  $$('.rd-im img',R).forEach(function(i){io.observe(i)});
  R.querySelector('.rd-back').addEventListener('click',function(){reader(false)});
  R.querySelector('.rd-vt').addEventListener('click',function(e){e.stopPropagation();open()});
  /* the page underneath never sees a gesture made while reading */
  ['wheel','touchstart','touchmove','touchend','pointerdown','pointermove','pointerup','click','dblclick','keydown','keyup','gesturestart'].forEach(function(t){R.addEventListener(t,function(ev){ev.stopPropagation()},{passive:true})});
  window.addEventListener('keydown',function(ev){if(de.classList.contains('reading')&&ev.key==='Escape'&&P.hidden&&!(ev.target&&ev.target.hasAttribute&&ev.target.hasAttribute('data-editing'))){ev.preventDefault();ev.stopImmediatePropagation();reader(false)}},true);
  var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){$$('img[data-at]',R).forEach(function(i){var f=i.getAttribute('data-f');if(i.getAttribute('data-at')!==f&&need(i)>(+i.getAttribute('data-ww')||0))swap(i,f)})},250)})}
function reader(on){if(on==null)on=!de.classList.contains('reading');
  if(on){if(de.classList.contains('reading'))return;loadM(function(){if(!R)build();saved.y=window.scrollY;saved.focus=document.activeElement;
      de.classList.add('reading');R.hidden=false;R.scrollTop=saved.ry||0;if(!P.hidden)paint();var b=R.querySelector('.rd-back');if(b)b.focus({preventScroll:true});V.read=1;vsave()})}
  else{if(!R||!de.classList.contains('reading'))return;saved.ry=R.scrollTop;de.classList.remove('reading');R.hidden=true;window.scrollTo(0,saved.y);if(saved.focus&&saved.focus.focus)try{saved.focus.focus({preventScroll:true})}catch(e){}V.read=0;vsave();if(!P.hidden)paint()}}
PI.reader=reader;G.reader=reader;
/* the tiny link under the sky */
var sky=$('#sky .archline');if(sky){var l=document.createElement('p');l.className='rdlink';l.innerHTML='<button type="button">reader mode</button>';sky.parentNode.insertBefore(l,sky.nextSibling);l.querySelector('button').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();reader(true)})}
if(/[?&]read(=|&|$)/.test(location.search))setTimeout(function(){reader(true)},0);
})();
