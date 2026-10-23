// ─────────────────────────────────────────────────────────────
//  INTERFACE — affichage des pages et réactions aux clics.
//  Les accès à la base de données sont dans data.js.
// ─────────────────────────────────────────────────────────────
import * as D from "./data.js";

const S = D.session;
const $app = document.getElementById("app");
const $toasts = document.getElementById("toasts");

// ---------- Outils ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  wifi: '<path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
};
const icon = (name, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

const STAR = '<svg class="logo-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.6 6.9L22 9.3l-5.6 4.7L18.2 21 12 17.2 5.8 21l1.8-7L2 9.3l7.4-.4z"/></svg>';
const FLAKE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M4.2 6.5l15.6 9M4.2 17.5l15.6-9M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2"/></svg>';

function toast(msg, kind = "") {
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.innerHTML = `${kind === "error" ? icon("x") : icon("check")}<span>${esc(msg)}</span>`;
  $toasts.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, kind === "error" ? 5200 : 3000);
}
D.onDataError(msg => toast(msg, "error"));

async function run(btn, fn, okMsg) {
  if (btn) { if (btn.disabled) return; btn.disabled = true; btn.classList.add("busy"); }
  try { const r = await fn(); if (okMsg) toast(okMsg); return r; }
  catch (e) { console.error(e); toast(D.friendlyError(e), "error"); throw e; }
  finally { if (btn) { btn.disabled = false; btn.classList.remove("busy"); } }
}
const quiet = (p) => p.catch(() => {});

function parsePrice(p) {
  const m = String(p || "").replace(/\s/g, "").replace(",", ".").match(/\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}
function formatEuros(n) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: n % 1 ? 2 : 0 });
}
function hueClass(id) {
  let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ["t-red", "t-green", "t-gold"][h % 3];
}
function shareUrl(gid) { return `${location.origin}${location.pathname}#/g/${gid}`; }
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch {}
    t.remove(); return ok;
  }
}

// ---------- Navigation ----------
function parseRoute() {
  const h = location.hash.replace(/^#\/?/, "");
  const parts = h.split("/").filter(Boolean);
  if (parts[0] === "g" && parts[1]) {
    const page = ["ma-liste", "listes", "mes-actions"].includes(parts[2]) ? parts[2] : null;
    return { gid: parts[1], page };
  }
  return { gid: null, page: null };
}
function go(hash) { if (location.hash !== hash) location.hash = hash; else render(); }
// change de page et attend que le changement soit appliqué
function navigate(hash) {
  if (location.hash === hash) return Promise.resolve();
  return new Promise(res => {
    const done = () => { window.removeEventListener("hashchange", done); setTimeout(res, 0); };
    window.addEventListener("hashchange", done);
    location.hash = hash;
  });
}
window.addEventListener("hashchange", () => { closeAllModals(); window.scrollTo(0, 0); render(); });

// ---------- Contexte du groupe affiché ----------
const ctx = { key: null, gid: null, meta: undefined, group: null, members: [], gifts: [], membersLoaded: false, giftsLoaded: false, claims: new Map(), claimUnsubs: new Map(), unsubs: [], watching: false };

function resetCtx(gid) {
  ctx.unsubs.forEach(u => u());
  ctx.claimUnsubs.forEach(u => u());
  Object.assign(ctx, { key: `${S.uid}|${gid}`, gid, meta: undefined, group: null, members: [], gifts: [], membersLoaded: false, giftsLoaded: false, claims: new Map(), claimUnsubs: new Map(), unsubs: [], watching: false });
}
function ensureCtx(gid) {
  if (ctx.key !== `${S.uid}|${gid}`) resetCtx(gid);
}
function ensureMeta() {
  if (ctx.meta !== undefined || ctx.metaLoading) return;
  const gid = ctx.gid;
  ctx.metaLoading = true;
  D.fetchGroup(gid).then(m => { if (ctx.gid === gid) { ctx.meta = m; ctx.metaError = null; } })
    .catch(e => { if (ctx.gid === gid) { ctx.meta = null; ctx.metaError = D.friendlyError(e); } })
    .finally(() => { ctx.metaLoading = false; scheduleRender(); });
}
function ensureWatch() {
  if (ctx.watching) return;
  ctx.watching = true;
  const gid = ctx.gid;
  ctx.unsubs.push(D.watchGroup(gid, g => { ctx.group = g; scheduleRender(); }));
  ctx.unsubs.push(D.watchMembers(gid, l => { ctx.members = l; ctx.membersLoaded = true; scheduleRender(); }));
  ctx.unsubs.push(D.watchGroupGifts(gid, l => { ctx.gifts = l; ctx.giftsLoaded = true; syncClaimWatchers(); scheduleRender(); }));
}
function syncClaimWatchers() {
  const needed = new Set(ctx.gifts.filter(g => g.ownerUid !== S.uid).map(g => g.id));
  for (const [id, u] of ctx.claimUnsubs) if (!needed.has(id)) { u(); ctx.claimUnsubs.delete(id); ctx.claims.delete(id); }
  for (const id of needed) if (!ctx.claimUnsubs.has(id)) {
    ctx.claimUnsubs.set(id, D.watchClaim(id, c => { if (c) ctx.claims.set(id, c); else ctx.claims.delete(id); scheduleRender(); }));
  }
}
function groupName() {
  return (ctx.group && ctx.group.name) || (S.memberships.get(ctx.gid) || {}).name || (ctx.meta && ctx.meta.name) || "Groupe";
}

// ---------- Rendu ----------
let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  // requestAnimationFrame est suspendu dans un onglet caché : setTimeout prend le relais
  const go = () => { if (!renderQueued) return; renderQueued = false; render(); };
  requestAnimationFrame(go);
  setTimeout(go, 60);
}
D.subscribe(scheduleRender);

function render() {
  const r = parseRoute();
  if (!D.configured) return paint(viewNotConfigured());
  if (!S.ready) return paint(viewLoading());
  if (!S.uid) return paint(r.gid ? viewInviteSignedOut(r.gid) : viewWelcome());
  if (!S.loaded.profile || !S.loaded.memberships) return paint(viewLoading());
  if (!S.profile) return paint(viewMissingProfile());
  if (!r.gid) { ensureCtx(null); return paint(viewHome()); }

  ensureCtx(r.gid);
  if (!S.memberships.has(r.gid)) {
    ensureMeta();
    if (ctx.meta === undefined) return paint(viewLoading());
    if (ctx.meta === null) return paint(viewInvalidGroup());
    return paint(viewJoin());
  }
  ensureWatch();
  if (!r.page) { location.replace(`#/g/${r.gid}/listes`); return; }
  paint(viewShell(r.page));
}

function paint(html) {
  $app.innerHTML = html;
}

// ---------- Écrans d'accueil ----------
function snowLayer(n = 14) {
  let s = '<div class="snow" aria-hidden="true">';
  for (let i = 0; i < n; i++) {
    const left = (i * 73) % 100, delay = (i * 1.7) % 9, dur = 9 + (i * 2.3) % 8, size = 8 + (i * 5) % 9;
    s += `<span style="left:${left}%;animation-delay:-${delay}s;animation-duration:${dur}s;width:${size}px;height:${size}px">${FLAKE}</span>`;
  }
  return s + "</div>";
}
function brand(small = false) {
  return `<a class="brand ${small ? "small" : ""}" href="#/">${STAR}<span>My Wish List</span></a>`;
}
function heroFrame(inner) {
  return `<div class="hero-page">
    <div class="hero-bg">${snowLayer(18)}<div class="garland"></div></div>
    <div class="hero-inner">${inner}</div>
    <footer class="foot">My Wish List · listes de cadeaux en famille</footer>
  </div>`;
}
function viewLoading() {
  return `<div class="boot"><div class="boot-star"></div><p>Chargement…</p></div>`;
}
function viewNotConfigured() {
  return heroFrame(`${brand()}<div class="panel">
    <h1>Presque prêt</h1>
    <p>Le site n'est pas encore relié à sa base de données. Ouvrez le fichier <code>js/firebase-config.js</code> et collez-y la configuration de votre projet Firebase (voir le guide <code>LISEZMOI</code>).</p>
  </div>`);
}
function localProfilesHtml(action) {
  const list = D.localProfiles();
  if (!list.length) return "";
  return `<div class="who-list">
    <p class="label">Profils enregistrés sur cet appareil</p>
    ${list.map(p => `<button class="who" data-action="${action}" data-uid="${esc(p.uid)}">
      <span class="who-initial">${esc((p.name || "?").trim().charAt(0).toUpperCase())}</span>
      <span class="who-name">${esc(p.name)}</span>${icon("chevron", "rot")}</button>`).join("")}
  </div>`;
}
function newProfileForm(submitLabel) {
  return `<form class="stack" data-form="new-profile">
    <label class="field"><span>Votre prénom ou pseudonyme</span>
      <input name="name" maxlength="40" autocomplete="given-name" placeholder="ex. Camille" required></label>
    <button class="btn primary lg" type="submit">${esc(submitLabel)}</button>
  </form>`;
}
function viewWelcome() {
  return heroFrame(`${brand()}
    <h1 class="hero-title">Les listes de Noël de toute la famille, <em>au même endroit.</em></h1>
    <p class="hero-sub">Chacun partage ses envies, les autres réservent discrètement. Fini les cadeaux en double, et la surprise reste entière.</p>
    <div class="panel">
      ${localProfilesHtml("use-profile")}
      <h2>${D.localProfiles().length ? "Ou créer un nouveau profil" : "Pour commencer, créez votre profil"}</h2>
      ${newProfileForm("Créer mon profil")}
      <button class="link-btn" data-action="recover">${icon("key")} J'ai déjà un profil (code personnel)</button>
    </div>
    <ol class="steps">
      <li><b>1</b><span>Créez un groupe et envoyez son lien à la famille.</span></li>
      <li><b>2</b><span>Chacun ajoute ses idées de cadeaux et publie sa liste.</span></li>
      <li><b>3</b><span>Réservez ou cochez « acheté » : les autres le voient aussitôt.</span></li>
    </ol>`);
}
function viewInviteSignedOut(gid) {
  return heroFrame(`${brand()}
    <div class="panel">
      <p class="eyebrow">${icon("gift")} Invitation</p>
      <h1>Vous êtes invité à rejoindre un groupe</h1>
      <p class="muted">Choisissez qui vous êtes pour rejoindre le groupe et voir les listes.</p>
      ${localProfilesHtml("use-profile-join")}
      <h2>${D.localProfiles().length ? "Ou je suis quelqu'un d'autre" : "Créez votre profil"}</h2>
      ${newProfileForm("Créer mon profil et rejoindre")}
      <button class="link-btn" data-action="recover">${icon("key")} J'ai déjà un profil (code personnel)</button>
    </div>`);
}
function viewMissingProfile() {
  return heroFrame(`${brand()}<div class="panel">
    <h1>Complétez votre profil</h1>
    <form class="stack" data-form="rename-missing">
      <label class="field"><span>Votre prénom ou pseudonyme</span><input name="name" maxlength="40" required></label>
      <button class="btn primary lg">Continuer</button>
    </form>
    <button class="link-btn" data-action="profiles">Changer de profil</button>
  </div>`);
}
function viewInvalidGroup() {
  return heroFrame(`${brand()}<div class="panel">
    <h1>Lien introuvable</h1>
    <p class="muted">${esc(ctx.metaError || "Ce lien de groupe n'existe pas ou a été mal copié. Demandez à la personne qui vous l'a envoyé de le partager à nouveau.")}</p>
    <a class="btn primary" href="#/">Retour à l'accueil</a>
  </div>`);
}
function viewJoin() {
  const others = D.localProfiles().filter(p => p.uid !== S.uid);
  return heroFrame(`${brand()}<div class="panel">
    <p class="eyebrow">${icon("gift")} Invitation</p>
    <h1>Rejoindre <em>${esc(ctx.meta.name)}</em></h1>
    <p class="muted">Vous allez rejoindre ce groupe avec le profil :</p>
    <button class="btn primary lg block" data-action="join">Rejoindre en tant que ${esc(S.profile.name)}</button>
    <div class="sep"><span>Ce n'est pas vous ?</span></div>
    ${others.length ? `<div class="who-list">${others.map(p => `<button class="who" data-action="use-profile-join" data-uid="${esc(p.uid)}">
      <span class="who-initial">${esc(p.name.charAt(0).toUpperCase())}</span><span class="who-name">${esc(p.name)}</span>${icon("chevron", "rot")}</button>`).join("")}</div>` : ""}
    <div class="row wrap center">
      <button class="btn ghost" data-action="new-profile">${icon("plus")} Nouveau profil</button>
      <button class="btn ghost" data-action="recover">${icon("key")} J'ai un code</button>
    </div>
  </div>`);
}

function viewHome() {
  const groups = [...S.memberships.entries()].sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0));
  return `${topbar(null)}
  <main class="wrap home">
    <section class="page-head">
      <p class="eyebrow">${STAR} Bonjour ${esc(S.profile.name)}</p>
      <h1>Vos groupes</h1>
      <p class="muted">Chaque groupe a son propre lien. Votre liste de cadeaux est la même dans tous vos groupes : un cadeau acheté dans une famille apparaît comme déjà offert dans les autres.</p>
    </section>
    <div class="group-grid">
      ${groups.map(([gid, m]) => `<a class="group-card" href="#/g/${esc(gid)}/listes">
        <span class="gc-ribbon"></span>
        <span class="gc-name">${esc(m.name)}</span>
        <span class="gc-meta">${m.published ? `${icon("check")} Liste publiée` : "Liste pas encore publiée"}</span>
      </a>`).join("")}
      <button class="group-card add" data-action="create-group">
        <span class="plus-circle">${icon("plus")}</span>
        <span class="gc-name">Créer un groupe</span>
        <span class="gc-meta">Une famille, des amis…</span>
      </button>
    </div>
    ${groups.length ? "" : `<p class="hint">Vous avez reçu un lien d'invitation ? Ouvrez-le simplement : il vous amènera dans le bon groupe.</p>`}
  </main>`;
}

// ---------- En-tête et onglets ----------
function topbar(gid) {
  const groups = [...S.memberships.entries()];
  return `<header class="topbar">
    <div class="topbar-in">
      ${brand(true)}
      ${gid ? `<button class="group-switch" data-action="groups-menu" title="Changer de groupe">
        <span>${esc(groupName())}</span>${icon("chevron")}</button>` : (groups.length ? "" : "")}
      <div class="topbar-right">
        ${gid ? `<button class="btn gold sm" data-action="invite">${icon("share")}<span class="hide-xs">Inviter</span></button>` : ""}
        <button class="profile-chip" data-action="profiles" title="Changer de profil">
          <span class="who-initial sm">${esc(S.profile.name.charAt(0).toUpperCase())}</span>
          <span class="pc-name">${esc(S.profile.name)}</span>${icon("chevron")}
        </button>
      </div>
    </div>
    <div class="garland thin"></div>
  </header>`;
}
const TABS = [
  ["ma-liste", "Ma liste", "gift"],
  ["listes", "Les listes", "users"],
  ["mes-actions", "Mes réservations et achats", "bag", "Réservations"]
];
function tabs(page) {
  const nRes = [...S.actions.values()].length;
  return `<nav class="tabs" aria-label="Pages">
    ${TABS.map(([id, label, ic, short]) => `<a class="tab ${page === id ? "on" : ""}" href="#/g/${esc(ctx.gid)}/${id}">
      ${icon(ic)}<span class="${short ? "long" : ""}">${label}</span>${short ? `<span class="short">${short}</span>` : ""}${id === "mes-actions" && nRes ? `<em class="count">${nRes}</em>` : ""}</a>`).join("")}
  </nav>`;
}
function viewShell(page) {
  const body = page === "ma-liste" ? pageMyList() : page === "listes" ? pageLists() : pageActions();
  return `${topbar(ctx.gid)}${tabs(page)}<main class="wrap">${body}</main>`;
}

// ---------- Page 1 : Ma liste ----------
function pageMyList() {
  const gid = ctx.gid;
  const m = S.memberships.get(gid) || {};
  const gifts = [...S.myGifts.values()].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const visibleHere = gifts.filter(g => !(g.hiddenIn || []).includes(gid));
  const multi = S.memberships.size > 1;
  const pub = m.published
    ? `<div class="pub-banner on">
        <div class="pub-icon">${icon("check")}</div>
        <div class="pub-text"><b>Liste publiée dans ${esc(groupName())}</b>
        <span>${plural(visibleHere.length, "cadeau visible", "cadeaux visibles")}. Vos modifications sont partagées automatiquement.</span></div>
        <button class="btn ghost sm" data-action="unpublish">Retirer</button>
      </div>`
    : `<div class="pub-banner">
        <div class="pub-icon">${icon("eyeoff")}</div>
        <div class="pub-text"><b>Votre liste n'est pas encore visible</b>
        <span>Ajoutez vos idées, puis publiez-la pour que les membres de ${esc(groupName())} puissent la voir.</span></div>
        <button class="btn primary" data-action="publish" ${gifts.length ? "" : "disabled"}>Publier ma liste</button>
      </div>`;
  return `<section class="page-head">
      <p class="eyebrow">${STAR} Page 1</p>
      <h1>Ma liste de cadeaux</h1>
      <p class="muted">${multi ? "Cette liste est commune à tous vos groupes. Vous pouvez masquer un cadeau dans un groupe en le modifiant." : "Ajoutez autant d'idées que vous voulez. Tout est enregistré automatiquement."}</p>
    </section>
    ${pub}
    <div class="card-grid">
      ${gifts.map(g => myGiftCard(g, gid, multi)).join("")}
      <button class="gift-card add" data-action="add-gift">
        <span class="plus-circle">${icon("plus")}</span>
        <span class="add-label">Ajouter un cadeau</span>
      </button>
    </div>`;
}
function giftVisual(g) {
  if (g.imageUrl) return `<div class="gv has-img"><img src="${esc(g.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.remove('has-img');this.remove()"><span class="gv-icon">${icon("gift")}</span></div>`;
  return `<div class="gv"><span class="gv-icon">${icon("gift")}</span></div>`;
}
function myGiftCard(g, gid, multi) {
  const hidden = (g.hiddenIn || []).includes(gid);
  const otherGroups = multi ? [...S.memberships.entries()].filter(([id]) => !(g.hiddenIn || []).includes(id)).map(([, m]) => m.name) : [];
  return `<article class="gift-card ${hueClass(g.id)} ${hidden ? "dim" : ""}" data-action="edit-gift" data-id="${esc(g.id)}" tabindex="0" role="button" aria-label="Modifier ${esc(g.title)}">
    ${giftVisual(g)}
    <div class="gc-body">
      <h3>${esc(g.title)}</h3>
      ${g.description ? `<p class="desc">${esc(g.description)}</p>` : ""}
      <div class="gc-foot">
        ${g.price ? `<span class="price">${esc(g.price)}</span>` : ""}
        ${g.url ? `<span class="tagline">${icon("link")} lien</span>` : ""}
        ${hidden ? `<span class="badge muted">${icon("eyeoff")} masqué ici</span>` : ""}
      </div>
      ${multi && !hidden ? `<p class="groups-line">Visible : ${otherGroups.map(esc).join(", ")}</p>` : ""}
    </div>
    <div class="gc-tools">
      <button class="icon-btn" data-action="edit-gift" data-id="${esc(g.id)}" title="Modifier">${icon("edit")}</button>
      <button class="icon-btn danger" data-action="delete-gift" data-id="${esc(g.id)}" title="Supprimer">${icon("trash")}</button>
    </div>
  </article>`;
}

// ---------- Page 2 : Les listes ----------
const openGiven = new Set();
document.addEventListener("toggle", e => {
  const d = e.target;
  if (d.matches && d.matches("details.given")) d.open ? openGiven.add(d.dataset.uid) : openGiven.delete(d.dataset.uid);
}, true);
function claimInfo(g) {
  const c = ctx.claims.get(g.id);
  if (!c) return { state: "free" };
  const mine = c.byUid === S.uid;
  const sameGroup = c.groupId === ctx.gid;
  return { state: c.status, mine, by: mine ? "vous" : (sameGroup ? c.byName : null), c };
}
function pageLists() {
  if (!ctx.membersLoaded || !ctx.giftsLoaded) return `<div class="loading-block"><div class="boot-star"></div></div>`;
  const others = ctx.members.filter(m => m.uid !== S.uid).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const me = S.memberships.get(ctx.gid) || {};
  const nameCount = {};
  ctx.members.forEach(m => { nameCount[m.name] = (nameCount[m.name] || 0) + 1; });

  const header = `<section class="page-head">
      <p class="eyebrow">${STAR} Page 2 · ${esc(groupName())}</p>
      <h1>Les listes du groupe</h1>
      <p class="muted">Touchez un cadeau pour le réserver ou indiquer que vous l'avez acheté. La personne concernée ne voit jamais qui a réservé ou acheté ses cadeaux.</p>
    </section>`;

  if (!others.length) {
    return `${header}<div class="empty">
      <div class="empty-art">${icon("users")}</div>
      <h2>Vous êtes seul pour l'instant</h2>
      <p>Envoyez le lien du groupe à votre famille : leurs listes apparaîtront ici dès qu'ils les publieront.</p>
      <button class="btn gold" data-action="invite">${icon("share")} Inviter des membres</button>
    </div>`;
  }

  const jump = `<div class="people-nav">${others.map(m => `<a href="#" data-action="jump" data-uid="${esc(m.uid)}" class="person-pill ${m.published ? "" : "off"}">${esc(m.name)}</a>`).join("")}</div>`;

  const sections = others.map(m => {
    const dup = nameCount[m.name] > 1 ? ` <small class="dup">(${new Date(m.joinedAt || 0).toLocaleDateString("fr-FR")})</small>` : "";
    if (!m.published) {
      return `<section class="person" id="p-${esc(m.uid)}">
        <header class="person-head"><h2>${esc(m.name)}${dup}</h2></header>
        <div class="person-empty">${esc(m.name)} n'a pas encore publié sa liste.</div>
      </section>`;
    }
    const gifts = ctx.gifts.filter(g => g.ownerUid === m.uid).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    const shown = [], given = [];
    gifts.forEach(g => { const ci = claimInfo(g); (ci.state === "bought" ? given : shown).push([g, ci]); });
    const reserved = shown.filter(([, ci]) => ci.state === "reserved").length;
    return `<section class="person" id="p-${esc(m.uid)}">
      <header class="person-head">
        <h2>${esc(m.name)}${dup}</h2>
        <span class="person-meta">${plural(shown.length - reserved, "idée disponible", "idées disponibles")}${reserved ? ` · ${reserved} réservé${reserved > 1 ? "s" : ""}` : ""}</span>
      </header>
      ${shown.length ? `<div class="card-grid">${shown.map(([g, ci]) => otherGiftCard(g, ci)).join("")}</div>`
        : `<div class="person-empty">${gifts.length ? "Tous ses cadeaux ont déjà été offerts." : "Sa liste est vide pour le moment."}</div>`}
      ${given.length ? `<details class="given" data-uid="${esc(m.uid)}" ${openGiven.has(m.uid) ? "open" : ""}><summary>${plural(given.length, "cadeau déjà offert", "cadeaux déjà offerts")}</summary>
        <ul>${given.map(([g, ci]) => `<li><span>${esc(g.title)}</span><em>${ci.mine ? "acheté par vous" : ci.by ? `offert par ${esc(ci.by)}` : "déjà offert"}</em></li>`).join("")}</ul></details>` : ""}
    </section>`;
  }).join("");

  const meNote = me.published ? "" : `<a class="notice" href="#/g/${esc(ctx.gid)}/ma-liste">${icon("eyeoff")} Votre propre liste n'est pas encore publiée dans ce groupe. <b>La compléter</b></a>`;
  return header + meNote + jump + sections;
}
function otherGiftCard(g, ci) {
  let badge = "";
  if (ci.state === "reserved") badge = ci.mine ? `<span class="badge mine">${icon("bookmark")} Réservé par vous</span>` : `<span class="badge res">${icon("bookmark")} Réservé${ci.by ? ` par ${esc(ci.by)}` : ""}</span>`;
  return `<article class="gift-card ${hueClass(g.id)} ${ci.state === "reserved" && !ci.mine ? "taken" : ""}" data-action="open-gift" data-id="${esc(g.id)}" tabindex="0" role="button">
    ${giftVisual(g)}
    ${badge ? `<div class="gc-status">${badge}</div>` : ""}
    <div class="gc-body">
      <h3>${esc(g.title)}</h3>
      ${g.description ? `<p class="desc">${esc(g.description)}</p>` : ""}
      <div class="gc-foot">
        ${g.price ? `<span class="price">${esc(g.price)}</span>` : ""}
        ${g.url ? `<span class="tagline">${icon("link")} lien</span>` : ""}
        ${ci.state === "free" ? `<span class="cta">Réserver ›</span>` : ""}
      </div>
    </div>
  </article>`;
}

// ---------- Page 3 : Mes réservations et achats ----------
function pageActions() {
  const all = [...S.actions.values()].sort((a, b) => (b.at || 0) - (a.at || 0));
  const res = all.filter(a => a.status === "reserved");
  const bought = all.filter(a => a.status === "bought");
  const total = bought.reduce((s, a) => s + parsePrice(a.giftPrice), 0);
  const item = (a, kind) => `<article class="action-card ${hueClass(a.giftId)}">
    <div class="ac-mark">${icon(kind === "res" ? "bookmark" : "check")}</div>
    <div class="ac-body">
      <h3>${esc(a.giftTitle)}</h3>
      <p class="ac-for">Pour <b>${esc(a.recipientName)}</b> · ${esc((S.memberships.get(a.groupId) || {}).name || a.groupName)}</p>
      <div class="ac-meta">${a.giftPrice ? `<span class="price">${esc(a.giftPrice)}</span>` : ""}
        ${a.giftUrl ? `<a class="tagline" href="${esc(a.giftUrl)}" target="_blank" rel="noopener noreferrer">${icon("link")} voir le produit</a>` : ""}</div>
    </div>
    <div class="ac-tools">
      ${kind === "res"
        ? `<button class="btn primary sm" data-action="act-buy" data-id="${esc(a.giftId)}">${icon("check")} Je l'ai acheté</button>
           <button class="btn ghost sm" data-action="act-cancel" data-id="${esc(a.giftId)}">Annuler la réservation</button>`
        : `<button class="link-btn sm" data-action="act-unbuy" data-id="${esc(a.giftId)}">Annuler l'achat</button>`}
    </div>
  </article>`;
  return `<section class="page-head">
      <p class="eyebrow">${STAR} Page 3</p>
      <h1>Mes réservations et mes achats</h1>
      <p class="muted">Tous vos groupes réunis. Cette page se met à jour toute seule.</p>
    </section>
    <div class="stats">
      <div class="stat"><b>${res.length}</b><span>réservation${res.length > 1 ? "s" : ""}</span></div>
      <div class="stat"><b>${bought.length}</b><span>achat${bought.length > 1 ? "s" : ""}</span></div>
      <div class="stat"><b>${total ? formatEuros(total) : "–"}</b><span>dépensé (estimé)</span></div>
    </div>
    <section class="act-section">
      <h2>${icon("bookmark")} Mes réservations</h2>
      ${res.length ? `<div class="action-list">${res.map(a => item(a, "res")).join("")}</div>`
        : `<div class="person-empty">Aucune réservation. Réservez un cadeau depuis <a href="#/g/${esc(ctx.gid)}/listes">les listes</a> pour que les autres sachent que vous vous en occupez.</div>`}
    </section>
    <section class="act-section">
      <h2>${icon("bag")} Mes achats</h2>
      ${bought.length ? `<div class="action-list">${bought.map(a => item(a, "buy")).join("")}</div>`
        : `<div class="person-empty">Aucun achat enregistré pour l'instant.</div>`}
    </section>`;
}

// ---------- Fenêtres (modales) ----------
const openModals = [];
function openModal({ title, body, wide = false, onMount }) {
  const root = document.createElement("div");
  root.className = "modal-root";
  root.innerHTML = `<div class="modal-backdrop" data-close></div>
    <div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Fermer">${icon("x")}</button></div>
      <div class="modal-body">${body}</div>
    </div>`;
  document.body.appendChild(root);
  document.body.classList.add("noscroll");
  const close = () => {
    const i = openModals.indexOf(close); if (i >= 0) openModals.splice(i, 1);
    root.classList.remove("show");
    setTimeout(() => root.remove(), 200);
    if (!openModals.length) document.body.classList.remove("noscroll");
  };
  root.addEventListener("click", e => { if (e.target.closest("[data-close]")) close(); });
  openModals.push(close);
  requestAnimationFrame(() => root.classList.add("show"));
  const first = root.querySelector("input:not([type=checkbox]),textarea");
  if (first && matchMedia("(pointer:fine)").matches) setTimeout(() => first.focus(), 60);
  onMount && onMount(root, close);
  return close;
}
function closeAllModals() { [...openModals].forEach(c => c()); }
document.addEventListener("keydown", e => { if (e.key === "Escape" && openModals.length) openModals[openModals.length - 1](); });

function confirmBox(title, text, okLabel = "Confirmer", danger = false) {
  return new Promise(resolve => {
    let done = false;
    const close = openModal({
      title, body: `<p class="muted">${text}</p><div class="modal-actions">
        <button class="btn ghost" data-no>Annuler</button>
        <button class="btn ${danger ? "danger" : "primary"}" data-yes>${esc(okLabel)}</button></div>`,
      onMount(root, close) {
        root.querySelector("[data-yes]").onclick = () => { done = true; close(); resolve(true); };
        root.querySelector("[data-no]").onclick = () => { close(); };
        const obs = new MutationObserver(() => { if (!document.body.contains(root)) { obs.disconnect(); if (!done) resolve(false); } });
        obs.observe(document.body, { childList: true });
      }
    });
  });
}

function showCode(code, intro) {
  openModal({
    title: "Votre code personnel",
    body: `<p class="muted">${intro || "Ce code permet de retrouver votre profil et votre liste sur un autre appareil (téléphone, ordinateur…)."}</p>
      <div class="code-box"><code>${esc(code)}</code><button class="btn ghost sm" data-copy>${icon("copy")} Copier</button></div>
      <p class="hint">Notez-le ou faites une capture d'écran. Ne le partagez pas : il donne accès à votre profil.</p>
      <div class="modal-actions"><button class="btn primary" data-close>C'est noté</button></div>`,
    onMount(root) {
      root.querySelector("[data-copy]").onclick = async () => { if (await copyText(code)) toast("Code copié"); };
    }
  });
}

function giftForm(g) {
  const groups = [...S.memberships.entries()];
  const hidden = new Set((g && g.hiddenIn) || []);
  return `<form class="stack" data-form="gift">
    <label class="field"><span>Le cadeau *</span><input name="title" maxlength="120" required value="${esc(g?.title)}" placeholder="ex. Couteau de cuisine japonais"></label>
    <div class="grid2">
      <label class="field"><span>Prix indicatif</span><input name="price" maxlength="30" value="${esc(g?.price)}" placeholder="ex. 45 €" inputmode="decimal"></label>
      <label class="field"><span>Lien vers le produit</span><input name="url" maxlength="600" value="${esc(g?.url)}" placeholder="https://…" inputmode="url"></label>
    </div>
    <label class="field"><span>Précisions</span><textarea name="description" maxlength="600" rows="3" placeholder="Taille, couleur, modèle, où le trouver…">${esc(g?.description)}</textarea></label>
    <label class="field"><span>Lien d'une image <small>(facultatif)</small></span><input name="imageUrl" maxlength="600" value="${esc(g?.imageUrl)}" placeholder="Adresse d'une photo du produit" inputmode="url"></label>
    ${groups.length > 1 ? `<fieldset class="field"><span>Visible dans</span><div class="checks">
      ${groups.map(([gid, m]) => `<label class="check"><input type="checkbox" name="grp" value="${esc(gid)}" ${hidden.has(gid) ? "" : "checked"}><span>${esc(m.name)}</span></label>`).join("")}
    </div></fieldset>` : ""}
    <div class="modal-actions">
      ${g ? `<button type="button" class="btn ghost danger-text" data-del>${icon("trash")} Supprimer</button><span class="grow"></span>` : ""}
      <button type="button" class="btn ghost" data-close>Annuler</button>
      <button type="submit" class="btn primary">${g ? "Enregistrer" : "Ajouter à ma liste"}</button>
    </div>
  </form>`;
}
function openGiftEditor(giftId) {
  const g = giftId ? S.myGifts.get(giftId) : null;
  if (giftId && !g) return;
  openModal({
    title: g ? "Modifier le cadeau" : "Nouveau cadeau", body: giftForm(g), wide: true,
    onMount(root, close) {
      const form = root.querySelector("form");
      form.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const checked = new Set(fd.getAll("grp"));
        const hiddenIn = S.memberships.size > 1 ? [...S.memberships.keys()].filter(id => !checked.has(id)) : [];
        const btn = form.querySelector("[type=submit]");
        await quiet(run(btn, async () => {
          await D.saveGift({ title: fd.get("title"), price: fd.get("price"), url: fd.get("url"), description: fd.get("description"), imageUrl: fd.get("imageUrl"), hiddenIn }, giftId);
          close();
        }, g ? "Cadeau modifié" : "Cadeau ajouté"));
      };
      const del = root.querySelector("[data-del]");
      if (del) del.onclick = async () => { close(); await askDeleteGift(giftId); };
    }
  });
}
async function askDeleteGift(id) {
  const g = S.myGifts.get(id); if (!g) return;
  if (await confirmBox("Supprimer ce cadeau ?", `« ${esc(g.title)} » sera retiré de votre liste dans tous vos groupes.`, "Supprimer", true))
    await quiet(run(null, () => D.deleteGift(id), "Cadeau supprimé"));
}

function openGiftSheet(id) {
  const g = ctx.gifts.find(x => x.id === id);
  if (!g) return;
  const ci = claimInfo(g);
  const first = g.ownerName;
  let status = "", actions = "";
  if (ci.state === "free") {
    status = `<p class="sheet-status free">${icon("gift")} Disponible</p>`;
    actions = `<button class="btn ghost lg" data-do="reserved">${icon("bookmark")} Réserver</button>
      <button class="btn primary lg" data-do="bought">${icon("check")} Je l'ai acheté</button>`;
  } else if (ci.state === "reserved" && ci.mine) {
    status = `<p class="sheet-status mine">${icon("bookmark")} Vous avez réservé ce cadeau</p>`;
    actions = `<button class="btn ghost lg" data-do="release">Annuler ma réservation</button>
      <button class="btn primary lg" data-do="bought">${icon("check")} Je l'ai acheté</button>`;
  } else if (ci.state === "reserved") {
    status = `<p class="sheet-status res">${icon("bookmark")} Réservé${ci.by ? ` par ${esc(ci.by)}` : " par un autre membre"} : quelqu'un s'en occupe.</p>`;
  } else if (ci.mine) {
    status = `<p class="sheet-status mine">${icon("check")} Vous avez acheté ce cadeau</p>`;
    actions = `<button class="btn ghost" data-do="release">Annuler l'achat</button>`;
  } else {
    status = `<p class="sheet-status res">${icon("check")} Déjà offert</p>`;
  }
  openModal({
    title: `Pour ${first}`, wide: true,
    body: `<div class="sheet ${hueClass(g.id)}">
      ${giftVisual(g)}
      <div class="sheet-body">
        <h3>${esc(g.title)}</h3>
        ${g.price ? `<p class="price lg">${esc(g.price)}</p>` : ""}
        ${g.description ? `<p class="sheet-desc">${esc(g.description)}</p>` : ""}
        ${g.url ? `<a class="btn ghost sm" href="${esc(g.url)}" target="_blank" rel="noopener noreferrer">${icon("link")} Voir le produit</a>` : ""}
        ${status}
      </div>
    </div>
    ${actions ? `<div class="modal-actions sheet-actions">${actions}</div>` : ""}
    ${ci.state === "free" ? `<p class="hint center">« Réserver » prévient les autres que vous vous en occupez. « Acheté » le retire de la liste des autres. ${esc(first)} ne verra rien.</p>` : ""}`,
    onMount(root, close) {
      root.querySelectorAll("[data-do]").forEach(b => b.onclick = async () => {
        const what = b.dataset.do;
        await quiet(run(b, async () => {
          if (what === "release") await D.releaseClaim(g.id);
          else await D.claimGift(ctx.gid, groupName(), g, what);
          close();
        }, what === "reserved" ? "Cadeau réservé" : what === "bought" ? "Achat enregistré" : "Annulé, le cadeau est de nouveau disponible"));
      });
    }
  });
}

function openProfiles() {
  const list = D.localProfiles();
  const code = D.myCode();
  openModal({
    title: "Profils",
    body: `<p class="label">Profil actif</p>
      <div class="active-profile">
        <span class="who-initial">${esc((S.profile?.name || "?").charAt(0).toUpperCase())}</span>
        <div><b>${esc(S.profile?.name || "")}</b><small>Connecté sur cet appareil</small></div>
      </div>
      <div class="row wrap">
        <button class="btn ghost sm" data-p="rename">${icon("edit")} Renommer</button>
        ${code ? `<button class="btn ghost sm" data-p="code">${icon("key")} Mon code personnel</button>` : ""}
      </div>
      ${list.filter(p => p.uid !== S.uid).length ? `<p class="label">Changer de profil</p><div class="who-list">
        ${list.filter(p => p.uid !== S.uid).map(p => `<div class="who-row"><button class="who" data-p="switch" data-uid="${esc(p.uid)}">
          <span class="who-initial">${esc(p.name.charAt(0).toUpperCase())}</span><span class="who-name">${esc(p.name)}</span>${icon("chevron", "rot")}</button>
          <button class="icon-btn" data-p="forget" data-uid="${esc(p.uid)}" title="Retirer de cet appareil">${icon("x")}</button></div>`).join("")}
      </div>` : ""}
      <div class="modal-actions left">
        <button class="btn primary sm" data-p="new">${icon("plus")} Nouveau profil</button>
        <button class="btn ghost sm" data-p="recover">${icon("key")} J'ai un code</button>
        <span class="grow"></span>
        <button class="link-btn sm" data-p="logout">Se déconnecter</button>
      </div>
      <p class="hint">Plusieurs personnes peuvent utiliser le même appareil : chaque profil garde sa propre liste. Rien n'est jamais remplacé en ouvrant un lien.</p>`,
    onMount(root, close) {
      root.querySelectorAll("[data-p]").forEach(b => b.onclick = async () => {
        const a = b.dataset.p, uid = b.dataset.uid;
        if (a === "switch") { await quiet(run(b, async () => { await D.switchProfile(uid); close(); }, "Profil changé")); }
        if (a === "forget") {
          const p = list.find(x => x.uid === uid);
          close();
          if (await confirmBox("Retirer ce profil de l'appareil ?", `Le profil « ${esc(p.name)} » et sa liste restent enregistrés en ligne. Pour le retrouver plus tard, il faudra son code personnel :<br><code>${esc(p.code)}</code>`, "Retirer", true)) {
            D.forgetProfile(uid); toast("Profil retiré de cet appareil");
          }
        }
        if (a === "new") { close(); openNewProfile(); }
        if (a === "recover") { close(); openRecover(); }
        if (a === "code") { close(); showCode(code); }
        if (a === "rename") { close(); openRename(); }
        if (a === "logout") { close(); await quiet(run(null, () => D.logout())); }
      });
    }
  });
}
function openNewProfile(afterJoinGid) {
  openModal({
    title: "Nouveau profil",
    body: `<p class="muted">Pour une autre personne qui utilise cet appareil. Les profils existants sont conservés.</p>${newProfileForm("Créer le profil")}`,
    onMount(root, close) {
      root.querySelector("form").onsubmit = async (e) => {
        e.preventDefault();
        const name = new FormData(e.target).get("name");
        await quiet(run(e.target.querySelector("button"), async () => {
          const p = await D.createProfile(name);
          close();
          if (afterJoinGid) await autoJoin(afterJoinGid);
          showCode(p.code, `Profil « ${p.name} » créé. Ce code permet de le retrouver sur un autre appareil.`);
        }));
      };
    }
  });
}
function openRecover() {
  openModal({
    title: "Retrouver mon profil",
    body: `<p class="muted">Saisissez le code personnel reçu à la création de votre profil.</p>
      <form class="stack" data-form="recover">
        <label class="field"><span>Code personnel</span><input name="code" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="K7P2Q9-SAPIN-ETOILE-4827" required></label>
        <button class="btn primary lg">Retrouver mon profil</button>
      </form>
      <p class="hint">Vous trouverez ce code dans le menu « Profils » sur l'appareil où vous avez créé votre profil.</p>`,
    onMount(root, close) {
      root.querySelector("form").onsubmit = async (e) => {
        e.preventDefault();
        const code = new FormData(e.target).get("code");
        await quiet(run(e.target.querySelector("button"), async () => {
          const p = await D.recoverProfile(code);
          close();
          const gid = parseRoute().gid;
          if (gid) await autoJoin(gid);
          toast(`Bon retour, ${p.name} !`);
        }));
      };
    }
  });
}
function openRename() {
  openModal({
    title: "Renommer mon profil",
    body: `<form class="stack"><label class="field"><span>Prénom ou pseudonyme</span><input name="name" maxlength="40" value="${esc(S.profile?.name)}" required></label>
      <div class="modal-actions"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn primary">Enregistrer</button></div></form>`,
    onMount(root, close) {
      root.querySelector("form").onsubmit = async (e) => {
        e.preventDefault();
        await quiet(run(e.target.querySelector(".primary"), async () => { await D.renameProfile(new FormData(e.target).get("name")); close(); }, "Profil renommé"));
      };
    }
  });
}
function openCreateGroup() {
  openModal({
    title: "Créer un groupe",
    body: `<p class="muted">Un groupe = une famille ou un cercle d'amis, avec son propre lien d'invitation.</p>
      <form class="stack"><label class="field"><span>Nom du groupe</span><input name="name" maxlength="60" placeholder="ex. Famille Martin" required></label>
      <button class="btn primary lg">Créer le groupe</button></form>`,
    onMount(root, close) {
      root.querySelector("form").onsubmit = async (e) => {
        e.preventDefault();
        await quiet(run(e.target.querySelector("button"), async () => {
          const gid = await D.createGroup(new FormData(e.target).get("name"));
          close();
          await navigate(`#/g/${gid}/ma-liste`);
          openInvite(gid, true);
        }));
      };
    }
  });
}
function openInvite(gid = ctx.gid, fresh = false) {
  const url = shareUrl(gid);
  const name = (S.memberships.get(gid) || {}).name || groupName();
  openModal({
    title: fresh ? "Groupe créé !" : "Inviter dans le groupe",
    body: `<p class="muted">Envoyez ce lien aux membres de <b>${esc(name)}</b> (SMS, WhatsApp, e-mail…). Chacun pourra rejoindre le groupe et créer son profil.</p>
      <div class="code-box link"><code>${esc(url)}</code></div>
      <div class="modal-actions">
        ${navigator.share ? `<button class="btn ghost" data-share>${icon("share")} Partager</button>` : ""}
        <button class="btn primary" data-copy>${icon("copy")} Copier le lien</button>
      </div>
      <p class="hint">Ce lien est privé : il n'apparaît pas sur Google. Ne le publiez pas sur un réseau social.</p>`,
    onMount(root) {
      root.querySelector("[data-copy]").onclick = async () => { if (await copyText(url)) toast("Lien copié"); else toast("Copiez le lien manuellement", "error"); };
      const sh = root.querySelector("[data-share]");
      if (sh) sh.onclick = () => navigator.share({ title: `My Wish List – ${name}`, text: `Rejoins le groupe « ${name} » sur My Wish List pour partager nos listes de Noël :`, url }).catch(() => {});
    }
  });
}
function openGroupsMenu() {
  const groups = [...S.memberships.entries()];
  const isCreator = ctx.group && ctx.group.createdBy === S.uid;
  openModal({
    title: "Mes groupes",
    body: `<div class="who-list">${groups.map(([gid, m]) => `<a class="who ${gid === ctx.gid ? "current" : ""}" href="#/g/${esc(gid)}/listes">
        <span class="who-initial">${icon("users")}</span><span class="who-name">${esc(m.name)}</span>${gid === ctx.gid ? icon("check") : icon("chevron", "rot")}</a>`).join("")}</div>
      <div class="modal-actions left">
        <button class="btn primary sm" data-g="create">${icon("plus")} Créer un groupe</button>
        <a class="btn ghost sm" href="#/">${icon("home")} Accueil</a>
        <span class="grow"></span>
        ${isCreator ? `<button class="btn ghost sm" data-g="rename">${icon("edit")} Renommer</button>` : ""}
        <button class="link-btn sm danger-text" data-g="leave">Quitter ce groupe</button>
      </div>`,
    onMount(root, close) {
      root.querySelectorAll("[data-g]").forEach(b => b.onclick = async () => {
        const a = b.dataset.g;
        close();
        if (a === "create") openCreateGroup();
        if (a === "rename") openRenameGroup();
        if (a === "leave") {
          if (await confirmBox("Quitter ce groupe ?", `Votre liste ne sera plus visible dans « ${esc(groupName())} ». Vos réservations déjà faites sont conservées. Vous pourrez revenir avec le lien d'invitation.`, "Quitter", true)) {
            const gid = ctx.gid;
            await quiet(run(null, async () => { await D.leaveGroup(gid); go("#/"); }, "Vous avez quitté le groupe"));
          }
        }
      });
    }
  });
}
function openRenameGroup() {
  openModal({
    title: "Renommer le groupe",
    body: `<form class="stack"><label class="field"><span>Nom du groupe</span><input name="name" maxlength="60" value="${esc(groupName())}" required></label>
      <div class="modal-actions"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn primary">Enregistrer</button></div></form>`,
    onMount(root, close) {
      root.querySelector("form").onsubmit = async (e) => {
        e.preventDefault();
        await quiet(run(e.target.querySelector(".primary"), async () => { await D.renameGroup(ctx.gid, new FormData(e.target).get("name")); close(); }, "Groupe renommé"));
      };
    }
  });
}

async function autoJoin(gid) {
  // attend que les groupes du profil soient chargés
  for (let i = 0; i < 60 && !(S.uid && S.loaded.memberships); i++) await new Promise(r => setTimeout(r, 100));
  if (!S.uid || S.memberships.has(gid)) return;
  const meta = await D.fetchGroup(gid);
  if (!meta) throw new D.AppError("Ce lien de groupe est introuvable.");
  for (let i = 0; i < 30 && !S.loaded.profile; i++) await new Promise(r => setTimeout(r, 100));
  await D.joinGroup(gid, meta.name);
  toast(`Bienvenue dans ${meta.name} !`);
  await navigate(`#/g/${gid}/ma-liste`);
}

// ---------- Clics ----------
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el || el.closest(".modal-root")) return;
  const a = el.dataset.action, id = el.dataset.id, uid = el.dataset.uid;
  if (a !== "jump" && el.tagName === "A" && el.getAttribute("href") !== "#") return;
  e.preventDefault();
  if (a === "edit-gift" && e.target.closest('[data-action="delete-gift"]')) return;
  switch (a) {
    case "recover": return openRecover();
    case "profiles": return openProfiles();
    case "new-profile": return openNewProfile();
    case "create-group": return openCreateGroup();
    case "groups-menu": return openGroupsMenu();
    case "invite": return openInvite();
    case "add-gift": return openGiftEditor(null);
    case "edit-gift": return openGiftEditor(id);
    case "delete-gift": e.stopPropagation(); return askDeleteGift(id);
    case "open-gift": return openGiftSheet(id);
    case "use-profile": return quiet(run(el, () => D.switchProfile(uid)));
    case "use-profile-join": {
      const gid = parseRoute().gid;
      return quiet(run(el, async () => { await D.switchProfile(uid); await autoJoin(gid); }));
    }
    case "join": {
      const gid = ctx.gid;
      return quiet(run(el, async () => { await D.joinGroup(gid, ctx.meta.name); location.hash = `#/g/${gid}/ma-liste`; }, `Bienvenue dans ${ctx.meta.name} !`));
    }
    case "publish": return quiet(run(el, () => D.setPublished(ctx.gid, true), "Liste publiée ! Les membres du groupe peuvent la voir."));
    case "unpublish":
      if (await confirmBox("Retirer votre liste ?", `Votre liste ne sera plus visible dans « ${esc(groupName())} ». Vous pourrez la republier à tout moment.`, "Retirer"))
        await quiet(run(null, () => D.setPublished(ctx.gid, false), "Liste retirée du groupe"));
      return;
    case "jump": {
      const t = document.getElementById(`p-${uid}`);
      if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 130, behavior: "smooth" });
      return;
    }
    case "act-buy": {
      const act = S.actions.get(id); if (!act) return;
      return quiet(run(el, () => D.claimGift(act.groupId, act.groupName, actionGift(act), "bought"), "Achat enregistré"));
    }
    case "act-cancel": {
      const act = S.actions.get(id); if (!act) return;
      if (await confirmBox("Annuler la réservation ?", `« ${esc(act.giftTitle)} » redeviendra disponible pour les autres.`, "Annuler la réservation"))
        await quiet(run(null, () => D.releaseClaim(id), "Réservation annulée"));
      return;
    }
    case "act-unbuy": {
      const act = S.actions.get(id); if (!act) return;
      if (await confirmBox("Annuler l'achat ?", `« ${esc(act.giftTitle)} » réapparaîtra comme disponible dans la liste de ${esc(act.recipientName)}.`, "Annuler l'achat", true))
        await quiet(run(null, () => D.releaseClaim(id), "Achat annulé"));
      return;
    }
  }
});
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("article[data-action]")) { e.preventDefault(); e.target.click(); }
});
function actionGift(a) {
  return { id: a.giftId, ownerUid: a.recipientUid, ownerName: a.recipientName, title: a.giftTitle, price: a.giftPrice, url: a.giftUrl };
}

// Formulaires de la page (hors fenêtres)
document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (form.closest(".modal-root")) return;
  e.preventDefault();
  const kind = form.dataset.form;
  const btn = form.querySelector("button[type=submit], button:not([type])");
  if (kind === "new-profile") {
    const name = new FormData(form).get("name");
    const gid = parseRoute().gid;
    await quiet(run(btn, async () => {
      const p = await D.createProfile(name);
      if (gid) await autoJoin(gid);
      showCode(p.code, `Bienvenue ${p.name} ! Voici votre code personnel : il permet de retrouver votre profil et votre liste sur un autre appareil.`);
    }));
  }
  if (kind === "rename-missing") {
    await quiet(run(btn, () => D.renameProfile(new FormData(form).get("name"))));
  }
});

// ---------- Connexion internet ----------
function updateOnline() {
  let bar = document.getElementById("offline");
  if (navigator.onLine) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement("div"); bar.id = "offline";
    bar.innerHTML = `${icon("wifi")}<span>Hors connexion : vos modifications seront envoyées dès le retour du réseau.</span>`;
    document.body.appendChild(bar);
  }
}
window.addEventListener("online", () => { updateOnline(); toast("Connexion rétablie"); });
window.addEventListener("offline", updateOnline);
updateOnline();

// ---------- Démarrage ----------
if (D.configured) D.initAuth();
render();
