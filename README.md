# tangram-site

Site vitrine de tangram.cx, publié sur https://tangram.cx. L'application est sur https://app.tangram.cx (dépôt `tangram-cx`).

## Organisation

| Dossier | Contenu |
|---|---|
| `maquette/` | Pages de la maquette Claude Design (source du contenu et du design) et photos d'origine |
| `outils/construire.py` | Fabrique le site publié à partir de la maquette |
| `ressources/` | Police Figtree, icônes, image d'aperçu pour les réseaux sociaux, script du site (`js/site.js`), images des signatures mail (`signature/`, servies à la racine : `tangram.cx/signature-carre.png`, `logo-signature.png`, `signature-linkedin.png` et `signature-rendez-vous.png`, à ne jamais renommer ni supprimer, les mails déjà envoyés les chargent) |
| `public/` | Site publié (fabriqué, ne pas modifier à la main) |
| `api/contact.js` | Envoi du formulaire de demande d'essai par e-mail (Brevo) |
| `vercel.json` | Adresses propres, redirections vers l'application, en-têtes de sécurité |

## Changer un texte (sans Claude)

1. Sur GitHub, ouvrir le dossier `maquette/`, puis la page à corriger (voir le tableau ci-dessous).
2. Cliquer sur le crayon (« Edit this file ») en haut à droite du fichier.
3. Retrouver la phrase avec Ctrl+F (Cmd+F sur Mac), la corriger, sans toucher aux balises qui l'entourent (`<p ...>`, `</p>`...).
4. Cliquer sur « Commit changes... », laisser « Commit directly to the main branch », puis « Commit changes ».
5. Le site se refabrique tout seul (onglet « Actions », environ une minute), puis Vercel le met en ligne.

Si la fabrication échoue (croix rouge dans « Actions », e-mail de GitHub), le site en ligne ne change pas : le message d'erreur dit pourquoi (par exemple un tiret long ou un point médian interdit).

| Page du site | Fichier |
|---|---|
| Accueil | `maquette/V2.dc.html` |
| Fonctionnalités | `maquette/Solution.dc.html` |
| Enquêtes RH | `maquette/EnquetesRH.dc.html` |
| Tarifs | `maquette/Tarifs.dc.html` |
| Sécurité | `maquette/Securite.dc.html` |
| Mentions légales | `maquette/MentionsLegales.dc.html` |
| CGV, CGU, accord de traitement des données | `maquette/CGV.dc.html`, `CGU.dc.html`, `TraitementDonnees.dc.html` (à faire relire par un juriste ; à mettre à jour à chaque nouveau prestataire) |
| Politique de confidentialité | `maquette/Confidentialite.dc.html` (à tenir à jour à chaque nouveau traitement de données de l'application ou du site) |
| Secteurs | `maquette/SecteurPublic.dc.html`, `Banque`, `Assurance`, `Tourisme`, `Distribution`, `Transport`, `Telecoms`, `Energie`, `Logement`, `Enseignement` |

Les titres et descriptions qui apparaissent dans Google sont dans `outils/construire.py` (listes `PAGES` et `SECTEURS`), modifiables de la même façon.

Ne jamais modifier `public/` : il est refabriqué à chaque changement, la modification serait perdue.

Pour les changements plus importants (mise en page, nouvelle section), passer par la maquette Claude Design puis demander à Claude de mettre le site à jour.

## Mettre à jour le site

1. Copier les pages modifiées de la maquette dans `maquette/` (et les nouvelles photos dans `maquette/img/`).
2. Lancer `python3 outils/construire.py` (il faut Python 3 et Pillow).
3. Vérifier, puis proposer une pull request. Le merge sur `main` met le site en ligne.

Automatisme : à chaque modification de `maquette/`, `outils/` ou `ressources/` sur `main`, l'action GitHub `Fabriquer le site` (`.github/workflows/construire.yml`) relance `construire.py` et enregistre `public/`. Vercel ne déploie que les commits qui changent `public/`, `api/` ou `vercel.json` (`ignoreCommand`), donc un seul déploiement par modification.

Une nouvelle page de la maquette doit être déclarée dans `PAGES` ou `SECTEURS` de `outils/construire.py`, avec son adresse, son titre et sa description.

## Référencement (SEO et IA)

Fabriqué automatiquement pour chaque page : titre, description, adresse canonique, aperçu pour les réseaux sociaux, données structurées (organisation, logiciel et tarifs, questions fréquentes, fil d'Ariane), `sitemap.xml`, `robots.txt` (ouvert à tous, y compris aux assistants IA) et `llms.txt` (résumé du produit pour les assistants IA).

## Variables d'environnement (projet Vercel du site)

- `BREVO_CLE_API` : clé d'API Brevo.
- `CONTACT_DESTINATAIRE` (facultatif, par défaut `contact@tangram.cx`).
- `CONTACT_EXPEDITEUR` (facultatif, par défaut `ne-pas-repondre@tangram.cx`, adresse à valider dans Brevo).

## Vidéo d'introduction (`video/`)

Vidéo de 57 s fabriquée en code avec Remotion (dossier `video/`, indépendant du site). Elle s'ouvre sur « Et si vos priorités venaient de vos clients ? », suit un commentaire jusqu'au CRM puis dans tangram.cx (hébergement dans l'Union européenne), le décortique, montre le parcours d'achat en montagnes russes (une pièce de tangram parcourt la frise et plonge dans les sous-étapes de la Livraison), le plan d'action et sa mesure, le partage aux équipes accompagnées par les experts, et finit sur le jeu du tangram (des cartes de commentaires forment une à une les pièces du logo) et l'essai gratuit. Toute la voix vient d'une seule prise, pour garder exactement la même voix d'une scène à l'autre. Voix off ElevenLabs (texte, temps et précautions de prononciation dans `video/voix/texte.txt`), musique et bruitages ElevenLabs dans `video/public/`. Les temps de chaque animation suivent la voix : modifier la voix oblige à recaler les scènes (`video/src/scenes/`).

Sur le site, la vidéo est dans une bande sous l'accroche de l'accueil (`maquette/V2.dc.html`, section `#video`, titre « tangram.cx en moins d'une minute »). Elle est toujours entière à l'écran sous l'en-tête (largeur limitée par la hauteur de la fenêtre). Aperçu muet lancé quand elle est à moitié visible (sauf si l'appareil demande moins d'animations), avec « Cliquer pour écouter » en haut à gauche ; un clic sur l'image la relance du début avec le son, puis la met en pause ou la reprend (gros bouton de lecture au centre en pause) ; boutons son et sous-titres complets (CC) en bas à droite de l'image ; écran de fin (essai gratuit, fonctionnalités, revoir). Les scènes 1 à 5 de `video/src/` sont écrites en temps « sans l'accueil » et décalées de `DECALAGE` (3 s) dans `Introduction.tsx`. La fin compare le produit au jeu du tangram (« Comme au tangram, chaque retour trouve sa place, et l'ensemble dessine vos priorités. ») pendant que les pièces du logo se posent une à une. La voix dit « tangram », l'écran et les sous-titres « tangram.cx ». Les fichiers servis sont dans `maquette/video/` (`introduction.mp4` compressée, `affiche.jpg`, `sous-titres.vtt`), copiés dans `public/video/` par `outils/construire.py`, qui transforme aussi le lecteur de la maquette en HTML simple (fonction `video`) ; le comportement est dans `ressources/js/site.js`. Après une nouvelle version de la vidéo : recompresser (`ffmpeg -i sortie/introduction.mp4 -c:v libx264 -crf 26 -vf scale=1600:-2 -c:a aac -b:a 128k -af loudnorm=I=-16:TP=-1.5 -movflags +faststart introduction.mp4`), remplacer le fichier dans `maquette/video/` et dans la maquette Claude Design, mettre à jour `sous-titres.vtt` si la voix change.

Fabriquer la vidéo : `cd video && npm install`, puis `npx remotion render src/index.tsx Introduction sortie/introduction.mp4 --browser-executable=<chemin de Chromium>`. Le dossier `sortie/` n'est pas versionné.
