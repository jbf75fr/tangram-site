import React from "react";
import { C, POLICE, entre, ressort } from "./commun";

// Sous-titres courts incrustés : la vidéo se comprend sans le son.
// La fin de la scène 5 n'en a pas, son texte est déjà à l'écran.
export const SOUS_TITRES: { debut: number; fin: number; texte: string }[] = [
  { debut: 0.4, fin: 2.9, texte: "Vos clients vous écrivent." },
  { debut: 2.9, fin: 5.3, texte: "Leurs commentaires arrivent dans votre CRM." },
  { debut: 5.3, fin: 7.6, texte: "tangram.cx les récupère automatiquement." },
  { debut: 10.1, fin: 12.95, texte: "Chaque commentaire est lu en entier." },
  { debut: 13.05, fin: 19.3, texte: "Les informations clés sont repérées." },
  { debut: 21.0, fin: 24.4, texte: "Des milliers de retours deviennent des indicateurs." },
  { debut: 24.5, fin: 29.0, texte: "Vous voyez où agir en premier." },
  { debut: 30.6, fin: 32.05, texte: "Vous lancez vos actions." },
  { debut: 32.1, fin: 34.55, texte: "Vous mesurez leur effet." },
  { debut: 34.6, fin: 37.2, texte: "Vos équipes partagent les mêmes constats." },
  { debut: 38.2, fin: 41.1, texte: "Comme au tangram, chaque retour trouve sa place," },
  { debut: 41.15, fin: 43.3, texte: "et l'ensemble dessine vos priorités." },
];

export const SousTitres: React.FC<{ t: number }> = ({ t }) => {
  const s = SOUS_TITRES.find((x) => t >= x.debut && t < x.fin);
  if (!s) return null;
  const a = ressort(t, s.debut, 14);
  const sortie = entre(t, s.fin - 0.12, s.fin, 1, 0);
  const sombre = t > 8.65 && t < 20.3;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 58, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: POLICE,
          fontSize: 46,
          fontWeight: 800,
          letterSpacing: -0.5,
          padding: "16px 34px",
          borderRadius: 18,
          background: sombre ? C.beurre : C.encre,
          color: sombre ? C.encre : C.blanc,
          boxShadow: "0 14px 34px rgba(30,16,51,0.25)",
          opacity: Math.min(1, a * 2) * sortie,
          transform: `translateY(${(1 - a) * 30}px) scale(${0.85 + 0.15 * a})`,
        }}
      >
        {s.texte}
      </div>
    </div>
  );
};
