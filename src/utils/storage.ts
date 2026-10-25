import { HighScoreRecord, SoundMode } from '../types';

const SCORES_KEY = 'nokia_snake_high_scores';
const THEME_KEY = 'nokia_snake_theme';
const SOUND_KEY = 'nokia_snake_sound';
const MAZE_KEY = 'nokia_snake_maze';

export function getStoredHighScores(): HighScoreRecord[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return getDefaultHighScores();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultHighScores();
  } catch {
    return getDefaultHighScores();
  }
}

function getDefaultHighScores(): HighScoreRecord[] {
  return [
    { id: '1', score: 320, length: 28, maze: 'Open Arena', speed: 5, date: 'Classic Record' },
    { id: '2', score: 240, length: 22, maze: 'Nokia Labyrinth', speed: 5, date: 'Classic Record' },
    { id: '3', score: 180, length: 18, maze: 'Classic Box', speed: 4, date: 'Classic Record' },
  ];
}

export function saveHighScore(newRecord: Omit<HighScoreRecord, 'id'>): { isTopScore: boolean; rank: number } {
  try {
    const current = getStoredHighScores();
    const entry: HighScoreRecord = {
      ...newRecord,
      id: Date.now().toString(),
    };
    const updated = [...current, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(SCORES_KEY, JSON.stringify(updated));
    const rank = updated.findIndex((r) => r.id === entry.id) + 1;
    return {
      isTopScore: rank === 1,
      rank: rank > 0 ? rank : 11,
    };
  } catch {
    return { isTopScore: false, rank: 99 };
  }
}

export function getStoredTheme(): string {
  try {
    return localStorage.getItem(THEME_KEY) || 'classic';
  } catch {
    return 'classic';
  }
}

export function setStoredTheme(themeId: string) {
  try {
    localStorage.setItem(THEME_KEY, themeId);
  } catch {
    // Ignore
  }
}

export function getStoredSoundMode(): SoundMode {
  try {
    const val = localStorage.getItem(SOUND_KEY);
    if (val === 'ALL' || val === 'SFX_ONLY' || val === 'MUTE') return val;
    return 'ALL';
  } catch {
    return 'ALL';
  }
}

export function setStoredSoundMode(mode: SoundMode) {
  try {
    localStorage.setItem(SOUND_KEY, mode);
  } catch {
    // Ignore
  }
}

export function getStoredMaze(): string {
  try {
    return localStorage.getItem(MAZE_KEY) || 'open';
  } catch {
    return 'open';
  }
}

export function setStoredMaze(mazeId: string) {
  try {
    localStorage.setItem(MAZE_KEY, mazeId);
  } catch {
    // Ignore
  }
}
