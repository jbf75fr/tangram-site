import React from "react";
import { Easing, interpolate, spring } from "remotion";

// Couleurs du site (identité « Nuit et beurre », mêmes valeurs que l'application).
export const C = {
  fond: "#f3f1fa",
  blanc: "#ffffff",
  encre: "#1e1033",
  encreDouce: "#5b5170",
  gris: "#d9d5e3",
  grisClair: "#ebe8f2",
  iris: "#3a0ca3",
  irisPale: "#e6e0f7",
  beurre: "#ffe45c",
  beurrePale: "#fff3a6",
  vert: "#2e9e5b",
  vertTexte: "#1c7a43",
  vertFond: "#e3f4ea",
  rouge: "#e5584d",
  rougeTexte: "#b42318",
  rougeFond: "#fce6e3",
};

export const FPS = 30;
export const POLICE = "Figtree, sans-serif";
export const OMBRE = "0 24px 60px rgba(30,16,51,0.10), 0 4px 14px rgba(30,16,51,0.06)";

export const doux = Easing.bezier(0.2, 0.7, 0.2, 1);

// Valeur animée entre deux instants (en secondes), bornée aux extrémités.
export const entre = (
  t: number,
  debut: number,
  fin: number,
  de: number,
  a: number,
  easing: (n: number) => number = doux,
) =>
  interpolate(t, [debut, fin], [de, a], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

// Ressort qui démarre à l'instant « debut » (en secondes).
export const ressort = (t: number, debut: number, amorti = 14) =>
  spring({
    frame: Math.max(0, (t - debut) * FPS),
    fps: FPS,
    config: { damping: amorti, mass: 0.8, stiffness: 120 },
  });

// Les sept pièces du logo, sur une grille de 32 (voir favicon.svg du site).
export const PIECES_LOGO: { points: string; couleur: string }[] = [
  { points: "0,0 32,0 16,16", couleur: C.beurre },
  { points: "0,0 16,16 0,32", couleur: C.encre },
  { points: "32,16 32,32 16,32", couleur: C.encre },
  { points: "32,0 32,16 24,8", couleur: C.iris },
  { points: "16,16 24,24 8,24", couleur: C.iris },
  { points: "16,16 24,8 32,16 24,24", couleur: C.beurrePale },
  { points: "0,32 8,24 24,24 16,32", couleur: C.beurre },
];

export const Logo: React.FC<{ taille: number; contour?: string }> = ({ taille, contour = C.blanc }) => (
  <svg width={taille} height={taille} viewBox="-1 -1 34 34">
    {PIECES_LOGO.map((p, i) => (
      <polygon key={i} points={p.points} fill={p.couleur} stroke={contour} strokeWidth={1.1} strokeLinejoin="round" />
    ))}
  </svg>
);

export const Marque: React.FC<{ taille: number }> = ({ taille }) => (
  <span style={{ fontFamily: POLICE, fontWeight: 800, fontSize: taille, color: C.encre, letterSpacing: -0.02 * taille }}>
    tangram<span style={{ color: C.iris }}>.cx</span>
  </span>
);

// Petit triangle de tangram, utilisé comme pastille dans les étiquettes.
export const Triangle: React.FC<{ couleur: string; taille?: number; rotation?: number }> = ({ couleur, taille = 26, rotation = 0 }) => (
  <svg width={taille} height={taille} viewBox="0 0 32 32" style={{ transform: `rotate(${rotation}deg)`, flex: "none" }}>
    <polygon points="0,0 32,0 0,32" fill={couleur} />
  </svg>
);

export const Carte: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      position: "absolute",
      background: C.blanc,
      borderRadius: 28,
      boxShadow: OMBRE,
      fontFamily: POLICE,
      color: C.encre,
      ...style,
    }}
  >
    {children}
  </div>
);

// Pseudo-hasard stable d'une image à l'autre.
export const hasard = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const fmt = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const signe = (n: number) => (Math.round(n) > 0 ? "+" : "") + Math.round(n);
