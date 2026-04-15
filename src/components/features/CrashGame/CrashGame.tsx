'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './CrashGame.module.scss';

type GameState = 'betting' | 'running' | 'crashed';

const STARTING_BALANCE = 1000;

function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.01) return 1;
  return Math.max(1, Math.floor(100 * (0.99 / (1 - r))) / 100);
}

// Multi-frequency turbulence for organic rocket wobble
// Returns value roughly in [-1, 1]
function turbulence(t: number, seed: number): number {
  return (
    Math.sin(t * 2.3 + seed) * 0.35 +
    Math.sin(t * 5.1 + seed * 1.7) * 0.28 +
    Math.sin(t * 9.7 + seed * 3.2) * 0.18 +
    Math.sin(t * 17.3 + seed * 5.1) * 0.1 +
    Math.sin(t * 31.7 + seed * 7.9) * 0.05
  );
}

export function CrashGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const turbulenceSeedRef = useRef<number>(0);

  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(2);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [multiplier, setMultiplier] = useState(1);
  const [crashedAt, setCrashedAt] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [history, setHistory] = useState<{ mult: number; color: string }[]>([]);

  const drawGraph = useCallback((currentMult: number, elapsed: number, crashed: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvasSizeRef.current.w;
    const h = canvasSizeRef.current.h;
    if (w === 0 || h === 0) return;

    const seed = turbulenceSeedRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(72, 72, 73, 0.3)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 60) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 60) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    if (currentMult <= 1.005) {
      if (rocketRef.current) rocketRef.current.style.opacity = '0';
      if (trailRef.current) trailRef.current.style.opacity = '0';
      return;
    }

    // X progression based on time
    const maxVisibleTime = 30;
    const timeScale = Math.min(elapsed, maxVisibleTime);
    const xProgress = Math.min(elapsed / maxVisibleTime, 1);

    const grad = ctx.createLinearGradient(0, h, w * xProgress, 0);
    grad.addColorStop(0, crashed ? '#ff716c' : '#00d4ec');
    grad.addColorStop(1, crashed ? '#ff716c' : '#81ecff');

    ctx.beginPath();
    ctx.moveTo(0, h);

    const steps = 300;
    let tipX = 0;
    let tipY = h;
    let prevTipX = 0;
    let prevTipY = h;

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const t = frac * timeScale;
      const m = Math.exp(0.06 * t);
      const x = frac * xProgress * w;

      // Base Y from multiplier (smooth upward curve)
      const maxMult = Math.max(currentMult, 2);
      const normalizedMult = (m - 1) / (maxMult - 1 + 0.001);
      const baseY = h - normalizedMult * (h * 0.78);

      // Turbulence: amplitude scales with height gained, capped at 30px
      const heightGained = h - baseY;
      const turbAmp = Math.min(heightGained * 0.12, 30);
      const wobble = turbulence(t, seed) * turbAmp;

      const y = Math.max(8, Math.min(h - 2, baseY + wobble));

      ctx.lineTo(x, y);

      // Track previous point for slope calculation
      prevTipX = tipX;
      prevTipY = tipY;
      tipX = x;
      tipY = y;
    }

    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gradient fill under the curve
    ctx.lineTo(tipX, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, h, 0, tipY);
    fillGrad.addColorStop(0, 'rgba(0, 212, 236, 0)');
    fillGrad.addColorStop(1, crashed ? 'rgba(255, 113, 108, 0.06)' : 'rgba(0, 212, 236, 0.06)');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Glow dot at tip
    if (!crashed) {
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#81ecff';
      ctx.shadowColor = '#81ecff';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Calculate rocket rotation from curve slope at the tip
    const dx = tipX - prevTipX;
    const dy = tipY - prevTipY;
    // atan2 gives angle of the tangent line; rocket SVG points "up" so offset by -90
    const slopeAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const rocketAngle = slopeAngle - 90;

    // Position rocket + trail via direct DOM manipulation (60fps, no re-render)
    if (rocketRef.current) {
      const pctX = (tipX / w) * 100;
      const pctY = (tipY / h) * 100;
      rocketRef.current.style.left = `${pctX}%`;
      rocketRef.current.style.top = `${pctY}%`;
      rocketRef.current.style.opacity = crashed ? '0' : '1';
      rocketRef.current.style.transform = `translate(-50%, -50%) rotate(${rocketAngle}deg)`;
    }
    if (trailRef.current) {
      const pctX = (tipX / w) * 100;
      const pctY = (tipY / h) * 100;
      trailRef.current.style.left = `${pctX}%`;
      trailRef.current.style.top = `${pctY}%`;
      trailRef.current.style.opacity = crashed ? '0' : '0.6';
      // Trail points opposite to rocket direction
      trailRef.current.style.transform = `translate(-20%, -20%) rotate(${rocketAngle + 180}deg)`;
    }
  }, []);

  const startRound = useCallback(() => {
    if (balance < betAmount) return;

    const crashPoint = generateCrashPoint();
    crashPointRef.current = crashPoint;
    startTimeRef.current = Date.now();
    // Unique turbulence pattern each round
    turbulenceSeedRef.current = Math.random() * 1000;

    setBalance((prev) => Math.round((prev - betAmount) * 100) / 100);
    setGameState('running');
    setMultiplier(1);
    setCrashedAt(null);
    setLastWin(null);

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const baseMult = Math.exp(0.06 * elapsed);
      const seed = turbulenceSeedRef.current;

      // Apply same turbulence to displayed multiplier so it syncs with rocket
      const wobbleAmt = turbulence(elapsed, seed) * Math.min(baseMult * 0.08, 0.8);
      const visualMult = Math.max(1, Math.round((baseMult + wobbleAmt) * 100) / 100);

      // Crash check uses the base (always-increasing) multiplier
      if (baseMult >= crashPoint) {
        setMultiplier(crashPoint);
        setCrashedAt(crashPoint);
        setGameState('crashed');
        setHistory((prev) => [
          { mult: crashPoint, color: crashPoint >= 2 ? '#81ecff' : '#ff716c' },
          ...prev,
        ].slice(0, 8));
        drawGraph(baseMult, elapsed, true);
        return;
      }

      // Display the turbulent multiplier (dips and climbs with the rocket)
      setMultiplier(visualMult);
      drawGraph(baseMult, elapsed, false);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, [balance, betAmount, drawGraph]);

  const cashOut = useCallback(() => {
    if (gameState !== 'running') return;
    cancelAnimationFrame(animRef.current);

    const winAmount = Math.round(betAmount * multiplier * 100) / 100;
    setBalance((prev) => Math.round((prev + winAmount) * 100) / 100);
    setLastWin(winAmount);
    setGameState('crashed');
    setCrashedAt(null);
    setHistory((prev) => [
      { mult: multiplier, color: '#00ed7e' },
      ...prev,
    ].slice(0, 8));

    if (rocketRef.current) rocketRef.current.style.opacity = '0';
    if (trailRef.current) trailRef.current.style.opacity = '0';
  }, [gameState, betAmount, multiplier]);

  // Auto cashout
  useEffect(() => {
    if (gameState === 'running' && autoCashout > 1 && multiplier >= autoCashout) {
      cashOut();
    }
  }, [gameState, multiplier, autoCashout, cashOut]);

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Set canvas size
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvasSizeRef.current = { w: rect.width, h: rect.height };
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, []);

  const isCrashed = gameState === 'crashed' && crashedAt !== null;
  const isCashedOut = gameState === 'crashed' && crashedAt === null;

  return (
    <div className={styles.layout}>
      <div className={styles.graphArea}>
        <div className={styles.graphContainer}>
          <canvas ref={canvasRef} className={styles.canvas} />

          {/* Rocket - positioned + rotated via direct DOM in drawGraph */}
          <div ref={rocketRef} className={styles.rocket} style={{ opacity: 0 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={styles.rocketIcon}>
              <path d="M12 2C12 2 7 7 7 12c0 2.5 1 4.5 2.5 6l.5 2h4l.5-2c1.5-1.5 2.5-3.5 2.5-6 0-5-5-10-5-10z" fill="#81ecff" />
              <circle cx="12" cy="11" r="2" fill="#0e0e0f" />
              <path d="M9.5 18l-2 3h2.5l1-2" fill="#ff6b9b" opacity="0.8" />
              <path d="M14.5 18l2 3h-2.5l-1-2" fill="#ff6b9b" opacity="0.8" />
              <path d="M11 19h2l.5 2h-3z" fill="#f5a623" opacity="0.9" />
            </svg>
          </div>

          {/* Rocket exhaust trail */}
          <div ref={trailRef} className={styles.rocketTrail} style={{ opacity: 0 }} />

          {/* Multiplier Overlay */}
          <div className={styles.multiplierOverlay}>
            <div className={`${styles.multiplierText} ${isCrashed ? styles.crashed : ''} ${isCashedOut ? styles.won : ''}`}>
              {multiplier.toFixed(2)}x
            </div>
            <div className={styles.multiplierLabel}>
              {gameState === 'betting' && 'Place your bet'}
              {gameState === 'running' && 'Current Multiplier'}
              {isCrashed && 'CRASHED'}
              {isCashedOut && `CASHED OUT +$${lastWin?.toLocaleString()}`}
            </div>
          </div>

          {gameState === 'running' && (
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              <span>LIVE</span>
            </div>
          )}

          {history.length > 0 && (
            <div className={styles.recentBar}>
              <span className={styles.recentLabel}>RECENT:</span>
              {history.map((h, i) => (
                <span key={i} className={styles.recentChip} style={{ borderColor: h.color, color: h.color }}>
                  {h.mult.toFixed(2)}x
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.betConsole}>
          <div className={styles.betMain}>
            <div className={styles.betField}>
              <div className={styles.betFieldHeader}>
                <span className={styles.label}>Wager Amount</span>
                <div className={styles.quickBtns}>
                  <button onClick={() => setBetAmount((b) => Math.max(1, Math.round(b / 2 * 100) / 100))} type="button">1/2</button>
                  <button onClick={() => setBetAmount((b) => Math.round(b * 2 * 100) / 100)} type="button">x2</button>
                  <button onClick={() => setBetAmount(balance)} type="button">Max</button>
                </div>
              </div>
              <div className={styles.wagerInput}>
                <input
                  type="number"
                  value={betAmount}
                  min={1}
                  onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                  disabled={gameState === 'running'}
                />
                <span className={styles.currency}>USD</span>
              </div>
            </div>

            <div className={styles.betFieldSmall}>
              <span className={styles.label}>Auto Cashout</span>
              <input
                type="number"
                value={autoCashout}
                step={0.1}
                onChange={(e) => setAutoCashout(Number(e.target.value) || 0)}
                className={styles.cashoutInput}
                disabled={gameState === 'running'}
              />
              <button
                className={styles.betButton}
                onClick={gameState === 'running' ? cashOut : startRound}
                disabled={gameState === 'betting' && balance < betAmount}
                type="button"
              >
                {gameState === 'running' ? 'CASH OUT' : 'BET'}
              </button>
            </div>
          </div>

          <div className={styles.betStats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Balance</span>
              <span className={styles.statPrimary}>${balance.toLocaleString()}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Profit on Win</span>
              <span className={styles.statGreen}>+${(Math.round(betAmount * (autoCashout - 1) * 100) / 100).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
