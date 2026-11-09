# CLAUDE.md : site vitrine tangram.cx

Mode d'emploi du dépôt : `README.md`. Règles du contenu et du design du site : `docs/site-vitrine.md` du dépôt `tangram-cx`.

- Je ne suis pas développeur : explique simplement, en français. Tu gères branches, commits et pull requests.
- Avant chaque push, vérifier que la pull request de la branche n'est pas déjà mergée (`git fetch origin main` puis `git log origin/main..HEAD`) ; si oui, repartir de `origin/main` et ouvrir une nouvelle pull request.
- Ne jamais modifier `public/` à la main : modifier la maquette (`maquette/`) ou `outils/construire.py`, puis relancer `python3 outils/construire.py`.
- Interdits partout : le tiret long et le point médian (le script bloque la fabrication s'il en trouve). Pas de « ça », pas de phrase commençant par « Ce que » ou « Ce qui », ne jamais nommer un fournisseur d'IA ni Vocaza, aucun chiffre inventé.
- Chaque page : un seul titre `h1`, une description de 150 caractères environ, des images avec texte alternatif.
- Aucune ressource externe (police, script, image) : tout est servi par le site, la politique de sécurité (`vercel.json`) bloque le reste.
- Après chaque évolution, mettre à jour `README.md` et `docs/site-vitrine.md` du dépôt `tangram-cx`.
