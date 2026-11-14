// chess-ui.js — void chess CSS 3D rendering, events, book UI, particles
// 3D board with CSS transforms, spinnable camera, obj

// ===== LEGAL MOVES (needs engine.js) =====
function getLegalMoves(r, c, bs) {
  const piece = bs[r][c]; if (!piece) return [];
  const pseudo = getMoves(r, c, bs);
  return pseudo.filter(m => {
    const saved = { board: bs.map(row => row.map(p => p ? { ...p } : null)), castling: { ...castling }, enPassant: enPassant ? { ...enPassant } : null, moveCount };
    makeMove(m.from, m.to, m.special, false);
    const inCheck = isCheck(piece.color);
    board = saved.board.map(row => row.map(p => p ? { ...p } : null));
    castling = { ...saved.castling };
    enPassant = saved.enPassant ? { ...saved.enPassant } : null;
    moveCount = saved.moveCount;
    return !inCheck;
  });
}

// ===== 3D BOARD SETUP =====
// chess-ui.js loaded
const boardWrap = document.getElementById('boardWrap');
const board3d = document.getElementById('board3d');
// Replace canvas with a div-based 3D board
const boardContainer = document.createElement('div');
boardContainer.id = 'boardContainer';
boardContainer.style.cssText = 'position:relative;width:100%;height:100%;perspective:800px;transform-style:preserve-3d;';
const boardPlane = document.createElement('div');
boardPlane.id = 'boardPlane';
boardPlane.style.cssText = 'position:absolute;top:50%;left:50%;width:min(60vh,60vw);height:min(60vh,60vw);transform:translate(-50%,-50%) rotateX(55deg);transform-style:preserve-3d;transition:transform 0.1s;';
boardContainer.appendChild(boardPlane);

// Attach click handlers directly to each square
function attachClickHandlers() {
  const sqs = boardPlane.querySelectorAll('.sq3d');
  sqs.forEach((sq, idx) => {
    const r = Math.floor(idx / 8);
    const c = idx % 8;
    sq.onclick = function() {
      onCellClick(r, c);
    };
  });
}
if (board3d && board3d.parentNode === boardWrap) {
  boardWrap.replaceChild(boardContainer, board3d);
} else {
  boardWrap.appendChild(boardContainer);
}

// Create 64 squares
const squares3d = [];
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    const sq = document.createElement('div');
    sq.className = 'sq3d ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
    sq.style.cssText = `position:absolute;width:12.5%;height:12.5%;left:${c * 12.5}%;top:${r * 12.5}%;display:flex;align-items:center;justify-content:center;font-size:2.5vh;cursor:pointer;transform-style:preserve-3d;transition:background .15s;`;
    sq.dataset.r = r;
    sq.dataset.c = c;
    // click handler attached via event delegation on boardPlane
    boardPlane.appendChild(sq);
    squares3d.push(sq);
  }
}
attachClickHandlers();

// Camera state
let rotX = 55; // tilt angle
let rotY = 0; // horizontal rotation
let zoom = 1;
let isRotating = false;
let lastMouse = { x: 0, y: 0 };

boardContainer.addEventListener('mousedown', (e) => {
  // Right-click or middle-click anywhere to rotate
  if (e.button === 2 || e.button === 1) {
    isRotating = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    boardContainer.style.cursor = 'grabbing';
    e.preventDefault();
  }
  // Left-click on empty space (not on a square) to rotate
  else if (e.button === 0 && !e.target.classList.contains('sq3d')) {
    isRotating = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    boardContainer.style.cursor = 'grabbing';
    e.preventDefault();
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isRotating) return;
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  rotY += dx * 0.5;
  rotX = Math.max(10, Math.min(85, rotX - dy * 0.3));
  boardPlane.style.transform = `translate(-50%,-50%) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom})`;
  lastMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => {
  if (isRotating) { isRotating = false; boardContainer.style.cursor = 'grab'; }
});

boardContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoom = Math.max(0.5, Math.min(2, zoom - e.deltaY * 0.001));
  boardPlane.style.transform = `translate(-50%,-50%) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom})`;
}, { passive: false });

boardContainer.addEventListener('contextmenu', (e) => e.preventDefault());
boardContainer.style.cursor = 'grab';

// ===== OBJ removed =====
const _objRemoved = true;
if (false) { const objCube = document.createElement('div');
objCube.style.cssText = 'position:relative;width:100%;height:100%;transform-style:preserve-3d;transform:rotateX(-20deg) rotateY(30deg);animation:objSpin 8s linear infinite;';
const faces = [
  { transform: 'translateZ(40px)', bg: 'rgba(136,136,136,0.3)' },
  { transform: 'rotateY(180deg) translateZ(40px)', bg: 'rgba(136,136,136,0.3)' },
  { transform: 'rotateY(90deg) translateZ(40px)', bg: 'rgba(136,136,136,0.25)' },
  { transform: 'rotateY(-90deg) translateZ(40px)', bg: 'rgba(136,136,136,0.25)' },
  { transform: 'rotateX(90deg) translateZ(40px)', bg: 'rgba(136,136,136,0.2)' },
  { transform: 'rotateX(-90deg) translateZ(40px)', bg: 'rgba(136,136,136,0.2)' },
];
for (const f of faces) {
  const face = document.createElement('div');
  face.style.cssText = `position:absolute;width:80px;height:80px;background:${f.bg};border:1px solid rgba(95,168,211,0.3);transform:${f.transform};backface-visibility:visible;`;
  objCube.appendChild(face);
}
// Inner cubes - orbiting inside the outer cube
const innerColors = ['#ff3333','#33ff33','#3333ff','#ffff33','#ff33ff','#33ffff','#ffffff','#888888'];
const innerEls = [];
for (let i = 0; i < 8; i++) {
  const inner = document.createElement('div');
  inner.style.cssText = `position:absolute;width:10px;height:10px;background:${innerColors[i]};opacity:0.9;border:1px solid ${innerColors[i]};box-shadow:0 0 6px ${innerColors[i]},0 0 12px ${innerColors[i]};transform-style:preserve-3d;`;
  objCube.appendChild(inner);
  innerEls.push({ el: inner, index: i });
}
// Animate inner cubes to orbit inside the outer cube
function animateInner() {
  const time = performance.now() * 0.001;
  innerEls.forEach((ic) => {
    const i = ic.index;
    const angle = (i / 8) * Math.PI * 2 + time * 0.5;
    const radius = 18;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(angle * 2) * 6;
    ic.el.style.transform = `translate3d(${x + 35}px, ${y + 35}px, ${z}px)`;
  });
  requestAnimationFrame(animateInner);
}
animateInner();
} // close if(false)
// obj removed

// Add CSS animation
const style = document.createElement('style');
style.textContent = '@keyframes objSpin{from{transform:rotateX(-20deg) rotateY(0deg)}to{transform:rotateX(-20deg) rotateY(360deg)}}';
document.head.appendChild(style);

// ===== RENDERING =====
const pieceSymbols = { 'K': { w: '♔', b: '♚' }, 'Q': { w: '♕', b: '♛' }, 'R': { w: '♖', b: '♜' }, 'B': { w: '♗', b: '♝' }, 'N': { w: '♘', b: '♞' }, 'P': { w: '♙', b: '♟' } };

function renderBoard() {
  const sqs = boardPlane.querySelectorAll('.sq3d');
  sqs.forEach((sq, idx) => {
    const r = Math.floor(idx / 8);
    const c = idx % 8;
    const isLight = (r + c) % 2 === 0;
    let bg = isLight ? '#2a2540' : '#151025';
    if (selected && selected.r === r && selected.c === c) bg = '#769656';
    if (validMoves.some(m => m.to.r === r && m.to.c === c)) bg = '#5a6a4a';
    if (hintMove && hintMove.to.r === r && hintMove.to.c === c) bg = '#8a7a2a';
    if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c))) bg = '#5a4a7a';
    if (gameState.penaltySquares && gameState.penaltySquares.some(p => p.r === r && p.c === c)) bg = '#8a2a2a';
    sq.style.background = bg;
    // Clear content
    sq.innerHTML = '';
    const piece = board[r][c];
    if (piece) {
      const span = document.createElement('span');
      span.className = 'piece ' + (piece.color === WHITE ? 'white' : 'black');
      span.textContent = pieceSymbols[piece.type][piece.color];
      span.style.transform = 'translateZ(2px) rotateX(-55deg)'; // raise above board + counter-rotate
      span.style.display = 'inline-block';
      span.style.transformOrigin = 'center bottom';
      sq.appendChild(span);
    }
  });
  window.__gameState = { selected: selected ? selected.r + ',' + selected.c : 'none', turn, gameOver, validMoves: validMoves.length };
  // update captured pieces
  const cw = document.getElementById('capturedWhite'); const cb = document.getElementById('capturedBlack');
  if (cw) { cw.innerHTML = ''; for (const p of capturedPieces.w) { const s = document.createElement('span'); s.className = 'piece ' + (p.color === WHITE ? 'white' : 'black'); s.textContent = pieceSymbols[p.type][p.color]; s.style.fontSize = '18px'; cw.appendChild(s); } }
  if (cb) { cb.innerHTML = ''; for (const p of capturedPieces.b) { const s = document.createElement('span'); s.className = 'piece ' + (p.color === WHITE ? 'white' : 'black'); s.textContent = pieceSymbols[p.type][p.color]; s.style.fontSize = '18px'; cb.appendChild(s); } }
}

window.onCellClick = function(r, c) {
  if (gameOver || turn !== WHITE) return;
  const piece = board[r][c];
  if (selected) {
    const move = validMoves.find(m => m.to.r === r && m.to.c === c);
    if (move) {
      const kingPiece = board[selected.r][selected.c];
      if (kingPiece && kingPiece.type === 'K' && gameState.penaltySquares && gameState.penaltySquares.some(p => p.r === r && p.c === c && p.color === WHITE)) { objSpeak('your king cannot take that piece. penalty rules.'); return; }
      makeMove(selected, { r, c }, move.special); hintMove = null; renderBoard(); turn = BLACK;
      document.getElementById('status').textContent = 'obj thinking...'; document.getElementById('status').style.color = '#5fa8d3';
      setTimeout(() => { aiMove(); turn = WHITE; }, 500 + Math.random() * 400); selected = null; validMoves = []; return;
    }
    if (piece && piece.color === WHITE) { selected = { r, c }; validMoves = getLegalMoves(r, c, board); renderBoard(); return; }
    selected = null; validMoves = []; renderBoard();
  } else {
    if (piece && piece.color === WHITE) { selected = { r, c }; validMoves = getLegalMoves(r, c, board); renderBoard(); }
  }
}

// ===== RULEBOOK (BOOK UI) =====
const normalRules = [
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
const bookPages = [];
let currentPage = 0;
let isFlipping = false;
function buildBookPages() {
  bookPages.length = 0;
  bookPages.push({ title: 'normal rules', rules: normalRules.map(r => ({ text: r, type: 'normal' })) });
  if (activeMutations.length > 0) {
    const mutRules = activeMutations.map(m => ({ text: m, type: 'mutation' }));
    for (let i = 0; i < mutRules.length; i += 8) { bookPages.push({ title: 'obj mutations', rules: mutRules.slice(i, i + 8) }); }
  } else { bookPages.push({ title: 'obj mutations', rules: [{ text: 'no mutations yet. obj hasn\'t changed the rules... yet.', type: 'mutation' }] }); }
  bookPages.push({ title: 'cheating rules', rules: [
    { text: 'you can cheat by clicking the cheat button', type: 'normal' },
    { text: 'obj can also cheat randomly', type: 'mutation' },
    { text: 'accuse button: catch obj cheating for penalty', type: 'normal' },
    { text: 'false accusation penalizes you instead', type: 'mutation' },
    { text: 'penalty: opposite team captures piece in front of king', type: 'mutation' },
    { text: 'king cannot recapture the penalized piece', type: 'mutation' },
  ] });
}
function renderBookPage() {
  const left = document.getElementById('pageLeftContent'), right = document.getElementById('pageRightContent');
  left.innerHTML = ''; right.innerHTML = '';
  const page = bookPages[currentPage];
  if (!page) return;
  const h = document.createElement('h3'); h.textContent = page.title; left.appendChild(h);
  const half = Math.ceil(page.rules.length / 2);
  for (let i = 0; i < half; i++) { const div = document.createElement('div'); div.className = 'rule-item ' + page.rules[i].type; div.textContent = page.rules[i].text; left.appendChild(div); }
  if (currentPage + 1 < bookPages.length) {
    const nextPage = bookPages[currentPage + 1];
    const h2 = document.createElement('h3'); h2.textContent = nextPage.title; right.appendChild(h2);
    for (const r of nextPage.rules) { const div = document.createElement('div'); div.className = 'rule-item ' + r.type; div.textContent = r.text; right.appendChild(div); }
  }
  document.getElementById('bookPrev').disabled = currentPage <= 0;
  document.getElementById('bookNext').disabled = currentPage >= bookPages.length - 1;
  document.getElementById('pageIndicator').textContent = (currentPage + 1) + ' / ' + bookPages.length;
}
function openBook() { buildBookPages(); currentPage = 0; playBookOpen();
  const cover = document.getElementById('bookCover'); const open = document.getElementById('bookOpen');
  cover.style.transition = 'transform 0.8s cubic-bezier(.4,0,.2,1), opacity 0.6s';
  cover.style.transform = 'rotateY(-180deg)'; cover.style.opacity = '0';
  setTimeout(() => { cover.style.display = 'none'; open.classList.add('show'); renderBookPage(); }, 600);
  document.getElementById('bookOverlay').classList.add('show');
}
function closeBook() {
  const cover = document.getElementById('bookCover'); const open = document.getElementById('bookOpen');
  open.classList.remove('show'); cover.style.display = 'flex';
  cover.style.transform = 'rotateY(0deg)'; cover.style.opacity = '1';
  document.getElementById('bookOverlay').classList.remove('show');
}
function nextPage() {
  if (isFlipping || currentPage >= bookPages.length - 1) return;
  isFlipping = true; playPageTurn();
  const pages = document.getElementById('bookOpen');
  pages.style.transition = 'opacity .3s, transform .3s';
  pages.style.opacity = '0.3'; pages.style.transform = 'scale(0.97)';
  setTimeout(() => { currentPage++; renderBookPage(); pages.style.opacity = '1'; pages.style.transform = 'scale(1)'; setTimeout(() => { isFlipping = false; }, 350); }, 350);
}
function prevPage() {
  if (isFlipping || currentPage <= 0) return;
  isFlipping = true; playPageTurn();
  const pages = document.getElementById('bookOpen');
  pages.style.transition = 'opacity .3s, transform .3s';
  pages.style.opacity = '0.3'; pages.style.transform = 'scale(0.97)';
  setTimeout(() => { currentPage--; renderBookPage(); pages.style.opacity = '1'; pages.style.transform = 'scale(1)'; setTimeout(() => { isFlipping = false; }, 350); }, 350);
}
function updateRulebook() { buildBookPages(); }
function logRule(text) { const log = document.getElementById('ruleLog'); const div = document.createElement('div'); div.textContent = '> ' + text; log.appendChild(div); log.scrollTop = log.scrollHeight; }

// ===== NEW GAME =====
function newGame() {
  board = initBoard(); turn = WHITE; selected = null; validMoves = []; lastMove = null; gameOver = false; moveHistory = []; castling = { wK: true, wQ: true, bK: true, bQ: true }; enPassant = null; capturedPieces = { w: [], b: [] }; moveCount = 0; hintMove = null;
  gameState = { bishopTeleport: false, knightQueen: 0, pawnBackwards: false, rookPhase: 0, extraMove: false, boardFlip: false, pieceSwap: false, queenSteal: false, freePromotion: false, knightJump: false, bishopLaser: false, rookLaser: false, kingRampage: false, pawnSprint: false, randomVanish: false, mirrorMove: false, chaosBoard: false, doubleAgent: false, penaltySquares: [] };
  activeMutations = []; objCheating = false; playerCheating = false; objCheatType = null;
  document.getElementById('ruleLog').innerHTML = ''; document.getElementById('status').textContent = 'your move (white)'; document.getElementById('status').style.color = '#9fd4ff';
  objSpeak(objLines[0]); updateRulebook(); renderBoard();
}

// ===== EVENTS =====
document.getElementById('undoBtn').addEventListener('click', undoMove);
document.getElementById('hintBtn').addEventListener('click', getHint);
document.getElementById('accuseBtn').addEventListener('click', playerAccuseObj);
document.getElementById('cheatBtn').addEventListener('click', playerDoCheat);
document.getElementById('resignBtn').addEventListener('click', () => { if (!gameOver) { gameOver = true; document.getElementById('status').textContent = 'you resigned. obj wins.'; playLose(); objSpeak('you resigned. smart. but too late.'); } });
document.getElementById('newGameBtn').addEventListener('click', newGame);
document.getElementById('bookBtn').addEventListener('click', openBook);
document.getElementById('bookCover').addEventListener('click', openBook);
document.getElementById('bookClose').addEventListener('click', closeBook);
document.getElementById('bookPrev').addEventListener('click', prevPage);
document.getElementById('bookNext').addEventListener('click', nextPage);
document.getElementById('bookOverlay').addEventListener('click', (e) => { if (e.target === document.getElementById('bookOverlay')) closeBook(); });
newGame();
setInterval(() => { if (Math.random() < 0.12 && !gameOver) objSpeak(objLines[Math.floor(Math.random() * objLines.length)]); }, 25000);