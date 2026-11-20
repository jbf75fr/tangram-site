import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Curseur, Marque, PIECES_LOGO, POLICE, entre, hasard, ressort, secousse } from "../commun";

// Scène 5 (38 à 46 s) : le logo s'assemble, la phrase finale, puis l'invitation à l'essai gratuit.
const vif = (t: number, a: number, b: number) => entre(t, a, b, 0, 1, (n) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2));

const MOTS_1 = [
  { mot: "Vos", t: 39.1 },
  { mot: "clients", t: 39.25 },
  { mot: "vous", t: 39.45 },
  { mot: "parlent.", t: 39.65 },
];
const MOTS_2 = [
  { mot: "Passez", t: 40.45 },
  { mot: "à", t: 40.6 },
  { mot: "l'action.", t: 40.75 },
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
  if (t < 37.6) return null;
  // Le logo, d'abord grand au centre, rejoint le nom en haut.
  const range = vif(t, 38.85, 39.3);
  const taille = 340 + (110 - 340) * range;
  const cx = 960 + (775 - 960) * range;
  const cy = 470 + (170 - 470) * range;
  const marque = ressort(t, 39.05, 13);
  const bouton = ressort(t, 41.85, 10);
  const clic = 43.5;
  const vers = entre(t, 42.55, 43.3, 0, 1, (n) => 1 - Math.pow(1 - n, 3));
  const onde = entre(t, clic, clic + 0.6, 0, 1);

  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: POLICE, overflow: "hidden", opacity: entre(t, 37.6, 37.75, 0, 1) }}>
      <Camera
        t={t}
        cles={[
          [37.6, 960, 540, 1.08],
          [46, 960, 540, 1.0],
        ]}
        extra={secousse(t, [38.45, 41.85, clic], 0.03)}
      >
        <svg width={taille} height={taille} viewBox="-1 -1 34 34" style={{ position: "absolute", left: cx - taille / 2, top: cy - taille / 2, overflow: "visible" }}>
          {PIECES_LOGO.map((p, i) => {
            const a = ressort(t, 37.65 + i * 0.06, 14);
            const angle = hasard(i + 4) * Math.PI * 2;
            const dx = Math.cos(angle) * 60;
            const dy = Math.sin(angle) * 40;
            const r = (hasard(i + 19) - 0.5) * 540;
            return (
              <g key={i} transform={`translate(${dx * (1 - a)} ${dy * (1 - a)})`} opacity={Math.min(1, a * 3)}>
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
                backgroundSize: `${entre(t, 40.9, 41.3, 0, 100)}% 20px`,
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
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontSize: 36, fontWeight: 700, color: C.encreDouce, opacity: entre(t, 42.4, 42.7, 0, 1), transform: `translateY(${entre(t, 42.4, 42.7, 20, 0)}px)` }}>
          Essai gratuit sur <span style={{ color: C.iris }}>tangram.cx</span>
        </div>
        <Curseur x={1500 + (1080 - 1500) * vers} y={1000 + (720 - 1000) * vers} appui={t > clic && t < clic + 0.15} opacite={entre(t, 42.5, 42.65, 0, 1)} />
      </Camera>
    </AbsoluteFill>
  );
};
