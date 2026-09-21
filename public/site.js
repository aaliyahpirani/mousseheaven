const header = document.querySelector(".site-header");
const hero = document.querySelector("#home");
const form = document.querySelector(".contact-form");

function syncHeader() {
  if (!header || !hero) return;
  const bottom = hero.getBoundingClientRect().bottom;
  header.classList.toggle("is-away", bottom < 140);
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("resize", syncHeader);

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = form.querySelector(".form-note");
    form.reset();
    if (note) {
      note.hidden = false;
    }
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  const reveal = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-in", entry.isIntersecting);
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  document
    .querySelectorAll(".stats, .about-row, .seller, .pastries-head, .contact-copy")
    .forEach((el, i) => {
      el.classList.add("js-reveal");
      el.style.transitionDelay = `${Math.min(i, 4) * 0.06}s`;
      reveal.observe(el);
    });

  document.querySelectorAll(".pastry-group").forEach((group) => {
    group.querySelectorAll(".pastry-card").forEach((el, i) => {
      el.classList.add("js-reveal");
      el.style.transitionDelay = `${(i % 4) * 0.08}s`;
      reveal.observe(el);
    });
  });
}
