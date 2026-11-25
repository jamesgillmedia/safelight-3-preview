(function(){
  var PUB = window.CKS_PUBLISH || null;
  function src(path){
    if(!PUB) return path;
    if(path.indexOf('media/av/')===0) return PUB.av + path.slice(9);
    if(path.indexOf('media/audio/')===0) return PUB.audio + path.slice(12);
    if(path.indexOf('media/weird-kid/')===0) return PUB.wk + path.slice(16);
    if(path.indexOf('media/owtd/')===0) return PUB.owtd + path.slice(11);
    if(path.indexOf('media/posters/')===0) return PUB.posters + path.slice(14);
    if(path.indexOf('media/photos/')===0) return PUB.photos + path.slice(13);
    if(path.indexOf('media/orbit/')===0) return PUB.orbit + path.slice(12);
    if(path.indexOf('media/spirit-eye/')===0) return PUB.se + path.slice(17);
    if(path.indexOf('media/thumbs/')===0) return PUB.thumbs + path.slice(13);
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
      },
      archive:[
        'media/stills/hanging-sculpture-sunlight-d290ef9b.jpg',
        'media/stills/05-hanging-sculpture-bw.jpg',
        'media/stills/hanging-sculpture-head-9a457e08.jpg',
        'media/stills/hanging-sculpture-head-4ba2ab74.jpg',
        'media/stills/hanging-sculpture-head-dbe3a28a.jpg',
        {src:'media/weird-kid/clips/wk-horse-rears.mp4', poster:'media/weird-kid/clips/wk-horse-rears.jpg'},
        'media/weird-kid/stills/wk-forest-floor.jpg',
        'media/weird-kid/stills/wk-forest-path.jpg',
        'media/weird-kid/stills/wk-raven.jpg'
      ]
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
        'media/stills/cup-hand-cd63215d.jpg'
      ],
      archive:[
        'media/stills/02-speckled-cup-2024.jpg',
        'media/stills/cup-hand-cd63215d.jpg',
        'media/photos/cup-hand-5565e963.jpg',
        'media/stills/cup-from-above-1341.jpg',
        'media/photos/cup-from-above-1342.jpg',
        'media/stills/cup-pour.webp',
        'media/photos/cup-holding.webp',
        'media/stills/cup-filled-5831.jpg',
        'media/photos/cup-filled-5829.jpg',
        'media/photos/cup-cut-img_5841.webp',
        'media/photos/cup-making-img_5881.webp',
        'media/photos/cup-making-img_5892.webp',
        'media/photos/cup-making-img_5901.webp',
        'media/photos/cup-surface-e2aa7ba0.webp',
        'media/photos/cup-surface-img_5841.webp',
        'media/photos/cup-surface-img_5892.webp',
        'media/photos/cup-surface-img_5901.webp',
        'media/orbit/joio-cup/making-1724F546.webp',
        'media/orbit/joio-cup/making-2528243E.webp',
        'media/orbit/joio-cup/making-IMG_0183.webp',
        'media/orbit/joio-cup/making-IMG_0346.webp',
        'media/orbit/joio-cup/making-IMG_2351.webp',
        'media/orbit/joio-cup/making-IMG_2401.webp',
        'media/orbit/joio-cup/making-IMG_3497.webp',
        'media/orbit/joio-cup/making-IMG_3506.webp',
        'media/orbit/joio-cup/making-carve.webp',
        'media/orbit/joio-cup/making-spoon.webp'
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
      ],
      archive:[
        'media/stills/scoop-hand-2aea8932.jpg',
        'media/stills/scoop-side-full.jpg',
        'media/stills/scoop-in-hand-full.jpg',
        'media/photos/scoop-three-quarter-full.jpg',
        'media/stills/scoop-context-full.jpg',
        'media/photos/scoop-bowl.webp',
        'media/photos/scoop-cut.webp',
        'media/photos/scoop-handle.webp',
        'media/photos/scoop-surface-side.webp'
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
      ],
      archive:[
        'media/stills/01-paddle-blade-grain-2023.jpg',
        'media/stills/paddle-close-grain.webp',
        'media/stills/paddle-against-wall.webp',
        'media/stills/paddle-window-light.webp',
        'media/stills/paddle-in-hand.webp',
        'media/stills/paddle-product.webp'
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
      ],
      archive:[
        'media/stills/09-spirit-eye-from-above-2025.jpg',
        'media/stills/10-spirit-eye-section-2025.jpg',
        'media/photos/spirit-eye-object.webp',
        'media/spirit-eye/s2/p01-eye.webp',
        'media/spirit-eye/s2/p02-behind-eye.webp',
        'media/spirit-eye/s2/p05-side-eye.webp',
        'media/spirit-eye/s2/p06-scale.webp',
        'media/spirit-eye/s2/p07-plan-dial.webp',
        'media/spirit-eye/s2/p09-scene4.webp',
        'media/spirit-eye/s2/p10-water.webp',
        'media/spirit-eye/s2/p12-scene3.webp',
        'media/spirit-eye/s2/p13-view2.webp',
        'media/spirit-eye/s2/p14-view3.webp',
        'media/spirit-eye/s2/p15-side2.webp',
        'media/spirit-eye/s2/p15-whorl-top.webp',
        'media/spirit-eye/s2/p16-scene2.webp',
        'media/spirit-eye/s2/p17-side-view.webp',
        'media/spirit-eye/s2/p19-close-eye.webp',
        'media/spirit-eye/s2/p25-side-eye2.webp',
        'media/spirit-eye/s2/p29-sketchlens.webp',
        'media/spirit-eye/s2/p31-sketch4.webp',
        'media/spirit-eye/s2/p32-sketch5.webp',
        'media/spirit-eye/s2/s8-whorl.webp',
        'media/spirit-eye/s2/s8-clouds.webp'
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
      gallery:[],
      archive:[
        'media/stills/07-forest-canopy.jpg'
      ]
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
      gallery:[],
      archive:[
        'media/stills/08-rosebuds-photograph.jpg'
      ]
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
      gallery:[],
      archive:[
        'media/stills/06-moss-vessel.jpg'
      ]
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
      gallery:[],
      archive:[
        'media/stills/04-scoop-hanging-slat-light.jpg'
      ]
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
      gallery:[],
      archive:[
        'media/stills/03-crescent-rim.jpg',
        'media/stills/crescent-rim-object.webp'
      ]
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
      ],
      archive:[
        {src:'media/av/AV1-one-with-the-devil-excerpt-cinematography.mp4', poster:'media/posters/owtd.jpg'},
        'media/posters/owtd.jpg',
        'media/owtd/stills/01_wood_chop.jpg',
        'media/owtd/stills/02_dallas_snow.jpg',
        'media/owtd/stills/03_colton_snow_trees.jpg',
        'media/owtd/stills/04_table_twoshot.jpg',
        'media/owtd/stills/05_lantern_portrait.jpg',
        'media/owtd/stills/06_colton_cabin.jpg',
        'media/owtd/stills/07_dallas_cu.jpg',
        'media/owtd/stills/08_rose.jpg',
        'media/owtd/stills/09_landscape.jpg',
        'media/owtd/stills/10_rifle_doorway.jpg',
        'media/owtd/stills/11_night_cabin.jpg',
        'media/owtd/stills/12_candlelight.jpg'
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
      gallery:[],
      archive:[
        {src:'media/av/AV3-untitled-colour-field.mov', poster:'media/photos/colour-field-poster.jpg'},
        'media/photos/colour-field-poster.jpg'
      ]
    },
    {
      id:'studio',
      kind:'studio',
      title:'Studio photographs',
      year:'',
      medium:'Photograph',
      about:'Photographs of more than one piece, or of a vessel that is not one of the works above.',
      hero:'media/stills/display-cup-scoop-1167.jpg',
      pos:'center',
      ratio:'r45',
      gallery:[],
      archive:[
        'media/stills/display-cup-scoop-1167.jpg',
        'media/stills/cup-display-sunlight-1170.jpg',
        'media/photos/cup-display-sunlight-1171.jpg',
        'media/stills/cup-board-paddles-6690.jpg',
        'media/photos/cup-board-paddles-6678.jpg',
        'media/photos/cup-board-paddles-6691.jpg',
        'media/stills/cup-espresso-6153.jpg',
        'media/stills/cup-on-a-board.webp',
        'media/photos/cup-from-above.webp',
        'media/stills/planter-cup-with-moss.webp',
        'media/photos/cup-use-16b39e13.webp',
        'media/photos/cup-use-img_0952.webp',
        'media/photos/cup-use-img_5925.webp',
        'media/photos/cup-use-img_6136.webp',
        'media/photos/cup-use-img_6166.webp'
      ]
    }
  ];

  window.CKS_WORKS = WORKS;
  window.CKS_SRC = src;
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

  function objects(){ return WORKS.filter(function(w){ return w.kind!=='film' && w.kind!=='studio'; }); }
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
      var ed=(window.CKS_TUNE&&window.CKS_TUNE.nameOf)?window.CKS_TUNE.nameOf(w):null;
      cap.appendChild(el('span','ttl', (ed&&ed.title)||w.title));
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
    var studio=find('studio');
    var slot=document.getElementById('studioLink');
    if(slot&&studio){
      slot.hidden=false;
      slot.href='#studio/archive';
    }
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
    if(t.id==='lost-in-time' && window.CKS_LISTEN){ window.CKS_LISTEN.open(); return; }
    audio.play().catch(function(){});
  }

  var archiveEl=document.getElementById('archive');
  var lightbox=document.getElementById('lightbox');
  var lightboxStage=document.getElementById('lightboxStage');

  function hideLightbox(){
    if(!lightbox) return;
    lightbox.hidden=true;
    lightboxStage.innerHTML='';
  }

  function hideArchive(){
    hideLightbox();
    if(!archiveEl) return;
    archiveEl.hidden=true;
    archiveEl.classList.remove('on');
    back.textContent='All works';
  }

  function itemsOf(w){
    return (w.archive||[]).map(function(item){
      if(typeof item==='string'){
        var video=/\.(mp4|mov|webm)$/i.test(item);
        return {src:item, kind:video?'video':'img'};
      }
      var it={src:item.src, poster:item.poster, kind:item.kind};
      if(!it.kind) it.kind=/\.(mp4|mov|webm)$/i.test(it.src)?'video':'img';
      return it;
    });
  }

  function openLightbox(item){
    hideLightbox();
    lightboxStage.innerHTML='';
    if(item.kind==='video'){
      var v=el('video');
      v.setAttribute('controls','');
      v.setAttribute('playsinline','');
      v.setAttribute('preload','auto');
      if(item.poster) v.poster=src(item.poster);
      var s=document.createElement('source');
      s.src=src(item.src);
      v.appendChild(s);
      lightboxStage.appendChild(v);
      v.play().catch(function(){});
    }else{
      var img=el('img');
      img.src=src(item.src);
      img.alt='';
      lightboxStage.appendChild(img);
    }
    lightbox.hidden=false;
  }

  function showArchive(id){
    var w=find(id);
    if(!w){ showHome(); return; }
    currentId=id;
    stopMedia();
    home.hidden=true;
    home.classList.remove('on');
    workEl.hidden=true;
    workEl.classList.remove('on');
    hideLightbox();
    archiveEl.hidden=false;
    archiveEl.classList.add('on');
    back.hidden=false;
    back.textContent='Close archive';
    var edA=(window.CKS_TUNE&&window.CKS_TUNE.nameOf)?window.CKS_TUNE.nameOf(w):null;
    document.getElementById('archiveTitle').textContent=(edA&&edA.title)||w.title;
    document.body.setAttribute('data-piece', w.kind==='film'?'film':(w.id==='sculpture'?'sculpture':(w.kind==='studio'?'studio':'object')));
    var box=document.getElementById('archiveGrid');
    box.innerHTML='';
    itemsOf(w).forEach(function(item,i){
      var b=el('button');
      b.type='button';
      if(item.kind==='video'){
        var v=el('video');
        v.setAttribute('muted','');
        v.setAttribute('playsinline','');
        v.setAttribute('preload','metadata');
        if(item.poster) v.poster=src(item.poster);
        v.src=src(item.src);
        b.appendChild(v);
        b.appendChild(el('span','play','Play'));
      }else{
        var img=el('img');
        img.src=src(item.src);
        img.alt='';
        img.loading=i<8?'eager':'lazy';
        b.appendChild(img);
      }
      b.addEventListener('click', function(){ openLightbox(item); });
      box.appendChild(b);
    });
    var open=document.getElementById('archiveOpen');
    if(open) open.href='#'+id+'/archive';
    window.scrollTo(0,0);
  }

  function showHome(){
    currentId=null;
    stopMedia();
    hideArchive();
    workEl.hidden=true;
    workEl.classList.remove('on');
    home.hidden=false;
    home.classList.add('on');
    back.hidden=true;
    back.textContent='All works';
    document.body.setAttribute('data-piece','home');
    if(window.CKS_WASH) window.CKS_WASH.clear();
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

    var edited=(window.CKS_TUNE&&window.CKS_TUNE.nameOf)?window.CKS_TUNE.nameOf(w):null;
    document.getElementById('workName').textContent=(edited&&edited.title)||w.title;
    var meta=[w.year,w.medium].filter(Boolean).join('  ·  ');
    document.getElementById('workMeta').textContent=meta;
    document.getElementById('workAbout').textContent=(edited&&edited.about!=null)?edited.about:(w.about||'');
    document.body.setAttribute('data-piece', w.kind==='film'?'film':(w.id==='sculpture'?'sculpture':(w.kind==='studio'?'studio':'object')));
    if(window.CKS_WASH) window.CKS_WASH.from(src(w.hero));

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
      var motion=+(document.documentElement.getAttribute('data-motion')||100);
      if(motion>0){
        vid.muted=true;
        vid.loop=true;
        vid.setAttribute('playsinline','');
        vid.play().catch(function(){});
      }
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

    hideArchive();
    workEl.hidden=false;
    workEl.classList.add('on');
    back.textContent='All works';
    var open=document.getElementById('archiveOpen');
    if(open){
      var has=(w.archive&&w.archive.length);
      open.hidden=!has;
      open.href='#'+w.id+'/archive';
      open.parentElement.hidden=!has;
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
    var parts=h.split('/');
    var id=parts[0];
    if(parts[1]==='archive'){ showArchive(id); return; }
    showWork(id);
  }

  document.getElementById('back').addEventListener('click', function(){
    if(archiveEl && !archiveEl.hidden){
      if(!lightbox.hidden){ hideLightbox(); return; }
      location.hash='#'+currentId;
      return;
    }
    location.hash='#home';
  });
  document.getElementById('archiveClose').addEventListener('click', function(){
    location.hash='#'+currentId;
  });
  document.getElementById('lightboxClose').addEventListener('click', function(e){
    e.stopPropagation();
    hideLightbox();
  });
  lightbox.addEventListener('click', function(e){
    if(e.target===lightbox || e.target===lightboxStage || e.target.tagName==='IMG') hideLightbox();
  });
  document.addEventListener('keydown', function(e){
    if(e.key!=='Escape') return;
    if(!lightbox.hidden){ hideLightbox(); return; }
    if(archiveEl && !archiveEl.hidden) location.hash='#'+currentId;
  });
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

  var eyeTimer=null;
  function flashEye(){
    if(!archiveEl || archiveEl.hidden) return;
    archiveEl.style.setProperty('--eye','1');
    clearTimeout(eyeTimer);
    eyeTimer=setTimeout(function(){ archiveEl.style.setProperty('--eye','0'); }, 420);
  }
  if(archiveEl){
    archiveEl.addEventListener('scroll', flashEye, {passive:true});
    archiveEl.addEventListener('pointermove', flashEye, {passive:true});
    window.addEventListener('scroll', flashEye, {passive:true});
  }

})();
