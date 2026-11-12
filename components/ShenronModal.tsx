'use client';

import React, { useState, useEffect } from 'react';
import { soundEngine } from '@/lib/sound-engine';

interface ShenronModalProps {
  onClose: () => void;
}

const WISH_OPTIONS = [
  { id: 'oyatsu', emoji: '🍮', text: 'すきな おやつを たべたい！' },
  { id: 'asobo', emoji: '🎮', text: 'パパ・ママと いっしょに あそびたい！' },
  { id: 'gyu', emoji: '🤗', text: 'いっぱい ぎゅーって ほめてほしい！' },
  { id: 'ehon', emoji: '📚', text: 'すきな えほん・ずかんを よみたい！' },
];

export default function ShenronModal({ onClose }: ShenronModalProps) {
  const [selectedWish, setSelectedWish] = useState<string | null>(null);

  useEffect(() => {
    soundEngine.playFanfare(true);
    soundEngine.speak(
      'いでよ シェンロン！7つの スターが そろったよ！パパか ママに おねがいごとを しよう！'
    );
  }, []);

  const handleSelectWish = (text: string) => {
    setSelectedWish(text);
    soundEngine.playCoin();
    soundEngine.speak(`おねがいごとは、「${text}」だね！かなえて もらおう！`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="シェンロンがあらわれた"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 border-4 border-amber-400 rounded-[36px] max-w-2xl w-full p-6 md:p-8 text-center shadow-[0_0_60px_rgba(250,204,21,0.5)] animate-pop">
        {/* 7つのドラゴンボール風スター */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 7 }).map((_, idx) => (
            <span
              key={idx}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-2 border-yellow-100 flex items-center justify-center text-red-700 font-extrabold text-xl shadow-md"
            >
              ★
            </span>
          ))}
        </div>

        {/* シェンロンSVG＆絵文字イラスト */}
        <div className="text-7xl md:text-8xl mb-2 animate-float">🐉✨</div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-300 mb-2">
          シェンロン（りゅう）が あらわれた！
        </h2>
        <p className="text-xl md:text-2xl font-bold text-white mb-6">
          パパか ママに おねがいごとを しよう！
        </p>

        {/* おねがいごと選択ボタン */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {WISH_OPTIONS.map((w) => {
            const isSelected = selectedWish === w.text;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelectWish(w.text)}
                className={`p-4 rounded-2xl border-3 text-left font-extrabold text-lg flex items-center gap-3 transition-transform active:scale-95 ${
                  isSelected
                    ? 'bg-amber-400 border-white text-slate-950 shadow-lg'
                    : 'bg-emerald-800/80 hover:bg-emerald-700 border-emerald-400/60 text-white'
                }`}
              >
                <span className="text-3xl">{w.emoji}</span>
                <span>{w.text}</span>
              </button>
            );
          })}
        </div>

        {selectedWish && (
          <div className="bg-amber-400/20 border-2 border-amber-300 rounded-2xl p-4 mb-6 text-amber-200 font-extrabold text-xl">
            ✨「{selectedWish}」✨<br />
            <span className="text-base text-white">
              パパ・ママに この がめんを みせてね！
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="px-10 py-4 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 border-4 border-white text-slate-950 font-extrabold text-2xl shadow-xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
        >
          🌟 ありがとう！つづきを あそぶ
        </button>
      </div>
    </div>
  );
}
