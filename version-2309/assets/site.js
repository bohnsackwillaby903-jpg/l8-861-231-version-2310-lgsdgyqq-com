(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function rootPrefix() {
        return document.body.getAttribute('data-root') || './';
    }

    function initMobileMenu() {
        var toggle = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var query = input ? input.value.trim() : '';
                var target = rootPrefix() + 'search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initLocalFilters() {
        qsa('[data-filter-scope]').forEach(function (scope) {
            var keyword = qs('[data-filter-keyword]', scope);
            var type = qs('[data-filter-type]', scope);
            var year = qs('[data-filter-year]', scope);
            var region = qs('[data-filter-region]', scope);
            var list = qs('[data-filter-list]') || scope.nextElementSibling;
            if (!list) {
                return;
            }
            var cards = qsa('.movie-card', list);

            function apply() {
                var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                var regionValue = region ? region.value : '';
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var matchesKeyword = !keywordValue || text.indexOf(keywordValue) !== -1;
                    var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                    card.style.display = matchesKeyword && matchesType && matchesYear && matchesRegion ? '' : 'none';
                });
            }

            [keyword, type, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function createSearchCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="poster-frame" href="' + movie.link + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-failed\');">',
            '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<a class="movie-title" href="' + movie.link + '">' + escapeHtml(movie.title) + '</a>',
            '<p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</p>',
            '<p class="movie-line">' + escapeHtml(movie.oneLine || '') + '</p>',
            '<div class="movie-card-tags">' + movie.tags.slice(0, 3).map(function (tag) {
                return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
            }).join('') + '</div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }

    function initSearchPage() {
        var results = qs('#searchResults');
        var input = qs('#searchInput');
        var category = qs('#searchCategory');
        var type = qs('#searchType');
        var clear = qs('#searchClear');
        var summary = qs('#searchSummary');
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!results || !input || !data.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        input.value = params.get('q') || '';

        var types = [];
        data.forEach(function (movie) {
            if (movie.type && types.indexOf(movie.type) === -1) {
                types.push(movie.type);
            }
        });
        types.slice(0, 80).forEach(function (item) {
            var option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            type.appendChild(option);
        });

        function render() {
            var query = input.value.trim().toLowerCase();
            var categoryValue = category ? category.value : '';
            var typeValue = type ? type.value : '';
            var filtered = data.filter(function (movie) {
                var text = movie.search.toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = !categoryValue || movie.categorySlug === categoryValue;
                var matchType = !typeValue || movie.type === typeValue;
                return matchQuery && matchCategory && matchType;
            });
            results.innerHTML = '';
            filtered.slice(0, 300).forEach(function (movie) {
                results.appendChild(createSearchCard(movie));
            });
            if (summary) {
                var shown = Math.min(filtered.length, 300);
                summary.textContent = '共找到 ' + filtered.length + ' 部影片，当前显示 ' + shown + ' 部。';
            }
        }

        [input, category, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });
        if (clear) {
            clear.addEventListener('click', function () {
                input.value = '';
                if (category) {
                    category.value = '';
                }
                if (type) {
                    type.value = '';
                }
                render();
            });
        }
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initSearchForms();
        initHero();
        initLocalFilters();
        initSearchPage();
    });
})();
