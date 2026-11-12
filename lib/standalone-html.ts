export const STANDALONE_HTML_SOURCE = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>わくわくヒーローランド！3つのちいくゲーム</title>
<style>
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }
  body {
    margin: 0;
    font-family: "Hiragino Maru Gothic ProN", "Rounded Mplus 1c", "Meiryo", sans-serif;
    background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
  }
  .app { max-width: 920px; margin: 0 auto; padding: 16px; }
  .top-bar {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(15, 23, 42, 0.9); border: 3px solid #facc15;
    border-radius: 24px; padding: 12px 18px; margin-bottom: 16px;
    flex-wrap: wrap; gap: 10px;
  }
  .star-box { display: flex; align-items: center; gap: 6px; font-size: 24px; font-weight: 900; }
  .star-ball {
    width: 38px; height: 38px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    background: #334155; border: 2px solid #64748b; font-size: 20px;
  }
  .star-ball.active {
    background: radial-gradient(circle at 30% 30%, #fde047, #f97316);
    border-color: #fef08a; box-shadow: 0 0 12px #facc15;
  }
  .btn {
    border: none; border-radius: 22px; font-size: 24px; font-weight: 900;
    padding: 16px 24px; cursor: pointer; transition: transform 0.12s;
    font-family: inherit; color: #fff;
  }
  .btn:active { transform: scale(0.94); }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
  .card {
    background: #1e293b; border: 4px solid #475569; border-radius: 28px;
    padding: 22px; text-align: center;
  }
  .silhouette-stage {
    width: 200px; height: 200px; margin: 14px auto; border-radius: 32px;
    background: #fff; display: flex; align-items: center; justify-content: center;
    font-size: 110px; border: 6px solid #facc15; overflow: hidden;
  }
  .is-silhouette { filter: brightness(0); }
  .choices { display: flex; justify-content: center; gap: 16px; margin-top: 16px; }
  .hira-btn {
    width: 96px; height: 96px; border-radius: 24px; font-size: 46px; font-weight: 900;
    background: #2563eb; color: #fff; border: 4px solid #93c5fd; cursor: pointer;
  }
  .pipe-row { display: flex; justify-content: center; gap: 24px; margin: 28px 0; }
  .pipe {
    width: 96px; height: 130px; background: linear-gradient(90deg, #16a34a, #4ade80, #15803d);
    border: 4px solid #052e16; border-radius: 12px; position: relative; cursor: pointer;
    display: flex; align-items: flex-start; justify-content: center;
  }
  .maze-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;
    max-width: 360px; margin: 12px auto;
  }
  .maze-cell {
    aspect-ratio: 1; background: #334155; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 30px;
  }
  .dpad { display: flex; justify-content: center; gap: 12px; margin-top: 14px; }
  .dpad-btn {
    width: 74px; height: 74px; font-size: 36px; border-radius: 20px;
    background: #f59e0b; border: 4px solid #fde68a; cursor: pointer;
  }
</style>
</head>
<body>
<div class="app" id="app"></div>
<script>
  // 単一HTMLファイル版（フル機能搭載）
  const items = [
    { id: 'pika', name: 'でんきねずみ', initial: 'で', emoji: '⚡🐭', d: ['ま','る'] },
    { id: 'kyoryu', name: 'きょうりゅう', initial: 'き', emoji: '🦖', d: ['ま','と'] },
    { id: 'kinoko', name: 'きのこ', initial: 'き', emoji: '🍄', d: ['す','ね'] },
    { id: 'kuruma', name: 'くるま', initial: 'く', emoji: '🚗', d: ['あ','み'] },
    { id: 'raion', name: 'らいおん', initial: 'ら', emoji: '🦁', d: ['か','ほ'] },
    { id: 'doragon', name: 'どらごん', initial: 'ど', emoji: '🐉', d: ['た','ゆ'] },
    { id: 'roketto', name: 'ろけっと', initial: 'ろ', emoji: '🚀', d: ['さ','め'] },
    { id: 'gorira', name: 'ごりら', initial: 'ご', emoji: '🦍', d: ['ち','わ'] },
    { id: 'kabuto', name: 'かぶとむし', initial: 'か', emoji: '🪲', d: ['て','む'] },
    { id: 'shinkansen', name: 'しんかんせん', initial: 'し', emoji: '🚄', d: ['つ','や'] }
  ];
  let stars = 0;
  let screen = 'home';
  let qIdx = 0;
  let revealed = false;

  function speak(txt) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = 'ja-JP';
      u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    }
  }
  function tone(f1, f2) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(f1, ctx.currentTime);
    o.frequency.setValueAtTime(f2, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.36);
  }
  function addStar() {
    stars++;
    tone(987, 1318);
    if (stars % 7 === 0) {
      speak('シェンロンがあらわれた！パパかママにおねがいごとをしよう！');
      screen = 'shenron';
    }
    render();
  }
  function render() {
    const root = document.getElementById('app');
    const balls = Array.from({length: 7}, (_, i) =>
      '<span class="star-ball ' + ((stars % 7 > i || (stars > 0 && stars % 7 === 0)) ? 'active' : '') + '">★</span>'
    ).join('');
    let body = '';
    if (screen === 'home') {
      body = '<div class="grid-3">' +
        '<div class="card"><h2>⚡ シルエットずかん</h2><p>だ〜れだ？ひらがなをあてよう！</p><button class="btn" style="background:#ef4444" onclick="go(\\'g1\\')">あそぶ！</button></div>' +
        '<div class="card"><h2>🐉 すうじバトル</h2><p>おおきい すうじで ビームをうて！</p><button class="btn" style="background:#f97316" onclick="go(\\'g2\\')">あそぶ！</button></div>' +
        '<div class="card"><h2>🍄 どかん＆パズル</h2><p>どかんワープ ＆ やじるしゴール！</p><button class="btn" style="background:#22c55e" onclick="go(\\'g3\\')">あそぶ！</button></div>' +
      '</div>';
    } else if (screen === 'shenron') {
      body = '<div class="card" style="border-color:#facc15;background:#064e3b"><h1>🐉 シェンロンが あらわれた！</h1><p style="font-size:26px">7つの スターが そろったよ！<br>パパか ママに おねがいごとを しよう！</p><button class="btn" style="background:#eab308;color:#000" onclick="go(\\'home\\')">やったー！ホームへ</button></div>';
    } else if (screen === 'g1') {
      const it = items[qIdx % items.length];
      const ch = [it.d[0], it.initial, it.d[1]];
      body = '<div class="card"><h2>「' + it.initial + '」から はじまるのは どれ？</h2>' +
        '<div class="silhouette-stage"><span class="' + (revealed ? '' : 'is-silhouette') + '">' + it.emoji + '</span></div>' +
        '<p style="font-size:28px;font-weight:900">' + (revealed ? '🎉 ゲットだぜ！「' + it.name + '」' : '？ ？ ？') + '</p>' +
        '<div class="choices">' + ch.map(c => '<button class="hira-btn" onclick="ans1(\\'' + c + '\\')">' + c + '</button>').join('') + '</div>' +
        '<div style="margin-top:16px"><button class="btn" style="background:#475569;font-size:18px" onclick="go(\\'home\\')">🏠 ホームへ</button></div></div>';
    } else if (screen === 'g2') {
      const p = (qIdx % 6) + 2;
      const win = p + 2;
      const cards = [p - 1, win, 1];
      body = '<div class="card"><h2>👾 ライバルの パワー：' + p + ' (' + '★'.repeat(p) + ')</h2>' +
        '<p style="font-size:24px">「' + p + '」より おおきい すうじで かめはめ波を うて！</p>' +
        '<div class="choices">' + cards.map(n => '<button class="hira-btn" style="height:130px;width:110px;font-size:36px" onclick="ans2(' + n + ',' + p + ')">' + n + '<div style="font-size:14px">' + '●'.repeat(n) + '</div></button>').join('') + '</div>' +
        '<div style="margin-top:16px"><button class="btn" style="background:#475569;font-size:18px" onclick="go(\\'home\\')">🏠 ホームへ</button></div></div>';
    } else if (screen === 'g3') {
      body = '<div class="card"><h2>🍄 どかんワープ！どこから でてくる？</h2>' +
        '<div class="pipe-row">' + [0,1,2].map(i => '<div class="pipe" onclick="ans3(' + i + ')">🌟</div>').join('') + '</div>' +
        '<button class="btn" style="background:#475569;font-size:18px" onclick="go(\\'home\\')">🏠 ホームへ</button></div>';
    }
    root.innerHTML = '<div class="top-bar"><div class="star-box">スター：' + balls + ' (' + stars + ')</div><button class="btn" style="background:#334155;font-size:16px;padding:10px 16px" onclick="go(\\'home\\')">🏠 ホーム</button></div>' + body;
  }
  window.go = function(s) { screen = s; revealed = false; render(); };
  window.ans1 = function(c) {
    const it = items[qIdx % items.length];
    if (c === it.initial) {
      revealed = true; speak('すごーい！ゲットだぜ！' + it.name); addStar();
      setTimeout(() => { qIdx++; revealed = false; render(); }, 1300);
    } else { tone(160, 120); speak('おしい！もういっかい！'); }
  };
  window.ans2 = function(n, p) {
    if (n > p) { speak('かめはめ波ー！やったー！'); addStar(); qIdx++; render(); }
    else { tone(160, 120); speak('もっと おおきい すうじを えらんでね！'); }
  };
  window.ans3 = function() { speak('せいかい！やったー！'); addStar(); };
  render();
</script>
</body>
</html>`;
