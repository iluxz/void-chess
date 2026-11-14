// engine.js — void chess game logic
const WHITE='w',BLACK='b';
const objLines=['...huh. you want to play chess? fine. but i make the rules.','i am the void. i do not play fairly.','your move. make it count. it won\'t matter.','interesting. wrong, but interesting.','i have seen ten thousand games. you have seen none.','the board is mine. you are just visiting.','...did you just do that? bold. stupid, but bold.','i could win this in three moves. but where is the fun in that.','you are losing. you just don\'t know it yet.','checkmate is coming. not today. but soon.','that was a mistake. i will remember it.','are you even trying?','...ok that was actually good. don\'t let it go to your head.'];
function objSpeak(text){const el=document.getElementById('objText');el.textContent='';let i=0;const iv=setInterval(()=>{if(i<text.length){el.textContent+=text[i];i++}else clearInterval(iv)},35);}
function initBoard(){const b=Array(8).fill(null).map(()=>Array(8).fill(null));const back=['R','N','B','Q','K','B','N','R'];for(let c=0;c<8;c++){b[0][c]={type:back[c],color:BLACK};b[1][c]={type:'P',color:BLACK};b[6][c]={type:'P',color:WHITE};b[7][c]={type:back[c],color:WHITE};}return b;}
var board=initBoard(),turn=WHITE,selected=null,validMoves=[],lastMove=null,gameOver=false;
let moveHistory=[],castling={wK:true,wQ:true,bK:true,bQ:true},enPassant=null;
let capturedPieces={w:[],b:[]},moveCount=0,hintMove=null;
function inB(r,c){return r>=0&&r<8&&c>=0&&c<8}
const mutations=[
  {name:'bishop teleport',desc:'bishops can now teleport to any empty square',apply:s=>{s.bishopTeleport=true}},
  {name:'knight queen',desc:'knights move like queens for 3 turns',apply:s=>{s.knightQueen=3}},
  {name:'pawn rebellion',desc:'your pawns can move backwards now',apply:s=>{s.pawnBackwards=true}},
  {name:'rook phase',desc:'rooks phase through pieces for 2 turns',apply:s=>{s.rookPhase=2}},
  {name:'extra move',desc:'i get to move twice this turn',apply:s=>{s.extraMove=true}},
  {name:'board flip',desc:'the board rotates 90 degrees',apply:s=>{s.boardFlip=true}},
  {name:'piece swap',desc:'all pieces on the board swap colors',apply:s=>{s.pieceSwap=true}},
  {name:'queen steal',desc:'your queen is now mine',apply:s=>{s.queenSteal=true}},
  {name:'free promotion',desc:'pawns can promote to any piece',apply:s=>{s.freePromotion=true}},
  {name:'knight jump',desc:'knights can jump to any square',apply:s=>{s.knightJump=true}},
  {name:'bishop laser',desc:'bishops can shoot any empty diagonal square',apply:s=>{s.bishopLaser=true}},
  {name:'rook laser',desc:'rooks can shoot any empty square in their row/column',apply:s=>{s.rookLaser=true}},
  {name:'king rampage',desc:'my king moves like a queen now',apply:s=>{s.kingRampage=true}},
  {name:'pawn sprint',desc:'pawns can move 3 squares on first move',apply:s=>{s.pawnSprint=true}},
  {name:'random vanish',desc:'a random piece of yours vanishes',apply:s=>{s.randomVanish=true}},
  {name:'mirror move',desc:'your move is mirrored on my side',apply:s=>{s.mirrorMove=true}},
  {name:'chaos board',desc:'pieces are randomly rearranged',apply:s=>{s.chaosBoard=true}},
  {name:'double agent',desc:'one of your pieces now works for me',apply:s=>{s.doubleAgent=true}},
];
let gameState={bishopTeleport:false,knightQueen:0,pawnBackwards:false,rookPhase:0,extraMove:false,boardFlip:false,pieceSwap:false,queenSteal:false,freePromotion:false,knightJump:false,bishopLaser:false,rookLaser:false,kingRampage:false,pawnSprint:false,randomVanish:false,mirrorMove:false,chaosBoard:false,doubleAgent:false,penaltySquares:[]};
let activeMutations=[];
const objCheatTypes=['extra_piece','illegal_move','piece_teleport','invisible_capture'];
let playerCheating=false,objCheating=false,objCheatType=null;

function getMoves(r,c,bs){
  const piece=bs[r][c];if(!piece)return[];const moves=[];const color=piece.color,opp=color===WHITE?BLACK:WHITE,t=piece.type;
  const add=(toR,toC,sp)=>{if(!inB(toR,toC))return;const target=bs[toR][toC];if(target&&target.color===color)return;moves.push({from:{r,c},to:{r:toR,c:toC},capture:!!target,special:sp});};
  if(t==='P'){const dir=color===WHITE?-1:1,startRow=color===WHITE?6:1;
    if(inB(r+dir,c)&&!bs[r+dir][c]){add(r+dir,c);if(r===startRow&&inB(r+2*dir,c)&&!bs[r+2*dir][c])add(r+2*dir,c,'double');}
    if(gameState.pawnBackwards&&inB(r-dir,c)&&!bs[r-dir][c])add(r-dir,c);
    for(const dc of[-1,1]){if(inB(r+dir,c+dc)){const tg=bs[r+dir][c+dc];if(tg&&tg.color===opp)add(r+dir,c+dc,'capture');if(enPassant&&enPassant.r===r+dir&&enPassant.c===c+dc)add(r+dir,c+dc,'ep');}}
    if(gameState.pawnSprint&&r===startRow){for(let d=1;d<=3;d++){if(inB(r+d*dir,c)&&!bs[r+d*dir][c])add(r+d*dir,c);else break;}}
  }
  const knightMoves=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  if(t==='N'||(gameState.knightQueen>0&&t==='N')){
    if(gameState.knightJump){for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++){if(rr!==r||cc!==c)add(rr,cc);}}
    else{for(const[dr,dc] of knightMoves)add(r+dr,c+dc);}
    if(gameState.knightQueen>0&&t==='N'){for(const[dr,dc] of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){for(let i=1;i<8;i++){const nr=r+dr*i,nc=c+dc*i;if(!inB(nr,nc))break;const tg=bs[nr][nc];if(tg){if(tg.color===opp)add(nr,nc);break;}else add(nr,nc);}}}
  }
  const slide=(dirs)=>{for(const[dr,dc] of dirs){for(let i=1;i<8;i++){const nr=r+dr*i,nc=c+dc*i;if(!inB(nr,nc))break;const tg=bs[nr][nc];if(tg){if(tg.color===opp)add(nr,nc);break;}else add(nr,nc);}}};
  if(t==='B'||t==='Q')slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
  if(t==='B'&&gameState.bishopTeleport){for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++){if(!bs[rr][cc])add(rr,cc,'teleport');}}
  if(t==='B'&&gameState.bishopLaser){for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++){const dr=Math.abs(rr-r),dc=Math.abs(cc-c);if(dr===dc&&dr>0&&!bs[rr][cc])add(rr,cc,'laser');}}
  if(t==='R'||t==='Q')slide([[-1,0],[1,0],[0,-1],[0,1]]);
  if(t==='R'&&gameState.rookPhase){const dirs=[[-1,0],[1,0],[0,-1],[0,1]];for(const[dr,dc] of dirs){for(let i=1;i<8;i++){const nr=r+dr*i,nc=c+dc*i;if(!inB(nr,nc))break;const tg=bs[nr][nc];if(tg){if(tg.color===opp)add(nr,nc);break;}else add(nr,nc);}}}
  if(t==='R'&&gameState.rookLaser){for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++){if((rr===r||cc===c)&&!(rr===r&&cc===c)&&!bs[rr][cc])add(rr,cc,'laser');}}
  if(t==='K'){
    for(const[dr,dc] of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])add(r+dr,c+dc);
    if(gameState.kingRampage&&color===BLACK)slide([[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    if(color===WHITE&&r===7&&c===4){if(castling.wK&&!bs[7][5]&&!bs[7][6])add(7,6,'castleK');if(castling.wQ&&!bs[7][3]&&!bs[7][2]&&!bs[7][1])add(7,2,'castleQ');}
    if(color===BLACK&&r===0&&c===4){if(castling.bK&&!bs[0][5]&&!bs[0][6])add(0,6,'castleK');if(castling.bQ&&!bs[0][3]&&!bs[0][2]&&!bs[0][1])add(0,2,'castleQ');}
  }
  return moves;
}
function isCheck(color){
  let kp=null;for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].type==='K'&&board[r][c].color===color)kp={r,c};}
  if(!kp)return false;const opp=color===WHITE?BLACK:WHITE;
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===opp){const mvs=getMoves(r,c,board);if(mvs.some(m=>m.to.r===kp.r&&m.to.c===kp.c))return true;}}
  return false;
}
function makeMove(from,to,special,saveHistory=true){
  const piece=board[from.r][from.c];const captured=board[to.r][to.c];
  const snapshot={board:board.map(row=>row.map(p=>p?{...p}:null)),castling:{...castling},enPassant:enPassant?{...enPassant}:null,moveCount,gameState:{...gameState}};
  board[to.r][to.c]=piece;board[from.r][from.c]=null;
  if(special==='castleK'){const rook=board[from.r][7];board[from.r][5]=rook;board[from.r][7]=null;}
  if(special==='castleQ'){const rook=board[from.r][0];board[from.r][3]=rook;board[from.r][0]=null;}
  if(special==='ep'){const dir=piece.color===WHITE?1:-1;board[to.r+dir][to.c]=null;}
  if(piece.type==='P'&&(to.r===0||to.r===7)){piece.type='Q';}
  if(special==='double')enPassant={r:(from.r+to.r)/2,c:from.c};else enPassant=null;
  if(piece.type==='K'){if(piece.color===WHITE){castling.wK=false;castling.wQ=false;}else{castling.bK=false;castling.bQ=false;}}
  if(piece.type==='R'){if(from.r===7&&from.c===0)castling.wQ=false;if(from.r===7&&from.c===7)castling.wK=false;if(from.r===0&&from.c===0)castling.bQ=false;if(from.r===0&&from.c===7)castling.bK=false;}
  piece.moved=true;lastMove={from,to};
  if(saveHistory)moveHistory.push({from,to,piece:{...piece},captured,snapshot,cheat:playerCheating});
  if(captured){playCapture();capturedPieces[captured.color===WHITE?'w':'b'].push(captured);}
  else playMove();
  if(gameState.mirrorMove&&piece.color===WHITE){const mr=7-to.r,mc=to.c;if(board[mr][mc]&&board[mr][mc].color===BLACK)board[mr][mc]=null;}
  moveCount++;
  if(gameState.knightQueen>0)gameState.knightQueen--;
  if(gameState.rookPhase>0)gameState.rookPhase--;
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
  playUndo();renderBoard();
  objSpeak('...you undid that. cowardly. but effective.');
}
function getHint(){
  if(gameOver||turn!==WHITE)return;
  const allMoves=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===WHITE){const mvs=getLegalMoves(r,c,board);for(const m of mvs)allMoves.push(m);}}
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
  hintMove=best;selected=null;validMoves=[best];playHint();renderBoard();
  objSpeak('...fine. try '+String.fromCharCode(97+best.from.c)+(8-best.from.r)+' to '+String.fromCharCode(97+best.to.c)+(8-best.to.r)+'. but i would have done something better.');
}
function endGame(msg){gameOver=true;document.getElementById('status').textContent=msg;if(msg.includes('win'))playWin();else playLose();objSpeak(msg);}