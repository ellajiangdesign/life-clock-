/* Life Clock sounds: tiny synthesised effects (no audio files), with a Sound on/off switch. */
(function(){
  var AC=window.AudioContext||window.webkitAudioContext, ctx=null, master=null, on=true, noiseBuf=null;
  try{ if(sessionStorage.getItem('lc_sound')==='off') on=false }catch(e){}
  function init(){
    if(ctx||!AC) return;
    ctx=new AC(); master=ctx.createGain(); master.gain.value=0.9; master.connect(ctx.destination);
    var n=ctx.sampleRate*0.4, b=ctx.createBuffer(1,n,ctx.sampleRate), d=b.getChannelData(0);
    for(var i=0;i<n;i++) d[i]=Math.random()*2-1;
    noiseBuf=b;
  }
  function unlock(){ init(); if(ctx&&ctx.state==='suspended') ctx.resume(); }
  addEventListener('pointerdown',unlock,true);
  addEventListener('keydown',unlock,true);
  function ready(){ return on&&ctx&&ctx.state==='running'; }

  /* a soft clock tick; alternates between a higher "tick" and a lower "tock" */
  function tick(n){
    if(!ready()) return;
    var t=ctx.currentTime, hi=(n%2===0);
    var src=ctx.createBufferSource(); src.buffer=noiseBuf;
    var bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=hi?2600:1900; bp.Q.value=2.2;
    var g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(hi?0.10:0.08,t+0.003);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.05);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t,Math.random()*0.2,0.08);
    var o=ctx.createOscillator(), og=ctx.createGain(); o.type='sine'; o.frequency.value=hi?1200:900;
    og.gain.setValueAtTime(0.0001,t); og.gain.exponentialRampToValueAtTime(0.03,t+0.002); og.gain.exponentialRampToValueAtTime(0.0001,t+0.04);
    o.connect(og); og.connect(master); o.start(t); o.stop(t+0.06);
  }
  /* a page being turned: a soft sweeping swish, then a faint paper settle */
  function page(){
    if(!ready()) return;
    var t=ctx.currentTime;
    var src=ctx.createBufferSource(); src.buffer=noiseBuf;
    var bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=0.9;
    bp.frequency.setValueAtTime(900,t); bp.frequency.exponentialRampToValueAtTime(3800,t+0.2); bp.frequency.exponentialRampToValueAtTime(1800,t+0.34);
    var g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.13,t+0.09); g.gain.exponentialRampToValueAtTime(0.07,t+0.2); g.gain.exponentialRampToValueAtTime(0.0001,t+0.36);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t,0,0.4);
    var s2=ctx.createBufferSource(); s2.buffer=noiseBuf;
    var hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=2500;
    var g2=ctx.createGain(); g2.gain.setValueAtTime(0.0001,t+0.24);
    g2.gain.exponentialRampToValueAtTime(0.05,t+0.255); g2.gain.exponentialRampToValueAtTime(0.0001,t+0.33);
    s2.connect(hp); hp.connect(g2); g2.connect(master); s2.start(t+0.24,0.1,0.12);
  }
  /* a keyboard key press: a short, dry "da" - mid pitched, not bright */
  function key(){
    if(!ready()) return;
    var t=ctx.currentTime;
    var src=ctx.createBufferSource(); src.buffer=noiseBuf;
    var lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2400; lp.Q.value=0.6;
    var hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=450;
    var g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.30,t+0.002); g.gain.exponentialRampToValueAtTime(0.0001,t+0.035);
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(master); src.start(t,Math.random()*0.2,0.06);
    var o=ctx.createOscillator(), og=ctx.createGain(); o.type='sine';
    o.frequency.setValueAtTime(420,t); o.frequency.exponentialRampToValueAtTime(260,t+0.05);
    og.gain.setValueAtTime(0.0001,t); og.gain.exponentialRampToValueAtTime(0.22,t+0.003); og.gain.exponentialRampToValueAtTime(0.0001,t+0.07);
    o.connect(og); og.connect(master); o.start(t); o.stop(t+0.09);
    var o2=ctx.createOscillator(), g2=ctx.createGain(); o2.type='sine';
    o2.frequency.setValueAtTime(140,t); o2.frequency.exponentialRampToValueAtTime(90,t+0.06);
    g2.gain.setValueAtTime(0.0001,t); g2.gain.exponentialRampToValueAtTime(0.14,t+0.004); g2.gain.exponentialRampToValueAtTime(0.0001,t+0.08);
    o2.connect(g2); g2.connect(master); o2.start(t); o2.stop(t+0.1);
  }
  /* one gentle bell: inharmonic partials with a long decay */
  function bell(){
    if(!ready()) return;
    var t=ctx.currentTime, f0=196;
    [[1,0.5],[2,0.32],[2.4,0.2],[3,0.16],[4.2,0.09],[5.4,0.05]].forEach(function(p,i){
      var o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.value=f0*p[0];
      var dec=3.2/(1+i*0.55);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.17*p[1],t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dec);
      o.connect(g); g.connect(master); o.start(t); o.stop(t+dec+0.1);
    });
  }
  window.LCSound={tick:tick,page:page,key:key,paper:page,bell:bell,isOn:function(){return on}};

  /* the Sound on / off switch, bottom-left of the stage */
  function mount(){
    var st=document.getElementById('stage'); if(!st) return;
    var b=document.createElement('button'); b.type='button'; b.id='soundBtn';
    b.style.cssText='position:absolute;left:36px;top:778px;z-index:50;background:none;border:0;cursor:pointer;font-family:"Mamamia",cursive;font-size:18px;color:#000;padding:2px;display:flex;align-items:center;gap:8px;opacity:.75';
    function paint(){
      b.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/>'+(on?'<path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>':'<path d="M17 9l5 6M22 9l-5 6"/>')+'</svg><span>Sound '+(on?'on':'off')+'</span>';
    }
    paint();
    b.addEventListener('mouseenter',function(){b.style.opacity=1});
    b.addEventListener('mouseleave',function(){b.style.opacity=.75});
    b.addEventListener('click',function(e){
      e.stopPropagation(); unlock(); on=!on;
      try{sessionStorage.setItem('lc_sound',on?'on':'off')}catch(_){}
      paint(); if(on) key();
    });
    st.appendChild(b);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
