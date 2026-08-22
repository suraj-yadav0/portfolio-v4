/* Suraj Yadav · Portfolio v4 · GSAP choreography
   Rules: transform/opacity only, ScrollTrigger-driven, reduced-motion collapses to static */

(function () {
  "use strict";

  var loader = document.querySelector(".loader");

  function killLoader() {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    killLoader();
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger);
    var mm = gsap.matchMedia();

    /* ---------- Global motion (all viewports, motion allowed) ---------- */

    mm.add("(prefers-reduced-motion: no-preference)", function () {

      /* Seamless marquee: duplicate items so -50% keyframe loops cleanly */
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
        .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.55 })
        .set(loader, { display: "none" })
        .from(".nav", { y: -16, autoAlpha: 0, duration: 0.7 }, "-=0.55")
        .from(".hero-status", { y: 22, autoAlpha: 0, duration: 0.7 }, "-=0.5")
        .from(".hero-title .line-inner", { yPercent: 112, duration: 1.15, stagger: 0.13 }, "-=0.45")
        .from(".hero-sub", { y: 24, autoAlpha: 0, duration: 0.8 }, "-=0.75")
        .from(".hero-ctas .btn", { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, "-=0.6")
        .add(killLoader);

      /* Hero blueprint grid drifts slower than content */
      gsap.to(".hero-bg", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });

      /* Page scroll progress hairline */
      gsap.to(".scroll-progress span", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 }
      });

      /* Manifesto: word-by-word scrub reveal */
      (function () {
        var el = document.querySelector(".scrub-text");
        if (!el) return;
        var words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
        gsap.fromTo(el.querySelectorAll(".w"),
          { opacity: 0.12 },
          {
            opacity: 1, stagger: 0.05, ease: "none",
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: true }
          });
      })();

      /* Proof bento entrance */
      gsap.from(".stats-grid .cell", {
        y: 34, autoAlpha: 0, duration: 0.85, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: ".stats-grid", start: "top 82%", once: true }
      });

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
            scrollTrigger: { trigger: ".tl", start: "top 72%", end: "bottom 62%", scrub: true }
          });
        }
        gsap.utils.toArray(".tl-item").forEach(function (item) {
          gsap.from(item, {
            y: 36, autoAlpha: 0, duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 84%", once: true }
          });
        });
      })();

      /* Contact headline mask reveal */
      gsap.from(".contact-title .line-inner", {
        yPercent: 112, duration: 1.05, ease: "power4.out", stagger: 0.12,
        scrollTrigger: { trigger: ".contact", start: "top 72%", once: true }
      });

      /* Magnetic pull on primary CTAs (fine pointers only) */
      if (window.matchMedia("(pointer: fine)").matches) {
        gsap.utils.toArray(".magnetic").forEach(function (btn) {
          var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
          var yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
          btn.addEventListener("pointermove", function (e) {
            var r = btn.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.18);
            yTo((e.clientY - r.top - r.height / 2) * 0.3);
          });
          btn.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
        });
      }

      /* Card images breathe into focus as their card arrives */
      gsap.utils.toArray(".card-media img, .pan-card figure img").forEach(function (img) {
        gsap.fromTo(img,
          { scale: 1.14 },
          {
            scale: 1.001, ease: "none",
            scrollTrigger: { trigger: img.closest("article, li"), start: "top bottom", end: "top 30%", scrub: true }
          });
      });

      return function () { killLoader(); };
    });

    /* ---------- Desktop-only choreography ---------- */

    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", function () {

      /* Flagship sticky-stack: each card pins at viewport top, previous recedes */
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
          scale: 0.93, opacity: 0.45, ease: "none", transformOrigin: "50% 0%",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true
          }
        });
      });

      /* More builds: vertical scroll pans the track horizontally */
      var wrap = document.querySelector(".morebuilds");
      var track = document.querySelector(".pan-track");
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
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      }
    });

    /* Back to top */
    var topBtn = document.querySelector(".to-top");
    if (topBtn) {
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
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
