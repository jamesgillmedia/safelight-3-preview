(function(){
  var PUB = window.CKS_PUBLISH || null;
  function src(path){
    if(!PUB) return path;
    if(path.indexOf('media/av/')===0) return PUB.av + path.slice(9);
    if(path.indexOf('media/audio/')===0) return PUB.audio + path.slice(12);
    if(path.indexOf('media/weird-kid/')===0) return PUB.wk + path.slice(16);
    if(path.indexOf('media/owtd/')===0) return PUB.owtd + path.slice(11);
    if(path.indexOf('media/posters/')===0) return PUB.posters + path.slice(14);
    if(/^media\/stills\/(\d{2}-|05-hanging)/.test(path)) return PUB.stills + path.slice(13);
    if(path.indexOf('media/stills/')===0) return PUB.photos + path.slice(13);
    return path;
  }

  var WORKS = [
    {
      id:'sculpture',
      title:'A hanging sculpture',
      year:'',
      medium:'Photograph, sculpture',
      about:'The piece on a plain wall, a branch curving down. A short clip from Weird Kid sits with it.',
      hero:'media/stills/hanging-sculpture-sunlight-d290ef9b.jpg',
      pos:'center 30%',
      ratio:'r45',
      gallery:[
        'media/stills/05-hanging-sculpture-bw.jpg'
      ],
      details:[
        'media/stills/hanging-sculpture-head-9a457e08.jpg',
        'media/stills/hanging-sculpture-head-4ba2ab74.jpg'
      ],
      film:{
        label:'From Weird Kid',
        src:'media/weird-kid/clips/wk-horse-rears.mp4',
        poster:'media/weird-kid/clips/wk-horse-rears.jpg',
        stills:[
          'media/weird-kid/stills/wk-forest-floor.jpg',
          'media/weird-kid/stills/wk-forest-path.jpg',
          'media/weird-kid/stills/wk-raven.jpg'
        ]
      }
    },
    {
      id:'cup',
      title:'A ceramic cup',
      year:'2024',
      medium:'Photograph, ceramic',
      about:'A small cup of coffee on a wooden board, the glaze catching the light.',
      hero:'media/stills/02-speckled-cup-2024.jpg',
      pos:'center',
      ratio:'r45',
      gallery:[
        'media/stills/cup-hand-cd63215d.jpg',
        'media/stills/cup-from-above-1341.jpg'
      ]
    },
    {
      id:'scoop',
      title:'A ceramic ice cream scoop',
      year:'',
      medium:'Photograph, ceramic',
      about:'Held in the hand, the glaze catching the light.',
      hero:'media/stills/scoop-hand-2aea8932.jpg',
      pos:'center',
      ratio:'r45',
      gallery:[
        'media/stills/scoop-side-full.jpg',
        'media/stills/scoop-in-hand-full.jpg'
      ]
    },
    {
      id:'paddle',
      title:'A carved paddle',
      year:'2023',
      medium:'Wood, photograph',
      about:'Close on the blade, the grain and the carved hollow catching the light.',
      hero:'media/stills/01-paddle-blade-grain-2023.jpg',
      pos:'center',
      ratio:'r45',
      gallery:[
        'media/stills/paddle-close-grain.webp'
      ]
    },
    {
      id:'spirit-eye',
      title:'Spirit Eye of skwácháýs',
      year:'2025',
      medium:'Public art concept, with Joshua Ngenda, BIDC Public Art Intensive, Vancouver',
      about:'A giant lens floating on the water in a ring, like a Salish spindle whorl, with the glass at the centre. A column carries its light down to a forest garden underground.',
      hero:'media/stills/09-spirit-eye-from-above-2025.jpg',
      pos:'center',
      ratio:'rland',
      gallery:[
        'media/stills/10-spirit-eye-section-2025.jpg'
      ]
    },
    {
      id:'canopy',
      title:'Forest canopy in mist',
      year:'',
      medium:'Photograph',
      about:'Looking straight up, light falling through the fog.',
      hero:'media/stills/07-forest-canopy.jpg',
      pos:'center',
      ratio:'r45',
      gallery:[]
    },
    {
      id:'rosebuds',
      title:'Rosebuds',
      year:'',
      medium:'Photograph',
      about:'Two buds in a bar of window light, their shadows on the wall.',
      hero:'media/stills/08-rosebuds-photograph.jpg',
      pos:'center 40%',
      ratio:'r45',
      gallery:[]
    },
    {
      id:'moss',
      title:'Moss and pinecones in a small vessel',
      year:'',
      medium:'Photograph',
      about:'Window light throws the plant\'s shadow on the wall.',
      hero:'media/stills/06-moss-vessel.jpg',
      pos:'center',
      ratio:'r45',
      gallery:[]
    },
    {
      id:'wooden-scoop',
      title:'A wooden scoop',
      year:'',
      medium:'Photograph, wood',
      about:'Held in slat-window light, its shadow falling across the slats.',
      hero:'media/stills/04-scoop-hanging-slat-light.jpg',
      pos:'center',
      ratio:'r45',
      gallery:[]
    },
    {
      id:'rim',
      title:'The rim of a bowl',
      year:'',
      medium:'Photograph',
      about:'A thin crescent of light along the edge, like a moon.',
      hero:'media/stills/03-crescent-rim.jpg',
      pos:'center',
      ratio:'r45',
      gallery:[]
    },
    {
      id:'owtd',
      kind:'film',
      title:'One With the Devil',
      year:'',
      medium:'Short drama, cinematography',
      about:'A 1 minute 52 second excerpt from the opening. I was the cinematographer. Director Drew Pollins.',
      credits:'Gill James, cinematographer\nDrew Pollins, director\nLeo Award, Best Cinematography in a Short Drama, 2015\nCSC Student Cinematography Award, Panavision Canada, 2015',
      hero:'media/posters/owtd.jpg',
      pos:'center',
      ratio:'r235',
      video:'media/av/AV1-one-with-the-devil-excerpt-cinematography.mp4',
      gallery:[
        'media/owtd/stills/02_dallas_snow.jpg',
        'media/owtd/stills/03_colton_snow_trees.jpg',
        'media/owtd/stills/05_lantern_portrait.jpg',
        'media/owtd/stills/09_landscape.jpg'
      ]
    },
    {
      id:'colour',
      kind:'film',
      title:'Untitled colour work',
      year:'2022',
      medium:'Moving image, 8 seconds',
      about:'',
      hero:'media/posters/colour-field.jpg',
      pos:'center',
      ratio:'r45',
      portrait:true,
      video:'media/av/AV3-untitled-colour-field.mov',
      gallery:[]
    }
  ];

  var TRACKS = [
    {id:'lost-in-time', title:'Lost in Time', who:'Lost Coffee', dur:'3:36', src:'media/av/AV2-lost-coffee-lost-in-time.wav'},
    {id:'to-go', title:'To Go', who:'Lost Coffee', dur:'1:20', src:'media/audio/to-go.mp3'},
    {id:'gone', title:'Gone Are the Days of Yesterday', who:'Mothers Moniker', dur:'1:20', src:'media/audio/gone-are-the-days.mp3'},
    {id:'no-problem', title:'No Problem', who:'Lost Coffee', dur:'1:20', src:'media/audio/no-problem.mp3'},
    {id:'equals', title:'=', who:'Lost Coffee', dur:'1:30', src:'media/audio/equals.mp3'},
    {id:'ii', title:'ii', who:'Lost Coffee', dur:'1:10', src:'media/audio/ii.mp3'}
  ];

  var home=document.getElementById('home');
  var workEl=document.getElementById('work');
  var back=document.getElementById('back');
  var grid=document.getElementById('grid');
  var filmList=document.getElementById('filmList');
  var soundList=document.getElementById('soundList');
  var player=document.getElementById('player');
  var playerNow=document.getElementById('playerNow');
  var audio=document.getElementById('audio');
  var currentId=null;

  function objects(){ return WORKS.filter(function(w){ return w.kind!=='film'; }); }
  function films(){ return WORKS.filter(function(w){ return w.kind==='film'; }); }
  function find(id){ for(var i=0;i<WORKS.length;i++) if(WORKS[i].id===id) return WORKS[i]; }
  function idxOf(id){ for(var i=0;i<WORKS.length;i++) if(WORKS[i].id===id) return i; return -1; }

  function el(tag, cls, text){
    var n=document.createElement(tag);
    if(cls) n.className=cls;
    if(text!=null) n.textContent=text;
    return n;
  }

  function stopMedia(){
    document.querySelectorAll('video').forEach(function(v){ try{v.pause();}catch(e){} });
    if(audio && !audio.paused){ try{audio.pause();}catch(e){} }
  }

  function renderHome(){
    grid.innerHTML='';
    objects().forEach(function(w,i){
      var b=el('a','tile');
      b.href='#'+w.id;
      var frame=el('div','frame');
      var img=el('img');
      img.src=src(w.hero);
      img.alt=w.title;
      img.loading=i<3?'eager':'lazy';
      if(w.pos) img.style.objectPosition=w.pos;
      frame.appendChild(img);
      b.appendChild(frame);
      var cap=el('div','cap');
      cap.appendChild(el('span','ttl', w.title));
      if(w.year) cap.appendChild(el('span','yr', w.year));
      b.appendChild(cap);
      grid.appendChild(b);
    });

    filmList.innerHTML='';
    films().forEach(function(w){
      var card=el('div', w.portrait ? 'film-card portrait' : 'film-card');
      var poster=el('div','film-poster');
      var v=el('video');
      v.setAttribute('controls','');
      v.setAttribute('playsinline','');
      v.setAttribute('preload','metadata');
      v.poster=src(w.hero);
      var s=document.createElement('source');
      s.src=src(w.video);
      v.appendChild(s);
      v.addEventListener('play', function(){ pauseOthers(v); });
      poster.appendChild(v);
      card.appendChild(poster);
      var copy=el('div','film-copy');
      var h=el('h3');
      var a=el('a');
      a.href='#'+w.id;
      a.textContent=w.title;
      h.appendChild(a);
      copy.appendChild(h);
      var meta=[w.year,w.medium].filter(Boolean).join('  ·  ');
      if(meta) copy.appendChild(el('p','meta', meta));
      if(w.credits) copy.appendChild(el('p','credits', w.credits));
      else if(w.about) copy.appendChild(el('p','meta', w.about));
      card.appendChild(copy);
      filmList.appendChild(card);
    });

    soundList.innerHTML='';
    TRACKS.forEach(function(t){
      var b=el('button','track');
      b.type='button';
      b.setAttribute('data-track', t.id);
      var left=el('span','ttl', t.title);
      var right=el('span','who', t.who+'  ·  '+t.dur);
      b.appendChild(left);
      b.appendChild(right);
      b.addEventListener('click', function(){ playTrack(t); });
      soundList.appendChild(b);
    });
  }

  function pauseOthers(keep){
    document.querySelectorAll('video').forEach(function(v){ if(v!==keep) try{v.pause();}catch(e){} });
    if(audio && !audio.paused) try{audio.pause();}catch(e){}
  }

  function playTrack(t){
    document.querySelectorAll('.track').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-track')===t.id);
    });
    player.hidden=false;
    playerNow.textContent=t.title+'  ·  '+t.who;
    var url=src(t.src);
    if(audio.getAttribute('data-src')!==url){
      audio.src=url;
      audio.setAttribute('data-src', url);
    }
    document.querySelectorAll('video').forEach(function(v){ try{v.pause();}catch(e){} });
    audio.play().catch(function(){});
  }

  function showHome(){
    currentId=null;
    stopMedia();
    workEl.hidden=true;
    workEl.classList.remove('on');
    home.hidden=false;
    home.classList.add('on');
    back.hidden=true;
    window.scrollTo(0,0);
  }

  function showWork(id){
    var w=find(id);
    if(!w){ showHome(); return; }
    currentId=id;
    stopMedia();
    home.hidden=true;
    home.classList.remove('on');
    workEl.hidden=false;
    workEl.classList.add('on');
    back.hidden=false;

    var hero=document.getElementById('hero');
    hero.innerHTML='';
    hero.className='hero'+(w.portrait?' portrait':'');
    if(w.video){
      var v=el('video');
      v.setAttribute('controls','');
      v.setAttribute('playsinline','');
      v.setAttribute('preload','metadata');
      v.poster=src(w.hero);
      var s=document.createElement('source');
      s.src=src(w.video);
      v.appendChild(s);
      hero.appendChild(v);
    }else{
      var img=el('img');
      img.src=src(w.hero);
      img.alt=w.title;
      hero.appendChild(img);
    }

    document.getElementById('workName').textContent=w.title;
    var meta=[w.year,w.medium].filter(Boolean).join('  ·  ');
    document.getElementById('workMeta').textContent=meta;
    document.getElementById('workAbout').textContent=w.about||'';

    var gal=document.getElementById('gallery');
    gal.innerHTML='';
    var n=(w.gallery||[]).length;
    gal.className='gallery '+(w.ratio||'r45')+' count-'+n;
    (w.gallery||[]).forEach(function(p){
      var fig=el('figure');
      var im=el('img');
      im.src=src(p);
      im.alt='';
      im.loading='lazy';
      fig.appendChild(im);
      gal.appendChild(fig);
    });
    var oldDet=document.querySelector('[data-details]');
    if(oldDet) oldDet.remove();
    if(w.details && w.details.length){
      var det=el('div','gallery r11');
      det.setAttribute('data-details','');
      w.details.forEach(function(p){
        var fig=el('figure');
        var im=el('img');
        im.src=src(p);
        im.alt='';
        im.loading='lazy';
        fig.appendChild(im);
        det.appendChild(fig);
      });
      gal.insertAdjacentElement('afterend', det);
    }
    gal.hidden=!(w.gallery&&w.gallery.length);

    var av=document.getElementById('avBlock');
    av.innerHTML='';
    if(w.film){
      av.hidden=false;
      av.appendChild(el('h2',null,w.film.label));
      var vid=el('video');
      vid.setAttribute('controls','');
      vid.setAttribute('playsinline','');
      vid.setAttribute('preload','metadata');
      if(w.film.poster) vid.poster=src(w.film.poster);
      var srcEl=document.createElement('source');
      srcEl.src=src(w.film.src);
      vid.appendChild(srcEl);
      av.appendChild(vid);
      if(w.film.stills && w.film.stills.length){
        var row=el('div','film-stills count-'+w.film.stills.length);
        w.film.stills.forEach(function(p){
          var fig=el('figure');
          var im=el('img');
          im.src=src(p);
          im.alt='';
          im.loading='lazy';
          fig.appendChild(im);
          row.appendChild(fig);
        });
        av.appendChild(row);
      }
    }else if(w.credits){
      av.hidden=false;
      av.appendChild(el('p','credits', w.credits));
    }else{
      av.hidden=true;
    }

    window.scrollTo(0,0);
  }

  function route(){
    var h=(location.hash||'#home').replace(/^#/, '');
    if(!h || h==='home' || h==='film' || h==='sound'){
      showHome();
      if(h==='film'||h==='sound'){
        var t=document.getElementById(h);
        if(t) setTimeout(function(){ t.scrollIntoView({block:'start'}); }, 0);
      }
      return;
    }
    showWork(h);
  }

  document.getElementById('back').addEventListener('click', function(){ location.hash='#home'; });
  document.getElementById('prev').addEventListener('click', function(){
    var i=idxOf(currentId);
    if(i<0) return;
    var n=WORKS[(i+WORKS.length-1)%WORKS.length];
    location.hash='#'+n.id;
  });
  document.getElementById('next').addEventListener('click', function(){
    var i=idxOf(currentId);
    if(i<0) return;
    var n=WORKS[(i+1)%WORKS.length];
    location.hash='#'+n.id;
  });

  window.addEventListener('hashchange', route);
  renderHome();
  route();
})();
