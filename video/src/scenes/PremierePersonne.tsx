import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, entre, signe } from "../commun";

// Départ du parcours en vue subjective : on roule sur la courbe du parcours client elle-même,
// juste derrière la pièce de tangram (le wagon). La ligne zéro est un horizon en pointillé
// (vert au-dessus, rouge en dessous), chaque étape est un portique. Puis la caméra s'élève et
// pivote jusqu'à tomber exactement sur la frise du tableau de bord (vue de côté, en 2D).
export const DEBUT_PP = 21.95;
export const DEBUT_GRUE = 23.8;
// La grue est en place avant FIN_PP : le passage à la frise 2D se fait sur deux images identiques.
const FIN_GRUE = 24.5;
export const FIN_PP = 24.75;

// Mêmes données et même tracé que la frise (Scene3) : 1 unité 3D = 10 px de la frise.
const X0 = 60;
const LARGEUR = 1448;
const COL = LARGEUR / 5;
const ZERO = 250;
const ECH = 3.4;
const ETAPES = [
  { nom: "S'informer", score: 22 },
  { nom: "Commander", score: 9 },
  { nom: "Livraison", score: -34 },
  { nom: "Installation", score: 4 },
  { nom: "Service après-vente", score: -12 },
];
const centre = (i: number) => X0 + COL / 2 + i * COL;
const LISSE = [
  { x: X0, y: ZERO - 22 * ECH },
  ...ETAPES.map((e, i) => ({ x: centre(i), y: ZERO - e.score * ECH })),
  { x: X0 + LARGEUR, y: ZERO + 12 * ECH },
];
const yBezier = (pts: { x: number; y: number }[], x: number) => {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (x <= b.x) {
      const m = (a.x + b.x) / 2;
      let bas = 0;
      let haut = 1;
      for (let k = 0; k < 30; k++) {
        const u = (bas + haut) / 2;
        const v = 1 - u;
        const xu = v * v * v * a.x + 3 * v * v * u * m + 3 * v * u * u * m + u * u * u * b.x;
        if (xu < x) bas = u;
        else haut = u;
      }
      const u = (bas + haut) / 2;
      const v = 1 - u;
      return v * v * v * a.y + 3 * v * v * u * a.y + 3 * v * u * u * b.y + u * u * u * b.y;
    }
  }
  return pts[pts.length - 1].y;
};
// Tracé exact de la frise au repos (Scene3, traceA(0)) : les quatre sous-étapes de la Livraison sont
// prises sur la courbe lisse, puis le tracé passe par elles.
const SCOL = COL / 4;
const TRACE = [
  LISSE[0],
  LISSE[1],
  LISSE[2],
  ...[0, 1, 2, 3].map((i) => {
    const x = X0 + 2 * COL + SCOL / 2 + i * SCOL;
    return { x, y: yBezier(LISSE, x) };
  }),
  LISSE[4],
  LISSE[5],
  LISSE[6],
];
export const yFrise = (x: number) => yBezier(TRACE, x);
// Frise (px) → monde 3D.
const W = (x: number) => x / 10;
const H = (y: number) => (ZERO - y) / 10;

// Position de la pièce sur la frise (px) : elle traverse S'informer et arrive sur Commander.
export const xPieceDepart = (t: number) => entre(t, DEBUT_PP, FIN_PP, X0 + 2, centre(1), (n) => 1 - Math.pow(1 - n, 1.6));

// Vue finale : la même que la caméra du tableau de bord (centre 960 x 660, zoom 1,14), pour
// que la frise 3D tombe pile sur la frise 2D. Le centre de l'écran correspond à la frise (784 ; 248).
const CIBLE_FINALE = new THREE.Vector3(W(784), H(248), 0);
const FOV_FINAL = 45;
const DISTANCE_FINALE = (1080 / (10 * 1.14) / 2) / Math.tan(((FOV_FINAL / 2) * Math.PI) / 180);

const panneau = (i: number) => {
  const e = ETAPES[i];
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 200;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.roundRect(4, 4, 632, 192, 36);
  g.fill();
  g.fillStyle = C.beurre;
  g.beginPath();
  g.arc(90, 100, 52, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = C.encre;
  g.font = "800 60px Figtree";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(i + 1), 90, 104);
  g.textAlign = "left";
  g.font = "700 52px Figtree";
  g.fillText(e.nom, 170, 78);
  g.font = "800 50px Figtree";
  g.fillStyle = e.score < 0 ? C.rougeTexte : C.vertTexte;
  g.fillText(signe(e.score), 170, 140);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const pointilles = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(255,255,255,0)";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(91,81,112,0.55)";
  for (let x = 0; x < 256; x += 64) g.fillRect(x, 124, 34, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(60, 40);
  return t;
};

const Monde: React.FC<{ t: number }> = ({ t }) => {
  const { camera, scene } = useThree();
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let x = X0; x <= X0 + LARGEUR; x += 4) pts.push(new THREE.Vector3(W(x), H(yFrise(x)), 0));
    const courbe = new THREE.CatmullRomCurve3(pts);
    return {
      tube: new THREE.TubeGeometry(courbe, 700, 0.2, 12, false),
      panneaux: ETAPES.map((_, i) => panneau(i)),
      sol: pointilles(),
      ligne: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(W(X0), 0, 0.05), new THREE.Vector3(W(X0 + LARGEUR), 0, 0.05)]),
    };
  }, []);

  const grue = entre(t, DEBUT_GRUE, FIN_GRUE, 0, 1, (n) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2));
  const xp = xPieceDepart(t);
  const piece = new THREE.Vector3(W(xp), H(yFrise(xp)), 0);
  const pente = Math.atan2(H(yFrise(xp + 2)) - H(yFrise(xp - 2)), W(4));
  // Caméra : juste derrière et au-dessus de la pièce, elle regarde la courbe qui arrive.
  const secoue = Math.sin(t * 83) * 0.05 + Math.sin(t * 59) * 0.04;
  const poursuite = piece.clone().add(new THREE.Vector3(-4.2, 2.3 + secoue, 0));
  const xd = Math.min(X0 + LARGEUR, xp + 160);
  const regard = new THREE.Vector3(W(xd), H(yFrise(xd)) + 0.6, 0);
  const finale = CIBLE_FINALE.clone().add(new THREE.Vector3(0, 0, DISTANCE_FINALE));
  const pos = poursuite.clone().lerp(finale, grue);
  // La grue passe au-dessus du tracé en s'éloignant, puis se pose face à lui.
  pos.y += Math.sin(Math.PI * Math.min(1, grue * 1.4)) * 20 * (1 - grue * 0.3);
  pos.x -= Math.sin(Math.PI * grue) * 12;
  camera.position.copy(pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(regard.clone().lerp(CIBLE_FINALE, grue));
  (camera as THREE.PerspectiveCamera).fov = 74 + (FOV_FINAL - 74) * grue;
  (camera as THREE.PerspectiveCamera).far = 2000;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

  // Au-dessus de zéro, l'air est vert pâle ; en dessous, rouge pâle. En vue de côté, le fond blanc de la carte.
  const dessous = camera.position.y < 0;
  const air = new THREE.Color(dessous ? "#fbe3e0" : "#e6f4ec").lerp(new THREE.Color("#ffffff"), grue);
  scene.background = air;
  scene.fog = new THREE.Fog(air, 12 + 600 * grue, 90 + 2000 * grue);

  const portiques = 1 - entre(grue, 0, 0.45, 0, 1);
  // La pièce, petite pendant le trajet (elle ne doit pas masquer la vue), reprend sa taille de frise.
  const taillePiece = 0.95 + (2.9 - 0.95) * entre(grue, 0.3, 0.9, 0, 1);
  const pivot = (Math.PI / 2) * (1 - entre(grue, 0.15, 0.75, 0, 1, (n) => n * n * (3 - 2 * n)));
  const epaisseur = 0.25;
  const bandes = entre(grue, 0.4, 1, 0, 1);
  return (
    <>
      {/* L'horizon : le plan de la ligne zéro, en pointillé, vert vu d'en haut et rouge vu d'en dessous. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W(784), 0, 0]}>
        <planeGeometry args={[400, 300]} />
        <meshBasicMaterial color={C.vertFond} side={THREE.FrontSide} transparent opacity={0.9 * (1 - grue)} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W(784), 0.001, 0]}>
        <planeGeometry args={[400, 300]} />
        <meshBasicMaterial map={geo.sol} transparent opacity={1 - grue} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[W(784), -0.001, 0]}>
        <planeGeometry args={[400, 300]} />
        <meshBasicMaterial color={C.rougeFond} side={THREE.FrontSide} transparent opacity={0.95 * (1 - grue)} depthWrite={false} />
      </mesh>
      {/* Bandes de la frise (derrière la courbe), qui apparaissent en vue de côté. */}
      <mesh position={[W(X0 + LARGEUR / 2), 8, -0.5]} visible={bandes > 0}>
        <planeGeometry args={[W(LARGEUR), 16]} />
        <meshBasicMaterial color={C.vertFond} transparent opacity={0.7 * bandes} depthWrite={false} />
      </mesh>
      <mesh position={[W(X0 + LARGEUR / 2), -8, -0.5]} visible={bandes > 0}>
        <planeGeometry args={[W(LARGEUR), 16]} />
        <meshBasicMaterial color={C.rougeFond} transparent opacity={0.7 * bandes} depthWrite={false} />
      </mesh>
      <lineSegments geometry={geo.ligne}>
        <lineBasicMaterial color={C.encreDouce} transparent opacity={0.5 * bandes} />
      </lineSegments>
      {/* La piste : la courbe du parcours. */}
      <mesh geometry={geo.tube}>
        <meshBasicMaterial color={C.encre} />
      </mesh>
      {/* Les étapes : un portique par étape, avec son numéro, son nom et son score. */}
      {ETAPES.map((e, i) => {
        const x = W(centre(i));
        const y = H(ZERO - e.score * ECH);
        const haut = Math.max(y, 0) + 7;
        return (
          <group key={e.nom} visible={portiques > 0}>
            <mesh position={[x, y, 0]}>
              <sphereGeometry args={[0.75, 24, 16]} />
              <meshBasicMaterial color={e.score < 0 ? C.rouge : C.vert} transparent opacity={portiques} />
            </mesh>
            {[-4.5, 4.5].map((z) => (
              <mesh key={z} position={[x, (haut - 12) / 2, z]}>
                <boxGeometry args={[0.3, haut + 12, 0.3]} />
                <meshBasicMaterial color={C.iris} transparent opacity={portiques} />
              </mesh>
            ))}
            <mesh position={[x, haut, 0]}>
              <boxGeometry args={[0.3, 0.3, 9.3]} />
              <meshBasicMaterial color={C.iris} transparent opacity={portiques} />
            </mesh>
            <mesh position={[x, haut + 1.9, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[8, 2.5]} />
              <meshBasicMaterial map={geo.panneaux[i]} transparent opacity={portiques} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
      {/* La pièce de tangram (le wagon), posée sur la courbe. */}
      {/* Pendant le trajet, la pièce est tournée face à nous (on voit le triangle de dos) ;
          elle pivote dans le plan de la frise pendant que la caméra s'élève. */}
      <group position={[piece.x, piece.y, 0]} rotation={[0, pivot, 0]}>
        <mesh position={[0, 0, -0.7 * epaisseur]} rotation={[0, 0, pente * (1 - pivot / (Math.PI / 2))]} scale={[taillePiece, taillePiece, epaisseur]}>
        <extrudeGeometry args={[new THREE.Shape([new THREE.Vector2(-1, 0.12), new THREE.Vector2(1, 0.12), new THREE.Vector2(-1, 1.9)]), { depth: 1.4, bevelEnabled: false }]} />
        <meshBasicMaterial color={C.beurre} />
      </mesh>
      </group>

    </>
  );
};

export const PremierePersonne: React.FC<{ t: number }> = ({ t }) => {
  if (t < DEBUT_PP || t >= FIN_PP) return null;
  return (
    <AbsoluteFill style={{ opacity: 1 - entre(t, FIN_PP - 0.22, FIN_PP, 0, 1) }}>
      <ThreeCanvas width={1920} height={1080} flat camera={{ fov: 74, near: 0.1, far: 2000 }}>
        <Monde t={t} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
