'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BATTLE_RIVALS,
  generateBattleRound,
  isWinningBattleCard,
} from '@/lib/game-logic';
import { soundEngine } from '@/lib/sound-engine';

interface SuujiBattleGameProps {
  onEarnStar: () => void;
  onBackHome: () => void;
}

export default function SuujiBattleGame({
  onEarnStar,
  onBackHome,
}: SuujiBattleGameProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [firingBeam, setFiringBeam] = useState(false);
  const [chosenCard, setChosenCard] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const currentRound = useMemo(() => {
    const rival = BATTLE_RIVALS[roundIdx % BATTLE_RIVALS.length];
    return generateBattleRound(rival, (roundIdx + 1) % 3);
  }, [roundIdx]);

  useEffect(() => {
    soundEngine.speak(
      `ライバルの パワーは ${currentRound.rival.power} だ！ ${currentRound.rival.power} より おおきい すうじで かめはめ波を うて！`
    );
  }, [currentRound]);

  const handleSelectCard = (num: number) => {
    if (firingBeam) return;
    setChosenCard(num);

    if (isWinningBattleCard(num, currentRound.rival.power)) {
      setFiringBeam(true);
      setFeedback(`かめはめ波ーー！！ パワー「${num}」で ぶっとばしたぞ！`);
      soundEngine.playBeamExplosion();
      soundEngine.speak(`かめはめ波ー！やったー！パワー ${num} で かったぞ！`);
      onEarnStar();
    } else {
      setFeedback(
        `パワー「${num}」は「${currentRound.rival.power}」より ちいさいぞ！もっと おおきい すうじを えらぼう！`
      );
      soundEngine.playWrong();
      soundEngine.speak(
        `おしい！${currentRound.rival.power} より おおきい すうじを えらんでね！`
      );
    }
  };

  const handleNextBattle = () => {
    setFiringBeam(false);
    setChosenCard(null);
    setFeedback('');
    setRoundIdx((prev) => prev + 1);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${firingBeam ? 'animate-shake' : ''}`}>
      {/* ヘッダーバー */}
      <div className="flex items-center justify-between gap-3 mb-4 bg-slate-900/90 border-2 border-orange-400/50 rounded-3xl px-5 py-3">
        <button
          type="button"
          onClick={onBackHome}
          className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-lg font-extrabold text-white active:scale-95 transition-transform whitespace-nowrap shrink-0"
        >
          🏠 ホームへ もどる
        </button>

        <button
          type="button"
          onClick={() =>
            soundEngine.speak(
              `${currentRound.rival.power} より おおきい すうじで かめはめ波を うて！`
            )
          }
          className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 border-2 border-sky-200 text-lg font-extrabold text-slate-950 active:scale-95 transition-transform whitespace-nowrap shrink-0"
        >
          🔊 もんだいを きく
        </button>
      </div>

      {/* バトルアリーナ */}
      <div className="bg-gradient-to-b from-orange-950/90 via-slate-900 to-slate-900 border-4 border-orange-400 rounded-[32px] p-4 md:p-6 shadow-2xl">
        {/* 問題コールアウト */}
        <div className="text-center mb-3">
          <div className="inline-block bg-orange-400 text-slate-950 font-extrabold text-xl md:text-2xl px-5 py-2 rounded-2xl shadow-md">
            「<span className="num-tabular text-red-700 text-3xl">{currentRound.rival.power}</span>」より{' '}
            <span className="underline decoration-4 decoration-red-600">おおきい</span> すうじで かめはめ波を うて！
          </div>
        </div>

        {/* ヒーロー vs ライバル 対決ステージ */}
        <div className="relative bg-slate-950/90 border-4 border-amber-500/60 rounded-3xl p-4 mb-4 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 min-h-[168px]">
          {/* 味方ヒーロー */}
          <div className="flex flex-col items-center z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 border-4 border-yellow-200 flex items-center justify-center text-5xl shadow-lg">
              🥋
            </div>
            <span className="mt-1.5 font-extrabold text-amber-300 text-base">
              スーパー ヒーロー
            </span>
          </div>

          {/* ド派手かめはめ波ビームエフェクト */}
          {firingBeam && (
            <div
              data-testid="kamehameha-beam"
              className="flex-1 h-16 rounded-full bg-gradient-to-r from-sky-300 via-cyan-200 to-white shadow-[0_0_45px_#38bdf8] animate-beam flex items-center justify-center z-20 px-5"
            >
              <span className="text-slate-950 font-extrabold text-2xl md:text-3xl tracking-wider whitespace-nowrap">
                ⚡ ドカーーーン！！ ⚡
              </span>
            </div>
          )}

          {!firingBeam && (
            <div className="text-2xl md:text-3xl font-extrabold text-orange-400">
              ⚡ VS ⚡
            </div>
          )}

          {/* 敵ライバル＆戦闘力表示 */}
          <div
            className={`flex flex-col items-center bg-slate-900/90 border-3 border-rose-500 rounded-3xl px-5 py-3 z-10 transition-transform duration-500 ${
              firingBeam ? 'translate-x-16 -rotate-45 scale-75 opacity-40' : ''
            }`}
          >
            <div className="text-5xl mb-0.5">{currentRound.rival.emoji}</div>
            <div className="text-base font-extrabold text-rose-300 mb-1">
              {currentRound.rival.name}
            </div>
            <div className="flex items-center gap-2 bg-rose-950 border-2 border-rose-400 rounded-2xl px-3 py-1">
              <span className="text-sm font-extrabold text-rose-200">パワー：</span>
              <span
                data-testid="rival-power"
                className="num-tabular text-3xl font-extrabold text-amber-300"
              >
                {currentRound.rival.power}
              </span>
            </div>
            {/* 同じ数の★マーク */}
            <div className="flex flex-wrap justify-center gap-1 mt-1 max-w-[180px]">
              {Array.from({ length: currentRound.rival.power }).map((_, i) => (
                <span key={i} className="text-lg text-amber-400">
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* フィードバック表示 */}
        <div className="min-h-[38px] text-center mb-3">
          {feedback ? (
            <p
              className={`inline-block px-5 py-1.5 rounded-2xl font-extrabold text-lg md:text-xl ${
                firingBeam
                  ? 'bg-emerald-500 text-slate-950 animate-pop'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {feedback}
            </p>
          ) : (
            <p className="text-amber-200 font-bold text-lg">
              したの 3まいの カードから、いちばん つよい すうじを タッチしよう！
            </p>
          )}
        </div>

        {/* 手札の3枚の数字カード（数字 ＋ 数えやすい●ドット付き） */}
        {!firingBeam ? (
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
            {currentRound.cards.map((num, idx) => {
              const isSelectedWrong = chosenCard === num && !firingBeam;
              return (
                <button
                  key={`${num}-${idx}`}
                  type="button"
                  onClick={() => handleSelectCard(num)}
                  className={`rounded-3xl p-3 md:p-4 border-4 shadow-xl transition-transform active:scale-95 flex flex-col items-center justify-between min-h-[145px] md:min-h-[160px] ${
                    isSelectedWrong
                      ? 'bg-slate-800 border-slate-600 text-slate-400'
                      : 'bg-gradient-to-b from-sky-500 to-blue-700 hover:from-sky-400 hover:to-blue-600 border-cyan-200 text-white'
                  }`}
                >
                  <span className="text-xs font-extrabold text-cyan-100">
                    エネルギー カード
                  </span>
                  <span className="num-tabular text-5xl md:text-6xl font-extrabold leading-none my-1">
                    {num}
                  </span>
                  {/* 4歳児が指で数えられる●ドット */}
                  <div
                    aria-label={`${num}この ドット`}
                    className="grid grid-cols-3 gap-1.5 bg-slate-950/50 rounded-2xl p-2 w-full justify-items-center"
                  >
                    {Array.from({ length: num }).map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-amber-300 border border-white inline-block shadow-sm"
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleNextBattle}
              className="px-10 py-4 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 border-4 border-white text-slate-950 font-extrabold text-2xl md:text-3xl shadow-2xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
            >
              つぎの ライバルと たたかう ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
