// ─────────────────────────────────────────────────────────────
//  DONNÉES — tout ce qui lit ou écrit dans la base Firebase.
//
//  Organisation de la base :
//   profiles/{uid}                    profil (prénom)
//   profiles/{uid}/gifts/{id}         la liste personnelle (unique, tous groupes)
//   profiles/{uid}/memberships/{gid}  les groupes dont je fais partie
//   profiles/{uid}/actions/{id}       mes réservations et achats
//   groups/{gid}                      un groupe (nom)
//   groups/{gid}/members/{uid}        les membres du groupe
//   groups/{gid}/gifts/{id}           copie publiée des cadeaux visibles dans ce groupe
//   claims/{id}                       réservation / achat d'un cadeau (commun à tous
//                                     les groupes : évite les doublons entre familles,
//                                     invisible pour le destinataire)
// ─────────────────────────────────────────────────────────────
import {
  auth, db, configured, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, doc, collection, getDoc, setDoc,
  onSnapshot, writeBatch, runTransaction
} from "./firebase-sdk.js";

export { configured };

export class AppError extends Error {}

// ---------- Profils mémorisés sur cet appareil ----------
const LOCAL_KEY = "mwl.profiles.v1";

export function localProfiles() {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(list) ? list.filter(p => p && p.uid && p.code) : [];
  } catch { return []; }
}
function saveLocalProfiles(list) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch {}
}
function rememberProfile(p) {
  const list = localProfiles().filter(x => x.uid !== p.uid);
  list.push({ uid: p.uid, name: p.name, code: p.code });
  saveLocalProfiles(list);
}
export function forgetProfile(uid) {
  saveLocalProfiles(localProfiles().filter(x => x.uid !== uid));
}
function updateLocalName(uid, name) {
  const list = localProfiles();
  const p = list.find(x => x.uid === uid);
  if (p && p.name !== name) { p.name = name; saveLocalProfiles(list); }
}

// ---------- Codes personnels ----------
const WORDS = ["SAPIN","ETOILE","HOUX","NEIGE","RENNE","LUTIN","BOUGIE","GIVRE","FLOCON","CADEAU",
  "RUBAN","GUI","BUCHE","CANNELLE","ORANGE","TRAINEAU","CLOCHE","MANTEAU","ECHARPE","CHOCOLAT",
  "PAPILLOTE","SOULIER","GUIRLANDE","BOULE","COMETE","AURORE","VELOURS","NOISETTE","MARRON","PAIN",
  "EPICE","CHAUSSON","LANTERNE","MOUFLE","BONNET","CHALET","FORET","HIVER","GLACE","LUGE",
  "SUCRE","MIEL","AMANDE","POMME","CERISE","PLUME","ANGE","ORGUE","CHORALE","VEILLEE",
  "CRECHE","BERGER","MOUTON","HIBOU","RENARD","OURS","CHOUETTE","PINSON","ROUGEGORGE","SOURIS",
  "TAMBOUR","FLUTE","VIOLON","TOUPIE"];
const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomInt(max) {
  const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % max;
}
function randomString(n, chars = ID_CHARS) {
  let s = ""; for (let i = 0; i < n; i++) s += chars[randomInt(chars.length)]; return s;
}
export function newId(n = 20) {
  return randomString(n, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
}
function generateCode() {
  const pick = () => WORDS[randomInt(WORDS.length)];
  return `${randomString(6)}-${pick()}-${pick()}-${String(randomInt(10000)).padStart(4, "0")}`;
}
export function normalizeCode(s) {
  return String(s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function codeToEmail(code) {
  return `p-${code.split("-")[0].toLowerCase()}@example.com`;
}

// ---------- État de la session (profil actif) ----------
const state = {
  ready: false,       // l'identification a répondu
  uid: null,
  profile: null,      // { name }
  memberships: new Map(), // gid -> { name, published, joinedAt }
  myGifts: new Map(),     // id -> gift
  actions: new Map(),     // id -> claim
  loaded: { profile: false, memberships: false, gifts: false, actions: false }
};
export const session = state;

const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }

let sessionUnsubs = [];
function stopSession() { sessionUnsubs.forEach(u => u()); sessionUnsubs = []; }

function startSession(uid) {
  stopSession();
  state.uid = uid;
  state.profile = null;
  state.memberships = new Map();
  state.myGifts = new Map();
  state.actions = new Map();
  state.loaded = { profile: false, memberships: false, gifts: false, actions: false };
  if (!uid) { emit(); return; }

  const onErr = (what) => (e) => { console.error(what, e); reportError(e); };

  sessionUnsubs.push(onSnapshot(doc(db, "profiles", uid), snap => {
    state.profile = snap.exists() ? snap.data() : null;
    state.loaded.profile = true;
    if (state.profile) updateLocalName(uid, state.profile.name);
    emit();
  }, onErr("profil")));

  sessionUnsubs.push(onSnapshot(collection(db, "profiles", uid, "memberships"), snap => {
    const m = new Map();
    snap.forEach(d => m.set(d.id, d.data()));
    state.memberships = m; state.loaded.memberships = true; emit();
  }, onErr("groupes")));

  sessionUnsubs.push(onSnapshot(collection(db, "profiles", uid, "gifts"), snap => {
    const m = new Map();
    snap.forEach(d => m.set(d.id, { id: d.id, ...d.data() }));
    state.myGifts = m; state.loaded.gifts = true; emit();
  }, onErr("liste")));

  sessionUnsubs.push(onSnapshot(collection(db, "profiles", uid, "actions"), snap => {
    const m = new Map();
    snap.forEach(d => m.set(d.id, { id: d.id, ...d.data() }));
    state.actions = m; state.loaded.actions = true; emit();
  }, onErr("actions")));
  emit();
}

let errorHandler = () => {};
export function onDataError(fn) { errorHandler = fn; }
function reportError(e) { errorHandler(friendlyError(e)); }

export function friendlyError(e) {
  if (e instanceof AppError) return e.message;
  const code = e && e.code ? String(e.code) : "";
  if (code.includes("network") || code.includes("unavailable") || code.includes("failed-precondition") && !navigator.onLine)
    return "Pas de connexion internet. Réessayez dans un instant.";
  if (code.includes("permission-denied")) return "Action non autorisée.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found") || code.includes("invalid-login"))
    return "Ce code personnel est introuvable. Vérifiez-le et réessayez.";
  if (code.includes("too-many-requests")) return "Trop d'essais. Patientez quelques minutes.";
  if (code.includes("operation-not-allowed")) return "La connexion n'est pas encore activée dans Firebase (Authentification → E-mail/Mot de passe).";
  if (!navigator.onLine) return "Pas de connexion internet. Réessayez dans un instant.";
  return "Une erreur est survenue. Réessayez.";
}

export function initAuth() {
  onAuthStateChanged(auth, user => {
    state.ready = true;
    const uid = user ? user.uid : null;
    if (uid !== state.uid || !sessionUnsubs.length) startSession(uid);
    else emit();
  });
}

// ---------- Profils ----------
function cleanName(name, max = 40) {
  return String(name || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function createProfile(name) {
  name = cleanName(name);
  if (!name) throw new AppError("Indiquez un prénom ou un pseudonyme.");
  if (!navigator.onLine) throw new AppError("Une connexion internet est nécessaire pour créer un profil.");
  let code, cred;
  for (let i = 0; i < 3; i++) {
    code = generateCode();
    try { cred = await createUserWithEmailAndPassword(auth, codeToEmail(code), code); break; }
    catch (e) { if (!String(e.code).includes("email-already-in-use")) throw e; }
  }
  if (!cred) throw new AppError("Impossible de créer le profil. Réessayez.");
  const uid = cred.user.uid;
  rememberProfile({ uid, name, code });
  await setDoc(doc(db, "profiles", uid), { name, createdAt: Date.now() });
  return { uid, name, code };
}

export async function switchProfile(uid) {
  const p = localProfiles().find(x => x.uid === uid);
  if (!p) throw new AppError("Profil introuvable sur cet appareil.");
  if (auth.currentUser && auth.currentUser.uid === uid) return;
  await signInWithEmailAndPassword(auth, codeToEmail(p.code), p.code);
}

export async function recoverProfile(input) {
  const code = normalizeCode(input);
  if (!/^[A-Z0-9]{6}-[A-Z]+-[A-Z]+-\d{4}$/.test(code))
    throw new AppError("Le code doit ressembler à : K7P2Q9-SAPIN-ETOILE-4827");
  const cred = await signInWithEmailAndPassword(auth, codeToEmail(code), code);
  const snap = await getDoc(doc(db, "profiles", cred.user.uid));
  const name = snap.exists() ? snap.data().name : "Mon profil";
  rememberProfile({ uid: cred.user.uid, name, code });
  return { uid: cred.user.uid, name };
}

export async function logout() { await signOut(auth); }

export function myCode() {
  const p = localProfiles().find(x => x.uid === state.uid);
  return p ? p.code : null;
}

export async function renameProfile(name) {
  name = cleanName(name);
  if (!name) throw new AppError("Indiquez un prénom ou un pseudonyme.");
  const uid = need();
  const b = writeBatch(db);
  b.set(doc(db, "profiles", uid), { name }, { merge: true });
  for (const [gid, m] of state.memberships) {
    b.set(doc(db, "groups", gid, "members", uid), { name }, { merge: true });
    if (m.published) {
      for (const g of state.myGifts.values()) {
        if (!(g.hiddenIn || []).includes(gid))
          b.set(doc(db, "groups", gid, "gifts", g.id), { ownerName: name }, { merge: true });
      }
    }
  }
  updateLocalName(uid, name);
  await commit(b);
}

function need() {
  if (!state.uid) throw new AppError("Choisissez d'abord un profil.");
  return state.uid;
}
function myName() {
  if (state.profile && state.profile.name) return state.profile.name;
  const p = localProfiles().find(x => x.uid === state.uid);
  return (p && p.name) || "Moi";
}

// Les écritures sont appliquées immédiatement à l'écran ; l'envoi au
// serveur se fait en arrière-plan (et reprend après une coupure).
function commit(batch) {
  const p = batch.commit();
  p.catch(e => reportError(e));
  return navigator.onLine ? p : Promise.resolve();
}

// ---------- Groupes ----------
export async function createGroup(name) {
  name = cleanName(name, 60);
  if (!name) throw new AppError("Donnez un nom au groupe (ex. « Famille Martin »).");
  if (!navigator.onLine) throw new AppError("Une connexion internet est nécessaire pour créer un groupe.");
  const uid = need();
  const gid = newId(20);
  const now = Date.now();
  const b = writeBatch(db);
  b.set(doc(db, "groups", gid), { name, createdBy: uid, createdAt: now });
  b.set(doc(db, "groups", gid, "members", uid), { name: myName(), published: false, joinedAt: now });
  b.set(doc(db, "profiles", uid, "memberships", gid), { name, published: false, joinedAt: now });
  await b.commit();
  return gid;
}

export async function fetchGroup(gid) {
  if (!/^[A-Za-z0-9]{10,40}$/.test(gid || "")) return null;
  const snap = await getDoc(doc(db, "groups", gid));
  return snap.exists() ? { id: gid, ...snap.data() } : null;
}

export async function joinGroup(gid, groupName) {
  const uid = need();
  const now = Date.now();
  const b = writeBatch(db);
  b.set(doc(db, "groups", gid, "members", uid), { name: myName(), published: false, joinedAt: now });
  b.set(doc(db, "profiles", uid, "memberships", gid), { name: groupName, published: false, joinedAt: now });
  await b.commit();
}

export async function renameGroup(gid, name) {
  name = cleanName(name, 60);
  if (!name) throw new AppError("Le nom du groupe ne peut pas être vide.");
  const uid = need();
  const b = writeBatch(db);
  b.set(doc(db, "groups", gid), { name }, { merge: true });
  b.set(doc(db, "profiles", uid, "memberships", gid), { name }, { merge: true });
  await commit(b);
}

export async function leaveGroup(gid) {
  const uid = need();
  const b = writeBatch(db);
  for (const g of state.myGifts.values()) b.delete(doc(db, "groups", gid, "gifts", g.id));
  b.delete(doc(db, "groups", gid, "members", uid));
  b.delete(doc(db, "profiles", uid, "memberships", gid));
  await commit(b);
}

export function watchGroup(gid, cb, onError) {
  return onSnapshot(doc(db, "groups", gid), snap => cb(snap.exists() ? { id: gid, ...snap.data() } : null),
    e => { reportError(e); onError && onError(e); });
}
export function watchMembers(gid, cb) {
  return onSnapshot(collection(db, "groups", gid, "members"), snap => {
    const list = []; snap.forEach(d => list.push({ uid: d.id, ...d.data() })); cb(list);
  }, e => reportError(e));
}
export function watchGroupGifts(gid, cb) {
  return onSnapshot(collection(db, "groups", gid, "gifts"), snap => {
    const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() })); cb(list);
  }, e => reportError(e));
}
export function watchClaim(giftId, cb) {
  return onSnapshot(doc(db, "claims", giftId), snap => cb(snap.exists() ? snap.data() : null),
    e => console.warn("claim", giftId, e));
}

// ---------- Ma liste ----------
function giftCopy(g) {
  return {
    ownerUid: state.uid, ownerName: myName(),
    title: g.title, description: g.description || "", price: g.price || "",
    url: g.url || "", imageUrl: g.imageUrl || "",
    createdAt: g.createdAt || Date.now(), updatedAt: Date.now()
  };
}
function cleanUrl(u) {
  u = String(u || "").trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href.slice(0, 600) : ""; } catch { return ""; }
}

export async function saveGift(input, giftId) {
  const uid = need();
  const title = cleanName(input.title, 120);
  if (!title) throw new AppError("Donnez un nom au cadeau.");
  const existing = giftId ? state.myGifts.get(giftId) : null;
  const id = giftId || newId(20);
  const gift = {
    title,
    description: String(input.description || "").trim().slice(0, 600),
    price: String(input.price || "").trim().slice(0, 30),
    url: cleanUrl(input.url),
    imageUrl: cleanUrl(input.imageUrl),
    hiddenIn: Array.isArray(input.hiddenIn) ? input.hiddenIn.slice(0, 50) : [],
    createdAt: existing ? existing.createdAt : Date.now(),
    updatedAt: Date.now()
  };
  const b = writeBatch(db);
  b.set(doc(db, "profiles", uid, "gifts", id), gift);
  for (const [gid, m] of state.memberships) {
    const ref = doc(db, "groups", gid, "gifts", id);
    if (m.published && !gift.hiddenIn.includes(gid)) b.set(ref, giftCopy(gift));
    else b.delete(ref);
  }
  await commit(b);
  return id;
}

export async function deleteGift(giftId) {
  const uid = need();
  const b = writeBatch(db);
  b.delete(doc(db, "profiles", uid, "gifts", giftId));
  for (const gid of state.memberships.keys()) b.delete(doc(db, "groups", gid, "gifts", giftId));
  await commit(b);
}

export async function setPublished(gid, published) {
  const uid = need();
  const b = writeBatch(db);
  b.set(doc(db, "groups", gid, "members", uid), { published }, { merge: true });
  b.set(doc(db, "profiles", uid, "memberships", gid), { published }, { merge: true });
  for (const g of state.myGifts.values()) {
    const ref = doc(db, "groups", gid, "gifts", g.id);
    if (published && !(g.hiddenIn || []).includes(gid)) b.set(ref, giftCopy(g));
    else b.delete(ref);
  }
  await commit(b);
}

// ---------- Réservations et achats ----------
export async function claimGift(gid, groupName, gift, status) {
  const uid = need();
  if (gift.ownerUid === uid) throw new AppError("Vous ne pouvez pas réserver vos propres cadeaux.");
  if (!navigator.onLine) throw new AppError("Une connexion internet est nécessaire pour réserver ou acheter, afin d'éviter les doublons.");
  const claimRef = doc(db, "claims", gift.id);
  const actRef = doc(db, "profiles", uid, "actions", gift.id);
  await runTransaction(db, async tx => {
    const snap = await tx.get(claimRef);
    const now = Date.now();
    if (snap.exists()) {
      const c = snap.data();
      if (c.byUid !== uid) {
        throw new AppError(c.status === "bought"
          ? "Trop tard : ce cadeau vient d'être acheté par quelqu'un d'autre."
          : "Trop tard : ce cadeau vient d'être réservé par quelqu'un d'autre.");
      }
      if (c.status === status) return;
      tx.update(claimRef, { status, at: now });
      tx.set(actRef, { ...c, status, at: now });
    } else {
      const data = {
        giftId: gift.id, groupId: gid, groupName: groupName || "",
        recipientUid: gift.ownerUid, recipientName: gift.ownerName || "",
        giftTitle: gift.title || "", giftPrice: gift.price || "", giftUrl: gift.url || "",
        byUid: uid, byName: myName(), status, at: now
      };
      tx.set(claimRef, data);
      tx.set(actRef, data);
    }
  });
}

export async function releaseClaim(giftId) {
  const uid = need();
  if (!navigator.onLine) throw new AppError("Une connexion internet est nécessaire pour annuler.");
  const claimRef = doc(db, "claims", giftId);
  const actRef = doc(db, "profiles", uid, "actions", giftId);
  await runTransaction(db, async tx => {
    const snap = await tx.get(claimRef);
    if (snap.exists() && snap.data().byUid === uid) tx.delete(claimRef);
    tx.delete(actRef);
  });
}
