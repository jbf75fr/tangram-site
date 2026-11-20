import React from "react";
import { Composition, continueRender, delayRender, registerRoot, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { FPS } from "./commun";
import { DUREE, Introduction } from "./Introduction";

// Police du site (Figtree), servie localement.
const attente = delayRender("Chargement de la police");
loadFont({ family: "Figtree", url: staticFile("figtree.woff2"), weight: "300 900" }).then(() => continueRender(attente));

const Racine: React.FC = () => (
  <Composition id="Introduction" component={Introduction} durationInFrames={DUREE * FPS} fps={FPS} width={1920} height={1080} />
);

registerRoot(Racine);
