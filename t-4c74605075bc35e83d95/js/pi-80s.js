/* 80s mode: written fresh. Hidden in the red pad: slide down past dim, or hold still on the centre notch for ~450 ms, and a small 80s rocker appears in the pad.
   Also a Tune option (on/off plus flavour). Chrome only: it adds classes to <html> and styles panels and text; it never touches photos, video, layout or navigation.
   Saved in localStorage 'gj.cks.e80' = {found,on,fl}. Typing 8 then 8 within ~800 ms (ignored in an input, textarea or contenteditable) toggles it and marks it found. Red mode wins: every rule is off while html.red is set. */
(function(){
var K='gj.cks.e80',FL=['terminal','neon','mac'],NAMES={terminal:'terminal',neon:'neon',mac:'1-bit Mac'},de=document.documentElement,st={found:0,on:0,fl:'terminal'},holdT=0,holdKey='';
try{var o=JSON.parse(localStorage.getItem(K)||'null');if(o&&typeof o==='object'){st.found=o.found?1:0;st.on=o.on?1:0;if(FL.indexOf(o.fl)>-1)st.fl=o.fl}}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify({found:st.found,on:st.on,fl:st.fl}))}catch(e){}}
function paintHtml(){
  de.classList.toggle('e80-on',!!st.on);de.classList.toggle('e80-found',!!st.found);
  FL.forEach(function(f){de.classList.toggle('e80-'+f,!!st.on&&st.fl===f)});
  de.classList.toggle('eighties',!!st.on&&st.fl==='neon'&&!de.classList.contains('red'));
  paintUI()}
function paintUI(){
  var s=document.querySelector('#redpad .rp-80');if(s){s.setAttribute('aria-checked',st.on?'true':'false');s.classList.toggle('on',!!st.on)}
  [].forEach.call(document.querySelectorAll('[data-e80]'),function(b){var v=b.getAttribute('data-e80');b.classList.toggle('on',v==='on'?!!st.on:v==='off'?!st.on:(v===st.fl))})}
function set(o){if(o.on!=null)st.on=o.on?1:0;if(o.fl&&FL.indexOf(o.fl)>-1)st.fl=o.fl;if(st.on)st.found=1;save();paintHtml()}
function find(){if(st.found)return;st.found=1;save();paintHtml();var s=document.querySelector('#redpad .rp-80');if(s){s.classList.add('is-new');setTimeout(function(){s.classList.remove('is-new')},900)}}
/* called from the red pad while a finger or pointer is dragging it: raw = unsnapped row (0..3 are the tone stops), r = row, l = lightness; null = drag ended */
function pad(raw,r,l){
  if(raw==null){clearTimeout(holdT);holdKey='';return}
  if(raw>3.7){clearTimeout(holdT);holdKey='';find();return}
  var k=(r===1||r===2)&&Math.abs(l-.7)<=.02?r+':'+l:'';
  if(k===holdKey)return;clearTimeout(holdT);holdKey=k;
  if(k)holdT=setTimeout(function(){holdKey='';find()},450)}
var api={find:find,found:function(){return st.found},get:function(){return {found:st.found,on:st.on,fl:st.fl}},set:set,pad:pad,flavours:FL};
(function exp(){if(window.GJ12){GJ12.e80=api}else setTimeout(exp,80)})();
function mountSwitch(){
  var p=document.getElementById('redpad');if(!p||p.querySelector('.rp-80'))return;
  var b=document.createElement('button');b.type='button';b.className='rp-80';b.setAttribute('role','switch');b.setAttribute('aria-label','80s');b.innerHTML='<b>80s</b><span class="rk"><i></i></span>';
  ['pointerdown','pointerup','touchstart'].forEach(function(t){b.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
  b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();set({on:!st.on})});
  p.appendChild(b);paintUI()}
function mountTune(d){
  [].forEach.call(d.querySelectorAll('[data-rl_vignette]'),function(x){
    var row=x.closest('.abc');if(!row||(row.nextSibling&&row.nextSibling.classList&&row.nextSibling.classList.contains('e80-rows')))return;
    var w=document.createElement('div');w.className='e80-rows';
    w.innerHTML='<div class="abc"><span>80s</span><button type="button" data-e80="off">off</button><button type="button" data-e80="on">on</button></div><div class="abc"><span>80s flavour</span>'+FL.map(function(f){return '<button type="button" data-e80="'+f+'">'+NAMES[f]+'</button>'}).join('')+'</div>';
    w.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-e80]');if(!b)return;e.preventDefault();e.stopPropagation();var v=b.getAttribute('data-e80');if(v==='on'||v==='off')set({on:v==='on'});else set({fl:v,on:1})});
    row.parentNode.insertBefore(w,row.nextSibling)});
  paintUI()}
function scan(){mountSwitch();var t=document.getElementById('tune');if(t)mountTune(t)}
new MutationObserver(function(){scan();var want=!!st.on&&st.fl==='neon'&&!de.classList.contains('red');if(de.classList.contains('eighties')!==want)de.classList.toggle('eighties',want)}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
paintHtml();scan();
addEventListener('storage',function(e){if(e.key===K){try{var o=JSON.parse(e.newValue||'null')||{};st.found=o.found?1:0;st.on=o.on?1:0;if(FL.indexOf(o.fl)>-1)st.fl=o.fl;paintHtml()}catch(x){}}});
(function(){var t8=0;
  function inField(el){if(!el||el===document||el===de)return false;var tag=(el.tagName||'').toLowerCase();return tag==='input'||tag==='textarea'||tag==='select'||!!el.isContentEditable}
  addEventListener('keydown',function(e){
    if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
    if(inField(e.target)||inField(document.activeElement)){t8=0;return}
    if(e.key!=='8'){t8=0;return}
    var t=performance.now();
    if(t8&&t-t8<800){t8=0;st.found=1;set({on:!st.on});return}
    t8=t;
  },true)})();
})();
