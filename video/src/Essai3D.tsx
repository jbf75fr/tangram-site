import React, { useMemo } from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, FPS, entre, hasard } from "./commun";

// Essai (5 s) : départ des montagnes russes en vue subjective, dans un monde de commentaires
// qui s'assemblent en panneaux d'indicateurs, puis la caméra s'élève et pivote vers la vue
// de côté, où les rails deviennent la frise du parcours.

// Tracé : les cinq étapes du parcours (S'informer +22, Commander +9, Livraison -34, Installation +4, Service après-vente -12).
const K = 0.06;
const TRACE = [
  [0, 22],
  [6, 22],
  [18, 9],
  [30, -34],
  [42, 4],
  [54, -12],
  [60, -12],
].map(([x, s]) => new THREE.Vector3(x, s * K, 0));
const COURBE = new THREE.CatmullRomCurve3(TRACE, false, "centripetal");
const decale = (dz: number) => new THREE.CatmullRomCurve3(TRACE.map((p) => new THREE.Vector3(p.x, p.y, dz)), false, "centripetal");

const lisse = (n: number) => n * n * (3 - 2 * n);
const DEBUT_GRUE = 3.0;
const FIN_GRUE = 4.6;

// Carte de commentaire : rectangle blanc arrondi avec deux traits (couleur de la tonalité).
const texture = (couleur: string) => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 144;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.roundRect(4, 4, 248, 136, 28);
  g.fill();
  g.fillStyle = couleur;
  g.beginPath();
  g.roundRect(34, 46, 150, 16, 8);
  g.fill();
  g.fillStyle = C.grisClair;
  g.beginPath();
  g.roundRect(34, 82, 110, 16, 8);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const N = 320;
const CARTES = (() => {
  const brutes = Array.from({ length: N }, (_, i) => {
    const ton = hasard(i + 11);
    const cote = hasard(i + 3) < 0.5 ? -1 : 1;
    return {
      ton,
      couleur: ton < 0.42 ? C.rouge : ton < 0.8 ? C.vert : C.gris,
      depart: new THREE.Vector3(hasard(i) * 44, -4 + hasard(i + 1) * 10, cote * (1.6 + hasard(i + 2) * 8)),
      rotation: new THREE.Euler((hasard(i + 4) - 0.5) * 2, (hasard(i + 5) - 0.5) * 3, (hasard(i + 6) - 0.5) * 2),
    };
  });
  // Rangement : les cartes sont triées par tonalité, puis posées en grille sur deux murs, de part et
  // d'autre des rails : les rangées vertes, grises et rouges forment des barres d'indicateurs.
  const triees = [...brutes].sort((a, b) => a.ton - b.ton);
  return triees.map((c, i) => {
    const cote = i % 2 ? 1 : -1;
    const k = Math.floor(i / 2);
    const colonne = k % 28;
    const rangee = Math.floor(k / 28);
    return { ...c, cible: new THREE.Vector3(1 + colonne * 1.45, 2.9 - rangee * 0.8, cote * 4.2), cote };
  });
})();

const Monde: React.FC<{ t: number }> = ({ t }) => {
  const { camera, scene } = useThree();
  const textures = useMemo(() => ({ [C.rouge]: texture(C.rouge), [C.vert]: texture(C.vert), [C.gris]: texture(C.gris) }), []);
  const rails = useMemo(() => [decale(-0.45), decale(0.45)].map((c) => new THREE.TubeGeometry(c, 400, 0.05, 8, false)), []);
  const traverses = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => {
        const u = i / 139;
        const p = COURBE.getPointAt(u);
        const tg = COURBE.getTangentAt(u);
        return { p, angle: Math.atan2(tg.y, tg.x) };
      }),
    [],
  );

  // Trajet de la caméra : on avance sur les rails, puis la grue s'élève et pivote vers la vue de côté.
  const grue = entre(t, DEBUT_GRUE, FIN_GRUE, 0, 1, (n) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2));
  const u = 0.015 + 0.3 * entre(t, 0, DEBUT_GRUE + 0.4, 0, 1, (n) => n * (0.6 + 0.4 * n));
  const p = COURBE.getPointAt(u);
  const devant = COURBE.getPointAt(Math.min(1, u + 0.035));
  const subjPos = p.clone().add(new THREE.Vector3(0, 0.85, 0));
  const subjCible = devant.clone().add(new THREE.Vector3(0, 0.7, 0));
  const cotePos = new THREE.Vector3(30, -0.3, 69);
  const coteCible = new THREE.Vector3(30, -0.3, 0);
  const pos = subjPos.clone().lerp(cotePos, grue);
  // Pendant la grue, la caméra monte en arc au-dessus du tracé avant de se poser face à lui.
  pos.y += Math.sin(Math.PI * grue) * 14;
  const cible = subjCible.clone().lerp(coteCible, grue);
  camera.position.copy(pos);
  camera.lookAt(cible);
  (camera as THREE.PerspectiveCamera).fov = 70 + (30 - 70) * grue;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  scene.background = new THREE.Color(C.fond);
  scene.fog = new THREE.Fog(C.fond, 6 + 300 * grue, 40 + 400 * grue);

  const disparition = 1 - entre(t, DEBUT_GRUE, DEBUT_GRUE + 0.8, 0, 1);
  const frise = entre(t, DEBUT_GRUE + 0.6, FIN_GRUE, 0, 1);
  // La pièce de tangram (le wagon), juste devant la caméra.
  const uw = Math.min(1, u + 0.012);
  const pw = COURBE.getPointAt(uw);
  const tw = COURBE.getTangentAt(uw);

  return (
    <>
      {/* Bandes de la frise (vert au-dessus de zéro, rouge en dessous), qui apparaissent en vue de côté. */}
      <mesh position={[30, 1.6, -1]}>
        <planeGeometry args={[60, 3.2]} />
        <meshBasicMaterial color={C.vertFond} transparent opacity={frise} depthWrite={false} visible={frise > 0} />
      </mesh>
      <mesh position={[30, -1.6, -1]}>
        <planeGeometry args={[60, 3.2]} />
        <meshBasicMaterial color={C.rougeFond} transparent opacity={frise} depthWrite={false} visible={frise > 0} />
      </mesh>
      {rails.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={C.encre} />
        </mesh>
      ))}
      {traverses.map((tr, i) => (
        <mesh key={i} position={tr.p} rotation={[0, 0, tr.angle]}>
          <boxGeometry args={[0.08, 0.04, 0.95]} />
          <meshBasicMaterial color={C.iris} transparent opacity={0.3} />
        </mesh>
      ))}
      {CARTES.map((c, i) => {
        // Une carte rejoint son mur quand la caméra s'en approche : le monde s'assemble devant nous.
        const a = lisse(entre(pos.x + 16 - c.cible.x, 0, 7, 0, 1, (n) => n));
        const flotte = new THREE.Vector3(Math.sin(t * 0.8 + i) * 0.3, Math.cos(t * 0.6 + i) * 0.25, 0);
        const position = c.depart.clone().add(flotte).lerp(c.cible, a);
        const rot = new THREE.Euler(c.rotation.x * (1 - a), c.rotation.y * (1 - a) + (c.cote > 0 ? Math.PI : 0) * a, c.rotation.z * (1 - a));
        return (
          <mesh key={i} position={position} rotation={rot}>
            <planeGeometry args={[1.3, 0.73]} />
            <meshBasicMaterial map={textures[c.couleur]} transparent opacity={disparition * entre(position.distanceTo(pos), 1.5, 3.5, 0, 1)} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        );
      })}
      {/* La pièce n'apparaît qu'une fois la caméra sortie du wagon (sinon elle passe devant l'objectif). */}
      <mesh position={[pw.x, pw.y + 0.3, pw.z]} rotation={[0, 0, Math.atan2(tw.y, tw.x)]} visible={grue > 0.4} scale={entre(grue, 0.4, 0.7, 0.2, 1)}>
        <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-0.6, 0), new THREE.Vector2(0.6, 0), new THREE.Vector2(-0.6, 0.9)])]} />
        <meshBasicMaterial color={C.beurre} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export const Essai3D: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      <ThreeCanvas width={1920} height={1080} flat camera={{ fov: 70, near: 0.05, far: 600 }}>
        <Monde t={t} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
