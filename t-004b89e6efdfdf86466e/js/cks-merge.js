/* Feature layer on Fable v17: depth rail, reel, eyepiece archive, Mark, hidden Deep Tune. */
(function(){
  var EXTRA = {
    cup: ['media/photos/cup-from-above.webp','media/photos/cup-from-above-1341.jpg']
  };
  var lastWork = 'scoop';

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}

  function currentPlate(){
    var mid = innerHeight * 0.5, best=null, bd=1e9;
    $$('.plate').forEach(function(p){
      var r=p.getBoundingClientRect(), d=Math.abs((r.top+r.bottom)/2-mid);
      if(r.bottom>80 && r.top<innerHeight-80 && d<bd){bd=d;best=p}
    });
    return best;
  }
  function wallOn(){return !!(window.WALL && WALL.state && WALL.state().on)}
  function archiveOn(){
    var a=$('#archive');
    return !!(a && !a.hidden && a.classList.contains('on'));
  }
  function reelOn(){
    var r=$('.rl');
    return !!(r && !r.hidden);
  }
  function onSky(){
    var s=$('#sky'); if(!s) return true;
    var r=s.getBoundingClientRect();
    return r.bottom > innerHeight*0.45 && r.top < innerHeight*0.55;
  }
  function depthLevel(){
    if(archiveOn() || wallOn()) return 'BOARD';
    if(reelOn()) return 'WORK';
    if(!onSky()) return 'WORK';
    var z = window.GJ12 && GJ12.roomZoom && GJ12.roomZoom();
    if(z && (z.zoom>1.2 || z.tz>1.15)) return 'MID';
    return 'SKY';
  }

  function goSky(){
    if(archiveOn() && window.CKS_ARCHIVE) CKS_ARCHIVE.close();
    var a=$('#archive'); if(a){a.hidden=true;a.classList.remove('on')}
    if(wallOn() && WALL.close) try{ /* close via back */ document.querySelector('#wall .wx') && document.querySelector('#wall .wx').click()}catch(e){}
    var sky=$('#sky'); if(sky){document.documentElement.style.scrollBehavior='auto';sky.scrollIntoView();document.documentElement.style.scrollBehavior=''}
    paintRail();
  }
  function goBoard(){
    var id = (currentPlate() && currentPlate().id) || lastWork;
    if(id==='cv'||id==='lost-in-time'||id==='colour-field'){
      /* still try wall; may have no items */
    }
    if(window.WALL && WALL.open) WALL.open(id,0);
    paintRail();
  }
  function goWork(){
    if(archiveOn() && window.CKS_ARCHIVE){CKS_ARCHIVE.close(); var a=$('#archive'); if(a){a.hidden=true;a.classList.remove('on')}}
    if(wallOn()){ var wx=$('#wall .wx'); if(wx) wx.click(); }
    var p=document.getElementById(lastWork) || currentPlate();
    if(p){document.documentElement.style.scrollBehavior='auto';p.scrollIntoView();document.documentElement.style.scrollBehavior=''}
    paintRail();
  }
  function goMid(){
    goSky();
    if(window.GJ12 && GJ12.roomFrom && lastWork) GJ12.roomFrom(lastWork);
    paintRail();
  }

  function paintRail(){
    document.documentElement.classList.toggle("on-sky", onSky() && !wallOn() && !archiveOn() && !reelOn());
    var here=depthLevel();
    $$('#wrail li[data-lv]').forEach(function(li){
      li.classList.toggle('here', li.getAttribute('data-lv')===here);
    });
  }

  function buildRail(){
    if($('#wrail')) return;
    var nav=document.createElement('nav');
    nav.id='wrail';
    nav.setAttribute('aria-label','depth');
    nav.innerHTML='<ol>'+
      '<li class="tap" data-lv="SKY"><span>SKY</span></li>'+
      '<li class="tap" data-lv="MID"><span>MID</span></li>'+
      '<li class="tap" data-lv="BOARD"><span>BOARD</span></li>'+
      '<li class="tap" data-lv="WORK"><span>WORK</span></li>'+
      '</ol>';
    document.body.appendChild(nav);
    nav.addEventListener('click',function(e){
      var li=e.target.closest('[data-lv]'); if(!li) return;
      var lv=li.getAttribute('data-lv');
      if(lv==='SKY') goSky();
      else if(lv==='MID') goMid();
      else if(lv==='BOARD') goBoard();
      else goWork();
    });
  }

  function uniqueItems(id){
    var out=[], seen={};
    if(window.GAL && GAL[id] && GAL[id].items){
      GAL[id].items().forEach(function(it){
        var src=it.big||it.src; if(!src||seen[src]) return;
        seen[src]=1; out.push({src:src, poster:it.th||src, kind:'img', cap:it.cap||''});
      });
    }
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
    paintRail();
    return true;
  }
  function closeArchive(){
    if(window.CKS_ARCHIVE) CKS_ARCHIVE.close();
    var a=$('#archive'); if(a){a.hidden=true;a.classList.remove('on')}
    paintRail();
  }

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
  function photosForReel(id){
    return wallItems(id).filter(function(it){return it.kind!=='video'}).map(function(it,i){
      return {w:1600,h:1200,thumb:it.poster||it.src,big:it.src,title:'',series:'',page:''};
    });
  }
  function openReel(id, start){
    if(!window.GJ3_REEL) return;
    var photos=photosForReel(id);
    if(photos.length<1) return;
    GJ3_REEL.open({photos:photos, start:start||0, onClose:function(){ paintRail(); }});
    paintRail();
  }

  function enhancePlates(){
    $$('.plate').forEach(function(p){
      var id=p.id;
      var wallN = (function(){
        var seen={}, n=0;
        if(window.GAL && GAL[id] && GAL[id].items){
          GAL[id].items().forEach(function(it){
            var src=it.big||it.src; if(!src||seen[src]) return;
            seen[src]=1; n++;
          });
        }
        return n;
      })();
      var n = uniqueItems(id).length;
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
      if(n>=2 && !$('.reelbtn',p) && window.GJ3_REEL){
        var r=document.createElement('button');
        r.type='button'; r.className='pill reelbtn'; r.textContent='reel';
        r.addEventListener('click',function(){ openReel(id,0); });
        kick.appendChild(r);
      }
    });
  }

  function wireWallField(){
    /* add a field control to the v17 wall chrome */
    var t=$('#wall .wtop');
    if(!t || t.querySelector('.fieldbtn')) return;
    var b=document.createElement('button');
    b.type='button'; b.className='pill fieldbtn'; b.textContent='field';
    b.addEventListener('click',function(){
      var st=WALL.state && WALL.state();
      if(st && st.k) openArchive(st.k);
    });
    t.appendChild(b);
  }

  function trackWork(){
    var p=currentPlate();
    if(p && p.id) lastWork=p.id;
    paintRail();
  }

  function wireMarkTune(){
    var mark=$('#mark');
    if(!mark) return;
    var pointers={};
    function maybeTune(){
      if(window.GJ12 && GJ12.openTune) GJ12.openTune();
    }
    mark.addEventListener('pointerdown',function(e){
      pointers[e.pointerId]=1;
      if(Object.keys(pointers).length>=2){ maybeTune(); }
    });
    function up(e){ delete pointers[e.pointerId]; }
    mark.addEventListener('pointerup',up);
    mark.addEventListener('pointercancel',up);
    /* long-press the Mark also opens Deep Tune */
    var hold=0;
    mark.addEventListener('pointerdown',function(e){
      if(e.button) return;
      hold=setTimeout(maybeTune, 650);
    });
    mark.addEventListener('pointerup',function(){ clearTimeout(hold); });
    mark.addEventListener('pointerleave',function(){ clearTimeout(hold); });
  }

  function wireRedMark(){
    var red=$('#red');
    function lift(){
      var on=document.documentElement.classList.contains('red');
      var mark=$('#mark') || $('.sig');
      if(!mark) return;
      mark.classList.remove('lift');
      void mark.offsetWidth;
      if(on) mark.classList.add('lift');
    }
    if(red) red.addEventListener('click',function(){ setTimeout(lift,0); });
    if(document.documentElement.classList.contains('red')) lift();
  }

  function wireArchiveClose(){
    var c=$('#archiveClose');
    if(c) c.addEventListener('click', closeArchive);
    addEventListener('keydown',function(e){
      if(e.key==='Escape' && archiveOn()) closeArchive();
    });
  }

  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn);
    else fn();
  }

  function whenGal(fn){
    var n=0;
    (function tick(){
      if(window.GAL && GAL.cup && GAL.cup.items) fn();
      else if(++n<80) setTimeout(tick,50);
      else fn();
    })();
  }
  ready(function(){
    buildRail();
    whenGal(function(){ enhancePlates(); wireWallField(); });
    wireMarkTune();
    wireRedMark();
    wireArchiveClose();
    addEventListener('scroll', trackWork, {passive:true});
    addEventListener('resize', paintRail);
    setInterval(paintRail, 400);
    paintRail();
  });

  window.CKS_MERGE = { openArchive:openArchive, openReel:openReel, closeArchive:closeArchive, extras:EXTRA };
})();
