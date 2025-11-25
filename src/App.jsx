import React, { useState, useEffect } from 'react';
import './App.css';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [difficulty, setDifficulty] = useState('unbeatable');

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (currentBoard) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], pattern };
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', pattern: null };
    }
    return null;
  };

  const minimax = (currentBoard, depth, isMaximizing, alpha, beta) => {
    const result = checkWinner(currentBoard);
    
    if (result) {
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      return 0;
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false, alpha, beta);
          currentBoard[i] = null;
          maxScore = Math.max(score, maxScore);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break; // Alpha-Beta Pruning
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true, alpha, beta);
          currentBoard[i] = null;
          minScore = Math.min(score, minScore);
          beta = Math.min(beta, score);
          if (beta <= alpha) break; // Alpha-Beta Pruning
        }
      }
      return minScore;
    }
  };

  const getBestMove = (currentBoard) => {
    if (difficulty === 'easy') {
      const available = currentBoard.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null);
      return available[Math.floor(Math.random() * available.length)];
    }

    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false, -Infinity, Infinity);
        currentBoard[i] = null;
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const handleClick = (index) => {
    if (board[index] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      handleGameEnd(result);
      return;
    }

    setIsPlayerTurn(false);
  };

  const handleGameEnd = (result) => {
    setWinner(result.winner);
    setGameOver(true);
    
    if (result.winner === 'X') {
      setScores(prev => ({ ...prev, player: prev.player + 1 }));
    } else if (result.winner === 'O') {
      setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
    } else {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      setTimeout(() => {
        const newBoard = [...board];
        const aiMove = getBestMove(newBoard);
        newBoard[aiMove] = 'O';
        setBoard(newBoard);
        
        const result = checkWinner(newBoard);
        if (result) {
          handleGameEnd(result);
        } else {
          setIsPlayerTurn(true);
        }
      }, 500);
    }
  }, [isPlayerTurn, gameOver]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setGameOver(false);
  };

  const getWinningPattern = () => {
    if (!winner || winner === 'draw') return [];
    const result = checkWinner(board);
    return result ? result.pattern : [];
  };

  const winningPattern = getWinningPattern();

  return (
    <div className="app-container">
      <div className="game-card">
        <h1 className="title">Tic-Tac-Toe AI</h1>
        <p className="subtitle">Challenge the AI!</p>

        <div className="difficulty-selector">
          <button
            onClick={() => setDifficulty('easy')}
            className={`difficulty-btn ${difficulty === 'easy' ? 'active-easy' : ''}`}
          >
            Easy
          </button>
          <button
            onClick={() => setDifficulty('unbeatable')}
            className={`difficulty-btn ${difficulty === 'unbeatable' ? 'active-hard' : ''}`}
          >
            Unbeatable
          </button>
        </div>

        <div className="score-board">
          <div className="score-card player-score">
            <div className="score-number">{scores.player}</div>
            <div className="score-label">You</div>
          </div>
          <div className="score-card draw-score">
            <div className="score-number">{scores.draws}</div>
            <div className="score-label">Draws</div>
          </div>
          <div className="score-card ai-score">
            <div className="score-number">{scores.ai}</div>
            <div className="score-label">AI</div>
          </div>
        </div>

        <div className="game-board">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!isPlayerTurn || gameOver || cell !== null}
              className={`cell ${cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''} ${
                winningPattern.includes(index) ? 'winning-cell' : ''
              }`}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="status">
          {gameOver ? (
            <div className="status-message">
              {winner === 'draw' ? (
                <span className="draw-msg">It's a Draw! 🤝</span>
              ) : winner === 'X' ? (
                <span className="win-msg">You Win! 🎉</span>
              ) : (
                <span className="lose-msg">AI Wins! 🤖</span>
              )}
            </div>
          ) : (
            <div className="status-message">
              {isPlayerTurn ? "Your turn (X)" : "AI is thinking... 🤔"}
            </div>
          )}
        </div>

        <button onClick={resetGame} className="reset-btn">
          🔄 New Game
        </button>

        <div className="info-box">
          <p className="info-title">Algorithm: Minimax with Alpha-Beta Pruning</p>
          <p className="info-text">The AI evaluates all possible moves to find the optimal strategy, making it unbeatable!</p>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;