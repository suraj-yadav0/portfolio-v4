# Suraj Yadav - Portfolio v4

A high-performance personal engineering portfolio showcasing native Linux (Ubuntu Touch / Lomiri / QML), Flutter, and full-stack software development projects.

Live Site: [https://suraj-yadav0.github.io/](https://suraj-yadav0.github.io/portfolio-v4/)

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
1. **Quantro:** Local-first personal finance suite with automatic SMS expense tracking and instant SQLite queries (Flutter, Drift SQLite, Firebase).
2. **utgpt:** Native on-device AI chat application for Ubuntu Touch and Lomiri with streaming GGUF responses (QML, Python).
3. **Time Management:** Enterprise timesheet tracking and multi-server Odoo ERP synchronizer on OpenStore (QML, Python, Lomiri).
4. **WishGift:** Collaborative wishlist and social gifting platform with atomic reservation locks (Next.js 16, React 19, Prisma, PostgreSQL).
5. **Tower Crash:** Fast-paced helix-jump arcade game for Ubuntu Touch and Lomiri on OpenStore (QML, Qt Quick, JavaScript, SQLite).
6. **Depth Clock:** Automatic iOS-style 3D depth effect clock for GNOME desktop wallpapers using on-device neural segmentation (JavaScript, ONNX Runtime, Cairo, Clutter).

### Additional Builds & Contributions
- **SarkariScript:** AI-powered government paperwork copilot and auto-filler for Indian citizens across 8 regional languages.
- **Ubuntu Touch Developer Academy:** Educational website, OS architecture handbook, and practical student lab materials for mobile Linux.
- **Shopping List:** Native Ubuntu Touch shopping checklist application with local SQLite storage on OpenStore.
- **clockApp:** Geometric background clock face for GNOME Shell with layered typography and visual effects.
- **Document Harmony:** Indian official record consistency verification engine with automated anomaly detection.
- **Dekko 2:** Upstream open-source contributions (10 merged MRs) to Ubuntu Touch's convergent email client.
- **Lomiri Courses:** Co-authored Lomiri App Development Level 1 & Level 2 engineering curricula.
- **WhatsWeb, Money UT, Churn Prediction ML, Reddit Client, Invoice Generator, Nimbus Weather, Lomiri SDK Docker CLI.**

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
