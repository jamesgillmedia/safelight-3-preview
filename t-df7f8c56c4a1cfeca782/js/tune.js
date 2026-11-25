/* Tucked tuners and red mode. Photographs tint only in full red. */
(function(){
  var KEY='cks-work-examples-lab-v2';
  var state={photo:100, space:100, type:100, motion:100, theme:'night'};
  function load(){
    try{
      var s=JSON.parse(localStorage.getItem(KEY)||'{}');
      ['photo','space','type','motion'].forEach(function(k){ if(isFinite(+s[k])) state[k]=+s[k] });
      if(s.theme==='red'||s.theme==='full'||s.theme==='night') state.theme=s.theme;
    }catch(e){}
  }
  function save(){ try{localStorage.setItem(KEY, JSON.stringify(state))}catch(e){} }
  function apply(){
    var r=document.documentElement;
    r.setAttribute('data-theme', state.theme);
    r.setAttribute('data-motion', String(Math.round(state.motion)));
    r.style.setProperty('--photo', (state.photo/100).toFixed(3));
    r.style.setProperty('--space', (state.space/100).toFixed(3));
    r.style.setProperty('--type', (state.type/100).toFixed(3));
    r.style.setProperty('--motion', (state.motion/100).toFixed(3));
    var m=document.querySelector('meta[name=theme-color]');
    if(m) m.setAttribute('content', state.theme==='night'?'#04070b':'#080203');
  }
  function label(n){ return n<=0?'still':(n<=35?'soft':(n>=95?'full':String(Math.round(n)))) }
  function render(){
    if(!document.getElementById('tPhoto')) return;
    document.getElementById('tPhoto').value=state.photo;
    document.getElementById('tSpace').value=state.space;
    document.getElementById('tType').value=state.type;
    document.getElementById('tMotion').value=state.motion;
    document.getElementById('tMotionNote').textContent=label(state.motion);
    Array.prototype.forEach.call(document.querySelectorAll('#tuneTheme [data-theme]'), function(b){
      b.classList.toggle('on', b.getAttribute('data-theme')===state.theme);
    });
  }
  load(); apply();
  function mount(){
    render();
    var panel=document.getElementById('tunePanel');
    var open=document.getElementById('tuneOpen');
    open.addEventListener('click', function(){
      var show=panel.hidden;
      panel.hidden=!show;
      open.classList.toggle('on', show);
      open.setAttribute('aria-expanded', show?'true':'false');
    });
    document.getElementById('tPhoto').addEventListener('input', function(e){ state.photo=+e.target.value; save(); apply(); });
    document.getElementById('tSpace').addEventListener('input', function(e){ state.space=+e.target.value; save(); apply(); });
    document.getElementById('tType').addEventListener('input', function(e){ state.type=+e.target.value; save(); apply(); });
    document.getElementById('tMotion').addEventListener('input', function(e){ state.motion=+e.target.value; save(); apply(); render(); });
    document.getElementById('tuneTheme').addEventListener('click', function(e){
      var b=e.target.closest('[data-theme]');
      if(!b) return;
      state.theme=b.getAttribute('data-theme');
      save(); apply(); render();
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
