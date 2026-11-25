/* Ghost-arc scrub for film, photographs, and archive. Plain swipe and tap still work. */
(function(){
  var EDGE=52;
  var active=null;

  function G(){ return window.GJ_GHOST; }

  function workPhotos(){
    var list=[];
    var hero=document.querySelector('#hero img, #hero video');
    if(hero) list.push(hero);
    document.querySelectorAll('#gallery img, #gallery video, .av-block video, .av-stills img').forEach(function(n){ list.push(n); });
    return list;
  }
  function archivePhotos(){
    return Array.prototype.slice.call(document.querySelectorAll('#archiveGrid img, #archiveGrid video'));
  }

  function startFilm(e, vid){
    if(!vid || !vid.duration) return false;
    active={kind:'film', vid:vid, x:e.clientX, y:e.clientY, t0:vid.currentTime, dur:vid.duration};
    return true;
  }
  function startIndex(e, items, kind){
    if(!items || items.length<2) return false;
    var i=0;
    items.forEach(function(n,idx){ if(n===e.target || n.contains(e.target)) i=idx; });
    active={kind:kind, items:items, i:i, y:e.clientY, x:e.clientX};
    return true;
  }

  function nearEdge(e){
    return e.clientX < EDGE || e.clientX > (innerWidth-EDGE);
  }

  function onDown(e){
    if(e.pointerType==='mouse' && e.button!==0) return;
    if(document.getElementById('listen') && !document.getElementById('listen').hidden) return;
    if(document.getElementById('deepTune') && !document.getElementById('deepTune').hidden) return;
    if(document.getElementById('lightbox') && !document.getElementById('lightbox').hidden) return;
    if(!nearEdge(e)) return;
    var vid=e.target.closest && e.target.closest('video');
    var bodyPiece=document.body.getAttribute('data-piece')||'';
    var arch=document.getElementById('archive');
    if(vid && startFilm(e, vid)){ e.preventDefault(); return; }
    if(arch && !arch.hidden && startIndex(e, archivePhotos(), 'archive')){ return; }
    if(bodyPiece && bodyPiece!=='home' && startIndex(e, workPhotos(), 'work')){ return; }
  }
  function onMove(e){
    if(!active) return;
    var ghost=G();
    if(active.kind==='film'){
      var dy=(active.y-e.clientY)/innerHeight;
      var t=Math.max(0, Math.min(active.dur, active.t0 + dy*active.dur));
      try{ active.vid.currentTime=t; }catch(err){}
      if(ghost) ghost.update({name:'time', min:0, max:active.dur, def:0, value:t, x:e.clientX, y:e.clientY});
    } else {
      var items=active.items;
      var step=Math.round((active.y-e.clientY)/56);
      var i=Math.max(0, Math.min(items.length-1, active.i+step));
      if(ghost) ghost.update({name:'still', min:1, max:items.length, def:1, value:i+1, x:e.clientX, y:e.clientY});
      active.cur=i;
    }
  }
  function onUp(){
    if(!active) return;
    var ghost=G();
    if(ghost) ghost.release();
    if((active.kind==='archive'||active.kind==='work') && active.cur!=null){
      var n=active.items[active.cur];
      if(n && n.scrollIntoView) n.scrollIntoView({block:'center', behavior:'smooth'});
      if(n && n.tagName==='IMG' && n.closest && n.closest('button')) n.closest('button').focus();
    }
    active=null;
  }
  function fmt(t){
    t=Math.max(0,t|0);
    return Math.floor(t/60)+':'+(t%60<10?'0':'')+(t%60);
  }

  // Archive / page scroll also ticks the gold meter, without blocking the swipe.
  var scrollTick=null;
  function onScroll(){
    var arch=document.getElementById('archive');
    var ghost=G();
    if(!arch || arch.hidden || !ghost) return;
    var max=Math.max(1, (document.scrollingElement||document.documentElement).scrollHeight - innerHeight);
    var p=(document.scrollingElement||document.documentElement).scrollTop / max;
    ghost.update({name:'archive', min:0, max:100, def:0, value:Math.round(p*100), x:innerWidth-24, y:innerHeight*0.5});
    clearTimeout(scrollTick);
    scrollTick=setTimeout(function(){ if(ghost) ghost.release(); }, 500);
  }

  if(window.GJ_GHOST){
    window.GJ_GHOST.avoid(function(){
      var boxes=[];
      ['tunePanel','deepTune','holdTune','listen','lightbox'].forEach(function(id){
        var n=document.getElementById(id);
        if(n && !n.hidden){
          var r=n.getBoundingClientRect();
          boxes.push([r.left,r.top,r.right,r.bottom]);
        }
      });
      return boxes;
    });
  }

  document.addEventListener('pointerdown', onDown, {passive:false});
  document.addEventListener('pointermove', onMove, {passive:true});
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);
  window.addEventListener('scroll', onScroll, {passive:true});
})();
