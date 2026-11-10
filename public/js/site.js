// Site tangram.cx : animations au defilement, comparateur de la page
// Fonctionnalites et envoi du formulaire de demande d'essai.
// Fichier ecrit a la main a partir de la maquette (outils/construire.py ne le modifie pas).
(function () {
'use strict';
var etat = {};
function animations() {
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

const racine = document.getElementById('racine');
if (!racine) return;
racine.classList.add('anim-pret');
const scenes = Array.from(racine.querySelectorAll('.an-monte,.an-pop,.an-glisse,.an-barre,.an-trace,.ap-piece,.v2-piece,.il,.cb,.frise-defile,.v2-tri,.v2-ill,.v2-mod,.st,.ph'));
scenes.forEach((el) => el.setAttribute('data-scene', ''));
const toutMontrer = () => scenes.forEach((el) => el.setAttribute('data-vu', ''));
if (!('IntersectionObserver' in window) || !racine.getAnimations) { toutMontrer(); return; }
// L'avancement de chaque illustration suit le defilement : il depend de la hauteur deja
// remontee au-dessus du bas de l'ecran (voir les reperes plus bas).
// En remontant, l'illustration se defait au meme rythme ; sortie par le haut, elle reste construite.
// Les animations sont relues a chaque pas : la feuille de style peut arriver apres le montage.
const animsDe = (scene) => scene.getAnimations({ subtree: true }).filter((a) => {
const cible = a.effect && a.effect.target;
return cible && cible.closest('[data-scene]') === scene;
});
const etats = new Map();
scenes.forEach((scene) => etats.set(scene, { t: 0, p: 0, basCoupe: null, fini: false }));
let precedent = null;
const avancer = () => {
etat.boucle = null;
const maintenant = performance.now();
const dt = precedent === null ? 16 : Math.min(maintenant - precedent, 50);
precedent = maintenant;
let enCours = false;
etats.forEach((s, scene) => {
if (s.fini) return;
const anims = animsDe(scene);
const finies = anims.filter((a) => a.effect.getComputedTiming().endTime !== Infinity);
anims.forEach((a) => { if (!finies.includes(a) && a.playState !== 'running') a.play(); });
if (!finies.length) { if (s.p > 0) scene.setAttribute('data-vu', ''); s.fini = true; return; }
const fin = finies.reduce((m, a) => Math.max(m, a.effect.getComputedTiming().endTime), 0);
const cible = s.p * fin;
const ecart = cible - s.t;
s.t = Math.abs(ecart) < 2 ? cible : s.t + ecart * Math.min(1, dt / 90);
finies.forEach((a) => { if (a.playState !== 'paused') a.pause(); a.currentTime = s.t; });
if (s.t === cible) s.fini = true; else enCours = true;
});
if (enCours) etat.boucle = setTimeout(avancer, 16); else precedent = null;
};
const relancer = () => { if (!etat.boucle) etat.boucle = setTimeout(avancer, 0); };
const seuils = [];
for (let i = 0; i <= 100; i++) seuils.push(i / 100);
// Un repere invisible par illustration : il part du haut de l'illustration et descend
// 700 px plus bas. Sa partie visible mesure de combien le haut de l'illustration est
// remonte au-dessus du bas de l'ecran, seule mesure fiable dans le cadre de la maquette.
// Depart a 120 px, fin 240 px plus loin.
const DEBUT = 120, COURSE = 240, MARGE = 700;
if (getComputedStyle(racine).position === 'static') racine.style.position = 'relative';
const calque = document.createElement('div');
calque.setAttribute('aria-hidden', 'true');
calque.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;';
racine.appendChild(calque);
const reperes = new Map();
scenes.forEach((scene) => {
const r = document.createElement('div');
r.style.cssText = 'position:absolute;left:0;width:1px;opacity:0;';
calque.appendChild(r);
reperes.set(r, scene);
});
const placer = () => {
const haut = racine.getBoundingClientRect().top;
const total = racine.scrollHeight;
reperes.forEach((scene, r) => {
const b = scene.getBoundingClientRect();
const y = b.top - haut;
r.style.top = y + 'px';
r.style.height = Math.max(1, Math.min(b.height + MARGE, total - y)) + 'px';
});
};
placer();
etat.redim = new ResizeObserver(placer);
etat.redim.observe(racine);
etat.observateur = new IntersectionObserver((entrees) => {
entrees.forEach((e) => {
const s = etats.get(reperes.get(e.target));
if (!s) return;
const h = e.boundingClientRect.height || 1;
let p = s.p;
if (e.isIntersecting) {
const visible = e.intersectionRect.height;
s.basCoupe = visible >= h - 1 ? null : Math.abs(e.intersectionRect.top - e.boundingClientRect.top) < 2;
// Photos de tete (.ph) : depart plus tot, elles sont souvent en bas du premier ecran.
const debut = reperes.get(e.target).classList.contains('ph') ? 80 : DEBUT;
p = s.basCoupe === true ? Math.max(0, Math.min(1, (visible - debut) / COURSE)) : 1;
} else if (s.basCoupe === true) p = 0;
// Deja visible a l'ouverture de la page : construite d'emblee et laissee construite.
if (!s.vu) { s.vu = true; if (p > 0) s.fixe = true; }
if (s.fixe) p = 1;
if (p !== s.p) { s.p = p; s.fini = false; relancer(); }
});
}, { threshold: seuils });
reperes.forEach((scene, r) => etat.observateur.observe(r));
relancer();

}

function comparateur() {
document.querySelectorAll('input[data-cmp]').forEach(function (curseur) {
var bloc = curseur.parentElement;
var clip = bloc.querySelector('[data-cmp-clip]');
var ligne = bloc.querySelector('[data-cmp-ligne]');
var maj = function () {
var pos = Number(curseur.value);
if (clip) clip.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
if (ligne) ligne.style.left = pos + '%';
};
curseur.addEventListener('input', maj);
maj();
});
}

function formulaire() {
var form = document.querySelector('form[data-contact]');
if (!form) return;
var debut = Date.now();
var message = form.querySelector('[data-contact-message]');
var bouton = form.querySelector('button[type="submit"]');
form.addEventListener('submit', function (e) {
e.preventDefault();
var donnees = {};
new FormData(form).forEach(function (v, k) { donnees[k] = String(v); });
donnees.duree = String(Date.now() - debut);
var dire = function (texte, erreur) {
message.textContent = texte;
message.style.color = erreur ? '#b42318' : '#1e1033';
};
if (!form.checkValidity()) { form.reportValidity(); return; }
bouton.disabled = true;
dire('Envoi en cours...', false);
fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(donnees) })
.then(function (r) {
if (!r.ok) throw new Error('envoi');
form.reset();
dire('Merci, votre demande est bien envoyée. Nous revenons vers vous rapidement.', false);
})
.catch(function () {
dire("L'envoi n'a pas abouti. Écrivez-nous à contact@tangram.cx ou choisissez un créneau ci-contre.", true);
})
.finally(function () { bouton.disabled = false; });
});
}

function demarrer() { animations(); comparateur(); formulaire(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
