/* Lost in Time card. Dimmer moves picture and sound together. Public-safe Web Audio only. */
(function(){
  var audio=null, ctx=null, source=null, filter=null, delay=null, feedback=null, dry=null, wet=null, amb=null, ambGain=null, master=null, ready=false;
  var filterVal=70, spaceVal=20, ambVal=15, dim=1, open=false;

  function src(path){
    if(window.CKS_SRC) return window.CKS_SRC(path);
    var PUB=window.CKS_PUBLISH||null;
    if(!PUB) return path;
    if(path.indexOf('media/av/')===0) return PUB.av + path.slice(9);
    if(path.indexOf('media/thumbs/')===0) return PUB.thumbs + path.slice(13);
    return path;
  }

  function setup(){
    if(ready) return Promise.resolve();
    audio=new Audio();
    audio.preload='none';
    audio.src=src('media/av/AV2-lost-coffee-lost-in-time.wav');
    audio.loop=true;
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){ ready=true; return Promise.resolve(); }
    ctx=new AC();
    source=ctx.createMediaElementSource(audio);
    filter=ctx.createBiquadFilter();
    filter.type='lowpass';
    dry=ctx.createGain();
    wet=ctx.createGain();
    delay=ctx.createDelay(1.2);
    delay.delayTime.value=0.22;
    feedback=ctx.createGain();
    ambGain=ctx.createGain();
    master=ctx.createGain();
    source.connect(filter);
    filter.connect(dry);
    filter.connect(delay);
    delay.connect(wet);
    delay.connect(feedback);
    feedback.connect(delay);
    dry.connect(master);
    wet.connect(master);
    // quiet filtered noise as ambience
    var buf=ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
    var data=buf.getChannelData(0);
    for(var i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.25;
    amb=ctx.createBufferSource();
    amb.buffer=buf;
    amb.loop=true;
    var ambFilter=ctx.createBiquadFilter();
    ambFilter.type='lowpass';
    ambFilter.frequency.value=900;
    amb.connect(ambFilter);
    ambFilter.connect(ambGain);
    ambGain.connect(master);
    master.connect(ctx.destination);
    try{ amb.start(); }catch(e){}
    ready=true;
    applyAudio();
    return ctx.resume();
  }

  function applyAudio(){
    if(!filter){
      if(audio) audio.volume=Math.max(0.05, dim);
      return;
    }
    // 0 = almost closed, 100 = open
    var hz=200+Math.pow(filterVal/100, 1.6)*16000;
    filter.frequency.value=hz;
    var w=(spaceVal/100)*0.62;
    wet.gain.value=w;
    dry.gain.value=1-w*0.45;
    feedback.gain.value=0.12+w*0.38;
    delay.delayTime.value=0.12+w*0.38;
    ambGain.gain.value=(ambVal/100)*0.12;
    master.gain.value=Math.max(0.04, dim);
  }

  function setDimmer(v){
    dim=Math.max(0.08, Math.min(1, +v||1));
    document.documentElement.style.setProperty('--dimmer', dim.toFixed(3));
    applyAudio();
    var d=document.getElementById('litDim');
    if(d && Math.abs(+d.value-dim*100)>1) d.value=Math.round(dim*100);
  }

  function syncInputs(){
    function set(id,v){ var n=document.getElementById(id); if(n) n.value=v; }
    set('litFilter', filterVal);
    set('litSpace', spaceVal);
    set('litAmb', ambVal);
    set('litDim', Math.round(dim*100));
  }

  function openCard(){
    var el=document.getElementById('listen');
    if(!el) return;
    el.hidden=false;
    open=true;
    var art=document.getElementById('listenArt');
    if(art && !art.getAttribute('src')){
      art.src=src('media/thumbs/lost-in-time.jpg');
      art.alt='Lost in Time';
    }
    syncInputs();
    setDimmer((window.CKS_TUNE&&window.CKS_TUNE.state)?window.CKS_TUNE.state().dimmer/100:dim);
  }
  function closeCard(){
    var el=document.getElementById('listen');
    if(el) el.hidden=true;
    open=false;
    if(audio){ audio.pause(); }
    var btn=document.getElementById('listenPlay');
    if(btn) btn.textContent='tap to hear';
  }

  function togglePlay(){
    setup().then(function(){
      if(ctx && ctx.state==='suspended') return ctx.resume();
    }).then(function(){
      if(!audio) return;
      if(audio.paused){
        audio.play().catch(function(){});
        var btn=document.getElementById('listenPlay');
        if(btn) btn.textContent='pause';
      } else {
        audio.pause();
        var btn2=document.getElementById('listenPlay');
        if(btn2) btn2.textContent='tap to hear';
      }
    });
  }

  function mount(){
    var close=document.getElementById('listenClose');
    if(close) close.addEventListener('click', closeCard);
    var play=document.getElementById('listenPlay');
    if(play) play.addEventListener('click', togglePlay);
    function bind(id, fn){
      var n=document.getElementById(id);
      if(!n) return;
      n.addEventListener('input', function(e){ fn(+e.target.value); applyAudio(); });
    }
    bind('litDim', function(v){
      setDimmer(v/100);
      if(window.CKS_TUNE && window.CKS_TUNE.setDimmer) window.CKS_TUNE.setDimmer(v);
    });
    bind('litFilter', function(v){ filterVal=v; });
    bind('litSpace', function(v){ spaceVal=v; });
    bind('litAmb', function(v){ ambVal=v; });
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && open){ closeCard(); e.preventDefault(); }
    });
  }

  window.CKS_LISTEN={
    open:openCard,
    close:closeCard,
    setDimmer:setDimmer,
    isOpen:function(){ return open; }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
