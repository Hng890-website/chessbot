// ===========================================
// NGÔN NGỮ & DỊCH THUẬT
// ===========================================

let currentLanguage = 'en'; // Mặc định là Tiếng Anh

const translations = {
    en: {
        // HOME SCREEN
        'home.title': 'Chess Game',
        'home.play_btn': 'Play Against Bot',
        'home.rules_btn': 'Rules',
        'home.news_btn': 'Latest News',
        
        // MODAL/SETUP
        'modal.title': 'Setup Match',
        'modal.bot_name': 'Bot Name:',
        'modal.level': 'Bot Level:',
        'modal.time_control': 'Time Control:',
        'modal.unlimited': 'Unlimited',
        'modal.custom': 'Custom (Min + Inc)',
        'modal.start': 'Start Match',
        'modal.close': 'Close',
        'modal.alert_time_format': 'Invalid time format. Use MIN+INC (e.g., 10+5).',
        'modal.alert_time_required': 'Invalid time. Please enter time > 0.',
        'modal.color_player': 'You Play:',
        'modal.color_bot': 'Bot Plays:',

        // GAME SCREEN
        'game.turn': 'Turn:',
        'game.white': 'White',
        'game.black': 'Black',
        'game.moves': 'Move History',
        'game.no_moves': 'No moves recorded yet.',
        'game.chat_title': 'Chat',
        'game.chat_input': 'Type message...',
        'game.chat_send': 'Send',
        'game.system': 'System',
        'game.checkmate_win': 'Checkmate! {winner} wins.',
        'game.draw': 'Draw!',
        'game.timeout_loss': 'Time out! {loser} loses.',
        'game.not_your_turn': 'Not your turn.',
        'game.invalid_move': 'Invalid move.',
        'game.bot_thinking_error': 'Bot failed to find a valid move. Game Over.',
        'game.promo_prompt': "Pawn promotion! Choose piece:\nQ - Queen\nR - Rook\nB - Bishop\nN - Knight\n(Default: Q)",
        'chat.welcome': 'Welcome, I am {name}! Have a good game!',
        'chat.response_learning': 'I appreciate your feedback. I am still learning!',
        'chat.response_greeting': 'Hello! Wish you a good match.',
        'chat.response_lose': 'I will try harder next time!',
        'chat.response_focus': 'I apologize, I am focused on the game right now.',
        
        // WIDGET
        'widget.hour': 'Time:',
        'widget.date': 'Date:',
        
        // MOVE DESCRIPTION (Sử dụng trong createMoveDescription)
        'move.p': 'Pawn', 'move.n': 'Knight', 'move.b': 'Bishop', 
        'move.r': 'Rook', 'move.q': 'Queen', 'move.k': 'King',
        'move.you': 'You', 'move.bot': 'Bot',
        'move.action_capture': 'captured piece at {to}',
        'move.action_move': 'moved to {to}',
        'move.desc_template': '{player} moved {piece} {action}',
    },
    
    vi: {
        // HOME SCREEN
        'home.title': 'Game Cờ Vua',
        'home.play_btn': 'Chơi với Bot',
        'home.rules_btn': 'Luật chơi',
        'home.news_btn': 'Tin tức mới',
        
        // MODAL/SETUP
        'modal.title': 'Thiết lập trận đấu',
        'modal.bot_name': 'Tên Bot:',
        'modal.level': 'Cấp độ Bot:',
        'modal.time_control': 'Kiểm soát thời gian:',
        'modal.unlimited': 'Không giới hạn',
        'modal.custom': 'Tùy chỉnh (Phút + Giây)',
        'modal.start': 'Bắt đầu',
        'modal.close': 'Đóng',
        'modal.alert_time_format': 'Định dạng thời gian không hợp lệ. Vui lòng sử dụng PHÚT+GIÂY (ví dụ: 10+5).',
        'modal.alert_time_required': 'Thời gian không hợp lệ. Vui lòng nhập thời gian lớn hơn 0.',
        'modal.color_player': 'Bạn chơi:',
        'modal.color_bot': 'Bot chơi:',
        
        // GAME SCREEN
        'game.turn': 'Lượt đi:',
        'game.white': 'Trắng',
        'game.black': 'Đen',
        'game.moves': 'Lịch sử nước đi',
        'game.no_moves': 'Chưa có nước đi nào được ghi lại.',
        'game.chat_title': 'Phòng Chat',
        'game.chat_input': 'Nhập tin nhắn...',
        'game.chat_send': 'Gửi',
        'game.system': 'Hệ thống',
        'game.checkmate_win': 'Chiếu hết! {winner} thắng.',
        'game.draw': 'Hòa!',
        'game.timeout_loss': 'Hết giờ! {loser} thua.',
        'game.not_your_turn': 'Không phải lượt của bạn.',
        'game.invalid_move': 'Nước đi không hợp lệ.',
        'game.bot_thinking_error': 'Bot không tìm thấy nước đi hợp lệ. Game Over.',
        'game.promo_prompt': "Tốt được phong cấp! Hãy chọn loại quân:\nQ - Hậu\nR - Xe\nB - Tượng\nN - Mã\n(Mặc định: Q)",
        'chat.welcome': 'Chào mừng, tôi là {name}! Chúc bạn một trận đấu hay!',
        'chat.response_learning': 'Tôi biết ơn những phản hồi của bạn. Tôi vẫn đang học hỏi!',
        'chat.response_greeting': 'Xin chào! Chúc bạn một trận đấu tốt.',
        'chat.response_lose': 'Tôi sẽ cố gắng hơn trong trận sau!',
        'chat.response_focus': 'Tôi xin lỗi, tôi chỉ tập trung vào ván cờ lúc này.',

        // WIDGET
        'widget.hour': 'Giờ:',
        'widget.date': 'Ngày:',
        
        // MOVE DESCRIPTION (Sử dụng trong createMoveDescription)
        'move.p': 'quân tốt', 'move.n': 'quân mã', 'move.b': 'quân tượng', 
        'move.r': 'quân xe', 'move.q': 'quân hậu', 'move.k': 'quân vua',
        'move.you': 'Bạn', 'move.bot': 'Bot',
        'move.action_capture': 'bắt quân tại {to}',
        'move.action_move': 'đi lên {to}',
        'move.desc_template': '{player} đã đi {piece} {action}',
    }
};

// Hàm dịch thuật chính
function translate(key, replacements = {}) {
    let text = translations[currentLanguage][key] || translations['en'][key] || `MISSING_KEY:${key}`;
    
    // Thay thế placeholders (ví dụ: {winner})
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
    }
    
    return text;
}

function switchLanguage(lang) {
    if (!translations[lang]) return;
    currentLanguage = lang;
    
    // Lưu ngôn ngữ vào localStorage 
    localStorage.setItem('gameLanguage', lang);
    
    applyTranslations();
    
    // Đánh dấu nút ngôn ngữ đang hoạt động
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function applyTranslations() {
    // HOME SCREEN
    document.getElementById('home-title')?.textContent = translate('home.title');
    document.getElementById('home-play-btn')?.textContent = translate('home.play_btn');
    document.getElementById('home-rules-btn')?.textContent = translate('home.rules_btn');
    document.getElementById('home-news-btn')?.textContent = translate('home.news_btn');

    // MODAL
    document.getElementById('modal-title')?.textContent = translate('modal.title');
    document.getElementById('bot-name-label')?.textContent = translate('modal.bot_name');
    document.getElementById('bot-level-label')?.textContent = translate('modal.level');
    document.getElementById('time-control-label')?.textContent = translate('modal.time_control');
    document.getElementById('unlimited-option')?.textContent = translate('modal.unlimited');
    document.getElementById('custom-option')?.textContent = translate('modal.custom');
    document.getElementById('start-match-btn')?.textContent = translate('modal.start');
    document.querySelector('.close-modal-btn')?.textContent = translate('modal.close');
    document.getElementById('player-color-label')?.textContent = translate('modal.color_player');
    document.getElementById('bot-color-label')?.textContent = translate('modal.color_bot');

    // PLAY SCREEN
    document.getElementById('move-history-title')?.textContent = translate('game.moves');
    document.querySelector('.no-moves-message')?.textContent = translate('game.no_moves');
    document.getElementById('chat-title')?.textContent = translate('game.chat_title');
    document.getElementById('chat-input')?.setAttribute('placeholder', translate('game.chat_input'));
    document.querySelector('.send-btn')?.textContent = translate('game.chat_send');
    document.querySelector('#play-screen .news-btn')?.textContent = translate('home.play_btn'); // Nút "Back to Home"
    
    // WIDGET
    updateCurrentTime(); 
    
    // Cập nhật các hiển thị động
    updateTurnDisplay();
}

// ===========================================
// SETUP CƠ BẢN
// ===========================================

const game = new Chess();
const chessboardEl = document.getElementById('chessboard');
const currentTurnDisplay = document.getElementById('current-turn-display');

let selectedSquare = null;
let currentTurn = 'w'; 
let playerColor = 'w'; 
let botLevel = 6; 
let botName = "Bot Level 6";

// ===========================================
// LOGIC BOT AI (WEB WORKER) - CHẠY NỀN KHÔNG TREO UI
// ===========================================

// Khởi tạo Web Worker để chạy logic AI trên luồng nền
const aiWorker = new Worker('ai-worker.js'); 

const PieceValues = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
};

// --- Hàm gọi tính toán Bot (sử dụng Worker) ---
function makeBotMoveWorker() {
    if (game.game_over()) return;
    
    stopTimer();

    // 1. Xác định độ sâu tìm kiếm và thời gian chờ (Đã điều chỉnh theo Level)
    let searchDepth;
    let delayTime; 
    
    if (botLevel <= 3) {
        searchDepth = 1; 
        delayTime = 100; // Phản hồi gần như ngay lập tức
    } else if (botLevel <= 6) {
        searchDepth = 2; 
        delayTime = 300; // Độ trễ nhỏ cho hiệu ứng suy nghĩ nhẹ
    } else if (botLevel <= 9) {
        searchDepth = 3; 
        delayTime = 500; // Độ trễ trung bình cho cảm giác suy nghĩ
    } else {
        searchDepth = 4; // Độ sâu 4 (Level 10)
        delayTime = 1000; // Giữ 1 giây chờ cho Bot "suy nghĩ sâu"
    }

    // 2. Sử dụng setTimeout với thời gian chờ đã tính toán
    setTimeout(() => {
        // Gửi thông tin cần thiết đến Worker
        aiWorker.postMessage({
            fen: game.fen(),        
            depth: searchDepth,     
            turn: game.turn(),      
            level: botLevel         
        });
    }, delayTime); 
}

// --- Logic Lắng nghe từ Worker ---
aiWorker.onmessage = function(e) {
    const bestMove = e.data.bestMove;
    
    if (bestMove) {
        // Cộng thời gian cho bot trước khi đi (nếu có increment)
        if (!isUnlimitedTime && game.turn() !== playerColor) {
            blackTime += timeIncrement; 
        }
        
        // bestMove là đối tượng move {from, to, promotion...}
        const moveResult = game.move(bestMove); 
        
        if (moveResult) {
            renderBoard();
            checkGameState();
            updateTurnDisplay();
            updateClocks();
            updateMoveHistory(moveResult); 
            
            // Khởi động lại timer cho người chơi
            if (!game.game_over()) {
                startTimer(); 
            }
        }
    } else {
        addChatMessage(translate('game.system'), translate('game.bot_thinking_error'));
    }
};

function makeBotMove() {
    makeBotMoveWorker();
}


// ===========================================
// TIMER LOGIC
// ===========================================

let whiteTime = 0;
let blackTime = 0;
let timeIncrement = 0;
let totalGameTime = 0;
let timerInterval = null;
let isUnlimitedTime = false; 

function formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateClocks() {
    const whiteTimeEl = document.getElementById('white-time');
    const blackTimeEl = document.getElementById('black-time');
    const totalGameTimeEl = document.getElementById('total-game-time');
    
    if (whiteTimeEl) whiteTimeEl.textContent = isUnlimitedTime ? "∞" : formatTime(whiteTime);
    if (blackTimeEl) blackTimeEl.textContent = isUnlimitedTime ? "∞" : formatTime(blackTime);
    if (totalGameTimeEl) totalGameTimeEl.textContent = formatTime(totalGameTime);

    const whiteClockEl = document.getElementById('white-clock');
    const blackClockEl = document.getElementById('black-clock');
    
    if (whiteClockEl) whiteClockEl.classList.toggle('active', currentTurn === 'w' && !isUnlimitedTime);
    if (blackClockEl) blackClockEl.classList.toggle('active', currentTurn === 'b' && !isUnlimitedTime);
    
    const checkLowTimeWhite = !isUnlimitedTime && (whiteTime > 0 && whiteTime < 60);
    if (whiteClockEl) whiteClockEl.classList.toggle('low-time', checkLowTimeWhite);
    
    const checkLowTimeBlack = !isUnlimitedTime && (blackTime > 0 && blackTime < 60);
    if (blackClockEl) blackClockEl.classList.toggle('low-time', checkLowTimeBlack);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    if (!isUnlimitedTime && whiteTime <= 0 && blackTime <= 0) return; 

    timerInterval = setInterval(() => {
        totalGameTime++;
        
        if (!isUnlimitedTime) {
            if (currentTurn === 'w') {
                whiteTime--;
                if (whiteTime <= 0) {
                    clearInterval(timerInterval);
                    const whiteText = translate('game.white');
                    addChatMessage(translate('game.system'), translate('game.timeout_loss', { loser: whiteText }));
                    checkGameState(); 
                }
            } else {
                blackTime--;
                if (blackTime <= 0) {
                    clearInterval(timerInterval);
                    const blackText = translate('game.black');
                    addChatMessage(translate('game.system'), translate('game.timeout_loss', { loser: blackText }));
                    checkGameState();
                }
            }
        }
        
        updateClocks();
    }, 1000);
}


function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

// ===========================================
// GAME & UI LOGIC
// ===========================================

function getPieceChar(type, color) {
    const pieces = {
        w: { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
        b: { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
    };
    return pieces[color][type];
}

function setupBoard() {
    if (!chessboardEl) return;
    chessboardEl.innerHTML = ''; 
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const squareEl = document.createElement('div');
            const rank = 8 - row;
            const file = String.fromCharCode('a'.charCodeAt(0) + col);
            const squareName = file + rank;

            squareEl.classList.add('square');
            squareEl.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            squareEl.dataset.square = squareName;

            squareEl.addEventListener('click', () => handleSquareClick(squareName));

            chessboardEl.appendChild(squareEl);
        }
    }
    renderBoard();
}

function renderBoard() {
    const board = game.board();
    const isFlipped = playerColor === 'b'; 
    
    if (chessboardEl) chessboardEl.classList.toggle('board-flipped', isFlipped);

    document.querySelectorAll('.square').forEach(el => {
        const squareName = el.dataset.square;
        el.innerHTML = ''; 
        el.classList.remove('king-in-check', 'selected', 'highlight-move');
        
        const row = 8 - parseInt(squareName[1]);
        const col = squareName.charCodeAt(0) - 'a'.charCodeAt(0);

        const squareData = board[row][col];

        if (squareData) {
            const pieceChar = getPieceChar(squareData.type, squareData.color);
            const pieceEl = document.createElement('span');
            pieceEl.textContent = pieceChar;
            pieceEl.classList.add(squareData.color === 'w' ? 'piece-white' : 'piece-black');
            el.appendChild(pieceEl);
        }
    });
    
    if (game.in_check()) {
        const kingSquare = findKingSquare(game.turn());
        if (kingSquare) {
            document.querySelector(`.square[data-square="${kingSquare}"]`)?.classList.add('king-in-check');
        }
    }
}


function findKingSquare(color) {
    const board = game.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === 'k' && piece.color === color) {
                return String.fromCharCode('a'.charCodeAt(0) + c) + (8 - r);
            }
        }
    }
    return null;
}

function updateTurnDisplay() {
    currentTurn = game.turn();
    const turnColorKey = currentTurn === 'w' ? 'game.white' : 'game.black';
    const turnColorText = translate(turnColorKey);
    const turnClass = currentTurn === 'w' ? 'white-turn' : 'black-turn';
    
    if (currentTurnDisplay) {
        currentTurnDisplay.innerHTML = `${translate('game.turn')} <strong><span class="turn-color ${turnClass}">${turnColorText}</span></strong>`;
    }
}


function handleSquareClick(squareName) {
    if (game.turn() !== playerColor) {
        addChatMessage(translate('game.system'), translate('game.not_your_turn'));
        return;
    }
    
    const piece = game.get(squareName);
    
    if (selectedSquare === null) {
        if (piece && piece.color === playerColor) {
            selectedSquare = squareName;
            document.querySelector(`[data-square="${squareName}"]`)?.classList.add('selected');
            highlightMoves(squareName);
        }
    } 
    else {
        // --- LOGIC PHONG CẤP TỐT ---
        let promotionPiece = 'q'; 
        const moveFrom = selectedSquare;
        const moveTo = squareName;
        const pieceMoving = game.get(moveFrom);
        
        const isPromotion = 
            pieceMoving && pieceMoving.type === 'p' && 
            ((playerColor === 'w' && moveTo.includes('8')) || 
            (playerColor === 'b' && moveTo.includes('1')));

        if (isPromotion) {
            let choice = prompt(translate('game.promo_prompt'), 'Q');
            
            choice = choice ? choice.toLowerCase() : 'q';
            if (['q', 'r', 'b', 'n'].includes(choice)) {
                promotionPiece = choice;
            } else {
                promotionPiece = 'q';
            }
        }
        // --- KẾT THÚC LOGIC PHONG CẤP TỐT ---
        
        const move = {
            from: moveFrom,
            to: moveTo,
            promotion: promotionPiece 
        };

        const result = game.move(move);

        document.querySelector(`[data-square="${selectedSquare}"]`)?.classList.remove('selected');
        document.querySelectorAll('.highlight-move').forEach(el => el.classList.remove('highlight-move'));
        
        if (result) {
            // --- XỬ LÝ SAU KHI NGƯỜI CHƠI ĐI ---
            if (!isUnlimitedTime && game.turn() === 'b') { 
                whiteTime += timeIncrement; 
            }
            
            selectedSquare = null;
            renderBoard();
            updateTurnDisplay();
            updateClocks();
            updateMoveHistory(result); 
            checkGameState();
            
            // 1. DỪNG TIMER CỦA NGƯỜI CHƠY
            stopTimer(); 
            
            // 2. GỌI HÀM ĐI CỦA BOT NẾU LÀ LƯỢT CỦA BOT
            if (!game.game_over() && game.turn() !== playerColor) {
                // Khởi động timer cho Bot (nếu có)
                startTimer();
                makeBotMoveWorker(); 
            }
            // ----------------------------------------
        } 
        else if (piece && piece.color === playerColor) {
            // Nước đi không hợp lệ, nhưng click vào quân cờ cùng màu khác
            selectedSquare = squareName;
            document.querySelector(`[data-square="${squareName}"]`)?.classList.add('selected');
            highlightMoves(squareName);
        }
        else {
            // Nước đi không hợp lệ và không click vào quân cờ cùng màu
            selectedSquare = null;
            renderBoard(); 
            addChatMessage(translate('game.system'), translate('game.invalid_move'));
        }
    }
}


function highlightMoves(square) {
    document.querySelectorAll('.highlight-move').forEach(el => el.classList.remove('highlight-move'));
    
    const moves = game.moves({ square: square, verbose: true });
    
    moves.forEach(move => {
        document.querySelector(`[data-square="${move.to}"]`)?.classList.add('highlight-move');
    });
}

function checkGameState() {
    if (game.game_over()) {
        stopTimer();
        if (game.in_checkmate()) {
            const winnerKey = game.turn() === 'w' ? 'game.black' : 'game.white';
            const winnerText = translate(winnerKey);
            addChatMessage(translate('game.system'), translate('game.checkmate_win', { winner: winnerText }));
        } else {
            addChatMessage(translate('game.system'), translate('game.draw'));
        }
    }
}

// ===========================================
// MOVE HISTORY LOGIC
// ===========================================

const moveHistoryListEl = document.getElementById('move-history-list');

// Hàm tạo mô tả đơn giản
function createMoveDescription(move) {
    const pieceMap = {
        'p': translate('move.p'), 'n': translate('move.n'), 'b': translate('move.b'), 
        'r': translate('move.r'), 'q': translate('move.q'), 'k': translate('move.k')
    };
    
    const playerText = move.color === playerColor ? translate('move.you') : translate('move.bot');
    const pieceName = pieceMap[move.piece] || translate('move.p'); // Fallback to pawn
    
    const actionKey = move.captured ? 'move.action_capture' : 'move.action_move';
    const actionText = translate(actionKey, { to: move.to });
    const icon = move.captured ? '💥' : '⬆️';
    
    const text = translate('move.desc_template', {
        player: playerText,
        piece: pieceName,
        action: actionText
    });
    
    return {
        text: text,
        icon: icon
    };
}


function updateMoveHistory(newMove = null) {
    const history = game.history({ verbose: true });
    
    if (moveHistoryListEl) {
         moveHistoryListEl.innerHTML = '';
    }
   
    const noMovesMessageEl = document.querySelector('.no-moves-message');
    
    if (noMovesMessageEl) {
        noMovesMessageEl.style.display = history.length === 0 ? 'block' : 'none';
        noMovesMessageEl.textContent = translate('game.no_moves');
    }

    if (history.length === 0 || !moveHistoryListEl) return;

    let historyHTML = '';
    
    for (let i = 0; i < history.length; i += 2) {
        const whiteMove = history[i];
        const blackMove = history[i + 1];
        const moveNumber = Math.floor(i / 2) + 1;

        const formatMove = (move) => {
            if (!move) return '';
            let displayMove = move.san;
            if (move.promotion) {
                displayMove += `=${move.promotion.toUpperCase()}`;
            }
            if (move.checkmate) {
                displayMove += '#';
            } else if (move.check) {
                displayMove += '+';
            }
            return displayMove;
        };
        
        const whiteMoveSAN = formatMove(whiteMove);
        const blackMoveSAN = formatMove(blackMove);
        
        
        const whiteContent = whiteMove 
            ? `<div class="move-detail-col">
                <span class="move-white">${whiteMoveSAN}</span>
              </div>` 
            : '';

        const blackContent = blackMove 
            ? `<div class="move-detail-col">
                <span class="move-black">${blackMoveSAN}</span>
              </div>` 
            : '';

        historyHTML += `
            <div class="move-item-row" data-move-num="${moveNumber}">
                <div class="move-number-col">
                    <span class="move-number">${moveNumber}.</span>
                </div>
                ${whiteContent}
                ${blackContent}
            </div>`;
    }

    moveHistoryListEl.innerHTML = historyHTML;
    
    const botLevelAnalysisEl = document.getElementById('bot-level-analysis');
    if (botLevelAnalysisEl) {
        botLevelAnalysisEl.textContent = botLevel;
    }
    
    moveHistoryListEl.scrollTop = moveHistoryListEl.scrollHeight;
    
    const lastMove = history[history.length - 1];
    if (lastMove) {
        const lastMoveEl = moveHistoryListEl.querySelector(`.move-item-row[data-move-num="${Math.ceil(history.length / 2)}"]`);
        if (lastMoveEl) {
            const description = createMoveDescription(lastMove);
            const targetCol = lastMove.color === 'w' 
                ? lastMoveEl.querySelector('.move-detail-col:nth-child(2)') 
                : lastMoveEl.querySelector('.move-detail-col:nth-child(3)');
            
            if (targetCol) {
                const descHTML = `
                    <div class="move-description">
                        <span class="desc-icon">${description.icon}</span>
                        ${description.text}
                    </div>`;
                targetCol.insertAdjacentHTML('beforeend', descHTML);
            }
        }
    }
}


// ===========================================
// CHAT LOGIC
// ===========================================

const chatRoomEl = document.querySelector('.chat-room');
const chatInput = document.getElementById('chat-input');
const sendButton = document.querySelector('.send-btn');

function addChatMessage(sender, message) {
    if (!chatRoomEl) return;
    
    const p = document.createElement('p');
    const senderSpan = document.createElement('span');
    
    senderSpan.textContent = sender + ": ";
    
    if (sender === botName || sender === translate('game.system')) {
        senderSpan.classList.add('bot-message');
    }
    
    p.appendChild(senderSpan);
    p.appendChild(document.createTextNode(message));
    
    chatRoomEl.prepend(p); 
    chatRoomEl.scrollTop = 0; 
}

if (sendButton && chatInput) {
    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message !== "") {
            addChatMessage(translate('move.you'), message);
            chatInput.value = '';
            
            setTimeout(() => {
                const botResponse = simpleBotResponse(message);
                addChatMessage(botName, botResponse);
            }, 800);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
}


function simpleBotResponse(message) {
    message = message.toLowerCase();
    if (message.includes('thông minh') || message.includes('ngốc') || message.includes('smart') || message.includes('dumb')) {
        return translate('chat.response_learning');
    }
    if (message.includes('xin chào') || message.includes('hello') || message.includes('hi')) {
        return translate('chat.response_greeting');
    }
    if (message.includes('thua') || message.includes('lose') || message.includes('chắc') || message.includes('sure')) {
        return translate('chat.response_lose');
    }
    return translate('chat.response_focus');
}


// ===========================================
// MODAL & INITIALIZATION
// ===========================================

const modalOverlay = document.getElementById('modal-overlay');
const levelButtons = document.querySelectorAll('#level-selection .level-btn');
const startMatchBtn = document.getElementById('start-match-btn');
const botNameInput = document.getElementById('bot-name-new'); 
const timeControlSelect = document.getElementById('time-control-select');
const customTimeInputGroup = document.getElementById('custom-time-input-group');
const customTimeInput = document.getElementById('custom-time-input');


function toggleModal(show) {
    if (modalOverlay) {
        modalOverlay.classList.toggle('visible', show);
    }
}

if (timeControlSelect) {
    timeControlSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom' && customTimeInputGroup) {
            customTimeInputGroup.classList.add('visible');
        } else if (customTimeInputGroup) {
            customTimeInputGroup.classList.remove('visible');
        }
    });
}

levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        levelButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        botLevel = parseInt(btn.dataset.level);
    });
});

document.querySelector('.play-btn[data-action="open-bot-selection"]')?.addEventListener('click', () => {
    toggleModal(true);
});

function setTimeControl(value) {
    let timeString = value;
    
    isUnlimitedTime = (value === 'unlimited'); 

    if (isUnlimitedTime) {
        whiteTime = 0;
        blackTime = 0;
        timeIncrement = 0;
        return true;
    } 
    
    if (value === 'custom') {
        timeString = customTimeInput?.value.trim() || '';
        if (!timeString) {
             alert(translate('modal.alert_time_format'));
             return false;
        }
    }
    
    const parts = timeString.split('+');
    let minutes = 0;
    let increment = 0;
    
    if (parts.length === 1) {
        minutes = parseInt(parts[0]);
    } else if (parts.length === 2) {
        minutes = parseInt(parts[0]);
        increment = parseInt(parts[1] || '0');
    }

    if (isNaN(minutes) || isNaN(increment) || minutes < 0 || increment < 0) {
        alert(translate('modal.alert_time_format'));
        return false;
    }

    whiteTime = minutes * 60;
    blackTime = minutes * 60;
    timeIncrement = increment;
    
    if (whiteTime === 0 && timeIncrement === 0 && !isUnlimitedTime) {
        alert(translate('modal.alert_time_required'));
        return false;
    }
    
    return true;
}


if (startMatchBtn) {
    startMatchBtn.addEventListener('click', () => {
        stopTimer();
        
        const activeLevelBtn = document.querySelector('#level-selection .level-btn.active');
        botLevel = activeLevelBtn ? parseInt(activeLevelBtn.dataset.level) : 6;
        
        const inputName = botNameInput?.value.trim() || '';
        botName = inputName !== "" ? inputName : `Bot Level ${botLevel}`;
        
        const timeControlValue = timeControlSelect?.value || 'unlimited';
        if (!setTimeControl(timeControlValue)) {
            return; 
        }
        
        game.reset();
        totalGameTime = 0; 
        playerColor = 'w'; // Luôn mặc định người chơi là quân Trắng
        
        showScreen('play');
        toggleModal(false);
        setupBoard();
        updateTurnDisplay();
        
        const noMovesMessageEl = document.querySelector('.no-moves-message');
        if (noMovesMessageEl) {
            noMovesMessageEl.style.display = 'block'; 
        }

        
        const botInfoNameEl = document.getElementById('bot-info-name');
        const botLevelDisplayEl = document.getElementById('bot-level-display');
        const playerColorDisplayEl = document.getElementById('player-color-display');
        const botColorDisplayEl = document.getElementById('bot-color-display');

        if (botInfoNameEl) botInfoNameEl.textContent = botName;
        if (botLevelDisplayEl) botLevelDisplayEl.textContent = `Level ${botLevel}`;
        if (playerColorDisplayEl) playerColorDisplayEl.textContent = translate('game.white');
        if (botColorDisplayEl) botColorDisplayEl.textContent = translate('game.black');
        
        startTimer();
        
        addChatMessage(botName, translate('chat.welcome', { name: botName }));

        // Thêm kiểm tra nếu Bot đi trước (người chơi là Đen)
        if (playerColor === 'b' || game.turn() !== playerColor) {
             makeBotMoveWorker(); 
        }
    });
}


document.querySelector('.close-modal-btn')?.addEventListener('click', () => {
    toggleModal(false);
});

document.querySelectorAll('#play-screen .news-btn, #rules-screen .play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('home');
        stopTimer(); 
    });
});

document.querySelector('.rules-btn[data-action="show-rules"]')?.addEventListener('click', () => {
    showScreen('rules');
});


// ===========================================
// REAL-TIME CLOCK WIDGET LOGIC
// ===========================================

function updateCurrentTime() {
    const now = new Date();
    
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; 

    const timeString = `${translate('widget.hour')} ${displayHour}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    
    const day = now.getDate();
    const month = now.getMonth() + 1; 
    const year = now.getFullYear();
    
    const dateString = `${translate('widget.date')} ${day}/${month}/${year}`;

    const hourEl = document.getElementById('current-hour-display');
    const dateEl = document.getElementById('current-date-display');
    
    if (hourEl) hourEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
}


// ===========================================
// DRAG AND DROP LOGIC (TIME WIDGET)
// ===========================================

const timeWidget = document.getElementById('time-widget');
const draggableHeader = document.querySelector('#time-widget .draggable-header');

let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;

if (timeWidget && draggableHeader) {
    draggableHeader.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);
    
    draggableHeader.addEventListener("touchstart", dragStart);
    document.addEventListener("touchend", dragEnd);
    document.addEventListener("touchmove", drag);
    
    document.querySelector('.close-widget-btn')?.addEventListener('click', () => {
        if (timeWidget) timeWidget.style.display = 'none';
    });
}

function dragStart(e) {
    if (e.target.closest('.close-widget-btn') || !timeWidget) return; 
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const rect = timeWidget.getBoundingClientRect();
    initialX = clientX - rect.left;
    initialY = clientY - rect.top;

    timeWidget.style.transform = 'none';
    timeWidget.style.right = 'auto'; 
    timeWidget.style.bottom = 'auto';

    isDragging = true;
    timeWidget.style.cursor = 'grabbing';
}

function dragEnd(e) {
    if (!timeWidget) return;
    isDragging = false;
    timeWidget.style.cursor = 'grab';
    
    if (timeWidget.style.left || timeWidget.style.top) {
        timeWidget.style.left = timeWidget.getBoundingClientRect().left + 'px';
        timeWidget.style.top = timeWidget.getBoundingClientRect().top + 'px';
        timeWidget.style.transform = 'none';
    }
}

function drag(e) {
    if (isDragging && timeWidget) {
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        currentX = clientX - initialX;
        currentY = clientY - initialY;

        const maxX = window.innerWidth - timeWidget.offsetWidth;
        const maxY = window.innerHeight - timeWidget.offsetHeight;

        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));


        timeWidget.style.left = currentX + 'px';
        timeWidget.style.top = currentY + 'px';
    }
}


function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    let targetId = screenId + '-screen';
    if (screenId === 'home') {
        targetId = 'home-screen';
    } else if (screenId === 'play') {
        targetId = 'play-screen';
    } else if (screenId === 'rules') {
        targetId = 'rules-screen';
    }

    const targetScreen = document.getElementById(targetId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Khởi tạo trạng thái ban đầu
const savedLang = localStorage.getItem('gameLanguage') || 'en';
switchLanguage(savedLang); 

showScreen('home');
setupBoard();
setTimeControl('unlimited'); 
updateClocks();

// Kích hoạt đồng hồ thời gian thực
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
