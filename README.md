

# 🚀 SPX Live Graphics Engine

A real-time esports broadcast overlay system designed for tournaments, scrims, and live streams.
Built for **speed, automation, and broadcast-quality visuals**.

---

## 🎮 Overview

SPX is a **live graphics engine** that converts match data into dynamic on-screen overlays for OBS.

### It supports:

* Real-time leaderboard updates
* Side scoreboard (vertical standings)
* Team wipe detection with animated alerts
* Event queue system for smooth broadcasting

---

## ⚡ Key Features

---

### 📊 Live Scoreboard

* Automatically updates from Google Sheets
* Sorted standings based on total points
* Clean, compact UI for live streams

---

### 📌 Side Leaderboard

* Vertical compact scoreboard
* Designed for in-game overlay
* Smooth updates without flickering

---

### 💀 Team Wipe Detection

* Detects when a team is fully eliminated (`ALIVE → 0`)
* Displays animated **“TEAM ELIMINATED”** card

**Includes:**

* Team name
* Placement (# rank at elimination)
* Team logo

---

### 🔁 Smart Event Queue System

* Handles multiple wipes without overlap
* Ensures every event is shown
* Broadcast-safe timing system

---

### 🖼 Team Logo Support

* Dynamic logo rendering
* Automatic fallback if logo is missing
* Clean scaling using CSS

---

### ⚡ High Performance

* Uses **Google Sheets API** (not OpenSheet)
* Optimized polling system
* Near real-time updates (~1 sec delay)

---

### 🧠 Intelligent Data Handling

* State-based detection system
* Prevents false triggers
* Works reliably under live conditions


* Add **screenshots section**
* Make it look like a **startup product README** 🚀
