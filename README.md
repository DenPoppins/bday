# 🎉 Birthday Surprise Web Application

A personalized, interactive, and beautifully styled birthday surprise web application built with vanilla HTML5, CSS3, and JavaScript. Featuring real-time microphone breath/blow candle detection, interactive gift exploration, heartfelt letters, moments gallery, and dynamic confetti celebrations.

---

## 📖 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Interactive Flow & Architecture](#interactive-flow--architecture)
- [Key Features & Implementation Details](#key-features--implementation-details)
  - [1. Candle Blowing Detection (Web Audio API)](#1-candle-blowing-detection-web-audio-api)
  - [2. Playful Dodging Button Algorithm](#2-playful-dodging-button-algorithm)
  - [3. Dynamic Confetti Engine](#3-dynamic-confetti-engine)
  - [4. Gift Progress Tracking](#4-gift-progress-tracking)
- [Developer Customization Guide](#developer-customization-guide)
  - [Editing Content in `script.js`](#editing-content-in-scriptjs)
  - [Adding Photos](#adding-photos)
  - [Customizing Colors & Theme](#customizing-colors--theme)
  - [Adjusting Microphone Sensitivity](#adjusting-microphone-sensitivity)
- [Local Development & Setup](#local-development--setup)
- [Deployment Guide](#deployment-guide)
- [Browser Compatibility & Accessibility](#browser-compatibility--accessibility)

---

## 🌟 Project Overview

This project provides an engaging, multi-stage storytelling birthday experience that guides the user through sequential screens:
1. **Cake Screen**: Make a wish and blow out the candle using the microphone.
2. **Accept Gift Prompt**: Playful interactive prompt with a dodging "no" button.
3. **Flower Bouquet**: A blooming lotus bouquet presentation.
4. **Choose Your Gifts**: Hub screen tracking opened gifts.
5. **A Letter**: Elegant stationery letter with customizable text and photo.
6. **Moments**: Polaroid-style photo album with memories and captions.
7. **Grand Finale**: Festive celebratory ending screen with customized recipient name and confetti.

---

## 🛠 Tech Stack

- **HTML5**: Semantic tags, inline SVG illustrations for responsive, vector-sharp graphics.
- **CSS3**: Custom properties (CSS variables), grid/flexbox layouts, responsive typography using `clamp()`, keyframe animations, and prefers-reduced-motion media queries.
- **JavaScript (Vanilla ES6+)**: Zero external dependencies. Uses the Web Audio API (`AudioContext`, `AnalyserNode`) and Web Animations API.
- **Fonts**: Google Fonts (`Sacramento`, `Caveat`, `Poppins`).

---

## 📂 Directory Structure

```text
d:/Projects/bday_sprise/
│
├── index.html          # Markup containing all screens and inline SVG illustrations
├── style.css           # Styling, themes, animations, and responsive layout rules
├── script.js           # Configuration, navigation, audio analysis, and interaction logic
├── lotus_bouquet.jpg   # Image asset displayed on the bouquet screen
└── README.md           # Developer documentation
```

### File Breakdown

| File | Purpose |
| :--- | :--- |
| `index.html` | Defines the container `.stage` and all step sections (`#s-cake`, `#s-ask`, `#s-no`, `#s-bouquet`, `#s-gifts`, `#s-letter`, `#s-photos`, `#s-end`). Uses `.screen.on` to display the active view. |
| `style.css` | Handles graph-paper background pattern, checked ribbon borders, card styling, polaroids, SVG flame flicker/smoke animations, and responsiveness. |
| `script.js` | Contains the central `CONFIG` object for text/photos, screen transition handler `go()`, Web Audio API analyser, and event listeners. |
| `lotus_bouquet.jpg` | Default asset for the bouquet screen (`#s-bouquet`). |

---

## 🔄 Interactive Flow & Architecture

The application operates as a single-page state machine where only one `.screen` has the `.on` class at any given time.

```mermaid
flowchart TD
    A[1. Candle Screen (#s-cake)] -->|Blow Candle via Mic| B[2. Accept Prompt (#s-ask)]
    B -->|Click 'Yes'| D[4. Flower Bouquet (#s-bouquet)]
    B -->|Click 'No' after 5 dodges| C[3. 'Why did you click no!' (#s-no)]
    C -->|Click 'Try again'| B
    D -->|Click 'Open your gifts'| E[5. Gift Selection Hub (#s-gifts)]
    E <-->|Open & Back| F[6. Letter (#s-letter)]
    E <-->|Open & Back| G[7. Moments Gallery (#s-photos)]
    E -->|Both opened -> 'I'm done'| H[8. Finale Screen (#s-end)]
    H -->|Click 'Open them again'| E
```

### Screen Navigation

Screen switches are handled by `data-go` attributes:
```html
<button class="btn" data-go="s-gifts">open your gifts</button>
```
In `script.js`, any click matching `[data-go]` triggers:
```javascript
function go(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("on", s.id === id));
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}
```

---

## ⚡ Key Features & Implementation Details

### 1. Candle Blowing Detection (Web Audio API)

Located in `script.js` inside `startBlowDetection()`:
- **Audio Stream**: Requests microphone access via `navigator.mediaDevices.getUserMedia({ audio: true })`.
- **Frequency Analysis**: Connects the input stream to an `AnalyserNode` with `fftSize = 512`.
- **Breath Sound Signature**:
  - Exhaling into a microphone creates turbulent noise concentrated in lower frequency bins (approx 60 Hz – 700 Hz, bins 1 to 8).
  - The script checks if `lowAvg > 35` and `totalAvg > 14`.
  - When sustained across 2 animation frames (~50–80ms), the flame is extinguished:
    - Stops audio tracks to release microphone hardware.
    - Adds `.out` class to the cake SVG.
    - Launches celebratory confetti and automatically transitions to `#s-ask`.

### 2. Playful Dodging Button Algorithm

Located in `script.js`:
- The `#noBtn` listens for `pointerdown`, `mouseenter`, and `click`.
- Each hover/attempt increments `dodges`:
  - Translates the button randomly within `X: [-110px, +110px]` and `Y: [-40px, +80px]`.
  - Scales down by `(1 - dodges * 0.09)` to make it harder and funnier to click.
- On the 5th attempt, the button label changes to `"fine, no"`, allowing the user to click it and view `#s-no`.

### 3. Dynamic Confetti Engine

- Implemented via `confetti(n)` in `script.js`.
- Respects user accessibility preferences (`prefers-reduced-motion`).
- Dynamically creates DOM elements with random horizontal positions and animated transforms (translation + rotation) using the browser's native `Element.animate()`.
- Automatically removes DOM elements upon animation completion (`onfinish`).

### 4. Gift Progress Tracking

- Tracks visited gifts using a JavaScript `Set`:
```javascript
const opened = new Set();
function mark(key) {
  opened.add(key);
  // Unlocks the finish button when both 'letter' and 'photos' are viewed
  if (opened.size === 2) {
    document.querySelector("#toEnd").hidden = false;
  }
}
```

---

## 🎨 Developer Customization Guide

### Editing Content in `script.js`

All personalization is centralized in the `CONFIG` object at the top of [script.js](file:///d:/Projects/bday_sprise/script.js#L4-L20):

```javascript
const CONFIG = {
  // Recipient's name (appears on document title and finale screen)
  name: "Babe",

  // Letter screen header
  letterTitle: "happy birthday, my love",

  // Optional photo above the letter text (e.g., "couple.jpg" or URL, or "" to omit)
  letterPhoto: "",

  // Paragraphs of the letter (each array item renders as a <p> tag)
  letter: [
    "Happy birthday to my favourite person!!",
    "Thank you for being my best friend for the past 7 years or so...",
    "I hope this year brings you more joy, more strength, and every new beginning."
  ],

  // Closing sign-off (supports \n for line breaks)
  signOff: "With love,\nAkku",

  // Photo gallery polaroids (src: image path or URL; caption: card text)
  photos: [
    { src: "assets/photo1.jpg", caption: "Our favourite moment" },
    { src: "assets/photo2.jpg", caption: "Unforgettable memories" },
    { src: "assets/photo3.jpg", caption: "Smiles & laughter" }
  ]
};
```

> [!TIP]
> If a photo has an empty string `src: ""`, the gallery automatically renders an elegant placeholder heart SVG and `"Photo coming soon"`.

### Adding Photos

1. Place your photos in the project folder (or an `assets/` subfolder).
2. For the bouquet screen:
   - Replace `lotus_bouquet.jpg` or update the `<img src="...">` tag in [index.html](file:///d:/Projects/bday_sprise/index.html#L116).
3. For the moments screen:
   - Update `CONFIG.photos` in [script.js](file:///d:/Projects/bday_sprise/script.js).

### Customizing Colors & Theme

Modify CSS variables in [:root](file:///d:/Projects/bday_sprise/style.css#L1-L10) inside `style.css`:

```css
:root {
  --paper: #F6F1DC;        /* Background paper tint */
  --grid: rgba(44,56,120,.13); /* Background graph-paper grid lines */
  --navy: #2A3676;         /* Primary brand color */
  --navy-deep: #1B2352;    /* Headings and primary text */
  --navy-soft: #6A74AE;    /* Subheadings and secondary text */
  --card: #FFFDF2;         /* Card & poster background */
  --gold: #E8C35C;         /* Candle flame & accent gold */
  --shadow: rgba(27,35,82,.22); /* Card shadow tone */
}
```

### Adjusting Microphone Sensitivity

To calibrate candle blow sensitivity in [script.js](file:///d:/Projects/bday_sprise/script.js#L165-L185):

```javascript
// Threshold for low frequencies (breath sound):
if (lowAvg > 35 && totalAvg > 14) {
  rushCount++;
  // Required sustained duration: 2 frames (~50-80ms)
  if (rushCount >= 2) {
    extinguishCandle();
  }
}
```
- Decrease `lowAvg > 35` (e.g. to `30`) if you want the candle to blow out with an even lighter breath.
- Increase `rushCount >= 2` (e.g. to `4`) if ambient noise is triggering it accidentally.

---

## 💻 Local Development & Setup

> [!IMPORTANT]
> The Web Audio API (`navigator.mediaDevices.getUserMedia`) requires a **Secure Context** (`https://` or `http://localhost`). Opening `index.html` directly via `file:///` in your browser may prevent microphone access.

Run any local web server from the project directory:

### Option 1: Python
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

### Option 2: Node.js (`npx serve`)
```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click [index.html](file:///d:/Projects/bday_sprise/index.html) and select **Open with Live Server**.

### Option 4: PHP
```bash
php -S localhost:8000
```

---

## 🚀 Deployment Guide

Because this application consists entirely of static assets, it can be hosted for free on any static web host:

### GitHub Pages
1. Push this repository to GitHub.
2. In your repository, go to **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and directory `/ (root)`.
4. Click **Save**. Your site will be live with HTTPS enabled!

### Vercel / Netlify / Cloudflare Pages
- Drag and drop the project folder directly into the web dashboard or link your Git repository.
- No build command or output directory configuration is needed (leave blank / standard root).

---

## 📱 Browser Compatibility & Accessibility

- **Modern Browsers**: Tested on Chrome, Firefox, Safari, Edge, Android Chrome, and iOS Safari.
- **Mobile Responsive**: Built with responsive SVG viewBoxes, fluid typography (`clamp()`), and media queries.
- **Microphone Interaction**: Candle blow detection uses real-time Web Audio API frequency analysis to extinguish the flame purely via blowing into the microphone.
