(function () {
  'use strict';

  function each(list, callback) {
    Array.prototype.forEach.call(list, callback);
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.nav-links');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupStage() {
    var root = document.querySelector('[data-stage]');
    if (!root) {
      return;
    }
    var slides = root.querySelectorAll('.stage-slide');
    var dots = root.querySelectorAll('.stage-dots button');
    var prev = root.querySelector('[data-stage-prev]');
    var next = root.querySelector('[data-stage-next]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      each(slides, function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      each(dots, function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }
    each(dots, function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    var box = document.querySelector('[data-filter-box]');
    if (!box) {
      return;
    }
    var input = box.querySelector('[data-filter-input]');
    var region = box.querySelector('[data-filter-region]');
    var year = box.querySelector('[data-filter-year]');
    var genre = box.querySelector('[data-filter-genre]');
    var cards = document.querySelectorAll('[data-card]');
    var empty = document.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }

    function textValue(el) {
      return el ? el.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = textValue(input);
      var regionValue = textValue(region);
      var yearValue = textValue(year);
      var genreValue = textValue(genre);
      var visible = 0;
      each(cards, function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
        var match = true;
        if (q && searchText.indexOf(q) === -1) {
          match = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          match = false;
        }
        if (yearValue && cardYear !== yearValue) {
          match = false;
        }
        if (genreValue && cardGenre.indexOf(genreValue) === -1) {
          match = false;
        }
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    each(box.querySelectorAll('input, select'), function (field) {
      field.addEventListener('input', apply);
      field.addEventListener('change', apply);
    });
    apply();
  }

  function setupPlayers() {
    var boxes = document.querySelectorAll('[data-stream-url]');
    each(boxes, function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('.video-overlay');
      var state = box.querySelector('.video-state');
      var streamUrl = box.getAttribute('data-stream-url');
      var started = false;
      var hls = null;
      if (!video || !overlay || !streamUrl) {
        return;
      }

      function setState(message) {
        if (state) {
          state.textContent = message || '';
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setState('点击视频继续播放');
          });
        }
      }

      function begin() {
        if (started) {
          overlay.classList.add('is-hidden');
          playVideo();
          return;
        }
        started = true;
        setState('正在加载...');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            overlay.classList.add('is-hidden');
            setState('');
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setState('网络连接不稳定，正在重试');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setState('视频恢复中');
              hls.recoverMediaError();
            } else {
              setState('视频暂时无法播放');
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', function () {
            overlay.classList.add('is-hidden');
            setState('');
            playVideo();
          }, { once: true });
          video.addEventListener('error', function () {
            setState('视频暂时无法播放');
          }, { once: true });
          video.load();
        } else {
          setState('浏览器暂不支持此视频格式');
        }
      }

      overlay.addEventListener('click', begin);
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupStage();
    setupFilters();
    setupPlayers();
  });
}());
