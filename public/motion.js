const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function go(href) {
  if (reduceMotion) {
    window.location.href = href;
    return;
  }
  document.body.classList.add("is-leaving");
  window.setTimeout(() => {
    window.location.href = href;
  }, 380);
}

window.addEventListener("pageshow", () => {
  document.body.classList.remove("is-leaving");
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target === "_blank" || link.hasAttribute("download")) return;

  let url;
  try {
    url = new URL(link.href, window.location.href);
  } catch {
    return;
  }

  if (url.origin !== window.location.origin) return;
  if (url.pathname === window.location.pathname && url.hash) return;
  if (url.href === window.location.href) return;

  event.preventDefault();
  go(url.href);
});
