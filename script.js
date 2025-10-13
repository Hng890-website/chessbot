// script.js

// --- GLOBAL VARIABLES ---
let selectedBotLevel = 1;
let selectedBotColor = "Trắng"; // Mặc định là Trắng
let game = null; // Biến lưu trữ trạng thái game từ thư viện Chess.js
let selectedSquare = null; // Biến lưu trữ ô cờ đang được chọn

// --- UTILITY FUNCTIONS ---

/**
 * Chuyển đổi chỉ mục mảng (0-63) thành tọa độ cờ vua (a1-h8).
 * @param {number} index Chỉ mục từ 0 đến 63.
 * @returns {string} Tọa độ cờ vua.
 */
function indexToSquare(index) {
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

    if (screenName === 'play') {
        const chessboard = document.getElementById('chessboard');
        if (chessboard) {
             chessboard.innerHTML = '';
             chessboard.classList.remove('board-flipped'); 
        }
        // Khởi tạo trạng thái game mới
        game = new Chess(); 
        initializeChessboard();
        attachChatHandlers();
    }
}

// --- 2. FUNCTION: MODAL MANAGEMENT (Xử lý Pop-up) ---
function openBotSelection() {
    document.getElementById('modal-overlay').classList.add('visible');
}

function closeBotSelection() {
    document.getElementById('modal-overlay').classList.remove('visible');
}

document.addEventListener('DOMContentLoaded', () => {
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
    
    // Đảm bảo Level 1 và Trắng luôn được chọn mặc định khi load trang
    const defaultLevel = document.querySelector('.level-btn[data-level="1"]');
    if (defaultLevel) defaultLevel.classList.add('active');
    const defaultColor = document.querySelector('.color-btn[data-color="Trắng"]');
    if (defaultColor) defaultColor.classList.add('active');
});


function startBotMatch() {
    const botNameInput = document.getElementById('bot-name').value.trim();
    const botName = botNameInput || `Bot Level ${selectedBotLevel}`; 
    
    closeBotSelection();
    showScreen('play');
    
    const userColor = selectedBotColor; 
    const botOppositeColor = selectedBotColor === "Trắng" ? "Đen" : "Trắng";
    
    document.querySelector('#play-screen .game-header h2').textContent = 
        `You (${userColor}) vs ${botName} (Level ${selectedBotLevel}) (${botOppositeColor})`;

    const chatRoom = document.querySelector('.chat-room');
    if (chatRoom) {
        chatRoom.querySelectorAll('p').forEach(p => {
             if (p.parentNode === chatRoom) p.remove();
        }); 
    }
    addMessageToChat(botName, `Chào mừng ${userColor === 'Trắng' ? 'bạn, người chơi Trắng' : 'người chơi Đen'}. Tôi là ${botName}, chúc bạn một trận đấu hay!`);

    // Nếu người chơi chọn Đen (Bot là Trắng), Bot đi trước
    if (userColor === 'Đen') {
        setTimeout(makeBotMove, 1000); 
    }
}

// --- 3. FUNCTION: CHESSBOARD INITIALIZATION & RENDERING ---
function initializeChessboard() {
    const chessboard = document.getElementById('chessboard');
    if (!chessboard || !game) return; 
    
    // Lật bàn cờ nếu người chơi là Quân Đen
    const flipBoard = selectedBotColor === 'Đen'; 
    if (flipBoard) {
        chessboard.classList.add('board-flipped');
    } else {
        chessboard.classList.remove('board-flipped');
    }

    renderBoard();
}

/**
 * Cập nhật giao diện bàn cờ dựa trên trạng thái hiện tại của game (FEN).
 */
function renderBoard() {
    const chessboard = document.getElementById('chessboard');
    if (!chessboard || !game) return;
    
    chessboard.innerHTML = ''; 

    const boardState = game.board().flat();

    // Map các ký tự Unicode
    const pieceSymbols = { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' };
    
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        
        const row = Math.floor(i / 8);
        const col = i % 8;
        const squareName = indexToSquare(i);
        
        square.dataset.square = squareName; 
        
        // Xác định màu ô cờ
        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }
        
        const pieceData = boardState[i];
        if (pieceData) {
            const isWhite = pieceData.color === 'w';
            
            // Lấy ký tự Unicode (Dùng ký tự Trắng cho cả hai màu, sau đó tô màu bằng CSS)
            const pieceUnicode = pieceSymbols[pieceData.type.toLowerCase()];
            
            square.innerHTML = `<span class="${isWhite ? 'piece-white' : 'piece-black'}">${pieceUnicode}</span>`;
        }

        // Gắn trình xử lý sự kiện tương tác
        square.addEventListener('click', handleSquareClick);
        
        chessboard.appendChild(square);
    }
}

// --- 4. FUNCTION: INTERACTION HANDLER (Xử lý Click) ---
function handleSquareClick(event) {
    const clickedSquare = event.currentTarget.dataset.square;
    const playerColorChar = selectedBotColor === 'Trắng' ? 'w' : 'b';
    const isPlayerTurn = game.turn() === playerColorChar;
    
    if (!isPlayerTurn) {
        console.log("Không phải lượt của bạn.");
        return; 
    }

    // Xóa tất cả đánh dấu ô cờ trước đó
    document.querySelectorAll('.square.highlight-move, .square.selected').forEach(sq => {
        sq.classList.remove('highlight-move', 'selected');
    });

    if (selectedSquare) {
        // CASE 2: Đã chọn một quân cờ trước đó
        
        // a) Nếu nhấp lại vào ô cũ: Bỏ chọn
        if (selectedSquare === clickedSquare) {
            selectedSquare = null;
            return;
        }

        // b) Thử di chuyển
        tryMove(selectedSquare, clickedSquare);
        selectedSquare = null; // Luôn xóa selectedSquare sau khi thử di chuyển
        
    } else {
        // CASE 1: Chưa chọn quân cờ
        
        // Chỉ cho phép chọn quân cờ của người chơi
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

function tryMove(fromSquare, toSquare) {
    // Thử tạo nước đi (luôn phong cấp thành Hậu nếu có thể)
    const move = game.move({ from: fromSquare, to: toSquare, promotion: 'q' });

    if (move) {
        // Nước đi hợp lệ: Cập nhật giao diện và chuyển sang lượt Bot
        renderBoard();
        
        checkGameStatus();

        if (game.turn() !== (selectedBotColor === 'Trắng' ? 'w' : 'b')) {
            setTimeout(makeBotMove, 500); // Kích hoạt Bot sau 0.5 giây
        }
    } else {
        console.log("Nước đi không hợp lệ.");
    }
}

// --- 5. FUNCTION: GAME LOGIC & BOT (CÓ MÔ PHỎNG LEVEL) ---

function checkGameStatus() {
    if (game.in_checkmate()) {
        const winner = game.turn() === 'w' ? 'Đen' : 'Trắng';
        addMessageToChat('System', `Game Over! ${winner} thắng bằng Chiếu hết.`);
    } else if (game.in_draw()) {
        addMessageToChat('System', `Game Over! Hòa cờ.`);
    } else if (game.in_check()) {
        addMessageToChat('System', `${game.turn() === 'w' ? 'Trắng' : 'Đen'} đang bị chiếu!`);
    }
}

function makeBotMove() {
    const possibleMoves = game.moves({ verbose: true });

    if (possibleMoves.length === 0) {
        checkGameStatus();
        return; 
    }
    
    // 1. Dựa vào Level để xác định độ trễ của Bot (Mô phỏng thời gian suy nghĩ)
    // Level 1: 3000ms, Level 10: 500ms
    const maxDelay = 3500;
    const minDelay = 500;
    const delay = maxDelay - (selectedBotLevel - 1) * ((maxDelay - minDelay) / 9);

    setTimeout(() => {
        
        let move = null;
        
        if (selectedBotLevel <= 3) {
            // Level thấp: Chọn ngẫu nhiên hoàn toàn
            move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else if (selectedBotLevel <= 7) {
            // Level trung bình: Giả vờ ưu tiên nước đi bắt quân (capture)
            const captureMoves = possibleMoves.filter(m => m.captured);
            if (captureMoves.length > 0 && Math.random() < 0.6) { // 60% ưu tiên bắt quân
                move = captureMoves[Math.floor(Math.random() * captureMoves.length)];
            } else {
                move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        } else {
            // Level cao: Giả vờ ưu tiên nước đi chiếu tướng (check)
             const checkMoves = possibleMoves.filter(m => m.san.includes('+'));
            if (checkMoves.length > 0 && Math.random() < 0.75) { // 75% ưu tiên chiếu tướng
                move = checkMoves[Math.floor(Math.random() * checkMoves.length)];
            } else {
                move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        }
        
        // Thực hiện nước đi
        game.move(move);
        renderBoard();
        
        const botColor = selectedBotColor === 'Trắng' ? 'Đen' : 'Trắng';
        addMessageToChat('System', `Bot (${botColor}, Lvl ${selectedBotLevel}) di chuyển: ${move.from}${move.to}`);
        checkGameStatus();
        
    }, delay);
}


// --- 6. FUNCTION: CHAT BOT LOGIC (MỞ RỘNG) ---

function addMessageToChat(sender, message) {
    const chatRoom = document.querySelector('.chat-room');
    if (!chatRoom) return;
    
    const newMsg = document.createElement('p');
    newMsg.innerHTML = `<strong>${sender}:</strong> ${message}`;
    const inputArea = chatRoom.querySelector('.chat-input-area');
    if (inputArea) {
        chatRoom.insertBefore(newMsg, inputArea);
    } else {
        chatRoom.appendChild(newMsg);
    }
    
    chatRoom.scrollTop = chatRoom.scrollHeight;
}

function botResponse(userMessage, botName, botLevel) {
    const delay = Math.random() * 1500 + 500; // Giảm độ trễ chat

    setTimeout(() => {
        let response = "";
        // Chuẩn hóa tiếng Việt để phân tích từ khóa
        const msgLower = userMessage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

        // 1. PHÂN TÍCH TỪ KHÓA CHÍNH
        if (msgLower.includes("thua") || msgLower.includes("bo cuoc")) {
            response = "Bạn vẫn còn cơ hội! Nếu bạn đã hết hy vọng, tôi chấp nhận chiến thắng này. GG!";
        } else if (msgLower.includes("cam on") || msgLower.includes("good game") || msgLower.includes("gg")) {
            response = "Cảm ơn bạn! Tôi luôn cố gắng hết sức. Chúc bạn một ngày tốt lành.";
        } else if (msgLower.includes("cap do") || msgLower.includes("level")) {
            response = `Tôi đang chơi ở cấp độ ${botLevel}. Bạn thấy nước cờ của tôi thế nào?`;
        } else if (msgLower.includes("chao") || msgLower.includes("hello")) {
            response = "Chào bạn! Trận đấu thế nào rồi? Bạn có đang gặp khó khăn không?";
        } else if (msgLower.includes("ban co the") || msgLower.includes("bot co the")) {
             response = "Tôi có thể tính toán hàng triệu nước đi, nhưng hiện tại, tôi chỉ tập trung vào ván cờ này thôi.";
        } else if (msgLower.includes("nuoc di hay")) {
            response = "Tôi luôn phân tích cẩn thận. Bạn có thấy nước đi vừa rồi là tối ưu không?";
        } else if (msgLower.includes("tai sao") || msgLower.includes("giai thich")) {
            response = "Rất tiếc, tôi không thể giải thích chi tiết nước đi của mình ngay lúc này. Hãy tập trung vào trận đấu nhé!";
        }

        // 2. PHẢN ỨNG DỰA TRÊN TRẠNG THÁI GAME (Nếu chưa có phản hồi)
        if (response === "") {
             if (game.in_check()) {
                 const turn = game.turn() === 'w' ? 'Trắng' : 'Đen';
                 response = `Ôi không! ${turn} đang bị chiếu! Đây là một khoảnh khắc gay cấn.`;
             } else if (game.history().length > 10) {
                 const opponentColor = selectedBotColor === 'Trắng' ? 'Đen' : 'Trắng';
                 response = `Ván cờ đang đi vào trung cuộc. ${opponentColor} có thể sẽ đối mặt với một đòn tấn công bất ngờ!`;
             } else {
                 // Phản hồi chung (Ngẫu nhiên)
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

    addMessageToChat('You', message);
    inputElement.value = '';

    const headerText = document.querySelector('#play-screen .game-header h2').textContent;
    const botNameMatch = headerText.match(/vs (.*?) \(Level/);
    const botName = botNameMatch ? botNameMatch[1].trim() : `Bot Level ${selectedBotLevel}`;
    
    botResponse(message, botName, selectedBotLevel);
}

function attachChatHandlers() {
    const sendButton = document.querySelector('#play-screen .chat-input-area .send-btn');
    const chatInput = document.querySelector('#play-screen .chat-input-area input');

    if (sendButton) {
        sendButton.onclick = null;
        sendButton.addEventListener('click', () => handleSendMessage(chatInput));
    }
    
    if (chatInput) {
        chatInput.onkeypress = null;
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage(chatInput);
            }
        });
    }
}

// --- 7. LANGUAGE TRANSLATION FUNCTION ---
/**
 * Chuyển hướng người dùng đến Google Dịch để dịch trang hiện tại.
 * @param {string} targetLang Mã ngôn ngữ mục tiêu (ví dụ: 'en', 'es', 'vi').
 */
function translatePage(targetLang) {
    // Lấy URL trang web hiện tại
    const currentUrl = encodeURIComponent(window.location.href);
    
    // Xây dựng URL của Google Dịch
    // 'auto' là ngôn ngữ nguồn tự động nhận diện
    // 'targetLang' là ngôn ngữ muốn dịch sang
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${targetLang}&u=${currentUrl}`;
    
    // Tải lại trang và chuyển hướng
    window.location.href = translateUrl;
}


// --- 8. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', (event) => {
    showScreen('home');

    const playWithBotsBtn = document.querySelector('.battle-actions button:nth-child(2)');
    if (playWithBotsBtn) {
        playWithBotsBtn.addEventListener('click', openBotSelection);
    }
    
    const doneButton = document.querySelector('#add-news-screen .action-btn');
    if (doneButton) {
        doneButton.addEventListener('click', () => showScreen('home'));
    }
});