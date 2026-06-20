(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-role="menu-toggle"]');
    var panel = document.querySelector('[data-role="mobile-panel"]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupBackToTop() {
    var button = document.querySelector('[data-role="back-to-top"]');
    if (!button) {
      return;
    }
    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 420);
    });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-role="hero-carousel"]');
    if (!carousel) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        stop();
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        stop();
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function setupFilters() {
    var list = document.querySelector('[data-role="filter-list"]');
    if (!list) {
      return;
    }
    var input = document.querySelector('[data-role="filter-input"]');
    var sort = document.querySelector('[data-role="sort-select"]');
    var cards = selectAll('.movie-card-item', list);
    var url = new URL(window.location.href);
    var q = url.searchParams.get('q') || '';
    var searchPageInput = document.querySelector('[data-role="search-page-input"]');

    if (q && input) {
      input.value = q;
    }
    if (q && searchPageInput) {
      searchPageInput.value = q;
    }

    function applyFilter() {
      var needle = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var visible = !needle || cardText(card).indexOf(needle) !== -1;
        card.classList.toggle('is-filtered-out', !visible);
      });
    }

    function applySort() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards.slice();
      sorted.sort(function (a, b) {
        if (value === 'year-desc' || value === 'year-asc') {
          var ay = Number((a.getAttribute('data-year') || '').replace(/\D/g, '')) || 0;
          var by = Number((b.getAttribute('data-year') || '').replace(/\D/g, '')) || 0;
          return value === 'year-desc' ? by - ay : ay - by;
        }
        if (value === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        return 0;
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (sort) {
      sort.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }
    applySort();
    applyFilter();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupBackToTop();
    setupHeroCarousel();
    setupFilters();
  });
}());
