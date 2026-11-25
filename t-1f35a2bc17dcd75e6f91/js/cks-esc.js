(function(){
  var p=location.pathname||'';
  var href=/\/cv(\/|$)/.test(p)?'../index.html':'index.html';
  var a=document.querySelector('a.brand[href], a[href$="index.html"], a#corner[href], header a[href*="index"]');
  if(a){var h=a.getAttribute('href')||'';if(h)href=h.replace(/#.*$/,'')||href}
  document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;e.preventDefault();location.href=href});
})();
