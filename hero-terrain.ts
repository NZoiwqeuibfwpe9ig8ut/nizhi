import * as THREE from 'three';
import {
  buildContours,
  insideIsland,
  islandBoundary,
  makeLevels,
  terrainHeight,
} from '../lib/contours';

export interface HeroTerrainOptions {
  onProgress?: (progress: number) => void;
}

export interface HeroTerrainHandle {
  pause: () => void;
  resume: () => void;
  dispose: () => void;
}

/**
 * A contour-field made of line segments and drifting mineral dust.
 * Everything is procedural: no textures, no models, no network requests after
 * the Three.js chunk has arrived.
 */
export function mountHeroTerrain(
  canvas: HTMLCanvasElement,
  options: HeroTerrainOptions = {},
): HeroTerrainHandle {
  const wrap = canvas.parentElement as HTMLElement | null;
  const hero = canvas.closest<HTMLElement>('[data-hero]');
  if (!wrap || !hero) throw new Error('Hero terrain needs a canvas inside [data-hero].');

  const compact = window.matchMedia('(max-width: 760px)').matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.15 : 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x090c09, 0.048);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  const group = new THREE.Group();
  scene.add(group);

  const levels = makeLevels(compact ? 20 : 24, 0.07, 0.93);
  const levelIndex = new Map(levels.map((level, index) => [level, index]));
  const segments = buildContours({
    extent: 9.6,
    resolution: compact ? 72 : 100,
    levels,
    clip: insideIsland,
  });

  const positions: number[] = [];
  const colors: number[] = [];
  const low = new THREE.Color('#76816b');
  const high = new THREE.Color('#e2d0aa');
  const signal = new THREE.Color('#ec613d');
  const temp = new THREE.Color();

  for (const segment of segments) {
    const index = levelIndex.get(segment.level) ?? 0;
    const t = index / Math.max(1, levels.length - 1);
    temp.lerpColors(low, high, t);
    const isSignal = index % 5 === 0;
    if (isSignal) temp.copy(signal).lerp(high, 0.2);

    const y = (segment.level - 0.5) * 7.6;
    positions.push(segment.a[0], y, segment.a[1], segment.b[0], y, segment.b[1]);
    colors.push(temp.r, temp.g, temp.b, temp.r, temp.g, temp.b);
  }

  const contourGeometry = new THREE.BufferGeometry();
  contourGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  contourGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const contourMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: compact ? 0.92 : 0.78,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const contours = new THREE.LineSegments(contourGeometry, contourMaterial);
  group.add(contours);

  // A faint survey boundary turns the field into a finite specimen.
  const boundaryGeometry = new THREE.BufferGeometry().setFromPoints(
    islandBoundary(160).map(([x, z]) => new THREE.Vector3(x, -3.28, z)),
  );
  const boundaryMaterial = new THREE.LineBasicMaterial({
    color: 0xc8b99b,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const boundary = new THREE.LineLoop(boundaryGeometry, boundaryMaterial);
  group.add(boundary);

  // Dust is sampled along the contour field rather than in a generic sphere.
  const dustCount = compact ? 1800 : 3600;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 3);
  const dustSizes = new Float32Array(dustCount);
  const dustSeeds = new Float32Array(dustCount);
  const dustColor = new THREE.Color();

  for (let i = 0; i < dustCount; i += 1) {
    const segment = segments[Math.floor(Math.random() * segments.length)];
    const mix = Math.random();
    const x = segment.a[0] + (segment.b[0] - segment.a[0]) * mix;
    const z = segment.a[1] + (segment.b[1] - segment.a[1]) * mix;
    const level = segment.level;
    dustPositions[i * 3] = x + (Math.random() - 0.5) * 0.26;
    dustPositions[i * 3 + 1] = (level - 0.5) * 7.6 + (Math.random() - 0.2) * 1.6;
    dustPositions[i * 3 + 2] = z + (Math.random() - 0.5) * 0.26;
    dustSizes[i] = 0.55 + Math.random() * 1.25;
    dustSeeds[i] = Math.random();
    dustColor.lerpColors(low, high, Math.random());
    if (Math.random() > 0.92) dustColor.lerp(signal, 0.65);
    dustColors[i * 3] = dustColor.r;
    dustColors[i * 3 + 1] = dustColor.g;
    dustColors[i * 3 + 2] = dustColor.b;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute('aColor', new THREE.BufferAttribute(dustColors, 3));
  dustGeometry.setAttribute('aSize', new THREE.BufferAttribute(dustSizes, 1));
  dustGeometry.setAttribute('aSeed', new THREE.BufferAttribute(dustSeeds, 1));

  const dustMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aSeed;
      varying vec3 vColor;
      varying float vFade;

      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.14 + aSeed * 6.283 + position.z * 0.24) * 0.18;
        p.y += cos(uTime * 0.2 + aSeed * 10.0) * 0.12;
        p.z += cos(uTime * 0.1 + aSeed * 4.0) * 0.1;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * uPixelRatio * (68.0 / max(-mv.z, 1.0));
        gl_Position = projectionMatrix * mv;
        vColor = aColor;
        vFade = smoothstep(30.0, 4.0, -mv.z) * 0.94;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vFade;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.04, d) * vFade;
        if (alpha < 0.012) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  group.add(dust);

  // A single cartographic beacon anchors the scene.
  const beaconGroup = new THREE.Group();
  const beaconX = 2.5;
  const beaconZ = -0.9;
  const beaconLevel = terrainHeight(beaconX, beaconZ);
  beaconGroup.position.set(beaconX, (beaconLevel - 0.5) * 7.6 + 0.06, beaconZ);

  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xec613d, transparent: true, opacity: 1 }),
  );
  dot.position.y = 0.055;
  beaconGroup.add(dot);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xec613d,
    transparent: true,
    opacity: 0.58,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.32, 64), ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  beaconGroup.add(ring);

  const outerRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xe2d0aa,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const outerRing = new THREE.Mesh(new THREE.RingGeometry(0.88, 0.9, 72), outerRingMaterial);
  outerRing.rotation.x = -Math.PI / 2;
  beaconGroup.add(outerRing);

  const surveyGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.12, 0),
    new THREE.Vector3(-0.14, 0.92, 0),
    new THREE.Vector3(0, 0.92, 0),
    new THREE.Vector3(0, 0.92, 0),
    new THREE.Vector3(0.14, 0.92, 0),
    new THREE.Vector3(0, 0.92, 0),
    new THREE.Vector3(0, 0.92, -0.14),
  ]);
  const surveyMaterial = new THREE.LineBasicMaterial({
    color: 0xec613d,
    transparent: true,
    opacity: 0.56,
    blending: THREE.AdditiveBlending,
  });
  const survey = new THREE.LineSegments(surveyGeometry, surveyMaterial);
  beaconGroup.add(survey);

  const marker = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.085, 0),
    new THREE.MeshBasicMaterial({ color: 0xec613d, transparent: true, opacity: 0.9 }),
  );
  marker.position.y = 1.18;
  beaconGroup.add(marker);
  group.add(beaconGroup);

  group.rotation.y = -0.24;
  group.position.set(compact ? 0.5 : 2.4, -0.4, 0);

  const startCamera = compact
    ? new THREE.Vector3(6.2, 8.2, 17.6)
    : new THREE.Vector3(8.8, 7.5, 15.8);
  const endCamera = compact
    ? new THREE.Vector3(-2.2, 3.4, 10.2)
    : new THREE.Vector3(-4.1, 2.5, 6.4);
  const startTarget = new THREE.Vector3(0.8, 0.1, -0.4);
  const endTarget = new THREE.Vector3(-0.7, 0.9, -1.4);
  const cameraPosition = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();

  let width = 1;
  let height = 1;
  let progress = 0;
  let smoothProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;
  let active = true;
  let visible = true;
  let inView = true;
  let frameId = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let lastReported = -1;

  function resize(): void {
    width = Math.max(1, wrap.clientWidth);
    height = Math.max(1, wrap.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function getProgress(): number {
    const rect = hero.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight * 0.18);
    return THREE.MathUtils.clamp(-rect.top / total, 0, 1);
  }

  function renderFrame(now: number): void {
    frameId = requestAnimationFrame(renderFrame);
    const delta = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    elapsed += delta;

    const target = getProgress();
    progress += (target - progress) * Math.min(1, delta * 4.2);
    smoothProgress += (progress - smoothProgress) * Math.min(1, delta * 3.2);
    smoothPointerX += (pointerX - smoothPointerX) * Math.min(1, delta * 2.8);
    smoothPointerY += (pointerY - smoothPointerY) * Math.min(1, delta * 2.8);

    const eased = smoothProgress * smoothProgress * (3 - 2 * smoothProgress);
    cameraPosition.lerpVectors(startCamera, endCamera, eased);
    cameraPosition.x += smoothPointerX * 0.75;
    cameraPosition.y += smoothPointerY * 0.45;
    cameraPosition.y += Math.sin(elapsed * 0.34) * 0.055;
    cameraTarget.lerpVectors(startTarget, endTarget, eased);
    camera.position.copy(cameraPosition);
    camera.lookAt(cameraTarget);

    group.rotation.y = -0.24 + eased * 0.3 + Math.sin(elapsed * 0.12) * 0.009 + smoothPointerX * 0.028;
    group.rotation.x = -0.03 + eased * 0.08;
    dustMaterial.uniforms.uTime.value = elapsed;

    const pulse = 1 + Math.sin(elapsed * 1.4) * 0.16;
    ring.scale.setScalar(pulse);
    ringMaterial.opacity = 0.34 + Math.sin(elapsed * 1.4) * 0.18;
    outerRing.scale.setScalar(1 + Math.sin(elapsed * 0.65) * 0.06);
    marker.rotation.y += delta * 0.85;
    marker.rotation.x = Math.sin(elapsed * 0.5) * 0.25;
    marker.position.y = 1.18 + Math.sin(elapsed * 0.9) * 0.06;
    dot.scale.setScalar(1 + Math.sin(elapsed * 1.4) * 0.12);

    renderer.render(scene, camera);

    const report = Math.round(progress * 100);
    if (report !== lastReported) {
      lastReported = report;
      options.onProgress?.(progress);
    }
  }

  function updateLoop(): void {
    if (active && visible && inView && frameId === 0) {
      lastTime = performance.now();
      frameId = requestAnimationFrame(renderFrame);
    } else if ((!active || !visible || !inView) && frameId !== 0) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function handlePointer(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const bounds = hero.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1;
    pointerY = ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1;
  }

  function resetPointer(): void {
    pointerX = 0;
    pointerY = 0;
  }

  function handleVisibility(): void {
    visible = document.visibilityState === 'visible';
    updateLoop();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      updateLoop();
    },
    { threshold: 0 },
  );
  intersectionObserver.observe(hero);

  hero.addEventListener('pointermove', handlePointer, { passive: true });
  hero.addEventListener('pointerleave', resetPointer, { passive: true });
  document.addEventListener('visibilitychange', handleVisibility);

  resize();
  camera.position.copy(startCamera);
  camera.lookAt(startTarget);
  renderer.render(scene, camera);
  updateLoop();

  return {
    pause() {
      active = false;
      updateLoop();
    },
    resume() {
      active = true;
      updateLoop();
    },
    dispose() {
      active = false;
      cancelAnimationFrame(frameId);
      frameId = 0;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      hero.removeEventListener('pointermove', handlePointer);
      hero.removeEventListener('pointerleave', resetPointer);
      contourGeometry.dispose();
      contourMaterial.dispose();
      boundaryGeometry.dispose();
      boundaryMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      dot.geometry.dispose();
      (dot.material as THREE.Material).dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      outerRing.geometry.dispose();
      outerRingMaterial.dispose();
      surveyGeometry.dispose();
      surveyMaterial.dispose();
      marker.geometry.dispose();
      (marker.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}
