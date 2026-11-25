/* Background wash sampled from the current photograph. Never tints the photograph itself. */
(function(){
  var cache={};
  function sample(url, cb){
    if(cache[url]){ cb(cache[url]); return; }
    var img=new Image();
    img.crossOrigin='anonymous';
    img.onload=function(){
      try{
        var c=document.createElement('canvas');
        var w=24, h=24;
        c.width=w; c.height=h;
        var g=c.getContext('2d');
        g.drawImage(img,0,0,w,h);
        var d=g.getImageData(0,0,w,h).data;
        var r=0,g1=0,b=0,n=0;
        for(var i=0;i<d.length;i+=4){
          var lum=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];
          if(lum<18||lum>240) continue;
          r+=d[i]; g1+=d[i+1]; b+=d[i+2]; n++;
        }
        if(!n){ r=8; g1=12; b=18; n=1; }
        var col='rgba('+[Math.round(r/n),Math.round(g1/n),Math.round(b/n),0.42].join(',')+')';
        cache[url]=col;
        cb(col);
      }catch(e){ cb(null); }
    };
    img.onerror=function(){ cb(null); };
    img.src=url;
  }
  function from(url){
    var el=document.getElementById('wash');
    if(!el||!url) return;
    sample(url, function(col){
      document.documentElement.style.setProperty('--wash', col||'transparent');
    });
  }
  function clear(){
    document.documentElement.style.setProperty('--wash','transparent');
  }
  window.CKS_WASH={from:from, clear:clear};
})();
