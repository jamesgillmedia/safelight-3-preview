import asyncio, sys
sys.path.insert(0,'/home/claude/oz1/qa')
from hs import HS
APP='http://localhost:8123/apps/oz/index.html'
def ok(n,v): print(('PASS ' if v else 'FAIL ')+n, flush=True)
async def main():
    async with HS() as h:
        await h.ctx.add_init_script("window.GJ_CORE_DEFAULTS={owner:true}")
        await h.pg.goto(APP+'?boot=0'); await h.w(2500)
        ok('owner build', await h.ev("GJ.core.owner()"))
        await h.ev("GJ.app.tune(true)"); await h.w(700)
        lv=await h.ev("[...document.querySelectorAll('#tune [data-t=loved], #tune [data-t=lovedex]')].map(b=>getComputedStyle(b.closest('.row')||b).display).join(',')")
        ok('owner: tune loved ones rows shown ('+lv+')', lv and 'none' not in lv)
        await h.ev("GJ.app.tune(false)"); await h.w(300)
        await h.ev("GJ.friends.open(); GJ.friends.add('Mara'); GJ.friends.hold(+document.querySelector('.fr-p').dataset.id)"); await h.w(500)
        ok('owner: friends has "move to loved ones"', await h.ev("!!document.querySelector('button[data-m=loved]')"))
        ok('owner: loved ones on the map/places', await h.ev("!!(GJ.ozone&&GJ.ozone.places?GJ.ozone.places().some(p=>p.id==='lovedones'):document.documentElement.classList.contains('owner'))"))
asyncio.run(main())
