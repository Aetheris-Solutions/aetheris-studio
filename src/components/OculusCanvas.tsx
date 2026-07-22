import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { MotionProfileName, MotionSnapshot } from '../motion/controller';
import { rangeProgress, smootherstep } from '../motion/controller';
import { canvasDprRange } from '../runtime/presentationPolicy';

const PRODUCTION_GLB = '/assets/aetheris-b8-oculus-production-v2.glb';

const EXPECTED_NODE_NAMES = [
  'AETHERIS_HERO_ROOT',
  'B8_RENDER_UNION',
  'B8_EDGE_PROFILE',
  'OCULUS_INNER_ARCH',
  'OCULUS_OUTER_ARCH',
  'OCCLUSION_SHUTTER'
] as const;

const EXPECTED_MATERIAL_NAMES = [
  'MAT_B8_FRONT_EXACT',
  'MAT_B8_BEVEL_STONE',
  'MAT_OCULUS_INNER_STONE',
  'MAT_OCULUS_OUTER_FRESCO',
  'MAT_OCCLUSION_HOLDOUT'
] as const;

export type AssetStatus =
  | { kind: 'loading'; source: 'glb' }
  | { kind: 'production'; source: 'glb' }
  | { kind: 'static-poster'; source: 'poster'; reason: string }
  | { kind: 'procedural-fallback'; source: 'procedural'; reason: string; missing?: string[] };

type OculusCanvasProps = {
  snapshot: MotionSnapshot;
  profile: MotionProfileName;
  onAssetStatus: (status: AssetStatus) => void;
  onContextLost: () => void;
};

type SceneAsset = { scene: THREE.Group; valid: true } | { scene: null; valid: false };

const SHUTTER_TRAVEL = 8.2;
const TOPOLOGY_SWITCH_PROGRESS = 0.105;

const MATERIAL_TREATMENTS: Record<
  string,
  { color?: string; roughness: number; bumpScale?: number }
> = {
  MAT_B8_FRONT_EXACT: { roughness: 0.82 },
  MAT_B8_BEVEL_STONE: { color: '#b59c7f', roughness: 0.72, bumpScale: 0.011 },
  MAT_OCULUS_INNER_STONE: { color: '#5b4938', roughness: 0.9, bumpScale: 0.008 },
  MAT_OCULUS_OUTER_FRESCO: { color: '#9e8971', roughness: 0.86, bumpScale: 0.011 },
  MAT_ULTRAMARINE_INLAY: { color: '#24466e', roughness: 0.9, bumpScale: 0.004 },
  MAT_FRESCO_NIGHT_WALL: { roughness: 0.9 }
};

const GRAIN_MATERIALS = new Set([
  'MAT_B8_BEVEL_STONE',
  'MAT_OCULUS_INNER_STONE',
  'MAT_OCULUS_OUTER_FRESCO',
  'MAT_ULTRAMARINE_INLAY'
]);

function createMineralGrainTexture(size = 64): THREE.DataTexture {
  const seedNoise = new Float32Array(size * size);
  let seed = 1427;
  for (let index = 0; index < seedNoise.length; index += 1) {
    seed = (seed * 16807) % 2147483647;
    seedNoise[index] = (seed - 1) / 2147483646;
  }

  const blur = (source: Float32Array, radius: number, horizontal: boolean) => {
    const result = new Float32Array(source.length);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        let sum = 0;
        for (let offset = -radius; offset <= radius; offset += 1) {
          const sampleX = horizontal ? (x + offset + size) % size : x;
          const sampleY = horizontal ? y : (y + offset + size) % size;
          sum += source[sampleY * size + sampleX];
        }
        result[y * size + x] = sum / (radius * 2 + 1);
      }
    }
    return result;
  };

  let coarse = seedNoise;
  for (const radius of [7, 4, 2]) {
    coarse = blur(blur(coarse, radius, true), radius, false);
  }

  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;
  for (const value of coarse) {
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
  }

  const data = new Uint8Array(size * size * 4);
  const span = Math.max(0.0001, maximum - minimum);
  for (let index = 0; index < coarse.length; index += 1) {
    const normalised = (coarse[index] - minimum) / span;
    const value = THREE.MathUtils.clamp(
      Math.round(245 + normalised * 9 + (seedNoise[index] - 0.5) * 2),
      244,
      255
    );
    const offset = index * 4;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.name = 'AETHERIS_DERIVED_MINERAL_GRAIN';
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.25, 2.25);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function ensurePlanarUvXZ(geometry: THREE.BufferGeometry): void {
  if (geometry.getAttribute('uv')) return;
  const position = geometry.getAttribute('position');
  if (!position) return;
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  if (!bounds) return;

  const width = Math.max(0.0001, bounds.max.x - bounds.min.x);
  const height = Math.max(0.0001, bounds.max.z - bounds.min.z);
  const uv = new Float32Array(position.count * 2);
  for (let index = 0; index < position.count; index += 1) {
    uv[index * 2] = (position.getX(index) - bounds.min.x) / width;
    uv[index * 2 + 1] = (position.getZ(index) - bounds.min.z) / height;
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
}

function cloneSceneMaterials(scene: THREE.Object3D): void {
  const materialClones = new Map<THREE.Material, THREE.Material>();

  scene.traverse((object) => {
    if (!('material' in object)) return;
    const mesh = object as THREE.Mesh;
    const cloneMaterial = (material: THREE.Material) => {
      const existing = materialClones.get(material);
      if (existing) return existing;
      const clone = material.clone();
      materialClones.set(material, clone);
      return clone;
    };
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(cloneMaterial)
      : cloneMaterial(mesh.material);
  });
}

function refineProductionMaterials(scene: THREE.Object3D): void {
  const mineralGrain = createMineralGrainTexture();
  let grainAttached = false;
  const configuredMaterials = new Set<THREE.Material>();

  scene.traverse((object) => {
    if (!('material' in object)) return;
    const mesh = object as THREE.Mesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      if (configuredMaterials.has(material)) continue;
      configuredMaterials.add(material);
      const treatment = MATERIAL_TREATMENTS[material.name as keyof typeof MATERIAL_TREATMENTS];
      if (treatment) {
        if (treatment.color) material.color.set(treatment.color);
        material.roughness = treatment.roughness;
        material.metalness = 0;
      }

      if (GRAIN_MATERIALS.has(material.name)) {
        ensurePlanarUvXZ(mesh.geometry);
        if (!mesh.geometry.getAttribute('uv')) continue;
        material.roughnessMap = mineralGrain;
        material.bumpMap = mineralGrain;
        material.bumpScale = treatment?.bumpScale ?? 0.006;
        grainAttached = true;
      }

      if (material.name === 'MAT_CELESTIAL_LIGHT') {
        material.emissive.set('#a9c9ff');
        material.emissiveIntensity = 0.9;
      }

      material.needsUpdate = true;
    }
  });

  if (!grainAttached) mineralGrain.dispose();
}

function disposeProductionScene(scene: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  scene.traverse((object) => {
    if (!('geometry' in object) || !('material' in object)) return;
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of meshMaterials) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });

  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

function inspectProductionScene(scene: THREE.Object3D): string[] {
  const nodes = new Set<string>();
  const materials = new Set<string>();

  scene.traverse((object) => {
    if (object.name) nodes.add(object.name);
    if ('material' in object) {
      const material = (object as THREE.Mesh).material;
      for (const entry of Array.isArray(material) ? material : [material]) {
        if (entry?.name) materials.add(entry.name);
      }
    }
  });

  return [
    ...EXPECTED_NODE_NAMES.filter((name) => !nodes.has(name)).map((name) => `node:${name}`),
    ...EXPECTED_MATERIAL_NAMES.filter((name) => !materials.has(name)).map((name) => `material:${name}`)
  ];
}

function setVisible(scene: THREE.Object3D, name: string, visible: boolean): void {
  const object = scene.getObjectByName(name);
  if (object) object.visible = visible;
}

function ProductionArchitecture({
  scene,
  snapshot,
  scale
}: {
  scene: THREE.Group;
  snapshot: MotionSnapshot;
  scale: number;
}) {
  useLayoutEffect(() => {
    const root = scene.getObjectByName('AETHERIS_HERO_ROOT');
    const face = scene.getObjectByName('B8_RENDER_UNION');
    const edge = scene.getObjectByName('B8_EDGE_PROFILE');
    const shutter = scene.getObjectByName('OCCLUSION_SHUTTER');

    if (!root || !face || !edge || !shutter) return;

    // Blender exports Y-up: its authored XY façade arrives in glTF's XZ
    // plane. One root rotation restores a front-facing Three.js XY plane.
    root.rotation.x = Math.PI / 2;
    root.scale.setScalar(scale);
    // The exact cap is authored at +0.30 in Blender. Rebase it onto the
    // runtime handoff plane so perspective scale matches the DOM SVG.
    root.position.z = -0.3 * scale;

    // The canonical screen-space -90° turn is +90° around the GLB's local
    // Y axis before the root conversion. Face and derived edge remain rigid.
    const rigidRotation = THREE.MathUtils.degToRad(-snapshot.logoRotationDeg);
    face.rotation.y = rigidRotation;
    edge.rotation.y = rigidRotation;

    const topologySwitched = snapshot.cameraPass >= TOPOLOGY_SWITCH_PROGRESS;
    const showB8 = !topologySwitched;
    setVisible(scene, 'B8_RENDER_UNION', showB8);
    setVisible(scene, 'B8_EDGE_PROFILE', showB8 && !snapshot.isExactGeometry);

    for (const name of [
      'ATELIER_FRESCO_WALL',
      'OCULUS_CELESTIAL_LIGHT_BAND',
      'OCULUS_INNER_ARCH',
      'OCULUS_OUTER_ARCH',
      'OCULUS_ULTRAMARINE_INLAY'
    ]) {
      setVisible(scene, name, topologySwitched);
    }

    const shutterIngress = smootherstep(rangeProgress(snapshot.cameraDolly, 0.55, 1));
    const shutterEgress = smootherstep(
      rangeProgress(snapshot.cameraPass, TOPOLOGY_SWITCH_PROGRESS, 1)
    );
    shutter.visible = shutterIngress > 0.001 && shutterEgress < 0.999;
    shutter.position.x =
      snapshot.cameraPass <= TOPOLOGY_SWITCH_PROGRESS
        ? THREE.MathUtils.lerp(SHUTTER_TRAVEL, 0, shutterIngress)
        : THREE.MathUtils.lerp(0, -SHUTTER_TRAVEL, shutterEgress);
  }, [scale, scene, snapshot]);

  return <primitive object={scene} />;
}

function useProductionScene(onAssetStatus: (status: AssetStatus) => void): SceneAsset {
  const [asset, setAsset] = useState<SceneAsset>({ scene: null, valid: false });

  useEffect(() => {
    let cancelled = false;
    let ownedScene: THREE.Group | null = null;
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    onAssetStatus({ kind: 'loading', source: 'glb' });

    loader.load(
      PRODUCTION_GLB,
      (gltf) => {
        if (cancelled) {
          disposeProductionScene(gltf.scene);
          return;
        }
        const missing = inspectProductionScene(gltf.scene);
        if (missing.length > 0) {
          console.warn('Aetheris GLB rejected by the naming gate.', { missing });
          disposeProductionScene(gltf.scene);
          onAssetStatus({
            kind: 'procedural-fallback',
            source: 'procedural',
            reason: 'GLB naming contract incomplete',
            missing
          });
          return;
        }

        const scene = gltf.scene.clone(true);
        cloneSceneMaterials(scene);
        refineProductionMaterials(scene);
        ownedScene = scene;
        setAsset({ scene, valid: true });
        onAssetStatus({ kind: 'production', source: 'glb' });
      },
      undefined,
      () => {
        if (cancelled) return;
        onAssetStatus({
          kind: 'procedural-fallback',
          source: 'procedural',
          reason: `${PRODUCTION_GLB} is not present yet`
        });
      }
    );

    return () => {
      cancelled = true;
      if (ownedScene) disposeProductionScene(ownedScene);
      dracoLoader.dispose();
    };
  }, [onAssetStatus]);

  return asset;
}

function ContextLossGuard({ onContextLost }: { onContextLost: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener('webglcontextlost', handleContextLoss);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLoss);
  }, [gl, onContextLost]);

  return null;
}

function createArchitecturalRing(outerRadius: number, innerRadius: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const aperture = new THREE.Path();
  aperture.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(aperture);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 128,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: 0.095,
    bevelThickness: 0.14
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function ProceduralOculus({ visible }: { visible: boolean }) {
  const outer = useMemo(() => createArchitecturalRing(3.08, 1.79, 0.66), []);
  const inner = useMemo(() => createArchitecturalRing(1.98, 1.72, 0.82), []);
  const pigment = useMemo(() => createArchitecturalRing(2.34, 2.17, 0.7), []);

  useEffect(
    () => () => {
      outer.dispose();
      inner.dispose();
      pigment.dispose();
    },
    [inner, outer, pigment]
  );

  if (!visible) return null;

  return (
    <group name="AETHERIS_PROCEDURAL_OCULUS">
      <mesh geometry={outer} castShadow receiveShadow>
        <meshPhysicalMaterial
          name="MAT_OCULUS_OUTER_FRESCO_FALLBACK"
          color="#a89579"
          roughness={0.82}
          metalness={0}
          clearcoat={0.012}
          clearcoatRoughness={1}
        />
      </mesh>
      <mesh geometry={pigment} position={[0, 0, 0.018]}>
        <meshStandardMaterial
          name="MAT_ULTRAMARINE_INLAY_FALLBACK"
          color="#173b78"
          roughness={0.87}
          metalness={0}
        />
      </mesh>
      <mesh geometry={inner} position={[0, 0, -0.04]} castShadow receiveShadow>
        <meshPhysicalMaterial
          name="MAT_OCULUS_INNER_STONE_FALLBACK"
          color="#5a422d"
          roughness={0.88}
          metalness={0}
          clearcoat={0.008}
        />
      </mesh>
    </group>
  );
}

function Dust({ opacity }: { opacity: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(72 * 3);
    let seed = 1427;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < positions.length; index += 3) {
      positions[index] = (random() - 0.5) * 5.4;
      positions[index + 1] = (random() - 0.5) * 4.2;
      positions[index + 2] = (random() - 0.5) * 2.5 - 0.4;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return result;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  if (opacity <= 0.001) return null;

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#ede7da"
        opacity={opacity * 0.34}
        transparent
        depthWrite={false}
        size={0.014}
        sizeAttenuation
      />
    </points>
  );
}

function CameraRig({ snapshot, profile }: { snapshot: MotionSnapshot; profile: MotionProfileName }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const halfHeightAtRing = Math.tan(THREE.MathUtils.degToRad(34 / 2)) * 9;
    const halfWidthAtRing = halfHeightAtRing * aspect;
    const screenCenter = profile === 'mobile' ? [0.64, 0.72] : [0.73, 0.5];
    const ringX = (screenCenter[0] * 2 - 1) * halfWidthAtRing;
    const ringY = -(screenCenter[1] * 2 - 1) * halfHeightAtRing;
    // Re-centre the authored Blender world while the opaque shutter is still
    // full-frame. The visible camera path remains continuous on each side of
    // the hidden topology boundary.
    const returnToPlate = rangeProgress(snapshot.cameraPass, 0, TOPOLOGY_SWITCH_PROGRESS);
    const xAtPass = ringX * snapshot.cameraDolly;
    const yAtPass = ringY * snapshot.cameraDolly;
    const x = THREE.MathUtils.lerp(xAtPass, 0, returnToPlate);
    const y = THREE.MathUtils.lerp(yAtPass, 0, returnToPlate);
    const zBeforePass = THREE.MathUtils.lerp(9, 1.12, snapshot.cameraDolly);
    const z = THREE.MathUtils.lerp(zBeforePass, -0.72, snapshot.cameraPass);
    const targetZ = THREE.MathUtils.lerp(0, -4, smootherstep(snapshot.cameraPass));

    camera.fov = 34;
    camera.aspect = aspect;
    camera.near = 0.035;
    camera.far = 60;
    camera.position.set(x, y, z);
    camera.lookAt(x, y, targetZ);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, profile, size.height, size.width, snapshot.cameraDolly, snapshot.cameraPass]);

  return null;
}

function OculusScene({
  snapshot,
  profile,
  onAssetStatus
}: Omit<OculusCanvasProps, 'onContextLost'>) {
  const production = useProductionScene(onAssetStatus);
  const size = useThree((state) => state.size);
  const aspect = size.width / Math.max(1, size.height);
  const halfHeightAtRing = Math.tan(THREE.MathUtils.degToRad(34 / 2)) * 9;
  const halfWidthAtRing = halfHeightAtRing * aspect;
  const center = profile === 'mobile' ? [0.64, 0.72] : [0.73, 0.5];
  const ringPosition: [number, number, number] = [
    (center[0] * 2 - 1) * halfWidthAtRing,
    -(center[1] * 2 - 1) * halfHeightAtRing,
    0
  ];
  const stageWidth =
    profile === 'mobile'
      ? THREE.MathUtils.clamp(size.width * 0.28, 96, 132)
      : THREE.MathUtils.clamp(size.width * 0.136, 132, 208);
  const stageHeight = stageWidth * (603 / 480);
  const worldHeightAtStart = 2 * Math.tan(THREE.MathUtils.degToRad(34 / 2)) * 9;
  const productionScale = (worldHeightAtStart * stageHeight) / Math.max(1, size.height);
  const topologySwitched = snapshot.cameraPass >= TOPOLOGY_SWITCH_PROGRESS;
  const productionPosition: [number, number, number] = topologySwitched ? [0, 0, 0] : ringPosition;

  return (
    <>
      <CameraRig snapshot={snapshot} profile={profile} />
      <ambientLight intensity={0.54} color="#cad4e7" />
      <directionalLight position={[-4.6, 5.6, 8]} intensity={2.4} color="#f0d1a3" castShadow />
      <pointLight position={[ringPosition[0], ringPosition[1], -1.4]} intensity={4.6} distance={9} color="#a9c9ff" />
      <group position={productionPosition}>
        {production.valid && production.scene ? (
          <ProductionArchitecture
            scene={production.scene}
            snapshot={snapshot}
            scale={topologySwitched ? 1 : productionScale}
          />
        ) : (
          <ProceduralOculus visible />
        )}
        <Dust opacity={snapshot.atmosphereOpacity} />
      </group>
    </>
  );
}

export default function OculusCanvas({
  snapshot,
  profile,
  onAssetStatus,
  onContextLost
}: OculusCanvasProps) {
  const dpr = canvasDprRange(profile, navigator.maxTouchPoints);

  return (
    <Canvas
      aria-hidden="true"
      role="presentation"
      tabIndex={-1}
      dpr={dpr}
      frameloop="demand"
      camera={{ fov: 34, near: 0.035, far: 60, position: [0, 0, 9] }}
      gl={{
        alpha: true,
        antialias: true,
        depth: true,
        stencil: false,
        powerPreference: 'high-performance'
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.96;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
    >
      <ContextLossGuard onContextLost={onContextLost} />
      <OculusScene
        snapshot={snapshot}
        profile={profile}
        onAssetStatus={onAssetStatus}
      />
    </Canvas>
  );
}
