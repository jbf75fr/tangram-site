import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, entre, hasard } from "../commun";

// Départ du parcours en vue subjective, dans un wagon de montagnes russes (3D réaliste, environ 1,4 s) :
// le wagon bascule au sommet et plonge. Au premier plan, l'avant jaune du wagon et la barre de sécurité.
// La barre porte la transition : elle se relève, remplit l'écran, puis se resserre en un trait qui
// devient la ligne zéro du parcours client (vue de côté, sans rails).
export const DEBUT_PP = 21.95;
export const FIN_PP = 23.35;
const LEVEE: [number, number] = [23.1, 23.34];
const RESSERRE: [number, number] = [23.35, 23.62];
const FONDU: [number, number] = [23.62, 23.9];

const enDouceur = (n: number) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2);

// La voie : un plateau au sommet, puis une descente raide qui tourne légèrement.
const VOIE = new THREE.CatmullRomCurve3(
  [
    [-12, 30, 0],
    [0, 30, 0],
    [8, 30, 0],
    [13, 29.3, 0],
    [18, 26.2, 0],
    [24, 19, 0],
    [30, 11, 0],
    [36, 5, -1],
    [44, 2.2, -4],
    [54, 2, -9],
    [66, 4, -14],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "centripetal",
);
const HAUT = new THREE.Vector3(0, 1, 0);
const repere = (u: number) => {
  const p = VOIE.getPointAt(u);
  const tg = VOIE.getTangentAt(u);
  const lat = new THREE.Vector3().crossVectors(tg, HAUT).normalize();
  const n = new THREE.Vector3().crossVectors(lat, tg).normalize();
  return { p, tg, lat, n };
};
const courbeDecalee = (lateral: number, vertical: number) => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 300; i++) {
    const { p, lat, n } = repere(i / 300);
    pts.push(p.clone().addScaledVector(lat, lateral).addScaledVector(n, vertical));
  }
  return new THREE.CatmullRomCurve3(pts);
};

const ciel = () => {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 512;
  const g = c.getContext("2d")!;
  const d = g.createLinearGradient(0, 0, 0, 512);
  d.addColorStop(0, "#9fb1e3");
  d.addColorStop(0.55, "#dfe4f6");
  d.addColorStop(1, "#f3f1fa");
  g.fillStyle = d;
  g.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const U0 = 0.12;
const U1 = 0.6;

const Monde: React.FC<{ tau: number }> = ({ tau }) => {
  const { camera, scene } = useThree();
  const geo = useMemo(() => {
    const rails = [-0.62, 0.62].map((l) => new THREE.TubeGeometry(courbeDecalee(l, 0), 500, 0.07, 10, false));
    const colonne = new THREE.TubeGeometry(courbeDecalee(0, -0.55), 500, 0.26, 12, false);
    const traverses = Array.from({ length: 110 }, (_, i) => {
      const u = i / 109;
      const { p, tg, n } = repere(u);
      const o = new THREE.Object3D();
      o.position.copy(p).addScaledVector(n, -0.12);
      o.up.copy(n);
      o.lookAt(p.clone().add(tg));
      return { position: o.position.clone(), quaternion: o.quaternion.clone() };
    });
    const piliers = Array.from({ length: 26 }, (_, i) => {
      const p = VOIE.getPointAt(0.02 + (i / 25) * 0.96);
      const h = p.y - 0.8 + 1;
      return { x: p.x, z: p.z, h, y: (p.y - 0.8 - 1) / 2 };
    });
    const blocs = Array.from({ length: 90 }, (_, i) => ({
      x: -20 + hasard(i) * 160,
      z: -90 + hasard(i + 50) * 150,
      l: 2 + hasard(i + 9) * 6,
      h: 1 + hasard(i + 13) * 7,
    })).filter((b) => Math.abs(b.z) > 6);
    return { rails, colonne, traverses, piliers, blocs };
  }, []);
  const fond = useMemo(ciel, []);

  // Le wagon ralentit au sommet puis accélère dans la descente.
  const avance = entre(tau, 0, FIN_PP - DEBUT_PP, 0, 1, (n) => Math.pow(n, 2.1));
  const u = U0 + (U1 - U0) * avance;
  const { p, n } = repere(u);
  const devant = repere(Math.min(0.98, u + 0.05));
  const vitesse = entre(avance, 0.1, 0.6, 0, 1);
  const secoue = new THREE.Vector3(Math.sin(tau * 97) * 0.035, Math.sin(tau * 73 + 1) * 0.03, Math.sin(tau * 61 + 2) * 0.03).multiplyScalar(0.3 + vitesse);
  camera.position.copy(p).addScaledVector(n, 1.3).add(secoue);
  camera.up.copy(n);
  camera.lookAt(devant.p.clone().addScaledVector(devant.n, 0.9));
  (camera as THREE.PerspectiveCamera).fov = 58 + 26 * vitesse;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  scene.background = fond;
  scene.fog = new THREE.Fog("#e7e6f4", 40, 230);

  return (
    <>
      <hemisphereLight args={["#ffffff", "#b6b0cc", 1.15]} />
      <directionalLight position={[30, 60, 25]} intensity={1.9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, -1, -20]}>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#d7d3e6" roughness={1} />
      </mesh>
      {geo.blocs.map((b, i) => (
        <mesh key={i} position={[b.x, -1 + b.h / 2, b.z]}>
          <boxGeometry args={[b.l, b.h, b.l]} />
          <meshStandardMaterial color={i % 3 ? "#e9e6f3" : "#cfc9e2"} roughness={0.9} />
        </mesh>
      ))}
      {geo.rails.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#c9ccd8" metalness={0.85} roughness={0.28} />
        </mesh>
      ))}
      <mesh geometry={geo.colonne}>
        <meshStandardMaterial color={C.iris} metalness={0.3} roughness={0.45} />
      </mesh>
      {geo.traverses.map((tr, i) => (
        <mesh key={i} position={tr.position} quaternion={tr.quaternion}>
          <boxGeometry args={[1.55, 0.1, 0.2]} />
          <meshStandardMaterial color="#3a3350" roughness={0.6} />
        </mesh>
      ))}
      {geo.piliers.map((pl, i) => (
        <mesh key={i} position={[pl.x, pl.y, pl.z]}>
          <cylinderGeometry args={[0.2, 0.26, pl.h, 14]} />
          <meshStandardMaterial color="#f4f3f9" roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      {/* Une boucle au loin, pour situer la montagne russe. */}
      <mesh position={[78, 12, -38]} rotation={[0, 0.5, 0]}>
        <torusGeometry args={[10, 0.35, 16, 80]} />
        <meshStandardMaterial color={C.iris} metalness={0.3} roughness={0.45} />
      </mesh>
      <mesh position={[78, 0.5, -38]}>
        <cylinderGeometry args={[0.3, 0.35, 3, 12]} />
        <meshStandardMaterial color="#f4f3f9" />
      </mesh>
    </>
  );
};

// Avant du wagon (capot jaune) et barre de sécurité, au premier plan.
const AvantDuWagon: React.FC<{ tau: number }> = ({ tau }) => {
  const bob = Math.sin(tau * 95) * 3 + Math.sin(tau * 57) * 2;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="capot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="0.18" stopColor={C.beurre} />
          <stop offset="1" stopColor="#d9b326" />
        </linearGradient>
        <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d90a0" />
          <stop offset="0.45" stopColor="#f2f3f8" />
          <stop offset="1" stopColor="#7d8090" />
        </linearGradient>
      </defs>
      <g transform={`translate(0 ${bob})`}>
        <path d="M-20,1100 L-20,1000 C240,930 600,905 960,900 C1320,905 1680,930 1940,1000 L1940,1100 Z" fill="url(#capot)" />
        <path d="M-20,1000 C240,930 600,905 960,900 C1320,905 1680,930 1940,1000" fill="none" stroke="#fff6c4" strokeWidth={5} opacity={0.8} />
        <rect x={540} y={880} width={28} height={110} rx={6} fill="url(#chrome)" />
        <rect x={1352} y={880} width={28} height={110} rx={6} fill="url(#chrome)" />
      </g>
    </svg>
  );
};

// La barre de sécurité : au premier plan, puis élément de la transition.
const Barre: React.FC<{ t: number; ligneZero: { x1: number; x2: number; y: number } }> = ({ t, ligneZero }) => {
  if (t > FONDU[1]) return null;
  const tau = t - DEBUT_PP;
  const bob = Math.sin(tau * 95) * 3 + Math.sin(tau * 57) * 2;
  const leve = entre(t, LEVEE[0], LEVEE[1], 0, 1, (n) => n * n);
  const serre = entre(t, RESSERRE[0], RESSERRE[1], 0, 1, enDouceur);
  // Hauteur et position : barre (64 px vers y = 860) → plein écran → trait sur la ligne zéro.
  let x1 = -60;
  let x2 = 1980;
  let h = 64 + (1300 - 64) * leve;
  let yc = 860 + bob * (1 - leve) + (540 - 860) * leve;
  if (t >= RESSERRE[0]) {
    h = 1300 + (5 - 1300) * serre;
    yc = 540 + (ligneZero.y - 540) * serre;
    x1 = -60 + (ligneZero.x1 + 60) * serre;
    x2 = 1980 + (ligneZero.x2 - 1980) * serre;
  }
  const opacite = 1 - entre(t, FONDU[0], FONDU[1], 0, 1);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: opacite }}>
      <defs>
        <linearGradient id="barre" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a4a82" />
          <stop offset="0.3" stopColor="#2a1a48" />
          <stop offset="0.75" stopColor={C.encre} />
          <stop offset="1" stopColor="#0a0514" />
        </linearGradient>
      </defs>
      {t < LEVEE[0] && <rect x={x1} y={yc + 30} width={x2 - x1} height={22} rx={11} fill="#000" opacity={0.18} />}
      <rect x={x1} y={yc - h / 2} width={x2 - x1} height={h} rx={Math.min(32, h / 2)} fill={leve > 0.98 || t >= RESSERRE[0] ? C.encre : "url(#barre)"} />
      {t < LEVEE[0] && <rect x={x1 + 40} y={yc - h / 2 + 9} width={x2 - x1 - 80} height={6} rx={3} fill="#ffffff" opacity={0.22} />}
    </svg>
  );
};

export const PremierePersonne: React.FC<{ t: number; ligneZero: { x1: number; x2: number; y: number } }> = ({ t, ligneZero }) => {
  if (t < DEBUT_PP || t > FONDU[1]) return null;
  const tau = t - DEBUT_PP;
  return (
    <AbsoluteFill>
      {t < FIN_PP && (
        <AbsoluteFill>
          <ThreeCanvas width={1920} height={1080} camera={{ fov: 58, near: 0.05, far: 800 }}>
            <Monde tau={tau} />
          </ThreeCanvas>
          <AvantDuWagon tau={tau} />
        </AbsoluteFill>
      )}
      <Barre t={t} ligneZero={ligneZero} />
    </AbsoluteFill>
  );
};
