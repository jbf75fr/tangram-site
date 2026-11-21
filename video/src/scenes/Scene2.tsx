import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Cle, POLICE, Triangle, entre, ressort, secousse } from "../commun";

// Scène 2 (9 à 21 s), sur fond nuit : le commentaire est lu en entier et décortiqué.
type Morceau = { texte: string; surligne?: { fond: string; couleur: string; debut: number } };

const VERT_CLAIR = "#7be0a4";
const ROUGE_CLAIR = "#ff9c93";

const MORCEAUX: Morceau[] = [
  { texte: "Conseiller très à l'écoute,", surligne: { fond: "rgba(46,158,91,0.32)", couleur: VERT_CLAIR, debut: 13.05 } },
  { texte: " mais " },
  { texte: "trois semaines pour être livré.", surligne: { fond: "rgba(229,88,77,0.32)", couleur: ROUGE_CLAIR, debut: 13.2 } },
  { texte: " " },
  { texte: "Je ne recommanderai pas.", surligne: { fond: "rgba(229,88,77,0.32)", couleur: ROUGE_CLAIR, debut: 16.46 } },
];
const TOTAL = MORCEAUX.reduce((n, m) => n + m.texte.length, 0);

type Etiquette = { debut: number; libelle: string; valeur: string; fond: string; encre: string; piece: string; rotation: number; de: [number, number] };

const ETIQUETTES: Etiquette[] = [
  { debut: 13.06, libelle: "Étape du parcours", valeur: "Accueil et Livraison", fond: C.iris, encre: C.blanc, piece: C.beurre, rotation: 0, de: [600, 420] },
  { debut: 14.5, libelle: "Tonalité", valeur: "Négative", fond: C.rouge, encre: C.blanc, piece: C.encre, rotation: 90, de: [700, 500] },
  { debut: 15.46, libelle: "Émotion", valeur: "Déception", fond: C.beurre, encre: C.encre, piece: C.iris, rotation: 180, de: [700, 500] },
  { debut: 16.6, libelle: "Risque de départ", valeur: "Élevé", fond: C.blanc, encre: C.rougeTexte, piece: C.rouge, rotation: 270, de: [520, 610] },
  { debut: 17.82, libelle: "Suggestion", valeur: "Livrer plus vite", fond: C.vert, encre: C.blanc, piece: C.beurrePale, rotation: 45, de: [600, 520] },
];

const CLES: Cle[] = [
  [8.7, 700, 520, 1.35],
  [9.7, 680, 500, 1.3],
  [11.4, 720, 500, 1.36],
  [12.95, 720, 500, 1.36],
  [13.45, 960, 540, 1.0],
  [18.9, 990, 540, 1.05],
  [19.5, 990, 540, 1.05],
];

export const Scene2: React.FC<{ t: number }> = ({ t }) => {
  if (t < 8.65 || t > 20.75) return null;
  const lu = entre(t, 10.4, 11.9, 0, TOTAL, (n) => n);
  // Sortie : la scène file vers le haut.
  const sortie = entre(t, 20.05, 20.6, 0, 1, (n) => n * n * n);
  let position = 0;
  let mot = 0;

  return (
    <AbsoluteFill style={{ background: C.encre, fontFamily: POLICE, overflow: "hidden", opacity: entre(t, 8.65, 8.75, 0, 1) }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-sortie * 1100}px)` }}>
        <Camera t={t} cles={CLES} extra={secousse(t, ETIQUETTES.map((e) => e.debut + 0.2), 0.02)}>
          <div style={{ position: "absolute", left: 150, top: 300, width: 940 }}>
            <div
              style={{
                display: "inline-block",
                background: C.beurre,
                color: C.encre,
                borderRadius: 999,
                padding: "10px 22px",
                fontSize: 26,
                fontWeight: 800,
                transform: `scale(${ressort(t, 8.68, 11)})`,
                transformOrigin: "0 50%",
              }}
            >
              Note : 6 / 10
            </div>
            <div style={{ fontSize: 60, lineHeight: 1.36, fontWeight: 700, marginTop: 30, color: C.blanc }}>
              {MORCEAUX.map((m, i) => {
                const debutMorceau = position;
                position += m.texte.length;
                const s = m.surligne;
                const largeur = s ? entre(t, s.debut, s.debut + 0.3, 0, 100) : 0;
                return (
                  <span
                    key={i}
                    style={
                      s
                        ? {
                            backgroundImage: `linear-gradient(${s.fond}, ${s.fond})`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: `${largeur}% 100%`,
                            borderRadius: 8,
                          }
                        : undefined
                    }
                  >
                    {m.texte.split(/(?<= )/).map((bout, j) => {
                      // Chaque mot claque à son tour à l'ouverture.
                      const indexMot = mot++;
                      const arrive = ressort(t, 8.7 + indexMot * 0.03, 13);
                      const offset = m.texte.split(/(?<= )/).slice(0, j).join("").length;
                      return (
                        <span key={j} style={{ display: "inline-block", whiteSpace: "pre", opacity: arrive, transform: `translateY(${(1 - arrive) * 30}px)` }}>
                          {bout.split("").map((c, k) => {
                            const n = debutMorceau + offset + k;
                            const couleur = s && largeur > 0 ? s.couleur : n < lu ? C.blanc : "rgba(255,255,255,0.35)";
                            return (
                              <span key={k} style={{ color: couleur }}>
                                {c}
                              </span>
                            );
                          })}
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </div>
            {/* Trait jaune qui balaie la lecture. */}
            <div style={{ height: 8, borderRadius: 4, marginTop: 34, background: "rgba(255,255,255,0.12)", width: 940, opacity: entre(t, 10.1, 10.25, 0, 1) * entre(t, 11.9, 12.3, 1, 0) }}>
              <div style={{ height: 8, borderRadius: 4, background: C.beurre, width: `${(lu / TOTAL) * 100}%` }} />
            </div>
          </div>

          {ETIQUETTES.map((e, i) => {
            const a = ressort(t, e.debut, 13);
            const vol = entre(t, e.debut, e.debut + 0.35, 0, 1);
            const xFinal = 1200;
            const yFinal = 160 + i * 156;
            const x = e.de[0] + (xFinal - e.de[0]) * vol;
            const y = e.de[1] + (yFinal - e.de[1]) * vol;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 600,
                  height: 128,
                  borderRadius: 24,
                  background: e.fond,
                  color: e.encre,
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  padding: "0 32px",
                  boxSizing: "border-box",
                  opacity: t > e.debut ? 1 : 0,
                  transform: `scale(${0.3 + 0.7 * a}) rotate(${(1 - a) * -14}deg)`,
                  transformOrigin: "0 50%",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
                }}
              >
                <Triangle couleur={e.piece} taille={50} rotation={e.rotation} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.8 }}>{e.libelle}</div>
                  <div style={{ fontSize: 40, fontWeight: 800, marginTop: 2 }}>{e.valeur}</div>
                </div>
              </div>
            );
          })}
        </Camera>
      </div>
    </AbsoluteFill>
  );
};
