import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Curseur, Marque, PIECES_LOGO, POLICE, entre, hasard, ressort, secousse } from "../commun";

// Scène 5 (38 à 50 s) : « Comme au tangram, chaque retour trouve sa place » : les pièces du logo se posent
// une à une au rythme de la voix, puis la phrase finale et l'invitation à l'essai gratuit.
export const POSES = [38.0, 38.46, 39.38, 39.62, 39.96, 40.36, 41.2];
// Centre de chaque pièce du logo, dans la grille de 32.
const CENTRES = PIECES_LOGO.map((p) => {
  const n = p.points.split(" ").map((c) => c.split(",").map(Number));
  return [n.reduce((s, c) => s + c[0], 0) / n.length, n.reduce((s, c) => s + c[1], 0) / n.length];
});
const vif = (t: number, a: number, b: number) => entre(t, a, b, 0, 1, (n) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2));

const MOTS_1 = [
  { mot: "Vos", t: 43.94 },
  { mot: "clients", t: 44.1 },
  { mot: "vous", t: 44.42 },
  { mot: "parlent.", t: 44.6 },
];
const MOTS_2 = [
  { mot: "Passez", t: 45.26 },
  { mot: "à", t: 45.54 },
  { mot: "l'action.", t: 45.6 },
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
  const range = vif(t, 43.3, 43.75);
  const taille = 340 + (110 - 340) * range;
  const cx = 960 + (775 - 960) * range;
  const cy = 470 + (170 - 470) * range;
  const marque = ressort(t, 43.5, 13);
  const bouton = ressort(t, 46.52, 10);
  const clic = 47.8;
  const vers = entre(t, 46.85, 47.55, 0, 1, (n) => 1 - Math.pow(1 - n, 3));
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
        extra={secousse(t, [...POSES, 42.5, 46.52, clic], 0.02)}
      >
        <svg width={taille} height={taille} viewBox="-1 -1 34 34" style={{ position: "absolute", left: cx - taille / 2, top: cy - taille / 2, overflow: "visible" }}>
          {PIECES_LOGO.map((p, i) => {
            // Chaque pièce arrive de loin et se pose sur un mot de la voix.
            const a = ressort(t, POSES[i] - 0.3, 12);
            const angle = hasard(i + 4) * Math.PI * 2;
            // Jaillissement : les pièces partent du centre (là où la scène précédente s'est refermée)
            // vers le bord, puis reviennent se poser une à une.
            const jaillit = entre(t, 37.78, 38.2, 0, 1, (n) => 1 - Math.pow(1 - n, 3));
            const [cx0, cy0] = CENTRES[i];
            const dx = (16 - cx0) + (Math.cos(angle) * 95 - (16 - cx0)) * jaillit;
            const dy = (16 - cy0) + (Math.sin(angle) * 60 - (16 - cy0)) * jaillit;
            const r = (hasard(i + 19) - 0.5) * 540;
            return (
              <g key={i} transform={`translate(${dx * (1 - a)} ${dy * (1 - a)})`}>
                <polygon
                  points={p.points}
                  fill={p.couleur}
                  stroke={C.fond}
                  strokeWidth={0.9}
                  strokeLinejoin="round"
                  style={{ transformBox: "fill-box", transformOrigin: "center", transform: `rotate(${r * (1 - a)}deg)` }}
                />
              </g>
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
                backgroundSize: `${entre(t, 45.75, 46.15, 0, 100)}% 20px`,
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
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontSize: 36, fontWeight: 700, color: C.encreDouce, opacity: entre(t, 46.9, 47.2, 0, 1), transform: `translateY(${entre(t, 46.9, 47.2, 20, 0)}px)` }}>
          <span style={{ color: C.iris }}>500 commentaires</span> analysés gratuitement
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 878, textAlign: "center", fontSize: 30, fontWeight: 600, color: C.encreDouce, opacity: entre(t, 47.25, 47.55, 0, 1), transform: `translateY(${entre(t, 47.25, 47.55, 20, 0)}px)` }}>
          Un expert vous accompagne dès l'essai.
        </div>
        <Curseur x={1500 + (1080 - 1500) * vers} y={1000 + (720 - 1000) * vers} appui={t > clic && t < clic + 0.15} opacite={entre(t, 46.8, 46.95, 0, 1)} />
      </Camera>
    </AbsoluteFill>
  );
};
