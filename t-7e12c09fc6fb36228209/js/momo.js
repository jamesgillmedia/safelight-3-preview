/* Momo: lazy-loaded sprite, no frame or chrome. Parked up front when Tune allows, or from the existing triggers. */
(function(){
  if(window.GJ12 && GJ12._momoBound)return;
  window.GJ12=window.GJ12||{};
  GJ12._momoBound=1;

  var on=false, el=null, hideArm=0, loading=null, firstEnd=null, frontMode=false, ro=null;
  function inCv(){return /\/cv(\/|$)/.test(location.pathname||'')}
  function srcUrl(){return inCv()?'../media/egg/momo-sprite.png':'media/egg/momo-sprite.png'}
  function frontWanted(){
    try{
      if(window.GJ12&&typeof GJ12.tuneVal==='function'){var v=GJ12.tuneVal('momofront');if(v!=null)return +v===1}
      var t=JSON.parse(localStorage.getItem('gj.cks12.tune')||'{}')||{};
      if(t.momofront==null)return false;
      return +t.momofront===1;
    }catch(e){return false}
  }

  function injectCss(){
    if(document.getElementById('momo-egg-css'))return;
    var s=document.createElement('style');
    s.id='momo-egg-css';
    s.textContent=
      '#momo-egg{position:fixed;left:50%;top:100%;width:var(--momo-w,7.7vmin);height:var(--momo-h,9.625vmin);margin:0;padding:0;border:0;pointer-events:none;z-index:24;background-color:transparent;background-repeat:no-repeat;background-size:900% 100%;background-position:0 0;display:none;filter:none;-webkit-filter:none;transform:translate(-50%,0)}'+
      '#momo-egg.on{display:block}'+
      '#momo-egg.from-word{animation:momo-steps .75s steps(9) infinite,momo-emerge var(--rise-dur,2.4s) linear forwards}'+
      '#momo-egg.loop{animation:momo-steps .75s steps(9) infinite,momo-rise 6s linear forwards}'+
      '#momo-egg.front{top:auto;animation:momo-steps .75s steps(9) infinite;transform:translate(-50%,-50%)}'+
      '@keyframes momo-steps{from{background-position:0 0}to{background-position:-900% 0}}'+
      '@keyframes momo-emerge{from{transform:translate(-50%,-50%)}to{transform:translate(-50%,calc(-50% + var(--rise)))}}'+
      '@keyframes momo-rise{from{transform:translate(-50%,0)}to{transform:translate(-50%,calc(-100vh - 100%))}}'+
      'html.red #momo-egg,html.red #momo-egg.on,html.red #momo-egg.from-word,html.red #momo-egg.loop,html.red #momo-egg.front{filter:none!important;-webkit-filter:none!important;background-color:transparent}';
    (document.head||document.documentElement).appendChild(s);
  }

  function sizeFront(){
    if(!el)return {w:0,h:0};
    var W=Math.max(16,window.innerWidth||390),H=Math.max(16,window.innerHeight||800);
    var vmin=Math.min(W,H);
    var cssH=0.275*vmin*0.35;
    if(W<=700)cssH=Math.min(cssH,0.22*H);
    var dpr=Math.max(1,window.devicePixelRatio||1);
    cssH=Math.min(cssH,400/dpr);
    cssH=Math.max(28,cssH);
    var cssW=cssH*0.8;
    el.style.setProperty('--momo-w',cssW+'px');
    el.style.setProperty('--momo-h',cssH+'px');
    return {w:cssW,h:cssH};
  }

  function placeFront(){
    if(!el)return;
    var sz=sizeFront();
    var W=window.innerWidth||390,H=window.innerHeight||800;
    function vis(el){
      if(!el||!el.getBoundingClientRect)return null;
      var s=getComputedStyle(el);
      if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity)===0)return null;
      var r=el.getBoundingClientRect();
      if(r.width<2||r.height<2)return null;
      return r;
    }
    var padT=56,padB=72,padL=16,padR=16;
    var top=vis(document.getElementById('top'));if(top)padT=Math.max(padT,top.bottom+10);
    var all=vis(document.getElementById('allbtn'));if(all)padT=Math.max(padT,all.bottom+10);
    var hint=vis(document.getElementById('findhint'));if(hint)padT=Math.max(padT,hint.bottom+8);
    ;['red','disc'].forEach(function(id){
      var r=vis(document.getElementById(id));if(!r)return;
      padB=Math.max(padB,H-r.top+12);
    });
    var rail=vis(document.getElementById('rail'));
    if(rail&&rail.left>W*0.5)padR=Math.max(padR,W-rail.left+10);
    var cx=(padL+(W-padR))/2;
    var cy=padT+(H-padT-padB)*0.36;
    cx=Math.max(padL+sz.w/2,Math.min(W-padR-sz.w/2,cx));
    cy=Math.max(padT+sz.h/2,Math.min(H-padB-sz.h/2,cy));
    el.style.left=Math.round(cx)+'px';
    el.style.top=Math.round(cy)+'px';
    el.style.right='auto';
    el.style.bottom='auto';
    el.style.removeProperty('transform');
  }

  function randX(){
    var w=Math.max(16,window.innerWidth||390);
    var vw=el?el.offsetWidth:(0.077*Math.min(w,Math.max(16,window.innerHeight||800)));
    var pad=vw*0.5+8;
    var span=Math.max(0,w-2*pad);
    return Math.round(pad+Math.random()*span)+'px';
  }

  function originOf(node){
    if(!node||!node.getBoundingClientRect)return null;
    var r=node.getBoundingClientRect();
    var x=r.left+r.width/2,y=r.top+r.height/2;
    try{
      if(window.frameElement){
        var f=window.frameElement.getBoundingClientRect();
        x+=f.left;y+=f.top;
      }
    }catch(e){}
    return {x:x,y:y};
  }

  function callParent(name, arg){
    try{
      if(window.parent&&window.parent!==window&&window.parent.GJ12&&window.parent.GJ12[name]){
        window.parent.GJ12[name](arg);
        return true;
      }
    }catch(e){}
    return false;
  }

  function injectEl(){
    if(el)return;
    injectCss();
    el=document.createElement('div');
    el.id='momo-egg';
    el.setAttribute('aria-hidden','true');
    el.style.backgroundImage='url('+srcUrl()+')';
    el.addEventListener('animationiteration',function(e){
      if(e.animationName!=='momo-rise')return;
      if(el)el.style.left=randX();
    });
    (document.body||document.documentElement).appendChild(el);
    if(!ro&&typeof ResizeObserver==='function'){
      ro=new ResizeObserver(function(){if(frontMode&&on)placeFront()});
      ro.observe(document.documentElement);
    }
    addEventListener('resize',function(){if(frontMode&&on)placeFront()});
  }

  function ensure(cb){
    if(el){cb();return}
    if(loading){loading.push(cb);return}
    loading=[cb];
    injectCss();
    var img=new Image();
    img.onload=function(){
      injectEl();
      var cbs=loading;loading=0;
      cbs.forEach(function(f){try{f()}catch(err){}});
    };
    img.onerror=function(){loading=0};
    img.src=srcUrl();
  }

  function startLoop(){
    if(!el||!on)return;
    frontMode=false;
    el.classList.remove('from-word','front');
    el.style.top='100%';
    el.style.left=randX();
    el.style.removeProperty('--rise');
    el.style.removeProperty('--rise-dur');
    el.classList.add('loop');
    if(firstEnd){el.removeEventListener('animationend',firstEnd);firstEnd=null}
    var hideAt=Date.now()+6200;
    firstEnd=function(e){
      if(e&&e.animationName&&e.animationName!=='momo-rise')return;
      el.removeEventListener('animationend',firstEnd);firstEnd=null;
      hide();
    };
    el.addEventListener('animationend',firstEnd);
    setTimeout(function(){if(on&&Date.now()>=hideAt-50)hide()},6300);
  }

  function showFront(){
    ensure(function(){
      if(firstEnd){el.removeEventListener('animationend',firstEnd);firstEnd=null}
      el.classList.remove('from-word','loop');
      el.style.removeProperty('--rise');
      el.style.removeProperty('--rise-dur');
      frontMode=true;
      placeFront();
      el.classList.add('on','front');
      on=true;
      hideArm=Date.now()+280;
    });
  }

  function show(origin){
    if(window.parent&&window.parent!==window){
      if(callParent('momoShow', origin))return;
    }
    ensure(function(){
      if(on&&!frontMode)return;
      if(firstEnd){el.removeEventListener('animationend',firstEnd);firstEnd=null}
      el.classList.remove('from-word','loop','front');
      el.style.removeProperty('--rise');
      el.style.removeProperty('--rise-dur');
      frontMode=false;
      if(origin&&origin.x!=null&&origin.y!=null){
        el.style.left=Math.round(origin.x)+'px';
        el.style.top=Math.round(origin.y)+'px';
        sizeFront();
        var h=el.offsetHeight||Math.round(0.096*Math.min(window.innerWidth||390,window.innerHeight||800));
        var rise=origin.y+h+8;
        el.style.setProperty('--rise',(-rise)+'px');
        var vh=window.innerHeight||800;
        var dur=Math.max(1.2,Math.min(6,6*rise/Math.max(1,vh+h)));
        el.style.setProperty('--rise-dur',dur.toFixed(2)+'s');
        firstEnd=function(e){
          if(e&&e.animationName&&e.animationName!=='momo-emerge')return;
          el.removeEventListener('animationend',firstEnd);firstEnd=null;
          hide();
        };
        el.addEventListener('animationend',firstEnd);
        el.classList.add('on','from-word');
      }else{
        on=true;
        el.classList.add('on');
        startLoop();
      }
      on=true;
      hideArm=Date.now()+280;
    });
  }

  function hide(fromTap){
    if(!on)return;
    if(fromTap&&(frontMode||Date.now()<hideArm))return;
    on=false;frontMode=false;
    if(el){
      if(firstEnd){el.removeEventListener('animationend',firstEnd);firstEnd=null}
      el.classList.remove('on','from-word','loop','front');
      el.style.removeProperty('--rise');
      el.style.removeProperty('--rise-dur');
      el.style.top='100%';
      el.style.left='50%';
      el.style.removeProperty('right');
      el.style.removeProperty('bottom');
      el.style.removeProperty('transform');
      el.style.removeProperty('display');
    }
  }

  function toggle(origin){
    if(window.parent&&window.parent!==window){
      if(callParent('momoToggle', origin))return;
    }
    if(on)hide();else show(origin);
  }

  function isOn(){return !!on}

  function syncFront(){
    if(inCv())return;
    var want=frontWanted();
    if(want){
      if(!on||frontMode)showFront();
    }else if(on&&frontMode){
      hide();
    }
  }

  GJ12.momoShow=show;
  GJ12.momoHide=function(){
    if(window.parent&&window.parent!==window){if(callParent('momoHide'))return}
    hide();
  };
  GJ12.momoTapHide=function(){
    if(window.parent&&window.parent!==window){if(callParent('momoTapHide'))return}
    hide(true);
  };
  GJ12.momoToggle=toggle;
  GJ12.momoOn=function(){
    try{if(window.parent&&window.parent!==window&&window.parent.GJ12&&window.parent.GJ12.momoOn)return window.parent.GJ12.momoOn()}catch(e){}
    return isOn();
  };
  GJ12.momoFrontSync=syncFront;
  GJ12.momoBindFrame=function(fr){
    try{
      var d=fr&&fr.contentDocument;if(!d||d._momoBound)return;
      bindDoc(d);
    }catch(e){}
  };
  GJ12.momoMetrics=function(){
    if(!el||!on)return null;
    var r=el.getBoundingClientRect();
    return {front:!!frontMode,on:on,x:r.left,y:r.top,w:r.width,h:r.height,vw:window.innerWidth,vh:window.innerHeight,pctH:r.height/(window.innerHeight||1)};
  };

  function bindDoc(doc){
    if(!doc||doc._momoBound)return;
    doc._momoBound=1;
    doc.addEventListener('click',function(e){
      var t=e.target&&e.target.closest&&e.target.closest('[data-egg="momo"]');
      if(t){
        e.preventDefault();e.stopPropagation();
        toggle(originOf(t));
        return;
      }
      if(frontMode)return;
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

  function bootFront(){/* at rest Momo stays hidden; the rise is only from kaia or the main Mark double-tap */}
  /* no load-time syncFront — that parked the sprite on every visit */
})();
