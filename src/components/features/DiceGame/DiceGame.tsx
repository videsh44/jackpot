'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './DiceGame.module.scss';

const STARTING_BALANCE = 1000;
const HOUSE_EDGE = 0.01;

function calcMultiplier(winChancePct: number): number {
  if (winChancePct <= 0) return 99;
  return Math.round(((1 - HOUSE_EDGE) / (winChancePct / 100)) * 100) / 100;
}

// Dice dot positions on a 3x3 grid [row, col]
const DICE_FACES: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

type RollMode = 'under' | 'over';

export function DiceGame() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [betAmount, setBetAmount] = useState(10);
  const [threshold, setThreshold] = useState(50);
  const [rollMode, setRollMode] = useState<RollMode>('under');
  const [result, setResult] = useState<number | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceFace, setDiceFace] = useState(4);
  const [history, setHistory] = useState<{ result: number; won: boolean; amount: number }[]>([]);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const winChance = rollMode === 'under' ? threshold : 100 - threshold;
  const multiplier = calcMultiplier(winChance);
  const profitOnWin = Math.round(betAmount * (multiplier - 1) * 100) / 100;

  const roll = useCallback(() => {
    if (balance < betAmount || isRolling) return;

    setBalance((prev) => Math.round((prev - betAmount) * 100) / 100);
    setIsRolling(true);
    setResult(null);
    setIsWin(null);

    // Animate dice faces rapidly
    animRef.current = setInterval(() => {
      setDiceFace(Math.floor(Math.random() * 6) + 1);
    }, 60);

    setTimeout(() => {
      if (animRef.current) clearInterval(animRef.current);

      const rollResult = Math.round(Math.random() * 10000) / 100;
      const won = rollMode === 'under' ? rollResult < threshold : rollResult > threshold;

      setResult(rollResult);
      setIsWin(won);
      setDiceFace(Math.floor(Math.random() * 6) + 1);
      setIsRolling(false);

      if (won) {
        const winAmount = Math.round(betAmount * multiplier * 100) / 100;
        setBalance((prev) => Math.round((prev + winAmount) * 100) / 100);
        setHistory((prev) => [{ result: rollResult, won: true, amount: Math.round((winAmount - betAmount) * 100) / 100 }, ...prev].slice(0, 10));
      } else {
        setHistory((prev) => [{ result: rollResult, won: false, amount: -betAmount }, ...prev].slice(0, 10));
      }
    }, 800);
  }, [balance, betAmount, isRolling, rollMode, threshold, multiplier]);

  const dots = DICE_FACES[diceFace] || DICE_FACES[4];

  return (
    <div className={styles.layout}>
      {/* Game Area */}
      <div className={styles.gameArea}>
        <div className={styles.glow} />
        <h2 className={styles.title}>NEON DICE</h2>

        {/* Die */}
        <div className={`${styles.dieWrap} ${isRolling ? styles.dieRolling : ''}`}>
          <div className={styles.dieGlow} />
          <div className={styles.die}>
            <div className={styles.dieOverlay} />
            <div className={styles.dotGrid}>
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => {
                  const hasDot = dots.some(([r, c]) => r === row && c === col);
                  return (
                    <div key={`${row}-${col}`} className={styles.dotCell}>
                      {hasDot && <div className={styles.dot} />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        <div className={styles.resultWrap}>
          <span className={`${styles.resultNum} ${isWin === true ? styles.winText : ''} ${isWin === false ? styles.loseText : ''}`}>
            {result !== null ? result.toFixed(2) : '--'}
          </span>
        </div>

        {/* Slider Panel */}
        <div className={styles.sliderPanel}>
          <div className={styles.sliderHeader}>
            <div>
              <span className={styles.statLabel}>Multiplier</span>
              <span className={styles.statPrimary}>{multiplier.toFixed(2)}x</span>
            </div>
            <div className={styles.statRight}>
              <span className={styles.statLabel}>Win Chance</span>
              <span className={styles.statGreen}>{winChance.toFixed(1)}%</span>
            </div>
          </div>

          <div className={styles.sliderTrack}>
            <div className={styles.sliderFill} style={{ width: `${rollMode === 'under' ? threshold : 100 - threshold}%` }} />
            <input
              type="range"
              min={2}
              max={98}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className={styles.sliderInput}
              disabled={isRolling}
            />
          </div>

          <div className={styles.sliderFooter}>
            <div className={styles.footerCell}>
              <span className={styles.footerLabel}>Roll {rollMode === 'under' ? 'Under' : 'Over'}</span>
              <span className={styles.footerValue}>{threshold.toFixed(2)}</span>
            </div>
            <button
              className={styles.swapBtn}
              onClick={() => setRollMode((m) => (m === 'under' ? 'over' : 'under'))}
              disabled={isRolling}
              type="button"
            >
              ⇄
            </button>
            <div className={styles.footerCellRight}>
              <span className={styles.footerLabel}>Profit on Win</span>
              <span className={styles.footerProfit}>+${profitOnWin.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.betSection}>
          <div className={styles.field}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Bet Amount</label>
              <span className={styles.balHint}>${balance.toLocaleString()} Bal</span>
            </div>
            <div className={styles.inputRow}>
              <input
                className={styles.betInput}
                type="number"
                value={betAmount}
                min={1}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={isRolling}
              />
              <div className={styles.quickBtns}>
                <button onClick={() => setBetAmount((b) => Math.max(1, Math.round(b / 2)))} disabled={isRolling} type="button">1/2</button>
                <button onClick={() => setBetAmount((b) => b * 2)} disabled={isRolling} type="button">2x</button>
              </div>
            </div>
          </div>

          <button
            className={styles.rollBtn}
            onClick={roll}
            disabled={balance < betAmount || isRolling}
            type="button"
          >
            {isRolling ? 'ROLLING...' : 'BET & ROLL'}
          </button>
        </div>

        {history.length > 0 && (
          <div className={styles.historySection}>
            <h3 className={styles.historyTitle}>Live History</h3>
            <div className={styles.historyList}>
              {history.map((h, i) => (
                <div key={i} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <span className={styles.historyDie}>🎲</span>
                    <span className={styles.historyRoll}>{h.result.toFixed(2)}</span>
                  </div>
                  <span className={h.won ? styles.historyWin : styles.historyLoss}>
                    {h.won ? '+' : ''}${h.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
