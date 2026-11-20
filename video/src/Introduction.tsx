import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FPS } from "./commun";
import { Scene0 } from "./scenes/Scene0";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { SousTitres } from "./SousTitres";

// Les scènes 1 à 5 sont écrites en temps « sans l'accueil » : elles commencent après DECALAGE secondes.
export const DECALAGE = 3;
export const DUREE = 49;

// Passages où la voix parle : la musique baisse dessous (voir voix/texte.txt).
const VOIX: [number, number][] = [
  [0.6, 3.0],
  [3.5, 10.1],
  [9.5, 18.7],
  [21.0, 28.0],
  [30.4, 37.4],
  [39.0, 42.9],
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
  [0.1, "whoosh", 0.3],
  [0.65, "pop", 0.4],
  [1.95, "pop", 0.35],
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
  [13.1, "pop", 0.4],
  [14.55, "pop", 0.4],
  [15.55, "pop", 0.4],
  [16.6, "pop", 0.4],
  [17.85, "pop", 0.4],
  [20.0, "whoosh", 0.45],
  [22.1, "whoosh", 0.4],
  [22.6, "pop", 0.4],
  [24.5, "pop", 0.4],
  [25.35, "whoosh", 0.25],
  [25.9, "pop", 0.4],
  [29.9, "whoosh", 0.4],
  [32.2, "clic", 0.55],
  [33.0, "succes", 0.35],
  [34.3, "whoosh", 0.35],
  [34.8, "pop", 0.35],
  [35.15, "pop", 0.35],
  [35.5, "pop", 0.35],
  [37.45, "whoosh", 0.45],
  [41.9, "pop", 0.4],
  [43.2, "clic", 0.55],
];

export const Introduction: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const s = t - DECALAGE;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      {s > -0.4 && <Scene1 t={s} />}
      <Scene2 t={s} />
      <Scene3 t={s} />
      <Scene4 t={s} />
      <Scene5 t={s} />
      <Scene0 t={t} />
      <SousTitres t={s} />
      <Audio src={staticFile("musique.mp3")} volume={volumeMusique} />
      <Audio src={staticFile("voix-off.mp3")} />
      {[...BRUITS_ACCUEIL, ...BRUITS.map(([d, n, v]) => [d + DECALAGE, n, v] as [number, string, number])].map(([debut, son, volume], i) => (
        <Sequence key={i} from={Math.round(debut * FPS)} layout="none">
          <Audio src={staticFile(`sons/${son}.mp3`)} volume={volume} endAt={son === "frappe" ? Math.round(1.4 * FPS) : undefined} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
