import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Carte, Logo, POLICE, entre, fmt, hasard, ressort, signe } from "../commun";

// Scène 3 (21 à 32 s) : des milliers de retours deviennent des indicateurs.
const SUJETS = [
  { nom: "Délais de livraison", pos: 0.18, score: -34 },
  { nom: "Accueil et conseil", pos: 0.78, score: 41 },
  { nom: "Prix", pos: 0.41, score: -8 },
  { nom: "Service après-vente", pos: 0.6, score: 12 },
  { nom: "Site et application", pos: 0.52, score: 3 },
];

const Indicateur: React.FC<{ t: number; i: number; libelle: string; children: React.ReactNode }> = ({ t, i, libelle, children }) => {
  const a = ressort(t, 21.0 + i * 0.12);
  return (
    <Carte
      style={{
        position: "relative",
        flex: 1,
        height: 190,
        borderRadius: 22,
        padding: "26px 30px",
        boxSizing: "border-box",
        opacity: a,
        transform: `translateY(${(1 - a) * 40}px)`,
        boxShadow: "none",
        border: `2px solid ${C.grisClair}`,
      }}
    >
      <div style={{ fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>{libelle}</div>
      {children}
    </Carte>
  );
};

export const Scene3: React.FC<{ t: number }> = ({ t }) => {
  if (t < 20.3 || t > 32.8) return null;
  const fenetre = ressort(t, 20.4, 16);
  const sortie = entre(t, 31.4, 32.4, 0, 1, (n) => n * n);
  const compte = entre(t, 21.4, 24.6, 1, 12480, (n) => 1 - Math.pow(1 - n, 3));
  const remplissage = entre(t, 21.6, 24.6, 0, 1);
  const priorite = ressort(t, 25.6, 12);
  const attenue = entre(t, 26.4, 27.0, 1, 0.45);

  // Pièces qui pleuvent dans les indicateurs.
  const pluie = Array.from({ length: 70 }, (_, i) => {
    const debut = 20.6 + hasard(i) * 3.6;
    const u = entre(t, debut, debut + 0.7, 0, 1, (n) => n * n);
    if (u <= 0 || u >= 1) return null;
    const x = 220 + hasard(i + 100) * 1480;
    return (
      <svg
        key={i}
        width={30}
        height={30}
        viewBox="0 0 32 32"
        style={{
          position: "absolute",
          left: x,
          top: -40 + u * 420,
          opacity: 1 - u * 0.6,
          transform: `rotate(${hasard(i + 7) * 360 + u * 180}deg)`,
        }}
      >
        <polygon points="0,0 32,0 0,32" fill={[C.iris, C.beurre, C.vert, C.rouge, C.encre][i % 5]} />
      </svg>
    );
  });

  return (
    <AbsoluteFill style={{ fontFamily: POLICE }}>
      <Carte
        style={{
          left: 140,
          top: 90,
          width: 1640,
          height: 900,
          overflow: "hidden",
          opacity: fenetre * (1 - sortie),
          transformOrigin: "50% 75%",
          transform: `translateY(${(1 - fenetre) * 80}px) scale(${1 + sortie * 0.25})`,
        }}
      >
        <div style={{ height: 76, display: "flex", alignItems: "center", gap: 16, padding: "0 36px", borderBottom: `2px solid ${C.grisClair}` }}>
          <Logo taille={36} />
          <div style={{ fontSize: 26, fontWeight: 800 }}>Tableau de bord</div>
          <div style={{ marginLeft: "auto", fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>Enquête satisfaction clients</div>
        </div>
        <div style={{ padding: "30px 36px" }}>
          <div style={{ display: "flex", gap: 22 }}>
            <Indicateur t={t} i={0} libelle="Commentaires analysés">
              <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14 }}>{fmt(compte)}</div>
            </Indicateur>
            <Indicateur t={t} i={1} libelle="Recommandation (NPS)">
              <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14 }}>{signe(entre(t, 21.6, 24.6, 0, -12))}</div>
            </Indicateur>
            <Indicateur t={t} i={2} libelle="Tonalité">
              <div style={{ display: "flex", height: 22, borderRadius: 11, overflow: "hidden", marginTop: 34, background: C.grisClair }}>
                <div style={{ width: `${58 * remplissage}%`, background: C.vert }} />
                <div style={{ width: `${42 * remplissage}%`, background: C.rouge }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 700, marginTop: 14 }}>
                <span style={{ color: C.vertTexte }}>{Math.round(58 * remplissage)} % positif</span>
                <span style={{ color: C.rougeTexte }}>{Math.round(42 * remplissage)} % négatif</span>
              </div>
            </Indicateur>
            <Indicateur t={t} i={3} libelle="Clients à risque de départ">
              <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14, color: C.rougeTexte }}>{fmt(compte * 0.15)}</div>
            </Indicateur>
          </div>

          <div
            style={{
              marginTop: 26,
              border: `2px solid ${C.grisClair}`,
              borderRadius: 22,
              padding: "26px 34px 16px",
              opacity: entre(t, 23.0, 23.5, 0, 1),
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Sujets qui influencent la satisfaction</div>
            {SUJETS.map((s, i) => {
              const a = ressort(t, 23.3 + i * 0.22);
              const barre = entre(t, 23.4 + i * 0.22, 24.4 + i * 0.22, 0, 1);
              const premier = i === 0;
              return (
                <div
                  key={s.nom}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 30,
                    height: 76,
                    padding: "0 18px",
                    margin: "0 -18px",
                    borderRadius: 16,
                    opacity: a * (premier ? 1 : attenue),
                    transform: `translateX(${(1 - a) * 40}px)`,
                    background: premier ? `rgba(255,243,166,${priorite})` : "transparent",
                    boxShadow: premier ? `inset 0 0 0 ${3 * priorite}px ${C.beurre}` : "none",
                  }}
                >
                  <div style={{ width: 330, fontSize: 26, fontWeight: 700 }}>{s.nom}</div>
                  <div style={{ flex: 1, display: "flex", height: 16, borderRadius: 8, overflow: "hidden", background: C.grisClair }}>
                    <div style={{ width: `${s.pos * 100 * barre}%`, background: C.vert }} />
                    <div style={{ width: `${(1 - s.pos) * 100 * barre}%`, background: C.rouge }} />
                  </div>
                  <div
                    style={{
                      width: 90,
                      textAlign: "right",
                      fontSize: 30,
                      fontWeight: 800,
                      color: s.score < 0 ? C.rougeTexte : C.vertTexte,
                    }}
                  >
                    {signe(s.score * barre)}
                  </div>
                  <div
                    style={{
                      width: 170,
                      opacity: premier ? priorite : 0,
                      transform: `scale(${0.7 + 0.3 * priorite})`,
                    }}
                  >
                    {premier && (
                      <span style={{ background: C.encre, color: C.beurre, borderRadius: 999, padding: "8px 18px", fontSize: 22, fontWeight: 800 }}>
                        Priorité
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Carte>
      {pluie}
    </AbsoluteFill>
  );
};
