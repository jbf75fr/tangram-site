# tangram-site

Site vitrine de tangram.cx, publié sur https://tangram.cx. L'application est sur https://app.tangram.cx (dépôt `tangram-cx`).

## Organisation

| Dossier | Contenu |
|---|---|
| `maquette/` | Pages de la maquette Claude Design (source du contenu et du design) et photos d'origine |
| `outils/construire.py` | Fabrique le site publié à partir de la maquette |
| `ressources/` | Police Figtree, icônes, image d'aperçu pour les réseaux sociaux, script du site (`js/site.js`) |
| `public/` | Site publié (fabriqué, ne pas modifier à la main) |
| `api/contact.js` | Envoi du formulaire de demande d'essai par e-mail (Brevo) |
| `vercel.json` | Adresses propres, redirections vers l'application, en-têtes de sécurité |

## Mettre à jour le site

1. Copier les pages modifiées de la maquette dans `maquette/` (et les nouvelles photos dans `maquette/img/`).
2. Lancer `python3 outils/construire.py` (il faut Python 3 et Pillow).
3. Vérifier, puis proposer une pull request. Le merge sur `main` met le site en ligne.

Une nouvelle page de la maquette doit être déclarée dans `PAGES` ou `SECTEURS` de `outils/construire.py`, avec son adresse, son titre et sa description.

## Référencement (SEO et IA)

Fabriqué automatiquement pour chaque page : titre, description, adresse canonique, aperçu pour les réseaux sociaux, données structurées (organisation, logiciel et tarifs, questions fréquentes, fil d'Ariane), `sitemap.xml`, `robots.txt` (ouvert à tous, y compris aux assistants IA) et `llms.txt` (résumé du produit pour les assistants IA).

## Variables d'environnement (projet Vercel du site)

- `BREVO_CLE_API` : clé d'API Brevo.
- `CONTACT_DESTINATAIRE` (facultatif, par défaut `contact@tangram.cx`).
- `CONTACT_EXPEDITEUR` (facultatif, par défaut `ne-pas-repondre@tangram.cx`, adresse à valider dans Brevo).
