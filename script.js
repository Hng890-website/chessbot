// ===========================================
// MOVE HISTORY LOGIC (ĐÃ SỬA ĐỂ HIỂN THỊ CẶP NƯỚC ĐI)
// ===========================================

const moveHistoryListEl = document.getElementById('move-history-list');

// Hàm tạo mô tả đơn giản
function createMoveDescription(move) {
    const pieceMap = {
        'p': 'quân tốt', 'n': 'quân mã', 'b': 'quân tượng', 
        'r': 'quân xe', 'q': 'quân hậu', 'k': 'quân vua'
    };
    const pieceName = pieceMap[move.piece] || 'quân cờ';
    const action = move.captured ? `bắt quân tại ${move.to}` : `đi lên ${move.to}`;
    const icon = move.captured ? '💥' : '⬆️';
    
    return {
        text: `${move.color === playerColor ? 'Bạn' : 'Bot'} đã đi ${pieceName} ${action}`,
        icon: icon
    };
}

/**
 * QUAN TRỌNG: Cập nhật hàm này để hiển thị lịch sử theo cặp cột (Trắng | Đen).
 */
function updateMoveHistory(newMove = null) {
    const history = game.history({ verbose: true });
    
    if (moveHistoryListEl) {
         moveHistoryListEl.innerHTML = '';
    }
   
    const noMovesMessageEl = document.querySelector('.no-moves-message');
    
    // Kiểm tra noMovesMessageEl trước khi truy cập style
    if (noMovesMessageEl) {
        noMovesMessageEl.style.display = history.length === 0 ? 'block' : 'none';
    }


    if (history.length === 0 || !moveHistoryListEl) return;

    let historyHTML = '';
    
    // Duyệt qua lịch sử theo từng cặp nước đi (Trắng và Đen)
    for (let i = 0; i < history.length; i += 2) {
        const whiteMove = history[i];
        const blackMove = history[i + 1];
        const moveNumber = Math.floor(i / 2) + 1;

        // Chuẩn hóa định dạng nước đi (SAN)
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
        
        // --- Xây dựng HTML cho cặp nước đi ---
        
        // 1. Cột Trắng (Người chơi)
        const whiteContent = whiteMove 
            ? `<div class="move-detail-col">
                <span class="move-white">${whiteMoveSAN}</span>
              </div>` 
            : '';

        // 2. Cột Đen (Bot)
        const blackContent = blackMove 
            ? `<div class="move-detail-col">
                <span class="move-black">${blackMoveSAN}</span>
              </div>` 
            : '';

        // 3. Tổng hợp hàng
        historyHTML += `
            <div class="move-item-row" data-move-num="${moveNumber}">
                <div class="move-number-col">
                    <span class="move-number">${moveNumber}.</span>
                </div>
                ${whiteContent}
                ${blackContent}
            </div>`;
    }

    // Chèn HTML đã tạo vào list (Hiển thị mới nhất ở trên cùng)
    moveHistoryListEl.innerHTML = historyHTML;
    
    // Cập nhật cấp độ bot trong bảng phân tích
    const botLevelAnalysisEl = document.getElementById('bot-level-analysis');
    if (botLevelAnalysisEl) {
        botLevelAnalysisEl.textContent = botLevel;
    }
    
    // Cuộn xuống cuối (có thể không cần thiết nếu dùng insertAdjacentHTML, 
    // nhưng để an toàn khi dùng innerHTML)
    moveHistoryListEl.scrollTop = moveHistoryListEl.scrollHeight;
    
    // CHÚ Ý: Bổ sung logic hiển thị mô tả chi tiết cho nước đi cuối cùng
    // (Lấy nước đi cuối cùng)
    const lastMove = history[history.length - 1];
    if (lastMove) {
        const lastMoveEl = moveHistoryListEl.querySelector(`.move-item-row[data-move-num="${Math.ceil(history.length / 2)}"]`);
        if (lastMoveEl) {
            const description = createMoveDescription(lastMove);
            const targetCol = lastMove.color === 'w' 
                ? lastMoveEl.querySelector('.move-detail-col:nth-child(2)') // Cột Trắng
                : lastMoveEl.querySelector('.move-detail-col:nth-child(3)'); // Cột Đen
            
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
