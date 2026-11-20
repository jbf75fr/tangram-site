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
export const ressort = (t: number, debut: number, amorti = 15) =>
  spring({
    frame: Math.max(0, (t - debut) * FPS),
    fps: FPS,
    config: { damping: amorti, mass: 0.55, stiffness: 240 },
  });

// Caméra : suite de clés [instant, x visé, y visé, zoom]. Le flou suit la vitesse.
export type Cle = [number, number, number, number];
const vif = Easing.bezier(0.76, 0, 0.24, 1);
export const camera = (t: number, cles: Cle[]) => {
  if (t <= cles[0][0]) return { x: cles[0][1], y: cles[0][2], z: cles[0][3] };
  for (let i = 0; i < cles.length - 1; i++) {
    const [t0, x0, y0, z0] = cles[i];
    const [t1, x1, y1, z1] = cles[i + 1];
    if (t <= t1) {
      const u = vif((t - t0) / (t1 - t0));
      return { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u, z: z0 * Math.pow(z1 / z0, u) };
    }
  }
  const d = cles[cles.length - 1];
  return { x: d[1], y: d[2], z: d[3] };
};

// Petit à-coup de zoom à chaque instant donné (apparition d'une étiquette, clic).
export const secousse = (t: number, instants: number[], force = 0.025) =>
  instants.reduce((acc, i) => acc + (t >= i ? force * Math.exp(-(t - i) * 9) : 0), 0);

export const Camera: React.FC<{ t: number; cles: Cle[]; extra?: number; children: React.ReactNode }> = ({ t, cles, extra = 0, children }) => {
  const c = camera(t, cles);
  const p = camera(t - 1 / FPS, cles);
  const vitesse = Math.hypot(c.x - p.x, c.y - p.y) * c.z + Math.abs(Math.log(c.z / p.z)) * 900;
  const flou = Math.min(14, Math.max(0, vitesse - 6) * 0.25);
  const z = c.z * (1 + extra);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        transformOrigin: "0 0",
        transform: `translate(960px, 540px) scale(${z}) translate(${-c.x}px, ${-c.y}px)`,
        filter: flou > 0.3 ? `blur(${flou}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

export const Curseur: React.FC<{ x: number; y: number; appui?: boolean; opacite?: number }> = ({ x, y, appui, opacite = 1 }) => (
  <svg
    width={44}
    height={52}
    viewBox="0 0 22 26"
    style={{ position: "absolute", left: x, top: y, opacity: opacite, transform: `scale(${appui ? 0.85 : 1})`, transformOrigin: "0 0", filter: "drop-shadow(0 4px 8px rgba(30,16,51,0.3))" }}
  >
    <path d="M1,1 L1,20 L6,15.5 L9.5,23.5 L13,22 L9.5,14.5 L16,14.5 Z" fill="#ffffff" stroke="#1e1033" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

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
