/* Suraj Yadav · Portfolio v4 · Advanced GSAP + Lenis Choreography
   Rules: Hardware-accelerated transforms/opacity, Lenis inertial smoothing, ScrollTrigger-driven */

(function () {
  "use strict";

  var lenis = null;
  var audioCtx = null;

  function getAudioContext() {
    try {
      var AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      if (!audioCtx) audioCtx = new AudioCtor();
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  // Pre-unlock audio context on first user interaction anywhere
  function unlockAudio() {
    var ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(function () {});
    }
  }
  ["pointerdown", "keydown", "touchstart", "click"].forEach(function (evtName) {
    window.addEventListener(evtName, unlockAudio, { passive: true, once: true });
  });

  function playUiSound(soundType) {
    var ctx = getAudioContext();
    if (!ctx) return;

    function renderTone() {
      try {
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (soundType === "nav") {
          // Snappy high mechanical tick
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1100, now + 0.03);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
          osc.start(now);
          osc.stop(now + 0.035);
        } else if (soundType === "action") {
          // Punchy affirmative mechanical pop
          osc.type = "triangle";
          osc.frequency.setValueAtTime(480, now);
          osc.frequency.exponentialRampToValueAtTime(960, now + 0.045);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
          osc.start(now);
          osc.stop(now + 0.055);
        } else if (soundType === "open") {
          // Upward sliding chirp
          osc.type = "sine";
          osc.frequency.setValueAtTime(450, now);
          osc.frequency.exponentialRampToValueAtTime(850, now + 0.05);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
        } else if (soundType === "close") {
          // Downward sliding chirp
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.045);
          gain.gain.setValueAtTime(0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        }
      } catch (err) {}
    }

    if (ctx.state === "suspended") {
      ctx.resume().then(renderTone).catch(function () {});
    } else {
      renderTone();
    }
  }

  window.__playUiSound = playUiSound;

  /* ---------- Theme Toggle System ---------- */
  (function () {
    var toggleBtn = document.querySelector(".theme-toggle");
    if (!toggleBtn) return;

    function getTheme() {
      return document.documentElement.getAttribute("data-theme") || "dark";
    }

    function setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      try { localStorage.setItem("theme", theme); } catch (e) {}
      toggleBtn.setAttribute("aria-label", "Switch to " + (theme === "light" ? "dark" : "light") + " theme");
      toggleBtn.setAttribute("title", "Switch to " + (theme === "light" ? "dark" : "light") + " theme");
    }

    toggleBtn.addEventListener("click", function () {
      var current = getTheme();
      var next = current === "light" ? "dark" : "light";
      setTheme(next);
      playUiSound("action");
    });

    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
        if (!localStorage.getItem("theme")) {
          setTheme(e.matches ? "light" : "dark");
        }
      });
    }
  })();

  /* ---------- Toast Notification System ---------- */
  var toastTimer = null;
  function showToast(message, icon) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    var msgEl = toast.querySelector(".toast-msg");
    var iconEl = toast.querySelector(".toast-icon");
    if (msgEl) msgEl.textContent = message || "Copied to clipboard";
    if (iconEl && icon) iconEl.textContent = icon;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2800);
  }

  /* ---------- Quick-Copy to Clipboard System ---------- */
  (function () {
    var copyButtons = document.querySelectorAll(".copy-email-btn, [data-copy]");
    copyButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var textToCopy = btn.getAttribute("data-copy") || btn.textContent.trim();
        if (!textToCopy) return;

        function onSuccess() {
          btn.classList.add("copied");
          var btnText = btn.querySelector(".copy-btn-text");
          var originalText = btnText ? btnText.textContent : "";
          if (btnText) btnText.textContent = "Copied!";
          showToast("Copied " + textToCopy + " to clipboard", "✓");
          playUiSound("action");

          setTimeout(function () {
            btn.classList.remove("copied");
            if (btnText) btnText.textContent = originalText;
          }, 2200);
        }

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(textToCopy).then(onSuccess).catch(function () {
            fallbackCopy(textToCopy, onSuccess);
          });
        } else {
          fallbackCopy(textToCopy, onSuccess);
        }
      });
    });

    function fallbackCopy(text, cb) {
      try {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        var successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful && cb) cb();
      } catch (err) {
        showToast("Press Ctrl+C to copy: " + text, "i");
      }
    }
  })();

  /* ---------- Command Palette (Ctrl+K) & Spotlight Search Engine ---------- */
  (function () {
    var palette = document.getElementById("cmd-palette");
    var triggers = document.querySelectorAll(".cmd-trigger");
    if (!palette) return;

    var input = palette.querySelector(".cmd-input");
    var listWrap = palette.querySelector(".cmd-list-wrap");
    var closeBtn = palette.querySelector(".cmd-close");
    var lastFocusedEl = null;
    var isOpen = false;
    var activeIndex = 0;
    var currentMatches = [];

    var isMac = false;
    try {
      isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent || "");
    } catch (e) {}

    if (isMac) {
      document.querySelectorAll(".cmd-kbd-mod").forEach(function (mod) {
        mod.textContent = "Cmd";
      });
      triggers.forEach(function (trig) {
        trig.setAttribute("title", "Open command palette (Cmd+K)");
        trig.setAttribute("aria-label", "Open command palette (Cmd+K)");
      });
    }

    var isArticle = window.location.pathname.indexOf("/blog/") !== -1;
    var isBlogIndex = window.location.pathname.endsWith("blog.html") || window.location.pathname.endsWith("/blog");
    var homePrefix = isArticle ? "../index.html" : (isBlogIndex ? "index.html" : "");
    var blogPrefix = isArticle ? "../blog.html" : "blog.html";
    var caseStudyUrl = isArticle ? "#" : (isBlogIndex ? "blog/evolution-of-my-portfolios.html" : "blog/evolution-of-my-portfolios.html");

    var catalog = [
      {
        id: "nav-work",
        title: "Selected Work",
        subtitle: "Five flagship builds owned end-to-end",
        category: "Navigation",
        icon: "layers",
        url: homePrefix ? homePrefix + "#work" : "#work",
        keywords: ["projects", "flagship", "apps", "portfolio", "code"]
      },
      {
        id: "nav-activity",
        title: "Open Source Activity",
        subtitle: "GitHub contribution heatmap and achievements",
        category: "Navigation",
        icon: "activity",
        url: homePrefix ? homePrefix + "#activity" : "#activity",
        keywords: ["github", "heatmap", "commits", "trophies", "stats"]
      },
      {
        id: "nav-proof",
        title: "Achievements in Numbers",
        subtitle: "1,100+ DSA problems, 112+ repositories",
        category: "Navigation",
        icon: "award",
        url: homePrefix ? homePrefix + "#proof" : "#proof",
        keywords: ["dsa", "leetcode", "proof", "stats", "metrics"]
      },
      {
        id: "nav-journey",
        title: "Journey Timeline",
        subtitle: "Career history: CALIN, NotAtMrp, CEC",
        category: "Navigation",
        icon: "git-branch",
        url: homePrefix ? homePrefix + "#journey" : "#journey",
        keywords: ["experience", "career", "jobs", "timeline", "resume"]
      },
      {
        id: "nav-builds",
        title: "More Builds",
        subtitle: "Side projects, QML tools, and open source explorations",
        category: "Navigation",
        icon: "grid",
        url: homePrefix ? homePrefix + "#builds" : "#builds",
        keywords: ["projects", "more", "tools", "utilities", "open source"]
      },
      {
        id: "nav-writing",
        title: "Engineering Blog",
        subtitle: "Case studies, portfolio retrospectives, and deep dives",
        category: "Navigation",
        icon: "book-open",
        url: isBlogIndex ? "#" : blogPrefix,
        keywords: ["blog", "writing", "articles", "case study", "portfolios"]
      },
      {
        id: "nav-about",
        title: "About / Manifesto",
        subtitle: "Engineering philosophy for native and open platforms",
        category: "Navigation",
        icon: "user",
        url: homePrefix ? homePrefix + "#about" : "#about",
        keywords: ["about", "bio", "philosophy", "manifesto", "linux"]
      },
      {
        id: "nav-contact",
        title: "Contact & Connect",
        subtitle: "Email address, social channels, and sitemap",
        category: "Navigation",
        icon: "mail",
        url: homePrefix ? homePrefix + "#contact" : "#contact",
        keywords: ["contact", "email", "hire", "collaborate", "social"]
      },
      {
        id: "proj-quantro",
        title: "Quantro",
        subtitle: "Local-first personal finance suite with SQLite & Flutter",
        category: "Projects",
        icon: "external",
        url: "https://money-manager-eight-nu.vercel.app",
        external: true,
        tag: "Live App",
        keywords: ["flutter", "sqlite", "drift", "finance", "money", "android", "web"]
      },
      {
        id: "proj-utgpt",
        title: "utgpt",
        subtitle: "Private on-device AI client for Ubuntu Touch and Lomiri",
        category: "Projects",
        icon: "external",
        url: "https://open-store.io/app/utgpt.surajyadav",
        external: true,
        tag: "OpenStore",
        keywords: ["ai", "llm", "qml", "python", "ubuntu touch", "lomiri", "openstore", "gguf"]
      },
      {
        id: "proj-timemanagement",
        title: "Time Management",
        subtitle: "Timesheet logger and multi-server Odoo ERP synchronizer",
        category: "Projects",
        icon: "external",
        url: "https://open-store.io/app/ubtms",
        external: true,
        tag: "OpenStore",
        keywords: ["odoo", "erp", "qml", "python", "lomiri", "openstore", "tracking"]
      },
      {
        id: "proj-wishgift",
        title: "WishGift",
        subtitle: "Social wishlist platform with item reservation locking",
        category: "Projects",
        icon: "external",
        url: "https://github.com/suraj-yadav0/wishgift",
        external: true,
        tag: "GitHub",
        keywords: ["next.js", "react", "prisma", "postgresql", "tailwind", "gifting"]
      },
      {
        id: "proj-clockapp",
        title: "clockApp",
        subtitle: "Geometric background clock for GNOME Desktop",
        category: "Projects",
        icon: "external",
        url: "https://github.com/suraj-yadav0/clockApp",
        external: true,
        tag: "GitHub",
        keywords: ["gnome", "shell", "linux", "desktop", "javascript", "css"]
      },
      {
        id: "proj-dekko",
        title: "Dekko 2",
        subtitle: "5 merged MRs for convergent email client on Ubuntu Touch",
        category: "Projects",
        icon: "external",
        url: "https://gitlab.com/dekko/dekko",
        external: true,
        tag: "GitLab",
        keywords: ["email", "qml", "c++", "ubuntu touch", "lomiri"]
      },
      {
        id: "proj-whatsweb",
        title: "WhatsWeb",
        subtitle: "WhatsApp Web client for Ubuntu Touch with push daemon",
        category: "Projects",
        icon: "external",
        url: "https://github.com/suraj-yadav0/whatsweb",
        external: true,
        tag: "GitHub",
        keywords: ["whatsapp", "ubuntu touch", "qml", "push notifications"]
      },
      {
        id: "proj-harmony",
        title: "Document Harmony",
        subtitle: "Official identity document anomaly and verification engine",
        category: "Projects",
        icon: "external",
        url: "https://github.com/suraj-yadav0/harmony_docs",
        external: true,
        tag: "GitHub",
        keywords: ["aadhaar", "pan", "verification", "python", "security"]
      },
      {
        id: "proj-reddit",
        title: "Reddit Client",
        subtitle: "Native gesture-driven Reddit browser for Linux phones",
        category: "Projects",
        icon: "external",
        url: "https://github.com/suraj-yadav0/redditclient",
        external: true,
        tag: "GitHub",
        keywords: ["reddit", "linux", "qml", "mobile", "social"]
      },
      {
        id: "proj-invoice",
        title: "Invoice Generator",
        subtitle: "Cross-platform billing and tax calculation suite",
        category: "Projects",
        icon: "external",
        url: "https://github.com/suraj-yadav0/invoice_generator",
        external: true,
        tag: "GitHub",
        keywords: ["invoice", "flutter", "dart", "pdf", "billing"]
      },
      {
        id: "proj-nimbus",
        title: "Nimbus Weather",
        subtitle: "Clean weather forecast client using Open-Meteo",
        category: "Projects",
        icon: "external",
        url: "https://github.com/suraj-yadav0/nimbus_weather",
        external: true,
        tag: "GitHub",
        keywords: ["weather", "forecast", "open-meteo", "qml", "qt"]
      },
      {
        id: "proj-lomiri-docker",
        title: "Lomiri SDK Docker CLI",
        subtitle: "Reproducible containerized build environment for Lomiri",
        category: "Projects",
        icon: "external",
        url: "https://github.com/suraj-yadav0/lomiri-sdk-docker",
        external: true,
        tag: "GitHub",
        keywords: ["docker", "sdk", "lomiri", "ubuntu touch", "cli"]
      },
      {
        id: "study-portfolios",
        title: "Case Study: Evolution of My Portfolios",
        subtitle: "Technical analysis of 5 distinct portfolio systems built",
        category: "Articles",
        icon: "book-open",
        url: caseStudyUrl,
        tag: "Article",
        keywords: ["case study", "retrospective", "portfolios", "terminal", "scrapbook", "architecture"]
      },
      {
        id: "act-theme",
        title: "Switch Theme",
        subtitle: "Toggle between Dark and Light mode",
        category: "Actions",
        icon: "sun-moon",
        action: "toggle-theme",
        tag: "Command",
        keywords: ["theme", "dark", "light", "mode", "color", "palette"]
      },
      {
        id: "act-copy-email",
        title: "Copy Email Address",
        subtitle: "surajyadav200701@gmail.com",
        category: "Actions",
        icon: "copy",
        action: "copy-email",
        tag: "Action",
        keywords: ["email", "contact", "copy", "mail", "hire"]
      },
      {
        id: "act-cv",
        title: "Download Curriculum Vitae",
        subtitle: "Suraj Yadav Software Engineer CV (PDF)",
        category: "Actions",
        icon: "file-text",
        url: "https://suraj-yadav0.github.io/SurajYadav-sCV/cv.pdf",
        external: true,
        tag: "PDF",
        keywords: ["cv", "resume", "pdf", "hire", "download"]
      },
      {
        id: "act-github",
        title: "GitHub Profile",
        subtitle: "@suraj-yadav0 with 112+ repositories",
        category: "Actions",
        icon: "github",
        url: "https://github.com/suraj-yadav0",
        external: true,
        tag: "Profile",
        keywords: ["github", "git", "repositories", "code"]
      },
      {
        id: "act-leetcode",
        title: "LeetCode Profile",
        subtitle: "@suraj_yadav07 in the Top 6% worldwide",
        category: "Actions",
        icon: "code",
        url: "https://www.leetcode.com/suraj_yadav07",
        external: true,
        tag: "Profile",
        keywords: ["leetcode", "dsa", "algorithms", "problem solving"]
      },
      {
        id: "act-linkedin",
        title: "LinkedIn Profile",
        subtitle: "Connect and network with Suraj Yadav",
        category: "Actions",
        icon: "user-check",
        url: "https://www.linkedin.com/in/suraj-yadav-a63b3b220",
        external: true,
        tag: "Profile",
        keywords: ["linkedin", "network", "connect", "social"]
      },
      {
        id: "act-scroll-top",
        title: "Scroll to Top",
        subtitle: "Return to the top of the page",
        category: "Actions",
        icon: "arrow-up",
        action: "scroll-top",
        tag: "Jump",
        keywords: ["top", "up", "header", "hero"]
      }
    ];

    function getIconSvg(type) {
      switch (type) {
        case "layers":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>';
        case "activity":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>';
        case "award":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>';
        case "git-branch":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>';
        case "grid":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>';
        case "book-open":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
        case "user":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        case "mail":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>';
        case "external":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
        case "sun-moon":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
        case "copy":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="0" ry="0"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        case "file-text":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
        case "github":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>';
        case "code":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
        case "user-check":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>';
        case "arrow-up":
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
        default:
          return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      }
    }

    function filterCatalog(query) {
      var q = (query || "").trim().toLowerCase();
      if (!q) return catalog.slice();

      return catalog.filter(function (item) {
        if (item.title.toLowerCase().indexOf(q) !== -1) return true;
        if (item.subtitle.toLowerCase().indexOf(q) !== -1) return true;
        if (item.category.toLowerCase().indexOf(q) !== -1) return true;
        if (item.keywords && item.keywords.some(function (k) { return k.toLowerCase().indexOf(q) !== -1; })) return true;
        return false;
      }).sort(function (a, b) {
        var aTitle = a.title.toLowerCase();
        var bTitle = b.title.toLowerCase();
        var aExact = aTitle === q;
        var bExact = bTitle === q;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        var aStarts = aTitle.startsWith(q);
        var bStarts = bTitle.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
    }

    function renderList(query) {
      currentMatches = filterCatalog(query);
      listWrap.innerHTML = "";

      if (!currentMatches.length) {
        var empty = document.createElement("div");
        empty.className = "cmd-empty";
        var safeQuery = (query || "").replace(/[<>&"]/g, "");
        empty.innerHTML = '<p class="cmd-empty-title">No matches found for "' + safeQuery + '"</p><p class="cmd-empty-desc">Try searching for projects, sections, or commands like "theme", "cv", or "qml".</p>';
        listWrap.appendChild(empty);
        activeIndex = -1;
        return;
      }

      var groups = {};
      currentMatches.forEach(function (item, idx) {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push({ item: item, flatIndex: idx });
      });

      for (var cat in groups) {
        var groupEl = document.createElement("div");
        groupEl.className = "cmd-group";

        var groupTitle = document.createElement("div");
        groupTitle.className = "cmd-group-title";
        groupTitle.textContent = cat;
        groupEl.appendChild(groupTitle);

        groups[cat].forEach(function (entry) {
          var item = entry.item;
          var itemIdx = entry.flatIndex;

          var itemEl = document.createElement("div");
          itemEl.className = "cmd-item" + (itemIdx === activeIndex ? " is-active" : "");
          itemEl.setAttribute("role", "option");
          itemEl.setAttribute("data-index", itemIdx);
          itemEl.setAttribute("id", "cmd-item-" + item.id);

          var tagText = item.tag || (item.category === "Navigation" ? "Jump" : (item.external ? "External" : ""));

          itemEl.innerHTML =
            '<div class="cmd-item-left">' +
              '<span class="cmd-item-icon">' + getIconSvg(item.icon) + '</span>' +
              '<div class="cmd-item-info">' +
                '<p class="cmd-item-title">' + item.title + '</p>' +
                '<p class="cmd-item-desc">' + item.subtitle + '</p>' +
              '</div>' +
            '</div>' +
            '<div class="cmd-item-meta">' +
              (tagText ? '<span class="cmd-item-tag">' + tagText + '</span>' : '') +
              '<span class="cmd-item-hint"><kbd class="cmd-key">Enter</kbd></span>' +
            '</div>';

          itemEl.addEventListener("mouseenter", function () {
            setActiveIndex(itemIdx, false);
          });

          itemEl.addEventListener("click", function () {
            executeItem(item);
          });

          groupEl.appendChild(itemEl);
        });

        listWrap.appendChild(groupEl);
      }

      if (activeIndex >= currentMatches.length || activeIndex < 0) {
        activeIndex = 0;
      }
      updateActiveVisual(false);
    }

    function setActiveIndex(idx, scrollIntoView) {
      if (!currentMatches.length) return;
      activeIndex = Math.max(0, Math.min(idx, currentMatches.length - 1));
      updateActiveVisual(scrollIntoView);
      playUiSound("nav");
    }

    function updateActiveVisual(scrollIntoView) {
      var allItems = listWrap.querySelectorAll(".cmd-item");
      allItems.forEach(function (el) {
        var isCurr = parseInt(el.getAttribute("data-index"), 10) === activeIndex;
        if (isCurr) {
          el.classList.add("is-active");
          if (scrollIntoView) {
            el.scrollIntoView({ block: "nearest" });
          }
        } else {
          el.classList.remove("is-active");
        }
      });
    }

    function executeItem(item) {
      if (!item) return;
      playUiSound("action");

      if (item.action === "toggle-theme") {
        closePalette();
        var toggleBtn = document.querySelector(".theme-toggle");
        if (toggleBtn) {
          toggleBtn.click();
          var curr = document.documentElement.getAttribute("data-theme") || "dark";
          showToast("Switched to " + curr + " theme", "✓");
        }
        return;
      }

      if (item.action === "copy-email") {
        closePalette();
        var email = "surajyadav200701@gmail.com";
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(email).then(function () {
            showToast("Copied " + email + " to clipboard", "✓");
          }).catch(function () {
            showToast("Email: " + email, "i");
          });
        } else {
          showToast("Email: " + email, "i");
        }
        return;
      }

      if (item.action === "scroll-top") {
        closePalette();
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.1 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (item.external) {
        closePalette();
        window.open(item.url, "_blank", "noopener");
        return;
      }

      if (item.url) {
        closePalette();
        if (item.url.startsWith("#")) {
          var targetEl = document.querySelector(item.url);
          if (targetEl) {
            if (lenis) {
              lenis.scrollTo(targetEl, { offset: -60, duration: 1.1 });
            } else {
              targetEl.scrollIntoView({ behavior: "smooth" });
            }
          }
        } else {
          window.location.href = item.url;
        }
      }
    }

    function openPalette() {
      if (isOpen) return;
      isOpen = true;
      lastFocusedEl = document.activeElement;
      palette.removeAttribute("hidden");
      document.body.classList.add("cmd-open");

      if (lenis) lenis.stop();

      requestAnimationFrame(function () {
        palette.classList.add("is-open");
        input.value = "";
        activeIndex = 0;
        renderList("");
        input.focus();
      });

      playUiSound("open");
    }

    function closePalette() {
      if (!isOpen) return;
      isOpen = false;
      palette.classList.remove("is-open");
      document.body.classList.remove("cmd-open");

      if (lenis) lenis.start();

      setTimeout(function () {
        if (!isOpen) {
          palette.setAttribute("hidden", "true");
          if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
            lastFocusedEl.focus();
          }
        }
      }, 200);

      playUiSound("close");
    }

    triggers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (isOpen) closePalette();
        else openPalette();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closePalette();
      });
    }

    palette.addEventListener("click", function (e) {
      if (e.target === palette) {
        closePalette();
      }
    });

    input.addEventListener("input", function () {
      activeIndex = 0;
      renderList(input.value);
    });

    window.addEventListener("keydown", function (e) {
      var isModifierK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
      if (isModifierK) {
        e.preventDefault();
        if (isOpen) closePalette();
        else openPalette();
        return;
      }

      if (!isOpen) {
        if (e.key === "/" && document.activeElement !== input) {
          var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
          if (tag !== "input" && tag !== "textarea") {
            e.preventDefault();
            openPalette();
          }
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!currentMatches.length) return;
        var nextIdx = activeIndex + 1;
        if (nextIdx >= currentMatches.length) nextIdx = 0;
        setActiveIndex(nextIdx, true);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!currentMatches.length) return;
        var prevIdx = activeIndex - 1;
        if (prevIdx < 0) prevIdx = currentMatches.length - 1;
        setActiveIndex(prevIdx, true);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (currentMatches.length && activeIndex >= 0 && activeIndex < currentMatches.length) {
          executeItem(currentMatches[activeIndex]);
        }
        return;
      }
    });
  })();

  /* ---------- Live Metrics API Sync (GitHub & LeetCode) ---------- */
  (function () {
    // 1. Fetch GitHub live statistics
    fetch("https://api.github.com/users/suraj-yadav0")
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API response not ok");
        return res.json();
      })
      .then(function (data) {
        if (data && typeof data.public_repos === "number") {
          var ghRepoCount = document.getElementById("gh-count");
          var ghReposBadge = document.getElementById("gh-repos-badge");
          if (ghRepoCount) {
            ghRepoCount.setAttribute("data-target", data.public_repos);
            ghRepoCount.textContent = data.public_repos.toLocaleString();
          }
          if (ghReposBadge) {
            ghReposBadge.textContent = data.public_repos + " Repos";
          }
          var ghPill = document.getElementById("gh-live-pill");
          if (ghPill) {
            var text = ghPill.querySelector(".pill-text");
            if (text) text.textContent = "LIVE SYNCED";
          }
        }
      })
      .catch(function () {
        // Graceful fallback to pre-rendered static numbers
      });

    // 2. Fetch LeetCode live statistics
    fetch("https://alfa-leetcode-api.onrender.com/userProfile/suraj_yadav07")
      .then(function (res) {
        if (!res.ok) throw new Error("LeetCode API response not ok");
        return res.json();
      })
      .then(function (data) {
        if (data && typeof data.totalSolved === "number") {
          var lcCount = document.getElementById("lc-count");
          if (lcCount) {
            lcCount.textContent = data.totalSolved + "+";
          }
          if (data.ranking) {
            var rank = document.getElementById("lc-rank");
            if (rank) {
              var rankStr = data.ranking > 1000 ? "#" + Math.round(data.ranking / 1000) + "k" : "#" + data.ranking;
              rank.textContent = rankStr;
            }
          }
          var dsaPill = document.getElementById("dsa-live-pill");
          if (dsaPill) {
            var dsaText = dsaPill.querySelector(".pill-text");
            if (dsaText) dsaText.textContent = "LIVE SYNCED";
          }
        }
      })
      .catch(function () {
        // Graceful fallback
      });
  })();

  /* ---------- Interactive GitHub Heatmap Engine (Daily Commits, All-Time Totals, Tooltips, Year Switcher) ---------- */
  (function () {
    var canvasContainer = document.getElementById("heatmap-canvas-container");
    var tooltip = document.getElementById("heat-tooltip");
    var scrollWrap = document.getElementById("heatmap-scroll-wrap");
    var periodText = document.getElementById("heatmap-period-text");
    var peakText = document.getElementById("heatmap-peak-text");
    var allTimeNum = document.getElementById("heatmap-alltime-num");
    var yearButtons = document.querySelectorAll(".year-tab");

    if (!canvasContainer || !tooltip || !scrollWrap) return;

    var globalData = null;
    var currentYear = "last";

    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function formatDate(dateStr) {
      var parts = dateStr.split("-");
      if (parts.length !== 3) return dateStr;
      var y = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10) - 1;
      var d = parseInt(parts[2], 10);
      var dt = new Date(y, m, d);
      var dayName = dayNames[dt.getDay()];
      var monName = monthFull[m];
      return dayName + ", " + monName + " " + d + ", " + y;
    }

    function renderHeatmap(data, selectedYear) {
      if (!data) return;

      var todayStr = new Date().toISOString().split("T")[0];
      var filtered = [];
      var totalCount = 0;
      var peakCount = 0;

      var sourceList = data.allContributions || data.contributions || [];

      if (selectedYear === "last") {
        if (sourceList.length) {
          var pastOnly = sourceList.filter(function (item) {
            return item.date <= todayStr;
          });
          filtered = pastOnly.slice(-365);
        } else if (data.lastYearContributions && data.lastYearContributions.length) {
          filtered = data.lastYearContributions.slice();
        }
      } else {
        filtered = sourceList.filter(function (item) {
          return item.date.startsWith(selectedYear + "-");
        }).sort(function (a, b) {
          return a.date.localeCompare(b.date);
        });
      }

      if (!filtered.length) return;

      filtered.forEach(function (c) {
        totalCount += c.count;
        if (c.count > peakCount) peakCount = c.count;
      });

      if (periodText) {
        var periodLabel = selectedYear === "last" ? "the last 12 months" : selectedYear;
        periodText.innerHTML = "<strong>" + totalCount.toLocaleString() + " contributions</strong> in " + periodLabel;
      }
      if (peakText) {
        peakText.textContent = "Peak: " + peakCount + " commits / day";
      }

      var cellWidth = 10.5;
      var cellHeight = 10.5;
      var cellGap = 3.5;
      var offsetX = 28;
      var offsetY = 20;

      var firstDateObj = new Date(filtered[0].date);
      var startDayOfWeek = firstDateObj.getDay();

      var weeks = [];
      var currentWeek = [];

      for (var p = 0; p < startDayOfWeek; p++) {
        currentWeek.push(null);
      }

      filtered.forEach(function (day) {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }

      var svgWidth = offsetX + weeks.length * (cellWidth + cellGap) + 12;
      var svgHeight = offsetY + 7 * (cellHeight + cellGap) + 8;

      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "heatmap-svg");
      svg.setAttribute("viewBox", "0 0 " + svgWidth + " " + svgHeight);
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "auto");

      // 1. Day of week labels (Mon, Wed, Fri)
      var dayLabels = [
        { name: "Mon", row: 1 },
        { name: "Wed", row: 3 },
        { name: "Fri", row: 5 }
      ];
      dayLabels.forEach(function (dl) {
        var textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.setAttribute("class", "heatmap-wday-txt");
        textEl.setAttribute("x", "0");
        textEl.setAttribute("y", offsetY + dl.row * (cellHeight + cellGap) + 8.5);
        textEl.textContent = dl.name;
        svg.appendChild(textEl);
      });

      // 2. Month labels across top (clean non-overlapping placement)
      var lastMonth = -1;
      var lastColIdx = -10;
      weeks.forEach(function (w, colIdx) {
        for (var r = 0; r < w.length; r++) {
          if (w[r]) {
            var m = parseInt(w[r].date.split("-")[1], 10) - 1;
            if (m !== lastMonth && (colIdx - lastColIdx >= 3) && colIdx < weeks.length - 2) {
              lastMonth = m;
              lastColIdx = colIdx;
              var mText = document.createElementNS("http://www.w3.org/2000/svg", "text");
              mText.setAttribute("class", "heatmap-month-txt");
              mText.setAttribute("x", offsetX + colIdx * (cellWidth + cellGap));
              mText.setAttribute("y", "12");
              mText.textContent = monthNames[m];
              svg.appendChild(mText);
            }
            break;
          }
        }
      });

      // 3. Render cells
      weeks.forEach(function (w, colIdx) {
        w.forEach(function (cell, rowIdx) {
          if (!cell) return;

          var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          var x = offsetX + colIdx * (cellWidth + cellGap);
          var y = offsetY + rowIdx * (cellHeight + cellGap);

          rect.setAttribute("class", "heat-square level-" + cell.level);
          rect.setAttribute("x", x);
          rect.setAttribute("y", y);
          rect.setAttribute("width", cellWidth);
          rect.setAttribute("height", cellHeight);
          rect.setAttribute("rx", "2");
          rect.setAttribute("data-date", cell.date);
          rect.setAttribute("data-count", cell.count);
          rect.setAttribute("data-level", cell.level);
          rect.setAttribute("fill", "var(--heat-l" + cell.level + ")");

          rect.addEventListener("pointerenter", function () {
            showHeatmapTooltip(rect, cell.date, cell.count);
          });
          rect.addEventListener("pointerleave", function () {
            hideHeatmapTooltip();
          });

          svg.appendChild(rect);
        });
      });

      canvasContainer.innerHTML = "";
      canvasContainer.appendChild(svg);
      if (window.ScrollTrigger) {
        requestAnimationFrame(function () {
          ScrollTrigger.refresh();
        });
      }
    }

    var ttCountEl = tooltip.querySelector(".tt-count");
    var ttDateEl = tooltip.querySelector(".tt-date");

    function showHeatmapTooltip(rectEl, dateStr, count) {
      if (!tooltip || !ttCountEl || !ttDateEl) return;

      var formatted = formatDate(dateStr);
      if (count === 0) {
        ttCountEl.textContent = "No contributions";
      } else if (count === 1) {
        ttCountEl.textContent = "1 contribution";
      } else {
        ttCountEl.textContent = count + " contributions";
      }
      ttDateEl.textContent = formatted;

      var rectBounds = rectEl.getBoundingClientRect();
      var wrapBounds = scrollWrap.getBoundingClientRect();

      var leftPos = rectBounds.left - wrapBounds.left + scrollWrap.scrollLeft + rectBounds.width / 2;
      var topPos = rectBounds.top - wrapBounds.top + scrollWrap.scrollTop;

      tooltip.style.left = leftPos + "px";
      tooltip.style.top = topPos + "px";
      tooltip.classList.add("show");
    }

    function hideHeatmapTooltip() {
      if (tooltip) tooltip.classList.remove("show");
    }

    yearButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        yearButtons.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        currentYear = btn.getAttribute("data-year");
        if (globalData) {
          renderHeatmap(globalData, currentYear);
        }
      });
    });

    // 1. Instant load from offline cache to prevent layout shift
    fetch("assets/contributions-cache.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Cache not available");
        return res.json();
      })
      .then(function (data) {
        if (!globalData) {
          globalData = data;
          var grandTotal = data.allTimeTotal || (data.total && data.total.allTime) || 0;
          if (!grandTotal && data.total) {
            for (var yr in data.total) {
              if (yr !== "lastYear") grandTotal += data.total[yr];
            }
          }
          if (allTimeNum && grandTotal > 0) {
            allTimeNum.textContent = grandTotal.toLocaleString();
          }
          renderHeatmap(globalData, currentYear);
        }
      })
      .catch(function () {});

    // 2. Real-time live fetch from GitHub Contributions API
    fetch("https://github-contributions-api.jogruber.de/v4/suraj-yadav0?y=all")
      .then(function (res) {
        if (!res.ok) throw new Error("Live API not ok");
        return res.json();
      })
      .then(function (freshData) {
        if (freshData && freshData.contributions && freshData.contributions.length) {
          var sorted = freshData.contributions.slice().sort(function (a, b) {
            return a.date.localeCompare(b.date);
          });

          var grandTotal = 0;
          if (freshData.total) {
            for (var yr in freshData.total) {
              grandTotal += freshData.total[yr];
            }
          }

          var todayStr = new Date().toISOString().split("T")[0];
          var pastOnly = sorted.filter(function (item) {
            return item.date <= todayStr;
          });

          globalData = {
            total: freshData.total,
            allTimeTotal: grandTotal,
            allContributions: sorted,
            lastYearContributions: pastOnly.slice(-365)
          };

          if (allTimeNum && grandTotal > 0) {
            allTimeNum.textContent = grandTotal.toLocaleString();
          }

          renderHeatmap(globalData, currentYear);
        }
      })
      .catch(function (err) {
        console.warn("Live GitHub contributions fetch fallback:", err);
      });
  })();

  var loader = document.querySelector(".loader");

  function killLoader() {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Lenis Smooth Scroll Setup ---------- */
  if (!reduce && window.Lenis) {
    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
        infinite: false
      });

      if (window.ScrollTrigger) {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (time) {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      }
    } catch (e) {
      console.warn("Lenis init fallback:", e);
    }
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) {
    killLoader();
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger);
    var mm = gsap.matchMedia();

    /* ---------- Global motion (all viewports) ---------- */

    mm.add("(prefers-reduced-motion: no-preference)", function () {

      /* Seamless marquee track duplication */
      (function () {
        var track = document.querySelector(".marquee-track");
        if (track && !track.dataset.cloned) {
          track.innerHTML += track.innerHTML;
          track.dataset.cloned = "1";
          track.classList.add("marquee-ready");
        } else if (track) {
          track.classList.add("marquee-ready");
        }
      })();

      /* Intro: curtain lift, hero mask reveal, nav drop */
      var intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .to(loader, { yPercent: -100, duration: 0.85, ease: "power4.inOut", delay: 0.45 })
        .set(loader, { display: "none" })
        .from(".nav", { y: -16, autoAlpha: 0, duration: 0.7 }, "-=0.5")
        .from(".hero-status", { y: 20, autoAlpha: 0, duration: 0.65 }, "-=0.45")
        .from(".hero-title .line-inner", { yPercent: 110, duration: 1.1, stagger: 0.12 }, "-=0.4")
        .from(".hero-sub", { y: 22, autoAlpha: 0, duration: 0.75 }, "-=0.7")
        .from(".hero-ctas .btn", { y: 18, autoAlpha: 0, duration: 0.65, stagger: 0.08 }, "-=0.55")
        .add(function () {
          killLoader();
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        });

      /* Hero blueprint grid drifts with subtle parallax */
      gsap.to(".hero-bg", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });

      /* Page scroll progress hairline */
      gsap.to(".scroll-progress span", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.25 }
      });

      /* Universal Word-by-Word Scroll Scrub Illumination */
      (function () {
        function scrubTokenize(el) {
          if (!el || el.dataset.scrubbed) return el ? el.querySelectorAll(".w") : [];
          el.dataset.scrubbed = "1";

          var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
          var textNodes = [];
          var node;
          while ((node = walker.nextNode())) {
            if (node.nodeValue && node.nodeValue.trim()) {
              textNodes.push(node);
            }
          }

          var allWords = [];
          textNodes.forEach(function (tNode) {
            var words = tNode.nodeValue.trim().split(/\s+/);
            var spanContainer = document.createElement("span");
            spanContainer.className = "w-group";
            words.forEach(function (w, i) {
              var wSpan = document.createElement("span");
              wSpan.className = "w";
              wSpan.textContent = w;
              spanContainer.appendChild(wSpan);
              allWords.push(wSpan);
              if (i < words.length - 1) {
                spanContainer.appendChild(document.createTextNode(" "));
              }
            });
            if (tNode.parentNode) {
              tNode.parentNode.replaceChild(spanContainer, tNode);
            }
          });

          return allWords;
        }

        function applyScrub(elements, config) {
          var startOp = config.startOpacity !== undefined ? config.startOpacity : 0.18;
          elements.forEach(function (el) {
            var wordEls = scrubTokenize(el);
            if (!wordEls || !wordEls.length) return;

            var triggerEl = config.trigger
              ? (typeof config.trigger === "function" ? config.trigger(el) : el.closest(config.trigger) || el)
              : el;

            gsap.set(wordEls, { opacity: startOp });

            gsap.to(wordEls, {
              opacity: 1,
              stagger: {
                each: config.stagger || 0.03,
                from: "start"
              },
              ease: "none",
              scrollTrigger: {
                trigger: triggerEl,
                start: config.start || "top 82%",
                end: config.end || "bottom 48%",
                scrub: config.scrub !== undefined ? config.scrub : 0.35,
                invalidateOnRefresh: true
              }
            });
          });
        }

        // 1. Manifesto
        applyScrub(document.querySelectorAll(".scrub-text"), {
          trigger: ".manifesto",
          start: "top 78%",
          end: "bottom 42%",
          stagger: 0.035,
          startOpacity: 0.18
        });

        // 2. Section Headers & Eyebrows (.section-head h2, .pan-head-content h2, .eyebrow)
        applyScrub(document.querySelectorAll(".section-head h2, .pan-head-content h2"), {
          trigger: ".section-head, .pan-head",
          start: "top 88%",
          end: "top 55%",
          stagger: 0.06,
          startOpacity: 0.18
        });

        applyScrub(document.querySelectorAll(".eyebrow"), {
          trigger: ".section-head",
          start: "top 90%",
          end: "top 65%",
          stagger: 0.04,
          startOpacity: 0.22
        });

        // 3. Flagship Project Titles (.project-title, .card-title), Taglines & Descriptions (.project-desc, .card-desc)
        applyScrub(document.querySelectorAll(".project-title, .card-title"), {
          trigger: ".project-showcase-card, .stack-card",
          start: "top 80%",
          end: "top 50%",
          stagger: 0.05,
          startOpacity: 0.18
        });

        applyScrub(document.querySelectorAll(".project-tagline"), {
          trigger: ".project-showcase-card",
          start: "top 78%",
          end: "top 48%",
          stagger: 0.03,
          startOpacity: 0.2
        });

        applyScrub(document.querySelectorAll(".project-desc, .card-desc"), {
          trigger: ".project-showcase-card, .stack-card",
          start: "top 72%",
          end: "top 35%",
          stagger: 0.025,
          startOpacity: 0.18
        });

        // 4. Journey Timeline Titles (.tl-what h3) & Milestones (.tl-what p:not(.tl-org))
        applyScrub(document.querySelectorAll(".tl-what h3"), {
          trigger: ".tl-item",
          start: "top 88%",
          end: "top 60%",
          stagger: 0.05,
          startOpacity: 0.2
        });

        applyScrub(document.querySelectorAll(".tl-what p:not(.tl-org)"), {
          trigger: ".tl-item",
          start: "top 80%",
          end: "bottom 60%",
          stagger: 0.03,
          startOpacity: 0.18
        });

        // 5. Proof Bento Descriptions (.cell-label) & Headings (.cell-big)
        applyScrub(document.querySelectorAll(".cell-big"), {
          trigger: ".stats-grid",
          start: "top 84%",
          end: "top 58%",
          stagger: 0.05,
          startOpacity: 0.2
        });

        applyScrub(document.querySelectorAll(".cell-label"), {
          trigger: ".stats-grid",
          start: "top 80%",
          end: "bottom 60%",
          stagger: 0.025,
          startOpacity: 0.18
        });

        // 6. More Builds Pan Titles (.pan-meta h3), Subtitles (.pan-head-content p) & Descriptions (.pan-meta p)
        applyScrub(document.querySelectorAll(".pan-head-content p"), {
          trigger: ".pan-head",
          start: "top 85%",
          end: "bottom 65%",
          stagger: 0.03,
          startOpacity: 0.18
        });

        applyScrub(document.querySelectorAll(".pan-meta h3"), {
          trigger: ".pan-card",
          start: "top 90%",
          end: "top 65%",
          stagger: 0.05,
          startOpacity: 0.2
        });

        applyScrub(document.querySelectorAll(".pan-meta p"), {
          trigger: ".pan-card",
          start: "top 86%",
          end: "top 55%",
          stagger: 0.03,
          startOpacity: 0.18
        });

        // 7. Featured Case Studies & Blog (.featured-post-title, .featured-post-desc)
        applyScrub(document.querySelectorAll(".featured-post-title"), {
          trigger: ".featured-post-card",
          start: "top 85%",
          end: "top 55%",
          stagger: 0.05,
          startOpacity: 0.18
        });

        applyScrub(document.querySelectorAll(".featured-post-desc"), {
          trigger: ".featured-post-card",
          start: "top 78%",
          end: "top 45%",
          stagger: 0.03,
          startOpacity: 0.18
        });

        // 8. Contact Headline (.contact-title)
        applyScrub(document.querySelectorAll(".contact-title"), {
          trigger: ".contact",
          start: "top 80%",
          end: "top 45%",
          stagger: 0.06,
          startOpacity: 0.16
        });

        // 9. Footer Sitemap Headers (.footer-col-title) & Descriptions (.footer-desc)
        applyScrub(document.querySelectorAll(".footer-desc"), {
          trigger: ".contact",
          start: "top 75%",
          end: "top 45%",
          stagger: 0.03,
          startOpacity: 0.18
        });
      })();

      /* Big Footer Name subtle reveal */
      (function () {
        var bigNames = document.querySelectorAll(".footer-name-svg, .footer-big-name");
        bigNames.forEach(function (nameEl) {
          gsap.fromTo(
            nameEl,
            { y: 30, opacity: 0.25 },
            {
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: nameEl.closest(".contact") || nameEl,
                start: "top 65%",
                end: "bottom bottom",
                scrub: 0.4
              }
            }
          );
        });
      })();

      /* Proof bento entrance + number roll-up */
      (function () {
        gsap.from(".stats-grid .cell", {
          y: 32, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: {
            trigger: ".stats-grid", start: "top 84%", once: true,
            onEnter: function () {
              document.querySelectorAll(".count-num").forEach(function (counter) {
                var target = parseInt(counter.getAttribute("data-target"), 10);
                if (!isNaN(target)) {
                  var obj = { val: 0 };
                  gsap.to(obj, {
                    val: target,
                    duration: 1.6,
                    ease: "power2.out",
                    onUpdate: function () {
                      counter.textContent = Math.floor(obj.val).toLocaleString();
                    }
                  });
                }
              });
            }
          }
        });
      })();

      /* Activity HeatMap & Trophies entrance */
      (function () {
        gsap.from(".heatmap-card", {
          y: 32, autoAlpha: 0, duration: 0.8, ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: ".heatmap-card", start: "top 85%", once: true }
        });
        gsap.from(".trophies-wrap", {
          y: 32, autoAlpha: 0, duration: 0.8, ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: ".trophies-wrap", start: "top 85%", once: true }
        });
      })();

      /* Journey: rail draws with scroll, entries rise */
      (function () {
        var railPath = document.querySelector(".tl-rail path");
        if (railPath) {
          var progress = railPath.cloneNode();
          progress.classList.add("tl-progress");
          progress.style.strokeDasharray = 1;
          progress.style.strokeDashoffset = 1;
          railPath.parentNode.appendChild(progress);
          gsap.to(progress, {
            strokeDashoffset: 0, ease: "none",
            scrollTrigger: { trigger: ".tl", start: "top 74%", end: "bottom 65%", scrub: true }
          });
        }
        gsap.utils.toArray(".tl-item").forEach(function (item) {
          gsap.from(item, {
            y: 32, autoAlpha: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 86%", once: true }
          });
        });
      })();

      /* Persistent Ambient Pointer Highlighter */
      if (window.matchMedia("(pointer: fine)").matches) {
        var glow = document.querySelector(".cursor-glow");
        if (glow) {
          var xGlow = gsap.quickTo(glow, "x", { duration: 0.35, ease: "power3" });
          var yGlow = gsap.quickTo(glow, "y", { duration: 0.35, ease: "power3" });

          window.addEventListener("pointermove", function (e) {
            if (!glow.classList.contains("active")) {
              glow.classList.add("active");
            }
            xGlow(e.clientX);
            yGlow(e.clientY);
          });

          window.addEventListener("pointerleave", function () {
            glow.classList.remove("active");
          });

          // Smoothly hide ambient glow when hovering over the HeatMap
          var heatmapCard = document.querySelector(".heatmap-card");
          if (heatmapCard) {
            heatmapCard.addEventListener("pointerenter", function () {
              glow.classList.add("hidden");
            });
            heatmapCard.addEventListener("pointerleave", function () {
              glow.classList.remove("hidden");
            });
          }
        }

        /* Card specular lighting */
        var glowCards = document.querySelectorAll(".project-showcase-card, .stack-card, .pan-card, .cell, .trophy-card, .featured-post-card, .article-card");
        glowCards.forEach(function (card) {
          card.addEventListener("pointermove", function (e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", x + "px");
            card.style.setProperty("--mouse-y", y + "px");
          });
        });

        /* Project Showcase Cards entrance animation */
        gsap.utils.toArray(".project-showcase-card").forEach(function (card) {
          gsap.from(card, {
            y: 36,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse"
            }
          });
        });

        /* Magnetic pull physics */
        gsap.utils.toArray(".magnetic, .social-row a").forEach(function (btn) {
          var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
          var yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
          btn.addEventListener("pointermove", function (e) {
            var r = btn.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.22);
            yTo((e.clientY - r.top - r.height / 2) * 0.32);
          });
          btn.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
        });
      }

      /* Card images: Crisp monochrome by default with subtle breathing focus on arrival */
      gsap.utils.toArray(".card-media img, .pan-card figure img, .cell-img img").forEach(function (img) {
        var parentTrigger = img.closest("article, li, .cell") || img;

        gsap.fromTo(img,
          { scale: 1.06 },
          {
            scale: 1.001, ease: "none",
            scrollTrigger: { trigger: parentTrigger, start: "top bottom", end: "top 30%", scrub: true }
          });
      });

      /* Nav ScrollSpy */
      var sections = document.querySelectorAll("section[id], footer[id]");
      var navLinks = document.querySelectorAll(".nav-links a");
      sections.forEach(function (sec) {
        ScrollTrigger.create({
          trigger: sec,
          start: "top center",
          end: "bottom center",
          onToggle: function (self) {
            if (self.isActive) {
              var id = sec.getAttribute("id");
              navLinks.forEach(function (link) {
                var href = link.getAttribute("href");
                if (href === "#" + id) {
                  link.classList.add("active");
                } else {
                  link.classList.remove("active");
                }
              });
            }
          }
        });
      });

      /* Smooth internal link scrolling with Lenis */
      document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
          var targetId = this.getAttribute("href");
          if (targetId === "#" || targetId === "#top") {
            e.preventDefault();
            if (lenis) {
              lenis.scrollTo(0, { duration: 1.1 });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          } else {
            var targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              if (lenis) {
                lenis.scrollTo(targetEl, { offset: -60, duration: 1.1 });
              } else {
                targetEl.scrollIntoView({ behavior: "smooth" });
              }
            }
          }
        });
      });

      return function () { killLoader(); };
    });

    /* ---------- More Builds Infinite Auto-Scrolling Marquee Controller ---------- */
    var marqueeInner = document.querySelector(".pan-marquee-inner");
    var prevBtn = document.querySelector(".pan-prev");
    var nextBtn = document.querySelector(".pan-next");

    if (marqueeInner) {
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          marqueeInner.style.animationDirection = "reverse";
          marqueeInner.classList.remove("is-paused");
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          marqueeInner.style.animationDirection = "normal";
          marqueeInner.classList.remove("is-paused");
        });
      }
    }

    /* ---------- More Builds Category Filter Controller ---------- */
    (function () {
      var filterButtons = document.querySelectorAll(".pan-filter-btn");
      var cards = document.querySelectorAll(".pan-marquee-inner .pan-card");
      var totalCounter = document.querySelector(".pan-total");
      if (!filterButtons.length || !cards.length) return;

      filterButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var filter = btn.getAttribute("data-filter") || "all";

          filterButtons.forEach(function (b) {
            var isCurr = b === btn;
            b.classList.toggle("active", isCurr);
            b.setAttribute("aria-selected", isCurr ? "true" : "false");
          });

          var matchCount = 0;
          cards.forEach(function (card) {
            var cat = card.getAttribute("data-category") || "";
            var isMatch = filter === "all" || cat === filter;
            card.classList.toggle("is-dimmed", !isMatch);
            if (isMatch) matchCount++;
          });

          // Half count because marquee track is duplicated for seamless looping
          var uniqueMatches = Math.round(matchCount / 2);
          if (totalCounter) {
            totalCounter.textContent = uniqueMatches < 10 ? "0" + uniqueMatches : String(uniqueMatches);
          }

          playUiSound("nav");
        });
      });
    })();

    /* ---------- Flagship Technical Deep Dive & Code Inspector Controller ---------- */
    (function () {
      var inspectButtons = document.querySelectorAll(".btn-inspect");
      if (!inspectButtons.length) return;

      inspectButtons.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          var targetId = btn.getAttribute("data-target");
          if (!targetId) return;

          var drawer = document.getElementById(targetId);
          if (!drawer) return;

          var isExpanded = drawer.classList.contains("is-expanded");
          if (isExpanded) {
            drawer.classList.remove("is-expanded");
            btn.classList.remove("is-active");
            btn.setAttribute("aria-expanded", "false");
            playUiSound("close");
          } else {
            drawer.classList.add("is-expanded");
            btn.classList.add("is-active");
            btn.setAttribute("aria-expanded", "true");
            playUiSound("open");
          }

          if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
          }
        });
      });

      // Tab navigation inside inspectors
      var tabButtons = document.querySelectorAll(".inspector-tab-btn");
      tabButtons.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var parent = tab.closest(".project-inspector");
          if (!parent) return;

          var tabName = tab.getAttribute("data-tab");
          var allTabs = parent.querySelectorAll(".inspector-tab-btn");
          var allPanels = parent.querySelectorAll(".inspector-panel");

          allTabs.forEach(function (t) {
            var isCurr = t === tab;
            t.classList.toggle("is-active", isCurr);
            t.setAttribute("aria-selected", isCurr ? "true" : "false");
          });

          allPanels.forEach(function (panel) {
            panel.classList.toggle("is-active", panel.getAttribute("data-panel") === tabName);
          });

          playUiSound("nav");

          if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
          }
        });
      });

      // Copy snippet buttons
      var copyButtons = document.querySelectorAll(".code-copy-btn");
      copyButtons.forEach(function (copyBtn) {
        copyBtn.addEventListener("click", function () {
          var codeBox = copyBtn.closest(".inspector-code-box");
          if (!codeBox) return;

          var codeEl = codeBox.querySelector("code");
          if (!codeEl) return;

          var text = codeEl.innerText || codeEl.textContent;
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () {
              handleCopySuccess(copyBtn);
            }).catch(function () {
              fallbackCopy(text, copyBtn);
            });
          } else {
            fallbackCopy(text, copyBtn);
          }
        });
      });

      function handleCopySuccess(btn) {
        var origText = btn.textContent;
        btn.textContent = "Copied!";
        playUiSound("action");
        showToast("Code snippet copied to clipboard", "OK");
        setTimeout(function () {
          btn.textContent = origText;
        }, 2000);
      }

      function fallbackCopy(text, btn) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          handleCopySuccess(btn);
        } catch (err) {
          showToast("Failed to copy code", "Error");
        }
        document.body.removeChild(ta);
      }
    })();

    /* ---------- Editorial Reading Progress & Sticky TOC ScrollSpy ---------- */
    (function () {
      var progressSpan = document.querySelector(".scroll-progress span");
      var tocPill = document.getElementById("toc-progress-pill");
      var tocLinks = document.querySelectorAll(".toc-nav a[href^='#']");
      var articleSections = [];

      tocLinks.forEach(function (link) {
        var id = link.getAttribute("href").slice(1);
        var sec = document.getElementById(id);
        if (sec) articleSections.push({ id: id, element: sec, link: link });

        link.addEventListener("click", function (e) {
          e.preventDefault();
          playUiSound("nav");
          if (sec) {
            if (lenis) {
              lenis.scrollTo(sec, { offset: -70, duration: 1.1 });
            } else {
              sec.scrollIntoView({ behavior: "smooth" });
            }
          }
        });
      });

      function updateReadingProgress() {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        var progress = Math.min(1, Math.max(0, window.scrollY / docHeight));

        if (progressSpan && !window.gsap) {
          progressSpan.style.transform = "scaleX(" + progress + ")";
        }

        if (tocPill) {
          var pct = Math.round(progress * 100);
          tocPill.textContent = pct >= 98 ? "COMPLETED" : pct + "% READ";
        }

        // Active heading spy
        if (articleSections.length) {
          var scrollPos = window.scrollY + 140;
          var activeId = articleSections[0].id;
          for (var i = 0; i < articleSections.length; i++) {
            var top = articleSections[i].element.offsetTop;
            if (scrollPos >= top) {
              activeId = articleSections[i].id;
            }
          }

          articleSections.forEach(function (entry) {
            entry.link.classList.toggle("active", entry.id === activeId);
          });
        }
      }

      window.addEventListener("scroll", updateReadingProgress, { passive: true });
      updateReadingProgress();
    })();

    /* ---------- Article Action Utilities (Share & Copy Link) ---------- */
    (function () {
      var shareBtn = document.getElementById("share-article-btn");
      var copyLinkBtn = document.getElementById("copy-article-link-btn");

      if (shareBtn) {
        shareBtn.addEventListener("click", function () {
          playUiSound("action");
          if (navigator.share) {
            navigator.share({
              title: document.title,
              url: window.location.href
            }).catch(function () {});
          } else {
            copyUrlToClipboard();
          }
        });
      }

      if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", function () {
          playUiSound("action");
          copyUrlToClipboard();
        });
      }

      function copyUrlToClipboard() {
        var url = window.location.href;
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(url).then(function () {
            showToast("Article link copied to clipboard", "OK");
          }).catch(function () {
            showToast("Link: " + url, "Info");
          });
        } else {
          showToast("Article link copied to clipboard", "OK");
        }
      }
    })();

    /* ---------- Article Code Blocks One-Click Copy ---------- */
    (function () {
      var copyButtons = document.querySelectorAll(".code-copy-trigger");
      copyButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var block = btn.closest(".article-code-block");
          if (!block) return;
          var codeEl = block.querySelector("code");
          if (!codeEl) return;

          var text = codeEl.innerText || codeEl.textContent;
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () {
              handleCodeCopySuccess(btn);
            }).catch(function () {
              handleCodeCopySuccess(btn);
            });
          } else {
            handleCodeCopySuccess(btn);
          }
        });
      });

      function handleCodeCopySuccess(btn) {
        var origText = btn.textContent;
        btn.textContent = "Copied!";
        playUiSound("action");
        showToast("Code snippet copied to clipboard", "OK");
        setTimeout(function () {
          btn.textContent = origText;
        }, 2000);
      }
    })();

    /* ---------- Blog Listing Topic Filter Controller ---------- */
    (function () {
      var filterPills = document.querySelectorAll(".blog-filter-pill");
      var postCards = document.querySelectorAll(".featured-post-card");
      if (!filterPills.length) return;

      filterPills.forEach(function (pill) {
        pill.addEventListener("click", function () {
          var filter = pill.getAttribute("data-filter") || "all";

          filterPills.forEach(function (p) {
            p.classList.toggle("active", p === pill);
          });

          postCards.forEach(function (card) {
            var cat = card.getAttribute("data-category") || "";
            var isMatch = filter === "all" || cat === filter;
            card.style.display = isMatch ? "" : "none";
          });

          playUiSound("nav");
        });
      });
    })();

    /* Back to top button */
    var topBtn = document.querySelector(".to-top");
    if (topBtn) {
      topBtn.addEventListener("click", function () {
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        }
      });
    }

    /* Refresh ScrollTrigger when web fonts are loaded */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }

    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
      setTimeout(function () {
        ScrollTrigger.refresh();
      }, 300);
    });

  } catch (err) {
    killLoader();
    if (window.gsap) {
      gsap.set([".loader", ".hero-title .line-inner", ".hero-status", ".hero-sub", ".hero-ctas .btn", ".contact-title .line-inner", ".nav"], { clearProps: "all" });
    }
  }
})();
