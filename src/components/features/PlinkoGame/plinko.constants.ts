export type RiskLevel = 'low' | 'medium' | 'high';

export const MULTIPLIERS: Record<RiskLevel, number[]> = {
  low: [1.5, 1.2, 1.1, 1, 0.5, 0.3, 0.5, 1, 1.1, 1.2, 1.5],
  medium: [29, 12, 5, 2, 0.5, 0.2, 0.5, 2, 5, 12, 29],
  high: [110, 41, 10, 5, 3, 1.5, 1, 1.5, 3, 5, 10, 41, 110],
};

export const ROW_OPTIONS = [8, 10, 12, 14, 16];

export const PLINKO_CONFIG = {
  width: 680,
  height: 520,
  pegRadius: 4,
  pegColor: 0xadaaab,
  pegGlowColor: 0xffffff,
  pegSpacingX: 36,
  pegSpacingY: 34,
  startY: 30,
  ballRadius: 8,
  ballColor: 0xf5a623,
  ballRestitution: 0.5,
  ballFriction: 0.02,
  bgColor: '#000000',
  gravity: 1.5,
  startingBalance: 1000,
  defaultBet: 10,
  defaultRows: 14,
  defaultRisk: 'medium' as RiskLevel,
};
