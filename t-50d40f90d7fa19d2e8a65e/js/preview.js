
/* preview-only helpers: + menu, dock/hash safety, pinch label already patched in sheet.js */
(function(){
  var btn=document.getElementById('plusBtn');
  var menu=document.getElementById('plusMenu');
  if(btn&&menu){
    btn.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      var open=btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded', open?'false':'true');
      menu.hidden=open;
    });
    document.addEventListener('click',function(e){
      if(menu.hidden)return;
      if(e.target.closest&&e.target.closest('.plus-wrap'))return;
      menu.hidden=true;btn.setAttribute('aria-expanded','false');
    });
  }
})();

document.addEventListener('click',function(e){
  var peek=e.target.closest&&e.target.closest('.imm .frame > img.fs-framepeek');
  if(peek){peek.remove();return}
  var im=e.target.closest&&e.target.closest('.imm-f img');
  if(!im)return;
  var frame=document.querySelector('.imm .frame');
  if(!frame)return;
  var hold=frame.querySelector('img.fs-framepeek')||document.createElement('img');
  hold.className='fs-framepeek';
  hold.alt='';
  hold.src=im.currentSrc||im.src;
  if(!hold.parentNode)frame.appendChild(hold);
},false);
