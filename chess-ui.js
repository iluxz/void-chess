// ui.js — void chess rendering, events, book UI, particles, SVG pieces
const pCanvas=document.getElementById('particles');const pCtx=pCanvas.getContext('2d');
let pW,pH,particles=[];
function resizeP(){pW=pCanvas.width=window.innerWidth;pH=pCanvas.height=window.innerHeight}
resizeP();window.addEventListener('resize',resizeP);
for(let i=0;i<60;i++)particles.push({x:Math.random()*pW,y:Math.random()*pH,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.5,hue:Math.random()<.5?210:270});
function drawP(){pCtx.clearRect(0,0,pW,pH);for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=pW;if(p.x>pW)p.x=0;if(p.y<0)p.y=pH;if(p.y>pH)p.y=0;pCtx.beginPath();pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);pCtx.fillStyle=`hsla(${p.hue},70%,60%,0.4)`;pCtx.fill();}requestAnimationFrame(drawP);}
drawP();

// ===== SVG CHESS PIECES (cburnett style) =====
const PIECE_SVG={
wK:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#f0f0ff" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#f0f0ff"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10.5 5 10.5V37z" fill="#f0f0ff"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0"/></g></svg>`,
wQ:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#f0f0ff" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12l4 4 3-8 3 8 4.5-4 4.5 4 3-8 3 8 4-4" fill="#f0f0ff"/><path d="M8 12v-2M37 12v-2"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10.5 5 10.5V37z" fill="#f0f0ff"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0"/></g></svg>`,
wR:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#f0f0ff" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27M12.5 32l1.5-2.5h17l1.5 2.5M12 39v-7h21v7M14 29.5v-13M14 16.5l-3-2.5h23l-3 2.5M11 14V9h4v2h5V9h5v2h5V9h4v5" fill="#f0f0ff"/></g></svg>`,
wB:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#f0f0ff" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" fill="#f0f0ff"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-3 0-3 0 0 .5-2.5-3-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5-3.5 1.5-3 4-3 4 0 0-.5 1.5 0 3z" fill="#f0f0ff"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#f0f0ff"/><path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5"/></g></svg>`,
wN:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#f0f0ff" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#f0f0ff"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#f0f0ff"/><path d="M9.5 25.5a.5 .5 0 1 1-1 0 .5 .5 0 1 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#1a1a2e" stroke="#1a1a2e"/></g></svg>`,
wP:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#f0f0ff" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#f0f0ff"/></g></svg>`,
bK:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#1a1a2e" stroke="#5fa8d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#1a1a2e"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10.5 5 10.5V37z" fill="#1a1a2e"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0"/></g></svg>`,
bQ:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#1a1a2e" stroke="#5fa8d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12l4 4 3-8 3 8 4.5-4 4.5 4 3-8 3 8 4-4" fill="#1a1a2e"/><path d="M8 12v-2M37 12v-2"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10.5 5 10.5V37z" fill="#1a1a2e"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0"/></g></svg>`,
bR:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#1a1a2e" stroke="#5fa8d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27M12.5 32l1.5-2.5h17l1.5 2.5M12 39v-7h21v7M14 29.5v-13M14 16.5l-3-2.5h23l-3 2.5M11 14V9h4v2h5V9h5v2h5V9h4v5" fill="#1a1a2e"/></g></svg>`,
bB:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#1a1a2e" stroke="#5fa8d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" fill="#1a1a2e"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-3 0-3 0 0 .5-2.5-3-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5-3.5 1.5-3 4-3 4 0 0-.5 1.5 0 3z" fill="#1a1a2e"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#1a1a2e"/><path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5"/></g></svg>`,
bN:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#1a1a2e" stroke="#5fa8d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#1a1a2e"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#1a1a2e"/><path d="M9.5 25.5a.5 .5 0 1 1-1 0 .5 .5 0 1 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#5fa8d3" stroke="#5fa8d3"/></g></svg>`,
bP:`<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#1a1a2e" stroke="#5fa8d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#1a1a2e"/></g></svg>`,
};

// ===== RENDERING =====
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
    if(piece){
      const span=document.createElement('span');
      span.className='piece '+(piece.color===WHITE?'white':'black');
      span.textContent=pieceSymbols[piece.type][piece.color];
      cell.appendChild(span);
    }
    cell.dataset.r=r;cell.dataset.c=c;
    cell.addEventListener('click',()=>onCellClick(r,c));
    boardEl.appendChild(cell);
  }
  // update captured pieces
  const cw=document.getElementById('capturedWhite');const cb=document.getElementById('capturedBlack');
  if(cw){cw.innerHTML='';for(const p of capturedPieces.w){const s=document.createElement('span');s.className='piece '+(p.color===WHITE?'white':'black');s.textContent=pieceSymbols[p.type][p.color];s.style.fontSize='18px';cw.appendChild(s);}}
  if(cb){cb.innerHTML='';for(const p of capturedPieces.b){const s=document.createElement('span');s.className='piece '+(p.color===WHITE?'white':'black');s.textContent=pieceSymbols[p.type][p.color];s.style.fontSize='18px';cb.appendChild(s);}}
}
function onCellClick(r,c){
  if(gameOver||turn!==WHITE)return;
  const piece=board[r][c];
  if(selected){
    const move=validMoves.find(m=>m.to.r===r&&m.to.c===c);
    if(move){
      const kingPiece=board[selected.r][selected.c];
      if(kingPiece&&kingPiece.type==='K'&&gameState.penaltySquares&&gameState.penaltySquares.some(p=>p.r===r&&p.c===c&&p.color===WHITE)){objSpeak('your king cannot take that piece. penalty rules.');return;}
      makeMove(selected,{r,c},move.special);hintMove=null;renderBoard();turn=BLACK;
      document.getElementById('status').textContent='obj thinking...';document.getElementById('status').style.color='#5fa8d3';
      setTimeout(()=>{aiMove();turn=WHITE;},500+Math.random()*400);selected=null;validMoves=[];return;
    }
    if(piece&&piece.color===WHITE){selected={r,c};validMoves=getMoves(r,c,board);renderBoard();return;}
    selected=null;validMoves=[];renderBoard();
  }else{
    if(piece&&piece.color===WHITE){selected={r,c};validMoves=getMoves(r,c,board);renderBoard();}
  }
}

// ===== RULEBOOK (BOOK UI) =====
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
  const leftPage=document.getElementById('pageLeft');const rightPage=document.getElementById('pageRight');
  leftPage.style.opacity='1';rightPage.style.opacity='1';
  cover.style.transition='transform 0.8s cubic-bezier(.4,0,.2,1), opacity 0.6s';
  cover.style.transform='rotateY(-180deg)';cover.style.opacity='0';
  setTimeout(()=>{cover.style.display='none';open.classList.add('show');renderBookPage();},600);
  document.getElementById('bookOverlay').classList.add('show');
}
function closeBook(){
  const cover=document.getElementById('bookCover');const open=document.getElementById('bookOpen');
  const leftPage=document.getElementById('pageLeft');const rightPage=document.getElementById('pageRight');
  const flipper=document.getElementById('pageFlipper');
  leftPage.style.opacity='1';rightPage.style.opacity='1';
  flipper.classList.remove('active');flipper.classList.remove('flipping');
  flipper.style.transform='';flipper.style.transformOrigin='left center';flipper.style.transition='';
  document.getElementById('flipFront').innerHTML='';document.getElementById('flipBack').innerHTML='';
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
document.getElementById('undoBtn').addEventListener('click',undoMove);
document.getElementById('hintBtn').addEventListener('click',getHint);
document.getElementById('accuseBtn').addEventListener('click',playerAccuseObj);
document.getElementById('cheatBtn').addEventListener('click',playerDoCheat);
document.getElementById('newGameBtn').addEventListener('click',newGame);
document.getElementById('bookBtn').addEventListener('click',openBook);
document.getElementById('bookCover').addEventListener('click',openBook);
document.getElementById('bookClose').addEventListener('click',closeBook);
document.getElementById('bookPrev').addEventListener('click',prevPage);
document.getElementById('bookNext').addEventListener('click',nextPage);
document.getElementById('bookOverlay').addEventListener('click',(e)=>{if(e.target===document.getElementById('bookOverlay'))closeBook();});
newGame();
setInterval(()=>{if(Math.random()<0.12&&!gameOver)objSpeak(objLines[Math.floor(Math.random()*objLines.length)]);},25000);