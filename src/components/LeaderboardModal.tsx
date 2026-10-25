import React from 'react';
import { HighScoreRecord, ThemeColors } from '../types';
import { X, Trophy, Medal } from 'lucide-react';
import { audio } from '../utils/audio';

interface LeaderboardModalProps {
  scores: HighScoreRecord[];
  onClose: () => void;
  theme: ThemeColors;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  scores,
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
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-pixel text-xs text-stone-100 font-bold tracking-wider">
                HIGH SCORES
              </h2>
              <p className="text-[11px] font-mono text-stone-400">
                Top records saved locally
              </p>
            </div>
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

        {/* Scores Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-stone-500 font-mono text-sm">
              No scores recorded yet. Play a game to set a high score!
            </div>
          ) : (
            scores.map((rec, index) => {
              const isTop = index === 0;
              return (
                <div
                  key={rec.id || index}
                  className={`p-2.5 rounded-xl border flex items-center justify-between font-mono text-xs ${
                    isTop
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                      : 'bg-stone-900/60 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span>{rec.maze || 'Open Arena'}</span>
                        <span className="text-[10px] text-stone-500 font-normal">
                          Spd {rec.speed || 5}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Length: {rec.length || 0} segments · {rec.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-pixel text-sm text-stone-100 font-bold tabular-nums">
                      {rec.score}
                    </span>
                    <span className="text-[10px] text-stone-500 block">PTS</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => {
              audio.playButton();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl font-pixel text-xs bg-stone-100 text-stone-900 hover:bg-white font-bold active:scale-[0.98]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
