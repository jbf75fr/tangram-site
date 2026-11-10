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
// Animations discretes et rapides : chaque illustration se joue d'un coup, en 0,3 seconde
// au plus, quand son haut est remonte de 12 % de la hauteur de l'ecran au-dessus du bas.
// Ce qui est deja visible a l'ouverture de la page est montre construit, sans animation.
const DUREE_MAX = 300;
// Une illustration et tout ce qu'elle contient se jouent ensemble.
const animsDe = (scene) => scene.getAnimations({ subtree: true }).filter((a) => a.effect && a.effect.getComputedTiming().endTime !== Infinity);
const jouer = (scene, instantane) => {
if (scene.hasAttribute('data-vu')) return;
const groupe = [scene, ...scene.querySelectorAll('[data-scene]')];
groupe.forEach((el) => { el.setAttribute('data-vu', ''); if (etat.observateur) etat.observateur.unobserve(el); });
const anims = animsDe(scene);
if (instantane) { anims.forEach((a) => a.finish()); return; }
const fin = anims.reduce((m, a) => Math.max(m, a.effect.getComputedTiming().endTime), 0);
const vitesse = Math.max(1, fin / DUREE_MAX);
anims.forEach((a) => { a.playbackRate = vitesse; a.play(); });
};
let premier = true;
etat.observateur = new IntersectionObserver((entrees, obs) => {
entrees.forEach((e) => {
if (!e.isIntersecting) return;
obs.unobserve(e.target);
jouer(e.target, premier && e.boundingClientRect.top < window.innerHeight);
});
premier = false;
}, { rootMargin: '0px 0px -12% 0px' });
scenes.forEach((scene) => etat.observateur.observe(scene));
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
