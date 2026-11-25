/* v19 helpers: settle image on first pinch, text size, featured overview, jump helpers used by site.js hooks. */
(function(){
  var KEY='cks-v19m.text';
  function scale(){
    var n=1;
    try{n=parseFloat(sessionStorage.getItem(KEY)||'1')}catch(e){}
    if(!isFinite(n))n=1;
    return Math.max(.9, Math.min(1.5, n));
  }
  function applyText(n){
    if(n==null)n=scale();
    n=Math.max(.9, Math.min(1.5, n));
    document.documentElement.style.setProperty('--text-scale', n.toFixed(3));
    try{sessionStorage.setItem(KEY, String(n))}catch(e){}
  }
  function heroFor(id){
    var p=document.getElementById(id);if(!p)return '';
    var img=p.querySelector('.strip button[data-big] img, .strip button[data-kind="img"] img, img.orb, .stage img.main, video[poster]');
    var b=p.querySelector('.strip button[data-big], figure[data-big]');
    if(b&&b.getAttribute('data-big'))return b.getAttribute('data-big');
    if(img)return img.getAttribute('src')||'';
    var st=document.querySelector('#room a.st[data-k="'+id+'"] img');
    return st?st.getAttribute('src'):'';
  }
  var box;
  function settleEl(){
    if(box)return box;
    box=document.createElement('div');box.id='settle';box.innerHTML='<img alt=""><b></b>';
    document.body.appendChild(box);return box;
  }
  function settle(node, z, done){
    var el=settleEl();
    if(!node||!node.a){el.classList.remove('on');return}
    var id=node.a.getAttribute('data-k');
    var title=(node.a.querySelector('b')||{}).textContent||'';
    var src=heroFor(id);
    var img=el.querySelector('img'), lab=el.querySelector('b');
    if(src&&img.getAttribute('src')!==src)img.src=src;
    if(lab)lab.textContent=title;
    /* fade in as we pass the settle point so the still is already full and sharp */
    var u=Math.max(0, Math.min(1,(z-1.6)/0.7));
    el.style.opacity=u.toFixed(3);
    if(u>0.05)el.classList.add('on');else el.classList.remove('on');
    if(window.CKS_PRELOAD&&src)CKS_PRELOAD.warm(src);
  }
  function settleHide(){var el=settleEl();el.classList.remove('on');el.style.opacity='0'}
  applyText();
  window.CKS19={
    text:scale, applyText:applyText, settle:settle, settleHide:settleHide, heroFor:heroFor,
    featured:['spirit-eye','sculpture','cup','scoop','crescent','owtd','lost-in-time','lost-coffee','canopy']
  };
})();
