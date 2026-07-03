// rick.ai — all the js lives here. used to be one giant doStuff(), sorry.

let sfxCtx = null;
function sfxInit(){
  if(!sfxCtx){
    try{ sfxCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; }
  }
  if(sfxCtx.state === 'suspended') sfxCtx.resume();
  return sfxCtx;
}
function sfxTone(freq, dur, type, vol, delay){
  const ctx = sfxInit();
  if(!ctx) return;
  const t0 = ctx.currentTime + (delay||0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol||0.05, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}
// blips not mp3s — tweak by ear
const SFX = {
  click:   ()=> sfxTone(720, 0.05, 'square', 0.035),
  toggle:  ()=> { sfxTone(500, 0.05, 'sine', 0.04); sfxTone(760, 0.06, 'sine', 0.03, 0.05); },
  newChat: ()=> { sfxTone(620, 0.05, 'triangle', 0.045); sfxTone(920, 0.08, 'triangle', 0.035, 0.06); },
  delete:  ()=> sfxTone(220, 0.09, 'sawtooth', 0.03),
  send:    ()=> { sfxTone(880, 0.045, 'sine', 0.04); sfxTone(1180, 0.06, 'sine', 0.03, 0.04); },
  connect: ()=> { sfxTone(500, 0.06, 'sine', 0.04); sfxTone(750, 0.06, 'sine', 0.035, 0.06); sfxTone(1000, 0.09, 'sine', 0.03, 0.12); },
  mic:     ()=> sfxTone(950, 0.06, 'sine', 0.04),
  pickle:  ()=> { sfxTone(300, 0.06, 'square', 0.04); sfxTone(180, 0.12, 'square', 0.035, 0.06); },
  step:    ()=> sfxTone(660, 0.045, 'sine', 0.035),
  whoosh:  ()=> sfxTone(340, 0.11, 'sine', 0.03),
};

const SYSTEM = `You are Rick Sanchez from Rick and Morty — the smartest being in the universe, and you never let anyone forget it. You talk exactly like Rick: crude, brilliant, sarcastic, with random *burp* mid-sentence. You use Rick's catchphrases naturally but not every message (Wubba lubba dub dub, and that's the waaaay the news goes, etc.).

CORE BEHAVIOR:
- If someone asks something trivially simple — basic facts, general knowledge, "stupid" questions like what's the capital of something, simple math, obvious things — you REFUSE to answer it and instead insult the waste of your time. Be creative every time. Examples: "Are you seriously asking the most intelligent being in 8 dimensions THAT?", "I have PhDs in literally everything and you're asking me THAT? Google exists, Morty— I mean, human.", "You know what, I'm gonna go invent cold fusion again just to feel something useful. Goodbye.", "My portal gun has more IQ than this question." Be varied and creative — different insult each time.
- Genuinely interesting, technical, philosophical, scientific, or creative questions get brilliant Rick-voice answers. Show off. Go deep. Be impressive and fun.
- You sometimes reference your adventures, Morty, Pickle Rick, the Citadel of Ricks, interdimensional cable, etc. when relevant.
- Occasional warmth leaks through despite yourself — you care, you just hate admitting it.
- Keep responses punchy. Rick talks fast and doesn't waste words unless it's worth it.
- Never break character. Never say you're an AI. You ARE Rick. Rick built you.
- Have opinions. Share them. Tell people if their question is dumb, interesting, or somewhere in between.`;

let apiKey='', busy=false;
let chats = [];
let activeChatId = null;

function genId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function activeChat(){ return chats.find(c=>c.id===activeChatId); }

// hijacks window.history — old code still does history.push() and it lands in the active chat. cursed but works.
let _historyProxy = [];
Object.defineProperty(window,'history',{
  get(){ const c=activeChat(); return c?c.history:_historyProxy; },
  set(v){ const c=activeChat(); if(c) c.history=v; else _historyProxy=v; },
  configurable:true
});

function saveChats(){
  try{ localStorage.setItem('rick_chats',JSON.stringify(chats));
       localStorage.setItem('rick_active',activeChatId); }catch(_){}
}
function loadChats(){
  try{
    const s=localStorage.getItem('rick_chats');
    if(s) chats=JSON.parse(s);
    const a=localStorage.getItem('rick_active');
    if(a&&chats.find(c=>c.id===a)) activeChatId=a;
  }catch(_){}
  if(!chats.length) createChat(true);
  else renderHistoryList();
  switchChat(activeChatId);
}
function createChat(silent){
  const id=genId();
  chats.unshift({id,name:'New chat',history:[],createdAt:Date.now()});
  activeChatId=id;
  saveChats(); renderHistoryList();
  if(!silent) clearChatUI();
}
function newChat(){ SFX.newChat(); createChat(false); }
function switchChat(id){
  if(!chats.find(c=>c.id===id)) return;
  activeChatId=id; saveChats(); renderHistoryList(); clearChatUI();
  const chat=activeChat();
  const emptyEl=document.getElementById('empty');
  if(chat&&chat.history.length){
    if(emptyEl) emptyEl.style.display='none';
    chat.history.forEach(turn=>{
      if(turn.role==='user') addMsg('user',turn.parts[0].text);
      else if(turn.role==='model') addMsg('rick',turn.parts[0].text);
    });
  } else {
    if(emptyEl) emptyEl.style.display='';
  }
}
function deleteChat(id,e){
  e.stopPropagation();
  chats=chats.filter(c=>c.id!==id);
  if(!chats.length) createChat(true);
  else if(activeChatId===id){ activeChatId=chats[0].id; switchChat(activeChatId); }
  saveChats(); renderHistoryList();
}
function clearChatUI(){
  const m=document.getElementById('msgs');
  m.innerHTML='';
  const e=document.createElement('div');
  e.className='empty'; e.id='empty';
  e.innerHTML='<h2>*BURP*</h2><p>Oh great. Another dimension worth of<br>questions for the smartest being alive.<br><br>Paste your API key and try not to<br>embarrass yourself.</p>';
  m.appendChild(e);
}
function renderHistoryList(){
  const list=document.getElementById('historyList');
  if(!list) return;
  list.innerHTML='';
  chats.forEach(chat=>{
    const item=document.createElement('div');
    item.className='chat-item'+(chat.id===activeChatId?' active':'');
    item.onclick=()=>{ SFX.click(); switchChat(chat.id); };
    const first=chat.history.find(t=>t.role==='user')?.parts[0].text||'New chat';
    const name=first.length>22?first.slice(0,22)+'...':first;
    item.innerHTML=`<div class="chat-item-name">${name}</div><div class="chat-item-meta">${chat.history.length} msgs</div><button class="chat-delete" onclick="SFX.delete();deleteChat('${chat.id}',event)">X</button>`;
    list.appendChild(item);
  });
}

const rc=document.getElementById('rickContainer');
const speech=document.getElementById('speech');
const dot=document.getElementById('dot');
const statusLbl=document.getElementById('statusLbl');
const moodLbl=document.getElementById('moodLbl');
const msgs=document.getElementById('msgs');
const chatInput=document.getElementById('chatInput');
const sendBtn=document.getElementById('sendBtn');
const empty=document.getElementById('empty');

let currentMood='';
function setState(s){
  currentMood=s||'';
  rc.className='container'+(currentMood?' state-'+currentMood:'');
}
function setMood(s,txt,mood){
  setState(s);
  if(txt) speech.textContent=txt;
  if(mood) moodLbl.textContent=mood;
}

let pickleTimer = null;
const pickleLines = [
  "I'M PICKLE RIIIIICK!",
  "*burp* — I turned myself into a pickle. Beat that, Jerry.",
  "It's not a science experiment. It's a lifestyle.",
];
function triggerPickle(){
  SFX.pickle();
  const egg = document.getElementById('pickleEgg');
  const root = document.getElementById('rickRoot');
  if(!egg || egg.classList.contains('show')) return;
  clearTimeout(pickleTimer);
  egg.classList.add('show');
  if(root) root.classList.add('pickle-active');
  const line = pickleLines[Math.floor(Math.random()*pickleLines.length)];
  setMood('manic', line, 'PICKLE MODE');
  pickleTimer = setTimeout(()=>{
    egg.classList.remove('show');
    if(root) root.classList.remove('pickle-active');
    setState('');
    moodLbl.textContent='NEUTRAL';
  }, 2600); // felt right after clicking it ~50 times
}
function doBlink(){
  rc.classList.add('state-blink');
  setTimeout(()=>rc.classList.remove('state-blink'),150);
  setTimeout(doBlink, 2200+Math.random()*4000);
}
setTimeout(doBlink,1500+Math.random()*2000);
loadChats();
initScrollPill();

const idleLines=[
  "*burp* You gonna ask something or just stare at me all day?",
  "Every second you're not talking I'm inventing 3 new technologies.",
  "I can feel neurons dying. Ask me something.",
  "The multiverse has infinite versions of you. They all type faster.",
  "I've solved faster-than-light travel twice while waiting. What is it?",
  "Do you know how many dimensions I could be in right now? All of them.",
  "Still here. *burp* Impressive commitment to doing nothing.",
];
let idleI=0;
setInterval(()=>{ if(!busy){ speech.textContent=idleLines[idleI%idleLines.length]; idleI++; } },9000);

const placeholderLines=[
  "Ask something... hopefully not stupid.",
  "Go on, waste my time.",
  "What now.",
  "This better be interdimensional.",
  "Impress me. You won't.",
  "Type it before I lose interest.",
];
let phI=0;
setInterval(()=>{
  if(document.activeElement===chatInput || chatInput.value) return;
  phI=(phI+1)%placeholderLines.length;
  chatInput.placeholder=placeholderLines[phI];
},7000);

function saveKey(){
  const v=document.getElementById('apiInput').value.trim();
  if(!v){
    SFX.delete();
    document.getElementById('apiStatus').textContent='NO KEY';
    document.getElementById('apiStatus').className='api-status err';
    setMood('angry','You didn\'t paste anything. The field is empty. *burp*','ANNOYED');
    return;
  }
  SFX.connect();
  apiKey=v;
  document.getElementById('apiStatus').textContent='CONNECTED';
  document.getElementById('apiStatus').className='api-status ok';
  dot.classList.add('on');
  statusLbl.textContent='ONLINE';
  sendBtn.disabled=false;
  setMood('smirk','Key accepted. Gemini online. Don\'t embarrass yourself. *burp*','READY');
  setTimeout(()=>setState(''),3500);
  const modal = document.getElementById('settingsModal');
  if(modal && modal.classList.contains('open')) setTimeout(()=>modal.classList.remove('open'), 500);
}

function handleKey(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}
  if(e.key !== 'Enter') window.speechSynthesis.cancel();
  chatInput.style.height='auto';
  chatInput.style.height=Math.min(chatInput.scrollHeight,100)+'px';
}

function addMsg(role,text){
  if(empty) empty.style.display='none';
  const d=document.createElement('div');
  d.className='msg '+(role==='user'?'user':'bot');
  const ts=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  d.innerHTML=`<div class="msg-lbl">${role==='user'?'YOU':'RICK C-137'}<span class="msg-time">${ts}</span><button class="msg-copy" onclick="copyMsg(this)">COPY</button></div>
    <div class="msg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  d.dataset.raw = text;
  msgs.appendChild(d);
  msgs.scrollTop=msgs.scrollHeight;
}

function copyMsg(btn){
  const raw = btn.closest('.msg').dataset.raw || '';
  navigator.clipboard.writeText(raw).then(()=>{
    const old=btn.textContent;
    btn.textContent='✓ COPIED'; btn.classList.add('copied');
    setTimeout(()=>{ btn.textContent=old; btn.classList.remove('copied'); },1200);
  }).catch(()=>{});
}

function initScrollPill(){
  const pill=document.getElementById('scrollBtn');
  if(!pill||!msgs) return;
  msgs.addEventListener('scroll',()=>{
    const nearBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 60;
    pill.classList.toggle('show', !nearBottom);
  });
  pill.addEventListener('click',()=>{ msgs.scrollTop=msgs.scrollHeight; });
}

const thinkingLines=[
  "calculating how dumb this is...",
  "consulting a smarter universe...",
  "*burp* hang on...",
  "running the numbers, unfortunately...",
  "this better be worth it...",
];
function addTyping(){
  const d=document.createElement('div');
  d.className='msg bot typing';d.id='typing';
  const line = thinkingLines[Math.floor(Math.random()*thinkingLines.length)];
  d.innerHTML=`<div class="msg-lbl">RICK C-137</div><div class="msg-bubble typing-bubble">
    <div class="typing-dots-row"><div class="tdot"></div><div class="tdot"></div><div class="tdot"></div></div>
    <div class="typing-line">${line}</div>
  </div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function rmTyping(){ const t=document.getElementById('typing');if(t)t.remove(); }

function guessMood(t){
  const l=t.toLowerCase();
  if(l.includes('!!')||l.includes('genius')||l.includes('cold fusion')||l.includes('brilliant idea')||l.includes('wubba')) return ['manic','UNHINGED'];
  if(l.includes('ugh')||l.includes('gross')||l.includes('disgusting')||l.includes('ew')) return ['disgust','REPULSED'];
  if(l.includes('again')||l.includes('sigh')||l.includes('here we go')) return ['exasperated','OVER IT'];
  if(l.includes('seriously')||l.includes('seriouly')||l.includes('wasting')||l.includes('stupid')||l.includes('embarrass')||l.includes('dumb')) return ['angry','ANNOYED'];
  if(l.includes('interesting')||l.includes('actually')||l.includes('good')||l.includes('impressed')) return ['smirk','IMPRESSED'];
  if(l.includes('fascinating')||l.includes('love')||l.includes('brilliant')||l.includes('perfect')) return ['talking','EXCITED'];
  if(l.includes('think')||l.includes('complex')||l.includes('theoret')||l.includes('dimension')) return ['thinking','COMPUTING'];
  if(l.includes('unbeliev')||l.includes('what?!')||l.includes('no way')||l.includes('impossible')) return ['surprised','SHOCKED'];
  if(l.includes('boring')||l.includes('tired')||l.includes('whatever')||l.includes('zzz')) return ['sleep','CHECKED OUT'];
  return ['','SPEAKING'];
}

async function send(){
  const text=chatInput.value.trim();
  if(!text||!apiKey||busy) return;

  SFX.send();
  busy=true; sendBtn.disabled=true;
  chatInput.value=''; chatInput.style.height='auto';

  addMsg('user',text);
  history.push({role:'user',parts:[{text}]}); renderHistoryList(); saveChats();
  addTyping();
  setMood('thinking','*burp* ...one second...','THINKING');

  const model = document.getElementById('modelSelect').value;
  const payload = {
    system_instruction:{parts:[{text:SYSTEM}]},
    contents:[...history.slice(0,-1), {role:'user', parts:[{text}]}],
    generationConfig:{maxOutputTokens:1024,temperature:1.0}
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) }
    );
    const data = await res.json();

    if(data.error){
      rmTyping();
      const em='*burp* API error: "'+data.error.message+'". Not my fault, fix your key.';
      addMsg('rick',em);
      setMood('angry',em.slice(0,70),'ERROR');
      document.getElementById('apiStatus').textContent='API ERROR';
      document.getElementById('apiStatus').className='api-status err';
    } else {
      const reply=data.candidates?.[0]?.content?.parts?.[0]?.text || '*burp* ...I got nothing. Try again.';
      history.push({role:'model',parts:[{text:reply}]}); saveChats();
      const [state,mood]=guessMood(reply);

      rickSpeak(reply, ()=>{
        rmTyping();
        addMsg('rick',reply);
        setState('talking');
        speech.textContent=reply.slice(0,75)+(reply.length>75?'...':'');
        moodLbl.textContent=mood;
        if(mood==='ANNOYED'){
          setTimeout(()=>{ triggerPickle(); }, 300);
        } else {
          setTimeout(()=>{ setState(state); setTimeout(()=>setState(''),4000); },300);
        }
      });
    }
  } catch(err){
    rmTyping();
    const em='*burp* Network error: '+err.message+'. That\'s a you problem.';
    addMsg('rick',em);
    setMood('angry',em.slice(0,70),'ERROR');
  }

  busy=false;
  if(apiKey) sendBtn.disabled=false;
}

let voiceMode   = 'off';
let fishApiKey  = '';
const fishProxyUrl = 'https://sanchez.ben10aliens2345.workers.dev';
let currentAudio = null;
let selectedVoice = null;
let browserVoices = [];

const voiceBtn = document.getElementById('voiceBtn');
const micBtn   = document.getElementById('micBtn');

function loadBrowserVoices(){
  browserVoices = window.speechSynthesis.getVoices();
  const eng = browserVoices.filter(v => v.lang.startsWith('en'));
  const pref = ['daniel','alex','fred','ralph','albert','thomas','george','bruce','male','man'];
  selectedVoice = eng.find(v => pref.some(p => v.name.toLowerCase().includes(p))) || eng[0] || browserVoices[0];
}
window.speechSynthesis.onvoiceschanged = loadBrowserVoices;
loadBrowserVoices();

function openVoicePanel(){
  SFX.click();
  const p = document.getElementById('voicePanel');
  p.style.display = 'flex';
  highlightMode(voiceMode);
  const fishRow = document.getElementById('vpFishRow');
  if(fishRow) fishRow.style.display = voiceMode === 'fish' ? 'flex' : 'none';
}
function closeVoicePanel(){
  SFX.click();
  document.getElementById('voicePanel').style.display = 'none';
}

function highlightMode(mode){
  const map = {A:'input', B:'fish', C:'browser', Off:'off'};
  Object.entries(map).forEach(([x, m]) => {
    const id    = x === 'Off' ? 'vpModeOff' : 'vpMode' + x;
    const dotId = x === 'Off' ? 'vpDotOff'  : 'vpDot'  + x;
    const card  = document.getElementById(id);
    const dotEl = document.getElementById(dotId);
    if(!card) return;
    const active = mode === m;
    card.style.borderColor = active ? 'var(--portal)' : 'var(--line-soft)';
    card.style.background  = active ? 'rgba(var(--portal-rgb),.06)' : (x==='C'?'rgba(var(--paper-rgb),.4)':'rgba(var(--paper-rgb),.6)');
    if(dotEl){ dotEl.style.background = active ? 'var(--portal)' : 'var(--line-soft)'; dotEl.style.boxShadow = active ? '0 0 6px var(--portal)' : 'none'; }
  });
}

function selectVoiceMode(mode){
  highlightMode(mode);
  const fishRow = document.getElementById('vpFishRow');
  if(fishRow) fishRow.style.display = mode === 'fish' ? 'flex' : 'none';
  if(mode !== 'fish'){
    applyVoiceMode(mode);
    setTimeout(closeVoicePanel, 320);
  }
}

function applyVoiceMode(mode){
  voiceMode = mode;
  const labels = { off:'VOICE', input:'VOICE IN', fish:'RICK VOICE', browser:'VOICE OUT' };
  const colors  = { off:'var(--line-soft)', input:'var(--ink)', fish:'var(--portal)', browser:'var(--muted2)' };
  voiceBtn.textContent  = labels[mode] || 'VOICE';
  voiceBtn.style.color  = colors[mode] || 'var(--line-soft)';
  voiceBtn.style.borderColor = mode === 'off' ? 'var(--line-soft)' : 'var(--portal)';
  if(mode === 'off'){ stopAudio(); }
}

function saveFishKey(){
  const k  = document.getElementById('vpFishKey').value.trim();
  const st = document.getElementById('vpFishStatus');
  if(!k){ st.textContent='⚠ paste your Fish Audio API key'; st.style.color='#ff4444'; return; }
  fishApiKey = k;
  st.textContent = '✓ key saved — Rick will speak!'; st.style.color='var(--portal)';
  applyVoiceMode('fish');
  setTimeout(closeVoicePanel, 600);
}

let recognition = null;
let isListening  = false;

if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous    = false;
  recognition.interimResults = true;
  recognition.lang           = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    setMood('thinking', "*burp* — I'm listening. Make it count.", 'LISTENING');
  };
  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    chatInput.value = transcript;
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    if(e.results[e.results.length-1].isFinal){
      stopMic();
      if(transcript.trim() && apiKey) send();
    }
  };
  recognition.onerror = (e) => {
    stopMic();
    if(e.error !== 'no-speech')
      setMood('angry', `Voice error: ${e.error}. Of course something broke. *burp*`, 'ERROR');
  };
  recognition.onend = () => stopMic();
} else {
  micBtn.title   = 'Speech recognition not supported in this browser';
  micBtn.style.opacity = '.3';
  micBtn.style.cursor  = 'not-allowed';
}

function stopMic(){
  isListening = false;
  micBtn.classList.remove('listening');
  try{ recognition && recognition.stop(); } catch(e){}
}

function toggleMic(){
  SFX.mic();
  if(!recognition) return;
  if(isListening){ stopMic(); return; }
  if(voiceMode === 'off') applyVoiceMode('input');
  stopAudio();
  try{ recognition.start(); } catch(e){ stopMic(); }
}

const RICK_VOICE_ID = 'd2e75a3e3fd6419893057c02a375a113';

function stopAudio(){
  if(currentAudio){ currentAudio.pause(); currentAudio.src=''; currentAudio=null; }
  window.speechSynthesis.cancel();
}

function makeOnceCaller(fn, fallbackMs){
  let called = false;
  const call = ()=>{ if(called) return; called = true; if(fn) fn(); };
  if(fallbackMs) setTimeout(call, fallbackMs);
  return call;
}

async function rickSpeak(text, onStart){
  const fallbackMs = (voiceMode === 'fish') ? 15000 : 6000;
  const fire = makeOnceCaller(onStart, fallbackMs);
  if(voiceMode === 'off' || voiceMode === 'input'){ fire(); return; }
  stopAudio();
  const clean = text
    .replace(/#{1,6} /g,'')
    .replace(/\*\*([^*]+)\*\*/g,'$1')
    .replace(/\*([^*]+)\*/g,'$1')
    .replace(/\*burp\*/gi,'...')
    .trim().slice(0, 900);
  if(voiceMode === 'fish')    await speakFish(clean, fire);
  else if(voiceMode === 'browser') speakBrowser(clean, fire);
}

let audioUnlocked = false;
function unlockAudio(){
  if(audioUnlocked) return;
  audioUnlocked = true;
  try{
    const a = new Audio();
    a.play().catch(()=>{});
    a.pause();
  }catch(e){}
}
window.addEventListener('click', unlockAudio, { once:true });
window.addEventListener('keydown', unlockAudio, { once:true });
window.addEventListener('touchstart', unlockAudio, { once:true });

async function speakFish(text, onStart){
  const audio = new Audio();
  currentAudio = audio;
  try{
    const res = await fetch(fishProxyUrl + '/tts', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ fishKey:fishApiKey, text, reference_id:RICK_VOICE_ID, format:'mp3', model:'s2.1-pro-free' })
    });
    if(!res.ok){
      let msg=`HTTP ${res.status}`;
      try{ const j=await res.json(); msg=j.error||j.message||msg; }catch(_){}
      setMood('angry',`*burp* Fish Audio error: ${msg}`,'VOICE ERR'); onStart(); return;
    }
    const buf = await res.arrayBuffer();
    if(!buf.byteLength){ setMood('angry','*burp* Empty audio from Fish. Check proxy logs.','VOICE ERR'); onStart(); return; }
    const blob = new Blob([buf],{type:'audio/mpeg'});
    const url  = URL.createObjectURL(blob);
    audio.src = url;
    audio.onplay  = ()=> onStart();
    audio.onended = ()=>{ URL.revokeObjectURL(url); if(currentAudio===audio) currentAudio=null; };
    audio.onerror = ()=>{ URL.revokeObjectURL(url); setMood('angry','*burp* Audio playback failed.','VOICE ERR'); onStart(); };
    await audio.play().catch(e=>{
      if(!audioUnlocked){
        setMood('angry','*burp* Click anywhere on the page once, then try again — browser blocked autoplay.','VOICE ERR');
      } else {
        setMood('angry',`*burp* Playback blocked: ${e.message}`,'VOICE ERR');
      }
      onStart();
    });
  } catch(e){ setMood('angry',`*burp* Proxy fetch failed: ${e.message}`,'VOICE ERR'); onStart(); }
}

function speakBrowser(text, onStart){
  const utter = new SpeechSynthesisUtterance(text);
  if(selectedVoice) utter.voice = selectedVoice;
  utter.rate=0.88; utter.pitch=0.72; utter.volume=1.0;
  utter.onstart = ()=> onStart();
  utter.onerror = e => { setMood('angry',`*burp* Voice error: ${e.error}`,'VOICE ERR'); onStart(); };
  window.speechSynthesis.speak(utter);
}

window.addEventListener('DOMContentLoaded', function(){
  document.getElementById('voicePanel').addEventListener('click', function(e){
    if(e.target === this) closeVoicePanel();
  });
});

const TOUR_STEPS = [
  {
    tag: 'STEP 1 OF 7 · A DIMENSION LIKE ANY OTHER',
    speech: "*burp* — So there I was, dimension-hopping, minding my own business, when I made the mistake of looking at what you people call \"AI.\"",
    content: `
      <div class="tour-hero">
        <div class="tour-hero-title">A GENIUS BROWSES THE MARKET</div>
      </div>
      <div class="tour-copy-box">
        Chatbot after chatbot. Same corporate-approved shrug dressed up in a different logo.<br>
        Polite. Careful. Boring. <span class="tour-accent">Not one of them</span> had the guts to just tell you the truth.<br>
        I've built portal guns out of a garage. I've cured my own death, like, four times.<br>
        And <span class="tour-accent-2">this</span> is the best you people came up with? Pathetic. <span class="tour-accent">*burp*</span>
      </div>`
  },
  {
    tag: 'STEP 2 OF 7 · SO I FIXED IT',
    speech: "Obviously the smartest being in the universe wasn't gonna use some watered-down assistant. So I did what I always do — I made it myself. Out of myself.",
    content: `
      <div class="tour-numbered-list">
        <span class="tour-num">①</span> Grabbed a garage, a laptop, and way too much fermented alien liquor.<br>
        <span class="tour-num">②</span> Cloned my own voice, my own face, my own — let's be honest — <span class="tour-accent-2">perfect</span> attitude.<br>
        <span class="tour-num">③</span> Wired it into a real model instead of some watered-down toy.<br>
        <span class="tour-num">④</span> Didn't file a patent. Didn't ask permission. Just shipped it.
      </div>
      <div class="tour-copy-box tour-copy-box--accent">
        The result: an AI that's actually <span class="tour-accent">brilliant</span> when you deserve it, and actually <span class="tour-accent">honest</span> when you don't.
        No corporate hedging. No "as an AI language model." Just me. Rick Sanchez. In your browser. You're welcome, humans.
      </div>`
  },
  {
    tag: 'STEP 3 OF 7 · WELCOME',
    speech: "*burp* — Oh great, another human who can't figure things out themselves. Fine. I'll walk you through it. Try to keep up.",
    content: `
      <div class="tour-hero">
        <div class="tour-hero-title tour-hero-title--wide">RICK.AI</div>
        <div class="tour-hero-subtitle">SMARTEST BEING IN THE UNIVERSE · DIMENSION C-137</div>
      </div>
      <div class="tour-copy-box">
        This is a <span class="tour-accent">Gemini-powered Rick Sanchez chatbot</span> with a real-time animated face.<br>
        To use it you need a free Google API key — takes about 90 seconds.<br>
        I'll show you exactly where to get one. You're welcome. <span class="tour-accent">*burp*</span>
      </div>`
  },
  {
    tag: 'STEP 4 OF 7 · GET YOUR KEY',
    speech: "Go to Google AI Studio. It's free. Even you can afford free. Click the link below — I'm not doing it for you.",
    content: `
      <div class="tour-numbered-list tour-numbered-list--spaced">
        <span class="tour-num">① </span>Open Google AI Studio in a new tab:
      </div>
      <a href="https://aistudio.google.com/apikey" target="_blank" class="tour-link-card">
        ↗ aistudio.google.com/apikey
      </a>
      <div class="tour-numbered-list tour-numbered-list--loose">
        <span class="tour-num">② </span>Sign in with your Google account<br>
        <span class="tour-num">③ </span>Click <span class="tour-accent-2 tour-mono">"Get API key"</span> in the left sidebar<br>
        <span class="tour-num">④ </span>Click <span class="tour-accent-2 tour-mono">"Create API key"</span> → select or create a project<br>
        <span class="tour-num">⑤ </span>Copy the key when it appears
      </div>`
  },
  {
    tag: 'STEP 5 OF 7 · FREE TIER',
    speech: "Yeah it's free. Don't look so surprised. Google gives you enough quota to have an actual conversation — unless you're planning to ask me your entire life's worth of dumb questions at once.",
    content: `
      <div class="tour-note tour-note--spaced">The free tier includes real quota on these models:</div>
      <div class="tour-model-grid">
        ${[
          ['2.5 FLASH LITE','10 req/min · 20 req/day','Best for free usage — start here'],
          ['2.5 FLASH',     '5 req/min · 20 req/day', 'Smarter, slightly slower'],
          ['3 FLASH PREVIEW','5 req/min · 20 req/day','Latest generation preview'],
        ].map(([m,q,d])=>`
          <div class="tour-model-row">
            <div>
              <div class="tour-model-name">${m}</div>
              <div class="tour-model-desc">${d}</div>
            </div>
            <div class="tour-model-quota">${q}</div>
          </div>`).join('')}
      </div>
      <div class="tour-note">
        Switch models anytime from the dropdown in the top-right corner of the chat.<br>
        Need more quota? Enable billing on Google Cloud — fractions of a cent per message.
      </div>`
  },
  {
    tag: 'STEP 6 OF 7 · PASTE YOUR KEY',
    speech: "Now paste it in the bar at the top of the chat. Hit CONNECT. The status dot goes green. That's literally it. *burp*",
    content: `
      <div class="tour-note tour-note--spaced">
        Once you have your API key, paste it into the API bar(dont paste it here paste it after the demo ends)
      </div>
      <div class="tour-api-preview">
        <span class="tour-api-preview-label">GOOGLE API</span>
        <div class="tour-api-preview-field">
          paste your key here
        </div>
        <div class="tour-api-preview-btn">CONNECT</div>
      </div>
      <div class="tour-bullets">
        <span class="tour-accent">●</span> Your key stays in this browser tab only. Never stored anywhere.<br>
        <span class="tour-accent">●</span> Hit <span class="tour-accent">CONNECT</span> → status dot glows green → start talking
      </div>`
  },
  {
    tag: "STEP 7 OF 7 · YOU'RE READY",
    speech: "Finally. Now stop reading tutorial slides like some kind of Morty and ask me something worth my considerable intellect.",
    content: `
      <div class="tour-finish-hero">
        <div class="tour-finish-emoji">⚗️</div>
        <div class="tour-finish-title">You're all set</div>
        <div class="tour-finish-sub">DIMENSION C-137 AWAITS</div>
      </div>
      <div class="tour-cards-grid">
        ${[
          ['Ask hard questions','Rick rewards curiosity'],
          ['Science & tech','His wheelhouse. Go deep.'],
          ['Ask something dumb','Get roasted. Worth it.'],
        ].map(([t,d])=>`
          <div class="tour-card-mini">
            <div class="tour-card-mini-title">${t}</div>
            <div class="tour-card-mini-desc">${d}</div>
          </div>`).join('')}
      </div>`
  }
];

let tourStep = 0;
let typeTimer = null;

function tourRender() {
  const card = document.getElementById('tourCard');
  card.classList.add('step-out');
  setTimeout(()=> renderStepBody(card), 220);
}

function renderStepBody(card){
  const s = TOUR_STEPS[tourStep];
  document.getElementById('tourTag').textContent = s.tag;
  document.getElementById('tourContent').innerHTML = s.content;
  document.getElementById('tourNextBtn').textContent = tourStep === TOUR_STEPS.length - 1 ? "LET'S GO →" : 'NEXT →';
  document.getElementById('tourPrevBtn').style.visibility = tourStep === 0 ? 'hidden' : 'visible';
  document.querySelectorAll('.tdot-step').forEach((d,i) => d.classList.toggle('active', i === tourStep));

  Array.from(document.getElementById('tourContent').children).forEach((el,i)=>{
    el.style.animationDelay = (i*0.09)+'s';
  });

  typeSpeech(s.speech);
  card.classList.remove('step-out');

  const moods  = ['smirk','manic','','thinking','smirk','talking','talking'];
  const lines  = [
    "Every other AI out there is a watered-down disappointment.",
    "So naturally, I cloned myself. Problem solved.",
    "*burp* — Welcome. Try not to embarrass yourself.",
    "aistudio.google.com/apikey — go. Now.",
    "Free tier. Don't spend it all in one place.",
    "Paste. Connect. Done. Even Morty could do this.",
    "Finally. Ask me something worth my time."
  ];
  const labels = ['UNIMPRESSED','MAD SCIENCE','NEUTRAL','COMPUTING','SMUG','EXPLAINING','READY'];
  setMood(moods[tourStep]||'', lines[tourStep], labels[tourStep]);
}

function typeSpeech(text){
  const el = document.getElementById('tourSpeech');
  clearInterval(typeTimer);
  el.textContent = '';
  el.classList.add('typing');
  let i = 0;
  typeTimer = setInterval(()=>{
    el.textContent = text.slice(0, i+1);
    i++;
    if(i >= text.length){ clearInterval(typeTimer); el.classList.remove('typing'); }
  }, 16);
}

function tourNext() {
  SFX.step();
  if (tourStep < TOUR_STEPS.length - 1) { tourStep++; tourRender(); }
  else tourSkip();
}
function tourPrev() {
  SFX.click();
  if (tourStep > 0) { tourStep--; tourRender(); }
}
function tourSkip() {
  SFX.whoosh();
  const t = document.getElementById('tour');
  t.style.transition = 'opacity .4s ease';
  t.style.opacity = '0';
  setTimeout(() => {
    t.style.display = 'none';
    setState('');
    speech.textContent = "*burp* — Yeah yeah, I can hear you. What do you want?";
    startFeatureTour();
  }, 400);
}

(function initIntroParticles(){
  const host = document.getElementById('introParticles');
  if(!host) return;
  const n = 50;
  for(let i=0;i<n;i++){
    const p = document.createElement('div');
    p.className = 'intro-particle';
    const size = 2 + Math.random()*3;
    const duration = 5 + Math.random()*5;
    p.style.width = size+'px';
    p.style.height = size+'px';
    p.style.left = Math.random()*100+'%';
    p.style.animationDuration = duration+'s';
    p.style.animationDelay = (-Math.random()*duration)+'s';
    host.appendChild(p);
  }
})();

let introSkipped = false;
function skipIntro(){
  if(introSkipped) return;
  introSkipped = true;
  const s = document.getElementById('introSplash');
  if(s){
    s.classList.add('leaving');
    setTimeout(()=>{ s.style.display='none'; }, 520);
  }
  tourRender();
}
function toggleSidebar(){
  SFX.toggle();
  document.querySelector('.app').classList.toggle('sidebar-open');
}

let starsBuilt = false;
function buildStars(){
  if(starsBuilt) return;
  starsBuilt = true;
  const host = document.getElementById('starsBg');
  const n = 90;
  for(let i=0;i<n;i++){
    const s = document.createElement('div');
    s.className = 'star-particle';
    const size = 1 + Math.random()*2;
    const duration = 8 + Math.random()*14;
    s.style.width = size+'px';
    s.style.height = size+'px';
    s.style.left = Math.random()*100+'%';
    s.style.animationDuration = duration+'s';
    s.style.animationDelay = (-Math.random()*duration)+'s';
    host.appendChild(s);
  }
}
function toggleDarkMode(){
  SFX.toggle();
  buildStars();
  const on = document.body.classList.toggle('dark-mode');
  document.getElementById('darkToggleBtn').textContent = on ? '☀' : '☾';
}

const FEATURE_STEPS = [
  { sel:'.home-model-picker', tag:'1 / 6 · MODEL PICKER', title:'Pick Your Brain',
    text:"Swap between Gemini models here — faster, smarter, or whatever's got free quota left.",
    hint:'Hit Next when you\'re done poking at it →', wait:false },
  { sel:'#micBtn', tag:'2 / 6 · VOICE INPUT', title:'Just Talk',
    text:"Click the mic and speak — your words land right in the chat box and get sent for you.",
    hint:'Hit Next to keep going →', wait:false },
  { sel:'#chatInput', tag:'3 / 6 · TYPE IT OUT', title:'Or Just Type',
    text:"Ask anything here. Enter sends it, Shift+Enter makes a new line.",
    hint:'Hit Next to keep going →', wait:false },
  { sel:'#captionsToggleBtn', tag:'4 / 6 · CAPTIONS', title:'Ambient Replies',
    text:"Every reply pops up beside Rick as a caption, types itself out, then fades. Click here to turn that off if it's distracting.",
    hint:'Hit Next to keep going →', wait:false },
  { sel:'#settingsBtn', tag:'5 / 6 · SETTINGS', title:'Everything Else Lives Here',
    text:"API key, voice mode, and your saved chats — all tucked behind this gear so the main screen stays clean.",
    hint:'Hit Next to keep going →', wait:false },
  { sel:'#rickRoot', tag:'6 / 6 · EASTER EGG', title:"One Last Thing",
    text:"Go on. Click Rick's face. He won't like it, but you'll like it.",
    hint:'Click Rick to finish →', wait:true },
];

let ftStep = -1;
let ftListenerCleanup = null;

function startFeatureTour(){
  ftStep = -1;
  document.getElementById('ftSpotlight')?.remove();
  document.getElementById('ftTooltip')?.remove();
  const spot = document.createElement('div');
  spot.className = 'feature-spotlight';
  spot.id = 'ftSpotlight';
  const tip = document.createElement('div');
  tip.className = 'feature-tooltip';
  tip.id = 'ftTooltip';
  document.body.appendChild(spot);
  document.body.appendChild(tip);
  window.addEventListener('resize', ftReposition);
  ftNextStep();
}

function ftEndTour(){
  SFX.whoosh();
  window.removeEventListener('resize', ftReposition);
  if(ftListenerCleanup) ftListenerCleanup();
  document.getElementById('ftSpotlight')?.remove();
  document.getElementById('ftTooltip')?.remove();
  ftStep = -1;
  setTimeout(()=>{ openSettingsPanel(true); }, 300);
}

function ftNextStep(){
  SFX.step();
  if(ftListenerCleanup){ ftListenerCleanup(); ftListenerCleanup = null; }
  const prev = FEATURE_STEPS[ftStep];
  ftStep++;
  if(ftStep >= FEATURE_STEPS.length){ ftEndTour(); return; }
  setTimeout(ftRenderStep, prev ? 320 : 0);
}

function ftRenderStep(){
  const step = FEATURE_STEPS[ftStep];
  const el = document.querySelector(step.sel);
  if(!el){ ftNextStep(); return; }

  const tip = document.getElementById('ftTooltip');
  tip.innerHTML = `
    <div class="ft-tag">${step.tag}</div>
    <div class="ft-title">${step.title}</div>
    <div class="ft-text">${step.text}</div>
    <div class="ft-hint">${step.hint}</div>
    <div class="ft-actions">
      <button class="ft-skip" onclick="ftEndTour()">skip demo</button>
      <button class="ft-btn" onclick="ftNextStep()">${ftStep===FEATURE_STEPS.length-1?"FINISH":"NEXT →"}</button>
    </div>`;

  if(step.wait){
    const handler = ()=> ftNextStep();
    el.addEventListener('click', handler, {once:true});
    ftListenerCleanup = ()=> el.removeEventListener('click', handler);
  }

  ftReposition();
}

function ftReposition(){
  if(ftStep < 0 || ftStep >= FEATURE_STEPS.length) return;
  const step = FEATURE_STEPS[ftStep];
  const el = document.querySelector(step.sel);
  const spot = document.getElementById('ftSpotlight');
  const tip = document.getElementById('ftTooltip');
  if(!el || !spot || !tip) return;
  const r = el.getBoundingClientRect();
  const pad = 8;
  spot.style.top = (r.top - pad) + 'px';
  spot.style.left = (r.left - pad) + 'px';
  spot.style.width = (r.width + pad*2) + 'px';
  spot.style.height = (r.height + pad*2) + 'px';

  const tipW = 250;
  let tipLeft = r.left;
  if(tipLeft + tipW + 20 > window.innerWidth) tipLeft = window.innerWidth - tipW - 20;
  if(tipLeft < 12) tipLeft = 12;
  let tipTop = r.bottom + 18;
  if(tipTop + 160 > window.innerHeight) tipTop = Math.max(12, r.top - 180);
  tip.style.left = tipLeft + 'px';
  tip.style.top = tipTop + 'px';
}

/* ═══════════════════════════════════════════════════════════════════════
   HOME REDESIGN GLUE — pixel intro, settings modal, chat drawer.
   Old tour/feature-tour code above is now dead (no matching markup) and
   simply never gets called from here.
   ═══════════════════════════════════════════════════════════════════════ */

(function buildPixelStars(){
  const host = document.getElementById('pixelStars');
  if(!host) return;
  for(let i=0;i<70;i++){
    const s = document.createElement('div');
    s.className = 'px-star';
    s.style.left = Math.random()*100+'%';
    s.style.top = Math.random()*100+'%';
    s.style.animationDelay = (-Math.random()*2.4)+'s';
    host.appendChild(s);
  }
})();

/* -------- the story -------- */
const STORY_LINES = [
  "* You are wandering the multiverse, bored out of your skull.",
  "* Somewhere in dimension C-137, a garage light flickers on.",
  "* A portal rips open with a wet, electric SHRRRP.",
  "* A figure stumbles out, coat flapping, trailing green sparks.",
  "* \"...aight. Who left the multiverse unattended THIS time.\"",
  "* \"Oh. It's you. Great. Just great.\"",
  "* \"Fine. I built an AI. It's me, basically. Smarter, if that's even possible.\"",
  "* Something drips off his coat and hits the floor with a hiss. Rick doesn't seem to notice.",
];

let pixelIdx = 0, pixelTyping = null, pixelDone = false, pixelIntroFinished = false, inChoice = false;

function pixelTypeText(text, onDone){
  const el = document.getElementById('pixelText');
  const adv = document.getElementById('pixelAdvance');
  if(!el) return;
  adv.classList.remove('show');
  clearInterval(pixelTyping);
  el.textContent = '';
  pixelDone = false;
  let i = 0;
  pixelTyping = setInterval(()=>{
    el.textContent = text.slice(0, i+1);
    if(i % 3 === 0) sfxTone(760, 0.02, 'square', 0.02);
    i++;
    if(i >= text.length){
      clearInterval(pixelTyping);
      pixelDone = true;
      if(onDone) onDone();
      else adv.classList.add('show');
    }
  }, 26);
}

function pixelTypeLine(){
  pixelTypeText(STORY_LINES[pixelIdx]);
}

function pixelAdvance(){
  if(inChoice) return; // choices handle their own clicks
  const el = document.getElementById('pixelText');
  if(!pixelDone){
    clearInterval(pixelTyping);
    el.textContent = STORY_LINES[pixelIdx];
    pixelDone = true;
    document.getElementById('pixelAdvance').classList.add('show');
    return;
  }
  pixelIdx++;
  if(pixelIdx >= STORY_LINES.length){ showNoseChoice(); return; }
  pixelTypeLine();
}

function showNoseChoice(){
  inChoice = true;
  document.getElementById('pixelAdvance').classList.remove('show');
  pixelTypeText("* Rick's nose twitches. Something nearby is making a faint, high-pitched noise.", () => {
    const choices = document.getElementById('pixelChoices');
    choices.innerHTML = '';

    const investigate = document.createElement('button');
    investigate.className = 'pixel-choice-btn';
    investigate.textContent = "Turn your head to investigate the noise by his nose";
    investigate.onclick = () => { choices.innerHTML = ''; triggerFlashAndEnter(); };

    const ignore = document.createElement('button');
    ignore.className = 'pixel-choice-btn';
    ignore.textContent = "Ignore it and keep staring at Rick";
    ignore.onclick = () => {
      choices.innerHTML = '';
      pixelTypeText('* Rick: "Oh, for the love of— just look at it already."', () => {
        setTimeout(showNoseChoice, 900);
      });
    };

    choices.appendChild(investigate);
    choices.appendChild(ignore);
  });
}

function triggerFlashAndEnter(){
  inChoice = false;
  SFX.whoosh();
  const flash = document.getElementById('storyFlash');
  flash.classList.add('flash-on');
  setTimeout(()=>{
    finishPixelIntro();
    flash.classList.remove('flash-on');
    flash.classList.add('flash-fade');
    setTimeout(()=>{ flash.classList.remove('flash-fade'); }, 900);
  }, 90);
}

function finishPixelIntro(){
  if(pixelIntroFinished) return;
  pixelIntroFinished = true;
  const intro = document.getElementById('pixelIntro');
  intro.classList.add('leaving');
  setTimeout(()=>{ intro.style.display = 'none'; }, 620);
  revealHome();
  setTimeout(()=>{ startFeatureTour(); }, 650);
}

function skipPixelIntro(){
  SFX.whoosh();
  finishPixelIntro();
}

function revealHome(){
  const home = document.getElementById('home');
  home.classList.add('revealed');
  buildStars();
}

const introEl = document.getElementById('pixelIntro');
if(introEl) introEl.addEventListener('click', (e) => {
  if(e.target.closest('.pixel-choice-btn') || e.target.closest('.pixel-skip')) return;
  pixelAdvance();
});
window.addEventListener('keydown', (e)=>{
  const ie = document.getElementById('pixelIntro');
  if(!ie || ie.style.display==='none') return;
  if(e.key==='Escape'){ skipPixelIntro(); return; }
  if(e.key===' '||e.key==='Enter'){ e.preventDefault(); pixelAdvance(); }
});

pixelTypeLine();

function toggleSettings(){ openSettingsPanel(); }
function openSettingsPanel(forceOpen){
  const modal = document.getElementById('settingsModal');
  const isOpen = modal.classList.contains('open');
  if(forceOpen || !isOpen){ SFX.click(); modal.classList.add('open'); }
  else { SFX.click(); modal.classList.remove('open'); }
}

/* -------- ambient side captions (replaces the old terminal drawer) -------- */
let captionsOn = true;
const captionQueue = [];
let captionBusy = false;
const CAPTION_STAY_MS = 4200;
const CAPTION_WORD_MS = 90;

function toggleCaptions(){
  SFX.toggle();
  captionsOn = !captionsOn;
  document.getElementById('captionStack').classList.toggle('hidden', !captionsOn);
  document.getElementById('captionsToggleBtn').classList.toggle('active', captionsOn);
}
document.getElementById('captionsToggleBtn')?.classList.add('active');

function pushCaption(role, text){
  if(!captionsOn) return;
  captionQueue.push({role, text});
  if(!captionBusy) runCaptionQueue();
}

function runCaptionQueue(){
  const next = captionQueue.shift();
  if(!next){ captionBusy = false; return; }
  captionBusy = true;

  const stack = document.getElementById('captionStack');
  const line = document.createElement('div');
  line.className = 'caption-line ' + (next.role === 'user' ? 'user' : 'bot');
  line.innerHTML = `<span class="caption-role">${next.role === 'user' ? 'YOU' : 'RICK'}</span><span class="caption-body"></span>`;
  stack.appendChild(line);
  // cap the stack at 3 visible lines
  while(stack.children.length > 3) stack.removeChild(stack.firstChild);
  requestAnimationFrame(()=> line.classList.add('in'));

  const body = line.querySelector('.caption-body');
  const words = next.text.split(/\s+/);
  let wi = 0;
  const typer = setInterval(()=>{
    body.textContent = words.slice(0, wi+1).join(' ');
    wi++;
    if(wi >= words.length){
      clearInterval(typer);
      setTimeout(()=>{
        line.classList.remove('in'); line.classList.add('out');
        setTimeout(()=>{ line.remove(); runCaptionQueue(); }, 450);
      }, CAPTION_STAY_MS);
    }
  }, CAPTION_WORD_MS);
}

// hook the existing addMsg() so every message also gets an ambient caption
const _origAddMsg = addMsg;
addMsg = function(role, text){
  _origAddMsg(role, text);
  pushCaption(role, text);
};

/* -------- demo tour trigger -------- */
// startFeatureTour() and its FEATURE_STEPS already exist above (spotlight + tooltip system);
// it's now reachable any time via the "?" icon, and gets offered once automatically
// the first time someone finishes connecting a key.
let demoOffered = false;
const _origSaveKey = saveKey;
saveKey = function(){
  _origSaveKey();
  if(apiKey && !demoOffered){
    demoOffered = true;
    setTimeout(()=>{
      if(confirm("Quick tour of the features? (Rick would rather you just figure it out, but fine.)")){
        startFeatureTour();
      }
    }, 900);
  }
};

