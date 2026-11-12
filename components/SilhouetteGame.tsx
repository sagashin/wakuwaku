'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ZukanItem,
  DEFAULT_ZUKAN_ITEMS,
  buildSilhouetteChoices,
  createCustomZukanItem,
} from '@/lib/game-logic';
import { soundEngine } from '@/lib/sound-engine';

interface SilhouetteGameProps {
  onEarnStar: () => void;
  onBackHome: () => void;
  caughtIds: string[];
  onCatchItem: (id: string) => void;
  customItems: ZukanItem[];
  onAddCustomItem: (item: ZukanItem) => void;
}

export default function SilhouetteGame({
  onEarnStar,
  onBackHome,
  caughtIds,
  onCatchItem,
  customItems,
  onAddCustomItem,
}: SilhouetteGameProps) {
  const allItems = useMemo(
    () => [...customItems, ...DEFAULT_ZUKAN_ITEMS],
    [customItems]
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [wrongChar, setWrongChar] = useState<string | null>(null);
  const [showZukanModal, setShowZukanModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);

  // パパ・ママ登録フォーム用
  const [customName, setCustomName] = useState('');
  const [customInitial, setCustomInitial] = useState('');
  const [customImagePreview, setCustomImagePreview] = useState<string>('');
  const [parentNotice, setParentNotice] = useState<string>('');

  const currentItem = allItems[questionIndex % allItems.length];
  const choices = useMemo(
    () => buildSilhouetteChoices(currentItem, (questionIndex + 1) % 3),
    [currentItem, questionIndex]
  );

  useEffect(() => {
    soundEngine.speak(
      `だーれだ？「${currentItem.initial}」から はじまるのは どれかな？`
    );
  }, [currentItem]);

  const handleSelectChoice = (ch: string) => {
    if (revealed) return;
    if (ch === currentItem.initial) {
      setRevealed(true);
      setWrongChar(null);
      soundEngine.playFanfare(false);
      soundEngine.speak(`すごーい！せいかい！${currentItem.name}、ゲットだぜ！`);
      onCatchItem(currentItem.id);
      onEarnStar();
    } else {
      setWrongChar(ch);
      soundEngine.playWrong();
      soundEngine.speak(`おしい！「${currentItem.initial}」を さがしてみてね！`);
    }
  };

  const handleNextQuestion = () => {
    setRevealed(false);
    setWrongChar(null);
    setQuestionIndex((prev) => prev + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 写真がない場合でもワンタッチで面白いSVGスタンプ画像を作れるヘルパー
  const createPresetStampDataUrl = (emoji: string, bg: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="48" fill="${bg}"/>
      <circle cx="120" cy="120" r="92" fill="#ffffff" opacity="0.2"/>
      <text x="120" y="150" font-size="110" text-anchor="middle">${emoji}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const handleSaveCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = customName.trim();
    if (!trimmedName) {
      setParentNotice('なまえ（ひらがな）を いれてください');
      return;
    }
    const imgData =
      customImagePreview || createPresetStampDataUrl('🤪', '#EC4899');
    const newItem = createCustomZukanItem({
      id: `custom-${Date.now()}`,
      name: trimmedName,
      initial: customInitial.trim() || trimmedName[0],
      customImage: imgData,
    });
    onAddCustomItem(newItem);
    setCustomName('');
    setCustomInitial('');
    setCustomImagePreview('');
    setParentNotice('ずかんもんだいに とうろくしました！');
    setShowParentModal(false);
    setQuestionIndex(0);
    setRevealed(false);
    soundEngine.playCoin();
    soundEngine.speak(`${newItem.name}を もんだいに ついかしたよ！`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ゲームヘッダーバー */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/90 border-2 border-amber-400/50 rounded-3xl px-5 py-3">
        <button
          type="button"
          onClick={onBackHome}
          className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-lg font-extrabold text-white active:scale-95 transition-transform whitespace-nowrap shrink-0"
        >
          🏠 ホームへ もどる
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowZukanModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 border-2 border-red-300 text-lg font-extrabold text-white shadow-lg active:scale-95 transition-transform whitespace-nowrap shrink-0"
          >
            📖 ずかんを みる（<span className="num-tabular">{caughtIds.length}</span>/{allItems.length}）
          </button>

          <button
            type="button"
            onClick={() => {
              setParentNotice('');
              setShowParentModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 border-2 border-pink-300 text-base font-extrabold text-white active:scale-95 transition-transform whitespace-nowrap shrink-0"
          >
            📷 パパ・ママ とうろく
          </button>
        </div>
      </div>

      {/* メインステージ */}
      <div className="bg-gradient-to-b from-red-950/90 via-slate-900 to-slate-900 border-4 border-amber-400 rounded-[32px] p-4 md:p-6 shadow-2xl text-center">
        {/* 問題読み上げバー */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <div className="bg-amber-400 text-slate-950 font-extrabold text-xl md:text-2xl px-5 py-2.5 rounded-2xl shadow-md">
            「<span className="text-red-600 text-2xl md:text-3xl">{currentItem.initial}</span>」から はじまるのは どれかな？
          </div>
          <button
            type="button"
            onClick={() =>
              soundEngine.speak(
                `「${currentItem.initial}」から はじまるのは どれかな？`
              )
            }
            aria-label="もんだいを きく"
            className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 border-2 border-sky-200 text-lg font-extrabold text-slate-950 active:scale-95 transition-transform whitespace-nowrap shrink-0"
          >
            🔊 きく
          </button>
        </div>

        {/* シルエット表示ボックス */}
        <div className="relative w-44 h-44 md:w-48 md:h-48 mx-auto mb-3 rounded-[32px] bg-gradient-to-b from-sky-100 to-white border-6 border-amber-300 shadow-inner flex items-center justify-center overflow-hidden">
          {/* モンスターボール風の背景サークル装飾 */}
          <div className="absolute inset-3 rounded-full border-6 border-slate-200/70 pointer-events-none" />

          {currentItem.customImage ? (
            <img
              src={currentItem.customImage}
              alt={currentItem.name}
              referrerPolicy="no-referrer"
              style={{
                filter: revealed ? 'brightness(1)' : 'brightness(0)',
                transition: 'filter 0.45s ease, transform 0.45s ease',
              }}
              className={`w-36 h-36 object-contain relative z-10 ${
                revealed ? 'scale-110' : 'scale-100'
              }`}
            />
          ) : (
            <span
              data-testid="silhouette-character"
              style={{
                filter: revealed ? 'brightness(1)' : 'brightness(0)',
                transition: 'filter 0.45s ease, transform 0.45s ease',
              }}
              className={`text-[96px] md:text-[108px] leading-none relative z-10 select-none ${
                revealed ? 'scale-110 animate-bounce' : 'scale-100'
              }`}
            >
              {currentItem.emoji}
            </span>
          )}
        </div>

        {/* 正解時メッセージ または ヒント */}
        <div className="min-h-[48px] flex items-center justify-center mb-4">
          {revealed ? (
            <div className="animate-pop bg-emerald-500 border-4 border-emerald-200 text-slate-950 font-extrabold text-xl md:text-2xl px-6 py-2 rounded-2xl shadow-lg">
              🔴 ゲットだぜ！「{currentItem.name}」 🌟＋1
            </div>
          ) : wrongChar ? (
            <div className="bg-rose-600/90 border-2 border-rose-300 text-white font-extrabold text-lg md:text-xl px-5 py-2 rounded-2xl">
              「{wrongChar}」じゃないよ！もういっかい えらんでみよう！
            </div>
          ) : (
            <div className="text-amber-200 font-bold text-lg md:text-xl">
              くろい かげを よーく みて、ひらがなを タッチしよう！
            </div>
          )}
        </div>

        {/* 3つの特大ひらがなボタン または つぎのもんだいボタン */}
        {!revealed ? (
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-xl mx-auto">
            {choices.map((ch) => {
              const isWrong = wrongChar === ch;
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleSelectChoice(ch)}
                  className={`h-24 md:h-28 rounded-3xl text-5xl md:text-6xl font-extrabold border-4 shadow-xl transition-transform active:scale-90 flex items-center justify-center ${
                    isWrong
                      ? 'bg-slate-700 border-slate-500 text-slate-400'
                      : 'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border-sky-200 text-white'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-10 py-4 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 border-4 border-white text-slate-950 font-extrabold text-2xl md:text-3xl shadow-2xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
            >
              つぎの もんだいへ すすむ ➡️
            </button>
          </div>
        )}
      </div>

      {/* ずかんモーダル */}
      {showZukanModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="いきもの・アイテムずかん"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border-4 border-red-400 rounded-[32px] max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300">
                📖 ゲットした ずかん（<span className="num-tabular">{caughtIds.length}</span> / {allItems.length}）
              </h2>
              <button
                type="button"
                onClick={() => setShowZukanModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-lg whitespace-nowrap shrink-0"
              >
                ✖ とじる
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allItems.map((item) => {
                const isCaught = caughtIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (isCaught) {
                        soundEngine.playCoin();
                        soundEngine.speak(`${item.initial}、${item.name}！`);
                      } else {
                        soundEngine.speak('まだ つかまえて いないよ！');
                      }
                    }}
                    className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center transition-transform active:scale-95 ${
                      isCaught
                        ? 'bg-slate-800 border-amber-400'
                        : 'bg-slate-950 border-slate-700 opacity-75'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-2 overflow-hidden">
                      {item.customImage ? (
                        <img
                          src={item.customImage}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          style={{
                            filter: isCaught ? 'brightness(1)' : 'brightness(0)',
                          }}
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <span
                          style={{
                            filter: isCaught ? 'brightness(1)' : 'brightness(0)',
                          }}
                          className="text-5xl"
                        >
                          {item.emoji}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-extrabold text-amber-300">
                      「{item.initial}」
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5">
                      {isCaught ? item.name : '？？？'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* パパ・ママ用 写真＆問題追加モーダル */}
      {showParentModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="パパ・ママ用 シルエット問題追加"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border-4 border-pink-400 rounded-[32px] max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-pink-300">
                📷 パパ・ママよう もんだい ついか
              </h2>
              <button
                type="button"
                onClick={() => setShowParentModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold whitespace-nowrap shrink-0"
              >
                ✖ とじる
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-4">
              スマホの しゃしん（おもちゃ・フィギュア・パパの変顔など）を えらんで、オリジナルの シルエットもんだいを つくれます！
            </p>

            <form onSubmit={handleSaveCustomItem} className="space-y-4">
              <div>
                <label
                  htmlFor="custom-name-input"
                  className="block text-base font-extrabold text-amber-300 mb-1"
                >
                  1. なまえ（ひらがな）
                </label>
                <input
                  id="custom-name-input"
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    if (!customInitial && e.target.value.length > 0) {
                      setCustomInitial(e.target.value[0]);
                    }
                  }}
                  placeholder="れい：ぱぱ、まりお、ぴかちゅう"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800 border-2 border-slate-600 text-white text-xl font-bold"
                />
              </div>

              <div>
                <label
                  htmlFor="custom-initial-input"
                  className="block text-base font-extrabold text-amber-300 mb-1"
                >
                  2. あたまもじ（ひらがな 1もじ）
                </label>
                <input
                  id="custom-initial-input"
                  type="text"
                  maxLength={1}
                  value={customInitial}
                  onChange={(e) => setCustomInitial(e.target.value)}
                  placeholder="れい：ぱ"
                  className="w-28 px-4 py-3 rounded-2xl bg-slate-800 border-2 border-slate-600 text-white text-2xl font-extrabold text-center"
                />
              </div>

              <div>
                <label
                  htmlFor="custom-photo-input"
                  className="block text-base font-extrabold text-amber-300 mb-1"
                >
                  3. しゃしん または スタンプを えらぶ
                </label>
                <input
                  id="custom-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-300 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-pink-600 file:text-white"
                />

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">かんたんスタンプ：</span>
                  {[
                    { emoji: '🧔', label: 'ぱぱ', name: 'ぱぱ', init: 'ぱ', bg: '#3B82F6' },
                    { emoji: '👩', label: 'まま', name: 'まま', init: 'ま', bg: '#EC4899' },
                    { emoji: '🤖', label: 'ろぼっと', name: 'ろぼっと', init: 'ろ', bg: '#10B981' },
                  ].map((st) => (
                    <button
                      key={st.label}
                      type="button"
                      onClick={() => {
                        setCustomName(st.name);
                        setCustomInitial(st.init);
                        setCustomImagePreview(
                          createPresetStampDataUrl(st.emoji, st.bg)
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white"
                    >
                      {st.emoji} {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {parentNotice && (
                <p className="text-amber-300 font-bold text-sm">{parentNotice}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowParentModal(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-700 text-white font-bold"
                >
                  やめる
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-extrabold text-lg shadow-lg"
                >
                  ✨ もんだいに とうろくする
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
