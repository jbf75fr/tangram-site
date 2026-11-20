import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Carte, Cle, Logo, POLICE, entre, fmt, hasard, ressort, secousse, signe } from "../commun";

// Scène 3 (21 à 30 s) : des milliers de retours deviennent des indicateurs.
const SUJETS = [
  { nom: "Délais de livraison", pos: 0.18, score: -34 },
  { nom: "Accueil et conseil", pos: 0.78, score: 41 },
  { nom: "Prix", pos: 0.41, score: -8 },
  { nom: "Service après-vente", pos: 0.6, score: 12 },
  { nom: "Site et application", pos: 0.52, score: 3 },
];

const COLONNES = 41;
const LIGNES = 35;
const L = 120;
const H = 70;
const PAS_X = 136;
const PAS_Y = 86;

// Mur de commentaires : la caméra part du nôtre, au centre, et recule.
const Mur: React.FC<{ t: number }> = ({ t }) => {
  const cles: Cle[] = [
    [20.3, 960, 540, 3.2],
    [20.8, 960, 540, 3.0],
    [22.6, 960, 540, 0.55],
  ];
  const range = entre(t, 22.55, 23.15, 0, 1, (n) => n * n * n);
  if (t > 23.2) return null;
  const tuiles = [];
  for (let r = 0; r < LIGNES; r++) {
    for (let c = 0; c < COLONNES; c++) {
      const i = r * COLONNES + c;
      const x = 960 + (c - (COLONNES - 1) / 2) * PAS_X;
      const y = 540 + (r - (LIGNES - 1) / 2) * PAS_Y;
      const centre = r === (LIGNES - 1) / 2 && c === (COLONNES - 1) / 2;
      const ton = hasard(i);
      // Au rangement, chaque tuile file vers le centre, les plus proches d'abord.
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

const Indicateur: React.FC<{ t: number; i: number; libelle: string; children: React.ReactNode }> = ({ t, i, libelle, children }) => {
  const a = ressort(t, 23.05 + i * 0.07);
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

const Tableau: React.FC<{ t: number }> = ({ t }) => {
  if (t < 22.9) return null;
  const fenetre = ressort(t, 22.95, 13);
  const compte = entre(t, 23.1, 24.3, 1, 12480, (n) => 1 - Math.pow(1 - n, 3));
  const remplissage = entre(t, 23.2, 24.0, 0, 1);
  const priorite = ressort(t, 26.3, 10);
  const attenue = entre(t, 26.5, 26.9, 1, 0.4);
  const cles: Cle[] = [
    [23.3, 960, 540, 1.0],
    [25.6, 960, 560, 1.03],
    [26.1, 960, 690, 1.22],
    [29.5, 900, 690, 1.27],
    [30.35, 420, 531, 3.2],
  ];
  return (
    <Camera t={t} cles={cles} extra={secousse(t, [26.3], 0.03)}>
      <Carte
        style={{
          left: 140,
          top: 90,
          width: 1640,
          height: 900,
          overflow: "hidden",
          opacity: Math.min(1, fenetre * 2),
          transform: `scale(${1.25 - 0.25 * fenetre})`,
        }}
      >
        <div style={{ height: 76, display: "flex", alignItems: "center", gap: 16, padding: "0 36px", borderBottom: `2px solid ${C.grisClair}` }}>
          <Logo taille={36} />
          <div style={{ fontSize: 26, fontWeight: 800 }}>Tableau de bord</div>
          <div style={{ marginLeft: "auto", fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>Enquête satisfaction clients</div>
        </div>
        <div style={{ padding: "30px 36px" }}>
          <div style={{ display: "flex", gap: 22 }}>
            <Indicateur t={t} i={0} libelle="Commentaires analysés">
              <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14 }}>{fmt(compte)}</div>
            </Indicateur>
            <Indicateur t={t} i={1} libelle="Recommandation (NPS)">
              <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14 }}>{signe(entre(t, 23.2, 24.2, 0, -12))}</div>
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

          <div style={{ marginTop: 26, border: `2px solid ${C.grisClair}`, borderRadius: 22, padding: "26px 34px 16px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, opacity: entre(t, 24.6, 24.8, 0, 1) }}>Sujets qui influencent la satisfaction</div>
            {SUJETS.map((s, i) => {
              const a = ressort(t, 24.75 + i * 0.08);
              const barre = entre(t, 24.8 + i * 0.08, 25.3 + i * 0.08, 0, 1);
              const premier = i === 0;
              return (
                <div
                  key={s.nom}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 30,
                    height: 76,
                    padding: "0 18px",
                    margin: "0 -18px",
                    borderRadius: 16,
                    opacity: Math.min(1, a * 1.5) * (premier ? 1 : attenue),
                    transform: `translateX(${(1 - a) * 80}px)`,
                    background: premier ? `rgba(255,243,166,${priorite})` : "transparent",
                    boxShadow: premier ? `inset 0 0 0 ${3 * priorite}px ${C.beurre}` : "none",
                  }}
                >
                  <div style={{ width: 330, fontSize: 26, fontWeight: 700 }}>{s.nom}</div>
                  <div style={{ flex: 1, display: "flex", height: 16, borderRadius: 8, overflow: "hidden", background: C.grisClair }}>
                    <div style={{ width: `${s.pos * 100 * barre}%`, background: C.vert }} />
                    <div style={{ width: `${(1 - s.pos) * 100 * barre}%`, background: C.rouge }} />
                  </div>
                  <div style={{ width: 90, textAlign: "right", fontSize: 30, fontWeight: 800, color: s.score < 0 ? C.rougeTexte : C.vertTexte }}>{signe(s.score * barre)}</div>
                  <div style={{ width: 170, opacity: premier ? priorite : 0, transform: `scale(${0.5 + 0.5 * priorite})` }}>
                    {premier && <span style={{ background: C.encre, color: C.beurre, borderRadius: 999, padding: "8px 18px", fontSize: 22, fontWeight: 800 }}>Priorité</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Carte>
    </Camera>
  );
};

export const Scene3: React.FC<{ t: number }> = ({ t }) => {
  if (t < 20.05 || t > 30.45) return null;
  // Entrée : la scène monte depuis le bas.
  const entree = entre(t, 20.05, 20.6, 1, 0, (n) => 1 - Math.pow(1 - n, 3));
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: POLICE, overflow: "hidden", transform: `translateY(${entree * 1100}px)` }}>
      <Mur t={t} />
      <Tableau t={t} />
    </AbsoluteFill>
  );
};
