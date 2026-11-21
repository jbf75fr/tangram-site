import React from "react";
import { AbsoluteFill } from "remotion";
import { C, PIECES_LOGO, POLICE, entre, hasard, ressort } from "../commun";

// Scène d'accueil (0 à 3 s) : « Et si vos priorités venaient de vos clients ? »
// Chaque mot apparaît quand la voix le dit (voix/texte.txt).
const TAILLE = 180;

const LIGNE_1 = [
  { mot: "Et", t: 0.42 },
  { mot: "si", t: 0.57 },
  { mot: "vos", t: 0.71 },
  { mot: "priorités", t: 0.85 },
];
const LIGNE_2 = [
  { mot: "venaient", t: 1.41 },
  { mot: "de", t: 1.65 },
  { mot: "vos", t: 1.75, accent: true },
  { mot: "clients ?", t: 1.93, accent: true },
];

const Ligne: React.FC<{ t: number; mots: { mot: string; t: number; accent?: boolean }[] }> = ({ t, mots }) => (
  <div>
    {mots.map((m, i) => {
      const a = ressort(t, m.t, 12);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            marginRight: "0.24em",
            color: m.accent ? C.iris : C.encre,
            opacity: Math.min(1, a * 2),
            transform: `translateY(${(1 - a) * 50}px) scale(${0.7 + 0.3 * a})`,
          }}
        >
          {m.mot}
        </span>
      );
    })}
  </div>
);

export const Scene0: React.FC<{ t: number }> = ({ t }) => {
  if (t > 3.35) return null;
  // Sortie : la question file vers le haut, l'enquête arrive par le bas (même geste qu'entre les scènes 2 et 3).
  const sortie = entre(t, 2.95, 3.3, 0, 1, (n) => n * n * n);
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: POLICE, transform: `translateY(${-sortie * 1100}px)` }}>
      <svg width={TAILLE} height={TAILLE} viewBox="-1 -1 34 34" style={{ position: "absolute", left: 960 - TAILLE / 2, top: 250, overflow: "visible" }}>
        {PIECES_LOGO.map((p, i) => {
          const a = ressort(t, 0.02 + i * 0.05, 13);
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
      <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", fontSize: 104, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.12 }}>
        <Ligne t={t} mots={LIGNE_1} />
        <Ligne t={t} mots={LIGNE_2} />
      </div>
    </AbsoluteFill>
  );
};
