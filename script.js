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
// LOGIC BOT AI (NEGAMAX)
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
let isUnlimitedTime = false; 

/**
 * Hàm formatTime chỉ dùng để chuyển đổi sang MM:SS cho Total Time
 */
function formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

/**
 * Hàm updateClocks xử lý hiển thị "∞" riêng biệt cho đồng hồ cá nhân
 */
function updateClocks() {
    // Đồng hồ cá nhân: Hiển thị "∞" nếu là chế độ Vô hạn, ngược lại hiển thị thời gian
    document.getElementById('white-time').textContent = isUnlimitedTime ? "∞" : formatTime(whiteTime);
    document.getElementById('black-time').textContent = isUnlimitedTime ? "∞" : formatTime(blackTime);
    
    // TỔNG THỜI GIAN: LUÔN DÙNG formatTime để hiển thị MM:SS
    document.getElementById('total-game-time').textContent = formatTime(totalGameTime);

    const whiteClockEl = document.getElementById('white-clock');
    const blackClockEl = document.getElementById('black-clock');
    
    whiteClockEl.classList.toggle('active', currentTurn === 'w' && !isUnlimitedTime);
    blackClockEl.classList.toggle('active', currentTurn === 'b' && !isUnlimitedTime);
    
    // Chỉ kiểm tra thời gian thấp nếu không phải là chế độ Vô hạn
    const checkLowTime = !isUnlimitedTime && (whiteTime > 0 && whiteTime < 60);
    whiteClockEl.classList.toggle('low-time', checkLowTime);
    
    const checkLowTimeBlack = !isUnlimitedTime && (blackTime > 0 && blackTime < 60);
    blackClockEl.classList.toggle('low-time', checkLowTimeBlack);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    // Nếu là Vô hạn, vẫn chạy interval để cập nhật totalGameTime, nhưng không giảm thời gian
    if (isUnlimitedTime) {
        timerInterval = setInterval(() => {
            totalGameTime++;
            updateClocks();
        }, 1000);
        return;
    }
    
    if (whiteTime <= 0 && blackTime <= 0) return; 

    timerInterval = setInterval(() => {
        totalGameTime++;
        if (currentTurn === 'w') {
            whiteTime--;
            if (whiteTime <= 0) {
                clearInterval(timerInterval);
                alert("Hết giờ! Trắng thua.");
                checkGameState(); 
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

function getPieceChar(type, color) {
    const pieces = {
        w: { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
        b: { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
    };
    return pieces[color][type];
}

function setupBoard() {
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
    
    chessboardEl.classList.toggle('board-flipped', isFlipped);

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

        document.querySelector(`[data-square="${selectedSquare}"]`)?.classList.remove('selected');
        document.querySelectorAll('.highlight-move').forEach(el => el.classList.remove('highlight-move'));
        
        if (result) {
            if (whiteTime > 0) {
                whiteTime += timeIncrement;
            }
            
            selectedSquare = null;
            renderBoard();
            updateTurnDisplay();
            updateClocks();
            checkGameState();
            
            if (!game.game_over() && game.turn() !== playerColor) {
                if (blackTime > 0) {
                    blackTime += timeIncrement;
                }
                makeBotMove();
            }
        } 
        else if (piece && piece.color === playerColor) {
            selectedSquare = squareName;
            document.querySelector(`[data-square="${squareName}"]`).classList.add('selected');
            highlightMoves(squareName);
        }
        else {
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
const customTimeInputGroup = document.getElementById('custom-time-input-group');
const customTimeInput = document.getElementById('custom-time-input');


// Ẩn/hiện modal
function toggleModal(show) {
    modalOverlay.classList.toggle('visible', show);
}

// Xử lý sự kiện thay đổi của dropdown Kiểu thời gian
timeControlSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        customTimeInputGroup.classList.add('visible');
    } else {
        customTimeInputGroup.classList.remove('visible');
    }
});


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

/**
 * Thiết lập biến cờ isUnlimitedTime
 */
function setTimeControl(value) {
    let timeString = value;
    
    isUnlimitedTime = (value === 'unlimited'); // Đặt cờ Vô hạn

    if (isUnlimitedTime) {
        whiteTime = 0;
        blackTime = 0;
        timeIncrement = 0;
        return true;
    } 
    
    if (value === 'custom') {
        timeString = customTimeInput.value.trim();
        if (!timeString) {
             alert("Vui lòng nhập thời gian tùy chỉnh (ví dụ: 15+10) hoặc chọn một kiểu thời gian khác.");
             return false;
        }
    }
    
    // Phân tích cú pháp: Phút+Giây
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
        alert("Định dạng thời gian không hợp lệ. Vui lòng sử dụng định dạng PHÚT+GIÂY (ví dụ: 10+5).");
        return false;
    }

    whiteTime = minutes * 60;
    blackTime = minutes * 60;
    timeIncrement = increment;
    
    if (whiteTime === 0 && timeIncrement === 0) {
        alert("Thời gian không hợp lệ. Vui lòng nhập thời gian lớn hơn 0.");
        return false;
    }
    
    return true;
}


// Xử lý nút BẮT ĐẦU TRẬN ĐẤU
startMatchBtn.addEventListener('click', () => {
    stopTimer();
    
    const activeLevelBtn = document.querySelector('#level-selection .level-btn.active');
    botLevel = activeLevelBtn ? parseInt(activeLevelBtn.dataset.level) : 6;
    
    const inputName = botNameInput.value.trim();
    botName = inputName !== "" ? inputName : `Bot Level ${botLevel}`;
    
    // Kiểm tra và thiết lập thời gian
    const timeControlValue = timeControlSelect.value;
    if (!setTimeControl(timeControlValue)) {
        return; // Dừng nếu thiết lập thời gian không thành công
    }
    
    game.reset();
    totalGameTime = 0; // Đặt lại tổng thời gian khi bắt đầu
    playerColor = 'w'; 
    
    showScreen('play');
    toggleModal(false);
    setupBoard();
    updateTurnDisplay();
    
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


// ===========================================
// REAL-TIME CLOCK WIDGET LOGIC
// ===========================================

function updateCurrentTime() {
    const now = new Date();
    
    // Định dạng Giờ (12-hour format với AM/PM)
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Chuyển 0 thành 12

    const timeString = `Giờ: ${displayHour}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    
    // Định dạng Ngày (D/M/YYYY)
    const day = now.getDate();
    const month = now.getMonth() + 1; // getMonth() trả về 0-11
    const year = now.getFullYear();
    
    const dateString = `Ngày: ${day}/${month}/${year}`;

    // Cập nhật DOM
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
let xOffset = 0;
let yOffset = 0;

if (timeWidget && draggableHeader) {
    draggableHeader.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);
    
    // Hỗ trợ cảm ứng (touch)
    draggableHeader.addEventListener("touchstart", dragStart);
    document.addEventListener("touchend", dragEnd);
    document.addEventListener("touchmove", drag);
}

function dragStart(e) {
    if (e.target.closest('.close-widget-btn')) return; // Ngăn kéo khi click nút đóng
    
    // Lấy vị trí ban đầu (dùng e.touches[0] cho cảm ứng)
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    // Tính offset dựa trên vị trí con trỏ và vị trí hiện tại của widget
    const rect = timeWidget.getBoundingClientRect();
    initialX = clientX - rect.left;
    initialY = clientY - rect.top;

    // Reset transform khi bắt đầu kéo để sử dụng toạ độ tuyệt đối
    timeWidget.style.transform = 'none';
    timeWidget.style.right = 'auto'; 
    timeWidget.style.bottom = 'auto';

    isDragging = true;
    timeWidget.style.cursor = 'grabbing';
}

function dragEnd(e) {
    isDragging = false;
    timeWidget.style.cursor = 'grab';
    
    // Lưu vị trí cuối cùng vào left/top
    if (timeWidget.style.transform) {
        timeWidget.style.left = timeWidget.getBoundingClientRect().left + 'px';
        timeWidget.style.top = timeWidget.getBoundingClientRect().top + 'px';
        timeWidget.style.transform = 'none';
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        currentX = clientX - initialX;
        currentY = clientY - initialY;

        // Giới hạn kéo trong phạm vi màn hình
        const maxX = window.innerWidth - timeWidget.offsetWidth;
        const maxY = window.innerHeight - timeWidget.offsetHeight;

        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));


        timeWidget.style.left = currentX + 'px';
        timeWidget.style.top = currentY + 'px';
    }
}


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

// Kích hoạt đồng hồ thời gian thực
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
