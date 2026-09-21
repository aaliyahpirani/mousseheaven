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
