import React, { useRef, useEffect } from 'react';
import { GameState, Particle, Pickup, Point, SoundMode, ThemeColors, Direction } from '../types';
import { GRID_COLS, GRID_ROWS } from '../utils/constants';

interface NokiaScreenProps {
  snake: Point[];
  snakeDir: Direction;
  food: Pickup | null;
  obstacles: Point[];
  particles: Particle[];
  theme: ThemeColors;
  score: number;
  highScore: number;
  multiplier: number;
  isBoosting: boolean;
  bonusTimerRatio: number;
  gameState: GameState;
  onStart: () => void;
  onPauseToggle: () => void;
  onReset: () => void;
  onOpenMazes: () => void;
  onOpenScores: () => void;
  soundMode: SoundMode;
  onToggleSound: () => void;
  currentMazeName: string;
  speedLevel: number;
  batteryLevel: number;
  isNewHigh: boolean;
}

export const NokiaScreen: React.FC<NokiaScreenProps> = ({
  snake,
  snakeDir,
  food,
  obstacles,
  particles,
  theme,
  score,
  highScore,
  multiplier,
  isBoosting,
  bonusTimerRatio,
  gameState,
  onStart,
  onPauseToggle,
  onReset,
  onOpenMazes,
  onOpenScores,
  soundMode,
  onToggleSound,
  currentMazeName,
  speedLevel,
  batteryLevel,
  isNewHigh,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw the entire frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use internal coordinate space for 32x20 grid
    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / GRID_COLS;
    const cellH = height / GRID_ROWS;

    // Clear with theme background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid dots (dot-matrix substrate)
    ctx.fillStyle = theme.gridLine;
    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        ctx.fillRect(x * cellW + cellW * 0.4, y * cellH + cellH * 0.4, cellW * 0.2, cellH * 0.2);
      }
    }

    // Helper: draw single pixel block in dot matrix style
    const drawPixelCell = (gx: number, gy: number, color: string, inset = 0.5) => {
      const px = gx * cellW + inset;
      const py = gy * cellH + inset;
      const pw = cellW - inset * 2;
      const ph = cellH - inset * 2;
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(px), Math.floor(py), Math.ceil(pw), Math.ceil(ph));
    };

    // 1. Draw Obstacles (Solid brick pattern with inner dot)
    obstacles.forEach((ob) => {
      drawPixelCell(ob.x, ob.y, theme.pixel, 0.5);
      // Small highlight in obstacle for retro texture
      ctx.fillStyle = theme.bg;
      ctx.fillRect(
        Math.floor(ob.x * cellW + cellW * 0.35),
        Math.floor(ob.y * cellH + cellH * 0.35),
        Math.ceil(cellW * 0.3),
        Math.ceil(cellH * 0.3)
      );
    });

    // 2. Draw Food Pickups
    if (food) {
      if (food.type === 'FRUIT') {
        // Classic 4-dot rounded apple/berry
        drawPixelCell(food.pos.x, food.pos.y, theme.pixel, 1);
        // Little top stem dot
        ctx.fillStyle = theme.bg;
        ctx.fillRect(food.pos.x * cellW + cellW * 0.25, food.pos.y * cellH + cellH * 0.2, cellW * 0.2, cellH * 0.2);
      } else if (food.type === 'INSECT') {
        // Bonus insect (beetle) - flashing animation
        const blink = Math.floor(Date.now() / 140) % 2 === 0;
        const color = blink ? theme.pixel : theme.pixelDim;

        // Insect body
        drawPixelCell(food.pos.x, food.pos.y, color, 0.5);
        // Legs / antenna details
        ctx.fillStyle = theme.bg;
        ctx.fillRect(food.pos.x * cellW + cellW * 0.35, food.pos.y * cellH + cellH * 0.35, cellW * 0.3, cellH * 0.3);
      } else if (food.type === 'TURBO') {
        // Lightning bolt / turbo pill
        drawPixelCell(food.pos.x, food.pos.y, theme.pixel, 0.5);
        ctx.fillStyle = theme.bg;
        ctx.beginPath();
        ctx.moveTo(food.pos.x * cellW + cellW * 0.6, food.pos.y * cellH + cellH * 0.1);
        ctx.lineTo(food.pos.x * cellW + cellW * 0.2, food.pos.y * cellH + cellH * 0.55);
        ctx.lineTo(food.pos.x * cellW + cellW * 0.55, food.pos.y * cellH + cellH * 0.55);
        ctx.lineTo(food.pos.x * cellW + cellW * 0.4, food.pos.y * cellH + cellH * 0.9);
        ctx.lineTo(food.pos.x * cellW + cellW * 0.8, food.pos.y * cellH + cellH * 0.45);
        ctx.lineTo(food.pos.x * cellW + cellW * 0.45, food.pos.y * cellH + cellH * 0.45);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 3. Draw Snake Body
    snake.forEach((segment, idx) => {
      const isHead = idx === 0;
      if (isHead) {
        // Snake Head
        drawPixelCell(segment.x, segment.y, theme.pixel, 0.2);

        // Eyes based on direction
        ctx.fillStyle = theme.bg;
        const eyeSize = Math.max(2, cellW * 0.22);
        if (snakeDir === 'RIGHT') {
          ctx.fillRect(segment.x * cellW + cellW * 0.65, segment.y * cellH + cellH * 0.2, eyeSize, eyeSize);
          ctx.fillRect(segment.x * cellW + cellW * 0.65, segment.y * cellH + cellH * 0.6, eyeSize, eyeSize);
        } else if (snakeDir === 'LEFT') {
          ctx.fillRect(segment.x * cellW + cellW * 0.15, segment.y * cellH + cellH * 0.2, eyeSize, eyeSize);
          ctx.fillRect(segment.x * cellW + cellW * 0.15, segment.y * cellH + cellH * 0.6, eyeSize, eyeSize);
        } else if (snakeDir === 'UP') {
          ctx.fillRect(segment.x * cellW + cellW * 0.2, segment.y * cellH + cellH * 0.15, eyeSize, eyeSize);
          ctx.fillRect(segment.x * cellW + cellW * 0.6, segment.y * cellH + cellH * 0.15, eyeSize, eyeSize);
        } else {
          // DOWN
          ctx.fillRect(segment.x * cellW + cellW * 0.2, segment.y * cellH + cellH * 0.65, eyeSize, eyeSize);
          ctx.fillRect(segment.x * cellW + cellW * 0.6, segment.y * cellH + cellH * 0.65, eyeSize, eyeSize);
        }
      } else {
        // Body segment
        const bodyColor = isBoosting ? (idx % 2 === 0 ? theme.pixel : theme.pixelDim) : theme.pixel;
        drawPixelCell(segment.x, segment.y, bodyColor, 0.5);

        // Center dot detail for authentic Nokia snake joint look
        if (idx % 3 === 0) {
          ctx.fillStyle = theme.bg;
          ctx.fillRect(
            segment.x * cellW + cellW * 0.4,
            segment.y * cellH + cellH * 0.4,
            cellW * 0.2,
            cellH * 0.2
          );
        }
      }
    });

    // 4. Draw Particles (monochrome pixel debris)
    particles.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = alpha > 0.5 ? theme.pixel : theme.pixelDim;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // 5. Speed boost speed lines on borders when boosting
    if (isBoosting) {
      ctx.fillStyle = theme.pixelDim;
      const offset = (Date.now() / 20) % (cellW * 2);
      for (let x = -cellW * 2; x < width + cellW * 2; x += cellW * 2) {
        ctx.fillRect(x + offset, 0, cellW * 0.8, 2);
        ctx.fillRect(width - (x + offset), height - 2, cellW * 0.8, 2);
      }
    }
  }, [snake, snakeDir, food, obstacles, particles, theme, isBoosting]);

  return (
    <div className="relative w-full aspect-[16/10] max-h-[58vh] flex flex-col rounded-xl overflow-hidden shadow-inner border-2 border-stone-800"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Nokia Top Status Bar */}
      <div 
        className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-mono tracking-tight border-b select-none shrink-0"
        style={{ 
          color: theme.pixel, 
          borderColor: theme.pixelDim + '33',
          backgroundColor: theme.bgDark + '66'
        }}
      >
        {/* Signal Bars */}
        <div className="flex items-center gap-1.5" title="Speed / Boost Level">
          <div className="flex items-end gap-0.5 h-3">
            <span className={`w-0.5 h-1 ${isBoosting ? 'animate-pulse' : ''}`} style={{ backgroundColor: theme.pixel }} />
            <span className={`w-0.5 h-1.5 ${isBoosting ? 'animate-pulse' : ''}`} style={{ backgroundColor: theme.pixel }} />
            <span className={`w-0.5 h-2 ${isBoosting ? 'animate-pulse' : ''}`} style={{ backgroundColor: theme.pixel }} />
            <span className={`w-0.5 h-2.5 ${isBoosting ? 'animate-pulse' : ''}`} style={{ backgroundColor: theme.pixel }} />
          </div>
          <span className="text-[10px] font-bold">SPD:{speedLevel}{isBoosting ? '!' : ''}</span>
        </div>

        {/* Center Live Score & Multiplier */}
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[10px] tabular-nums tracking-widest">
            {score.toString().padStart(4, '0')}
          </span>
          {multiplier > 1 && (
            <span className="text-[9px] px-1 py-0.2 rounded font-bold" style={{ backgroundColor: theme.pixel, color: theme.bg }}>
              {multiplier}X
            </span>
          )}
        </div>

        {/* Top-Right: Realistic Retro Nokia Battery Indicator & Sound Status */}
        <div className="flex items-center gap-2">
          {/* Bonus Bug Countdown Mini-Pip (if active) */}
          {food?.type === 'INSECT' && (
            <div 
              className="flex items-center gap-1 text-[9px] font-bold px-1 py-0.5 rounded animate-pulse"
              style={{ backgroundColor: theme.pixel, color: theme.bg }}
              title="Bonus Bug Active!"
            >
              <span>BUG</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.bg }} />
            </div>
          )}

          {/* Authentic Retro Nokia-Style Battery Status Indicator */}
          <div 
            className={`flex items-center gap-0.5 select-none ${
              batteryLevel <= 15 ? 'animate-pulse' : ''
            }`}
            title={`Nokia Battery: ${Math.round(batteryLevel)}% ${batteryLevel <= 15 ? '(LOW BATTERY WARNING!)' : ''}`}
          >
            {batteryLevel <= 15 && (
              <span 
                className="text-[9px] font-bold tracking-tighter mr-0.5"
                style={{ color: theme.pixel }}
              >
                LOW
              </span>
            )}

            {/* Battery Body Frame */}
            <div 
              className="w-6 h-3 border rounded-xs p-[1px] flex items-center gap-[1px]"
              style={{ borderColor: theme.pixel, backgroundColor: theme.bgDark + '44' }}
            >
              {/* 4 Discrete Vertical Nokia Battery Bars */}
              {[1, 2, 3, 4].map((bar) => {
                const threshold = (bar - 1) * 25; // 0, 25, 50, 75
                const isFilled = batteryLevel > threshold;
                return (
                  <span
                    key={bar}
                    className="h-full flex-1 rounded-[0.5px] transition-all duration-300"
                    style={{ 
                      backgroundColor: isFilled ? theme.pixel : 'transparent'
                    }}
                  />
                );
              })}
            </div>

            {/* Battery Positive Terminal Tip */}
            <div 
              className="w-[2px] h-[5px] rounded-r-xs"
              style={{ backgroundColor: theme.pixel }}
            />
          </div>

          {/* Sound Mode Icon */}
          <button
            onClick={onToggleSound}
            className="text-[10px] font-bold px-1 hover:opacity-80 active:scale-95 ml-0.5"
            title={`Sound: ${soundMode} (Click to toggle)`}
            style={{ color: theme.pixel }}
          >
            {soundMode === 'ALL' ? '♫' : soundMode === 'SFX_ONLY' ? '♪' : '✕'}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport with authentic scanlines and pixel overlay */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          className="w-full h-full block"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Retro dot-matrix & glass glare overlays */}
        <div className="absolute inset-0 pointer-events-none lcd-grid-pattern opacity-40" />
        <div className="absolute inset-0 pointer-events-none lcd-scanline opacity-25" />
        <div className="absolute inset-0 pointer-events-none lcd-glass-glare" />

        {/* State Overlays (Title Screen) */}
        {gameState === 'TITLE' && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10"
            style={{ backgroundColor: `${theme.bg}ee`, color: theme.pixel }}
          >
            <div className="font-pixel text-sm sm:text-base tracking-wider font-bold mb-1">
              SNAKE II
            </div>
            <div className="text-[11px] font-mono tracking-widest uppercase mb-3 opacity-90">
              Arcade Turbo Edition
            </div>

            {/* Retro Snake Mascot Icon */}
            <div className="flex items-center gap-1 mb-4 p-1 border rounded" style={{ borderColor: theme.pixel }}>
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: theme.pixel }} />
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: theme.pixel }} />
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: theme.pixel }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: theme.pixel }} />
            </div>

            {/* Play Button */}
            <button
              onClick={onStart}
              className="px-5 py-2 font-pixel text-xs tracking-wider rounded border-2 shadow-sm font-bold active:scale-95 transition-transform mb-2.5"
              style={{ 
                backgroundColor: theme.pixel, 
                color: theme.bg, 
                borderColor: theme.pixel 
              }}
            >
              START GAME
            </button>

            <div className="text-[11px] font-mono opacity-80 mt-1">
              Maze: <span className="font-bold underline cursor-pointer" onClick={onOpenMazes}>{currentMazeName}</span>
            </div>
            <div className="text-[10px] font-mono opacity-70 mt-0.5">
              High Score: {highScore} pts
            </div>

            <div className="text-[9px] font-mono opacity-60 mt-2 hidden sm:block">
              Controls: WASD / Arrows · Space Boost · Esc Pause
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {gameState === 'PAUSED' && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10"
            style={{ backgroundColor: `${theme.bg}dd`, color: theme.pixel }}
          >
            <div className="font-pixel text-xs sm:text-sm font-bold mb-2">
              GAME PAUSED
            </div>
            <div className="text-[11px] font-mono mb-4">
              Current Score: {score}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onPauseToggle}
                className="px-4 py-1.5 font-pixel text-[11px] rounded border active:scale-95 font-bold"
                style={{ backgroundColor: theme.pixel, color: theme.bg, borderColor: theme.pixel }}
              >
                RESUME
              </button>
              <button
                onClick={onReset}
                className="px-4 py-1.5 font-pixel text-[11px] rounded border active:scale-95"
                style={{ backgroundColor: 'transparent', color: theme.pixel, borderColor: theme.pixel }}
              >
                RESTART
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAME_OVER' && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10"
            style={{ backgroundColor: `${theme.bg}ee`, color: theme.pixel }}
          >
            <div className="font-pixel text-xs sm:text-sm font-bold mb-1">
              GAME OVER
            </div>

            {isNewHigh ? (
              <div 
                className="px-2 py-0.5 mb-2 font-pixel text-[9px] tracking-wider rounded font-bold animate-pulse"
                style={{ backgroundColor: theme.pixel, color: theme.bg }}
              >
                ★ NEW HIGH SCORE! ★
              </div>
            ) : (
              <div className="text-[11px] font-mono mb-2 opacity-80">
                Well played!
              </div>
            )}

            <div className="text-xs font-mono font-bold mb-1">
              SCORE: {score} PTS
            </div>
            <div className="text-[10px] font-mono opacity-75 mb-3">
              Length: {snake.length} segments · Best: {highScore}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onStart}
                className="px-4 py-2 font-pixel text-[10px] rounded border-2 shadow-sm font-bold active:scale-95"
                style={{ backgroundColor: theme.pixel, color: theme.bg, borderColor: theme.pixel }}
              >
                PLAY AGAIN
              </button>
              <button
                onClick={onOpenScores}
                className="px-3 py-2 font-pixel text-[10px] rounded border active:scale-95"
                style={{ backgroundColor: 'transparent', color: theme.pixel, borderColor: theme.pixel }}
              >
                SCORES
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen Bottom Sub-bar */}
      <div 
        className="w-full px-2 py-0.5 flex items-center justify-between text-[9px] font-mono border-t select-none shrink-0"
        style={{ 
          color: theme.pixel, 
          borderColor: theme.pixelDim + '33',
          backgroundColor: theme.bgDark + '66'
        }}
      >
        <span className="truncate max-w-[50%]">MAP: {currentMazeName.toUpperCase()}</span>
        <span>HI: {highScore.toString().padStart(4, '0')}</span>
      </div>
    </div>
  );
};
