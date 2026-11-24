import asyncio, sys, json
sys.path.insert(0,'/home/claude/oz1/qa')
from hs import HS
O='/home/claude/oz6/return-fix/screenshots/'
APP='http://localhost:8123/apps/oz/index.html'
HOME='http://localhost:8123/apps/oz-open/index.html'
RM='reduce' in sys.argv; SH=not RM
def ok(name, v): print(('PASS ' if v else 'FAIL ')+name, flush=True)
OVER="""(()=>{const L=[...document.querySelectorAll('#camO .cst')].filter(b=>b._v>.12&&+getComputedStyle(b).opacity>.05).map(b=>b.querySelector('span')).filter(s=>s&&getComputedStyle(s).visibility!=='hidden'&&s.textContent.trim());
 const R=L.map(s=>[s.textContent,s.getBoundingClientRect()]); let n=0,pairs=[];
 for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i][1],b=R[j][1]; if(a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1){n++;pairs.push(R[i][0]+'/'+R[j][0]);}}
 const f=document.querySelector('#camO .cst.front span'); return {shown:R.length, names:R.map(r=>r[0]), overlaps:n, pairs, front: f?f.textContent+'|'+getComputedStyle(f).visibility:null, open:+getComputedStyle(document.querySelector('#camO')).opacity};})()"""
SKY="""(()=>{const v=id=>{const e=document.getElementById(id);if(!e)return 'none';const c=getComputedStyle(e);return c.display==='none'||+c.opacity===0||c.visibility==='hidden'?'hidden':'SHOWN'}; return ['ozcmp','ozcmp-note','rooms','title','sub','poem','foot','sky'].map(i=>i+':'+v(i)).join(' ')})()"""
async def room(h, go, el, cls, tag):
    await h.pg.goto(APP+'?go='+go+'&home=1&boot=0'); await h.pg.wait_for_function("document.documentElement.classList.contains('fh-in') && document.documentElement.classList.contains('%s')" % cls, timeout=10000); await h.w(900)
    bg=await h.ev("getComputedStyle(document.querySelector('%s')).backgroundColor" % el); r=await h.ev("(()=>{const r=document.querySelector('%s').getBoundingClientRect();return [r.left,r.right]})()" % el)
    sky=await h.ev(SKY); ok(tag+' opaque ('+bg+')', 'rgba' not in bg or bg.endswith(', 1)')); ok(tag+' no sky through it ('+sky+')', 'SHOWN' not in sky)
    return r
async def main():
    async with HS(reduce=RM) as h:
        await h.pg.goto(APP+'?boot=0'); await h.w(2500)
        ok('reduce motion emulated' if RM else 'reduce motion off', (await h.ev("matchMedia('(prefers-reduced-motion: reduce)').matches"))==RM)
        ok('GJ.reduced() is false', not await h.ev("GJ.reduced ? GJ.reduced() : false"))
        await h.ev("GJ.store.set({red:true,openRed:true,dayMode:false,fullSafe:false})"); await h.w(300)
        # 1 · opaque surfaces
        await room(h,'phone','#phone','phoning','phone')
        if SH: await h.shot(O+'after-01-phone.png')
        await room(h,'notes','#notes','noting','notes')
        if SH: await h.shot(O+'after-01-notes.png')
        await h.pg.goto(APP+'?boot=0'); await h.w(1500); await h.ev("GJ.app.tune(true)"); await h.w(900)
        bg=await h.ev("getComputedStyle(document.querySelector('#tune')).backgroundColor"); r=await h.ev("(()=>{const r=document.querySelector('#tune').getBoundingClientRect();return [r.left,r.right]})()")
        hid=await h.ev("['moonfree','dimmer','sky'].map(i=>{const e=document.getElementById(i);if(!e)return i+':none';const c=getComputedStyle(e);return i+':'+(c.display==='none'||+c.opacity===0?'hidden':'SHOWN')}).join(' ')")
        ok('tune opaque ('+bg+')', 'rgba' not in bg); ok('tune full width '+json.dumps(r), r[0]<=0.5 and r[1]>=389.5); ok('tune: moon, dimmer, sky hidden ('+hid+')', 'SHOWN' not in hid); ok('tune: sky layers hidden', 'SHOWN' not in await h.ev(SKY))
        if SH: await h.shot(O+'after-01-tune.png')
        # 4 · loved ones in tune
        lv=await h.ev("[...document.querySelectorAll('#tune [data-t=loved], #tune [data-t=lovedex]')].map(b=>{const r=b.closest('.row')||b;return getComputedStyle(r).display}).join(',')")
        ok('tune: loved ones rows hidden in public ('+lv+')', lv and 'none' in lv and all(x=='none' for x in lv.split(',')))
        ok('public build', not await h.ev("GJ.core.owner()"))
        if SH:
            await h.ev("(()=>{const t=document.querySelector('#tune');const g=[...t.querySelectorAll('h3')].find(e=>/^\\s*people\\s*$/i.test(e.textContent));if(g){t.scrollTop+=g.getBoundingClientRect().top-130;}})()"); await h.w(500)
            await h.shot(O+'after-04-tune-people.png')
        await h.ev("GJ.app.tune(false)"); await h.w(400)
        # Messages unchanged (still opaque, as before)
        await room(h,'messages','#messages, #msgs, .msg-room, #ozmsg','messaging','messages') if await h.ev("!!document.querySelector('#messages, #msgs, .msg-room, #ozmsg')") else None
        # 3 · notes: one bar
        await h.pg.goto(APP+'?go=notes&home=1&boot=0'); await h.pg.wait_for_function("document.documentElement.classList.contains('noting')"); await h.w(700)
        await h.pg.keyboard.type('Ridge shoot\nblue hour · three lights'); await h.w(500)
        st=await h.ev("(()=>{const e=document.querySelector('#notes .nt-edit-v');return {edit:!e.hidden, back:!!document.querySelector('#notes .nt-back'), done:(()=>{const d=document.querySelector('#notes .nt-done');if(!d)return null;const r=d.getBoundingClientRect();return [d.textContent,Math.round(r.right),Math.round(r.top)]})(), when:(document.querySelector('#notes .nt-when')||{}).textContent, mark:(document.querySelector('#back')||{}).textContent}})()")
        ok('notes editor: no inner title row '+json.dumps(st), st['edit'] and not st['back'] and st['done'] and st['done'][0]=='done' and st['done'][1]>330)
        if SH: await h.shot(O+'after-03-notes-editor.png')
        await h.ev("document.querySelector('#notes .nt-done').click()"); await h.w(500)
        ok('done puts the keyboard away (familiar); the pencil is in the list footer', await h.ev("document.activeElement!==document.querySelector('#notes .nt-text') && !!document.querySelector('#notes .nt-foot .nt-new')"))
        await h.pg.keyboard.press('Escape'); await h.w(500)
        ok('back from the note goes to the list', await h.ev("document.querySelector('#notes .nt-edit-v').hidden && document.documentElement.classList.contains('noting')"))
        # 4 · friends
        await h.pg.goto(APP+'?go=friends&home=1&boot=0'); await h.w(2500)
        f=await h.ev("(()=>{if(!document.querySelector('.fr-p')) GJ.friends.add('Mara'); const b=document.querySelector('.fr-p'); if(b) GJ.friends.hold(+b.dataset.id); return new Promise(r=>setTimeout(()=>{const m=[...document.querySelectorAll('.fr-p')].length; const L=[...document.querySelectorAll('button[data-m]')].filter(x=>['text','loved','remove','done'].includes(x.dataset.m)).map(x=>x.dataset.m); r({people:m, loved:L.includes('loved'), more:L})},600))})()")
        ok('friends: a person\'s actions, no "move to loved ones" '+json.dumps(f), f['more'] and 'text' in f['more'] and not f['loved'])
        if SH: await h.shot(O+'after-04-friends.png')
        # direct address
        await h.pg.goto(APP+'?go=lovedones&home=1&boot=0'); await h.w(2500)
        lo=await h.ev("(window.GJ&&GJ.lovedOnes&&GJ.lovedOnes.isOpen)?GJ.lovedOnes.isOpen():false") if 'oz/index' in h.pg.url else False
        ok('?go=lovedones does not open it ('+h.pg.url.split('/')[-2]+')', not lo)
        # 2 · rooms dial on Home
        await h.pg.goto(HOME+'?boot=0'); await h.ev("localStorage.setItem('ozo-hinted','true')"); await h.pg.goto(HOME+'?boot=0'); await h.w(3500)
        await h.drag([(385,430),(385,431)], up=False); await h.w(500)
        a=await h.ev(OVER); print('held:', a)
        ok('dial held: no overlapping names (%d shown)' % a['shown'], a['overlaps']==0 and a['shown']>3)
        ok('front name readable '+str(a['front']), a['front'] and a['front'].endswith('|visible'))
        await h.up(); await h.w(700)
        b=await h.ev(OVER); print('stay:', b)
        ok('dial open after release: no overlaps', b['overlaps']==0)
        ok('dial still unfolds (opacity %.2f)' % b['open'], b['open']>.5)
        if SH: await h.shot(O+'after-02-rooms-dial.png')
        worst=0
        await h.pg.keyboard.press('Escape'); await h.w(600)
        y=430; await h.drag([(385,y),(385,y+1)], up=False); await h.w(400)
        for dy in [70,70,70,70,-150,-150,-150]:
            y+=dy; await h.drag([(385,y-dy),(385,y)], up=False) if False else None
            await h.cdp.send('Input.dispatchTouchEvent', {'type':'touchMove','touchPoints':[{'x':385-30,'y':y}]}); await h.w(350)
            c=await h.ev(OVER); worst=max(worst,c['overlaps']); print('turn', y, c['front'], c['overlaps'], c['shown'], c['pairs'])
        if SH: await h.shot(O+'after-02-rooms-dial-turning.png')
        await h.up(); await h.w(500)
        ok('turning: names stay clear (worst %d)' % worst, worst==0)
        errs=[e for e in h.errs if 'ERR_FAILED' not in e and 'vibrate' not in e]
        print('errs', errs[:6], 'bad', h.bad[:4]); ok('no page errors', not errs); ok('no 404s', not h.bad)
asyncio.run(main())
