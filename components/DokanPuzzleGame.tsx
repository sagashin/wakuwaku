'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  COURSE_STAGES,
  CoursePlayerState,
  countStageCoins,
  stepCoursePlayer,
} from '@/lib/game-logic';
import { soundEngine } from '@/lib/sound-engine';

interface DokanPuzzleGameProps {
  onEarnStar: () => void;
  onBackHome: () => void;
}

export default function DokanPuzzleGame({
  onEarnStar,
  onBackHome,
}: DokanPuzzleGameProps) {
  const [mode, setMode] = useState<'pipe' | 'maze'>('pipe');

  // === モードA（どかんワープ）の状態 ===
  const [pipeRound, setPipeRound] = useState(0);
  const [pipePhase, setPipePhase] = useState<'entering' | 'shuffling' | 'guess' | 'found'>('entering');
  const [targetPipe, setTargetPipe] = useState<number>(1);
  const [pipePositions, setPipePositions] = useState<[number, number, number]>([0, 1, 2]);
  const [wrongPipe, setWrongPipe] = useState<number | null>(null);

  const startPipeRound = useCallback((roundNum: number) => {
    const startIdx = (roundNum + 1) % 3;
    const t0 = setTimeout(() => {
      setTargetPipe(startIdx);
      setWrongPipe(null);
      setPipePositions([0, 1, 2]);
      setPipePhase('entering');
      soundEngine.speak('スターが どかんに はいるよ！よーく みていてね！');
    }, 0);

    const t1 = setTimeout(() => {
      soundEngine.playPipeWarp();
      setPipePhase('shuffling');
      // 3回シャッフル演出
      setPipePositions([1, 2, 0]);
    }, 900);

    const t2 = setTimeout(() => {
      setPipePositions([2, 0, 1]);
    }, 1350);

    const t3 = setTimeout(() => {
      const finalSpot = (roundNum * 2 + 1) % 3;
      setTargetPipe(finalSpot);
      setPipePositions([0, 1, 2]);
      setPipePhase('guess');
      soundEngine.speak('どかんが うごいたよ！どこから でてくるかな？タッチしてね！');
    }, 1800);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (mode === 'pipe') {
      return startPipeRound(pipeRound);
    }
  }, [mode, pipeRound, startPipeRound]);

  const handleClickPipe = (idx: number) => {
    if (pipePhase !== 'guess') return;
    if (idx === targetPipe) {
      setPipePhase('found');
      setWrongPipe(null);
      soundEngine.playFanfare(false);
      soundEngine.speak('やったー！ここだよ！だいせいかい！');
      onEarnStar();
    } else {
      setWrongPipe(idx);
      soundEngine.playWrong();
      soundEngine.speak('あれれ？ちがう どかんだよ！もういっかい タッチしよう！');
    }
  };

  // === モードB（5×5 やじるしゴール）の状態 ===
  const [stageIdx, setStageIdx] = useState(0);
  const currentStage = COURSE_STAGES[stageIdx % COURSE_STAGES.length];

  const [playerState, setPlayerState] = useState<CoursePlayerState>(() => ({
    r: currentStage.start.r,
    c: currentStage.start.c,
    collectedCoins: [],
    totalCoins: countStageCoins(currentStage.grid),
    reachedGoal: false,
    bumpedRock: false,
  }));

  const initMazeStage = useCallback((idx: number) => {
    const st = COURSE_STAGES[idx % COURSE_STAGES.length];
    setPlayerState({
      r: st.start.r,
      c: st.start.c,
      collectedCoins: [],
      totalCoins: countStageCoins(st.grid),
      reachedGoal: false,
      bumpedRock: false,
    });
  }, []);

  const handleSwitchMode = (nextMode: 'pipe' | 'maze') => {
    setMode(nextMode);
    if (nextMode === 'maze') {
      initMazeStage(stageIdx);
      soundEngine.speak('やじるしボタンを おして、コインを あつめながら ハテナブロックへ すすもう！');
    }
  };

  const handleMove = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right') => {
      setPlayerState((prev) => {
        if (prev.reachedGoal) return prev;
        const next = stepCoursePlayer(prev, currentStage.grid, dir);
        if (next.bumpedRock) {
          soundEngine.playWrong();
          return next;
        }
        if (next.collectedCoins.length > prev.collectedCoins.length) {
          soundEngine.playCoin();
        } else {
          soundEngine.playPipeWarp();
        }
        if (next.reachedGoal && !prev.reachedGoal) {
          soundEngine.playFanfare(false);
          soundEngine.speak('ゴール！ハテナブロックに たどりついたよ！すごーい！');
          setTimeout(() => {
            onEarnStar();
          }, 150);
        }
        return next;
      });
    },
    [currentStage.grid, onEarnStar]
  );

  // キーボードの矢印キーでも操作可能にする
  useEffect(() => {
    if (mode !== 'maze') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMove('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleMove('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMove('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMove('right');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, handleMove]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ヘッダー＆モード切り替えタブ */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/90 border-2 border-emerald-400/50 rounded-3xl px-5 py-3">
        <button
          type="button"
          onClick={onBackHome}
          className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-lg font-extrabold text-white active:scale-95 transition-transform whitespace-nowrap shrink-0"
        >
          🏠 ホームへ もどる
        </button>

        {/* モードA / モードB 切替 */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border-2 border-emerald-500/40">
          <button
            type="button"
            onClick={() => handleSwitchMode('pipe')}
            className={`px-4 py-2 rounded-xl text-base md:text-lg font-extrabold transition-colors whitespace-nowrap shrink-0 ${
              mode === 'pipe'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-emerald-200 hover:bg-slate-800'
            }`}
          >
            🟢 モードA：どかんワープ
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('maze')}
            className={`px-4 py-2 rounded-xl text-base md:text-lg font-extrabold transition-colors whitespace-nowrap shrink-0 ${
              mode === 'maze'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-amber-200 hover:bg-slate-800'
            }`}
          >
            🧭 モードB：やじるしゴール
          </button>
        </div>
      </div>

      {/* === モードA：どかんワープ === */}
      {mode === 'pipe' && (
        <div className="bg-gradient-to-b from-sky-900/90 via-emerald-950 to-slate-900 border-4 border-emerald-400 rounded-[32px] p-6 md:p-8 shadow-2xl text-center">
          <div className="inline-block bg-emerald-400 text-slate-950 font-extrabold text-2xl md:text-3xl px-6 py-3 rounded-2xl shadow-md mb-4">
            {pipePhase === 'entering' && '🌟 スターが どかんに はいるよ！'}
            {pipePhase === 'shuffling' && '🔄 どかんが シャッフル しているよ！'}
            {pipePhase === 'guess' && '❓ どの どかんから でてくるかな？タッチしよう！'}
            {pipePhase === 'found' && '🎉 だいせいかい！スターが でてきたよ！'}
          </div>

          {/* 3本の緑の土管ステージ */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto my-8 pt-12">
            {[0, 1, 2].map((pipeIdx) => {
              const showStarOnTop =
                (pipePhase === 'entering' && pipeIdx === targetPipe) ||
                (pipePhase === 'found' && pipeIdx === targetPipe);
              const isWrong = wrongPipe === pipeIdx;
              const offsetSlot = pipePositions[pipeIdx] - pipeIdx;

              return (
                <button
                  key={pipeIdx}
                  type="button"
                  onClick={() => handleClickPipe(pipeIdx)}
                  style={{
                    transform:
                      pipePhase === 'shuffling'
                        ? `translateX(${offsetSlot * 28}px)`
                        : 'translateX(0px)',
                    transition: 'transform 0.35s ease-in-out',
                  }}
                  aria-label={`どかん ${pipeIdx + 1}`}
                  className="group relative flex flex-col items-center focus:outline-none active:scale-95"
                >
                  {/* 飛び出すキャラ（スター＆キノコ） */}
                  <div
                    className={`h-20 flex items-center justify-center text-6xl transition-all duration-300 ${
                      showStarOnTop
                        ? '-translate-y-2 opacity-100 scale-110'
                        : 'translate-y-12 opacity-0 scale-50'
                    }`}
                  >
                    🌟
                  </div>

                  {/* 土管のフチ（上部） */}
                  <div
                    className={`w-28 md:w-36 h-8 rounded-xl border-4 border-emerald-950 shadow-md ${
                      isWrong
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-emerald-600 via-lime-400 to-emerald-700 group-hover:brightness-110'
                    }`}
                  />

                  {/* 土管の胴体 */}
                  <div
                    className={`w-24 md:w-32 h-32 md:h-36 -mt-1 rounded-b-2xl border-4 border-emerald-950 flex flex-col items-center justify-center shadow-xl ${
                      isWrong
                        ? 'bg-rose-700'
                        : 'bg-gradient-to-r from-emerald-700 via-emerald-400 to-emerald-800 group-hover:brightness-110'
                    }`}
                  >
                    <span className="num-tabular text-3xl font-extrabold text-emerald-950 bg-white/80 w-11 h-11 rounded-full flex items-center justify-center">
                      {pipeIdx + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {pipePhase === 'found' && (
            <button
              type="button"
              onClick={() => setPipeRound((r) => r + 1)}
              className="px-10 py-5 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-white text-slate-950 font-extrabold text-3xl shadow-2xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
            >
              もういっかい シャッフルする ➡️
            </button>
          )}
        </div>
      )}

      {/* === モードB：5×5 やじるしゴール === */}
      {mode === 'maze' && (
        <div className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 border-4 border-amber-400 rounded-[32px] p-5 md:p-7 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl md:text-2xl font-extrabold text-amber-300">
              {currentStage.title}
            </h2>
            <div className="flex items-center gap-4 text-lg font-extrabold bg-slate-950 px-4 py-2 rounded-2xl border-2 border-amber-400/50">
              <span>
                🪙 コイン：<span className="num-tabular text-amber-300">{playerState.collectedCoins.length}</span> /{' '}
                <span className="num-tabular">{playerState.totalCoins}</span>
              </span>
              <button
                type="button"
                onClick={() => initMazeStage(stageIdx)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-white"
              >
                🔄 やりなおす
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* 5×5 マス目ボード */}
            <div
              data-testid="course-grid"
              className="grid grid-cols-5 gap-2 bg-slate-950 p-3 rounded-3xl border-4 border-emerald-500/60 max-w-[360px] w-full mx-auto aspect-square"
            >
              {currentStage.grid.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isPlayerHere =
                    playerState.r === rIdx && playerState.c === cIdx;
                  const coinKey = `${rIdx},${cIdx}`;
                  const hasCoin =
                    cell === 'coin' &&
                    !playerState.collectedCoins.includes(coinKey);

                  return (
                    <div
                      key={coinKey}
                      className={`rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-extrabold border-2 transition-all ${
                        isPlayerHere
                          ? 'bg-sky-500 border-white scale-105 shadow-lg'
                          : cell === 'rock'
                          ? 'bg-slate-800 border-slate-700'
                          : cell === 'goal'
                          ? 'bg-amber-400 border-yellow-100 text-slate-950 animate-pulse'
                          : 'bg-emerald-900/50 border-emerald-700/50'
                      }`}
                    >
                      {isPlayerHere ? (
                        <span data-testid="course-player">🏃</span>
                      ) : cell === 'rock' ? (
                        '🪨'
                      ) : cell === 'goal' ? (
                        '❓'
                      ) : hasCoin ? (
                        '🪙'
                      ) : (
                        ''
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 巨大やじるしコントローラー または クリア演出 */}
            <div className="flex flex-col items-center justify-center">
              {playerState.reachedGoal ? (
                <div className="text-center space-y-4 animate-pop">
                  <div className="text-6xl">🎉🍄🌟</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-amber-300">
                    ゴール クリア！！
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = stageIdx + 1;
                      setStageIdx(nextIdx);
                      initMazeStage(nextIdx);
                    }}
                    className="px-8 py-4 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-white text-slate-950 font-extrabold text-2xl shadow-xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
                  >
                    つぎの コースへ すすむ ➡️
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-xs text-center">
                  <p className="text-lg font-extrabold text-emerald-200 mb-3">
                    やじるしを タッチして「❓」へ すすもう！
                  </p>

                  {/* 十字やじるしパッド */}
                  <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
                    <div />
                    <button
                      type="button"
                      onClick={() => handleMove('up')}
                      aria-label="うえへ すすむ"
                      className="h-20 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 text-4xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      ⬆️
                    </button>
                    <div />

                    <button
                      type="button"
                      onClick={() => handleMove('left')}
                      aria-label="ひだりへ すすむ"
                      className="h-20 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 text-4xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      ⬅️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove('down')}
                      aria-label="したへ すすむ"
                      className="h-20 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 text-4xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      ⬇️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove('right')}
                      aria-label="みぎへ すすむ"
                      className="h-20 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 text-4xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      ➡️
                    </button>
                  </div>

                  {playerState.bumpedRock && (
                    <p className="mt-3 text-rose-300 font-extrabold text-base">
                      🪨 いわで すすめないよ！べつの みちを いこう！
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
