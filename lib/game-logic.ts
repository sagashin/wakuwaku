export interface ZukanItem {
  id: string;
  name: string;        // ひらがな表記 e.g. 'ぴかちゅう（でんきねずみ）' or 'きょうりゅう'
  initial: string;     // 頭文字ひらがな1文字 e.g. 'き'
  emoji: string;       // 絵文字
  category: string;    // 'モンスター' | 'のりもの' | 'どうぶつ' | 'アイテム' | 'かぞく'
  color: string;       // 背景アクセント色
  distractors: [string, string]; // 間違い選択肢のひらがな2つ
  customImage?: string; // パパ・ママ登録用のBase64データURL
}

export const DEFAULT_ZUKAN_ITEMS: ZukanItem[] = [
  {
    id: 'pikachu',
    name: 'でんきねずみ（ピカピカ）',
    initial: 'で',
    emoji: '🐭',
    category: 'モンスター',
    color: '#FACC15',
    distractors: ['ま', 'る'],
  },
  {
    id: 'kyoryu',
    name: 'きょうりゅう',
    initial: 'き',
    emoji: '🦖',
    category: 'モンスター',
    color: '#22C55E',
    distractors: ['ま', 'と'],
  },
  {
    id: 'kinoko',
    name: 'きのこ',
    initial: 'き',
    emoji: '🍄',
    category: 'アイテム',
    color: '#EF4444',
    distractors: ['す', 'ね'],
  },
  {
    id: 'kuruma',
    name: 'くるま',
    initial: 'く',
    emoji: '🚗',
    category: 'のりもの',
    color: '#3B82F6',
    distractors: ['あ', 'み'],
  },
  {
    id: 'raion',
    name: 'らいおん',
    initial: 'ら',
    emoji: '🦁',
    category: 'どうぶつ',
    color: '#F97316',
    distractors: ['か', 'ほ'],
  },
  {
    id: 'doragon',
    name: 'どらごん',
    initial: 'ど',
    emoji: '🐉',
    category: 'モンスター',
    color: '#10B981',
    distractors: ['پ' === 'پ' ? 'た' : 'た', 'ゆ'],
  },
  {
    id: 'roketto',
    name: 'ろけっと',
    initial: 'ろ',
    emoji: '🚀',
    category: 'のりもの',
    color: '#6366F1',
    distractors: ['ن' === 'ن' ? 'さ' : 'さ', 'め'],
  },
  {
    id: 'gorira',
    name: 'ごりら',
    initial: 'ご',
    emoji: '🦍',
    category: 'どうぶつ',
    color: '#A855F7',
    distractors: ['ち', 'わ'],
  },
  {
    id: 'kabutomushi',
    name: 'かぶとむし',
    initial: 'か',
    emoji: '🪲',
    category: 'どうぶつ',
    color: '#84CC16',
    distractors: ['て', 'む'],
  },
  {
    id: 'shinkansen',
    name: 'しんかんせん',
    initial: 'し',
    emoji: '🚄',
    category: 'のりもの',
    color: '#06B6D4',
    distractors: ['つ', 'や'],
  },
  {
    id: 'sutaa',
    name: 'すたー（ほし）',
    initial: 'す',
    emoji: '🌟',
    category: 'アイテム',
    color: '#EAB308',
    distractors: ['こ', 'ひ'],
  },
  {
    id: 'faiabooru',
    name: 'ほのお（ふぁいあ）',
    initial: 'ほ',
    emoji: '🔥',
    category: 'アイテム',
    color: '#F43F5E',
    distractors: ['な', 'よ'],
  },
];

const HIRAGANA_POOL = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ',
];

/**
 * ゲーム1: シルエットずかんの3択選択肢を作る（最初が正解にならないよう順番をdeterministicまたは指定シードで並べる）
 */
export function buildSilhouetteChoices(item: ZukanItem, correctIndex = 1): string[] {
  const d1 = item.distractors[0] !== item.initial ? item.distractors[0] : 'あ';
  const d2 = item.distractors[1] !== item.initial && item.distractors[1] !== d1 ? item.distractors[1] : 'و' === 'و' ? 'ん' : 'ん';
  const result = [d1, d2];
  const clampedIdx = Math.max(0, Math.min(2, correctIndex));
  result.splice(clampedIdx, 0, item.initial);
  return result;
}

/**
 * パパ・ママ登録用: 名前（ひらがな）から頭文字1文字と間違い選択肢2つを生成
 */
export function createCustomZukanItem(params: {
  id: string;
  name: string;
  initial?: string;
  customImage: string;
}): ZukanItem {
  const cleanName = params.name.trim() || 'かぞく';
  const firstChar = (params.initial?.trim() || cleanName[0] || 'か').slice(0, 1);
  const candidates = HIRAGANA_POOL.filter((c) => c !== firstChar);
  const d1 = candidates[0] || 'あ';
  const d2 = candidates[7] || 'ま';
  return {
    id: params.id,
    name: cleanName,
    initial: firstChar,
    emoji: '📸',
    category: 'かぞく',
    color: '#EC4899',
    distractors: [d1, d2],
    customImage: params.customImage,
  };
}

/**
 * ゲーム2: ドラゴンボール風 すうじバトルの問題データ
 */
export interface BattleRival {
  id: string;
  name: string;
  emoji: string;
  power: number; // 1..8 (必ず9以下の大きい数字カードが存在するように1〜8にする)
  beamColor: string;
}

export const BATTLE_RIVALS: BattleRival[] = [
  { id: 'rival-1', name: 'さいばいまん', emoji: '👾', power: 2, beamColor: '#38BDF8' },
  { id: 'rival-2', name: 'おおざる', emoji: '🦍', power: 4, beamColor: '#FACC15' },
  { id: 'rival-3', name: 'うちゅうの ていおう', emoji: '👽', power: 5, beamColor: '#A855F7' },
  { id: 'rival-4', name: 'ぱーふぇくと かいじん', emoji: '🪲', power: 6, beamColor: '#22C55E' },
  { id: 'rival-5', name: 'まじん', emoji: '😈', power: 7, beamColor: '#F472B6' },
  { id: 'rival-6', name: 'はかいしん', emoji: '😼', power: 8, beamColor: '#FB923C' },
];

export interface BattleRound {
  rival: BattleRival;
  cards: [number, number, number];
  winningCard: number;
}

/**
 * 敵のパワー(1〜8)に対して、必ず1枚だけ敵より大きい数字(power+1〜9)、残り2枚は敵以下(1〜power)の3枚のカードを生成する
 */
export function generateBattleRound(rival: BattleRival, winningSlot = 1): BattleRound {
  const safePower = Math.max(2, Math.min(8, rival.power));
  const winningNumber = Math.min(9, safePower + (safePower <= 5 ? 2 : 1));
  const lower1 = Math.max(1, safePower - 1);
  const lower2 = Math.max(1, safePower - 2 === lower1 ? 1 : safePower - 2);

  const cards: number[] = [lower1, lower2];
  const slot = Math.max(0, Math.min(2, winningSlot));
  cards.splice(slot, 0, winningNumber);

  return {
    rival: { ...rival, power: safePower },
    cards: [cards[0], cards[1], cards[2]],
    winningCard: winningNumber,
  };
}

export function isWinningBattleCard(cardNumber: number, enemyPower: number): boolean {
  return cardNumber > enemyPower;
}

/**
 * ゲーム3 モードB: 5×5 マリオ風やじるしゴールパズル
 * 0 = みち, 1 = いわ(障害物), 2 = コイン, 3 = ハテナブロック(ゴール)
 */
export type CellType = 'empty' | 'rock' | 'coin' | 'goal';

export interface CourseStage {
  id: number;
  title: string;
  start: { r: number; c: number };
  grid: CellType[][];
}

export const COURSE_STAGES: CourseStage[] = [
  {
    id: 1,
    title: 'ステージ 1：まっすぐ すすもう！',
    start: { r: 2, c: 0 },
    grid: [
      ['rock', 'rock', 'empty', 'rock', 'rock'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'coin', 'coin', 'coin', 'goal'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['rock', 'rock', 'empty', 'rock', 'rock'],
    ],
  },
  {
    id: 2,
    title: 'ステージ 2：いわを よけて すすもう！',
    start: { r: 0, c: 0 },
    grid: [
      ['empty', 'coin', 'empty', 'rock', 'empty'],
      ['rock', 'rock', 'empty', 'rock', 'empty'],
      ['empty', 'empty', 'coin', 'empty', 'empty'],
      ['empty', 'rock', 'rock', 'rock', 'coin'],
      ['empty', 'empty', 'empty', 'empty', 'goal'],
    ],
  },
  {
    id: 3,
    title: 'ステージ 3：コインを あつめて ゴール！',
    start: { r: 4, c: 0 },
    grid: [
      ['empty', 'coin', 'empty', 'coin', 'goal'],
      ['empty', 'rock', 'empty', 'rock', 'empty'],
      ['coin', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'rock', 'rock', 'empty', 'rock'],
      ['empty', 'empty', 'coin', 'empty', 'empty'],
    ],
  },
];

export interface CoursePlayerState {
  r: number;
  c: number;
  collectedCoins: string[]; // "r,c"
  totalCoins: number;
  reachedGoal: boolean;
  bumpedRock: boolean;
}

export function countStageCoins(grid: CellType[][]): number {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 'coin') count++;
    }
  }
  return count;
}

export function stepCoursePlayer(
  state: CoursePlayerState,
  grid: CellType[][],
  dir: 'up' | 'down' | 'left' | 'right'
): CoursePlayerState {
  if (state.reachedGoal) return state;

  const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  const dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const nr = state.r + dr;
  const nc = state.c + dc;

  if (nr < 0 || nr >= 5 || nc < 0 || nc >= 5) {
    return { ...state, bumpedRock: true };
  }

  const targetCell = grid[nr][nc];
  if (targetCell === 'rock') {
    return { ...state, bumpedRock: true };
  }

  const key = `${nr},${nc}`;
  const collectedCoins =
    targetCell === 'coin' && !state.collectedCoins.includes(key)
      ? [...state.collectedCoins, key]
      : state.collectedCoins;

  const reachedGoal = targetCell === 'goal';

  return {
    r: nr,
    c: nc,
    collectedCoins,
    totalCoins: state.totalCoins,
    reachedGoal,
    bumpedRock: false,
  };
}

/**
 * スター＆シェンロン召喚判定（7つ集めるとシェンロン出現）
 */
export const SHENRON_STAR_TARGET = 7;

export function addStarProgress(currentStars: number): {
  nextStars: number;
  summonShenron: boolean;
} {
  const nextStars = currentStars + 1;
  return {
    nextStars,
    summonShenron: nextStars > 0 && nextStars % SHENRON_STAR_TARGET === 0,
  };
}
