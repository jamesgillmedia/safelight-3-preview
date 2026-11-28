/* hearts and notes (light study > library). Off by default.
   A visitor can heart a piece and jot a short note. Saved only in this browser (localStorage); no account, nothing is sent anywhere. */
(function(){
var de=document.documentElement,PI=window.GJPI;if(!PI)return;
var K='gj.pi.hearts',H={};try{H=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){H={}}
function save(){try{localStorage.setItem(K,JSON.stringify(H))}catch(e){}}
function on(){return PI.e('hearts')>0}
var SVG='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 20.2s-7.2-4.4-7.2-9.7A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.2 2.5c0 5.3-7.2 9.7-7.2 9.7z" fill="var(--hf,none)" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
function title(id){var p=document.getElementById(id),h=p&&p.querySelector('.txt h2');return h?h.textContent:id}
function paint(){
  [].forEach.call(document.querySelectorAll('.piheart'),function(b){var id=b.getAttribute('data-id'),x=!!H[id];b.classList.toggle('on',x);b.setAttribute('aria-pressed',String(x));var w=b.parentNode.querySelector('.pinote');if(w){w.hidden=!x;var ta=w.querySelector('textarea');if(ta&&document.activeElement!==ta)ta.value=(H[id]&&H[id].n)||''}});
  var n=Object.keys(H).length,tb=document.getElementById('hearttop');if(tb){tb.hidden=!on()||!n;var c=tb.querySelector('i');if(c)c.textContent=n}}
function mount(){if(mount.done)return;mount.done=1;
  [].forEach.call(document.querySelectorAll('section.plate[id]'),function(p){var id=p.id,t=p.querySelector('.txt');if(!t||id==='cv')return;
    var w=document.createElement('div');w.className='pihw';
    w.innerHTML='<button type="button" class="piheart" data-id="'+id+'" aria-label="heart this piece" aria-pressed="false">'+SVG+'</button><div class="pinote" hidden><textarea maxlength="280" rows="2" placeholder="a note for yourself" aria-label="your note on this piece, kept on this device"></textarea><small>kept only on this device</small></div>';
    var h2=t.querySelector('h2');if(h2&&h2.nextSibling)t.insertBefore(w,h2.nextSibling);else t.appendChild(w)});
  var top=document.getElementById('top'),lb=document.getElementById('lightbtn');
  if(top){var b=document.createElement('button');b.type='button';b.id='hearttop';b.hidden=true;b.setAttribute('aria-label','your hearts');b.innerHTML=SVG+'<i></i>';if(lb&&lb.parentNode===top)top.insertBefore(b,lb);else top.appendChild(b);if(PI.placeBtn)PI.placeBtn(b,'#lightbtn');
    b.addEventListener('click',function(e){e.stopPropagation();list(true)})}
  var L=document.createElement('div');L.id='pihearts';L.hidden=true;L.setAttribute('role','dialog');L.setAttribute('aria-label','your hearts');document.body.appendChild(L);
  ['pointerdown','click','wheel','touchstart','keydown'].forEach(function(t){L.addEventListener(t,function(ev){ev.stopPropagation()},{passive:true})});
  L.addEventListener('click',function(e){var a=e.target.closest('[data-go]');if(a){list(false);PI.go(a.getAttribute('data-go'));return}if(e.target.closest('.pix'))list(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!L.hidden){list(false);e.stopPropagation()}},true);
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.piheart');if(!b)return;e.preventDefault();e.stopPropagation();var id=b.getAttribute('data-id');if(H[id])delete H[id];else H[id]={t:Date.now(),n:''};save();paint();if(H[id]){var ta=b.parentNode.querySelector('textarea');if(ta&&matchMedia('(hover:hover)').matches)ta.focus({preventScroll:true})}},true);
  document.addEventListener('input',function(e){var ta=e.target;if(!ta.closest||!ta.closest('.pinote'))return;var id=ta.closest('.pihw').querySelector('.piheart').getAttribute('data-id');if(!H[id])H[id]={t:Date.now(),n:''};H[id].n=ta.value.slice(0,280);save()},true);
  ['keydown','keyup','keypress'].forEach(function(t){document.addEventListener(t,function(e){if(e.target&&e.target.closest&&e.target.closest('.pinote'))e.stopPropagation()},true)})}
function list(v){var L=document.getElementById('pihearts');if(!L)return;if(v){var ids=Object.keys(H).sort(function(a,b){return H[b].t-H[a].t});
  L.innerHTML='<div class="pih"><span>your hearts</span><button type="button" class="pix" aria-label="close">×</button></div>'+(ids.length?ids.map(function(id){return '<button type="button" class="pihi" data-go="'+id+'"><b>'+title(id).replace(/</g,'&lt;')+'</b>'+(H[id].n?'<span>'+H[id].n.replace(/</g,'&lt;')+'</span>':'')+'</button>'}).join(''):'<p>nothing hearted yet</p>')+'<small>kept only on this device</small>'}L.hidden=!v}
function check(){var v=on();de.classList.toggle('pi-hearts',v);if(v){mount();paint()}else{var L=document.getElementById('pihearts');if(L)L.hidden=true;var tb=document.getElementById('hearttop');if(tb)tb.hidden=true}}
PI.hearts={all:function(){return JSON.parse(JSON.stringify(H))}};
document.addEventListener('pi:env',function(e){if(e.detail&&e.detail.k==='hearts')check()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check);else check();
})();
