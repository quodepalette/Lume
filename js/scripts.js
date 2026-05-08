document.getElementById('year').textContent = new Date().getFullYear();

('use strict');
const CATS = [
  'womens-dresses',
  'mens-shirts',
  'tops',
  'womens-shoes',
  'mens-shoes',
  'womens-bags',
  'sunglasses',
  'womens-jewellery',
  'mens-watches',
  'womens-watches',
];
const COLORS = [
  'Black',
  'White',
  'Navy',
  'Beige',
  'Red',
  'Olive',
  'Blush',
  'Charcoal',
  'Ivory',
  'Sage',
  'Camel',
  'Burgundy',
];
const CHEX = {
  Black: '#1a1a1a',
  White: '#F5F5F0',
  Navy: '#1B2A4A',
  Beige: '#D4B483',
  Red: '#B22222',
  Olive: '#6B7C3C',
  Blush: '#E8A0A0',
  Charcoal: '#36454F',
  Ivory: '#FFFFF0',
  Sage: '#8FA980',
  Camel: '#C19A6B',
  Burgundy: '#800020',
};
const SSETS = [
  ['XS', 'S', 'M'],
  ['S', 'M', 'L'],
  ['M', 'L', 'XL'],
  ['XS', 'S', 'M', 'L'],
  ['S', 'M', 'L', 'XL'],
  ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ['36', '37', '38', '39', '40', '41'],
  ['OS'],
];
const CMAP = {
  'womens-dresses': "Women's Dresses",
  'mens-shirts': "Men's Shirts",
  tops: 'Tops',
  'womens-shoes': "Women's Shoes",
  'mens-shoes': "Men's Shoes",
  'womens-bags': "Women's Bags",
  sunglasses: 'Sunglasses',
  'womens-jewellery': "Women's Jewellery",
  'mens-watches': "Men's Watches",
  'womens-watches': "Women's Watches",
};

let allP = [],
  filtP = [],
  cart = [],
  wl = [];
let view = 'grid',
  selSz = {},
  selCol = {},
  dQty = 1;
let F = {
  maxP: 2000,
  sizes: [],
  brands: [],
  colors: [],
  minR: 0,
  sort: 'default',
};

// Back to top
(function () {
  const btn = document.getElementById('btt');
  window.addEventListener(
    'scroll',
    () => {
      btn.classList.toggle('visible', window.scrollY > 380);
    },
    { passive: true },
  );
})();

function enrich(p) {
  const id = p.id;
  const colors = [
    COLORS[id % COLORS.length],
    COLORS[(id + 3) % COLORS.length],
    COLORS[(id + 7) % COLORS.length],
  ];
  const sizes = SSETS[id % SSETS.length];
  const disc = p.discountPercentage > 10;
  return {
    ...p,
    colors,
    sizes,
    isNew: id % 5 === 0,
    isSale: disc,
    origPrice: disc
      ? +(p.price / (1 - p.discountPercentage / 100)).toFixed(2)
      : null,
    catLabel: CMAP[p.category] || p.category,
    revCount: Math.floor(p.rating * 18) + 5,
  };
}
async function fetchAll() {
  try {
    const reqs = CATS.map((c) =>
      fetch(
        `https://dummyjson.com/products/category/${c}?limit=20&select=id,title,brand,category,price,discountPercentage,rating,stock,thumbnail,images,description,tags`,
      )
        .then((r) => r.json())
        .catch(() => ({ products: [] })),
    );
    const res = await Promise.all(reqs);
    allP = res.flatMap((r) => r.products || []).map(enrich);
    filtP = [...allP];
    F.maxP = getMaxP();
    applyF();
    renderSB('sb-d-content');
    renderSB('sb-m-content');
  } catch (e) {
    toast('⚠️', 'Could not load products', 'Check your internet connection');
  }
}
function getMaxP() {
  if (!allP.length) return 2000;
  return Math.ceil(Math.max(...allP.map((p) => p.price)) / 100) * 100;
}
function applyF() {
  let r = allP.filter((p) => {
    if (p.price > F.maxP) return false;
    if (F.sizes.length && !F.sizes.some((s) => p.sizes.includes(s)))
      return false;
    if (F.brands.length && !F.brands.includes(p.brand)) return false;
    if (F.colors.length && !F.colors.some((c) => p.colors.includes(c)))
      return false;
    if (p.rating < F.minR) return false;
    return true;
  });
  switch (F.sort) {
    case 'price-asc':
      r.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      r.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      r.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      r.sort((a, b) => b.id - a.id);
      break;
  }
  filtP = r;
  renderP();
}
function resetF() {
  F = {
    maxP: getMaxP(),
    sizes: [],
    brands: [],
    colors: [],
    minR: 0,
    sort: 'default',
  };
  renderSB('sb-d-content');
  renderSB('sb-m-content');
  applyF();
}
function togF(key, val, on) {
  if (on) {
    if (!F[key].includes(val)) F[key].push(val);
  } else {
    F[key] = F[key].filter((v) => v !== val);
  }
  applyF();
}
function togColor(col, el) {
  el.classList.toggle('on');
  togF('colors', col, el.classList.contains('on'));
}
function setMinR(r) {
  F.minR = r;
  applyF();
  renderSB('sb-d-content');
  renderSB('sb-m-content');
}

function renderSB(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const brands = [...new Set(allP.map((p) => p.brand).filter(Boolean))].sort();
  const mx = getMaxP();
  const uniqId = id;
  el.innerHTML = `
<div class="sb-section"><div class="sb-title">Sort By</div>
<select class="sort-sel" onchange="F.sort=this.value;applyF()">
<option value="default" ${F.sort === 'default' ? 'selected' : ''}>Featured</option>
<option value="price-asc" ${F.sort === 'price-asc' ? 'selected' : ''}>Price: Low → High</option>
<option value="price-desc" ${F.sort === 'price-desc' ? 'selected' : ''}>Price: High → Low</option>
<option value="rating" ${F.sort === 'rating' ? 'selected' : ''}>Top Rated</option>
<option value="newest" ${F.sort === 'newest' ? 'selected' : ''}>Newest</option>
</select></div>
<div class="sb-section"><div class="sb-title">Price Range</div>
<div class="pr-display"><span>$0</span><b id="prd-${uniqId}">Up to $${F.maxP}</b></div>
<input type="range" min="0" max="${mx}" step="10" value="${F.maxP}" oninput="F.maxP=+this.value;document.getElementById('prd-${uniqId}').textContent='Up to $'+this.value;applyF()"></div>
<div class="sb-section"><div class="sb-title">Size</div>${['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'].map((s) => `<label class="fopt"><input type="checkbox" ${F.sizes.includes(s) ? 'checked' : ''} onchange="togF('sizes','${s}',this.checked)"> ${s}</label>`).join('')}</div>
<div class="sb-section"><div class="sb-title">Color</div><div class="swatches">${COLORS.map((c) => `<div class="swatch ${F.colors.includes(c) ? 'on' : ''}" style="background:${CHEX[c]}" data-c="${c}" title="${c}" onclick="togColor('${c}',this)"></div>`).join('')}</div></div>
<div class="sb-section"><div class="sb-title">Brand</div><div style="max-height:180px;overflow-y:auto">${brands
    .slice(0, 24)
    .map(
      (b) =>
        `<label class="fopt"><input type="checkbox" ${F.brands.includes(b) ? 'checked' : ''} onchange="togF('brands','${escAttr(b)}',this.checked)">${esc(b)}</label>`,
    )
    .join('')}</div></div>
<div class="sb-section"><div class="sb-title">Min Rating</div>${[
    [4.5, '★★★★½'],
    [4, '★★★★'],
    [3.5, '★★★½'],
    [3, '★★★'],
    [0, 'All'],
  ]
    .map(
      ([r, s]) =>
        `<div class="rf-row ${F.minR === r ? 'on' : ''}" onclick="setMinR(${r})"><span class="rf-stars">${s}</span><span class="rf-label">${r > 0 ? r + '+ Stars' : 'All Ratings'}</span></div>`,
    )
    .join('')}</div>
<div class="sb-section"><button class="sb-reset" onclick="resetF()">Reset All Filters</button></div>`;
}

function renderP() {
  const g = document.getElementById('pgrid');
  document.getElementById('pcount').textContent = filtP.length;
  if (!filtP.length) {
    g.innerHTML = `<div class="nores"><div class="nores-icon">🔍</div><h3>No products found</h3><p>Try adjusting your filters</p></div>`;
    return;
  }
  g.innerHTML = filtP.map((p) => pCard(p)).join('');
}
function pCard(p) {
  const inWL = wl.some((w) => w.id === p.id);
  return `<div class="pcard" data-id="${p.id}"><div class="pcard-img" onclick="showPD(${p.id})"><img src="${p.thumbnail}" alt="${esc(p.title)}" loading="lazy" onerror="this.src='https://placehold.co/400x533/F0EDE8/999?text=LÛME'">${p.isSale ? '<span class="pbadge sale">Sale</span>' : p.isNew ? '<span class="pbadge newb">New</span>' : ''}<div class="pqv" onclick="event.stopPropagation();openQV(${p.id})">Quick View</div></div><button class="pwish ${inWL ? 'on' : ''}" onclick="togWL(${p.id})" title="${inWL ? 'Remove' : 'Add to wishlist'}"><svg viewBox="0 0 24 24" fill="${inWL ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button><div class="pinfo" onclick="showPD(${p.id})"><div class="pbrand">${esc(p.brand || '')}</div><div class="pname">${esc(p.title)}</div><div class="prating"><span class="stars">${strs(p.rating)}</span><span class="rcount">(${p.revCount})</span></div><div class="pprow"><div><span class="pprice">$${p.price.toFixed(2)}</span>${p.isSale && p.origPrice ? `<span class="pprice-old">$${p.origPrice.toFixed(2)}</span>` : ''}</div><button class="padd" onclick="event.stopPropagation();qAdd(${p.id})" title="Add to cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div></div></div>`;
}
function strs(r) {
  const f = Math.floor(r),
    h = r % 1 >= 0.5,
    e = 5 - f - (h ? 1 : 0);
  return '★'.repeat(f) + (h ? '½' : '') + '☆'.repeat(e);
}
function setView(v) {
  view = v;
  document.getElementById('pgrid').classList.toggle('list', v === 'list');
  document.getElementById('vg').classList.toggle('on', v === 'grid');
  document.getElementById('vl').classList.toggle('on', v === 'list');
}

function openQV(id) {
  const p = allP.find((x) => x.id === id);
  if (!p) return;
  selSz[id] = p.sizes[0];
  selCol[id] = p.colors[0];
  document.getElementById('qv-body').innerHTML =
    `<div class="qv-img"><img src="${p.thumbnail}" alt="${esc(p.title)}" onerror="this.src='https://placehold.co/400x400/F0EDE8/999?text=LÛME'"></div><div class="qv-info"><div class="qv-brand">${esc(p.brand || p.catLabel)}</div><div class="qv-name fd">${esc(p.title)}</div><div class="qv-meta"><span class="stars">${strs(p.rating)}</span><span>${p.rating.toFixed(1)} · ${p.revCount} reviews</span></div><div class="qv-price">$${p.price.toFixed(2)}${p.isSale && p.origPrice ? `<span class="old">$${p.origPrice.toFixed(2)}</span>` : ''}</div><div class="opt-block"><div class="opt-label">Color <span id="qv-clbl">${p.colors[0]}</span></div><div class="swatches" style="margin-top:8px">${p.colors.map((c, i) => `<div class="swatch ${i === 0 ? 'on' : ''}" style="background:${CHEX[c] || '#ccc'}" data-c="${c}" title="${c}" onclick="selQVC(this,${id})"></div>`).join('')}</div></div><div class="opt-block"><div class="opt-label">Size</div><div class="sizes" style="margin-top:8px">${p.sizes.map((s, i) => `<button class="sz ${i === 0 ? 'on' : ''}" onclick="selQVS(this,${id})">${s}</button>`).join('')}</div></div><div class="qv-actions"><button class="btn-cart" onclick="addFromQV(${id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Add to Bag</button><button class="btn-detail" onclick="closeQV();showPD(${id})">View Full Details →</button></div></div>`;
  document.getElementById('qv-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function selQVS(el, id) {
  el.closest('.sizes')
    .querySelectorAll('.sz')
    .forEach((b) => b.classList.remove('on'));
  el.classList.add('on');
  selSz[id] = el.textContent;
}
function selQVC(el, id) {
  el.closest('.swatches')
    .querySelectorAll('.swatch')
    .forEach((s) => s.classList.remove('on'));
  el.classList.add('on');
  selCol[id] = el.dataset.c;
  const lb = document.getElementById('qv-clbl');
  if (lb) lb.textContent = el.dataset.c;
}
function addFromQV(id) {
  const p = allP.find((x) => x.id === id);
  if (!p) return;
  addCart(p, selSz[id] || p.sizes[0], selCol[id] || p.colors[0]);
  closeQV();
}
function closeQV(e) {
  if (e && e.target !== document.getElementById('qv-bg')) return;
  document.getElementById('qv-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function showPD(id) {
  const p = allP.find((x) => x.id === id);
  if (!p) return;
  selSz[id] = p.sizes[0];
  selCol[id] = p.colors[0];
  dQty = 1;
  const inWL = wl.some((w) => w.id === p.id);
  const imgs =
    p.images && p.images.length > 1
      ? p.images.slice(0, 4)
      : [p.thumbnail, p.thumbnail, p.thumbnail];
  const rel = allP
    .filter((x) => x.category === p.category && x.id !== p.id)
    .slice(0, 4);
  document.getElementById('pg-product').innerHTML =
    `<button class="back" onclick="goShop()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Back to Shop</button><div class="pd-layout"><div class="pd-imgs"><div class="pd-main"><img id="pdmain" src="${imgs[0]}" alt="${esc(p.title)}" onerror="this.src='https://placehold.co/600x600/F0EDE8/999?text=LÛME'"></div><div class="pd-thumbs">${imgs.map((img, i) => `<div class="pd-th ${i === 0 ? 'on' : ''}" onclick="swImg('${img}',this)"><img src="${img}" alt="${esc(p.title)} ${i + 1}" onerror="this.src='https://placehold.co/100x120/F0EDE8/999?text=+'"></div>`).join('')}</div></div><div class="pd-info"><div class="pd-brand">${esc(p.brand || p.catLabel)}</div><h1 class="pd-name fd">${esc(p.title)}</h1><div class="pd-rating"><span class="stars" style="font-size:.88rem">${strs(p.rating)}</span><span style="font-size:.78rem;color:var(--text-2)">${p.rating.toFixed(1)} · ${p.revCount} reviews</span></div><div class="pd-price-block"><span class="pd-price">$${p.price.toFixed(2)}</span>${p.isSale && p.origPrice ? `<span class="pd-orig">$${p.origPrice.toFixed(2)}</span><span class="pd-disc">−${Math.round(p.discountPercentage)}%</span>` : ''}</div><div class="pd-opt"><div class="opt-label">Color <span id="pd-clbl">${p.colors[0]}</span></div><div class="swatches" style="margin-top:8px">${p.colors.map((c, i) => `<div class="swatch ${i === 0 ? 'on' : ''}" style="background:${CHEX[c] || '#ccc'}" data-c="${c}" title="${c}" onclick="selPDC(this,${id})"></div>`).join('')}</div></div><div class="pd-opt"><div class="opt-label" style="justify-content:space-between"><span>Size <span id="pd-szlbl">${p.sizes[0]}</span></span><a style="font-size:.67rem;color:var(--accent);cursor:pointer;text-transform:none;letter-spacing:0;font-weight:400" onclick="proto('Size Guide')">Size Guide →</a></div><div class="sizes" style="margin-top:8px">${p.sizes.map((s, i) => `<button class="sz ${i === 0 ? 'on' : ''}" onclick="selPDS(this,${id})">${s}</button>`).join('')}</div></div><div class="pd-opt"><div class="opt-label">Quantity</div><div class="qsel" style="margin-top:8px"><button class="qb" onclick="chDQ(-1)">−</button><span class="qn" id="dqty">1</span><button class="qb" onclick="chDQ(1)">+</button></div></div><div class="pd-acts"><button class="btn-cart" onclick="addFromPD(${id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Add to Bag</button><button class="btn-buy" onclick="proto('Buy Now')">Buy Now</button><button class="btn-wf ${inWL ? 'on' : ''}" id="pd-wbtn" onclick="togWL(${id},true)"><svg viewBox="0 0 24 24" fill="${inWL ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" style="width:15px;height:15px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>${inWL ? 'Remove from Wishlist' : 'Add to Wishlist'}</button></div><div class="pd-meta"><div class="mr"><span class="ml">Category</span><span>${esc(p.catLabel)}</span></div><div class="mr"><span class="ml">Brand</span><span>${esc(p.brand || '—')}</span></div><div class="mr"><span class="ml">SKU</span><span>LME-${String(p.id).padStart(4, '0')}</span></div><div class="mr"><span class="ml">Availability</span><span style="color:${p.stock > 10 ? 'var(--success)' : 'var(--danger)'}">${p.stock > 10 ? 'In Stock' : `Only ${p.stock} left`}</span></div>${p.tags && p.tags.length ? `<div class="mr"><span class="ml">Tags</span><div class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>` : ''}</div>${p.description ? `<div class="pd-desc">${esc(p.description)}</div>` : ''}</div></div>${rel.length ? `<div class="rel-section"><h2 class="sec-h fd">You May Also Like</h2><div class="rel-grid">${rel.map((r) => pCard(r)).join('')}</div></div>` : ''}`;
  document.getElementById('pg-shop').style.display = 'none';
  document.getElementById('pg-product').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function swImg(src, el) {
  document.getElementById('pdmain').src = src;
  el.closest('.pd-thumbs')
    .querySelectorAll('.pd-th')
    .forEach((t) => t.classList.remove('on'));
  el.classList.add('on');
}
function selPDS(el, id) {
  el.closest('.sizes')
    .querySelectorAll('.sz')
    .forEach((b) => b.classList.remove('on'));
  el.classList.add('on');
  selSz[id] = el.textContent;
  document.getElementById('pd-szlbl').textContent = el.textContent;
}
function selPDC(el, id) {
  el.closest('.swatches')
    .querySelectorAll('.swatch')
    .forEach((s) => s.classList.remove('on'));
  el.classList.add('on');
  selCol[id] = el.dataset.c;
  document.getElementById('pd-clbl').textContent = el.dataset.c;
}
function chDQ(d) {
  dQty = Math.max(1, Math.min(10, dQty + d));
  document.getElementById('dqty').textContent = dQty;
}
function addFromPD(id) {
  const p = allP.find((x) => x.id === id);
  if (!p) return;
  for (let i = 0; i < dQty; i++)
    addCart(p, selSz[id] || p.sizes[0], selCol[id] || p.colors[0]);
}
function goShop() {
  document.getElementById('pg-shop').style.display = 'block';
  document.getElementById('pg-product').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addCart(p, sz, col) {
  const key = `${p.id}-${sz}-${col}`;
  const ex = cart.find((i) => i.key === key);
  if (ex) ex.qty++;
  else cart.push({ key, p, sz, col, qty: 1 });
  updCart();
  toast('🛍️', 'Added to Bag', `${p.title} · ${sz} · ${col}`);
}
function qAdd(id) {
  const p = allP.find((x) => x.id === id);
  if (!p) return;
  addCart(p, p.sizes[0], p.colors[0]);
}
function rmCart(key) {
  cart = cart.filter((i) => i.key !== key);
  updCart();
}
function chQty(key, d) {
  const it = cart.find((i) => i.key === key);
  if (!it) return;
  it.qty = Math.max(1, it.qty + d);
  updCart();
}
function updCart() {
  const n = cart.reduce((s, i) => s + i.qty, 0);
  const b = document.getElementById('cart-badge');
  b.textContent = n;
  b.classList.toggle('on', n > 0);
  document.getElementById('cart-cnt').textContent = n;
  renderCart();
}
function renderCart() {
  const body = document.getElementById('cart-body');
  const foot = document.getElementById('cart-foot');
  if (!cart.length) {
    foot.style.display = 'none';
    body.innerHTML = `<div class="drw-empty"><div class="drw-empty-icon">🛍️</div><h3>Your bag is empty</h3><p>Add something you love</p></div>`;
    return;
  }
  foot.style.display = 'block';
  body.innerHTML = cart
    .map(
      (it) =>
        `<div class="ci"><div class="ci-img"><img src="${it.p.thumbnail}" alt="${esc(it.p.title)}" onerror="this.src='https://placehold.co/76x96/F0EDE8/999?text=+'"></div><div class="ci-info"><div class="ci-brand">${esc(it.p.brand || '')}</div><div class="ci-name">${esc(it.p.title)}</div><div class="ci-var">${it.sz} · ${it.col}</div><div class="ci-bot"><div class="qc"><button class="qb" onclick="chQty('${it.key}',-1)">−</button><span class="qn">${it.qty}</span><button class="qb" onclick="chQty('${it.key}',1)">+</button></div><span class="ci-price">$${(it.p.price * it.qty).toFixed(2)}</span></div></div><button class="ci-rm" onclick="rmCart('${it.key}')">✕</button></div>`,
    )
    .join('');
  const sub = cart.reduce((s, i) => s + i.p.price * i.qty, 0);
  document.getElementById('c-sub').textContent = `$${sub.toFixed(2)}`;
  document.getElementById('c-tot').textContent = `$${sub.toFixed(2)}`;
}
function toggleCart() {
  const bg = document.getElementById('cart-bg');
  const dr = document.getElementById('cart-drawer');
  const open = dr.classList.toggle('open');
  bg.classList.toggle('open', open);
  document.getElementById('wl-drawer').classList.remove('open');
  document.getElementById('wl-bg').classList.remove('open');
  document.body.style.overflow = open ? 'hidden' : '';
}

function togWL(id, fromPD = false) {
  const p = allP.find((x) => x.id === id);
  if (!p) return;
  const has = wl.some((w) => w.id === id);
  if (has) {
    wl = wl.filter((w) => w.id !== id);
    toast('💔', 'Removed from Wishlist', p.title);
  } else {
    wl.push(p);
    toast('❤️', 'Added to Wishlist', p.title);
  }
  updWL();
  document.querySelectorAll(`.pcard[data-id="${id}"] .pwish`).forEach((b) => {
    b.classList.toggle('on', !has);
    b.querySelector('svg').setAttribute('fill', !has ? 'currentColor' : 'none');
  });
  if (fromPD) {
    const btn = document.getElementById('pd-wbtn');
    if (!btn) return;
    btn.classList.toggle('on', !has);
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="${!has ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" style="width:15px;height:15px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${!has ? 'Remove from Wishlist' : 'Add to Wishlist'}`;
  }
}
function updWL() {
  const n = wl.length;
  const b = document.getElementById('wl-badge');
  b.textContent = n;
  b.classList.toggle('on', n > 0);
  document.getElementById('wl-cnt').textContent = n;
  renderWL();
}
function renderWL() {
  const body = document.getElementById('wl-body');
  if (!wl.length) {
    body.innerHTML = `<div class="drw-empty"><div class="drw-empty-icon">❤️</div><h3>Wishlist is empty</h3><p>Save items you love for later</p></div>`;
    return;
  }
  body.innerHTML = `<div class="wgrid">${wl.map((p) => `<div class="wi"><div class="wi-img" onclick="wlGoDetail(${p.id})"><img src="${p.thumbnail}" alt="${esc(p.title)}" onerror="this.src='https://placehold.co/200x267/F0EDE8/999?text=LÛME'"></div><div class="wi-info"><div class="wi-name fd">${esc(p.title)}</div><div class="wi-price">$${p.price.toFixed(2)}</div><div class="wi-acts"><button class="wi-add" onclick="mv2cart(${p.id})">Add to Bag</button><button class="wi-rm" onclick="togWL(${p.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div></div>`).join('')}</div>`;
}
function mv2cart(id) {
  const p = allP.find((x) => x.id === id);
  if (!p) return;
  addCart(p, p.sizes[0], p.colors[0]);
  wl = wl.filter((w) => w.id !== id);
  updWL();
}
function wlGoDetail(id) {
  toggleWL();
  setTimeout(() => showPD(id), 420);
}
function toggleWL() {
  const bg = document.getElementById('wl-bg');
  const dr = document.getElementById('wl-drawer');
  const open = dr.classList.toggle('open');
  bg.classList.toggle('open', open);
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-bg').classList.remove('open');
  document.body.style.overflow = open ? 'hidden' : '';
}

function toast(ico, title, msg) {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-ico">${ico}</span><div class="toast-txt"><strong>${esc(title)}</strong><span>${esc(msg)}</span></div>`;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('bye');
    setTimeout(() => t.remove(), 300);
  }, 3600);
}
function proto(lbl) {
  toast('🔗', 'Prototype', `"${lbl}" — This link isn't available yet`);
}
function toggleMM() {
  document.getElementById('mmenu').classList.toggle('open');
}
function closeMMGo(p) {
  document.getElementById('mmenu').classList.remove('open');
  if (p === 'shop') goShop();
}
function openFO() {
  renderSB('sb-m-content');
  document.getElementById('foverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeFO() {
  document.getElementById('foverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  renderWL();
  fetchAll();
});
