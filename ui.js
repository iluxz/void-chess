// ui.js — void chess rendering, events, book UI, particles
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
  const flipper=document.getElementById('pageFlipper');
  const shadow=document.getElementById('flipShadow');
  const front=document.getElementById('flipFront');
  const back=document.getElementById('flipBack');
  const currentPageData=bookPages[currentPage+1];
  if(currentPageData){front.innerHTML='';const h=document.createElement('h3');h.textContent=currentPageData.title;front.appendChild(h);for(const r of currentPageData.rules){const div=document.createElement('div');div.className='rule-item '+r.type;div.textContent=r.text;front.appendChild(div);}}
  const nextPageData=bookPages[currentPage+2];
  if(nextPageData){back.innerHTML='';const h=document.createElement('h3');h.textContent=nextPageData.title;back.appendChild(h);const half=Math.ceil(nextPageData.rules.length/2);for(let i=0;i<half;i++){const div=document.createElement('div');div.className='rule-item '+nextPageData.rules[i].type;div.textContent=nextPageData.rules[i].text;back.appendChild(div);}}
  shadow.classList.add('show');flipper.classList.add('flipping');
  setTimeout(()=>{currentPage++;flipper.classList.remove('flipping');shadow.classList.remove('show');renderBookPage();isFlipping=false;},800);
}
function prevPage(){
  if(isFlipping||currentPage<=0)return;
  isFlipping=true;playPageTurn();
  const flipper=document.getElementById('pageFlipper');
  const shadow=document.getElementById('flipShadow');
  const front=document.getElementById('flipFront');
  const back=document.getElementById('flipBack');
  const prevPageData=bookPages[currentPage-1];
  if(prevPageData){front.innerHTML='';const h=document.createElement('h3');h.textContent=prevPageData.title;front.appendChild(h);const half=Math.ceil(prevPageData.rules.length/2);for(let i=0;i<half;i++){const div=document.createElement('div');div.className='rule-item '+prevPageData.rules[i].type;div.textContent=prevPageData.rules[i].text;front.appendChild(div);}}
  const currentPageData=bookPages[currentPage];
  if(currentPageData){back.innerHTML='';const h=document.createElement('h3');h.textContent=currentPageData.title;back.appendChild(h);for(const r of currentPageData.rules){const div=document.createElement('div');div.className='rule-item '+r.type;div.textContent=r.text;back.appendChild(div);}}
  flipper.style.transformOrigin='right center';flipper.style.transform='rotateY(180deg)';
  shadow.classList.add('show');
  requestAnimationFrame(()=>{flipper.style.transition='transform .8s cubic-bezier(.35,0,.25,1)';flipper.style.transform='rotateY(0deg)';});
  setTimeout(()=>{currentPage--;flipper.style.transform='';flipper.style.transformOrigin='left center';flipper.style.transition='';shadow.classList.remove('show');renderBookPage();isFlipping=false;},800);
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