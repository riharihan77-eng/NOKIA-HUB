import React from 'react';
import { MAZES } from '../utils/constants';
import { MazeConfig, ThemeColors } from '../types';
import { X, Check } from 'lucide-react';
import { audio } from '../utils/audio';
import { triggerHaptic } from '../utils/vibrate';

interface MazeSelectorModalProps {
  currentMazeId: string;
  onSelectMaze: (maze: MazeConfig) => void;
  speedLevel: number;
  onSpeedChange: (speed: number) => void;
  onClose: () => void;
  theme: ThemeColors;
}

export const MazeSelectorModal: React.FC<MazeSelectorModalProps> = ({
  currentMazeId,
  onSelectMaze,
  speedLevel,
  onSpeedChange,
  onClose,
  theme,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div 
        className="w-full max-w-md rounded-2xl p-4 border-2 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: '#1c1917', borderColor: theme.pixel }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2 mb-3 border-stone-800">
          <div>
            <h2 className="font-pixel text-xs text-stone-100 font-bold tracking-wider">
              SELECT MAZE & SPEED
            </h2>
            <p className="text-[11px] font-mono text-stone-400 mt-0.5">
              Classic Nokia Snake II maps & obstacles
            </p>
          </div>
          <button
            onClick={() => {
              audio.playButton();
              onClose();
            }}
            className="p-1 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Selector Slider (1 to 9 like vintage Nokia 3310) */}
        <div className="bg-stone-900 rounded-xl p-3 mb-3 border border-stone-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-semibold text-stone-300">Base Speed Level:</span>
            <span className="font-pixel text-xs text-amber-400">Level {speedLevel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  audio.playButton();
                  triggerHaptic('tap');
                  onSpeedChange(lvl);
                }}
                className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  speedLevel === lvl
                    ? 'bg-amber-500 text-stone-950 scale-105 shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-1 px-1">
            <span>Beginner</span>
            <span>Classic</span>
            <span>Master</span>
          </div>
        </div>

        {/* Mazes List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {MAZES.map((m) => {
            const isSelected = m.id === currentMazeId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  audio.playButton();
                  triggerHaptic('tap');
                  onSelectMaze(m);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-stone-800/90 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-[11px] text-stone-100 font-bold">
                      {m.name}
                    </span>
                    {m.wrapWalls ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Wrap Border
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                        Solid Walls
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-stone-400 mt-1">
                    {m.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="p-1.5 rounded-full bg-amber-500 text-stone-950 shrink-0 ml-2">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Done */}
        <div className="mt-3 pt-2 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => {
              audio.playButton();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl font-pixel text-xs bg-stone-100 text-stone-900 hover:bg-white font-bold active:scale-[0.98]"
          >
            CONFIRM SELECTION
          </button>
        </div>
      </div>
    </div>
  );
};
