(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
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

        const activate = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const start = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                activate(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                activate(current + 1);
                start();
            });
        }

        activate(0);
        start();
    }

    const searchForms = Array.from(document.querySelectorAll('[data-local-search]'));

    searchForms.forEach(function (form) {
        const input = form.querySelector('[data-search-input]');
        const list = document.querySelector('[data-card-list]');
        const empty = document.querySelector('[data-empty-state]');

        if (!input || !list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll('.movie-card'));
        const params = new URLSearchParams(window.location.search);
        const preset = params.get('q') || '';

        if (preset) {
            input.value = preset;
        }

        const apply = function () {
            const keyword = input.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const content = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                const matched = !keyword || content.indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });

        input.addEventListener('input', apply);
        apply();
    });
})();
