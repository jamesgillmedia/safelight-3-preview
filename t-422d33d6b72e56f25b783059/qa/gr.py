import asyncio, sys, json
sys.path.insert(0,'/home/claude/oz1/qa')
from hs import HS
O='/home/claude/oz6/return-grant/screenshots/'
APP='http://localhost:8123/apps/oz/index.html'
HOME='http://localhost:8123/apps/oz-open/index.html'
MODE=sys.argv[1] if len(sys.argv)>1 else 'red'; RM='reduce' in sys.argv; SH=not RM
ST={'red':{'red':True,'openRed':True,'dayMode':False,'fullSafe':False},'night':{'red':False,'openRed':False,'dayMode':False,'fullSafe':False},'light':{'red':False,'openRed':False,'dayMode':True,'fullSafe':False}}[MODE]
def ok(name, v): print(('PASS ' if v else 'FAIL ')+name, flush=True)
async def shot(h, name):
    if SH: await h.shot(O+MODE+'-'+name+'.png')
async def tap(h, sel):
    await h.ev("document.querySelector(%s).click()" % json.dumps(sel)); await h.w(350)
async def main():
    async with HS(reduce=RM) as h:
        await h.pg.goto(APP+'?boot=0'); await h.w(1500)
        await h.ev("GJ.store.set(%s)" % json.dumps(ST)); await h.ev("GJ.settings.setItem('gj-grant', null); GJ.f3.clearForTest()"); await h.w(300)
        await h.pg.goto(APP+'?go=grant&home=1&boot=0'); await h.pg.wait_for_function("document.documentElement.classList.contains('fh-in') && GJ.grant.isOpen()", timeout=10000); await h.w(900)
        st=await h.ev("GJ.grant.state()")
        ok('mode '+MODE, await h.ev("[document.documentElement.classList.contains('red'),document.documentElement.classList.contains('day')]")==[MODE=='red',MODE=='light'])
        ok('room name in the bar is "grant"', (await h.ev("document.querySelector('#back').textContent")).strip()=='grant')
        due=await h.ev("document.querySelector('#grant .gr-due').textContent"); loc=await h.ev("new Date('2026-11-26T04:59:00Z').toLocaleTimeString('en-CA',{hour:'numeric',minute:'2-digit'}).toLowerCase()+' · '+Intl.DateTimeFormat().resolvedOptions().timeZone")
        ok('deadline in local time ('+loc+'): '+due, 'wed nov 25' in due and loc.split(' · ')[0] in due and '11:59 p.m. Eastern' in due and 'left' in due)
        ok('criteria in view', await h.ev("document.querySelector('#grant .gr-crit').textContent")=='relevance 40%impact 40%feasibility 20%protocols pass/fail')
        ok('12 sections on the spine, in portal order', [s['id'] for s in st['sections']]==['name','summary','types','describe','why','impact','capacity','budget','timeline','tk','collab','support'])
        cnt={s['id']:s for s in st['sections']}
        ok('decided title in the name field, nothing else written', cnt['name']['chars']==22 and all(s['chars']==0 for s in st['sections'] if s['id'] not in ('name',)))
        ok('backward marks from the changed paths (summary %d, describe %d, budget %d, timeline %d, capacity %d, impact %d)'%tuple(cnt[k]['marks'] for k in ['summary','describe','budget','timeline','capacity','impact']), all(cnt[k]['marks']>0 for k in ['summary','describe','impact','capacity','budget','timeline']))
        ok('forward: provisional while choices are open '+json.dumps({k:cnt[k]['provisional'] for k in ['types','describe','timeline','budget']}), 'knowing' in cnt['types']['provisional'] and 'opening' in cnt['timeline']['provisional'])
        ok('F3 dark on device', not st['f3'])
        await shot(h,'01-summary')
        await h.ev("document.querySelector('#grant .gr-marks').open=true"); await h.w(300); await shot(h,'01b-summary-marks-open')
        # write in his words (test text) and watch the count; the spine stays in view
        await tap(h, '#grant [data-sec=describe]')
        await h.ev("document.querySelector('#grant .gr-ta').focus()")
        await h.pg.keyboard.type('[test text] cedar and light in an existing space. a second line names a projection, to show a drift mark.'); await h.w(800)
        d=await h.ev("GJ.grant.state().sections.find(s=>s.id==='describe').chars"); ok('typing counts ('+str(d)+')', d>80)
        cnt_txt=await h.ev("document.querySelector('#grant .gr-count').textContent"); ok('count shows target: '+cnt_txt, '/ 4,000 characters' in cnt_txt)
        ins=await h.ev("GJ.grant.insights('describe').map(x=>x.k+': '+x.t)"); print('insights', ins)
        ok('insights: drift from the ISO split', any('ISO' in x for x in ins)); ok('insights: a strength to keep', any('cedar and light are here' in x for x in ins))
        await h.ev("document.querySelector('#grant .gr-body').scrollTop=600"); await h.w(300)
        sp=await h.ev("(()=>{const r=document.querySelector('#grant .gr-spine').getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom)]})()"); ok('spine stays in view while scrolled '+str(sp), sp[0]>40 and sp[1]<260)
        await h.ev("document.querySelector('#grant .gr-body').scrollTop=0"); await h.ev("document.activeElement.blur()"); await h.w(300)
        await tap(h, '#grant [data-layer=insights]'); await shot(h,'02-describe-insights')
        await tap(h, '#grant [data-layer=insights]')
        # six prompt layers
        lay=await h.ev("[...document.querySelectorAll('#grant [data-layer]')].map(b=>b.dataset.layer)"); ok('six layers '+str(lay), lay==['core','requirement','creative','direction','imagination','insights'])
        q1=await h.ev("document.querySelector('#grant .gr-q').textContent"); await tap(h,'#grant [data-a=another]'); q2=await h.ev("document.querySelector('#grant .gr-q').textContent"); ok('another prompt', q1!=q2)
        ok('prompts are questions', q1.strip().endswith('?') or q1.strip().endswith('.'))
        # suggestion: only on asking; the cut waits for yes
        before=await h.ev("JSON.parse(GJ.settings.getItem('gj-grant')).sections.find(s=>s.id==='describe').text")
        await tap(h,'#grant [data-a=suggest]'); await h.w(300)
        ok('suggestion offers to take the drifting line out', await h.ev("!!document.querySelector('#grant .gr-sheet [data-s=cut]')"))
        ok('nothing changed before yes', await h.ev("JSON.parse(GJ.settings.getItem('gj-grant')).sections.find(s=>s.id==='describe').text")==before)
        await shot(h,'03-suggestion-on-ask')
        # the writing helper: cloud → F3 lit while asked
        await tap(h,'#grant .gr-sheet [data-s=helper]'); lit=await h.ev("GJ.f3.lit()"); await h.w(1400); lit2=await h.ev("GJ.f3.lit()")
        ok('helper: F3 lit while asked, dark after', lit and not lit2); print('helper said:', await h.ev("document.querySelector('#grant .gr-hres').textContent"))
        await tap(h,'#grant .gr-sheet [data-s=cut]'); after=await h.ev("JSON.parse(GJ.settings.getItem('gj-grant')).sections.find(s=>s.id==='describe').text")
        ok('yes takes only that line out: '+json.dumps(after), 'projection' not in after and 'cedar and light' in after)
        # a fork: Knowing in → forward and backward marks, no rewrite
        m0=await h.ev("GJ.grant.state().marks"); desc0=after
        await tap(h,'#grant [data-tab=choices]'); await shot(h,'04-choices')
        await tap(h,'#grant [data-pick="knowing:yes"]'); st=await h.ev("GJ.grant.state()"); c2={s['id']:s for s in st['sections']}
        ok('pick marks sections (%d → %d)'%(m0,st['marks']), st['marks']>m0 and c2['tk']['marks']>0 and c2['describe']['marks']>cnt['describe']['marks'])
        ok('describe not rewritten', await h.ev("JSON.parse(GJ.settings.getItem('gj-grant')).sections.find(s=>s.id==='describe').text")==desc0)
        ok('activities follow the pick', await h.ev("JSON.parse(GJ.settings.getItem('gj-grant')).sections.find(s=>s.id==='types').text")=='Creating · Knowing · Sharing')
        ok('knowing no longer provisional', 'knowing' not in c2['types']['provisional'])
        await tap(h,'#grant [data-pick="knowing:no"]')
        ok('changing a pick keeps the branch', await h.ev("!!document.querySelector('#grant [data-a=branch][data-f=knowing]')"))
        await tap(h,'#grant [data-a=branch][data-f=knowing]'); await h.w(300); await shot(h,'05-branch-compare'); await tap(h,'#grant .gr-sheet [data-s=x]')
        await tap(h,'#grant [data-tab=path]'); await shot(h,'06-path')
        # free writing → map → yes
        await tap(h,'#grant [data-tab=free]')
        await h.ev("document.querySelector('#grant .gr-free').focus()")
        await h.pg.keyboard.type('[test text] elders guide the protocol and permission for cedar.\n\n[test text] build in april 2027, open in january 2028.\n\n[test text] a wandering thought with no home.'); await h.w(400)
        await h.ev("document.activeElement.blur()"); await tap(h,'#grant [data-a=map]')
        mp=await h.ev("[...document.querySelectorAll('#grant .gr-pass em')].map(e=>e.textContent)"); print('mapped', mp)
        ok('mapping suggests sections, and says when there is no clear one', any('traditional knowledge' in x for x in mp) and any('timeline' in x for x in mp) and any('no clear section' in x for x in mp))
        tk0=await h.ev("JSON.parse(GJ.settings.getItem('gj-grant')).sections.find(s=>s.id==='tk').text"); ok('nothing placed before yes', tk0=='')
        await h.ev("(()=>{const b=document.querySelector('#grant .gr-body');const x=document.querySelector('#grant .gr-pass');b.scrollTop=x.offsetTop-150})()"); await h.w(300)
        await shot(h,'07-free-write-mapped')
        await tap(h,'#grant [data-place$=":tk"]')
        tk1=await h.ev("JSON.parse(GJ.settings.getItem('gj-grant')).sections.find(s=>s.id==='tk').text"); ok('yes places it, his words as written', tk1.startswith('[test text] elders guide'))
        # bring in a draft with the portal headings
        await tap(h,'#grant [data-a=paste]')
        await h.ev("document.querySelector('#grant .gr-paste').value='Impact\\n[test text] under the impact heading.\\n\\nBudget\\n[test text] a budget line.'")
        await tap(h,'#grant .gr-sheet [data-s=domap]')
        mp2=await h.ev("[...document.querySelectorAll('#grant .gr-pass em')].map(e=>e.textContent)"); ok('a pasted draft maps under its headings '+str(mp2), any('under its heading: impact' in x for x in mp2) and any('under its heading: budget' in x for x in mp2))
        # threads → Notes
        await tap(h,'#grant [data-tab=write]'); await tap(h,'#grant [data-sec=impact]')
        await tap(h,'#grant [data-a=qthread]'); await h.ev("document.querySelector('#grant .gr-tin').value='[test text] ask the community centre about evening light.'"); await tap(h,'#grant .gr-sheet [data-s=tadd]')
        await shot(h,'08-thread')
        nt=await h.ev("GJ.notes.all().filter(n=>n.f==='grant').map(n=>n.text.split('\\n')[0])"); ok('thread lives in Notes (folder grant) '+str(nt), len(nt)>=1)
        await tap(h,'#grant .gr-sheet [data-s=x]')
        await tap(h,'#grant [data-tab=threads]'); await shot(h,'09-threads')
        # back: tab → write → out
        await h.pg.keyboard.press('Escape'); await h.w(500); ok('back: to write first', await h.ev("GJ.grant.isOpen() && document.querySelector('#grant').dataset.tab==='write'"))
        await tap(h,'#grant [data-sec=summary]'); await h.w(200)
        log=await h.ev("GJ.f3.log().filter(e=>!/open-meteo/.test(e.where)).map(e=>e.what+' | '+e.end)"); print('f3 log', log); ok('F3 logged the helper ask only', len(log)==1 and 'writing helper' in log[0])
        txt=await h.ev("document.querySelector('#grant').innerText"); import re
        ok('no "OS" in the room', not re.search(r'\bOS\b', txt))
        await h.pg.keyboard.press('Escape'); await h.w(1800)
        ok('back leaves to Home', 'oz-open' in h.pg.url)
        await h.w(1500); f=await h.ev("[__oz.find('grant'),__oz.find('proposal'),__oz.find('canada council')]"); ok('Home finds grant '+str(f), all('grant' in x for x in f))
        errs=[e for e in h.errs if 'ERR_FAILED' not in e and 'vibrate' not in e]; net=[u for u in h.net if 'open-meteo' not in u]
        print('errs', errs[:6], 'bad', h.bad[:4], 'net', net[:3]); ok('no errors', not errs); ok('no 404s', not h.bad); ok('no network from the room', not net)
asyncio.run(main())
