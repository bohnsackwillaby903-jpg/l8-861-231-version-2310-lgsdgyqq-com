(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function openSearch(query) {
        var target = "./search.html";
        if (query) {
            target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
    }

    document.addEventListener("DOMContentLoaded", function () {
        var mobileToggle = document.querySelector("[data-mobile-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        all("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                openSearch(input ? input.value.trim() : "");
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = all("[data-hero-slide]", hero);
            var dots = all("[data-hero-dot]", hero);
            var current = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function nextSlide() {
                showSlide(current + 1);
            }

            function resetTimer() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(nextSlide, 5200);
            }

            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                    resetTimer();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                    resetTimer();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    resetTimer();
                });
            });
            showSlide(0);
            resetTimer();
        }

        var liveSearch = document.querySelector("[data-live-search]");
        var typeFilter = document.querySelector("[data-filter-type]");
        var yearFilter = document.querySelector("[data-filter-year]");
        var regionFilter = document.querySelector("[data-filter-region]");
        var cards = all("[data-movie-card]");
        var rankItems = all("[data-rank-item]");
        var emptyState = document.querySelector("[data-empty-state]");

        function valueOf(element) {
            return element ? normalize(element.value) : "";
        }

        function matchNode(node) {
            var query = valueOf(liveSearch);
            var type = valueOf(typeFilter);
            var year = valueOf(yearFilter);
            var region = valueOf(regionFilter);
            var text = normalize(node.getAttribute("data-search-text"));
            var nodeType = normalize(node.getAttribute("data-type"));
            var nodeYear = normalize(node.getAttribute("data-year"));
            var nodeRegion = normalize(node.getAttribute("data-region"));
            return (!query || text.indexOf(query) !== -1) &&
                (!type || nodeType === type) &&
                (!year || nodeYear === year) &&
                (!region || nodeRegion === region);
        }

        function applyFilters() {
            var visible = 0;
            cards.forEach(function (card) {
                var matched = matchNode(card);
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            rankItems.forEach(function (item) {
                var matched = matchNode(item);
                item.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        var params = new URLSearchParams(window.location.search);
        if (liveSearch && params.has("q")) {
            liveSearch.value = params.get("q") || "";
        }
        [liveSearch, typeFilter, yearFilter, regionFilter].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });
        if (liveSearch || typeFilter || yearFilter || regionFilter) {
            applyFilters();
        }
    });
}());
