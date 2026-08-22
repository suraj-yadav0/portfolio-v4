/* Suraj Yadav · Portfolio v4 · Advanced GSAP + Lenis Choreography
   Rules: Hardware-accelerated transforms/opacity, Lenis inertial smoothing, ScrollTrigger-driven */

(function () {
  "use strict";

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

      /* Manifesto: word-by-word scrub reveal */
      (function () {
        var el = document.querySelector(".scrub-text");
        if (!el) return;
        var words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
        var wordEls = el.querySelectorAll(".w");
        gsap.fromTo(wordEls,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 55%", scrub: true }
          }
        );
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

      /* Contact headline mask reveal */
      gsap.from(".contact-title .line-inner", {
        yPercent: 110, duration: 1.0, ease: "power4.out", stagger: 0.12,
        scrollTrigger: { trigger: ".contact", start: "top 75%", once: true }
      });

      /* Interactive Spotlight on Mouse Move */
      if (window.matchMedia("(pointer: fine)").matches) {
        var glowCards = document.querySelectorAll(".stack-card, .pan-card, .cell");
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
