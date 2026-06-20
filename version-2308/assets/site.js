(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  function setupHero() {
    var root = document.querySelector('.hero-carousel');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dots button'));
    var prev = root.querySelector('.hero-arrow.prev');
    var next = root.querySelector('.hero-arrow.next');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    inputs.forEach(function (input) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' ').toLowerCase();
          card.classList.toggle('is-filtered-out', value && text.indexOf(value) === -1);
        });
      });
    });
  }

  function movieCard(movie) {
    var cover = movie.cover || '1.jpg';
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeAttr(movie.url) + '" class="card-cover" aria-label="观看' + escapeAttr(movie.title) + '">',
      '    <img src="./' + escapeAttr(cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
      '    <span class="play-badge">▶</span>',
      '    <span class="cover-meta left">' + escapeHtml(movie.year) + '</span>',
      '    <span class="cover-meta right">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-labels"><a href="' + escapeAttr(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.region) + '</span></div>',
      '    <h3><a href="' + escapeAttr(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var root = document.querySelector('[data-search-page]');
    var target = document.getElementById('search-results');
    if (!root || !target || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = root.querySelector('input[name="q"]');
    var heading = document.getElementById('search-heading');
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var list = window.MOVIES.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return text.indexOf(normalized) !== -1;
    }).slice(0, query ? 120 : 48);
    if (heading) {
      heading.textContent = query ? '搜索结果：' + query : '热门推荐';
    }
    target.innerHTML = list.map(movieCard).join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  window.attachMoviePlayer = function (options) {
    var container = document.querySelector(options.selector);
    if (!container) {
      return;
    }
    var video = container.querySelector('video');
    var cover = container.querySelector('.player-cover');
    var loading = container.querySelector('.player-loading');
    var error = container.querySelector('.player-error');
    var retry = error ? error.querySelector('button') : null;
    var started = false;
    var player = null;

    function setLoading(value) {
      if (loading) {
        loading.hidden = !value;
      }
    }

    function setError(value) {
      if (error) {
        error.hidden = !value;
      }
    }

    function bindMedia() {
      setError(false);
      setLoading(true);
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.src;
        setLoading(false);
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (player) {
          player.destroy();
        }
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(options.src);
        player.attachMedia(video);
        player.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setLoading(false);
          video.play().catch(function () {});
        });
        player.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          setLoading(false);
          setError(true);
          if (player) {
            player.destroy();
            player = null;
          }
        });
        return Promise.resolve();
      }
      setLoading(false);
      setError(true);
      return Promise.reject(new Error('video'));
    }

    function start() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (!started) {
        started = true;
        bindMedia().then(function () {
          video.play().catch(function () {});
        }).catch(function () {});
      } else {
        video.play().catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (retry) {
      retry.addEventListener('click', function () {
        started = false;
        start();
      });
    }
    video.addEventListener('playing', function () {
      setLoading(false);
    });
    video.addEventListener('error', function () {
      setLoading(false);
      setError(true);
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
