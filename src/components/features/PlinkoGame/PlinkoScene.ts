import * as Phaser from 'phaser';
import { PLINKO_CONFIG, MULTIPLIERS, type RiskLevel } from './plinko.constants';

export class PlinkoScene extends Phaser.Scene {
  private pegGraphics: Phaser.GameObjects.Arc[] = [];
  private ballBodies: Map<number, MatterJS.BodyType> = new Map();
  private ballGfx!: Phaser.GameObjects.Graphics;
  private scoredBalls: Set<number> = new Set();
  private currentRows = PLINKO_CONFIG.defaultRows;
  private currentRisk: RiskLevel = PLINKO_CONFIG.defaultRisk;
  private bucketRects: Phaser.GameObjects.Rectangle[] = [];
  private bucketTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'PlinkoScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PLINKO_CONFIG.bgColor);
    this.ballGfx = this.add.graphics();
    this.ballGfx.setDepth(10);
    this.rebuildBoard();
    this.setupCollisions();
  }

  update(): void {
    // Redraw ALL balls every frame from their physics body positions
    this.ballGfx.clear();
    for (const [id, body] of this.ballBodies) {
      if (!body.position) {
        this.ballBodies.delete(id);
        continue;
      }
      // Orange fill
      this.ballGfx.fillStyle(PLINKO_CONFIG.ballColor, 1);
      this.ballGfx.fillCircle(body.position.x, body.position.y, PLINKO_CONFIG.ballRadius);
      // White highlight for 3D effect
      this.ballGfx.fillStyle(0xffffff, 0.4);
      this.ballGfx.fillCircle(
        body.position.x - PLINKO_CONFIG.ballRadius * 0.25,
        body.position.y - PLINKO_CONFIG.ballRadius * 0.25,
        PLINKO_CONFIG.ballRadius * 0.4
      );
    }
  }

  setConfig(rows: number, risk: RiskLevel): void {
    this.currentRows = rows;
    this.currentRisk = risk;
    this.rebuildBoard();
  }

  private rebuildBoard(): void {
    this.pegGraphics.forEach((p) => p.destroy());
    this.pegGraphics = [];
    this.bucketRects.forEach((r) => r.destroy());
    this.bucketRects = [];
    this.bucketTexts.forEach((t) => t.destroy());
    this.bucketTexts = [];

    // Remove all existing matter bodies
    const bodies = this.matter.world.getAllBodies();
    bodies.forEach((body) => this.matter.world.remove(body));
    this.ballBodies.clear();
    this.scoredBalls.clear();
    if (this.ballGfx) this.ballGfx.clear();

    this.buildPegGrid();
    this.buildWalls();
    this.buildBuckets();

    this.matter.world.removeAllListeners();
    this.setupCollisions();
  }

  private buildPegGrid(): void {
    const { width, pegRadius, pegColor, pegSpacingX, pegSpacingY, startY } = PLINKO_CONFIG;
    const rows = this.currentRows;

    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (pegsInRow - 1) * pegSpacingX;
      const offsetX = (width - rowWidth) / 2;
      const y = startY + row * pegSpacingY;

      for (let col = 0; col < pegsInRow; col++) {
        const x = offsetX + col * pegSpacingX;

        this.matter.add.circle(x, y, pegRadius, {
          isStatic: true,
          restitution: 0.8,
          friction: 0,
          label: 'peg',
        });

        const peg = this.add.circle(x, y, pegRadius, pegColor);
        peg.setAlpha(0.7);
        this.pegGraphics.push(peg);
      }
    }
  }

  private buildWalls(): void {
    const { width, height } = PLINKO_CONFIG;
    const t = 20;
    this.matter.add.rectangle(-t / 2, height / 2, t, height, { isStatic: true, label: 'wall' });
    this.matter.add.rectangle(width + t / 2, height / 2, t, height, { isStatic: true, label: 'wall' });
    this.matter.add.rectangle(width / 2, height + t / 2, width, t, { isStatic: true, label: 'floor' });
  }

  private buildBuckets(): void {
    const { width, pegSpacingX, pegSpacingY, startY } = PLINKO_CONFIG;
    const rows = this.currentRows;
    const multipliers = MULTIPLIERS[this.currentRisk];

    const lastRowPegs = rows + 2;
    const lastRowWidth = (lastRowPegs - 1) * pegSpacingX;
    const lastRowOffsetX = (width - lastRowWidth) / 2;
    const bucketY = startY + rows * pegSpacingY + 10;
    const bucketHeight = 36;
    const numBuckets = multipliers.length;

    const edges: number[] = [];
    edges.push(lastRowOffsetX - pegSpacingX / 2);
    for (let i = 0; i < lastRowPegs; i++) {
      edges.push(lastRowOffsetX + i * pegSpacingX + pegSpacingX / 2);
    }

    const actualBuckets = Math.min(numBuckets, edges.length - 1);
    const center = Math.floor(actualBuckets / 2);

    for (let i = 0; i < actualBuckets; i++) {
      const left = edges[i];
      const right = edges[i + 1];
      const bw = right - left;
      const cx = (left + right) / 2;
      const mult = multipliers[i];

      const dist = Math.abs(i - center) / center;
      const alpha = 0.1 + dist * 0.3;
      const isHigh = mult >= 5;

      const color = isHigh ? 0xff6b9b : 0x1a191b;
      const borderColor = isHigh ? 0xff6b9b : 0x262627;

      const rect = this.add.rectangle(cx, bucketY + bucketHeight / 2, bw - 2, bucketHeight, color, alpha);
      rect.setStrokeStyle(1, borderColor, isHigh ? 0.4 : 0.3);
      this.bucketRects.push(rect);

      const textColor = isHigh ? '#ff6b9b' : '#adaaab';
      const label = this.add.text(cx, bucketY + bucketHeight / 2, `x${mult}`, {
        fontSize: '10px',
        fontFamily: 'Space Grotesk, sans-serif',
        color: textColor,
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.bucketTexts.push(label);

      this.matter.add.rectangle(cx, bucketY + bucketHeight / 2, bw, bucketHeight, {
        isStatic: true,
        isSensor: true,
        label: `bucket_${i}`,
      });

      if (i < actualBuckets - 1) {
        this.matter.add.rectangle(right, bucketY + bucketHeight / 2, 2, bucketHeight, {
          isStatic: true,
          label: 'divider',
        });
      }
    }
  }

  private setupCollisions(): void {
    this.matter.world.on('collisionstart', (_event: unknown, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
      const ballBody = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null;
      const otherBody = ballBody === bodyA ? bodyB : bodyA;
      if (!ballBody) return;

      if (otherBody.label === 'peg') {
        this.glowPeg(otherBody.position.x, otherBody.position.y);
      }

      if (otherBody.label?.startsWith('bucket_') && !this.scoredBalls.has(ballBody.id)) {
        this.scoredBalls.add(ballBody.id);
        const idx = parseInt(otherBody.label.split('_')[1], 10);
        const multipliers = MULTIPLIERS[this.currentRisk];
        const mult = multipliers[idx];
        if (mult !== undefined) {
          this.flashBucket(idx);
          this.events.emit('score', { multiplier: mult, bucketIndex: idx });

          this.time.delayedCall(200, () => {
            this.ballBodies.delete(ballBody.id);
            this.scoredBalls.delete(ballBody.id);
            this.matter.world.remove(ballBody);
          });
        }
      }
    });
  }

  private glowPeg(x: number, y: number): void {
    const peg = this.pegGraphics.find((p) => Math.abs(p.x - x) < 3 && Math.abs(p.y - y) < 3);
    if (peg) {
      peg.setFillStyle(PLINKO_CONFIG.pegGlowColor);
      peg.setAlpha(1);
      this.tweens.add({
        targets: peg,
        scaleX: 2,
        scaleY: 2,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          peg.setFillStyle(PLINKO_CONFIG.pegColor);
          peg.setAlpha(0.7);
          peg.setScale(1);
        },
      });
    }
  }

  private flashBucket(index: number): void {
    const rect = this.bucketRects[index];
    if (rect) {
      this.tweens.add({
        targets: rect,
        alpha: 0.8,
        duration: 150,
        yoyo: true,
      });
    }
  }

  dropBall(): void {
    const { width, ballRadius, ballRestitution, ballFriction } = PLINKO_CONFIG;
    const centerX = width / 2;
    const x = centerX + Phaser.Math.Between(-15, 15);

    // Create ONLY a physics body — no game object
    const body = this.matter.add.circle(x, 5, ballRadius, {
      restitution: ballRestitution,
      friction: ballFriction,
      frictionAir: 0.01,
      density: 0.002,
      label: 'ball',
    });

    this.matter.body.setVelocity(body, {
      x: Phaser.Math.FloatBetween(-0.3, 0.3),
      y: 0,
    });

    this.ballBodies.set(body.id, body);

    // Safety cleanup after 12s
    this.time.delayedCall(12000, () => {
      if (this.ballBodies.has(body.id)) {
        this.ballBodies.delete(body.id);
        this.scoredBalls.delete(body.id);
        this.matter.world.remove(body);
      }
    });
  }
}
