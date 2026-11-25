/* A/B/C options, keep/hide, tuners, and red mode. Prefs stay in this page's own keys. */
(function(){
  var KEY='cks-work-examples-lab';
  var OPTS={
    a:{id:'a', name:'Stars', why:"A is the default: it's the first version, with more photographs of each piece."},
    b:{id:'b', name:'Works', why:'B opens on the sheet of works, so a reviewer always knows where to tap.'},
    c:{id:'c', name:'Names', why:'C is a quiet list of names. One piece at a time, nothing else competing.'}
  };
  var DEFAULT='a';
  var state={opt:DEFAULT, hidden:[], photo:100, space:100, type:100, motion:100, theme:'night'};

  function load(){
    try{
      var raw=localStorage.getItem(KEY);
      if(!raw) return;
      var s=JSON.parse(raw);
      if(s.opt==='a'||s.opt==='b'||s.opt==='c') state.opt=s.opt;
      if(Array.isArray(s.hidden)) state.hidden=s.hidden.filter(function(k){return OPTS[k]});
      ['photo','space','type','motion'].forEach(function(k){
        var n=+s[k]; if(isFinite(n)) state[k]=n;
      });
      if(s.theme==='red'||s.theme==='full'||s.theme==='night') state.theme=s.theme;
    }catch(e){}
  }
  function save(){
    try{localStorage.setItem(KEY, JSON.stringify(state))}catch(e){}
  }
  function visible(){
    return ['a','b','c'].filter(function(k){return state.hidden.indexOf(k)<0});
  }
  function apply(){
    var root=document.documentElement;
    if(state.hidden.indexOf(state.opt)>=0){
      var vis=visible();
      if(vis.length) state.opt=vis[0];
    }
    root.setAttribute('data-opt', state.opt);
    root.setAttribute('data-theme', state.theme);
    root.setAttribute('data-motion', String(Math.round(state.motion)));
    root.style.setProperty('--photo', (state.photo/100).toFixed(3));
    root.style.setProperty('--space', (state.space/100).toFixed(3));
    root.style.setProperty('--type', (state.type/100).toFixed(3));
    root.style.setProperty('--motion', (state.motion/100).toFixed(3));
    var meta=document.querySelector('meta[name=theme-color]');
    if(meta) meta.setAttribute('content', state.theme==='night'?'#04070b':'#080203');
  }

  load();
  apply();

  function motionLabel(n){
    if(n<=0) return 'still';
    if(n<=35) return 'soft';
    if(n>=95) return 'full';
    return Math.round(n)+'';
  }

  function render(){
    var opts=document.getElementById('tuneOpts');
    var keep=document.getElementById('tuneKeep');
    var hid=document.getElementById('tuneHidden');
    var why=document.getElementById('tuneWhy');
    if(!opts) return;
    opts.innerHTML='';
    visible().forEach(function(k){
      var b=document.createElement('button');
      b.type='button';
      b.className='opt'+(k===state.opt?' on':'');
      b.setAttribute('aria-pressed', k===state.opt?'true':'false');
      b.innerHTML=k.toUpperCase()+'<span class="lab">'+OPTS[k].name+'</span>';
      b.addEventListener('click', function(){ setOpt(k) });
      opts.appendChild(b);
    });
    why.textContent=OPTS[DEFAULT].why+(state.opt===DEFAULT?'':' You are looking at '+state.opt.toUpperCase()+'.');
    keep.innerHTML='';
    ['a','b','c'].forEach(function(k){
      var card=document.createElement('div');
      card.className='keep-card';
      var hidden=state.hidden.indexOf(k)>=0;
      card.innerHTML='<span class="nm">'+k.toUpperCase()+' '+OPTS[k].name+'</span>';
      var kBtn=document.createElement('button');
      kBtn.type='button'; kBtn.textContent='keep';
      if(!hidden) kBtn.className='on';
      kBtn.addEventListener('click', function(){ setHidden(k, false) });
      var hBtn=document.createElement('button');
      hBtn.type='button'; hBtn.textContent='hide';
      if(hidden) hBtn.className='on';
      hBtn.addEventListener('click', function(){ setHidden(k, true) });
      card.appendChild(kBtn); card.appendChild(hBtn);
      keep.appendChild(card);
    });
    var hidden=state.hidden.slice();
    if(hidden.length){
      hid.hidden=false;
      hid.innerHTML='Hidden: '+hidden.map(function(k){return k.toUpperCase()}).join(', ')+' ';
      hidden.forEach(function(k){
        var b=document.createElement('button');
        b.type='button'; b.className='lab-btn'; b.textContent='show '+k.toUpperCase();
        b.addEventListener('click', function(){ setHidden(k, false) });
        hid.appendChild(b);
      });
    } else {
      hid.hidden=true; hid.innerHTML='';
    }
    document.getElementById('tPhoto').value=state.photo;
    document.getElementById('tSpace').value=state.space;
    document.getElementById('tType').value=state.type;
    document.getElementById('tMotion').value=state.motion;
    document.getElementById('tMotionNote').textContent=motionLabel(state.motion);
    Array.prototype.forEach.call(document.querySelectorAll('#tuneTheme [data-theme]'), function(b){
      b.classList.toggle('on', b.getAttribute('data-theme')===state.theme);
    });
  }

  function setOpt(k){
    if(!OPTS[k]) return;
    if(state.hidden.indexOf(k)>=0) setHidden(k, false);
    state.opt=k;
    save(); apply(); render();
    if(window.CKS && typeof window.CKS.applyOpt==='function') window.CKS.applyOpt(k);
  }
  function setHidden(k, hide){
    var i=state.hidden.indexOf(k);
    if(hide && i<0){
      var vis=visible().filter(function(x){return x!==k});
      if(!vis.length) return;
      state.hidden.push(k);
      if(state.opt===k) state.opt=vis[0];
    } else if(!hide && i>=0){
      state.hidden.splice(i,1);
    }
    save(); apply(); render();
    if(window.CKS && typeof window.CKS.applyOpt==='function') window.CKS.applyOpt(state.opt);
  }
  function setTune(key, val){
    state[key]=val;
    save(); apply();
    if(key==='motion') document.getElementById('tMotionNote').textContent=motionLabel(val);
  }
  function setTheme(t){
    state.theme=t;
    save(); apply(); render();
  }

  function mount(){
    render();
    var panel=document.getElementById('tunePanel');
    var open=document.getElementById('tuneOpen');
    open.addEventListener('click', function(){
      var on=panel.hidden;
      panel.hidden=!on;
      open.setAttribute('aria-expanded', on?'true':'false');
      open.classList.toggle('on', on);
    });
    document.getElementById('tPhoto').addEventListener('input', function(e){ setTune('photo', +e.target.value) });
    document.getElementById('tSpace').addEventListener('input', function(e){ setTune('space', +e.target.value) });
    document.getElementById('tType').addEventListener('input', function(e){ setTune('type', +e.target.value) });
    document.getElementById('tMotion').addEventListener('input', function(e){ setTune('motion', +e.target.value) });
    document.getElementById('tuneTheme').addEventListener('click', function(e){
      var b=e.target.closest('[data-theme]');
      if(b) setTheme(b.getAttribute('data-theme'));
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
