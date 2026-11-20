import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Marque, PIECES_LOGO, POLICE, entre, hasard, ressort } from "../commun";

// Scène d'accueil (0 à 3 s) : « Bonjour, et bienvenue chez tangram.cx ! »
const TAILLE = 260;

export const Scene0: React.FC<{ t: number }> = ({ t }) => {
  if (t > 3.1) return null;
  const bonjour = ressort(t, 0.65, 11);
  const bienvenue = ressort(t, 1.5, 12);
  const marque = ressort(t, 1.95, 11);
  // Sortie : on plonge vers la scène suivante.
  const sortie = entre(t, 2.7, 3.05, 0, 1, (n) => n * n);
  return (
    <AbsoluteFill
      style={{
        background: C.fond,
        fontFamily: POLICE,
        opacity: 1 - sortie,
        transform: `scale(${1 + sortie * 1.5})`,
        transformOrigin: "960px 540px",
      }}
    >
      <svg width={TAILLE} height={TAILLE} viewBox="-1 -1 34 34" style={{ position: "absolute", left: 960 - TAILLE / 2, top: 120, overflow: "visible" }}>
        {PIECES_LOGO.map((p, i) => {
          const a = ressort(t, 0.05 + i * 0.07, 13);
          const angle = hasard(i + 40) * Math.PI * 2;
          const r = (hasard(i + 60) - 0.5) * 540;
          return (
            <g key={i} transform={`translate(${Math.cos(angle) * 70 * (1 - a)} ${Math.sin(angle) * 50 * (1 - a)})`} opacity={Math.min(1, a * 3)}>
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
      <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", color: C.encre, fontWeight: 800 }}>
        <div style={{ fontSize: 120, letterSpacing: -3, opacity: Math.min(1, bonjour * 2), transform: `translateY(${(1 - bonjour) * 40}px) scale(${0.7 + 0.3 * bonjour})` }}>
          Bonjour !
        </div>
        <div style={{ marginTop: 26, fontSize: 64, letterSpacing: -1.5, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 22 }}>
          <span style={{ opacity: Math.min(1, bienvenue * 2), transform: `translateY(${(1 - bienvenue) * 30}px)`, display: "inline-block" }}>Bienvenue chez</span>
          <span style={{ opacity: Math.min(1, marque * 2), transform: `translateY(${(1 - marque) * 30}px) scale(${0.8 + 0.2 * marque})`, display: "inline-block" }}>
            <Marque taille={72} />
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
