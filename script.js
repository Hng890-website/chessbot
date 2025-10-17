// script.js

// --- GLOBAL VARIABLES ---
let selectedBotLevel = 1;
let selectedBotColor = "Trắng"; // Mặc định là Trắng
let game = null; // Biến lưu trữ trạng thái game từ thư viện Chess.js
let selectedSquare = null; // Biến lưu trữ ô cờ đang được chọn
const SQUARE_SIZE = 60; // Kích thước mỗi ô cờ (phải khớp với CSS)

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
        // Xóa tin nhắn cũ
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

// --- 3. FUNCTION: CHESSBOARD INITIALIZATION & RENDERING (ĐÃ SỬA CHO ANIMATION) ---
function initializeChessboard() {
    const chessboard = document.getElementById('chessboard');
    if (!chessboard || !game) return; 
    
    const flipBoard = selectedBotColor === 'Đen'; 
    if (flipBoard) {
        chessboard.classList.add('board-flipped');
    } else {
        chessboard.classList.remove('board-flipped');
    }
    
    // TẠO CẤU TRÚC 64 Ô CỜ LẦN ĐẦU
    createBoardStructure();
    
    // ĐẶT QUÂN CỜ LẦN ĐẦU
    positionPieces(game.board().flat());
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
        const squareName = indexToSquare(i);
        
        square.dataset.square = squareName; 
        
        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }
        
        square.addEventListener('click', handleSquareClick);
        chessboard.appendChild(square);
    }
}

/**
 * Đặt quân cờ vào các ô tương ứng. Dùng cho render lần đầu và cập nhật sau khi animation kết thúc.
 */
function positionPieces(boardState) {
    const pieceSymbols = { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' };
    
    document.querySelectorAll('.square').forEach(squareElement => {
        const squareName = squareElement.dataset.square;
        const index = squareToIndex(squareName);
        const pieceData = boardState[index];
        
        // Xóa quân cờ cũ
        squareElement.innerHTML = ''; 

        if (pieceData) {
            const isWhite = pieceData.color === 'w';
            const pieceUnicode = pieceSymbols[pieceData.type.toLowerCase()];
            
            const pieceSpan = document.createElement('span');
            pieceSpan.textContent = pieceUnicode;
            pieceSpan.classList.add(isWhite ? 'piece-white' : 'piece-black');
            pieceSpan.dataset.piece = pieceData.color + pieceData.type; // Thêm data để dễ dàng nhận dạng
            
            squareElement.appendChild(pieceSpan);
        }
    });
}

/**
 * Hàm mới: Thực hiện animation di chuyển quân cờ.
 */
function animateMove(fromSquare, toSquare, move) {
    const fromElement = document.querySelector(`[data-square="${fromSquare}"]`);
    const toElement = document.querySelector(`[data-square="${toSquare}"]`);
    const pieceElement = fromElement.querySelector('span'); // Quân cờ sẽ di chuyển

    if (!pieceElement) return;

    // --- XỬ LÝ BẮT QUÂN (CAPTURE) ---
    // Loại bỏ quân cờ bị bắt ở ô đích ngay lập tức
    toElement.innerHTML = ''; 
    
    // --- BƯỚC 1: TÍNH TOÁN VÀ THỰC HIỆN DỊCH CHUYỂN TRONG CSS ---
    
    // Tính toán vị trí tương đối của quân cờ
    const fromIndex = squareToIndex(fromSquare);
    const toIndex = squareToIndex(toSquare);
    
    // Số ô dịch chuyển (hàng và cột)
    const fromRow = Math.floor(fromIndex / 8);
    const fromCol = fromIndex % 8;
    const toRow = Math.floor(toIndex / 8);
    const toCol = toIndex % 8;
    
    // Độ lệch (pixels)
    // Nếu bàn cờ không bị lật, tính toán đơn giản
    const isFlipped = document.getElementById('chessboard').classList.contains('board-flipped');
    
    let dx, dy;
    if (isFlipped) {
        // Tọa độ đã bị xoay 180 độ (dx và dy bị đảo dấu so với tính toán bình thường)
        dx = (fromCol - toCol) * SQUARE_SIZE;
        dy = (fromRow - toRow) * SQUARE_SIZE;
    } else {
        // Tọa độ bình thường
        dx = (toCol - fromCol) * SQUARE_SIZE;
        dy = (toRow - fromRow) * SQUARE_SIZE;
    }

    // 1.1. Di chuyển quân cờ ra khỏi ô cũ
    pieceElement.style.transform = `translate(${dx}px, ${dy}px)`;
    
    // Đặt z-index cao để quân cờ di chuyển nằm trên các quân cờ khác
    pieceElement.style.zIndex = 100; 

    // --- BƯỚC 2: CHỜ ANIMATION KẾT THÚC VÀ CẬP NHẬT TRẠNG THÁI CUỐI ---
    
    // Lắng nghe sự kiện CSS transition kết thúc (khoảng 300ms)
    pieceElement.addEventListener('transitionend', function handler() {
        
        // Xóa listener để tránh lặp lại
        pieceElement.removeEventListener('transitionend', handler);

        // 2.1. Cập nhật trạng thái game (CHUYỂN FEN)
        const moveResult = game.move(move);

        if (moveResult) {
            
            // 🚨 LOGIC MỚI: Ghi lại nước đi vào Chat/Log (Bao gồm O-O và O-O-O)
            const moveNotation = moveResult.san;
            const isWhite = moveResult.color === 'w';
            const player = isWhite ? 'Trắng' : 'Đen';
            const logMessage = `Nước đi của ${player}: ${moveNotation}`;
            addMessageToChat('System', logMessage); 
            
            // 2.2. Dọn dẹp và đặt lại vị trí
            fromElement.innerHTML = ''; // Xóa quân cờ khỏi ô cũ
            toElement.innerHTML = '';   // Xóa bất kỳ thứ gì có sẵn trong ô mới
            
            // Đặt lại quân cờ (từ trạng thái đã di chuyển) vào ô mới
            positionPieces(game.board().flat()); 

            // 2.3. Khởi động lượt đi tiếp theo
            checkGameStatus();
            if (game.turn() !== (selectedBotColor === 'Trắng' ? 'w' : 'b')) {
                setTimeout(makeBotMove, 500); 
            }
        }
        
    });
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
    // 1. TẠO NƯỚC ĐI TẠM THỜI (không thực hiện trên game object)
    // Lưu ý: promotion: 'q' là mặc định cho nước phong cấp, chess.js sẽ tự động xử lý.
    const tempMove = { from: fromSquare, to: toSquare, promotion: 'q' }; 
    
    // 2. KIỂM TRA TÍNH HỢP LỆ (Sử dụng clone game để kiểm tra)
    const testGame = new Chess(game.fen());
    const moveResult = testGame.move(tempMove);
    
    if (moveResult) {
        // Nước đi hợp lệ: THỰC HIỆN ANIMATION VÀ DI CHUYỂN THẬT
        // Lưu ý: animateMove sẽ tự động gọi game.move() sau khi animation hoàn tất.
        animateMove(fromSquare, toSquare, tempMove); 
        
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
            // Chọn ngẫu nhiên trong số nước đi bắt quân (nếu có)
            if (captureMoves.length > 0 && Math.random() < 0.6) { // 60% ưu tiên bắt quân
                move = captureMoves[Math.floor(Math.random() * captureMoves.length)];
            } else {
                move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        } else {
            // Level cao: Giả vờ ưu tiên nước đi chiếu tướng (check)
             const checkMoves = possibleMoves.filter(m => m.san.includes('+'));
            // Chọn ngẫu nhiên trong số nước đi chiếu tướng (nếu có)
            if (checkMoves.length > 0 && Math.random() < 0.75) { // 75% ưu tiên chiếu tướng
                move = checkMoves[Math.floor(Math.random() * checkMoves.length)];
            } else {
                move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        }
        
        // Thực hiện nước đi BOT bằng animation (giống người chơi)
        // move là một object verbose, nhưng animateMove chỉ cần from/to/promotion
        animateMove(move.from, move.to, move); 
        
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
        // Chèn tin nhắn mới trước vùng nhập liệu
        chatRoom.insertBefore(newMsg, inputArea);
    } else {
        chatRoom.appendChild(newMsg);
    }
    
    // Cuộn xuống cuối
    chatRoom.scrollTop = chatRoom.scrollHeight;
}

function botResponse(userMessage, botName, botLevel) {
    const delay = Math.random() * 1500 + 500; // Giảm độ trễ chat

    setTimeout(() => {
        let response = "";
        // Chuẩn hóa tiếng Việt để phân tích từ khóa (bỏ dấu)
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
        } else if (msgLower.includes("nuoc di hay")) {
            response = "Tôi luôn phân tích cẩn thận. Bạn có thấy nước đi vừa rồi là tối ưu không?";
        } else if (msgLower.includes("tai sao") || msgLower.includes("giai thich")) {
            response = "Rất tiếc, tôi không thể giải thích chi tiết nước đi của mình ngay lúc này. Hãy tập trung vào trận đấu nhé!";
        }

        // 2. PHẢN ỨNG DỰA TRÊN TRẠNG THÁI GAME (Nếu chưa có phản hồi)
        if (response === "") {
             if (game && game.in_check()) {
                 const turn = game.turn() === 'w' ? 'Trắng' : 'Đen';
                 response = `Ôi không! ${turn} đang bị chiếu! Đây là một khoảnh khắc gay cấn.`;
             } else if (game && game.history().length > 10) {
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
        // Đảm bảo không gắn nhiều sự kiện
        sendButton.onclick = null;
        sendButton.addEventListener('click', () => handleSendMessage(chatInput));
    }
    
    if (chatInput) {
        // Đảm bảo không gắn nhiều sự kiện
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
 * Dịch trang bằng cách đặt cookie và sau đó can thiệp để kích hoạt dịch thuật ngay lập tức,
 * tránh việc tải lại trang gây lỗi "Can't translate".
 * @param {string} targetLang Mã ngôn ngữ mục tiêu (ví dụ: 'en', 'es', 'vi').
 */
function translatePage(targetLang) {
    if (typeof google === 'undefined' || typeof google.translate === 'undefined') {
        alert("Thư viện Google Dịch chưa tải xong. Vui lòng thử lại.");
        return;
    }

    // 1. Đặt Cookie "googtrans"
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000));
    const expiryString = expiryDate.toUTCString();
    const cookieValue = `/vi/${targetLang}`; 
    document.cookie = `googtrans=${cookieValue}; expires=${expiryString}; path=/`;

    // 2. Xóa cookie nếu là Tiếng Việt
    if (targetLang === 'vi') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
    
    // 3. CAN THIỆP: BẮT GOOGLE DỊCH THỰC HIỆN NGAY LẬP TỨC hoặc tải lại
    try {
        if (targetLang === 'vi') {
             // Nếu là tiếng Việt (gốc), tải lại trang sau khi xóa cookie
             window.location.reload(); 
        } else {
             // Đối với các ngôn ngữ khác, cố gắng gọi API dịch mà không tải lại
             const langPair = 'vi|' + targetLang;
             const translator = google.translate.TranslateElement.get(document.getElementById('google_translate_element').id);
             
             if (translator) {
                 translator.translatePage(langPair);
             } else {
                 // Nếu không tìm thấy translator (do widget đã bị ẩn), fallback bằng cách tải lại
                 window.location.reload(); 
             }
        }
    } catch (e) {
        // Nếu có lỗi, fallback bằng cách tải lại
        console.error("Lỗi khi gọi API dịch thuật trực tiếp:", e);
        window.location.reload();
    }
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
