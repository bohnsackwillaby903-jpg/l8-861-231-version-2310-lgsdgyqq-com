(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initHeader() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('[data-menu-toggle]');
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initImageFallback() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.display = 'none';
      }, { once: true });
    });
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initCardFilter() {
    var input = document.querySelector('[data-card-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!input || !cards.length) {
      return;
    }
    function apply(value) {
      var q = normalize(value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-card'));
        card.classList.toggle('is-hidden-card', q && text.indexOf(q) === -1);
      });
    }
    input.addEventListener('input', function () {
      apply(input.value);
    });
    document.querySelectorAll('[data-filter-value]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-filter-value') || '';
        apply(input.value);
      });
    });
  }

  function initSearchPage() {
    var container = document.querySelector('[data-search-results]');
    if (!container || typeof MOVIE_INDEX === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = normalize(params.get('q'));
    var heading = document.querySelector('[data-search-heading]');
    var list = MOVIE_INDEX.filter(function (movie) {
      if (!q) {
        return true;
      }
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ')).indexOf(q) !== -1;
    }).slice(0, 120);
    if (heading) {
      heading.textContent = q ? '搜索：' + params.get('q') : '影片搜索';
    }
    container.innerHTML = list.map(function (movie) {
      return '<article class="movie-card" data-card="' + escapeHtml([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre
      ].join(' ')) + '">' +
        '<a href="./' + movie.url + '">' +
          '<div class="poster">' +
            '<span class="ribbon">' + escapeHtml(movie.type) + '</span>' +
            '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
            '<span class="play-bubble">▶</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<h3 class="card-title line-clamp-1">' + escapeHtml(movie.title) + '</h3>' +
            '<p class="card-text line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="card-meta"><span class="meta-pill">' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
          '</div>' +
        '</a>' +
      '</article>';
    }).join('');
    initImageFallback();
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.player-button');
    var message = document.querySelector('[data-player-message]');
    var loaded = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachMedia() {
      return new Promise(function (resolve, reject) {
        var src = video.getAttribute('data-src');
        if (!src) {
          reject(new Error('empty'));
          return;
        }
        if (loaded) {
          resolve();
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          loaded = true;
          resolve();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            loaded = true;
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error(data.type || 'hls'));
            }
          });
          return;
        }
        video.src = src;
        loaded = true;
        resolve();
      });
    }

    function play() {
      setMessage('');
      attachMedia().then(function () {
        video.controls = true;
        if (cover) {
          cover.classList.add('is-hidden');
        }
        return video.play();
      }).catch(function () {
        setMessage('播放遇到网络波动，请稍后重试');
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initCardFilter();
    initSearchPage();
    initImageFallback();
    initPlayer();
  });
})();
