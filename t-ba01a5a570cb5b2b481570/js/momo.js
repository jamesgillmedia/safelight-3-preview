/* Momo easter egg: lazy-loaded sprite, no frame or chrome. */
(function(){
  if(window.GJ12 && GJ12._momoBound)return;
  window.GJ12=window.GJ12||{};
  GJ12._momoBound=1;

  var on=false, el=null, hideArm=0, loading=null, firstEnd=null;
  function inCv(){return /\/cv(\/|$)/.test(location.pathname||'')}
  function srcUrl(){return inCv()?'../media/egg/momo-sprite.png':'media/egg/momo-sprite.png'}

  function injectCss(){
    if(document.getElementById('momo-egg-css'))return;
    var s=document.createElement('style');
    s.id='momo-egg-css';
    s.textContent=
      '#momo-egg{position:fixed;left:50%;top:100%;width:22vmin;height:calc(22vmin * 1.25);margin:0;padding:0;border:0;pointer-events:none;z-index:400;background-color:transparent;background-repeat:no-repeat;background-size:900% 100%;background-position:0 0;display:none;filter:none;-webkit-filter:none}'+
      '#momo-egg.on{display:block}'+
      '#momo-egg.from-word{animation:momo-steps .75s steps(9) infinite,momo-emerge var(--rise-dur,2.4s) linear forwards}'+
      '#momo-egg.loop{animation:momo-steps .75s steps(9) infinite,momo-rise 6s linear infinite}'+
      '@keyframes momo-steps{from{background-position:0 0}to{background-position:-900% 0}}'+
      '@keyframes momo-emerge{from{transform:translate(-50%,-50%)}to{transform:translate(-50%,calc(-50% + var(--rise)))}}'+
      '@keyframes momo-rise{from{transform:translate(-50%,0)}to{transform:translate(-50%,calc(-100vh - 100%))}}'+
      'html.red #momo-egg,html.red #momo-egg.on,html.red #momo-egg.from-word,html.red #momo-egg.loop{filter:none!important;-webkit-filter:none!important;background-color:transparent}';
    (document.head||document.documentElement).appendChild(s);
  }

  function randX(){
    var w=Math.max(16,window.innerWidth||390);
    var vw=0.22*Math.min(w,Math.max(16,window.innerHeight||800));
    var pad=vw*0.5+8;
    var span=Math.max(0,w-2*pad);
    return Math.round(pad+Math.random()*span)+'px';
  }

  function originOf(el){
    if(!el||!el.getBoundingClientRect)return null;
    var r=el.getBoundingClientRect();
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
    el.classList.remove('from-word');
    el.style.top='100%';
    el.style.left=randX();
    el.style.removeProperty('--rise');
    el.style.removeProperty('--rise-dur');
    el.classList.add('loop');
  }

  function show(origin){
    if(window.parent&&window.parent!==window){
      if(callParent('momoShow', origin))return;
    }
    ensure(function(){
      if(on)return;
      if(firstEnd){el.removeEventListener('animationend',firstEnd);firstEnd=null}
      el.classList.remove('from-word','loop');
      el.style.removeProperty('--rise');
      el.style.removeProperty('--rise-dur');
      if(origin&&origin.x!=null&&origin.y!=null){
        el.style.left=Math.round(origin.x)+'px';
        el.style.top=Math.round(origin.y)+'px';
        var h=el.offsetHeight||Math.round(0.275*Math.min(window.innerWidth||390,window.innerHeight||800));
        var rise=origin.y+h+8;
        el.style.setProperty('--rise',(-rise)+'px');
        var vh=window.innerHeight||800;
        var dur=Math.max(1.2,Math.min(6,6*rise/Math.max(1,vh+h)));
        el.style.setProperty('--rise-dur',dur.toFixed(2)+'s');
        firstEnd=function(e){
          if(e&&e.animationName&&e.animationName!=='momo-emerge')return;
          el.removeEventListener('animationend',firstEnd);firstEnd=null;
          startLoop();
        };
        el.addEventListener('animationend',firstEnd);
        el.classList.add('on','from-word');
      }else{
        el.style.left=randX();
        el.style.top='100%';
        el.classList.add('on','loop');
      }
      on=true;
      hideArm=Date.now()+280;
    });
  }

  function hide(fromTap){
    if(!on)return;
    if(fromTap&&Date.now()<hideArm)return;
    on=false;
    if(el){
      if(firstEnd){el.removeEventListener('animationend',firstEnd);firstEnd=null}
      el.classList.remove('on','from-word','loop');
      el.style.removeProperty('--rise');
      el.style.removeProperty('--rise-dur');
    }
  }

  function toggle(origin){
    if(window.parent&&window.parent!==window){
      if(callParent('momoToggle', origin))return;
    }
    if(on)hide();else show(origin);
  }

  function isOn(){return !!on}

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
  GJ12.momoBindFrame=function(fr){
    try{
      var d=fr&&fr.contentDocument;if(!d||d._momoBound)return;
      bindDoc(d);
    }catch(e){}
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
