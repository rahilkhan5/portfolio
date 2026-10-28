/* Rahil Khan — field catalogue. Motion authored once: ink-settle on
   load, plate reveals on scroll, a linear ticker, number tally. */
(function () {
  'use strict';

  // Populate overprint ghost text from each inked element.
  document.querySelectorAll('[data-ink]').forEach(function (el) {
    el.setAttribute('data-text', el.textContent);
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- ticker marquee (JS transform, interruptible, cheap) ---
  (function ticker() {
    var track = document.querySelector('.ticker__track');
    if (!track || reduce) return;
    var x = 0, half = track.scrollWidth / 2, last = performance.now();
    function step(now) {
      var dt = now - last; last = now;
      x -= dt * 0.045;
      if (-x >= half) x += half;
      track.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  if (reduce || !window.gsap) return;
  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  // --- cover ink-settle on load ---
  var ease = 'power4.out';
  gsap.set('.cover__name .line', { yPercent: 115 });
  gsap.set(['.cover__meta', '.cover__role', '.cover__foot'], { opacity: 0, y: 26 });
  var tl = gsap.timeline({ delay: 0.12 });
  tl.to('.cover__name .line', { yPercent: 0, duration: 1.05, ease: ease, stagger: 0.09 })
    .to('.cover__meta', { opacity: 1, y: 0, duration: 0.6, ease: ease }, '-=0.7')
    .to('.cover__role', { opacity: 1, y: 0, duration: 0.6, ease: ease }, '-=0.5')
    .to('.cover__foot', { opacity: 1, y: 0, duration: 0.6, ease: ease }, '-=0.45');

  // --- number tally count-up ---
  document.querySelectorAll('.tally dd[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.1, ease: 'power2.out', delay: 0.7,
      onUpdate: function () { el.textContent = Math.round(obj.v); }
    });
  });

  // --- plate reveals on scroll ---
  if (window.ScrollTrigger) {
    document.querySelectorAll('[data-plate]').forEach(function (p) {
      p.classList.add('reveal-init');
      gsap.to(p, {
        opacity: 1, y: 0, duration: 0.85, ease: ease,
        scrollTrigger: { trigger: p, start: 'top 82%' },
        onStart: function () { p.classList.remove('reveal-init'); }
      });
    });

    // method rows + colophon stagger
    gsap.utils.toArray('.mrow').forEach(function (r) {
      gsap.from(r, {
        opacity: 0, x: -24, duration: 0.6, ease: ease,
        scrollTrigger: { trigger: r, start: 'top 88%' }
      });
    });

    // subtle parallax on feature shot
    gsap.to('.shot--feature img', {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.plate--feature', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  // --- magnetic nudge on loud buttons ---
  document.querySelectorAll('.btn--loud').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.3, ease: 'power3.out' });
    });
    b.addEventListener('pointerleave', function () {
      gsap.to(b, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1,0.5)' });
    });
  });
})();
