/* Motion and atmosphere as backend. Respects Reduce Motion. Driven by a small camera param set (tune + optional cam dial). */
(function(){
  var RM=false;try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  var params={drift:RM?0:0.012,depth:'mid',move:'dolly',atmos:1};
  function read(){
    try{
      if(window.GJ_CAMDIAL&&GJ_CAMDIAL.params){
        var p=GJ_CAMDIAL.params();
        if(p){params.drift=RM?0:(p.driftRadPerSec||0);if(p.depthStop)params.depth=p.depthStop;if(p.move)params.move=p.move}
      }
    }catch(e){}
    if(window.GJ12){GJ12.cam=params}
  }
  function apply(){
    read();
    var r=document.documentElement;
    r.style.setProperty('--atmos', String(params.atmos));
    r.setAttribute('data-cam-depth', params.depth);
    r.setAttribute('data-motion', RM?'0':'1');
    var wash=document.getElementById('wash');
    if(wash){
      var on=r.classList.contains('red');
      var sky=r.getAttribute('data-sky')||'night';
      /* a quiet horizon wash, never a tint on photographs */
      wash.style.background=on
        ? 'radial-gradient(ellipse 90% 55% at 50% 100%,rgba(255,68,87,.14),transparent 70%)'
        : sky==='day'
          ? 'radial-gradient(ellipse 80% 70% at 50% 0%,rgba(180,210,245,.28),rgba(255,236,210,.10) 55%,transparent 80%)'
          : sky==='dusk'
            ? 'radial-gradient(ellipse 90% 60% at 50% 100%,rgba(255,140,90,.22),rgba(80,60,120,.12) 50%,transparent 75%)'
            : 'radial-gradient(ellipse 90% 55% at 50% 100%,rgba(255,200,160,.10),rgba(120,150,200,.05) 45%,transparent 70%)';
    }
  }
  addEventListener('gj:camera',apply);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);
  else apply();
  window.CKS_ATMOS={params:function(){return params},apply:apply};
})();
