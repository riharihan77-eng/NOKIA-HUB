/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Direction, GameState, Particle, Pickup, Point, SoundMode, ThemeColors, MazeConfig } from './types';
import { GRID_COLS, GRID_ROWS, THEMES, MAZES, BASE_SPEED_MS, TURBO_SPEED_MS, INSECT_INTERVAL_TICKS, INSECT_LIFETIME_TICKS } from './utils/constants';
import { audio } from './utils/audio';
import { triggerHaptic } from './utils/vibrate';
import { getStoredHighScores, saveHighScore, getStoredTheme, setStoredTheme, getStoredSoundMode, setStoredSoundMode, getStoredMaze, setStoredMaze } from './utils/storage';
import { NokiaScreen } from './components/NokiaScreen';
import { ControlsPad } from './components/ControlsPad';
import { MazeSelectorModal } from './components/MazeSelectorModal';
import { LeaderboardModal } from './components/LeaderboardModal';

export default function App() {
  // Theme & Settings
  const [themeId, setThemeId] = useState<string>(getStoredTheme);
  const theme = THEMES[themeId] || THEMES.classic;

  const [soundMode, setSoundModeState] = useState<SoundMode>(getStoredSoundMode);
  const [currentMazeId, setCurrentMazeId] = useState<string>(getStoredMaze);
  const currentMaze = MAZES.find((m) => m.id === currentMazeId) || MAZES[0];

  const [speedLevel, setSpeedLevel] = useState<number>(5); // 1 to 9
  const [gameState, setGameState] = useState<GameState>('TITLE');

  // Modals
  const [showMazeModal, setShowMazeModal] = useState<boolean>(false);
  const [showScoresModal, setShowScoresModal] = useState<boolean>(false);
  const [highScores, setHighScores] = useState(getStoredHighScores);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  // Game Engine State
  const [snake, setSnake] = useState<Point[]>([
    { x: 14, y: 10 },
    { x: 13, y: 10 },
    { x: 12, y: 10 },
    { x: 11, y: 10 },
  ]);
  const [snakeDir, setSnakeDir] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Pickup | null>({
    type: 'FRUIT',
    pos: { x: 22, y: 10 },
    points: 10,
  });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);
  const [bonusTimerRatio, setBonusTimerRatio] = useState<number>(1);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);

  // Refs for loop state
  const batteryLevelRef = useRef<number>(100);
  batteryLevelRef.current = batteryLevel;
  const lastLowBatterySoundRef = useRef<number>(0);

  const snakeRef = useRef<Point[]>(snake);
  snakeRef.current = snake;

  const dirRef = useRef<Direction>(snakeDir);
  dirRef.current = snakeDir;

  const inputQueueRef = useRef<Direction[]>([]);
  const foodRef = useRef<Pickup | null>(food);
  foodRef.current = food;

  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;

  const isBoostingRef = useRef<boolean>(isBoosting);
  isBoostingRef.current = isBoosting;

  const speedLevelRef = useRef<number>(speedLevel);
  speedLevelRef.current = speedLevel;

  const currentMazeRef = useRef<MazeConfig>(currentMaze);
  currentMazeRef.current = currentMaze;

  const ticksSinceLastInsectRef = useRef<number>(0);
  const gameLoopTimerRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(performance.now());

  // Sound Mode Toggle Handler
  const handleToggleSound = useCallback(() => {
    const nextMode: SoundMode =
      soundMode === 'ALL' ? 'SFX_ONLY' : soundMode === 'SFX_ONLY' ? 'MUTE' : 'ALL';
    setSoundModeState(nextMode);
    setStoredSoundMode(nextMode);
    audio.setSoundMode(nextMode);
  }, [soundMode]);

  // Theme Cycling Handler
  const handleThemeCycle = useCallback(() => {
    const themeKeys = Object.keys(THEMES);
    const currIndex = themeKeys.indexOf(themeId);
    const nextThemeId = themeKeys[(currIndex + 1) % themeKeys.length];
    setThemeId(nextThemeId);
    setStoredTheme(nextThemeId);
  }, [themeId]);

  // Spawn Pickups in Unoccupied Cells
  const spawnFood = useCallback((type: 'FRUIT' | 'INSECT' | 'TURBO'): Pickup => {
    const occupied = new Set<string>();
    snakeRef.current.forEach((p) => occupied.add(`${p.x},${p.y}`));
    currentMazeRef.current.obstacles.forEach((p) => occupied.add(`${p.x},${p.y}`));

    let attempts = 0;
    let pos: Point = { x: 5, y: 5 };
    while (attempts < 200) {
      const rx = Math.floor(Math.random() * (GRID_COLS - 2)) + 1;
      const ry = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;
      if (!occupied.has(`${rx},${ry}`)) {
        pos = { x: rx, y: ry };
        break;
      }
      attempts++;
    }

    if (type === 'INSECT') {
      return {
        type: 'INSECT',
        pos,
        points: 50,
        timer: INSECT_LIFETIME_TICKS,
        maxTimer: INSECT_LIFETIME_TICKS,
        subType: Math.random() > 0.5 ? 'beetle' : 'butterfly',
      };
    }

    if (type === 'TURBO') {
      return {
        type: 'TURBO',
        pos,
        points: 25,
        timer: 35,
        maxTimer: 35,
      };
    }

    return {
      type: 'FRUIT',
      pos,
      points: 10,
    };
  }, []);

  // Spawn Particle Explosion
  const createExplosion = useCallback((x: number, y: number, count = 12) => {
    const newParticles: Particle[] = [];
    const canvasW = 640;
    const canvasH = 400;
    const cellW = canvasW / GRID_COLS;
    const cellH = canvasH / GRID_ROWS;
    const centerX = x * cellW + cellW / 2;
    const centerY = y * cellH + cellH / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      newParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 12 + 10,
        size: Math.random() > 0.5 ? 4 : 2,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // Direction Input Handler with anti-reverse validation
  const handleDirection = useCallback((newDir: Direction) => {
    const queue = inputQueueRef.current;
    const lastDir = queue.length > 0 ? queue[queue.length - 1] : dirRef.current;

    // Prevent direct opposite turns
    if (newDir === 'UP' && lastDir === 'DOWN') return;
    if (newDir === 'DOWN' && lastDir === 'UP') return;
    if (newDir === 'LEFT' && lastDir === 'RIGHT') return;
    if (newDir === 'RIGHT' && lastDir === 'LEFT') return;

    if (queue.length < 2) {
      queue.push(newDir);
    }
  }, []);

  // End Game
  const handleGameOver = useCallback(() => {
    setGameState('GAME_OVER');
    audio.stopBgm();
    audio.playCrash();
    audio.playGameOver();
    triggerHaptic('crash');

    // Create massive head explosion
    const head = snakeRef.current[0];
    if (head) {
      createExplosion(head.x, head.y, 24);
    }

    // Check & save high score
    const res = saveHighScore({
      score,
      length: snakeRef.current.length,
      maze: currentMazeRef.current.name,
      speed: speedLevelRef.current,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    });

    setHighScores(getStoredHighScores());
    if (res.isTopScore) {
      setIsNewHigh(true);
      setTimeout(() => {
        audio.playNewHighScore();
      }, 500);
    } else {
      setIsNewHigh(false);
    }
  }, [score, createExplosion]);

  // Main Game Loop Step
  const tick = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;

    // 1. Process directional input queue
    if (inputQueueRef.current.length > 0) {
      const next = inputQueueRef.current.shift()!;
      dirRef.current = next;
      setSnakeDir(next);
    }

    const currentHead = snakeRef.current[0];
    const dir = dirRef.current;
    let nextX = currentHead.x;
    let nextY = currentHead.y;

    if (dir === 'UP') nextY -= 1;
    if (dir === 'DOWN') nextY += 1;
    if (dir === 'LEFT') nextX -= 1;
    if (dir === 'RIGHT') nextX += 1;

    // 2. Wall & Border Collisions
    const wrap = currentMazeRef.current.wrapWalls;
    if (wrap) {
      nextX = (nextX + GRID_COLS) % GRID_COLS;
      nextY = (nextY + GRID_ROWS) % GRID_ROWS;
    } else {
      if (nextX < 0 || nextX >= GRID_COLS || nextY < 0 || nextY >= GRID_ROWS) {
        handleGameOver();
        return;
      }
    }

    const nextHead: Point = { x: nextX, y: nextY };

    // 3. Obstacle Collisions
    const hitObstacle = currentMazeRef.current.obstacles.some(
      (ob) => ob.x === nextHead.x && ob.y === nextHead.y
    );
    if (hitObstacle) {
      handleGameOver();
      return;
    }

    // 4. Self Collision (Snake Body)
    // Check against all body segments except the tail (which vacates unless eating)
    const hitSelf = snakeRef.current.slice(0, -1).some(
      (seg) => seg.x === nextHead.x && seg.y === nextHead.y
    );
    if (hitSelf) {
      handleGameOver();
      return;
    }

    // 5. Food Interaction
    const currentFood = foodRef.current;
    let ateFood = false;
    let pointsEarned = 0;

    if (currentFood && nextHead.x === currentFood.pos.x && nextHead.y === currentFood.pos.y) {
      ateFood = true;
      const mult = isBoostingRef.current ? 2 : 1;
      pointsEarned = currentFood.points * mult;

      if (currentFood.type === 'INSECT') {
        audio.playEatInsect();
        triggerHaptic('insect');
        createExplosion(nextHead.x, nextHead.y, 16);
        // Bonus insect grants large battery recharge (+25%)
        const recharged = Math.min(100, batteryLevelRef.current + 25);
        batteryLevelRef.current = recharged;
        setBatteryLevel(recharged);
      } else if (currentFood.type === 'TURBO') {
        audio.playSpeedBoost();
        triggerHaptic('boost');
        createExplosion(nextHead.x, nextHead.y, 12);
        const recharged = Math.min(100, batteryLevelRef.current + 20);
        batteryLevelRef.current = recharged;
        setBatteryLevel(recharged);
      } else {
        audio.playEatFruit();
        triggerHaptic('eat');
        createExplosion(nextHead.x, nextHead.y, 8);
        // Normal fruit gives small battery sip (+4%)
        const recharged = Math.min(100, batteryLevelRef.current + 4);
        batteryLevelRef.current = recharged;
        setBatteryLevel(recharged);
      }
    } else {
      audio.playMoveTick();
    }

    // 6. Update Snake Body
    const newSnake = [nextHead, ...snakeRef.current];
    if (!ateFood) {
      newSnake.pop();
    }
    snakeRef.current = newSnake;
    setSnake(newSnake);

    if (ateFood) {
      setScore((prev) => prev + pointsEarned);
    }

    // 7. Update Food and Timed Insects
    ticksSinceLastInsectRef.current += 1;

    if (ateFood) {
      // Spawn standard fruit
      const newFruit = spawnFood('FRUIT');
      foodRef.current = newFruit;
      setFood(newFruit);
    } else if (currentFood && currentFood.type === 'INSECT') {
      const remaining = (currentFood.timer || 0) - 1;
      if (remaining <= 0) {
        // Insect expired! Revert to normal fruit
        const newFruit = spawnFood('FRUIT');
        foodRef.current = newFruit;
        setFood(newFruit);
        setBonusTimerRatio(1);
      } else {
        // Scurry insect occasionally (every 4 ticks)
        let scurriedPos = currentFood.pos;
        if (remaining % 4 === 0 && Math.random() > 0.4) {
          const dirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
          ];
          const rd = dirs[Math.floor(Math.random() * dirs.length)];
          const testX = (currentFood.pos.x + rd.x + GRID_COLS) % GRID_COLS;
          const testY = (currentFood.pos.y + rd.y + GRID_ROWS) % GRID_ROWS;
          const isBlocked =
            newSnake.some((s) => s.x === testX && s.y === testY) ||
            currentMazeRef.current.obstacles.some((o) => o.x === testX && o.y === testY);
          if (!isBlocked) {
            scurriedPos = { x: testX, y: testY };
          }
        }

        const updatedBug: Pickup = {
          ...currentFood,
          pos: scurriedPos,
          timer: remaining,
        };
        foodRef.current = updatedBug;
        setFood(updatedBug);
        setBonusTimerRatio(remaining / (currentFood.maxTimer || INSECT_LIFETIME_TICKS));
      }
    } else if (
      ticksSinceLastInsectRef.current > INSECT_INTERVAL_TICKS &&
      (!currentFood || currentFood.type === 'FRUIT')
    ) {
      // Chance to spawn bonus insect
      if (Math.random() > 0.6) {
        ticksSinceLastInsectRef.current = 0;
        const bug = spawnFood('INSECT');
        foodRef.current = bug;
        setFood(bug);
        setBonusTimerRatio(1);
      }
    }

    // 8. Update Particles
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life + 1,
        }))
        .filter((p) => p.life < p.maxLife)
    );

    // 9. Realistic Nokia Battery Depletion (depletes slowly over ~100-120 seconds to build urgency)
    const drain = isBoostingRef.current ? 0.16 : 0.08;
    const newBattery = Math.max(0, batteryLevelRef.current - drain);
    batteryLevelRef.current = newBattery;
    setBatteryLevel(newBattery);

    // Trigger authentic Nokia low battery double-beep alert periodically when critical (<= 15%)
    if (newBattery <= 15 && Date.now() - lastLowBatterySoundRef.current > 14000) {
      lastLowBatterySoundRef.current = Date.now();
      audio.playLowBatteryAlert();
    }
  }, [handleGameOver, spawnFood, createExplosion]);

  // Game Loop Interval Manager
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (gameLoopTimerRef.current !== null) {
        clearInterval(gameLoopTimerRef.current);
        gameLoopTimerRef.current = null;
      }
      return;
    }

    // Calculate tick duration based on speed level and turbo boost
    const baseInterval = Math.max(55, 200 - speedLevel * 16);
    const interval = isBoosting ? TURBO_SPEED_MS : baseInterval;

    audio.setTurboBgm(isBoosting);

    if (gameLoopTimerRef.current !== null) {
      clearInterval(gameLoopTimerRef.current);
    }

    gameLoopTimerRef.current = window.setInterval(tick, interval);

    return () => {
      if (gameLoopTimerRef.current !== null) {
        clearInterval(gameLoopTimerRef.current);
        gameLoopTimerRef.current = null;
      }
    };
  }, [gameState, isBoosting, speedLevel, tick]);

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    const initialSnake: Point[] = [
      { x: 14, y: 10 },
      { x: 13, y: 10 },
      { x: 12, y: 10 },
      { x: 11, y: 10 },
    ];
    setSnake(initialSnake);
    snakeRef.current = initialSnake;

    setSnakeDir('RIGHT');
    dirRef.current = 'RIGHT';
    inputQueueRef.current = [];

    const initialFood = spawnFood('FRUIT');
    setFood(initialFood);
    foodRef.current = initialFood;

    setScore(0);
    setParticles([]);
    setIsBoosting(false);
    setIsNewHigh(false);
    ticksSinceLastInsectRef.current = 0;
    setBatteryLevel(100);
    batteryLevelRef.current = 100;
    lastLowBatterySoundRef.current = 0;

    setGameState('PLAYING');
    audio.playButton();
    audio.startBgm();
  }, [spawnFood]);

  // Pause / Resume
  const handlePauseToggle = useCallback(() => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
      audio.stopBgm();
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      audio.startBgm();
    }
  }, [gameState]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll with arrows / space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        handleDirection('UP');
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        handleDirection('DOWN');
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        handleDirection('LEFT');
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        handleDirection('RIGHT');
      } else if (e.code === 'Space') {
        if (gameStateRef.current === 'TITLE' || gameStateRef.current === 'GAME_OVER') {
          handleStartGame();
        } else if (gameStateRef.current === 'PLAYING') {
          setIsBoosting(true);
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        handlePauseToggle();
      } else if (e.code === 'KeyM') {
        handleToggleSound();
      } else if (e.code === 'KeyT') {
        handleThemeCycle();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsBoosting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleDirection, handleStartGame, handlePauseToggle, handleToggleSound, handleThemeCycle]);

  // Current top score
  const topHighScore = highScores.length > 0 ? highScores[0].score : 0;

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-stone-950 p-2 sm:p-4 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-900">
      {/* Android Handset Chassis Container */}
      <div className="relative w-full max-w-[420px] rounded-[36px] bg-stone-900 border-[6px] sm:border-[8px] border-stone-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-3 sm:p-4 flex flex-col items-center overflow-hidden">
        
        {/* Android Phone Top Speaker & Camera Bezel */}
        <div className="w-full flex items-center justify-between px-6 pt-1 pb-2">
          {/* Selfie Camera Pinhole */}
          <div className="w-3.5 h-3.5 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40" />
          </div>

          {/* Earpiece Speaker Slit */}
          <div className="w-16 h-1.5 rounded-full bg-stone-950 border border-stone-800" />

          {/* Nostalgic Nokia Logo Badge */}
          <div className="font-pixel text-[10px] tracking-widest text-stone-400 font-bold uppercase select-none">
            NOKIA
          </div>
        </div>

        {/* Nostalgic LCD Screen Bezel Frame */}
        <div className="w-full my-1 rounded-2xl p-2 sm:p-2.5 bg-stone-950 border-2 border-stone-800 shadow-inner">
          <NokiaScreen
            snake={snake}
            snakeDir={snakeDir}
            food={food}
            obstacles={currentMaze.obstacles}
            particles={particles}
            theme={theme}
            score={score}
            highScore={topHighScore}
            multiplier={isBoosting ? 2 : 1}
            isBoosting={isBoosting}
            bonusTimerRatio={bonusTimerRatio}
            gameState={gameState}
            onStart={handleStartGame}
            onPauseToggle={handlePauseToggle}
            onReset={handleStartGame}
            onOpenMazes={() => setShowMazeModal(true)}
            onOpenScores={() => setShowScoresModal(true)}
            soundMode={soundMode}
            onToggleSound={handleToggleSound}
            currentMazeName={currentMaze.name}
            speedLevel={speedLevel}
            batteryLevel={batteryLevel}
            isNewHigh={isNewHigh}
          />
        </div>

        {/* Physical On-Screen Keypad & Ergonomic Touch D-Pad */}
        <div className="w-full mt-1">
          <ControlsPad
            onDirection={handleDirection}
            onTurboStart={() => setIsBoosting(true)}
            onTurboEnd={() => setIsBoosting(false)}
            isBoosting={isBoosting}
            gameState={gameState}
            onStart={handleStartGame}
            onPauseToggle={handlePauseToggle}
            onThemeCycle={handleThemeCycle}
            onOpenMazes={() => setShowMazeModal(true)}
            onOpenScores={() => setShowScoresModal(true)}
            soundMode={soundMode}
            onToggleSound={handleToggleSound}
            theme={theme}
          />
        </div>

        {/* Bottom Android Home Indicator Line */}
        <div className="w-32 h-1 rounded-full bg-stone-700/60 mt-2 mb-0.5" />
      </div>

      {/* Maze & Speed Selector Modal */}
      {showMazeModal && (
        <MazeSelectorModal
          currentMazeId={currentMazeId}
          onSelectMaze={(m) => {
            setCurrentMazeId(m.id);
            setStoredMaze(m.id);
          }}
          speedLevel={speedLevel}
          onSpeedChange={(spd) => setSpeedLevel(spd)}
          onClose={() => setShowMazeModal(false)}
          theme={theme}
        />
      )}

      {/* High Scores Modal */}
      {showScoresModal && (
        <LeaderboardModal
          scores={highScores}
          onClose={() => setShowScoresModal(false)}
          theme={theme}
        />
      )}
    </main>
  );
}
