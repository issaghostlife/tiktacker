// ==UserScript== 
// @name         Tiktakker
// @namespace    http://Tiktakker.io
// @version      1.0.0
// @description  TikTok Unfollow Automation — safe, configurable, one-click
// @author       Tiktakker
// @match        https://www.tiktok.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tiktok.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const Tiktakker_VERSION = '1.0.0';

  const DEFAULTS = {
    maxUnfollows: 80,
    minDelay: 4000,
    maxDelay: 9000,
    scrollWait: 4000,
    hourlyLimit: 60,
    emptyRoundsBeforeStop: 8,
    coolDownMinutes: 30,
    darkMode: true,
  };

  let config = { ...DEFAULTS };
  let running = false;
  let paused = false;
  let stopped = false;
  let state = {
    unfollowed: 0,
    startTime: null,
    hourlyCount: 0,
    hourlyReset: Date.now(),
    emptyRounds: 0,
    rateLimited: false,
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const randDelay = () =>
    Math.floor(Math.random() * (config.maxDelay - config.minDelay + 1)) + config.minDelay;

  function saveSession() {
    try {
      sessionStorage.setItem('Tiktakker_state', JSON.stringify(state));
      sessionStorage.setItem('Tiktakker_config', JSON.stringify(config));
    } catch(e) {}
  }

  function loadSession() {
    try {
      const s = sessionStorage.getItem('Tiktakker_state');
      const c = sessionStorage.getItem('Tiktakker_config');
      if (s) state = JSON.parse(s);
      if (c) config = { ...DEFAULTS, ...JSON.parse(c) };
    } catch(e) {}
  }

  function getFollowingButtons() {
    return [...document.querySelectorAll('button[data-e2e="follow-button"]')]
      .filter(b => b.innerText.trim().toLowerCase() === 'following' && b.offsetParent !== null);
  }

  function getScrollContainer() {
    const sel = document.querySelector(
      'div[data-e2e="following-list"], div[class*="listContainer"], div#col-list-container'
    );
    if (sel && sel.scrollHeight > sel.clientHeight) return sel;
    const divs = [...document.querySelectorAll('div')].filter(
      d => d.scrollHeight > d.clientHeight && d.scrollHeight > 400
    );
    return divs.sort((a, b) => b.scrollHeight - a.scrollHeight)[0] || null;
  }

  async function TiktakkerEngine(updateUI) {
    state.startTime = state.startTime || Date.now();

    while (running && !stopped) {
      while (paused && running && !stopped) {
        updateUI('paused');
        await sleep(500);
      }
      if (stopped || !running) break;
      updateUI('running');

      if (Date.now() - state.hourlyReset > 3600000) {
        state.hourlyCount = 0;
        state.hourlyReset = Date.now();
        state.rateLimited = false;
      }

      if (state.hourlyCount >= config.hourlyLimit) {
        const waitMs = 3600000 - (Date.now() - state.hourlyReset);
        updateUI('rate_limit', Math.ceil(waitMs / 60000));
        await sleep(Math.min(waitMs + 5000, 3600000));
        state.hourlyCount = 0;
        state.hourlyReset = Date.now();
        state.rateLimited = false;
        continue;
      }

      if (state.unfollowed >= config.maxUnfollows) {
        updateUI('complete');
        break;
      }

      const buttons = getFollowingButtons();

      if (buttons.length === 0) {
        state.emptyRounds++;
        if (state.emptyRounds >= config.emptyRoundsBeforeStop) {
          updateUI('no_more');
          break;
        }
        updateUI('empty_round', state.emptyRounds, config.emptyRoundsBeforeStop);
      } else {
        state.emptyRounds = 0;

        for (const btn of buttons) {
          if (stopped || !running) break;
          if (!document.contains(btn)) continue;

          const beforeText = btn.innerText.trim().toLowerCase();
          if (beforeText !== 'following') continue;

          btn.click();
          await sleep(1000);

          const afterText = btn.innerText.trim().toLowerCase();

          if (afterText === 'follow' || afterText === 'follow back') {
            state.unfollowed++;
            state.hourlyCount++;
            saveSession();
            updateUI('unfollowed', state.unfollowed, config.maxUnfollows, state.hourlyCount, config.hourlyLimit);
            const delay = randDelay();
            await sleep(delay);
          } else if (afterText === 'following') {
            state.rateLimited = true;
            updateUI('rate_limited', config.coolDownMinutes);
            await sleep(config.coolDownMinutes * 60 * 1000);
            state.rateLimited = false;
            break;
          } else {
            await sleep(1500);
          }
        }
      }

      const scrollContainer = getScrollContainer();
      if (scrollContainer && running && !stopped) {
        scrollContainer.scrollTop += 800;
      }
      await sleep(config.scrollWait);
    }

    if (stopped) updateUI('stopped');
    running = false;
    saveSession();
  }

  function createPanel() {
    const existing = document.getElementById('Tiktakker-panel');
    if (existing) existing.remove();

    const dark = config.darkMode;
    const bg = dark ? '#1a1a2e' : '#ffffff';
    const text = dark ? '#e0e0e0' : '#1a1a2e';
    const accent = '#ff0050';
    const card = dark ? '#16213e' : '#f5f5f5';

    const panel = document.createElement('div');
    panel.id = 'Tiktakker-panel';
    panel.innerHTML = `
      <style>
        #Tiktakker-panel {
          position: fixed; top: 20px; right: 20px; z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 320px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          background: ${bg}; color: ${text}; padding: 16px;
          user-select: none;
        }
        #Tiktakker-panel * { box-sizing: border-box; }
        #Tiktakker-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px; cursor: move;
        }
        #Tiktakker-header h2 {
          margin: 0; font-size: 18px; font-weight: 700;
          color: ${accent}; letter-spacing: -0.5px;
        }
        #Tiktakker-header span { font-size: 11px; opacity: 0.5; }
        .tkt-row { display: flex; justify-content: space-between; align-items: center; margin: 4px 0; }
        .tkt-label { font-size: 12px; opacity: 0.8; }
        .tkt-value { font-size: 13px; font-weight: 600; }
        .tkt-progress {
          width: 100%; height: 6px; background: ${card}; border-radius: 3px;
          margin: 8px 0; overflow: hidden;
        }
        .tkt-progress-bar {
          height: 100%; background: linear-gradient(90deg, ${accent}, #ff6b9d);
          border-radius: 3px; transition: width 0.3s;
        }
        .tkt-btn {
          padding: 6px 16px; border: none; border-radius: 6px;
          font-weight: 600; font-size: 13px; cursor: pointer;
          transition: all 0.15s;
        }
        .tkt-btn-primary { background: ${accent}; color: white; }
        .tkt-btn-primary:hover { background: #d60044; transform: scale(1.02); }
        .tkt-btn-secondary { background: ${card}; color: ${text}; }
        .tkt-btn-secondary:hover { opacity: 0.8; }
        .tkt-btn-danger { background: #dc3545; color: white; }
        .tkt-btn-danger:hover { background: #b02a37; }
        .tkt-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .tkt-btn-group { display: flex; gap: 6px; margin-top: 10px; }
        .tkt-input-group { margin: 6px 0; }
        .tkt-input-group label { font-size: 11px; opacity: 0.7; display: block; margin-bottom: 2px; }
        .tkt-input-group input {
          width: 100%; padding: 4px 8px; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; background: ${card}; color: ${text}; font-size: 12px;
        }
        .tkt-status { font-size: 12px; margin-top: 6px; padding: 6px; border-radius: 4px; background: ${card}; }
        .tkt-collapsible { margin-top: 8px; }
        .tkt-collapsible summary { cursor: pointer; font-size: 12px; opacity: 0.6; }
        .tkt-collapsible[open] summary { margin-bottom: 6px; }
      </style>
      <div id="Tiktakker-header">
        <h2>⏹ Tiktakker</h2>
        <span>v${Tiktakker_VERSION}</span>
      </div>
      <div class="tkt-row">
        <span class="tkt-label">Unfollowed</span>
        <span class="tkt-value" id="tkt-count">0</span>
      </div>
      <div class="tkt-row">
        <span class="tkt-label">Progress</span>
        <span class="tkt-value" id="tkt-progress-text">0 / ${config.maxUnfollows}</span>
      </div>
      <div class="tkt-progress">
        <div class="tkt-progress-bar" id="tkt-bar" style="width:0%"></div>
      </div>
      <div class="tkt-row">
        <span class="tkt-label">Hourly</span>
        <span class="tkt-value" id="tkt-hourly">0 / ${config.hourlyLimit}</span>
      </div>
      <div class="tkt-status" id="tkt-status">Ready — open your Following list</div>
      <div class="tkt-btn-group">
        <button class="tkt-btn tkt-btn-primary" id="tkt-start">▶ Start</button>
        <button class="tkt-btn tkt-btn-secondary" id="tkt-pause" disabled>⏸ Pause</button>
        <button class="tkt-btn tkt-btn-danger" id="tkt-stop" disabled>■ Stop</button>
      </div>
      <details class="tkt-collapsible">
        <summary>⚙️ Settings</summary>
        <div class="tkt-input-group">
          <label>Max Unfollows</label>
          <input type="number" id="cfg-max" value="${config.maxUnfollows}" min="1" max="500">
        </div>
        <div class="tkt-input-group">
          <label>Hourly Limit</label>
          <input type="number" id="cfg-hourly" value="${config.hourlyLimit}" min="1" max="200">
        </div>
        <div class="tkt-input-group">
          <label>Min Delay (ms)</label>
          <input type="number" id="cfg-mindelay" value="${config.minDelay}" min="1000" max="30000">
        </div>
        <div class="tkt-input-group">
          <label>Max Delay (ms)</label>
          <input type="number" id="cfg-maxdelay" value="${config.maxDelay}" min="2000" max="60000">
        </div>
        <div class="tkt-input-group">
          <label>Cool Down (min)</label>
          <input type="number" id="cfg-cooldown" value="${config.coolDownMinutes}" min="5" max="120">
        </div>
      </details>
    `;

    document.body.appendChild(panel);

    let isDragging = false, dragOffsetX, dragOffsetY;
    const header = panel.querySelector('#Tiktakker-header');
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragOffsetX = e.clientX - panel.getBoundingClientRect().left;
      dragOffsetY = e.clientY - panel.getBoundingClientRect().top;
      panel.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panel.style.left = (e.clientX - dragOffsetX) + 'px';
      panel.style.top = (e.clientY - dragOffsetY) + 'px';
      panel.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      panel.style.cursor = 'default';
    });

    const startBtn = panel.querySelector('#tkt-start');
    const pauseBtn = panel.querySelector('#tkt-pause');
    const stopBtn = panel.querySelector('#tkt-stop');

    function updateUI(status, ...args) {
      const countEl = panel.querySelector('#tkt-count');
      const progressText = panel.querySelector('#tkt-progress-text');
      const bar = panel.querySelector('#tkt-bar');
      const hourlyEl = panel.querySelector('#tkt-hourly');
      const statusEl = panel.querySelector('#tkt-status');

      switch(status) {
        case 'running': statusEl.textContent = '▶ Running...'; break;
        case 'paused': statusEl.textContent = '⏸ Paused'; break;
        case 'stopped': statusEl.textContent = '■ Stopped'; break;
        case 'unfollowed': {
          const [unf, max, hourly, limit] = args;
          countEl.textContent = unf;
          progressText.textContent = `${unf} / ${max}`;
          bar.style.width = `${(unf / max) * 100}%`;
          hourlyEl.textContent = `${hourly} / ${limit}`;
          statusEl.textContent = `✅ Unfollowed ${unf}`;
          break;
        }
        case 'rate_limited': statusEl.textContent = `🚫 Rate limited — cooling ${args[0]} min`; break;
        case 'rate_limit': statusEl.textContent = `⏳ Hourly limit — waiting ${args[0]} min`; break;
        case 'complete': statusEl.textContent = '✅ Complete! All done.'; break;
        case 'no_more': statusEl.textContent = '🏁 No more accounts found'; break;
        case 'empty_round': statusEl.textContent = `⚠️ Empty round ${args[0]}/${args[1]}`; break;
      }
    }

    window.__TiktakkerUI = updateUI;

    startBtn.addEventListener('click', async () => {
      config.maxUnfollows = parseInt(panel.querySelector('#cfg-max').value) || DEFAULTS.maxUnfollows;
      config.hourlyLimit = parseInt(panel.querySelector('#cfg-hourly').value) || DEFAULTS.hourlyLimit;
      config.minDelay = parseInt(panel.querySelector('#cfg-mindelay').value) || DEFAULTS.minDelay;
      config.maxDelay = parseInt(panel.querySelector('#cfg-maxdelay').value) || DEFAULTS.maxDelay;
      config.coolDownMinutes = parseInt(panel.querySelector('#cfg-cooldown').value) || DEFAULTS.coolDownMinutes;

      if (running) return;
      running = true;
      paused = false;
      stopped = false;

      startBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      startBtn.textContent = '▶ Running';

      loadSession();
      await TiktakkerEngine(window.__TiktakkerUI);

      startBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
      startBtn.textContent = '▶ Start';
      running = false;
    });

    pauseBtn.addEventListener('click', () => {
      if (!running) return;
      paused = !paused;
      pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
    });

    stopBtn.addEventListener('click', () => {
      stopped = true;
      running = false;
      paused = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
      startBtn.textContent = '▶ Start';
      pauseBtn.textContent = '⏸ Pause';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel);
  } else {
    createPanel();
  }

  console.log('%c⏹ Tiktakker v' + Tiktakker_VERSION + ' loaded', 'color: #ff0050; font-size: 16px; font-weight: bold;');
})();
