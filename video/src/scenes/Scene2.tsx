import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Carte, POLICE, Triangle, entre, ressort } from "../commun";

// Scène 2 (9 à 21 s) : le commentaire est lu en entier et décortiqué.
type Morceau = { texte: string; surligne?: { fond: string; trait: string; debut: number } };

const MORCEAUX: Morceau[] = [
  { texte: "Conseiller très à l'écoute,", surligne: { fond: C.vertFond, trait: C.vert, debut: 13.1 } },
  { texte: " mais " },
  { texte: "trois semaines pour être livré.", surligne: { fond: C.rougeFond, trait: C.rouge, debut: 13.3 } },
  { texte: " " },
  { texte: "Je ne recommanderai pas.", surligne: { fond: C.rougeFond, trait: C.rouge, debut: 16.6 } },
];
const TOTAL = MORCEAUX.reduce((n, m) => n + m.texte.length, 0);

type Etiquette = { debut: number; libelle: string; valeur: React.ReactNode; couleur: string; rotation: number };

const ETIQUETTES: Etiquette[] = [
  {
    debut: 13.1,
    libelle: "Étape du parcours",
    valeur: (
      <span>
        <span style={{ color: C.vertTexte }}>Accueil</span>
        <span style={{ color: C.encreDouce, fontWeight: 500 }}> et </span>
        <span style={{ color: C.rougeTexte }}>Livraison</span>
      </span>
    ),
    couleur: C.iris,
    rotation: 0,
  },
  { debut: 14.55, libelle: "Tonalité", valeur: <span style={{ color: C.rougeTexte }}>Négative</span>, couleur: C.rouge, rotation: 90 },
  { debut: 15.55, libelle: "Émotion", valeur: "Déception", couleur: C.beurre, rotation: 180 },
  { debut: 16.6, libelle: "Risque de départ", valeur: <span style={{ color: C.rougeTexte }}>Élevé</span>, couleur: C.encre, rotation: 270 },
  { debut: 17.85, libelle: "Suggestion", valeur: "Livrer plus vite", couleur: C.vert, rotation: 45 },
];

export const Scene2: React.FC<{ t: number }> = ({ t }) => {
  if (t < 8.6 || t > 21.3) return null;
  const entree = ressort(t, 8.7, 16);
  const sortie = entre(t, 20.0, 21.0, 0, 1, (n) => n * n);
  // Lecture : les lettres passent du gris à l'encre, de gauche à droite.
  const lu = entre(t, 9.7, 11.4, 0, TOTAL, (n) => n);
  let position = 0;

  return (
    <AbsoluteFill style={{ fontFamily: POLICE, opacity: 1 - sortie * 0.0 }}>
      <Carte
        style={{
          left: 150,
          top: 250,
          width: 960,
          padding: "52px 60px 60px",
          boxSizing: "border-box",
          transformOrigin: "1580px 290px",
          transform: `translate(${(1 - entree) * 420}px, ${sortie * -60}px) scale(${0.4 + 0.6 * entree})`,
          opacity: entre(t, 8.7, 9.1, 0, 1) * (1 - sortie),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: C.encreDouce, fontWeight: 600 }}>
          <span style={{ background: C.irisPale, color: C.iris, borderRadius: 999, padding: "8px 18px", fontWeight: 700 }}>Note : 6 / 10</span>
          <span>Enquête après livraison</span>
        </div>
        <div style={{ fontSize: 50, lineHeight: 1.42, fontWeight: 600, marginTop: 30 }}>
          {MORCEAUX.map((m, i) => {
            const debutMorceau = position;
            position += m.texte.length;
            const s = m.surligne;
            const largeur = s ? entre(t, s.debut, s.debut + 0.6, 0, 100) : 0;
            return (
              <span
                key={i}
                style={
                  s
                    ? {
                        backgroundImage: `linear-gradient(${s.fond}, ${s.fond}), linear-gradient(${s.trait}, ${s.trait})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "0 0, 0 100%",
                        backgroundSize: `${largeur}% 100%, ${largeur}% 5px`,
                        borderRadius: 6,
                      }
                    : undefined
                }
              >
                {m.texte.split("").map((c, j) => (
                  <span key={j} style={{ color: debutMorceau + j < lu ? C.encre : "#b7b1c6" }}>
                    {c}
                  </span>
                ))}
              </span>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            bottom: 26,
            height: 6,
            borderRadius: 3,
            background: C.grisClair,
            overflow: "hidden",
            opacity: entre(t, 9.5, 9.7, 0, 1) * entre(t, 11.6, 12.0, 1, 0),
          }}
        >
          <div style={{ width: `${(lu / TOTAL) * 100}%`, height: "100%", background: C.iris }} />
        </div>
      </Carte>

      {ETIQUETTES.map((e, i) => {
        const a = ressort(t, e.debut, 13);
        // À la sortie, les étiquettes tombent vers les indicateurs de la scène suivante.
        const chute = entre(t, 19.6 + i * 0.08, 20.6 + i * 0.08, 0, 1, (n) => n * n);
        return (
          <Carte
            key={i}
            style={{
              left: 1190,
              top: 180 + i * 148,
              width: 580,
              height: 120,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 30px",
              boxSizing: "border-box",
              opacity: Math.min(1, a * 1.4) * (1 - chute),
              transform: `translate(${(1 - a) * -90 + chute * (i - 2) * -80}px, ${chute * 520}px) rotate(${chute * (i % 2 ? 14 : -10)}deg) scale(${0.8 + 0.2 * a})`,
            }}
          >
            <Triangle couleur={e.couleur} taille={44} rotation={e.rotation} />
            <div>
              <div style={{ fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>{e.libelle}</div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 2 }}>{e.valeur}</div>
            </div>
          </Carte>
        );
      })}
    </AbsoluteFill>
  );
};
