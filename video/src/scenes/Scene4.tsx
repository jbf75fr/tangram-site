import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Carte, Cle, Curseur, POLICE, entre, ressort, secousse, signe } from "../commun";

// Scène 4 (30 à 38 s) : l'équipe agit, mesure l'effet et partage.
const EQUIPES = [
  { nom: "Direction", initiales: "DG", couleur: C.iris, debut: 34.8 },
  { nom: "Service client", initiales: "SC", couleur: C.vert, debut: 35.15 },
  { nom: "Logistique", initiales: "LO", couleur: C.encre, debut: 35.5 },
];

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

const CLES: Cle[] = [
  [30.3, 610, 540, 2.4],
  [30.8, 610, 540, 1.3],
  [31.9, 560, 700, 1.4],
  [32.2, 560, 700, 1.42],
  [33.2, 610, 600, 1.45],
  [34.3, 620, 520, 1.42],
  [34.8, 1150, 540, 1.0],
  [37.25, 1120, 540, 0.95],
  [37.9, 960, 540, 0.25],
];

export const Scene4: React.FC<{ t: number }> = ({ t }) => {
  if (t < 30.25 || t > 37.95) return null;
  const clic = 32.2;
  const mesure = entre(t, clic + 0.1, clic + 0.8, 0, 1, (n) => 1 - Math.pow(1 - n, 3));
  const apres = -34 + 46 * mesure;
  const ecart = ressort(t, 33.05, 10);
  const rapport = ressort(t, 34.5, 12);
  // Le curseur arrive sur le bouton puis s'efface.
  const vers = entre(t, 31.4, 32.05, 0, 1);
  const curseurX = 760 + (340 - 760) * vers;
  const curseurY = 980 + (830 - 980) * vers;
  const sortie = entre(t, 37.5, 37.95, 0, 1);

  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: POLICE, overflow: "hidden", opacity: entre(t, 30.25, 30.4, 0, 1) * (1 - sortie) }}>
      <Camera t={t} cles={CLES} extra={secousse(t, [clic, 33.05, ...EQUIPES.map((e) => e.debut)], 0.025)}>
        <Carte style={{ left: 150, top: 170, width: 920, height: 740, padding: "48px 56px", boxSizing: "border-box" }}>
          <div style={{ fontSize: 24, color: C.encreDouce, fontWeight: 700 }}>Plan d'action</div>
          <div style={{ fontSize: 46, fontWeight: 800, marginTop: 8 }}>Réduire les délais de livraison</div>
          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            {["Sujet : Délais de livraison", "Échéance : 31 mars", "Pilote : Logistique"].map((x, i) => {
              const a = ressort(t, 30.7 + i * 0.08);
              return (
                <span key={x} style={{ background: C.grisClair, borderRadius: 999, padding: "8px 18px", fontSize: 21, fontWeight: 600, opacity: a, transform: `scale(${0.6 + 0.4 * a})`, display: "inline-block" }}>
                  {x}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginTop: 44 }}>
            <div>
              <div style={{ fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>Avant</div>
              <div style={{ fontSize: 72, fontWeight: 800, color: C.rougeTexte }}>-34</div>
            </div>
            <div style={{ fontSize: 52, color: C.gris, fontWeight: 800, paddingBottom: 14 }}>→</div>
            <div style={{ opacity: entre(t, clic, clic + 0.1, 0, 1), transform: `scale(${1 + secousse(t, [clic + 0.8], 0.25)})`, transformOrigin: "0 100%" }}>
              <div style={{ fontSize: 22, color: C.encreDouce, fontWeight: 600 }}>Après</div>
              <div style={{ fontSize: 72, fontWeight: 800, color: apres < 0 ? C.rougeTexte : C.vertTexte }}>{signe(apres)}</div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                marginBottom: 20,
                background: C.vert,
                color: C.blanc,
                borderRadius: 999,
                padding: "12px 26px",
                fontSize: 30,
                fontWeight: 800,
                opacity: Math.min(1, ecart * 2),
                transform: `scale(${0.3 + 0.7 * ecart}) rotate(${(1 - ecart) * -10}deg)`,
              }}
            >
              ▲ 46 points
            </div>
          </div>
          <svg width={808} height={190} style={{ marginTop: 18, overflow: "visible" }}>
            <line x1={0} x2={808} y1={150} y2={150} stroke={C.grisClair} strokeWidth={3} />
            <path d={cheminLisse(808, 190)} fill="none" stroke={C.vert} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - mesure} />
          </svg>
          <div style={{ position: "absolute", left: 56, bottom: 44, opacity: entre(t, 33.6, 33.9, 1, 0) }}>
            <span
              style={{
                display: "inline-block",
                border: `2px solid ${C.iris}`,
                color: t > clic ? C.blanc : C.iris,
                background: t > clic ? C.iris : C.blanc,
                borderRadius: 999,
                padding: "14px 30px",
                fontSize: 26,
                fontWeight: 700,
                transform: `scale(${t > clic && t < clic + 0.15 ? 0.9 : 1})`,
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
            opacity: Math.min(1, rapport * 2),
            transform: `translateY(${(1 - rapport) * 120}px) rotate(${(1 - rapport) * 10}deg) scale(${0.6 + 0.4 * rapport})`,
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
          const a = ressort(t, e.debut, 11);
          const trajet = entre(t, e.debut - 0.2, e.debut + 0.1, 0, 1);
          const y = 640 + i * 120;
          return (
            <React.Fragment key={e.nom}>
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                <path d={`M1330,550 C1330,${y} 1400,${y} 1470,${y}`} fill="none" stroke={C.iris} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={0.6 * trajet} />
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
                  opacity: Math.min(1, a * 2),
                  transform: `translateX(${(1 - a) * 120}px) scale(${0.7 + 0.3 * a})`,
                }}
              >
                <div style={{ width: 54, height: 54, borderRadius: 27, background: e.couleur, color: C.blanc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>{e.initiales}</div>
                <div style={{ fontSize: 26, fontWeight: 700, flex: 1 }}>{e.nom}</div>
                <div style={{ color: C.vert, fontSize: 30, fontWeight: 800, transform: `scale(${ressort(t, e.debut + 0.25, 8)})` }}>✓</div>
              </Carte>
            </React.Fragment>
          );
        })}
        <Curseur x={curseurX} y={curseurY} appui={t > clic && t < clic + 0.15} opacite={entre(t, 31.3, 31.45, 0, 1) * entre(t, 33.0, 33.3, 1, 0)} />
      </Camera>
    </AbsoluteFill>
  );
};
