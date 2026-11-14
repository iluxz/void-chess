// ai.js — void chess AI, mutations, and cheating
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
  makeMove(from,to,null);renderBoard(true);
  if(Math.random()<0.3){setTimeout(()=>{objAccusePlayer();},1000);}
  else{setTimeout(()=>{playerCheating=false;},2000);}
  playMove();
}
function objAccusePlayer(){
  if(!playerCheating)return;playerCheating=false;playAccuse();
  document.getElementById('accuseTitle').textContent='OBJ ACCUSES YOU';
  document.getElementById('accuseMsg').textContent='i saw that. you cheated. penalty applied.';
  document.getElementById('accuseOverlay').classList.add('show');
  applyPenalty(WHITE);objSpeak('i saw that. you cheated. penalty.');
  logRule('player caught cheating → penalty');
}
function playerAccuseObj(){
  if(gameOver)return;playAccuse();
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
  playMutate();
}
function aiMove(){
  if(gameOver)return;
  if(Math.random()<0.15)objDoCheat();
  const moves=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===BLACK){const mvs=getMoves(r,c,board);for(const m of mvs)moves.push(m);}}
  if(objCheating&&objCheatType==='illegal_move'){const blacks=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(board[r][c]&&board[r][c].color===BLACK)blacks.push({r,c});}if(blacks.length>0){const p=blacks[Math.floor(Math.random()*blacks.length)];const empty=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(!board[r][c])empty.push({r,c});}if(empty.length>0){const t=empty[Math.floor(Math.random()*empty.length)];moves.push({from:p,to:t,capture:false,special:null});}}}
  if(moves.length===0){if(isCheck(BLACK))endGame('checkmate! you win... for now.');else endGame('stalemate. draw.');return;}
  const captures=moves.filter(m=>m.capture);
  const pool=captures.length>0&&Math.random()<0.7?captures:moves;
  const move=pool[Math.floor(Math.random()*pool.length)];
  makeMove(move.from,move.to,move.special);renderBoard(true);
  if(isCheck(WHITE)){playCheck();document.getElementById('status').textContent='check!';document.getElementById('status').style.color='#ff4444';}
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