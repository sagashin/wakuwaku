'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ZukanItem,
  addStarProgress,
  SHENRON_STAR_TARGET,
} from '@/lib/game-logic';
import { soundEngine } from '@/lib/sound-engine';
import { STANDALONE_HTML_SOURCE } from '@/lib/standalone-html';
import SilhouetteGame from '@/components/SilhouetteGame';
import SuujiBattleGame from '@/components/SuujiBattleGame';
import DokanPuzzleGame from '@/components/DokanPuzzleGame';
import ShenronModal from '@/components/ShenronModal';

type ActiveScreen = 'home' | 'silhouette' | 'battle' | 'dokan';

const STORAGE_KEYS = {
  STARS: 'wakuwaku_hero_stars_v1',
  CAUGHT: 'wakuwaku_hero_caught_v1',
  CUSTOM_ITEMS: 'wakuwaku_hero_custom_items_v1',
};

export default function WakuwakuHeroLandPage() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [stars, setStars] = useState<number>(0);
  const [caughtIds, setCaughtIds] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<ZukanItem[]>([]);
  const [showShenron, setShowShenron] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [showHtmlModal, setShowHtmlModal] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // LocalStorage読み込み & ?autostart=1 対応
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      try {
        const savedStars = localStorage.getItem(STORAGE_KEYS.STARS);
        if (savedStars) setStars(Number(savedStars) || 0);

        const savedCaught = localStorage.getItem(STORAGE_KEYS.CAUGHT);
        if (savedCaught) setCaughtIds(JSON.parse(savedCaught));

        const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_ITEMS);
        if (savedCustom) setCustomItems(JSON.parse(savedCustom));
      } catch {
        // Ignore storage errors
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        setActiveScreen('silhouette');
        document.body.dataset.state = 'playing';
      } else {
        document.body.dataset.state = 'title';
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    document.body.dataset.state = activeScreen === 'home' ? 'title' : 'playing';
  }, [activeScreen]);

  const handleEarnStar = useCallback(() => {
    setStars((prev) => {
      const { nextStars, summonShenron } = addStarProgress(prev);
      try {
        localStorage.setItem(STORAGE_KEYS.STARS, String(nextStars));
      } catch {
        // Ignore storage error
      }
      if (summonShenron) {
        setTimeout(() => {
          setShowShenron(true);
        }, 550);
      }
      return nextStars;
    });
  }, []);

  const handleCatchItem = useCallback((id: string) => {
    setCaughtIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEYS.CAUGHT, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const handleAddCustomItem = useCallback((item: ZukanItem) => {
    setCustomItems((prev) => {
      const next = [item, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ITEMS, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
    if (!next) {
      soundEngine.playCoin();
      soundEngine.speak('おとを オンに したよ！');
    }
  };

  const handleSelectGame = (game: ActiveScreen, speechIntro: string) => {
    soundEngine.playCoin();
    soundEngine.speak(speechIntro);
    setActiveScreen(game);
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(STANDALONE_HTML_SOURCE);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([STANDALONE_HTML_SOURCE], {
      type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const starsInCurrentCycle =
    stars > 0 && stars % SHENRON_STAR_TARGET === 0
      ? SHENRON_STAR_TARGET
      : stars % SHENRON_STAR_TARGET;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950 px-4 py-4 md:px-6 md:py-5">
      {/* 上部 7つのスター（ドラゴンボール風）コレクションバー */}
      <div className="max-w-5xl mx-auto mb-4 bg-slate-900/95 border-4 border-amber-400 rounded-[28px] px-4 py-2.5 md:px-5 md:py-3 shadow-xl flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
        {/* 左：タイトルロゴ＆ホームボタン */}
        <button
          type="button"
          onClick={() => setActiveScreen('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
        >
          <svg
            viewBox="0 0 48 48"
            className="w-10 h-10 shrink-0 drop-shadow"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="22" fill="#F59E0B" stroke="#FEF08A" strokeWidth="3" />
            <polygon
              points="24,9 28.5,18.5 39,20 31.5,27 33.5,37.5 24,32.5 14.5,37.5 16.5,27 9,20 19.5,18.5"
              fill="#DC2626"
            />
          </svg>
          <div>
            <span className="block text-lg md:text-xl font-extrabold text-amber-300 tracking-tight group-hover:text-amber-200 whitespace-nowrap">
              わくわく ヒーロー ランド
            </span>
            <span className="block text-xs font-bold text-slate-300 whitespace-nowrap">
              ★を 7つ あつめて シェンロンを よぼう！
            </span>
          </div>
        </button>

        {/* 中央：7つのドラゴンボール風スターゲージ */}
        <div
          data-testid="star-gauge"
          className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-2xl border-2 border-amber-500/50 shrink-0"
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: SHENRON_STAR_TARGET }).map((_, idx) => {
              const filled = idx < starsInCurrentCycle;
              return (
                <span
                  key={idx}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-base md:text-lg font-extrabold border-2 transition-all duration-300 ${
                    filled
                      ? 'bg-gradient-to-br from-amber-300 via-orange-400 to-orange-600 border-yellow-100 text-red-700 shadow-[0_0_14px_rgba(250,204,21,0.85)] scale-105'
                      : 'bg-slate-800 border-slate-600 text-slate-600'
                  }`}
                >
                  ★
                </span>
              );
            })}
          </div>
          <span
            data-testid="star-count"
            className="num-tabular ml-1.5 text-lg md:text-xl font-extrabold text-amber-300 whitespace-nowrap"
          >
            {stars}こ
          </span>
        </div>

        {/* 右：音声切り替え＆パパママHTML出力ボタン */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'おとを オンにする' : 'おとを オフにする'}
            className={`px-3.5 py-2 rounded-2xl border-2 font-extrabold text-sm transition-transform active:scale-95 whitespace-nowrap shrink-0 ${
              muted
                ? 'bg-slate-800 border-slate-600 text-slate-400'
                : 'bg-emerald-600 border-emerald-300 text-white'
            }`}
          >
            {muted ? '🔇 おと オフ' : '🔊 おと オン'}
          </button>

          <button
            type="button"
            onClick={() => setShowHtmlModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-sm font-extrabold text-slate-200 active:scale-95 transition-transform whitespace-nowrap shrink-0"
          >
            👨‍👩‍👦 パパ・ママ / HTML
          </button>
        </div>
      </div>

      {/* === ホーム画面（3つのゲーム選択） === */}
      {activeScreen === 'home' && (
        <div className="max-w-5xl mx-auto">
          {/* ヒーローバナー */}
          <div className="text-center mb-7">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
              どの ゲームで あそぶ？
            </h1>
            <p className="text-lg md:text-xl font-bold text-amber-300">
              すきな ボタンを タッチして スター（★）を ゲットしよう！
            </p>
          </div>

          {/* 3つの特大ゲームカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ゲーム1：ポケモン風 シルエットずかん */}
            <div className="bg-gradient-to-b from-red-900/90 via-slate-900 to-slate-900 border-4 border-red-400 rounded-[32px] p-6 flex flex-col justify-between text-center shadow-2xl">
              <div>
                <div className="text-sm font-extrabold text-red-200 mb-2">
                  ゲーム 1 ・ ひらがな ＆ かんさつ
                </div>
                <div className="w-28 h-28 mx-auto my-3 rounded-full bg-white border-6 border-red-500 flex items-center justify-center text-6xl shadow-inner">
                  ⚡🦖
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300 mb-2">
                  だ〜れだ？
                  <br />
                  シルエット ずかん
                </h2>
                <p className="text-base font-bold text-slate-200 mb-6">
                  くろい かげの いきものや アイテムの「あたまもじ」を あてて ゲットしよう！
                </p>
              </div>
              <button
                type="button"
                data-start="true"
                onClick={() =>
                  handleSelectGame(
                    'silhouette',
                    'だーれだ？シルエットずかん！はじめるよ！'
                  )
                }
                className="w-full py-5 rounded-3xl bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 border-4 border-amber-200 text-white font-extrabold text-2xl shadow-xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
              >
                🔴 ずかんで あそぶ！
              </button>
            </div>

            {/* ゲーム2：ドラゴンボール風 ひっさつわざ！すうじバトル */}
            <div className="bg-gradient-to-b from-orange-900/90 via-slate-900 to-slate-900 border-4 border-orange-400 rounded-[32px] p-6 flex flex-col justify-between text-center shadow-2xl">
              <div>
                <div className="text-sm font-extrabold text-orange-200 mb-2">
                  ゲーム 2 ・ かずの だいしょう
                </div>
                <div className="w-28 h-28 mx-auto my-3 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-6 border-yellow-100 flex items-center justify-center text-6xl shadow-inner">
                  🥋💥
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300 mb-2">
                  ひっさつわざ！
                  <br />
                  すうじ バトル
                </h2>
                <p className="text-base font-bold text-slate-200 mb-6">
                  ライバルより「おおきい すうじ」の カードを えらんで かめはめ波を うて！
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSelectGame(
                    'battle',
                    'ひっさつわざ！すうじバトル！かめはめ波を うつぞ！'
                  )
                }
                className="w-full py-5 rounded-3xl bg-gradient-to-b from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 border-4 border-yellow-200 text-slate-950 font-extrabold text-2xl shadow-xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
              >
                🟠 バトルで あそぶ！
              </button>
            </div>

            {/* ゲーム3：マリオ風 どかん＆コースパズル */}
            <div className="bg-gradient-to-b from-emerald-900/90 via-slate-900 to-slate-900 border-4 border-emerald-400 rounded-[32px] p-6 flex flex-col justify-between text-center shadow-2xl">
              <div>
                <div className="text-sm font-extrabold text-emerald-200 mb-2">
                  ゲーム 3 ・ パズル ＆ めいろ
                </div>
                <div className="w-28 h-28 mx-auto my-3 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-700 border-6 border-lime-200 flex items-center justify-center text-6xl shadow-inner">
                  🍄🌟
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300 mb-2">
                  どかん ＆
                  <br />
                  コースパズル
                </h2>
                <p className="text-base font-bold text-slate-200 mb-6">
                  うごく どかんあてゲームと、やじるしボタンで ゴールへ すすむ パズル！
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSelectGame(
                    'dokan',
                    'どかん アンド コースパズル！レッツゴー！'
                  )
                }
                className="w-full py-5 rounded-3xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 border-4 border-lime-200 text-white font-extrabold text-2xl shadow-xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
              >
                🟢 パズルで あそぶ！
              </button>
            </div>
          </div>

          {/* 下部：7つ集めるとシェンロンが出るワクワク案内バー */}
          <div className="mt-7 bg-slate-900/90 border-2 border-amber-400/50 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🐉</span>
              <div>
                <div className="text-lg md:text-xl font-extrabold text-amber-300">
                  あと <span className="num-tabular text-2xl text-white">{SHENRON_STAR_TARGET - (stars % SHENRON_STAR_TARGET)}</span> こ スターを あつめると…
                </div>
                <div className="text-sm md:text-base font-bold text-slate-300">
                  シェンロン（りゅう）が あらわれて、パパ・ママに おねがいごとが できるよ！
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowShenron(true)}
              className="px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 border-2 border-amber-300 text-amber-200 font-extrabold text-base active:scale-95 transition-transform whitespace-nowrap shrink-0"
            >
              🐉 シェンロンを みてみる
            </button>
          </div>
        </div>
      )}

      {/* === 各ミニゲーム画面 === */}
      {activeScreen === 'silhouette' && (
        <SilhouetteGame
          onEarnStar={handleEarnStar}
          onBackHome={() => setActiveScreen('home')}
          caughtIds={caughtIds}
          onCatchItem={handleCatchItem}
          customItems={customItems}
          onAddCustomItem={handleAddCustomItem}
        />
      )}

      {activeScreen === 'battle' && (
        <SuujiBattleGame
          onEarnStar={handleEarnStar}
          onBackHome={() => setActiveScreen('home')}
        />
      )}

      {activeScreen === 'dokan' && (
        <DokanPuzzleGame
          onEarnStar={handleEarnStar}
          onBackHome={() => setActiveScreen('home')}
        />
      )}

      {/* === 7つスター達成時のシェンロンご褒美モーダル === */}
      {showShenron && <ShenronModal onClose={() => setShowShenron(false)} />}

      {/* === パパ・ママ用 管理＆単一HTMLコード出力モーダル === */}
      {showHtmlModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="パパ・ママ用メニューと単一HTML出力"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border-4 border-amber-400 rounded-[32px] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-amber-300">
                👨‍👩‍👦 パパ・ママよう メニュー ＆ HTMLコード保存
              </h2>
              <button
                type="button"
                onClick={() => setShowHtmlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold whitespace-nowrap shrink-0"
              >
                ✖ とじる
              </button>
            </div>

            <div className="space-y-4">
              {/* スター調整 */}
              <div className="bg-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-white">
                    スター（★）の かずを ちょうせい
                  </div>
                  <div className="text-xs text-slate-300">
                    いまの スター：{stars}こ
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEarnStar}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-sm"
                  >
                    ★＋1 ふやす
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStars(0);
                      localStorage.setItem(STORAGE_KEYS.STARS, '0');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold text-sm"
                  >
                    0に リセット
                  </button>
                </div>
              </div>

              {/* 単一 index.html コードのコピー＆ダウンロード */}
              <div className="bg-slate-800 rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="font-extrabold text-amber-300">
                    📄 単一HTMLファイル（index.html）として保存・コピー
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyHtml}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm"
                    >
                      {copiedHtml ? '✅ コピーしました！' : '📋 コードをコピー'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadHtml}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm"
                    >
                      💾 index.html を保存
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  aria-label="単一HTMLコード"
                  value={STANDALONE_HTML_SOURCE}
                  className="w-full h-44 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs p-3 border border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
