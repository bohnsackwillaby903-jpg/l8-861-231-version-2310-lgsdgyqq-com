(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  const lists = Array.from(document.querySelectorAll('.searchable-list'));

  if (lists.length) {
    const searchInput = document.querySelector('[data-search-input]');
    const regionFilter = document.querySelector('[data-filter-region]');
    const yearFilter = document.querySelector('[data-filter-year]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    const applyFilters = function () {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const region = regionFilter ? regionFilter.value : '';
      const year = yearFilter ? yearFilter.value : '';

      lists.forEach(function (list) {
        const items = Array.from(list.querySelectorAll('[data-title]'));

        items.forEach(function (item) {
          const title = (item.dataset.title || '').toLowerCase();
          const text = item.textContent.toLowerCase();
          const regionMatch = !region || item.dataset.region === region;
          const yearMatch = !year || item.dataset.year === year;
          const queryMatch = !query || title.includes(query) || text.includes(query);
          item.classList.toggle('is-hidden', !(regionMatch && yearMatch && queryMatch));
        });
      });
    };

    [searchInput, regionFilter, yearFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();

function initMoviePlayer(src) {
  const video = document.getElementById('movie-player');
  const cover = document.querySelector('[data-player-cover]');

  if (!video || !src) {
    return;
  }

  let loaded = false;
  let hls = null;

  const attach = function () {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }

    video.src = src;
  };

  const play = function () {
    attach();

    if (cover) {
      cover.hidden = true;
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.hidden = true;
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
