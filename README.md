# Suraj Yadav - Portfolio v4

A high-performance personal engineering portfolio showcasing native Linux (Ubuntu Touch / Lomiri / QML), Flutter, and full-stack software development projects.

Live Site: [https://suraj-yadav0.github.io/](https://suraj-yadav0.github.io/)

---

## Tech Stack & Architecture

- **Core:** Semantic HTML5, Vanilla CSS3, Vanilla ES6+ JavaScript.
- **Motion & Scroll Physics:** GSAP 3, ScrollTrigger, Lenis smooth scrolling.
- **Typography:** Space Grotesk (display), JetBrains Mono (code/mono metadata).
- **Theme System:** CSS Custom Properties with persistent Light/Dark mode switcher (zero FOUC via pre-render execution).
- **Zero Framework Bloat:** No React/Vue runtime, no Tailwind, zero build step required for maximum load speed and low memory footprint.

---

## Key Features

- **Flagship Sticky Card Stack:** Multi-layer card deck driven by GSAP ScrollTrigger with in-focus clarity and dynamic depth layering.
- **Horizontal Pan Gallery:** Touch- and scroll-driven horizontal gallery for secondary projects with live progress tracking.
- **Persistent Ambient Pointer Highlighter:** GPU-accelerated cursor spotlight with inertial tracking via GSAP `quickTo`.
- **Proof Bento Grid:** Technical metric counters with animated numerical roll-ups.
- **Theme Switcher:** Seamless light and dark mode toggling with system preference detection (`prefers-color-scheme`) and `localStorage` persistence.
- **Performance Optimized:** WebP image assets, hardware-accelerated transforms (`transform`, `opacity`), and responsive layouts down to mobile viewports.

---

## Featured Projects

### Flagship Builds
1. **Quantro:** Adaptive numerical computing, unit conversion, and matrix calculation tool for Linux & Ubuntu Touch (QML, C++, Python).
2. **UTGPT:** Native AI client for Lomiri and Linux desktops with streaming responses (QML, Python).
3. **Time Management:** Native Pomodoro and interval productivity application on the OpenStore (QML, JavaScript).
4. **WishGift:** Crowdsourced gift-registry and pledge platform (Flutter, Dart, Firebase).
5. **clockApp:** Modernized stopwatch, world clock, and alarm utility for Ubuntu Touch (QML, JavaScript).

### Additional Builds & Contributions
- **Dekko 2:** Upstream open-source contributions (5 merged MRs) to Ubuntu Touch's convergent email client.
- **Lomiri Courses:** Co-authored Lomiri App Development Level 1 & Level 2 engineering curricula.
- **Money Manager UT, WhatsWeb, HarmonyDocs, Churn Prediction ML, Reddit Client, Invoice Generator, Nimbus Weather, Lomiri SDK Docker CLI.**

---

## Project Structure

```
portfolio-v4/
├── index.html              # Main application entry point
├── css/
│   └── style.css           # Design tokens, themes, layout, and animations
├── js/
│   └── main.js             # Lenis smooth scroll, GSAP ScrollTriggers, theme engine
├── assets/
│   └── projects/           # Optimized WebP project mockups and previews
└── README.md               # Documentation
```

---

## Local Development

No build toolchain or package manager installation is required.

### 1. Clone the repository
```bash
git clone https://github.com/suraj-yadav0/portfolio-v4.git
cd portfolio-v4
```

### 2. Run a local development server
Using Python:
```bash
python3 -m http.server 8000
```
Or using Node.js (`npx`):
```bash
npx serve .
```

### 3. Open in browser
Navigate to `http://localhost:8000`.

---

## License

MIT License. Copyright (c) 2026 Suraj Yadav.
