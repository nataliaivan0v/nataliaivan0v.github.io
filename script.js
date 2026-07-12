const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const RUNS = {
  truffle: [
    ['prompt','$ '],['cmd','truffle run --profile natalia --date 2026-07-08\n'],
    ['dim','[fetch] Hacker News "Who is hiring?" (Jul 2026) ... ok\n'],
    ['dim','[fetch] YC companies (hiring) ..................... ok\n'],
    ['dim','[classify] scanning signals for real openings ... → '],['green','2 openings\n'],
    ['dim','[extract] role · location · stage · tech ......... done\n'],
    ['dim','[score] ranking against profile (NYC · agents · entry) ...\n'],
    ['amber','\n▸ 2 opportunities sniffed out\n\n'],
    ['cmd','  1. '],['green','String'],['cmd',' · Founding Engineer   '],['amber','78/100\n'],
    ['dim','     NYC · seed · hackernews · tech —\n'],
    ['cmd','     Profitable web-data platform (scraping, antibot, infra),\n     7-figure ARR. Founding Eng #5, onsite NYC, small team.\n'],
    ['dim','     why: NYC + seed + early-career + in-person all fit; web\n     data + AI aligns with interests. gap: title ambiguity on\n     seniority, stack unlisted.\n'],
    ['dim','     → news.ycombinator.com/item?id=48825294\n\n'],
    ['cmd','  2. '],['green','Yuzu Health'],['cmd',' · Fullstack Engineer   '],['amber','72/100\n'],
    ['dim','     New York City · series-a · hackernews · tech —\n'],
    ['cmd','     Rebuilding health insurance end-to-end (member portals,\n     claims, ID cards), 1,000+ employers, grew 10x, onsite Chelsea.\n'],
    ['dim','     why: NYC onsite + Series A + fullstack fit seniority &\n     role. gap: stack unspecified (Python/LLM uncertain), insurance\n     domain off from AI-tooling focus, no salary listed.\n'],
    ['dim','     → news.ycombinator.com/item?id=48748407\n\n'],
    ['amber','✓ digest written → digest_2026-07-08.md\n']
  ],
  ledger: [
    ['prompt','$ '],['cmd','ledger analyze AAPL\n'],
    ['dim','[prices] 6mo daily OHLCV via yfinance ......... 124 days\n'],
    ['dim','[signal] 20/50-day moving-average crossover → '],['amber','bullish (mag 1.28)\n'],
    ['dim','[plan]  round 1 · 4 queries → retrieve 10 chunks\n'],
    ['dim','[grade] context sufficient? '],['amber','no'],['dim',' — refine\n'],
    ['dim','[plan]  round 2 · 4 queries → retrieve 12 chunks\n'],
    ['dim','[grade] context sufficient? '],['amber','no'],['dim',' — refine\n'],
    ['dim','[plan]  round 3 · 4 queries → retrieve 14 chunks\n'],
    ['dim','[grade] context sufficient? '],['amber','no'],['dim',' — max rounds, synthesize on best evidence\n'],
    ['dim','[synthesize] stance CONSTRUCTIVE · 5 why / 5 risk (attempt 1)\n'],
    ['dim','[verify] citation gate ......... '],['dim','4/10 sourced → below threshold, retry\n'],
    ['dim','[synthesize] regrounding claims (attempt 2)\n'],
    ['dim','[verify] citation gate ......... '],['green','6/10 sourced ✓\n'],
    ['dim','[benchmark] buy-and-hold +21.39% / 124d (~+48.3% annualized)\n'],
    ['amber','\n▸ AAPL — Grounded Briefing\n\n'],
    ['cmd','  Unusual activity: a bullish 20/50-day moving-average\n  crossover; +21.39% buy-and-hold over the window.\n\n'],
    ['cmd','  Stance: '],['amber','CONSTRUCTIVE\n\n'],
    ['cmd','  Why (grounded in sources)\n'],
    ['cmd','  • Tim Cook announced a $30B Broadcom deal to produce 15B\n    chips under Apple’s American Manufacturing Program '],['dim','[S6·S1]'],['cmd','\n'],
    ['cmd','  • Named among the two Magnificent Seven stocks with the\n    most upside potential, per Wall Street '],['dim','[S3]'],['cmd','\n'],
    ['cmd','  • Board authorized up to $100B in buybacks, Apr 30 2026 '],['dim','[S12]'],['cmd','\n\n'],
    ['cmd','  Key risks\n'],
    ['cmd','  • AI servers outbidding smartphones for memory supply '],['dim','[S5]'],['cmd','\n'],
    ['cmd','  • Apple sued OpenAI alleging trade-secret theft '],['dim','[S7]'],['cmd','\n'],
    ['cmd','  • Smartphone chip cycle repricing on-device AI silicon '],['dim','[S4]'],['cmd','\n'],
    ['dim','\n  4 claims dropped — no evidence found · 7 sources cited\n'],
    ['dim','\n  Decision-support only · not financial advice · price\n  trends are descriptive, not predictive.\n']
  ]
};

function typeRun(el, segs){
  const body = el.querySelector('.term-body');
  body.innerHTML='';
  if(reduce){ segs.forEach(([c,t])=>{const s=document.createElement('span');s.className=c;s.textContent=t;body.appendChild(s);}); return; }
  let si=0, ci=0, cur=null, curTxt='';
  const cursor=document.createElement('span'); cursor.className='cursor';
  body.appendChild(cursor);
  const speed = 9;
  function tick(){
    if(si>=segs.length){ return; }
    const [cls,txt]=segs[si];
    if(ci===0){ cur=document.createElement('span'); cur.className=cls; body.insertBefore(cur,cursor); curTxt=''; }
    let step = txt.startsWith('\n')||txt.length<4 ? txt.length : 2;
    curTxt += txt.slice(ci, ci+step); ci+=step;
    cur.textContent=curTxt;
    body.scrollTop=body.scrollHeight;
    if(ci>=txt.length){ si++; ci=0; }
    setTimeout(tick, speed*step + (txt.includes('...')?60:0));
  }
  tick();
}

document.querySelectorAll('.term').forEach(term=>{
  const key=term.dataset.term;
  let played=false;
  const io=new IntersectionObserver((es,o)=>{es.forEach(e=>{if(e.isIntersecting&&!played){played=true;typeRun(term,RUNS[key]);o.disconnect();}});},{threshold:.35});
  io.observe(term);
  const replay=term.querySelector('.replay');
  replay.addEventListener('click',()=>typeRun(term,RUNS[key]));
  replay.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();typeRun(term,RUNS[key]);}});
});

const rio=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target);}});},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>rio.observe(el));

(function(){
  const el=document.getElementById('name-typed');
  if(!el) return;
  const h1=el.closest('h1');
  const cursor=h1.querySelector('.type-cursor');
  const full=el.textContent;
  const finish=()=>{ if(cursor) cursor.remove(); };
  if(reduce){ finish(); return; }
  el.textContent='';
  h1.classList.add('typing');
  let i=0;
  (function type(){
    el.textContent=full.slice(0,i);
    if(i++<full.length){ setTimeout(type,150); }
    else { finish(); }
  })();
})();
