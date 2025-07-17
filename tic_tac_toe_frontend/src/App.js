import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Utility function to check winner and winning cells.
 * @param {Array} squares - flat 3x3 array.
 * @returns winner: 'X' | 'O' | null, winningCells: [indexes] | []
 */
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** This is a public function. */
  const lines = [
    [0, 1, 2], // Rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // Cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // Diagonals
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], winningCells: [a, b, c] };
    }
  }
  return { winner: null, winningCells: [] };
}

// PUBLIC_INTERFACE
function Square({ value, onClick, isWinning, disabled }) {
  /** This is a public component for a single square. */
  return (
    <button
      className={`ttt-square${isWinning ? " ttt-square-win" : ""}`}
      onClick={onClick}
      disabled={disabled || value !== null}
      tabIndex={value === null ? 0 : -1}
      aria-label={value ? `Occupied cell: ${value}` : "Empty cell"}
      type="button"
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onSquareClick, winningCells, gameOver }) {
  /** This is the main tic-tac-toe board component. */
  // Helper to render the 3x3 grid
  return (
    <div className="ttt-board">
      {[0, 1, 2].map((row) => (
        <div key={row} className="ttt-board-row">
          {[0, 1, 2].map((col) => {
            const idx = row * 3 + col;
            return (
              <Square
                key={idx}
                value={squares[idx]}
                isWinning={winningCells.includes(idx)}
                onClick={() => onSquareClick(idx)}
                disabled={gameOver}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function MoveHistory({ history, stepNumber, onJump }) {
  /** Move history with undo; highlights the current step. */
  return (
    <div className="ttt-history">
      <div className="ttt-history-title">History</div>
      <ol>
        {history.map((step, move) => (
          <li key={move}>
            <button
              type="button"
              className={`ttt-history-btn${
                move === stepNumber ? " ttt-history-btn-current" : ""
              }`}
              onClick={() => onJump(move)}
              disabled={move === stepNumber}
            >
              {move === 0 ? "Game start" : `Go to move #${move}`}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** The main tic-tac-toe minimalist PvP application. */

  // THEME
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const toggleTheme = () =>
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));

  // GAME STATE
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), move: null },
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  // Move calculation
  const current = history[stepNumber];
  const { winner, winningCells } = calculateWinner(current.squares);
  const draw =
    !winner && current.squares.every((sq) => sq !== null) ? true : false;

  // PUBLIC_INTERFACE
  const handleSquareClick = (idx) => {
    /** Handles user move. */
    if (winner || current.squares[idx]) return;
    const newSquares = current.squares.slice();
    newSquares[idx] = xIsNext ? "X" : "O";
    const newHistory = history.slice(0, stepNumber + 1);
    setHistory([...newHistory, { squares: newSquares, move: idx }]);
    setStepNumber(newHistory.length);
    setXIsNext((prev) => !prev);
  };

  // PUBLIC_INTERFACE
  const jumpTo = (move) => {
    /** Undo/jump to a specific move in history. */
    setStepNumber(move);
    setXIsNext(move % 2 === 0);
  };

  // PUBLIC_INTERFACE
  const handleRestart = () => {
    /** Resets the game. */
    setHistory([{ squares: Array(9).fill(null), move: null }]);
    setStepNumber(0);
    setXIsNext(true);
  };

  // Status bar
  let status;
  if (winner) {
    status = (
      <span>
        Winner:{" "}
        <span className="ttt-status-winner">{winner}</span>
      </span>
    );
  } else if (draw) {
    status = <span>Draw! 😮</span>;
  } else {
    status = (
      <span>
        Next:{" "}
        <span className="ttt-status-next">
          {xIsNext ? "X" : "O"}
        </span>
      </span>
    );
  }

  return (
    <div className="App">
      {/* Modern center layout */}
      <div className="ttt-container">
        <header className="ttt-header">
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <div className="ttt-status" aria-live="polite">
            {status}
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </header>
        <main className="ttt-main">
          <Board
            squares={current.squares}
            onSquareClick={handleSquareClick}
            winningCells={winningCells}
            gameOver={!!winner || draw}
          />
          <div className="ttt-controls">
            <button
              type="button"
              className="ttt-btn ttt-btn-accent"
              onClick={handleRestart}
              aria-label="Restart game"
            >
              Restart
            </button>
            <button
              type="button"
              className="ttt-btn"
              onClick={() => jumpTo(stepNumber - 1)}
              disabled={stepNumber === 0}
              aria-label="Undo"
            >
              Undo
            </button>
          </div>
          <MoveHistory
            history={history}
            stepNumber={stepNumber}
            onJump={jumpTo}
          />
        </main>
      </div>
      {/* End center layout */}
    </div>
  );
}

export default App;
