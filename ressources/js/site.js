// Site tangram.cx : animations au defilement, comparateur de la page
// Fonctionnalites, envoi du formulaire de demande d'essai et video de l'accueil.
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
// Animations discretes et rapides : chaque illustration se joue d'un coup, en 0,3 seconde
// au plus, quand son haut est remonte de 12 % de la hauteur de l'ecran au-dessus du bas.
// Ce qui est deja visible a l'ouverture de la page est montre construit, sans animation.
const DUREE_MAX = 300;
// Une illustration et tout ce qu'elle contient se jouent ensemble.
// En remontant, quand l'illustration repasse sous le bas de l'ecran, elle se rejoue a l'envers.
const animsDe = (scene) => scene.getAnimations({ subtree: true }).filter((a) => a.effect && a.effect.getComputedTiming().endTime !== Infinity);
const jouer = (scene, sens, instantane) => {
if (!scene.hasAttribute('data-vu')) [scene, ...scene.querySelectorAll('[data-scene]')].forEach((el) => el.setAttribute('data-vu', ''));
const anims = animsDe(scene);
if (instantane) { anims.forEach((a) => a.finish()); return; }
const fin = anims.reduce((m, a) => Math.max(m, a.effect.getComputedTiming().endTime), 0);
const vitesse = Math.max(1, fin / DUREE_MAX);
anims.forEach((a) => { a.playbackRate = sens * vitesse; a.play(); });
};
const affichees = new WeakSet();
let premier = true;
etat.observateur = new IntersectionObserver((entrees) => {
entrees.forEach((e) => {
const scene = e.target;
if (e.isIntersecting) {
if (affichees.has(scene)) return;
affichees.add(scene);
jouer(scene, 1, premier && e.boundingClientRect.top < window.innerHeight);
} else if (affichees.has(scene) && e.rootBounds && e.boundingClientRect.top >= e.rootBounds.bottom) {
affichees.delete(scene);
jouer(scene, -1, false);
}
});
premier = false;
}, { rootMargin: '0px 0px -12% 0px' });
scenes.filter((s) => !s.parentElement.closest('[data-scene]')).forEach((scene) => etat.observateur.observe(scene));
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

// Video de l'accueil : muette au depart (sous-titres incrustes), elle se lance quand
// elle est a moitie visible, sauf si l'appareil demande moins d'animations.
// Seul un clic remet le son, et la video repart alors du debut.
function video() {
var v = document.querySelector('video[data-video]');
if (!v) return;
v.muted = true;
var commandes = document.querySelector('[data-video-commandes]');
var fin = document.querySelector('[data-video-fin]');
var son = document.querySelector('[data-video-son]');
var lecture = document.querySelector('[data-video-lecture]');
var st = document.querySelector('[data-video-st]');
var revoir = document.querySelector('[data-video-revoir]');
var pauseVoulue = false;
var finie = false;
var lancer = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
var montrerFin = function (oui) {
finie = oui;
if (fin) fin.hidden = !oui;
if (commandes) commandes.hidden = oui;
};
v.addEventListener('play', function () { if (lecture) lecture.textContent = 'Pause'; });
v.addEventListener('pause', function () { if (lecture) lecture.textContent = 'Lecture'; });
v.addEventListener('ended', function () { montrerFin(true); if (revoir) revoir.focus(); });
if (son) son.addEventListener('click', function () {
if (!v.muted) { v.muted = true; son.textContent = 'Activer le son'; return; }
v.muted = false; son.textContent = 'Couper le son';
v.currentTime = 0; pauseVoulue = false; montrerFin(false); lancer();
});
if (lecture) lecture.addEventListener('click', function () {
if (v.paused) { pauseVoulue = false; lancer(); } else { pauseVoulue = true; v.pause(); }
});
if (st) st.addEventListener('click', function () {
var piste = v.textTracks && v.textTracks[0];
if (!piste) return;
var actif = st.getAttribute('aria-pressed') !== 'true';
piste.mode = actif ? 'showing' : 'hidden';
st.setAttribute('aria-pressed', actif ? 'true' : 'false');
});
if (revoir) revoir.addEventListener('click', function () {
v.currentTime = 0; pauseVoulue = false; montrerFin(false); lancer();
if (lecture) lecture.focus();
});
var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduit || !('IntersectionObserver' in window)) return;
new IntersectionObserver(function (entrees) {
entrees.forEach(function (e) {
if (finie || pauseVoulue) return;
if (e.isIntersecting) lancer(); else v.pause();
});
}, { threshold: 0.5 }).observe(v);
}

function demarrer() { animations(); comparateur(); formulaire(); video(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
