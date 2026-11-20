import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Carte, POLICE, entre, ressort, signe } from "../commun";

// Scène 4 (32 à 40 s) : l'équipe agit, mesure l'effet et partage.
const EQUIPES = [
  { nom: "Direction", initiales: "DG", couleur: C.iris },
  { nom: "Service client", initiales: "SC", couleur: C.vert },
  { nom: "Logistique", initiales: "LO", couleur: C.encre },
];

// Courbe arrondie qui monte de -34 à +12.
const POINTS = [
  [0, 0.82],
  [0.18, 0.86],
  [0.36, 0.7],
  [0.55, 0.52],
  [0.75, 0.3],
  [1, 0.14],
];
const cheminLisse = (l: number, h: number) => {
  const p = POINTS.map(([x, y]) => [x * l, y * h]);
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [x0, y0] = p[i];
    const [x1, y1] = p[i + 1];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
};

export const Scene4: React.FC<{ t: number }> = ({ t }) => {
  if (t < 31.5 || t > 40.6) return null;
  const action = ressort(t, 31.9, 15);
  const appui = t > 33.85 && t < 34.05 ? 0.93 : 1;
  const mesure = entre(t, 34.1, 35.5, 0, 1);
  const apres = -34 + 46 * mesure;
  const ecart = ressort(t, 35.3, 11);
  const rapport = ressort(t, 35.9, 14);
  const sortie = entre(t, 39.6, 40.4, 0, 1);

  return (
    <AbsoluteFill style={{ fontFamily: POLICE, opacity: 1 - sortie }}>
      <Carte
        style={{
          left: 150,
          top: 170,
          width: 920,
          height: 740,
          padding: "48px 56px",
          boxSizing: "border-box",
          opacity: action,
          transform: `translateY(${(1 - action) * 60}px) scale(${0.9 + 0.1 * action})`,
        }}
      >
        <div style={{ fontSize: 24, color: C.encreDouce, fontWeight: 700 }}>Plan d'action</div>
        <div style={{ fontSize: 46, fontWeight: 800, marginTop: 8 }}>Réduire les délais de livraison</div>
        <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
          {["Sujet : Délais de livraison", "Échéance : 31 mars", "Pilote : Logistique"].map((x) => (
            <span key={x} style={{ background: C.grisClair, borderRadius: 999, padding: "8px 18px", fontSize: 21, fontWeight: 600 }}>
              {x}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginTop: 44 }}>
          <div>
            <div style={{ fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>Avant</div>
            <div style={{ fontSize: 72, fontWeight: 800, color: C.rougeTexte }}>-34</div>
          </div>
          <div style={{ fontSize: 52, color: C.gris, fontWeight: 800, paddingBottom: 14 }}>→</div>
          <div style={{ opacity: entre(t, 34.0, 34.3, 0, 1) }}>
            <div style={{ fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>Après</div>
            <div style={{ fontSize: 72, fontWeight: 800, color: apres < 0 ? C.rougeTexte : C.vertTexte }}>{signe(apres)}</div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              marginBottom: 20,
              background: C.vertFond,
              color: C.vertTexte,
              borderRadius: 999,
              padding: "12px 24px",
              fontSize: 28,
              fontWeight: 800,
              opacity: ecart,
              transform: `scale(${0.6 + 0.4 * ecart})`,
            }}
          >
            ▲ 46 points
          </div>
        </div>

        <svg width={808} height={190} style={{ marginTop: 18, overflow: "visible" }}>
          <line x1={0} x2={808} y1={150} y2={150} stroke={C.grisClair} strokeWidth={3} />
          <path
            d={cheminLisse(808, 190)}
            fill="none"
            stroke={C.vert}
            strokeWidth={7}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - mesure}
          />
        </svg>

        <div style={{ position: "absolute", left: 56, bottom: 44, opacity: entre(t, 35.6, 36.0, 1, 0) }}>
          <span
            style={{
              display: "inline-block",
              border: `2px solid ${C.iris}`,
              color: C.iris,
              borderRadius: 999,
              padding: "14px 30px",
              fontSize: 26,
              fontWeight: 700,
              transform: `scale(${appui})`,
              background: t > 33.85 ? C.irisPale : C.blanc,
            }}
          >
            ◎ Mesurer l'impact
          </span>
        </div>
      </Carte>

      <Carte
        style={{
          left: 1180,
          top: 170,
          width: 300,
          height: 380,
          padding: 34,
          boxSizing: "border-box",
          opacity: rapport,
          transform: `translateX(${(1 - rapport) * 80}px) rotate(${(1 - rapport) * 6}deg)`,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 800 }}>Rapport</div>
        <div style={{ fontSize: 20, color: C.encreDouce, fontWeight: 600, marginTop: 4 }}>Satisfaction, mars</div>
        {[0.9, 0.6, 0.75, 0.45].map((w, i) => (
          <div key={i} style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", marginTop: i ? 22 : 34, width: `${w * 100}%` }}>
            <div style={{ flex: 0.6, background: C.vert }} />
            <div style={{ flex: 0.4, background: C.rouge }} />
          </div>
        ))}
        <div style={{ height: 12, width: "70%", background: C.grisClair, borderRadius: 6, marginTop: 34 }} />
        <div style={{ height: 12, width: "50%", background: C.grisClair, borderRadius: 6, marginTop: 14 }} />
      </Carte>

      {EQUIPES.map((e, i) => {
        const a = ressort(t, 36.4 + i * 0.4, 13);
        const trajet = entre(t, 36.2 + i * 0.4, 36.7 + i * 0.4, 0, 1);
        const y = 640 + i * 120;
        return (
          <React.Fragment key={e.nom}>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
              <path
                d={`M1330,550 C1330,${y} 1400,${y} 1470,${y}`}
                fill="none"
                stroke={C.iris}
                strokeWidth={3}
                strokeDasharray="2 10"
                strokeLinecap="round"
                opacity={0.6 * trajet}
              />
            </svg>
            <Carte
              style={{
                left: 1480,
                top: y - 48,
                width: 330,
                height: 96,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 22px",
                boxSizing: "border-box",
                opacity: a,
                transform: `translateX(${(1 - a) * 60}px)`,
              }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 27, background: e.couleur, color: C.blanc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>
                {e.initiales}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, flex: 1 }}>{e.nom}</div>
              <div style={{ color: C.vert, fontSize: 30, fontWeight: 800, opacity: ressort(t, 36.8 + i * 0.4) }}>✓</div>
            </Carte>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
