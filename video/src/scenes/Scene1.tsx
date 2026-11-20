import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Camera, Carte, Cle, Logo, Marque, POLICE, entre, fmt, hasard, ressort, secousse } from "../commun";

// Scène 1 (0 à 9 s) : le client écrit, les réponses affluent dans le CRM, tangram.cx les récupère.
export const COMMENTAIRE = "Conseiller très à l'écoute, mais trois semaines pour être livré. Je ne recommanderai pas.";

const CLES: Cle[] = [
  [0, 960, 420, 2.4],
  [0.55, 960, 420, 2.3],
  [0.85, 820, 640, 1.9],
  [2.3, 1040, 650, 1.75],
  [2.75, 960, 540, 1.0],
  [3.0, 900, 540, 0.98],
  [3.6, 760, 540, 1.0],
  [4.25, 760, 540, 1.02],
  [4.65, 1120, 540, 0.92],
  [5.8, 1160, 560, 0.95],
  [7.75, 1420, 560, 1.35],
  [8.05, 1520, 540, 1.6],
  [8.7, 1520, 540, 45],
];

// Le carré d'enquête : centré en (960, 540), 900 x 660.
const Enquete: React.FC<{ t: number }> = ({ t }) => {
  const tapes = Math.floor(entre(t, 0.9, 2.3, 0, COMMENTAIRE.length, (n) => n));
  const appui = t > 2.5 && t < 2.68 ? 0.9 : 1;
  const depart = entre(t, 2.8, 3.25, 0, 1, (n) => n * n);
  const x = 960 + (530 - 960) * depart;
  const y = 540 + (330 - 540) * depart;
  return (
    <Carte
      style={{
        width: 900,
        height: 660,
        left: x - 450,
        top: y - 330,
        padding: 56,
        boxSizing: "border-box",
        transform: `scale(${1 - 0.8 * depart})`,
        opacity: 1 - entre(t, 3.15, 3.3, 0, 1),
      }}
    >
      <div style={{ fontSize: 24, color: C.encreDouce, fontWeight: 600 }}>Votre avis compte</div>
      <div style={{ fontSize: 34, fontWeight: 700, marginTop: 10 }}>Recommanderiez-vous notre enseigne à un proche ?</div>
      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        {Array.from({ length: 11 }, (_, i) => {
          const choisi = i === 6 && t > 0.35;
          return (
            <div
              key={i}
              style={{
                width: 62,
                height: 62,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 700,
                background: choisi ? C.iris : C.grisClair,
                color: choisi ? C.blanc : C.encre,
                transform: `scale(${choisi ? 1 + 0.25 * (1 - ressort(t, 0.35, 8)) : 1})`,
              }}
            >
              {i}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 24, color: C.encreDouce, fontWeight: 600, marginTop: 34 }}>Dites-nous en plus</div>
      <div
        style={{
          marginTop: 12,
          height: 150,
          borderRadius: 16,
          border: `2px solid ${t > 0.8 ? C.iris : C.gris}`,
          padding: "18px 22px",
          fontSize: 30,
          lineHeight: 1.4,
          fontWeight: 500,
        }}
      >
        {COMMENTAIRE.slice(0, tapes)}
        <span style={{ opacity: t > 0.8 && t < 2.5 && Math.floor(t * 4) % 2 === 0 ? 1 : 0, color: C.iris }}>|</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
        <div style={{ background: C.beurre, borderRadius: 999, padding: "16px 40px", fontSize: 26, fontWeight: 700, transform: `scale(${appui})` }}>
          Envoyer
        </div>
      </div>
    </Carte>
  );
};

// Réponses qui affluent de tous les bords vers le CRM.
const ARRIVEES = Array.from({ length: 34 }, (_, i) => {
  const angle = hasard(i) * Math.PI * 2;
  return {
    debut: 3.0 + i * 0.038 + hasard(i + 50) * 0.25,
    x0: 530 + Math.cos(angle) * 1500,
    y0: 400 + Math.sin(angle) * 1000,
    couleur: [C.vert, C.rouge, C.iris, C.beurre][i % 4],
  };
});

const Crm: React.FC<{ t: number }> = ({ t }) => {
  const a = ressort(t, 2.8);
  const arrivees = ARRIVEES.filter((r) => t > r.debut + 0.45).length;
  const total = 1204 + arrivees * 1 + Math.floor(entre(t, 3.3, 8, 0, 36, (n) => n));
  return (
    <>
      <Carte
        style={{
          left: 150,
          top: 190,
          width: 760,
          height: 700,
          overflow: "hidden",
          opacity: a,
          transform: `translateX(${(1 - a) * -200}px) scale(${1 + secousse(t, ARRIVEES.map((r) => r.debut + 0.45), 0.004)})`,
        }}
      >
        <div style={{ height: 70, background: C.encre, display: "flex", alignItems: "center", padding: "0 28px", gap: 12 }}>
          {[C.rouge, C.beurre, C.vert].map((c) => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.85 }} />
          ))}
          <div style={{ color: C.blanc, fontSize: 26, fontWeight: 700, marginLeft: 18 }}>Votre CRM</div>
          <div style={{ marginLeft: "auto", color: C.beurre, fontSize: 24, fontWeight: 700 }}>{fmt(total)} réponses</div>
        </div>
        <div style={{ padding: 28 }}>
          <div
            style={{
              background: C.beurrePale,
              border: `2px solid ${C.beurre}`,
              borderRadius: 18,
              height: 100,
              display: "flex",
              alignItems: "center",
              padding: "0 22px",
              gap: 18,
              marginBottom: 14,
              transform: `scale(${0.6 + 0.4 * ressort(t, 3.15)})`,
              opacity: entre(t, 3.15, 3.25, 0, 1),
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 26, background: C.iris, color: C.blanc, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>6</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Nouvelle réponse</div>
              <div style={{ fontSize: 20, color: C.encreDouce, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{COMMENTAIRE}</div>
            </div>
          </div>
          {/* La liste défile vers le bas à chaque arrivée. */}
          <div style={{ height: 500, overflow: "hidden", position: "relative" }}>
            {Array.from({ length: 40 }, (_, k) => {
              const y = (k - arrivees) * 84 + 0;
              if (y < -84 || y > 520) return null;
              const neuve = k >= arrivees - 1 && k <= arrivees;
              return (
                <div key={k} style={{ position: "absolute", left: 0, right: 0, top: y + entre(t, 0, 1, 0, 0), height: 84, display: "flex", alignItems: "center", gap: 18, borderBottom: `2px solid ${C.grisClair}`, padding: "0 22px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: neuve ? C.irisPale : C.grisClair }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, width: `${30 + hasard(k) * 40}%`, background: C.gris, borderRadius: 7 }} />
                    <div style={{ height: 12, width: `${50 + hasard(k + 9) * 40}%`, background: [C.vertFond, C.rougeFond, C.grisClair][k % 3], borderRadius: 6, marginTop: 12 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Carte>
      {ARRIVEES.map((r, i) => {
        const u = entre(t, r.debut, r.debut + 0.45, 0, 1, (n) => n * n);
        if (u <= 0 || u >= 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r.x0 + (530 - r.x0) * u - 60,
              top: r.y0 + (420 - r.y0) * u - 34,
              width: 120,
              height: 68,
              borderRadius: 14,
              background: C.blanc,
              boxShadow: "0 8px 20px rgba(30,16,51,0.15)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 8,
              padding: "0 16px",
              boxSizing: "border-box",
              transform: `scale(${1 - 0.5 * u}) rotate(${(1 - u) * (hasard(i + 3) - 0.5) * 60}deg)`,
            }}
          >
            <div style={{ height: 7, borderRadius: 4, background: r.couleur, width: "85%" }} />
            <div style={{ height: 7, borderRadius: 4, background: C.gris, width: "55%" }} />
          </div>
        );
      })}
    </>
  );
};

const P0 = { x: 910, y: 540 };
const P1 = { x: 1130, y: 360 };
const P2 = { x: 1270, y: 720 };
const P3 = { x: 1450, y: 540 };
const surCourbe = (u: number) => {
  const v = 1 - u;
  return {
    x: v * v * v * P0.x + 3 * v * v * u * P1.x + 3 * v * u * u * P2.x + u * u * u * P3.x,
    y: v * v * v * P0.y + 3 * v * v * u * P1.y + 3 * v * u * u * P2.y + u * u * u * P3.y,
  };
};
const BULLES = Array.from({ length: 60 }, (_, i) => 4.7 + i * 0.052 + hasard(i + 30) * 0.04);

const Flux: React.FC<{ t: number }> = ({ t }) => {
  const trace = entre(t, 4.3, 4.8, 0, 1);
  const tuile = ressort(t, 4.55, 11);
  const arrivees = BULLES.map((d) => d + 0.38);
  // Anneau qui se remplit à mesure que les commentaires arrivent.
  const anneau = entre(t, 5.0, 7.9, 0, 1, (n) => n);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <clipPath id="revele">
            <rect x={P0.x - 10} y={0} width={(P3.x - P0.x + 20) * trace} height={1080} />
          </clipPath>
        </defs>
        <path
          d={`M${P0.x},${P0.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`}
          fill="none"
          stroke={C.iris}
          strokeWidth={4}
          strokeDasharray="2 14"
          strokeLinecap="round"
          opacity={0.7}
          clipPath="url(#revele)"
        />
      </svg>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={1580} cy={540} r={178} fill="none" stroke={C.grisClair} strokeWidth={10} opacity={tuile} />
        <circle cx={1580} cy={540} r={178} fill="none" stroke={C.iris} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - anneau} transform="rotate(-90 1580 540)" />
      </svg>
      {BULLES.map((debut, i) => {
        const u = entre(t, debut, debut + 0.38, 0, 1, (n) => n * n);
        if (u <= 0 || u >= 1) return null;
        const p = surCourbe(u);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x - 30,
              top: p.y - 20,
              width: 60,
              height: 40,
              borderRadius: 12,
              background: C.blanc,
              boxShadow: "0 6px 16px rgba(30,16,51,0.14)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              padding: "0 12px",
              boxSizing: "border-box",
              transform: `scale(${0.6 + 0.5 * Math.sin(Math.PI * u)})`,
            }}
          >
            <div style={{ height: 5, borderRadius: 3, background: [C.iris, C.vert, C.rouge, C.beurre][i % 4], width: "90%" }} />
            <div style={{ height: 5, borderRadius: 3, background: C.gris, width: "60%" }} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 1440,
          top: 400,
          width: 280,
          height: 280,
          borderRadius: 48,
          background: C.blanc,
          boxShadow: "0 24px 60px rgba(30,16,51,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${tuile * (1 + secousse(t, arrivees, 0.05))})`,
        }}
      >
        <Logo taille={190} />
      </div>
      <div style={{ position: "absolute", left: 1440, top: 712, width: 280, textAlign: "center", opacity: tuile }}>
        <Marque taille={40} />
      </div>
      {/* Souveraineté : formulation du site, sans promettre que rien ne quitte l'Union européenne. */}
      <div style={{ position: "absolute", left: 1580 - 260, top: 790, width: 520, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: C.encre,
            color: C.blanc,
            borderRadius: 999,
            padding: "12px 26px 12px 14px",
            fontSize: 26,
            fontWeight: 700,
            opacity: Math.min(1, ressort(t, 5.4, 12) * 2),
            transform: `translateY(${(1 - ressort(t, 5.4, 12)) * 30}px) scale(${0.7 + 0.3 * ressort(t, 5.4, 12)})`,
          }}
        >
          <svg width={40} height={40} viewBox="0 0 40 40">
            <circle cx={20} cy={20} r={20} fill={C.iris} />
            {Array.from({ length: 12 }, (_, k) => (
              <circle key={k} cx={20 + 12 * Math.cos((k * Math.PI) / 6)} cy={20 + 12 * Math.sin((k * Math.PI) / 6)} r={2} fill={C.beurre} />
            ))}
          </svg>
          Hébergé dans l'Union européenne
        </div>
      </div>
    </>
  );
};

export const Scene1: React.FC<{ t: number }> = ({ t }) => {
  if (t > 8.8) return null;
  return (
    <AbsoluteFill style={{ fontFamily: POLICE, overflow: "hidden" }}>
      <Camera t={t} cles={CLES} extra={secousse(t, [0.35, 2.55, 4.55], 0.03)}>
        <Crm t={t} />
        <Flux t={t} />
        <Enquete t={t} />
      </Camera>
    </AbsoluteFill>
  );
};
