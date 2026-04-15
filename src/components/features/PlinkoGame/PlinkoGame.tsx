'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PLINKO_CONFIG, ROW_OPTIONS, MULTIPLIERS, type RiskLevel } from './plinko.constants';
import styles from './PlinkoGame.module.scss';

export function PlinkoGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [balance, setBalance] = useState(PLINKO_CONFIG.startingBalance);
  const [betAmount, setBetAmount] = useState(PLINKO_CONFIG.defaultBet);
  const [risk, setRisk] = useState<RiskLevel>(PLINKO_CONFIG.defaultRisk);
  const [rows, setRows] = useState(PLINKO_CONFIG.defaultRows);
  const [lastWin, setLastWin] = useState<{ mult: number; amount: number } | null>(null);
  const [history, setHistory] = useState<{ mult: number; isHigh: boolean }[]>([]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const initGame = async () => {
      const Phaser = await import('phaser');
      const { PlinkoScene } = await import('./PlinkoScene');

      if (!containerRef.current) return;

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: PLINKO_CONFIG.width,
        height: PLINKO_CONFIG.height,
        backgroundColor: PLINKO_CONFIG.bgColor,
        physics: {
          default: 'matter',
          matter: {
            gravity: { x: 0, y: PLINKO_CONFIG.gravity },
            debug: false,
          },
        },
        scene: [PlinkoScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        },
      });

      gameRef.current = game;

      game.events.on('ready', () => {
        const scene = game.scene.getScene('PlinkoScene');
        if (scene) {
          scene.events.on('score', (data: { multiplier: number; bucketIndex: number }) => {
            const winAmount = Math.round(betAmount * data.multiplier * 100) / 100;
            setBalance((prev) => Math.round((prev + winAmount) * 100) / 100);
            setLastWin({ mult: data.multiplier, amount: winAmount });
            setHistory((prev) => [{ mult: data.multiplier, isHigh: data.multiplier >= 5 }, ...prev].slice(0, 15));
          });
        }
      });
    };

    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update scene when risk/rows change
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    const scene = game.scene.getScene('PlinkoScene') as { setConfig?: (rows: number, risk: RiskLevel) => void } | null;
    if (scene?.setConfig) {
      scene.setConfig(rows, risk);
    }
  }, [rows, risk]);

  const handleDrop = useCallback(() => {
    if (balance < betAmount) return;
    const game = gameRef.current;
    if (!game) return;
    const scene = game.scene.getScene('PlinkoScene') as { dropBall?: () => void } | null;
    if (scene?.dropBall) {
      setBalance((prev) => Math.round((prev - betAmount) * 100) / 100);
      scene.dropBall();
    }
  }, [balance, betAmount]);

  const multipliers = MULTIPLIERS[risk];

  return (
    <div className={styles.layout}>
      {/* Left Bet Panel */}
      <div className={styles.panel}>
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
            />
          </div>
          <div className={styles.quickButtons}>
            <button onClick={() => setBetAmount((b) => Math.max(1, Math.round(b / 2 * 100) / 100))} type="button">1/2</button>
            <button onClick={() => setBetAmount((b) => Math.round(b * 2 * 100) / 100)} type="button">x2</button>
            <button onClick={() => setBetAmount(balance)} type="button">MAX</button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Risk Level</label>
          <div className={styles.riskToggle}>
            {(['low', 'medium', 'high'] as RiskLevel[]).map((r) => (
              <button
                key={r}
                className={`${styles.riskBtn} ${risk === r ? styles.riskActive : ''}`}
                onClick={() => setRisk(r)}
                type="button"
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Rows</label>
          <select
            className={styles.select}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          >
            {ROW_OPTIONS.map((r) => (
              <option key={r} value={r}>{r} Rows</option>
            ))}
          </select>
        </div>

        <div className={styles.panelFooter}>
          <button
            className={styles.dropButton}
            onClick={handleDrop}
            disabled={balance < betAmount}
            type="button"
          >
            Drop Ball
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className={styles.gameArea}>
        {/* Latest Win overlay */}
        {lastWin && (
          <div className={styles.latestWin}>
            <span className={styles.latestWinLabel}>Latest Win</span>
            <span className={styles.latestWinValue}>{lastWin.mult}x</span>
          </div>
        )}

        {/* Balance */}
        <div className={styles.balanceTag}>
          <span className={styles.balanceLabel}>Balance</span>
          <span className={styles.balanceValue}>${balance.toLocaleString()}</span>
        </div>

        {/* Phaser Canvas */}
        <div className={styles.canvasWrap} ref={containerRef} />

        {/* Multiplier reference */}
        <div className={styles.multiplierRef}>
          {multipliers.map((m, i) => {
            const isHigh = m >= 5;
            return (
              <span key={i} className={isHigh ? styles.multHigh : styles.multLow}>
                x{m}
              </span>
            );
          })}
        </div>

        {/* Live History */}
        {history.length > 0 && (
          <div className={styles.history}>
            <span className={styles.historyLabel}>Live History</span>
            <div className={styles.historyItems}>
              {history.map((h, i) => (
                <span key={i} className={h.isHigh ? styles.historyHigh : styles.historyNormal}>
                  x{h.mult}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
