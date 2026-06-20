(function () {
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav]');
    var navSearch = document.querySelector('.nav-search');
    var backTop = document.querySelector('[data-back-top]');

    function onScroll() {
        if (header) {
            header.classList.toggle('is-scrolled', window.scrollY > 10);
        }
        if (backTop) {
            backTop.classList.toggle('is-visible', window.scrollY > 360);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            if (navSearch) {
                navSearch.classList.toggle('is-open');
            }
        });
    }

    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                input && input.focus();
            }
        });
    });

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
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

        function next() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(next, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                stop();
                next();
                start();
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                stop();
                show(current - 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stop();
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-filter-list]');
        if (!panel || !list) {
            return;
        }
        var controls = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

        function apply() {
            var values = {};
            controls.forEach(function (control) {
                values[control.getAttribute('data-filter')] = normalize(control.value);
            });
            cards.forEach(function (card) {
                var titleText = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre'));
                var typeText = normalize(card.getAttribute('data-type'));
                var regionText = normalize(card.getAttribute('data-region'));
                var yearText = normalize(card.getAttribute('data-year'));
                var visible = true;
                if (values.keyword && titleText.indexOf(values.keyword) === -1) {
                    visible = false;
                }
                if (values.type && typeText !== values.type) {
                    visible = false;
                }
                if (values.region && regionText !== values.region) {
                    visible = false;
                }
                if (values.year && yearText !== values.year) {
                    visible = false;
                }
                card.classList.toggle('is-hidden', !visible);
            });
        }

        controls.forEach(function (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
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

    function initSearchPage() {
        var section = document.querySelector('[data-search-page]');
        var results = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-input]');
        if (!section || !results || !Array.isArray(window.MOVIE_INDEX)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }

        function match(item, term) {
            if (!term) {
                return true;
            }
            var target = normalize([
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.tags,
                item.oneLine
            ].join(' '));
            return target.indexOf(term) !== -1;
        }

        function render(term) {
            var normalized = normalize(term);
            var items = window.MOVIE_INDEX.filter(function (item) {
                return match(item, normalized);
            }).slice(0, 96);
            results.innerHTML = items.map(function (item) {
                return '<article class="movie-card">' +
                    '<a class="card-poster" href="./' + escapeHtml(item.file) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="card-play">播放</span>' +
                    '<span class="card-badge">' + escapeHtml(item.type) + '</span>' +
                    '</a>' +
                    '<div class="card-body">' +
                    '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
                    '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }

        render(query);
        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
    }

    initHero();
    initFilters();
    initSearchPage();
})();
