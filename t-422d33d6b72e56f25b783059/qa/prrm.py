import asyncio, sys
sys.path.insert(0,'/home/claude/oz1/qa')
from hs import HS
APP='http://localhost:8123/apps/oz/index.html'
JS="""new Promise(ok=>{const el=document.getElementById('pushradio'); GJ.pushRadio.open(); const s=[]; const t0=performance.now();
 (function f(){ const cs=getComputedStyle(el); s.push([Math.round(performance.now()-t0), +(+cs.opacity).toFixed(2), cs.transform]); if(performance.now()-t0<700) requestAnimationFrame(f); else ok({first:s[1],mid:s[Math.floor(s.length/3)],last:s[s.length-1], td:getComputedStyle(el).transitionDuration, pad:getComputedStyle(el.querySelector('.pr-pad')).transitionDuration}); })(); })"""
async def run(reduce):
    async with HS(reduce=reduce) as h:
        await h.pg.goto(APP+'?boot=0'); await h.w(2500)
        await h.ev("GJ.settings.setItem('gj-pr-seen','true')")
        r=await h.ev(JS); print('reduce' if reduce else 'normal', r)
        return r
async def main():
    a=await run(False); b=await run(True)
    print('PASS' if a['td']==b['td'] and a['pad']==b['pad'] and a['last'][1:]==b['last'][1:] else 'FAIL', 'Reduce Motion parity: same transitions, same end state')
asyncio.run(main())
