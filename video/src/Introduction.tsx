import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FPS } from "./commun";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { SousTitres } from "./SousTitres";

export const DUREE = 46;

// Passages où la voix parle : la musique baisse dessous (voir voix/texte.txt).
const VOIX: [number, number][] = [
  [0.5, 7.1],
  [9.5, 18.7],
  [21.0, 28.3],
  [30.5, 37.2],
  [39.0, 44.5],
];

const volumeMusique = (f: number) => {
  const t = f / FPS;
  const sousVoix = VOIX.some(([a, b]) => t > a - 0.25 && t < b + 0.15);
  const base = sousVoix ? 0.16 : 0.42;
  const debut = interpolate(t, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const fin = interpolate(t, [45.2, 46], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return base * debut * fin;
};

// Bruitages : [instant, fichier, volume].
const BRUITS: [number, string, number][] = [
  [0.35, "clic", 0.5],
  [0.9, "frappe", 0.35],
  [2.5, "clic", 0.5],
  [2.8, "whoosh", 0.35],
  [3.15, "pop", 0.3],
  [4.3, "whoosh", 0.3],
  [4.55, "pop", 0.4],
  [8.45, "whoosh", 0.45],
  [9.05, "pop", 0.3],
  [13.1, "pop", 0.4],
  [14.55, "pop", 0.4],
  [15.55, "pop", 0.4],
  [16.6, "pop", 0.4],
  [17.85, "pop", 0.4],
  [20.0, "whoosh", 0.45],
  [22.5, "whoosh", 0.4],
  [22.95, "pop", 0.4],
  [26.3, "pop", 0.4],
  [29.9, "whoosh", 0.4],
  [32.3, "clic", 0.55],
  [33.1, "succes", 0.35],
  [34.3, "whoosh", 0.35],
  [34.8, "pop", 0.35],
  [35.15, "pop", 0.35],
  [35.5, "pop", 0.35],
  [37.45, "whoosh", 0.45],
  [41.85, "pop", 0.4],
  [43.5, "clic", 0.55],
];

export const Introduction: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      <Scene1 t={t} />
      <Scene2 t={t} />
      <Scene3 t={t} />
      <Scene4 t={t} />
      <Scene5 t={t} />
      <SousTitres t={t} />
      <Audio src={staticFile("musique-46s.mp3")} volume={volumeMusique} />
      <Audio src={staticFile("voix-off-46s.mp3")} />
      {BRUITS.map(([debut, son, volume], i) => (
        <Sequence key={i} from={Math.round(debut * FPS)} layout="none">
          <Audio src={staticFile(`sons/${son}.mp3`)} volume={volume} endAt={son === "frappe" ? Math.round(1.4 * FPS) : undefined} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
