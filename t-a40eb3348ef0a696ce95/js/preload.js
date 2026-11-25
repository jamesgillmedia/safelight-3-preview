/* Prefetch neighbouring stills, decode ahead, keep in memory, idle-time warm. */
(function(){
  var MEM={}, Q=[];
  function remember(src){
    if(!src||MEM[src])return MEM[src];
    var im=new Image();im.decoding='async';im.src=src;MEM[src]=im;
    if(im.decode)try{im.decode().catch(function(){})}catch(e){}
    return im;
  }
  function qpush(src){if(src&&!MEM[src]&&Q.indexOf(src)<0)Q.push(src)}
  function pump(){var n=0;while(Q.length&&n<6){remember(Q.shift());n++}}
  function fromPlate(id){
    var p=document.getElementById(id);if(!p)return;
    p.querySelectorAll('img[src],img[data-src],button[data-big],figure[data-big]').forEach(function(el){
      qpush(el.getAttribute('data-src')||el.getAttribute('data-big')||el.getAttribute('src'));
    });
  }
  function orbs(){
    document.querySelectorAll('#room img.orb, #room a.st img').forEach(function(im){qpush(im.getAttribute('src'))});
  }
  function neighbors(){
    var hash=(location.hash||'').replace('#','');
    var ps=[].slice.call(document.querySelectorAll('.plate'));
    var i=ps.findIndex(function(p){return p.id===hash});
    if(i<0)i=0;
    for(var k=-1;k<=2;k++){var p=ps[i+k];if(p)fromPlate(p.id)}
  }
  function boot(){
    orbs();
    document.querySelectorAll('#all img, .plate .strip img, .plate .main').forEach(function(im){qpush(im.getAttribute('src')||im.getAttribute('data-src'))});
    neighbors();
    pump();
    var idle=window.requestIdleCallback||function(f){setTimeout(f,200)};
    function loop(){pump();if(Q.length)idle(loop,{timeout:1200})}
    idle(loop,{timeout:600});
    addEventListener('hashchange',function(){neighbors();idle(pump,{timeout:400})});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
  window.CKS_PRELOAD={warm:remember,plate:fromPlate,mem:MEM};
})();
