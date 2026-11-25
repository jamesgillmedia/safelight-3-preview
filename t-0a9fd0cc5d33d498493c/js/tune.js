/* Visible tune stays simple. Deep Tune is a two-finger hold. Photographs tint only in full red. */
(function(){
  var KEY='cks-work-examples-lab-v2';
  var TEXT_KEY='cks-work-examples-text';
  var state={photo:100, space:100, type:100, motion:100, theme:'night', dimmer:100, density:3};
  var names={};
  function load(){
    try{
      var s=JSON.parse(localStorage.getItem(KEY)||'{}');
      ['photo','space','type','motion','dimmer','density'].forEach(function(k){ if(isFinite(+s[k])) state[k]=+s[k] });
      if(s.theme==='red'||s.theme==='full'||s.theme==='night') state.theme=s.theme;
    }catch(e){}
    try{ names=JSON.parse(localStorage.getItem(TEXT_KEY)||'{}')||{} }catch(e){ names={} }
  }
  function save(){ try{localStorage.setItem(KEY, JSON.stringify(state))}catch(e){} }
  function saveNames(){ try{localStorage.setItem(TEXT_KEY, JSON.stringify(names))}catch(e){} }
  function densLabel(n){ return n<=1?'one':(n===2?'2-up':(n===3?'mid':(n===4?'4-up':(n===5?'dense':'sheet')))) }
  function motionLabel(n){ return n<=0?'still':(n<=35?'soft':(n>=95?'full':String(Math.round(n)))) }
  function apply(){
    var r=document.documentElement;
    r.setAttribute('data-theme', state.theme);
    r.setAttribute('data-motion', String(Math.round(state.motion)));
    r.setAttribute('data-density', String(Math.round(state.density)));
    r.style.setProperty('--photo', (state.photo/100).toFixed(3));
    r.style.setProperty('--space', (state.space/100).toFixed(3));
    r.style.setProperty('--type', (state.type/100).toFixed(3));
    r.style.setProperty('--motion', (state.motion/100).toFixed(3));
    r.style.setProperty('--cols', String(Math.round(state.density)));
    r.style.setProperty('--dimmer', (state.dimmer/100).toFixed(3));
    var m=document.querySelector('meta[name=theme-color]');
    if(m) m.setAttribute('content', state.theme==='night'?'#04070b':'#060304');
    if(window.CKS_LISTEN && window.CKS_LISTEN.setDimmer) window.CKS_LISTEN.setDimmer(state.dimmer/100);
  }
  function render(){
    function set(id, val){ var n=document.getElementById(id); if(n) n.value=val; }
    function note(id, txt){ var n=document.getElementById(id); if(n) n.textContent=txt; }
    set('tPhoto', state.photo);
    set('tSpace', state.space);
    set('tType', state.type);
    set('tMotion', state.motion);
    set('tMotionDeep', state.motion);
    set('tDimmer', state.dimmer);
    set('tDensity', state.density);
    note('tMotionNote', motionLabel(state.motion));
    note('tMotionDeepNote', motionLabel(state.motion));
    note('tDimmerNote', state.dimmer>=95?'full':String(Math.round(state.dimmer)));
    note('tDensityNote', densLabel(state.density));
    Array.prototype.forEach.call(document.querySelectorAll('#tuneTheme [data-theme], #deepTheme [data-theme]'), function(b){
      b.classList.toggle('on', b.getAttribute('data-theme')===state.theme);
    });
  }
  function nameOf(w){
    if(!w) return null;
    var n=names[w.id];
    if(!n) return null;
    return {title:n.title!=null?n.title:w.title, about:n.about!=null?n.about:w.about, year:n.year!=null?n.year:w.year};
  }
  function fillNames(){
    var box=document.getElementById('nameFields');
    if(!box) return;
    box.innerHTML='';
    var works=(window.CKS_WORKS)||[];
    if(!works.length && window.CKS_LIST) works=window.CKS_LIST();
    works.forEach(function(w){
      if(w.kind==='studio') return;
      var ed=nameOf(w)||{};
      var lab=document.createElement('label');
      lab.textContent=w.id;
      var inp=document.createElement('input');
      inp.type='text';
      inp.value=ed.title||w.title||'';
      inp.setAttribute('data-name', w.id);
      inp.addEventListener('input', function(){
        names[w.id]=names[w.id]||{};
        names[w.id].title=inp.value;
        saveNames();
        var el=document.getElementById('workName');
        if(el && location.hash.indexOf(w.id)!==-1) el.textContent=inp.value;
      });
      var ta=document.createElement('textarea');
      ta.rows=2;
      ta.value=ed.about!=null?ed.about:(w.about||'');
      ta.setAttribute('data-about', w.id);
      ta.addEventListener('input', function(){
        names[w.id]=names[w.id]||{};
        names[w.id].about=ta.value;
        saveNames();
        var el=document.getElementById('workAbout');
        if(el && location.hash.indexOf(w.id)!==-1) el.textContent=ta.value;
      });
      box.appendChild(lab);
      box.appendChild(inp);
      box.appendChild(ta);
    });
  }
  function exportNames(){
    var payload={works:names, exported:new Date().toISOString()};
    var text=JSON.stringify(payload, null, 2);
    function done(){ var b=document.getElementById('textExport'); if(b){ b.textContent='Copied'; setTimeout(function(){ b.textContent='Copy names as text'; }, 1600); } }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(function(){ window.prompt('Copy this text', text); });
    } else {
      window.prompt('Copy this text', text);
    }
  }

  var deep=null, hold=null, deepTimer=null, holdTimer=null;
  var pointers={};
  var pinchStart=null, pinchLevel=null, deepArmed=false;

  function openDeep(){
    if(!deep) return;
    deep.hidden=false;
    fillNames();
    render();
  }
  function closeDeep(){ if(deep) deep.hidden=true; }
  function closeHold(){ if(hold) hold.hidden=true; }

  var HOLD_COPY={
    dimmer:'Dimmer turns the room and the sound down together.',
    density:'Pinch out to see more, smaller tiles. Pinch in for fewer, larger ones, down to a single photograph.',
    colour:'Red is chrome only, like oz. Photographs stay true. Full red may tint photographs.',
    motion:'At still, clips hold on their first frame. Motion lets them play.',
    photo:'How large photographs sit on the page.',
    space:'Space between photographs and blocks.',
    type:'Size of titles and body text.',
    filter:'How open or closed the sound is.',
    spaceSound:'How much room is around the sound.',
    ambience:'A quiet bed under the track.',
    panel:'Two fingers held still opens Deep Tune. Reviewers do not need this.'
  };

  function openHold(kind, x, y){
    if(!hold) return;
    var k=kind==='space' && document.getElementById('litSpace') ? 'space' : kind;
    hold.hidden=false;
    hold.innerHTML='';
    var p=document.createElement('p');
    p.textContent=HOLD_COPY[k]||HOLD_COPY.panel;
    hold.appendChild(p);
    if(k==='colour'){
      var row=document.createElement('div');
      row.className='tune-theme-btns';
      ['night','red','full'].forEach(function(th){
        var b=document.createElement('button');
        b.type='button';
        b.setAttribute('data-theme', th);
        b.textContent=th==='full'?'full red':th;
        b.classList.toggle('on', state.theme===th);
        b.addEventListener('click', function(){ state.theme=th; save(); apply(); render(); openHold('colour'); });
        row.appendChild(b);
      });
      hold.appendChild(row);
    }
    if(k==='dimmer'||k==='density'||k==='motion'){
      var inp=document.createElement('input');
      inp.type='range';
      if(k==='density'){ inp.min=1; inp.max=6; inp.value=state.density; }
      else if(k==='dimmer'){ inp.min=8; inp.max=100; inp.value=state.dimmer; }
      else { inp.min=0; inp.max=100; inp.value=state.motion; }
      inp.addEventListener('input', function(){
        state[k]=+inp.value; save(); apply(); render();
      });
      hold.appendChild(inp);
    }
  }

  function clearPointers(){ pointers={}; pinchStart=null; deepArmed=false; clearTimeout(deepTimer); clearTimeout(holdTimer); }

  function distance(){
    var ids=Object.keys(pointers);
    if(ids.length<2) return 0;
    var a=pointers[ids[0]], b=pointers[ids[1]];
    return Math.hypot(a.x-b.x, a.y-b.y);
  }

  function onDown(e){
    pointers[e.pointerId]={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:Date.now(),target:e.target};
    var ids=Object.keys(pointers);
    if(ids.length===2){
      pinchStart=distance();
      pinchLevel=state.density;
      deepArmed=true;
      clearTimeout(deepTimer);
      deepTimer=setTimeout(function(){
        if(!deepArmed) return;
        var moved=0;
        Object.keys(pointers).forEach(function(id){
          var p=pointers[id]; if(!p) return;
          moved+=Math.hypot(p.x-p.sx, p.y-p.sy);
        });
        if(moved<28 && Math.abs(distance()-pinchStart)<20){
          openDeep();
          deepArmed=false;
        }
      }, 520);
    } else if(ids.length===1){
      var ctl=e.target.closest && e.target.closest('[data-tune]');
      if(ctl){
        var kind=ctl.getAttribute('data-tune');
        clearTimeout(holdTimer);
        holdTimer=setTimeout(function(){
          var p=pointers[e.pointerId];
          if(!p) return;
          if(Math.hypot(p.x-p.sx,p.y-p.sy)<14) openHold(kind, p.x, p.y);
        }, 500);
      }
    }
  }
  function onMove(e){
    var p=pointers[e.pointerId];
    if(!p) return;
    p.x=e.clientX; p.y=e.clientY;
    var ids=Object.keys(pointers);
    if(ids.length===2 && pinchStart){
      var d=distance();
      var delta=d-pinchStart;
      if(Math.abs(delta)>36){
        deepArmed=false;
        clearTimeout(deepTimer);
        // pinch in (smaller distance) goes deeper: fewer, bigger tiles
        var step=delta>0?1:-1;
        var next=Math.max(1, Math.min(6, (pinchLevel||state.density)+step));
        if(next!==state.density){
          state.density=next;
          pinchLevel=next;
          pinchStart=d;
          save(); apply(); render();
        }
      }
    }
  }
  function onUp(e){
    delete pointers[e.pointerId];
    if(Object.keys(pointers).length<2){ pinchStart=null; deepArmed=false; clearTimeout(deepTimer); }
    clearTimeout(holdTimer);
  }

  load(); apply();
  function mount(){
    render();
    deep=document.getElementById('deepTune');
    hold=document.getElementById('holdTune');
    var panel=document.getElementById('tunePanel');
    var open=document.getElementById('tuneOpen');
    if(open && panel){
      open.addEventListener('click', function(){
        var show=panel.hidden;
        panel.hidden=!show;
        open.classList.toggle('on', show);
        open.setAttribute('aria-expanded', show?'true':'false');
        closeHold();
      });
    }
    function bind(id, key, notes){
      var n=document.getElementById(id);
      if(!n) return;
      n.addEventListener('input', function(e){
        state[key]=+e.target.value;
        if(key==='motion'){ /* keep both sliders in sync via render */ }
        save(); apply(); render();
      });
    }
    bind('tPhoto','photo');
    bind('tSpace','space');
    bind('tType','type');
    bind('tMotion','motion');
    bind('tMotionDeep','motion');
    bind('tDimmer','dimmer');
    bind('tDensity','density');
    function themeClick(e){
      var b=e.target.closest('[data-theme]');
      if(!b) return;
      state.theme=b.getAttribute('data-theme');
      save(); apply(); render();
    }
    var tt=document.getElementById('tuneTheme');
    var dt=document.getElementById('deepTheme');
    if(tt) tt.addEventListener('click', themeClick);
    if(dt) dt.addEventListener('click', themeClick);
    var dc=document.getElementById('deepClose');
    if(dc) dc.addEventListener('click', closeDeep);
    var ex=document.getElementById('textExport');
    if(ex) ex.addEventListener('click', exportNames);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove, {passive:true});
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape'){ closeDeep(); closeHold(); }
    });
    document.addEventListener('click', function(e){
      if(hold && !hold.hidden && !hold.contains(e.target) && !(e.target.closest && e.target.closest('[data-tune]'))) closeHold();
    });
  }
  window.CKS_TUNE={
    nameOf:nameOf,
    names:function(){ return names },
    state:function(){ return state },
    setDensity:function(n){ state.density=Math.max(1,Math.min(6,+n||3)); save(); apply(); render(); },
    setDimmer:function(n){ state.dimmer=Math.max(8,Math.min(100,+n||100)); save(); apply(); render(); },
    apply:apply,
    render:render,
    fillNames:fillNames
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
