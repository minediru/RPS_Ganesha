/**
 * 焼き鳥じゃんけん (Yakitori Janken)
 * 昭和レトロな焼き鳥屋 × ミニゲーム
 */

(() => {
  'use strict';

  // --- Hand Definitions ---
  const HANDS = {
    rock: {
      name: 'グー',
      emoji: '✊',
      beats: 'scissors'
    },
    scissors: {
      name: 'チョキ',
      emoji: '✌️',
      beats: 'paper'
    },
    paper: {
      name: 'パー',
      emoji: '🖐️',
      beats: 'rock'
    }
  };

  // --- Sound Effects using Web Audio API (No external assets required) ---
  class SoundManager {
    constructor() {
      this.enabled = true;
      this.ctx = null;
      try {
        const saved = localStorage.getItem('yakitori_sound_enabled');
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      } catch (e) {
        // LocalStorage fallback
      }
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      try {
        localStorage.setItem('yakitori_sound_enabled', String(this.enabled));
      } catch (e) {}
      return this.enabled;
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }

    playTension() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      // Japanese Taiko-style drum thump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    }

    playReveal() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.setValueAtTime(560, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }

    playWin() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Cinematic Bass Impact Hit (ドォォン！)
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(150, now);
      bassOsc.frequency.exponentialRampToValueAtTime(36, now + 0.45);
      bassGain.gain.setValueAtTime(0.5, now);
      bassGain.gain.linearRampToValueAtTime(0.01, now + 0.45);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.45);

      // 2. John Woo Heroic Orchestral Brass Chords (Triumphant Majestic Progression)
      const chords = [
        { notes: [261.63, 392.00], time: 0.05, dur: 0.22 },        // C4 + G4
        { notes: [329.63, 523.25], time: 0.25, dur: 0.22 },        // E4 + C5
        { notes: [392.00, 659.25], time: 0.45, dur: 0.25 },        // G4 + E5
        { notes: [523.25, 783.99, 1046.50], time: 0.68, dur: 0.95 } // C5 + G5 + C6 Grand Finale!
      ];

      chords.forEach(chord => {
        chord.notes.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + chord.time);
          gain.gain.setValueAtTime(0.24, now + chord.time);
          gain.gain.linearRampToValueAtTime(0.01, now + chord.time + chord.dur);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + chord.time);
          osc.stop(now + chord.time + chord.dur);
        });
      });

      // 3. Shimmering Victory Chimes (Glittering Harpsichord Sparkles)
      const sparkles = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
      sparkles.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.7 + idx * 0.07);
        gain.gain.setValueAtTime(0.18, now + 0.7 + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7 + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.7 + idx * 0.07);
        osc.stop(now + 0.7 + idx * 0.07 + 0.35);
      });
    }

    playLose() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      // Sad descending buzz
      const notes = [360, 310, 260];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.14);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.14 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.14);
        osc.stop(this.ctx.currentTime + idx * 0.14 + 0.25);
      });
    }

    playDraw() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.setValueAtTime(440, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }
  }

  // --- John Woo Cinematic Victory Engine (白い鳥の羽・白鳩・黄金小判・紙吹雪) ---
  class JohnWooVictoryEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.feathers = [];
      this.doves = [];
      this.coins = [];
      this.confetti = [];
      this.animId = null;
      this.time = 0;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    fire() {
      if (!this.canvas || !this.ctx) return;
      this.stop();
      this.time = 0;
      const W = this.canvas.width;
      const H = this.canvas.height;

      // 1. John Woo White Bird Feathers (白い鳥の羽 - 75枚)
      this.feathers = [];
      for (let i = 0; i < 75; i++) {
        const isForeground = Math.random() < 0.25;
        this.feathers.push({
          x: Math.random() * W,
          y: Math.random() * (H * 0.4) - 50,
          vx: (Math.random() - 0.5) * 2.5 + (Math.random() < 0.5 ? 1 : -1) * 0.8,
          vy: Math.random() * 1.8 + 1.2,
          length: isForeground ? Math.random() * 26 + 32 : Math.random() * 18 + 16,
          width: isForeground ? Math.random() * 10 + 12 : Math.random() * 6 + 7,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.04 + 0.02,
          swayAmp: Math.random() * 2.5 + 1.5,
          flipPhase: Math.random() * Math.PI * 2,
          flipSpeed: Math.random() * 0.05 + 0.02,
          alpha: 1,
          fadeStart: H * (0.65 + Math.random() * 0.25),
          isForeground: isForeground
        });
      }

      // 2. Flying White Dove Silhouettes (ジョン・ウーの白鳩飛翔 - 4羽)
      this.doves = [];
      for (let i = 0; i < 4; i++) {
        this.doves.push({
          x: W * 0.15 + (Math.random() - 0.5) * 100,
          y: H * 0.85 + i * 40,
          vx: Math.random() * 3 + 4.5,
          vy: -(Math.random() * 3 + 4),
          size: Math.random() * 0.35 + 0.75,
          flap: Math.random() * Math.PI,
          flapSpeed: Math.random() * 0.18 + 0.22,
          angle: -Math.PI / 4 + (Math.random() - 0.5) * 0.3,
          alpha: 1
        });
      }

      // 3. Spinning Golden Koban Coins (黄金の小判 - 35枚)
      this.coins = [];
      for (let i = 0; i < 35; i++) {
        this.coins.push({
          x: W * 0.5 + (Math.random() - 0.5) * 120,
          y: H * 0.35 + (Math.random() - 0.5) * 80,
          vx: (Math.random() - 0.5) * 12,
          vy: -(Math.random() * 11 + 5),
          w: Math.random() * 10 + 16,
          h: Math.random() * 16 + 26,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: Math.random() * 0.12 + 0.06,
          gravity: 0.32,
          alpha: 1
        });
      }

      // 4. Confetti Ribbons & Sparkles (豪華紙吹雪 - 70枚)
      this.confetti = [];
      const colors = ['#f59e0b', '#dc2626', '#ef4444', '#facc15', '#22c55e', '#38bdf8', '#e879f9', '#ffffff'];
      for (let i = 0; i < 70; i++) {
        this.confetti.push({
          x: W * 0.5 + (Math.random() - 0.5) * 140,
          y: H * 0.35 + (Math.random() - 0.5) * 80,
          vx: (Math.random() - 0.5) * 16,
          vy: -(Math.random() * 14 + 6),
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 14,
          gravity: 0.35,
          alpha: 1
        });
      }

      this.loop();
    }

    loop() {
      if (!this.ctx) return;
      this.time += 1;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let aliveCount = 0;
      const H = this.canvas.height;
      const W = this.canvas.width;

      // --- Draw Flying White Doves (John Woo motif) ---
      for (let dove of this.doves) {
        dove.x += dove.vx;
        dove.y += dove.vy;
        dove.flap += dove.flapSpeed;
        if (dove.x > W + 80 || dove.y < -80) {
          dove.alpha -= 0.04;
        }

        if (dove.alpha > 0) {
          aliveCount++;
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, dove.alpha);
          this.ctx.translate(dove.x, dove.y);
          this.ctx.rotate(dove.angle);
          this.ctx.scale(dove.size, dove.size);

          const wingFlap = Math.sin(dove.flap);

          this.ctx.fillStyle = '#ffffff';
          this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          this.ctx.shadowBlur = 8;

          // Upper Wing
          this.ctx.beginPath();
          this.ctx.moveTo(-6, 0);
          this.ctx.quadraticCurveTo(-18, -26 * wingFlap, -36, -18 * wingFlap);
          this.ctx.quadraticCurveTo(-18, -6 * wingFlap, 0, 0);
          this.ctx.fill();

          // Lower Wing
          this.ctx.beginPath();
          this.ctx.moveTo(-6, 0);
          this.ctx.quadraticCurveTo(18, 26 * wingFlap, 36, 18 * wingFlap);
          this.ctx.quadraticCurveTo(18, 6 * wingFlap, 0, 0);
          this.ctx.fill();

          // Body & Head
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
          this.ctx.fill();

          // Tail
          this.ctx.beginPath();
          this.ctx.moveTo(-10, 0);
          this.ctx.lineTo(-24, -6);
          this.ctx.lineTo(-21, 0);
          this.ctx.lineTo(-24, 6);
          this.ctx.closePath();
          this.ctx.fill();

          // Head & Beak
          this.ctx.beginPath();
          this.ctx.arc(12, -2, 4.5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.fillStyle = '#f59e0b';
          this.ctx.moveTo(15, -3);
          this.ctx.lineTo(20, -1);
          this.ctx.lineTo(15, 0);
          this.ctx.fill();

          this.ctx.restore();
        }
      }

      // --- Draw Spinning Golden Koban Coins ---
      for (let c of this.coins) {
        c.x += c.vx;
        c.vy += c.gravity;
        c.y += c.vy;
        c.rotation += c.vRot;
        c.spin += c.spinSpeed;
        if (c.y > H * 0.7) {
          c.alpha -= 0.015;
        }

        if (c.alpha > 0 && c.y < H + 60) {
          aliveCount++;
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, c.alpha);
          this.ctx.translate(c.x, c.y);
          this.ctx.rotate(c.rotation);
          this.ctx.scale(Math.cos(c.spin), 1);

          this.ctx.fillStyle = '#facc15';
          this.ctx.strokeStyle = '#b45309';
          this.ctx.lineWidth = 1.5;
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();

          // Coin inscription
          this.ctx.fillStyle = '#78350f';
          this.ctx.font = 'bold 9px serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('万両', 0, 0);

          this.ctx.restore();
        }
      }

      // --- Draw Confetti Ribbons ---
      for (let p of this.confetti) {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.vRot;
        if (p.y > H * 0.65) {
          p.alpha -= 0.016;
        }

        if (p.alpha > 0 && p.y < H + 50) {
          aliveCount++;
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          this.ctx.restore();
        }
      }

      // --- Draw Fluttering White Bird Feathers (John Woo Slow-Motion Feathers) ---
      for (let f of this.feathers) {
        f.swayPhase += f.swaySpeed;
        f.flipPhase += f.flipSpeed;
        f.x += f.vx + Math.sin(f.swayPhase) * f.swayAmp;
        f.y += f.vy;
        f.rotation += f.rotSpeed;

        if (f.y > f.fadeStart) {
          f.alpha -= 0.012;
        }

        if (f.alpha > 0 && f.y < H + 80) {
          aliveCount++;
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, f.alpha);
          this.ctx.translate(f.x, f.y);
          this.ctx.rotate(f.rotation);
          this.ctx.scale(Math.cos(f.flipPhase), 1);

          // Feather Shadow for Depth
          this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          this.ctx.shadowBlur = f.isForeground ? 8 : 4;

          // Feather Vane (Soft white with ivory gradient)
          this.ctx.beginPath();
          this.ctx.moveTo(0, -f.length * 0.5);
          this.ctx.bezierCurveTo(-f.width * 1.1, -f.length * 0.25, -f.width, f.length * 0.25, 0, f.length * 0.5);
          this.ctx.bezierCurveTo(f.width, f.length * 0.25, f.width * 1.1, -f.length * 0.25, 0, -f.length * 0.5);
          this.ctx.fillStyle = f.isForeground ? 'rgba(255, 255, 255, 0.96)' : 'rgba(248, 250, 252, 0.88)';
          this.ctx.fill();

          // Central Quill / Shaft Line
          this.ctx.beginPath();
          this.ctx.moveTo(0, -f.length * 0.55);
          this.ctx.quadraticCurveTo(f.width * 0.1, 0, 0, f.length * 0.48);
          this.ctx.strokeStyle = 'rgba(226, 232, 240, 0.95)';
          this.ctx.lineWidth = Math.max(1, f.length * 0.04);
          this.ctx.stroke();

          this.ctx.restore();
        }
      }

      if (aliveCount > 0) {
        this.animId = requestAnimationFrame(() => this.loop());
      } else {
        this.animId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    stop() {
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.feathers = [];
      this.doves = [];
      this.coins = [];
      this.confetti = [];
    }
  }

  // --- Master Hand Generator with Exact Probabilities ---
  /**
   * 店主の手は、
   * グー 33.3%
   * チョキ 33.3%
   * パー 33.4%
   * の確率で出現
   */
  function determineMasterHand() {
    const rand = Math.random();
    if (rand < 0.333) {
      return 'rock';
    } else if (rand < 0.666) {
      return 'scissors';
    } else {
      return 'paper';
    }
  }

  // --- Format Date/Time helper (YYYY年M月D日 HH:mm:ss) ---
  function formatJapaneseDateTime(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${y}年${m}月${d}日 ${hh}:${mm}:${ss}`;
  }

  // --- Generate 4-digit Auth Code (#4827 etc.) ---
  function generateAuthCode() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `#${num}`;
  }

  // --- DOM Elements ---
  const soundManager = new SoundManager();
  let confettiEngine = null;

  // Screens
  const screenStart = document.getElementById('screen-start');
  const screenGame = document.getElementById('screen-game');
  
  // Modals & Overlays
  const modalWin = document.getElementById('modal-win');
  const modalLose = document.getElementById('modal-lose');
  const modalRules = document.getElementById('modal-rules');
  const aikoBanner = document.getElementById('aiko-banner');

  // Controls & Buttons
  const btnStartChallenge = document.getElementById('btn-start-challenge');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const btnRulesOpen = document.getElementById('btn-rules-open');
  const btnRulesClose = document.getElementById('btn-rules-close');
  const btnWinRetry = document.getElementById('btn-win-retry');
  const btnLoseRetry = document.getElementById('btn-lose-retry');

  // Hand selection buttons
  const handButtons = document.querySelectorAll('.btn-hand');

  // Game UI Dynamic Display
  const refereePhaseText = document.getElementById('referee-phase-text');
  const refereeSubText = document.getElementById('referee-sub-text');
  const refereeBanner = document.getElementById('referee-banner');
  const masterSpeech = document.getElementById('master-speech');
  const masterHandBox = document.getElementById('master-hand-box');
  const masterHandIcon = document.getElementById('master-hand-icon');
  const masterHandName = document.getElementById('master-hand-name');

  // Win metadata
  const authCodeDisplay = document.getElementById('auth-code-display');
  const authTimeDisplay = document.getElementById('auth-time-display');

  // Game State
  let isGameLocked = false;
  let isAikoStreak = false;

  // Master dialogue phrases (福の神・ガネーシャ大将)
  const MASTER_TALK = {
    idle: [
      'パオーン！商売繁盛・福の神ガネーシャと勝負だ！',
      '勝てたら極上のドリンクをご馳走するぞ！',
      'へいらっしゃい！福を呼ぶ真剣じゃんけんだ！',
      '炭火の焼き鳥とキンキンの生ビール、最高だろ！？'
    ],
    janken: 'じゃんけん……勝負ッ！',
    pon: 'ぽんッ！！',
    aiko: 'パオーン！あいこか！もう一勝負いこうぜ！',
    win: 'おおっ見事！福の神の完敗だ！ドリンクを持っていきな！',
    lose: 'ガハハ！今日は店主の勝ちだな！また挑戦しておくれ！'
  };

  function getRandomSpeech(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // Update Sound Button UI
  function updateSoundButton() {
    if (btnSoundToggle) {
      btnSoundToggle.textContent = soundManager.enabled ? '🔊 音ON' : '🔈 音OFF';
      btnSoundToggle.setAttribute('aria-label', soundManager.enabled ? '音声オン' : '音声オフ');
    }
  }

  // Switch Active Screen
  function switchScreen(screenToShow) {
    [screenStart, screenGame].forEach(s => {
      if (s) s.classList.remove('active');
    });
    if (screenToShow) {
      screenToShow.classList.add('active');
    }
  }

  // Reset Game Field to Ready State
  function resetGameField(isAiko = false) {
    isGameLocked = false;
    masterHandBox.classList.remove('reveal-pop');
    masterHandIcon.textContent = '❓';
    masterHandName.textContent = '？？？';
    refereeBanner.classList.remove('janken-tempo');

    handButtons.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('selected');
    });

    if (isAiko) {
      refereePhaseText.textContent = 'あいこで……';
      refereeSubText.textContent = 'もう一度手を選んでください！';
      masterSpeech.textContent = MASTER_TALK.aiko;
    } else {
      refereePhaseText.textContent = '手を選んで勝負だ！';
      refereeSubText.textContent = 'グー・チョキ・パーを押してください';
      masterSpeech.textContent = getRandomSpeech(MASTER_TALK.idle);
    }
  }

  // Play Janken Round
  function playJanken(playerChoice) {
    if (isGameLocked) return;
    isGameLocked = true;

    soundManager.playClick();

    // Visual selection feedback
    handButtons.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.hand === playerChoice) {
        btn.classList.add('selected');
      }
    });

    // 1. "じゃんけん……" (or "あいこで……") - Quick tempo (~500ms)
    const leadPhrase = isAikoStreak ? 'あいこで……' : 'じゃんけん……';
    refereeBanner.classList.add('janken-tempo');
    refereePhaseText.textContent = leadPhrase;
    refereeSubText.textContent = '勝負判定中……';
    masterSpeech.textContent = leadPhrase;
    soundManager.playTension();

    // 2. Short timing step: "ぽん！" (or "しょ！")
    setTimeout(() => {
      const finishPhrase = isAikoStreak ? 'しょ！' : 'ぽん！';
      refereePhaseText.textContent = finishPhrase;
      masterSpeech.textContent = finishPhrase;

      // Determine Master Hand with exact probabilities
      const masterChoice = determineMasterHand();
      const masterInfo = HANDS[masterChoice];

      // Master hand pop reveal
      masterHandIcon.textContent = masterInfo.emoji;
      masterHandName.textContent = masterInfo.name;
      masterHandBox.classList.add('reveal-pop');
      soundManager.playReveal();

      // 3. Short suspense before result (~400ms)
      setTimeout(() => {
        evaluateResult(playerChoice, masterChoice);
      }, 400);

    }, 550);
  }

  // Evaluate Win / Lose / Draw
  function evaluateResult(playerChoice, masterChoice) {
    if (playerChoice === masterChoice) {
      // --- AIKO (DRAW) ---
      handleDraw();
    } else if (HANDS[playerChoice].beats === masterChoice) {
      // --- PLAYER WINS ---
      handleWin();
    } else {
      // --- PLAYER LOSES ---
      handleLose();
    }
  }

  // Handle Draw
  function handleDraw() {
    isAikoStreak = true;
    soundManager.playDraw();

    // Show Aiko Banner
    aikoBanner.classList.add('show');
    masterSpeech.textContent = MASTER_TALK.aiko;

    setTimeout(() => {
      aikoBanner.classList.remove('show');
      resetGameField(true);
    }, 1100);
  }

  // Handle Player Win (John Woo Style Dramatic Victory)
  function handleWin() {
    isAikoStreak = false;

    // 1. John Woo Cinematic White Flash & Dramatic Camera Shake
    const flashEl = document.getElementById('cinematic-flash');
    if (flashEl) {
      flashEl.classList.add('active');
      setTimeout(() => {
        flashEl.classList.remove('active');
      }, 60);
    }

    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.remove('john-woo-shake');
      void appContainer.offsetWidth; // Trigger reflow for re-animation
      appContainer.classList.add('john-woo-shake');
      setTimeout(() => {
        appContainer.classList.remove('john-woo-shake');
      }, 500);
    }

    // 2. Play Heroic Cinematic Orchestral Fanfare
    soundManager.playWin();
    masterSpeech.textContent = MASTER_TALK.win;

    // 3. Generate random authentication code and timestamp
    const authCode = generateAuthCode();
    const formattedDate = formatJapaneseDateTime(new Date());

    if (authCodeDisplay) {
      authCodeDisplay.textContent = `認証番号 ${authCode}`;
    }
    if (authTimeDisplay) {
      authTimeDisplay.textContent = `獲得日時：${formattedDate}`;
    }

    // 4. Release White Bird Feathers, Doves & Gold Coins!
    if (confettiEngine) {
      confettiEngine.fire();
    }

    // 5. Open Ultra-Flashy Golden Win Modal
    setTimeout(() => {
      modalWin.classList.add('active');
    }, 280);
  }

  // Handle Player Lose
  function handleLose() {
    isAikoStreak = false;
    soundManager.playLose();
    masterSpeech.textContent = MASTER_TALK.lose;

    // Open Lose Modal
    setTimeout(() => {
      modalLose.classList.add('active');
    }, 300);
  }

  // Close modals
  function closeAllModals() {
    [modalWin, modalLose, modalRules].forEach(m => {
      if (m) m.classList.remove('active');
    });
    if (confettiEngine) {
      confettiEngine.stop();
    }
  }

  // --- Initialize Event Listeners ---
  function initEvents() {
    // Sound Toggle
    if (btnSoundToggle) {
      btnSoundToggle.addEventListener('click', () => {
        soundManager.toggle();
        updateSoundButton();
      });
    }

    // Rules Open / Close
    if (btnRulesOpen) {
      btnRulesOpen.addEventListener('click', () => {
        soundManager.playClick();
        modalRules.classList.add('active');
      });
    }
    if (btnRulesClose) {
      btnRulesClose.addEventListener('click', () => {
        soundManager.playClick();
        modalRules.classList.remove('active');
      });
    }

    // Start Game from Start Screen
    if (btnStartChallenge) {
      btnStartChallenge.addEventListener('click', () => {
        soundManager.playClick();
        switchScreen(screenGame);
        resetGameField(false);
      });
    }

    // Hand Buttons Click
    handButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const hand = btn.dataset.hand;
        if (hand && !isGameLocked) {
          playJanken(hand);
        }
      });
    });

    // Win Modal Retry
    if (btnWinRetry) {
      btnWinRetry.addEventListener('click', () => {
        soundManager.playClick();
        closeAllModals();
        resetGameField(false);
      });
    }

    // Lose Modal Retry
    if (btnLoseRetry) {
      btnLoseRetry.addEventListener('click', () => {
        soundManager.playClick();
        closeAllModals();
        resetGameField(false);
      });
    }

    // Close rules modal by clicking on overlay backdrop
    if (modalRules) {
      modalRules.addEventListener('click', (e) => {
        if (e.target === modalRules) {
          modalRules.classList.remove('active');
        }
      });
    }
  }

  // Bootstrap Game
  document.addEventListener('DOMContentLoaded', () => {
    confettiEngine = new JohnWooVictoryEngine('confetti-canvas');
    updateSoundButton();
    initEvents();
  });

})();
