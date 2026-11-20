(function(y){"use strict";var w=y.GJ;function R(t,r,e){return new Promise(function(a,f){try{t.toBlob(function(n){n?a(n):f(new Error("no picture"))},r,e)}catch(n){f(n)}})}function j(t){return t.arrayBuffer().then(function(r){return new Uint8Array(r)})}function h(t){return new TextEncoder().encode(t)}function C(t){var r=[],e=[0],a=0,f=t.length;function n(u){r.push(u),a+=u.length}function d(u,p,g){e[u]=a,n(h(u+` 0 obj
`+p+(g?`
stream
`:`
endobj
`))),g&&(n(g),n(h(`
endstream
endobj
`)))}n(h(`%PDF-1.4
%âãÏÓ
`)),d(1,"<< /Type /Catalog /Pages 2 0 R >>"),d(2,"<< /Type /Pages /Count "+f+" /Kids ["+t.map(function(u,p){return 3+p*3+" 0 R"}).join(" ")+"] >>"),t.forEach(function(u,p){var g=3+p*3,v=g+1,b=g+2,s=(u.w*.6).toFixed(2),F=(u.h*.6).toFixed(2),m=h("q "+s+" 0 0 "+F+" 0 0 cm /Im0 Do Q");d(g,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+s+" "+F+"] /Resources << /XObject << /Im0 "+v+" 0 R >> >> /Contents "+b+" 0 R >>"),d(v,"<< /Type /XObject /Subtype /Image /Width "+u.w+" /Height "+u.h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+u.jpg.length+" >>",u.jpg),d(b,"<< /Length "+m.length+" >>",m)});for(var o=a,c=3+f*3,l=`xref
0 `+c+`
0000000000 65535 f 
`,i=1;i<c;i++)l+=("0000000000"+e[i]).slice(-10)+` 00000 n 
`;return n(h(l+`trailer
<< /Size `+c+` /Root 1 0 R >>
startxref
`+o+`
%%EOF
`)),new Blob(r,{type:"application/pdf"})}var E=function(){for(var t=new Uint32Array(256),r=0;r<256;r++){for(var e=r,a=0;a<8;a++)e=e&1?3988292384^e>>>1:e>>>1;t[r]=e>>>0}return t}();function x(t){for(var r=4294967295,e=0;e<t.length;e++)r=E[(r^t[e])&255]^r>>>8;return(r^4294967295)>>>0}function B(t){var r=[],e=[],a=0;function f(o){var c=new Uint8Array(o.length),l=0;return o.forEach(function(i){c[l++]=i&255}),c}function n(o,c){for(var l=[],i=0;i<c;i++)l.push(o>>>8*i&255);return l}t.forEach(function(o){var c=h(o.name),l=x(o.data),i=f([80,75,3,4].concat(n(20,2),n(2048,2),n(0,2),n(0,2),n(33,2),n(l,4),n(o.data.length,4),n(o.data.length,4),n(c.length,2),n(0,2)));e.push(f([80,75,1,2].concat(n(20,2),n(20,2),n(2048,2),n(0,2),n(0,2),n(33,2),n(l,4),n(o.data.length,4),n(o.data.length,4),n(c.length,2),n(0,2),n(0,2),n(0,2),n(0,2),n(0,4),n(a,4))),c),r.push(i,c,o.data),a+=i.length+c.length+o.data.length});var d=e.reduce(function(o,c){return o+c.length},0);return new Blob(r.concat(e,[f([80,75,5,6].concat(n(0,2),n(0,2),n(t.length,2),n(t.length,2),n(d,4),n(a,4),n(0,2)))]),{type:"application/zip"})}function D(t,r){var e=document.createElement("a"),a=URL.createObjectURL(t);return e.href=a,e.download=r,document.body.appendChild(e),e.click(),setTimeout(function(){e.remove(),URL.revokeObjectURL(a)},4e3),a}w.out={blobOf:R,bytes:j,enc:h,pdf:C,zip:B,crc:x,save:D,last:null}})(window);
