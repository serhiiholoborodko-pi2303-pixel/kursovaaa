(function ($) {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const menuButton = document.querySelector(".menu-trigger");
  const navigation = document.getElementById("main-navigation");
  const header = document.querySelector("header");
  const backToTop = document.querySelector(".back-to-top");
  const mobile = window.matchMedia("(max-width: 991px)");

  function setMenu(open) {
    if (!menuButton || !navigation) return;
    menuButton.classList.toggle("active", open);
    navigation.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
  }
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });
    mobile.addEventListener("change", function () { setMenu(false); });
  }

  document.addEventListener("click", function (event) {
    if (mobile.matches && !event.target.closest(".main-nav")) setMenu(false);
    if (mobile.matches && event.target.closest("#main-navigation a")) setMenu(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    const menuWasOpen = menuButton && menuButton.getAttribute("aria-expanded") === "true";
    if (menuWasOpen) { setMenu(false); menuButton.focus(); }
  });

  // Only existing same-page anchors participate in scroll tracking.
  const scrollLinks = Array.from(document.querySelectorAll('.scroll-to-section > a[href^="#"]'))
    .map(function (link) { return { link: link, target: document.getElementById(link.hash.slice(1)) }; })
    .filter(function (entry) { return entry.target; });
  function onScroll() {
    if (header) header.classList.toggle("background-header", window.scrollY > 35);
    if (backToTop) backToTop.hidden = window.scrollY < 600;
    let active = null;
    scrollLinks.forEach(function (entry) {
      if (entry.target.getBoundingClientRect().top <= 140) active = entry;
    });
    scrollLinks.forEach(function (entry) { entry.link.classList.toggle("active", entry === active); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (backToTop) backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    const main = document.getElementById("main-content");
    if (main) main.focus({ preventScroll: true });
  });

  // Scope each tab group and keep inactive panels outside the keyboard sequence.
  document.querySelectorAll(".naccs").forEach(function (group, groupIndex) {
    const menu = group.querySelector(".menu");
    const tabs = Array.from(menu.children);
    const panels = Array.from(group.querySelector("ul.nacc").children);
    menu.setAttribute("role", "tablist");
    menu.setAttribute("aria-label", "Відомості про страхування майна");
    function selectTab(index, focus) {
      tabs.forEach(function (tab, i) {
        const selected = i === index;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].classList.toggle("active", selected);
        panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach(function (tab, index) {
      const tabId = "property-tab-" + groupIndex + "-" + index;
      const panelId = "property-panel-" + groupIndex + "-" + index;
      tab.setAttribute("role", "tab"); tab.id = tabId;
      tab.setAttribute("aria-controls", panelId);
      panels[index].id = panelId;
      panels[index].setAttribute("role", "tabpanel");
      panels[index].setAttribute("aria-labelledby", tabId);
      panels[index].tabIndex = 0;
      tab.addEventListener("click", function () { selectTab(index, false); });
      tab.addEventListener("keydown", function (event) {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault(); selectTab(next, true);
      });
    });
    selectTab(0, false);
  });

  document.querySelectorAll(".accordions").forEach(function (group, groupIndex) {
    const toggles = Array.from(group.querySelectorAll(".accordion-head"));
    function expand(toggle, open) {
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.getElementById(toggle.getAttribute("aria-controls")).hidden = !open;
    }
    toggles.forEach(function (toggle, index) {
      const panel = toggle.closest(".accordion").querySelector(".accordion-body");
      toggle.id = "question-" + groupIndex + "-" + index;
      panel.id = "answer-" + groupIndex + "-" + index;
      toggle.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", toggle.id);
      expand(toggle, index === 0 && group.classList.contains("is-first-expanded"));
      toggle.addEventListener("click", function () {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        if (!group.classList.contains("is-toggle")) toggles.forEach(function (other) { expand(other, false); });
        expand(toggle, open);
      });
    });
  });

  // Loop clones must not duplicate h1 or expose offscreen links to Tab.
  function labelHeroSlides() {
    this.slides.each(function (index, slide) {
      const visible = slide.classList.contains("swiper-slide-active");
      slide.setAttribute("aria-hidden", String(!visible));
      slide.querySelectorAll("a, button").forEach(function (link) { link.tabIndex = visible ? 0 : -1; });
      if (slide.classList.contains("swiper-slide-duplicate")) {
        const heading = slide.querySelector("h1");
        if (heading) {
          const replacement = document.createElement("h2");
          replacement.innerHTML = heading.innerHTML;
          heading.replaceWith(replacement);
        }
      }
    });
  }
  if (typeof window.Swiper === "function") {
    document.querySelectorAll(".swiper-container").forEach(function (container) {
      new window.Swiper(container, {
        loop: true, speed: reducedMotion ? 0 : 650, grabCursor: true,
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: {
          nextEl: container.querySelector(".swiper-button-next"),
          prevEl: container.querySelector(".swiper-button-prev")
        },
        a11y: {
          prevSlideMessage: "Попередній слайд", nextSlideMessage: "Наступний слайд",
          firstSlideMessage: "Перший слайд", lastSlideMessage: "Останній слайд"
        },
        on: { init: labelHeroSlides, slideChangeTransitionEnd: labelHeroSlides }
      });
    });
  }

  if ($ && $.fn.owlCarousel) {
    $(".owl-testimonials").each(function () {
      const carousel = $(this);
      carousel.on("initialized.owl.carousel refreshed.owl.carousel changed.owl.carousel", function () {
        window.requestAnimationFrame(function () {
          carousel.find(".owl-dot").each(function (index) {
            this.setAttribute("aria-label", "Порада " + (index + 1));
            this.setAttribute("aria-pressed", String(this.classList.contains("active")));
          });
          carousel.find(".owl-item").each(function () {
            this.setAttribute("aria-hidden", String(!this.classList.contains("active")));
          });
        });
      });
      carousel.owlCarousel({ items: 1, loop: false, dots: true, nav: false, autoplay: false, margin: 15 });
      carousel.attr({ role: "region", "aria-label": "Поради перед укладенням договору", tabindex: "0" });
      carousel.on("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        carousel.trigger(event.key === "ArrowRight" ? "next.owl.carousel" : "prev.owl.carousel");
      });
    });
  }

  const dialog = document.getElementById("consultation-dialog");
  let dialogOpener = null;
  if (dialog) {
    document.querySelectorAll("[data-open-consultation]").forEach(function (opener) {
      opener.addEventListener("click", function (event) {
        event.preventDefault(); dialogOpener = opener;
        const property = dialog.querySelector('[name="property"]');
        if (opener.dataset.property) {
          property.value = opener.dataset.property;
          property.dispatchEvent(new Event("change", { bubbles: true }));
        }
        setMenu(false); dialog.showModal();
        document.body.classList.add("dialog-open");
        dialog.querySelector('[name="name"]').focus();
      });
    });
    dialog.querySelector("[data-close-dialog]").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", function () {
      document.body.classList.remove("dialog-open");
      if (dialogOpener && dialogOpener.getClientRects().length) dialogOpener.focus({ preventScroll: true });
      else if (menuButton && mobile.matches) menuButton.focus({ preventScroll: true });
    });
  }

  // Validate locally without sending or exporting personal data.
  document.querySelectorAll("[data-request-form]").forEach(function (form) {
    const fields = Array.from(form.querySelectorAll("input, select, textarea"));
    form.noValidate = true;
    form.querySelector('[type="submit"]').disabled = false;
    function validationMessage(field) {
      const value = field.value.trim();
      if (field.required && !value) return "Заповніть це поле.";
      if (!value) return "";
      if (field.name === "name" && (value.length < 2 || !/\p{L}/u.test(value))) return "Вкажіть ім’я щонайменше з двох символів.";
      if (field.name === "phone") {
        const digits = value.replace(/\D/g, "");
        if (!/^\+?[\d\s()\-]+$/.test(value) || digits.length < 10 || digits.length > 15) return "Вкажіть коректний номер: від 10 до 15 цифр.";
      }
      if (field.type === "email" && field.validity.typeMismatch) return "Вкажіть коректну адресу електронної пошти.";
      if (field.name === "message" && value.length < 10) return "Опишіть запитання щонайменше десятьма символами.";
      if (field.maxLength > 0 && value.length > field.maxLength) return "Скоротіть значення до " + field.maxLength + " символів.";
      return "";
    }
    function validate(field) {
      const message = validationMessage(field);
      const error = document.getElementById(field.getAttribute("aria-describedby"));
      if (error) error.textContent = message;
      field.setAttribute("aria-invalid", String(Boolean(message)));
      return !message;
    }
    fields.forEach(function (field) {
      field.addEventListener("blur", function () { validate(field); });
      function edited() {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      }
      field.addEventListener("input", edited); field.addEventListener("change", edited);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const invalid = fields.filter(function (field) { return !validate(field); });
      if (invalid.length) { invalid[0].focus(); return; }
      const formDialog = form.closest("dialog");
      if (formDialog && formDialog.open) formDialog.close();
    });
  });

  // Preserve optional template integrations, guarding pages that do not use them.
  if ($ && $.fn.isotope && $(".grid").length) {
    const grid = $(".grid").isotope({ itemSelector: ".all", percentPosition: true, masonry: { columnWidth: ".all" } });
    $(".filters ul li").on("click", function () {
      $(".filters ul li").removeClass("active"); $(this).addClass("active");
      grid.isotope({ filter: $(this).attr("data-filter") });
    });
  }
  if ($) {
    $(window).on("load", function () {
      if ($.fn.parallax) $(".cover").each(function () { $(this).parallax({ imageSrc: $(this).data("image"), zIndex: "1" }); });
      $("#preloader").fadeOut(reducedMotion ? 0 : 300);
    });
    const counters = document.querySelectorAll(".count-digit");
    if (counters.length) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const node = entry.target; const total = Number(node.textContent);
          observer.unobserve(node);
          if (!Number.isFinite(total) || reducedMotion) return;
          $({ Counter: 0 }).animate({ Counter: total }, { duration: 1600, step: function () { node.textContent = Math.ceil(this.Counter); } });
        });
      });
      counters.forEach(function (counter) { observer.observe(counter); });
    }
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      if (image.dataset.fallback) return;
      image.dataset.fallback = "true"; image.src = "assets/images/about-left-image.jpg";
    });
  });
})(window.jQuery);


