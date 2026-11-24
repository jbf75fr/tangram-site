import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Carte, Cle, Logo, POLICE, camera, entre, fmt, hasard, ressort, secousse, signe } from "../commun";

// Scène 3 (21 à 30 s) : des milliers de retours deviennent des indicateurs, puis la frise du parcours d'achat,
// parcourue par une pièce de tangram qui plonge dans les sous-étapes de la Livraison.

// ---------- Mur de commentaires ----------
const COLONNES = 41;
const LIGNES = 35;
const L = 120;
const H = 70;
const PAS_X = 136;
const PAS_Y = 86;

const Mur: React.FC<{ t: number }> = ({ t }) => {
  if (t > 22.1) return null;
  const cles: Cle[] = [
    [20.3, 960, 540, 3.2],
    [20.8, 960, 540, 3.0],
    [21.6, 960, 540, 0.55],
  ];
  const range = entre(t, 21.55, 22.05, 0, 1, (n) => n * n * n);
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
  const a = ressort(t, FIN_PP - 0.15 + i * 0.06);
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

// ---------- Parcours : une seule frise, parcourue par une pièce de tangram ----------
// Pas de changement de vue : la caméra suit la pièce et plonge dans le creux de la Livraison,
// où les sous-étapes se révèlent au fil du zoom (c'est le même tracé, vu de plus près).
const X0 = 60;
const LARGEUR = 1448;
const COL = LARGEUR / 5;
const ZERO = 250;
const ECH = 3.4;
const ECH_SOUS = 2.6;
const ETAPES = [
  { nom: "S'informer", score: 22 },
  { nom: "Commander", score: 9 },
  { nom: "Livraison", score: -34 },
  { nom: "Installation", score: 4 },
  { nom: "Service après-vente", score: -12 },
];
const SOUS = [
  { nom: "Expédition", score: -8 },
  { nom: "Délai de livraison", score: -52 },
  { nom: "Suivi du colis", score: -21 },
  { nom: "Remise", score: 12 },
];
const L0 = X0 + 2 * COL;
const SCOL = COL / 4;
const centreEtape = (i: number) => X0 + COL / 2 + i * COL;
const PTS_SOUS = SOUS.map((e, i) => ({ x: L0 + SCOL / 2 + i * SCOL, y: ZERO - e.score * ECH_SOUS }));
// Deux versions du même tracé : de loin, une courbe lisse dont le creux est la Livraison (-34) ;
// de près, le creux révèle les sous-étapes. On passe de l'une à l'autre avec le zoom.
type Point = { x: number; y: number };
const yBezier = (pts: Point[], x: number) => {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (x <= b.x) {
      const m = (a.x + b.x) / 2;
      let bas = 0;
      let haut = 1;
      for (let k = 0; k < 30; k++) {
        const u = (bas + haut) / 2;
        const v = 1 - u;
        const xu = v * v * v * a.x + 3 * v * v * u * m + 3 * v * u * u * m + u * u * u * b.x;
        if (xu < x) bas = u;
        else haut = u;
      }
      const u = (bas + haut) / 2;
      const v = 1 - u;
      return v * v * v * a.y + 3 * v * v * u * a.y + 3 * v * u * u * b.y + u * u * u * b.y;
    }
  }
  return pts[pts.length - 1].y;
};
const DEBUT_TRACE = { x: X0, y: ZERO - 22 * ECH };
const FIN_TRACE = { x: X0 + LARGEUR, y: ZERO + 12 * ECH };
const ETAPES_PTS = ETAPES.map((e, i) => ({ x: centreEtape(i), y: ZERO - e.score * ECH }));
const LISSE = [DEBUT_TRACE, ...ETAPES_PTS, FIN_TRACE];
const traceA = (d: number): Point[] => [
  DEBUT_TRACE,
  ETAPES_PTS[0],
  ETAPES_PTS[1],
  ...PTS_SOUS.map((p) => ({ x: p.x, y: yBezier(LISSE, p.x) + (p.y - yBezier(LISSE, p.x)) * d })),
  ETAPES_PTS[3],
  ETAPES_PTS[4],
  FIN_TRACE,
];
const chemin = (pts: Point[]) =>
  pts.reduce((c, p, i) => (i === 0 ? `M${p.x},${p.y}` : `${c} C${(pts[i - 1].x + p.x) / 2},${pts[i - 1].y} ${(pts[i - 1].x + p.x) / 2},${p.y} ${p.x},${p.y}`), "");

// Vol en rase-mottes au-dessus de la frise basculée dans l'espace, puis la feuille se redresse.
const DEBUT_VOL = 21.95;
const REDRESSE = 23.9;
const FIN_PP = 24.75;
const ANGLE_VOL = 60;
const PERSPECTIVE = 1800;
// Pendant le vol, la pièce est dans le tiers gauche de l'écran : la frise file jusqu'au bord droit.
const DECALAGE_VOL = 320;
const DEBUT_FRISE = DEBUT_VOL - 0.8;
const PIRE = 25.9;
const CITATION = 26.45;
const DEPART_CITATION = 27.3;
const lisse = (n: number) => n * n * (3 - 2 * n);
const accelere = (n: number) => n * n;
// Trajet de la pièce : [instant, abscisse, façon d'avancer]. Elle accélère dans les descentes.
const TRAJET: [number, number, (n: number) => number][] = [
  // Vol en rase-mottes : la pièce traverse S'informer et arrive sur Commander.
  [DEBUT_VOL, X0 + 2, lisse],
  [FIN_PP, centreEtape(1), (n) => 1 - Math.pow(1 - n, 1.6)],
  [25.4, PTS_SOUS[0].x, accelere],
  [PIRE, PTS_SOUS[1].x, lisse],
  [27.35, PTS_SOUS[1].x, lisse],
  [27.75, PTS_SOUS[2].x, lisse],
  [28.1, PTS_SOUS[3].x, accelere],
  [28.6, centreEtape(3), lisse],
  [29.1, centreEtape(4), lisse],
  [29.6, X0 + LARGEUR - 24, lisse],
];
const xPiece = (t: number) => {
  if (t <= TRAJET[0][0]) return TRAJET[0][1];
  for (let i = 1; i < TRAJET.length; i++) {
    const [t1, x1, f] = TRAJET[i];
    const [t0, x0] = TRAJET[i - 1];
    if (t <= t1) return x0 + (x1 - x0) * f((t - t0) / (t1 - t0));
  }
  return TRAJET[TRAJET.length - 1][1];
};

// Caméra du tableau de bord (coordonnées de la page) : la colonne Livraison est centrée en x = 960.
const CLES_SUITE: Cle[] = [
  // La feuille redressée tombe exactement sur ce cadrage (centre 960 x 660, zoom 1,14).
  [FIN_PP, 960, 660, 1.14],
  [24.85, 960, 660, 1.14],
  [25.45, 960, 732, 4.2],
  [27.55, 960, 732, 4.2],
  [28.4, 960, 660, 1.14],
  [30.45, 1000, 680, 1.2],
];
// Origine de la frise dans la page.
const OX = 140 + 36;
const OY = 90 + 322;
// Position de la pièce dans la page : pendant le vol, la caméra la garde au centre de l'écran.
const posPiece = (t: number): [number, number] => {
  const x = xPiece(t);
  return [OX + x, OY + yBezier(traceA(0), x)];
};
const ZOOM_VOL = 2.6;
const clesTableau = (t: number): Cle[] =>
  t < REDRESSE ? [[0, ...posPiece(t), ZOOM_VOL]] : [[REDRESSE, ...posPiece(REDRESSE), ZOOM_VOL], ...CLES_SUITE];

const Frise: React.FC<{ t: number }> = ({ t }) => {
  const z = camera(t, clesTableau(t)).z;
  const trace = 1;
  const principal = t > FIN_PP ? 1 - entre(z, 1.3, 2.0, 0, 1) : 1;
  const detail = t > FIN_PP ? entre(z, 2.0, 3.4, 0, 1) : 0;
  // Le creux se transforme dès que la caméra commence à plonger.
  // (seulement pendant la plongée dans la Livraison, pas pendant le zoom du départ sur les rails).
  const forme = t > FIN_PP ? entre(z, 1.3, 3.0, 0, 1, (n) => n * n * (3 - 2 * n)) : 0;
  const pts = traceA(forme);
  const yAuPoint = (x: number) => yBezier(pts, x);
  const alerte = ressort(t, PIRE, 9);
  const pouls = t > PIRE ? 0.5 + 0.5 * Math.sin((t - PIRE) * 8) : 0;
  const approche = ressort(t, 24.3, 10);
  // La pièce : un triangle du logo, posé sur le tracé et incliné selon la pente.
  const xp = xPiece(t);
  const yp = yAuPoint(xp);
  const pente = Math.atan2(yAuPoint(xp + 1.5) - yAuPoint(xp - 1.5), 3);
  const secousseImpact = t > PIRE ? Math.sin((t - PIRE) * 38) * 14 * Math.exp(-(t - PIRE) * 5) : 0;
  const taille = 34 / z;
  // Pendant le vol, la pièce est dessinée hors de la feuille basculée (PieceVol), face à nous.
  const visible = t < FIN_PP ? 0 : 1;
  const ty = (p: { y: number }) => p.y;
  return (
    <svg width={1568} height={548} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={X0} y={90} width={LARGEUR} height={ZERO - 90} fill={C.vertFond} opacity={0.7} />
      <rect x={X0} y={ZERO} width={LARGEUR} height={410 - ZERO} fill={C.rougeFond} opacity={0.7} />
      <rect x={L0} y={ZERO} width={COL} height={410 - ZERO} fill={C.rouge} opacity={0.14 * approche} />
      <line x1={X0} x2={X0 + LARGEUR} y1={ZERO} y2={ZERO} stroke={C.encreDouce} strokeWidth={2 / Math.max(1, z * 0.6)} strokeDasharray="6 8" opacity={0.5} />
      {ETAPES.slice(1).map((_, i) => (
        <line key={i} x1={X0 + (i + 1) * COL} x2={X0 + (i + 1) * COL} y1={90} y2={410} stroke={C.blanc} strokeWidth={3} />
      ))}
      {/* Séparations des sous-étapes, visibles en s'approchant. */}
      {SOUS.slice(1).map((_, i) => (
        <line key={i} x1={L0 + (i + 1) * SCOL} x2={L0 + (i + 1) * SCOL} y1={90} y2={410} stroke={C.blanc} strokeWidth={0.8} opacity={detail} />
      ))}
      <rect x={L0 + SCOL} y={ZERO} width={SCOL} height={410 - ZERO} fill={C.rouge} opacity={0.18 * alerte * detail} />
      <path d={chemin(pts)} fill="none" stroke={C.encre} strokeWidth={5 / Math.max(1, z * 0.55)} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trace} />

      {/* Étapes principales : points, scores, numéros et noms. Ils s'effacent quand on s'approche. */}
      <g opacity={principal}>
        {ETAPES.map((e, i) => {
          const x = centreEtape(i);
          const y = i === 2 ? yAuPoint(x) : ty({ y: ZERO - e.score * ECH });
          const a = ressort(t, DEBUT_FRISE + (1.0 * (i + 0.5)) / 5, 11);
          const negatif = e.score < 0;
          return (
            <g key={e.nom}>
              <circle cx={x} cy={y} r={14 * a} fill={negatif ? C.rouge : C.vert} stroke={C.blanc} strokeWidth={4} />
              <g opacity={a} transform={`translate(${x} ${y - 50}) scale(${0.6 + 0.4 * a})`}>
                <rect x={-46} y={-21} width={92} height={42} rx={21} fill={C.blanc} stroke={C.grisClair} strokeWidth={2} />
                <text x={0} y={9} textAnchor="middle" fontSize={25} fontWeight={800} fill={negatif ? C.rougeTexte : C.vertTexte} fontFamily="Figtree">
                  {signe(e.score)}
                </text>
              </g>
              <g opacity={ressort(t, DEBUT_VOL - 0.5 + i * 0.05)}>
                <circle cx={x} cy={452} r={18} fill={C.beurre} />
                <text x={x} y={461} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.encre} fontFamily="Figtree">
                  {i + 1}
                </text>
                <text x={x} y={505} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.encre} fontFamily="Figtree">
                  {e.nom}
                </text>
              </g>
            </g>
          );
        })}
      </g>

      {/* Sous-étapes de la Livraison, à l'échelle du zoom (environ 4 fois). */}
      <g opacity={detail}>
        {SOUS.map((e, i) => {
          const p = PTS_SOUS[i];
          const pire = i === 1;
          const negatif = e.score < 0;
          const r = 4.2 * (pire ? 1 + 0.45 * alerte : 1);
          return (
            <g key={e.nom}>
              {pire && t > PIRE && <circle cx={p.x} cy={p.y} r={r + 3 + 4 * pouls} fill="none" stroke={C.rouge} strokeWidth={1.2} opacity={0.5 * (1 - pouls)} />}
              <circle cx={p.x} cy={p.y} r={r} fill={negatif ? C.rouge : C.vert} stroke={C.blanc} strokeWidth={1.2} />
              <g transform={`translate(${p.x} ${p.y - 15}) scale(${pire ? 1 + 0.3 * alerte : 1})`}>
                <rect x={-12} y={-6} width={24} height={12} rx={6} fill={C.blanc} stroke={C.grisClair} strokeWidth={0.5} />
                <text x={0} y={2.6} textAnchor="middle" fontSize={7.4} fontWeight={800} fill={negatif ? C.rougeTexte : C.vertTexte} fontFamily="Figtree">
                  {signe(e.score)}
                </text>
              </g>
              <text x={p.x} y={p.y + 19} textAnchor="middle" fontSize={6.2} fontWeight={700} fill={C.encre} fontFamily="Figtree">
                {e.nom}
              </text>
            </g>
          );
        })}
      </g>

      {/* La pièce de tangram qui parcourt le tracé. */}
      <g
        opacity={Math.min(1, visible * 2)}
        transform={`translate(${xp} ${yp}) rotate(${(pente * 180) / Math.PI + secousseImpact}) scale(${taille * (0.5 + 0.5 * visible)})`}
      >
        <polygon points="-1,-0.12 1,-0.12 -1,-1.9" fill={C.beurre} stroke={C.encre} strokeWidth={0.14} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// La phrase du client, accrochée au point le plus bas (position à l'écran pendant le zoom).
const Citation: React.FC<{ t: number }> = ({ t }) => {
  if (t < CITATION || t > DEPART_CITATION + 0.3) return null;
  const a = ressort(t, CITATION, 12) * (1 - entre(t, DEPART_CITATION, DEPART_CITATION + 0.25, 0, 1));
  const p = PTS_SOUS[1];
  const z = 4.2;
  const sx = 960 + (OX + p.x - 960) * z;
  const sy = 540 + (OY + p.y - 732) * z;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={sx - 30} y1={sy - 10} x2={700} y2={sy - 70} stroke={C.encre} strokeWidth={3} strokeDasharray="3 8" strokeLinecap="round" opacity={a} />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 1920 - 700,
          top: sy - 108,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 26px",
          borderRadius: 22,
          background: C.encre,
          color: C.blanc,
          boxShadow: "0 18px 40px rgba(30,16,51,0.25)",
          opacity: Math.min(1, a * 2),
          transform: `translateX(${(1 - a) * -60}px) scale(${0.7 + 0.3 * a})`,
          transformOrigin: "100% 50%",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, color: C.beurre }}>Note : 6 / 10</span>
        <span style={{ fontSize: 34, fontWeight: 700 }}>« trois semaines pour être livré »</span>
      </div>
    </>
  );
};

// ---------- Tableau de bord ----------
// Passage à la scène 4 : la scène 3 est poussée vers la gauche.
export const POUSSEE = [30.0, 30.45];
const enDouceur = (n: number) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2);

const Tableau: React.FC<{ t: number }> = ({ t }) => {
  if (t < DEBUT_VOL - 0.05) return null;
  const fenetre = ressort(t, 21.3, 13);
  const compte = entre(t, FIN_PP - 0.1, FIN_PP + 1.0, 1, 12480, (n) => 1 - Math.pow(1 - n, 3));
  const remplissage = entre(t, FIN_PP, FIN_PP + 0.8, 0, 1);
  const carte = ressort(t, 21.3, 13);
  return (
    <Camera t={t} cles={clesTableau(t)} extra={secousse(t, [PIRE], 0.015)}>
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
            <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14 }}>{signe(entre(t, FIN_PP, FIN_PP + 0.9, 0, -12))}</div>
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
          <div style={{ position: "absolute", left: 34, top: 26, fontSize: 28, fontWeight: 800, opacity: 1 - entre(camera(t, clesTableau(t)).z, 1.6, 2.4, 0, 1) }}>Parcours client</div>
          <Frise t={t} />
        </div>
      </Carte>
    </Camera>
  );
};

const angleVol = (t: number) => (t >= FIN_PP ? 0 : ANGLE_VOL * (1 - entre(t, REDRESSE, FIN_PP, 0, 1, enDouceur)));
// Projection d'un point de l'écran (avant bascule) par la rotation de la feuille autour du centre.
const projette = (sx: number, sy: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  const dx = sx - 960;
  const ox = 960 - DECALAGE_VOL;
  const xr = 960 + dx * Math.cos(a) - DECALAGE_VOL * (angle / ANGLE_VOL);
  const profondeur = dx * Math.sin(a);
  const k = PERSPECTIVE / (PERSPECTIVE + profondeur);
  return { x: ox + (xr - ox) * k, y: 540 + (sy - 540) * k, k };
};
// La pièce pendant le vol : dessinée face à nous, posée sur la courbe, à la même taille que sur la frise.
const PieceVol: React.FC<{ t: number }> = ({ t }) => {
  if (t < DEBUT_VOL - 0.05 || t >= FIN_PP) return null;
  const angle = angleVol(t);
  const c = camera(t, clesTableau(t));
  const [ax, ay] = posPiece(t);
  const p = projette(960 + (ax - c.x) * c.z, 540 + (ay - c.y) * c.z, angle);
  const x = xPiece(t);
  const pente = Math.atan2(yBezier(traceA(0), x + 1.5) - yBezier(traceA(0), x - 1.5), 3);
  const rot = Math.atan2(Math.sin(pente), Math.cos(pente) * Math.cos((angle * Math.PI) / 180));
  const s = 34 * p.k;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(${p.x} ${p.y}) rotate(${(rot * 180) / Math.PI}) scale(${s})`}>
        <polygon points="-1,-0.12 1,-0.12 -1,-1.9" fill={C.beurre} stroke={C.encre} strokeWidth={0.14} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export const Scene3: React.FC<{ t: number }> = ({ t }) => {
  if (t < 20.05 || t > POUSSEE[1]) return null;
  const entree = entre(t, 20.05, 20.6, 1, 0, (n) => 1 - Math.pow(1 - n, 3));
  const poussee = entre(t, POUSSEE[0], POUSSEE[1], 0, 1, enDouceur);
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: POLICE, overflow: "hidden", transform: `translate(${-poussee * 1920}px, ${entree * 1100}px)` }}>
      <Mur t={t} />
      {/* La frise basculée : vue en rase-mottes, puis la feuille se redresse face à nous. */}
      <div style={{ position: "absolute", inset: 0, perspective: `${PERSPECTIVE}px`, perspectiveOrigin: `${960 - DECALAGE_VOL}px 540px` }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 540px", transform: angleVol(t) > 0.01 ? `translateX(${-DECALAGE_VOL * (angleVol(t) / ANGLE_VOL)}px) rotateY(${angleVol(t)}deg)` : undefined }}>
          <Tableau t={t} />
        </div>
      </div>
      <PieceVol t={t} />
      <Citation t={t} />
    </AbsoluteFill>
  );
};
