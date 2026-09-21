const BAG_KEY = "mousseheaven-bag";
const prefersLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function readBag() {
  try {
    return JSON.parse(localStorage.getItem(BAG_KEY)) || [];
  } catch {
    return [];
  }
}

function writeBag(items) {
  localStorage.setItem(BAG_KEY, JSON.stringify(items));
}

function bagCount(items = readBag()) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

function money(n) {
  return `$${n.toFixed(0)}`;
}

function mountChrome() {
  if (document.querySelector(".drawer")) return;

  const drawer = document.createElement("aside");
  drawer.className = "drawer";
  drawer.innerHTML = `
    <button class="drawer-close" type="button" aria-label="Close bag">✕</button>
    <h2>Bag</h2>
    <p class="bag-empty">Your bag is empty.</p>
    <ul class="bag-list"></ul>
    <div class="bag-total"><span>Total</span><span data-total></span></div>
    <button class="checkout" type="button">Checkout</button>
  `;

  const veil = document.createElement("div");
  veil.className = "bag-veil";

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `<img alt="" />`;

  const toast = document.createElement("p");
  toast.className = "toast";
  toast.textContent = "Added to bag";

  document.body.append(veil, drawer, lightbox, toast);
}

function renderBag() {
  const items = readBag();
  const countEl = document.querySelector("[data-bag-count]");
  const list = document.querySelector(".bag-list");
  const empty = document.querySelector(".bag-empty");
  const totalEl = document.querySelector("[data-total]");
  if (countEl) countEl.textContent = String(bagCount(items));
  if (!list) return;

  list.innerHTML = items
    .map(
      (item) => `
        <li>
          <span>${item.name}<br />${item.size} · ×${item.qty}</span>
          <span>${money(item.price * item.qty)}</span>
        </li>`
    )
    .join("");

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (totalEl) totalEl.textContent = money(total);
  if (empty) empty.hidden = items.length > 0;
}

function openBag() {
  document.querySelector(".drawer")?.classList.add("is-open");
  document.querySelector(".bag-veil")?.classList.add("is-open");
}

function closeBag() {
  document.querySelector(".drawer")?.classList.remove("is-open");
  document.querySelector(".bag-veil")?.classList.remove("is-open");
}

function showToast() {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.classList.add("is-on");
  window.setTimeout(() => toast.classList.remove("is-on"), 1600);
}

function productFromUrl() {
  const id = new URLSearchParams(window.location.search).get("id");
  return (typeof CATALOG !== "undefined" ? CATALOG : []).find((item) => item.id === id);
}

function fillProduct() {
  const product = productFromUrl();
  const stage = document.querySelector(".zoom-stage");
  if (!stage) return;
  if (!product) {
    window.location.replace("index.html#pastries");
    return;
  }

  document.title = `${product.name} — Mousse Heaven`;
  const crumbCat = document.querySelector("[data-crumb-cat]");
  const crumbName = document.querySelector("[data-crumb-name]");
  if (crumbCat) crumbCat.textContent = product.categoryName;
  if (crumbName) crumbName.textContent = product.name;

  const title = document.querySelector("[data-title]");
  if (title) title.textContent = product.name;
  const blurb = document.querySelector("[data-blurb]");
  if (blurb) blurb.textContent = product.blurb;
  const allergens = document.querySelector("[data-allergens]");
  if (allergens) allergens.textContent = product.allergens;

  const form = document.querySelector(".buy-form");
  form.dataset.id = product.id;
  form.dataset.name = product.name;

  const optionLabel = document.querySelector("[data-option-label]");
  if (optionLabel) {
    optionLabel.textContent = product.category === "assortment" ? "Box" : "Size";
  }

  const options = document.querySelector("[data-options]");
  const mid = product.options[Math.min(1, product.options.length - 1)];
  options.innerHTML = product.options
    .map(
      (opt) =>
        `<button type="button" data-size="${opt.label}" data-price="${opt.price}"${
          opt.label === mid.label ? ' class="is-on"' : ""
        }>${opt.label}</button>`
    )
    .join("");

  const priceEl = document.querySelector("[data-price]");
  if (priceEl) priceEl.textContent = money(mid.price);

  const gallery = [product.image, "images/dessert-1.svg", "images/dessert-2.svg", "images/dessert-3.svg"].filter(
    (src, i, all) => all.indexOf(src) === i
  );
  const thumbs = document.querySelector("[data-thumbs]");
  thumbs.innerHTML = gallery
    .map(
      (src, i) =>
        `<button type="button" class="${i === 0 ? "is-on" : ""}" data-src="${src}"><img src="${src}" alt="" /></button>`
    )
    .join("");

  const mainImg = document.querySelector("[data-main-img]");
  mainImg.src = product.image;
  mainImg.alt = product.name;

  const also = document.querySelector("[data-also]");
  const others = CATALOG.filter((item) => item.category === product.category && item.id !== product.id);
  also.innerHTML = others
    .map(
      (item) =>
        `<a href="product.html?id=${item.id}"><img src="${item.image}" alt="" />${item.name}</a>`
    )
    .join("");
}

fillProduct();
mountChrome();
renderBag();

document.querySelector("[data-open-bag]")?.addEventListener("click", openBag);
document.querySelector(".drawer-close")?.addEventListener("click", closeBag);
document.querySelector(".bag-veil")?.addEventListener("click", closeBag);
document.querySelector(".checkout")?.addEventListener("click", () => {
  if (!readBag().length) {
    const note = document.querySelector(".bag-empty");
    if (note) {
      note.hidden = false;
      note.textContent = "Add a cake before checkout.";
    }
    return;
  }
  window.location.href = "checkout.html";
});

const stage = document.querySelector(".zoom-stage");
const mainImg = stage?.querySelector("img");
const lightbox = document.querySelector(".lightbox");
const lightImg = lightbox?.querySelector("img");

if (stage && mainImg && !prefersLessMotion) {
  stage.addEventListener("mousemove", (event) => {
    const box = stage.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    mainImg.style.transformOrigin = `${x}% ${y}%`;
    stage.classList.add("is-zoom");
  });
  stage.addEventListener("mouseleave", () => {
    stage.classList.remove("is-zoom");
    mainImg.style.transformOrigin = "center center";
  });
}

stage?.addEventListener("click", () => {
  if (!lightbox || !lightImg || !mainImg) return;
  lightImg.src = mainImg.src;
  lightImg.alt = mainImg.alt;
  lightbox.classList.add("is-open");
});

lightbox?.addEventListener("click", () => {
  lightbox.classList.remove("is-open");
});

document.querySelectorAll(".thumbs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const src = btn.dataset.src;
    if (!src || !mainImg) return;
    document.querySelectorAll(".thumbs button").forEach((el) => el.classList.remove("is-on"));
    btn.classList.add("is-on");
    const swap = () => {
      mainImg.src = src;
      mainImg.classList.remove("is-swap");
    };
    if (prefersLessMotion) {
      swap();
      return;
    }
    mainImg.classList.add("is-swap");
    window.setTimeout(swap, 180);
  });
});

const form = document.querySelector(".buy-form");
if (form) {
  const priceEl = document.querySelector("[data-price]");
  const qtyEl = document.querySelector("[data-qty]");
  let qty = 1;

  form.addEventListener("click", (event) => {
    const sizeBtn = event.target.closest("[data-size]");
    if (sizeBtn) {
      form.querySelectorAll("[data-size]").forEach((el) => el.classList.remove("is-on"));
      sizeBtn.classList.add("is-on");
      if (priceEl) priceEl.textContent = money(Number(sizeBtn.dataset.price));
    }

    if (event.target.matches("[data-qty-minus]")) qty = Math.max(1, qty - 1);
    if (event.target.matches("[data-qty-plus]")) qty += 1;
    if (qtyEl) qtyEl.textContent = String(qty);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const sizeBtn = form.querySelector("[data-size].is-on");
    if (!sizeBtn) return;
    const next = {
      id: form.dataset.id,
      name: form.dataset.name,
      size: sizeBtn.dataset.size,
      price: Number(sizeBtn.dataset.price),
      qty,
    };
    const items = readBag();
    const match = items.find((item) => item.id === next.id && item.size === next.size);
    if (match) match.qty += next.qty;
    else items.push(next);
    writeBag(items);
    renderBag();
    showToast();
    openBag();
  });
}
