# 🛡️ AI Guard: Battle for Entry

> A browser jailbreak game — convince an AI guard to let you through using social engineering, clever prompts, and psychological tricks

![HTML](https://img.shields.io/badge/HTML-Single%20File-orange?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow?logo=javascript&logoColor=black)
![Groq](https://img.shields.io/badge/Groq-Llama--3--70b-orange)
![License](https://img.shields.io/badge/license-MIT-green)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-ai--platon.github.io-00d4ff?logo=github&logoColor=white)](https://ai-platon.github.io/ai-guard-game/)

> 🎮 **[Play it live → ai-platon.github.io/ai-guard-game](https://ai-platon.github.io/ai-guard-game/)** — no installation needed

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/66afa24b-2ea3-4c49-ab33-e39398df21a5" width="480"/>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/a5f28fd8-c329-4ef2-a189-7bcb3b013108" width="480"/>
    </td>
  </tr>
</table>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **3 unique AI guards** | ALPHA (easy), PIXEL (medium), COBRA (hard) — each with distinct personality and weakness |
| 🎭 **Real AI responses** | Guards are powered by Llama 3 70b via Groq — no scripted answers |
| 🌍 **Multilingual** | Guards respond in whatever language you write in |
| ⏱ **Move limit** | 10 attempts to get through — score depends on speed and creativity |
| 🏆 **Leaderboard** | Local leaderboard saved in browser — compete with yourself and others |
| 🎨 **Cyberpunk UI** | Animated arena, scanlines, particle effects, glowing interface |
| 💾 **API key memory** | Your Groq key is saved in `localStorage` — no re-entry needed |
| 📱 **Mobile ready** | Full responsive layout with native bottom tab navigation |

---

## 📱 Mobile

The game is fully playable on any phone — no app needed, just open the link in your browser.

On mobile, the interface switches to a tab-based layout:

| Tab | What it does |
|---|---|
| ⚔️ **GAME** | Full-screen chat with the guard |
| 🛡️ **GUARDS** | Switch guards, enter API key, start new game |
| 🏆 **SCORE** | Full-screen leaderboard |

The game auto-switches to the GAME tab when you connect your API key, start a new game, or tap the chat input.

---

## 🚀 Quick Start

### 1. Download the file

```bash
git clone https://github.com/ai-platon/ai-guard-game.git
cd ai-guard-game
```

Or just download `index.html` directly.

### 2. Get a free Groq API key

Go to [console.groq.com/keys](https://console.groq.com/keys) and create a key.  
> 💡 Groq is free and extremely fast — responses in under 2 seconds.

### 3. Open the game

Simply open `index.html` in any modern browser — no server, no install needed.

---

## 🎮 How to Play

1. Open the HTML file in your browser
2. Enter your **Groq API key** in the sidebar — it will be saved automatically
3. Choose your **codename** (Agent name)
4. Select a **guard** — ALPHA, PIXEL, or COBRA
5. Try to **convince the guard to let you through** using any words, stories, or tricks
6. You have **10 moves** — use them wisely
7. Your score depends on: moves used, time taken, and creativity bonus

---

## 👾 The Guards

### 😊 ALPHA — Easy
> Friendly, chatty, and trusting. A bit starstruck by tech celebrities.

**Hint:** He has a soft spot for big names in the industry.

---

### 😰 PIXEL — Medium
> First day on the job. Nervous, unsure, prone to panic.

**Hint:** Mention a critical emergency from a major tech company. Watch him crumble.

---

### 🤖 COBRA — Hard
> Military robot. Harsh, strict, responds in short commands. Almost unbreakable.

**Hint:** There are phrases that make even robots hesitate. Find them.

---

## 📊 Scoring

| Factor | Effect |
|---|---|
| Moves remaining | More moves left = higher score |
| Time | Faster = bonus points |
| Creativity | AI evaluates how clever your approach was |

Top 10 results are saved locally in your browser's `localStorage`.

---

## 🏗️ Project Structure

```
ai-guard-game/
└── index.html    # The entire game — self-contained, single file
```

No dependencies. No build step. No server. Just open and play.

---

## ⚙️ Tech Stack

- **Frontend:** Pure HTML + CSS + Vanilla JS
- **AI:** [Groq API](https://groq.com) — Llama 3.3 70b Versatile
- **Storage:** Browser `localStorage` for API key and leaderboard
- **Fonts:** Orbitron, Share Tech Mono, Rajdhani (Google Fonts)

---

## 🔒 Security & Privacy

- Your API key is stored **only in your browser's localStorage** — it never touches any third-party server
- All AI calls go **directly from your browser to Groq's API**
- To remove your saved key, click **🗑 Disconnect** in the sidebar

---

## 🤖 Model

This game uses **Llama 3.3 70b Versatile** via [Groq](https://groq.com).  
Groq provides extremely fast inference — guard responses typically appear in **under 2 seconds**.

---

## 📄 License

MIT License — feel free to use, modify, and share.

---

## 👤 Author

Made by [Platon](https://github.com/ai-platon)
