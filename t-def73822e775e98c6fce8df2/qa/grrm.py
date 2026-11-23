import asyncio, sys
sys.path.insert(0,'/home/claude/oz1/qa')
from hs import HS
APP='http://localhost:8123/apps/oz/index.html'
JS="""new Promise(ok=>{const el=document.getElementById('grant'); GJ.grant.open(); const t0=performance.now(); const s=[];
 (function f(){ s.push(+(+getComputedStyle(el).opacity).toFixed(2)); if(performance.now()-t0<700) requestAnimationFrame(f); else {
   GJ.grant.tab('choices'); const sh=el.querySelector('.gr-sheet'); ok({end:[getComputedStyle(el).opacity,getComputedStyle(el).transform], td:getComputedStyle(el).transitionDuration, sheet:getComputedStyle(sh).transitionDuration, mid:s[Math.floor(s.length/3)]}); } })(); })"""
async def run(rm):
    async with HS(reduce=rm) as h:
        await h.pg.goto(APP+'?boot=0'); await h.w(2500); r=await h.ev(JS); print('reduce' if rm else 'normal', r); return r
async def main():
    a=await run(False); b=await run(True)
    print('PASS' if a['end']==b['end'] and a['td']==b['td'] and a['sheet']==b['sheet'] else 'FAIL', 'Reduce Motion parity in the grant room (open fade, sheet slide)')
asyncio.run(main())
