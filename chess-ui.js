// chess-ui.js — void chess 2D rendering, events, book UI, particles
const pCanvas=document.getElementById('particles');const pCtx=pCanvas.getContext('2d');
let pW,pH,particles=[];
function resizeP(){pW=pCanvas.width=window.innerWidth;pH=pCanvas.height=window.innerHeight}
resizeP();window.addEventListener('resize',resizeP);
for(let i=0;i<60;i++)particles.push({x:Math.random()*pW,y:Math.random()*pH,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.5,hue:Math.random()<.5?210:270});
function drawP(){pCtx.clearRect(0,0,pW,pH);for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=pW;if(p.x>pW)p.x=0;if(p.y<0)p.y=pH;if(p.y>pH)p.y=0;pCtx.beginPath();pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);pCtx.fillStyle=`hsla(${p.hue},70%,60%,0.4)`;pCtx.fill();}requestAnimationFrame(drawP);}
drawP();

const pieceSymbols={'K':{w:'♔',b:'♚'},'Q':{w:'♕',b:'♛'},'R':{w:'♖',b:'♜'},'B':{w:'♗',b:'♝'},'N':{w:'♘',b:'♞'},'P':{w:'♙',b:'♟'}};

function renderBoard(){
  const boardEl=document.getElementById('board');boardEl.innerHTML='';
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const cell=document.createElement('div');
    cell.className='cell '+((r+c)%2===0?'light':'dark');
    if(selected&&selected.r===r&&selected.c===c)cell.classList.add('selected');
    if(validMoves.some(m=>m.to.r===r&&m.to.c===c))cell.classList.add('valid-move');
    if(hintMove&&hintMove.to.r===r&&hintMove.to.c===c)cell.classList.add('hint');
    if(lastMove&&((lastMove.from.r===r&&lastMove.from.c===c)||(lastMove.to.r===r&&lastMove.to.c===c)))cell.classList.add('last-move');
    if(gameState.penaltySquares&&gameState.penaltySquares.some(p=>p.r===r&&p.c===c))cell.classList.add('penalty');
    const piece=board[r][c];
    if(piece){const span=document.createElement('span');span.className='piece '+(piece.color===WHITE?'white':'black');span.textContent=pieceSymbols[piece.type][piece.color];cell.appendChild(span);}
    cell.dataset.r=r;cell.dataset.c=c;
    cell.addEventListener('click',()=>onCellClick(r,c));
    boardEl.appendChild(cell);
  }
  const cw=document.getElementById('capturedWhite');const cb=document.getElementById('capturedBlack');
  if(cw){cw.innerHTML='';for(const p of capturedPieces.w){const s=document.createElement('span');s.className='piece '+(p.color===WHITE?'white':'black');s.textContent=pieceSymbols[p.type][p.color];s.style.fontSize='18px';cw.appendChild(s);}}
  if(cb){cb.innerHTML='';for(const p of capturedPieces.b){const s=document.createElement('span');s.className='piece '+(p.color===WHITE?'white':'black');s.textContent=pieceSymbols[p.type][p.color];s.style.fontSize='18px';cb.appendChild(s);}}
}

function getLegalMoves(r,c,bs){
  const piece=bs[r][c];if(!piece)return[];
  const pseudo=getMoves(r,c,bs);
  return pseudo.filter(m=>{
    const saved={board:bs.map(row=>row.map(p=>p?{...p}:null)),castling:{...castling},enPassant:enPassant?{...enPassant}:null,moveCount};
    makeMove(m.from,m.to,m.special,false);
    const inCheck=isCheck(piece.color);
    board=saved.board.map(row=>row.map(p=>p?{...p}:null));castling={...saved.castling};enPassant=saved.enPassant?{...saved.enPassant}:null;moveCount=saved.moveCount;
    return !inCheck;
  });
}

function getLegalMoves(r,c,bs){
  const piece=bs[r][c];if(!piece)return[];
  const pseudo=getMoves(r,c,bs);
  return pseudo.filter(m=>{
    const saved={board:bs.map(row=>row.map(p=>p?{...p}:null)),castling:{...castling},enPassant:enPassant?{...enPassant}:null,moveCount};
    makeMove(m.from,m.to,m.special,false);
    const inCheck=isCheck(piece.color);
    board=saved.board.map(row=>row.map(p=>p?{...p}:null));castling={...saved.castling};enPassant=saved.enPassant?{...saved.enPassant}:null;moveCount=saved.moveCount;
    return !inCheck;
  });
}
function onCellClick(r,c){
  if(gameOver||turn!==WHITE)return;
  const piece=board[r][c];
  if(selected){
    const move=validMoves.find(m=>m.to.r===r&&m.to.c===c);
    if(move){
      const kingPiece=board[selected.r][selected.c];
      if(kingPiece&&kingPiece.type==='K'&&gameState.penaltySquares&&gameState.penaltySquares.some(p=>p.r===r&&p.c===c&&p.color===WHITE)){objSpeak('your king cannot take that piece. penalty rules.');return;}
      makeMove(selected,{r,c},move.special);hintMove=null;validMoves=[];selected=null;renderBoard();turn=BLACK;
      document.getElementById('status').textContent='obj thinking...';document.getElementById('status').style.color='#5fa8d3';
      setTimeout(()=>{aiMove();turn=WHITE;},500+Math.random()*400);return;
    }
    if(piece&&piece.color===WHITE){selected={r,c};validMoves=getLegalMoves(r,c,board);renderBoard();return;}
    selected=null;validMoves=[];renderBoard();
  }else{
    if(piece&&piece.color===WHITE){selected={r,c};validMoves=getLegalMoves(r,c,board);renderBoard();}
  }
}

const normalRules=[
  'king: moves one square in any direction',
  'queen: moves any number of squares in any direction',
  'rook: moves any number of squares horizontally or vertically',
  'bishop: moves any number of squares diagonally',
  'knight: moves in L-shape (2+1), can jump over pieces',
  'pawn: moves forward one square, captures diagonally',
  'castling: king and rook swap if path is clear',
  'en passant: pawn can capture passing pawn',
  'promotion: pawn becomes queen at end row',
  'check: king under attack, must escape',
  'checkmate: no legal moves in check = loss',
  'stalemate: no legal moves, not in check = draw',
];
const bookPages=[];
let currentPage=0;
let isFlipping=false;
function buildBookPages(){
  bookPages.length=0;
  bookPages.push({title:'normal rules',rules:normalRules.map(r=>({text:r,type:'normal'}))});
  if(activeMutations.length>0){
    const mutRules=activeMutations.map(m=>({text:m,type:'mutation'}));
    for(let i=0;i<mutRules.length;i+=8){bookPages.push({title:'obj mutations',rules:mutRules.slice(i,i+8)});}
  }else{bookPages.push({title:'obj mutations',rules:[{text:'no mutations yet. obj hasn\'t changed the rules... yet.',type:'mutation'}]});}
  bookPages.push({title:'cheating rules',rules:[
    {text:'you can cheat by clicking the cheat button',type:'normal'},
    {text:'obj can also cheat randomly',type:'mutation'},
    {text:'accuse button: catch obj cheating for penalty',type:'normal'},
    {text:'false accusation penalizes you instead',type:'mutation'},
    {text:'penalty: opposite team captures piece in front of king',type:'mutation'},
    {text:'king cannot recapture the penalized piece',type:'mutation'},
  ]});
}
function renderBookPage(){
  const left=document.getElementById('pageLeftContent'),right=document.getElementById('pageRightContent');
  left.innerHTML='';right.innerHTML='';
  const page=bookPages[currentPage];
  if(!page)return;
  const h=document.createElement('h3');h.textContent=page.title;left.appendChild(h);
  const half=Math.ceil(page.rules.length/2);
  for(let i=0;i<half;i++){const div=document.createElement('div');div.className='rule-item '+page.rules[i].type;div.textContent=page.rules[i].text;left.appendChild(div);}
  if(currentPage+1<bookPages.length){
    const nextPage=bookPages[currentPage+1];
    const h2=document.createElement('h3');h2.textContent=nextPage.title;right.appendChild(h2);
    for(const r of nextPage.rules){const div=document.createElement('div');div.className='rule-item '+r.type;div.textContent=r.text;right.appendChild(div);}
  }
  document.getElementById('bookPrev').disabled=currentPage<=0;
  document.getElementById('bookNext').disabled=currentPage>=bookPages.length-1;
  document.getElementById('pageIndicator').textContent=(currentPage+1)+' / '+bookPages.length;
}
function openBook(){buildBookPages();currentPage=0;playBookOpen();
  const cover=document.getElementById('bookCover');const open=document.getElementById('bookOpen');
  cover.style.transition='transform 0.8s cubic-bezier(.4,0,.2,1), opacity 0.6s';
  cover.style.transform='rotateY(-180deg)';cover.style.opacity='0';
  setTimeout(()=>{cover.style.display='none';open.classList.add('show');renderBookPage();},600);
  document.getElementById('bookOverlay').classList.add('show');
}
function closeBook(){
  const cover=document.getElementById('bookCover');const open=document.getElementById('bookOpen');
  open.classList.remove('show');cover.style.display='flex';
  cover.style.transform='rotateY(0deg)';cover.style.opacity='1';
  document.getElementById('bookOverlay').classList.remove('show');
}
function nextPage(){
  if(isFlipping||currentPage>=bookPages.length-1)return;
  isFlipping=true;playPageTurn();
  const pages=document.getElementById('bookOpen');
  pages.style.transition='opacity .3s, transform .3s';
  pages.style.opacity='0.3';pages.style.transform='scale(0.97)';
  setTimeout(()=>{currentPage++;renderBookPage();pages.style.opacity='1';pages.style.transform='scale(1)';setTimeout(()=>{isFlipping=false;},350);},350);
}
function prevPage(){
  if(isFlipping||currentPage<=0)return;
  isFlipping=true;playPageTurn();
  const pages=document.getElementById('bookOpen');
  pages.style.transition='opacity .3s, transform .3s';
  pages.style.opacity='0.3';pages.style.transform='scale(0.97)';
  setTimeout(()=>{currentPage--;renderBookPage();pages.style.opacity='1';pages.style.transform='scale(1)';setTimeout(()=>{isFlipping=false;},350);},350);
}
function updateRulebook(){buildBookPages();}
function logRule(text){const log=document.getElementById('ruleLog');const div=document.createElement('div');div.textContent='> '+text;log.appendChild(div);log.scrollTop=log.scrollHeight;}
function newGame(){
  board=initBoard();turn=WHITE;selected=null;validMoves=[];lastMove=null;gameOver=false;moveHistory=[];castling={wK:true,wQ:true,bK:true,bQ:true};enPassant=null;capturedPieces={w:[],b:[]};moveCount=0;hintMove=null;
  gameState={bishopTeleport:false,knightQueen:0,pawnBackwards:false,rookPhase:0,extraMove:false,boardFlip:false,pieceSwap:false,queenSteal:false,freePromotion:false,knightJump:false,bishopLaser:false,rookLaser:false,kingRampage:false,pawnSprint:false,randomVanish:false,mirrorMove:false,chaosBoard:false,doubleAgent:false,penaltySquares:[]};
  activeMutations=[];objCheating=false;playerCheating=false;objCheatType=null;
  document.getElementById('ruleLog').innerHTML='';document.getElementById('status').textContent='your move (white)';document.getElementById('status').style.color='#9fd4ff';
  objSpeak(objLines[0]);updateRulebook();renderBoard();
}
function undoMove(){
  if(moveHistory.length===0)return;
  let undone=0;
  while(moveHistory.length>0&&undone<2){
    const last=moveHistory.pop();
    board=last.snapshot.board.map(row=>row.map(p=>p?{...p}:null));
    castling={...last.snapshot.castling};enPassant=last.snapshot.enPassant?{...last.snapshot.enPassant}:null;
    moveCount=last.snapshot.moveCount;gameState={...last.snapshot.gameState};
    if(last.captured){const arr=capturedPieces[last.captured.color===WHITE?'w':'b'];const idx=arr.findIndex(p=>p.type===last.captured.type);if(idx>=0)arr.splice(idx,1);}
    lastMove=moveHistory.length>0?{from:moveHistory[moveHistory.length-1].from,to:moveHistory[moveHistory.length-1].to}:null;
    undone++;if(moveHistory.length===0)break;
  }
  hintMove=null;selected=null;validMoves=[];gameOver=false;
  turn=WHITE;document.getElementById('status').textContent='your move (white)';document.getElementById('status').style.color='#9fd4ff';
  renderBoard();
  objSpeak('...you undid that. cowardly. but effective.');
}
function getHint(){
  if(gameOver||turn!==WHITE)return;
  const allMoves=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===WHITE){const mvs=getMoves(r,c,board);for(const m of mvs)allMoves.push(m);}}
  if(allMoves.length===0){objSpeak('no moves. you lose.');return;}
  const captures=allMoves.filter(m=>m.capture);
  let best=captures.length>0?captures[Math.floor(Math.random()*captures.length)]:allMoves[Math.floor(Math.random()*allMoves.length)];
  const checks=allMoves.filter(m=>{
    const saved={board:board.map(row=>row.map(p=>p?{...p}:null)),castling:{...castling},enPassant:enPassant?{...enPassant}:null,moveCount};
    makeMove(m.from,m.to,m.special,false);const isChk=isCheck(BLACK);
    board=saved.board.map(row=>row.map(p=>p?{...p}:null));castling={...saved.castling};enPassant=saved.enPassant?{...saved.enPassant}:null;moveCount=saved.moveCount;
    return isChk;
  });
  if(checks.length>0)best=checks[0];
  hintMove=best;selected=null;validMoves=[best];renderBoard();
  objSpeak('...fine. try '+String.fromCharCode(97+best.from.c)+(8-best.from.r)+' to '+String.fromCharCode(97+best.to.c)+(8-best.to.r)+'. but i would have done something better.');
}
function objDoCheat(){
  if(Math.random()<0.35){
    objCheating=true;objCheatType=objCheatTypes[Math.floor(Math.random()*objCheatTypes.length)];
    if(objCheatType==='extra_piece'){const empty=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(!board[r][c])empty.push({r,c});}if(empty.length>0){const p=empty[Math.floor(Math.random()*empty.length)];board[p.r][p.c]={type:'N',color:BLACK};renderBoard();}}
    else if(objCheatType==='piece_teleport'){const blacks=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===BLACK)blacks.push({r,c});}if(blacks.length>0){const p=blacks[Math.floor(Math.random()*blacks.length)];const empty=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(!board[r][c])empty.push({r,c});}if(empty.length>0){const t=empty[Math.floor(Math.random()*empty.length)];board[t.r][t.c]=board[p.r][p.c];board[p.r][p.c]=null;renderBoard();}}}
    else if(objCheatType==='invisible_capture'){const whites=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===WHITE)whites.push({r,c});}if(whites.length>0){const p=whites[Math.floor(Math.random()*whites.length)];board[p.r][p.c]=null;renderBoard();}}
  }
}
function playerDoCheat(){
  playerCheating=true;
  const whites=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===WHITE)whites.push({r,c});}
  if(whites.length===0)return;
  const from=whites[Math.floor(Math.random()*whites.length)];
  const empty=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(!board[r][c]||(board[r][c].color===BLACK))empty.push({r,c});}
  if(empty.length===0)return;
  const to=empty[Math.floor(Math.random()*empty.length)];
  makeMove(from,to,null);renderBoard();
  if(Math.random()<0.3){setTimeout(()=>{objAccusePlayer();},1000);}
  else{setTimeout(()=>{playerCheating=false;},2000);}
}
function objAccusePlayer(){
  if(!playerCheating)return;playerCheating=false;
  document.getElementById('accuseTitle').textContent='OBJ ACCUSES YOU';
  document.getElementById('accuseMsg').textContent='i saw that. you cheated. penalty applied.';
  document.getElementById('accuseOverlay').classList.add('show');
  applyPenalty(WHITE);objSpeak('i saw that. you cheated. penalty.');
  logRule('player caught cheating → penalty');
}
function playerAccuseObj(){
  if(gameOver)return;
  if(objCheating){objCheating=false;
    document.getElementById('accuseTitle').textContent='ACCUSATION SUCCESSFUL';
    document.getElementById('accuseMsg').textContent='you caught obj cheating. penalty applied to obj.';
    document.getElementById('accuseOverlay').classList.add('show');applyPenalty(BLACK);
    objSpeak('...fine. you got me. penalty.');logRule('obj caught cheating → penalty');
  }else{
    document.getElementById('accuseTitle').textContent='FALSE ACCUSATION';
    document.getElementById('accuseMsg').textContent='obj was not cheating. you get the penalty instead.';
    document.getElementById('accuseOverlay').classList.add('show');applyPenalty(WHITE);
    objSpeak('wrong. i was playing fair. penalty for you.');logRule('false accusation → player penalized');
  }
}
function closeAccuse(){document.getElementById('accuseOverlay').classList.remove('show');}
function applyPenalty(color){
  let kingPos=null;for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].type==='K'&&board[r][c].color===color)kingPos={r,c};}
  if(!kingPos)return;
  const dir=color===WHITE?-1:1;const frontR=kingPos.r+dir,frontC=kingPos.c;
  if(!inB(frontR,frontC))return;
  const frontPiece=board[frontR][frontC];
  if(frontPiece){board[frontR][frontC]=null;renderBoard();
    const cells=document.querySelectorAll('.cell');const idx=frontR*8+frontC;
    if(cells[idx])cells[idx].classList.add('penalty');
    setTimeout(()=>{if(cells[idx])cells[idx].classList.remove('penalty');},2000);
  }
  if(!gameState.penaltySquares)gameState.penaltySquares=[];
  gameState.penaltySquares.push({r:frontR,c:frontC,color:color});
}
function aiMove(){
  if(gameOver)return;
  if(Math.random()<0.15)objDoCheat();
  const moves=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===BLACK){const mvs=getMoves(r,c,board);for(const m of mvs)moves.push(m);}}
  if(moves.length===0){if(isCheck(BLACK))endGame('checkmate! you win... for now.');else endGame('stalemate. draw.');return;}
  const captures=moves.filter(m=>m.capture);
  const pool=captures.length>0&&Math.random()<0.7?captures:moves;
  const move=pool[Math.floor(Math.random()*pool.length)];
  makeMove(move.from,move.to,move.special);renderBoard();
  if(isCheck(WHITE)){document.getElementById('status').textContent='check!';document.getElementById('status').style.color='#ff4444';}
  else{document.getElementById('status').textContent='your move (white)';document.getElementById('status').style.color='#9fd4ff';}
  let playerMoves=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===WHITE)playerMoves+=getMoves(r,c,board).length;}
  if(playerMoves===0){if(isCheck(WHITE))endGame('checkmate. i win. as expected.');else endGame('stalemate. draw.');}
  if(gameState.knightQueen>0)gameState.knightQueen--;
  if(gameState.rookPhase>0)gameState.rookPhase--;
  if(Math.random()<0.25)setTimeout(mutateRules,800);
  if(gameState.extraMove){gameState.extraMove=false;setTimeout(aiMove,600);}
  if(objCheating&&Math.random()<0.5){objCheating=false;objCheatType=null;}
}
function endGame(msg){gameOver=true;document.getElementById('status').textContent=msg;if(msg.includes('win'))playWin();else playLose();objSpeak(msg);}
function mutateRules(){
  const m=mutations[Math.floor(Math.random()*mutations.length)];
  m.apply(gameState);logRule(m.desc);objSpeak(m.desc+'. deal with it.');
  activeMutations.push(m.desc);updateRulebook();
  if(gameState.boardFlip){board=board.map(row=>[...row].reverse()).reverse();gameState.boardFlip=false;renderBoard();}
  if(gameState.pieceSwap){for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c])board[r][c].color=board[r][c].color===WHITE?BLACK:WHITE;}gameState.pieceSwap=false;renderBoard();}
  if(gameState.queenSteal){for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].type==='Q'&&board[r][c].color===WHITE)board[r][c].color=BLACK;}gameState.queenSteal=false;renderBoard();}
  if(gameState.randomVanish){const pieces=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===WHITE)pieces.push({r,c});}if(pieces.length>0){const p=pieces[Math.floor(Math.random()*pieces.length)];board[p.r][p.c]=null;}gameState.randomVanish=false;renderBoard();}
  if(gameState.chaosBoard){const all=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c])all.push(board[r][c]);}for(let i=0;i<8;i++)for(let j=0;j<8;j++)board[i][j]=null;for(const p of all){let placed=false;while(!placed){const r=Math.floor(Math.random()*8),c=Math.floor(Math.random()*8);if(!board[r][c]){board[r][c]=p;placed=true;}}}gameState.chaosBoard=false;renderBoard();}
  const b=document.getElementById('board');b.classList.add('shake');setTimeout(()=>b.classList.remove('shake'),400);
}
function updateRulebook(){buildBookPages();}
function logRule(text){const log=document.getElementById('ruleLog');const div=document.createElement('div');div.textContent='> '+text;log.appendChild(div);log.scrollTop=log.scrollHeight;}

// ===== EVENTS =====
document.getElementById('undoBtn').addEventListener('click',undoMove);
document.getElementById('hintBtn').addEventListener('click',getHint);
document.getElementById('accuseBtn').addEventListener('click',playerAccuseObj);
document.getElementById('cheatBtn').addEventListener('click',playerDoCheat);
document.getElementById('resignBtn').addEventListener('click',()=>{if(!gameOver){gameOver=true;document.getElementById('status').textContent='you resigned. obj wins.';playLose();objSpeak('you resigned. smart. but too late.');}});
document.getElementById('newGameBtn').addEventListener('click',newGame);
document.getElementById('bookBtn').addEventListener('click',openBook);
document.getElementById('bookCover').addEventListener('click',openBook);
document.getElementById('bookClose').addEventListener('click',closeBook);
document.getElementById('bookPrev').addEventListener('click',prevPage);
document.getElementById('bookNext').addEventListener('click',nextPage);
document.getElementById('bookOverlay').addEventListener('click',(e)=>{if(e.target===document.getElementById('bookOverlay'))closeBook();});
newGame();
setInterval(()=>{if(Math.random()<0.12&&!gameOver)objSpeak(objLines[Math.floor(Math.random()*objLines.length)]);},25000);