import asyncio, sys
sys.path.insert(0,'/home/claude/oz1/qa')
from hs import HS
HOME='http://localhost:8123/apps/oz-open/index.html'; APP='http://localhost:8123/apps/oz/index.html'
async def main():
    async with HS(reduce=('reduce' in sys.argv)) as h:
        await h.pg.goto(HOME+'?boot=0'); await h.w(2500)
        ids=await h.ev("__oz.places().filter(x=>!['noise','sky','here'].includes(x))")
        bad=[]
        for i in ids:
            await h.pg.goto(APP+'?go=%s&home=1&boot=0'%i)
            try: await h.pg.wait_for_function("document.documentElement.classList.contains('fh-in')", timeout=8000)
            except Exception: bad.append(i+':no-open'); continue
            await h.w(500)
            for k in range(4):
                if 'oz-open' in h.pg.url: break
                await h.pg.keyboard.press('Escape'); await h.w(900)
            if 'oz-open' not in h.pg.url: bad.append(i+':no-back')
        errs=[e for e in h.errs if 'ERR_FAILED' not in e and 'vibrate' not in e]
        print('rooms', len(ids), 'bad', bad, 'errs', errs[:5], '404', h.bad[:3])
        print('PASS' if not bad and not errs and not h.bad else 'FAIL', 'every room opens from Home and back returns Home')
asyncio.run(main())
