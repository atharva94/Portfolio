import * as THREE from 'three';
import './style.css';

const canvas = document.querySelector('#hero-scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8.8);

  const sculpture = new THREE.Group();
  scene.add(sculpture);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.22, 5),
    new THREE.MeshPhysicalMaterial({
      color: 0xb5b8a9,
      metalness: 0.82,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.14,
      flatShading: false,
    }),
  );
  sculpture.add(core);

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4dfc0,
    metalness: 0.76,
    roughness: 0.29,
    emissive: 0x252b1c,
    emissiveIntensity: 0.35,
  });
  const rings = [
    { radius: 1.7, tube: 0.012, rotation: [0.9, 0.3, -0.35] },
    { radius: 2.04, tube: 0.006, rotation: [-0.35, 0.8, 0.5] },
  ];
  for (const ring of rings) {
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(ring.radius, ring.tube, 8, 180),
      ringMaterial,
    );
    orbit.rotation.set(...ring.rotation);
    sculpture.add(orbit);
  }

  const satelliteGeometry = new THREE.SphereGeometry(0.055, 16, 16);
  const satelliteMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5ebd8,
    emissive: 0x697750,
    emissiveIntensity: 0.85,
    metalness: 0.6,
    roughness: 0.28,
  });
  const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
  satellite.position.set(1.55, 0.67, 0.18);
  sculpture.add(satellite);

  const ambientLight = new THREE.AmbientLight(0xe5e8d8, 1.5);
  const keyLight = new THREE.PointLight(0xe2ebd0, 45, 20);
  keyLight.position.set(3.8, 3.2, 4.5);
  const fillLight = new THREE.PointLight(0x718275, 22, 16);
  fillLight.position.set(-4, -2, 2);
  const rimLight = new THREE.PointLight(0xe7f7d3, 34, 16);
  rimLight.position.set(-1, 4, -2);
  scene.add(ambientLight, keyLight, fillLight, rimLight);

  const pointer = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);
  let frameId = 0;

  function resizeScene() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function moveSculpture(event) {
    target.x = (event.clientX / window.innerWidth - 0.5) * 0.42;
    target.y = (event.clientY / window.innerHeight - 0.5) * 0.3;
  }

  function render() {
    pointer.lerp(target, 0.035);
    const time = performance.now() * 0.001;
    sculpture.rotation.y = (reducedMotion ? 0.08 : time * 0.12) + pointer.x * 0.16;
    sculpture.rotation.x = (reducedMotion ? 0 : Math.sin(time * 0.23) * 0.045) + pointer.y * 0.12;
    const satelliteAngle = reducedMotion ? 0.48 : time * 0.35;
    satellite.position.set(
      Math.cos(satelliteAngle) * 1.58,
      Math.sin(satelliteAngle) * 0.67,
      0.18,
    );
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  }

  window.addEventListener('resize', resizeScene);
  window.addEventListener('pointermove', moveSculpture, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frameId);
    } else {
      frameId = window.requestAnimationFrame(render);
    }
  });
  resizeScene();
  render();
}
