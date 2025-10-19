// ===========================================
// SETUP CƠ BẢN
// ===========================================

const game = new Chess();
const chessboardEl = document.getElementById('chessboard');
const currentTurnDisplay = document.getElementById('current-turn-display');

let selectedSquare = null;
let currentTurn = 'w'; // 'w' cho Trắng, 'b' cho Đen
let playerColor = 'w'; // Người chơi là Trắng mặc định
let botLevel = 1;
let botName = "Bot Level 1";

// ===========================================
// LOGIC BOT AI (NEGAMAX CÓ NÂNG CẤP)
// ===========================================

const PieceValues = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
};

/**
 * Hàm đánh giá vị trí cờ vua đơn giản dựa trên giá trị quân cờ.
 * Một giá trị dương nghĩa là người chơi hiện tại đang có lợi thế.
 * @param {Chess} board - Đối tượng Chess.js
 * @param {string} color - Màu của người chơi đang được đánh giá ('w' hoặc 'b')
 * @returns {number} Điểm đánh giá
 */
function evaluatePosition(board, color) {
    let score = 0;
    
    // Tính tổng giá trị quân cờ
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

    // Nếu người chơi là Đen, đảo ngược điểm
    if (color === 'b') {
        score = -score;
    }
    
    return score;
}

/**
 * Thuật toán Negamax (đã được làm đơn giản hóa)
 * @param {Chess} board - Đối tượng Chess.js
 * @param {number} depth - Chiều sâu tìm kiếm còn lại
 * @param {string} turn - Màu của người chơi đang thực hiện nước đi
 * @returns {number} Điểm negamax tốt nhất
 */
function negamax(board, depth, turn) {
    if (depth === 0 || board.game_over()) {
        const evalScore = evaluatePosition(board, turn);
        // Negate score for Minimax when recursive call returns
        return (turn === game.turn() ? 1 : -1) * evalScore;
    }

    let maxScore = -Infinity;
    const moves = board.moves({ verbose: true });
    
    // Sắp xếp nước đi để cải thiện hiệu suất tìm kiếm (đơn giản)
    // Ưu tiên nước đi bắt quân
    moves.sort((a, b) => (b.captured ? PieceValues[b.captured] : 0) - (a.captured ? PieceValues[a.captured] : 0));

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        board.move(move);
        // Đệ quy, đảo dấu của kết quả
        const score = -negamax(board, depth - 1, board.turn());
        board.undo();

        if (score > maxScore) {
            maxScore = score;
        }
    }
    return maxScore;
}


/**
 * Tìm nước đi tốt nhất cho Bot bằng thuật toán Negamax
 * @param {Chess} board - Đối tượng Chess.js
 * @param {number} depth - Chiều sâu tìm kiếm
 * @returns {object | null} Nước đi tốt nhất
 */
function findBestMove(board, depth) {
    const legalMoves = board.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    let bestMove = legalMoves[0];
    let maxScore = -Infinity;

    // Sắp xếp nước đi để tìm kiếm tốt hơn
    legalMoves.sort((a, b) => (b.captured ? PieceValues[b.captured] : 0) - (a.captured ? PieceValues[a.captured] : 0));

    for (let i = 0; i < legalMoves.length; i++) {
        const move = legalMoves[i];
        board.move(move);
        
        // Gọi Negamax, đảo dấu vì đối thủ đang chơi
        const score = -negamax(board, depth - 1, board.turn());
        board.undo();
        
        if (score > maxScore) {
            maxScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}


/**
 * Logic Bot chơi.
 */
function makeBotMove() {
    if (game.game_over()) return;

    // QUY ĐỊNH CHIỀU SÂU TÌM KIẾM DỰA TRÊN LEVEL
    let searchDepth;
    if (botLevel <= 3) {
        searchDepth = 1; // Dễ, nước đi ngẫu nhiên hoặc chỉ nhìn 1 nước
    } else if (botLevel <= 6) {
        searchDepth = 2; // Trung bình, nhìn trước 2 nước
    } else if (botLevel <= 9) {
        searchDepth = 3; // Khó, nhìn trước 3 nước
    } else {
        searchDepth = 4; // CHUYÊN NGHIỆP: Bot Level 10 dùng Depth 4
    }

    // Nếu Depth quá thấp, có thể dùng nước đi ngẫu nhiên để tăng tốc
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
            }, 500); // Trì hoãn 0.5s cho cảm giác bot "suy nghĩ"
        }
        return;
    }

    // Bot "suy nghĩ"
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
    }, 1000); // Trì hoãn 1s để Bot "suy nghĩ"
}

// ===========================================
// TIMER LOGIC
// ===========================================

let whiteTime = 5 * 60; // 5 phút
let blackTime = 5 * 60;
let totalGameTime = 0;
let timerInterval = null;

function formatTime(seconds) {
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
    
    // Cảnh báo thời gian thấp
    whiteClockEl.classList.toggle('low-time', whiteTime < 60);
    blackClockEl.classList.toggle('low-time', blackTime < 60);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        totalGameTime++;
        if (currentTurn === 'w') {
            whiteTime--;
            if (whiteTime <= 0) {
                clearInterval(timerInterval);
                alert("Hết giờ! Trắng thua.");
                // Thêm logic kết thúc game
            }
        } else {
            blackTime--;
            if (blackTime <= 0) {
                clearInterval(timerInterval);
                alert("Hết giờ! Đen thua.");
                // Thêm logic kết thúc game
            }
        }
        updateClocks();
    }, 1000);
}

// ===========================================
// GAME & UI LOGIC
// ===========================================

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
 */
function renderBoard() {
    const board = game.board();
    const isFlipped = playerColor === 'b';
    
    chessboardEl.classList.toggle('board-flipped', isFlipped);

    document.querySelectorAll('.square').forEach(el => {
        const squareName = el.dataset.square;
        el.innerHTML = '';
        el.classList.remove('king-in-check', 'selected', 'highlight-move');
        
        const squareData = board[8 - parseInt(squareName[1])][squareName.charCodeAt(0) - 'a'.charCodeAt(0)];

        if (squareData) {
            const pieceChar = getPieceChar(squareData.type, squareData.color);
            const pieceEl = document.createElement('span');
            pieceEl.textContent = pieceChar;
            pieceEl.classList.add(squareData.color === 'w' ? 'piece-white' : 'piece-black');
            el.appendChild(pieceEl);
        }
    });
    
    // Highlight Vua bị chiếu
    if (game.in_check()) {
        const kingSquare = findKingSquare(game.turn());
        if (kingSquare) {
            document.querySelector(`.square[data-square="${kingSquare}"]`).classList.add('king-in-check');
        }
    }
}

/**
 * Tìm ô vua đang đứng
 */
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

/**
 * Lấy ký tự Unicode của quân cờ.
 */
function getPieceChar(type, color) {
    const pieces = {
        w: { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
        b: { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
    };
    return pieces[color][type];
}

/**
 * Cập nhật hiển thị lượt đi.
 */
function updateTurnDisplay() {
    currentTurn = game.turn();
    const turnColor = currentTurn === 'w' ? 'Trắng' : 'Đen';
    const turnClass = currentTurn === 'w' ? 'white-turn' : 'black-turn';
    
    currentTurnDisplay.innerHTML = `Lượt đi: <strong><span class="turn-color ${turnClass}">${turnColor}</span></strong>`;
}

/**
 * Xử lý click chuột vào ô cờ.
 */
function handleSquareClick(squareName) {
    // Không cho người chơi đi khi không phải lượt của họ
    if (game.turn() !== playerColor) {
        addChatMessage("Hệ thống", "Không phải lượt của bạn.");
        return;
    }
    
    const piece = game.get(squareName);
    
    // Nếu chưa chọn quân cờ
    if (selectedSquare === null) {
        if (piece && piece.color === playerColor) {
            // Chọn quân
            selectedSquare = squareName;
            document.querySelector(`[data-square="${squareName}"]`).classList.add('selected');
            highlightMoves(squareName);
        }
    } 
    // Nếu đã chọn quân cờ
    else {
        const move = {
            from: selectedSquare,
            to: squareName,
            promotion: 'q' // Mặc định phong cấp thành Hậu
        };

        const result = game.move(move);

        // Xóa highlight và trạng thái chọn
        document.querySelector(`[data-square="${selectedSquare}"]`).classList.remove('selected');
        document.querySelectorAll('.highlight-move').forEach(el => el.classList.remove('highlight-move'));
        
        // Nếu nước đi hợp lệ
        if (result) {
            selectedSquare = null;
            renderBoard();
            updateTurnDisplay();
            updateClocks();
            checkGameState();
            
            // Nếu vẫn chưa kết thúc, Bot đi
            if (!game.game_over() && game.turn() !== playerColor) {
                makeBotMove();
            }
        } 
        // Nếu click vào quân khác cùng màu
        else if (piece && piece.color === playerColor) {
            selectedSquare = squareName;
            document.querySelector(`[data-square="${squareName}"]`).classList.add('selected');
            highlightMoves(squareName);
        }
        // Nếu nước đi không hợp lệ và không phải chọn lại
        else {
            selectedSquare = null;
            renderBoard(); // Render lại để xóa mọi trạng thái highlight
            addChatMessage("Hệ thống", "Nước đi không hợp lệ.");
        }
    }
}

/**
 * Highlight các nước đi hợp lệ từ một ô.
 */
function highlightMoves(square) {
    // Xóa highlight cũ
    document.querySelectorAll('.highlight-move').forEach(el => el.classList.remove('highlight-move'));
    
    const moves = game.moves({ square: square, verbose: true });
    
    moves.forEach(move => {
        document.querySelector(`[data-square="${move.to}"]`).classList.add('highlight-move');
    });
}

/**
 * Kiểm tra trạng thái kết thúc game.
 */
function checkGameState() {
    if (game.in_checkmate()) {
        const winner = game.turn() === 'w' ? 'Đen' : 'Trắng';
        addChatMessage("Hệ thống", `Chiếu hết! ${winner} thắng.`);
        clearInterval(timerInterval);
    } else if (game.in_draw()) {
        addChatMessage("Hệ thống", "Hòa!");
        clearInterval(timerInterval);
    } else if (game.in_stalemate()) {
        addChatMessage("Hệ thống", "Hòa! (Hết nước đi)");
        clearInterval(timerInterval);
    } else if (game.in_threefold_repetition()) {
        addChatMessage("Hệ thống", "Hòa! (Lặp lại 3 lần)");
        clearInterval(timerInterval);
    } else if (game.insufficient_material()) {
        addChatMessage("Hệ thống", "Hòa! (Không đủ quân để chiếu hết)");
        clearInterval(timerInterval);
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
    
    chatRoomEl.prepend(p); // Thêm tin nhắn lên trên
    // Cuộn xuống cuối
    chatRoomEl.scrollTop = chatRoomEl.scrollHeight; 
}

sendButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message !== "") {
        addChatMessage("Bạn", message);
        chatInput.value = '';
        
        // Bot trả lời đơn giản (có thể cải tiến)
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
const colorButtons = document.querySelectorAll('#color-selection .color-btn');
const startMatchBtn = document.getElementById('start-match-btn');
const botNameInput = document.getElementById('bot-name');

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

// Xử lý chọn màu
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        colorButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playerColor = btn.dataset.color === 'Trắng' ? 'w' : 'b';
    });
});

// Xử lý nút Chơi với BOT
document.querySelector('.play-btn[data-action="open-bot-selection"]').addEventListener('click', () => {
    toggleModal(true);
});

// Xử lý nút BẮT ĐẦU TRẬN ĐẤU
startMatchBtn.addEventListener('click', () => {
    // Cập nhật tên Bot
    const inputName = botNameInput.value.trim();
    const activeLevel = document.querySelector('#level-selection .level-btn.active').textContent;
    botName = inputName !== "" ? inputName : `Bot ${activeLevel}`;
    
    // Đặt lại trạng thái game và thời gian
    game.reset();
    whiteTime = 5 * 60;
    blackTime = 5 * 60;
    totalGameTime = 0;

    // Chuyển màn hình và khởi tạo game
    showScreen('play');
    toggleModal(false);
    setupBoard();
    updateTurnDisplay();
    document.getElementById('bot-info-name').textContent = `${botName} (Cấp ${botLevel})`;
    
    // Bắt đầu Timer
    startTimer();
    
    // Nếu Bot đi trước (người chơi chọn Đen)
    if (playerColor === 'b') {
        makeBotMove();
    }
});


// Xử lý nút Quay lại Trang Chủ
document.querySelectorAll('#play-screen .news-btn, #rules-screen .play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('home');
        clearInterval(timerInterval); // Dừng timer khi quay lại Home
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
updateClocks();
