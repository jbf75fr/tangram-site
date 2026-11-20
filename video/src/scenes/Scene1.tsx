import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Carte, Logo, Marque, POLICE, entre, ressort, hasard } from "../commun";

// Scène 1 (0 à 9 s) : le client écrit, le commentaire arrive dans le CRM puis dans tangram.cx.
export const COMMENTAIRE = "Conseiller très à l'écoute, mais trois semaines pour être livré. Je ne recommanderai pas.";

const Enquete: React.FC<{ t: number }> = ({ t }) => {
  const apparition = ressort(t, 0);
  const tapes = Math.floor(entre(t, 0.9, 2.6, 0, COMMENTAIRE.length, (n) => n));
  const appui = t > 2.75 && t < 2.95 ? 0.94 : 1;
  // Après l'envoi, la carte rapetisse et file dans le CRM.
  const depart = entre(t, 3.0, 3.6, 0, 1);
  const echelle = (0.85 + 0.15 * apparition) * (1 - 0.72 * depart);
  const x = 960 + (530 - 960) * depart;
  const y = 540 + (330 - 540) * depart;
  const opacite = entre(t, 0, 0.3, 0, 1) * entre(t, 3.45, 3.7, 1, 0);
  return (
    <Carte
      style={{
        width: 900,
        left: x - 450,
        top: y - 330,
        height: 660,
        padding: 56,
        boxSizing: "border-box",
        transform: `scale(${echelle})`,
        opacity: opacite,
      }}
    >
      <div style={{ fontSize: 24, color: C.encreDouce, fontWeight: 600 }}>Votre avis compte</div>
      <div style={{ fontSize: 34, fontWeight: 700, marginTop: 10 }}>Recommanderiez-vous notre enseigne à un proche ?</div>
      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        {Array.from({ length: 11 }, (_, i) => {
          const choisi = i === 6 && t > 0.55;
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
                transform: `scale(${choisi ? 1 + 0.12 * (1 - ressort(t, 0.55, 9)) : 1})`,
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
          border: `2px solid ${t > 0.85 ? C.iris : C.gris}`,
          padding: "18px 22px",
          fontSize: 30,
          lineHeight: 1.4,
          fontWeight: 500,
        }}
      >
        {COMMENTAIRE.slice(0, tapes)}
        <span style={{ opacity: t > 0.85 && t < 2.8 && Math.floor(t * 3) % 2 === 0 ? 1 : 0, color: C.iris }}>|</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
        <div
          style={{
            background: C.beurre,
            borderRadius: 999,
            padding: "16px 40px",
            fontSize: 26,
            fontWeight: 700,
            transform: `scale(${appui})`,
          }}
        >
          Envoyer
        </div>
      </div>
    </Carte>
  );
};

const LIGNES_CRM = [
  { nom: 0.55, sujet: 0.8 },
  { nom: 0.42, sujet: 0.6 },
  { nom: 0.6, sujet: 0.7 },
  { nom: 0.38, sujet: 0.85 },
  { nom: 0.5, sujet: 0.55 },
];

const Crm: React.FC<{ t: number }> = ({ t }) => {
  const a = ressort(t, 2.9);
  const nouvelle = ressort(t, 3.55, 12);
  return (
    <Carte
      style={{
        left: 150,
        top: 190,
        width: 760,
        height: 700,
        overflow: "hidden",
        opacity: a,
        transform: `translateX(${(1 - a) * -80}px)`,
      }}
    >
      <div style={{ height: 70, background: C.encre, display: "flex", alignItems: "center", padding: "0 28px", gap: 12 }}>
        {[C.rouge, C.beurre, C.vert].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.85 }} />
        ))}
        <div style={{ color: C.blanc, fontSize: 26, fontWeight: 700, marginLeft: 18 }}>Votre CRM</div>
      </div>
      <div style={{ padding: 28 }}>
        <div
          style={{
            height: 104 * nouvelle,
            opacity: nouvelle,
            overflow: "hidden",
            marginBottom: 14 * nouvelle,
          }}
        >
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
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 26, background: C.iris, color: C.blanc, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>6</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Nouvelle réponse</div>
              <div style={{ fontSize: 20, color: C.encreDouce, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{COMMENTAIRE}</div>
            </div>
          </div>
        </div>
        {LIGNES_CRM.map((l, i) => (
          <div key={i} style={{ height: 88, display: "flex", alignItems: "center", gap: 18, borderBottom: `2px solid ${C.grisClair}`, padding: "0 22px" }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: C.grisClair }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 14, width: `${l.nom * 100}%`, background: C.gris, borderRadius: 7 }} />
              <div style={{ height: 12, width: `${l.sujet * 100}%`, background: C.grisClair, borderRadius: 6, marginTop: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </Carte>
  );
};

// Courbe entre le CRM et la tuile tangram.cx.
const P0 = { x: 910, y: 540 };
const P1 = { x: 1130, y: 380 };
const P2 = { x: 1260, y: 700 };
const P3 = { x: 1440, y: 540 };
const surCourbe = (u: number) => {
  const v = 1 - u;
  return {
    x: v * v * v * P0.x + 3 * v * v * u * P1.x + 3 * v * u * u * P2.x + u * u * u * P3.x,
    y: v * v * v * P0.y + 3 * v * v * u * P1.y + 3 * v * u * u * P2.y + u * u * u * P3.y,
  };
};

const Flux: React.FC<{ t: number }> = ({ t }) => {
  const trace = entre(t, 4.4, 5.2, 0, 1);
  const tuile = ressort(t, 4.9);
  const bulles = Array.from({ length: 16 }, (_, i) => {
    const debut = 5.2 + i * 0.16 + hasard(i) * 0.1;
    const u = entre(t, debut, debut + 0.9, 0, 1, (n) => n * n * (3 - 2 * n));
    if (u <= 0 || u >= 1) return null;
    const p = surCourbe(u);
    const couleur = [C.iris, C.beurre, C.vert, C.rouge][i % 4];
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
          boxShadow: "0 6px 16px rgba(30,16,51,0.12)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 6,
          padding: "0 12px",
          boxSizing: "border-box",
          transform: `scale(${0.6 + 0.4 * Math.sin(Math.PI * u)})`,
        }}
      >
        <div style={{ height: 5, borderRadius: 3, background: couleur, width: "90%" }} />
        <div style={{ height: 5, borderRadius: 3, background: C.gris, width: "60%" }} />
      </div>
    );
  });
  // La tuile palpite à chaque arrivée.
  const pouls = 1 + 0.04 * Math.max(0, Math.sin((t - 5.9) * 10)) * entre(t, 5.9, 6.2, 0, 1) * entre(t, 8, 8.4, 1, 0);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          d={`M${P0.x},${P0.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`}
          fill="none"
          stroke={C.iris}
          strokeWidth={4}
          strokeDasharray="2 14"
          strokeLinecap="round"
          pathLength={1000}
          style={{ strokeDashoffset: 0, opacity: trace * 0.7 }}
          clipPath="url(#revele)"
        />
        <defs>
          <clipPath id="revele">
            <rect x={P0.x - 10} y={0} width={(P3.x - P0.x + 20) * trace} height={1080} />
          </clipPath>
        </defs>
      </svg>
      {bulles}
      <div
        style={{
          position: "absolute",
          left: 1440,
          top: 400,
          width: 280,
          height: 280,
          borderRadius: 48,
          background: C.blanc,
          boxShadow: "0 24px 60px rgba(30,16,51,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${tuile * pouls})`,
        }}
      >
        <Logo taille={190} />
      </div>
      <div style={{ position: "absolute", left: 1440, top: 712, width: 280, textAlign: "center", opacity: tuile }}>
        <Marque taille={40} />
      </div>
    </>
  );
};

export const Scene1: React.FC<{ t: number }> = ({ t }) => {
  if (t > 9.4) return null;
  // Sortie : on plonge vers la tuile tangram.cx.
  const sortie = entre(t, 8.2, 9.2, 0, 1, (n) => n * n);
  return (
    <AbsoluteFill
      style={{
        fontFamily: POLICE,
        transformOrigin: "1580px 540px",
        transform: `scale(${1 + sortie * 2.2})`,
        opacity: 1 - sortie,
      }}
    >
      <Crm t={t} />
      <Flux t={t} />
      <Enquete t={t} />
    </AbsoluteFill>
  );
};
