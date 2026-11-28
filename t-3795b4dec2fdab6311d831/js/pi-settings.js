/* settings save and restore for Tune. Everything stays in this browser or in a file or link you hold; nothing is sent anywhere.
   Tune already keeps every change in localStorage. This adds: a settings link (copy, open anywhere to load), a settings file (save, load),
   and the last 12 saved states to step back to. The link is read by the inline boot script in the head before the page starts. */
(function(){
var KEYS=['gj.cks12.tune','gj.cks12.red','gj.cks12.order','gj.cks12.vol','gj.cks29.air','gj.cks12.presets.saved','gj.pi.visitor','gj.pi.env','gj.pi.arrange','gj.pi.line','gj.pi.litmoon'];
var FLAGS=['gj.cks12.skyplay-default-off','gj.cks12.moon-off-default','gj.cks16.order-default-strongest','gj.cks16.type-default-105','gj.cks22.autoplay-all'];
var SK='gj.pi.settings.snaps',MSG='gj.pi.settings.msg',MAX=12;
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function put(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function jp(s){try{return JSON.parse(s)}catch(e){return s}}
function payload(){var o={v:1,t:new Date().toISOString(),ls:{}};KEYS.forEach(function(k){var s=get(k);if(s==null)return;o.ls[k]=(s.charAt(0)==='{'||s.charAt(0)==='[')?jp(s):s});return o}
function enc(o){return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function dec(b){b=b.replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';return JSON.parse(decodeURIComponent(escape(atob(b))))}
function link(o){return location.origin+location.pathname+'?cks='+enc(o||payload())}
function parse(text){text=String(text||'').trim();if(!text)return null;var m=/[?&]cks=([A-Za-z0-9_\-]+)/.exec(text),o;try{o=m?dec(m[1]):JSON.parse(text)}catch(e){return null}
  if(!o||typeof o!=='object')return null;
  if(o.v===1&&o.ls&&typeof o.ls==='object')return o;
  if(o.ls===undefined&&o.v===undefined)return {v:1,ls:{'gj.cks12.tune':o}};/* a bare tune object, as "copy as default" gives */
  return null}
function snaps(){var a=jp(get(SK)||'[]');return Array.isArray(a)?a:[]}
function snapNow(){var o=payload(),c=JSON.stringify(o.ls),a=snaps();if(c==='{}'||(a.length&&JSON.stringify(a[0].ls)===c))return false;a.unshift({t:Date.now(),ls:o.ls});put(SK,JSON.stringify(a.slice(0,MAX)));return true}
function apply(o,msg,noReload){snapNow();KEYS.forEach(function(k){var v=o.ls[k];try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v))}catch(e){}});FLAGS.forEach(function(k){put(k,'1')});try{sessionStorage.setItem(MSG,msg||'settings loaded')}catch(e){}snapNow();if(!noReload)location.replace(location.pathname+'?tune')}
function stamp(){var d=new Date(),p=function(n){return (n<10?'0':'')+n};return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())}
function copy(text){var ok=false,ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;width:2px;height:2px;opacity:.01;border:0;padding:0;margin:0;';document.body.appendChild(ta);ta.focus();ta.select();try{ta.setSelectionRange(0,text.length)}catch(e){}try{ok=!!document.execCommand('copy')}catch(e){}ta.remove();
  if(ok)return Promise.resolve(true);
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text).then(function(){return true},function(){return false});
  return Promise.resolve(false)}
function download(o){var b=new Blob([JSON.stringify(o,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='cks-settings-'+stamp()+'.json';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u)},4000)}
function when(t){try{return new Date(t).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch(e){return String(t)}}
function inject(d){
  [].forEach.call(d.querySelectorAll('[data-save-default]'),function(a){if(!a.nextSibling||!a.nextSibling.classList||!a.nextSibling.classList.contains('pis'))mount(d,a)})}
function mount(d,anchor){
  var w=document.createElement('span');w.className='pis';
  w.innerHTML='<button type="button" data-pis="link">copy settings link</button><button type="button" data-pis="save">save settings file</button><button type="button" data-pis="load">load settings file</button><button type="button" data-pis="earlier">earlier settings</button><input type="file" accept="application/json,.json" hidden data-pis-file><div class="pis-list" hidden></div>';
  anchor.parentNode.insertBefore(w,anchor.nextSibling);
  var note=anchor.parentNode.querySelector('.tune-note');
  function say(t){if(!note)return;note.hidden=false;note.textContent=t}
  var m=null;try{m=sessionStorage.getItem(MSG)}catch(e){}if(m)say(m);setTimeout(function(){try{sessionStorage.removeItem(MSG)}catch(e){}},4000);
  function flash(b,ok,lab){if(b._t)clearTimeout(b._t);if(!b._lab)b._lab=b.textContent;b.textContent=ok?lab:'could not copy';b.classList.toggle('is-copied',!!ok);b._t=setTimeout(function(){b.textContent=b._lab;b.classList.remove('is-copied')},1600)}
  var list=w.querySelector('.pis-list'),file=w.querySelector('input[type=file]');
  function paintList(){var cur=JSON.stringify(payload().ls),a=snaps().filter(function(s){return JSON.stringify(s.ls)!==cur});
    list.innerHTML=a.length?'':'<span class="pis-empty">nothing earlier yet</span>';
    a.forEach(function(s){var b=document.createElement('button');b.type='button';b.setAttribute('data-pis-snap',String(s.t));b.textContent=when(s.t);list.appendChild(b)})}
  w.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b||!w.contains(b))return;e.preventDefault();e.stopPropagation();
    var sn=b.getAttribute('data-pis-snap');
    if(sn){var s=snaps().filter(function(x){return String(x.t)===sn})[0];if(s)apply({v:1,ls:s.ls},'settings restored from '+when(s.t));return}
    var k=b.getAttribute('data-pis');
    if(k==='link'){copy(link()).then(function(ok){flash(b,ok,'copied');say(ok?'settings link copied. open it on any device to load these settings':'could not copy')})}
    else if(k==='save'){download(payload());say('settings file saved')}
    else if(k==='load'){file.value='';file.click()}
    else if(k==='earlier'){var h=list.hidden;if(h)paintList();list.hidden=!h}
  });
  file.addEventListener('change',function(){var f=file.files&&file.files[0];if(!f)return;if(f.size>200000){say('that file is too large');return}var r=new FileReader();r.onload=function(){var o=parse(r.result);if(!o){say('that is not a settings file');return}apply(o,'settings loaded from file')};r.readAsText(f)});
}
function scan(){var d=document.getElementById('tune');if(d)inject(d)}
new MutationObserver(scan).observe(document.body||document.documentElement,{childList:true,subtree:true});scan();
setTimeout(snapNow,2500);
setInterval(function(){if(document.getElementById('tune'))snapNow()},2500);
addEventListener('pagehide',snapNow);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')snapNow()});
window.GJPS={payload:payload,link:link,parse:parse,apply:apply,snaps:snaps,snapNow:snapNow,keys:KEYS};
})();
