import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Marque, PIECES_LOGO, POLICE, entre, hasard, ressort } from "../commun";

// Scène 5 (40 à 45 s) : les pièces forment le logo, puis la phrase finale.
const TAILLE = 300;

export const Scene5: React.FC<{ t: number }> = ({ t }) => {
  if (t < 39.8) return null;
  const marque = ressort(t, 41.1);
  const ligne1 = ressort(t, 41.8);
  const ligne2 = ressort(t, 43.4);
  const souligne = entre(t, 43.6, 44.4, 0, 100);
  // Le logo remonte un peu quand le texte arrive.
  const monte = entre(t, 41.0, 41.8, 0, 1);

  return (
    <AbsoluteFill style={{ fontFamily: POLICE, alignItems: "center" }}>
      <svg
        width={TAILLE}
        height={TAILLE}
        viewBox="-1 -1 34 34"
        style={{ position: "absolute", left: 960 - TAILLE / 2, top: 300 - TAILLE / 2 - monte * 70, overflow: "visible" }}
      >
        {PIECES_LOGO.map((p, i) => {
          const a = ressort(t, 39.9 + i * 0.12, 13);
          const dx = (hasard(i + 3) - 0.5) * 120;
          const dy = (hasard(i + 11) - 0.5) * 90;
          const r = (hasard(i + 19) - 0.5) * 300;
          return (
            <g key={i} transform={`translate(${dx * (1 - a)} ${dy * (1 - a)})`} opacity={Math.min(1, a * 2)}>
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
      <div style={{ position: "absolute", top: 440, opacity: marque, transform: `translateY(${(1 - marque) * 20}px)` }}>
        <Marque taille={64} />
      </div>
      <div style={{ position: "absolute", top: 590, textAlign: "center", fontSize: 84, fontWeight: 800, color: C.encre, letterSpacing: -2, lineHeight: 1.15 }}>
        <div style={{ opacity: ligne1, transform: `translateY(${(1 - ligne1) * 30}px)` }}>Vos clients vous parlent.</div>
        <div style={{ opacity: ligne2, transform: `translateY(${(1 - ligne2) * 30}px)` }}>
          <span
            style={{
              backgroundImage: `linear-gradient(${C.beurre}, ${C.beurre})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 88%",
              backgroundSize: `${souligne}% 16px`,
            }}
          >
            Passez à l'action.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
