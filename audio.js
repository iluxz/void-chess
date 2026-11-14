// audio.js — void chess sound effects
const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
function playTone(freq,dur,type='sine',vol=0.15){const osc=audioCtx.createOscillator();const gain=audioCtx.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.value=vol;osc.connect(gain);gain.connect(audioCtx.destination);osc.start();gain.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+dur);osc.stop(audioCtx.currentTime+dur);}
function playMove(){playTone(440,.08,'square',.08);setTimeout(()=>playTone(330,.06,'square',.05),60)}
function playCapture(){playTone(220,.12,'sawtooth',.12);setTimeout(()=>playTone(165,.1,'sawtooth',.08),80)}
function playCheck(){playTone(880,.15,'sine',.15);setTimeout(()=>playTone(660,.15,'sine',.12),150);setTimeout(()=>playTone(440,.2,'sine',.1),300)}
function playMutate(){playTone(150,.3,'sawtooth',.12);setTimeout(()=>playTone(100,.2,'sawtooth',.1),200);setTimeout(()=>playTone(80,.4,'sawtooth',.08),350)}
function playAccuse(){playTone(300,.2,'square',.15);setTimeout(()=>playTone(200,.3,'square',.12),200);setTimeout(()=>playTone(100,.4,'square',.1),400)}
function playWin(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,.2,'sine',.12),i*150))}
function playLose(){[440,370,311,233].forEach((f,i)=>setTimeout(()=>playTone(f,.25,'sawtooth',.1),i*200))}
function playHint(){playTone(660,.1,'sine',.1);setTimeout(()=>playTone(880,.1,'sine',.08),100)}
function playUndo(){playTone(330,.08,'triangle',.08);setTimeout(()=>playTone(440,.08,'triangle',.06),80)}
function playPageTurn(){playTone(550,.04,'triangle',.07);setTimeout(()=>playTone(480,.05,'triangle',.05),40);setTimeout(()=>playTone(420,.06,'triangle',.04),80);setTimeout(()=>playTone(380,.08,'triangle',.03),120)}
function playBookOpen(){playTone(180,.2,'sine',.1);setTimeout(()=>playTone(260,.15,'sine',.08),120);setTimeout(()=>playTone(340,.15,'sine',.06),240);setTimeout(()=>playTone(420,.12,'sine',.05),360)}