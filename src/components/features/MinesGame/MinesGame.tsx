'use client';

import { useState, useCallback } from 'react';
import styles from './MinesGame.module.scss';

type TileState = 'hidden' | 'gem' | 'mine';
type GameState = 'idle' | 'active' | 'won' | 'lost';

const GRID_SIZE = 25;
const MINE_OPTIONS = [3, 5, 10, 24];
const STARTING_BALANCE = 1000;

function placeMines(count: number): Set<number> {
  const mines = new Set<number>();
  while (mines.size < count) {
    mines.add(Math.floor(Math.random() * GRID_SIZE));
  }
  return mines;
}

function calcMultiplier(mineCount: number, revealed: number): number {
  if (revealed === 0) return 1;
  let mult = 1;
  for (let i = 0; i < revealed; i++) {
    mult *= (GRID_SIZE - i) / (GRID_SIZE - mineCount - i);
  }
  return Math.round(mult * 100) / 100;
}

export function MinesGame() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [betAmount, setBetAmount] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [tiles, setTiles] = useState<TileState[]>(Array(GRID_SIZE).fill('hidden'));
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(0);
  const [currentMult, setCurrentMult] = useState(1);

  const nextMult = calcMultiplier(mineCount, revealed + 1);
  const potentialWin = Math.round(betAmount * currentMult * 100) / 100;

  const startGame = useCallback(() => {
    if (balance < betAmount) return;
    const newMines = placeMines(mineCount);
    setMines(newMines);
    setTiles(Array(GRID_SIZE).fill('hidden'));
    setRevealed(0);
    setCurrentMult(1);
    setBalance((prev) => Math.round((prev - betAmount) * 100) / 100);
    setGameState('active');
  }, [balance, betAmount, mineCount]);

  const revealTile = useCallback((index: number) => {
    if (gameState !== 'active' || tiles[index] !== 'hidden') return;

    const newTiles = [...tiles];
    if (mines.has(index)) {
      // Hit a mine — game over
      newTiles[index] = 'mine';
      // Reveal all mines
      mines.forEach((m) => {
        newTiles[m] = 'mine';
      });
      setTiles(newTiles);
      setGameState('lost');
    } else {
      // Safe — gem
      newTiles[index] = 'gem';
      const newRevealed = revealed + 1;
      const newMult = calcMultiplier(mineCount, newRevealed);
      setTiles(newTiles);
      setRevealed(newRevealed);
      setCurrentMult(newMult);

      // Auto-win if all safe tiles revealed
      if (newRevealed >= GRID_SIZE - mineCount) {
        const winAmount = Math.round(betAmount * newMult * 100) / 100;
        setBalance((prev) => Math.round((prev + winAmount) * 100) / 100);
        setGameState('won');
      }
    }
  }, [gameState, tiles, mines, revealed, mineCount, betAmount]);

  const cashOut = useCallback(() => {
    if (gameState !== 'active' || revealed === 0) return;
    const winAmount = Math.round(betAmount * currentMult * 100) / 100;
    setBalance((prev) => Math.round((prev + winAmount) * 100) / 100);
    setGameState('won');
  }, [gameState, revealed, betAmount, currentMult]);

  const isActive = gameState === 'active';
  const isFinished = gameState === 'won' || gameState === 'lost';

  return (
    <div className={styles.layout}>
      {/* Center: Game Board */}
      <div className={styles.boardArea}>
        <div className={styles.boardHeader}>
          <div>
            <h2 className={styles.title}>Emerald Mines</h2>
            <p className={styles.subtitle}>Precision Tactics Required</p>
          </div>
          <div className={styles.multDisplay}>
            <span className={styles.multValue}>{currentMult.toFixed(2)}x</span>
            <span className={styles.multLabel}>Current Multiplier</span>
          </div>
        </div>

        <div className={styles.grid}>
          {tiles.map((tile, i) => (
            <button
              key={i}
              className={`${styles.tile} ${tile === 'gem' ? styles.gem : ''} ${tile === 'mine' ? styles.mine : ''}`}
              onClick={() => revealTile(i)}
              disabled={!isActive || tile !== 'hidden'}
              type="button"
            >
              {tile === 'gem' && <span className={styles.gemIcon}>◆</span>}
              {tile === 'mine' && <span className={styles.mineIcon}>✕</span>}
              {tile === 'hidden' && <span className={styles.hiddenDot} />}
            </button>
          ))}
        </div>

        {isFinished && (
          <div className={`${styles.resultBanner} ${gameState === 'won' ? styles.resultWon : styles.resultLost}`}>
            {gameState === 'won'
              ? `Cashed out at ${currentMult.toFixed(2)}x — +$${potentialWin.toLocaleString()}`
              : `Hit a mine! Lost $${betAmount}`}
          </div>
        )}
      </div>

      {/* Right: Betting Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.field}>
          <label className={styles.label}>Bet Amount</label>
          <div className={styles.inputGroup}>
            <span className={styles.prefix}>$</span>
            <input
              className={styles.input}
              type="number"
              value={betAmount}
              min={1}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={isActive}
            />
          </div>
          <div className={styles.quickButtons}>
            <button onClick={() => setBetAmount((b) => Math.max(1, Math.round(b / 2)))} disabled={isActive} type="button">1/2</button>
            <button onClick={() => setBetAmount((b) => b * 2)} disabled={isActive} type="button">2x</button>
            <button onClick={() => setBetAmount(balance)} disabled={isActive} type="button">Max</button>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.mineHeader}>
            <label className={styles.label}>Number of Mines</label>
            <span className={styles.mineValue}>{mineCount}</span>
          </div>
          <div className={styles.mineGrid}>
            {MINE_OPTIONS.map((n) => (
              <button
                key={n}
                className={`${styles.mineBtn} ${mineCount === n ? styles.mineActive : ''}`}
                onClick={() => setMineCount(n)}
                disabled={isActive}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          className={styles.actionButton}
          onClick={isActive ? cashOut : startGame}
          disabled={(gameState === 'idle' || isFinished) && balance < betAmount}
          type="button"
        >
          {isActive
            ? (revealed > 0 ? `Cash Out ($${potentialWin.toLocaleString()})` : 'Reveal a tile first')
            : 'Place Bet'}
        </button>

        <div className={styles.statsPanel}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Balance</span>
            <span className={styles.statGreen}>${balance.toLocaleString()}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Potential Win</span>
            <span className={styles.statHighlight}>${potentialWin.toLocaleString()}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Next Multiplier</span>
            <span className={styles.statNormal}>{nextMult.toFixed(2)}x</span>
          </div>
        </div>

        <div className={styles.fairness}>
          <span className={styles.fairnessIcon}>✓</span>
          <div>
            <span className={styles.fairnessTitle}>Provably Fair</span>
            <span className={styles.fairnessHash}>Demo mode — results are random</span>
          </div>
        </div>
      </div>
    </div>
  );
}
