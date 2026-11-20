import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { C, FPS } from "./commun";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";

// Vidéo d'introduction de 45 s. Les temps (en secondes) suivent la voix off,
// voir voix/texte.txt.
export const Introduction: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      <Scene1 t={t} />
      <Scene2 t={t} />
      <Scene3 t={t} />
      <Scene4 t={t} />
      <Scene5 t={t} />
      <Audio src={staticFile("voix-off-45s.mp3")} />
    </AbsoluteFill>
  );
};
