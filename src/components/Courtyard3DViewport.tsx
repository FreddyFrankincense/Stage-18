import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  APARTMENTS,
  ApartmentSpec,
  BUILDINGS,
  JEFF_CAMERA_ORIGIN_METERS,
  LIGHTING_PRESETS,
  LightingPreset,
  OPTICAL_PRESETS,
} from '../data/stage18Data';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Grid,
  Layers,
  Maximize2,
  Sun,
  Target,
} from 'lucide-react';

export type CameraViewMode = 'orbit' | 'jeff_pov' | 'section_cut';

interface Courtyard3DViewportProps {
  selectedApartmentId: string;
  onSelectApartment: (aptId: string) => void;
  activeFocalLengthMm: number;
  onChangeFocalLengthMm: (mm: number) => void;
  activeLightingId: LightingPreset['id'];
  onChangeLightingId: (id: LightingPreset['id']) => void;
  onJumpToPipelineTab: () => void;
}

// Module-scope reusable math helpers (Zero GC in render loop)
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _mouse = new THREE.Vector2();

function createProceduralBrickTexture(
  baseHex: number,
  mortarHex: number,
  maxAnisotropy: number,
  isStucco = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const baseColor = new THREE.Color(baseHex);
  const mortarColor = new THREE.Color(mortarHex);

  ctx.fillStyle = `#${mortarColor.getHexString()}`;
  ctx.fillRect(0, 0, 512, 512);

  if (isStucco) {
    ctx.fillStyle = `#${baseColor.getHexString()}`;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 3500; i++) {
      const x = (i * 73) % 512;
      const y = (i * 137) % 512;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
      ctx.fillRect(x, y, 4, 4);
    }
  } else {
    const rows = 16;
    const cols = 8;
    const brickH = 512 / rows;
    const brickW = 512 / cols;

    for (let r = 0; r < rows; r++) {
      const offset = r % 2 === 0 ? 0 : brickW * 0.5;
      for (let c = -1; c <= cols; c++) {
        const shadeDelta = (((r * 13 + c * 29) % 17) - 8) * 0.012;
        const cBrick = baseColor.clone().offsetHSL(0, 0, shadeDelta);
        ctx.fillStyle = `#${cBrick.getHexString()}`;
        ctx.fillRect(c * brickW + offset + 2, r * brickH + 2, brickW - 4, brickH - 4);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export const Courtyard3DViewport: React.FC<Courtyard3DViewportProps> = ({
  selectedApartmentId,
  onSelectApartment,
  activeFocalLengthMm,
  onChangeFocalLengthMm,
  activeLightingId,
  onChangeLightingId,
  onJumpToPipelineTab,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [cameraMode, setCameraMode] = useState<CameraViewMode>('orbit');
  const [showStageGrid, setShowStageGrid] = useState<boolean>(true);
  const [showSightlines, setShowSightlines] = useState<boolean>(true);
  const [showPortals, setShowPortals] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [hoveredAptName, setHoveredAptName] = useState<string | null>(null);

  const selectedApartment: ApartmentSpec =
    APARTMENTS.find((a) => a.id === selectedApartmentId) || APARTMENTS[0];
  const activeLighting: LightingPreset =
    LIGHTING_PRESETS.find((l) => l.id === activeLightingId) || LIGHTING_PRESETS[1];

  // Mutable refs so React state updates never destroy or re-init the WebGL canvas
  const stateRef = useRef({
    selectedApartmentId,
    activeFocalLengthMm,
    activeLightingId,
    cameraMode,
    showStageGrid,
    showSightlines,
    showPortals,
    onSelectApartment,
  });

  useEffect(() => {
    stateRef.current = {
      selectedApartmentId,
      activeFocalLengthMm,
      activeLightingId,
      cameraMode,
      showStageGrid,
      showSightlines,
      showPortals,
      onSelectApartment,
    };
  }, [
    selectedApartmentId,
    activeFocalLengthMm,
    activeLightingId,
    cameraMode,
    showStageGrid,
    showSightlines,
    showPortals,
    onSelectApartment,
  ]);

  // Ref for triggering scene updates from React props
  const sceneUpdaterRef = useRef<(() => void) | null>(null);
  const cameraTransitionTriggerRef = useRef<((mode: CameraViewMode, apt: ApartmentSpec, focalMm: number) => void) | null>(
    null
  );

  // Keyboard shortcut 'H' to collapse/expand bottom control dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight - 65;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11151f);
    scene.fog = new THREE.FogExp2(0x11151f, 0.0085);

    // 2. Studio Environment Map (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // 3. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.2, 250);
    camera.position.set(24, 15, 34);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 95;
    controls.minDistance = 1.5;
    controls.target.set(0, -1.5, -2);

    // Track smooth transitions
    let isTransitioning = false;
    let desiredCamPos = new THREE.Vector3(24, 15, 34);
    let desiredLookAt = new THREE.Vector3(0, -1.5, -2);
    let desiredFov = 42;

    // 4. Lighting Rig (Key Sun + Hemisphere Sky/Ground Fill + Back Rim)
    const hemiLight = new THREE.HemisphereLight(0xdba374, 0x4f3a2d, 0.65);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffdfa8, 2.6);
    sunLight.position.set(22, 28, 18);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    const d = 32;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 95;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x6e98c4, 0.55);
    rimLight.position.set(-20, 18, -28);
    scene.add(rimLight);

    // 5. Construct Stage 18 Architecture & Multi-Part Procedural Models
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const disposableTextures: THREE.Texture[] = [];

    // A. Excavated Subterranean Courtyard Pit (Y = -7.62m / -25 ft)
    const courtyardGroup = new THREE.Group();
    scene.add(courtyardGroup);

    const flagstoneTex = createProceduralBrickTexture(0x3a3d35, 0x262822, maxAniso, true);
    disposableTextures.push(flagstoneTex);

    const pitFloorGeo = new THREE.BoxGeometry(28, 0.5, 44);
    const pitFloorMat = new THREE.MeshStandardMaterial({
      map: flagstoneTex,
      roughness: 0.88,
      metalness: 0.05,
    });
    disposableGeometries.push(pitFloorGeo);
    disposableMaterials.push(pitFloorMat);
    const pitFloorMesh = new THREE.Mesh(pitFloorGeo, pitFloorMat);
    pitFloorMesh.position.set(0, -7.87, 2);
    pitFloorMesh.receiveShadow = true;
    courtyardGroup.add(pitFloorMesh);

    // Sunken garden soil & Thorwald's flowerbed along North/East retaining border
    const flowerbedGeo = new THREE.BoxGeometry(11.5, 0.32, 3.2);
    const flowerbedMat = new THREE.MeshStandardMaterial({
      color: 0x3b2d22,
      roughness: 0.94,
      metalness: 0.02,
    });
    const flowerbedRimGeo = new THREE.BoxGeometry(11.9, 0.38, 3.6);
    const flowerbedRimMat = new THREE.MeshStandardMaterial({
      color: 0x7a756c,
      roughness: 0.75,
      metalness: 0.08,
    });
    disposableGeometries.push(flowerbedGeo, flowerbedRimGeo);
    disposableMaterials.push(flowerbedMat, flowerbedRimMat);

    const flowerRim = new THREE.Mesh(flowerbedRimGeo, flowerbedRimMat);
    flowerRim.position.set(-1.5, -7.48, -11.0);
    flowerRim.receiveShadow = true;
    courtyardGroup.add(flowerRim);

    const flowerSoil = new THREE.Mesh(flowerbedGeo, flowerbedMat);
    flowerSoil.position.set(-1.5, -7.42, -11.0);
    flowerSoil.receiveShadow = true;
    courtyardGroup.add(flowerSoil);

    // Instanced Zinnia flowers in Thorwald's flowerbed (>20 instances -> InstancedMesh)
    const zinniaGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const zinniaMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.05,
    });
    disposableGeometries.push(zinniaGeo);
    disposableMaterials.push(zinniaMat);
    const zinniaCount = 36;
    const zinniaInstanced = new THREE.InstancedMesh(zinniaGeo, zinniaMat, zinniaCount);
    const dummy = new THREE.Object3D();
    const flowerColors = [0xd93829, 0xe89b25, 0xd45b7a, 0x527a38];
    for (let i = 0; i < zinniaCount; i++) {
      const fx = -6.5 + (i % 12) * 0.88 + ((i * 7) % 3) * 0.1;
      const fz = -12.0 + Math.floor(i / 12) * 0.9;
      const scale = 0.85 + ((i * 13) % 5) * 0.08;
      dummy.position.set(fx, -7.22, fz);
      dummy.scale.set(scale, scale * 0.8, scale);
      dummy.updateMatrix();
      zinniaInstanced.setMatrixAt(i, dummy.matrix);
      zinniaInstanced.setColorAt(i, new THREE.Color(flowerColors[i % flowerColors.length]));
    }
    zinniaInstanced.instanceMatrix.needsUpdate = true;
    if (zinniaInstanced.instanceColor) zinniaInstanced.instanceColor.needsUpdate = true;
    zinniaInstanced.computeBoundingSphere();
    courtyardGroup.add(zinniaInstanced);

    // Sculptress's biomorphic "Hunger" statue in the lower garden (3-part composite group)
    const sculptureGroup = new THREE.Group();
    sculptureGroup.position.set(3.8, -7.62, -10.8);
    const plinthGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.6, 16);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x6c6860, roughness: 0.8, metalness: 0.1 });
    const torsoGeo = new THREE.TorusKnotGeometry(0.42, 0.13, 48, 12, 2, 3);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c5, roughness: 0.45, metalness: 0.08 });
    disposableGeometries.push(plinthGeo, torsoGeo);
    disposableMaterials.push(plinthMat, stoneMat);

    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = 0.3;
    plinthMesh.castShadow = true;
    sculptureGroup.add(plinthMesh);

    const statueMesh = new THREE.Mesh(torsoGeo, stoneMat);
    statueMesh.position.y = 1.15;
    statueMesh.castShadow = true;
    sculptureGroup.add(statueMesh);
    courtyardGroup.add(sculptureGroup);

    // Stage Floor Datum Reference Plane (Y = 0.0m, showing where Stage 18 main floor sits)
    const stageDatumGrid = new THREE.GridHelper(56, 28, 0x0ea5e9, 0x1e293b);
    stageDatumGrid.position.set(0, 0.02, 0);
    (stageDatumGrid.material as THREE.Material).transparent = true;
    (stageDatumGrid.material as THREE.Material).opacity = 0.28;
    scene.add(stageDatumGrid);

    // B. Stage 18 Overhead Lighting Grid & Bounding Envelope (185' x 98' x 40')
    const stageEnvelopeGroup = new THREE.Group();
    const cageGeo = new THREE.BoxGeometry(29.87, 19.81, 56.39);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    const cageLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
    });
    disposableGeometries.push(cageGeo, cageEdges);
    disposableMaterials.push(cageLineMat);
    const cageWire = new THREE.LineSegments(cageEdges, cageLineMat);
    cageWire.position.set(0, 2.28, 2.0);
    stageEnvelopeGroup.add(cageWire);

    // Overhead Stage 18 Carbon-Arc Catwalks at Y = +12.19m (+40 ft above stage floor)
    const trussGeo = new THREE.BoxGeometry(26, 0.18, 0.25);
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x2a2f3a,
      roughness: 0.4,
      metalness: 0.8,
    });
    disposableGeometries.push(trussGeo);
    disposableMaterials.push(trussMat);
    for (let z = -18; z <= 20; z += 6.5) {
      const beam = new THREE.Mesh(trussGeo, trussMat);
      beam.position.set(0, 12.1, z);
      stageEnvelopeGroup.add(beam);
    }
    scene.add(stageEnvelopeGroup);

    // C. Build the 7 Composite Building Structures (3-12 part THREE.Groups)
    const buildingsRoot = new THREE.Group();
    scene.add(buildingsRoot);

    BUILDINGS.filter((b) => b.id !== 'bldg_courtyard_pit').forEach((bldg) => {
      const bGroup = new THREE.Group();
      const [bx, by, bz] = bldg.positionMeters;
      const [bw, bh, bd] = bldg.sizeMeters;

      // Pivot at bottom-center (by = -7.62m)
      bGroup.position.set(bx, by, bz);

      const isStucco = bldg.id === 'bldg_east_stucco';
      const tex = createProceduralBrickTexture(bldg.colorHex, 0x3b3530, maxAniso, isStucco);
      disposableTextures.push(tex);

      // Part 1: Primary Masonry Hull
      const hullGeo = new THREE.BoxGeometry(bw, bh, bd);
      const hullMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: isStucco ? 0.85 : 0.78,
        metalness: 0.05,
      });
      disposableGeometries.push(hullGeo);
      disposableMaterials.push(hullMat);
      const hullMesh = new THREE.Mesh(hullGeo, hullMat);
      hullMesh.position.y = bh / 2;
      hullMesh.castShadow = true;
      hullMesh.receiveShadow = true;
      bGroup.add(hullMesh);

      // Part 2: Limestone Foundation Plinth (in the excavated -25 ft zone)
      const plinthH = 2.4;
      const basePlinthGeo = new THREE.BoxGeometry(bw + 0.25, plinthH, bd + 0.25);
      const basePlinthMat = new THREE.MeshStandardMaterial({
        color: bldg.trimColorHex,
        roughness: 0.62,
        metalness: 0.08,
      });
      disposableGeometries.push(basePlinthGeo);
      disposableMaterials.push(basePlinthMat);
      const basePlinth = new THREE.Mesh(basePlinthGeo, basePlinthMat);
      basePlinth.position.y = plinthH / 2;
      basePlinth.receiveShadow = true;
      bGroup.add(basePlinth);

      // Part 3: Overhanging Roof Cornice & Parapet Cap
      const corniceGeo = new THREE.BoxGeometry(bw + 0.45, 0.55, bd + 0.45);
      const corniceMat = new THREE.MeshStandardMaterial({
        color: bldg.trimColorHex,
        roughness: 0.5,
        metalness: 0.15,
      });
      const roofTarGeo = new THREE.BoxGeometry(bw - 0.4, 0.3, bd - 0.4);
      const roofTarMat = new THREE.MeshStandardMaterial({
        color: 0x1f2226,
        roughness: 0.92,
        metalness: 0.05,
      });
      disposableGeometries.push(corniceGeo, roofTarGeo);
      disposableMaterials.push(corniceMat, roofTarMat);

      const corniceMesh = new THREE.Mesh(corniceGeo, corniceMat);
      corniceMesh.position.y = bh + 0.15;
      corniceMesh.castShadow = true;
      bGroup.add(corniceMesh);

      const roofTarMesh = new THREE.Mesh(roofTarGeo, roofTarMat);
      roofTarMesh.position.y = bh + 0.35;
      bGroup.add(roofTarMesh);

      // Part 4: Horizontal Floor Belt Courses
      const beltGeo = new THREE.BoxGeometry(bw + 0.16, 0.18, bd + 0.16);
      disposableGeometries.push(beltGeo);
      for (let f = 1; f < bldg.floors; f++) {
        const belt = new THREE.Mesh(beltGeo, corniceMat);
        belt.position.y = (bh / bldg.floors) * f;
        bGroup.add(belt);
      }

      // Part 5: Special Rooftop Cedar Water Tower & Wrought-Iron Fire Escapes on Main North Tenement
      if (bldg.id === 'bldg_main_north') {
        const towerGroup = new THREE.Group();
        towerGroup.position.set(-5.2, bh + 0.35, -1.2);

        const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
        const steelMat = new THREE.MeshStandardMaterial({
          color: 0x2b3036,
          roughness: 0.35,
          metalness: 0.85,
        });
        const barrelGeo = new THREE.CylinderGeometry(1.35, 1.45, 2.8, 18);
        const woodMat = new THREE.MeshStandardMaterial({
          color: 0x6e4730,
          roughness: 0.82,
          metalness: 0.05,
        });
        const coneGeo = new THREE.ConeGeometry(1.55, 0.9, 18);
        disposableGeometries.push(legGeo, barrelGeo, coneGeo);
        disposableMaterials.push(steelMat, woodMat);

        [
          [-0.8, -0.8],
          [0.8, -0.8],
          [-0.8, 0.8],
          [0.8, 0.8],
        ].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, steelMat);
          leg.position.set(lx, 1.1, lz);
          towerGroup.add(leg);
        });

        const barrel = new THREE.Mesh(barrelGeo, woodMat);
        barrel.position.y = 3.4;
        barrel.castShadow = true;
        towerGroup.add(barrel);

        const roofCone = new THREE.Mesh(coneGeo, steelMat);
        roofCone.position.y = 5.25;
        towerGroup.add(roofCone);

        bGroup.add(towerGroup);

        // Wrought-iron fire escape balconies on front face (+Z face of North building)
        const balconyGeo = new THREE.BoxGeometry(3.8, 0.14, 1.15);
        const railGeo = new THREE.BoxGeometry(3.8, 0.75, 0.06);
        disposableGeometries.push(balconyGeo, railGeo);
        for (let fl = 1; fl <= 4; fl++) {
          const fy = fl * 3.3 + 0.2;
          const bal = new THREE.Mesh(balconyGeo, steelMat);
          bal.position.set(-2.2, fy, bd / 2 + 0.58);
          bal.castShadow = true;
          bGroup.add(bal);

          const rail = new THREE.Mesh(railGeo, steelMat);
          rail.position.set(-2.2, fy + 0.42, bd / 2 + 1.12);
          bGroup.add(rail);
        }
      }

      buildingsRoot.add(bGroup);
    });

    // D. Interactive Apartment Windows, Cycles Portals & Clickable Targets (Layer 1)
    const clickableMeshes: THREE.Mesh[] = [];
    const apartmentVisuals = new Map<
      string,
      {
        frameMesh: THREE.Mesh;
        glassMat: THREE.MeshStandardMaterial;
        portalFrame: THREE.LineSegments;
        spec: ApartmentSpec;
      }
    >();

    APARTMENTS.forEach((apt) => {
      const aptGroup = new THREE.Group();
      const [ax, ay, az] = apt.positionMeters;
      const [ww, wh] = apt.windowSizeMeters;

      aptGroup.position.set(ax, ay, az);

      // Rotate East/West wing windows to face inward toward the courtyard center
      if (apt.buildingId === 'bldg_east_stucco') {
        aptGroup.rotation.y = -Math.PI / 2;
      } else if (apt.buildingId === 'bldg_west_brick') {
        aptGroup.rotation.y = Math.PI / 2;
      } else if (apt.buildingId === 'bldg_jeff_south') {
        aptGroup.rotation.y = Math.PI;
      }

      // Outer Window Frame
      const frameGeo = new THREE.BoxGeometry(ww + 0.35, wh + 0.35, 0.45);
      const frameMat = new THREE.MeshStandardMaterial({
        color: apt.isHero ? 0xd9cbb8 : 0x6e6a63,
        roughness: 0.55,
        metalness: 0.15,
      });
      disposableGeometries.push(frameGeo);
      disposableMaterials.push(frameMat);
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      aptGroup.add(frameMesh);

      // Glowing Interior Room Box / Glass Plane (Clickable on Layer 1)
      const glassGeo = new THREE.BoxGeometry(ww, wh, 0.52);
      const baseGlowColor =
        apt.id === 'apt_thorwald_living'
          ? 0xffb347
          : apt.id === 'apt_miss_lonelyhearts'
            ? 0x3dd6a3
            : apt.id === 'apt_miss_torso'
              ? 0xff9e7d
              : apt.id === 'apt_composer'
                ? 0x8cc7ff
                : apt.id === 'apt_jeff_home'
                  ? 0xf59e0b
                  : 0xe2c48d;

      const glassMat = new THREE.MeshStandardMaterial({
        color: baseGlowColor,
        emissive: baseGlowColor,
        emissiveIntensity: 0.85,
        roughness: 0.18,
        metalness: 0.1,
      });
      disposableGeometries.push(glassGeo);
      disposableMaterials.push(glassMat);

      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.layers.enable(1);
      glassMesh.userData = { apartmentId: apt.id, apartmentName: apt.name };
      clickableMeshes.push(glassMesh);
      aptGroup.add(glassMesh);

      // Cycles Light Portal Cyan Indicator Frame
      const portalGeo = new THREE.BoxGeometry(ww + 0.65, wh + 0.65, 0.62);
      const portalEdges = new THREE.EdgesGeometry(portalGeo);
      const portalMat = new THREE.LineBasicMaterial({
        color: apt.cyclesPortals > 0 ? 0x0ea5e9 : 0x64748b,
        transparent: true,
        opacity: apt.cyclesPortals > 0 ? 0.85 : 0.25,
      });
      disposableGeometries.push(portalGeo, portalEdges);
      disposableMaterials.push(portalMat);
      const portalFrame = new THREE.LineSegments(portalEdges, portalMat);
      aptGroup.add(portalFrame);

      scene.add(aptGroup);
      apartmentVisuals.set(apt.id, {
        frameMesh,
        glassMat,
        portalFrame,
        spec: apt,
      });
    });

    // E. Jeff's Wheelchair Nodal Origin & Dynamic Sightline Laser Ray
    const jeffOriginVec = new THREE.Vector3(...JEFF_CAMERA_ORIGIN_METERS);
    const originSphereGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const originSphereMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.5,
    });
    disposableGeometries.push(originSphereGeo);
    disposableMaterials.push(originSphereMat);
    const jeffOriginMarker = new THREE.Mesh(originSphereGeo, originSphereMat);
    jeffOriginMarker.position.copy(jeffOriginVec);
    scene.add(jeffOriginMarker);

    // Sightline Ray + Frustum Cone from Jeff to Selected Neighbor
    const sightlineGroup = new THREE.Group();
    scene.add(sightlineGroup);

    const sightlinePositions = new Float32Array(6);
    const sightlineGeo = new THREE.BufferGeometry();
    sightlineGeo.setAttribute('position', new THREE.BufferAttribute(sightlinePositions, 3));
    const sightlineMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.95,
    });
    disposableGeometries.push(sightlineGeo);
    disposableMaterials.push(sightlineMat);
    const sightlineLine = new THREE.Line(sightlineGeo, sightlineMat);
    sightlineGroup.add(sightlineLine);

    // Highlight Selection Ring around active apartment
    const selectRingGeo = new THREE.RingGeometry(1.8, 2.15, 32);
    const selectRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
    });
    disposableGeometries.push(selectRingGeo);
    disposableMaterials.push(selectRingMat);
    const selectRingMesh = new THREE.Mesh(selectRingGeo, selectRingMat);
    sightlineGroup.add(selectRingMesh);

    // 6. On-Demand & Software-WebGL Paced Render Scheduler
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        const dt = Math.min(clock.getDelta(), 0.1);

        if (isTransitioning) {
          const lambda = 7.5;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredCamPos.x, lambda, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredCamPos.y, lambda, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredCamPos.z, lambda, dt);

          controls.target.x = THREE.MathUtils.damp(controls.target.x, desiredLookAt.x, lambda, dt);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, desiredLookAt.y, lambda, dt);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, desiredLookAt.z, lambda, dt);

          camera.fov = THREE.MathUtils.damp(camera.fov, desiredFov, lambda, dt);
          camera.updateProjectionMatrix();

          const posDist = camera.position.distanceToSquared(desiredCamPos);
          const lookDist = controls.target.distanceToSquared(desiredLookAt);
          const fovDelta = Math.abs(camera.fov - desiredFov);

          if (posDist < 0.005 && lookDist < 0.005 && fovDelta < 0.05) {
            isTransitioning = false;
          } else {
            renderDirty = true;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || isTransitioning) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    // Cancel scripted camera transition when user interacts manually
    const handleControlStart = () => {
      isTransitioning = false;
    };
    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('change', requestRender);

    // Function to sync scene state with React props
    const syncSceneState = () => {
      const st = stateRef.current;
      const preset =
        LIGHTING_PRESETS.find((l) => l.id === st.activeLightingId) || LIGHTING_PRESETS[1];

      // Update lighting & sky
      const elevRad = THREE.MathUtils.degToRad(preset.sunElevationDeg);
      const azimRad = THREE.MathUtils.degToRad(preset.sunAzimuthDeg);
      sunLight.position.set(
        Math.sin(azimRad) * Math.cos(elevRad) * 38,
        Math.sin(elevRad) * 38,
        Math.cos(azimRad) * Math.cos(elevRad) * 38
      );
      sunLight.intensity = preset.sunIntensity;
      hemiLight.color.setHex(preset.ambientSkyHex);
      hemiLight.groundColor.setHex(preset.ambientGroundHex);
      hemiLight.intensity = preset.ambientIntensity;
      scene.background = new THREE.Color(preset.fogHex);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(preset.fogHex);
      }

      // Update Stage 18 grid & sightline visibility
      stageEnvelopeGroup.visible = st.showStageGrid;
      stageDatumGrid.visible = st.showStageGrid;
      sightlineGroup.visible = st.showSightlines;

      // Update apartments highlight & portal visibility
      const activeApt =
        APARTMENTS.find((a) => a.id === st.selectedApartmentId) || APARTMENTS[0];

      apartmentVisuals.forEach((vis, id) => {
        const isSelected = id === activeApt.id;
        vis.portalFrame.visible = st.showPortals || isSelected;
        vis.glassMat.emissiveIntensity = isSelected
          ? Math.max(1.8, preset.windowPracticalIntensity * 1.4)
          : preset.windowPracticalIntensity;
        (vis.frameMesh.material as THREE.MeshStandardMaterial).color.setHex(
          isSelected ? 0xf59e0b : vis.spec.isHero ? 0xd9cbb8 : 0x6e6a63
        );
      });

      // Update sightline ray from Jeff's bay window to active apartment
      const posAttr = sightlineGeo.getAttribute('position') as THREE.BufferAttribute;
      posAttr.setXYZ(0, jeffOriginVec.x, jeffOriginVec.y, jeffOriginVec.z);
      posAttr.setXYZ(
        1,
        activeApt.positionMeters[0],
        activeApt.positionMeters[1],
        activeApt.positionMeters[2]
      );
      posAttr.needsUpdate = true;
      sightlineGeo.computeBoundingSphere();

      selectRingMesh.position.set(
        activeApt.positionMeters[0],
        activeApt.positionMeters[1],
        activeApt.positionMeters[2] + (activeApt.buildingId === 'bldg_jeff_south' ? -0.4 : 0.4)
      );
      selectRingMesh.lookAt(jeffOriginVec);

      requestRender();
    };

    sceneUpdaterRef.current = syncSceneState;

    const triggerCameraTransition = (
      mode: CameraViewMode,
      apt: ApartmentSpec,
      focalMm: number
    ) => {
      clock.getDelta();
      isTransitioning = true;

      if (mode === 'jeff_pov') {
        // Place camera at Jeff's wheelchair window nodal point
        desiredCamPos.set(
          JEFF_CAMERA_ORIGIN_METERS[0],
          JEFF_CAMERA_ORIGIN_METERS[1],
          JEFF_CAMERA_ORIGIN_METERS[2] - 0.6
        );
        if (apt.id === 'apt_jeff_home') {
          desiredLookAt.set(-2.2, 0.2, -12.6); // Look across at Thorwald by default
        } else {
          desiredLookAt.set(
            apt.positionMeters[0],
            apt.positionMeters[1],
            apt.positionMeters[2]
          );
        }
        // Compute vertical FOV from focal length (using 24mm vertical sensor height)
        const vFovRad = 2 * Math.atan(16 / (2 * focalMm));
        desiredFov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(vFovRad), 4.5, 55);
      } else if (mode === 'section_cut') {
        // Side elevation view highlighting the 0.0m Stage Floor vs -7.62m Excavated Pit
        desiredCamPos.set(36, -1.0, 4.0);
        desiredLookAt.set(0, -2.5, -2.0);
        desiredFov = 38;
      } else {
        // Free architectural orbit perspective
        desiredCamPos.set(22, 14, 32);
        desiredLookAt.set(0, -1.5, -3);
        desiredFov = 42;
      }

      requestRender();
    };

    cameraTransitionTriggerRef.current = triggerCameraTransition;

    // 7. Raycasting for Click & Throttled Hover Inspection on Layer 1
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    let lastHoverTime = 0;
    const handlePointerMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 50) return;
      lastHoverTime = now;

      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const hitName = hits[0].object.userData.apartmentName as string;
        setHoveredAptName(hitName);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredAptName(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    let pointerDownPos = { x: 0, y: 0 };
    const handlePointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (dx * dx + dy * dy > 25) return; // Ignore drags

      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const aptId = hits[0].object.userData.apartmentId as string;
        if (aptId) {
          stateRef.current.onSelectApartment(aptId);
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousemove', handlePointerMove);
    domElem.addEventListener('mousedown', handlePointerDown);
    domElem.addEventListener('mouseup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight - 65;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    // Pre-warm shaders & run initial render
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    syncSceneState();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousemove', handlePointerMove);
      domElem.removeEventListener('mousedown', handlePointerDown);
      domElem.removeEventListener('mouseup', handlePointerUp);
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('change', requestRender);
      controls.dispose();
      envTexture.dispose();
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, []);

  // Trigger scene updates when React props/states change
  useEffect(() => {
    if (sceneUpdaterRef.current) {
      sceneUpdaterRef.current();
    }
  }, [
    selectedApartmentId,
    activeLightingId,
    showStageGrid,
    showSightlines,
    showPortals,
  ]);

  // Trigger smooth camera interpolation when camera mode, focal length, or selected apartment changes in POV mode
  useEffect(() => {
    if (cameraTransitionTriggerRef.current) {
      cameraTransitionTriggerRef.current(cameraMode, selectedApartment, activeFocalLengthMm);
    }
  }, [cameraMode, activeFocalLengthMm, selectedApartment]);

  return (
    <div className="relative w-full h-[calc(100vh-65px)] min-h-[640px] bg-[#0C0D10] overflow-hidden select-none">
      {/* Isolated WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="w-full h-full" />

      {/* Minimal Top-Left Architectural Telemetry & Spec Header (Unobtrusive) */}
      <div className="absolute top-4 left-6 z-10 pointer-events-auto max-w-md bg-[#12151C]/95 border border-[#2A2E39] rounded-lg px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-mono text-amber-400 tracking-tight">
            PARAMOUNT STAGE 18 · 185&apos; × 98&apos; × 40&apos; (+25&apos; EXCAVATED PIT)
          </span>
          <button
            onClick={onJumpToPipelineTab}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
          >
            View Blender Guide
          </button>
        </div>

        <h2 className="text-base font-semibold text-[#F3F0E6] mt-1 truncate">
          {selectedApartment.name}
        </h2>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9CA3AF] mt-1 font-mono tabular-nums">
          <span>{selectedApartment.code}</span>
          <span aria-hidden="true">·</span>
          <span>Dist: {selectedApartment.distanceFromJeffFeet} ft ({(selectedApartment.distanceFromJeffFeet * 0.3048).toFixed(1)}m)</span>
          <span aria-hidden="true">·</span>
          <span>
            Elev: {selectedApartment.elevationFeet >= 0 ? `+${selectedApartment.elevationFeet}` : selectedApartment.elevationFeet} ft
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-sky-400">{selectedApartment.cyclesPortals} Cycles Portals</span>
        </div>

        <p className="text-xs text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
          <strong className="text-[#F3F0E6] font-medium">Blender Approach:</strong>{' '}
          {selectedApartment.blenderApproach}
        </p>

        {hoveredAptName && (
          <div className="mt-2 pt-1.5 border-t border-[#2A2E39] text-xs font-mono text-amber-300 truncate">
            Cursor Target: {hoveredAptName} (Click window in 3D to inspect)
          </div>
        )}
      </div>

      {/* Unified Collapsible Bottom Control Dock (Zero Side-Panel Viewport Occlusion) */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 z-10 w-[min(940px,94vw)] transition-transform duration-200 ease-out ${
          isDockCollapsed ? 'bottom-0 translate-y-[calc(100%-38px)]' : 'bottom-5 translate-y-0'
        }`}
      >
        {/* Collapse / Expand Handle Bar */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-[#F3F0E6] bg-[#14171F] border border-b-0 border-[#2A2E39] rounded-t-lg hover:bg-[#1C202B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Toggle 3D Controls Dock (Shortcut: H)"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Show 3D Stage Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Hide Controls · Cinema Mode (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Consolidated Dock Body */}
        <div className="bg-[#12151C]/95 border border-[#2A2E39] rounded-xl p-4 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Column 1: Camera Viewpoint Mode (4 cols) */}
            <div className="md:col-span-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span className="flex items-center gap-1.5 font-medium text-[#F3F0E6]">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  Camera Viewpoint
                </span>
                <span className="font-mono tabular-nums text-[11px]">
                  {cameraMode === 'jeff_pov' ? `${activeFocalLengthMm}mm Lens` : 'Stage Perspective'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#0C0D10] border border-[#2A2E39] rounded-lg">
                <button
                  onClick={() => setCameraMode('orbit')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraMode === 'orbit'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                  }`}
                >
                  Free Orbit
                </button>
                <button
                  onClick={() => setCameraMode('jeff_pov')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraMode === 'jeff_pov'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                  }`}
                >
                  Jeff&apos;s POV
                </button>
                <button
                  onClick={() => setCameraMode('section_cut')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraMode === 'section_cut'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                  }`}
                >
                  -25&apos; Pit Cut
                </button>
              </div>
            </div>

            {/* Column 2: Focal Length / Optical Selector (4 cols) */}
            <div className="md:col-span-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span className="flex items-center gap-1.5 font-medium text-[#F3F0E6]">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  Optical Focal Length
                </span>
                <span className="font-mono tabular-nums text-[11px] text-amber-400">
                  {activeFocalLengthMm === 200 ? '400mm Exakta' : `${activeFocalLengthMm}mm`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-1 bg-[#0C0D10] border border-[#2A2E39] rounded-lg">
                {OPTICAL_PRESETS.map((lens) => (
                  <button
                    key={lens.id}
                    onClick={() => {
                      onChangeFocalLengthMm(lens.focalLengthMm);
                      setCameraMode('jeff_pov');
                    }}
                    className={`px-2 py-1.5 text-xs font-mono tabular-nums rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeFocalLengthMm === lens.focalLengthMm && cameraMode === 'jeff_pov'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
                        : 'text-[#9CA3AF] hover:text-[#F3F0E6]'
                    }`}
                  >
                    {lens.focalLengthMm === 200 ? '400mm' : `${lens.focalLengthMm}mm`}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Target Apartment & Time of Day (4 cols) */}
            <div className="md:col-span-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span className="flex items-center gap-1.5 font-medium text-[#F3F0E6]">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  Target Apartment Sightline
                </span>
                <span className="font-mono tabular-nums text-[11px]">
                  {APARTMENTS.filter((a) => a.isHero).length} Hero Units
                </span>
              </div>
              <select
                value={selectedApartmentId}
                onChange={(e) => onSelectApartment(e.target.value)}
                aria-label="Target Apartment Sightline"
                className="w-full px-3 py-1.5 text-xs font-medium bg-[#0C0D10] text-[#F3F0E6] border border-[#2A2E39] rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {APARTMENTS.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.code} — {apt.name} ({apt.distanceFromJeffFeet} ft)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Row: Time-of-Day Technicolor Lighting & Technical Layer Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-[#2A2E39]">
            {/* Lighting Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-[#9CA3AF] flex items-center gap-1 mr-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Stage 18 Switchboard:
              </span>
              {LIGHTING_PRESETS.map((lp) => (
                <button
                  key={lp.id}
                  onClick={() => onChangeLightingId(lp.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeLightingId === lp.id
                      ? 'bg-[#262B38] text-amber-300 border border-amber-500/40'
                      : 'text-[#9CA3AF] hover:text-[#F3F0E6] bg-[#0C0D10] border border-[#2A2E39]'
                  }`}
                >
                  {lp.name.split(' (')[0]}
                </button>
              ))}
            </div>

            {/* Technical Overlay Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowStageGrid((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showStageGrid
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                    : 'bg-[#0C0D10] text-[#9CA3AF] border-[#2A2E39]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Stage 18 Grid</span>
              </button>
              <button
                onClick={() => setShowSightlines((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showSightlines
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-[#0C0D10] text-[#9CA3AF] border-[#2A2E39]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>POV Sightline</span>
              </button>
              <button
                onClick={() => setShowPortals((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showPortals
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                    : 'bg-[#0C0D10] text-[#9CA3AF] border-[#2A2E39]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cycles Portals</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
