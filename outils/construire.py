"""Fabrique le site publié (dossier public/) à partir de la maquette (dossier maquette/).

Usage : python3 outils/construire.py

À relancer après chaque mise à jour de la maquette. Le script :
- reprend le contenu de chaque page de la maquette (styles et corps) ;
- remplace les liens de la maquette par les adresses du site (/fonctionnalites, /secteurs/banque...) ;
- ajoute ce qui sert au référencement : titre, description, adresse canonique, aperçu pour
  les réseaux sociaux, données structurées, plan du site, robots.txt et llms.txt ;
- sert la police Figtree depuis le site (aucun appel à Google Fonts) ;
- convertit les photos en WebP.
"""
import datetime
import html
import json
import re
import shutil
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
MAQUETTE = RACINE / 'maquette'
SORTIE = RACINE / 'public'
RESSOURCES = RACINE / 'ressources'
SITE = 'https://tangram.cx'
APP = 'https://app.tangram.cx'
AUJOURDHUI = datetime.date.today().isoformat()

# Page de la maquette -> (adresse, titre, description, fil d'Ariane)
PAGES = {
    'V2': ('/', "tangram.cx | Analyse IA des commentaires clients",
           "tangram.cx classe les commentaires de vos enquêtes, avis et réclamations par thème, tonalité et émotion, "
           "et vous guide pour agir. Hébergé en Europe. Essai gratuit.", None),
    'Solution': ('/fonctionnalites', "Fonctionnalités | tangram.cx",
                 "Collecte automatique, classement par thème, tonalité et émotion, croisements, personas, idées d'actions, "
                 "plan d'action et alertes : les fonctionnalités de tangram.cx.", 'Fonctionnalités'),
    'EnquetesRH': ('/enquetes-rh', "Enquêtes RH, eNPS et baromètres sociaux | tangram.cx",
                   "Baromètres sociaux, eNPS, expérience collaborateur : toutes les réponses ouvertes de vos salariés "
                   "analysées, du recrutement au départ.", 'Enquêtes RH'),
    'Tarifs': ('/tarifs', "Tarifs | tangram.cx",
               "Essai gratuit jusqu'à 500 commentaires, puis abonnement à partir de 2 900 € HT par an ou 270 € HT par mois "
               "selon votre volume. Tout est compris.", 'Tarifs'),
    'Securite': ('/securite', "Sécurité et souveraineté | tangram.cx",
                 "Hébergement dans l'Union européenne, données personnelles masquées avant analyse, organisations "
                 "cloisonnées, sauvegardes chiffrées et vérifiées chaque nuit.", 'Sécurité et souveraineté'),
    'Confidentialite': ('/confidentialite', "Politique de confidentialité | tangram.cx",
                        "Données traitées par le site et l'application tangram.cx, prestataires, lieux d'hébergement, "
                        "durées de conservation et exercice de vos droits.", 'Politique de confidentialité'),
    'CGV': ('/cgv', "Conditions générales de vente | tangram.cx",
            "Conditions de souscription de l'abonnement tangram.cx par les professionnels : commande, prix, facturation, "
            "durée, résiliation, données et responsabilité.", 'Conditions générales de vente'),
    'CGU': ('/cgu', "Conditions générales d'utilisation | tangram.cx",
            "Règles d'utilisation du site tangram.cx et de l'application : accès, engagements des utilisateurs, résultats "
            "produits par l'IA, sécurité.", "Conditions générales d'utilisation"),
    'TraitementDonnees': ('/traitement-des-donnees', "Accord de traitement des données (RGPD) | tangram.cx",
                          "Accord de sous-traitance au sens de l'article 28 du RGPD : description du traitement, mesures de "
                          "sécurité, sous-traitants, violation de données, fin du contrat.", 'Accord de traitement des données'),
    'MentionsLegales': ('/mentions-legales', "Mentions légales | tangram.cx",
                        "Éditeur, hébergement, propriété intellectuelle, crédits photos et données personnelles du site "
                        "tangram.cx.", 'Mentions légales'),
}
SECTEURS = {
    'SecteurPublic': ('secteur-public', 'Secteur public', "Expérience usager dans le secteur public", "Enquêtes usagers, avis sur les démarches, réclamations : les points de blocage, l'étape concernée et les publics touchés, démarche par démarche."),
    'Banque': ('banque', 'Banque', "Satisfaction et fidélité des clients en banque", "Conseiller, frais, application, crédit : ce qui pèse dans les commentaires de vos clients, agence par agence, et qui envisage de partir."),
    'Assurance': ('assurance', 'Assurance', "Satisfaction des assurés, du sinistre à l'indemnisation", "Déclaration, gestion du sinistre, indemnisation : l'analyse des commentaires de vos assurés montre où l'attente se transforme en défiance."),
    'Tourisme': ('tourisme-hotellerie', 'Tourisme et hôtellerie', "Avis des voyageurs en tourisme et hôtellerie", "Avis en ligne et questionnaires de séjour lus dans toutes les langues, établissement par établissement, de la réservation au départ."),
    'Distribution': ('distribution', 'Distribution', "Expérience client en magasin et en ligne", "En magasin comme en ligne, de la commande au retour : tous les commentaires de vos clients analysés dans un même parcours."),
    'Transport': ('transport-mobilite', 'Transport et mobilité', "Satisfaction des voyageurs en transport", "Ponctualité, information, confort : les commentaires de vos voyageurs analysés ligne par ligne, gare par gare."),
    'Telecoms': ('telecoms', 'Télécoms', "Satisfaction et résiliation des abonnés télécoms", "Réseau, facture, service client : ce qui pousse vos abonnés à résilier, sujet par sujet, à partir de leurs commentaires."),
    'Energie': ('energie', 'Énergie', "Satisfaction des clients en énergie", "Électricité, gaz, eau : ce qui pèse sur la confiance de vos clients, de la facture au service client, à partir de leurs commentaires."),
    'Logement': ('logement-social', 'Logement social', "Satisfaction des locataires en logement social", "Propreté, interventions, voisinage : la voix de vos locataires analysée résidence par résidence."),
    'Enseignement': ('enseignement', 'Enseignement', "Expérience étudiante dans l'enseignement", "Inscription, cours, accompagnement, diplôme : les commentaires de vos étudiants analysés pour que chaque formation sache quoi améliorer."),
}


def texte(fragment):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', fragment))).strip()



for nom, (slug, libelle, sujet, description) in SECTEURS.items():
    PAGES[nom] = (f'/secteurs/{slug}', f'{sujet} | tangram.cx', description, libelle)


def adresse(nom):
    return PAGES[nom][0]


def fichier_sortie(chemin):
    return SORTIE / ('index.html' if chemin == '/' else chemin.strip('/') + '.html')


def remplacer_liens(corps):
    def lien(m):
        nom, ancre = m.group(1), m.group(2) or ''
        if nom not in PAGES:
            raise SystemExit(f'Lien vers une page inconnue : {nom}.dc.html')
        return f'href="{adresse(nom)}{ancre}"'
    corps = re.sub(r'href="([A-Za-z0-9]+)\.dc\.html(#[\w-]+)?"', lien, corps)
    corps = re.sub(r'src="img/([\w-]+)\.jpg"', r'src="/img/\1.webp"', corps)
    return corps


def comparateur(corps):
    """Le curseur avant/après de la page Fonctionnalités, sans le moteur de la maquette."""
    corps = corps.replace('clip-path: inset(0 {{reste}}% 0 0);"', 'clip-path: inset(0 50% 0 0);" data-cmp-clip=""')
    corps = re.sub(r'(<div aria-hidden="true" style="[^"]*?)left: \{\{pos\}\}%;([^"]*")',
                   r'\1left: 50%;\2 data-cmp-ligne=""', corps)
    corps = corps.replace('value="{{pos}}" onChange="{{onSlide}}"', 'value="50" data-cmp=""')
    return corps


def formulaire(corps):
    """Formulaire de demande d'essai : envoi vers /api/contact."""
    if '<form ' not in corps:
        return corps
    corps = corps.replace('<form style=', '<form action="/api/contact" method="post" data-contact="" style=', 1)
    for champ in ('name="nom"', 'name="email"', 'name="organisation"'):
        corps = corps.replace(f'<input type="text" {champ}', f'<input type="text" {champ} required', 1)
        corps = corps.replace(f'<input type="email" {champ}', f'<input type="email" {champ} required', 1)
    # Champ piège invisible : un robot le remplit, une personne ne le voit pas.
    piege = ('<label aria-hidden="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;">'
             'Ne pas remplir<input type="text" name="site_web" tabindex="-1" autocomplete="off"></label>')
    corps = corps.replace('<label ', piege + '<label ', 1)
    corps = corps.replace('</form>', '<p data-contact-message="" role="status" aria-live="polite" '
                          'style="grid-column: 1 / -1; margin: 0; font-weight: 600;"></p>\n</form>', 1)
    return corps


def photo_principale(corps):
    """Première photo de la page : chargée tout de suite (c'est souvent le plus grand élément visible)."""
    m = re.search(r'<img [^>]*>', corps)
    if not m:
        return corps
    img = m.group(0)
    neuf = img.replace(' loading="lazy"', '')
    neuf = neuf.replace('<img ', '<img fetchpriority="high" ', 1)
    return corps.replace(img, neuf, 1)


def json_ld(objets):
    return ''.join('<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False, separators=(',', ':'))
                   .replace('</', '<\\/') + '</script>\n' for o in objets)


ORGANISATION = {
    '@type': 'Organization', '@id': SITE + '/#organisation', 'name': 'tangram.cx', 'url': SITE + '/',
    'logo': SITE + '/icon-512.png', 'email': 'contact@tangram.cx',
    'description': "Logiciel français d'analyse par IA des commentaires libres d'enquêtes de satisfaction, d'avis et de réclamations.",
    'areaServed': 'FR', 'knowsLanguage': 'fr',
    'contactPoint': {'@type': 'ContactPoint', 'contactType': 'sales', 'email': 'contact@tangram.cx', 'availableLanguage': ['fr', 'en']},
}
LOGICIEL = {
    '@type': 'SoftwareApplication', '@id': SITE + '/#logiciel', 'name': 'tangram.cx', 'url': SITE + '/',
    'applicationCategory': 'BusinessApplication', 'operatingSystem': 'Web',
    'description': "Analyse par IA des commentaires d'enquêtes de satisfaction, d'avis en ligne et de réclamations : "
                   "classement par thème, tonalité et émotion, croisements, personas, risque de départ, plan d'action et alertes.",
    'inLanguage': 'fr', 'publisher': {'@id': SITE + '/#organisation'},
    'featureList': ["Collecte automatique des réponses depuis vos outils d'enquête et votre CRM",
                    'Classement des commentaires par thème, sous-thème, tonalité et émotion',
                    'Score net par sujet et suivi dans le temps',
                    'Croisement des sujets avec vos données (région, canal, profil)',
                    'Personas et repérage des clients sur le départ',
                    "Idées d'actions et plan d'action mesurable",
                    'Alertes par e-mail selon vos propres seuils',
                    'Données personnelles masquées avant analyse, hébergement dans l\'Union européenne'],
    'offers': [
        {'@type': 'Offer', 'name': 'Essai gratuit', 'price': '0', 'priceCurrency': 'EUR',
         'description': "Jusqu'à 500 commentaires, après un premier échange."},
        {'@type': 'Offer', 'name': 'Abonnement annuel', 'price': '2900', 'priceCurrency': 'EUR',
         'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': '2900', 'priceCurrency': 'EUR',
                                'unitCode': 'ANN', 'valueAddedTaxIncluded': False},
         'description': 'À partir de 2 900 € HT par an, selon le volume de commentaires.'},
        {'@type': 'Offer', 'name': 'Abonnement mensuel', 'price': '270', 'priceCurrency': 'EUR',
         'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': '270', 'priceCurrency': 'EUR',
                                'unitCode': 'MON', 'valueAddedTaxIncluded': False},
         'description': 'À partir de 270 € HT par mois, sans engagement.'},
    ],
}


def faq(corps):
    """Questions fréquentes visibles sur la page (dt/dd ou h3/p), reprises en données structurées."""
    if 'Questions fréquentes' not in corps:
        return None
    bloc = corps[corps.index('Questions fréquentes'):]
    bloc = bloc[:bloc.index('</section>')]
    paires = re.findall(r'<summary[^>]*>(.*?)</summary>\s*<p[^>]*>(.*?)</p>', bloc, re.S)
    if not paires:
        paires = re.findall(r'<dt[^>]*>(.*?)</dt>\s*<dd[^>]*>(.*?)</dd>', bloc, re.S)
    if not paires:
        paires = re.findall(r'<h3[^>]*>(.*?)</h3>\s*<p[^>]*>(.*?)</p>', bloc, re.S)
    if not paires:
        raise SystemExit('Questions fréquentes trouvées mais illisibles : adapter faq() dans construire.py')
    return {'@context': 'https://schema.org', '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': texte(q),
                            'acceptedAnswer': {'@type': 'Answer', 'text': texte(r)}} for q, r in paires]}


def ariane(nom):
    chemin, _, _, libelle = PAGES[nom]
    elements = [{'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': SITE + '/'}]
    if nom in SECTEURS:
        elements.append({'@type': 'ListItem', 'position': 2, 'name': 'Secteurs', 'item': SITE + '/#pour-qui'})
    elements.append({'@type': 'ListItem', 'position': len(elements) + 1, 'name': libelle, 'item': SITE + chemin})
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': elements}


def donnees_structurees(nom, corps):
    objets = []
    if nom == 'V2':
        objets.append({'@context': 'https://schema.org', '@graph': [
            ORGANISATION, {'@type': 'WebSite', '@id': SITE + '/#site', 'name': 'tangram.cx', 'url': SITE + '/',
                           'inLanguage': 'fr', 'publisher': {'@id': SITE + '/#organisation'}}, LOGICIEL]})
    else:
        objets.append(ariane(nom))
    if nom in ('Solution', 'Tarifs'):
        objets.append(dict({'@context': 'https://schema.org'}, **LOGICIEL))
    q = faq(corps)
    if q:
        objets.append(q)
    return json_ld(objets)


POLICE = ("@font-face{font-family:'Figtree';font-style:normal;font-weight:300 900;font-display:swap;"
          "src:url('/fonts/figtree.woff2') format('woff2');"
          "unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,"
          "U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}\n")


def styles(helmet):
    m = re.search(r'<style>(.*?)</style>', helmet, re.S)
    reste = re.sub(r'<style>.*?</style>', '', helmet, flags=re.S)
    reste = re.sub(r'<link [^>]*fonts\.(googleapis|gstatic)\.com[^>]*>', '', reste)
    if reste.strip():
        raise SystemExit('Élément inattendu dans <helmet> : ' + reste.strip()[:200])
    return POLICE + m.group(1).strip()


def tete(nom, titre, description, chemin, css, ld, indexer=True):
    url = SITE + ('/' if chemin == '/' else chemin)
    t, d = (html.escape(x).replace('&#x27;', "'") for x in (titre, description))
    robots = '' if indexer else '<meta name="robots" content="noindex">\n'
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t}</title>
<meta name="description" content="{d}">
{robots}<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="tangram.cx">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/partage.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="tangram.cx : vos clients vous parlent, passez à l'action.">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1e1033">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/figtree.woff2" as="font" type="font/woff2" crossorigin>
<style>
{css}
</style>
{ld}<script src="/js/site.js" defer></script>
</head>
<body>
'''


def lire_page(nom):
    source = (MAQUETTE / f'{nom}.dc.html').read_text(encoding='utf-8')
    helmet = source[source.index('<helmet>') + 8:source.index('</helmet>')]
    corps = source[source.index('</helmet>') + 9:source.index('</x-dc>')].strip()
    corps = corps.replace('ref="{{poserRacine}}"', 'id="racine"')
    corps = comparateur(corps)
    if '{{' in corps:
        raise SystemExit(f'{nom} : valeur de la maquette non remplacée : ' + re.search(r'.{60}\{\{.{60}', corps).group(0))
    if 'claudeusercontent' in corps:
        raise SystemExit(f'{nom} : lien vers l\'éditeur de la maquette')
    return styles(helmet), remplacer_liens(corps)


def verifier(nom, page):
    for interdit in ('—', '·'):
        if interdit in texte(page):
            raise SystemExit(f'{nom} : caractère interdit {interdit!r}')
    if '.dc.html' in page or 'href="img/' in page or 'src="img/' in page:
        raise SystemExit(f'{nom} : lien de la maquette non converti')
    for lien in re.findall(r'href="([^"#]*)', page):
        if lien and not lien.startswith(('/', 'https://', 'mailto:')):
            raise SystemExit(f'{nom} : lien inattendu {lien}')
    if page.count('<h1') != 1:
        raise SystemExit(f'{nom} : il faut exactement un titre <h1>')
    for img in re.findall(r'<img [^>]*>', page):
        if 'alt="' not in img:
            raise SystemExit(f'{nom} : image sans texte alternatif')


def page_introuvable(css_modele, corps_modele):
    """Page 404 : le cadre (en-tête, pied) d'une page existante, avec un message simple."""
    debut = corps_modele.index('<main')
    fin = corps_modele.index('</main>') + 7
    principal = '''<main id="contenu">
<section style="padding: 96px 24px 128px;">
<div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: flex-start; gap: 20px;">
<h1 style="margin: 0; font-family: Figtree, sans-serif; font-weight: 700; font-size: clamp(38px, 5vw, 64px); line-height: 1.04;">Cette page n'existe pas.</h1>
<p style="margin: 0; font-size: 19px; color: #3a3350;">Elle a peut-être changé d'adresse. Vous cherchiez l'application ? Elle est sur <a href="https://app.tangram.cx">app.tangram.cx</a>.</p>
<a href="/" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 28px; border-radius: 999px; background: #1e1033; color: #ffffff; font-weight: 600; text-decoration: none;">Retour à l'accueil</a>
</div>
</section>
</main>'''
    corps = corps_modele[:debut] + principal + corps_modele[fin:]
    corps = corps.replace(' aria-current="page"', '')
    return tete('404', "Page introuvable | tangram.cx", "Cette page n'existe pas.", '/404', css_modele, '', indexer=False) + corps + '\n</body>\n</html>\n'


def plan_du_site():
    lignes = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for nom, (chemin, *_rest) in PAGES.items():
        priorite = '1.0' if chemin == '/' else ('0.3' if nom in ('MentionsLegales', 'Confidentialite', 'CGV', 'CGU', 'TraitementDonnees') else '0.8')
        lignes.append(f'<url><loc>{SITE}{"/" if chemin == "/" else chemin}</loc><lastmod>{AUJOURDHUI}</lastmod>'
                      f'<priority>{priorite}</priority></url>')
    lignes.append('</urlset>')
    return '\n'.join(lignes) + '\n'


ROBOTS = f'''# tangram.cx : tout le site peut être lu et cité, par les moteurs de recherche comme par les assistants IA.
User-agent: *
Allow: /
Disallow: /api/

Sitemap: {SITE}/sitemap.xml
'''


def llms(descriptions):
    lignes = ['# tangram.cx', '',
              "> tangram.cx est un logiciel français qui analyse par IA les commentaires libres des enquêtes de satisfaction, "
              "des avis en ligne et des réclamations. Il classe chaque commentaire par thème, tonalité et émotion, calcule "
              "des indicateurs suivis dans le temps et aide à décider des actions à mener.", '',
              "Points clés :",
              "- Les chiffres affichés sont calculés, jamais rédigés par l'IA : l'IA classe, le calcul compte.",
              "- Les réponses arrivent automatiquement depuis les outils d'enquête et le CRM, ou par simple dépôt de fichier.",
              "- Fonctionnalités : classement par thème, sous-thème, tonalité et émotion ; score net par sujet ; croisements "
              "avec les données de l'enquête ; personas ; repérage des clients sur le départ ; idées d'actions et plan "
              "d'action ; alertes par e-mail.",
              "- Données hébergées dans l'Union européenne, données personnelles masquées avant analyse, organisations cloisonnées.",
              "- Essai gratuit jusqu'à 500 commentaires ; abonnement à partir de 2 900 € HT par an ou 270 € HT par mois, selon le volume.",
              "- Usages : expérience client, expérience usager (secteur public), enquêtes RH et eNPS.",
              "- Contact : contact@tangram.cx", '',
              '## Pages principales', '']
    principales = ['V2', 'Solution', 'Tarifs', 'Securite', 'EnquetesRH']
    for nom in principales:
        chemin, titre, *_ = PAGES[nom]
        lignes.append(f'- [{titre.split(" | ")[0]}]({SITE}{chemin if chemin != "/" else "/"}): {descriptions[nom]}')
    lignes += ['', '## Secteurs', '']
    for nom in SECTEURS:
        chemin, _, _, libelle = PAGES[nom]
        lignes.append(f'- [{libelle}]({SITE}{chemin}): {descriptions[nom]}')
    lignes += ['', '## Autres', '', f'- [Mentions légales]({SITE}/mentions-legales)',
               f'- [Politique de confidentialité]({SITE}/confidentialite)',
               f'- [Conditions générales de vente]({SITE}/cgv)', f'- [Conditions générales d\'utilisation]({SITE}/cgu)',
               f'- [Accord de traitement des données]({SITE}/traitement-des-donnees)']
    return '\n'.join(lignes) + '\n'


def photos():
    (SORTIE / 'img').mkdir(parents=True, exist_ok=True)
    for jpg in sorted((MAQUETTE / 'img').glob('*.jpg')):
        with Image.open(jpg) as im:
            im = im.convert('RGB')
            if im.width > 1600:
                im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
            im.save(SORTIE / 'img' / (jpg.stem + '.webp'), 'WEBP', quality=78, method=6)


def principal():
    if SORTIE.exists():
        shutil.rmtree(SORTIE)
    SORTIE.mkdir()
    descriptions = {}
    modele = None
    for nom, (chemin, titre, description, _) in PAGES.items():
        css, corps = lire_page(nom)
        corps = formulaire(photo_principale(corps))
        descriptions[nom] = description
        page = tete(nom, titre, description, chemin, css, donnees_structurees(nom, corps)) + corps + '\n</body>\n</html>\n'
        verifier(nom, page)
        f = fichier_sortie(chemin)
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(page, encoding='utf-8')
        if nom == 'MentionsLegales':
            modele = (css, corps)
    (SORTIE / '404.html').write_text(page_introuvable(*modele), encoding='utf-8')
    (SORTIE / 'sitemap.xml').write_text(plan_du_site(), encoding='utf-8')
    (SORTIE / 'robots.txt').write_text(ROBOTS, encoding='utf-8')
    (SORTIE / 'llms.txt').write_text(llms(descriptions), encoding='utf-8')
    shutil.copytree(RESSOURCES / 'fonts', SORTIE / 'fonts')
    shutil.copytree(RESSOURCES / 'js', SORTIE / 'js')
    for icone in (RESSOURCES / 'icones').iterdir():
        shutil.copy(icone, SORTIE / icone.name)
    shutil.copy(RESSOURCES / 'partage.png', SORTIE / 'partage.png')
    photos()
    print(f'{len(PAGES)} pages fabriquées dans {SORTIE}')


if __name__ == '__main__':
    principal()
