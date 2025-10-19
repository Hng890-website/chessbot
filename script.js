// ===========================================
// SETUP CƠ BẢN
// ===========================================

const game = new Chess();
const chessboardEl = document.getElementById('chessboard');
const currentTurnDisplay = document.getElementById('current-turn-display');

let selectedSquare = null;
let currentTurn = 'w'; 
let playerColor = 'w'; // Người chơi LUÔN LÀ TRẮNG ('w')
let botLevel = 6; 
let botName = "Bot Level 6";

// ===========================================
// LOGIC BOT AI (NEGAMAX) - GIỮ NGUYÊN
// ===========================================

const PieceValues = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
};

function evaluatePosition(board, color) {
    let score = 0;
    
    board.board().forEach(row => {
        row.forEach(piece => {
            if (piece) {
                const value = PieceValues[piece.type.toLowerCase()];
                if (piece.color === 'w') {
                    score += value;
                } else {
                    score -= value;
                }
            }
        });
    });

    if (color === 'b') {
        score = -score;
    }
    
    return score;
}

function negamax(board, depth, turn) {
    if (depth === 0 || board.game_over()) {
        const evalScore = evaluatePosition(board, turn);
        return (turn === game.turn() ? 1 : -1) * evalScore;
    }

    let maxScore = -Infinity;
    const moves = board.moves({ verbose: true });
    
    moves.sort((a, b) => (b.captured ? PieceValues[b.captured] : 0) - (a.captured ? PieceValues[a.captured] : 0));

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        board.move(move);
        const score = -negamax(board, depth - 1, board.turn());
        board.undo();

        if (score > maxScore) {
            maxScore = score;
        }
    }
    return maxScore;
}

function findBestMove(board, depth) {
    const legalMoves = board.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    let bestMove = legalMoves[0];
    let maxScore = -Infinity;

    legalMoves.sort((a, b) => (b.captured ? PieceValues[b.captured] : 0) - (a.captured ? PieceValues[a.captured] : 0));

    for (let i = 0; i < legalMoves.length; i++) {
        const move = legalMoves[i];
        board.move(move);
        
        const score = -negamax(board, depth - 1, board.turn());
        board.undo();
        
        if (score > maxScore) {
            maxScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

function makeBotMove() {
    if (game.game_over()) return;

    let searchDepth;
    if (botLevel <= 3) {
        searchDepth = 1; 
    } else if (botLevel <= 6) {
        searchDepth = 2; 
    } else if (botLevel <= 9) {
        searchDepth = 3; 
    } else {
        searchDepth = 4; 
    }

    if (searchDepth === 1) {
        const moves = game.moves({ verbose: true });
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        
        if (randomMove) {
            setTimeout(() => {
                game.move(randomMove);
                renderBoard();
                checkGameState();
                updateTurnDisplay();
                updateClocks();
                addChatMessage(botName, "Tôi đã đi nước " + randomMove.san + ".");
            }, 500);
        }
        return;
    }

    addChatMessage(botName, "Tôi đang suy nghĩ...");
    
    setTimeout(() => {
        const bestMove = findBestMove(game, searchDepth);
        
        if (bestMove) {
            game.move(bestMove);
            renderBoard();
            checkGameState();
            updateTurnDisplay();
            addChatMessage(botName, "Tôi đã đi nước " + bestMove.san + ".");
            updateClocks();
        } else {
            addChatMessage(botName, "Tôi không còn nước đi nào hợp lệ. Game Over.");
        }
    }, 1000); 
}

// ===========================================
// TIMER LOGIC
// ===========================================

let whiteTime = 0;
let blackTime = 0;
let timeIncrement = 0;
let totalGameTime = 0;
let timerInterval = null;

function formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateClocks() {
    document.getElementById('white-time').textContent = formatTime(whiteTime);
    document.getElementById('black-time').textContent = formatTime(blackTime);
    document.getElementById('total-game-time').textContent = formatTime(totalGameTime);

    const whiteClockEl = document.getElementById('white-clock');
    const blackClockEl = document.getElementById('black-clock');
    
    whiteClockEl.classList.toggle('active', currentTurn === 'w');
    blackClockEl.classList.toggle('active', currentTurn === 'b');
    
    whiteClockEl.classList.toggle('low-time', whiteTime > 0 && whiteTime < 60);
    blackClockEl.classList.toggle('low-time', blackTime > 0 && blackTime < 60);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    // Nếu cả hai đều là 0, tức là vô hạn, không chạy timer
    if (whiteTime <= 0 && blackTime <= 0) return; 

    timerInterval = setInterval(() => {
        totalGameTime++;
        if (currentTurn === 'w') {
            whiteTime--;
            if (whiteTime <= 0) {
                clearInterval(timerInterval);
                alert("Hết giờ! Trắng thua.");
                checkGameState(); // Cập nhật trạng thái game khi hết giờ
            }
        } else {
            blackTime--;
            if (blackTime <= 0) {
                clearInterval(timerInterval);
                alert("Hết giờ! Đen thua.");
                checkGameState();
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

/**
 * Lấy ký tự Unicode của quân cờ.
 * Đảm bảo chỉ trả về ký tự cho một quân cờ.
 */
function getPieceChar(type, color) {
    const pieces = {
        w: { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
        b: { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
    };
    return pieces[color][type];
}


/**
 * Tạo bàn cờ và gán các sự kiện.
 */
function setupBoard() {
    chessboardEl.innerHTML = ''; // Xóa bàn cờ cũ
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

/**
 * Cập nhật hiển thị quân cờ trên bàn cờ.
 * KHẮC PHỤC LỖI: Đảm bảo chỉ chèn ký tự Unicode vào ô cờ.
 */
function renderBoard() {
    const board = game.board();
    const isFlipped = playerColor === 'b'; 
    
    chessboardEl.classList.toggle('board-flipped', isFlipped);

    document.querySelectorAll('.square').forEach(el => {
        const squareName = el.dataset.square;
        el.innerHTML = ''; // Rất quan trọng: Xóa nội dung cũ
        el.classList.remove('king-in-check', 'selected', 'highlight-move');
        
        // Tính toán vị trí trong mảng board từ tên ô cờ (a1 -> [7][0])
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
            document.querySelector(`.square[data-square="${kingSquare}"]`).classList.add('king-in-check');
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
    const turnColor = currentTurn === 'w' ? 'Trắng' : 'Đen';
    const turnClass = currentTurn === 'w' ? 'white-turn' : 'black-turn';
    
    currentTurnDisplay.innerHTML = `Lượt đi: <strong><span class="turn-color ${turnClass}">${turnColor}</span></strong>`;
}

function handleSquareClick(squareName) {
    if (game.turn() !== playerColor) {
        addChatMessage("Hệ thống", "Không phải lượt của bạn.");
        return;
    }
    
    const piece = game.get(squareName);
    
    if (selectedSquare === null) {
        if (piece && piece.color === playerColor) {
            selectedSquare = squareName;
            document.querySelector(`[data-square="${squareName}"]`).classList.add('selected');
            highlightMoves(squareName);
        }
    } 
    else {
        const move = {
            from: selectedSquare,
            to: squareName,
            promotion: 'q' 
        };

        const result = game.move(move);

        // Xóa highlight và trạng thái chọn
        document.querySelector(`[data-square="${selectedSquare}"]`)?.classList.remove('selected');
        document.querySelectorAll('.highlight-move').forEach(el => el.classList.remove('highlight-move'));
        
        if (result) {
            // Cộng thời gian cho người chơi nếu có increment
            if (whiteTime > 0) {
                whiteTime += timeIncrement;
            }
            
            selectedSquare = null;
            renderBoard();
            updateTurnDisplay();
            updateClocks();
            checkGameState();
            
            if (!game.game_over() && game.turn() !== playerColor) {
                // Thêm increment cho Bot (Đen)
                if (blackTime > 0) {
                    blackTime += timeIncrement;
                }
                makeBotMove();
            }
        } 
        else if (piece && piece.color === playerColor) {
            // Chuyển chọn quân
            selectedSquare = squareName;
            document.querySelector(`[data-square="${squareName}"]`).classList.add('selected');
            highlightMoves(squareName);
        }
        else {
            // Nước đi không hợp lệ
            selectedSquare = null;
            renderBoard(); 
            addChatMessage("Hệ thống", "Nước đi không hợp lệ.");
        }
    }
}

function highlightMoves(square) {
    document.querySelectorAll('.highlight-move').forEach(el => el.classList.remove('highlight-move'));
    
    const moves = game.moves({ square: square, verbose: true });
    
    moves.forEach(move => {
        document.querySelector(`[data-square="${move.to}"]`).classList.add('highlight-move');
    });
}

function checkGameState() {
    if (game.game_over()) {
        stopTimer();
        if (game.in_checkmate()) {
            const winner = game.turn() === 'w' ? 'Đen' : 'Trắng';
            addChatMessage("Hệ thống", `Chiếu hết! ${winner} thắng.`);
        } else {
            addChatMessage("Hệ thống", "Hòa!");
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
    const p = document.createElement('p');
    const senderSpan = document.createElement('span');
    
    senderSpan.textContent = sender + ": ";
    
    if (sender === botName) {
        senderSpan.classList.add('bot-message');
    }
    
    p.appendChild(senderSpan);
    p.appendChild(document.createTextNode(message));
    
    chatRoomEl.prepend(p); 
    // Cuộn về tin nhắn mới nhất (phía dưới)
    chatRoomEl.scrollTop = chatRoomEl.scrollHeight; 
}

sendButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message !== "") {
        addChatMessage("Bạn", message);
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

function simpleBotResponse(message) {
    message = message.toLowerCase();
    if (message.includes('thông minh') || message.includes('ngốc')) {
        return "Tôi biết ơn những phản hồi của bạn. Tôi vẫn đang học hỏi!";
    }
    if (message.includes('xin chào')) {
        return "Xin chào! Chúc bạn một trận đấu tốt.";
    }
    if (message.includes('thua')) {
        return "Tôi sẽ cố gắng hơn trong trận sau!";
    }
    return "Tôi xin lỗi, tôi chỉ tập trung vào ván cờ lúc này.";
}


// ===========================================
// MODAL & INITIALIZATION
// ===========================================

const modalOverlay = document.getElementById('modal-overlay');
const levelButtons = document.querySelectorAll('#level-selection .level-btn');
const startMatchBtn = document.getElementById('start-match-btn');
const botNameInput = document.getElementById('bot-name-new'); 
const timeControlSelect = document.getElementById('time-control-select');

// Ẩn/hiện modal
function toggleModal(show) {
    modalOverlay.classList.toggle('visible', show);
}

// Xử lý chọn cấp độ
levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        levelButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        botLevel = parseInt(btn.dataset.level);
    });
});

// Xử lý nút Chơi với BOT
document.querySelector('.play-btn[data-action="open-bot-selection"]').addEventListener('click', () => {
    toggleModal(true);
});

// Hàm thiết lập thời gian
function setTimeControl(value) {
    if (value === 'unlimited') {
        whiteTime = 0;
        blackTime = 0;
        timeIncrement = 0;
    } else {
        const parts = value.split('+');
        const minutes = parseInt(parts[0]);
        const increment = parseInt(parts[1] || '0');
        whiteTime = minutes * 60;
        blackTime = minutes * 60;
        timeIncrement = increment;
    }
}


// Xử lý nút BẮT ĐẦU TRẬN ĐẤU
startMatchBtn.addEventListener('click', () => {
    stopTimer();
    
    const activeLevelBtn = document.querySelector('#level-selection .level-btn.active');
    botLevel = activeLevelBtn ? parseInt(activeLevelBtn.dataset.level) : 6;
    
    const inputName = botNameInput.value.trim();
    botName = inputName !== "" ? inputName : `Bot Level ${botLevel}`;
    
    setTimeControl(timeControlSelect.value);
    
    game.reset();
    totalGameTime = 0;
    playerColor = 'w'; 
    
    showScreen('play');
    toggleModal(false);
    setupBoard();
    updateTurnDisplay();
    
    // Cập nhật thông tin trên Sidebar
    document.getElementById('bot-info-name').textContent = botName;
    document.getElementById('bot-level-display').textContent = `Level ${botLevel}`;
    document.getElementById('player-color-display').textContent = 'Trắng';
    document.getElementById('bot-color-display').textContent = 'Đen';
    
    startTimer();
    
    addChatMessage(botName, "Chào mừng, chúc bạn một trận đấu hay!");
});


// Xử lý nút Quay lại Trang Chủ
document.querySelectorAll('#play-screen .news-btn, #rules-screen .play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('home');
        stopTimer(); 
    });
});

// Xử lý nút Luật chơi
document.querySelector('.rules-btn[data-action="show-rules"]').addEventListener('click', () => {
    showScreen('rules');
});


/**
 * Hàm quản lý chuyển đổi màn hình
 */
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
showScreen('home');
setupBoard();
setTimeControl('unlimited'); 
updateClocks();
