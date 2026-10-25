import { MazeConfig, ThemeColors, Point } from '../types';

export const GRID_COLS = 32;
export const GRID_ROWS = 20;

export const THEMES: Record<string, ThemeColors> = {
  classic: {
    id: 'classic',
    name: 'Nokia Green',
    bg: '#9bbc0f',
    bgDark: '#8bac0f',
    pixel: '#0f380f',
    pixelDim: '#306230',
    gridLine: 'rgba(15, 56, 15, 0.08)',
    bezel: '#7a960d',
    accent: '#0f380f',
  },
  amber: {
    id: 'amber',
    name: 'Amber Backlight',
    bg: '#df9c1e',
    bgDark: '#cb8b15',
    pixel: '#371f02',
    pixelDim: '#5a3508',
    gridLine: 'rgba(55, 31, 2, 0.08)',
    bezel: '#b3760a',
    accent: '#371f02',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Grey Monochrome',
    bg: '#c8cfbb',
    bgDark: '#b8c0a8',
    pixel: '#181f14',
    pixelDim: '#333e2d',
    gridLine: 'rgba(24, 31, 20, 0.08)',
    bezel: '#a2ab91',
    accent: '#181f14',
  },
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    bg: '#629e96',
    bgDark: '#528d85',
    pixel: '#09211d',
    pixelDim: '#1b413c',
    gridLine: 'rgba(9, 33, 29, 0.08)',
    bezel: '#417a72',
    accent: '#09211d',
  },
};

// Generate maze obstacles
function createLabyrinthObstacles(): Point[] {
  const obstacles: Point[] = [];
  // 4 corner brackets or inner maze bars
  for (let x = 6; x <= 12; x++) {
    obstacles.push({ x, y: 5 });
    obstacles.push({ x: GRID_COLS - 1 - x, y: GRID_ROWS - 1 - 5 });
  }
  for (let y = 6; y <= 9; y++) {
    obstacles.push({ x: 6, y });
    obstacles.push({ x: GRID_COLS - 7, y: GRID_ROWS - 1 - y });
  }
  // Center divider block with gap
  for (let y = 7; y <= 12; y++) {
    if (y !== 9 && y !== 10) {
      obstacles.push({ x: 15, y });
      obstacles.push({ x: 16, y });
    }
  }
  return obstacles;
}

function createTunnelsObstacles(): Point[] {
  const obstacles: Point[] = [];
  // Top and bottom teeth barriers
  for (let x = 4; x < GRID_COLS - 4; x += 4) {
    obstacles.push({ x, y: 3 });
    obstacles.push({ x: x + 1, y: 3 });
    obstacles.push({ x, y: 4 });
    obstacles.push({ x: x + 1, y: 4 });

    obstacles.push({ x, y: GRID_ROWS - 4 });
    obstacles.push({ x: x + 1, y: GRID_ROWS - 4 });
    obstacles.push({ x, y: GRID_ROWS - 5 });
    obstacles.push({ x: x + 1, y: GRID_ROWS - 5 });
  }
  return obstacles;
}

function createCrossroadsObstacles(): Point[] {
  const obstacles: Point[] = [];
  // Cross walls with ample opening
  for (let x = 8; x <= 23; x++) {
    if (x < 14 || x > 17) {
      obstacles.push({ x, y: 9 });
      obstacles.push({ x, y: 10 });
    }
  }
  for (let y = 4; y <= 15; y++) {
    if (y < 8 || y > 11) {
      obstacles.push({ x: 15, y });
      obstacles.push({ x: 16, y });
    }
  }
  return obstacles;
}

export const MAZES: MazeConfig[] = [
  {
    id: 'open',
    name: 'Open Arena',
    description: 'Screen wraps freely on edges with zero interior walls.',
    obstacles: [],
    wrapWalls: true,
  },
  {
    id: 'classic_box',
    name: 'Classic Box',
    description: 'Solid border perimeter. Touching any wall is game over.',
    obstacles: [],
    wrapWalls: false,
  },
  {
    id: 'labyrinth',
    name: 'Nokia Labyrinth',
    description: 'Vintage Snake II maze with corner corridors and center gates.',
    obstacles: createLabyrinthObstacles(),
    wrapWalls: true,
  },
  {
    id: 'tunnels',
    name: 'Twin Tunnels',
    description: 'Pillared tunnels on ceiling and floor with open flight lanes.',
    obstacles: createTunnelsObstacles(),
    wrapWalls: true,
  },
  {
    id: 'crossroads',
    name: 'Crossroads',
    description: 'Challenging central barrier cross testing rapid reflexes.',
    obstacles: createCrossroadsObstacles(),
    wrapWalls: false,
  },
];

export const BASE_SPEED_MS = 140; // Default tick interval in ms
export const TURBO_SPEED_MS = 65; // Boost tick interval in ms
export const INSECT_INTERVAL_TICKS = 80; // Every ~80 ticks, a bonus bug might spawn
export const INSECT_LIFETIME_TICKS = 45; // Bonus bug stays alive for ~45 ticks
