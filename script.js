// script.js

// --- GLOBAL VARIABLES ---
let selectedBotLevel = 1;
let selectedBotColor = "Trắng"; // Mặc định là Trắng
let game = null; // Biến lưu trữ trạng thái game từ thư viện Chess.js
let selectedSquare = null; // Biến lưu trữ ô cờ đang được chọn
const SQUARE_SIZE = 60; // Kích thước mỗi ô cờ (phải khớp với CSS)

// --- TIMER VARIABLES ---
const INITIAL_TIME_SECONDS = 300; // 5 phút
let whiteTime = INITIAL_TIME_SECONDS;
let blackTime = INITIAL_TIME_SECONDS;
let timerInterval = null; // Đồng hồ đếm ngược của người chơi

let totalTimeSeconds = 0; 
let totalTimeInterval = null; // Đồng hồ tổng thời gian

// --- UTILITY FUNCTIONS ---

// Mảng chứa tất cả 64 tọa độ cờ vua từ 'a1' đến 'h8' (dùng để lặp)
const ALL_SQUARES = [
    'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
    'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
    'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
    'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
    'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
    'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
];

/**
 * Chuyển đổi chỉ mục mảng (0-63) thành tọa độ cờ vua (a1-h8).
 * @param {number} index Chỉ mục từ 0 đến 63.
 * @returns {string} Tọa độ cờ vua.
 */
function indexToSquare(index) {
    // Chỉ dùng trong trường hợp logic cần, nhưng ta đã có ALL_SQUARES
    const file = String.fromCharCode('a'.charCodeAt(0) + (index % 8));
    const rank = 8 - Math.floor(index / 8);
    return file + rank;
}

/**
 * Chuyển đổi tọa độ cờ vua (a1-h8) thành chỉ mục mảng (0-63).
 * @param {string} square Tọa độ cờ vua.
 * @returns {number} Chỉ mục mảng.
 */
function squareToIndex(square) {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(square[1]);
    return rank * 8 + file;
}

/**
 * Định dạng thời gian (giây) thành chuỗi MM:SS.
 * @param {number} seconds Tổng số giây.
 * @returns {string} Chuỗi thời gian đã định dạng.
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * TÌM VỊ TRÍ VUA CỦA MỘT MÀU QUÂN TRÊN BÀN CỜ
 * 🚨 PHƯƠNG PHÁP CHẮC CHẮN NHẤT
 * @param {string} color 'w' hoặc 'b'
 * @returns {string|null} Tọa độ ô cờ (ví dụ: 'e1') hoặc null nếu không tìm thấy.
 */
function findKingSquare(color) {
    if (!game) return null;
    
    // Lặp qua tất cả 64 ô cờ
    for (const square of ALL_SQUARES) {
        const piece = game.get(square); // Sử dụng game.get(square) để lấy quân cờ
        if (piece && piece.type === 'k' && piece.color === color) {
            return square;
        }
    }
    return null;
}

// --- TIMER LOGIC ---

/**
 * Cập nhật tổng thời gian chơi.
 */
function updateTotalTime() {
    totalTimeSeconds++;
    const totalTimeElement = document.getElementById('total-game-time');
    if (totalTimeElement) {
        totalTimeElement.textContent = formatTime(totalTimeSeconds);
    }
}

/**
 * Bắt đầu đồng hồ tổng thời gian.
 */
function startTotalTimer() {
    if (totalTimeInterval) clearInterval(totalTimeInterval);
    totalTimeSeconds = 0; // Reset tổng thời gian khi bắt đầu ván mới
    updateTotalTime(); // Hiển thị 00:00 ngay lập tức
    totalTimeInterval = setInterval(updateTotalTime, 1000);
}

/**
 * Dừng tất cả đồng hồ.
 */
function stopAllTimers() {
    stopTimer(); // Dừng đồng hồ đếm ngược của người chơi
    if (totalTimeInterval) clearInterval(totalTimeInterval); // Dừng đồng hồ tổng thời gian
    totalTimeInterval = null;
}

/**
 * Cập nhật hiển thị thời gian và kiểm tra cờ hết giờ.
 */
function updateTimer() {
    if (!game) return;
    
    const turn = game.turn();
    const activeTimeId = turn === 'w' ? 'white-time' : 'black-time';
    const activeClockId = turn === 'w' ? 'white-clock' : 'black-clock';
    
    if (turn === 'w') {
        whiteTime--;
        if (whiteTime < 0) {
            handleTimeout('w');
            return;
        }
    } else {
        blackTime--;
        if (blackTime < 0) {
            handleTimeout('b');
            return;
        }
    }

    const timeElement = document.getElementById(activeTimeId);
    if (timeElement) {
        timeElement.textContent = formatTime(turn === 'w' ? whiteTime : blackTime);
        
        const activeTime = turn === 'w' ? whiteTime : blackTime;
        const activeClock = document.getElementById(activeClockId);
        
        if (activeTime <= 10 && activeTime >= 0) {
            activeClock.classList.add('low-time');
        } else {
            activeClock.classList.remove('low-time');
        }
    }
}

/**
 * Bắt đầu đồng hồ cho lượt chơi hiện tại.
 */
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    if (!game || game.game_over()) return;

    timerInterval = setInterval(updateTimer, 1000);
    
    document.getElementById('white-clock').classList.remove('active');
    document.getElementById('black-clock').classList.remove('active');
    if (game.turn() === 'w') {
        document.getElementById('white-clock').classList.add('active');
    } else {
        document.getElementById('black-clock').classList.add('active');
    }
}

/**
 * Dừng đồng hồ đếm ngược.
 */
function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById('white-clock').classList.remove('active', 'low-time');
    document.getElementById('black-clock').classList.remove('active', 'low-time');
}

/**
 * Xử lý khi hết giờ.
 * @param {string} timedOutColor Màu quân cờ hết giờ ('w' hoặc 'b').
 */
function handleTimeout(timedOutColor) {
    stopAllTimers();
    const winnerColor = timedOutColor === 'w' ? 'Đen' : 'Trắng';
    addMessageToChat('Bot', `Game Over! ${timedOutColor === 'w' ? 'Trắng' : 'Đen'} hết giờ. ${winnerColor} thắng.`);
    game = null; 
}


/**
 * Cập nhật hiển thị lượt đi trên giao diện.
 */
function switchTurnDisplay(turn) {
    const turnDisplay = document.querySelector('#current-turn-display strong span');
    if (!turnDisplay) return;

    if (turn === 'w') {
        turnDisplay.textContent = 'Trắng';
        turnDisplay.className = 'turn-color white-turn';
    } else {
        turnDisplay.textContent = 'Đen';
        turnDisplay.className = 'turn-color black-turn';
    }
}


// --- 1. FUNCTION: SCREEN MANAGEMENT ---
function showScreen(screenName) {
    const screenId = screenName + '-screen'; 
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    if (screenName !== 'play') {
        stopAllTimers(); 
    }

    if (screenName === 'play') {
        attachChatHandlers();
    }
}

// --- 2. FUNCTION: MODAL MANAGEMENT ---
function openBotSelection() {
    document.getElementById('modal-overlay').classList.add('visible');
}

function closeBotSelection() {
    document.getElementById('modal-overlay').classList.remove('visible');
}

function initializeModalLogic() {
    // Logic chọn Level
    const levelSelection = document.getElementById('level-selection');
    if (levelSelection) {
        levelSelection.addEventListener('click', function(e) {
            if (e.target.classList.contains('level-btn')) {
                document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                selectedBotLevel = parseInt(e.target.dataset.level);
            }
        });
    }

    // Logic chọn Color
    const colorSelection = document.getElementById('color-selection');
    if (colorSelection) {
        colorSelection.addEventListener('click', function(e) {
            if (e.target.classList.contains('color-btn')) {
                document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                selectedBotColor = e.target.dataset.color;
            }
        });
    }
    
    // Thiết lập giá trị mặc định khi tải trang
    const defaultLevel = document.querySelector('.level-btn[data-level="1"]');
    if (defaultLevel) defaultLevel.classList.add('active');
    const defaultColor = document.querySelector('.color-btn[data-color="Trắng"]');
    if (defaultColor) defaultColor.classList.add('active');
}


function startBotMatch() {
    try {
        // 1. Khởi tạo lại game object
        game = new Chess(); 
        
        // 2. Đóng Modal
        closeBotSelection();
        
        // 3. Thiết lập thông tin trận đấu và Đồng hồ
        whiteTime = INITIAL_TIME_SECONDS;
        blackTime = INITIAL_TIME_SECONDS;
        document.getElementById('white-time').textContent = formatTime(whiteTime);
        document.getElementById('black-time').textContent = formatTime(blackTime);
        document.getElementById('white-clock').classList.remove('low-time');
        document.getElementById('black-clock').classList.remove('low-time');
        
        const botNameInput = document.getElementById('bot-name').value.trim();
        const botName = botNameInput || `Bot Level ${selectedBotLevel}`; 
        
        const userColor = selectedBotColor; 
        const userColorChar = userColor === "Trắng" ? "w" : "b";
        const botOppositeColor = selectedBotColor === "Trắng" ? "Đen" : "Trắng";
        
        document.querySelector('#play-screen .game-header h2').textContent = 
            `Bạn (${userColor}) vs ${botName} (Cấp độ ${selectedBotLevel}) (${botOppositeColor})`;

        // Xóa chat cũ và gửi tin nhắn chào mừng
        const chatRoom = document.querySelector('.chat-room');
        if (chatRoom) {
            Array.from(chatRoom.children).filter((child, index) => index > 0 && !child.classList.contains('chat-input-area')).forEach(p => p.remove());
        }
        addMessageToChat(botName, `Chào mừng ${userColor === 'Trắng' ? 'bạn, người chơi Trắng' : 'người chơi Đen'}. Tôi là ${botName}, chúc bạn một trận đấu hay!`);

        // 4. Hiển thị màn hình chơi và khởi tạo bàn cờ
        showScreen('play'); 
        initializeChessboard(); 
        
        // 5. Bắt đầu game và logic lượt đi
        switchTurnDisplay(game.turn());
        startTimer(); 
        startTotalTimer(); 

        // 6. Nếu người chơi chọn Đen (Bot là Trắng), Bot đi trước
        if (userColorChar !== game.turn()) {
            setTimeout(makeBotMove, 1000); 
        }
    } catch(error) {
        console.error("Lỗi khi bắt đầu trận đấu:", error);
        alert("Lỗi khi khởi tạo trận đấu cờ vua. Vui lòng kiểm tra Console (F12) để biết chi tiết.");
    }
}

// --- 3. FUNCTION: CHESSBOARD INITIALIZATION & RENDERING ---
function initializeChessboard() {
    const chessboard = document.getElementById('chessboard');
    if (!chessboard || !game) return; 
    
    const flipBoard = selectedBotColor === 'Đen'; 
    if (flipBoard) {
        chessboard.classList.add('board-flipped');
    } else {
        chessboard.classList.remove('board-flipped');
    }
    
    createBoardStructure();
    // Thay vì game.board().flat(), ta chỉ cần tạo cấu trúc, positionPieces sẽ dùng game.get
    positionPieces(); 
    checkGameStatus(); // Kiểm tra trạng thái ngay sau khi khởi tạo (dùng để highlight)
}

/**
 * Chỉ tạo cấu trúc 64 ô cờ rỗng.
 */
function createBoardStructure() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';
    
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        
        const row = Math.floor(i / 8);
        const col = i % 8;
        // Sử dụng mảng ALL_SQUARES để lấy tên ô cờ
        const squareName = ALL_SQUARES[i]; 
        
        square.dataset.square = squareName; 
        
        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }
        
        // Gắn lại event listener cho từng ô cờ
        square.removeEventListener('click', handleSquareClick); 
        square.addEventListener('click', handleSquareClick);
        chessboard.appendChild(square);
    }
}

/**
 * Đặt quân cờ vào các ô tương ứng.
 */
function positionPieces() {
    if (!game) return; 
    const pieceSymbols = { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' };
    
    // Lặp qua tất cả các ô cờ trên DOM
    document.querySelectorAll('.square').forEach(squareElement => {
        const squareName = squareElement.dataset.square;
        const pieceData = game.get(squareName); 
        
        // Xóa quân cờ cũ và hiệu ứng highlight/glow
        squareElement.innerHTML = ''; 
        squareElement.classList.remove('selected', 'highlight-move');

        if (pieceData) {
            const isWhite = pieceData.color === 'w';
            const pieceUnicode = pieceSymbols[pieceData.type.toLowerCase()];
            
            const pieceSpan = document.createElement('span');
            pieceSpan.textContent = pieceUnicode;
            pieceSpan.classList.add(isWhite ? 'piece-white' : 'piece-black');
            pieceSpan.dataset.piece = pieceData.color + pieceData.type; 
            
            squareElement.appendChild(pieceSpan);
        }
    });
    
    // Gọi hàm highlight sau khi đã đặt quân cờ mới
    highlightCheckState();
}

/**
 * Thực hiện animation di chuyển quân cờ.
 */
function animateMove(fromSquare, toSquare, move) {
    if (!game) return;
    
    const fromElement = document.querySelector(`[data-square="${fromSquare}"]`);
    const pieceElement = fromElement.querySelector('span');

    if (!pieceElement) return;

    stopTimer(); 
    
    // --- BƯỚC 1: TÍNH TOÁN VÀ THỰC HIỆN DỊCH CHUYỂN TRONG CSS ---
    
    const fromIndex = squareToIndex(fromSquare);
    const toIndex = squareToIndex(toSquare);
    const fromRow = Math.floor(fromIndex / 8);
    const fromCol = fromIndex % 8;
    const toRow = Math.floor(toIndex / 8);
    const toCol = toIndex % 8;

    const isFlipped = document.getElementById('chessboard').classList.contains('board-flipped');
    
    let dx, dy;
    if (isFlipped) {
        dx = (fromCol - toCol) * SQUARE_SIZE;
        dy = (fromRow - toRow) * SQUARE_SIZE;
    } else {
        dx = (toCol - fromCol) * SQUARE_SIZE;
        dy = (toRow - fromRow) * SQUARE_SIZE;
    }
    
    // Tạm thời ẩn quân cờ ở ô đích nếu có để animation không bị chồng
    const toElement = document.querySelector(`[data-square="${toSquare}"]`);
    if (toElement) toElement.innerHTML = ''; 
    
    pieceElement.style.transform = `translate(${dx}px, ${dy}px)`;
    pieceElement.style.zIndex = 100; 

    // --- BƯỚC 2: CHỜ ANIMATION KẾT THÚC VÀ CẬP NHẬT TRẠNG THÁI CUỐI ---
    
    pieceElement.addEventListener('transitionend', function handler() {
        
        pieceElement.removeEventListener('transitionend', handler);
        
        // Thực hiện nước đi thực tế
        const actualMove = game.move({ 
            from: move.from, 
            to: move.to, 
            promotion: move.promotion || 'q' 
        });

        if (actualMove) {
            
            const moveNotation = actualMove.san;
            const player = actualMove.color === 'w' ? 'Trắng' : 'Đen'; 
            addMessageToChat(player, `Nước đi: ${moveNotation}`); 
            
            // Cập nhật vị trí quân cờ trên bàn cờ
            positionPieces(); // Đã bỏ đối số flat array

            // Cập nhật lượt đi và kiểm tra trạng thái game
            checkGameStatus(); // Kiểm tra trạng thái của lượt đi mới

            if (!game.game_over()) {
                switchTurnDisplay(game.turn());
                startTimer(); 
            } else {
                stopAllTimers();
            }

            // Khởi động lượt đi Bot (nếu cần)
            const userColorChar = selectedBotColor === 'Trắng' ? 'w' : 'b';
            if (!game.game_over() && game.turn() !== userColorChar) {
                setTimeout(makeBotMove, 500); 
            }
        }
        
    });
}


// --- 4. FUNCTION: INTERACTION HANDLER (Xử lý Click) ---

function handleSquareClick(event) {
    if (!game || game.game_over()) return;

    const clickedSquare = event.currentTarget.dataset.square;
    const playerColorChar = selectedBotColor === 'Trắng' ? 'w' : 'b';
    const isPlayerTurn = game.turn() === playerColorChar;
    
    if (!isPlayerTurn) {
        return; 
    }

    // Xóa tất cả hiệu ứng highlight trước
    document.querySelectorAll('.square.highlight-move, .square.selected').forEach(sq => {
        sq.classList.remove('highlight-move', 'selected');
    });

    if (selectedSquare) {
        if (selectedSquare === clickedSquare) {
            // Hủy chọn
            selectedSquare = null;
            return;
        }

        // Lấy tất cả nước đi hợp lệ từ ô đang chọn
        const validMoves = game.moves({ square: selectedSquare, verbose: true });
        const targetMove = validMoves.find(m => m.to === clickedSquare);

        if (targetMove) {
            // Nước đi hợp lệ, thực hiện animation
            tryMove(selectedSquare, clickedSquare, targetMove);
            selectedSquare = null; 
        } else {
            // Nếu click vào ô không hợp lệ, thử chọn quân cờ mới
            const piece = game.get(clickedSquare);
            if (piece && piece.color === playerColorChar) {
                selectedSquare = clickedSquare;
                event.currentTarget.classList.add('selected');
                highlightValidMoves(selectedSquare);
            } else {
                selectedSquare = null;
            }
        }
        
    } else {
        const piece = game.get(clickedSquare);

        if (piece && piece.color === playerColorChar) {
            selectedSquare = clickedSquare;
            event.currentTarget.classList.add('selected');
            highlightValidMoves(selectedSquare);
        } else {
            selectedSquare = null;
        }
    }
}

function highlightValidMoves(square) {
    const validMoves = game.moves({ square: square, verbose: true });
    
    document.querySelector(`[data-square="${square}"]`).classList.add('selected');

    validMoves.forEach(move => {
        const targetSquareElement = document.querySelector(`[data-square="${move.to}"]`);
        if (targetSquareElement) {
            targetSquareElement.classList.add('highlight-move');
        }
    });
}

function tryMove(fromSquare, toSquare, move) {
    animateMove(fromSquare, toSquare, move); 
}


// --- 5. FUNCTION: GAME LOGIC & BOT (CÓ MÔ PHỎNG LEVEL) ---

function checkGameStatus() {
    if (!game) return;
    
    highlightCheckState(); // Luôn gọi hàm này để cập nhật trạng thái glow chính xác

    if (game.in_checkmate()) {
        stopAllTimers(); 
        const winner = game.turn() === 'w' ? 'Đen' : 'Trắng';
        addMessageToChat('Bot', `Game Over! ${winner} thắng bằng Chiếu hết.`);
    } else if (game.in_draw()) {
        stopAllTimers(); 
        addMessageToChat('Bot', `Game Over! Hòa cờ.`);
    } else if (game.in_check()) {
        addMessageToChat('Bot', `${game.turn() === 'w' ? 'Trắng' : 'Đen'} đang bị chiếu!`);
    }
}

/**
 * Hàm hỗ trợ để áp dụng/xóa hiệu ứng glow cho Vua bị chiếu
 */
function highlightCheckState() {
    // 1. Xóa tất cả các hiệu ứng cũ
    document.querySelectorAll('.square.king-in-check').forEach(sq => {
        sq.classList.remove('king-in-check');
    });

    // 2. Nếu game đang bị chiếu, tìm Vua của bên đang bị chiếu và thêm hiệu ứng
     if (game && game.in_check()) {
         // Lấy màu của bên đang bị chiếu (lượt đi hiện tại)
         const colorInCheck = game.turn(); 
         
         // Sử dụng hàm findKingSquare đã được sửa
         const checkedKingSquare = findKingSquare(colorInCheck); 
         
         if (checkedKingSquare) {
             const kingElement = document.querySelector(`[data-square="${checkedKingSquare}"]`);
             if (kingElement) {
                 kingElement.classList.add('king-in-check'); 
             }
         }
     }
}


function makeBotMove() {
    if (!game || game.game_over()) return;
    
    const possibleMoves = game.moves({ verbose: true });

    if (possibleMoves.length === 0) {
        checkGameStatus();
        return; 
    }
    
    // Tính toán độ trễ dựa trên cấp độ (từ 0.5s đến 3.5s)
    const maxDelay = 3500;
    const minDelay = 500;
    const delay = maxDelay - (selectedBotLevel - 1) * ((maxDelay - minDelay) / 9);

    setTimeout(() => {
        
        let move = null;
        
        // Mô phỏng AI
        if (selectedBotLevel <= 3) {
            move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else if (selectedBotLevel <= 7) {
            const captureMoves = possibleMoves.filter(m => m.captured);
            if (captureMoves.length > 0 && Math.random() < 0.6) { 
                move = captureMoves[Math.floor(Math.random() * captureMoves.length)];
            } else {
                move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        } else {
             const checkMoves = possibleMoves.filter(m => m.san.includes('+'));
            if (checkMoves.length > 0 && Math.random() < 0.75) { 
                move = checkMoves[Math.floor(Math.random() * checkMoves.length)];
            } else {
                move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        }
        
        if (move) {
            animateMove(move.from, move.to, move); 
        } else {
             // Trường hợp không tìm thấy nước đi (rất hiếm, nhưng đề phòng)
             checkGameStatus();
        }
        
    }, delay);
}


// --- 6. FUNCTION: CHAT BOT LOGIC ---

function addMessageToChat(sender, message) {
    const chatRoom = document.querySelector('.chat-room');
    if (!chatRoom) return;
    
    const newMsg = document.createElement('p');
    const senderColorClass = sender.toLowerCase().includes('bot') ? 'bot-message' : ''; 
    newMsg.innerHTML = `<strong class="${senderColorClass}">${sender}:</strong> ${message}`;
    
    const inputArea = chatRoom.querySelector('.chat-input-area');
    if (inputArea) {
        chatRoom.insertBefore(newMsg, inputArea);
    } else {
        chatRoom.appendChild(newMsg);
    }
    
    chatRoom.scrollTop = chatRoom.scrollHeight;
}

function botResponse(userMessage, botName, botLevel) {
    const delay = Math.random() * 1500 + 500; 

    setTimeout(() => {
        let response = "";
        const msgLower = userMessage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

        if (msgLower.includes("thua") || msgLower.includes("bo cuoc")) {
            response = "Bạn vẫn còn cơ hội! Nếu bạn đã hết hy vọng, tôi chấp nhận chiến thắng này. GG!";
        } else if (msgLower.includes("cam on") || msgLower.includes("good game") || msgLower.includes("gg")) {
            response = "Cảm ơn bạn! Tôi luôn cố gắng hết sức. Chúc bạn một ngày tốt lành.";
        } else if (msgLower.includes("cap do") || msgLower.includes("level")) {
            response = `Tôi đang chơi ở cấp độ ${botLevel}. Bạn thấy nước cờ của tôi thế nào?`;
        } else if (msgLower.includes("chao") || msgLower.includes("hello")) {
            response = "Chào bạn! Trận đấu thế nào rồi? Bạn có đang gặp khó khăn không?";
        } else if (msgLower.includes("nuoc di hay")) {
            response = "Tôi luôn phân tích cẩn thận. Bạn có thấy nước đi vừa rồi là tối ưu không?";
        } else if (msgLower.includes("tai sao") || msgLower.includes("giai thich")) {
            response = "Rất tiếc, tôi không thể giải thích chi tiết nước đi của mình ngay lúc này. Hãy tập trung vào trận đấu nhé!";
        }

        if (response === "") {
             if (game && game.in_check()) {
                 const turn = game.turn() === 'w' ? 'Trắng' : 'Đen';
                 response = `Ôi không! ${turn} đang bị chiếu! Đây là một khoảnh khắc gay cấn.`;
             } else if (game && game.history().length > 10) {
                 const opponentColor = selectedBotColor === 'Trắng' ? 'Đen' : 'Trắng';
                 response = `Ván cờ đang đi vào trung cuộc. ${opponentColor} có thể sẽ đối mặt với một đòn tấn công bất ngờ!`;
             } else {
                 const generalResponses = [
                    "Tôi đang phân tích bàn cờ, thật thú vị!",
                    "Bạn có vẻ đang tập trung cao độ. Nước đi tiếp theo của bạn là gì?",
                    "À há! Tôi đã tìm thấy một nước đi mạnh mẽ. Hãy xem xét cẩn thận nhé.",
                    "Tôi đã sẵn sàng cho nước đi tiếp theo của bạn. Đừng lo lắng về thời gian!",
                ];
                response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
             }
        }
        
        addMessageToChat(botName, response);
    }, delay);
}

function handleSendMessage(inputElement) {
    const message = inputElement.value.trim();
    if (message === "") return;

    addMessageToChat('Bạn', message); 
    inputElement.value = '';

    const headerText = document.querySelector('#play-screen .game-header h2').textContent;
    const botNameMatch = headerText.match(/vs (.*?) \(Cấp độ/); 
    const botName = botNameMatch ? botNameMatch[1].trim() : `Bot Cấp độ ${selectedBotLevel}`;
    
    botResponse(message, botName, selectedBotLevel);
}

function attachChatHandlers() {
    const sendButton = document.querySelector('#play-screen .chat-input-area .send-btn');
    const chatInput = document.querySelector('#play-screen .chat-input-area input');

    if (sendButton) {
        sendButton.removeEventListener('click', handleSendMessage);
        sendButton.addEventListener('click', () => handleSendMessage(chatInput));
    }
    
    if (chatInput) {
        chatInput.removeEventListener('keypress', handleEnterPress);
        chatInput.addEventListener('keypress', handleEnterPress);
    }
}

function handleEnterPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage(e.target);
    }
}


// --- 7. LANGUAGE TRANSLATION FUNCTION (Không đổi) ---
/**
 * Dịch trang bằng cách đặt cookie và sau đó can thiệp để kích hoạt dịch thuật ngay lập tức.
 * @param {string} targetLang Mã ngôn ngữ mục tiêu (ví dụ: 'en', 'es', 'vi').
 */
function translatePage(targetLang) {
    if (typeof google === 'undefined' || typeof google.translate === 'undefined') {
        alert("Thư viện Google Dịch chưa tải xong. Vui lòng thử lại.");
        return;
    }

    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000));
    const expiryString = expiryDate.toUTCString();
    const cookieValue = `/vi/${targetLang}`; 
    document.cookie = `googtrans=${cookieValue}; expires=${expiryString}; path=/`;

    if (targetLang === 'vi') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
    
    try {
        if (targetLang === 'vi') {
             window.location.reload(); 
        } else {
             const langPair = 'vi|' + targetLang;
             const translator = google.translate.TranslateElement.get(document.getElementById('google_translate_element').id);
             
             if (translator) {
                 translator.translatePage(langPair);
             } else {
                 window.location.reload(); 
             }
        }
    } catch (e) {
        console.error("Lỗi khi gọi API dịch thuật trực tiếp:", e);
        window.location.reload();
    }
}


// --- 8. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', (event) => {
    // Khởi tạo game và modal logic
    game = new Chess();
    initializeModalLogic(); 
    
    // Bắt đầu bằng màn hình Home
    showScreen('home');

    // Gắn Event Listener cho nút "Chơi với Bot" bằng data-action
    const playWithBotsBtn = document.querySelector('[data-action="open-bot-selection"]');
    if (playWithBotsBtn) {
        playWithBotsBtn.removeEventListener('click', openBotSelection); 
        playWithBotsBtn.addEventListener('click', openBotSelection);
    }
    
    // GẮN EVENT LISTENER cho nút START MATCH
    const startMatchBtn = document.getElementById('start-match-btn');
    if (startMatchBtn) {
        startMatchBtn.removeEventListener('click', startBotMatch); 
        startMatchBtn.addEventListener('click', startBotMatch);
    }
});
