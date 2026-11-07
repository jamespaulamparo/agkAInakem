/**
 * agkAInakem — Three.js Interactive 3D Canvas
 * Raycasting & Pointer Interactivity with Linear Interpolation (lerp).
 * Renders a soothing, responsive 3D organic geometry in the hero section.
 */

(function () {
  const container = document.getElementById('webgl-hero-container');
  if (!container || typeof THREE === 'undefined') return;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const width = container.clientWidth || 360;
  const height = container.clientHeight || 360;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 5.2;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 2. Geometry: Calming Organic Torus Knot / Sphere Mesh
  const geometry = new THREE.IcosahedronGeometry(1.65, 3);
  
  // Custom Iridescent wireframe & points material
  const material = new THREE.MeshStandardMaterial({
    color: 0x4FA8A0,
    wireframe: true,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.75,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Inner floating particle core
  const coreGeo = new THREE.SphereGeometry(0.75, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x8EC5E8,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x4FA8A0, 2.5, 50);
  pointLight1.position.set(4, 4, 4);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x8EC5E8, 2, 50);
  pointLight2.position.set(-4, -4, 4);
  scene.add(pointLight2);

  // 3. Pointer Interactivity & Raycasting with Lerp
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(0, 0);
  const targetRotation = { x: 0, y: 0 };
  let isHovered = false;

  function onPointerMove(event) {
    const rect = container.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX) || 0;
    const clientY = event.clientY || (event.touches && event.touches[0].clientY) || 0;

    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Smooth target rotation based on pointer coordinates
    targetRotation.y = mouse.x * 0.95;
    targetRotation.x = -mouse.y * 0.75;
    isHovered = true;
  }

  function onPointerLeave() {
    isHovered = false;
  }

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  container.addEventListener('touchmove', onPointerMove, { passive: true });
  container.addEventListener('mouseleave', onPointerLeave);

  // 4. Smooth Animation Loop using Lerp (Linear Interpolation)
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Base tranquil rotation
    mesh.rotation.z = elapsedTime * 0.08;
    core.rotation.y = -elapsedTime * 0.12;

    // Linear interpolation towards mouse position
    if (isHovered) {
      mesh.rotation.y += (targetRotation.y - mesh.rotation.y) * 0.06;
      mesh.rotation.x += (targetRotation.x - mesh.rotation.x) * 0.06;
      core.rotation.x += (targetRotation.x - core.rotation.x) * 0.04;
    } else {
      mesh.rotation.y += (Math.sin(elapsedTime * 0.4) * 0.3 - mesh.rotation.y) * 0.03;
      mesh.rotation.x += (Math.cos(elapsedTime * 0.3) * 0.2 - mesh.rotation.x) * 0.03;
    }

    // Dynamic wave scale pulse
    const scale = 1 + Math.sin(elapsedTime * 0.8) * 0.03;
    mesh.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
  }

  animate();

  // 5. Responsive Resize
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    if (newWidth && newHeight) {
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }
  });
})();
