<p align="center">
  <img src="assets/tiktakker-logo.png" alt="TikTakker Logo" width="900">
</p>

> TikTok Unfollow Automation — Safe, configurable, one-click unfollow tool.

---

## Features

* 🎯 **One-click unfollow** — instant, no confirmation dialog
* 📊 **Live progress panel** — drag anywhere on screen
* ⏸️ **Pause / Resume / Stop** — full control mid-session
* 🛡️ **Rate-limit protection** — detects blocks, cools down, then resumes
* ⏱️ **Hourly cap** — default 60/hr, fully adjustable
* 💾 **Session persistence** — survives page refresh and continues where you left off
* ⚙️ **Customizable settings** — delays, limits, cooldowns, and more
* 🌙 **Dark mode** — matches TikTok’s aesthetic

---

## Installation & Usage

There are multiple ways to use Tiktacker.
**Tampermonkey is recommended** because it auto-loads on TikTok.

---

## Method 1: Tampermonkey

### Best Option — Auto-loads

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open this install link:


https://github.com/issaghostlife/tiktacker/raw/main/tiktacker.user.js

3. Tampermonkey will ask you to install the script.
4. Go to TikTok.com.
5. The Tiktacker panel will appear automatically.

---

## Method 2: Bookmarklet Loader

### Works With Browser Bookmark Size Limits

Create a new bookmark and name it:

```text
Tiktacker
```

Paste this as the bookmark URL:

```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://issaghostlife.github.io/tiktacker/bookmarklet.js?v='+Date.now();document.body.appendChild(s);})();
```

### How to Use

1. Go to TikTok.
2. Open your Following list.
3. Click the `Tiktacker` bookmark.
4. Click **Start** on the panel.

---

## Method 3: Console One-Liner

### No Install Required

1. Go to TikTok.
2. Open your Following list.
3. Press `F12`.
4. Open the **Console** tab.
5. Type:

```text
allow pasting
```

6. Press Enter.
7. Paste this command:

```javascript
fetch('https://issaghostlife.github.io/tiktacker/tiktacker.js').then(r=>r.text()).then(eval)
```

8. Press Enter.

The Tiktacker panel will appear.

---

## Method 4: Console Paste Full Script

1. Go to TikTok.
2. Open your Following list.
3. Press `F12`.
4. Open the **Console** tab.
5. Type:

```text
allow pasting
```

6. Press Enter.
7. Open `tiktacker.js`.
8. Click **Raw**.
9. Press `Ctrl + A`, then `Ctrl + C`.
10. Paste the full script into the console.
11. Press Enter.

---

## Method 5: Browser Extension

### Chrome / Edge / Brave

1. Download this repository as a ZIP.
2. Extract the ZIP to a folder.
3. Open Chrome, Edge, or Brave.
4. Go to:

```text
chrome://extensions
```

5. Enable **Developer mode** in the top-right corner.
6. Click **Load unpacked**.
7. Select the extracted folder.
8. Go to TikTok.

The extension is now installed.

---

## Default Settings

| Setting       | Default | What It Does                         |
| ------------- | ------: | ------------------------------------ |
| Max Unfollows |      80 | Stops after this many unfollows      |
| Hourly Limit  |      60 | Maximum unfollows per hour           |
| Min Delay     |  4000ms | Minimum wait before next click       |
| Max Delay     |  9000ms | Maximum wait before next click       |
| Cooldown      |  30 min | Wait time after rate limit detection |

---

## How Protection Works

| Feature              | How It Works                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Rate-limit detection | After clicking **Following**, the script checks if the button changed to **Follow**. If it stays **Following**, you may be rate-limited. |
| Auto cooldown        | Waits 30 minutes, then tries again.                                                                                                      |
| Hourly cap           | Defaults to 60 unfollows per hour. Adjustable in settings.                                                                               |
| Session save         | If the page refreshes or the tab closes, re-run the script and continue where you left off.                                              |
| Pause / Resume       | Pause mid-session without losing progress.                                                                                               |

---

## Important Notice

This tool is for educational purposes only.

TikTok’s Terms of Service may prohibit automation. Tiktacker is a client-side script that simulates user actions at configurable speeds.

Use responsibly and at your own risk.

---

## Disclaimer

The developer is not responsible for account restrictions, rate limits, bans, or any other action taken by TikTok.

Use this tool carefully.
