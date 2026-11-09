// Formulaire de demande d'essai du site : envoie la demande par e-mail via Brevo.
// Variables d'environnement (projet Vercel du site, jamais dans le dépôt) :
//   BREVO_CLE_API          clé d'API Brevo (la même que celle du serveur de l'application)
//   CONTACT_DESTINATAIRE   adresse qui reçoit les demandes (par défaut contact@tangram.cx)
//   CONTACT_EXPEDITEUR     adresse d'envoi validée dans Brevo (par défaut ne-pas-repondre@tangram.cx)
// La personne qui écrit est mise en « répondre à » : un clic sur Répondre lui écrit directement.

const LIMITES = { nom: 120, email: 200, organisation: 160, type: 80, message: 3000 };

function lireCorps(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return Object.fromEntries(new URLSearchParams(req.body)); }
  }
  return {};
}

function nettoyer(valeur, max) {
  return String(valeur ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
}

function echapper(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = async function handler(req, res) {
  const navigateur = (req.headers['content-type'] || '').includes('application/json');
  const repondre = (code, json) => {
    if (navigateur) return res.status(code).json(json);
    // Envoi sans JavaScript : retour sur la page d'accueil.
    res.statusCode = 303;
    res.setHeader('Location', code === 200 ? '/?demande=envoyee#essai' : '/?demande=erreur#essai');
    return res.end();
  };
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }
  const corps = lireCorps(req);
  // Robot : champ piège rempli, ou formulaire envoyé en moins de 3 secondes. Réponse « ok » pour ne rien lui apprendre.
  if (corps.site_web || (corps.duree && Number(corps.duree) < 3000)) return repondre(200, { ok: true });

  const d = {};
  for (const [champ, max] of Object.entries(LIMITES)) d[champ] = nettoyer(corps[champ], max);
  if (!d.nom || !d.organisation || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    return repondre(400, { erreur: 'Champs manquants ou e-mail invalide' });
  }
  const cle = process.env.BREVO_CLE_API;
  if (!cle) {
    console.error('contact : BREVO_CLE_API absente');
    return repondre(503, { erreur: 'Envoi indisponible' });
  }
  const destinataire = process.env.CONTACT_DESTINATAIRE || 'contact@tangram.cx';
  const expediteur = process.env.CONTACT_EXPEDITEUR || 'ne-pas-repondre@tangram.cx';
  const lignes = [
    ['Nom', d.nom], ['E-mail', d.email], ['Organisation', d.organisation], ['Type', d.type], ['Besoin', d.message || '(non précisé)'],
  ];
  const texte = lignes.map(([k, v]) => `${k} : ${v}`).join('\n');
  const htmlContenu = '<p>Nouvelle demande d\'essai depuis le site tangram.cx.</p><table>' +
    lignes.map(([k, v]) => `<tr><th align="left" valign="top">${k}</th><td style="white-space:pre-wrap">${echapper(v)}</td></tr>`).join('') +
    '</table>';
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': cle, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Site tangram.cx', email: expediteur },
        to: [{ email: destinataire }],
        replyTo: { email: d.email, name: d.nom },
        subject: `Demande d'essai : ${d.organisation}`,
        textContent: texte,
        htmlContent: htmlContenu,
      }),
    });
    if (!r.ok) {
      console.error('contact : Brevo a refusé l\'envoi', r.status);
      return repondre(502, { erreur: 'Envoi refusé' });
    }
    return repondre(200, { ok: true });
  } catch (e) {
    console.error('contact : Brevo injoignable');
    return repondre(502, { erreur: 'Envoi impossible' });
  }
};
