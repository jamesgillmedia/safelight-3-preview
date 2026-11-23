import asyncio, sys, json, os
sys.path.insert(0,'/home/claude/oz1/qa')
from hs import HS
O='/home/claude/oz6/return/screenshots/pr-'
APP='http://localhost:8123/apps/oz/index.html'
HOME='http://localhost:8123/apps/oz-open/index.html'
MODE=sys.argv[1] if len(sys.argv)>1 else 'red'   # red | night | light
RED={'red':'1','night':'0','light':'0'}[MODE]; MD={'red':'night','night':'night','light':'day'}[MODE]
def ok(name, v): print(('PASS ' if v else 'FAIL ')+name, flush=True)
async def openroom(h):
    await h.pg.goto(APP+'?go=pushradio&home=1&boot=0')
    await h.pg.wait_for_function("document.documentElement.classList.contains('fh-in') && GJ.pushRadio && GJ.pushRadio.isOpen()", timeout=10000); await h.w(700)
async def hold(h, ms):
    b=await h.ev("(()=>{const r=document.querySelector('#pushradio .pr-pad').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
    await h.pg.mouse.move(*b); await h.pg.mouse.down(); await h.w(ms); return b
async def main(reduce=False):
    shots = not reduce
    async with HS(reduce=reduce) as h:
        await h.pg.goto(APP+'?boot=0'); await h.w(1200)
        await h.ev("GJ.store.set(%s)" % json.dumps({'red':{'red':True,'openRed':True,'dayMode':False,'fullSafe':False},'night':{'red':False,'openRed':False,'dayMode':False,'fullSafe':False},'light':{'red':False,'openRed':False,'dayMode':True,'fullSafe':False}}[MODE])); await h.w(400)
        await h.ev("(()=>{GJ.settings.setItem('gj-pr-seen',null);GJ.settings.setItem('gj-pr-joined','0');GJ.settings.setItem('gj-pr-thread','[]');GJ.settings.setItem('gj-pr-allow','{}');GJ.settings.setItem('gj-pr-quiet','false');GJ.f3.clearForTest();})()")
        await openroom(h)
        await h.w(900)
        st=await h.ev("GJ.pushRadio.state()"); ok('first visit: Always connected sheet shows', await h.ev("!document.querySelector('#pushradio .pr-sheet').hidden"))
        ok('not joined before the explicit tap', not st['joined']); ok('push through off by default', st['allow']==[]); ok('F3 dark at rest', not st['f3'])
        ok('mode is '+MODE, await h.ev("[document.documentElement.classList.contains('red'),document.documentElement.classList.contains('day')]")==[MODE=='red',MODE=='light'])
        ok('room name in the bar', (await h.ev("document.querySelector('#back').textContent")).strip().lower().startswith('push radio'))
        if shots: await h.shot(O+MODE+'-01-always-connected.png')
        # join from the sheet
        await h.ev("document.querySelector('#pushradio [data-s=join]').click()"); await h.w(800)
        st=await h.ev("GJ.pushRadio.state()"); ok('joined after the tap', st['joined']); ok('F3 still dark (local)', not st['f3'])
        if shots: await h.shot(O+MODE+'-02-joined.png')
        # leave and come back: never re-prompted, stays joined
        await h.pg.goto(APP+'?boot=0'); await h.w(800); await openroom(h); await h.w(900)
        ok('never asked twice', await h.ev("document.querySelector('#pushradio .pr-sheet').hidden"))
        ok('still joined on return', (await h.ev("GJ.pushRadio.state()"))['joined'])
        # hold to talk
        await hold(h, 1600)
        talking=await h.ev("GJ.pushRadio.state().talking"); note=await h.ev("document.querySelector('#pushradio .pr-pad-note').textContent")
        ok('pad records while held ('+note+')', talking)
        if shots: await h.shot(O+MODE+'-03-talking.png')
        await h.pg.mouse.up(); await h.w(900)
        st=await h.ev("GJ.pushRadio.state()"); ok('release: a clip in the thread', st['thread']==1 and not st['talking']); ok('F3 dark after a local talk', not st['f3'])
        mic=await h.ev("(()=>{return true})()")
        # Quiet
        await h.ev("document.querySelector('#pushradio .pr-quiet').click()"); await h.w(400)
        st=await h.ev("GJ.pushRadio.state()"); ok('quiet on, still joined, allows kept', st['quiet'] and st['joined'])
        if shots: await h.shot(O+MODE+'-04-quiet.png')
        # Test with me (allowed agent, quiet on): reply held silently
        await h.ev("GJ.pushRadio.test(true)"); await h.w(500)
        st=await h.ev("GJ.pushRadio.state()"); ok('test with me lights F3', st['f3'])
        await h.ev("document.querySelector('#pushradio [data-allow=agent]').click()"); await h.w(200)
        ok('push through on for the agent', 'agent' in (await h.ev("GJ.pushRadio.state()"))['allow'])
        await h.ev("document.querySelector('#pushradio [data-to=agent]').click()")
        await hold(h, 1200); await h.pg.mouse.up(); await h.w(2600)
        th=await h.ev("JSON.parse(GJ.settings.getItem('gj-pr-thread'))[0]")
        ok('quiet: agent reply held, not played ('+th.get('note','')+')', th['dir']=='in' and th['kind']!='live' and 'quiet' in th['note'])
        ok('F3 lit the whole time', (await h.ev("GJ.pushRadio.state()"))['f3'])
        # quiet off: allowed agent plays live
        await h.ev("document.querySelector('#pushradio .pr-quiet').click()"); await h.w(300)
        await hold(h, 1200); await h.pg.mouse.up(); await h.w(2200)
        th=await h.ev("JSON.parse(GJ.settings.getItem('gj-pr-thread'))[0]")
        ok('allowed + quiet off: live', th['kind']=='live')
        if shots: await h.shot(O+MODE+'-05-test-with-me-live.png')
        await h.w(2600)
        # push through off: held clip
        await h.ev("document.querySelector('#pushradio [data-allow=agent]').click()"); await h.w(200)
        await hold(h, 1200); await h.pg.mouse.up(); await h.w(2200)
        th=await h.ev("JSON.parse(GJ.settings.getItem('gj-pr-thread'))[0]")
        ok('push through off: held clip ('+th['note']+')', th['kind']=='clip' and 'push through is off' in th['note'])
        # decide() table
        d=await h.ev("""[GJ.pushRadio.decide({circle:true,allowed:true,quiet:false,joined:true,live:true}),
          GJ.pushRadio.decide({circle:true,allowed:true,quiet:true,joined:true,live:true}),
          GJ.pushRadio.decide({circle:true,allowed:false,quiet:false,joined:true,live:true}),
          GJ.pushRadio.decide({circle:false,allowed:true,quiet:false,joined:true,live:true,wantsLive:true}),
          GJ.pushRadio.decide({circle:true,allowed:true,quiet:false,joined:false,live:true})]""")
        ok('decide table '+json.dumps(d), d==['live','clip','clip','request','clip'])
        # ask
        await h.ev("document.querySelector('#pushradio [data-ask]').click()"); await h.w(300)
        if shots:
            await h.ev("document.querySelector('#pushradio .pr-scroll').scrollTop=520"); await h.w(400); await h.shot(O+MODE+'-06-circle-reach.png')
            await h.ev("document.querySelector('#pushradio .pr-scroll').scrollTop=99999"); await h.w(400); await h.shot(O+MODE+'-07-thread-paths.png')
            await h.ev("document.querySelector('#pushradio .pr-scroll').scrollTop=0")
        appErrs=[e for e in h.errs if 'ERR_FAILED' not in e and 'vibrate' not in e]; appNet=[u for u in h.net if 'open-meteo' not in u]   # the forecast fetch is Good Weather's (pre-existing); the harness aborts it
        r=await h.ev("new Promise(ok=>{GJ.pushRadio.close(); var t=GJ.pushRadio.state().test; setTimeout(()=>ok([t, GJ.f3.lit(), GJ.f3.log().filter(e=>!/open-meteo/.test(e.where)).map(e=>e.what+' | '+e.where+' | '+e.end)]),60)})")
        ok('closing the room ends test with me, F3 dark', not r[0] and not r[1]); print('f3 log:', r[2])
        ok('F3 log has the relay, ended', len(r[2])==1 and 'test with me off' in r[2][0])
        await h.w(1500); await openroom(h)
        # back closes; test with me ends with the room; F3 goes dark
        await h.pg.keyboard.press('Escape'); await h.w(1600)
        ok('back leaves the room', not await h.ev("GJ.pushRadio && GJ.pushRadio.isOpen()") if 'oz/index' in h.pg.url else True)
        await h.w(600)
        lit = await h.ev("GJ.f3 ? GJ.f3.lit() : false") if 'oz/index' in h.pg.url else False
        ok('F3 dark after leaving test with me', not lit)
        log=await h.ev("GJ.f3 ? GJ.f3.log().map(e=>e.what+' | '+e.end) : []") if 'oz/index' in h.pg.url else []
        print('f3 log:', log)
        # Home finds it
        await h.pg.goto(HOME+'?boot=0'); await h.w(2500)
        f=await h.ev("[__oz.find('walkie'),__oz.find('push radio'),__oz.places().indexOf('pushradio')]"); print('home find:', f)
        ok('Home finds push radio', 'pushradio' in f[0] and 'pushradio' in f[1])
        txt=await h.ev("document.body.innerText")
        print('app errs', appErrs[:8]); print('bad', h.bad[:8]); print('app net', appNet[:5]); print('home net (weather, pre-existing, aborted by the harness):', len(h.net)-len(appNet))
        ok('no errors in the app', not [e for e in appErrs if 'vibrate' not in e]); ok('no 404s', not h.bad); ok('nothing leaves from push radio', not appNet)
asyncio.run(main(reduce=('reduce' in sys.argv)))
