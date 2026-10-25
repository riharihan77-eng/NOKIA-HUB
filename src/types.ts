export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'MAZE_SELECT' | 'SCORES';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type PickupType = 'FRUIT' | 'INSECT' | 'TURBO';

export interface Pickup {
  type: PickupType;
  pos: Point;
  points: number;
  timer?: number; // remaining ticks for timed insects/bonuses
  maxTimer?: number;
  subType?: 'beetle' | 'butterfly' | 'turbo_pill';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface ThemeColors {
  id: string;
  name: string;
  bg: string;
  bgDark: string;
  pixel: string;
  pixelDim: string;
  gridLine: string;
  bezel: string;
  accent: string;
}

export type SoundMode = 'ALL' | 'SFX_ONLY' | 'MUTE';

export interface MazeConfig {
  id: string;
  name: string;
  description: string;
  obstacles: Point[];
  wrapWalls: boolean;
}

export interface HighScoreRecord {
  id: string;
  score: number;
  length: number;
  maze: string;
  speed: number;
  date: string;
}
