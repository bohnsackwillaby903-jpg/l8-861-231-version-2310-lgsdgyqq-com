document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (button && mobileNav) {
    button.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll("[data-search-input]").forEach(function (input) {
    var list = document.querySelector("[data-search-list]");
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q");

    if (queryFromUrl && !input.value) {
      input.value = queryFromUrl;
    }

    function filter() {
      var query = input.value.trim().toLowerCase();
      if (!list) {
        return;
      }
      list.querySelectorAll("[data-search-text]").forEach(function (item) {
        var text = (item.getAttribute("data-search-text") || "").toLowerCase();
        item.classList.toggle("is-hidden", query.length > 0 && text.indexOf(query) === -1);
      });
    }

    input.addEventListener("input", filter);
    filter();
  });
});
