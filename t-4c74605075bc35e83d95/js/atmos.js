/* v31 · atmosphere (mist, light, white noise), off by default, esc returns to the site; find; the moon keeps clear of the stars. */
(function(){function go(){
  var de=document.documentElement,$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var LSK='gj.cks29.air';
  var D={mist:.55,light:.5,vol:.35,col:'b',hue:'a',breath:.5,pvol:.6,sus:1.4,scale:'a',fog:0,fogheight:0,fogspeed:0,fogdx:0,fogdy:0};
  var S={};try{S=JSON.parse(localStorage.getItem(LSK)||'{}')||{}}catch(e){}
  function v(k){return S[k]==null?D[k]:S[k]}
  function save(){try{localStorage.setItem(LSK,JSON.stringify(S))}catch(e){}}
  var AC=null;function ac(){if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C()}if(AC.state==='suspended')AC.resume();return AC}

  /* ---------- atmosphere ---------- */
  var top=$('#top'),esc=$('#esc');
  var ab=document.createElement('button');ab.type='button';ab.id='airbtn';ab.setAttribute('aria-pressed','false');ab.setAttribute('aria-label','atmosphere: mist and light');ab.innerHTML='<span class="l">atmosphere</span><span class="s">air</span>';
  if(top){if(esc)top.insertBefore(ab,esc);else top.appendChild(ab)}
  var lay=document.createElement('div');lay.id='atmos';lay.setAttribute('aria-hidden','true');lay.innerHTML='<canvas></canvas><i class="beam"></i><i class="vig"></i>';
  var main=$('main');if(main&&main.parentNode)main.parentNode.insertBefore(lay,main);else document.body.appendChild(lay);
  var cv=$('canvas',lay),g=cv.getContext('2d'),raf=0,on=false,P=[];
  for(var i=0;i<7;i++)P.push({x:Math.random(),y:.15+Math.random()*.8,r:.35+Math.random()*.45,s:(.4+Math.random())*(Math.random()<.5?-1:1),p:Math.random()*6.28});
  var FOG_N=16,F=[],fogLast=0;
  function fogOn(){return (+v('fog')||0)>0.001}
  function fogReduced(){try{return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){return false}}
  function fogSeed(){
    if(F.length)return;
    var i;
    for(i=0;i<FOG_N;i++)F.push({x:Math.random(),y:0,y0:0,z:.7+Math.random()*1.3,r:.16+Math.random()*.32,ph:Math.random()*6.28});
  }
  function fogLayout(){
    fogSeed();
    var ht=Math.max(0,Math.min(1,+v('fogheight')||0)),top=.72-.60*ht,span=Math.max(.18,1.02-top),i;
    for(i=0;i<F.length;i++){F[i].y0=top+((i+.35)/FOG_N)*span;if(!F[i].y)F[i].y=F[i].y0}
  }
  function stepFog(t,dt){
    if(!fogOn())return;
    fogLayout();
    if(fogReduced())return;
    var spd=Math.max(0,Math.min(1,+v('fogspeed')||0));
    var hx=Math.max(-1,Math.min(1,+v('fogdx')||0)),hy=Math.max(-1,Math.min(1,+v('fogdy')||0));
    var i,q,k=dt;
    for(i=0;i<F.length;i++){
      q=F[i];
      q.x+=hx*spd*k*0.00014*(.45+1/Math.max(.28,q.z));
      q.z+=-hy*spd*k*0.0002;
      if(spd>0){q.x+=Math.sin(t*0.00028+q.ph)*spd*k*0.000025;q.y=q.y0+Math.sin(t*0.00022+q.ph)*0.018*(1-Math.max(0,Math.min(1,+v('fogheight')||0))*.35)}
      else q.y=q.y0;
      if(q.z<.28){q.z=2.15;q.x=Math.random()}
      if(q.z>2.2){q.z=.32;q.x=Math.random()}
      if(q.x<-.3)q.x=1.22;
      if(q.x>1.3)q.x=-.18;
    }
  }
  function drawFog(w,h,col){
    var dens=Math.max(0,Math.min(1,+v('fog')||0));
    if(dens<=0.001)return;
    fogLayout();
    var n=Math.max(1,Math.round(4+12*dens)),i,q,scale,x,y,R,a,gr;
    for(i=0;i<n&&i<F.length;i++){
      q=F[i];
      scale=1.15/Math.max(.28,q.z);
      x=q.x*w;y=q.y*h;
      R=q.r*Math.max(w,h)*.55*scale;
      a=.075*dens*(.5+.5*Math.min(1.35,scale));
      gr=g.createRadialGradient(x,y,0,x,y,R);
      gr.addColorStop(0,'rgba('+col+','+a+')');
      gr.addColorStop(1,'rgba('+col+',0)');
      g.fillStyle=gr;g.fillRect(0,0,w,h);
    }
  }
  function needsDraw(){return !!(on||fillActive()||fogOn())}
  function draw(t){raf=0;if(!needsDraw())return;
    var dpr=Math.min(1.5,window.devicePixelRatio||1),w=innerWidth,h=innerHeight;
    if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
    var red=de.classList.contains('red'),hues={a:'214,224,236',b:'255,214,176',c:'232,196,120'},beams={a:'255,240,226',b:'255,214,176',c:'232,196,120'},col=red?'255,68,87':(hues[v('hue')]||hues.a),m=+v('mist');
    lay.style.setProperty('--beamrgb',red?'255,68,87':(beams[v('hue')]||beams.a));
    var mistOn=!!(on||(typeof fillProgress==='function'&&fillProgress()*fillCap()>0.002));
    if(mistOn){
      for(var i=0;i<P.length;i++){var q=P[i],x=((q.x+t*.0000045*q.s)%1+1)%1*w*1.4-w*.2,y=q.y*h+Math.sin(t*.00021+q.p)*h*.03,R=q.r*Math.max(w,h);
        var gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,'rgba('+col+','+(.075*m)+')');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(0,0,w,h)}
      lay.style.setProperty('--sweep',((t*.0025)%360).toFixed(1)+'deg');
    }
    var dt=fogLast?Math.min(48,t-fogLast):16;fogLast=t;
    stepFog(t,dt);
    drawFog(w,h,col);
    raf=requestAnimationFrame(draw)}
  function paint(){applyFillVisual()}

  /* white noise: A white · B pink · C brown, with a slow breath */
  var N=null;
  function noise(){var c=ac();if(!c)return null;if(N)return N;
    var len=c.sampleRate*4,buf=c.createBuffer(2,len,c.sampleRate);
    for(var ch=0;ch<2;ch++){var d=buf.getChannelData(ch);for(var j=0;j<len;j++)d[j]=Math.random()*2-1}
    var src=c.createBufferSource();src.buffer=buf;src.loop=true;
    var lp=c.createBiquadFilter();lp.type='lowpass';var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=30;
    var gn=c.createGain();gn.gain.value=0;var lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.07;lfo.connect(lg);
    var br=c.createGain();br.gain.value=1;lg.connect(br.gain);
    src.connect(hp);hp.connect(lp);lp.connect(br);br.connect(gn);gn.connect(c.destination);src.start();lfo.start();
    N={src:src,lp:lp,hp:hp,gn:gn,lg:lg};return N}
  function tone(){if(!N)return;var c=AC,col=v('col');N.lp.frequency.setTargetAtTime(col==='a'?14000:col==='b'?2600:650,c.currentTime,.3);N.lg.gain.setTargetAtTime(.35*(+v('breath')),c.currentTime,.3);level()}
  function level(){if(!N)return;var lit=$('#lit-audio'),duck=lit&&!lit.paused?.35:1,col=v('col'),k=col==='a'?.08:col==='b'?.16:.32;
    N.gn.gain.setTargetAtTime((wnOn||wnAuto)?(+v('vol'))*k*duck:0,AC.currentTime,(wnOn||wnAuto)?.8:1.05)}
  var wnOn=false,wnAuto=0;
  /* atmosphere fill: session-only, slow rise from our minimums toward a modest cap.
     air on = full; air off = dark (minimum + fill). White noise is never started here. */
  var fillStart=Date.now(),fillLit=0,fillWn=0,gestured=0,syncingDim=0;
  var MIN_MIST=0.05,MIN_LIGHT=0.04;
  function tv(k,fb){var g=window.GJ12,v=g&&g.val?+g.val(k):fb;return isNaN(v)?fb:v}
  function fillSpeed(){return Math.max(.3,Math.min(3,tv('afillspd',1)))}
  function fillCap(){return Math.max(.05,Math.min(1,tv('afillcap',.22)))}
  function fillProgress(){var tau=520/fillSpeed(),sec=(Date.now()-fillStart)/1000,p=1-Math.exp(-sec/tau);return Math.max(0,Math.min(1,p+fillLit+fillWn))}
  function fillActive(){return !!(on||fillProgress()*fillCap()>0.002||fogOn())}
  function applyFillVisual(){
    var cap=fillCap(),p=fillProgress(),mist1=+v('mist'),light1=+v('light'),mist,light,vis;
    if(on){mist=mist1;light=light1;vis=1;de.classList.add('atmos');de.classList.remove('atmos-fill')}
    else{
      var k=p*cap;
      mist=MIN_MIST+Math.max(0,mist1-MIN_MIST)*k;
      light=MIN_LIGHT+Math.max(0,light1-MIN_LIGHT)*k;
      vis=k<=0?0:Math.max(0.05,Math.min(0.42,k*0.9));
      de.classList.remove('atmos');
      de.classList.toggle('atmos-fill',k>0.002);
    }
    if(fogOn()){
      vis=Math.max(vis,1);
      lay.classList.toggle('fog-only',!on&&(p*cap)<=0.002);
    }else lay.classList.remove('fog-only');
    lay.style.setProperty('--light',(+light).toFixed(3));
    lay.style.setProperty('--mist',(+mist).toFixed(3));
    lay.style.setProperty('--atmosvis',(+vis).toFixed(3));
    var red=de.classList.contains('red'),beams={a:'255,240,226',b:'255,214,176',c:'232,196,120'};
    lay.style.setProperty('--beamrgb',red?'255,68,87':(beams[v('hue')]||beams.a));
    if(needsDraw()&&!raf)raf=requestAnimationFrame(draw);
  }
  function setAir(x){on=!!x;de.classList.toggle('atmos',on);ab.setAttribute('aria-pressed',on?'true':'false');ab.classList.toggle('on',on);
    applyFillVisual();
    /* do not start or stop white noise here — #airbtn is ambient-only; audio only after a gesture, never from fill */
  }
  ab.addEventListener('click',function(){setAir(!on)});
  ;['pointerdown','keydown','touchstart'].forEach(function(ev){document.addEventListener(ev,function(){gestured=1},true)});
  setInterval(function(){
    var lit=$('#lit-audio');
    if(lit&&!lit.paused&&!lit.ended)fillLit=Math.min(0.45,fillLit+0.004);
    applyFillVisual();
  },1000);
  function onLitPlay(){fillLit=Math.min(0.45,fillLit+0.08);applyFillVisual()}
  function onWhiteNoise(){fillWn=Math.max(fillWn,0.55);fillLit=Math.max(fillLit,0.3);applyFillVisual()}
  function fromDimmer(d){
    if(syncingDim)return;syncingDim=1;
    d=Math.max(0,Math.min(1,+d||0));
    var floor=0.12;
    S.light=Math.round((floor+d*(Math.max(+D.light,.5)-floor))*100)/100;
    S.mist=Math.round((floor+d*(Math.max(+D.mist,.55)-floor))*100)/100;
    save();applyFillVisual();
    $$('.airtune input[data-air]').forEach(function(i){var k=i.getAttribute('data-air');if(k==='light'||k==='mist'){i.value=v(k);if(i.nextSibling)i.nextSibling.textContent=i.value}});
    syncingDim=0;
  }
  function toDimmer(){var floor=0.12,span=Math.max(0.01,+D.light-floor);return Math.max(0,Math.min(1,((+v('light'))-floor)/span))}
  function setElapsed(sec){fillStart=Date.now()-Math.max(0,sec)*1000;applyFillVisual();return fillProgress()}

  var lit=$('#lit-audio');if(lit)['play','pause','ended'].forEach(function(e){lit.addEventListener(e,function(){level()})});
  function setWn(x,col){
    wnOn=!!x;
    de.classList.toggle('wn-on',wnOn);
    if(col){S.col=col;save()}
    if(wnOn){noise();tone();level()}else{level()}
  }

  /* ---------- esc: back to the site ---------- */
  function off(){if(on)setAir(false)}
  var ax=document.createElement('button');ax.type='button';ax.id='atmosx';ax.setAttribute('aria-label','esc');ax.innerHTML='\u00d7';
  document.body.appendChild(ax);
  function exitAir(){if(!on)return;off();if(window.GJ12){try{if(window.TUNE){}}catch(e){}if(GJ12.exitAir)GJ12.exitAir();else{TUNE_AIR_SYNC()}}}
  function TUNE_AIR_SYNC(){if(window.GJ12&&GJ12.exitAir)GJ12.exitAir()}
  ax.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(window.GJ12&&GJ12.exitAir)GJ12.exitAir();else off()});
  /* Esc / pinch / double-tap leave air only through stepBack when already on the sky, so a piece can keep noise if he chose it */
  document.addEventListener('keydown',function(e){if(e.key!=='Escape'||!on)return;if($('#lb.on,#full.on,#wall.on,#all.on,#tune,#find.on'))return;if(de.classList.contains('in')||de.classList.contains('tune-on'))return;e.preventDefault();if(window.GJ12&&GJ12.exitAir)GJ12.exitAir();else off()},true);

  /* ---------- tuning: added to Tune when it opens ---------- */
  function rowR(k,lab,a,b,s){return '<label><i class="tg" data-g="'+k+'"></i><span class="tl">'+lab+'</span><input type="range" data-air="'+k+'" min="'+a+'" max="'+b+'" step="'+s+'" value="'+v(k)+'"><output>'+v(k)+'</output></label>'}
  function rowC(k,lab,opts){return '<div class="abc"><i class="tg" data-g="'+k+'"></i><span>'+lab+'</span>'+opts.map(function(o){return '<button type="button" data-airc="'+k+'" data-v="'+o[0]+'"'+(v(k)===o[0]?' class="on"':'')+'>'+o[1]+'</button>'}).join('')+'</div>'}
  function fillAir(box){
    box.innerHTML='<p class="tune-h">atmosphere</p>'+rowR('mist','mist',0,1.6,.05)+rowR('light','light',0,1.5,.05)+rowC('hue','light colour',[['a','A cool'],['b','B warm'],['c','C gold']])+rowR('fog','fog',0,1,.02)+rowR('fogheight','fog height',0,1,.02)+rowR('fogspeed','fog speed',0,1,.02)+'<div class="fog-dir"><i class="tg" data-g="fogdir"></i><span>fog direction</span><div class="fog-pad" role="application" aria-label="fog direction" data-airpad="fogdir"><i></i></div></div>'+rowR('vol','white noise volume',0,1,.02)+rowR('breath','noise breath',0,1,.05)+rowC('col','noise',[['a','A white'],['b','B pink'],['c','C brown']]);
    $$('input[data-air]',box).forEach(function(i){i.value=v(i.getAttribute('data-air'));if(i.nextSibling)i.nextSibling.textContent=i.value});
    $$('[data-airc]',box).forEach(function(b){b.classList.toggle('on',String(v(b.getAttribute('data-airc')))===b.getAttribute('data-v'))});
    function paintFogPad(){
      var pad=box.querySelector('.fog-pad'),kn=pad&&pad.querySelector('i');if(!kn)return;
      var x=Math.max(-1,Math.min(1,+v('fogdx')||0)),y=Math.max(-1,Math.min(1,+v('fogdy')||0));
      kn.style.left=((x+1)/2*100)+'%';kn.style.top=((1-y)/2*100)+'%';
    }
    paintFogPad();if(GJ12.paintFaces)GJ12.paintFaces();
    (function bindPad(){
      var pad=box.querySelector('.fog-pad');if(!pad||pad._bound)return;pad._bound=1;
      function at(e){
        var r=pad.getBoundingClientRect(),x=((e.clientX-r.left)/Math.max(1,r.width))*2-1,y=1-((e.clientY-r.top)/Math.max(1,r.height))*2;
        S.fogdx=Math.round(Math.max(-1,Math.min(1,x))*100)/100;
        S.fogdy=Math.round(Math.max(-1,Math.min(1,y))*100)/100;
        save();paintFogPad();paint();if(GJ12.paintFaces)GJ12.paintFaces();
      }
      var down=0;
      pad.addEventListener('pointerdown',function(e){down=1;try{pad.setPointerCapture(e.pointerId)}catch(err){}at(e);e.preventDefault()});
      pad.addEventListener('pointermove',function(e){if(down){at(e);e.preventDefault()}});
      function up(){down=0};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
    })();
    box.addEventListener('input',function(e){var k=e.target.getAttribute('data-air');if(!k)return;S[k]=+e.target.value;if(e.target.nextSibling)e.target.nextSibling.textContent=e.target.value;save();paint();if(GJ12.paintFaces)GJ12.paintFaces();if(wnOn)tone();if((k==='light'||k==='mist')&&!syncingDim&&window.GJ12&&GJ12.setDimmerFromAir){syncingDim=1;try{GJ12.setDimmerFromAir(toDimmer())}catch(err){}syncingDim=0}});
    box.addEventListener('click',function(e){var k=e.target.getAttribute&&e.target.getAttribute('data-airc');if(!k)return;S[k]=e.target.getAttribute('data-v');$$('[data-airc="'+k+'"]',box).forEach(function(b){b.classList.toggle('on',b===e.target)});save();paint();if(GJ12.paintFaces)GJ12.paintFaces();if(wnOn)tone()});
  }
  function addTune(t){if(!t||t._air)return;t._air=1;
    var slots=[].slice.call(t.querySelectorAll('.air-slot'));
    if(slots.length){slots.forEach(function(sl){sl.innerHTML='';var box=document.createElement('div');box.className='airtune';sl.appendChild(box);fillAir(box)});return}
    var box=document.createElement('div');box.className='airtune';
    var rs=t.querySelector('[data-reset]');if(rs&&rs.parentNode)rs.parentNode.insertBefore(box,rs);else (t.querySelector('.tune-body')||t).appendChild(box);
    fillAir(box)}
  function resetAir(){S={};try{localStorage.removeItem(LSK)}catch(e){}paint();tone();
    $$('.airtune').forEach(function(box){$$('input[data-air]',box).forEach(function(i){i.value=v(i.getAttribute('data-air'));if(i.nextSibling)i.nextSibling.textContent=i.value});
      $$('[data-airc]',box).forEach(function(b){b.classList.toggle('on',String(v(b.getAttribute('data-airc')))===b.getAttribute('data-v'))})})}
  var mo=new MutationObserver(function(){var t=$('#tune');if(t)addTune(t)});mo.observe(document.body,{childList:true});

  /* ---------- the floating moon keeps clear of the stars (the moon dial is off by default; Tune can turn it back on) ---------- */
  var slot=$('#moonslot'),mb=$('#moon');
  if(slot&&mb){
    /* keep clear: slide the moon up or down the right edge to a spot with no star, name or Spirit Eye under it */
    var dy=0;
    function boxes(){var L=[];$$('#room a.st').forEach(function(a){var r=a.getBoundingClientRect(),os=parseFloat(getComputedStyle(a).getPropertyValue('--os'))||0,eye=a.classList.contains('eye'),R=eye?r.width/2:Math.max(14,os/2),cx=r.left+r.width/2,cy=r.top+r.height/2;L.push([cx-R,cy-R,cx+R,cy+R]);var lb=a.querySelector('b');if(lb){var q=lb.getBoundingClientRect();if(q.width&&getComputedStyle(lb).opacity>.05)L.push([q.left,q.top,q.right,q.bottom])}});return L}
    function clear(){var inWork=de.classList.contains('in'),sky=$('#sky');if(inWork||!sky){if(dy){dy=0;slot.style.transform=''}return}
      var sr=sky.getBoundingClientRect();if(sr.bottom<0||sr.top>innerHeight){return}
      var base=slot.getBoundingClientRect(),h=base.height,w=base.width,x0=base.left-14,x1=base.right+14,y0=base.top-dy,B=boxes();
      function free(o){var t=y0+o-14,b=y0+o+h+14;if(t<64||b>innerHeight-90)return false;for(var i=0;i<B.length;i++){var q=B[i];if(q[0]<x1&&q[2]>x0&&q[1]<b&&q[3]>t)return false}return true}
      var C=[0];for(var k=1;k<14;k++){C.push(k*24);C.push(-k*24)}var best=dy;for(var j=0;j<C.length;j++)if(free(C[j])){best=C[j];break}
      if(best!==dy){dy=best;slot.style.transform='translateY('+dy+'px)'}}
    slot.style.transition='transform .7s cubic-bezier(.2,.8,.2,1)';setInterval(clear,300);addEventListener('resize',clear);clear();
    window.GJ12.moonClear=function(){clear();return dy};
  }

  /* ---------- find: a quick search of the works ---------- */
  var fb=document.createElement('button');fb.type='button';fb.id='findbtn';fb.setAttribute('aria-label','find a work');fb.innerHTML='<span class="l">find</span><span class="s" aria-hidden="true">⌕</span>';
  if(top)top.insertBefore(fb,ab);
  var fp=document.createElement('div');fp.id='find';fp.setAttribute('role','dialog');fp.setAttribute('aria-label','find a work');
  fp.innerHTML='<input type="search" placeholder="all works, or type to filter" aria-label="find a work" autocomplete="off" spellcheck="false"><ul role="listbox"></ul>';
  document.body.appendChild(fp);var fi=$('input',fp),fl=$('ul',fp);
  function norm(t){return (t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
  var W=$$('main > section.plate').map(function(p){var t=(p.querySelector('h2')||{}).textContent||p.id,g=p.getAttribute('data-sec')||'';
    var kw=[t,g,p.id].concat($$('.cap,.role,.kick',p).map(function(x){return x.textContent})).concat($$('[data-cap],[data-alt]',p).map(function(x){return (x.getAttribute('data-cap')||'')+' '+(x.getAttribute('data-alt')||'')})).join(' ');
    return {id:p.id,t:t,g:g,k:norm(kw)}});
  var sel=0,res=[];
  function list(){var q=norm(fi.value).trim(),w=q.split(/\s+/).filter(Boolean);res=W.filter(function(o){return !w.length||w.every(function(x){return o.k.indexOf(x)>=0})});sel=0;
    var html='',last='';
    res.forEach(function(o,i){if(o.g&&o.g!==last){html+='<li class="grp" role="presentation">'+o.g.replace(/</g,'&lt;')+'</li>';last=o.g}
      html+='<li role="option" data-id="'+o.id+'"'+(i===sel?' aria-selected="true" class="on"':'')+'><b>'+o.t.replace(/</g,'&lt;')+'</b></li>'});
    fl.innerHTML=html||'<li class="none">nothing by that name yet</li>'}
  function inFind(e){var t=e&&e.target;if(t&&t.nodeType===3)t=t.parentNode;if(t&&(fp.contains(t)||fb.contains(t)||(t.closest&&t.closest('#find,#findbtn'))))return true;if(e&&e.composedPath){var p=e.composedPath();for(var i=0;i<p.length;i++)if(p[i]===fp||p[i]===fb)return true}return false}
  function openFind(){fp.classList.add('on');fi.value='';list();openFind._guard=Date.now()+500;
    var coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches||innerWidth<700;
    if(!coarse)setTimeout(function(){fi.focus()},30)}
  function closeFind(){fp.classList.remove('on');fi.blur();if(typeof hideHint==='function')hideHint()}
  function goTo(id){closeFind();hideHint();if(!id)return;if(id==='white-noise'||id==='wn'||id==='wn-card')return;
    if(window.GJ12){GJ12._navLock=Date.now()+800;GJ12._closedAt=0;GJ12._closedId=null}
    function go(){if(window.GJ12){GJ12._closedAt=0;GJ12._closedId=null;GJ12._navLock=Date.now()+800}
      if(window.GJ12&&GJ12.shutNavOverlays)try{GJ12.shutNavOverlays()}catch(err){}
      if(window.GJ12&&GJ12.openPiece)GJ12.openPiece(id);
      else if(window.GJ12&&GJ12.gotoPlate)GJ12.gotoPlate(id);
      else location.hash='#'+id}
    var overlay=$('#all.on')||$('#wall.on')||$('#full.on')||$('#lb.on');
    if(overlay){if(window.GJ12&&GJ12.shutNavOverlays)try{GJ12.shutNavOverlays()}catch(err){}setTimeout(go,60)}else go()}

  fb.addEventListener('click',function(){fp.classList.contains('on')?closeFind():openFind()});
  fi.addEventListener('input',list);
  /* only a tap outside the panel, or Esc, closes it; touches inside never do */
  function stopFind(e){if(fp.classList.contains('on')&&inFind(e)){if(e.target&&e.target.closest&&e.target.closest('li[data-id]'))return;e.stopPropagation()}}
  ;['pointerdown','pointerup','click','touchstart','touchend','touchmove','focusin','scroll'].forEach(function(ev){fp.addEventListener(ev,stopFind,true);fl.addEventListener(ev,stopFind,true)});
  fi.addEventListener('focus',stopFind);
  document.addEventListener('pointerdown',function(e){if(!fp.classList.contains('on'))return;if(inFind(e)||Date.now()<(openFind._guard||0))return;closeFind()},true);
  fi.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!res.length)return;sel=(sel+(e.key==='ArrowDown'?1:-1)+res.length)%res.length;$$('li[data-id]',fl).forEach(function(l,i){l.classList.toggle('on',i===sel);l.setAttribute('aria-selected',i===sel?'true':'false')})}
    if(e.key==='Enter'){e.preventDefault();if(res[sel])goTo(res[sel].id)}});
  function pickFind(e){var t=e.target;if(!t||!t.closest)return;var li=t.closest('li[data-id]');if(!li)return;e.preventDefault();e.stopPropagation();if(pickFind._lock)return;pickFind._lock=1;setTimeout(function(){pickFind._lock=0},400);goTo(li.getAttribute('data-id'))}
  fp.addEventListener('pointerdown',pickFind,true);fl.addEventListener('pointerdown',pickFind,true);fl.addEventListener('click',pickFind);fl.addEventListener('touchend',pickFind,{passive:false});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&fp.classList.contains('on')){e.preventDefault();e.stopImmediatePropagation();closeFind();return}
    if(e.key==='/'&&!fp.classList.contains('on')&&!/input|textarea|select/i.test((document.activeElement||{}).tagName||'')){e.preventDefault();openFind()}},true);
  /* pull down from the top edge only, with a hint; never on hold */
  var hint=document.createElement('div');hint.id='findhint';hint.setAttribute('aria-hidden','true');hint.innerHTML='<span>find</span>';document.body.appendChild(hint);
  function hideHint(){hint.classList.remove('on','ready');hint.style.transform=''}
  function tv(k,fb){var t=window.GJ12&&GJ12.tune;var v=t&&t[k]!=null?+t[k]:(window.GJ12&&GJ12.val?+GJ12.val(k):fb);return isNaN(v)?fb:v}
  function pullNeed(){return Math.max(36,tv('pulldist',70)/Math.max(.4,tv('findpull',1)))}
  function pullEdge(){var st=parseFloat(getComputedStyle(de).getPropertyValue('--st'))||0;return tv('pulledge',60)+st}
  function pullBlocked(t){
    if(!t||!t.closest)return true;
    if(t.closest('#find,#findbtn,#findhint,#room,#rail,.dial,.ticks,.grail,.vrail,#now,#tune,#lb,#all,#wall,#full,#esc,#disc,#red,#redpad,button,a,input,textarea,select,canvas,.st,.player,.plate'))return true;
    if(de.classList.contains('in')||de.classList.contains('tune-on'))return true;
    if($('#all.on')||$('#wall.on')||$('#lb.on')||$('#full.on')||(fp&&fp.classList.contains('on')))return true;
    return false;
  }
  var py=null,px=0,pStart=0,pHold=0,pMoved=0;
  function clearPull(){if(pHold){clearTimeout(pHold);pHold=0}py=null;pMoved=0;hideHint()}
  addEventListener('touchstart',function(e){
    clearPull();
    if(e.touches.length!==1)return;
    var _sy=window.scrollY||0,_pt=window.GJPT&&GJPT.top?GJPT.top():0;if(_sy>2&&!(_pt&&Math.abs(_sy-_pt)<=2))return;/* cks21-pi-top: the top of the sky counts as the top */

    var t=e.touches[0];
    if(t.clientY>pullEdge())return;
    if(pullBlocked(e.target))return;
    py=t.clientY;px=t.clientX;pStart=Date.now();pMoved=0;
    pHold=setTimeout(function(){if(py!=null&&pMoved<12)clearPull()},380);
  },{passive:true});
  addEventListener('touchmove',function(e){
    if(py==null)return;
    if(e.touches.length!==1){clearPull();return}
    var t=e.touches[0],dy=t.clientY-py,dx=t.clientX-px;
    pMoved=Math.max(pMoved,Math.hypot(dx,dy));
    if(dy>10&&Math.abs(dx)>dy*.7){clearPull();return}
    if(dy<8)return;
    if(pHold){clearTimeout(pHold);pHold=0}
    var need=pullNeed(),p=Math.max(0,Math.min(1.15,dy/need));
    hint.classList.add('on');hint.classList.toggle('ready',p>=1);
    hint.style.transform='translate(-50%,'+Math.round(Math.min(28,p*22))+'px)';
  },{passive:true});
  addEventListener('touchend',function(e){
    if(py==null)return;
    var t=(e.changedTouches&&e.changedTouches[0])||{};
    var dy=(t.clientY||0)-py,dx=(t.clientX||0)-px,need=pullNeed();
    var ok=dy>=need&&Math.abs(dx)<=dy*.7&&pMoved>=12&&!fp.classList.contains('on');
    clearPull();
    if(ok)openFind();
  },{passive:true});
  addEventListener('touchcancel',function(){clearPull()},{passive:true});
  addEventListener('touchend',function(){py=null},{passive:true});
  /* White Noise title card: only opened from the end of Lost in Time. Existing wording only. */
  var wnCard=document.getElementById('wn-card');
  if(!wnCard){
    wnCard=document.createElement('div');
    wnCard.id='wn-card';
    wnCard.setAttribute('role','dialog');
    wnCard.setAttribute('aria-label','Lost in Time');
    wnCard.innerHTML='<div class="wn-inner"><p class="wn-title">Lost in Time</p><div class="wn-colors" role="group"><button type="button" data-wn="a">A white</button><button type="button" data-wn="b">B pink</button><button type="button" data-wn="c">C brown</button><button type="button" data-wn="lit">Lost in Time</button></div></div>';
    document.body.appendChild(wnCard);
  }
  function paintWnBtns(){
    $$('[data-wn]',wnCard).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-wn')===srcNow())});
  }
  wnCard.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-wn]');
    if(!b)return;
    e.preventDefault();e.stopPropagation();
    pickSrc(b.getAttribute('data-wn'));
    paintWnBtns();
  });
  function openWn(){
    wnCard.classList.add('on');
    de.classList.add('wn-on');
    paintWnBtns();
    setWn(true,v('col'));
  }
  function closeWn(){
    var was=wnCard.classList.contains('on')||wnOn;
    wnCard.classList.remove('on');
    de.classList.remove('wn-on');
    setWn(false);
    if(!was)return;
    if(window.GJ12&&GJ12.openPiece)GJ12.openPiece('lost-in-time');
    else if(window.GJ12&&GJ12.gotoPlate)GJ12.gotoPlate('lost-in-time');
  }
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(!wnCard.classList.contains('on'))return;
    e.preventDefault();e.stopPropagation();
    closeWn();
  },true);
  window.GJ12=window.GJ12||{};GJ12.air={set:setAir,on:function(){return on},noise:function(){return N?{gain:N.gn.gain.value,lp:N.lp.frequency.value}:null},reset:resetAir,fromDimmer:fromDimmer,toDimmer:toDimmer,setFog:function(o){if(!o)return;['fog','fogheight','fogspeed','fogdx','fogdy'].forEach(function(k){if(o[k]!=null)S[k]=+o[k]});save();F=[];fogLayout();paint()},fog:function(){return {fog:+v('fog')||0,fogheight:+v('fogheight')||0,fogspeed:+v('fogspeed')||0,fogdx:+v('fogdx')||0,fogdy:+v('fogdy')||0}}};
  GJ12.atmosFill={progress:fillProgress,cap:fillCap,speed:fillSpeed,setElapsed:setElapsed,onLitPlay:onLitPlay,onWhiteNoise:onWhiteNoise,apply:applyFillVisual,mins:function(){return {mist:MIN_MIST,light:MIN_LIGHT}},gestured:function(){return !!gestured}};
  GJ12.wn={open:openWn,close:closeWn,on:function(){return wnCard.classList.contains('on')},set:setWn,probe:function(){if(!N)return null;var lit=$('#lit-audio'),duck=lit&&!lit.paused?.35:1,col=v('col'),k=col==='a'?.08:col==='b'?.16:.32;return {lowpass:N.lp.frequency.value,highpass:N.hp.frequency.value,gain:N.gn.gain.value,breath:N.lg.gain.value,col:col,on:wnOn,k:k,duck:duck,vol:+v('vol'),target:(wnOn||wnAuto)?(+v('vol'))*k*duck:0,auto:!!wnAuto,fs:!!(typeof isFs==='function'&&isFs()),pi:!!(typeof isPi==='function'&&isPi()),ctx:AC&&AC.state}}};

  /* auto white noise: on when the site is full screen, or when the permanent-impermanence top screen (#pitop, html.pt-free) is active.
     Starts on the full-screen request itself (a user gesture) or on the first tap/click/key while on that top screen, then fades in (gain from 0, no click).
     Fades out on leaving either, unless the person switched the noise on themselves (setWn). Audio only; does not open the card or change the moon source.
     This is the only override of "white noise is never started here". */
  var wnAuto=0, piGestured=0;
  function isFs(){return !!(document.fullscreenElement||document.webkitFullscreenElement||document.msFullscreenElement)}
  function isPi(){
    var sec=document.getElementById('pitop')||document.getElementById('pi')||document.getElementById('pi-top')||document.querySelector('[data-pi-top]');
    if(!sec)return false;
    if(document.documentElement.classList.contains('pt-free'))return true;
    var top=(window.GJPT&&typeof GJPT.top==='function')?GJPT.top():(sec.offsetHeight||0);
    if(!top)return false;
    return (window.scrollY||0)<top-8}
  function wantAuto(){return isFs()||isPi()}
  function autoEnter(){
    var c=ac();if(!c)return;
    if(c.state==='suspended'){var p=c.resume();if(p&&p.catch)p.catch(function(){})}
    if(!N)noise();
    if(!wnAuto&&N){try{N.gn.gain.cancelScheduledValues(c.currentTime);N.gn.gain.setValueAtTime(N.gn.gain.value||0,c.currentTime)}catch(e){}}
    wnAuto=1;tone();level()}
  function autoLeave(){if(!wnAuto)return;wnAuto=0;level()}
  function autoSync(){if(wantAuto()){if(isFs()||piGestured)autoEnter()}else if(wnAuto)autoLeave()}
  function wrapFs(proto,name){var orig=proto[name];if(typeof orig!=='function'||orig._wnAuto)return;var w=function(){try{if(!wnOn)autoEnter()}catch(e){}return orig.apply(this,arguments)};w._wnAuto=1;try{proto[name]=w}catch(e){}}
  wrapFs(Element.prototype,'requestFullscreen');wrapFs(Element.prototype,'webkitRequestFullscreen');wrapFs(Element.prototype,'mozRequestFullScreen');wrapFs(Element.prototype,'msRequestFullscreen');
  ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function(t){document.addEventListener(t,autoSync)});
  ['pointerdown','click','keydown','touchstart'].forEach(function(t){document.addEventListener(t,function(){if(isPi()){piGestured=1;autoSync()}},true)});
  addEventListener('scroll',function(){if(isPi()||wnAuto)autoSync()},{passive:true});
  new MutationObserver(function(){if(isPi()||wnAuto||document.getElementById('pitop')||document.getElementById('pi'))autoSync()}).observe(document.documentElement,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  GJ12.wnAuto={on:function(){return !!wnAuto},manual:function(){return !!wnOn},isFs:isFs,isPi:isPi,sync:autoSync,enter:autoEnter,leave:autoLeave};

/* sound source selector: Lost in Time (default, #lit-audio) or the live atmosphere noise A white, B pink, C brown. Not saved anywhere, so a restore can never put noise first. */
  function srcNow(){return wnOn?String(v('col')):'lit'}
  function paintSrc(){$$('[data-wn]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-wn')===srcNow())})}
  function pickSrc(k){
    var au=$('#lit-audio');
    if(k==='lit'){var carded=wnCard.classList.contains('on');setWn(false);
      if(carded){wnCard.classList.remove('on');de.classList.remove('wn-on');if(au){try{au.currentTime=0}catch(e){}GJ12._litUserPause=performance.now();var p=au.play();if(p&&p.catch)p.catch(function(){})}if(window.GJ12&&GJ12.openPiece)GJ12.openPiece('lost-in-time')}}
    else setWn(true,k);
    paintSrc()}
  GJ12.audioSrc={get:srcNow,set:pickSrc,paint:paintSrc};
  function addNowSel(){var n=document.getElementById('now');if(!n)return false;if(n.querySelector('.now-src'))return true;
    var d=document.createElement('div');d.className='now-src';d.setAttribute('role','group');d.setAttribute('aria-label','sound');
    d.innerHTML='<button type="button" data-wn="lit">Lost in Time</button><button type="button" data-wn="a">A white</button><button type="button" data-wn="b">B pink</button><button type="button" data-wn="c">C brown</button>';
    n.appendChild(d);
    d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-wn]');if(!b)return;e.preventDefault();e.stopPropagation();pickSrc(b.getAttribute('data-wn'))});
    ['pointerdown','pointerup','touchstart'].forEach(function(t){d.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
    paintSrc();return true}
  var _nt=0;(function tryNow(){if(!addNowSel()&&_nt++<60)setTimeout(tryNow,150)})();

  GJ12.find={open:openFind,close:closeFind,on:function(){return fp.classList.contains('on')}};
  applyFillVisual();

}
/* run after the site's own start-up, so the player, esc and tune already exist */
if(document.readyState==='complete')setTimeout(go,0);else addEventListener('load',function(){setTimeout(go,0)});
})();
