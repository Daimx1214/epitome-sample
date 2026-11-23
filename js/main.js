/* EPITOME Nail & Beauty — sample homepage interactions */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header shrink ---------- */
  var header = document.getElementById('siteHeader');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
    toTop.classList.toggle('show', window.scrollY > 800);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  }
  hamburger.addEventListener('click', function () {
    var open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- Smooth-scroll offset for sticky header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Active nav highlighting ---------- */
  var navLinks = document.querySelectorAll('.nav a[data-nav]');
  var sections = ['services', 'prices', 'why', 'gallery', 'reviews', 'visit']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && navLinks.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('data-nav') === en.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- Fade-up on scroll (once) + stagger ---------- */
  var fadeEls = document.querySelectorAll('.fade-up');
  document.querySelectorAll('.service-grid, .also-row, .checklist').forEach(function (grid) {
    Array.prototype.forEach.call(grid.children, function (child, i) {
      child.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
    });
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var fadeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          fadeObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    fadeEls.forEach(function (el) { fadeObs.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    if (reduceMotion) {
      el.textContent = prefix + target.toFixed(decimals);
      return;
    }
    var start = null, dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); countObs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  /* ---------- Live Open / Closed status (Asia/Singapore) ---------- */
  function sgNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Singapore', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var hour = parseInt(map.hour, 10) % 24;
      return { day: days[map.weekday], mins: hour * 60 + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function statusInfo() {
    var now = sgNow();
    var OPEN = 9 * 60 + 30, CLOSE = 20 * 60 + 30;
    if (now.day === 3) return { open: false, text: 'Closed today (Wednesday)' };
    if (now.mins < OPEN) return { open: false, text: 'Opens today at 9:30 AM' };
    if (now.mins < CLOSE) return { open: true, text: 'Open now · until 8:30 PM' };
    if (now.day === 2) return { open: false, text: 'Closed · opens Thursday 9:30 AM' };
    return { open: false, text: 'Closed · opens 9:30 AM tomorrow' };
  }
  function paintStatus() {
    var info = statusInfo();
    document.querySelectorAll('.status-pill, .status-inline').forEach(function (pill) {
      var dot = pill.querySelector('.status-dot');
      var txt = pill.querySelector('.status-text');
      if (dot) { dot.classList.toggle('open', info.open); dot.classList.toggle('closed', !info.open); }
      if (txt) txt.textContent = info.text;
    });
    /* Highlight today's row in the hours table */
    var today = sgNow().day;
    document.querySelectorAll('.hours-table tr').forEach(function (row) {
      row.classList.toggle('today', parseInt(row.getAttribute('data-day'), 10) === today);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- Sticky mobile bar (appears after hero) ---------- */
  var mobileBar = document.getElementById('mobileBar');
  var hero = document.getElementById('home');
  if ('IntersectionObserver' in window && hero) {
    var heroObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        mobileBar.classList.toggle('show', !en.isIntersecting && window.scrollY > 200);
      });
    }, { threshold: 0 });
    heroObs.observe(hero);
  } else {
    mobileBar.classList.add('show');
  }

  /* ---------- Why-image gentle parallax ---------- */
  var parallaxImg = document.querySelector('[data-parallax]');
  if (parallaxImg && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var r = parallaxImg.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var progress = (window.innerHeight - r.top) / (window.innerHeight + r.height);
          var shift = Math.max(-15, Math.min(15, (progress - 0.5) * -30));
          parallaxImg.style.transform = 'translateY(' + shift + 'px)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Gallery filter ---------- */
  var filterBtns = document.querySelectorAll('.chip-filter');
  var gItems = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      gItems.forEach(function (item) {
        var show = f === 'all' || item.getAttribute('data-cat') === f;
        if (show) {
          item.classList.remove('gone');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { item.classList.remove('hiding'); });
          });
        } else {
          item.classList.add('hiding');
          setTimeout(function () {
            if (item.classList.contains('hiding')) item.classList.add('gone');
          }, reduceMotion ? 0 : 300);
        }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbIndex = 0, lastFocus = null;
  function visibleItems() {
    return gItems.filter(function (i) { return !i.classList.contains('gone'); });
  }
  function showLb(i) {
    var items = visibleItems();
    if (!items.length) return;
    lbIndex = (i + items.length) % items.length;
    var img = items[lbIndex].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    var cap = items[lbIndex].querySelector('figcaption span');
    lbCaption.textContent = cap ? cap.textContent : img.alt;
  }
  function openLb(item) {
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    showLb(visibleItems().indexOf(item));
    document.getElementById('lbClose').focus();
  }
  function closeLb() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  gItems.forEach(function (item) {
    item.addEventListener('click', function () { openLb(item); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(item); }
    });
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { showLb(lbIndex - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { showLb(lbIndex + 1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  });
  var lbTouchX = null;
  lightbox.addEventListener('touchstart', function (e) { lbTouchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (lbTouchX === null) return;
    var dx = e.changedTouches[0].clientX - lbTouchX;
    if (Math.abs(dx) > 45) showLb(lbIndex + (dx < 0 ? 1 : -1));
    lbTouchX = null;
  }, { passive: true });

  /* ---------- Reviews carousel ---------- */
  var track = document.getElementById('carouselTrack');
  var carousel = document.getElementById('reviewCarousel');
  var dotsWrap = document.getElementById('carouselDots');
  if (track && dotsWrap) {
    var cards = Array.prototype.slice.call(track.children);
    var idx = 0, timer = null;
    function visibleCount() { return window.innerWidth >= 600 ? 2 : 1; }
    function maxIdx() { return Math.max(0, cards.length - visibleCount()); }
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (var i = 0; i <= maxIdx(); i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to review ' + (i + 1));
        b.setAttribute('data-i', i);
        (function (btn) {
          btn.addEventListener('click', function () { goTo(parseInt(btn.getAttribute('data-i'), 10)); restart(); });
        })(b);
        dotsWrap.appendChild(b);
      }
    }
    function goTo(i) {
      idx = Math.max(0, Math.min(i, maxIdx()));
      var gap = 20;
      var w = cards[0].getBoundingClientRect().width + gap;
      track.style.transform = 'translateX(' + (-idx * w) + 'px)';
      Array.prototype.forEach.call(dotsWrap.children, function (d, di) {
        d.classList.toggle('active', di === idx);
      });
    }
    function next() { goTo(idx >= maxIdx() ? 0 : idx + 1); }
    function restart() {
      if (timer) clearInterval(timer);
      if (!reduceMotion) timer = setInterval(next, 6000);
    }
    carousel.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    carousel.addEventListener('mouseleave', restart);
    var cTouchX = null;
    carousel.addEventListener('touchstart', function (e) { cTouchX = e.changedTouches[0].clientX; if (timer) clearInterval(timer); }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      if (cTouchX === null) return;
      var dx = e.changedTouches[0].clientX - cTouchX;
      if (Math.abs(dx) > 45) goTo(idx + (dx < 0 ? 1 : -1));
      cTouchX = null;
      restart();
    }, { passive: true });
    window.addEventListener('resize', function () { goTo(idx); });
    buildDots();
    goTo(0);
    restart();
  }
})();
