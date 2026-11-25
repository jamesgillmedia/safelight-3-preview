/* Feature layer on Fable v18: eyepiece archive, reel, Mark lift. */
(function(){
  var EXTRA = {
    cup: ['media/photos/cup-from-above.webp','media/photos/cup-from-above-1341.jpg']
  };

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}

  function wallItems(id){
    var out=[], seen={};
    if(window.GAL && GAL[id] && GAL[id].items){
      GAL[id].items().forEach(function(it){
        var src=it.big||it.src; if(!src||seen[src]) return;
        seen[src]=1; out.push({src:src, poster:it.th||src, kind:'img', cap:it.cap||''});
      });
    }
    return out;
  }
  function uniqueItems(id){
    var out=wallItems(id), seen={};
    out.forEach(function(it){ seen[it.src]=1; });
    (EXTRA[id]||[]).forEach(function(src){
      if(seen[src]) return; seen[src]=1;
      out.push({src:src, poster:src, kind:'img'});
    });
    return out;
  }

  function openArchive(id){
    var items=uniqueItems(id);
    if(!items.length || !window.CKS_ARCHIVE) return false;
    var a=$('#archive'), ttl=$('#archiveTitle');
    if(a){a.hidden=false; a.classList.add('on')}
    if(ttl){
      var p=document.getElementById(id);
      ttl.textContent = (p && $('h2',p) ? $('h2',p).textContent : id) + ' · ' + items.length;
    }
    CKS_ARCHIVE.open(items);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if(CKS_ARCHIVE.fit) CKS_ARCHIVE.fit();
        if(window.GJ_EYE && GJ_EYE.layout) GJ_EYE.layout();
      });
    });
    return true;
  }
  function closeArchive(){
    if(window.CKS_ARCHIVE) CKS_ARCHIVE.close();
    var a=$('#archive'); if(a){a.hidden=true;a.classList.remove('on')}
  }
  function photosForReel(id){
    return wallItems(id).filter(function(it){return it.kind!=='video'}).map(function(it){
      return {w:1600,h:1200,thumb:it.poster||it.src,big:it.src,title:'',series:'',page:''};
    });
  }
  function openReel(id, start){
    if(!window.GJ3_REEL) return;
    var photos=photosForReel(id);
    if(!photos.length) return;
    GJ3_REEL.open({photos:photos, start:start||0, onClose:function(){}});
  }

  function enhancePlates(){
    $$('.plate').forEach(function(p){
      var id=p.id;
      var wallN=wallItems(id).length;
      var n=uniqueItems(id).length;
      var wb=$('.wallbtn',p);
      if(wb && wallN) wb.textContent='all '+wallN+' ▦';
      var kick=$('.kick',p);
      if(!kick) return;
      if(n>=1 && !$('.fieldbtn',p)){
        var b=document.createElement('button');
        b.type='button'; b.className='pill fieldbtn'; b.textContent='field';
        b.addEventListener('click',function(){ openArchive(id); });
        kick.appendChild(b);
      }
      if(wallN>=2 && !$('.reelbtn',p) && window.GJ3_REEL){
        var r=document.createElement('button');
        r.type='button'; r.className='pill reelbtn'; r.textContent='reel';
        r.addEventListener('click',function(){ openReel(id,0); });
        kick.appendChild(r);
      }
    });
  }
  function wireWallField(){
    var t=$('#wall .wtop');
    if(!t || t.querySelector('.fieldbtn')) return;
    var b=document.createElement('button');
    b.type='button'; b.className='pill fieldbtn'; b.textContent='field';
    b.addEventListener('click',function(){
      var st=window.WALL && WALL.state && WALL.state();
      if(st && st.k) openArchive(st.k);
    });
    t.appendChild(b);
  }
  function wireRedMark(){
    function lift(){
      var on=document.documentElement.classList.contains('red');
      var mark=document.querySelector('#corner b') || document.querySelector('.sig, .mark');
      if(!mark) return;
      mark.classList.remove('lift');
      void mark.offsetWidth;
      if(on) mark.classList.add('lift');
    }
    var red=$('#red');
    if(red) red.addEventListener('click',function(){ setTimeout(lift,0); });
    if(document.documentElement.classList.contains('red')) lift();
  }
  function wireArchiveClose(){
    var c=$('#archiveClose');
    if(c) c.addEventListener('click', closeArchive);
    addEventListener('keydown',function(e){
      if(e.key==='Escape') closeArchive();
    });
  }
  function whenGal(fn){
    var n=0;
    (function tick(){
      if(window.GAL && GAL.cup && GAL.cup.items) fn();
      else if(++n<80) setTimeout(tick,50);
      else fn();
    })();
  }
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn);
    else fn();
  }
  ready(function(){
    whenGal(function(){ enhancePlates(); wireWallField(); });
    wireRedMark();
    wireArchiveClose();
  });
  window.CKS_MERGE = { openArchive:openArchive, openReel:openReel, closeArchive:closeArchive, extras:EXTRA };
})();
