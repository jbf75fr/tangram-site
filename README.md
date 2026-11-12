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
