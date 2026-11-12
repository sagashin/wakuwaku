import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ZUKAN_ITEMS,
  buildSilhouetteChoices,
  createCustomZukanItem,
  BATTLE_RIVALS,
  generateBattleRound,
  isWinningBattleCard,
  COURSE_STAGES,
  countStageCoins,
  stepCoursePlayer,
  addStarProgress,
  SHENRON_STAR_TARGET,
} from './game-logic';

test('Game 1: buildSilhouetteChoices places initial at requested slot with 3 distinct hiragana', () => {
  const item = DEFAULT_ZUKAN_ITEMS[1]; // きょうりゅう ('き')
  const choices = buildSilhouetteChoices(item, 2);
  assert.equal(choices.length, 3);
  assert.equal(choices[2], 'き');
  assert.equal(new Set(choices).size, 3);
});

test('Game 1: createCustomZukanItem extracts first hiragana and generates distinct distractors', () => {
  const custom = createCustomZukanItem({
    id: 'papa-1',
    name: 'ぱぱのへんがお',
    customImage: 'data:image/png;base64,iVBORw0KGgo=',
  });
  assert.equal(custom.initial, 'ぱ');
  assert.equal(custom.category, 'かぞく');
  const choices = buildSilhouetteChoices(custom, 0);
  assert.equal(choices[0], 'ぱ');
  assert.equal(new Set(choices).size, 3);
});

test('Game 2: generateBattleRound creates exactly 1 winning card greater than rival power', () => {
  for (const rival of BATTLE_RIVALS) {
    const round = generateBattleRound(rival, 1);
    assert.equal(round.cards.length, 3);
    const winners = round.cards.filter((c) => isWinningBattleCard(c, round.rival.power));
    assert.equal(winners.length, 1);
    assert.equal(round.cards[1], round.winningCard);
  }
});

test('Game 3: stepCoursePlayer moves on empty/coin/goal and blocks on rock or out-of-bounds', () => {
  const stage = COURSE_STAGES[0]; // start at (2,0), coins at (2,1),(2,2),(2,3), goal at (2,4)
  const totalCoins = countStageCoins(stage.grid);
  assert.equal(totalCoins, 3);

  let state = {
    r: stage.start.r,
    c: stage.start.c,
    collectedCoins: [] as string[],
    totalCoins,
    reachedGoal: false,
    bumpedRock: false,
  };

  // Try moving left out of bounds
  state = stepCoursePlayer(state, stage.grid, 'left');
  assert.equal(state.bumpedRock, true);
  assert.equal(state.c, 0);

  // Move right 4 times to collect 3 coins and hit goal
  state = stepCoursePlayer(state, stage.grid, 'right');
  assert.equal(state.c, 1);
  assert.equal(state.collectedCoins.length, 1);

  state = stepCoursePlayer(state, stage.grid, 'right');
  state = stepCoursePlayer(state, stage.grid, 'right');
  assert.equal(state.collectedCoins.length, 3);
  assert.equal(state.reachedGoal, false);

  state = stepCoursePlayer(state, stage.grid, 'right');
  assert.equal(state.reachedGoal, true);
});

test('Shenron Star Progression: triggers Shenron celebration every 7 stars', () => {
  for (let s = 0; s < SHENRON_STAR_TARGET - 1; s++) {
    const res = addStarProgress(s);
    assert.equal(res.summonShenron, false);
  }
  const seventh = addStarProgress(6);
  assert.equal(seventh.nextStars, 7);
  assert.equal(seventh.summonShenron, true);
});
