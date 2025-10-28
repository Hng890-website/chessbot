// ai-worker.js

// --- 1. Import chess.js thư viện
// Đã chuyển sang CDN ổn định hơn (cdnjs) để tránh lỗi NetworkError
importScripts('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.js');

// --- 2. Hằng số và PST (Giống như trong script.js)
const PieceValues = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
};

const PST = {
    p: [
        0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
        5,  5, 10, 25, 25, 10,  5,  5,
        0,  0,  0, 20, 20,  0,  0,  0,
        5, -5,-10,  0,  0,-10, -5,  5,
        5, 10, 10,-20,-20, 10, 10,  5,
        0,  0,  0,  0,  0,  0,  0,  0
    ].reverse(), 
    
    n: [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ].reverse(),

    b: [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ].reverse(),

    r: [
        0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
        -5, 0,  0,  0,  0,  0,  0, -5,
        -5, 0,  0,  0,  0,  0,  0, -5,
        -5, 0,  0,  0,  0,  0,  0, -5,
        -5, 0,  0,  0,  0,  0,  0, -5,
        -5, 0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0
    ].reverse(),

    q: [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
        -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ].reverse(),

    k: [ 
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
        20, 20,  0,  0,  0,  0, 20, 20,
        20, 30, 10,  0,  0, 10, 30, 20
    ].reverse()
};

// --- 3. Hàm Đánh giá và Tìm kiếm (Negamax) ---

function evaluatePosition(board, color) {
    let score = 0;
    
    board.board().forEach((row, rIndex) => {
        row.forEach((piece, cIndex) => {
            if (piece) {
                const pieceType = piece.type.toLowerCase();
                const materialValue = PieceValues[pieceType];
                const squareIndex = rIndex * 8 + cIndex;
                
                let pstValue = 0;
                if (PST[pieceType]) {
                    if (piece.color === 'w') {
                        pstValue = PST[pieceType][squareIndex];
                    } else {
                        pstValue = PST[pieceType][63 - squareIndex];
                    }
                }
                
                if (piece.color === 'w') {
                    score += materialValue + pstValue;
                } else {
                    score -= (materialValue + pstValue);
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
        return (turn === board.turn() ? 1 : -1) * evalScore; 
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
        
        if (move.promotion) {
            move.promotion = 'q';
        }
        
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

// --- 4. Logic Xử lý tin nhắn từ luồng chính ---

onmessage = function(e) {
    const { fen, depth, level } = e.data;
    const board = new Chess(fen); // Tạo instance Chess mới từ FEN

    let bestMove;
    
    // Xử lý nước đi ngẫu nhiên cho level thấp (Độ sâu 1)
    if (level <= 3) {
        const moves = board.moves({ verbose: true });
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        
        if (randomMove) {
             // Cần chuyển từ SAN sang đối tượng move để gửi về
             bestMove = board.move(randomMove, { verbose: true });
             board.undo(); 
        }
        
    } else {
        // Tính toán nặng nề cho các level cao hơn
        bestMove = findBestMove(board, depth);
    }
    
    // Gửi kết quả (nước đi) về luồng chính
    postMessage({ 
        bestMove: bestMove 
    });
};
