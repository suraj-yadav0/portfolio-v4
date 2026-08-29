/* Suraj Yadav · Portfolio v4 · Advanced GSAP + Lenis Choreography
   Rules: Hardware-accelerated transforms/opacity, Lenis inertial smoothing, ScrollTrigger-driven */

(function () {
  "use strict";

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

      var filtered = [];
      var totalCount = 0;
      var peakCount = 0;

      if (selectedYear === "last") {
        if (data.lastYearContributions && data.lastYearContributions.length) {
          filtered = data.lastYearContributions.slice();
        } else if (data.allContributions && data.allContributions.length) {
          filtered = data.allContributions.slice(-371);
        } else if (data.contributions && data.contributions.length) {
          var sorted = data.contributions.slice().sort(function (a, b) {
            return a.date.localeCompare(b.date);
          });
          filtered = sorted.slice(-371);
        }
      } else {
        var sourceList = data.allContributions || (data.years && data.years[selectedYear]) || data.contributions || [];
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

    fetch("assets/contributions-cache.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Cache not available");
        return res.json();
      })
      .then(function (data) {
        globalData = data;
        var grandTotal = data.total && (data.total.allTime || 0);
        if (!grandTotal && data.total) {
          for (var yr in data.total) {
            if (yr !== "lastYear") grandTotal += data.total[yr];
          }
        }
        if (allTimeNum && grandTotal > 0) {
          allTimeNum.textContent = grandTotal.toLocaleString();
        }
        renderHeatmap(globalData, currentYear);
      })
      .catch(function () {});

    fetch("https://github-contributions-api.jogruber.de/v4/suraj-yadav0?y=all")
      .then(function (res) {
        if (!res.ok) throw new Error("API not ok");
        return res.json();
      })
      .then(function (freshData) {
        if (freshData && freshData.contributions && freshData.contributions.length) {
          var sorted = freshData.contributions.slice().sort(function (a, b) {
            return a.date.localeCompare(b.date);
          });
          globalData = globalData || {};
          globalData.allContributions = sorted;
          if (freshData.total) {
            var grandTotal = 0;
            for (var yr in freshData.total) {
              grandTotal += freshData.total[yr];
            }
            if (allTimeNum && grandTotal > 0) {
              allTimeNum.textContent = grandTotal.toLocaleString();
            }
          }
          renderHeatmap(globalData, currentYear);
        }
      })
      .catch(function () {});
  })();

  var loader = document.querySelector(".loader");

  function killLoader() {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Lenis Smooth Scroll Setup ---------- */
  var lenis = null;
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
        .add(killLoader);

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
          elements.forEach(function (el) {
            var wordEls = scrubTokenize(el);
            if (!wordEls || !wordEls.length) return;

            var triggerEl = config.trigger
              ? (typeof config.trigger === "function" ? config.trigger(el) : el.closest(config.trigger) || el)
              : el;

            gsap.fromTo(
              wordEls,
              { opacity: config.startOpacity !== undefined ? config.startOpacity : 0.16 },
              {
                opacity: 1,
                stagger: config.stagger || 0.04,
                ease: "none",
                scrollTrigger: {
                  trigger: triggerEl,
                  start: config.start || "top 85%",
                  end: config.end || "top 55%",
                  scrub: config.scrub !== undefined ? config.scrub : 0.35,
                  invalidateOnRefresh: true
                }
              }
            );
          });
        }

        // 1. Manifesto
        applyScrub(document.querySelectorAll(".scrub-text"), {
          start: "top 82%",
          end: "bottom 52%",
          stagger: 0.05,
          startOpacity: 0.14
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

        // 3. Flagship Project Titles (.card-title), Tags (.card-tags) & Descriptions (.card-desc)
        applyScrub(document.querySelectorAll(".card-title"), {
          trigger: ".stack-card",
          start: "top 78%",
          end: "top 42%",
          stagger: 0.06,
          startOpacity: 0.18
        });

        applyScrub(document.querySelectorAll(".card-tags"), {
          trigger: ".stack-card",
          start: "top 82%",
          end: "top 50%",
          stagger: 0.04,
          startOpacity: 0.22
        });

        applyScrub(document.querySelectorAll(".card-desc"), {
          trigger: ".stack-card",
          start: "top 68%",
          end: "top 25%",
          stagger: 0.03,
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

        // 7. Contact Headline (.contact-title)
        applyScrub(document.querySelectorAll(".contact-title"), {
          trigger: ".contact",
          start: "top 80%",
          end: "top 45%",
          stagger: 0.06,
          startOpacity: 0.16
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
        var glowCards = document.querySelectorAll(".stack-card, .pan-card, .cell, .trophy-card");
        glowCards.forEach(function (card) {
          card.addEventListener("pointermove", function (e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", x + "px");
            card.style.setProperty("--mouse-y", y + "px");
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

      /* Card images breathe into focus as their card arrives */
      gsap.utils.toArray(".card-media img, .pan-card figure img").forEach(function (img) {
        gsap.fromTo(img,
          { scale: 1.12 },
          {
            scale: 1.001, ease: "none",
            scrollTrigger: { trigger: img.closest("article, li"), start: "top bottom", end: "top 30%", scrub: true }
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

    /* ---------- Desktop-only choreography (min-width: 900px) ---------- */

    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", function () {

      /* Flagship sticky-stack: 100% bright in focus, subtle depth dimming only when superseded */
      var cards = gsap.utils.toArray(".stack-card");
      cards.forEach(function (card, i) {
        if (i === cards.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cards[cards.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false
        });

        gsap.to(card, {
          scale: 0.95,
          opacity: 0.72,
          filter: "brightness(0.75)",
          ease: "none",
          transformOrigin: "50% 0%",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top 45%",
            end: "top top",
            scrub: true
          }
        });
      });

      /* More builds: horizontal pan + live progress tracking & velocity skew */
      var wrap = document.querySelector(".morebuilds");
      var track = document.querySelector(".pan-track");
      var progressBar = document.querySelector(".pan-progress-bar");
      var countCurr = document.querySelector(".pan-curr");
      var panCards = document.querySelectorAll(".pan-card");

      if (wrap && track) {
        var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };

        gsap.to(track, {
          x: function () { return -distance(); },
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: function () { return "+=" + distance(); },
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: function (self) {
              if (progressBar) {
                var p = Math.max(0.09, self.progress);
                progressBar.style.transform = "scaleX(" + p + ")";
              }
              if (countCurr && panCards.length > 0) {
                var idx = Math.min(panCards.length, Math.floor(self.progress * panCards.length) + 1);
                var str = idx < 10 ? "0" + idx : "" + idx;
                if (countCurr.textContent !== str) {
                  countCurr.textContent = str;
                }
              }
            }
          }
        });
      }
    });

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

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  } catch (err) {
    killLoader();
    if (window.gsap) {
      gsap.set([".loader", ".hero-title .line-inner", ".hero-status", ".hero-sub", ".hero-ctas .btn", ".contact-title .line-inner", ".nav"], { clearProps: "all" });
    }
  }
})();
