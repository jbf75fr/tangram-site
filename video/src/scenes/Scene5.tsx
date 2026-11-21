import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Curseur, Marque, PIECES_LOGO, POLICE, entre, hasard, ressort, secousse } from "../commun";

// Scène 5 (38 à 50 s) : « Comme au tangram, chaque retour trouve sa place » : des cartes de commentaires
// forment une à une les pièces du logo au rythme de la voix, puis la phrase finale et l'essai gratuit.
export const POSES = [38.0, 38.46, 39.26, 39.5, 39.84, 40.24, 41.14];
// Centre de chaque pièce du logo, dans la grille de 32.
const CENTRES = PIECES_LOGO.map((p) => {
  const n = p.points.split(" ").map((c) => c.split(",").map(Number));
  return [n.reduce((s, c) => s + c[0], 0) / n.length, n.reduce((s, c) => s + c[1], 0) / n.length];
});
const vif = (t: number, a: number, b: number) => entre(t, a, b, 0, 1, (n) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2));

// « Chaque retour trouve sa place » : quand la scène précédente se referme en un point, des
// dizaines de cartes de commentaires (celles du mur du début) en jaillissent, flottent, puis
// filent par groupes former chacune des sept pièces du logo, au rythme de la voix.
const PAR_PIECE = 9;
const RETOURS = Array.from({ length: PIECES_LOGO.length * PAR_PIECE }, (_, j) => {
  const piece = j % PIECES_LOGO.length;
  const rang = Math.floor(j / PIECES_LOGO.length);
  const angle = hasard(j + 200) * Math.PI * 2;
  const rayon = 300 + hasard(j + 300) * 560;
  const [u, v] = CENTRES[piece];
  return {
    piece,
    x: Math.max(80, Math.min(1840, 960 + Math.cos(angle) * rayon * 1.2)),
    y: Math.max(70, Math.min(1010, 540 + Math.sin(angle) * rayon * 0.62)),
    // Centre de la pièce à l'écran (logo de 340 px centré en 960 x 470, grille de 34 unités).
    cibleX: 800 + 10 * u + (hasard(j + 400) - 0.5) * 30,
    cibleY: 310 + 10 * v + (hasard(j + 500) - 0.5) * 30,
    depart: POSES[piece] - 0.45 + rang * 0.025,
    rotation: (hasard(j + 600) - 0.5) * 50,
    ton: hasard(j + 700),
  };
});

const Retours: React.FC<{ t: number }> = ({ t }) => {
  if (t > POSES[POSES.length - 1] + 0.1) return null;
  const jaillit = entre(t, 37.8, 38.35, 0, 1, (n) => 1 - Math.pow(1 - n, 3));
  return (
    <>
      {RETOURS.map((r, j) => {
        const vol = entre(t, r.depart, r.depart + 0.4, 0, 1, (n) => n * n);
        if (vol >= 1) return null;
        const flotteX = Math.sin((t - 38) * 0.9 + j) * 14;
        const flotteY = Math.cos((t - 38) * 0.7 + j) * 10;
        const x0 = 960 + (r.x + flotteX - 960) * jaillit;
        const y0 = 540 + (r.y + flotteY - 540) * jaillit;
        const x = x0 + (r.cibleX - x0) * vol;
        const y = y0 + (r.cibleY - y0) * vol;
        const echelle = (0.4 + 0.6 * jaillit) * (1 - 0.85 * vol);
        return (
          <div
            key={j}
            style={{
              position: "absolute",
              left: x - 48,
              top: y - 27,
              width: 96,
              height: 54,
              borderRadius: 12,
              background: C.blanc,
              boxShadow: "0 6px 16px rgba(30,16,51,0.12)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 7,
              padding: "0 13px",
              boxSizing: "border-box",
              opacity: 1 - entre(vol, 0.75, 1, 0, 1),
              transform: `scale(${echelle}) rotate(${r.rotation * (1 - vol) + (t - 38) * 6 * (r.ton - 0.5)}deg)`,
            }}
          >
            <div style={{ height: 6, borderRadius: 3, width: `${60 + r.ton * 35}%`, background: r.ton < 0.45 ? C.rouge : r.ton < 0.8 ? C.vert : C.gris }} />
            <div style={{ height: 6, borderRadius: 3, width: "55%", background: C.grisClair }} />
          </div>
        );
      })}
    </>
  );
};

const MOTS_1 = [
  { mot: "Vos", t: 44.06 },
  { mot: "clients", t: 44.22 },
  { mot: "vous", t: 44.52 },
  { mot: "parlent.", t: 44.68 },
];
const MOTS_2 = [
  { mot: "Passez", t: 47.14 },
  { mot: "à", t: 47.4 },
  { mot: "l'action.", t: 47.46 },
];

const Mots: React.FC<{ t: number; mots: { mot: string; t: number }[] }> = ({ t, mots }) => (
  <>
    {mots.map((m, i) => {
      const a = ressort(t, m.t, 12);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: "0.25em", opacity: Math.min(1, a * 2), transform: `translateY(${(1 - a) * 50}px) scale(${0.7 + 0.3 * a})` }}>
          {m.mot}
        </span>
      );
    })}
  </>
);

export const Scene5: React.FC<{ t: number }> = ({ t }) => {
  if (t < 37.78) return null;
  // Le logo, d'abord grand au centre, rejoint le nom en haut.
  const range = vif(t, 43.6, 44.05);
  const taille = 340 + (110 - 340) * range;
  const cx = 960 + (775 - 960) * range;
  const cy = 470 + (170 - 470) * range;
  const marque = ressort(t, 43.8, 13);
  const bouton = ressort(t, 45.42, 10);
  const clic = 48.55;
  const vers = entre(t, 47.7, 48.35, 0, 1, (n) => 1 - Math.pow(1 - n, 3));
  const onde = entre(t, clic, clic + 0.6, 0, 1);

  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: POLICE, overflow: "hidden" }}>
      <Camera
        t={t}
        cles={[
          [37.6, 960, 540, 1.15],
          [42.6, 960, 540, 1.0],
          [50, 960, 540, 1.0],
        ]}
        extra={secousse(t, [...POSES, 42.4, 45.42, clic], 0.02)}
      >
        <Retours t={t} />
        <svg width={taille} height={taille} viewBox="-1 -1 34 34" style={{ position: "absolute", left: cx - taille / 2, top: cy - taille / 2, overflow: "visible" }}>
          {PIECES_LOGO.map((p, i) => {
            // La pièce se forme à l'arrivée de son groupe de commentaires (voir Retours).
            const a = ressort(t, POSES[i] - 0.05, 12);
            return (
              <polygon
                key={i}
                points={p.points}
                fill={p.couleur}
                stroke={C.fond}
                strokeWidth={0.9}
                strokeLinejoin="round"
                opacity={t > POSES[i] - 0.05 ? 1 : 0}
                style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scale(${0.55 + 0.45 * a})` }}
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: 850, top: 128, opacity: marque, transform: `translateX(${(1 - marque) * -30}px)` }}>
          <Marque taille={64} />
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontSize: 100, fontWeight: 800, color: C.encre, letterSpacing: -2.5, lineHeight: 1.12 }}>
          <div>
            <Mots t={t} mots={MOTS_1} />
          </div>
          <div>
            <span
              style={{
                backgroundImage: `linear-gradient(${C.beurre}, ${C.beurre})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "0 90%",
                backgroundSize: `${entre(t, 47.6, 48.0, 0, 100)}% 20px`,
              }}
            >
              <Mots t={t} mots={MOTS_2} />
            </span>
          </div>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", opacity: Math.min(1, bouton * 2), transform: `scale(${(0.4 + 0.6 * bouton) * (t > clic && t < clic + 0.15 ? 0.94 : 1)})` }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 999, boxShadow: `0 0 0 ${onde * 40}px rgba(255,228,92,${0.6 * (1 - onde)})` }} />
            <div style={{ position: "relative", background: C.beurre, color: C.encre, borderRadius: 999, padding: "34px 76px", fontSize: 54, fontWeight: 800, boxShadow: "0 18px 40px rgba(30,16,51,0.18)" }}>
              Essayer gratuitement
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontSize: 36, fontWeight: 700, color: C.encreDouce, opacity: entre(t, 46.2, 46.5, 0, 1), transform: `translateY(${entre(t, 46.2, 46.5, 20, 0)}px)` }}>
          <span style={{ color: C.iris }}>500 commentaires</span> analysés gratuitement
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 878, textAlign: "center", fontSize: 30, fontWeight: 600, color: C.encreDouce, opacity: entre(t, 46.6, 46.9, 0, 1), transform: `translateY(${entre(t, 46.6, 46.9, 20, 0)}px)` }}>
          Un expert vous accompagne dès l'essai.
        </div>
        <Curseur x={1500 + (1080 - 1500) * vers} y={1000 + (720 - 1000) * vers} appui={t > clic && t < clic + 0.15} opacite={entre(t, 47.6, 47.75, 0, 1)} />
      </Camera>
    </AbsoluteFill>
  );
};
