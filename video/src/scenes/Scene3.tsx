import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Carte, Cle, Logo, POLICE, entre, fmt, hasard, ressort, secousse, signe } from "../commun";

// Scène 3 (21 à 30 s) : des milliers de retours deviennent des indicateurs,
// la frise du parcours d'achat, puis la matrice de priorisation.

// ---------- Mur de commentaires ----------
const COLONNES = 41;
const LIGNES = 35;
const L = 120;
const H = 70;
const PAS_X = 136;
const PAS_Y = 86;

const Mur: React.FC<{ t: number }> = ({ t }) => {
  if (t > 22.7) return null;
  const cles: Cle[] = [
    [20.3, 960, 540, 3.2],
    [20.8, 960, 540, 3.0],
    [22.15, 960, 540, 0.55],
  ];
  const range = entre(t, 22.1, 22.65, 0, 1, (n) => n * n * n);
  const tuiles = [];
  for (let r = 0; r < LIGNES; r++) {
    for (let c = 0; c < COLONNES; c++) {
      const i = r * COLONNES + c;
      const x = 960 + (c - (COLONNES - 1) / 2) * PAS_X;
      const y = 540 + (r - (LIGNES - 1) / 2) * PAS_Y;
      const centre = r === (LIGNES - 1) / 2 && c === (COLONNES - 1) / 2;
      const ton = hasard(i);
      const d = Math.hypot(c - (COLONNES - 1) / 2, r - (LIGNES - 1) / 2) / 25;
      const u = Math.min(1, Math.max(0, range * 1.6 - d * 0.6));
      tuiles.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: x + (960 - x) * u - L / 2,
            top: y + (540 - y) * u - H / 2,
            width: L,
            height: H,
            borderRadius: 14,
            background: centre ? C.beurrePale : C.blanc,
            boxShadow: centre ? `0 0 0 4px ${C.beurre}` : "0 3px 8px rgba(30,16,51,0.06)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            padding: "0 16px",
            boxSizing: "border-box",
            opacity: 1 - u,
            transform: `scale(${1 - 0.7 * u})`,
          }}
        >
          <div style={{ height: 7, borderRadius: 4, width: `${60 + ton * 35}%`, background: ton < 0.45 ? C.rouge : ton < 0.8 ? C.vert : C.gris }} />
          <div style={{ height: 7, borderRadius: 4, width: `${40 + hasard(i + 5) * 40}%`, background: C.grisClair }} />
        </div>,
      );
    }
  }
  return (
    <Camera t={t} cles={cles}>
      {tuiles}
    </Camera>
  );
};

// ---------- Indicateurs ----------
const Indicateur: React.FC<{ t: number; i: number; libelle: string; children: React.ReactNode }> = ({ t, i, libelle, children }) => {
  const a = ressort(t, 22.65 + i * 0.07);
  return (
    <div
      style={{
        flex: 1,
        height: 190,
        borderRadius: 22,
        padding: "26px 30px",
        boxSizing: "border-box",
        background: C.blanc,
        border: `2px solid ${C.grisClair}`,
        opacity: Math.min(1, a * 1.5),
        transform: `translateY(${(1 - a) * 60}px) scale(${0.85 + 0.15 * a})`,
      }}
    >
      <div style={{ fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>{libelle}</div>
      {children}
    </div>
  );
};

// ---------- Frise du parcours ----------
const ETAPES = [
  { nom: "S'informer", score: 22 },
  { nom: "Commander", score: 9 },
  { nom: "Livraison", score: -34 },
  { nom: "Installation", score: 4 },
  { nom: "Service après-vente", score: -12 },
];
const X0 = 60;
const LARGEUR = 1448;
const COL = LARGEUR / ETAPES.length;
const ZERO = 250;
const ECHELLE = 3.6;
const PTS = ETAPES.map((e, i) => ({ x: X0 + COL / 2 + i * COL, y: ZERO - e.score * ECHELLE }));
const COURBE = (() => {
  let d = `M${X0},${PTS[0].y} L${PTS[0].x},${PTS[0].y}`;
  for (let i = 0; i < PTS.length - 1; i++) {
    const a = PTS[i];
    const b = PTS[i + 1];
    const m = (a.x + b.x) / 2;
    d += ` C${m},${a.y} ${m},${b.y} ${b.x},${b.y}`;
  }
  return d + ` L${X0 + LARGEUR},${PTS[PTS.length - 1].y}`;
})();
const DEBUT_FRISE = 23.2;
const DUREE_FRISE = 1.2;

const Frise: React.FC<{ t: number }> = ({ t }) => {
  const trace = entre(t, DEBUT_FRISE, DEBUT_FRISE + DUREE_FRISE, 0, 1, (n) => n);
  const alerte = ressort(t, 24.5, 9);
  const pouls = t > 24.5 ? 0.5 + 0.5 * Math.sin((t - 24.5) * 8) : 0;
  return (
    <svg width={1568} height={548} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={X0} y={90} width={LARGEUR} height={ZERO - 90} fill={C.vertFond} opacity={0.7} />
      <rect x={X0} y={ZERO} width={LARGEUR} height={410 - ZERO} fill={C.rougeFond} opacity={0.7} />
      <rect x={X0 + 2 * COL} y={ZERO} width={COL} height={410 - ZERO} fill={C.rouge} opacity={0.18 * alerte} />
      <line x1={X0} x2={X0 + LARGEUR} y1={ZERO} y2={ZERO} stroke={C.encreDouce} strokeWidth={2} strokeDasharray="6 8" opacity={0.5} />
      {ETAPES.slice(1).map((_, i) => (
        <line key={i} x1={X0 + (i + 1) * COL} x2={X0 + (i + 1) * COL} y1={90} y2={410} stroke={C.blanc} strokeWidth={3} />
      ))}
      <path d={COURBE} fill="none" stroke={C.encre} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trace} />
      {ETAPES.map((e, i) => {
        const p = PTS[i];
        const a = ressort(t, DEBUT_FRISE + (DUREE_FRISE * (i + 0.5)) / ETAPES.length, 11);
        const negatif = e.score < 0;
        const couleur = negatif ? C.rouge : C.vert;
        const livraison = i === 2;
        const r = 16 * a * (livraison ? 1 + 0.4 * alerte : 1);
        const yPastille = p.y - 52;
        return (
          <g key={e.nom}>
            {livraison && t > 24.5 && <circle cx={p.x} cy={p.y} r={r + 10 + 14 * pouls} fill="none" stroke={C.rouge} strokeWidth={4} opacity={0.5 * (1 - pouls)} />}
            <circle cx={p.x} cy={p.y} r={r} fill={couleur} stroke={C.blanc} strokeWidth={4} />
            <g opacity={a} transform={`translate(${p.x} ${yPastille}) scale(${(0.6 + 0.4 * a) * (livraison ? 1 + 0.3 * alerte : 1)})`}>
              <rect x={-48} y={-22} width={96} height={44} rx={22} fill={C.blanc} stroke={C.grisClair} strokeWidth={2} />
              <text x={0} y={9} textAnchor="middle" fontSize={26} fontWeight={800} fill={negatif ? C.rougeTexte : C.vertTexte} fontFamily="Figtree">
                {signe(e.score)}
              </text>
            </g>
            <g opacity={ressort(t, 23.0 + i * 0.06)}>
              <circle cx={p.x} cy={452} r={18} fill={C.beurre} />
              <text x={p.x} y={461} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.encre} fontFamily="Figtree">
                {i + 1}
              </text>
              <text x={p.x} y={505} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.encre} fontFamily="Figtree">
                {e.nom}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

// ---------- Matrice de priorisation ----------
const MX0 = 120;
const MX1 = 1508;
const MY0 = 90;
const MY1 = 470;
const MILIEU_X = 760;
const MILIEU_Y = 270;
const LIVRAISON = { x: 1290, y: 420 };
const BULLES = [
  { nom: "Délais de livraison", x: LIVRAISON.x, y: LIVRAISON.y, couleur: C.rouge },
  { nom: "Accueil et conseil", x: 1240, y: 140, couleur: C.vert },
  { nom: "Prix", x: 930, y: 330, couleur: C.rouge },
  { nom: "Service après-vente", x: 300, y: 175, couleur: C.iris },
  { nom: "Site et application", x: 450, y: 235, couleur: C.iris },
  { nom: "Disponibilité des produits", x: 260, y: 370, couleur: C.encreDouce },
];
const QUADRANTS = [
  { nom: "Maintenir", x: MX0 + 20, y: MY0 + 36, ancre: "start", couleur: C.iris },
  { nom: "Capitaliser", x: MX1 - 20, y: MY0 + 36, ancre: "end", couleur: C.vertTexte },
  { nom: "Surveiller", x: MX0 + 20, y: MY1 - 18, ancre: "start", couleur: C.encreDouce },
  { nom: "Agir vite", x: MX1 - 20, y: MY1 - 18, ancre: "end", couleur: C.rougeTexte },
];

const Matrice: React.FC<{ t: number }> = ({ t }) => {
  const priorite = ressort(t, 25.9, 9);
  const pouls = t > 25.9 ? 0.5 + 0.5 * Math.sin((t - 25.9) * 7) : 0;
  return (
    <svg width={1568} height={548} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={MILIEU_X} y={MILIEU_Y} width={MX1 - MILIEU_X} height={MY1 - MILIEU_Y} fill={C.rougeFond} opacity={0.4 + 0.6 * priorite} />
      <line x1={MX0} x2={MX1} y1={MY1} y2={MY1} stroke={C.gris} strokeWidth={3} />
      <line x1={MX0} x2={MX0} y1={MY0} y2={MY1} stroke={C.gris} strokeWidth={3} />
      <line x1={MILIEU_X} x2={MILIEU_X} y1={MY0} y2={MY1} stroke={C.encreDouce} strokeWidth={2} strokeDasharray="6 8" opacity={0.5} />
      <line x1={MX0} x2={MX1} y1={MILIEU_Y} y2={MILIEU_Y} stroke={C.encreDouce} strokeWidth={2} strokeDasharray="6 8" opacity={0.5} />
      <text x={MX1} y={MY1 + 40} textAnchor="end" fontSize={22} fontWeight={600} fill={C.encreDouce} fontFamily="Figtree">
        Volume →
      </text>
      {QUADRANTS.map((q, i) => (
        <text
          key={q.nom}
          x={q.x}
          y={q.y}
          textAnchor={q.ancre as "start" | "end"}
          fontSize={q.nom === "Agir vite" ? 30 + 6 * priorite : 26}
          fontWeight={800}
          fill={q.couleur}
          fontFamily="Figtree"
          opacity={ressort(t, 25.5 + i * 0.05)}
        >
          {q.nom}
        </text>
      ))}
      {BULLES.map((b, i) => {
        const a = ressort(t, 25.55 + i * 0.06, 11);
        const premiere = i === 0;
        const r = 18 * a * (premiere ? 1 + 0.5 * priorite : 1);
        return (
          <g key={b.nom} opacity={Math.min(1, a * 2) * (premiere ? 1 : entre(t, 26.1, 26.4, 1, 0.45))}>
            {premiere && t > 25.9 && <circle cx={b.x} cy={b.y} r={r + 10 + 14 * pouls} fill="none" stroke={C.rouge} strokeWidth={4} opacity={0.5 * (1 - pouls)} />}
            <circle cx={b.x} cy={b.y} r={r} fill={b.couleur} stroke={C.blanc} strokeWidth={4} />
            <text x={b.x < MILIEU_X ? b.x + r + 14 : b.x - r - 14} y={b.y + 9} textAnchor={b.x < MILIEU_X ? "start" : "end"} fontSize={premiere ? 28 : 24} fontWeight={premiere ? 800 : 700} fill={C.encre} fontFamily="Figtree">
              {b.nom}
            </text>
          </g>
        );
      })}
      <g opacity={priorite} transform={`translate(${LIVRAISON.x - 280} ${LIVRAISON.y - 70}) scale(${0.5 + 0.5 * priorite})`}>
        <rect x={0} y={0} width={150} height={44} rx={22} fill={C.encre} />
        <text x={75} y={30} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.beurre} fontFamily="Figtree">
          Priorité
        </text>
      </g>
    </svg>
  );
};

// ---------- Tableau de bord ----------
const BASCULE = 25.35;

const Tableau: React.FC<{ t: number }> = ({ t }) => {
  if (t < 22.5) return null;
  const fenetre = ressort(t, 22.55, 13);
  const compte = entre(t, 22.7, 23.9, 1, 12480, (n) => 1 - Math.pow(1 - n, 3));
  const remplissage = entre(t, 22.8, 23.6, 0, 1);
  const bascule = entre(t, BASCULE, BASCULE + 0.3, 0, 1);
  const carte = ressort(t, 22.9, 13);
  const cles: Cle[] = [
    [22.9, 960, 540, 1.0],
    [23.3, 960, 640, 1.12],
    [25.3, 960, 660, 1.14],
    [25.9, 1000, 740, 1.15],
    [29.4, 1000, 740, 1.2],
    [30.3, 140 + 36 + LIVRAISON.x, 90 + 322 + LIVRAISON.y, 3.6],
  ];
  return (
    <Camera t={t} cles={cles} extra={secousse(t, [24.5, 25.9], 0.025)}>
      <Carte style={{ left: 140, top: 90, width: 1640, height: 900, overflow: "hidden", opacity: Math.min(1, fenetre * 2), transform: `scale(${1.25 - 0.25 * fenetre})` }}>
        <div style={{ height: 76, display: "flex", alignItems: "center", gap: 16, padding: "0 36px", borderBottom: `2px solid ${C.grisClair}` }}>
          <Logo taille={36} />
          <div style={{ fontSize: 26, fontWeight: 800 }}>Tableau de bord</div>
          <div style={{ marginLeft: "auto", fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>Parcours d'achat</div>
        </div>
        <div style={{ position: "absolute", left: 36, top: 106, width: 1568, display: "flex", gap: 22 }}>
          <Indicateur t={t} i={0} libelle="Commentaires analysés">
            <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14 }}>{fmt(compte)}</div>
          </Indicateur>
          <Indicateur t={t} i={1} libelle="Recommandation (NPS)">
            <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14 }}>{signe(entre(t, 22.8, 23.8, 0, -12))}</div>
          </Indicateur>
          <Indicateur t={t} i={2} libelle="Tonalité">
            <div style={{ display: "flex", height: 22, borderRadius: 11, overflow: "hidden", marginTop: 34, background: C.grisClair }}>
              <div style={{ width: `${58 * remplissage}%`, background: C.vert }} />
              <div style={{ width: `${42 * remplissage}%`, background: C.rouge }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 700, marginTop: 14 }}>
              <span style={{ color: C.vertTexte }}>{Math.round(58 * remplissage)} % positif</span>
              <span style={{ color: C.rougeTexte }}>{Math.round(42 * remplissage)} % négatif</span>
            </div>
          </Indicateur>
          <Indicateur t={t} i={3} libelle="Clients à risque de départ">
            <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14, color: C.rougeTexte }}>{fmt(compte * 0.15)}</div>
          </Indicateur>
        </div>

        <div
          style={{
            position: "absolute",
            left: 36,
            top: 322,
            width: 1568,
            height: 548,
            borderRadius: 22,
            border: `2px solid ${C.grisClair}`,
            boxSizing: "border-box",
            opacity: Math.min(1, carte * 2),
            transform: `translateY(${(1 - carte) * 60}px)`,
          }}
        >
          <div style={{ position: "absolute", left: 34, top: 26, fontSize: 28, fontWeight: 800 }}>
            <span style={{ opacity: 1 - bascule }}>Parcours client</span>
            <span style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", opacity: bascule }}>Matrice de priorisation</span>
          </div>
          <div style={{ position: "absolute", right: 34, top: 20, width: 300, height: 52, borderRadius: 999, background: C.grisClair }}>
            <div style={{ position: "absolute", top: 4, left: 4 + 146 * bascule, width: 146, height: 44, borderRadius: 999, background: C.encre }} />
            {["Frise", "Matrice"].map((v, i) => (
              <div key={v} style={{ position: "absolute", top: 0, left: i * 150, width: 150, height: 52, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: (i === 0 ? 1 - bascule : bascule) > 0.5 ? C.blanc : C.encreDouce }}>
                {v}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - bascule, transform: `scale(${1 - 0.05 * bascule})` }}>{t < BASCULE + 0.3 && <Frise t={t} />}</div>
          <div style={{ position: "absolute", inset: 0, opacity: bascule, transform: `scale(${0.95 + 0.05 * bascule})` }}>{t > BASCULE && <Matrice t={t} />}</div>
        </div>
      </Carte>
    </Camera>
  );
};

export const Scene3: React.FC<{ t: number }> = ({ t }) => {
  if (t < 20.05 || t > 30.45) return null;
  const entree = entre(t, 20.05, 20.6, 1, 0, (n) => 1 - Math.pow(1 - n, 3));
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: POLICE, overflow: "hidden", transform: `translateY(${entree * 1100}px)` }}>
      <Mur t={t} />
      <Tableau t={t} />
    </AbsoluteFill>
  );
};
