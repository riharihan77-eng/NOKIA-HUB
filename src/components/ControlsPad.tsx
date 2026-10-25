import React from 'react';
import { Direction, GameState, SoundMode, ThemeColors } from '../types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Play, Pause, Palette, Trophy, MapPin, Volume2, VolumeX } from 'lucide-react';
import { audio } from '../utils/audio';
import { triggerHaptic } from '../utils/vibrate';

interface ControlsPadProps {
  onDirection: (dir: Direction) => void;
  onTurboStart: () => void;
  onTurboEnd: () => void;
  isBoosting: boolean;
  gameState: GameState;
  onStart: () => void;
  onPauseToggle: () => void;
  onThemeCycle: () => void;
  onOpenMazes: () => void;
  onOpenScores: () => void;
  soundMode: SoundMode;
  onToggleSound: () => void;
  theme: ThemeColors;
}

export const ControlsPad: React.FC<ControlsPadProps> = ({
  onDirection,
  onTurboStart,
  onTurboEnd,
  isBoosting,
  gameState,
  onStart,
  onPauseToggle,
  onThemeCycle,
  onOpenMazes,
  onOpenScores,
  soundMode,
  onToggleSound,
  theme,
}) => {
  const handleDir = (dir: Direction) => {
    audio.playButton();
    triggerHaptic('tap');
    onDirection(dir);
  };

  const handleTurboDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    audio.playSpeedBoost();
    triggerHaptic('boost');
    onTurboStart();
  };

  const handleTurboUp = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onTurboEnd();
  };

  return (
    <div className="w-full flex flex-col items-center select-none pt-2 pb-1">
      {/* Top Secondary Action Soft Keys (Vintage Nokia Style) */}
      <div className="w-full max-w-sm grid grid-cols-4 gap-2 mb-3 px-2">
        {/* Play / Pause Soft Button */}
        <button
          onClick={() => {
            audio.playButton();
            triggerHaptic('tap');
            if (gameState === 'TITLE' || gameState === 'GAME_OVER') {
              onStart();
            } else {
              onPauseToggle();
            }
          }}
          className="btn-tactile h-11 flex flex-col items-center justify-center rounded-xl bg-stone-800 text-stone-200 border border-stone-700 active:bg-stone-700"
          title={gameState === 'PLAYING' ? 'Pause Game (Esc)' : 'Start / Resume Game (Space)'}
        >
          {gameState === 'PLAYING' ? (
            <>
              <Pause className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-mono mt-0.5 font-semibold">PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-mono mt-0.5 font-semibold">START</span>
            </>
          )}
        </button>

        {/* Mazes Selector Button */}
        <button
          onClick={() => {
            audio.playButton();
            triggerHaptic('tap');
            onOpenMazes();
          }}
          className="btn-tactile h-11 flex flex-col items-center justify-center rounded-xl bg-stone-800 text-stone-200 border border-stone-700 active:bg-stone-700"
          title="Select Maze / Obstacle Map"
        >
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-[9px] font-mono mt-0.5 font-semibold">MAZES</span>
        </button>

        {/* Theme Color Cycle Button */}
        <button
          onClick={() => {
            audio.playButton();
            triggerHaptic('tap');
            onThemeCycle();
          }}
          className="btn-tactile h-11 flex flex-col items-center justify-center rounded-xl bg-stone-800 text-stone-200 border border-stone-700 active:bg-stone-700"
          title={`Theme: ${theme.name} (Click to switch)`}
        >
          <Palette className="w-4 h-4 text-yellow-400" />
          <span className="text-[9px] font-mono mt-0.5 font-semibold">THEME</span>
        </button>

        {/* High Scores Leaderboard Button */}
        <button
          onClick={() => {
            audio.playButton();
            triggerHaptic('tap');
            onOpenScores();
          }}
          className="btn-tactile h-11 flex flex-col items-center justify-center rounded-xl bg-stone-800 text-stone-200 border border-stone-700 active:bg-stone-700"
          title="View High Scores"
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span className="text-[9px] font-mono mt-0.5 font-semibold">SCORES</span>
        </button>
      </div>

      {/* Main Ergonomic Android Touch D-Pad */}
      <div className="relative w-56 h-56 sm:w-60 sm:h-60 flex items-center justify-center">
        {/* Outer D-Pad Base Disk */}
        <div className="absolute inset-0 rounded-full bg-stone-950/80 border-4 border-stone-800 shadow-2xl" />

        {/* UP BUTTON */}
        <button
          onPointerDown={() => handleDir('UP')}
          className="absolute top-2 w-16 h-14 btn-tactile rounded-t-2xl rounded-b-md bg-stone-800 border-t border-x border-stone-600 flex items-center justify-center text-stone-200 active:bg-stone-700 z-10"
          aria-label="Move Up"
        >
          <ArrowUp className="w-6 h-6 text-stone-100" />
        </button>

        {/* DOWN BUTTON */}
        <button
          onPointerDown={() => handleDir('DOWN')}
          className="absolute bottom-2 w-16 h-14 btn-tactile rounded-b-2xl rounded-t-md bg-stone-800 border-b border-x border-stone-600 flex items-center justify-center text-stone-200 active:bg-stone-700 z-10"
          aria-label="Move Down"
        >
          <ArrowDown className="w-6 h-6 text-stone-100" />
        </button>

        {/* LEFT BUTTON */}
        <button
          onPointerDown={() => handleDir('LEFT')}
          className="absolute left-2 h-16 w-14 btn-tactile rounded-l-2xl rounded-r-md bg-stone-800 border-l border-y border-stone-600 flex items-center justify-center text-stone-200 active:bg-stone-700 z-10"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6 text-stone-100" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onPointerDown={() => handleDir('RIGHT')}
          className="absolute right-2 h-16 w-14 btn-tactile rounded-r-2xl rounded-l-md bg-stone-800 border-r border-y border-stone-600 flex items-center justify-center text-stone-200 active:bg-stone-700 z-10"
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6 text-stone-100" />
        </button>

        {/* CENTER TURBO BOOST BUTTON */}
        <button
          onPointerDown={handleTurboDown}
          onPointerUp={handleTurboUp}
          onPointerLeave={handleTurboUp}
          onTouchStart={handleTurboDown}
          onTouchEnd={handleTurboUp}
          className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all z-20 ${
            isBoosting
              ? 'bg-amber-500 border-amber-300 text-stone-950 scale-95 shadow-inner'
              : 'bg-stone-900 border-stone-700 text-amber-400 active:scale-95 shadow-md'
          }`}
          title="HOLD or TAP for Turbo Speed Boost"
          aria-label="Turbo Boost"
        >
          <Zap className={`w-5 h-5 ${isBoosting ? 'animate-bounce text-stone-950 fill-stone-950' : 'fill-amber-400'}`} />
          <span className="text-[8px] font-pixel font-bold mt-0.5 tracking-tighter">
            {isBoosting ? 'TURBO' : 'BOOST'}
          </span>
        </button>
      </div>

      {/* Quick Audio Mute & Instructions Pill */}
      <div className="w-full max-w-xs mt-2 flex items-center justify-between text-[11px] text-stone-400 font-mono px-2">
        <button
          onClick={() => {
            audio.playButton();
            triggerHaptic('tap');
            onToggleSound();
          }}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-stone-900 border border-stone-800 hover:text-stone-200 active:scale-95"
        >
          {soundMode === 'ALL' ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chiptune BGM + SFX</span>
            </>
          ) : soundMode === 'SFX_ONLY' ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>SFX Only</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Muted</span>
            </>
          )}
        </button>

        <span className="text-[10px] text-stone-500">Hold Boost for 2X</span>
      </div>
    </div>
  );
};
