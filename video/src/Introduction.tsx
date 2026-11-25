import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FPS, entre } from "./commun";
import { Scene0 } from "./scenes/Scene0";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { PieceTransit, Scene3 } from "./scenes/Scene3";
import { EXPERT, Scene4 } from "./scenes/Scene4";
import { POSES, Scene5 } from "./scenes/Scene5";
import { SousTitres } from "./SousTitres";

// Les scènes 1 à 5 sont écrites en temps « sans l'accueil » : elles commencent après DECALAGE secondes.
export const DECALAGE = 3;
export const DUREE = 57;
// Phrase de l'expert insérée avant la fin : tout ce qui suit APRES (temps « sans l'ouverture ») est décalé de FIN_DECALAGE.
export const FIN_DECALAGE = 4;
const APRES = 37.4;

// Passages où la voix parle : la musique baisse dessous (voir voix/texte.txt).
const VOIX: [number, number][] = [
  [0.25, 2.5],
  [3.3, 10.6],
  [10.4, 18.5],
  [20.9, 29.7],
  [30.6, 41.6],
  [42.2, 51.8],
];

const volumeMusique = (f: number) => {
  const t = f / FPS;
  const sousVoix = VOIX.some(([a, b], i) => (i < 2 ? t > a - 0.25 && t < b + 0.15 : t - DECALAGE > a - 0.25 && t - DECALAGE < b + 0.15));
  const base = sousVoix ? 0.16 : 0.42;
  const debut = interpolate(t, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const fin = interpolate(t, [DUREE - 0.8, DUREE], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return base * debut * fin;
};

// Bruitages : [instant, fichier, volume].
// Les instants des bruitages sont en temps « sans l'accueil », sauf ceux de l'accueil (BRUITS_ACCUEIL).
const BRUITS_ACCUEIL: [number, string, number][] = [
  [0.05, "whoosh", 0.3],
  [2.0, "pop", 0.35],
  [2.9, "whoosh", 0.45],
];
const BRUITS: [number, string, number][] = [
  [0.35, "clic", 0.5],
  [0.9, "frappe", 0.35],
  [2.5, "clic", 0.5],
  [2.8, "whoosh", 0.35],
  [3.15, "pop", 0.3],
  [4.3, "whoosh", 0.3],
  [4.55, "pop", 0.4],
  [8.0, "whoosh", 0.45],
  [8.75, "pop", 0.3],
  [13.06, "pop", 0.4],
  [14.42, "pop", 0.4],
  [15.3, "pop", 0.4],
  [16.26, "pop", 0.4],
  [17.54, "pop", 0.4],
  [20.0, "whoosh", 0.45],
  [21.9, "whoosh", 0.4],
  [24.5, "whoosh", 0.3],
  [25.9, "pop", 0.4],
  [27.7, "whoosh", 0.2],
  [29.95, "whoosh", 0.4],
  [32.3, "clic", 0.55],
  [33.1, "succes", 0.35],
  [35.1, "whoosh", 0.35],
  [35.6, "pop", 0.35],
  [35.95, "pop", 0.35],
  [36.3, "pop", 0.35],
  [37.45, "whoosh", 0.45],
  [POSES[POSES.length - 1], "pop", 0.35],
  [45.42, "pop", 0.4],
  [48.55, "clic", 0.55],
];

export const Introduction: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const s = t - DECALAGE;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      {s > -0.1 && (
        <AbsoluteFill style={{ transform: `translateY(${entre(t, 2.95, 3.3, 1, 0, (n) => 1 - Math.pow(1 - n, 3)) * 1100}px)` }}>
          <Scene1 t={s} />
        </AbsoluteFill>
      )}
      <Scene2 t={s} />
      <Scene3 t={s} />
      <Scene4 t={s} />
      <PieceTransit t={s} />
      <Scene5 t={s - FIN_DECALAGE} />
      <Scene0 t={t} />
      <SousTitres t={s} />
      <Audio src={staticFile("musique.mp3")} volume={volumeMusique} />
      <Audio src={staticFile("voix-off.mp3")} />
      {[...BRUITS_ACCUEIL, ...BRUITS.map(([d, n, v]) => [d + DECALAGE + (d >= APRES ? FIN_DECALAGE : 0), n, v] as [number, string, number]), [EXPERT + DECALAGE, "pop", 0.35] as [number, string, number]].map(([debut, son, volume], i) => (
        <Sequence key={i} from={Math.round(debut * FPS)} layout="none">
          <Audio src={staticFile(`sons/${son}.mp3`)} volume={volume} endAt={son === "frappe" ? Math.round(1.4 * FPS) : undefined} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
