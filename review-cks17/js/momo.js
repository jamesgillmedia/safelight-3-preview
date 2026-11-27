/* Momo easter egg: lazy-loaded sprite, no frame or chrome. */
(function(){
  if(window.GJ12 && GJ12._momoBound)return;
  window.GJ12=window.GJ12||{};
  GJ12._momoBound=1;

  var on=false, el=null, hideArm=0, loading=null;
  function inCv(){return /\/cv(\/|$)/.test(location.pathname||'')}
  function srcUrl(){return inCv()?'../media/egg/momo-sprite.png':'media/egg/momo-sprite.png'}

  function injectCss(){
    if(document.getElementById('momo-egg-css'))return;
    var s=document.createElement('style');
    s.id='momo-egg-css';
    s.textContent=
      '#momo-egg{position:fixed;left:50%;top:100%;width:22vmin;height:calc(22vmin * 1.25);margin:0;padding:0;border:0;pointer-events:none;z-index:400;background-color:transparent;background-repeat:no-repeat;background-size:900% 100%;background-position:0 0;display:none;filter:none;-webkit-filter:none}'+
      '#momo-egg.on{display:block;animation:momo-steps .75s steps(9) infinite,momo-rise 6s linear infinite}'+
      '@keyframes momo-steps{from{background-position:0 0}to{background-position:-900% 0}}'+
      '@keyframes momo-rise{from{transform:translate(-50%,0)}to{transform:translate(-50%,calc(-100vh - 100%))}}'+
      'html.red #momo-egg,html.red #momo-egg.on{filter:none!important;-webkit-filter:none!important;background-color:transparent}';
    (document.head||document.documentElement).appendChild(s);
  }

  function randX(){
    var w=Math.max(16,window.innerWidth||390);
    var vw=0.22*Math.min(w,Math.max(16,window.innerHeight||800));
    var pad=vw*0.5+8;
    var span=Math.max(0,w-2*pad);
    return Math.round(pad+Math.random()*span)+'px';
  }

  function parentToggle(){
    try{
      if(window.parent&&window.parent!==window&&window.parent.GJ12&&window.parent.GJ12.momoToggle){
        window.parent.GJ12.momoToggle();
        return true;
      }
    }catch(e){}
    return false;
  }

  function ensure(cb){
    if(el){cb();return}
    if(loading){loading.push(cb);return}
    loading=[cb];
    injectCss();
    var img=new Image();
    img.onload=function(){
      el=document.createElement('div');
      el.id='momo-egg';
      el.setAttribute('aria-hidden','true');
      el.style.backgroundImage='url('+srcUrl()+')';
      el.addEventListener('animationiteration',function(e){
        if(e.animationName!=='momo-rise')return;
        if(el)el.style.left=randX();
      });
      (document.body||document.documentElement).appendChild(el);
      var cbs=loading;loading=0;
      cbs.forEach(function(f){try{f()}catch(err){}});
    };
    img.onerror=function(){loading=0};
    img.src=srcUrl();
  }

  function show(){
    ensure(function(){
      if(on)return;
      el.style.left=randX();
      el.classList.add('on');
      on=true;
      hideArm=Date.now()+280;
    });
  }
  function hide(fromTap){
    if(!on)return;
    if(fromTap&&Date.now()<hideArm)return;
    on=false;
    if(el)el.classList.remove('on');
  }
  function toggle(){
    if(window.parent&&window.parent!==window){
      /* in an iframe (CV overlay): ask the parent, so he appears over the whole page */
      if(parentToggle())return;
    }
    if(on)hide();else show();
  }
  function isOn(){return !!on}

  GJ12.momoShow=show;
  GJ12.momoHide=function(){
    try{if(window.parent&&window.parent!==window&&window.parent.GJ12&&window.parent.GJ12.momoHide){window.parent.GJ12.momoHide();return}}catch(e){}
    hide();
  };
  GJ12.momoTapHide=function(){
    try{if(window.parent&&window.parent!==window&&window.parent.GJ12&&window.parent.GJ12.momoTapHide){window.parent.GJ12.momoTapHide();return}}catch(e){}
    hide(true);
  };
  GJ12.momoToggle=toggle;
  GJ12.momoOn=function(){
    try{if(window.parent&&window.parent!==window&&window.parent.GJ12&&window.parent.GJ12.momoOn)return window.parent.GJ12.momoOn()}catch(e){}
    return isOn();
  };
  GJ12.momoBindFrame=function(fr){
    try{
      var d=fr&&fr.contentDocument;if(!d||d._momoBound)return;
      d._momoBound=1;
      d.addEventListener('click',function(e){
        var t=e.target&&e.target.closest&&e.target.closest('[data-egg="momo"]');
        if(!t)return;
        e.preventDefault();e.stopPropagation();
        toggle();
      },true);
    }catch(e){}
  };

  function bindDoc(doc){
    if(!doc||doc._momoBound)return;
    doc._momoBound=1;
    doc.addEventListener('click',function(e){
      var t=e.target&&e.target.closest&&e.target.closest('[data-egg="momo"]');
      if(t){e.preventDefault();e.stopPropagation();toggle();return}
      if(e.target&&e.target.closest&&e.target.closest('#red'))return;
      if(GJ12.momoTapHide)GJ12.momoTapHide();
    },true);
    doc.addEventListener('keydown',function(e){
      if(e.key!=='Escape')return;
      var visible=isOn();
      try{if(!visible&&window.parent&&window.parent!==window&&window.parent.GJ12&&window.parent.GJ12.momoOn)visible=window.parent.GJ12.momoOn()}catch(err){}
      if(!visible)return;
      e.preventDefault();e.stopPropagation();
      if(GJ12.momoHide)GJ12.momoHide();
    },true);
  }
  bindDoc(document);
})();
